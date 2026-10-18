# Source 3D assets

Original, uncompressed model exports. **Everything in this directory is
git-ignored** (`assets-src/` in `.gitignore`) because it totals ~71 MB.

Expected contents:

| File | Size | Notes |
|---|---|---|
| `boy3D.glb` | 15.0 MB | Source for `boy.glb` / `boy-1k.glb` |
| `girl3D.glb` | 12.2 MB | Source for `girl.glb` / `girl-1k.glb` |
| `boy3D.fbx` | 23.2 MB | Blender round-trip source. Not used by the build. |
| `girl3D.fbx` | 20.1 MB | Blender round-trip source. Not used by the build. |

## Building the web assets

```
npm run build:models
```

Writes four optimized GLBs to `backend/public/models/` (also git-ignored),
which the backend serves at `/models`. Each lands around 1.3–1.7 MB, down from
15 MB, against a 3 MB budget the script enforces.

The script does three things that matter downstream:

1. **Bakes the node transform into the vertices.** The Blender exporter leaves
   the Z-up to Y-up correction as a +90° X rotation on the root node, so in the
   source files the model's height runs along `-Z` while local `Y` is its
   depth. The height-banded deformation shader needs `position.y` to be height.
   Note that `flatten()` and `join()` do **not** do this on a single-mesh model;
   `clearNodeTransform()` is what pushes a node's own TRS into mesh data.
2. **Compresses only textures**, to WebP at 2048 (and 1024 for the mobile
   variant). The texture is ~90% of the file; the geometry is just ~36k
   vertices, so compressing it would save little while costing a
   `MeshoptDecoder` wiring step and risking visible quantization wobble under
   vertex deformation.
3. **Strips `KHR_materials_specular`.** Harmless visually at `metallicFactor 0`,
   but three.js upgrades any material carrying it to `MeshPhysicalMaterial`, a
   more expensive shader than the `MeshStandardMaterial` the deformation needs.

It also sets `doubleSided: false` to halve fragment cost. If that reveals holes
in the mesh, re-run with `KEEP_DOUBLE_SIDED=1`.

## If you do not have these files

The models are not in the repository. Obtain them from the project owner and
place them here, then run the build. Until then `GET /tryon/models` returns
`503 MODELS_UNAVAILABLE` and the try-on page shows that message rather than a
blank canvas.
