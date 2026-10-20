'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search, PackageCheck, Clock, CheckCircle2, Truck,
  AlertCircle, Phone, ArrowLeft, ShieldCheck, MapPin
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';

interface TrackedOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  courierPartner?: string | null;
  trackingCode?: string | null;
  items: Array<{
    id: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Track Order', path: '/track-order' },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query.trim())}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'No matching orders found.');
      }

      setOrders(json.data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to retrieve order tracking information.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-300 dark:border-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Truck size={14} /> In Transit / Shipped
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300 dark:border-amber-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Clock size={14} /> Processing / Packaging
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-400 border border-sky-300 dark:border-sky-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <PackageCheck size={14} /> Order Confirmed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-300 dark:border-rose-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <AlertCircle size={14} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Clock size={14} /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4f8] text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col font-sans">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-3">
            <PackageCheck size={14} />
            <span>Live Parcel & Dispatch Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Enter your <strong>Order Number</strong> (e.g. <code>ORD-20261021-XXXX</code>) or your <strong>11-digit Phone Number</strong> to view live order progress.
          </p>
        </div>

        {/* Tracking Search Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Order Number or Mobile Number (e.g. 017XXXXXXXX)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0084d6]"
              />
              <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <PackageCheck size={17} />
                  <span>Track Status</span>
                </>
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Results Container */}
        {orders && orders.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Matching Orders ({orders.length})</span>
              <span className="text-xs font-normal text-slate-500">Sorted by most recent</span>
            </h2>

            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 font-mono block">Order ID</span>
                    <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <Link
                      href={`/order-confirmation/${order.orderNumber}`}
                      className="text-xs font-bold text-[#0084d6] hover:underline"
                    >
                      View Invoice →
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Customer & Delivery</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{order.customerName}</p>
                    <p className="text-slate-500">{order.customerPhone}</p>
                    <p className="text-slate-500 mt-1">{order.deliveryAddress}, {order.district}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Order Placement Date</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-slate-500 mt-1">Payment: {order.paymentMethod.replace(/_/g, ' ')}</p>
                    <p className="text-emerald-600 font-semibold">{order.paymentStatus}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Courier & Tracking</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {order.courierPartner || 'Steadfast / Sundarban Courier'}
                    </p>
                    {order.trackingCode ? (
                      <p className="font-mono text-blue-600 mt-1">Tracking Code: {order.trackingCode}</p>
                    ) : (
                      <p className="text-slate-400 mt-1">Waybill tracking code will be SMS-dispatched upon shipment.</p>
                    )}
                  </div>
                </div>

                {/* Items preview */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Ordered Products ({order.items.length})
                  </span>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-medium text-slate-900 dark:text-slate-200">{item.productName}</span>
                          <span className="text-slate-400 ml-2 font-mono">({item.sku}) × {item.quantity}</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                          ৳{item.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 mt-3 pt-3 flex justify-between items-center text-xs font-bold">
                    <span>Total Amount (incl. delivery)</span>
                    <span className="text-base text-[#0084d6] font-mono font-black">
                      ৳{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Help Notice */}
        <div className="mt-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <p className="text-xs text-slate-500">
            Have questions about your order or need instant delivery updates?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
            <a
              href="tel:+8801733983752"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <Phone size={14} className="text-[#0084d6]" />
              <span>Call Hotline: 01733-983752</span>
            </a>
            <a
              href="https://wa.me/8801733983752?text=Hello%20NEED%20ELECTRO%2C%20I%20would%20like%20to%20track%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
