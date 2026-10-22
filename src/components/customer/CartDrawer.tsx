'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/src/services/cartContext';
import { useLanguage } from '@/src/services/languageContext';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const { t, formatCurrency, formatNumber, isBangla } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white flex flex-col border-l border-slate-200/90 shadow-2xl animate-in slide-in-from-right duration-300 text-[#002B5B]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-[#008CFF]" size={20} />
              <h2 className="text-base font-bold text-[#002B5B]">
                {t('cart.title', 'Shopping Cart')}
              </h2>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-[#EAF4FF] text-[#008CFF] border border-blue-200/60">
                {formatNumber(totalItems)} {isBangla ? 'টি পণ্য' : totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#002B5B] hover:bg-slate-100 transition-colors"
              aria-label={t('common.close', 'Close')}
            >
              <X size={20} />
            </button>
          </div>

          {/* Delivery perk pill */}
          <div className="bg-[#EAF4FF] px-4 py-2 border-b border-blue-100 flex items-center gap-2 text-xs text-[#008CFF] font-medium">
            <Truck size={14} className="shrink-0" />
            <span>
              {isBangla
                ? 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে'
                : 'Cash on Delivery Available Across Bangladesh'}
            </span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F4F6F8] flex items-center justify-center text-slate-400 border border-slate-200">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#002B5B]">
                    {t('cart.emptyCart', 'Your Cart is Empty')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    {t(
                      'cart.emptyCartMsg',
                      'Explore genuine laptops, electronics, CCTV, and electrical appliances from NEED ELECTRO.'
                    )}
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-xl bg-[#008CFF] text-white font-semibold text-xs hover:bg-[#0070cc] shadow-md shadow-blue-500/25 transition-all active:scale-95"
                >
                  {t('cart.continueShopping', 'Browse Products')}
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-3.5 group">
                  <div className="w-16 h-16 rounded-xl bg-[#F4F6F8] overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center p-1">
                    <img
                      src={item.imageUrl || '/logo-icon.png'}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold truncate text-[#002B5B]">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      SKU: {item.sku}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-[#F4F6F8]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 min-h-[34px] min-w-[34px] flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-bold font-mono text-[#002B5B]">
                          {formatNumber(item.quantity)}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 min-h-[34px] min-w-[34px] flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-[#008CFF] font-mono">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-2 min-h-[36px] min-w-[36px] flex items-center justify-center self-start cursor-pointer"
                    title={t('cart.remove', 'Remove item')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-[#F4F6F8]/90 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{t('cart.subtotal', 'Subtotal')}</span>
                <span className="font-mono font-bold text-sm text-[#002B5B]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{t('cart.shipping', 'Shipping Fee')}</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {isBangla ? 'চেকআউটে নির্ধারিত হবে (৳৬০ থেকে)' : 'Calculated at Checkout (From ৳60)'}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-[#002B5B]">{t('cart.total', 'Total')}</span>
                <span className="text-lg font-black text-[#008CFF] font-mono">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 font-bold text-xs text-center text-[#002B5B] bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  {t('cart.title', 'View Cart')}
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-bold text-xs text-center shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>{t('cart.checkout', 'Checkout')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-secondary)] pt-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>
                  {isBangla
                    ? '১০০% আসল পণ্য • অফিসিয়াল ওয়ারেন্টি'
                    : '100% Genuine Products • Official Warranty'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
