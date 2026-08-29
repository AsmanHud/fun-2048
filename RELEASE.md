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

## Automated deploys with Butler

itch.io's CLI, [`butler`](https://itch.io/docs/butler/), can push builds
directly without manual zipping/uploading.

### One-time setup

```bash
# Install (Linux example; see butler docs for macOS/Windows)
curl -sL -o butler.zip https://broth.itch.zone/butler/linux-amd64/LATEST/archive/default
unzip -o butler.zip -d ~/bin && chmod +x ~/bin/butler

# Authenticate (opens a browser login, stores credentials locally)
butler login
```

### Push a build

```bash
npm run deploy
```

This runs `scripts/deploy.sh`, which refuses to deploy unless you're on
`main`, the working tree is clean, and local `main` is fully in sync with
`origin/main` — so you can't accidentally ship a branch, WIP changes, or
stale local commits. Once those checks pass it runs `vite build` then
`butler push dist asmanhud/fun-2048:web`, uploading the contents of
`dist/` as the `web` channel. Butler diffs against the previous build and
only uploads changed data, and itch.io keeps a version history of every
push automatically.

### CI automation (manual trigger)

`.github/workflows/deploy.yml` builds and pushes to itch.io, but only
runs when manually triggered — nothing deploys automatically on push, so
there's no risk of an in-progress commit going live.

One-time setup:

1. Get an API key from https://itch.io/user/settings/api-keys.
2. Add it as a repo secret named `BUTLER_API_KEY` (Settings → Secrets and
   variables → Actions → New repository secret).

To deploy: go to the repo's Actions tab → "Deploy to itch.io" → "Run
workflow", or via CLI:

```bash
gh workflow run deploy.yml
```
