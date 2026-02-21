import * as THREE from 'three';

export class LobbyScene {
    constructor(canvas) {
        this.canvas = canvas;
        
        // 1. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 2. Scene Setup
        this.scene = new THREE.Scene();

        // 3. Camera Setup
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(2, 1.5, 4);
        this.camera.lookAt(0, 0.5, 0);

        // 4. Lighting Configuration (Showroom Style)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0x00f0ff, 1.5); // Cyran/Neon light
        spotLight.position.set(0, 5, 0);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        this.scene.add(spotLight);

        const pointLight1 = new THREE.PointLight(0xff00ff, 1, 10); // Pink light
        pointLight1.position.set(2, 1, 2);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x00ffff, 1, 10); // Cyan light
        pointLight2.position.set(-2, 1, -2);
        this.scene.add(pointLight2);

        // 5. Create Stand/Pedestal
        const standGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
        const standMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            metalness: 0.8,
            roughness: 0.2
        });
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.y = -0.05;
        this.scene.add(stand);

        // 6. Temporary Car Mesh (Rotating slowly)
        this.carGroup = new THREE.Group();
        this.createPlaceholderCar();
        this.scene.add(this.carGroup);

        // 7. Event Listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start Animation Loop
        this.animate();
    }

    createPlaceholderCar() {
        // A sleek, hypercar-like placeholder since we lack an actual 3D model right now.
        const bodyGeo = new THREE.BoxGeometry(1.2, 0.3, 2.5);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.1 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.3;
        
        const cabinGeo = new THREE.BoxGeometry(0.8, 0.25, 1);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 1, roughness: 0 }); // Glass look
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(0, 0.55, -0.2);

        this.carGroup.add(body);
        this.carGroup.add(cabin);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Slowly rotate the car showroom
        if (this.carGroup) {
            this.carGroup.rotation.y += 0.005;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
