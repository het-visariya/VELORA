import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { profileForGender } from './bodyConfig';

/**
 * Load one body GLB and put it in a state the viewer and the deformation
 * shader can rely on:
 *
 *   - node transforms baked into the vertices, so `position.y` is height
 *   - scaled so 1 unit = 1 metre and the mesh stands at its reference height
 *   - feet at y = 0, centred on the x = 0 / z = 0 axis
 *
 * The geometry is cached per URL and cloned per caller. The texture is shared,
 * because it is the expensive part and is never mutated; the material is
 * cloned, because the deformation patches it via onBeforeCompile and a shared
 * material would leak uniforms between viewer instances.
 */

/** url -> Promise<{ geometry, material }> */
const cache = new Map();

let loader = null;
function getLoader() {
  if (!loader) loader = new GLTFLoader();
  return loader;
}

/**
 * Collapse the loaded scene into a single geometry in world space.
 *
 * The build pipeline already bakes transforms, so this is normally applying an
 * identity matrix. It stays because it is cheap, it makes the function correct
 * for an un-baked file, and relying on the asset to be pre-baked is exactly the
 * assumption that made the original plan band the body across its depth.
 */
function extractBakedGeometry(gltf) {
  const meshes = [];
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((child) => {
    if (child.isMesh && child.geometry) meshes.push(child);
  });

  if (meshes.length === 0) {
    throw new Error('GLB contains no mesh');
  }
  if (meshes.length > 1) {
    // These assets are single-mesh. More would need merging, and silently
    // using only the first would drop part of the body.
    console.warn(`[velora] expected 1 mesh, found ${meshes.length}; using the first`);
  }

  const source = meshes[0];
  const geometry = source.geometry.clone();
  geometry.applyMatrix4(source.matrixWorld);

  // Normals need the inverse-transpose, not the matrix itself, or any
  // non-uniform scale in the node chain would skew the lighting.
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(source.matrixWorld);
  const normals = geometry.getAttribute('normal');
  if (normals) {
    const v = new THREE.Vector3();
    for (let i = 0; i < normals.count; i++) {
      v.fromBufferAttribute(normals, i).applyMatrix3(normalMatrix).normalize();
      normals.setXYZ(i, v.x, v.y, v.z);
    }
    normals.needsUpdate = true;
  }

  const material = Array.isArray(source.material) ? source.material[0] : source.material;
  return { geometry, material };
}

/**
 * Scale to metres and seat the model on the floor.
 *
 * Returns the metre height, which is the H0 the shader normalizes against.
 */
function normalizeToMetres(geometry, referenceHeightCm) {
  geometry.computeBoundingBox();
  const raw = geometry.boundingBox;
  const rawHeight = raw.max.y - raw.min.y;

  if (!(rawHeight > 0)) {
    throw new Error('Model has no height along Y - is the node transform baked?');
  }

  const targetHeightM = referenceHeightCm / 100;
  const scale = targetHeightM / rawHeight;

  // Centre on the vertical axis first, then scale, then drop the feet to y=0.
  // Horizontal scaling in the shader happens about x=0/z=0, so being centred
  // is what keeps a widened body from drifting sideways.
  const centreX = (raw.max.x + raw.min.x) / 2;
  const centreZ = (raw.max.z + raw.min.z) / 2;

  geometry.translate(-centreX, -raw.min.y, -centreZ);
  geometry.scale(scale, scale, scale);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return {
    height: geometry.boundingBox.max.y,
    scale,
    rawHeight,
  };
}

function loadInto(url) {
  return new Promise((resolve, reject) => {
    getLoader().load(
      url,
      (gltf) => {
        try {
          resolve(extractBakedGeometry(gltf));
        } catch (err) {
          reject(err);
        }
      },
      undefined,
      () => reject(new Error(`Could not load 3D model from ${url}`)),
    );
  });
}

/**
 * @returns {Promise<{ geometry, material, height, referenceHeightCm }>}
 *   `height` is in metres and is the model's full height after normalization.
 */
export async function loadBodyModel(url, gender) {
  if (!cache.has(url)) {
    cache.set(url, loadInto(url).catch((err) => {
      // A failed load must not poison the cache, or a retry can never succeed.
      cache.delete(url);
      throw err;
    }));
  }

  const { geometry: cachedGeometry, material: cachedMaterial } = await cache.get(url);
  const profile = profileForGender(gender);

  const geometry = cachedGeometry.clone();
  const { height } = normalizeToMetres(geometry, profile.referenceHeightCm);

  // Clone the material so onBeforeCompile patches and uniforms stay local to
  // this instance; the texture inside it is shared by reference, which is what
  // we want for a 2048 WebP.
  const material = cachedMaterial.clone();

  return { geometry, material, height, referenceHeightCm: profile.referenceHeightCm };
}

/** Free the cached geometry. For tests and hot-reload, not normal unmount. */
export function clearBodyModelCache() {
  for (const entry of cache.values()) {
    Promise.resolve(entry).then(({ geometry }) => geometry.dispose()).catch(() => {});
  }
  cache.clear();
}
