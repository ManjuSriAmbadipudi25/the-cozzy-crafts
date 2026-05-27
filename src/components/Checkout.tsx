import React, { useState } from 'react';
import { CreditCard, Truck, ArrowLeft, Heart, ShoppingBag, CheckCircle, Sparkles } from 'lucide-react';
import { Product, OrderItem, Order } from '../types';

interface CheckoutProps {
  cartItems: { product: Product; quantity: number }[];
  onPlaceOrder: (customerData: {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
  }) => Promise<string>; // returns the generated orderId
  onBack: () => void;
  onClearCart: () => void;
}

export default function Checkout({
  cartItems,
  onPlaceOrder,
  onBack,
  onClearCart
}: CheckoutProps) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 9.99;
  const grandTotal = subtotal + shipping;

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  // Fake card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address || !city || !zip) return;

    setIsSubmitting(true);
    try {
      const fullAddress = `${address}, ${city}, ZIP ${zip}`;
      const orderId = await onPlaceOrder({
        customerName: name,
        customerEmail: email,
        shippingAddress: fullAddress
      });
      setPlacedOrderId(orderId);
      onClearCart();
    } catch (err) {
      console.error("Failed to post order:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrderId) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center" id="checkout-completion-receipt">
        <div className="bg-white p-8 rounded-3xl border border-cozzy-beige/40 shadow-cozzy-lg flex flex-col items-center gap-5">
          <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
            <CheckCircle className="w-12 h-12" strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl font-serif font-semibold text-cozzy-cocoa leading-tight">
            Perfect, Your Order is Made!
          </h2>
          
          <div className="flex items-center gap-1.5 text-xs text-cozzy-taupe font-semibold bg-cozzy-pink px-4 py-1.5 rounded-full border border-cozzy-rose">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Signature Handpackaging Started
          </div>

          <p className="text-sm text-cozzy-taupe font-light max-w-sm mt-1 leading-relaxed">
            Thank you, <span className="font-bold text-cozzy-cocoa">{name}</span>! Your reference receipt is <span className="font-bold text-cozzy-cocoa font-mono uppercase bg-cozzy-beige/40 px-2 py-0.5 rounded">{placedOrderId}</span>. A luxury confirmation has been sent to <span className="font-bold text-cozzy-cocoa">{email}</span>.
          </p>

          <div className="w-full text-left bg-cozzy-cream/50 p-4 rounded-xl border border-cozzy-beige/20 my-2 flex flex-col gap-2">
            <h4 className="text-[11px] font-bold text-cozzy-cocoa tracking-wider uppercase">Shipment Destination</h4>
            <p className="text-xs text-cozzy-taupe">{address}, {city}, ZIP {zip}</p>
            <p className="text-[10px] text-cozzy-taupe/90 italic mt-1">Pre-delivery SMS notifications will trigger when your artisan knits or ceramics leave our studio.</p>
          </div>

          <button
            onClick={onBack}
            className="mt-6 bg-cozzy-cocoa hover:bg-cozzy-taupe text-[#fff] text-xs font-bold tracking-wider uppercase px-8 py-4 rounded-2xl shadow-md transition-all"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4" id="e-checkout-container">
      
      {/* Back to Cart */}
      <div className="flex items-center justify-between border-b border-cozzy-beige/45 pb-5 mb-8">
        <div>
          <h2 className="text-2xl font-serif text-cozzy-cocoa tracking-tight font-semibold flex items-center gap-2">
            <Truck className="w-5 h-5 text-cozzy-taupe" strokeWidth={1.5} />
            Secure Checkout
          </h2>
          <p className="text-xs text-cozzy-taupe font-light mt-1">Provide shipping & settlement to secure your hand-crafted order</p>
        </div>
        
        <button
          onClick={onBack}
          className="text-xs text-cozzy-taupe hover:text-cozzy-cocoa flex items-center gap-1.5 font-semibold uppercase transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Shipping Form (Left, 7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Customer Details Block */}
          <div className="bg-white p-6 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-wider text-cozzy-cocoa uppercase mb-2 flex items-center gap-1.5">
              <span>01.</span> Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-cozzy-cocoa uppercase">Your Beautiful Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Charlotte Bennett"
                  className="bg-cozzy-cream/30 text-cozzy-cocoa px-3.5 py-3 rounded-lg border border-cozzy-beige/40 focus:border-cozzy-taupe/50 outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-cozzy-cocoa uppercase">Email Receipt Destination</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="charlotte@bennett.com"
                  className="bg-cozzy-cream/30 text-cozzy-cocoa px-3.5 py-3 rounded-lg border border-cozzy-beige/40 focus:border-cozzy-taupe/50 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Destination Block */}
          <div className="bg-white p-6 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-wider text-cozzy-cocoa uppercase mb-2 flex items-center gap-1.5">
              <span>02.</span> Delivery Destination
            </h3>
            
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-cozzy-cocoa uppercase">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="14 Rue de la Cozzy, Apt 3A"
                  className="bg-cozzy-cream/30 text-cozzy-cocoa px-3.5 py-3 rounded-lg border border-cozzy-beige/40 focus:border-cozzy-taupe/50 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-cozzy-cocoa uppercase">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="bg-cozzy-cream/30 text-cozzy-cocoa px-3.5 py-3 rounded-lg border border-cozzy-beige/40 focus:border-cozzy-taupe/50 outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-cozzy-cocoa uppercase">Postal / ZIP Code</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="10001"
                    className="bg-cozzy-cream/30 text-cozzy-cocoa px-3.5 py-3 rounded-lg border border-cozzy-beige/40 focus:border-cozzy-taupe/50 outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settlement Method Block */}
          <div className="bg-white p-6 rounded-2xl border border-cozzy-beige/25 shadow-2xs flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-wider text-cozzy-cocoa uppercase mb-2 flex items-center gap-1.5">
              <span>03.</span> Secure Settlement (E-Simulated Card)
            </h3>
            
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-cozzy-cocoa uppercase flex items-center justify-between">
                  <span>Card Number</span>
                  <span className="text-[9px] text-cozzy-taupe italic">REAL CONSOLING: Fully secure test mode</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 •••• •••• ••••"
                    className="w-full bg-cozzy-cream/30 text-cozzy-cocoa px-3.5 py-3 pl-10 rounded-lg border border-cozzy-beige/40 focus:border-cozzy-taupe/50 outline-none font-mono"
                    maxLength={19}
                    required
                  />
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cozzy-taupe/70" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-cozzy-cocoa uppercase">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM / YY"
                    className="bg-cozzy-cream/30 text-cozzy-cocoa px-3.5 py-3 rounded-lg border border-cozzy-beige/40 focus:border-cozzy-taupe/50 outline-none text-center font-mono"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-cozzy-cocoa uppercase">Security CVV</label>
                  <input
                    type="password"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="•••"
                    className="bg-cozzy-cream/30 text-cozzy-cocoa px-3.5 py-3 rounded-lg border border-cozzy-beige/40 focus:border-cozzy-taupe/50 outline-none text-center font-mono"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Place order triggers */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-cozzy-cocoa hover:bg-cozzy-taupe text-[#fff] text-xs font-bold tracking-wider uppercase py-4 rounded-xl transition-all shadow-md hover:shadow-cozzy-rose flex items-center justify-center gap-2 cursor-pointer border border-transparent disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying with artisan ledger...' : `Place Handmade Order • $${grandTotal.toFixed(2)}`}
          </button>

        </form>

        {/* Short basket check (Right, 4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-cozzy-beige/30 shadow-cozzy flex flex-col gap-4">
          <h3 className="text-base font-serif font-semibold text-cozzy-cocoa">
            Bag Summary
          </h3>

          <div className="flex flex-col gap-3 py-3 border-b border-cozzy-beige/25">
            {cartItems.map(item => (
              <div key={item.product.id} className="flex gap-3 text-xs items-center">
                <img src={item.product.images[0]} alt={item.product.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded-lg border" />
                <div className="flex-grow min-w-0">
                  <h4 className="font-serif font-medium text-cozzy-cocoa truncate">{item.product.name}</h4>
                  <p className="text-[10px] text-cozzy-taupe/75">Qty: {item.quantity} • ${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 py-2 border-b border-cozzy-beige/25 text-xs text-cozzy-taupe">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-cozzy-cocoa">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              {shipping === 0 ? (
                <span className="text-emerald-600 font-bold uppercase text-[9px] bg-emerald-50 px-2 py-0.5 rounded-full">Free</span>
              ) : (
                <span className="font-semibold text-cozzy-cocoa">${shipping.toFixed(2)}</span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2">
            <span className="text-xs font-bold text-cozzy-cocoa uppercase tracking-wide">Total due</span>
            <span className="text-lg font-serif font-bold text-cozzy-cocoa">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
