# VELORA — Integration Fixes + 3D Try-On Implementation Plan

## Context

> **Revision 2 — 2026-10-18.** Rewritten against the actual repo. The previous version of this file was written without repo access: its Part A is a generic checklist, and its Part B makes four stack assumptions that are wrong for this repo. The 3D model table in it, however, is accurate — I re-verified it by parsing both GLB JSON chunks.

The repo is a Vite + React 19 SPA (`Frontend/`) and an Express 4 + raw-`pg` API (`backend/`). Both apps run, but the try-on feature is a "Coming Soon" mock and the two halves are only loosely connected. The real integration defect is not CORS or base URLs — it is that **`AuthContext` derives login state from `localStorage.velora_authenticated`, never from the JWT in `velora_token`**. The UI shows you as signed in while every data loader bails on `if (!localStorage.getItem('velora_token')) return;`, producing silent empty states. On top of that, `Frontend/vite.config.js` does not exist at all, so `@vitejs/plugin-react` is installed but never registered (no Fast Refresh, no dev proxy).

Outcome: both apps run from one command with auth that tells the truth, and the try-on page renders a real, measurement-deformable 3D body.


---

## What the audit actually found

Replaces Part A's hypothetical checklist. Verified, not guessed.

### P0 — blocks safe work

| # | Finding | Evidence |
|---|---|---|
| 1 | **`.gitignore` is deleted from the working tree** but still tracked. Git therefore applies no ignore rules: `node_modules/` (10.7k files) and both `.env` files show as untracked. A single `git add -A` commits secrets and dependencies. | `git ls-files -d` |
| 2 | **No `Frontend/vite.config.js` exists.** `@vitejs/plugin-react` is a dependency but never registered; no `server.proxy`, so every call is cross-origin. | file absent repo-wide |
| 3 | **`AuthContext` ignores the JWT.** `isAuthenticated` comes from `velora_authenticated === 'true'`; `login(name, email)` takes no token. Loaders gate on `velora_token` separately. | `src/context/AuthContext.jsx:12`, `App.jsx:72,82`, `hooks/useCloset.js:26` |
| 4 | Also deleted-but-tracked: `README.md`, `LICENSE`, `.github/workflows/ci.yml`, both `.env.example`s, two prompt docs. CI is gone. | `git ls-files -d` |

**Cleared:** no `.env` and no `node_modules` exists in any pushed commit — `a9ae072`, `b08e55e`, `601b3b2` hold 81–83 files each. Earlier `--all` hits came from local `refs/sessions/*` checkpoints only. **No secret leak; no history rewrite needed.**

### P1 — correctness

5. **No `/api` prefix anywhere.** Backend mounts `/auth`, `/closet`, `/outfits`, `/planner`, `/profile`, `/ai`, `/tryon` at the root (`src/app.js`). The old plan's `POST /api/measurements` would 404. Frontend paths already match.
6. **`backend/public/models/` is empty**, so the already-configured `/models` static mount (`app.js:48`, permissive CORS + preflight at `:59`) 404s. The four model files sit untracked at the repo root (71 MB total).
7. **`ModelViewer.jsx` is dead code with two real bugs**: `mixer` is never declared (implicit global → throws under ESM strict mode) and `fbxLoaded` is read at `:190` but assigned at `:123`. It is also imported by nothing and uses `FBXLoader`.
8. **`Frontend/package.json` pins `react`, `react-dom`, `vite`, `@vitejs/plugin-react` to `"latest"`** — currently resolved to React 19.2.6 / Vite 8.0.13. Non-reproducible installs.
9. `FRONTEND_URL` is referenced by the CORS allow-list but absent from `backend/.env` → production CORS allows nothing but same-origin.
10. `error.middleware.js` passes `err.code` through verbatim, leaking raw Postgres SQLSTATE codes (e.g. `23505`) to clients.
11. No `/health` endpoint; no tests anywhere; `express-validator`, `openai`, `@google/generative-ai`, `uuid` are declared but never imported; `upload.middleware.js` and `image.service.js` are dead code.
12. `client.js` has no 401 handling — an expired token yields a thrown error and a blank page, never a logout.
13. `slotForCategory` (`TryOnPage.jsx:15-21`) maps `'accessor'` **and** `'shoe'` to `Footwear`, so bags and jewellery land on the feet slot.
14. Dead-but-ready seams to wire up, not rebuild: `getModelUrls()` → `GET /tryon/models`, `getLatestSession()`, and all of `profile.api.js` (ProfilePage is localStorage-only).

### Noted, out of scope
Google/Apple "OAuth" is not OAuth — it emails a 6-digit code held in an in-process `Map` (lost on restart, not multi-instance safe) and returns the code to the client as `debugCode` when SMTP is unconfigured. Flag in the audit doc; do not fix here.

