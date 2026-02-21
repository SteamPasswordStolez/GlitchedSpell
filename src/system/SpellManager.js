import * as THREE from 'three';

export class SpellManager {
    constructor(scene, car, environment) {
        this.scene = scene;
        this.car = car;
        this.environment = environment;

        this.spells = {
            Q: { name: 'Quick (Nitro)', cooldown: 5000, lastUsed: 0, active: false },
            W: { name: 'Weight (Juggernaut)', cooldown: 8000, lastUsed: 0, active: false },
            E: { name: 'Equal', cooldown: 12000, lastUsed: 0, active: false },
            R: { name: 'Respira', cooldown: 20000, lastUsed: 0, active: false },
        };

        // Aura for 'W' spell
        const auraGeo = new THREE.SphereGeometry(3.5, 32, 32);
        const auraMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.0, wireframe: true });
        this.auraMesh = new THREE.Mesh(auraGeo, auraMat);
        this.car.chassisMesh.add(this.auraMesh);

        this.initControls();
    }

    initControls() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toUpperCase();
            if (this.spells[key]) {
                this.castSpell(key);
            }
        });
    }

    castSpell(key) {
        if (this.car.controlsLocked) return;

        const spell = this.spells[key];
        const now = Date.now();

        if (now - spell.lastUsed >= spell.cooldown) {
            spell.lastUsed = now;
            this.executeSpellEffect(key);
            this.triggerCooldownUI(key, spell.cooldown);
        } else {
            console.log(`${spell.name} is on cooldown!`);
        }
    }

    executeSpellEffect(key) {
        console.log(`Casting Spell: ${this.spells[key].name} (${key})`);
        
        const spell = this.spells[key];
        spell.active = true;

        switch(key) {
            case 'Q':
                // QUICK: Nitro Dash (Speedster skill)
                // Apply massive local forward force to instantly hit top speed
                const boostImpulse = 80000; // Positive Z is forward
                this.car.chassisBody.applyLocalImpulse(new CANNON.Vec3(0, 0, boostImpulse), new CANNON.Vec3(0, 0, 0));
                
                // Visual feedback: Emit strong light or color flash from core
                if (this.car.carType === 'junk_scrapper' && this.car.chassisMesh.children[2]) {
                    this.car.chassisMesh.children[2].material.emissiveIntensity = 10;
                    setTimeout(() => {
                        this.car.chassisMesh.children[2].material.emissiveIntensity = 2;
                        spell.active = false;
                    }, 500);
                }
                break;
            case 'W':
                // WEIGHT: Temporary Mass Increase (Juggernaut skill)
                const originalMass = this.car.chassisBody.mass;
                this.car.chassisBody.mass = originalMass * 3;
                this.car.chassisBody.updateMassProperties();
                
                // Visual feedback: Aura
                this.auraMesh.material.opacity = 0.5;
                this.auraMesh.rotation.y += 0.5;

                // Revert after 3 seconds
                setTimeout(() => {
                    this.car.chassisBody.mass = originalMass;
                    this.car.chassisBody.updateMassProperties();
                    this.auraMesh.material.opacity = 0.0;
                    spell.active = false;
                    console.log("Weight spell ended.");
                }, 3000);
                break;
            case 'E':
            case 'R':
                console.log('Skill not implemented for this archetype yet.');
                spell.active = false;
                break;
        }
    }

    triggerCooldownUI(key, duration) {
        const slotId = `spell-${key.toLowerCase()}`;
        const slotEl = document.getElementById(slotId);
        if (!slotEl) return;

        const overlay = slotEl.querySelector('.cooldown-overlay');
        
        // Reset animation
        overlay.style.transition = 'none';
        overlay.style.height = '100%';
        
        // Trigger reflow
        void overlay.offsetWidth;

        // Animate down
        overlay.style.transition = `height ${duration}ms linear`;
        overlay.style.height = '0%';
    }

    update(deltaTime) {
        // Animate aura if active
        if (this.spells['W'].active && this.auraMesh) {
            this.auraMesh.rotation.y += deltaTime * 5;
            this.auraMesh.rotation.x += deltaTime * 2;
        }

        // Potential camera FOV warp effect could be triggered here based on Q active state 
        // if we pass camera into SpellManager later.
    }
}
