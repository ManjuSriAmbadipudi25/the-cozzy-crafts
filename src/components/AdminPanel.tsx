import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit, Save, Sliders, ClipboardList, TrendingUp, Sparkles, Image as ImageIcon,
  FolderOpen, Layers, X, DollarSign, Package, Check, RefreshCw, Eye
} from 'lucide-react';
import { Product, Category, Banner, Order } from '../types';

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  orders: Order[];
  onSaveProduct: (p: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onSaveCategory: (c: Category) => Promise<void>;
  onSaveBanner: (b: Banner) => Promise<void>;
  onUpdateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
}

const LUXURY_PRESETS = [
  'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop'
];

export default function AdminPanel({
  products,
  categories,
  banners,
  orders,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  onSaveBanner,
  onUpdateOrderStatus
}: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'analytics' | 'products' | 'categories' | 'banners' | 'orders'>('analytics');

  // --- PRODUCT MANAGEMENT STATES ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodFormId, setProdFormId] = useState('');
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState(0);
  const [prodFormCategory, setProdFormCategory] = useState('');
  const [prodFormStock, setProdFormStock] = useState(10);
  const [prodFormHandmadeBy, setProdFormHandmadeBy] = useState('Sophie Martin');
  const [prodFormImages, setProdFormImages] = useState<string[]>([]);
  const [newImgInput, setNewImgInput] = useState('');

  // --- CLOUDINARY UPLOADER & CROP STATES ---
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(() => localStorage.getItem('cozzy_cloudinary_cloud_name') || '');
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(() => localStorage.getItem('cozzy_cloudinary_upload_preset') || '');
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);
  const [showCloudinaryConfig, setShowCloudinaryConfig] = useState(false);
  const [cropPreset, setCropPreset] = useState<'square' | 'portrait' | 'landscape'>('square');

  // --- CATEGORY STATES ---
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // --- BANNER STATES ---
  const [banTitle, setBanTitle] = useState('');
  const [banSubtitle, setBanSubtitle] = useState('');
  const [banBadge, setBanBadge] = useState('LUXURY HANDMADE');
  const [banImage, setBanImage] = useState('');
  const [banLink, setBanLink] = useState('');

  // Toast status states
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- ANALYTICS METRICS ---
  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  
  const productsStockAlert = products.filter(p => p.stock <= 3);

  // --- CLOUDINARY & LOCAL MULTI-IMAGE FILE UPLOADER ---
  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if Cloudinary configuration exists
    if (cloudinaryCloudName.trim() && cloudinaryUploadPreset.trim()) {
      setIsUploadingCloudinary(true);
      triggerToast("Uploading to Cloudinary...");
      
      const fileList = Array.from(files);
      let successCount = 0;

      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryUploadPreset.trim());

        try {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName.trim()}/image/upload`, {
            method: 'POST',
            body: formData
          });

          if (res.ok) {
            const data = await res.json();
            if (data.secure_url) {
              setProdFormImages(prev => [...prev, data.secure_url]);
              successCount++;
            }
          } else {
            console.warn("Cloudinary error response. Falling back to local Base64 reading.");
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                setProdFormImages(prev => [...prev, reader.result as string]);
              }
            };
            reader.readAsDataURL(file);
          }
        } catch (err) {
          console.error("Cloudinary request failed:", err);
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setProdFormImages(prev => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }

      setIsUploadingCloudinary(false);
      triggerToast(successCount > 0 ? `Successfully uploaded ${successCount} image(s) to Cloudinary!` : "Uploaded local image(s) via secure fallback.");
    } else {
      // Standard local fallback (Base64)
      triggerToast("Reading local disk... (Config Cloudinary above for production cloud storage)");
      (Array.from(files) as File[]).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setProdFormImages(prev => [...prev, reader.result as string]);
            triggerToast("Image added as high-fidelity Base64!");
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // --- ACTION SUBMISSIONS ---
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormName || !prodFormCategory || prodFormPrice <= 0) {
      triggerToast("Please fill all required product details!");
      return;
    }

    const payloadImages = prodFormImages.length > 0 
      ? prodFormImages 
      : [LUXURY_PRESETS[0]];

    const matchedSlug = prodFormName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const targetProduct: Product = {
      id: prodFormId || 'prod-' + Date.now(),
      name: prodFormName,
      slug: matchedSlug,
      description: prodFormDesc || 'No custom description set.',
      price: Number(prodFormPrice),
      images: payloadImages,
      category: prodFormCategory,
      stock: Number(prodFormStock),
      handmadeBy: prodFormHandmadeBy,
      rating: editingProduct?.rating || 5.0,
      reviewsCount: editingProduct?.reviewsCount || 0,
      createdAt: editingProduct?.createdAt || new Date().toISOString()
    };

    await onSaveProduct(targetProduct);
    triggerToast(editingProduct ? "Creative listing updated!" : "New craft listed successfully!");
    
    // reset form
    setEditingProduct(null);
    setProdFormId('');
    setProdFormName('');
    setProdFormDesc('');
    setProdFormPrice(0);
    setProdFormCategory('');
    setProdFormStock(10);
    setProdFormHandmadeBy('Sophie Martin');
    setProdFormImages([]);
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setProdFormId(p.id);
    setProdFormName(p.name);
    setProdFormDesc(p.description);
    setProdFormPrice(p.price);
    setProdFormCategory(p.category);
    setProdFormStock(p.stock);
    setProdFormHandmadeBy(p.handmadeBy || 'Sophie Martin');
    setProdFormImages(p.images);
    triggerToast(`Loaded: ${p.name}`);
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: catName,
      slug: slug,
      image: catImage || LUXURY_PRESETS[1],
      description: catDesc || 'Premium artisan catalog'
    };

    await onSaveCategory(newCat);
    triggerToast(`Category "${catName}" added!`);
    setCatName('');
    setCatDesc('');
    setCatImage('');
  };

  const handleAddBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banTitle) return;

    const newBanner: Banner = {
      id: 'ban-' + Date.now(),
      title: banTitle,
      subtitle: banSubtitle,
      badge: banBadge,
      image: banImage || LUXURY_PRESETS[5],
      link: banLink || 'ceramic-and-clay',
      isActive: true
    };

    await onSaveBanner(newBanner);
    triggerToast(`Hero banner customizer saved!`);
    setBanTitle('');
    setBanSubtitle('');
    setBanBadge('LUXURY HANDMADE');
    setBanImage('');
    setBanLink('');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4" id="artisan-dashboard-panel">
      
      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cozzy-cocoa text-white text-xs py-3 px-4 rounded-xl border border-cozzy-taupe/10 shadow-cozzy-lg animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cozzy-rose" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-cozzy-beige/40 pb-5 mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-cozzy-cocoa tracking-tight font-semibold flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cozzy-taupe" strokeWidth={1.5} />
            Artisan Studio Control
          </h2>
          <p className="text-xs text-cozzy-taupe font-light mt-1">
            Real-time management dashboard for uploading crafts, setting sliders, and processing client invoices
          </p>
        </div>

        {/* ADMIN TAB NAVIGATION BAR */}
        <div className="flex items-center gap-1.5 bg-cozzy-beige/35 p-1 rounded-xl border border-cozzy-beige/25">
          <button
            onClick={() => setAdminTab('analytics')}
            className={`text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${adminTab === 'analytics' ? 'bg-white text-cozzy-cocoa shadow-2xs' : 'text-cozzy-taupe hover:text-cozzy-cocoa'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setAdminTab('products')}
            className={`text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${adminTab === 'products' ? 'bg-white text-cozzy-cocoa shadow-2xs' : 'text-cozzy-taupe hover:text-cozzy-cocoa'}`}
          >
            Products
          </button>
          <button
            onClick={() => setAdminTab('categories')}
            className={`text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${adminTab === 'categories' ? 'bg-white text-cozzy-cocoa shadow-2xs' : 'text-cozzy-taupe hover:text-cozzy-cocoa'}`}
          >
            Categories
          </button>
          <button
            onClick={() => setAdminTab('banners')}
            className={`text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${adminTab === 'banners' ? 'bg-white text-cozzy-cocoa shadow-2xs' : 'text-cozzy-taupe hover:text-cozzy-cocoa'}`}
          >
            Banners
          </button>
          <button
            onClick={() => setAdminTab('orders')}
            className={`text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${adminTab === 'orders' ? 'bg-white text-cozzy-cocoa shadow-2xs' : 'text-cozzy-taupe hover:text-cozzy-cocoa'}`}
          >
            Orders
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="ml-1 bg-cozzy-taupe text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold">{orders.filter(o => o.status === 'pending').length}</span>
            )}
          </button>
        </div>
      </div>

      {/* --- TAB CONTENT 1: ANALYTICS INDEX --- */}
      {adminTab === 'analytics' && (
        <div className="flex flex-col gap-8 animate-soft-fade-in" id="panel-tab-analytics">
          
          {/* Main indicators grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-5 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cozzy-taupe uppercase tracking-wider font-semibold">Total Revenue</span>
                <p className="text-2xl font-serif font-extrabold text-cozzy-cocoa mt-1">${totalSales.toFixed(2)}</p>
                <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">100% genuine</span>
              </div>
              <div className="p-3 bg-cozzy-pink rounded-xl text-cozzy-taupe">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cozzy-taupe uppercase tracking-wider font-semibold">Total Orders</span>
                <p className="text-2xl font-serif font-extrabold text-cozzy-cocoa mt-1">{orders.length} orders</p>
                <span className="text-[9px] text-cozzy-taupe bg-cozzy-beige px-2 py-0.5 rounded mt-2 inline-block">All checkouts verified</span>
              </div>
              <div className="p-3 bg-cozzy-beige/50 rounded-xl text-cozzy-taupe">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cozzy-taupe uppercase tracking-wider font-semibold">Unique Designs</span>
                <p className="text-2xl font-serif font-extrabold text-cozzy-cocoa mt-1">{products.length} listed</p>
                <span className="text-[9px] text-cozzy-taupe bg-cozzy-beige px-2 py-0.5 rounded mt-2 inline-block">across {categories.length} categories</span>
              </div>
              <div className="p-3 bg-cozzy-beige/50 rounded-xl text-cozzy-taupe">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cozzy-taupe uppercase tracking-wider font-semibold">Stock Alerts</span>
                <p className="text-2xl font-serif font-bold text-red-600 mt-1">{productsStockAlert.length} Warn</p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded mt-2 inline-block ${
                  productsStockAlert.length > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {productsStockAlert.length > 0 ? 'Replenish soon' : 'All fully stocked'}
                </span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-red-500">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Sibling columns split in analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Low stock table summary */}
            <div className="bg-white p-6 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex flex-col gap-4">
              <h3 className="text-sm font-bold text-cozzy-cocoa uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-cozzy-taupe" />
                Craft Inventory Status Warnings
              </h3>
              
              {productsStockAlert.length === 0 ? (
                <p className="text-xs text-cozzy-taupe italic py-4 text-center">No inventory depleted! High luxury stock coverage.</p>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-cozzy-beige/20 text-[10px] uppercase text-cozzy-taupe font-bold tracking-wider">
                        <th className="py-2.5">Product Name</th>
                        <th className="py-2.5 text-center">Remaining Stock</th>
                        <th className="py-2.5 text-right">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cozzy-beige/10">
                      {productsStockAlert.map(p => (
                        <tr key={p.id} className="text-cozzy-cocoa">
                          <td className="py-3 font-semibold font-serif">{p.name}</td>
                          <td className="py-3 text-center">
                            <span className="font-extrabold bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px]">{p.stock} units</span>
                          </td>
                          <td className="py-3 text-right font-medium">${p.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent orders overview list */}
            <div className="bg-white p-6 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex flex-col gap-4">
              <h3 className="text-sm font-bold text-cozzy-cocoa uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-cozzy-taupe" />
                Latest Artisan Orders
              </h3>

              {orders.length === 0 ? (
                <p className="text-xs text-cozzy-taupe italic py-4 text-center">No transactions registered yet. Try checking out an item!</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.slice(-4).reverse().map(order => (
                    <div key={order.id} className="text-xs p-3.5 rounded-xl bg-cozzy-cream/35 border border-cozzy-beige/25 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold uppercase text-cozzy-cocoa">{order.id}</span>
                          <span className="italic text-[10px] text-cozzy-taupe">by {order.customerName}</span>
                        </div>
                        <p className="text-[10px] text-cozzy-taupe mt-1">{order.items.length} artisan crafts • ${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        order.status === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* --- TAB CONTENT 2: PRODUCTS CREATION & MANAGEMENT LIST --- */}
      {adminTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-soft-fade-in" id="panel-tab-products">
          
          {/* Create/Edit Product Form (Left, 5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col gap-4">
            <h3 className="text-base font-serif font-semibold text-cozzy-cocoa flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-cozzy-taupe" />
              {editingProduct ? 'Edit Craft Listing' : 'List New Crafted Item'}
            </h3>

            <form onSubmit={handleSaveProductSubmit} className="flex flex-col gap-4 text-xs">
              
              {/* Product name */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-cozzy-cocoa uppercase">Product Name *</label>
                <input
                  type="text"
                  value={prodFormName}
                  onChange={(e) => setProdFormName(e.target.value)}
                  placeholder="E.g., Sweet Sage Botanical Smudge"
                  className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                  required
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-cozzy-cocoa uppercase">Price ($ USD) *</label>
                  <input
                    type="number"
                    value={prodFormPrice || ''}
                    onChange={(e) => setProdFormPrice(Number(e.target.value))}
                    placeholder="34.00"
                    className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                    min="0.1"
                    step="0.01"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-cozzy-cocoa uppercase">Stock Level *</label>
                  <input
                    type="number"
                    value={prodFormStock}
                    onChange={(e) => setProdFormStock(Number(e.target.value))}
                    placeholder="10"
                    className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-cozzy-cocoa uppercase font-semibold">Category ID *</label>
                  <select
                    value={prodFormCategory}
                    onChange={(e) => setProdFormCategory(e.target.value)}
                    className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-cozzy-cocoa uppercase">Handmade By</label>
                  <input
                    type="text"
                    value={prodFormHandmadeBy}
                    onChange={(e) => setProdFormHandmadeBy(e.target.value)}
                    placeholder="Aurelia Dupont"
                    className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-cozzy-cocoa uppercase">Artisan Item Story</label>
                <textarea
                  value={prodFormDesc}
                  onChange={(e) => setProdFormDesc(e.target.value)}
                  placeholder="Detail the materials used (merino wool, speckle oatmeal clay), custom dual colors, textures..."
                  rows={4}
                  className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2 link-none rounded-lg border border-cozzy-beige/30 outline-none resize-none"
                />
              </div>

              {/* --- ADVANCED MULTIPICTURE IMAGES DRAG / PRESENTS PANEL --- */}
              <div className="flex flex-col gap-3.5 border-t border-cozzy-beige/15 pt-4">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-cozzy-cocoa uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-cozzy-taupe" />
                    <span>Product Imagery Cabinet *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCloudinaryConfig(!showCloudinaryConfig)}
                    className="text-[10px] text-cozzy-taupe hover:text-cozzy-cocoa font-bold uppercase underline"
                  >
                    {showCloudinaryConfig ? "Hide Cloudinary Setup" : "Cloudinary Config (Optional)"}
                  </button>
                </div>

                {/* Persist Cloudinary Configuration Drawer */}
                {showCloudinaryConfig && (
                  <div className="bg-cozzy-cream/45 p-4 rounded-xl border border-cozzy-beige/30 flex flex-col gap-3 text-[11px] animate-soft-fade-in animate-duration-300">
                    <p className="font-medium text-cozzy-cocoa">
                      Configure your standard Client-Side Unsigned Cloudinary Uploads:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-cozzy-cocoa uppercase text-[9px]">Cloud Name</label>
                        <input
                          type="text"
                          value={cloudinaryCloudName}
                          onChange={(e) => {
                            setCloudinaryCloudName(e.target.value);
                            localStorage.setItem('cozzy_cloudinary_cloud_name', e.target.value);
                          }}
                          placeholder="e.g. cozyartisan"
                          className="bg-white text-cozzy-cocoa p-2 rounded border border-cozzy-beige/35 outline-none font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-cozzy-cocoa uppercase text-[9px]">Unsigned preset</label>
                        <input
                          type="text"
                          value={cloudinaryUploadPreset}
                          onChange={(e) => {
                            setCloudinaryUploadPreset(e.target.value);
                            localStorage.setItem('cozzy_cloudinary_upload_preset', e.target.value);
                          }}
                          placeholder="e.g. cozy_preset"
                          className="bg-white text-cozzy-cocoa p-2 rounded border border-cozzy-beige/35 outline-none font-mono"
                        />
                      </div>
                    </div>
                    <div className="text-[10px] text-cozzy-taupe font-light leading-relaxed mt-1">
                      <ol className="list-decimal pl-4.5 flex flex-col gap-0.5">
                        <li>Register a free account at <strong className="font-semibold text-cozzy-cocoa">cloudinary.com</strong></li>
                        <li>Head to Settings &gt; Upload and toggle on <strong className="font-semibold text-cozzy-cocoa">Enable unsigned uploads</strong></li>
                        <li>Set a preset or read your default name, and enter them above!</li>
                      </ol>
                      {cloudinaryCloudName.trim() && cloudinaryUploadPreset.trim() ? (
                        <p className="text-emerald-700 font-bold mt-2 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Cloudinary Live Uploading is ACTIVE! Feel free to upload.
                        </p>
                      ) : (
                        <p className="text-cozzy-taupe/90 italic mt-2">
                          No credentials? No worries! Files will automatically convert to reliable, high-fidelity Base64 strings.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Aspect Ratio Crop Guidelines Config */}
                <div className="flex flex-col gap-1.5 bg-cozzy-cream/25 p-3 rounded-xl border border-cozzy-beige/10">
                  <span className="text-[10px] font-bold text-cozzy-cocoa uppercase tracking-wide">
                    Crop-Ready Aspect Ratio Guidelines
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCropPreset('square')}
                      className={`py-1.5 px-2 rounded-lg border text-[10px] uppercase font-bold transition-all ${
                        cropPreset === 'square' ? 'bg-cozzy-cocoa text-white' : 'bg-white text-cozzy-taupe border-cozzy-beige/35'
                      }`}
                    >
                      Square (1:1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropPreset('portrait')}
                      className={`py-1.5 px-2 rounded-lg border text-[10px] uppercase font-bold transition-all ${
                        cropPreset === 'portrait' ? 'bg-cozzy-cocoa text-white' : 'bg-white text-cozzy-taupe border-cozzy-beige/35'
                      }`}
                    >
                      Portrait (3:4)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropPreset('landscape')}
                      className={`py-1.5 px-2 rounded-lg border text-[10px] uppercase font-bold transition-all ${
                        cropPreset === 'landscape' ? 'bg-cozzy-cocoa text-white' : 'bg-white text-cozzy-taupe border-cozzy-beige/35'
                      }`}
                    >
                      Banner (16:9)
                    </button>
                  </div>
                </div>

                {/* Preset quick button selections */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-cozzy-taupe font-semibold block">Quick Preset Swatches (safe library):</span>
                  <div className="flex flex-wrap gap-2">
                    {LUXURY_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!prodFormImages.includes(preset)) {
                            setProdFormImages(p => [...p, preset]);
                            triggerToast("Preset swatch loaded!");
                          }
                        }}
                        className="h-10 w-10 rounded-lg overflow-hidden border border-cozzy-beige/50 hover:scale-105 transition-transform"
                      >
                        <img src={preset} alt={`Preset ${idx+1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct image url adder */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Or paste standard Unsplash image URL..."
                    value={newImgInput}
                    onChange={(e) => setNewImgInput(e.target.value)}
                    className="flex-grow bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2 rounded-lg border border-cozzy-beige/30 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImgInput.trim()) {
                        setProdFormImages(p => [...p, newImgInput]);
                        setNewImgInput('');
                        triggerToast("Web icon mapped!");
                      }
                    }}
                    className="px-3 py-2 bg-cozzy-beige/45 text-cozzy-taupe hover:text-cozzy-cocoa rounded-lg border border-cozzy-beige/30"
                  >
                    Add
                  </button>
                </div>

                {/* File input drag / upload widget */}
                <div className="flex flex-col gap-1 mt-1 bg-cozzy-pink/40 border border-dashed border-cozzy-rose p-3 rounded-xl text-center">
                  {isUploadingCloudinary ? (
                    <div className="py-2 flex flex-col justify-center items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-cozzy-taupe animate-spin" />
                      <p className="text-[10px] text-cozzy-cocoa font-medium animate-pulse">Contacting Cloudinary secure servers...</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 text-cozzy-taupe mx-auto mb-1" />
                      <p className="text-[10px] text-cozzy-cocoa font-semibold">
                        {cloudinaryCloudName.trim() ? "Directly Upload to Cloudinary API" : "Upload Files to base64 Data Strings"}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleLocalImageUpload}
                        className="text-[9px] text-cozzy-taupe mx-auto mt-1 cursor-pointer w-full"
                      />
                    </>
                  )}
                </div>

                {/* Thumbnails of current file deck & Active Guidelines Preview box */}
                {prodFormImages.length > 0 && (
                  <div className="flex flex-col gap-2.5 mt-2 bg-cozzy-cream/30 p-2.5 rounded-xl border border-cozzy-beige/20">
                    <span className="text-[10px] text-cozzy-taupe/80 font-bold uppercase block">
                      Active Photo deck ({prodFormImages.length}) :
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {prodFormImages.map((img, index) => (
                        <div key={index} className="relative h-12 w-12 rounded-lg overflow-hidden border border-cozzy-beige bg-white">
                          <img src={img} alt="Current" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setProdFormImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 scale-90"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Active Visual Guidelines Guide Overlay boxes */}
                    <div className="mt-2" id="crop-guideline-preview-frame">
                      <p className="text-[9px] text-cozzy-taupe block font-semibold mb-1">
                        Active Crop Guidelines Mapping Preview ({cropPreset}):
                      </p>
                      <div className="relative border border-cozzy-beige bg-neutral-100 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                        <img
                          src={prodFormImages[prodFormImages.length - 1]}
                          alt="Primary Crop Preview"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                        {/* Simulation Overlay Box depending on Aspect Crop guide */}
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                          <div
                            className={`border-2 border-dashed border-white/95 shadow-cozzy bg-black/10 transition-all ${
                              cropPreset === 'square' ? 'aspect-square h-full w-auto' :
                              cropPreset === 'portrait' ? 'aspect-[3/4] h-full w-auto' :
                              'aspect-[16/9] w-full h-auto'
                            }`}
                          >
                            <div className="w-full h-full flex items-start justify-between p-1.5 text-[9px] text-white">
                              <span className="bg-black/60 px-1 rounded-sm tracking-wider uppercase font-extrabold">{cropPreset} crop safe</span>
                              <Check className="w-3.5 h-3.5 drop-shadow" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-cozzy-beige/25">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProdFormId('');
                      setProdFormName('');
                      setProdFormDesc('');
                      setProdFormPrice(0);
                      setProdFormCategory('');
                      setProdFormStock(10);
                      setProdFormHandmadeBy('Sophie Martin');
                      setProdFormImages([]);
                    }}
                    className="px-4 py-2 bg-white border border-cozzy-beige/50 text-cozzy-taupe rounded-xl uppercase tracking-wider text-[10px]"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 bg-cozzy-cocoa hover:bg-cozzy-taupe text-[#fff] rounded-xl font-bold uppercase tracking-wider text-[10px] shadow"
                >
                  {editingProduct ? 'Update Listing' : 'Publish Craft'}
                </button>
              </div>

            </form>
          </div>

          {/* Core Table listing (Right, 7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col gap-4">
            <h3 className="text-base font-serif font-semibold text-cozzy-cocoa">
              Active Store Creations ({products.length})
            </h3>

            <div className="flex flex-col gap-3">
              {products.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 bg-cozzy-cream/25 border border-cozzy-beige/25 rounded-2xl hover:bg-cozzy-cream/50 transition-colors gap-4"
                  id={`panel-product-row-${p.id}`}
                >
                  
                  {/* Info block */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.images[0]} alt={p.name} className="w-11 h-11 rounded-lg object-cover bg-white" />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-cozzy-cocoa truncate">{p.name}</h4>
                      <p className="text-[10px] text-cozzy-taupe uppercase tracking-wider font-semibold">
                        {p.category.replace('-', ' ')} • <span className="text-cozzy-cocoa">${p.price.toFixed(2)}</span> • stock: {p.stock}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditProductClick(p)}
                      className="p-1.5 text-cozzy-taupe hover:text-cozzy-cocoa rounded bg-white hover:bg-cozzy-beige/25 border border-cozzy-beige/20 shadow-2xs"
                      title="Edit item qualities"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onDeleteProduct(p.id);
                        triggerToast(`Creations "${p.name}" deleted.`);
                      }}
                      className="p-1.5 text-cozzy-taupe hover:text-red-600 rounded bg-white hover:bg-red-50 border border-cozzy-beige/20 shadow-2xs"
                      title="Delete creation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- TAB CONTENT 3: CATEGORIES ADDER --- */}
      {adminTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-soft-fade-in" id="panel-tab-categories">
          
          {/* Add Category Form (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col gap-4">
            <h3 className="text-base font-serif font-semibold text-cozzy-cocoa flex items-center gap-1.5">
              <FolderOpen className="w-4.5 h-4.5 text-cozzy-taupe" strokeWidth={1.5} />
              Add Dynamic Category Classification
            </h3>

            <form onSubmit={handleAddCategorySubmit} className="flex flex-col gap-4 text-xs">
              
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-cozzy-cocoa uppercase">Category Title *</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="E.g., Sweet aromatherapy"
                  className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-cozzy-cocoa uppercase">Class Description</label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Organic botanical extracts & soy bases"
                  className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-cozzy-cocoa uppercase">Category Card Banner Image (URL)</label>
                <input
                  type="text"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 bg-cozzy-cocoa hover:bg-cozzy-taupe text-[#fff] text-xs font-bold tracking-wider py-3.5 rounded-xl uppercase"
              >
                Save Category
              </button>

            </form>
          </div>

          {/* Categories List Display (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col gap-4">
            <h3 className="text-base font-serif font-semibold text-cozzy-cocoa">
              Active Category Dynamic Handlers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(c => (
                <div 
                  key={c.id} 
                  className="relative h-28 rounded-2xl overflow-hidden border border-cozzy-beige/20 shadow-2xs group cursor-default"
                >
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent flex flex-col justify-end p-4 text-white">
                    <h4 className="text-xs uppercase font-extrabold tracking-widest">{c.name}</h4>
                    <p className="text-[10px] text-gray-200 line-clamp-1 mt-0.5 font-light">{c.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- TAB CONTENT 4: BANNERS HERO SLIDES --- */}
      {adminTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-soft-fade-in" id="panel-tab-banners">
          
          {/* Banner configuration form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col gap-4">
            <h3 className="text-base font-serif font-semibold text-cozzy-cocoa flex items-center gap-1.5">
              <Layers className="w-4.5 h-4.5 text-cozzy-taupe" strokeWidth={1.5} />
              Set Dynamic Home Slider Banner
            </h3>

            <form onSubmit={handleAddBannerSubmit} className="flex flex-col gap-4 text-xs">
              
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-cozzy-cocoa uppercase">Hero Header Title *</label>
                <input
                  type="text"
                  value={banTitle}
                  onChange={(e) => setBanTitle(e.target.value)}
                  placeholder="Soft Wool Cloud Merinos"
                  className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-cozzy-cocoa uppercase">Sub-Heading Caption</label>
                <input
                  type="text"
                  value={banSubtitle}
                  onChange={(e) => setBanSubtitle(e.target.value)}
                  placeholder="Organic heavyweight blanketing stitched to warm cold rooms."
                  className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-cozzy-cocoa uppercase">Mini Badge Label</label>
                  <input
                    type="text"
                    value={banBadge}
                    onChange={(e) => setBanBadge(e.target.value)}
                    placeholder="COZY AUTUMN"
                    className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-cozzy-cocoa uppercase font-semibold">Link Filter Slug</label>
                  <select
                    value={banLink}
                    onChange={(e) => setBanLink(e.target.value)}
                    className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                  >
                    <option value="">Select Target Slug</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.slug}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-cozzy-cocoa uppercase">Slider Photo (URL)</label>
                <input
                  type="text"
                  value={banImage}
                  onChange={(e) => setBanImage(e.target.value)}
                  placeholder="Choose Unsplash or paste custom image link..."
                  className="bg-cozzy-cream/35 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-cozzy-beige/30 outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 bg-cozzy-cocoa hover:bg-cozzy-taupe text-[#fff] text-xs font-bold tracking-wider py-3.5 rounded-xl uppercase"
              >
                Add Hero Slider
              </button>

            </form>
          </div>

          {/* Active slideshow list */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col gap-4">
            <h3 className="text-base font-serif font-semibold text-cozzy-cocoa">
              Active Slideshow Sliders ({banners.length})
            </h3>

            <div className="flex flex-col gap-4">
              {banners.map(ban => (
                <div 
                  key={ban.id}
                  className="flex gap-4 p-4 bg-cozzy-cream/30 rounded-2xl border border-cozzy-beige/20 items-center justify-between"
                  id={`panel-banner-row-${ban.id}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={ban.image} alt={ban.title} className="h-14 w-20 object-cover rounded-xl" />
                    <div>
                      <h4 className="font-serif text-xs font-bold text-cozzy-cocoa leading-tight">{ban.title}</h4>
                      <p className="text-[10px] text-cozzy-taupe mt-1">Badge: <span className="font-bold text-cozzy-cocoa">{ban.badge}</span> • link: {ban.link}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] uppercase font-bold py-1 px-2.5 rounded-full ${ban.isActive ? 'bg-emerald-50 text-emerald-700 font-extrabold border-emerald-100 border' : 'bg-gray-100 text-gray-500'}`}>
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- TAB CONTENT 5: INVOICE ORDERS LOGS --- */}
      {adminTab === 'orders' && (
        <div className="bg-white p-6 rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col gap-4 animate-soft-fade-in" id="panel-tab-orders">
          <h3 className="text-base font-serif font-semibold text-cozzy-cocoa">
            Invoice Order Backlogs ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-cozzy-cream/15 rounded-2xl border border-cozzy-beige/20">
              <p className="text-xs text-cozzy-taupe italic">No e-commerce client orders have registered in the database logs yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map(order => (
                <div 
                  key={order.id}
                  className="p-5 bg-cozzy-cream/30 rounded-2xl border border-cozzy-beige/25 text-xs flex flex-col gap-3"
                  id={`panel-backlog-order-${order.id}`}
                >
                  {/* Row 1 header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cozzy-beige/20 pb-2">
                    <div>
                      <span className="font-mono text-cozzy-cocoa font-bold uppercase text-[11px] bg-cozzy-beige/40 px-2 py-0.5 rounded">ID: {order.id}</span>
                      <span className="text-[10px] text-cozzy-taupe/70 font-mono ml-2">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {/* STATUS SELECT BOX */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-cozzy-taupe font-bold uppercase">Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                        className="bg-white border rounded px-2.5 py-1 text-cozzy-cocoa font-semibold outline-none text-[11px]"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2 info split */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-light">
                    
                    {/* Buyer card */}
                    <div className="flex flex-col gap-1 bg-white/50 p-3 rounded-xl border border-cozzy-beige/10">
                      <h4 className="text-[10px] font-bold text-cozzy-cocoa uppercase tracking-wide">Client Details</h4>
                      <p className="font-bold text-cozzy-cocoa">{order.customerName}</p>
                      <p className="text-[11px] text-cozzy-taupe">{order.customerEmail}</p>
                    </div>

                    {/* Ship card */}
                    <div className="flex flex-col gap-1 bg-white/50 p-3 rounded-xl border border-cozzy-beige/10">
                      <h4 className="text-[10px] font-bold text-cozzy-cocoa uppercase tracking-wide">Shipping address</h4>
                      <p className="text-[11px] text-cozzy-cocoa leading-relaxed">{order.shippingAddress}</p>
                    </div>

                    {/* Items card */}
                    <div className="flex flex-col gap-1 bg-white/50 p-3 rounded-xl border border-cozzy-beige/10">
                      <h4 className="text-[10px] font-bold text-cozzy-cocoa uppercase tracking-wide">Bill Items</h4>
                      <div className="flex flex-col gap-1 text-[11px]">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-cozzy-cocoa">
                            <span className="line-clamp-1">{item.name} (x{item.quantity})</span>
                            <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-cozzy-beige/30 pt-1 mt-1 font-bold flex justify-between items-center text-cozzy-cocoa text-[11px]">
                          <span>Grand Total</span>
                          <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