---

## Verified model facts

Both GLBs re-parsed directly. The old plan's table is correct, plus three details it missed that change the implementation:

| | boy3D.glb | girl3D.glb |
|---|---|---|
| Size / texture | 15.02 MB / PNG 13.64 MB | 12.25 MB / PNG 11.00 MB |
| Verts / tris | 35,955 / 49,988 | 31,328 / 50,000 |
| skins / animations / morph targets | **0 / 0 / 0** | **0 / 0 / 0** |
| Attributes | `POSITION+NORMAL+TEXCOORD_0` only | same |
| Raw local bounds (Z-up) | x ±0.24, y ±0.15, **z −1.1634 → 0** | x ±0.21, y ±0.16, **z −1.1792 → 0** |
| Root node | 1 node, quat `(0.7071,0,0,0.7071)` = +90° X | same |
| Material | `doubleSided: true`, metallic 0, `KHR_materials_specular` | same |

**The three consequences the old plan got wrong:**

1. **Height is `-position.z` in local space, not `position.y`.** The +90° X rotation lives on the *node*, not baked into vertices: it maps `(x,y,z) → (x,−z,y)`. The old plan's `t = y / H0` would band the model across its **depth** (±0.15) instead of its height. Fix: bake `matrixWorld` into the geometry at load (`geometry.applyMatrix4(...)`, then reset the node transform) *before* any shader work.
2. **`KHR_materials_specular` makes GLTFLoader produce a `MeshPhysicalMaterial`**, not the `MeshStandardMaterial` the old plan names. `onBeforeCompile` still works (it subclasses Standard), but since `metallicFactor` is 0 the extension buys nothing — strip it at build time to get the cheaper shader.
3. **Skip `--compress meshopt`.** Geometry is only ~1.3 MB; the texture is 100% of the problem. Meshopt would add a required `MeshoptDecoder` wiring step and the quantization-wobble risk the old plan itself worried about, for almost no gain.

---

## Part A — Integration fixes

Branch `fix/integration`, one commit per numbered item.

**A1. Restore `.gitignore` first, before anything else.** `git checkout HEAD -- .gitignore` then `git status` must show `node_modules/` and `.env` gone from untracked. Then restore the other deleted-but-tracked files (`README.md`, `LICENSE`, `.github/workflows/ci.yml`) unless they were deleted deliberately — ask before restoring the two prompt docs.

Amend the restored `.gitignore`: its blanket `*.png` / `*.jpg` rules would swallow any texture or screenshot asset, and add `assets-src/`.

**A2. Create `Frontend/vite.config.js`** — register `react()`, pin `server.port: 5173`, and proxy every backend mount to `http://localhost:5000`:

```js
server: { port: 5173, proxy: Object.fromEntries(
  ['/auth','/closet','/outfits','/planner','/profile','/ai','/tryon','/models']
    .map(p => [p, { target: 'http://localhost:5000', changeOrigin: true }])) }
```

Then set `VITE_API_URL=` (empty) in `Frontend/.env` — `client.js:1` already falls back to `''`, so paths become relative and **CORS disappears in dev entirely**.

**A3. Make the token the single source of truth** (`src/context/AuthContext.jsx`). `isAuthenticated` ⇐ a valid non-expired `velora_token` (decode the `exp` claim; no new dep needed). `login()` takes the token. Drop the `velora_authenticated` key. Then delete the scattered `if (!localStorage.getItem('velora_token')) return;` guards in `App.jsx:72,82` and `useCloset.js:26` — they become dead once auth state is honest.

**A4. 401 → logout in `client.js`.** On `res.status === 401`, clear storage, call the context's `logout()`, open the sign-in modal.

**A5. Hygiene.** Write `Frontend/.env.example` (`VITE_API_URL`) and `backend/.env.example` (all 23 referenced vars, names only, no values). Add `FRONTEND_URL` to `backend/.env`. Pin the four `"latest"` deps in `Frontend/package.json` to their installed versions (react 19.2.6, react-dom 19.2.6, vite 8.0.13, @vitejs/plugin-react 6.0.1). Add `GET /health` returning `{ success: true, data: { db: 'up' } }` after a `SELECT 1`. Stop `error.middleware.js` forwarding `err.code` when it is a 5-digit Postgres SQLSTATE. Add root `package.json` with `concurrently` so `npm run dev` starts both.

**A6.** `docs/INTEGRATION_AUDIT.md` — the findings table above, with each item's fix and commit hash.

**Part A is done when:** register → sign in → closet/planner/outfits all populate (not blank) → refresh keeps you signed in → letting the token expire drops you to the sign-in modal rather than a blank page.

---

