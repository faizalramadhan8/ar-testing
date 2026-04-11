# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HTTPS + LAN host (required for WebXR/camera on mobile). Accept the self-signed cert when opening from a phone.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve the built `dist/` over HTTPS.

There is no test runner, linter, or formatter configured. Don't invent one.

## Architecture

A single-page WebXR experience (vanilla JS + Three.js, no framework). All UI markup and most CSS lives inline in [index.html](index.html); only runtime logic is modularized under [src/](src/).

Three classes form the entire runtime, wired top-down:

1. **[src/main.js](src/main.js) — `App`**: DOM controller. Owns UI state (loading → start screen → AR HUD), builds the creature selection grid from [src/creatures.js](src/creatures.js), tracks `creatureStats` (health/happiness), and dispatches Feed/Pet/Play actions into the AR scene. Does not touch Three.js directly — it talks to `ARScene` via callbacks (`onPlaced`, `onError`) and calls `arScene.creatureModel.play*Animation()` for interactions.

2. **[src/ARScene.js](src/ARScene.js) — `ARScene`**: Three.js + WebXR host. Has two modes decided at `init()` time:
   - **XR mode**: `navigator.xr.requestSession('immersive-ar')` with `hit-test` + `dom-overlay`. A reticle follows hit-test results; tap-to-place (`select` event) spawns the creature at the hit pose.
   - **Fallback mode** (`isFallbackMode = true`): used when WebXR is unsupported or the session fails. Tries `getUserMedia({ facingMode: 'environment' })` for a camera-backed video element behind a transparent renderer; if the camera is also unavailable, calls `addGradientBackground()` for a pure 3D viewer. Installs touch/mouse rotate + pinch/wheel zoom via `setupTouchControls()`, and places the creature immediately at origin.
   - `App.onARError` watches `arScene.isFallbackMode` to toggle the "fallback" mode banner — fallback is a normal code path, not a hard error.

3. **[src/CreatureModel.js](src/CreatureModel.js) — `CreatureModel`**: Per-creature visual. First tries to load a remote GLB/GLTF (URLs hardcoded in `modelUrls` per creature id, hosted on a Supabase public bucket); on any failure falls back to `buildProceduralCreature()` which assembles a stylized mesh from primitives. Exposes `playEatingAnimation()` / `playLoveAnimation()` / `playPlayAnimation()`, driven from `update(deltaTime)` which is ticked by `ARScene`'s render loop. `getObject()` returns the `THREE.Group` the scene adds.

### Creature data contract

[src/creatures.js](src/creatures.js) is the single source of truth for the 6 built-in creatures. Each entry must define `id`, `name`, `description`, `personality`, `colors` (primary/secondary/accent), `gradient` (CSS string used by the HUD/card avatars), `icon` (inline SVG string rendered into the card/HUD), and `sounds` with `happy`/`pet`/`feed` arrays that `App` picks from randomly for toast messages. Adding a creature requires (a) an entry here, (b) optionally a matching key in `CreatureModel.modelUrls` for a GLB, and (c) optionally a branch in `CreatureModel.addSpecialFeatures()` for creature-specific visual effects in the procedural path.

### WebXR / HTTPS gotchas

- WebXR and `getUserMedia` both require a secure context — that is why [vite.config.js](vite.config.js) forces `server.https: true` and `host: true`. Do not disable HTTPS even when debugging locally.
- iOS Safari needs 15+ for immersive AR; older iOS and desktop browsers intentionally land in fallback mode (see compatibility table in [README.md](README.md)).
- The `dom-overlay` feature lets the HTML HUD render on top of the XR view — the HUD elements (`#ar-hud`, toast, action buttons) are plain DOM that stay live during the XR session.
