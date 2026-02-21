export class GlitchManager {
    constructor(scene, environment, glitchPass) {
        this.scene = scene;
        this.environment = environment;
        this.glitchPass = glitchPass;

        this.glitchActive = false;
        this.nextGlitchTime = Date.now() + this.getRandomInterval();
    }

    getRandomInterval() {
        // Glitch happens every 10 to 30 seconds
        return Math.random() * 20000 + 10000;
    }

    update() {
        const now = Date.now();

        if (!this.glitchActive && now > this.nextGlitchTime) {
            this.triggerGlitch();
        }

        if (this.glitchActive) {
            // Apply visual glitches to environment per frame
            // e.g., flickering lights, slightly rotating ground
            this.environment.scene.children.forEach(child => {
                 if (child.isMesh && Math.random() > 0.95) {
                     child.material.wireframe = true;
                     setTimeout(() => child.material.wireframe = false, 50);
                 }
            });
        }
    }

    triggerGlitch() {
        this.glitchActive = true;
        
        // Enable Three.js Post-processing GlitchPass
        if (this.glitchPass) {
            this.glitchPass.enabled = true;
        }

        console.warn("ENVIRONMENT GLITCH DETECTED!");
        
        // UI Warning
        document.getElementById('ui-layer').classList.add('glitch-active');

        // Glitch duration 2 to 5 seconds
        const duration = Math.random() * 3000 + 2000;
        
        setTimeout(() => {
            this.endGlitch();
        }, duration);
    }

    endGlitch() {
        this.glitchActive = false;
        
        // Disable Three.js Post-processing GlitchPass
        if (this.glitchPass) {
            this.glitchPass.enabled = false;
        }

        console.log("Environment stabilized.");
        
        document.getElementById('ui-layer').classList.remove('glitch-active');
        this.nextGlitchTime = Date.now() + this.getRandomInterval();
    }
}
