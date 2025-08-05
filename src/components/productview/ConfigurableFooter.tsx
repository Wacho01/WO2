import React from 'react';
import { ProductConfig } from '../../config/productConfig';

interface ConfigurableFooterProps {
  config: ProductConfig;
}

const ConfigurableFooter: React.FC<ConfigurableFooterProps> = ({ config }) => {
  return (
    <>
      {/* Footer Background - positioned in front of canvas */}
      <div className="fixed bottom-0 left-0 w-full h-[14vh] bg-[#2a9cd7] z-[90] pointer-events-none"></div>

      {/* Model Info Frame */}
      <div className="fixed bottom-0 left-0 w-full h-[15vh] flex justify-start items-center text-left z-[100] pointer-events-none"> 
        <span className="text-white absolute font-semibold text-[2em] font-raleway pointer-events-auto left-[clamp(50px,8vw,100px)] bottom-[clamp(15px,4vh,41px)] m-0">
          {config.product.name}
        </span>
        <span className="border-l-2 border-white h-[clamp(30px,6vh,50px)] absolute left-[clamp(300px,25vw,355px)] bottom-[clamp(15px,2.5vh,40px)] m-0"></span>
        <span className="absolute text-[clamp(1rem,2.5vw,1.5rem)] text-white font-raleway pointer-events-auto left-[clamp(320px,27vw,375px)] bottom-[clamp(10px,5vh,45px)] m-0">
          {config.product.category}
        </span>
        <span className="absolute text-[clamp(1rem,2.5vw,1.2rem)] text-white font-raleway pointer-events-auto left-[clamp(320px,27vw,375px)] bottom-[clamp(10px,2vh,25px)] m-0">
          {config.product.subcategory}
        </span>
      </div>
    </>
  );
};

export default ConfigurableFooter;