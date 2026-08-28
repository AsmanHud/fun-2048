import Matter from "matter-js";
import * as THREE from "three";
import { GameConfig } from "./config.js";
import {
	BASELINE_Y,
	engine,
	initPhysicsArena,
	TABLE_WIDTH,
	world,
} from "./physics.js";
import { camera, initVisualArena, renderer, scene } from "./visuals.js";

// 1. Initialize the board
initPhysicsArena();
initVisualArena();

// 2. Game State & Data
const gameObjects = [];
let currentCylinder = null;
let currentOrderTier = 1;
const orderTargetUI = document.getElementById("order-target");
const ticketUI = document.getElementById("ticket");

const tiers = GameConfig.tiers;

// --- Setup Live Dashboard (dev only — dynamically imported so lil-gui
// never ends up in the production bundle) ---
if (import.meta.env.DEV) {
	const { default: GUI } = await import("lil-gui");
	const gui = new GUI({ title: "Physics Sandbox" });

	const updateLivePhysics = () => {
		gameObjects.forEach((obj) => {
			Matter.Body.set(obj.body, "restitution", GameConfig.cylinderRestitution);
			Matter.Body.set(obj.body, "frictionAir", GameConfig.cylinderFrictionAir);
		});
	};

	gui.add(GameConfig, "launchVelocityY", -60, -5, 1).name("Launch Force");

	// For these properties, we add an `onChange` event so that tweaking the slider
	// instantly updates all cylinders currently sitting on the table!
	gui
		.add(GameConfig, "cylinderRestitution", 0, 1, 0.01)
		.name("Bounciness")
		.onChange(updateLivePhysics);
	gui
		.add(GameConfig, "cylinderFrictionAir", 0, 0.1, 0.001)
		.name("Table Friction")
		.onChange(updateLivePhysics);
	gui
		.add(GameConfig, "velocityThresholdSnapToZero", 0, 0.5, 0.01)
		.name("Velocity Snap to Zero");
}

function generateNewOrder() {
	// Randomly pick a tier between 1 and 4 (Orange, Yellow, Green, Blue)
	currentOrderTier = Math.floor(Math.random() * (tiers.length - 1)) + 1;

	// Define some names for our UI based on the colors in our config
	const tierNames = ["Red", "Orange", "Yellow", "Green", "Blue"];

	orderTargetUI.innerText = `Build a ${tierNames[currentOrderTier]} Cylinder`;

	// Match the ticket border color to the requested tier
	const hexColor = `#${tiers[currentOrderTier].color.toString(16).padStart(6, "0")}`;
	ticketUI.style.borderTopColor = hexColor;
}

