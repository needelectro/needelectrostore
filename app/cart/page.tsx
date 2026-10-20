'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { useCart } from '@/src/services/cartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();
  const breadcrumbs = [{ name: 'Shopping Cart', path: '/cart' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review your items before proceeding to Cash on Delivery checkout.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 size={13} />
              <span>Clear Entire Cart</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Cart is Currently Empty</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6">
              You haven&apos;t added any electronics, laptops, or electrical products to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
            >
              <ArrowLeft size={16} />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50/70 dark:bg-slate-950/70 font-bold text-xs uppercase tracking-wider text-slate-500 flex justify-between">
                  <span>Product Details</span>
                  <span>Quantity & Total</span>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-100 dark:bg-slate-800 p-2 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <img
                          src={item.imageUrl || '/logo-icon.png'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          SKU: {item.sku}
                        </p>
                        <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 mt-1">
                          ৳{item.price.toLocaleString()} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                      {/* Quantity adjuster */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right min-w-[90px]">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove product"
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  <ArrowLeft size={14} />
                  <span>Continue Shopping</span>
                </Link>
                <span className="text-xs text-slate-500">
                  {totalItems} items in cart
                </span>
              </div>
            </div>

            {/* Order Summary Card */}
            <div>
              <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5 sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span>Delivery Charge</span>
                      <Truck size={13} className="text-blue-500" />
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      Calculated at checkout
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                    ⚡ ৳60 inside Moulvibazar &amp; Sylhet Division<br />
                    🚚 ৳120 across all other districts of Bangladesh
                  </p>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 dark:text-white">Estimated Total</span>
                  <span className="text-xl font-black text-blue-600 dark:text-cyan-400 font-mono">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold text-sm text-center shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>Cash on Delivery with open-box verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                    <span>Official showroom warranty on all serialized items</span>
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
