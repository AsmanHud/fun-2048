# fun-2048-mvp

A physics-based 2048-style puzzle sandbox. Cylinders slide and collide inside
a zero-gravity pill-shaped arena; matching tiers merge into the next tier on
collision. Built with [Three.js](https://threejs.org/) for rendering and
[Matter.js](https://brm.io/matter-js/) for physics.

**Status: early access / playtest build.** The core physics and merge loop
are solid, but this is intentionally an early, unfinished cut — see
[Known limitations](#known-limitations) below before reporting something as
a bug.

## How to play

- Move your mouse to slide the active cylinder left/right along the baseline.
- Click to launch it up into the arena.
- Cylinders of the same tier merge into the next tier when they collide.
- The ticket in the corner shows the current contract — merge cylinders into
  the requested tier to fulfill it and clear space on the board.

## Known limitations

This is an early-access build, not a finished game:

- **No fail state.** There's no way to lose yet; the board never resets.
- **No scoring or currency.** Fulfilling a contract clears it but doesn't
  track any score.
- **Flat spawn/progression curve.** All 10 tiers exist, but the player's
  spawn cylinder is always tier 0 and contract targets are picked with flat
  random odds — no weighted/late-game-aware spawner yet.
- **Desktop only.** Mouse input only — no touch/mobile support.
- **Contracts system is still a work in progress** and may change shape.

Feedback on what's fun (or isn't) is exactly what this build is for.

## Development

```bash
npm install
npm run dev       # start dev server
npm run build     # production build (outputs to dist/)
npm run preview   # preview the production build locally
```

Linting/formatting is handled by [Biome](https://biomejs.dev/):

```bash
npm run check     # lint + format + import sorting (check only)
npm run wcheck    # same, but writes fixes
```

See [AGENTS.md](./AGENTS.md) for project layout and conventions.

## Releasing to itch.io

See [RELEASE.md](./RELEASE.md) for packaging and upload steps.

## License

All rights reserved — see [LICENSE](./LICENSE). Game mechanics themselves
aren't covered by copyright; this license covers this specific
implementation only.
