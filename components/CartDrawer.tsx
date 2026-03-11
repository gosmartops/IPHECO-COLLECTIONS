
import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { WHATSAPP_NUMBER } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onCheckout: () => Promise<Order>;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemoveItem, onCheckout }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);
    try {
      const order = await onCheckout();
      
      const paymentInstructions = `
--- HOW TO PAY ---
Please send ₦${order.total.toLocaleString()} to:
Bank: Zenith Bank
Name: IPHECO SMART COLLECTIONS
Acc Number: 1210452381
Use this as Reference: ${order.id}`;

      const message = `Hello IPHECO! I want to buy these clothes. 
      
ORDER ID: ${order.id}
STATUS: READY (WAITING FOR PAYMENT)

ITEMS:
${order.items.map(item => `- ${item.name} (${item.size || 'N/A'}, ${item.color || 'N/A'}) x${item.quantity}`).join('\n')}

TOTAL: ₦${order.total.toLocaleString()}
${paymentInstructions}

Please tell me when you get the money. Thank you!`;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodedMessage}`, '_blank');
      onClose();
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-luxury font-bold gold-gradient">Your Cart</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-600 font-light italic text-sm">Your cart is empty.</p>
              <button onClick={onClose} className="text-[#B38728] text-[10px] uppercase tracking-widest font-black border-b border-[#B38728] pb-1">Start Shopping</button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex space-x-4 group animate-in slide-in-from-right duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="w-20 h-28 bg-gray-900 overflow-hidden flex-shrink-0 border border-white/5">
                  <img src={item.product.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.product.name} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-bold text-white">{item.product.name}</h4>
                    <button onClick={() => onRemoveItem(idx)} className="text-gray-700 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    Size: {item.selectedSize || 'N/A'} | Qty: {item.quantity}
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-sm font-bold text-[#B38728]">₦{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#050505] space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 uppercase tracking-[0.3em] text-[9px] font-black">Price</span>
              <span className="text-xl font-bold font-luxury text-white">₦{total.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full py-4 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 transition-all ${isProcessing ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'gold-bg text-black hover:opacity-90 shadow-xl shadow-[#B38728]/10'}`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>Saving Order...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.404.835 3.128 1.32 4.967 1.321 5.433 0 9.854-4.421 9.857-9.855.002-2.634-1.023-5.11-2.887-6.974-1.864-1.864-4.341-2.887-6.979-2.888-5.433 0-9.855 4.421-9.858 9.855-.001 1.977.588 3.867 1.699 5.454l-.992 3.626 3.71-.973zm11.237-7.364c-.09-.15-.33-.24-.69-.42-.36-.18-2.13-1.05-2.46-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.522-.56-2.898-1.789-1.071-.955-1.794-2.136-2.004-2.496-.21-.36-.022-.555.158-.734.162-.161.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.291-.703-.588-.607-.81-.618l-.69-.012c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3s1.29 3.48 1.47 3.72c.18.24 2.535 3.87 6.135 5.43.856.37 1.524.591 2.046.757.86.273 1.643.235 2.261.143.69-.103 2.13-.87 2.43-1.71.3-.84.3-1.56.21-1.71z"/>
                  </svg>
                  <span>Order on WhatsApp</span>
                </>
              )}
            </button>
            <p className="text-[8px] uppercase tracking-[0.4em] text-gray-700 font-black text-center">
              We hold your items once you order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
