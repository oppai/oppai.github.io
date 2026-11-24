import * as THREE from 'three';
// The package's ESM build references undeclared Babel helpers. Vite wraps its UMD build.
import { System, SpriteRenderer } from 'three-nebula/build/three-nebula.js';
import nebulaConfig from '../public/assets/nebulaConfig.json';

async function setupNebula(scene) {
    const nebulaSystem = await System.fromJSONAsync(nebulaConfig, THREE);

    // Create the renderer
    const nebulaRenderer = new SpriteRenderer(scene, THREE);

    // Add the renderer to the system
    nebulaSystem.addRenderer(nebulaRenderer);

    // Set render order, depthWrite and depthTest for Nebula particles
    if (nebulaRenderer.target) {
        nebulaRenderer.target.renderOrder = -2;
        if (nebulaRenderer.target.material) {
            nebulaRenderer.target.material.depthWrite = false;
            nebulaRenderer.target.material.depthTest = false;
        } else {
            console.warn('Could not find Nebula renderer target material to set depthWrite/depthTest.');
        }
    } else {
        console.warn('Could not find Nebula renderer target to set renderOrder/depthWrite/depthTest.');
    }

    // Function to update emitter position based on a target mesh (e.g., planeKodam)
    nebulaSystem.updateEmitterPosition = (emitter, targetMesh) => {
        if (targetMesh && emitter) {
            const targetPosition = targetMesh.position.clone();
            targetPosition.y -= 1.0; // Y offset below target
            emitter.position.copy(targetPosition);
            emitter.position.z -= 0.5; // Z offset behind target
        }
    };

    return nebulaSystem;
}

export { setupNebula };