## Part B — 3D Try-On

### B1. Asset pipeline

Move the four root model files to `assets-src/` (git-ignored). Add `scripts/build-models.mjs`, wired as `npm run build:models`:

```bash
npx @gltf-transform/cli optimize assets-src/boy3D.glb backend/public/models/boy.glb \
  --texture-compress webp --texture-size 2048 --no-compress
# repeat: girl.glb; then boy-1k.glb / girl-1k.glb at --texture-size 1024
```

Strip `KHR_materials_specular` and set `doubleSided: false` in the same pass (restore it only if holes appear). Expect **~2–3 MB each** (≈1 MB webp + ~1.3 MB geometry), down from 15 MB. The existing `.gitignore` already excludes `backend/public/models/*.glb`, so these are generated, never committed — `build:models` becomes a documented setup step.

Serve via the seam that already exists: have `GET /tryon/models` (`tryon.controller.js`) return `{ boy, girl, boy1k, girl1k }` absolute URLs, and call the already-written `getModelUrls()` from `TryOnPage`. Pick the 1k variant when `matchMedia('(max-width: 768px)')` or `navigator.hardwareConcurrency <= 4`.

### B2. Viewer — extend `ModelViewer.jsx`, don't rewrite

Keep its camera, `OrbitControls`, 7-light rig, stage, and dispose-on-unmount. Changes:

- `FBXLoader` → `GLTFLoader`. Delete the `AnimationMixer` block entirely — **both models have zero animations**, which also removes the undeclared-`mixer` bug (finding 7). Declare `fbxLoaded` properly or drop it with the placeholder cube.
- **Bake the transform at load:** `mesh.updateWorldMatrix(true,false); geo.applyMatrix4(mesh.matrixWorld); mesh.matrix.identity()` + reset position/quaternion/scale. Then `geo.computeBoundingBox()` → height `H_raw` ≈ 1.1634 (boy) / 1.1792 (girl), feet at y=0.
- **Normalize to metres:** apply a further uniform scale `s = REF_HEIGHT_M / H_raw` (≈1.504 boy at 175 cm, ≈1.399 girl at 165 cm) so 1 unit = 1 m and the camera rig and height targets are literal. Replaces the current hardcoded "auto-scale to 2.2 units".
- Set `mesh.frustumCulled = false`. **Required:** GPU-side deformation never updates the bounding sphere, so a stretched model pops out of view. (Old plan missed this.)
- Replace the `autoRotate` always-on loop with **render-on-demand**: render on `controls.change` and on an `invalidate()` from slider changes. Clamp `minPolarAngle`/`maxPolarAngle` to ~60–100°, `enablePan = false`, damping on.
- Keep the loading spinner and error overlay; add a WebGL-unsupported fallback and a `webglcontextlost` handler.
- Gender switch swaps the GLB and keeps current measurements. **Cache per gender and `clone()` the material per instance** — a cached material mutated by `onBeforeCompile` leaks uniform state across remounts.

Replace the fake viewport in `TryOnPage.jsx` (the blurred Unsplash + "Coming Soon" card, lines ~140–210) with `<ModelViewer/>`, and connect the orphaned `resetSignal` state (`:202`) that was already wired for it.

### B3. Measurement-driven deformation

**`src/three/measurementsToParams.js`** — pure, unit-tested: `(measurements, gender) → { heightScale, bands: [{widthScale, depthScale}], legStretch, torsoStretch }`. All outputs clamped to ±25%. Config constants (`REF_HEIGHT_CM` per gender, band boundaries, max stretch) in a sibling `bodyConfig.js`.

