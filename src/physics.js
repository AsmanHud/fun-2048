import Matter from 'matter-js';

export const engine = Matter.Engine.create();
engine.gravity.y = 0; // Zero gravity for top-down sliding
export const world = engine.world;

// Arena Dimensions (1:2 Ratio)
export const TABLE_WIDTH = 400;
export const WALL_LENGTH = 400;
export const TABLE_RADIUS = TABLE_WIDTH / 2; // 200

// The precise Y-coordinate where the straight walls end and the bottom arc begins
export const BASELINE_Y = WALL_LENGTH / 2; // 200

export function initPhysicsArena() {
    const options = { isStatic: true, friction: 0.1, restitution: 0.4 }; // Bouncy, smooth walls
    const bounds = [];

    // 1. Straight Vertical Walls
    bounds.push(Matter.Bodies.rectangle(-TABLE_RADIUS, 0, 10, WALL_LENGTH, options)); // Left
    bounds.push(Matter.Bodies.rectangle(TABLE_RADIUS, 0, 10, WALL_LENGTH, options));  // Right

    // 2. Helper function to build hollow arcs out of rectangles
    const createArc = (centerX, centerY, radius, startAngle, endAngle, segments) => {
        const step = (endAngle - startAngle) / segments;
        for (let i = 0; i < segments; i++) {
            const angle = startAngle + step * i + (step / 2);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const length = (radius * step) + 5; // +5 to overlap edges and prevent physics clipping

            bounds.push(Matter.Bodies.rectangle(x, y, 10, length, {
                ...options,
                angle: angle
            }));
        }
    };

    // 3. Top Half-Circle (Matter.js angles: 0 is right, Math.PI is left)
    createArc(0, -WALL_LENGTH / 2, TABLE_RADIUS, Math.PI, 2 * Math.PI, 24);

    // 4. Bottom Half-Circle
    createArc(0, WALL_LENGTH / 2, TABLE_RADIUS, 0, Math.PI, 24);

    Matter.Composite.add(world, bounds);
}