// 3. The Object Factory (Creates in 3D and 2D simultaneously)
function createCylinder(x, y, tierIndex, isPlayer = false) {
	const tier = tiers[tierIndex];

	// -- THREE.JS (Visuals) --
	const geo = new THREE.CylinderGeometry(
		tier.radius,
		tier.radius,
		tier.height,
		32,
	);
	const mat = new THREE.MeshStandardMaterial({ color: tier.color });
	const mesh = new THREE.Mesh(geo, mat);
	mesh.castShadow = true;

	// Position the visual mesh sitting on the table
	mesh.position.set(x, tier.height / 2, y);
	scene.add(mesh);

	// -- MATTER.JS (Physics) --
	const body = Matter.Bodies.circle(x, y, tier.radius, {
		restitution: GameConfig.cylinderRestitution, // Bounciness
		frictionAir: GameConfig.cylinderFrictionAir, // Table drag to slow it down
		density: GameConfig.densityMultiplier * tier.mass,
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

window.addEventListener("mousemove", (e) => {
	if (!currentCylinder?.isPlayer) return;

	// Convert screen pixel to 3D ray
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);

	// Find exactly where the mouse ray hits the table plane
	raycaster.ray.intersectPlane(tablePlane, targetPosition);

	// Constrain the X movement so it doesn't clip through the side walls
	const max_X = TABLE_WIDTH / 2 - tiers[0].radius;
	const clampedX = Math.max(-max_X, Math.min(max_X, targetPosition.x));

	// Instantly teleport the physics body horizontally along the baseline
	Matter.Body.setPosition(currentCylinder.body, {
		x: clampedX,
		y: BASELINE_Y,
	});
});

window.addEventListener("mousedown", () => {
	if (!currentCylinder?.isPlayer) return;

	Matter.Body.setVelocity(currentCylinder.body, {
		x: 0,
		y: GameConfig.launchVelocityY,
	});

	currentCylinder.isPlayer = false; // Detach from mouse
	currentCylinder = null;

	// Spawn the next one half a second later
	setTimeout(spawnPlayerCylinder, 500);
});

// 5. The Merge Mechanic (Collision Listener)
Matter.Events.on(engine, "collisionStart", (event) => {
	const pairs = event.pairs;
	const bodiesToRemove = new Set();
	const newCylinders = [];

	pairs.forEach((pair) => {
		const { bodyA, bodyB } = pair;

		if (
			bodyA.tier !== undefined &&
			bodyB.tier !== undefined &&
			bodyA.tier === bodyB.tier &&
			!bodyA.isMerging &&
			!bodyB.isMerging
		) {
			bodyA.isMerging = true;
			bodyB.isMerging = true;

			bodiesToRemove.add(bodyA);
			bodiesToRemove.add(bodyB);

			const nextTier = bodyA.tier + 1;

			if (nextTier < tiers.length) {
				const midX = (bodyA.position.x + bodyB.position.x) / 2;
				const midY = (bodyA.position.y + bodyB.position.y) / 2;

				// --- NEW: Check if this merge fulfills the contract! ---
				if (nextTier === currentOrderTier) {
					// Flash the UI green for feedback
					ticketUI.style.backgroundColor = "#e6ffe6";
					setTimeout(() => (ticketUI.style.backgroundColor = "white"), 300);

					// Generate a new order immediately
					generateNewOrder();

					// CRITICAL: We purposely DO NOT push this to newCylinders.
					// By not spawning it, we effectively "remove" it from the board,
					// giving the player that massive relief of cleared space!
				} else {
					// It's not the order, so spawn the next tier normally
					const velX =
						(bodyA.velocity.x * bodyA.mass + bodyB.velocity.x * bodyB.mass) /
						(bodyA.mass + bodyB.mass);
					const velY =
						(bodyA.velocity.y * bodyA.mass + bodyB.velocity.y * bodyB.mass) /
						(bodyA.mass + bodyB.mass);

					newCylinders.push({
						x: midX,
						y: midY,
						tier: nextTier,
						velX: velX,
						velY: velY,
					});
				}
			}
		}
	});

	bodiesToRemove.forEach((body) => {
		const index = gameObjects.findIndex((obj) => obj.body === body);
		if (index !== -1) {
			const obj = gameObjects[index];
			scene.remove(obj.mesh);
			Matter.Composite.remove(world, obj.body);
			gameObjects.splice(index, 1);
		}
	});

	// Spawn and apply inherited velocity
	newCylinders.forEach((data) => {
		const newObj = createCylinder(data.x, data.y, data.tier);
		// Apply the inherited momentum to the newly created body
		Matter.Body.setVelocity(newObj.body, { x: data.velX, y: data.velY });
	});
});

// 6. Window Resize Handler
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// 7. The Master Sync Loop
function animate() {
	requestAnimationFrame(animate);

	Matter.Engine.update(engine, 1000 / 60);

	gameObjects.forEach((obj) => {
		// Calculate the total speed (magnitude of the velocity vector)
		const speed = Math.sqrt(
			obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2,
		);

		if (
			speed > 0 &&
			speed < GameConfig.velocityThresholdSnapToZero &&
			!obj.body.isStatic
		) {
			// Kill the velocity and angular velocity (spin)
			Matter.Body.setVelocity(obj.body, { x: 0, y: 0 });
			Matter.Body.setAngularVelocity(obj.body, 0);
		}

		// Sync Visuals
		obj.mesh.position.x = obj.body.position.x;
		obj.mesh.position.z = obj.body.position.y;
	});

	renderer.render(scene, camera);
}

// Start the game!
spawnPlayerCylinder();
generateNewOrder();
animate();
