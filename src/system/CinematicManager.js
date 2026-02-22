import * as THREE from 'three';
import { Car } from '../vehicle/Car.js';

export class CinematicManager {
    constructor(camera, scene, playerCar, uiElementId) {
        this.camera = camera;
        this.scene = scene;
        this.playerCar = playerCar;
        this.uiContainer = document.getElementById(uiElementId);
        
        // UI Elements
        this.letterboxTop = document.createElement('div');
        this.letterboxTop.className = 'cinematic-letterbox top';
        this.letterboxBottom = document.createElement('div');
        this.letterboxBottom.className = 'cinematic-letterbox bottom';
        
        this.subtitleEl = document.createElement('div');
        this.subtitleEl.className = 'cinematic-subtitle';
        
        this.uiContainer.appendChild(this.letterboxTop);
        this.uiContainer.appendChild(this.letterboxBottom);
        this.uiContainer.appendChild(this.subtitleEl);

        this.fadeEl = document.createElement('div');
        this.fadeEl.className = 'cinematic-fade hidden';
        this.uiContainer.appendChild(this.fadeEl);

        this.flashEl = document.createElement('div');
        this.flashEl.className = 'cinematic-flash';
        this.uiContainer.appendChild(this.flashEl);

        this.isPlaying = false;
        this.sequence = [];
        // Audio Context for SFX & HTML5 Audio for Voices
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.currentVoiceAudio = null;
        
        // Dummy Actors for Cinematic
        this.actors = {};
        
        // Setup Omni-Police Dummy using the Car visual generator
        const policeCar = new Car(this.scene, null, null, 'omni_police', true);
        this.actors['omni_police'] = policeCar.chassisMesh;
        this.actors['omni_police'].visible = false;
        
        // Setup Alpha-Omega Dummy
        const bossCar = new Car(this.scene, null, null, 'alpha_omega', true);
        this.actors['alpha_omega'] = bossCar.chassisMesh;
        this.actors['alpha_omega'].visible = false;
        
        this.onCompleteCallback = null;
    }

