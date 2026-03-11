
import React, { useState } from 'react';
import { getFashionAdvice } from '../services/geminiService';
import { Product, StylistResponse } from '../types';

interface AIStylistProps {
  onAddToCart: (product: Product) => void;
  availableProducts: Product[];
}

const AIStylist: React.FC<AIStylistProps> = ({ onAddToCart, availableProducts }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<StylistResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResult(null); 
    const response = await getFashionAdvice(query, availableProducts);
    setResult(response);
    setLoading(false);
  };

  const recommendedProducts = result?.recommendedProductIds 
    ? availableProducts.filter((p) => result.recommendedProductIds.includes(p.id)) 
    : [];

  return (
    <section className="py-24 px-6 bg-[#050505] border-y border-white/5">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <p className="text-[#B38728] uppercase tracking-[0.4em] text-[10px] font-black">Your Personal Style</p>
          <h2 className="text-4xl md:text-5xl font-luxury font-black gold-gradient">Ask Our Style Helper</h2>
          <p className="text-gray-500 tracking-widest uppercase text-[9px] font-bold">Find the best clothes for your next outing</p>
        </div>

        <div className="bg-black/50 border border-[#B38728]/20 p-8 md:p-12 rounded-none shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#B38728]/10 blur-[80px] rounded-full"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#B38728]/5 blur-[80px] rounded-full"></div>
          
          <form onSubmit={handleConsult} className="space-y-8 relative z-10">
            <div className="relative">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where are you going? (e.g., 'A traditional wedding in Umuahia')"
                className="w-full bg-transparent border-b border-gray-800 py-6 text-white placeholder-gray-700 focus:outline-none focus:border-[#B38728] transition-colors text-lg md:text-xl font-light italic"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-0 bottom-6 text-[#B38728] uppercase text-[10px] font-black tracking-[0.3em] hover:text-white transition-colors disabled:text-gray-700"
              >
                {loading ? 'Thinking...' : 'Get Help'}
              </button>
            </div>
            <p className="text-[8px] uppercase tracking-widest text-gray-700 font-bold text-center">
              Our helper only picks clothes from our current stock.
            </p>
          </form>

          {loading && (
            <div className="mt-16 space-y-6">
              <div className="h-4 w-3/4 mx-auto shimmer rounded-full"></div>
              <div className="h-4 w-1/2 mx-auto shimmer rounded-full"></div>
              <div className="grid grid-cols-2 gap-6 mt-12">
                <div className="h-48 shimmer"></div>
                <div className="h-48 shimmer"></div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="mt-16 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 text-[#B38728]">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#B38728]/40"></span>
                  <span className="uppercase tracking-[0.4em] text-[9px] font-black whitespace-nowrap italic">IPHECO Style Advice</span>
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#B38728]/40"></span>
                </div>
                <div className="text-gray-200 leading-relaxed font-light text-lg md:text-xl italic whitespace-pre-wrap text-center max-w-2xl mx-auto">
                  "{result.advice}"
                </div>
              </div>

              {recommendedProducts.length > 0 && (
                <div className="space-y-8">
                   <div className="text-center">
                    <p className="text-[9px] uppercase tracking-[0.4em] font-black text-gray-500 mb-2">Buy These Clothes</p>
                    <div className="h-px w-12 bg-[#B38728]/30 mx-auto"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recommendedProducts.map((product: Product) => (
                      <div key={product.id} className="flex bg-black border border-white/5 p-4 space-x-4 group hover:border-[#B38728]/30 transition-all">
                        <div className="w-24 h-32 flex-shrink-0 overflow-hidden">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <p className="text-[8px] uppercase tracking-widest text-gray-600 font-bold mb-1">{product.category}</p>
                            <h4 className="text-sm font-bold text-white mb-1">{product.name}</h4>
                            <p className="text-[#B38728] text-xs font-bold">₦{product.price.toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={() => onAddToCart(product)}
                            className="text-[9px] uppercase tracking-widest font-black text-white bg-white/5 py-2 hover:bg-[#B38728] hover:text-black transition-all"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AIStylist;
