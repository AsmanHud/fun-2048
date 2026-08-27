export const GameConfig = {
    // --- Arena Dimensions ---
    tableWidth: 400,
    wallLength: 400,

    // --- Physics & Game Feel ---
    launchVelocityY: -25,       // Initial upward shooting force
    cylinderRestitution: 0.1,   // Bounciness (0 = thud, 1 = super bounce)
    cylinderFrictionAir: 0.03,  // Table drag (0 = ice, higher = sticky table)
    densityMultiplier: 0.001,   // Base weight of the cylinders
    velocityThresholdSnapToZero: 0.5,

    // --- Tiers ---
    tiers: [
        { radius: 15, height: 20, color: 0xff4d4d, mass: 1 },
        { radius: 18, height: 23, color: 0xffa64d, mass: 1.2 },
        { radius: 21, height: 26, color: 0xffff4d, mass: 1.4 },
        { radius: 24, height: 29, color: 0x4dff4d, mass: 1.6 },
        { radius: 27, height: 32, color: 0x4d4dff, mass: 1.8 }
    ]
};

// Derived values (Calculated automatically so you don't have to manually update them)
GameConfig.tableRadius = GameConfig.tableWidth / 2;
GameConfig.baselineY = GameConfig.wallLength / 2;
