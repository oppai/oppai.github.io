import * as THREE from 'three';

// Variables to hold the loaded objects
let planeKodam, planeGohst;
const cardMeshes = [];
const effectMeshes = [];
let auraParticles;
const linkMeshes = []; // Array to hold clickable link meshes

// Kodam 表情管理
const kodamExpressions = {
  kodam: null,
  tru: null,
  sup: null,
};
const expressionKeys = Object.keys(kodamExpressions); // ['kodam', 'tru', 'sup']
let currentExpressionIndex = 0;

// Async function to load textures and create meshes
async function loadObjects(scene, textureLoader) {
    // --- Start Parallel Texture Loading ---
    const texturePromises = [
        textureLoader.loadAsync('/assets/kodam.avif').catch(e => { console.error('Failed to load kodam', e); return null; }),        // 0: kodam (default)
        textureLoader.loadAsync('/assets/gohst.avif').catch(e => { console.error('Failed to load gohst', e); return null; }),        // 1: gohst
        textureLoader.loadAsync('/assets/effect.avif').catch(e => { console.error('Failed to load effect', e); return null; }),       // 2: effect
        textureLoader.loadAsync('/assets/cards.avif').catch(e => { console.error('Failed to load cards', e); return null; }),        // 3: cards
        textureLoader.loadAsync('/assets/ground.avif').catch(e => { console.error('Failed to load ground', e); return null; }),       // 4: bg
        textureLoader.loadAsync('/assets/ground-none.avif').catch(e => { console.error('Failed to load ground-none', e); return null; }), // 5: bgNone
        textureLoader.loadAsync('/assets/wall.avif').catch(e => { console.error('Failed to load wall', e); return null; }),          // 6: wall
        // Kodam Expressions
        textureLoader.loadAsync('/assets/kodam-tru.avif').catch(e => { console.error('Failed to load kodam-tru', e); return null; }),    // 7: kodam tru
        textureLoader.loadAsync('/assets/kodam-sup.avif').catch(e => { console.error('Failed to load kodam-sup', e); return null; })     // 8: kodam sup
    ];

    let kodamTexture, gohstTexture, effectTexture, cardsTexture, bgTexture, bgNoneTexture, wallTexture, kodamTruTexture, kodamSupTexture;

    try {
        // Wait for all main textures to load in parallel
        const loadedTextures = await Promise.all(texturePromises);
        // 分割代入で結果を取得
        [kodamTexture, gohstTexture, effectTexture, cardsTexture, bgTexture, bgNoneTexture, wallTexture, kodamTruTexture, kodamSupTexture] = loadedTextures;

        // kodamExpressions オブジェクトに格納
        kodamExpressions.kodam = kodamTexture;
        kodamExpressions.tru = kodamTruTexture;
        kodamExpressions.sup = kodamSupTexture;

    } catch (error) {
        // Promise.all 自体のエラー (上記 .catch で個別にハンドルしているので、通常ここには来ないはず)
        console.error('An error happened during parallel texture loading Promise.all:', error);
    }
    // --- End Parallel Texture Loading ---

    // Load Kodam
    try {
        const initialKodamTexture = kodamExpressions.kodam; // デフォルトの表情を使う
        if (initialKodamTexture) { // Check if texture loaded successfully
            const kodamAspectRatio = initialKodamTexture.image.width / initialKodamTexture.image.height;
            const kodamPlaneHeight = 5;
            const kodamPlaneWidth = kodamPlaneHeight * kodamAspectRatio;
            const kodamGeometry = new THREE.PlaneGeometry(kodamPlaneWidth, kodamPlaneHeight);
            // マテリアルには初期テクスチャを設定
            const kodamMaterial = new THREE.MeshStandardMaterial({
                map: initialKodamTexture,
                side: THREE.DoubleSide,
                transparent: true,
                depthWrite: false,
                alphaTest: 0.1
            });
            planeKodam = new THREE.Mesh(kodamGeometry, kodamMaterial);
            planeKodam.userData.initialY = planeKodam.position.y;
            planeKodam.userData.time = 0;
            planeKodam.userData.needsShakeAnimation = false;
            planeKodam.renderOrder = 2;
            planeKodam.name = "kodam"; // Raycaster で識別できるように名前を設定
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
        } else {
            throw new Error('Initial Kodam texture failed to load.'); // Trigger catch block
        }
    } catch (error) {
        console.error('An error happened setting up the kodam object or aura:', error);
        // Fallback for kodam plane
        const geometry = new THREE.PlaneGeometry(5, 5);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        planeKodam = new THREE.Mesh(geometry, material);
        planeKodam.userData.initialY = planeKodam.position.y;
        planeKodam.userData.time = 0;
        planeKodam.userData.needsShakeAnimation = false;
        planeKodam.renderOrder = 2;
        planeKodam.name = "kodam"; // fallback にも名前を設定
        scene.add(planeKodam);
    }

    // Load Gohst
    try {
        if (gohstTexture) { // Check if texture loaded successfully
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
        } else {
             throw new Error('Gohst texture failed to load.');
        }
    } catch (error) {
        console.error('An error happened setting up the gohst object:', error);
        // Fallback for gohst plane
        const geometry = new THREE.PlaneGeometry(4, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        planeGohst = new THREE.Mesh(geometry, material);
        planeGohst.position.z = -0.1;
        scene.add(planeGohst);
    }

    // Load Effect Planes
    try {
        if (effectTexture) { // Check if texture loaded successfully
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
        } else {
             throw new Error('Effect texture failed to load.');
        }
    } catch (error) {
        console.error('An error happened setting up the effect objects:', error);
    }

    // Load Cards
    try {
        if (cardsTexture) { // Check if texture loaded successfully
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
        } else {
            throw new Error('Cards texture failed to load.');
        }
    } catch(error) {
        console.error('An error happened setting up the card objects:', error);
    }

    // --- Create Ground Plane using CanvasTexture ---
    try {
        if (bgTexture && bgNoneTexture) { // Check if textures loaded
             const canvas = document.createElement('canvas');
             const ctx = canvas.getContext('2d');
             const canvasSize = 1024;
             canvas.width = canvasSize;
             canvas.height = canvasSize;
             const bgImg = bgTexture.image;
             const bgNoneImg = bgNoneTexture.image;

             if (bgImg && bgNoneImg) {
                 ctx.fillStyle = ctx.createPattern(bgNoneImg, 'repeat');
                 ctx.fillRect(0, 0, canvas.width, canvas.height);
                 const centralImageSize = canvasSize / 8;
                 const centralImageX = (canvasSize - centralImageSize) / 2;
                 const centralImageY = (canvasSize - centralImageSize) / 2;
                 ctx.drawImage(bgImg, centralImageX, centralImageY, centralImageSize, centralImageSize);
             } else {
                 console.error('Background images not loaded for canvas drawing.');
                 ctx.fillStyle = 'grey';
                 ctx.fillRect(0, 0, canvas.width, canvas.height);
                 ctx.fillStyle = 'darkgrey';
                 const centralImageSize = canvasSize / 4;
                 const centralImageX = (canvasSize - centralImageSize) / 2;
                 const centralImageY = (canvasSize - centralImageSize) / 2;
                 ctx.fillRect(centralImageX, centralImageY, centralImageSize, centralImageSize);
             }
             const groundCanvasTexture = new THREE.CanvasTexture(canvas);
             groundCanvasTexture.needsUpdate = true;
             const groundGeometry = new THREE.PlaneGeometry(50, 50);
             const groundMaterial = new THREE.MeshStandardMaterial({
                 map: groundCanvasTexture,
                 side: THREE.DoubleSide
             });
             const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
             groundPlane.rotation.x = -Math.PI / 2;
             groundPlane.position.y = -2.5;
             groundPlane.renderOrder = -3;
             scene.add(groundPlane);
        } else {
            throw new Error('Background textures failed to load.');
        }
    } catch (error) {
        console.error('An error happened creating the ground canvas texture:', error);
    }
    // --- End Ground Plane ---

    // --- Create Wall Plane ---
    try {
        if(wallTexture) { // Check if texture loaded
            wallTexture.wrapS = THREE.RepeatWrapping;
            wallTexture.wrapT = THREE.RepeatWrapping;
            const wallRepeats = 5;
            wallTexture.repeat.set(wallRepeats, wallRepeats);
            const wallGeometry = new THREE.PlaneGeometry(50, 50);
            const wallMaterial = new THREE.MeshStandardMaterial({
                map: wallTexture,
                side: THREE.DoubleSide
            });
            const wallPlane = new THREE.Mesh(wallGeometry, wallMaterial);
            wallPlane.position.y = 7.5;
            wallPlane.position.z = -10;
            wallPlane.renderOrder = -4;
            scene.add(wallPlane);
        } else {
            throw new Error('Wall texture failed to load.');
        }
    } catch (error) {
        console.error('An error happened creating the wall object:', error);
    }
    // --- End Wall Plane ---


    // --- Create Link Planes (Bottom and Top Rows) ---
    const linkPlaneSize = 1.0;
    const linkSpacing = 1.0;
    const linkZ = 3.0;

    const bottomLinks = [
        { name: 'x', file: '/assets/x.avif', url: 'https://x.com/kodam' },
        { name: 'github', file: '/assets/github.avif', url: 'https://github.com/oppai' },
        { name: 'cv', file: '/assets/cv.avif', url: 'https://gist.github.com/oppai/5e10c6bd03c9d53f50564a369be2f940' }
    ];
    const topLinks = [
        { name: 'ai', file: '/assets/ai.avif', url: 'https://note.com/0ppai' },
        { name: 'poker', file: '/assets/poker.avif', url: 'https://note.com/brianpoker' }
    ];

    // Function to create and position planes for a row (modified for parallel loading)
    async function createLinkRow(links, yPos, renderOrderOffset = 0) {
        const startX = - (links.length - 1) * linkSpacing / 2;

        // 1. Create promises for all textures in this row
        const linkTexturePromises = links.map(linkInfo =>
            textureLoader.loadAsync(linkInfo.file).catch(error => {
                // Handle individual texture load errors if needed, return null or a fallback
                console.error(`Failed to load texture ${linkInfo.file}:`, error);
                return null; // Allow Promise.all to resolve even if one fails
            })
        );

        try {
            // 2. Wait for all textures in this row to load
            const loadedLinkTextures = await Promise.all(linkTexturePromises);

            // 3. Create meshes using the loaded textures
            for (let i = 0; i < links.length; i++) {
                const linkInfo = links[i];
                const texture = loadedLinkTextures[i]; // Get the loaded texture (or null if failed)

                if (!texture) {
                    console.warn(`Skipping link plane for ${linkInfo.name} due to texture load failure.`);
                    continue; // Skip creating this plane
                }

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
                    initialY: yPos,
                    initialZ: linkZ
                };
                plane.renderOrder = 4 + renderOrderOffset;

                scene.add(plane);
                linkMeshes.push(plane);
            }
        } catch (error) {
            // This catch block might not be strictly necessary if individual errors
            // are handled in the .catch() above, but good for general errors.
            console.error(`An error happened creating link row at y=${yPos}:`, error);
        }
    }


    // Create bottom row
    const linkY_bottom = -2.0;
    await createLinkRow(bottomLinks, linkY_bottom, 0);

    // Create top row
    const linkY_top = 2.5;
    await createLinkRow(topLinks, linkY_top, 1);

    // --- End Link Planes ---
}

// 表情をローテーションさせる関数
function rotateKodamExpression() {
  if (!planeKodam || !planeKodam.material) {
    console.warn('Kodam plane or material not ready for expression change.');
    return;
  }

  // 次の表情インデックスを計算 (リストの末尾に来たら最初に戻る)
  currentExpressionIndex = (currentExpressionIndex + 1) % expressionKeys.length;
  const nextExpressionKey = expressionKeys[currentExpressionIndex];
  const nextTexture = kodamExpressions[nextExpressionKey];

  if (nextTexture) {
    planeKodam.material.map = nextTexture;
    planeKodam.userData.needsShakeAnimation = true;
    // console.log(`Changed expression to: ${nextExpressionKey}`); // デバッグ用
  } else {
    console.warn(`Texture for expression "${nextExpressionKey}" is not loaded.`);
    // エラーが発生した場合、次のクリックで次の表情に進むようにインデックスは更新しておく
  }
}

// Export loaded objects and the loader function
// rotateKodamExpression もエクスポートに追加
export { loadObjects, planeKodam, planeGohst, cardMeshes, effectMeshes, auraParticles, linkMeshes, rotateKodamExpression }; 
