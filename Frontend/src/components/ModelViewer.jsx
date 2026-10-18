import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { loadBodyModel } from '../three/loadBodyModel';

/**
 * Body viewer.
 *
 * Renders on demand rather than every frame: a still body on a still camera
 * costs nothing, which matters on a phone. Anything that changes the picture
 * calls invalidate().
 */

const BACKGROUND = 0x0a0a0a;
const GOLD = 0xc5a880;

/** Does this browser have a usable WebGL context at all? */
function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext
      && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

export default function ModelViewer({
  modelUrl,
  gender = 'male',
  resetSignal = 0,
  onReady,
  onError,
}) {
  const mountRef = useRef(null);
  const apiRef = useRef(null);

  // Held in refs and kept out of the effect's dependencies. A parent that
  // passes an inline arrow would otherwise change identity on every render and
  // tear down and rebuild the entire WebGL scene each time.
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supported] = useState(() => webglAvailable());

  useEffect(() => {
    if (!supported || !mountRef.current || !modelUrl) return undefined;

    const mount = mountRef.current;
    let disposed = false;

    setLoading(true);
    setError(null);

    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKGROUND);

    // Narrow-ish fov: a fashion figure at 35 degrees reads with much less
    // perspective distortion than the 45 the placeholder used.
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.05, 50);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(BACKGROUND, 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';

    // ---- lighting: the existing luxury rig, re-aimed for a floor at y=0 ----
    scene.add(new THREE.HemisphereLight(0xfff8ef, 0x2c241f, 1.1));
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.6);
    keyLight.position.set(1.6, 3.2, 2.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.camera.left = -1.5;
    keyLight.shadow.camera.right = 1.5;
    keyLight.shadow.camera.top = 2.6;
    keyLight.shadow.camera.bottom = -0.2;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(GOLD, 1.1);
    rimLight.position.set(-2.4, 1.8, -1.8);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(0, 1.8, -2.6);
    scene.add(fillLight);

    const frontLight = new THREE.PointLight(0xffffff, 2.2, 8);
    frontLight.position.set(0, 1.5, 2.2);
    scene.add(frontLight);

    // ---- floor, at the model's feet ----
    const stage = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 64),
      new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 1, metalness: 0 }),
    );
    stage.rotation.x = -Math.PI / 2;
    stage.position.y = 0;
    stage.receiveShadow = true;
    scene.add(stage);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    // Panning lets the user lose the model with no way back.
    controls.enablePan = false;
    controls.enableZoom = true;
    // Keep the camera near eye level: looking up from the floor or straight
    // down on the scalp are both unflattering and show the mesh's worst seams.
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 1.85;

    let animFrame = null;
    let needsRender = true;

    /** Ask for one more frame. */
    const invalidate = () => {
      needsRender = true;
    };

    controls.addEventListener('change', invalidate);

    // ---- model ----
    let body = null;

    const frameModel = (modelHeight) => {
      const target = new THREE.Vector3(0, modelHeight * 0.5, 0);
      // Distance that fits the full height in a 35 degree vertical fov, with
      // a little headroom.
      const fitDistance = (modelHeight * 0.5) / Math.tan((camera.fov * Math.PI) / 360);
      const distance = fitDistance * 1.25;

      camera.position.set(0, modelHeight * 0.58, distance);
      controls.target.copy(target);
      controls.minDistance = distance * 0.45;
      controls.maxDistance = distance * 2.2;
      controls.update();

      return { target, distance };
    };

    // A single object the component holds a reference to throughout. The load
    // below completes after this effect body has returned, so assigning a new
    // object there would silently drop resetView.
    const api = {
      invalidate,
      mesh: null,
      material: null,
      modelHeight: null,
      resetView: null,
    };
    apiRef.current = api;

    loadBodyModel(modelUrl, gender)
      .then(({ geometry, material, height: modelHeight }) => {
        if (disposed) {
          geometry.dispose();
          material.dispose();
          return;
        }

        material.side = THREE.FrontSide;

        body = new THREE.Mesh(geometry, material);
        body.castShadow = true;
        body.receiveShadow = false;
        // Required once the vertex shader moves vertices: three.js culls
        // against the ORIGINAL bounding sphere, which never learns about the
        // deformation, so a stretched body would pop out of view at the edges.
        body.frustumCulled = false;
        scene.add(body);

        frameModel(modelHeight);

        api.mesh = body;
        api.material = material;
        api.modelHeight = modelHeight;
        api.resetView = () => {
          frameModel(modelHeight);
          invalidate();
        };

        setLoading(false);
        invalidate();
        onReadyRef.current?.({ mesh: body, material, modelHeight, invalidate });
      })
      .catch((err) => {
        if (disposed) return;
        console.error('[velora] model load failed:', err);
        const message = 'Could not load the 3D model.';
        setError(message);
        setLoading(false);
        onErrorRef.current?.(err);
      });

    // ---- render loop: only works when something changed ----
    const tick = () => {
      animFrame = requestAnimationFrame(tick);

      // Damping eases the camera over several frames after input stops, so
      // keep rendering while it is still settling.
      const damping = controls.update();
      if (damping) needsRender = true;

      if (needsRender) {
        needsRender = false;
        renderer.render(scene, camera);
      }
    };
    tick();

    // ---- resize ----
    const resize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      invalidate();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    // ---- context loss ----
    const onContextLost = (event) => {
      event.preventDefault();
      cancelAnimationFrame(animFrame);
      setError('The 3D view lost its graphics context. Reload to try again.');
    };
    const onContextRestored = () => {
      setError(null);
      invalidate();
      tick();
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    return () => {
      disposed = true;
      cancelAnimationFrame(animFrame);
      observer.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.removeEventListener('change', invalidate);
      controls.dispose();

      if (body) {
        scene.remove(body);
        body.geometry.dispose();
        // Dispose only the maps this material owns. The source texture is
        // shared with the model cache by reference, so it is deliberately not
        // disposed here - the next mount reuses it.
        body.material.dispose();
        if (body.customDepthMaterial) body.customDepthMaterial.dispose();
      }

      stage.geometry.dispose();
      stage.material.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      apiRef.current = null;
    };
  }, [modelUrl, gender, supported]);

  // Reset View button.
  useEffect(() => {
    if (resetSignal === 0) return;
    apiRef.current?.resetView?.();
    apiRef.current?.invalidate?.();
  }, [resetSignal]);

  if (!supported) {
    return (
      <div style={overlayStyle}>
        <p style={{ fontSize: 12, color: '#bbb', textAlign: 'center', maxWidth: 280 }}>
          This browser cannot display the 3D preview because WebGL is unavailable.
          Try a different browser, or enable hardware acceleration.
        </p>
      </div>
    );
  }

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      {loading && !error && (
        <div style={overlayStyle}>
          <style>{'@keyframes velora-spin { to { transform: rotate(360deg); } }'}</style>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: '3px solid rgba(197,168,128,0.3)',
              borderTopColor: '#C5A880',
              animation: 'velora-spin 0.8s linear infinite',
            }}
          />
          <p style={labelStyle}>Loading 3D model</p>
        </div>
      )}
      {error && (
        <div style={{ ...overlayStyle, background: 'rgba(0,0,0,0.6)', zIndex: 20 }}>
          <p style={{ fontSize: 12, color: '#ff6b6b', marginBottom: 8, textAlign: 'center' }}>
            {error}
          </p>
          <p style={{ fontSize: 10, color: '#888' }}>
            If this persists, the models may not be built on the server.
          </p>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.35)',
  zIndex: 10,
  pointerEvents: 'none',
};

const labelStyle = {
  marginTop: 16,
  fontSize: 11,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: '#888',
};
