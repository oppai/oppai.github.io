import * as THREE from 'three';

// Variables to hold the loaded objects
let planeKodam, planeGohst;
const cardMeshes = [];
const effectMeshes = [];
let auraParticles;

// Async function to load textures and create meshes
async function loadObjects(scene, textureLoader) {
    // Load Kodam
    try {
        const kodamTexture = await textureLoader.loadAsync('assets/kodam.png');
        const kodamAspectRatio = kodamTexture.image.width / kodamTexture.image.height;
        const kodamPlaneHeight = 5;
        const kodamPlaneWidth = kodamPlaneHeight * kodamAspectRatio;
        const kodamGeometry = new THREE.PlaneGeometry(kodamPlaneWidth, kodamPlaneHeight);
        const kodamMaterial = new THREE.MeshStandardMaterial({ 
            map: kodamTexture, 
            side: THREE.DoubleSide, 
            transparent: true, 
            depthWrite: false,
            alphaTest: 0.1
        });
        planeKodam = new THREE.Mesh(kodamGeometry, kodamMaterial);
        planeKodam.userData.initialY = planeKodam.position.y;
        planeKodam.userData.time = 0;
        planeKodam.renderOrder = 2;
        scene.add(planeKodam);

        // Create Aura Particle System AFTER kodam is initialized
        const particleCount = 500;
        const particleSize = 0.03;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const velocities = [];
        const auraColor = new THREE.Color(0xaaaaff);

        for (let i = 0; i < particleCount; i++) {
            const randomFactor = Math.pow(Math.random(), 3);
            const radius = 1.8 + randomFactor * 1.0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi) - 0.2;
            positions.push(x, y, z);
            const variance = Math.random() * 0.3;
            colors.push(auraColor.r + variance, auraColor.g + variance, auraColor.b + variance, 1.0);
            velocities.push((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, Math.random() * Math.PI * 2);
        }

        particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4)); 
        particlesGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: particleSize,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        auraParticles = new THREE.Points(particlesGeometry, particleMaterial);
        auraParticles.userData.initialPositions = particlesGeometry.attributes.position.clone();
        auraParticles.renderOrder = 1;
        scene.add(auraParticles);

    } catch (error) {
        console.error('An error happened loading the kodam texture or creating aura:', error);
        // Fallback for kodam plane
        const geometry = new THREE.PlaneGeometry(5, 5);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        planeKodam = new THREE.Mesh(geometry, material);
        planeKodam.userData.initialY = planeKodam.position.y; 
        planeKodam.userData.time = 0;
        planeKodam.renderOrder = 2;
        scene.add(planeKodam);
    }

    // Load Gohst
    try {
        const gohstTexture = await textureLoader.loadAsync('assets/gohst.png');
        const gohstAspectRatio = gohstTexture.image.width / gohstTexture.image.height;
        const gohstPlaneHeight = 2;
        const gohstPlaneWidth = gohstPlaneHeight * gohstAspectRatio;
        const gohstGeometry = new THREE.PlaneGeometry(gohstPlaneWidth, gohstPlaneHeight);
        const gohstMaterial = new THREE.MeshStandardMaterial({ 
            map: gohstTexture, 
            side: THREE.DoubleSide, 
            transparent: true, 
            depthWrite: false,
            alphaTest: 0.1
        });
        planeGohst = new THREE.Mesh(gohstGeometry, gohstMaterial);
        planeGohst.position.z = -0.1;
        planeGohst.position.x = planeGohst.position.x - 1.2;
        planeGohst.userData.initialY = planeGohst.position.y + 2;
        planeGohst.userData.time = Math.PI;
        planeGohst.renderOrder = 0;
        scene.add(planeGohst);
    } catch (error) {
        console.error('An error happened loading the gohst texture:', error);
        // Fallback for gohst plane
        const geometry = new THREE.PlaneGeometry(4, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        planeGohst = new THREE.Mesh(geometry, material);
        planeGohst.position.z = -0.1;
        scene.add(planeGohst);
    }

    // Load Effect Planes
    try {
        const effectTexture = await textureLoader.loadAsync('assets/effect.png');
        const effectAspectRatio = effectTexture.image.width / effectTexture.image.height;
        const effectPlaneHeight = 3.0;
        const effectPlaneWidth = effectPlaneHeight * effectAspectRatio;
        const effectGeometry = new THREE.PlaneGeometry(effectPlaneWidth, effectPlaneHeight);
        const effectMaterial = new THREE.MeshStandardMaterial({
            map: effectTexture,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            alphaTest: 0.1,
            opacity: 0.7
        });

        const effectPlane1 = new THREE.Mesh(effectGeometry, effectMaterial.clone());
        const effectPlane2 = new THREE.Mesh(effectGeometry, effectMaterial.clone());

        const basePosition = planeGohst ? planeGohst.position.clone() : new THREE.Vector3(0, 0, -0.2);
        basePosition.x -= 0.7;
        basePosition.y += 1.0;
        basePosition.z -= 0.1;

        effectPlane1.position.copy(basePosition);
        effectPlane2.position.copy(basePosition);
        effectPlane2.position.x += 4.0;
        effectPlane1.rotation.z = Math.PI / 4;
        effectPlane2.rotation.z = -Math.PI / 4;

        [effectPlane1, effectPlane2].forEach((plane, index) => {
            plane.userData.initialY = plane.position.y;
            plane.userData.time = Math.random() * Math.PI * 2;
            plane.userData.speed = 0.015 + Math.random() * 0.01;
            plane.userData.amplitude = 0.15 + Math.random() * 0.05;
            plane.renderOrder = -1;
            scene.add(plane);
            effectMeshes.push(plane);
        });

    } catch (error) {
        console.error('An error happened loading the effect texture:', error);
    }

    // Load Cards
    try {
        const cardsTexture = await textureLoader.loadAsync('assets/cards.png');
        const cardAspectRatio = 0.65;
        const cardPlaneSize = 1.0;
        const cardPositions = [
            new THREE.Vector3(-2.0, -0.4, 0.1),
            new THREE.Vector3(2.0, -0.4, 0.1),
            new THREE.Vector3(-1.5, -0.7, 0.1),
            new THREE.Vector3(1.5, -0.7, 0.1),
        ];
        const textureOffsets = [
            { x: 0, y: 0.5 },
            { x: cardAspectRatio/2 + 0.02, y: 0.5 },
            { x: 0, y: 0 },
            { x: cardAspectRatio/2 + 0.02, y: 0 },
        ];

        for (let i = 0; i < 4; i++) {
            const cardTextureClone = cardsTexture.clone();
            cardTextureClone.needsUpdate = true;
            cardTextureClone.repeat.set(0.5 * cardAspectRatio, 0.5);
            cardTextureClone.offset.set(textureOffsets[i].x, textureOffsets[i].y);
            const cardGeometry = new THREE.PlaneGeometry(cardPlaneSize * cardAspectRatio, cardPlaneSize);
            const cardMaterial = new THREE.MeshStandardMaterial({
                map: cardTextureClone,
                side: THREE.DoubleSide,
                transparent: true,
                depthWrite: false,
                alphaTest: 0.1
            });
            const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
            cardMesh.position.copy(cardPositions[i]);
            cardMesh.userData.initialY = cardMesh.position.y;
            cardMesh.userData.initialZ = cardMesh.position.z;
            cardMesh.userData.time = Math.random() * Math.PI * 2;
            cardMesh.userData.speed = 0.01 + Math.random() * 0.02;
            cardMesh.userData.amplitude = 0.1 + Math.random() * 0.05;
            cardMesh.renderOrder = 3;
            scene.add(cardMesh);
            cardMeshes.push(cardMesh);
        }
    } catch(error) {
        console.error('An error happened loading the cards texture:', error);
    }
}

// Export loaded objects and the loader function
export { loadObjects, planeKodam, planeGohst, cardMeshes, effectMeshes, auraParticles }; 
