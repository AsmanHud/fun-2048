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

- `src/main.js` — entry point, game loop, merging logic
- `src/physics.js` — Matter.js world, bodies, arena boundary
- `src/visuals.js` — Three.js scene, rendering
- `src/config.js` — central physics/visual tuning parameters (some exposed via lil-gui dashboard)
- `public/` — static assets

## Linting & formatting

[Biome](https://biomejs.dev/) handles linting and formatting, configured in `biome.json`.

```
npm run lint      # lint only
npm run format    # format (writes changes)
npm run check     # lint + format + import sorting
npm run wcheck    # lint + format + import sorting (write)
```

## Conventions

- Use Biome for formatting, linting, and import organization. Run `npm run check` before completing a change; use `npm run wcheck` to apply its fixes.
- Follow the configured Biome style: tabs for indentation and double quotes in JavaScript. Do not manually reorder imports.
- Important physics constants belong in `src/config.js`, not hardcoded inline, so they stay tunable via the lil-gui dashboard.
- No test suite currently exists; verify changes by running `npm run dev` and playing the game.
