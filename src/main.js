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

// A simple 5-tier progression for Phase 1
const tiers = [
    { radius: 15, height: 20, color: 0xff4d4d, mass: 1 },    // Tier 0: Red
    { radius: 18, height: 23, color: 0xffa64d, mass: 1.2 },  // Tier 1: Orange
    { radius: 21, height: 26, color: 0xffff4d, mass: 1.4 },  // Tier 2: Yellow
    { radius: 24, height: 29, color: 0x4dff4d, mass: 1.6 },  // Tier 3: Green
    { radius: 27, height: 32, color: 0x4d4dff, mass: 1.8 }   // Tier 4: Blue
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

// 5. The Merge Mechanic (Collision Listener)
Matter.Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
    const bodiesToRemove = new Set();
    const newCylinders = [];

    pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        if (bodyA.tier !== undefined && bodyB.tier !== undefined &&
            bodyA.tier === bodyB.tier &&
            !bodyA.isMerging && !bodyB.isMerging) {

            bodyA.isMerging = true;
            bodyB.isMerging = true;

            bodiesToRemove.add(bodyA);
            bodiesToRemove.add(bodyB);

            const nextTier = bodyA.tier + 1;

            if (nextTier < tiers.length) {
                const midX = (bodyA.position.x + bodyB.position.x) / 2;
                const midY = (bodyA.position.y + bodyB.position.y) / 2;

                // CONSERVATION OF MOMENTUM MATH
                const velX = ((bodyA.velocity.x * bodyA.mass) + (bodyB.velocity.x * bodyB.mass)) / (bodyA.mass + bodyB.mass);
                const velY = ((bodyA.velocity.y * bodyA.mass) + (bodyB.velocity.y * bodyB.mass)) / (bodyA.mass + bodyB.mass);

                newCylinders.push({
                    x: midX,
                    y: midY,
                    tier: nextTier,
                    velX: velX,
                    velY: velY
                });
            }
        }
    });

    bodiesToRemove.forEach(body => {
        const index = gameObjects.findIndex(obj => obj.body === body);
        if (index !== -1) {
            const obj = gameObjects[index];
            scene.remove(obj.mesh);
            Matter.Composite.remove(world, obj.body);
            gameObjects.splice(index, 1);
        }
    });

    // Spawn and apply inherited velocity
    newCylinders.forEach(data => {
        const newObj = createCylinder(data.x, data.y, data.tier);
        // Apply the inherited momentum to the newly created body
        Matter.Body.setVelocity(newObj.body, { x: data.velX, y: data.velY });
    });
});

// 6. Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 7. The Master Sync Loop
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
