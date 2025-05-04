import * as THREE from 'three';
import { scene, camera, renderer, controls, initializeRenderer } from './sceneSetup.js';
import { loadObjects, planeKodam, planeGohst, cardMeshes, effectMeshes, auraParticles, linkMeshes } from './objectLoader.js';
import { setupNebula } from './nebulaSetup.js'; // Import setupNebula function
import { startAnimationLoop } from './animation.js';
import { initializeRaycaster } from './raycasterHandler.js'; // Import initializeRaycaster function

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

    // --- Raycasterの初期化 ---
    // Add linkMeshes to the array of clickable objects
    const objectsToClick = [planeKodam, planeGohst, ...cardMeshes, ...linkMeshes]; 
    initializeRaycaster(renderer, camera, objectsToClick); 
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
}

// Run the main function
main().catch(error => {
    console.error("Initialization failed:", error);
}); 
