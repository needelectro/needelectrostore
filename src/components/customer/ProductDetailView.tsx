'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Truck, MessageCircle, Phone, CreditCard,
  Check, ShieldCheck, Clock, MapPin, Plus, Minus
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';
import { useCart } from '@/src/services/cartContext';

interface ProductDetailViewProps {
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    brand: string;
    model?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    images?: string[] | null;
    retailPrice: number;
    currentStock: number;
    warrantyPeriodMonths?: number;
  };
  isLaptop: boolean;
  emiMonthly: number | null;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  isLaptop,
  emiMonthly,
}) => {
  const router = useRouter();
  const { addItem, openCart } = useCart();

  // Multi-image gallery logic
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (product.imageUrl) list.push(product.imageUrl);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && typeof img === 'string' && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    if (list.length === 0) {
      list.push(isLaptop ? '/logo-dark-transparent.png' : '/logo-icon.png');
    }
    return list;
  }, [product.imageUrl, product.images, isLaptop]);

  const [activeImage, setActiveImage] = useState<string>(allImages[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isAvailable = product.currentStock > 0;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.retailPrice,
      imageUrl: product.imageUrl || null,
      maxStock: product.currentStock,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openCart();
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.retailPrice,
      imageUrl: product.imageUrl || null,
      maxStock: product.currentStock,
      quantity,
    });
    router.push('/checkout');
  };

  const whatsappMessage = encodeURIComponent(
    `Hello NEED ELECTRO! I am interested in purchasing:\nProduct: ${product.name}\nSKU: ${product.sku}\nPrice: ৳${product.retailPrice.toLocaleString()}\nIs it available for immediate dispatch?`
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Left Column: Image Gallery */}
      <div className="lg:col-span-5 space-y-4">
        {/* Main Display Image */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 aspect-[4/3] flex items-center justify-center relative overflow-hidden shadow-sm group">
          <img
            src={activeImage}
            alt={`${product.name} at NEED ELECTRO`}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-4 left-4 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-cyan-300 font-bold px-2.5 py-1 rounded-lg text-xs">
            {product.brand}
          </span>
          <span
            className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-500/30'
                : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-500/30'
            }`}
          >
            {isAvailable ? 'In Stock' : 'Pre-Order'}
          </span>
        </div>

        {/* Thumbnail Selector (if multiple images) */}
        {allImages.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 rounded-xl bg-white dark:bg-slate-900 p-1.5 shrink-0 border-2 transition-all overflow-hidden ${
                  activeImage === img
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        )}

        {/* Warranty & Guarantee Highlights */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 shadow-2xs">
            <ShieldCheck size={18} className="text-blue-600 dark:text-cyan-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">7-Day Replacement</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 shadow-2xs">
            <Clock size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {product.warrantyPeriodMonths ? `${product.warrantyPeriodMonths} Mo Warranty` : 'Official Warranty'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 shadow-2xs">
            <Truck size={18} className="text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Open-Box Inspection</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 shadow-2xs">
            <CreditCard size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Right Column: Pricing & Purchase CTAs */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-blue-700 dark:text-cyan-300 font-semibold border border-slate-200 dark:border-transparent">
              SKU: {product.sku}
            </span>
            <span>Category: {product.category}</span>
            {product.model && <span>Model: {product.model}</span>}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Official Price (VAT Incl.)
              </span>
              <span className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-cyan-400 font-mono">
                ৳{product.retailPrice.toLocaleString()}
              </span>
            </div>

            {isLaptop && emiMonthly && (
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Monthly Installment</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-xl inline-block">
                  From ৳{emiMonthly.toLocaleString()}/mo
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Truck size={14} className="text-blue-500" />
              <span>Nationwide delivery: ৳60 (Sylhet Div) / ৳120 (All Bangladesh)</span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {isAvailable ? 'In Stock for Immediate Dispatch' : 'Available for Pre-Order'}
            </span>
          </div>
        </div>

        {/* Quantity and Primary Direct Action Buttons */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity:</span>
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="px-4 text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.currentStock || 99, q + 1))}
                className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-xs text-slate-400">
              ({product.currentStock} units in warehouse)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all shadow-xs ${
                !isAvailable
                  ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-blue-600 dark:text-cyan-400 border-blue-300 dark:border-slate-700'
              }`}
            >
              {added ? (
                <>
                  <Check size={16} className="stroke-3" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            {/* Buy Now (Cash on Delivery) Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!isAvailable}
              className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                !isAvailable
                  ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-blue-500/25'
              }`}
            >
              <Truck size={16} />
              <span>Buy Now (Cash on Delivery)</span>
            </button>
          </div>
        </div>

        {/* Secondary Contact Buttons */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle size={15} />
            <span>Inquire on WhatsApp</span>
          </a>

          <a
            href={`tel:${BUSINESS_INFO.phoneClean}`}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Phone size={14} />
            <span>Call Showroom</span>
          </a>
        </div>

        {/* Showroom Pickup Notice */}
        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-slate-900/60 border border-blue-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <div className="flex items-center gap-2 text-blue-700 dark:text-cyan-400 font-bold">
            <MapPin size={14} />
            <span>Moulvibazar Showroom Pickup &amp; Testing</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
            MR Plaza, Kusumbag, Moulvibazar. Open 9:30 AM – 9:30 PM. Inspect your device personally before purchasing or receiving doorstep delivery.
          </p>
        </div>
      </div>
    </div>
  );
};
