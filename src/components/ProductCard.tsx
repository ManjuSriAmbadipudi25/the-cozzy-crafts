import React from 'react';
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onProductClick: (id: string) => void;
  onAddToCart: (product: Product, event?: React.MouseEvent) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, event?: React.MouseEvent) => void;
}

export default function ProductCard({
  product,
  onProductClick,
  onAddToCart,
  isFavorite,
  onToggleFavorite
}: ProductCardProps) {
  return (
    <div 
      onClick={() => onProductClick(product.id)}
      className="group relative flex flex-col bg-white rounded-[32px] overflow-hidden border border-soft hover:border-cozzy-taupe/30 hover:-translate-y-1 transition-all duration-300 luxury-shadow hover:shadow-cozzy-lg cursor-pointer max-w-sm w-full mx-auto"
      id={`product-card-${product.id}`}
    >
      
      {/* IMAGE WRAPPER */}
      <div className="relative h-72 md:h-80 w-full overflow-hidden bg-cozzy-cream">
        
        {/* REFERRER SECURED PRODUCT CANVAS */}
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* GRADIENT INNER OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-cozzy-cocoa/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* TOP STATUS BAR ACCENTS */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
          {product.stock <= 3 && product.stock > 0 ? (
            <span className="bg-red-50 text-red-600 text-[9px] font-extrabold tracking-wider px-3 py-1 rounded-full border border-red-100 uppercase pointer-events-auto shadow-sm">
              Only {product.stock} Left
            </span>
          ) : product.stock === 0 ? (
            <span className="bg-cozzy-cocoa text-white text-[9px] font-extrabold tracking-wider px-3 py-1 rounded-full uppercase pointer-events-auto shadow-sm">
              Out of Stock
            </span>
          ) : product.rating >= 4.9 ? (
            <span className="bg-cozzy-pink text-cozzy-taupe text-[9px] font-extrabold tracking-wider px-3 py-1 rounded-full border border-cozzy-rose uppercase flex items-center gap-1 pointer-events-auto shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-orange-400" />
              Top Rated
            </span>
          ) : (
            <span />
          )}

          {/* WISHLIST HEART OVERLAY */}
          <button
            onClick={(e) => onToggleFavorite(product.id, e)}
            className={`pointer-events-auto p-2.5 rounded-full backdrop-blur-md border hover:scale-107 transition-all ${
              isFavorite 
                ? 'bg-red-50 border-red-100 text-red-500' 
                : 'bg-white/85 border-cozzy-beige/25 hover:bg-white text-cozzy-cocoa/50 hover:text-red-400'
            }`}
            title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* HOVER QUICK ACTION FOR MOUSE ENTRANCE */}
        <div className="absolute bottom-4 inset-x-4 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          {product.stock > 0 && (
            <button
              onClick={(e) => onAddToCart(product, e)}
              className="w-full bg-cozzy-cocoa/90 hover:bg-cozzy-cocoa text-[#fffaf7] text-xs font-semibold uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-cozzy-rose transition-all border border-white/10"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* METADATA WRAPPER */}
      <div className="p-5 flex flex-col flex-grow gap-2.5">
        
        {/* CATEGORY & STAR LEVEL */}
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-cozzy-taupe">
          <span>{product.category.replace('-', ' ')}</span>
          <div className="flex items-center gap-1 text-cozzy-cocoa">
            <Star className="w-3.5 h-3.5 fill-current text-amber-400 border-none" />
            <span className="font-extrabold">{product.rating}</span>
          </div>
        </div>

        {/* NAME AND ARTISAN */}
        <div className="flex flex-col gap-0.5" id={`product-info-${product.id}`}>
          <h3 className="text-cozzy-cocoa font-serif text-lg tracking-normal font-medium leading-tight line-clamp-1 group-hover:text-cozzy-taupe transition-colors">
            {product.name}
          </h3>
          {product.handmadeBy && (
            <p className="text-[10px] italic text-cozzy-taupe/90">
              handmade by {product.handmadeBy}
            </p>
          )}
        </div>

        {/* BOTTOM PRICE ROW */}
        <div className="mt-auto pt-3 border-t border-cozzy-beige/25 flex items-center justify-between">
          <span className="text-cozzy-cocoa text-lg font-serif font-semibold">
            ${product.price.toFixed(2)}
          </span>
          
          <span className="text-[10px] tracking-wider text-cozzy-taupe font-medium uppercase">
            {product.stock > 0 ? `${product.stock} available` : 'Restocking Soon'}
          </span>
        </div>

      </div>

    </div>
  );
}
