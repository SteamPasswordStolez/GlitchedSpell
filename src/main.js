import * as THREE from 'three';
import * as CANNON from 'cannon-es';
// import CannonDebugger from 'cannon-es-debugger';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';

import { Environment } from './world/Environment.js';
import { GlitchManager } from './world/GlitchManager.js';
import { Car } from './vehicle/Car.js';
import { SpellManager } from './system/SpellManager.js';
import { CinematicManager } from './system/CinematicManager.js';
import { CampaignData } from './data/CampaignData.js';
import { AIController } from './system/AIController.js';
import { AudioManager } from './system/AudioManager.js';

// --- 1. Core Setup ---
const canvas = document.createElement('canvas');
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '-1';
document.getElementById('app').appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);
scene.fog = new THREE.FogExp2(0x0a0a1a, 0.005);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Camera will be controlled by the Car

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0),
});
// Optimize cannon
world.broadphase = new CANNON.SAPBroadphase(world);
world.solver.iterations = 10;

// Uncomment to see physics wireframes
// const cannonDebugger = new CannonDebugger(scene, world, { color: 0xff0000 });

// --- Post-Processing Setup ---
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const glitchPass = new GlitchPass();
glitchPass.enabled = false; // Start disabled
composer.addPass(glitchPass);

// --- 2. Initialize Game Modules ---
const environment = new Environment(scene, world);
const car = new Car(scene, world, environment);
const glitchManager = new GlitchManager(scene, environment, glitchPass);
const spellManager = new SpellManager(scene, car, environment);
const audioManager = new AudioManager(camera);

const cinematicManager = new CinematicManager(camera, scene, car, 'ui-layer');

// Stage Clear & Checkpoint UI
const uiLayer = document.getElementById('ui-layer');
const clearText = document.createElement('div');
clearText.innerText = "STAGE CLEAR";
clearText.style.position = 'absolute';
clearText.style.top = '50%';
clearText.style.left = '50%';
clearText.style.transform = 'translate(-50%, -50%)';
clearText.style.color = '#00ffff';
clearText.style.fontSize = '8rem';
clearText.style.fontWeight = '900';
clearText.style.textShadow = '0 0 20px #00ffff, 0 0 50px #00ffff';
clearText.style.fontFamily = "'Orbitron', sans-serif";
clearText.style.opacity = '0';
clearText.style.transition = 'opacity 2s ease-in-out';
clearText.style.zIndex = '1000';
clearText.style.pointerEvents = 'none';
uiLayer.appendChild(clearText);

const checkpointText = document.createElement('div');
checkpointText.innerText = `Checkpoint 1 / 5`;
checkpointText.style.position = 'absolute';
checkpointText.style.top = '20px';
checkpointText.style.left = '50%';
checkpointText.style.transform = 'translateX(-50%)';
checkpointText.style.color = '#fff';
checkpointText.style.fontSize = '2rem';
checkpointText.style.fontFamily = "'Orbitron', sans-serif";
checkpointText.style.textShadow = '0 0 10px #00ffff';
checkpointText.style.opacity = '0'; // Hidden during cinematic
uiLayer.appendChild(checkpointText);

const tutorialText = document.createElement('div');
tutorialText.innerHTML = `[TUTORIAL]<br/>Use ARROW KEYS to Drive. SPACE to Brake.<br/>Press 'Q' for Nitro Boost.<br/>Press 'W' for Juggernaut Aura.`;
tutorialText.style.position = 'absolute';
tutorialText.style.bottom = '100px';
tutorialText.style.left = '50%';
tutorialText.style.transform = 'translateX(-50%)';
tutorialText.style.color = '#fff';
tutorialText.style.fontSize = '1.5rem';
tutorialText.style.textAlign = 'center';
tutorialText.style.fontFamily = "'Orbitron', sans-serif";
tutorialText.style.textShadow = '0 0 10px #000000, 0 0 5px #ff00ff';
tutorialText.style.opacity = '0'; // Hidden initially
tutorialText.style.transition = 'opacity 1s ease-in-out';
uiLayer.appendChild(tutorialText);

let isStageClear = false;
let currentCheckpointIndex = 0;

// Start intro cinematic
car.controlsLocked = true;
const enemies = [];
const aiControllers = [];

