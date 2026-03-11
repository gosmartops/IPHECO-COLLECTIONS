
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import AIStylist from './components/AIStylist';
import CartDrawer from './components/CartDrawer';
import Heritage from './components/Heritage';
import Contact from './components/Contact';
import Admin from './components/Admin';
import Logo from './components/Logo';
import { db } from './db';
import { OFFICE_ADDRESS, SOCIAL_LINKS } from './constants';
import { Product, CartItem, Category, Order } from './types';

type View = 'home' | 'collections' | 'heritage' | 'contact' | 'admin';

interface Toast {
  id: number;
  message: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setPermissionError(false);
    try {
      await db.init();
      const [productsData, ordersData] = await Promise.all([
        db.getProducts(),
        db.getOrders()
      ]);
      setCurrentProducts(productsData);
      setOrders(ordersData);
    } catch (err: any) {
      console.error("Data load failed:", err);
      if (err.message?.toLowerCase().includes('permission') || err.message?.toLowerCase().includes('insufficient')) {
        setPermissionError(true);
      }
      showToast("Shop connection lost. Check Cloud Rules.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const savedCart = localStorage.getItem('ipheco_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [loadData]);

  useEffect(() => {
    localStorage.setItem('ipheco_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const categories: Category[] = [
    'All', 'Polo', 'T-shirt', 'Jeans', 'Turkey jeans', 'Shorts', 'Jackets', 'Swede shirt', 
    'Palm slippers', 'Shoes', 'Corporate shoes', 'Sneakers', 'Sandals', 'Boxers', 'Singlet', 'Belt', 
    'Wristwatches', 'Jewelries', 'Bangles and bracelets', 'Hoodie', 'Sun glasses', 'Jean chains', 'Socks',
    'Traveling box', 'Traveling bags', 'Caps', 'Head warmer', 
    'Sleeveless sweater and jackets', 'Crossing bags'
  ];

  const filteredProducts = selectedCategory === 'All' 
    ? currentProducts 
    : currentProducts.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product, size?: string, color?: string) => {
    if (product.stock <= 0) {
      showToast("This item is out of stock");
      return;
    }
    const s = size || (product.sizes[0] === 'Standard' ? undefined : product.sizes[0]);
    const c = color || product.colors[0];
    setCart(prev => [...prev, { product, quantity: 1, selectedSize: s, selectedColor: c }]);
    showToast(`${product.name} added to cart`);
    setSelectedProduct(null);
  };

  const removeCartItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    showToast("Item removed");
  };

  const handleCheckout = async (): Promise<Order> => {
    try {
      const order = await db.createOrder(cart);
      await loadData();
      setCart([]); 
      return order;
    } catch (err: any) {
      showToast(err.message || "Order failed. Try again.");
      throw err;
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      if (product.id && currentProducts.some(p => p.id === product.id)) {
        await db.updateProduct(product);
      } else {
        await db.addProduct(product);
      }
      await loadData();
      showToast("Item saved successfully");
    } catch (err: any) {
      showToast(err.message || "Error saving item.");
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await db.deleteProduct(id);
      await loadData();
      showToast("Item deleted");
    } catch (err) {
      showToast("Could not delete item");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await db.updateOrderStatus(orderId, status);
      await loadData();
      showToast(`Order status: ${status}`);
    } catch (err) {
      showToast("Status update failed");
    }
  };

  const renderView = () => {
    if (isLoading && view !== 'admin') return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#B38728] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black animate-pulse">Entering IPHECO Boutique...</p>
        </div>
      </div>
    );

    if (permissionError && view !== 'admin') return (
      <div className="pt-40 pb-20 px-6 max-w-4xl mx-auto text-center space-y-8 animate-in fade-in duration-700">
        <div className="bg-red-900/20 border border-red-500 p-12 space-y-6">
          <div className="w-16 h-16 bg-red-500 text-black mx-auto flex items-center justify-center rounded-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          </div>
          <h2 className="text-3xl font-luxury font-black text-white uppercase tracking-widest">Database Locked</h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
            Your Firestore is in "Production Mode" but no security rules are set.<br/>
            The shop cannot load products until you update your Firebase Rules.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button onClick={() => setView('admin')} className="gold-bg text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest">Go to Admin Fix</button>
            <button onClick={loadData} className="border border-white/10 text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Retry Connection</button>
          </div>
        </div>
      </div>
    );

    switch (view) {
      case 'admin':
        return (
          <Admin 
            products={currentProducts} 
            orders={orders}
            categories={categories.filter(c => c !== 'All')} 
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onClose={() => setView('home')}
          />
        );
      case 'collections':
        return (
          <div className="pt-32">
            <div className="sticky top-[108px] md:top-[124px] z-40 bg-black/95 backdrop-blur-md border-b border-white/5 py-4">
              <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar scroll-smooth">
                <div className="flex space-x-8 md:space-x-12 min-w-max pb-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black transition-all whitespace-nowrap pb-1 border-b-2 ${
                        selectedCategory === cat ? 'text-[#B38728] border-[#B38728]' : 'text-gray-600 border-transparent hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <section className="max-w-7xl mx-auto px-6 py-12 md:py-24">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onClick={() => { setSelectedProduct(product); setActiveImageIndex(0); }} />
                ))}
              </div>
              {filteredProducts.length === 0 && !isLoading && (
                <div className="py-24 text-center space-y-4">
                  <p className="text-gray-500 font-luxury italic text-xl">New styles loading soon...</p>
                  <button onClick={() => setSelectedCategory('All')} className="text-[#B38728] uppercase text-[10px] tracking-widest font-black border-b border-[#B38728] pb-1">See Everything</button>
                </div>
              )}
            </section>
          </div>
        );
      case 'heritage':
        return <Heritage />;
      case 'contact':
        return <Contact />;
      default:
        return (
          <>
            <Hero onCtaClick={() => setView('collections')} />
            <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
              <div className="flex justify-between items-end mb-16">
                <div className="space-y-4">
                  <p className="text-[#B38728] uppercase tracking-[0.4em] text-[10px] font-black">Featured</p>
                  <h2 className="text-4xl md:text-5xl font-luxury font-black">Latest Stock</h2>
                </div>
                <button onClick={() => setView('collections')} className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-[#B38728] pb-1 hover:text-[#B38728] transition-colors">See All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {currentProducts.slice(0, 3).map(product => (
                  <ProductCard key={product.id} product={product} onClick={() => { setSelectedProduct(product); setActiveImageIndex(0); }} />
                ))}
              </div>
              {currentProducts.length === 0 && !isLoading && (
                 <div className="py-24 text-center">
                    <p className="text-gray-600 tracking-widest uppercase text-xs italic">Boutique refresh in progress. Visit Admin to upload your items.</p>
                 </div>
              )}
            </section>
            <AIStylist onAddToCart={addToCart} availableProducts={currentProducts} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#B38728] selection:text-black">
      <Header onCartClick={() => setIsCartOpen(true)} cartCount={cart.length} onNavClick={setView} currentView={view} />
      <main>
        {renderView()}
        <footer className="py-24 px-6 border-t border-white/5 bg-[#030303]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="space-y-8 flex flex-col items-start">
              <div className="cursor-pointer" onClick={() => setView('home')}><Logo className="h-20" /></div>
              <p className="text-gray-600 text-[11px] leading-relaxed tracking-wider">IPHECO Smart Collections. Good clothes for men in Nigeria. Made well, delivered everywhere.</p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-white">Office</h4>
              <p className="text-gray-600 text-[11px] tracking-wider leading-relaxed">{OFFICE_ADDRESS}</p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-white">Menu</h4>
              <ul className="space-y-4 text-gray-600 text-[11px] uppercase tracking-widest font-semibold">
                <li><button onClick={() => setView('collections')} className="hover:text-[#B38728] transition-colors uppercase">Shop Now</button></li>
                <li><button onClick={() => setView('admin')} className="hover:text-[#B38728] transition-colors uppercase opacity-30 hover:opacity-100">Admin</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-white">Social</h4>
              <ul className="space-y-4 text-gray-600 text-[11px] uppercase tracking-widest font-semibold">
                <li><a href={SOCIAL_LINKS.instagram} target="_blank" className="hover:text-[#B38728]">Instagram</a></li>
                <li><a href={SOCIAL_LINKS.whatsapp} target="_blank" className="hover:text-[#B38728]">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 text-center">
             <p className="text-[9px] uppercase tracking-widest text-gray-700 font-bold">&copy; {new Date().getFullYear()} IPHECO SMART COLLECTIONS. ALL RIGHTS RESERVED.</p>
          </div>
        </footer>
      </main>
      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-10 right-10 z-[70] bg-[#B38728] text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        </button>
      )}
      <div className="fixed bottom-10 left-10 z-[100] space-y-4 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-[#0a0a0a] border border-[#B38728]/30 px-6 py-4 text-white text-[10px] uppercase tracking-widest font-black shadow-2xl animate-in slide-in-from-left duration-300 pointer-events-auto">
            {toast.message}
          </div>
        ))}
      </div>
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/90" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-[#050505] w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-white/10 flex flex-col md:flex-row shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-10 p-2 text-gray-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="md:w-3/5 bg-black relative flex flex-col h-[50vh] md:h-auto">
              <div className="flex-1 overflow-hidden">
                <img src={selectedProduct.images[activeImageIndex]} alt={selectedProduct.name} className="w-full h-full object-contain p-4" />
              </div>
              {selectedProduct.images.length > 1 && (
                <div className="p-4 flex justify-center space-x-2 bg-black/50 overflow-x-auto no-scrollbar">
                  {selectedProduct.images.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`w-16 h-20 flex-shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-[#B38728] opacity-100' : 'border-white/10 opacity-50 hover:opacity-80'}`}>
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="md:w-2/5 p-8 md:p-12 space-y-8 flex flex-col">
              <div className="space-y-2">
                <p className="text-[#B38728] uppercase tracking-[0.4em] text-[10px] font-black">{selectedProduct.category}</p>
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-luxury font-black text-white">{selectedProduct.name}</h2>
                  {selectedProduct.stock <= 5 && selectedProduct.stock > 0 && <span className="bg-red-900/40 text-red-400 text-[7px] font-black px-2 py-1 uppercase tracking-widest">Only {selectedProduct.stock} items left</span>}
                </div>
                <p className="text-2xl font-bold gold-gradient">₦{selectedProduct.price.toLocaleString()}</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-500">Details</h4>
                <p className="text-gray-400 text-sm leading-relaxed font-light italic">"{selectedProduct.description}"</p>
              </div>
              <div className="space-y-6">
                {selectedProduct.sizes.length > 0 && selectedProduct.sizes[0] !== 'Standard' && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-500">Pick Your Size</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedProduct.sizes.map(size => (
                        <button key={size} className="px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:border-[#B38728] hover:text-[#B38728] transition-all">{size}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-8 mt-auto">
                <button onClick={() => addToCart(selectedProduct)} disabled={selectedProduct.stock <= 0} className={`w-full py-5 font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-xl ${selectedProduct.stock > 0 ? 'gold-bg text-black hover:opacity-90 shadow-[#B38728]/10' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}>
                  {selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemoveItem={removeCartItem} onCheckout={handleCheckout} />
    </div>
  );
};

export default App;
