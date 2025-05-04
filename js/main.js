import * as THREE from 'three';
import { scene, camera, renderer, controls, initializeRenderer } from './sceneSetup.js';
import { loadObjects, planeKodam, planeGohst, cardMeshes, effectMeshes, auraParticles, linkMeshes } from './objectLoader.js';
import { setupNebula } from './nebulaSetup.js'; // Import setupNebula function
import { startAnimationLoop } from './animation.js';
import { initRaycaster, updateClickableObjects } from './raycasterHandler.js'; // Import initRaycaster and updateClickableObjects functions

// Main initialization function
async function main() {
    // Initialize renderer and append to container
    initializeRenderer('canvas-container');

    // Initialize texture loader
    const textureLoader = new THREE.TextureLoader();

    // Load scene objects (Kodam, Gohst, Cards, Effects, Aura)
    await loadObjects(scene, textureLoader);

    // Setup Nebula system
    const nebulaSystem = await setupNebula(scene); // Get nebulaSystem from setup function

    // --- Raycasterの初期化 (呼び出し方を修正) ---
    initRaycaster(camera); 
    // ----------------------

    // Prepare context for the animation loop
    const animationContext = {
        scene,
        camera,
        renderer,
        controls,
        planeKodam, // Exported from objectLoader
        planeGohst, // Exported from objectLoader
        cardMeshes, // Exported from objectLoader
        effectMeshes, // Exported from objectLoader
        auraParticles, // Exported from objectLoader
        linkMeshes, // Exported from objectLoader (Pass it to animation if needed, otherwise raycaster is enough)
        nebulaSystem // Returned from setupNebula
    };

    // Start the animation loop
    startAnimationLoop(animationContext);

    // オブジェクト読み込み後にクリック可能オブジェクトを更新
    updateClickableObjects();
}

// Run the main function
main().catch(error => {
    console.error("Initialization failed:", error);
}); 
