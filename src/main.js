import { engine, initPhysicsArena } from './physics.js';
import { scene, camera, renderer, initVisualArena } from './visuals.js';
import Matter from 'matter-js';

// 1. Initialize our two worlds
initPhysicsArena();
initVisualArena();

// 2. Handle Screen Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 3. The Main Game Loop
function animate() {
    requestAnimationFrame(animate);

    // Step physics forward (60fps)
    Matter.Engine.update(engine, 1000 / 60);

    // Render the 3D scene
    renderer.render(scene, camera);
}

animate();
