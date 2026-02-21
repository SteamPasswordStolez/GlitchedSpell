import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Car {
    constructor(scene, world, environment, carType = 'junk_scrapper', isCinematicDummy = false) {
        this.scene = scene;
        this.world = world;
        this.environment = environment;
        this.carType = carType;
        this.isCinematicDummy = isCinematicDummy;

        // Vehicle Config
        this.chassisMass = 1500;
        this.chassisSize = new CANNON.Vec3(2, 1, 4);
        
        // HP System
        this.maxHp = this.carType === 'omni_police' ? 50 : 100;
        this.hp = this.maxHp;
        this.isDestroyed = false;
        this.currentSteering = 0;
        
        if (!this.isCinematicDummy) {
            this.initPhysics();
            this.initControls();
        }
        this.initVisuals();
    }

    initPhysics() {
        // 1. Chassis Body
        const chassisShape = new CANNON.Box(new CANNON.Vec3(this.chassisSize.x * 0.5, this.chassisSize.y * 0.5, this.chassisSize.z * 0.5));
        this.chassisBody = new CANNON.Body({ mass: this.chassisMass });
        this.chassisBody.addShape(chassisShape);
        this.chassisBody.position.set(0, 5, 0); // Start slightly above ground
        
        // 2. Vehicle Setup (RaycastVehicle)
        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.chassisBody,
            indexRightAxis: 0, // x
            indexUpAxis: 1,    // y
            indexForwardAxis: 2, // z
        });

        // Wheel Config
        const wheelOptions = {
            radius: 0.4,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true,
        };

        const axleW = this.chassisSize.x * 0.5 + 0.3; // Track width
        const axleL = this.chassisSize.z * 0.5 - 0.5; // Wheelbase

        // Front Left (0)
        wheelOptions.chassisConnectionPointLocal.set(axleW, 0, axleL);
        this.vehicle.addWheel(wheelOptions);
        // Front Right (1)
        wheelOptions.chassisConnectionPointLocal.set(-axleW, 0, axleL);
        this.vehicle.addWheel(wheelOptions);
        // Back Left (2)
        wheelOptions.chassisConnectionPointLocal.set(axleW, 0, -axleL);
        this.vehicle.addWheel(wheelOptions);
        // Back Right (3)
        wheelOptions.chassisConnectionPointLocal.set(-axleW, 0, -axleL);
        this.vehicle.addWheel(wheelOptions);

        this.vehicle.addToWorld(this.world);

        // Add wheel bodies for collision and visuals
        this.wheelBodies = [];
        const wheelMaterial = this.environment.wheelMaterial;
        const wheelShape = new CANNON.Cylinder(wheelOptions.radius, wheelOptions.radius, 0.4, 20);
        // Cylinder is built along z axis in cannon
        const q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);

        this.vehicle.wheelInfos.forEach((wheel) => {
            const cylinderBody = new CANNON.Body({
                mass: 0,
                type: CANNON.Body.KINEMATIC,
                material: wheelMaterial,
            });
            cylinderBody.addShape(wheelShape, new CANNON.Vec3(), q);
            // DO NOT ADD WHEEL BODIES TO WORLD, RaycastVehicle handles collision internally using raycasts.
            // We only need bodies to easily sync visual meshes.
            this.wheelBodies.push(cylinderBody); 
        });

        // Update wheel bodies during simulation step to sync visuals
        this.world.addEventListener('postStep', () => {
            for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
                this.vehicle.updateWheelTransform(i);
                const t = this.vehicle.wheelInfos[i].worldTransform;
                this.wheelBodies[i].position.copy(t.position);
                this.wheelBodies[i].quaternion.copy(t.quaternion);
            }
        });

        // Collision Damage logic
        this.chassisBody.addEventListener("collide", (e) => {
            if (this.isDestroyed || this.isCinematicDummy) return;
            
            // Calculate relative velocity of the collision
            const relVel = e.contact.getImpactVelocityAlongNormal();
            
            // If impact is hard enough, take damage
            const damageThreshold = 10; // m/s
            if (Math.abs(relVel) > damageThreshold) {
                // Ignore small bumps, scale damage by impact force
                const damage = Math.floor((Math.abs(relVel) - damageThreshold) * 2);
                if (damage > 0) {
                    this.takeDamage(damage);
                }
            }
        });

        // Add air resistance / friction to prevent infinite acceleration
        this.chassisBody.linearDamping = 0.05;
        this.chassisBody.angularDamping = 0.05;
    }

    takeDamage(amount) {
        if (this.isDestroyed || this.isCinematicDummy) return;

        // If 'W' (Juggernaut) is active, mass is 3x, making us heavily armored
        const damageReduction = (this.chassisBody.mass > 1500) ? 0.3 : 1.0; 
        const actualDamage = Math.floor(amount * damageReduction);

        this.hp -= actualDamage;
        if (this.hp < 0) this.hp = 0;

        console.log(`${this.carType} took ${actualDamage} damage! HP: ${this.hp}/${this.maxHp}`);

        // Visual flash red
        this.chassisMesh.children.forEach(child => {
            if (child.material && child.material.emissive) {
                const oldEmissive = child.material.emissive.getHex();
                child.material.emissive.setHex(0xff0000);
                setTimeout(() => {
                    if(!this.isDestroyed) child.material.emissive.setHex(oldEmissive);
                }, 100);
            }
        });

        // Update UI if this is the player
        if (this.carType === 'junk_scrapper') {
            const hpFill = document.getElementById('player-hp-fill');
            if (hpFill) {
                const percent = (this.hp / this.maxHp) * 100;
                hpFill.style.width = `${percent}%`;
                
                if (percent <= 25) {
                    hpFill.style.backgroundColor = '#ff0000';
                    document.getElementById('ui-layer').classList.add('critical-damage');
                }
            }
        }

        if (this.hp === 0) {
            this.destroy();
        }
    }

    destroy() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        console.log(`${this.carType} DESTROYED!`);
        
        // Disable controls
        this.controlsLocked = true;

        // Visual explosion effect (simple)
        this.chassisMesh.children.forEach(child => {
            if (child.material) {
                child.material.color.setHex(0x111111);
                if (child.material.emissive) child.material.emissive.setHex(0x000000);
            }
        });
        
        // Pop the car up in the air
        this.chassisBody.applyLocalImpulse(new CANNON.Vec3(0, 5000 * this.chassisBody.mass, 0), new CANNON.Vec3(0,0,0));
        
        if (this.carType === 'junk_scrapper') {
            // Trigger Death UI
            const deathOverlay = document.getElementById('death-overlay');
            if(deathOverlay) deathOverlay.classList.add('active');
        }
    }

    initVisuals() {
        // Main Chassis Group (which will sync with physics)
        this.chassisMesh = new THREE.Group();
        this.scene.add(this.chassisMesh);

        const baseGeo = new THREE.BoxGeometry(this.chassisSize.x, this.chassisSize.y, this.chassisSize.z);
        
        if (this.carType === 'junk_scrapper') {
            // JUNK SCRAPPER: Rusty, asymmetric, exposed engine
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 1.0, metalness: 0.2 }); // Rusty brown
            const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
            baseMesh.castShadow = true;
            this.chassisMesh.add(baseMesh);

            // Exposed Engine Block on the back
            const engineGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 16);
            engineGeo.rotateZ(Math.PI / 2);
            const engineMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.4 });
            const engineMesh = new THREE.Mesh(engineGeo, engineMat);
            engineMesh.position.set(0, 0.8, -1.2);
            engineMesh.castShadow = true;
            this.chassisMesh.add(engineMesh);

            // Glowing Core / Exhaust
            const coreGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
            coreGeo.rotateX(Math.PI / 2);
            const coreMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff4400, emissiveIntensity: 2 });
            const coreMesh = new THREE.Mesh(coreGeo, coreMat);
            coreMesh.position.set(0, 0.5, -2);
            this.chassisMesh.add(coreMesh);

            // Asymmetric scrap armor plate on the side
            const plateGeo = new THREE.BoxGeometry(0.2, 0.8, 1.5);
            const plateMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8, metalness: 0.6 });
            const plateMesh = new THREE.Mesh(plateGeo, plateMat);
            plateMesh.position.set(1.1, 0, 0.5);
            plateMesh.rotation.z = 0.1;
            plateMesh.castShadow = true;
            this.chassisMesh.add(plateMesh);

        } else if (this.carType === 'omni_police') {
            // OMNI-POLICE: Sleek, black and white, lightbar
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8 }); // Black glossy
            const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
            baseMesh.castShadow = true;
            this.chassisMesh.add(baseMesh);

            // White accent strips
            const stripGeo = new THREE.BoxGeometry(this.chassisSize.x + 0.05, 0.2, this.chassisSize.z);
            const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
            const stripMesh = new THREE.Mesh(stripGeo, whiteMat);
            stripMesh.position.set(0, 0.2, 0);
            this.chassisMesh.add(stripMesh);

            // Police Lightbar
            const lightbarBaseGeo = new THREE.BoxGeometry(1.6, 0.2, 0.4);
            const lightbarBaseMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const lightbarMesh = new THREE.Mesh(lightbarBaseGeo, lightbarBaseMat);
            lightbarMesh.position.set(0, 0.6, -0.5);
            
            // Red Light
            const redLightGeo = new THREE.BoxGeometry(0.6, 0.25, 0.45);
            const redMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2 });
            const redMesh = new THREE.Mesh(redLightGeo, redMat);
            redMesh.position.set(-0.5, 0, 0);
            lightbarMesh.add(redMesh);

            // Blue Light
            const blueLightGeo = new THREE.BoxGeometry(0.6, 0.25, 0.45);
            const blueMat = new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 2 });
            const blueMesh = new THREE.Mesh(blueLightGeo, blueMat);
            blueMesh.position.set(0.5, 0, 0);
            lightbarMesh.add(blueMesh);

            this.chassisMesh.add(lightbarMesh);
        }

        // Wheels (Shared)
        this.wheelMeshes = [];
        const wGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 32);
        wGeo.rotateZ(Math.PI / 2); // Align correctly
        const wMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.2, roughness: 0.9});
        
        // Hubcaps
        const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.42, 16);
        hubGeo.rotateZ(Math.PI / 2);
        const hubMat = new THREE.MeshStandardMaterial({ 
            color: this.carType === 'omni_police' ? 0xaaaaaa : 0xaa5533, 
            metalness: 0.8, 
            roughness: 0.2 
        });

        for (let i = 0; i < 4; i++) {
            const mesh = new THREE.Mesh(wGeo, wMat);
            mesh.castShadow = true;
            
            const hub = new THREE.Mesh(hubGeo, hubMat);
            mesh.add(hub);

            this.scene.add(mesh);
            this.wheelMeshes.push(mesh);
        }
    }

    initControls() {
        this.controlsLocked = false;
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            brake: false
        };

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(event) {
        if (this.controlsLocked) return;
        switch(event.code) {
            case 'ArrowUp': this.keys.forward = true; break;
            case 'ArrowDown': this.keys.backward = true; break;
            case 'ArrowLeft': this.keys.left = true; break;
            case 'ArrowRight': this.keys.right = true; break;
            case 'Space': this.keys.brake = true; break;
        }
    }

    onKeyUp(event) {
        if (this.controlsLocked) return;
        switch(event.code) {
            case 'ArrowUp': this.keys.forward = false; break;
            case 'ArrowDown': this.keys.backward = false; break;
            case 'ArrowLeft': this.keys.left = false; break;
            case 'ArrowRight': this.keys.right = false; break;
            case 'Space': this.keys.brake = false; break;
        }
    }

    update() {
        if (this.isCinematicDummy || this.isDestroyed) return; // Physics sync handled by cinematic manager or dead

        // --- 0. Auto-Righting (Anti-Flip Torque) ---
        const localUp = new CANNON.Vec3(0, 1, 0);
        this.chassisBody.quaternion.vmult(localUp, localUp);
        // If the car is tilted more than a safe threshold, apply massive torque to roll it back upright
        if (localUp.y < 0.8) {
            const cross = new CANNON.Vec3();
            localUp.cross(new CANNON.Vec3(0, 1, 0), cross);
            cross.scale(this.chassisBody.mass * 40, cross); // Super strong restoring force
            this.chassisBody.applyTorque(cross);
            this.chassisBody.angularVelocity.scale(0.8, this.chassisBody.angularVelocity); // damp oscillations
            
            // If severe flip and stuck, hop slightly
            if (localUp.y < 0.2 && this.chassisBody.velocity.length() < 5) {
                this.chassisBody.position.y += 0.1;
                this.chassisBody.velocity.y += 2;
            }
        }

        // --- 1. Apply Physics Inputs ---
        const maxSteerVal = 0.5;
        const maxForce = 8000;  // Increased to counteract damping and reach 250km/h+
        const brakeForce = 300;

        // Steering (Smoothed for stability at 300km/h)
        let targetSteering = 0;
        // In our +Z forward view, +X is to the Left. So a positive steering angle (towards +X) turns Left.
        if (this.keys.left) targetSteering = maxSteerVal; 
        if (this.keys.right) targetSteering = -maxSteerVal; 
        
        this.currentSteering += (targetSteering - this.currentSteering) * 0.1; // Smooth interpolate

        this.vehicle.setSteeringValue(this.currentSteering, 0); // FL
        this.vehicle.setSteeringValue(this.currentSteering, 1); // FR

        // Acceleration
        let engineForce = 0;
        // Negative spins wheels forward
        if (this.keys.forward) {
            engineForce = -maxForce; 
            // Capping max speed at ~250km/h (about 70 m/s) normally
            if (this.chassisBody.velocity.length() > 70 && this.carType === 'junk_scrapper') {
                engineForce = 0; 
            }
        }
        if (this.keys.backward) {
            engineForce = maxForce; 
            // Capping reverse speed at ~90km/h (25 m/s)
            if (this.chassisBody.velocity.length() > 25) {
                engineForce = 0;
            }
        }
        
        this.vehicle.applyEngineForce(engineForce, 2); // BL
        this.vehicle.applyEngineForce(engineForce, 3); // BR

        // Braking
        let braking = 0;
        if (this.keys.brake) braking = brakeForce;
        
        this.vehicle.setBrake(braking, 0);
        this.vehicle.setBrake(braking, 1);
        this.vehicle.setBrake(braking, 2);
        this.vehicle.setBrake(braking, 3);

        // --- 2. Sync Visuals with Physics ---
        this.chassisMesh.position.copy(this.chassisBody.position);
        this.chassisMesh.quaternion.copy(this.chassisBody.quaternion);

        for (let i = 0; i < 4; i++) {
            this.wheelMeshes[i].position.copy(this.wheelBodies[i].position);
            this.wheelMeshes[i].quaternion.copy(this.wheelBodies[i].quaternion);
        }

        // --- 3. Update Speedometer UI ---
        // Speed in km/h = m/s * 3.6
        if (this.carType === 'junk_scrapper') {
            const speed = this.chassisBody.velocity.length() * 3.6;
            document.getElementById('speed-val').innerText = Math.round(speed);
        }
    }
}
