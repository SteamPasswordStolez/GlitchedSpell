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

// Determine current stage from URL, default to 1-1
const urlParams = new URLSearchParams(window.location.search);
const currentStageId = urlParams.get('stage') || '1-1';

const environment = new Environment(scene, world, currentStageId);
const car = new Car(scene, world, environment);
const glitchManager = new GlitchManager(scene, environment, glitchPass);
const spellManager = new SpellManager(scene, car, environment);
const audioManager = new AudioManager(camera);

const cinematicManager = new CinematicManager(camera, scene, car, 'ui-layer');
cinematicManager.glitchPass = glitchPass; // Enable cinematic glitches

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

// Boss UI (Hidden by default)
const bossUiContainer = document.createElement('div');
bossUiContainer.style.position = 'absolute';
bossUiContainer.style.top = '20px';
bossUiContainer.style.left = '50%';
bossUiContainer.style.transform = 'translateX(-50%)';
bossUiContainer.style.width = '600px';
bossUiContainer.style.display = 'none';
bossUiContainer.style.flexDirection = 'column';
bossUiContainer.style.alignItems = 'center';
uiLayer.appendChild(bossUiContainer);

const bossNameText = document.createElement('div');
bossNameText.innerText = "ALPHA_OMEGA // TITAN-CLASS INTERCEPTOR";
bossNameText.style.color = '#ff0000';
bossNameText.style.fontFamily = "'Orbitron', sans-serif";
bossNameText.style.fontSize = '1.2rem';
bossNameText.style.fontWeight = 'bold';
bossNameText.style.marginBottom = '5px';
bossNameText.style.textShadow = '0 0 10px #ff0000';
bossUiContainer.appendChild(bossNameText);

const bossHpTrack = document.createElement('div');
bossHpTrack.style.width = '100%';
bossHpTrack.style.height = '20px';
bossHpTrack.style.backgroundColor = 'rgba(255,0,0,0.2)';
bossHpTrack.style.border = '2px solid #ff0000';
bossHpTrack.style.boxShadow = '0 0 10px #ff0000';
bossUiContainer.appendChild(bossHpTrack);

const bossHpFill = document.createElement('div');
bossHpFill.id = 'boss-hp-fill';
bossHpFill.style.width = '100%';
bossHpFill.style.height = '100%';
bossHpFill.style.backgroundColor = '#ff0000';
bossHpFill.style.transition = 'width 0.1s linear';
bossHpTrack.appendChild(bossHpFill);

let isStageClear = false;
let currentCheckpointIndex = 0;
let bossTarget = null;

// Stage Introduction UI (Cinematic Title)
const stageTitleText = document.createElement('div');
stageTitleText.style.position = 'absolute';
stageTitleText.style.top = '40%';
stageTitleText.style.left = '50%';
stageTitleText.style.transform = 'translate(-50%, -50%)';
stageTitleText.style.color = '#fff';
stageTitleText.style.fontSize = '4rem';
stageTitleText.style.fontWeight = 'bold';
stageTitleText.style.textShadow = '0 0 20px #ff00ff, 0 0 50px #ff00ff';
stageTitleText.style.fontFamily = "'Orbitron', sans-serif";
stageTitleText.style.opacity = '0';
stageTitleText.style.transition = 'opacity 2s ease-in-out';
stageTitleText.style.zIndex = '1000';
stageTitleText.style.pointerEvents = 'none';
uiLayer.appendChild(stageTitleText);

// Start intro cinematic
const stageData = CampaignData[currentStageId];
if (!stageData) {
    console.error("Stage Data not found for:", currentStageId);
}

car.controlsLocked = true;
const enemies = [];
const aiControllers = [];

// Show Stage Title during cinematic
setTimeout(() => {
    stageTitleText.innerText = `STAGE ${currentStageId}\n${stageData.title}`;
    stageTitleText.style.textAlign = 'center';
    stageTitleText.style.opacity = '1';
    
    // Hide after 5 seconds
    setTimeout(() => {
        stageTitleText.style.opacity = '0';
    }, 5000);
}, 1000);

