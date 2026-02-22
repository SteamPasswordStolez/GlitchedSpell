import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CampaignData } from "../data/CampaignData.js";

export class Environment {
  constructor(scene, world, stageId = '1-1') {
    this.scene = scene;
    this.world = world;
    this.stageId = stageId;
    this.config = CampaignData[stageId]?.config || CampaignData['1-1'].config;

    this.initLighting();
    this.initTrack();
    this.initDecorations();
    this.initCheckpoints();
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);

    // Add atmospheric fog based on stage config
    let fogColor = this.config.fogColor || 0x050510;
    this.scene.fog = new THREE.FogExp2(fogColor, 0.002);
  }

  initTrack() {
    // --- 1. Physics Material Setup ---
    const groundMaterial = new CANNON.Material("groundMaterial");
    const wheelMaterial = new CANNON.Material("wheelMaterial");

    const wheelGroundContactMaterial = new CANNON.ContactMaterial(
      wheelMaterial,
      groundMaterial,
      {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000,
      },
    );

    this.world.addContactMaterial(wheelGroundContactMaterial);

    // --- 2. Ground Physics Body ---
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
    groundBody.addShape(groundShape);
    // Plane is facing +Z in cannon by default, rotate it to face +Y
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);

    // --- 3. Ground Visual Mesh ---
    // Create a sleek straight racing track instead of an infinite grid
    const trackWidth = 80;
    const trackLength = this.config.trackLength || 4000;
    
    // Main Road
    const roadGeo = new THREE.PlaneGeometry(trackWidth, trackLength);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
      metalness: 0.1,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    // Shift center so it extends entirely forward (+Z) where we race
    roadMesh.position.z = trackLength / 2 - 200; 
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);

    // Glowing Neon Borders
    let colorLeft = this.config.neonColors ? this.config.neonColors[0] : 0x00ffff;
    let colorRight = this.config.neonColors ? this.config.neonColors[1] : 0xff00ff;

    const borderGeo = new THREE.BoxGeometry(2, 0.5, trackLength);
    const borderMatCyan = new THREE.MeshStandardMaterial({ color: colorLeft, emissive: colorLeft, emissiveIntensity: 2 });
    const borderMatMagenta = new THREE.MeshStandardMaterial({ color: colorRight, emissive: colorRight, emissiveIntensity: 2 });

    const leftBorder = new THREE.Mesh(borderGeo, borderMatCyan);
    leftBorder.position.set(trackWidth / 2, 0.25, trackLength / 2 - 200);
    this.scene.add(leftBorder);

    const rightBorder = new THREE.Mesh(borderGeo, borderMatMagenta);
    rightBorder.position.set(-trackWidth / 2, 0.25, trackLength / 2 - 200);
    this.scene.add(rightBorder);

    // --- 4. Dynamic Obstacles ---
    this.obstacles = [];
    const obstacleZStart = 300; // Start spawning obstacles after the tutorial zone
    const obstacleZEnd = trackLength - 300;
    const spawnZStep = 150; // Distance between obstacle clusters

    // Pre-create materials
    const barrelGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0xff3300, roughness: 0.6, metalness: 0.4, emissive: 0x330000 });
    const crateGeo = new THREE.BoxGeometry(2, 2, 2);
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9, metalness: 0.8 });

    let obstacleChance = this.config.obstacleChance || 0.4;

    for (let z = obstacleZStart; z < obstacleZEnd; z += spawnZStep) {
        // dynamic chance to spawn an obstacle at this step
        if (Math.random() < obstacleChance) {
            const xOffset = (Math.random() - 0.5) * (trackWidth - 10); // Random X position on track
            const isBarrel = Math.random() > 0.5;

            // Physics Body
            const mass = isBarrel ? 100 : 500;
            const shape = isBarrel ? new CANNON.Cylinder(0.5, 0.5, 1.5, 16) : new CANNON.Box(new CANNON.Vec3(1, 1, 1));
            const body = new CANNON.Body({ mass: mass });
            
            // For Cylinder in Cannon, it aligns along Z, so we must rotate
            if (isBarrel) {
                const q = new CANNON.Quaternion();
                q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
                body.addShape(shape, new CANNON.Vec3(), q);
            } else {
                body.addShape(shape);
            }
            
            body.position.set(xOffset, isBarrel ? 0.75 : 1, z);
            
            // High friction block
            const mat = new CANNON.Material();
            mat.friction = 1.0;
            const contactMat = new CANNON.ContactMaterial(groundMaterial, mat, { friction: 0.8, restitution: 0.1 });
            this.world.addContactMaterial(contactMat);
            body.material = mat;

            this.world.addBody(body);

            // Visual Mesh
            const mesh = isBarrel ? new THREE.Mesh(barrelGeo, barrelMat) : new THREE.Mesh(crateGeo, crateMat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);

            this.obstacles.push({ body, mesh, isExplosive: isBarrel });
        }
    }

    // Export materials so the Car can use the wheelMaterial
    this.wheelMaterial = wheelMaterial;
  }

  initDecorations() {
    const scrapGeo = new THREE.BoxGeometry(2, 2, 2);
    const scrapMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9, metalness: 0.8 });
    
    const neonGeo = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
    const neonMats = [
        new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 2 }),
        new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2 }),
        new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 2 })
    ];

    // Scatter scrap piles around the playable area
    for (let i = 0; i < 150; i++) {
        const x = (Math.random() - 0.5) * 300;
        const z = (Math.random() - 0.5) * 300;
        
        // Keep the center cinematic and spawn area clear
        if (Math.abs(x) < 30 && Math.abs(z) < 60) continue;

        const scaleY = Math.random() * 4 + 1;
        const scaleX = Math.random() * 3 + 1;
        const scaleZ = Math.random() * 3 + 1;

        const mesh = new THREE.Mesh(scrapGeo, scrapMat);
        mesh.scale.set(scaleX, scaleY, scaleZ);
        mesh.position.set(x, scaleY, z);
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Add collision body
        const shape = new CANNON.Box(new CANNON.Vec3(scaleX, scaleY, scaleZ));
        const body = new CANNON.Body({ mass: 0 }); // static
        body.addShape(shape);
        body.position.copy(mesh.position);
        body.quaternion.copy(mesh.quaternion);
        this.world.addBody(body);

        // Add occasional neon tubes stuck in the scrap for a flashy look
        if (Math.random() > 0.7) {
            const mat = neonMats[Math.floor(Math.random() * neonMats.length)];
            const neon = new THREE.Mesh(neonGeo, mat);
            neon.position.set(x + (Math.random() - 0.5)*2, scaleY * 2 + 1, z + (Math.random() - 0.5)*2);
            neon.rotation.z = (Math.random() - 0.5) * Math.PI;
            neon.rotation.x = (Math.random() - 0.5) * Math.PI;
            this.scene.add(neon);
            // Removed PointLight creation here to fix the massive performance lag.
        }
    }
  }

  initCheckpoints() {
    this.checkpoints = [];
    const positions = (this.config.checkpoints || [
        [0, 15, 600], [0, 15, 1200], [0, 15, 2000]
    ]).map(arr => new THREE.Vector3(arr[0], arr[1], arr[2]));

    let cpColor = this.config.checkpointColor || 0x00ffff;

    const ringGeo = new THREE.TorusGeometry(30, 2, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
        color: cpColor,
        emissive: cpColor,
        emissiveIntensity: 3,
        transparent: true,
        opacity: 0.8,
        wireframe: true
    });

    positions.forEach((pos, index) => {
        const ring = new THREE.Mesh(ringGeo, ringMat.clone()); // clone mat so we can change colors later
        ring.position.copy(pos);
        this.scene.add(ring);
        
        const light = new THREE.PointLight(cpColor, 10, 150);
        light.position.copy(pos);
        this.scene.add(light);

        this.checkpoints.push({ mesh: ring, light: light, position: pos, passed: false });
    });
  }

  update(deltaTime) {
    // Make checkpoint lights pulse
    const time = performance.now() * 0.003;
    this.checkpoints.forEach((cp, index) => {
      // Don't pulse if passed
      if (cp.passed) return;
      const intensityScale = (Math.sin(time + index) + 1) / 2; // 0 to 1
      cp.light.intensity = 200 * intensityScale + 50; 
      // Also pulse emissive material
      cp.mesh.material.emissiveIntensity = 1 + intensityScale;
    });

    // Sync Obstacle Visuals
    if (this.obstacles) {
      this.obstacles.forEach(obs => {
        obs.mesh.position.copy(obs.body.position);
        obs.mesh.quaternion.copy(obs.body.quaternion);
      });
    }
  }
}

