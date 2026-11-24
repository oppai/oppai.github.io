import * as THREE from 'three';
import floorUrl from '../generated/floor.webp?url';

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

async function loadTexture(loader, url) {
    try {
        return await loader.loadAsync(url);
    } catch (error) {
        console.error(`Failed to load texture ${url}:`, error);
        return null;
    }
}

async function loadCore(scene, textureLoader) {
    const [initialKodamTexture, floorTexture, wallTexture] = await Promise.all([
        textureLoader.loadAsync('/assets/kodam.avif'),
        textureLoader.loadAsync(floorUrl),
        textureLoader.loadAsync('/assets/wall.avif'),
    ]);
    kodamExpressions.kodam = initialKodamTexture;
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

    const groundPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshStandardMaterial({ map: floorTexture, side: THREE.DoubleSide }),
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -2.5;
    groundPlane.renderOrder = -3;
    scene.add(groundPlane);

    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(5, 5);
    const wallPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshStandardMaterial({ map: wallTexture, side: THREE.DoubleSide }),
    );
    wallPlane.position.y = 7.5;
    wallPlane.position.z = -10;
    wallPlane.renderOrder = -4;
    scene.add(wallPlane);
}

function addAura(scene) {
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
}

async function loadDecorations(scene, textureLoader) {
    addAura(scene);
    const [gohstTexture, effectTexture, cardsTexture] = await Promise.all(
        ['gohst', 'effect', 'cards'].map(name => loadTexture(textureLoader, `/assets/${name}.avif`)),
    );

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

}

async function loadExpressions(textureLoader) {
    await Promise.all(['tru', 'sup'].map(async expression => {
        kodamExpressions[expression] = await loadTexture(textureLoader, `/assets/kodam-${expression}.avif`);
    }));
}

async function loadLinks(scene, textureLoader) {
    // --- Create Link Planes (Bottom and Top Rows) ---
    const linkPlaneSize = 1.0;
    const linkSpacing = 1.0;
    const linkZ = 3.0;

    const links = Array.from(document.querySelectorAll('#profile-links [data-icon]'));
    const bottomLinks = links.slice(0, 3);
    const topLinks = links.slice(3);

    async function createLinkRow(rowLinks, y, renderOrderOffset) {
        const startX = -(rowLinks.length - 1) * linkSpacing / 2;
        const textures = await Promise.all(rowLinks.map(link =>
            loadTexture(textureLoader, `/assets/${link.dataset.icon}.avif`),
        ));
        const row = [];
        textures.forEach((texture, index) => {
            if (!texture) return;
            const link = rowLinks[index];
            const geometry = new THREE.PlaneGeometry(linkPlaneSize, linkPlaneSize);
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
                depthWrite: false,
                alphaTest: 0.1,
            });
            const plane = new THREE.Mesh(geometry, material);
            plane.position.set(startX + index * linkSpacing, y, linkZ);
            plane.userData = {
                type: 'link', name: link.dataset.icon, url: link.href, initialY: y, initialZ: linkZ,
            };
            plane.renderOrder = 4 + renderOrderOffset;
            row.push(plane);
        });
        return row;
    }

    const rows = await Promise.all([
        createLinkRow(bottomLinks, -2.0, 0),
        createLinkRow(topLinks, 2.5, 1),
    ]);
    const meshes = rows.flat();
    if (meshes.length !== links.length) {
        for (const mesh of meshes) {
            mesh.geometry.dispose();
            mesh.material.map.dispose();
            mesh.material.dispose();
        }
        return false;
    }
    scene.add(...meshes);
    linkMeshes.push(...meshes);
    return true;
}

function rotateKodamExpression() {
    for (let offset = 1; offset < expressionKeys.length; offset++) {
        const index = (currentExpressionIndex + offset) % expressionKeys.length;
        const texture = kodamExpressions[expressionKeys[index]];
        if (texture) {
            currentExpressionIndex = index;
            planeKodam.material.map = texture;
            planeKodam.userData.needsShakeAnimation = true;
            return;
        }
    }
}

export {
    loadCore, loadDecorations, loadLinks, loadExpressions, planeKodam, planeGohst,
    cardMeshes, effectMeshes, auraParticles, linkMeshes, rotateKodamExpression,
};