cinematicManager.play(stageData.cinematic, () => {
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

    // Spawn AI Enemies or Boss
    if (stageData.boss) {
        // Hide Checkpoint text
        checkpointText.style.display = 'none';
        
        // Spawn Boss
        bossTarget = new Car(scene, world, environment, stageData.boss);
        bossTarget.chassisBody.position.set(0, 5, car.chassisBody.position.z + 150); // Start ahead
        bossTarget.chassisBody.quaternion.setFromEuler(0, Math.PI, 0); // Face the player initially
        bossTarget.chassisBody.velocity.set(0, 0, 0); 
        
        enemies.push(bossTarget);
        
        const ai = new AIController(bossTarget, car, environment);
        ai.activate();
        aiControllers.push(ai);
        
        console.log(`Spawned BOSS: ${stageData.boss}!`);
        
        // Show Boss UI after cinematic
        bossUiContainer.style.display = 'flex';
    } else {
        let numPolice = 3;
        if (currentStageId === '1-2') numPolice = 4;
        if (currentStageId === '1-3') numPolice = 5;

        for (let i = 0; i < numPolice; i++) {
            // Spawn slightly behind and scattered
            const spawnX = (Math.random() - 0.5) * 40; // Spread across track
            const spawnZ = car.chassisBody.position.z - 30 - (i * 20); // Staggered behind
            
            const policeCar = new Car(scene, world, environment, 'omni_police');
            policeCar.chassisBody.position.set(spawnX, 1.5, spawnZ); 
            // Give them a starting boost so they enter frame quickly
            policeCar.chassisBody.velocity.set(0, 0, 60); 
            
            enemies.push(policeCar);

            const ai = new AIController(policeCar, car, environment);
            ai.activate();
            aiControllers.push(ai);
        }
        console.log(`Spawned ${numPolice} OMNI-Police interceptors!`);
    }
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

        // Update Boss UI
        if (bossTarget && !bossTarget.isDestroyed) {
             const bossHpElement = document.getElementById('boss-hp-fill');
             if (bossHpElement) {
                 bossHpElement.style.width = `${(bossTarget.hp / bossTarget.maxHp) * 100}%`;
             }
        }

        // Win Logic
        if (!isStageClear) {
            if (stageData.boss) {
                // Boss Battle Victory Condition
                if (bossTarget && bossTarget.isDestroyed) {
                    isStageClear = true;
                    console.log("BOSS DEFEATED. STAGE CLEAR!");
                    audioManager.stopBGM(); 
                    
                    car.controlsLocked = true;
                    car.keys.forward = false;
                    car.keys.brake = true;
                    
                    clearText.style.opacity = '1';
                    bossUiContainer.style.display = 'none';
                    
                    setTimeout(() => {
                        window.location.href = 'index.html?mode=campaign&tutorial=true';
                    }, 5000);
                }
            } else if (currentCheckpointIndex < environment.checkpoints.length) {
                // Normal Checkpoint Logic
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
                        
                        const transitionToNextStage = () => {
                            let nextStage = null;
                            if (currentStageId === '1-1') nextStage = '1-2';
                            else if (currentStageId === '1-2') nextStage = '1-3';

                            if (nextStage) {
                                window.location.href = `game.html?stage=${nextStage}`;
                            } else {
                                window.location.href = 'index.html'; // Fallback
                            }
                        };

                        setTimeout(() => {
                            clearText.style.opacity = '0';
                            
                            // Disable active gameplay elements for the outro
                            enemies.forEach(e => {
                                e.chassisBody.velocity.set(0,0,0);
                                e.chassisMesh.visible = false;
                            });
                            if (glitchPass) glitchPass.enabled = false;

                            // Play Outro Cinematic if it exists
                            if (stageData.outro && stageData.outro.length > 0) {
                                cinematicManager.play(stageData.outro, () => {
                                    transitionToNextStage();
                                });
                            } else {
                                transitionToNextStage();
                            }
                        }, 3000); // 3 seconds of STAGE CLEAR text before outro
                    } else {
                        checkpointText.innerText = `Checkpoint ${currentCheckpointIndex + 1} / ${environment.checkpoints.length}`;
                    }
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
