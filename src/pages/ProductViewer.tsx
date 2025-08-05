import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfigurableThreeScene from '../components/productview/ConfigurableThreeScene';
import ConfigurableControlPanel from '../components/productview/ConfigurableControlPanel';
import ConfigurableFooter from '../components/productview/ConfigurableFooter';
import LoadingSpinner from '../components/productview/LoadingSpinner';
import { useProductConfig } from '../hooks/useProductConfig';
import { useThreeScene } from '../hooks/useThreeScene';

const ProductViewer: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const { config, loading: configLoading, error: configError } = useProductConfig();
  const { playAnimation, stopAnimation, changeColor, selectPart } = useThreeScene();

  const handleModelLoad = () => {
    setIsModelLoaded(true);
  };

  // Logo hover functions (converted from the original logo.js)
  const rollover = (logo: HTMLImageElement) => {
    logo.style.width = "100%";
    logo.style.opacity = "0.7";
    logo.style.transition = "all .35s ease-in-out";
    logo.src = '/src/ProductView/img/logo2.png';
  };

  const mouseaway = (logo: HTMLImageElement) => {
    logo.style.width = "100%";
    logo.style.opacity = "1.0";
    logo.src = "/src/ProductView/img/logo2.png";
  };

  // Show loading if configuration is loading
  if (configLoading) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-100">
        <LoadingSpinner message="Loading Configuration..." />
      </div>
    );
  }

  // Show error if configuration failed to load
  if (configError) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-600">{configError}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      {/* Border Lines from original file - positioned in front of canvas */}
      <div id="left" className="fixed top-[1%] bottom-[1%] left-[1%] w-[5px] bg-[#2a9cd7] z-[85] pointer-events-none"></div>
      <div id="right" className="fixed top-[1%] bottom-[1%] right-[1%] w-[5px] bg-[#2a9cd7] z-[85] pointer-events-none"></div>
      <div id="top" className="fixed top-[1%] left-[1%] right-[1%] h-[5px] bg-[#2a9cd7] z-[85] pointer-events-none"></div>
      <div id="bottom" className="fixed bottom-[1%] left-[1%] right-[1%] h-[5px] bg-[#2a9cd7] z-[85] pointer-events-none"></div>

      {/* High-DPI optimized logo with hover effects */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="logo">
          <a href="/" className="block">
            <img 
              src="/src/ProductView/img/logo2.png" 
              alt="Water Odyssey Logo" 
              className="h-16 w-auto object-contain transition-all duration-300 select-none"
              style={{
                imageRendering: 'crisp-edges',
                WebkitImageRendering: 'crisp-edges',
                MozImageRendering: 'crisp-edges',
                msImageRendering: 'crisp-edges',
                imageRendering: '-webkit-optimize-contrast',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                willChange: 'transform, opacity'
              }}
              onMouseOver={(e) => rollover(e.currentTarget)}
              onMouseOut={(e) => mouseaway(e.currentTarget)}
              onLoad={() => console.log('Logo loaded successfully')}
              draggable={false}
            />
          </a>
        </div>
      </div>

      {/* Configurable Three.js Scene */}
      <ConfigurableThreeScene config={config} onModelLoad={handleModelLoad} />

      {/* Loading Spinner */}
      {!isModelLoaded && <LoadingSpinner />}

      {/* Configurable Footer */}
      {isModelLoaded && <ConfigurableFooter config={config} />}

      {/* Configurable Control Panel */}
      <ConfigurableControlPanel
        config={config}
        onPlayAnimation={playAnimation}
        onStopAnimation={stopAnimation}
        onColorChange={changeColor}
        onPartSelect={selectPart}
      />
    </div>
  );
};

export default ProductViewer;