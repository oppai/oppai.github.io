import * as THREE from 'three';

// Variables to hold the loaded objects
let planeKodam, planeGohst;
const cardMeshes = [];
const effectMeshes = [];
let auraParticles;
const linkMeshes = []; // Array to hold clickable link meshes

// Async function to load textures and create meshes
async function loadObjects(scene, textureLoader) {
    // Load Kodam
    try {
        const kodamTexture = await textureLoader.loadAsync('assets/kodam.avif');
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
        const gohstTexture = await textureLoader.loadAsync('assets/gohst.avif');
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
        const effectTexture = await textureLoader.loadAsync('assets/effect.avif');
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
        const cardsTexture = await textureLoader.loadAsync('assets/cards.avif');
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

    // --- Create Ground Plane using CanvasTexture ---
    try {
        // 1. Load both background textures
        const bgTexture = await textureLoader.loadAsync('assets/ground.avif');
        const bgNoneTexture = await textureLoader.loadAsync('assets/ground-none.avif');

        // 2. Create a Canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Define canvas size (can be adjusted for quality vs performance)
        // Make it large enough to capture detail from both textures
        const canvasSize = 1024; // Power of 2 often preferred for textures
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        // 3. Draw textures onto the canvas
        // Ensure images are loaded before drawing
        const bgImg = bgTexture.image;
        const bgNoneImg = bgNoneTexture.image;

        if (bgImg && bgNoneImg) {
            // Draw the repeating background-none texture first
            ctx.fillStyle = ctx.createPattern(bgNoneImg, 'repeat');
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the central background.avif
            // Calculate the size and position to draw the central image
            // Assuming background.avif should cover the central area of the ground plane.
            // Let's say the central image should cover 1/4th of the canvas width/height.
            const centralImageSize = canvasSize / 8; // Adjust this ratio as needed
            const centralImageX = (canvasSize - centralImageSize) / 2;
            const centralImageY = (canvasSize - centralImageSize) / 2;
            ctx.drawImage(bgImg, centralImageX, centralImageY, centralImageSize, centralImageSize);

        } else {
            console.error('Background images not loaded for canvas drawing.');
            // Optional fallback drawing
            ctx.fillStyle = 'grey';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'darkgrey';
            const centralImageSize = canvasSize / 4;
            const centralImageX = (canvasSize - centralImageSize) / 2;
            const centralImageY = (canvasSize - centralImageSize) / 2;
            ctx.fillRect(centralImageX, centralImageY, centralImageSize, centralImageSize);
        }

        // 4. Create CanvasTexture
        const groundCanvasTexture = new THREE.CanvasTexture(canvas);
        groundCanvasTexture.needsUpdate = true; // Important!

        // 5. Create ground geometry and material using the canvas texture
        const groundGeometry = new THREE.PlaneGeometry(50, 50); // Same size as before
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: groundCanvasTexture, // Use the canvas texture
            side: THREE.DoubleSide
        });

        const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        groundPlane.rotation.x = -Math.PI / 2;
        groundPlane.position.y = -2.5;
        groundPlane.renderOrder = -3;
        scene.add(groundPlane);

    } catch (error) {
        console.error('An error happened creating the ground canvas texture:', error);
    }
    // --- End Ground Plane ---

    // --- Create Wall Plane ---
    try {
        const wallTexture = await textureLoader.loadAsync('assets/wall.avif');
        // Configure texture wrapping and repetition for tiling (optional)
        wallTexture.wrapS = THREE.RepeatWrapping;
        wallTexture.wrapT = THREE.RepeatWrapping;
        const wallRepeats = 5; // Halved: Texture appears larger
        wallTexture.repeat.set(wallRepeats, wallRepeats);

        // Wall geometry - adjust size as needed
        const wallGeometry = new THREE.PlaneGeometry(50, 50); // Width, Height
        const wallMaterial = new THREE.MeshStandardMaterial({
            map: wallTexture,
            side: THREE.DoubleSide
        });
        const wallPlane = new THREE.Mesh(wallGeometry, wallMaterial);

        // Position the wall behind other objects
        // wallPlane.rotation.y = ? // If needed
        wallPlane.position.y = 7.5; // Adjust Y position (centered or based on ground level)
        wallPlane.position.z = -10; // Position behind everything
        wallPlane.renderOrder = -4; // Render behind ground plane (-3)

        scene.add(wallPlane);
    } catch (error) {
        console.error('An error happened loading the wall texture:', error);
    }
    // --- End Wall Plane ---

    // --- Create Link Planes (Bottom and Top Rows) ---
    const linkPlaneSize = 1.0; // Keep increased size or adjust
    const linkSpacing = 1.0;   // Keep increased spacing or adjust
    const linkZ = 3.0;         // Z position

    // Define links for each row
    const bottomLinks = [
        { name: 'x', file: 'assets/x.avif', url: 'https://x.com/kodam' },
        { name: 'github', file: 'assets/github.avif', url: 'https://github.com/oppai' },
        { name: 'cv', file: 'assets/cv.avif', url: 'https://gist.github.com/oppai/5e10c6bd03c9d53f50564a369be2f940' }
    ];
    const topLinks = [
        { name: 'ai', file: 'assets/ai.avif', url: 'https://note.com/0ppai' },
        { name: 'poker', file: 'assets/poker.avif', url: 'https://note.com/brianpoker' }
    ];

    // Function to create and position planes for a row
    async function createLinkRow(links, yPos, renderOrderOffset = 0) {
        const startX = - (links.length - 1) * linkSpacing / 2;
        for (let i = 0; i < links.length; i++) {
            const linkInfo = links[i];
            try {
                const texture = await textureLoader.loadAsync(linkInfo.file);
                const geometry = new THREE.PlaneGeometry(linkPlaneSize, linkPlaneSize);
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: true,
                    depthWrite: false,
                    alphaTest: 0.1
                });
                const plane = new THREE.Mesh(geometry, material);

                plane.position.x = startX + i * linkSpacing;
                plane.position.y = yPos;
                plane.position.z = linkZ;

                plane.userData = { 
                    type: 'link', 
                    name: linkInfo.name,
                    url: linkInfo.url,
                    initialY: yPos,      // Store initial Y
                    initialZ: linkZ       // Store initial Z
                };
                plane.renderOrder = 4 + renderOrderOffset; // Ensure they are in front

                scene.add(plane);
                linkMeshes.push(plane); // Add to the global array for raycasting

            } catch (error) {
                console.error(`An error happened loading the ${linkInfo.name} texture:`, error);
            }
        }
    }

    // Create bottom row
    const linkY_bottom = -2.0; // Adjust Y position for bottom
    await createLinkRow(bottomLinks, linkY_bottom, 0);

    // Create top row
    const linkY_top = 2.5; // Adjust Y position for top
    await createLinkRow(topLinks, linkY_top, 1); // Slightly higher render order for top if needed?

    // --- End Link Planes ---
}

// Export loaded objects and the loader function
export { loadObjects, planeKodam, planeGohst, cardMeshes, effectMeshes, auraParticles, linkMeshes }; 
