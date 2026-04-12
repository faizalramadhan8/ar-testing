# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HTTPS + LAN host (required for WebXR/camera on mobile). Accept the self-signed cert when opening from a phone.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve the built `dist/` over HTTPS.

There is no test runner, linter, or formatter configured. Don't invent one.

## Architecture

**Pemburu Hantu** — a GPS-based ghost hunting AR game (Pokemon Go style) with Indonesian folklore ghosts. Vanilla JS + Three.js, no framework. All UI markup and CSS lives inline in `index.html`; runtime logic is modularized under `src/`.

### App flow

```
Loading → Hunt Screen (ghost list + GPS) → AR Battle (shoot ghost) → Capture → Collection
```

### Core modules

1. **`src/main.js` — `App`**: DOM controller. Manages screen transitions (hunt → battle → capture → collection), wires GPS location, collection persistence, and battle mechanics. Press backtick (`` ` ``) to toggle dev mode (unlocks all ghosts without GPS).

2. **`src/ARScene.js` — `ARScene`**: Three.js + WebXR host. Two modes:
   - **XR mode**: `immersive-ar` session with `dom-overlay`. Ghost spawns 2m in front of camera.
   - **Fallback mode**: camera via `getUserMedia` or dark gradient background. Ghost spawns at origin.
   - Exposes `shoot()` which raycasts from screen center → ghost, and `captureGhost(callback)` for the capture animation.

3. **`src/GhostModel.js` — `GhostModel`**: Per-ghost 3D model. Tries GLB from `modelUrls` (only kuntilanak has one at `/models/kuntilanak.glb`), otherwise procedural generation per ghost type (`buildPocong()`, `buildTuyul()`, etc.). Features ghostly floating, dodge AI (frequency = difficulty), `takeDamage()`, `playHitAnimation()`, `playCaptureAnimation()`, and `isHit(raycaster)`.

4. **`src/ghosts.js`**: Data for 6 Indonesian ghosts. Each entry: `id`, `name`, `description`, `lore`, `rarity`, `hp`, `difficulty`, `colors`, `gradient`, `icon` (inline SVG), `spawnPoints` (GPS coords), `sounds` (appear/hit/captured).

5. **`src/LocationManager.js`**: Geolocation API wrapper. Haversine distance calculation, `isInRange(ghostLocation, radius)`, position watching.

6. **`src/HuntMap.js`**: Renders the ghost list UI on the hunt screen. Shows distance, rarity badge, "Buru!" button for in-range ghosts, "Ditangkap" badge for captured ones. Has `enableDevMode()` to bypass GPS.

7. **`src/Collection.js`**: localStorage persistence (`ghosthunter_collection` key). Tracks which ghosts are captured with timestamps.

### Adding a new ghost

1. Add entry in `src/ghosts.js` with all required fields
2. Optionally add a `build<Name>()` method in `GhostModel.js` for procedural model
3. Optionally add a GLB to `public/models/` and map it in `GhostModel.modelUrls`
4. Add GPS spawn coordinates to `spawnPoints`

### WebXR / HTTPS

- WebXR and `getUserMedia` both require a secure context — `vite.config.js` forces `server.https: true` and `host: true`. Do not disable HTTPS.
- The `dom-overlay` feature lets the battle HUD (crosshair, HP bar, shoot button) render on top of the XR view.
- Dev mode (backtick key) bypasses GPS requirement for local testing.
