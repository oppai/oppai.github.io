import * as THREE from 'three';
// Nebula is loaded globally via <script> tag, ensure THREE is available globally or passed correctly
// window.THREE = THREE; // If Nebula needs THREE globally explicitly

let nebulaSystem;

// Async function to load Nebula config and set up the system
async function setupNebula(scene) {
    try {
        const response = await fetch('./assets/nebulaConfig.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const nebulaJSON = await response.json();

        nebulaSystem = await Nebula.System.fromJSONAsync(nebulaJSON, THREE);

        // Create the renderer
        const nebulaRenderer = new Nebula.SpriteRenderer(scene, THREE);

        // Add the renderer to the system
        nebulaSystem = nebulaSystem.addRenderer(nebulaRenderer);

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

    } catch (error) {
        console.error('Error loading or setting up Nebula system:', error);
        nebulaSystem = null; // Ensure nebulaSystem is null on error
    }
    return nebulaSystem; // Return the system (or null if failed)
}

export { setupNebula, nebulaSystem }; 
