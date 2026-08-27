# AGENTS.md

A physics-based 2048-style game built with Three.js (rendering) and Matter.js (physics).

## Setup

```
npm install
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview production build
```

## Project layout

- `src/main.js` — entry point, game loop
- `src/physics.js` — Matter.js world, bodies, merging logic
- `src/visuals.js` — Three.js scene, rendering
- `src/config.js` — central physics/visual tuning parameters (some exposed via lil-gui dashboard)
- `public/` — static assets

## Linting & formatting

[Biome](https://biomejs.dev/) handles linting and formatting, configured in `biome.json`.

```
npm run lint     # lint only
npm run format   # format (writes changes)
npm run check    # lint + format + import sorting
```

## Conventions

- Important physics constants belong in `src/config.js`, not hardcoded inline, so they stay tunable via the lil-gui dashboard.
- No test suite currently exists; verify changes by running `npm run dev` and playing the game.
