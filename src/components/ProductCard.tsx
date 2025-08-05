import React from 'react';
import { useState } from 'react';
import ProductView from './ProductView';

interface ProductCardProps {
  title: string;
  subtitle?: string;
  image: string;
  categoryName?: string;
  href?: string;
  productNumber?: string;
  onView?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  title, 
  subtitle, 
  image, 
  categoryName,
  href = '#',
  productNumber,
  onView
}) => {
  const [showProductView, setShowProductView] = useState(false);

  const handleClick = () => {
    if (onView) {
      onView();
    }
    setShowProductView(true);
  };

  return (
    <>
      <div className="p-2">
        <div className="bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-lg group cursor-pointer" 
             style={{ borderColor: '#ccc' }}
             onMouseEnter={(e) => {
               e.currentTarget.style.borderColor = '#777';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.borderColor = '#ccc';
             }}
             onClick={handleClick}
        >
          <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover cursor-crosshair transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-center group-hover:font-bold transition-all duration-300 font-raleway"
                style={{ color: '#444444' }}>
              {title}
            </h3>
            {productNumber && (
              <div className="text-center mt-1">
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {productNumber}
                </span>
              </div>
            )}
            {categoryName && (
              <p className="text-sm font-raleway text-center mt-2" style={{ color: '#444444' }}>
                {categoryName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Product View Modal */}
      {showProductView && (
        <ProductView onClose={() => setShowProductView(false)} />
      )}
    </>
  );
};

export default ProductCard;