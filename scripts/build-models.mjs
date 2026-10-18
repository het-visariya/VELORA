#!/usr/bin/env node
/**
 * Turn the raw Blender exports in assets-src/ into web-ready GLBs in
 * backend/public/models/, which backend/src/app.js already serves at /models.
 *
 * Why this exists: the source files are 15.0 MB and 12.2 MB, and essentially
 * all of that is one 4096x4096 PNG each (13.6 MB and 11.0 MB of buffer). The
 * geometry is only ~36k vertices, so compressing geometry would buy almost
 * nothing while costing a MeshoptDecoder wiring step in the viewer and risking
 * visible quantization wobble under the vertex deformation in phase B3.
 * Textures are therefore the only thing compressed here.
 *
 * Each source produces two variants: a 2048 one for desktop and a 1024 one for
 * phones, chosen at runtime.
 *
 * Run with: npm run build:models
 */

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { NodeIO, Logger } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRMaterialsSpecular } from '@gltf-transform/extensions';
import {
  dedup,
  prune,
  textureCompress,
  flatten,
  join,
  clearNodeParent,
  clearNodeTransform,
} from '@gltf-transform/functions';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'assets-src');
const OUT_DIR = path.join(ROOT, 'backend', 'public', 'models');

/** Each source model, and the variants to emit for it. */
const MODELS = [
  { source: 'boy3D.glb', out: 'boy' },
  { source: 'girl3D.glb', out: 'girl' },
];

const VARIANTS = [
  { suffix: '', textureSize: 2048 },
  { suffix: '-1k', textureSize: 1024 },
];

/** Fail the build if a variant lands above this; the budget is ~3 MB. */
const MAX_BYTES = 3 * 1024 * 1024;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
io.setLogger(new Logger(Logger.Verbosity.WARN));

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

/**
 * Bake every node transform into mesh data.
 *
 * The Blender exporter leaves the Z-up -> Y-up correction as a +90 degrees X
 * rotation on the root node rather than in the vertices, so in local space the
 * model's height runs along -Z and local Y is its depth. Any shader that bands
 * the body by height needs `position.y` to actually be height.
 *
 * flatten() and join() alone do NOT do this: flatten() hoists nodes and bakes
 * PARENT transforms, and join() bakes node transforms only where it has
 * several meshes to merge. These models are a single mesh on a single rotated
 * node, so both leave the rotation exactly where it was. clearNodeTransform()
 * is the function that pushes a node's own TRS into its mesh data.
 *
 * The viewer bakes matrixWorld at load time too, which makes this idempotent -
 * it applies an identity matrix once the file is already Y-up.
 */
async function bakeTransforms(document) {
  await document.transform(flatten(), join());
  for (const node of document.getRoot().listNodes()) {
    if (!node.getMesh()) continue;
    clearNodeParent(node);
    clearNodeTransform(node);
  }
}

/**
 * Drop KHR_materials_specular.
 *
 * Both materials declare it with metallicFactor 0, so it changes nothing
 * visually. It matters because three.js's GLTFLoader upgrades any material
 * carrying this extension to MeshPhysicalMaterial, a materially more expensive
 * shader than the MeshStandardMaterial we actually need for the B3 deformation.
 */
function stripSpecular(document) {
  let removed = 0;
  for (const material of document.getRoot().listMaterials()) {
    const ext = material.getExtension('KHR_materials_specular');
    if (ext) {
      material.setExtension('KHR_materials_specular', null);
      removed += 1;
    }
  }
  for (const ext of document.getRoot().listExtensionsUsed()) {
    if (ext instanceof KHRMaterialsSpecular) ext.dispose();
  }
  return removed;
}

/**
 * Turn off double-sided rendering, which halves the fragment work.
 *
 * Both source materials set it. If the models turn out to have one-sided
 * geometry anywhere it will show as holes, in which case set KEEP_DOUBLE_SIDED=1
 * and re-run.
 */
function setSingleSided(document) {
  if (process.env.KEEP_DOUBLE_SIDED === '1') return 0;
  let changed = 0;
  for (const material of document.getRoot().listMaterials()) {
    if (material.getDoubleSided()) {
      material.setDoubleSided(false);
      changed += 1;
    }
  }
  return changed;
}

