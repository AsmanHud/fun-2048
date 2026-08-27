import * as THREE from 'three';
import Matter from 'matter-js';
import { engine, world, initPhysicsArena, TABLE_WIDTH, BASELINE_Y } from './physics.js';
import { scene, camera, renderer, initVisualArena } from './visuals.js';

// 1. Initialize the board
initPhysicsArena();
initVisualArena();

// 2. Game State & Data
const gameObjects = [];
let currentCylinder = null;

// Temporary basic tier data (Phase 1 just uses the smallest one)
const tiers = [
    { radius: 15, height: 20, color: 0xff4d4d, mass: 1 },
    { radius: 22, height: 25, color: 0xffa64d, mass: 1.5 }
];

// 3. The Object Factory (Creates in 3D and 2D simultaneously)
function createCylinder(x, y, tierIndex, isPlayer = false) {
    const tier = tiers[tierIndex];

    // -- THREE.JS (Visuals) --
    const geo = new THREE.CylinderGeometry(tier.radius, tier.radius, tier.height, 32);
    const mat = new THREE.MeshStandardMaterial({ color: tier.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;

    // Position the visual mesh sitting on the table
    mesh.position.set(x, tier.height / 2, y);
    scene.add(mesh);

    // -- MATTER.JS (Physics) --
    const body = Matter.Bodies.circle(x, y, tier.radius, {
        restitution: 0.1,     // Bounciness
        frictionAir: 0.03,    // Table drag to slow it down
        density: 0.001 * tier.mass
    });

    body.tier = tierIndex;
    Matter.Composite.add(world, body);

    // Bundle them together
    const gameObject = { mesh, body, isPlayer, height: tier.height };
    gameObjects.push(gameObject);
    return gameObject;
}

// Spawn the first active cylinder on the baseline
function spawnPlayerCylinder() {
    currentCylinder = createCylinder(0, BASELINE_Y, 0, true);
}

// 4. Input & Interaction (Aiming and Shooting)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// We use an invisible mathematical plane perfectly aligned with the table to detect mouse rays
const tablePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const targetPosition = new THREE.Vector3();

window.addEventListener('mousemove', (e) => {
    if (!currentCylinder || !currentCylinder.isPlayer) return;

    // Convert screen pixel to 3D ray
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Find exactly where the mouse ray hits the table plane
    raycaster.ray.intersectPlane(tablePlane, targetPosition);

    // Constrain the X movement so it doesn't clip through the side walls
    const max_X = (TABLE_WIDTH / 2) - tiers[0].radius;
    let clampedX = Math.max(-max_X, Math.min(max_X, targetPosition.x));

    // Instantly teleport the physics body horizontally along the baseline
    Matter.Body.setPosition(currentCylinder.body, {
        x: clampedX,
        y: BASELINE_Y
    });
});

window.addEventListener('mousedown', () => {
    if (!currentCylinder || !currentCylinder.isPlayer) return;

    Matter.Body.setVelocity(currentCylinder.body, { x: 0, y: -25 });

    currentCylinder.isPlayer = false; // Detach from mouse
    currentCylinder = null;

    // Spawn the next one half a second later
    setTimeout(spawnPlayerCylinder, 500);
});

// 5. Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 6. The Master Sync Loop
function animate() {
    requestAnimationFrame(animate);

    // Step the physics engine (16.6ms per frame = 60fps)
    Matter.Engine.update(engine, 1000 / 60);

    // Synchronize 3D visuals to match the 2D physics math
    gameObjects.forEach(obj => {
        // Map 2D X/Y to 3D X/Z
        obj.mesh.position.x = obj.body.position.x;
        obj.mesh.position.z = obj.body.position.y;
    });

    renderer.render(scene, camera);
}

// Start the game!
spawnPlayerCylinder();
animate();
