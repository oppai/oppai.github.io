import * as THREE from 'three';
import { scene, camera, renderer, controls, initializeRenderer } from './sceneSetup.js';
import {
    loadCore, loadDecorations, loadLinks, loadExpressions, planeKodam, planeGohst,
    cardMeshes, effectMeshes, auraParticles, linkMeshes,
} from './objectLoader.js';
import { startAnimationLoop } from './animation.js';
import { initRaycaster, updateClickableObjects } from './raycasterHandler.js';

async function main() {
    initializeRenderer('canvas-container');

    const textureLoader = new THREE.TextureLoader();
    await loadCore(scene, textureLoader);

    const animationContext = {
        scene, camera, renderer, controls, planeKodam, cardMeshes, effectMeshes, linkMeshes,
    };
    initRaycaster(camera, renderer.domElement);
    updateClickableObjects();

    startAnimationLoop(animationContext);
    performance.mark('portfolio-first-webgl-frame');
    document.body.classList.add('scene-ready');

    // Leave a paint opportunity for the first frame before starting optional work.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const stages = [
        loadLinks(scene, textureLoader).then(allLinksLoaded => {
            updateClickableObjects();
            if (allLinksLoaded) document.body.classList.add('scene-links-ready');
        }),
        loadExpressions(textureLoader),
        loadDecorations(scene, textureLoader).then(() => {
            Object.assign(animationContext, { planeGohst, auraParticles });
        }),
        import('./nebulaSetup.js')
            .then(({ setupNebula }) => setupNebula(scene))
            .then(system => { animationContext.nebulaSystem = system; }),
    ];
    for (const result of await Promise.allSettled(stages)) {
        if (result.status === 'rejected') console.error('Optional scene setup failed:', result.reason);
    }
}

main().catch(error => console.error('3D scene initialization failed:', error));