cinematicManager.play(CampaignData["1-1"].cinematic, () => {
    console.log("Cinematic finished. Race begins!");
    audioManager.playRandomTrack(); // Start BGM

    car.controlsLocked = false;
    checkpointText.style.opacity = '1';
    checkpointText.innerText = `Checkpoint ${currentCheckpointIndex + 1} / ${environment.checkpoints.length}`;

    // Show tutorial
    tutorialText.style.opacity = '1';
    setTimeout(() => {
        tutorialText.style.opacity = '0';
    }, 6000);

    // Spawn AI Police Chase
    const numPolice = 3;
    for (let i = 0; i < numPolice; i++) {
        // Spawn slightly behind and scattered
        const spawnX = (Math.random() - 0.5) * 40; // Spread across track
        const spawnZ = car.chassisBody.position.z - 30 - (i * 20); // Staggered behind
        
        const policeCar = new Car(scene, world, environment, 'omni_police');
        policeCar.chassisBody.position.set(spawnX, 1.5, spawnZ); // Spawning lower to prevent bouncing/tumbling
        // Give them a starting boost so they enter frame quickly
        policeCar.chassisBody.velocity.set(0, 0, 60); 
        
        enemies.push(policeCar);

        const ai = new AIController(policeCar, car, environment);
        ai.activate();
        aiControllers.push(ai);
    }
    console.log(`Spawned ${numPolice} OMNI-Police interceptors!`);
});

// --- 3. Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = Math.min(clock.getDelta(), 0.1); // Cap delta time

    // Physics step
    world.step(1 / 60, deltaTime, 3);
    
    // cannonDebugger.update();

    // Game Logic Updates
    environment.update(deltaTime);
    car.update();
    enemies.forEach(e => e.update());
    glitchManager.update();
    spellManager.update(deltaTime);
    aiControllers.forEach(ai => ai.update(deltaTime));

    // Stop BGM if destroyed
    if (car.isDestroyed && audioManager.bgm.isPlaying) {
        audioManager.stopBGM();
    }

    // Camera Logic
    const timeNowSec = performance.now() / 1000;
    const isCinematicPlaying = cinematicManager.update(timeNowSec);

    if (!isCinematicPlaying) {
        // Normal Chase Camera
        const carPos = car.chassisMesh.position;
        const cameraOffset = new THREE.Vector3(0, 4, -10); // Negative Z puts camera BEHIND the car
        cameraOffset.applyQuaternion(car.chassisMesh.quaternion);
        const targetCameraPos = carPos.clone().add(cameraOffset);
        
        camera.position.lerp(targetCameraPos, 0.1);
        camera.lookAt(carPos.clone().add(new THREE.Vector3(0, 1, 0)));

        // Checkpoint Logic
        if (!isStageClear && currentCheckpointIndex < environment.checkpoints.length) {
            const cp = environment.checkpoints[currentCheckpointIndex];
            
            // 2D distance check (X, Z plane)
            const dx = carPos.x - cp.position.x;
            const dz = carPos.z - cp.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);

            // Passed if physically close or drove past it
            if (dist < 40 || carPos.z > cp.position.z + 5) {
                cp.passed = true;
                cp.mesh.material.color.setHex(0x00ff00); // Turn Green
                cp.mesh.material.emissive.setHex(0x00ff00);
                cp.light.color.setHex(0x00ff00);
                
                currentCheckpointIndex++;
                
                if (currentCheckpointIndex >= environment.checkpoints.length) {
                    // All checkpoints passed!
                    isStageClear = true;
                    console.log("Stage Cleared!");
                    audioManager.stopBGM(); // Stop music on clear
                    
                    car.controlsLocked = true;
                    car.keys.forward = false;
                    car.keys.brake = true;
                    
                    clearText.style.opacity = '1';
                    checkpointText.style.opacity = '0';
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 4000);
                } else {
                    checkpointText.innerText = `Checkpoint ${currentCheckpointIndex + 1} / ${environment.checkpoints.length}`;
                }
            }
        }
    }

    // Render using composer instead of renderer
    composer.render();
}

// Start game
animate();

// --- 4. Event Listeners ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight); // Update composer size
});
