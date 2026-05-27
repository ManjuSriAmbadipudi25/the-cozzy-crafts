import React, { useState, useEffect } from 'react';
import { 
  getProducts, 
  saveProduct, 
  deleteProduct, 
  getCategories, 
  saveCategory, 
  getBanners, 
  saveBanner, 
  getReviews, 
  addReview, 
  getOrders, 
  createOrder, 
  updateOrderStatus 
} from './firebase/dbService';
import { Product, Category, Banner, Order, Review } from './types';

// Firebase Auth Primitives
import { auth } from './firebase/config';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';
import AdminPanel from './components/AdminPanel';
import { LoginView, UnauthorizedView, LuxuryLoader } from './components/LoginView';

// Icons
import { Star, Sparkles, Filter, ChevronRight, Heart, Gift, ShoppingBag, LogOut } from 'lucide-react';

export default function App() {
  // Navigation (Adding luxury tabs login & unauthorized)
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'cart' | 'wishlist' | 'admin' | 'product-detail' | 'login' | 'unauthorized'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Core Data Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProductReviews, setSelectedProductReviews] = useState<Review[]>([]);

  // Filtering / Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low-high' | 'price-high-low' | 'rating'>('featured');

  // Customer Shopping State
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- GOOGLE SIGN IN SUBSCRIPTION ---
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      setAuthLoading(false);
      
      if (firebaseUser) {
        if (firebaseUser.email === 'cozzyspace1@gmail.com') {
          setIsAdminMode(true);
        } else {
          setIsAdminMode(false);
        }
      } else {
        setIsAdminMode(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- REDIRECT OR AUTHORIZE MIDDLEWARE GUARD ---
  useEffect(() => {
    if (activeTab === 'admin') {
      if (!authLoading) {
        if (!currentUser) {
          // Unauthenticated -> redirect to cozy luxury login
          setActiveTab('login');
        } else if (currentUser.email !== 'cozzyspace1@gmail.com') {
          // Authenticated but unauthorized -> show access restricted
          setActiveTab('unauthorized');
        }
      }
    }
  }, [activeTab, currentUser, authLoading]);

  // Auth Methods
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (!auth) {
        throw new Error("Our artisan workshop is not ready for network sign-in yet.");
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      if (result?.user) {
        if (result.user.email === 'cozzyspace1@gmail.com') {
          setIsAdminMode(true);
          setActiveTab('admin');
        } else {
          setIsAdminMode(false);
          setActiveTab('unauthorized');
        }
      }
    } catch (e: any) {
      console.error("Sign-in error:", e);
      setAuthError(e.message || "An unexpected error occurred during Google Sign-In.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      if (auth) {
        await signOut(auth);
      }
      setIsAdminMode(false);
      setActiveTab('home');
    } catch (e: any) {
      console.error("Sign-out error:", e);
    } finally {
      setAuthLoading(false);
    }
  };

  // --- INITIAL DATA PERSISTENCE LOOPS ---
  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await getProducts();
        setProducts(prodData || []);
      } catch (e) {
        console.error("Failed to load products:", e);
      }

      try {
        const catData = await getCategories();
        setCategories(catData || []);
      } catch (e) {
        console.error("Failed to load categories:", e);
      }

      try {
        const banData = await getBanners();
        setBanners(banData || []);
      } catch (e) {
        console.error("Failed to load banners:", e);
      }

      // We do not load orders here automatically because guest users do not have access to view total orders.
      // Orders are instead lazily loaded on admin panel entry below.
    }
    loadData();

    // LocalStorage load for basket and wishlist
    const storeCart = localStorage.getItem('cozzyspace_cart_items');
    if (storeCart) {
      try { setCartItems(JSON.parse(storeCart)); } catch (e) {}
    }
    const storeWish = localStorage.getItem('cozzyspace_wish_items');
    if (storeWish) {
      try { setWishlist(JSON.parse(storeWish)); } catch (e) {}
    }
  }, []);

  // Lazy-load administrative orders only when the authorized admin is authenticated
  useEffect(() => {
    if (isAdminMode && currentUser?.email === 'cozzyspace1@gmail.com') {
      async function fetchAdminOrders() {
        try {
          const ordData = await getOrders();
          setOrders(ordData || []);
        } catch (e) {
          console.warn("Could not load administrative orders (user might not be authenticated as admin):", e);
        }
      }
      fetchAdminOrders();
    }
  }, [isAdminMode, currentUser, activeTab]);

  // Sync back shopping state on edit
  const saveCartToStorage = (updatedCart: typeof cartItems) => {
    setCartItems(updatedCart);
    localStorage.setItem('cozzyspace_cart_items', JSON.stringify(updatedCart));
  };

  const saveWishToStorage = (updatedWish: string[]) => {
    setWishlist(updatedWish);
    localStorage.setItem('cozzyspace_wish_items', JSON.stringify(updatedWish));
  };

  // Keep reviews synced when a product is clicked
  useEffect(() => {
    if (selectedProductId) {
      async function loadActiveReviews() {
        try {
          const revs = await getReviews(selectedProductId || "");
          setSelectedProductReviews(revs || []);
        } catch (e) {
          console.error("Failed to load active product reviews:", e);
        }
      }
      loadActiveReviews();
    }
  }, [selectedProductId, products]);

  // --- INTERACTIVE METHODS ---

  const handleAddToCart = (product: Product, quantity: number = 1, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    const existingIdx = cartItems.findIndex(item => item.product.id === product.id);
    const updated = [...cartItems];

    if (existingIdx >= 0) {
      const newQty = Math.min(product.stock, updated[existingIdx].quantity + quantity);
      updated[existingIdx].quantity = newQty;
    } else {
      updated.push({ product, quantity: Math.min(product.stock, quantity) });
    }

    saveCartToStorage(updated);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    const updated = cartItems.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.min(item.product.stock, quantity) };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  const handleRemoveCartItem = (productId: string) => {
    const updated = cartItems.filter(item => item.product.id !== productId);
    saveCartToStorage(updated);
  };

  const handleToggleFavorite = (productId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter(id => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    saveWishToStorage(updated);
  };

  // PLACE SECURE ORDER (CART WRITING TO FIRESTORE)
  const handlePlaceOrder = async (customerData: {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
  }): Promise<string> => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const shipping = subtotal > 150 ? 0 : 9.99;
    const grandTotal = subtotal + shipping;

    const orderItemsRecord = cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images[0]
    }));

    const generatedId = 'cozzy-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const finalOrder: Order = {
      id: generatedId,
      customerName: customerData.customerName,
      customerEmail: customerData.customerEmail,
      shippingAddress: customerData.shippingAddress,
      items: orderItemsRecord,
      totalAmount: grandTotal,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await createOrder(finalOrder);
    
    // Refresh admin list inside application state only if authenticated as authorized admin
    if (isAdminMode && currentUser?.email === 'cozzyspace1@gmail.com') {
      try {
        const ords = await getOrders();
        setOrders(ords || []);
      } catch (e) {
        console.log("Could not reload orders collection even in admin mode:", e);
      }
    }

    // Local update of products in memory (adjusting stock levels)
    const refreshedProds = await getProducts();
    setProducts(refreshedProds || []);

    return generatedId;
  };

  const handleClearCart = () => {
    saveCartToStorage([]);
  };

  // --- PORTAL DYNAMIC ADMIN REFRESHERS ---

  const handleSaveProduct = async (product: Product) => {
    await saveProduct(product);
    const updated = await getProducts();
    setProducts(updated || []);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    const updated = await getProducts();
    setProducts(updated || []);
    // if deleting active detail product, return back
    if (selectedProductId === id) {
      setSelectedProductId(null);
      setActiveTab('shop');
    }
  };

  const handleSaveCategory = async (category: Category) => {
    await saveCategory(category);
    const updated = await getCategories();
    setCategories(updated || []);
  };

  const handleSaveBanner = async (banner: Banner) => {
    await saveBanner(banner);
    const updated = await getBanners();
    setBanners(updated || []);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    const updated = await getOrders();
    setOrders(updated || []);
  };

  const handleAddReview = async (review: Review) => {
    await addReview(review);
    
    // refresh product list (re-calculates stars in UI)
    const refreshedProducts = await getProducts();
    setProducts(refreshedProducts || []);
  };

  // --- SEARCH AND FILTERING MATRICES ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategorySlug ? p.category === selectedCategorySlug : true;

    return matchesSearch && matchesCategory;
  });

  // SORTING logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low-high') return a.price - b.price;
    if (sortBy === 'price-high-low') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    // Featured (Date order)
    return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
  });

  return (
    <div className="min-h-screen bg-cozzy-cream flex flex-col font-sans antialiased text-cozzy-cocoa" id="cozzy-app-root">
      
      {/* 1. STICKY TOP NAVBAR HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // if we are searching and change tabs, keep search query except click other modules
          if (tab !== 'shop') setSearchQuery('');
        }}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. DYNAMIC WORKSPACE PORTAL CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        
        {/* TAB SWITCHING ROUTER ELEMENT */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-10 animate-soft-fade-in" id="viewport-home-tab">
            
            {/* HERO SLIDESHOW */}
            <Hero 
              banners={banners} 
              onCtaClick={(slug) => {
                setSelectedCategorySlug(slug);
                setActiveTab('shop');
              }} 
            />

            {/* ARTISAN CATEGORY BADGES GRID */}
            <div>
              <div className="text-center max-w-lg mx-auto mb-8">
                <h3 className="text-xl md:text-3xl font-serif font-semibold tracking-tight text-cozzy-cocoa">
                  Shop by Natural Category
                </h3>
                <p className="text-xs text-cozzy-taupe/85 mt-2 font-light leading-relaxed">
                  Discover curated handmade treasures designed to breathe warmth, fragrance, and soft organic beauty into your everyday physical spaces.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategorySlug(cat.slug);
                      setActiveTab('shop');
                    }}
                    className="group cursor-pointer relative h-28 sm:h-36 rounded-[24px] overflow-hidden border border-soft luxury-shadow hover:translate-y-[-2px] transition-all"
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cozzy-cocoa/75 via-cozzy-cocoa/30 to-transparent flex flex-col justify-end p-4 text-[#fff]" id="cat-card-overlay">
                      <h4 className="text-xs sm:text-sm font-serif font-bold tracking-normal">{cat.name}</h4>
                      <p className="text-[9px] uppercase tracking-wider text-cozzy-rose font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore Collection
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FEATURED / TRENDING PRODUCTS SHELF */}
            <div className="mt-4">
              <div className="flex items-end justify-between border-b border-cozzy-beige/40 pb-4 mb-8">
                <div>
                  <span className="text-[10px] text-cozzy-taupe uppercase tracking-[0.25em] font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    Hand-crafted masterpieces
                  </span>
                  <h3 className="text-2xl font-serif text-cozzy-cocoa font-semibold tracking-tight mt-1">Trending Creations</h3>
                </div>

                <button 
                  onClick={() => {
                    setSelectedCategorySlug(null);
                    setActiveTab('shop');
                  }}
                  className="text-xs text-cozzy-taupe hover:text-cozzy-cocoa flex items-center gap-1 font-bold tracking-wide uppercase transition-colors"
                >
                  View All Catalog
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 3).map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onProductClick={(id) => {
                      setSelectedProductId(id);
                      setActiveTab('product-detail');
                    }}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    isFavorite={wishlist.includes(prod.id)}
                    onToggleFavorite={(id) => handleToggleFavorite(id)}
                  />
                ))}
              </div>
            </div>

            {/* CUSTOMER SATISFACTION BANNER */}
            <div className="bg-[#f0e6dd]/25 border border-cozzy-beige/45 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left items-center my-4 shadow-2xs">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] bg-cozzy-pink px-3 py-1 rounded-full self-center md:self-start border border-cozzy-rose font-bold text-cozzy-taupe">✦ SPECIAL TOUCH</span>
                <h4 className="font-serif text-lg font-bold text-cozzy-cocoa">Sustainably Sourced, Beautifully Formated</h4>
                <p className="text-xs text-cozzy-taupe font-light leading-relaxed">We harvest raw local clays, dye with botanical petals, and knot natural flax fibers.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] bg-cozzy-pink px-3 py-1 rounded-full self-center md:self-start border border-cozzy-rose font-bold text-cozzy-taupe">✦ INDIVIDUAL AUTHENTICATION</span>
                <h4 className="font-serif text-lg font-bold text-cozzy-cocoa">One-Of-A-Kind Creations Only</h4>
                <p className="text-xs text-cozzy-taupe font-light leading-relaxed">No mass industrial molds or machines. Every piece contains real human markings and details.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] bg-cozzy-pink px-3 py-1 rounded-full self-center md:self-start border border-cozzy-rose font-bold text-cozzy-taupe">✦ SAFE PACKAGING</span>
                <h4 className="font-serif text-lg font-bold text-cozzy-cocoa">Exquisite Sensory Gift Wrapping</h4>
                <p className="text-xs text-cozzy-taupe font-light leading-relaxed font-light">Elegantly wrapped in canvas wraps, sealed with dry lavender stalks and linen ties.</p>
              </div>
            </div>

          </div>
        )}

        {/* TAB SWITCHING: SHOP GRID CATALOG */}
        {activeTab === 'shop' && (
          <div className="flex flex-col gap-6 animate-soft-fade-in" id="viewport-shop-tab">
            
            {/* Catalog header title */}
            <div className="border-b border-cozzy-beige/40 pb-5 mb-2 leading-relaxed">
              <span className="text-[10px] text-cozzy-taupe uppercase tracking-[0.2em] font-extrabold flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cozzy-taupe" />
                Find your perfect companion
              </span>
              <h2 className="text-2xl md:text-3xl font-serif text-cozzy-cocoa font-semibold tracking-tight mt-1">
                {selectedCategorySlug 
                  ? `${selectedCategorySlug.replace('-', ' ').toUpperCase()} COLLECTION` 
                  : 'ARTISAN CATALOG'}
              </h2>
            </div>

            {/* Filter sidebar split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column widgets (3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-5">
                
                {/* Category filters */}
                <div className="bg-white p-5 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex flex-col gap-3">
                  <h4 className="text-[11px] font-bold tracking-wider text-cozzy-cocoa uppercase border-b border-cozzy-beige/20 pb-2">Category selection</h4>
                  <div className="flex flex-wrap lg:flex-col gap-1.5 text-xs text-left">
                    
                    <button
                      onClick={() => setSelectedCategorySlug(null)}
                      className={`px-3 py-2 rounded-lg text-left transition-all ${!selectedCategorySlug ? 'bg-cozzy-pink font-semibold text-cozzy-taupe' : 'hover:bg-cozzy-cream/45 text-cozzy-taupe'}`}
                    >
                      All Dynamic Crafts ({products.length})
                    </button>

                    {categories.map((cat) => {
                      const count = products.filter(p => p.category === cat.slug).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategorySlug(cat.slug)}
                          className={`px-3 py-2 rounded-lg text-left transition-all flex justify-between items-center ${selectedCategorySlug === cat.slug ? 'bg-cozzy-pink font-semibold text-cozzy-taupe' : 'hover:bg-cozzy-cream/45 text-cozzy-taupe'}`}
                        >
                          <span className="capitalize">{cat.name}</span>
                          <span className="text-[10px] bg-cozzy-beige/50 px-1.5 py-0.5 rounded font-mono font-bold">{count}</span>
                        </button>
                      );
                    })}

                  </div>
                </div>

                {/* Sort Widget */}
                <div className="bg-white p-5 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex flex-col gap-3">
                  <h4 className="text-[11px] font-bold tracking-wider text-cozzy-cocoa uppercase border-b border-cozzy-beige/20 pb-2 font-bold">Sort Listings</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-cozzy-cream/35 border text-xs px-3 py-2.5 rounded-lg text-cozzy-cocoa outline-none font-semibold cursor-pointer"
                  >
                    <option value="featured">Newest Additions</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="rating">Top Customer Ratings</option>
                  </select>
                </div>

              </div>

              {/* Right Column grid list (9 cols) */}
              <div className="lg:col-span-9 flex flex-col gap-6">
                
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-cozzy-beige/35 shadow-cozzy max-w-md mx-auto">
                    <p className="text-sm text-cozzy-taupe italic">No artisan items match your active dynamic filter keywords. Try searching another organic craft!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onProductClick={(id) => {
                          setSelectedProductId(id);
                          setActiveTab('product-detail');
                        }}
                        onAddToCart={(p) => handleAddToCart(p, 1)}
                        isFavorite={wishlist.includes(prod.id)}
                        onToggleFavorite={(id) => handleToggleFavorite(id)}
                      />
                    ))}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* TAB SWITCHING: WISHLIST DRAWER */}
        {activeTab === 'wishlist' && (
          <div className="flex flex-col gap-6 animate-soft-fade-in" id="viewport-wishlist-tab">
            <div className="border-b border-cozzy-beige/40 pb-5 mb-4">
              <h2 className="text-2xl font-serif text-cozzy-cocoa tracking-tight font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-cozzy-taupe fill-current" />
                Bookmarked Crafts
              </h2>
              <p className="text-xs text-cozzy-taupe font-light mt-1">Saved favorites items waiting for purchase</p>
            </div>

            {wishlist.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col items-center max-w-md mx-auto">
                <p className="text-sm text-cozzy-taupe pb-6 font-light">Your catalog wishlist is currently empty.</p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="bg-cozzy-cocoa text-[#fff] text-xs font-semibold py-3 px-6 rounded-full uppercase"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter(p => wishlist.includes(p.id))
                  .map(prod => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onProductClick={(id) => {
                        setSelectedProductId(id);
                        setActiveTab('product-detail');
                      }}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      isFavorite={true}
                      onToggleFavorite={(id) => handleToggleFavorite(id)}
                    />
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* TAB SWITCHING: CART VIEWER */}
        {activeTab === 'cart' && !isCheckingOut && (
          <Cart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onProceedToCheckout={() => {
              setIsCheckingOut(true);
            }}
            onBackToShop={() => {
              setIsCheckingOut(false);
              setActiveTab('shop');
            }}
          />
        )}

        {/* --- CUSTOM STATE SUB-PORTALS REGISTERED DIRECTLY IN BODY --- */}
        {activeTab === 'product-detail' && selectedProductId && (
          (() => {
            const prod = products.find(p => p.id === selectedProductId);
            if (!prod) return <p className="text-center italic">Craft not found.</p>;
            return (
              <ProductDetail
                product={prod}
                onAddToCart={(p, qty) => {
                  handleAddToCart(p, qty);
                  // Dynamic confirmation alert or reroute to shopping bag
                  setActiveTab('cart');
                }}
                allProducts={products}
                onProductClick={(id) => setSelectedProductId(id)}
                reviews={selectedProductReviews}
                onAddReview={handleAddReview}
                isFavorite={wishlist.includes(prod.id)}
                onToggleFavorite={(id) => handleToggleFavorite(id)}
                onBack={() => setActiveTab('shop')}
              />
            );
          })()
        )}

        {/* Render checkout form manually in state */}
        {activeTab === 'cart' && isCheckingOut && (
          <Checkout
            cartItems={cartItems}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => setIsCheckingOut(false)}
            onClearCart={handleClearCart}
          />
        )}

        {/* VIEW REGISTRY: COZZY ARTISAN SYSTEM AUTH PORTS */}
        {authLoading && (activeTab === 'admin' || activeTab === 'login') && (
          <LuxuryLoader />
        )}

        {!authLoading && activeTab === 'login' && (
          <LoginView
            onLogin={handleGoogleSignIn}
            onBackToShop={() => setActiveTab('shop')}
            isLoading={authLoading}
            error={authError}
          />
        )}

        {!authLoading && activeTab === 'unauthorized' && (
          <UnauthorizedView
            currentUserEmail={currentUser?.email || null}
            onLogout={handleSignOut}
            onBackToShop={() => setActiveTab('shop')}
          />
        )}

        {/* TAB SWITCHING: DESIGNING THE POWER PANEL DECK */}
        {!authLoading && activeTab === 'admin' && currentUser?.email === 'cozzyspace1@gmail.com' && (
          <div className="flex flex-col gap-6 animate-soft-fade-in" id="authorized-admin-layout">
            
            {/* Elegant luxury top controller status bar containing User Details and Logout */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[28px] border border-soft luxury-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cozzy-pink border border-soft flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cozzy-taupe" />
                </div>
                <div>
                  <h3 className="serif text-lg font-medium text-cozzy-cocoa tracking-wide">Master Creator Sanctuary</h3>
                  <p className="text-[10px] text-cozzy-taupe font-mono uppercase tracking-wider">Authorized • {currentUser?.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold bg-cozzy-cream hover:bg-cozzy-pink text-cozzy-taupe border border-soft transition-all duration-300 cursor-pointer shadow-xs active:scale-95 animate-soft-fade-in"
                id="admin-logout-trigger"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Hub</span>
              </button>
            </div>

            <AdminPanel
              products={products}
              categories={categories}
              banners={banners}
              orders={orders}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onSaveCategory={handleSaveCategory}
              onSaveBanner={handleSaveBanner}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          </div>
        )}

      </main>

      {/* --- CUSTOM CART SUB-RENDER CONTROLS FOR CHECKOUT SPLIT --- */}
      {/* (If we are checking out inside the cart view, we overlay the Checkout component beautifully instead of the standard sliding bag) */}
      {(() => {
        if (activeTab === 'cart' && isCheckingOut) {
          // Handled inline in main body above securely!
        }
      })()}

      {/* 3. COZZY FEMININE LUXURY FOOTER BRANDING */}
      <footer className="bg-cozzy-cocoa text-[#fffaf7] py-12 px-6 sm:px-12 border-t border-cozzy-beige/20 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-lg font-bold tracking-wide">The Cozzy Crafts</h4>
            <p className="text-xs text-cozzy-rose/80 leading-relaxed font-light">
              Crafting premium high-end handmade artifacts since 2026. Hand-painted stonewares, organic plant aromas, and clean unspun merino knits to bring absolute wellness into elegant sanctuaries.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <h4 className="font-serif text-sm font-semibold tracking-wide text-cozzy-rose">Our Philosophy</h4>
            <ul className="flex flex-col gap-2 font-light text-gray-300">
              <li>✦ 100% Sustainable Craft Harvesting</li>
              <li>✦ Rigorous Direct Artisan Trade</li>
              <li>✦ Plant Dye Extracts & Unrefined Oils</li>
              <li>✦ Plastic-Free Recyclable Wrapping</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <h4 className="font-serif text-sm font-semibold tracking-wide text-cozzy-rose">Customer Service</h4>
            <ul className="flex flex-col gap-2 font-light text-gray-300">
              <li>Delivery & Safe Packaging Returns</li>
              <li>Care instruction card updates</li>
              <li>Custom corporate dynamic gifting</li>
              <li>Artisan profile stories & contact</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <h4 className="font-serif text-sm font-semibold tracking-wide text-cozzy-rose">Visit our Studio</h4>
            <div className="text-gray-300 leading-relaxed font-light">
              <p>Email: cozzyspace1@gmail.com</p>
              <p className="mt-1">Insta: the_cozzy_crafts</p>
              <p className="text-[10px] text-cozzy-rose font-bold block mt-3">COZZY SPACE CLOUD INC • ALL RIGHTS RESERVED © 2026</p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

// Completed with full-stack capabilities

