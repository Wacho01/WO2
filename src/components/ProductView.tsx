import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

interface ProductViewProps {
  onClose?: () => void;
}

const ProductView: React.FC<ProductViewProps> = ({ onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const topViewRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDragNotice, setShowDragNotice] = useState(false);
  const [activeOption, setActiveOption] = useState('bucket1');
  const [particlesActive, setParticlesActive] = useState(true);
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const camera2Ref = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const particleSystemsRef = useRef<any[]>([]);
  const animationIdRef = useRef<number | null>(null);

  const colors = [
    { color: 'D60000' }, // coral
    { color: 'E8F300' }, // daffodil
    { color: '00E4F3' }, // sky
    { color: '00C7D4' }, // sea foam
    { color: '00A1D4' }, // teal
    { color: '8FDA4D' }, // avocado
    { color: '19BA1B' }, // green
    { color: '759C53' }, // evergreen
    { color: 'E4E8E8' }, // sand
    { color: '898233' }, // chocolate
    { color: 'FFFF00' }, // yellow
    { color: 'FF0000' }, // red
    { color: '0046FF' }, // blue
    { color: 'EE82EE' }, // violet
    { color: 'FFA500' }, // orange
    { color: '00008B' }, // navy
  ];

  useEffect(() => {
    if (!mountRef.current || !topViewRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const BackGround_Color = 0xf1f1f1;
    scene.background = new THREE.Color(BackGround_Color);
    scene.fog = new THREE.Fog(BackGround_Color, 20, 100);
    sceneRef.current = scene;

    // Setup cameras
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.25, 500);
    camera.position.set(1.2, 0.5, 5);
    camera.lookAt(0, 0.5, 0);
    camera.name = "MainCam";
    cameraRef.current = camera;

    const camera2 = new THREE.PerspectiveCamera(10, 1, 0.01, 500);
    camera2.position.set(12, 1, -6);
    camera2.lookAt(scene.position);
    camera2.name = "OverheadCam";
    camera2Ref.current = camera2;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.physicallyCorrectLights = true;
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    hemiLight.position.set(0, 2, 2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.45);
    dirLight.position.set(0.5, 1, 1.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.setScalar(2048);
    scene.add(dirLight);

    // Add floor
    const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xF8F8F8, shininess: 0 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -0.6;
    scene.add(floor);

    const grid = new THREE.GridHelper(50, 50, 0xffffff, 0x7b7b7b);
    grid.material.opacity = 0.4;
    grid.material.transparent = true;
    grid.position.y = -0.6;
    scene.add(grid);

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 4;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 3;
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.dampingFactor = 0.1;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    // Load model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.preload();

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load('/src/ProductView/models/gltf/RHINO.glb', (gltf) => {
      const model = gltf.scene;
      
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Set up nameID for color customization
          if (child.name.includes('bucket') || child.name.includes('rhino')) {
            child.nameID = 'bucket1';
          } else if (child.name.includes('handler') || child.name.includes('rock')) {
            child.nameID = 'handler1';
          } else if (child.name.includes('grass') || child.name.includes('base')) {
            child.nameID = 'handler2';
          }
        }
      });

      // Apply initial material
      const initialMaterial = new THREE.MeshPhongMaterial({ color: 0x0023FF, shininess: 1 });
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name.includes('bucket')) {
          child.material = initialMaterial.clone();
          child.nameID = 'bucket1';
        }
      });

      model.scale.set(0.6, 0.6, 0.6);
      model.rotation.y = Math.PI;
      model.position.y = -0.6;
      
      scene.add(model);
      model.add(camera2);
      modelRef.current = model;

      setIsLoading(false);
      
      // Start initial rotation
      let rotationCount = 0;
      const rotateInterval = setInterval(() => {
        if (rotationCount < 35) {
          model.rotation.y += Math.PI / 90;
          rotationCount++;
        } else {
          clearInterval(rotateInterval);
          setTimeout(() => {
            setShowDragNotice(true);
            setTimeout(() => setShowDragNotice(false), 3000);
          }, 500);
        }
      }, 50);

    }, undefined, (error) => {
      console.error('Model loading failed:', error);
      setIsLoading(false);
    });

    // Render function
    const setScissorForElement = (elem: HTMLElement) => {
      const canvas = renderer.domElement;
      const canvasRect = canvas.getBoundingClientRect();
      const elemRect = elem.getBoundingClientRect();

      const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
      const left = Math.max(0, elemRect.left - canvasRect.left);
      const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
      const top = Math.max(0, elemRect.top - canvasRect.top);

      const width = Math.min(canvasRect.width, right - left);
      const height = Math.min(canvasRect.height, bottom - top);

      const positiveYUpBottom = canvasRect.height - bottom;
      renderer.setScissor(left, positiveYUpBottom, width, height);
      renderer.setViewport(left, positiveYUpBottom, width, height);

      return width / height;
    };

    const render = () => {
      controls.update();
      
      renderer.setScissorTest(true);
      
      // Main camera
      if (mountRef.current) {
        camera.aspect = setScissorForElement(mountRef.current);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      }

      // Top camera
      if (topViewRef.current) {
        camera2.aspect = setScissorForElement(topViewRef.current);
        camera2.updateProjectionMatrix();
        camera2.lookAt(scene.position);
        renderer.render(scene, camera2);
      }
    };

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      render();
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      camera2.aspect = window.innerWidth / window.innerHeight;
      camera2.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleColorChange = (colorIndex: number) => {
    if (!modelRef.current) return;

    const color = colors[colorIndex];
    const newMaterial = new THREE.MeshPhongMaterial({
      color: parseInt('0x' + color.color),
      shininess: 10
    });

    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.nameID === activeOption) {
        child.material = newMaterial;
      }
    });
  };

  const handleOptionSelect = (option: string) => {
    setActiveOption(option);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Border lines */}
      <div className="fixed top-[1%] bottom-[1%] left-[1%] w-[5px] bg-[#2a9cd7] pointer-events-none z-[85]"></div>
      <div className="fixed top-[1%] bottom-[1%] right-[1%] w-[5px] bg-[#2a9cd7] pointer-events-none z-[85]"></div>
      <div className="fixed top-[1%] left-[1%] right-[1%] h-[5px] bg-[#2a9cd7] pointer-events-none z-[85]"></div>
      <div className="fixed bottom-[1%] left-[1%] right-[1%] h-[5px] bg-[#2a9cd7] pointer-events-none z-[85]"></div>

      {/* Logo */}
      <div className="fixed top-[5%] left-[50%] transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-4">
          <img 
            src="/src/ProductView/img/logo2.png" 
            alt="Water Odyssey Logo" 
            className="h-16 w-auto"
          />
          <div className="text-[#2a9cd7] font-semibold text-2xl font-raleway">
            Funforms
          </div>
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Close
        </button>
      )}

      {/* Main 3D view */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top view camera */}
      <div 
        ref={topViewRef}
        className="fixed left-[35px] top-[120px] w-[300px] h-[200px] border border-red-500 z-10"
      />

      {/* Loading spinner */}
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10004]">
          <div className="w-[100px] h-[100px] bg-[#00aacc] rounded-full relative overflow-hidden shadow-inner">
            <div className="absolute w-full h-full rounded-[45%] top-[-40%] bg-[#D3D3D3] animate-spin"></div>
            <div className="absolute w-full h-full rounded-[30%] top-[-40%] bg-white/40 animate-spin"></div>
          </div>
        </div>
      )}

      {/* Drag notice */}
      {showDragNotice && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="w-40 h-40 bg-white/90 border-4 border-dashed border-blue-500 rounded-2xl flex items-center justify-center text-center text-blue-600 font-bold text-sm uppercase animate-pulse">
            Rotate 3D Model°
          </div>
        </div>
      )}

      {/* Right side console */}
      <div className="fixed top-8 right-0 bg-[#505050]/90 text-white px-4 py-2 rounded-l-lg text-sm uppercase cursor-pointer hover:bg-[#505050] transition-colors z-30">
        ☰ open
      </div>

      {/* Control panel */}
      <div className="fixed right-4 top-16 w-60 bg-black/80 text-white rounded-lg p-4 space-y-4 z-40">
        {/* Animation controls */}
        <div className="space-y-2">
          <button
            onClick={() => setParticlesActive(true)}
            className="w-full bg-[#181818] hover:bg-[#202020] border border-black px-4 py-3 text-white font-bold uppercase transition-colors"
          >
            PLAY
          </button>
          <button
            onClick={() => setParticlesActive(false)}
            className="w-full bg-[#181818] hover:bg-[#202020] border border-black px-4 py-3 text-white font-bold uppercase transition-colors"
          >
            STOP
          </button>
        </div>

        {/* Resources */}
        <div className="bg-black border border-black px-4 py-2 text-white text-sm uppercase">
          ⚙️ resources
        </div>

        <button
          onClick={() => setShowDimensionsModal(true)}
          className="w-full bg-[#181818] hover:bg-[#202020] border border-black px-4 py-2 text-white text-sm uppercase transition-colors"
        >
          <strong>SHOW</strong> Dimensions
        </button>

        <button
          onClick={() => setShowVideoModal(true)}
          className="w-full bg-[#181818] hover:bg-[#202020] border border-black px-4 py-2 text-white text-sm uppercase transition-colors"
        >
          <strong>RHINO SPRAYER</strong> In Motion!
        </button>

        <a
          href="/src/ProductView/public/Docu/massivesplash_ss_02.pdf"
          target="_blank"
          className="block w-full bg-[#181818] hover:bg-[#202020] border border-black px-4 py-2 text-white text-sm uppercase transition-colors text-center"
        >
          <strong>DOWNLOAD</strong> SPLASH FLYER
        </a>

        {/* Colors */}
        <div className="bg-black border border-black px-4 py-2 text-white text-sm uppercase">
          🎨 colors
        </div>

        {/* Parts selection */}
        <div className="space-y-1">
          <div className="text-center text-xs text-gray-400 uppercase">Parts</div>
          {[
            { id: 'bucket1', label: 'RHINO' },
            { id: 'handler1', label: 'ROCK' },
            { id: 'handler2', label: 'GRASS' }
          ].map((part) => (
            <button
              key={part.id}
              onClick={() => handleOptionSelect(part.id)}
              className={`w-full px-3 py-2 text-xs border border-black transition-colors ${
                activeOption === part.id
                  ? 'bg-[#181818] border-r-4 border-r-[#2a9cd7] text-white'
                  : 'bg-[#181818] hover:bg-[#202020] text-white'
              }`}
            >
              {part.label}
            </button>
          ))}
        </div>

        {/* Color swatches */}
        <div className="space-y-2">
          <div className="text-center text-xs text-gray-400 uppercase">Swatch</div>
          <div className="grid grid-cols-4 gap-1">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorChange(index)}
                className="w-6 h-6 border border-gray-500 hover:border-white transition-all hover:scale-110"
                style={{ backgroundColor: `#${color.color}` }}
                title={`Color ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-black border border-black px-4 py-2 text-white text-sm uppercase">
          📐 specification
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <div className="text-gray-400">Category</div>
            <div className="bg-[#080808] border border-black px-2 py-1 text-white">FUN FORM</div>
          </div>
          <div>
            <div className="text-gray-400">Dimensions</div>
            <div className="bg-[#080808] border border-black px-2 py-1 text-white">Height: 14'-3" | 435 CM</div>
          </div>
          <div>
            <div className="text-gray-400">Flow Requirements</div>
            <div className="bg-[#080808] border border-black px-2 py-1 text-white">40 - 100 GPM/ 152-379 LPM</div>
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-black border border-black px-4 py-2 text-white text-xs">
          © WATER ODYSSEY - All rights Reserved.
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full h-[14%] bg-[#2a9cd7] z-[90] pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-full h-[15%] flex items-center text-left z-[100] pointer-events-none">
        <span className="absolute text-white font-semibold text-4xl font-raleway ml-4 mb-12">BLACK RHINO</span>
        <span className="absolute w-0.5 h-12 bg-white ml-[355px] mb-10"></span>
        <span className="absolute text-white text-2xl font-raleway ml-[375px] mb-8">Sprayer</span>
      </div>

      {/* Dimensions Modal */}
      {showDimensionsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[10001]">
          <div className="bg-[#111111] rounded-2xl border border-gray-600 p-5 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-bold">Model Dimensions</h2>
              <button
                onClick={() => setShowDimensionsModal(false)}
                className="text-gray-400 hover:text-white text-4xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="relative w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
              <img 
                src="/src/ProductView/public/textures/rhinoFront.svg" 
                alt="Rhino Dimensions" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="mt-4 bg-black rounded px-4 py-2 text-white text-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><strong>Width =</strong> 5'</div>
                <div><strong>Length =</strong> 10'</div>
                <div><strong>Height =</strong> 14' - 3"</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[10001]">
          <div className="bg-[#111111] rounded-2xl border border-gray-600 p-5 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-bold">Rhino Sprayer In Motion</h2>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-white text-4xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="relative w-full pt-[56.25%] overflow-hidden rounded-2xl">
              <iframe
                src="https://www.youtube.com/embed/Mlq20WJ5Z54"
                frameBorder="0"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductView;