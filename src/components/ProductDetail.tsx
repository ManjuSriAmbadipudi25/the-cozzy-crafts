import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingBag, ArrowLeft, Plus, Minus, Sparkles, MessageSquare } from 'lucide-react';
import { Product, Review } from '../types';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  allProducts: Product[];
  onProductClick: (id: string) => void;
  reviews: Review[];
  onAddReview: (review: Review) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, event: React.MouseEvent) => void;
  onBack: () => void;
}

export default function ProductDetail({
  product,
  onAddToCart,
  allProducts,
  onProductClick,
  reviews,
  onAddReview,
  isFavorite,
  onToggleFavorite,
  onBack
}: ProductDetailProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Review inputs
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Set active thumbnail to 0 when product changes
  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    setReviewSuccess(false);
  }, [product]);

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const r: Review = {
      id: 'rev-' + Date.now(),
      productId: product.id,
      userName: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment,
      createdAt: new Date().toISOString()
    };

    onAddReview(r);
    setReviewSuccess(true);
    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);

    // clear toast after 4s
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4" id="e-product-detail-view">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-xs text-cozzy-taupe hover:text-cozzy-cocoa flex items-center gap-1.5 font-semibold uppercase mb-8 transition-all group pointer-events-auto"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to listings
      </button>

      {/* Main detail columns split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 pb-12">
        
        {/* Images carousel columns (Left, 5 cols) */}
        <div className="md:col-span-6 flex flex-col gap-4">
          
          {/* Main frame */}
          <div className="relative h-96 sm:h-[450px] w-full bg-white rounded-3xl overflow-hidden border border-cozzy-beige/25">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            
            {/* Wishlist triggers inside main detail */}
            <button
              onClick={(e) => onToggleFavorite(product.id, e)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border hover:scale-105 transition-all shadow-sm ${
                isFavorite 
                  ? 'bg-red-50 border-red-100 text-red-500' 
                  : 'bg-white/85 border-cozzy-beige/20 hover:bg-white text-cozzy-cocoa/50 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                    idx === activeImageIdx ? 'border-cozzy-taupe scale-98 shadow-sm' : 'border-transparent hover:border-cozzy-beige/50'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Product specs columns (Right, 7 cols) */}
        <div className="md:col-span-6 flex flex-col gap-6">
          
          {/* Badge & Artisan Name */}
          <div className="flex flex-col gap-2">
            <span className="inline-block self-start bg-cozzy-pink/70 text-cozzy-taupe text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider border border-cozzy-rose">
              {product.category.replace('-', ' ')}
            </span>
            
            <h2 className="text-2xl md:text-4xl font-serif text-cozzy-cocoa tracking-tight font-semibold mt-1">
              {product.name}
            </h2>

            {product.handmadeBy && (
              <p className="text-xs text-cozzy-taupe/90 italic flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                Crafted entirely by hand by {product.handmadeBy}
              </p>
            )}
          </div>

          {/* Stars */}
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current text-amber-400' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            <span className="text-xs text-cozzy-taupe font-bold">
              {product.rating} / 5 ({reviews.length} reviews)
            </span>
          </div>

          {/* Pricing */}
          <div className="border-y border-cozzy-beige/20 py-4 flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-cozzy-cocoa">
              ${product.price.toFixed(2)}
            </span>
            <span className={`text-xs uppercase font-extrabold px-3 py-1 rounded-lg ${
              product.stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-cozzy-taupe leading-relaxed font-light">
            {product.description}
          </p>

          {/* ATC and quantities */}
          {product.stock > 0 ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
              
              {/* Quantities selector */}
              <div className="flex items-center justify-between bg-white border border-cozzy-beige/50 py-2.5 px-4 rounded-xl shadow-2xs max-w-[150px]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 text-cozzy-cocoa hover:text-cozzy-taupe hover:scale-105"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-cozzy-cocoa w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-1 text-cozzy-cocoa hover:text-cozzy-taupe hover:scale-105"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* BUY TRIGGER */}
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="flex-grow bg-cozzy-cocoa hover:bg-cozzy-taupe text-[#fff] text-xs font-bold tracking-wider uppercase py-4 rounded-2xl transition-all shadow-md hover:shadow-cozzy-rose hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add {quantity} to Bag • ${(product.price * quantity).toFixed(2)}
              </button>

            </div>
          ) : (
            <div className="bg-cozzy-beige/20 text-center py-4 rounded-2xl border border-cozzy-beige/40">
              <p className="text-xs text-cozzy-taupe">This handmade edition is temporarily depleted. Click to bookmark and save!</p>
            </div>
          )}

        </div>

      </div>

      {/* Reviews listing & new reviews form */}
      <h3 className="text-xl font-serif text-cozzy-cocoa font-bold border-t border-cozzy-beige/25 pt-10 mb-8 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-cozzy-taupe" strokeWidth={1.5} />
        Customer Testimonials
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
        
        {/* Reviews Lists (Left, 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-cozzy-beige/25">
              <p className="text-xs text-cozzy-taupe italic">Be the very first patron to leave a customized review for this artisan craft!</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div 
                key={rev.id}
                className="bg-white p-5 rounded-2xl border border-cozzy-beige/20 shadow-2xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cozzy-cocoa">{rev.userName}</span>
                  <span className="text-[10px] text-cozzy-taupe/70 font-mono">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < rev.rating ? 'fill-current text-amber-400 font-bold' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>

                <p className="text-xs text-cozzy-taupe font-light mt-1 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>

        {/* Post a Review Form (Right, 5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-cozzy-beige/35 shadow-cozzy flex flex-col gap-4">
          <h4 className="text-base font-serif font-semibold text-cozzy-cocoa">
            Write a Review
          </h4>

          {reviewSuccess && (
            <div className="bg-emerald-50 text-emerald-800 text-xs py-2 px-3 rounded-lg border border-emerald-200">
              ✦ Thank you! Your verified artisan review has been registered.
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="flex flex-col gap-4 text-xs">
            
            {/* Customer name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-cozzy-cocoa uppercase tracking-normal">Your Name</label>
              <input
                type="text"
                value={newReviewName}
                onChange={(e) => setNewReviewName(e.target.value)}
                placeholder="Sofia Bellucci"
                className="bg-cozzy-beige/25 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-transparent focus:border-cozzy-taupe/40 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                required
              />
            </div>

            {/* Rating Stars Select */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-cozzy-cocoa uppercase tracking-normal">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`w-6 h-6 ${star <= newReviewRating ? 'fill-current text-amber-400 text-amber-500' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Commentary text */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-cozzy-cocoa uppercase tracking-normal">Comment</label>
              <textarea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Describe your satisfaction with the glazes, wool quality, scent distribution or premium hand-crafted packaging..."
                rows={4}
                className="bg-cozzy-beige/25 text-cozzy-cocoa px-3 py-2.5 rounded-lg border border-transparent focus:border-cozzy-taupe/40 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-350"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 bg-cozzy-cocoa hover:bg-cozzy-taupe text-white font-semibold py-3 rounded-xl uppercase tracking-wider shadow-sm transition-all"
            >
              Submit Review
            </button>

          </form>
        </div>

      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-cozzy-beige/25 pt-10">
          <h3 className="text-xl font-serif text-cozzy-cocoa font-bold mb-6">You May Also Love</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onProductClick(p.id)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-cozzy-beige/25 hover:shadow-cozzy hover:border-cozzy-taupe/20 transition-all duration-300 p-3"
              >
                <div className="h-56 w-full rounded-xl overflow-hidden bg-cozzy-cream mb-4">
                  <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-cozzy-cocoa truncate">{p.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-cozzy-cocoa font-semibold text-sm">${p.price.toFixed(2)}</span>
                  <span className="text-[10px] text-cozzy-taupe tracking-wider font-semibold uppercase">{p.category.replace('-', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