/** Report the model's dimensions after baking, as a check against the plan. */
function describeGeometry(document) {
  const meshes = document.getRoot().listMeshes();
  let vertices = 0;
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];

  for (const mesh of meshes) {
    for (const prim of mesh.listPrimitives()) {
      const position = prim.getAttribute('POSITION');
      if (!position) continue;
      vertices += position.getCount();
      for (let axis = 0; axis < 3; axis++) {
        min[axis] = Math.min(min[axis], position.getMin([])[axis]);
        max[axis] = Math.max(max[axis], position.getMax([])[axis]);
      }
    }
  }

  return {
    meshes: meshes.length,
    vertices,
    size: max.map((v, i) => +(v - min[i]).toFixed(4)),
    min: min.map((v) => +v.toFixed(4)),
    max: max.map((v) => +v.toFixed(4)),
  };
}

async function buildVariant(sourceBytes, { out, suffix, textureSize }) {
  const document = await io.readBinary(sourceBytes);

  await bakeTransforms(document);
  const specularRemoved = stripSpecular(document);
  const sidedChanged = setSingleSided(document);

  await document.transform(
    dedup(),
    // WebP at 2048/1024. `resize` only shrinks when the source is larger.
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
      resize: [textureSize, textureSize],
      resizeFilter: 'lanczos3',
      quality: 90,
    }),
    // Runs last: removes anything the steps above orphaned.
    prune({ keepAttributes: false, keepLeaves: false }),
  );

  const geometry = describeGeometry(document);
  const textures = document.getRoot().listTextures().map((t) => ({
    mimeType: t.getMimeType(),
    size: t.getSize(),
    bytes: t.getImage()?.byteLength ?? 0,
  }));

  const bytes = await io.writeBinary(document);
  const name = `${out}${suffix}.glb`;
  await writeFile(path.join(OUT_DIR, name), bytes);

  return { name, bytes: bytes.byteLength, geometry, textures, specularRemoved, sidedChanged };
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.error(`No ${path.relative(ROOT, SRC_DIR)}/ directory.`);
    console.error('Put boy3D.glb and girl3D.glb there (they are git-ignored) and re-run.');
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const missing = [];
  for (const { source } of MODELS) {
    if (!existsSync(path.join(SRC_DIR, source))) missing.push(source);
  }
  if (missing.length) {
    console.error(`Missing source model(s) in assets-src/: ${missing.join(', ')}`);
    process.exit(1);
  }

  const results = [];
  let oversize = 0;

  for (const model of MODELS) {
    const sourcePath = path.join(SRC_DIR, model.source);
    const sourceBytes = new Uint8Array(await readFile(sourcePath));
    const sourceSize = (await stat(sourcePath)).size;

    console.log(`\n${model.source}  ${mb(sourceSize)}`);

    for (const variant of VARIANTS) {
      const result = await buildVariant(sourceBytes, { ...model, ...variant });
      const ratio = ((1 - result.bytes / sourceSize) * 100).toFixed(1);
      const over = result.bytes > MAX_BYTES;
      if (over) oversize += 1;

      console.log(
        `  -> ${result.name.padEnd(12)} ${mb(result.bytes).padStart(9)}  ` +
        `(-${ratio}%)  ${over ? 'OVER BUDGET' : 'ok'}`,
      );
      console.log(
        `     geometry: ${result.geometry.vertices} verts, ` +
        `size ${result.geometry.size.join(' x ')} (w x h x d), ` +
        `feet y=${result.geometry.min[1]}, head y=${result.geometry.max[1]}`,
      );
      for (const texture of result.textures) {
        console.log(
          `     texture:  ${texture.size?.join('x') ?? '?'} ${texture.mimeType} ${mb(texture.bytes)}`,
        );
      }
      results.push(result);
    }
  }

  console.log(`\nWrote ${results.length} files to ${path.relative(ROOT, OUT_DIR)}/`);

  if (oversize > 0) {
    console.error(`\n${oversize} file(s) exceed the ${mb(MAX_BYTES)} budget.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nModel build failed:', err.message);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
