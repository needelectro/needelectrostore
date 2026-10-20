'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { useCart } from '@/src/services/cartContext';
import { useLanguage } from '@/src/services/languageContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();
  const { t, formatCurrency, formatNumber, isBangla } = useLanguage();

  const breadcrumbs = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('cart.title', 'Shopping Cart'), path: '/cart' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('cart.title', 'Shopping Cart')}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              {isBangla
                ? 'ক্যাশ অন ডেলিভারিতে অর্ডার সম্পন্ন করার পূর্বে পণ্যের তালিকা যাচাই করুন।'
                : 'Review your items before proceeding to Cash on Delivery checkout.'}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 size={13} />
              <span>{isBangla ? 'সম্পূর্ণ কার্ট খালি করুন' : 'Clear Entire Cart'}</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="glass-panel rounded-3xl border border-[var(--glass-border)] p-12 text-center max-w-lg mx-auto shadow-xl backdrop-blur-xl">
            <div className="w-20 h-20 rounded-2xl bg-[#008CFF]/15 text-[#008CFF] flex items-center justify-center mx-auto mb-4 border border-[#008CFF]/20 shadow-md">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-xl font-bold">
              {t('cart.emptyCart', 'Your Cart is Currently Empty')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 mb-6">
              {t(
                'cart.emptyCartMsg',
                'You have not added any electronics, laptops, or electrical products to your cart yet.'
              )}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-sm shadow-lg shadow-[#008CFF]/25 transition-all active:scale-95"
            >
              <ArrowLeft size={16} />
              <span>{t('cart.continueShopping', 'Explore Marketplace')}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-panel rounded-3xl border border-[var(--glass-border)] divide-y divide-[var(--glass-border)] shadow-md overflow-hidden backdrop-blur-md">
                <div className="p-4 bg-white/40 dark:bg-black/20 font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] flex justify-between">
                  <span>{isBangla ? 'পণ্যের বিবরণ' : 'Product Details'}</span>
                  <span>{isBangla ? 'পরিমাণ ও মোট মূল্য' : 'Quantity & Total'}</span>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-800/80 p-2 shrink-0 border border-[var(--glass-border)] flex items-center justify-center shadow-xs">
                        <img
                          src={item.imageUrl || '/logo-icon.png'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                          SKU: {item.sku}
                        </p>
                        <p className="text-xs font-semibold text-[#008CFF] mt-1 font-mono">
                          {formatCurrency(item.price)} {isBangla ? 'প্রতিটি' : 'each'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-0 border-[var(--glass-border)]">
                      {/* Quantity adjuster */}
                      <div className="flex items-center border border-[var(--glass-border)] rounded-xl overflow-hidden bg-white/50 dark:bg-black/20">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 text-xs font-bold font-mono">
                          {formatNumber(item.quantity)}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right min-w-[90px]">
                        <span className="text-sm sm:text-base font-extrabold text-[#008CFF] font-mono">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[var(--text-secondary)] hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        title={t('cart.remove', 'Remove product')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008CFF] hover:underline"
                >
                  <ArrowLeft size={14} />
                  <span>{t('cart.continueShopping', 'Continue Shopping')}</span>
                </Link>
                <span className="text-xs text-[var(--text-secondary)]">
                  {formatNumber(totalItems)} {isBangla ? 'টি পণ্য কার্টে আছে' : 'items in cart'}
                </span>
              </div>
            </div>

            {/* Order Summary Card */}
            <div>
              <div className="glass-panel rounded-3xl border border-[var(--glass-border)] p-6 shadow-xl space-y-5 sticky top-24 backdrop-blur-xl">
                <h2 className="text-lg font-bold border-b border-[var(--glass-border)] pb-3">
                  {t('checkout.orderSummary', 'Order Summary')}
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>{t('cart.subtotal', 'Subtotal')}</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <span>{t('cart.shipping', 'Delivery Charge')}</span>
                      <Truck size={13} className="text-[#008CFF]" />
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {isBangla ? 'চেকআউটে নির্ধারিত হবে' : 'Calculated at checkout'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] bg-white/40 dark:bg-black/20 p-2.5 rounded-xl border border-[var(--glass-border)]">
                    ⚡ {isBangla ? 'মৌলভীবাজার ও সিলেট বিভাগে ৳৬০' : '৳60 inside Moulvibazar & Sylhet Division'}<br />
                    🚚 {isBangla ? 'অন্যান্য জেলায় ৳১২০' : '৳120 across all other districts of Bangladesh'}
                  </p>
                </div>

                <div className="border-t border-[var(--glass-border)] pt-3 flex justify-between items-baseline">
                  <span className="font-bold">{t('cart.total', 'Estimated Total')}</span>
                  <span className="text-xl font-black text-[#008CFF] font-mono">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-extrabold text-sm text-center shadow-lg shadow-[#008CFF]/25 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                  <span>{t('cart.checkout', 'Proceed to Checkout')}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="pt-2 border-t border-[var(--glass-border)] space-y-2 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>{isBangla ? 'বক্স খুলে দেখে ক্যাশ অন ডেলিভারিতে নেওয়ার সুবিধা' : 'Cash on Delivery with open-box verification'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#008CFF] shrink-0" />
                    <span>{isBangla ? 'সিরিয়ালাইজড সকল পণ্যে অফিসিয়াল শোরুম ওয়ারেন্টি' : 'Official showroom warranty on all serialized items'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}
