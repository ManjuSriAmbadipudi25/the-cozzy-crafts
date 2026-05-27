import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Gift } from 'lucide-react';
import { Product } from '../types';

interface CartProps {
  cartItems: { product: Product; quantity: number }[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  onBackToShop: () => void;
}

export default function Cart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onBackToShop,
}: CartProps) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 9.99;
  const grandTotal = subtotal + shipping;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" id="e-cart-view-container">
      
      {/* Title Header with Counter */}
      <div className="flex items-center justify-between border-b border-cozzy-beige/40 pb-5 mb-8">
        <div>
          <h2 className="text-2xl font-serif text-cozzy-cocoa tracking-tight font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cozzy-taupe" strokeWidth={1.5} />
            Your Shopping Bag
          </h2>
          <p className="text-xs text-cozzy-taupe font-light mt-1">
            {cartItems.length} craft {cartItems.length === 1 ? 'item' : 'items'} ready to warm your home
          </p>
        </div>
        
        <button
          onClick={onBackToShop}
          className="text-xs text-cozzy-taupe hover:text-cozzy-cocoa flex items-center gap-1.5 font-semibold transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Shop
        </button>
      </div>

      {cartItems.length === 0 ? (
        
        /* Empty Basket State */
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col items-center max-w-lg mx-auto">
          <div className="p-5 bg-cozzy-pink rounded-full text-cozzy-taupe mb-5">
            <ShoppingBag className="w-10 h-10" strokeWidth={1.2} />
          </div>
          <h3 className="text-xl font-serif text-cozzy-cocoa font-medium mb-2">
            Your shopping bag is empty
          </h3>
          <p className="text-sm text-cozzy-taupe max-w-sm font-light mb-8 leading-relaxed">
            Browse our artisan collections of pottery, heavy merino knits, and soy aromatherapy, then add unique, cozy crafts here.
          </p>
          <button
            onClick={onBackToShop}
            className="bg-cozzy-cocoa hover:bg-cozzy-taupe text-[#fff] text-xs font-semibold tracking-wider uppercase px-8 py-3.5 rounded-full transition-all shadow-md"
          >
            Start Exploring
          </button>
        </div>

      ) : (

        /* Active Cart Layout split with checkout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart items list - Left Side 7 cols */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-cozzy-beige/25 hover:shadow-sm hover:border-cozzy-beige transition-all"
                id={`cart-item-row-${item.product.id}`}
              >
                
                {/* Product thumbnail */}
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover object-center rounded-xl bg-cozzy-cream flex-shrink-0 border border-cozzy-beige/10"
                />

                {/* Info block */}
                <div className="flex-grow min-w-0 flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-medium text-cozzy-cocoa font-serif tracking-normal line-clamp-1">
                      {item.product.name}
                    </h4>
                    
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1 text-cozzy-taupe/60 hover:text-red-500 transition-colors"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[10px] text-cozzy-taupe tracking-wider font-semibold uppercase">
                    {item.product.category.replace('-', ' ')}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-cozzy-beige/20">
                    
                    {/* QUANTITY RECONCILING ELEMENT */}
                    <div className="flex items-center gap-2.5 bg-cozzy-beige/35 py-1 px-1.5 rounded-lg border border-cozzy-beige/20">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 rounded bg-white hover:bg-white text-cozzy-cocoa hover:text-cozzy-taupe transition-all border border-cozzy-beige/20 shadow-2xs"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-cozzy-cocoa w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 rounded bg-white hover:bg-white text-cozzy-cocoa hover:text-cozzy-taupe transition-all border border-cozzy-beige/20 shadow-2xs"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-cozzy-taupe/70 block">
                        ₹{item.product.price.toFixed(2)} each
                      </span>
                      <span className="text-xs sm:text-sm font-serif font-semibold text-cozzy-cocoa">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            ))}

            {/* Premium Wrapping Incentive banner */}
            <div className="bg-cozzy-pink/55 border border-cozzy-rose p-4 rounded-2xl flex items-start gap-3">
              <Gift className="w-5 h-5 text-cozzy-taupe flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-cozzy-cocoa">Signature Cozy Packaging</p>
                <p className="text-[11px] text-cozzy-taupe mt-0.5 leading-relaxed font-light">
                  Every organic order is handpackaged with cotton fibers, botanical dried sage petals, and customized notes to deliver the ultimate sensory gift opening.
                </p>
              </div>
            </div>
          </div>

          {/* Cart totals - Right Side 4 cols */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col gap-5">
            <h3 className="text-base font-serif font-semibold text-cozzy-cocoa">
              Order Summary
            </h3>

            <div className="flex flex-col gap-3 py-4 border-y border-cozzy-beige/20 text-xs sm:text-sm text-cozzy-taupe">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-cozzy-cocoa">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Free Shipping</span>
                ) : (
                  <span className="font-semibold text-cozzy-cocoa">₹{shipping.toFixed(2)}</span>
                )}
              </div>
              {shipping > 0 && (
                <p className="text-[10px] text-cozzy-taupe/80 italic mt-0.5">
                  Spend ₹{(150 - subtotal).toFixed(2)} more to qualify for Free Shipping!
                </p>
              )}
            </div>

            <div className="flex justify-between py-2 items-baseline">
              <span className="text-sm font-serif font-bold text-cozzy-cocoa">Total Amount</span>
              <span className="text-xl font-serif font-extrabold text-cozzy-cocoa">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full bg-cozzy-cocoa hover:bg-cozzy-taupe text-[#fff] text-xs font-bold tracking-wider uppercase py-4 rounded-2xl transition-all shadow-md hover:shadow-cozzy-rose hover:-translate-y-0.5"
            >
              Proceed to checkout
            </button>

            <button
              onClick={onBackToShop}
              className="w-full bg-white hover:bg-cozzy-beige/20 text-cozzy-taupe text-xs font-semibold py-3 rounded-2xl border border-cozzy-beige/50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
