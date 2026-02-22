import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class AIController {
    constructor(car, targetCar, environment) {
        this.car = car;
        this.target = targetCar;
        this.environment = environment;
        this.isActive = false;

        // Pathfinding / Chase Params
        this.huntDistanceX = 15; // Width to consider alongside the player
        this.huntDistanceZ = 30; // Distance behind player to try and rubberband to before striking

        this.car.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            brake: false
        };
    }

    activate() {
        this.isActive = true;
    }

    update(deltaTime) {
        if (!this.isActive || this.car.isDestroyed || !this.target || this.target.isDestroyed) {
            this.car.keys.forward = false;
            this.car.keys.left = false;
            this.car.keys.right = false;
            this.car.keys.brake = true;
            return;
        }

        const myPos = this.car.chassisBody.position;
        const targetPos = this.target.chassisBody.position;

        // Reset Keys
        this.car.keys.forward = false;
        this.car.keys.left = false;
        this.car.keys.right = false;
        this.car.keys.brake = false;

        // 1. Acceleration Logic (Rubberbanding)
        // AI should always try to catch up if behind, and match speed if near
        const distanceZ = targetPos.z - myPos.z;
        const targetSpeed = this.target.chassisBody.velocity.length();
        const mySpeed = this.car.chassisBody.velocity.length();

        // If player is ahead (+Z), drive forward hard
        if (distanceZ > -10) { 
            this.car.keys.forward = true;
            // Optionally, give AI fake boost if they are too far behind (rubberbanding)
            if (distanceZ > 30) {
                // Determine a safe maximum catch-up speed 
                const catchupRatio = this.car.carType === 'alpha_omega' ? 1.2 : 1.5;
                const maxSpeed = this.car.carType === 'alpha_omega' ? 70 : 90;
                const catchupSpeed = Math.min(targetSpeed * catchupRatio + 10, maxSpeed);
                if (mySpeed < catchupSpeed) {
                    // Apply a massive artificial forward force to catch up
                    const forceAmt = this.car.carType === 'alpha_omega' ? 80000 : 30000;
                    this.car.chassisBody.applyLocalForce(new CANNON.Vec3(0, 0, forceAmt), new CANNON.Vec3(0,0,0));
                }
            }
        } else if (distanceZ < -50) {
            // Player is far behind the AI (AI overshot), brake
            this.car.keys.brake = true;
        } else {
            // Right next to player, maintain speed
            if (mySpeed < targetSpeed) {
                this.car.keys.forward = true;
            }
        }

        // 2. Steering Logic (RAMMING)
        // AI wants to match the X coordinate of the player to ram them
        const distanceX = targetPos.x - myPos.x;
        
        // Boss steering is heavier and less prone to jitter
        const deadzone = this.car.carType === 'alpha_omega' ? 4.0 : 2.0;
        
        if (Math.abs(distanceX) > deadzone) {
            if (distanceX > 0) {
                // Target is to our Left (+X), turn left
                this.car.keys.left = true;
            } else {
                // Target is to our Right (-X), turn right
                this.car.keys.right = true;
            }
        }
    }
}
