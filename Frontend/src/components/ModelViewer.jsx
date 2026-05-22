import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ModelViewer({ modelUrl, resetSignal = 0 }) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mountRef.current || !modelUrl) return;

    setLoading(true);
    setError(null);
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup - dark luxury background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.35, 2.75);

    // Renderer with explicit dimensions
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x0a0a0a, 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xfff8ef, 0x2c241f, 1.2);
    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 3);
    keyLight.position.set(2, 5, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xC5A880, 1);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.1);
    fillLight.position.set(0, 3, -4);
    scene.add(fillLight);

    const frontLight = new THREE.PointLight(0xffffff, 1.6, 12);
    frontLight.position.set(0, 2.2, 3.2);
    scene.add(frontLight);

    const topSpot = new THREE.SpotLight(0xfff3df, 2.8, 14, Math.PI / 5, 0.45, 1);
    topSpot.position.set(1.5, 6, 2.5);
    topSpot.target.position.set(0, 0.8, 0);
    scene.add(topSpot);
    scene.add(topSpot.target);

    const stage = new THREE.Mesh(
      new THREE.CircleGeometry(2.25, 64),
      new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 1,
        metalness: 0
      })
    );
    stage.rotation.x = -Math.PI / 2;
    stage.position.y = -1.25;
    scene.add(stage);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.enableZoom = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.target.set(0, 1, 0);
    controls.update();
    controlsRef.current = controls;

    // Test cube - shows Three.js is working
    const testCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ 
        color: 0xC5A880,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0xC5A880,
        emissiveIntensity: 0.3
      })
    );
    testCube.position.set(0, 1, 0);
    scene.add(testCube);

    // Load FBX model
    const loadingManager = new THREE.LoadingManager();
    const loader = new FBXLoader(loadingManager);
    
    loader.load(
      modelUrl,
      (object) => {
        fbxLoaded = true;
        // Remove test cube when FBX loads
        scene.remove(testCube);
        testCube.geometry.dispose();
        testCube.material.dispose();

        // Auto-center and scale model to fit viewport
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 2.2 / maxDim : 1;
        object.scale.setScalar(scale);
        object.position.sub(center.multiplyScalar(scale));
        object.position.y += 0.15;

        // Material enhancement
        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
              if (!material) return;
              if (material.color) {
                material.color.convertSRGBToLinear();
              }
              if (material.emissive && material.emissiveIntensity) {
                material.emissiveIntensity *= 0.1;
              }
            });
          }
        });

        scene.add(object);
        setLoading(false);

        // FBX files may have embedded animations as AnimationStacks
        if (object.animations && object.animations.length > 0) {
          mixer = new THREE.AnimationMixer(object);
          const idleClip = object.animations[0];
          const action = mixer.clipAction(idleClip);
          action.play();
        }
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total * 100).toFixed(0);
          console.log(`Loading FBX: ${percent}%`);
        }
      },
      (error) => {
        console.error('FBX load error:', error);
        setError('Could not load 3D model. Using test preview.');
        setLoading(false);
      }
    );

    // Animation loop
    const clock = new THREE.Clock();
    let animFrameId;
    let fbxLoaded = false;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      // Rotate test cube if FBX hasn't loaded yet
      if (!fbxLoaded && testCube) {
        testCube.rotation.y += delta * 0.8;
        testCube.rotation.x += delta * 0.3;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      controlsRef.current = null;
      scene.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry?.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (!material) return;
          Object.values(material).forEach((value) => {
            if (value?.isTexture) value.dispose();
          });
          material.dispose();
        });
      });
      renderer.dispose();
      stage.geometry.dispose();
      stage.material.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.reset();
    controlsRef.current.target.set(0, 1, 0);
    controlsRef.current.update();
  }, [resetSignal]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.3)', zIndex: 10
        }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{
            width: 50, height: 50, borderRadius: '50%',
            border: '3px solid rgba(197,168,128,0.3)',
            borderTopColor: '#C5A880',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ marginTop: 16, fontSize: 11, letterSpacing: '0.25em',
            textTransform: 'uppercase', color: '#888' }}>
            Loading 3D Model
          </p>
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', zIndex: 20
        }}>
          <p style={{ fontSize: 12, color: '#ff6b6b', marginBottom: 8 }}>
            {error}
          </p>
          <p style={{ fontSize: 10, color: '#888' }}>
            Check console for details
          </p>
        </div>
      )}
    </div>
  );
}
