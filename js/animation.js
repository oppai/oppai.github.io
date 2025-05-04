import * as THREE from 'three';

// Keep track of the animation frame request
let animationFrameId = null;

// Variables for link icon animation
const bottomLinkCount = 3; // Number of icons in the bottom row
let activeLinkIndex = bottomLinkCount; // Start from the first top icon (index 3)
let linkJiggleTime = 0;
const linkJiggleSpeed = 0.20; // Increased speed (was 0.15)
const linkJiggleAmplitude = 0.04; // Reverted amplitude back to original
const linkCycleDuration = Math.PI * 2 / linkJiggleSpeed; // Time for one jiggle cycle
let linkAnimationState = 'JIGGLING'; // State: JIGGLING or PAUSED
let pauseTimer = 0;
const pauseDurationFrames = 60; // Pause duration in frames (e.g., 60 frames = 1 second at 60fps)

// The main animation function
function animate(context) {
    // Destructure necessary components from the context
    const {
        scene, camera, renderer, controls,
        planeKodam, planeGohst, cardMeshes, effectMeshes, auraParticles, linkMeshes,
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

    // Sequential Jiggle Animation for Link Icons
    if (linkMeshes && linkMeshes.length > 0) {

        if (linkAnimationState === 'JIGGLING') {
            linkJiggleTime += 1; // Increment time only when jiggling

            // Apply jiggle only to the currently active icon
            const currentLink = linkMeshes[activeLinkIndex];
            if (currentLink && currentLink.userData && typeof currentLink.userData.initialY !== 'undefined') {
                const jiggleOffset = Math.sin(linkJiggleTime * linkJiggleSpeed) * linkJiggleAmplitude;
                currentLink.position.y = currentLink.userData.initialY + jiggleOffset;
            } else if (currentLink) {
                 console.warn(`Missing userData or initialY for active link index ${activeLinkIndex}`);
            }

            // Ensure inactive links are at their resting position
            // Optimization: Could potentially do this less frequently if needed
            linkMeshes.forEach((link, index) => {
                if (index !== activeLinkIndex && link.userData && typeof link.userData.initialY !== 'undefined') {
                    if (link.position.y !== link.userData.initialY) {
                        link.position.y = link.userData.initialY;
                    }
                }
            });

            // Check if the current jiggle cycle is complete
            if (linkJiggleTime * linkJiggleSpeed >= Math.PI * 2) { 
                // Reset the position of the link that just finished
                if (currentLink && currentLink.userData) currentLink.position.y = currentLink.userData.initialY;
                linkJiggleTime = 0; // Reset time for the next cycle or pause

                // Determine the next index or state based on current index
                const isTopRow = activeLinkIndex >= bottomLinkCount;
                const isLastTopIcon = activeLinkIndex === linkMeshes.length - 1;
                const isLastBottomIcon = activeLinkIndex === bottomLinkCount - 1;

                if (isTopRow) {
                    if (isLastTopIcon) {
                        // Finished last top icon, move to the first bottom icon
                        activeLinkIndex = 0;
                    } else {
                        // Move to the next top icon
                        activeLinkIndex++;
                    }
                } else { // is Bottom Row
                    if (isLastBottomIcon) {
                        // Finished last bottom icon, switch to PAUSED state
                        linkAnimationState = 'PAUSED';
                        pauseTimer = 0;
                        // Ensure all icons are reset before pause
                        linkMeshes.forEach(link => { if(link && link.userData) link.position.y = link.userData.initialY; });
                    } else {
                        // Move to the next bottom icon
                        activeLinkIndex++;
                    }
                }
            }
        } else if (linkAnimationState === 'PAUSED') {
            pauseTimer++; // Increment pause timer
            // Ensure all icons stay at rest during pause (belt and braces)
            linkMeshes.forEach(link => {
                 if (link && link.userData && link.position.y !== link.userData.initialY) {
                    link.position.y = link.userData.initialY;
                }
            });

            if (pauseTimer >= pauseDurationFrames) {
                // Pause finished, switch back to JIGGLING and reset to the first TOP icon
                linkAnimationState = 'JIGGLING';
                activeLinkIndex = bottomLinkCount; // Reset to start from the top row
                // linkJiggleTime is already 0
            }
        }
    }

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