**`src/three/deformShader.js`** — patches the material via `onBeforeCompile`, with `customProgramCacheKey`. Bands over `t = position.y / H0` (valid only *after* B2's bake), blended with `smoothstep`:

| band | `t` range | behaviour |
|---|---|---|
| head/neck | > 0.84 | uniform scale only — never widen a head |
| shoulders/chest | 0.66–0.84 | width + depth |
| waist/torso | 0.50–0.66 | width + depth |
| hips | 0.42–0.52 | width + depth |
| legs | < 0.45 | vertical stretch |

Horizontal scale about the x=0/z=0 axis so the body stays centred; vertical as a piecewise-linear remap of `y` so total height hits target and feet stay at 0. Normals get the inverse-transpose of the diagonal scale — sufficient at ≤±25%, and there is no normal map to worry about (no `TANGENT` attribute). Lerp uniforms toward targets over ~150 ms rather than snapping; `invalidate()` each frame while lerping.

**Also patch the shadow pass.** `onBeforeCompile` on the main material does *not* affect the depth material, so the contact shadow would show an undeformed silhouette. Assign a `mesh.customDepthMaterial` (`MeshDepthMaterial`, `RGBADepthPacking`) carrying the same vertex patch and **sharing the same uniforms object**. (Old plan missed this.)

**Form (left panel).** Convert the existing text/number inputs to range sliders + numeric entry: height, weight, chest, waist, hip, shoulder, inseam. Keep `bodyStructure`/`skinTone`. Validate ranges, debounce 100–150 ms to the shader, autosave at ~800 ms, add "Reset", show units, keep it keyboard-accessible and respect `prefers-reduced-motion`.

Phase 3b (optional, later): real shape keys in Blender driven from the same `measurementsToParams`, with the shader kept as fallback.

### B4. Garments — explicitly out of scope
These assets contain no clothing meshes. The closet picker stays a 2D selection list. Revisit only after B1–B5 are stable.

### B5. Persistence

Migration `002_body_profile.sql` — one row per user, `user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE`, plus `gender, height_cm, weight, weight_unit, chest_cm, waist_cm, hip_cm, shoulder_cm, inseam_cm NUMERIC(5,1), updated_at`. `tryon_sessions` stays untouched as try-on history.

Add query fns to `src/models/index.js` (`getBodyProfile`, `upsertBodyProfile` via `INSERT … ON CONFLICT (user_id) DO UPDATE`), handlers in `tryon.controller.js`, and routes **`GET /tryon/profile`** + **`PUT /tryon/profile`** in `tryon.routes.js` — auth already applies at the `/tryon` mount in `app.js`, so no per-route middleware. Server-side range validation; return the project's standard `{ success, data }` envelope, with `{ success, message, code }` on error. Add `getBodyProfile`/`saveBodyProfile` to `src/api/tryon.api.js`.

On opening try-on: fetch the profile, hydrate the form, render. Loading / error / "saved" states.

### B6. Quality gates

- Deformation stays visually sane across 150–200 cm and ±25% circumference; head never distorts; feet never leave the floor; no jump when a slider moves.
- Steady 60 fps on a mid laptop, ≥30 fps on a mid phone; initial 3D load < 4 s throttled with warm cache.
- No memory growth after 20 boy/girl toggles (watch `renderer.info.memory`); no console errors.
- Unit tests for `measurementsToParams` (e.g. 160→190 cm ⇒ heightScale ≈ 1.19; every output clamped).

---

## Critical files

| Path | Change |
|---|---|
| `.gitignore` | restore from HEAD (**do this first**), drop blanket `*.png`/`*.jpg`, add `assets-src/` |
| `Frontend/vite.config.js` | **new** — register `react()`, proxy 8 paths to :5000 |
| `Frontend/src/context/AuthContext.jsx` | token becomes source of truth |
| `Frontend/src/api/client.js` | 401 → logout |
| `Frontend/src/components/ModelViewer.jsx` | GLTFLoader, bake transform, metre scale, `frustumCulled=false`, on-demand render, drop mixer |
| `Frontend/src/pages/TryOnPage.jsx` | real viewer replaces the mock; sliders; load/save profile; fix `slotForCategory` |
| `Frontend/src/three/{measurementsToParams,bodyConfig,deformShader}.js` | **new** |
| `backend/src/migrations/002_body_profile.sql` | **new** |
| `backend/src/{routes,controllers}/tryon.*` | `GET`/`PUT /tryon/profile`; populate `GET /tryon/models` |
| `backend/src/models/index.js` | `getBodyProfile`, `upsertBodyProfile` |
| `scripts/build-models.mjs`, root `package.json` | **new** — `build:models`, `dev` via concurrently |

## Verification

1. `git checkout HEAD -- .gitignore && git status` — no `node_modules/`, no `.env` listed.
2. `npm run build:models` — four GLBs in `backend/public/models/`, each < 3 MB.
3. `npm run dev` (root) — both apps up; `curl localhost:5000/health` → `{"success":true,...}`.
4. `npm run migrate` — `body_profiles` exists.
5. Register a new user → closet shows the 18 seeded items, planner and outfits load (**this is the Part A regression test**).
6. Open Try-On: a 3D body renders and orbits. Drag height 160→190: the body grows, head proportions hold, feet stay on the floor, the contact shadow follows.
7. Hit Save, hard-reload, reopen Try-On → sliders and model come back identical (round-trips `GET /tryon/profile`).
8. Switch boy↔girl 20×; `renderer.info.memory` flat, console clean.
9. `npm test` in `Frontend/` — `measurementsToParams` passes.
10. Hand-expire `velora_token` in devtools, reload → sign-in modal, not a blank page.

## Order

A1 → A2 → A3 → A4 → A5/A6 → B1 → B2 → B3 → B5 → B6. Stop and ask if a model's bounds differ from the verified table.
