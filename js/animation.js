import * as THREE from 'three';

// Keep track of the animation frame request
let animationFrameId = null;

// The main animation function
function animate(context) {
    // Destructure necessary components from the context
    const {
        scene, camera, renderer, controls,
        planeKodam, planeGohst, cardMeshes, effectMeshes, auraParticles,
        nebulaSystem
    } = context;

    // Request the next frame
    animationFrameId = requestAnimationFrame(() => animate(context));

    // Floating animation for kodam
    if (planeKodam) {
        planeKodam.userData.time += 0.02;
        planeKodam.position.y = planeKodam.userData.initialY + Math.sin(planeKodam.userData.time) * 0.2;
    }

    // Floating animation for gohst
    if (planeGohst) {
        planeGohst.userData.time += 0.025;
        planeGohst.position.y = planeGohst.userData.initialY + Math.sin(planeGohst.userData.time) * 0.4;
    }

    // Floating animation for cards
    cardMeshes.forEach(card => {
        card.userData.time += card.userData.speed;
        card.position.y = card.userData.initialY + Math.sin(card.userData.time) * card.userData.amplitude;
    });

    // Floating animation for effect planes
    effectMeshes.forEach(effect => {
        effect.userData.time += effect.userData.speed;
        effect.position.y = effect.userData.initialY + Math.sin(effect.userData.time) * effect.userData.amplitude;
    });

    // Update Nebula System
    if (nebulaSystem && planeKodam) {
        const fireEmitter = nebulaSystem.emitters[0]; // Assuming the first emitter
        if (fireEmitter) {
             nebulaSystem.updateEmitterPosition(fireEmitter, planeKodam);
        }
        nebulaSystem.update();
    }

    // Animate Aura Particles
    if (auraParticles && planeKodam) {
        auraParticles.position.copy(planeKodam.position);
        const positions = auraParticles.geometry.attributes.position;
        const colorsAttribute = auraParticles.geometry.attributes.color;
        const initialPositions = auraParticles.userData.initialPositions;
        const velocities = auraParticles.geometry.attributes.velocity;
        const time = Date.now() * 0.0015;

        for (let i = 0; i < positions.count; i++) {
            const ix = initialPositions.getX(i);
            const iy = initialPositions.getY(i);
            const iz = initialPositions.getZ(i);
            const timeOffset = velocities.getZ(i);
            positions.setX(i, ix + Math.sin(time * 1.5 + timeOffset) * 0.12);
            positions.setY(i, iy + Math.cos(time * 1.5 + timeOffset) * 0.12);
            const alpha = Math.abs(Math.sin(time * 2.0 + timeOffset));
            colorsAttribute.setW(i, alpha);
        }
        positions.needsUpdate = true;
        colorsAttribute.needsUpdate = true;
    }

    // Update controls and render
    controls.update();
    renderer.render(scene, camera);
}

// Function to start the animation loop
function startAnimationLoop(context) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animate(context);
}

export { startAnimationLoop }; 
