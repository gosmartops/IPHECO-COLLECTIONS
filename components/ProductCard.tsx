
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div 
      className="group relative bg-[#0a0a0a] overflow-hidden border border-white/5 transition-all duration-500 hover:border-[#B38728]/30 cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-black/60 backdrop-blur-md">
           <button className="w-full bg-white text-black py-3 text-xs uppercase font-bold tracking-widest hover:bg-[#B38728] hover:text-white transition-colors">
            Check it Out
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-2">
        <div className="flex justify-between items-start">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{product.category}</p>
          <p className="text-sm font-bold text-[#B38728]">₦{product.price.toLocaleString()}</p>
        </div>
        <h3 className="text-lg font-luxury font-bold text-white group-hover:text-[#B38728] transition-colors">{product.name}</h3>
      </div>
    </div>
  );
};

export default ProductCard;
