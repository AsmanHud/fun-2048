export const GameConfig = {
	// --- Arena Dimensions ---
	tableWidth: 400,
	wallLength: 400,

	// --- Physics & Game Feel ---
	launchVelocityY: -25, // Initial upward shooting force
	cylinderRestitution: 0.1, // Bounciness (0 = thud, 1 = super bounce)
	cylinderFrictionAir: 0.03, // Table drag (0 = ice, higher = sticky table)
	densityMultiplier: 0.001, // Base weight of the cylinders
	velocityThresholdSnapToZero: 0.05,

	// --- Contracts ---
	// Lowest tier index that can be requested as a contract target. Keeps
	// contracts focused on tiers the player has to work to build, instead of
	// ones produced by the first couple of merges.
	minContractTier: 5,

	// --- Spawning ---
	// Relative odds for which tier the player's next cylinder will be.
	// Index i is the weight for tier i; must cover exactly the tiers below
	// minContractTier (no overlap with contract-eligible tiers). Weighted
	// toward the lowest tier, same shape as classic 2048's "mostly 2,
	// sometimes 4" — not reactive to board state, just a fixed distribution.
	spawnWeights: [40, 25, 15, 12, 8],

	// --- Tiers ---
	tiers: [
		{ radius: 15, height: 20, color: 0xff4d4d, mass: 1 },
		{ radius: 18, height: 23, color: 0xffa64d, mass: 1.2 },
		{ radius: 21, height: 26, color: 0xffff4d, mass: 1.4 },
		{ radius: 24, height: 29, color: 0x4dff4d, mass: 1.6 },
		{ radius: 27, height: 32, color: 0x4d4dff, mass: 1.8 },
		{ radius: 30, height: 35, color: 0xa64dff, mass: 2.0 },
		{ radius: 33, height: 38, color: 0xff4dcf, mass: 2.2 },
		{ radius: 36, height: 41, color: 0x4dfff2, mass: 2.4 },
		{ radius: 39, height: 44, color: 0xffd700, mass: 2.6 },
		{ radius: 42, height: 47, color: 0x1a1a1a, mass: 2.8 },
	],
};

// Derived values (Calculated automatically so you don't have to manually update them)
GameConfig.tableRadius = GameConfig.tableWidth / 2;
GameConfig.baselineY = GameConfig.wallLength / 2;
