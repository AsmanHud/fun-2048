import * as THREE from 'three';
import { TABLE_WIDTH, WALL_LENGTH, TABLE_RADIUS } from './physics.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color('#e0e8f0'); // Outer environment color

// The Camera: Pulled back on Z, high up on Y, angled down
const aspect = window.innerWidth / window.innerHeight;

// Pull the camera much higher and further back on the Z-axis
export const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
camera.position.set(0, 1000, 800);

// Look slightly towards the top of the table to shift the arena UP on your screen
camera.lookAt(0, 0, -100);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(200, 500, 200);
dirLight.castShadow = true;
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

export function initVisualArena() {
    // Draw the Pill Shape using Three.js 2D Shape API, then extruding/filling it
    const shape = new THREE.Shape();

    // Top Arc
    shape.absarc(0, -WALL_LENGTH / 2, TABLE_RADIUS, Math.PI, 2 * Math.PI, false);
    // Right Wall
    shape.lineTo(TABLE_RADIUS, WALL_LENGTH / 2);
    // Bottom Arc
    shape.absarc(0, WALL_LENGTH / 2, TABLE_RADIUS, 0, Math.PI, false);
    // Left Wall
    shape.lineTo(-TABLE_RADIUS, -WALL_LENGTH / 2);

    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });
    const tableMesh = new THREE.Mesh(geo, mat);

    tableMesh.rotation.x = -Math.PI / 2; // Lay it flat on the ground
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Optional: Draw a visual dashed line for the Baseline
    const lineGeo = new THREE.PlaneGeometry(TABLE_WIDTH, 4);
    const lineMat = new THREE.MeshBasicMaterial({ color: '#cccccc', transparent: true, opacity: 0.5 });
    const lineMesh = new THREE.Mesh(lineGeo, lineMat);
    lineMesh.rotation.x = -Math.PI / 2;
    lineMesh.position.set(0, 1, WALL_LENGTH / 2); // Positioned slightly above table (Y=1) at the baseline Z
    scene.add(lineMesh);
}
