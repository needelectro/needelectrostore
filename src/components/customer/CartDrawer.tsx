'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/src/services/cartContext';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, totalItems } = useCart();

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
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-blue-600 dark:text-cyan-400" size={20} />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Your Shopping Cart
              </h2>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-cyan-950 dark:text-cyan-400">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Delivery perk pill */}
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-cyan-950/30 px-4 py-2 border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-2 text-xs text-blue-800 dark:text-cyan-300">
            <Truck size={14} className="shrink-0 text-blue-600 dark:text-cyan-400" />
            <span>Cash on Delivery Available Across Bangladesh</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100 dark:divide-slate-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Explore laptops, electronics, CCTV, and electrical appliances from NEED ELECTRO.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-md transition-all"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-3.5 group">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1">
                    <img
                      src={item.imageUrl || '/logo-icon.png'}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      SKU: {item.sku}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-cyan-400 font-mono">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1 self-start"
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Calculated at Checkout (From ৳60)
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                <span className="text-lg font-black text-blue-600 dark:text-cyan-400 font-mono">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-xs text-center shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>100% Genuine Products • 7 Days Replacement</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
