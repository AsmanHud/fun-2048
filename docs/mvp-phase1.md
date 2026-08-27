## **Project Concept & Technical Architecture**

We are building a highly tactile, physics-based merge puzzle game focused on spatial management. The visual aesthetic aims for premium 3D depth, while the underlying mathematical logic relies on lightning-fast 2D physics to ensure a predictable, snappy arcade feel.

* **Render Engine:** Three.js (handling 3D cylinders, lighting, and downward-angled camera perspective).
* **Physics Engine:** Matter.js (running invisibly to calculate 2D top-down planar collisions).
* **Aesthetic (Phase 1):** Minimalist. No UI, no wobbly liquid physics, and no dynamic internal contents. Pure geometric shapes and satisfying interactions.

---

## **Phase 1 MVP: Core Gameplay & The Arena**

The physical play space and how the objects move within it are the primary focus of this initial build.

* **The Arena Shape:** A vertically elongated pill (a rectangle capped with top and bottom half-circles) fully visible on screen.
* **The Launch Zone:** A horizontal baseline placed exactly where the bottom half-circle ends and the straight walls begin. This maximizes horizontal aiming space while keeping the launch point as low as possible.
* **Phase 1 Spawning:** The player will only ever spawn the absolute smallest, base-tier cylinder.
* **Kinetic Force:** Objects are launched with high velocity, ensuring they can easily reach the apex of the board.
* **The Wall-Glide Effect:** Because of the high launch velocity and the pill-shaped arena, cylinders launched from the extreme left or right edges will satisfyingly glide along the curvature of the top half-circle.
* **The Merge Mechanic:** Cylinders of identical tiers merge instantly upon collision, spawning the next tier up at the midpoint of impact.

---

## **Managing Spatial Tension & Overflow**

Because the board fills up rapidly when objects merge and expand, we must implement dual layers of space management to prevent physics glitches and establish a fail-state.

* **The Zenith Pop (Soft Clear):** To naturally reward progression and clear space, hitting the maximum tier (e.g., Tier 8) results in a "pop," destroying the object entirely.
* **The Foul Line (Hard Reset):** Because the Zenith Pop cannot save a player who plays poorly, a strict foul line sits slightly above the launch baseline. If a resting cylinder crosses this line and blocks the spawn zone, it triggers an immediate board reset.
