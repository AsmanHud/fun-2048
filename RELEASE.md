# Releasing to itch.io

This project builds to a static bundle that itch.io can host directly as an
HTML5 game.

## 1. Build

```bash
npm ci
npm run build
```

This produces `dist/`, containing `index.html` plus a `dist/assets/`
folder. The build uses relative asset paths (`base: "./"` in
`vite.config.js`), which itch.io requires since it can serve games from a
non-root subpath.

## 2. Package

Zip the **contents** of `dist/` (not the `dist` folder itself — `index.html`
must be at the root of the zip):

```bash
cd dist && zip -r ../fun-2048-mvp-web.zip . && cd ..
```

## 3. Upload

1. On itch.io, create a new project (or edit the existing one).
2. Set the **kind of project** to "HTML".
3. Upload `fun-2048-mvp-web.zip` and check "This file will be played in the
   browser".
4. Set `index.html` as the embed file if prompted.
5. Set the embed size to match the game's window (it's a fixed top-down
   view — no responsive layout yet, so pick a size close to your dev
   resolution and leave "automatically fit" off unless you've tested it).
6. Set visibility (draft / restricted / public) depending on how wide a
   playtest audience you want for this build.

## Local smoke test before uploading

```bash
npm run build
npm run preview
```

Open the printed local URL and confirm the game loads and plays with no
console errors — this is the closest local approximation to how itch.io
will serve it.

## Future: automated deploys

itch.io provides a CLI, [`butler`](https://itch.io/docs/butler/), for
scripted uploads (`butler push dist <user>/<game>:web`). This isn't wired
into CI yet since it needs an itch.io API key as a secret — worth adding
once releases become frequent enough to justify it.
