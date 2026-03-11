
import React, { useState, useRef, useEffect } from 'react';
import { Product, Order } from '../types';
import { isFirebaseConfigured } from '../firebase';
import Logo from './Logo';

interface AdminProps {
  products: Product[];
  orders: Order[];
  categories: string[];
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  onClose: () => void;
}

const Admin: React.FC<AdminProps> = ({ products, orders, categories, onUpdateProduct, onDeleteProduct, onUpdateOrderStatus, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSetupHelp, setShowSetupHelp] = useState(false);
  const [helpType, setHelpType] = useState<'database' | 'storage'>('database');

  const [dashboardFilter, setDashboardFilter] = useState<string>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    name: '', price: 0, category: categories[0], images: [], description: '', sizes: '', colors: '', stock: 0
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const msg = errorMessage?.toLowerCase() || "";
    if (msg.includes('storage/') || (msg.includes('unauthorized') && msg.includes('jpg')) || msg.includes('forbidden')) {
      setHelpType('storage');
      setShowSetupHelp(true);
    } else if (msg.includes('permission-denied') || msg.includes('disabled')) {
      setHelpType('database');
      setShowSetupHelp(true);
    } else if (errorMessage === null && products.length > 0) {
      setShowSetupHelp(false);
    }
  }, [errorMessage, products]);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'ipheco_admin' && loginForm.password === 'IPHECO_Smart_Collections_@2025_Secure_Access!') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setIsSyncing(true);
    setErrorMessage(null);
    try {
      await onUpdateOrderStatus(orderId, newStatus);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : ''
    });
    setImagePreviews(product.images || []);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this product permanently from the cloud?')) {
      setIsSyncing(true);
      try {
        await onDeleteProduct(id);
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsOptimizing(true);
      try {
        const fileArray = Array.from(files) as File[];
        const processedImages: string[] = [];
        for (const file of fileArray) {
          const reader = new FileReader();
          const base64: string = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          const compressed = await compressImage(base64);
          processedImages.push(compressed);
        }
        const combinedImages = [...imagePreviews, ...processedImages];
        setImagePreviews(combinedImages);
        setFormData((prev: any) => ({ ...prev, images: combinedImages }));
      } catch (err) {
        alert("Image processing failed.");
      } finally {
        setIsOptimizing(false);
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...imagePreviews];
    newImages.splice(index, 1);
    setImagePreviews(newImages);
    setFormData((prev: any) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isFirebaseConfigured()) {
      setErrorMessage("Firebase credentials missing. Check firebase.ts");
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      setErrorMessage("At least one product photo is required.");
      return;
    }

    const processArray = (val: any) => {
      if (typeof val === 'string') return val.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
      return Array.isArray(val) ? val : [];
    };

    const productData: Product = {
      id: editingProduct ? editingProduct.id : '',
      name: formData.name || '',
      price: Number(formData.price) || 0,
      category: formData.category || categories[0],
      images: formData.images || [],
      description: formData.description || '',
      sizes: processArray(formData.sizes),
      colors: processArray(formData.colors),
      stock: Number(formData.stock) || 0
    };

    setIsSyncing(true);
    try {
      await onUpdateProduct(productData);
      handleCloseForm();
    } catch (err: any) {
      console.error("Save Error:", err);
      setErrorMessage(err.message || "Unknown Cloud Error occurred.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setImagePreviews([]);
    setErrorMessage(null);
    setFormData({ name: '', price: 0, category: categories[0], images: [], description: '', sizes: '', colors: '', stock: 0 });
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-6">
        <div className="relative w-full max-w-md space-y-12 bg-[#050505] border border-white/10 p-12 shadow-2xl">
          <div className="flex flex-col items-center space-y-6">
            <Logo className="h-24" />
            <h1 className="text-2xl font-luxury font-black gold-gradient uppercase tracking-widest text-center">Store Management</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-8">
            <input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} className="w-full bg-transparent border-b border-gray-800 py-3 text-white outline-none text-center" placeholder="ADMIN USERNAME" />
            <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-transparent border-b border-gray-800 py-3 text-white outline-none text-center" placeholder="SECURE PASSCODE" />
            {loginError && <p className="text-red-500 text-[9px] uppercase font-black text-center">Invalid Admin Credentials</p>}
            <button type="submit" className="w-full gold-bg text-black py-5 font-black uppercase tracking-[0.4em] text-[10px]">Access Dashboard</button>
            <button type="button" onClick={onClose} className="w-full text-gray-700 text-[9px] uppercase tracking-widest text-center">Exit to Storefront</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        {showSetupHelp && (
          <div className="mb-12 p-8 bg-red-950/40 border-2 border-red-500 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-start space-x-6">
              <div className="bg-red-500 text-black p-3 rounded-none flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-luxury font-black text-red-400 uppercase tracking-widest leading-none">Final Step Required</h3>
                <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-80 leading-relaxed">
                  Your rules are pasted, but you must click <strong className="text-red-400 underline">PUBLISH</strong> in the Firebase console to activate them.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 bg-black/40 p-6 border border-white/5">
                <p className="text-[10px] text-[#B38728] font-black uppercase tracking-widest">1. Verify Code</p>
                <pre className="bg-black p-3 text-[9px] text-green-500 border border-white/10 font-mono overflow-x-auto">
{helpType === 'storage' ? `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}` : `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                </pre>
              </div>
              <div className="space-y-4 bg-black/40 p-6 border border-white/5">
                <p className="text-[10px] text-[#B38728] font-black uppercase tracking-widest">2. CLICK PUBLISH</p>
                <div className="bg-[#1a1a1a] p-4 border border-blue-500/30 space-y-3">
                   <p className="text-[10px] text-white font-bold uppercase leading-relaxed">
                    Look for the blue <span className="bg-blue-600 px-2 py-0.5 rounded text-[8px]">PUBLISH</span> button at the top of the rules editor page.
                  </p>
                </div>
              </div>
              <div className="space-y-4 bg-black/40 p-6 border border-white/5">
                <p className="text-[10px] text-[#B38728] font-black uppercase tracking-widest">3. Refresh App</p>
                <button onClick={() => window.location.reload()} className="w-full mt-4 px-6 py-4 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">I have Published. Refresh Now.</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="space-y-4">
             <div className="flex items-center space-x-6">
              <button onClick={() => setActiveTab('products')} className={`text-[10px] uppercase tracking-widest font-black pb-2 border-b-2 transition-all ${activeTab === 'products' ? 'text-[#B38728] border-[#B38728]' : 'text-gray-400 border-transparent'}`}>Product Catalog</button>
              <button onClick={() => setActiveTab('orders')} className={`text-[10px] uppercase tracking-widest font-black pb-2 border-b-2 transition-all ${activeTab === 'orders' ? 'text-[#B38728] border-[#B38728]' : 'text-gray-400 border-transparent'}`}>Order Manager ({orders.length})</button>
            </div>
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl md:text-6xl font-luxury font-black text-white">{activeTab === 'products' ? 'Inventory' : 'Sales'}</h1>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-900/20 rounded-full">
                <div className={`w-1.5 h-1.5 rounded-full ${showSetupHelp ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className={`text-[7px] font-black uppercase tracking-tighter ${showSetupHelp ? 'text-yellow-500' : 'text-green-500'}`}>
                  {showSetupHelp ? 'Awaiting Rules Publish' : 'Cloud Sync Active'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {(isSyncing || isOptimizing) && (
              <div className="flex items-center space-x-2 text-[8px] text-[#B38728] font-black uppercase tracking-widest">
                <div className="w-2 h-2 bg-[#B38728] rounded-full animate-ping"></div>
                <span>{isOptimizing ? 'Optimizing...' : 'Syncing Cloud...'}</span>
              </div>
            )}
            {activeTab === 'products' && (
              <button onClick={() => { setEditingProduct(null); setIsFormOpen(true); }} className="gold-bg text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-[#B38728]/10">Add New Product</button>
            )}
            <button onClick={() => setIsAuthenticated(false)} className="px-8 py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Logout</button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <>
            <div className="mb-12 overflow-x-auto no-scrollbar pb-4 border-b border-white/5">
              <div className="flex space-x-8 min-w-max">
                <button onClick={() => setDashboardFilter('All')} className={`text-[9px] uppercase font-black tracking-widest ${dashboardFilter === 'All' ? 'text-[#B38728] border-b-2 border-[#B38728]' : 'text-gray-600'}`}>All Items ({products.length})</button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setDashboardFilter(cat)} className={`text-[9px] uppercase font-black tracking-widest ${dashboardFilter === cat ? 'text-[#B38728] border-b-2 border-[#B38728]' : 'text-gray-600'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {products.filter(p => dashboardFilter === 'All' || p.category === dashboardFilter).map(product => (
                <div key={product.id} className="flex flex-col md:flex-row items-center bg-black border border-white/5 p-6 md:space-x-8 hover:border-[#B38728]/30 transition-all group animate-in fade-in slide-in-from-left duration-300">
                  <div className="w-16 h-20 bg-gray-900 overflow-hidden flex-shrink-0 border border-white/5">
                    <img src={product.images[0]} className="w-full h-full object-cover transition-all group-hover:scale-110" alt={product.name} />
                  </div>
                  <div className="flex-1 space-y-1 text-center md:text-left py-4 md:py-0">
                    <h3 className="font-bold text-white text-lg">{product.name}</h3>
                    <div className="flex items-center justify-center md:justify-start space-x-4">
                      <p className="text-[#B38728] text-[10px] font-black tracking-widest uppercase">₦{product.price.toLocaleString()}</p>
                      <span className="w-px h-3 bg-gray-800"></span>
                      <p className={`text-[10px] font-black tracking-widest uppercase ${product.stock <= 5 ? 'text-red-500' : 'text-gray-500'}`}>{product.stock} in Stock</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => handleEdit(product)} className="px-6 py-2 border border-gray-800 text-[9px] uppercase font-black hover:border-white transition-all">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="px-6 py-2 border border-red-900/20 text-red-900 text-[9px] uppercase font-black hover:bg-red-900 hover:text-white transition-all">Remove</button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="py-32 text-center border border-dashed border-white/10 space-y-6">
                  <div className="max-w-md mx-auto space-y-4">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Your Boutique is Empty</p>
                    <h2 className="text-2xl font-luxury font-black text-white">Start Your Collection</h2>
                    <button onClick={() => { setEditingProduct(null); setIsFormOpen(true); }} className="gold-bg text-black px-12 py-4 text-[10px] font-black uppercase tracking-widest mt-6">Upload First Product</button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Projected Revenue', value: `₦${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}`, color: 'gold-gradient' },
                { label: 'Active Orders', value: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length, color: 'text-white' },
                { label: 'Success Rate', value: `${orders.length > 0 ? Math.round((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100) : 0}%`, color: 'text-white' }
              ].map((stat, i) => (
                <div key={i} className="bg-black border border-white/5 p-10 text-center space-y-3">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">{stat.label}</p>
                  <p className={`text-4xl font-luxury ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-black border border-white/5 p-10 space-y-8 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-[#B38728] font-black text-xl tracking-tighter">ORDER #: {order.id.slice(-6).toUpperCase()}</span>
                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-none ${
                          order.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-500' :
                          order.status === 'Delivered' ? 'bg-green-900/30 text-green-500' : 'bg-blue-900/30 text-blue-500'
                        }`}>{order.status}</span>
                      </div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-medium">Recorded: {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-6 w-full md:w-auto">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className="bg-[#050505] border border-white/10 text-[9px] uppercase font-black px-6 py-3 outline-none focus:border-[#B38728] text-white cursor-pointer"
                      >
                        {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="text-2xl font-bold font-luxury text-white">₦{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-white/5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] text-gray-600 font-bold uppercase">Qty: {item.quantity}</span>
                          <span className="text-[9px] text-gray-600 font-bold uppercase">| Size: {item.size || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="absolute inset-0 bg-black/95" onClick={handleCloseForm}></div>
          <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-2xl p-10 md:p-14 overflow-y-auto max-h-[90vh] shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-luxury font-black mb-12 gold-gradient text-center uppercase tracking-[0.4em]">{editingProduct ? 'Update Item' : 'New Collection Item'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Product Photography</label>
                <div className="grid grid-cols-4 gap-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square border border-white/5 bg-black overflow-hidden group">
                      <img src={src} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                  {!isOptimizing && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border border-dashed border-gray-800 flex items-center justify-center text-gray-700 hover:border-[#B38728] hover:text-[#B38728] transition-all font-black">+</button>
                  )}
                  {isOptimizing && (
                    <div className="aspect-square border border-dashed border-[#B38728] flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-[#B38728] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" multiple />
              </div>
              
              <div className="space-y-6">
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-gray-800 py-4 text-white outline-none focus:border-[#B38728] transition-colors" placeholder="ITEM NAME" />
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase text-gray-600 font-black">Price (₦)</label>
                    <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-transparent border-b border-gray-800 py-4 text-white outline-none focus:border-[#B38728] transition-colors" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase text-gray-600 font-black">Stock Quantity</label>
                    <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-transparent border-b border-gray-800 py-4 text-white outline-none focus:border-[#B38728] transition-colors" placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase text-gray-600 font-black">Available Sizes (Comma separated)</label>
                    <input type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full bg-transparent border-b border-gray-800 py-4 text-white outline-none focus:border-[#B38728] transition-colors" placeholder="S, M, L, XL" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase text-gray-600 font-black">Available Colors (Comma separated)</label>
                    <input type="text" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="w-full bg-transparent border-b border-gray-800 py-4 text-white outline-none focus:border-[#B38728] transition-colors" placeholder="Black, Navy, Grey" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] uppercase text-gray-600 font-black">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-transparent border-b border-gray-800 py-4 text-white outline-none focus:border-[#B38728] transition-colors uppercase font-black text-[10px]">
                    {categories.map(cat => <option key={cat} value={cat} className="bg-black">{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] uppercase text-gray-600 font-black">Description</label>
                  <textarea rows={2} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-transparent border-b border-gray-800 py-4 text-white outline-none focus:border-[#B38728] transition-colors resize-none" placeholder="Fabric, fit, and style details..."></textarea>
                </div>
              </div>

              <div className="flex space-x-6 pt-6">
                <button type="submit" disabled={isSyncing || isOptimizing} className="flex-1 gold-bg text-black py-5 font-black uppercase text-[10px] tracking-[0.3em] hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-[#B38728]/10">
                  {isSyncing ? 'Processing...' : 'Save Product'}
                </button>
                <button type="button" onClick={handleCloseForm} className="px-12 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
