import React from 'react';
import { ShoppingBag, Heart, Search, User, Sparkles, Sliders } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  cartCount: number;
  wishlistCount: number;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  isAdminMode,
  setIsAdminMode,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-cozzy-cream/90 backdrop-blur-md border-b border-cozzy-beige/40 py-4 px-6 md:px-12 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* LOGO */}
        <div 
          onClick={() => setActiveTab('home')}
          className="cursor-pointer group flex flex-col items-center md:items-start"
          id="brand-logo-container"
        >
          <h1 className="text-2xl md:text-3xl font-serif tracking-wide text-cozzy-cocoa flex items-center gap-1.5 font-semibold">
            The Cozzy Crafts <span className="text-cozzy-taupe font-serif italic text-base font-light">handmade</span>
          </h1>
          <p className="text-[10px] text-cozzy-taupe tracking-[0.25em] font-sans font-medium uppercase mt-0.5 group-hover:text-cozzy-cocoa transition-colors">
            LUXURY ARTISAN COMMERCE
          </p>
        </div>

        {/* SEARCH BAR (FITS THE THEME) */}
        <div className="relative w-full md:w-80 flex items-center" id="search-input-field">
          <input
            type="text"
            placeholder="Search hand-thrown clay, cozy knits..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'shop' && activeTab !== 'home') {
                setActiveTab('shop');
              }
            }}
            className="w-full bg-cozzy-beige/45 text-cozzy-cocoa placeholder-cozzy-taupe/70 text-xs px-4 py-2.5 pl-10 rounded-full border border-transparent focus:border-cozzy-taupe/30 focus:bg-white outline-none transition-all placeholder:font-light"
          />
          <Search className="absolute left-3.5 w-3.5 h-3.5 text-cozzy-taupe/75" />
        </div>

        {/* NAVIGATION & ACTION ITEMS */}
        <div className="flex items-center gap-5 md:gap-7" id="navigation-action-bar">
          <nav className="flex items-center gap-5 sm:gap-7 text-xs font-semibold tracking-wider text-cozzy-cocoa">
            <button 
              onClick={() => setActiveTab('home')}
              className={`hover:text-cozzy-taupe transition-all uppercase py-1 relative ${activeTab === 'home' ? 'text-cozzy-taupe' : ''}`}
            >
              Home
              {activeTab === 'home' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full bg-cozzy-taupe" />}
            </button>
            <button 
              onClick={() => setActiveTab('shop')}
              className={`hover:text-cozzy-taupe transition-all uppercase py-1 relative ${activeTab === 'shop' ? 'text-cozzy-taupe' : ''}`}
            >
              Shop
              {activeTab === 'shop' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full bg-cozzy-taupe" />}
            </button>
          </nav>

          <div className="h-4 w-px bg-cozzy-beige/60" />

          {/* PORTAL INTERACTION SELECTORS */}
          <div className="flex items-center gap-4">
            
            {/* WISHLIST BUTTON */}
            <button 
              onClick={() => setActiveTab('wishlist')}
              className="relative p-1.5 text-cozzy-cocoa hover:text-cozzy-taupe transition-all group"
              title="View Wishlist"
              id="header-wishlist-button"
            >
              <Heart className={`w-5 h-5 ${activeTab === 'wishlist' ? 'fill-cozzy-taupe text-cozzy-taupe' : 'group-hover:scale-105'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cozzy-taupe text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* CART BUTTON */}
            <button 
              onClick={() => setActiveTab('cart')}
              className="relative p-1.5 text-cozzy-cocoa hover:text-cozzy-taupe transition-all group"
              title="View Cart"
              id="header-cart-button"
            >
              <ShoppingBag className={`w-5 h-5 ${activeTab === 'cart' ? 'scale-105 text-cozzy-taupe' : 'group-hover:scale-105'}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cozzy-cocoa text-[#fff] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="h-4 w-px bg-cozzy-beige/60" />

            {/* DYNAMIC ADMIN PORTAL QUICK TOGGLE */}
            <button
              onClick={() => {
                const updatedMode = !isAdminMode;
                setIsAdminMode(updatedMode);
                if (updatedMode) {
                  setActiveTab('admin');
                } else if (activeTab === 'admin') {
                  setActiveTab('home');
                }
              }}
              className={`flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all ${
                isAdminMode 
                  ? 'bg-cozzy-cocoa text-white border-cozzy-cocoa shadow-cozzy' 
                  : 'bg-white hover:bg-cozzy-beige/30 text-cozzy-taupe border-cozzy-beige/50'
              }`}
              id="admin-panel-toggle-button"
            >
              <Sparkles className="w-3.5 h-3.5 text-cozzy-rose" />
              <span>{isAdminMode ? 'Admin View' : 'Artisan Portal'}</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