    play(sequenceData, onComplete) {
        if (!sequenceData || sequenceData.length === 0) {
            if(onComplete) onComplete();
            return;
        }
        
        this.sequence = sequenceData;
        this.onCompleteCallback = onComplete;
        this.isPlaying = true;
        this.currentClipIndex = 0;
        this.clipStartTime = performance.now() / 1000;

        // Hijack Player Physics Context
        // @ts-ignore (Assuming CANNON is available globally or we use strings, but Car.js uses CANNON.Body.KINEMATIC which is numeric 4. We can set it to 4)
        this.playerCar.chassisBody.type = 4; // KINEMATIC
        this.playerCar.chassisBody.velocity.set(0,0,0);
        this.playerCar.chassisBody.angularVelocity.set(0,0,0);

        // Show UI & Actors
        this.letterboxTop.classList.add('active');
        this.letterboxBottom.classList.add('active');
        this.subtitleEl.classList.add('active');
        
        // Check which actors are in the sequence and show them
        if(this.sequence[0] && this.sequence[0].actors) {
             const actorIds = this.sequence[0].actors.map(a => a.id);
             if(actorIds.includes('omni_police')) this.actors['omni_police'].visible = true;
             if(actorIds.includes('alpha_omega')) this.actors['alpha_omega'].visible = true;
        }

        if (this.sequence[0] && this.sequence[0].fadeFromBlack) {
            this.fadeEl.classList.remove('hidden'); // Start black
            // Wait a frame then fade to clear
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.fadeEl.classList.add('hidden');
                });
            });
        }

        this.applyClip(this.sequence[this.currentClipIndex]);
    }

    applyClip(clip) {
        if (!clip) return;
        this.subtitleEl.innerText = clip.subtitle || "";
        this.subtitleEl.style.opacity = 1;
        // Basic animation trick: remove and re-add class to trigger CSS animation if needed
        this.subtitleEl.classList.remove('slide-up');
        void this.subtitleEl.offsetWidth; 
        this.subtitleEl.classList.add('slide-up');

        // Play Audio Voiceover via HTML5 Audio
        if (this.currentVoiceAudio) {
            this.currentVoiceAudio.pause();
            this.currentVoiceAudio = null;
        }

        if (clip.audio) {
            this.currentVoiceAudio = new Audio(clip.audio);
            this.currentVoiceAudio.play().catch(e => console.error("Audio play failed:", e));
        }

        if (clip.sfx) {
            this.playSfx(clip.sfx);
        }

        if (clip.flash) {
            this.flashEl.classList.add('active'); // Instant white
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.flashEl.classList.remove('active'); // Fade out
                });
            });
        }

        if (clip.glitch && this.glitchPass) {
            this.glitchPass.enabled = true;
            setTimeout(() => { 
                if (this.glitchPass) this.glitchPass.enabled = false; 
            }, clip.glitchDuration || 300);
        }
    }

    playSfx(type) {
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const t = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        if (type === 'low_rumble') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(40, t);
            osc.frequency.linearRampToValueAtTime(80, t + 4);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.5, t + 1);
            gain.gain.linearRampToValueAtTime(0, t + 5);
            osc.start(t);
            osc.stop(t + 5);
        } else if (type === 'glitch_beep') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.setValueAtTime(1200, t + 0.1);
            osc.frequency.setValueAtTime(600, t + 0.2);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
            osc.start(t);
            osc.stop(t + 0.5);
        } else if (type === 'radio_static') {
            // Procedural white noise is trickier with simple osc, use a fast fluctuating square
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.linearRampToValueAtTime(5000, t + 0.1);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.3);
            osc.start(t);
            osc.stop(t + 0.3);
        } else if (type === 'engine_rev') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, t);
            osc.frequency.exponentialRampToValueAtTime(300, t + 1.5);
            osc.frequency.linearRampToValueAtTime(150, t + 2);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.4, t + 0.5);
            gain.gain.linearRampToValueAtTime(0, t + 2.5);
            osc.start(t);
            osc.stop(t + 2.5);
        } else if (type === 'siren') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.linearRampToValueAtTime(1200, t + 0.5);
            osc.frequency.linearRampToValueAtTime(600, t + 1.0);
            osc.frequency.linearRampToValueAtTime(1200, t + 1.5);
            osc.frequency.linearRampToValueAtTime(600, t + 2.0);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
            gain.gain.linearRampToValueAtTime(0, t + 2.5);
            osc.start(t);
            osc.stop(t + 2.5);
        }
    }

    update(timeNowSec) {
        if (!this.isPlaying) return false;

        const clip = this.sequence[this.currentClipIndex];
        if (!clip) {
            this.finish();
            return false;
        }

        const elapsedInClip = timeNowSec - this.clipStartTime;
        const progress = Math.min(elapsedInClip / clip.duration, 1.0);

        // Interpolate Camera transform using standard specific easing (e.g. cubic in/out)
        // For simplicity right now, linear interpolation.
        const startPos = new THREE.Vector3().fromArray(clip.cameraStart.position);
        const endPos = new THREE.Vector3().fromArray(clip.cameraEnd.position);
        
        const startLook = new THREE.Vector3().fromArray(clip.cameraStart.lookAt);
        const endLook = new THREE.Vector3().fromArray(clip.cameraEnd.lookAt);

        this.camera.position.lerpVectors(startPos, endPos, progress);
        
        // Add Screen Shake
        if (clip.shake) {
            const intensity = typeof clip.shake === 'number' ? clip.shake : 0.5;
            const noiseX = (Math.random() - 0.5) * intensity;
            const noiseY = (Math.random() - 0.5) * intensity;
            const noiseZ = (Math.random() - 0.5) * intensity;
            this.camera.position.add(new THREE.Vector3(noiseX, noiseY, noiseZ));
        }

        const currentLookAt = new THREE.Vector3().lerpVectors(startLook, endLook, progress);
        this.camera.lookAt(currentLookAt);

        // Animate Actors
        if (clip.actors) {
            clip.actors.forEach(actorData => {
                const startP = new THREE.Vector3().fromArray(actorData.startPos);
                const endP = new THREE.Vector3().fromArray(actorData.endPos);
                
                const startE = new THREE.Euler(
                    THREE.MathUtils.degToRad(actorData.startRot[0]),
                    THREE.MathUtils.degToRad(actorData.startRot[1]),
                    THREE.MathUtils.degToRad(actorData.startRot[2]),
                    'YXZ'
                );
                const endE = new THREE.Euler(
                    THREE.MathUtils.degToRad(actorData.endRot[0]),
                    THREE.MathUtils.degToRad(actorData.endRot[1]),
                    THREE.MathUtils.degToRad(actorData.endRot[2]),
                    'YXZ'
                );

                const startQ = new THREE.Quaternion().setFromEuler(startE);
                const endQ = new THREE.Quaternion().setFromEuler(endE);

                const curP = new THREE.Vector3().lerpVectors(startP, endP, progress);
                const curQ = new THREE.Quaternion().slerpQuaternions(startQ, endQ, progress);

                if (actorData.id === 'player') {
                    // Update physics body which drives the mesh
                    this.playerCar.chassisBody.position.set(curP.x, curP.y + 0.5, curP.z); // Offset for suspension
                    this.playerCar.chassisBody.quaternion.set(curQ.x, curQ.y, curQ.z, curQ.w);
                    // Force update method so wheels follow smoothly
                    this.playerCar.update();
                } else if (this.actors[actorData.id]) {
                    this.actors[actorData.id].position.copy(curP);
                    this.actors[actorData.id].quaternion.copy(curQ);
                    // Add slight bounce to police car for realism
                    this.actors[actorData.id].position.y += Math.sin(timeNowSec * 20) * 0.05 + 0.5;
                }
            });
        }

        // Fade out subtitle near end of clip
        if (progress > 0.8) {
            this.subtitleEl.style.opacity = 1.0 - ((progress - 0.8) * 5); // 0.8 to 1.0 goes 1.0 to 0.0
        }

        if (progress >= 1.0) {
            // Next clip
            this.currentClipIndex++;
            if (this.currentClipIndex >= this.sequence.length) {
                this.finish();
            } else {
                this.clipStartTime = timeNowSec;
                this.applyClip(this.sequence[this.currentClipIndex]);
            }
        }
        
        return true; // Indicates cinematic is still blocking regular camera logic
    }

    finish() {
        this.isPlaying = false;
        
        this.letterboxTop.classList.remove('active');
        this.letterboxBottom.classList.remove('active');
        this.subtitleEl.classList.remove('active');
        this.subtitleEl.innerText = "";

        if (this.currentVoiceAudio) {
            this.currentVoiceAudio.pause();
        }

        // Restore player physics
        this.playerCar.chassisBody.type = 1; // DYNAMIC
        // Give player a little forward boost so they don't start from an absolute dead stop if they were drifting
        this.playerCar.chassisBody.velocity.set(0, 0, 10);
        
        this.actors['omni_police'].visible = false;
        this.actors['alpha_omega'].visible = false;

        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }
}
