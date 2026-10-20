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
import { useLanguage } from '@/src/services/languageContext';

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
  const { t, formatCurrency, formatNumber, isBangla } = useLanguage();

  const breadcrumbs = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('orders.trackOrder', 'Track Order'), path: '/track-order' },
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
        throw new Error(json.error || t('orders.notFound', 'No matching orders found. Please double-check your Order ID.'));
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
          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 size={14} /> {isBangla ? 'ডেলিভার্ড সম্পন্ন' : 'Delivered'}
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="bg-[#008CFF]/15 text-[#008CFF] border border-[#008CFF]/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Truck size={14} /> {isBangla ? 'কুরিয়ারে পাঠানো হয়েছে' : 'In Transit / Shipped'}
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Clock size={14} /> {isBangla ? 'প্যাকেজিং ও প্রসেসিং হচ্ছে' : 'Processing / Packaging'}
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <PackageCheck size={14} /> {isBangla ? 'অর্ডার নিশ্চিত করা হয়েছে' : 'Order Confirmed'}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <AlertCircle size={14} /> {isBangla ? 'বাতিল' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Clock size={14} /> {isBangla ? 'পর্যালোচনাধীন' : 'Pending Review'}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#008CFF]/10 text-[#008CFF] border border-[#008CFF]/20 mb-3 shadow-xs">
            <PackageCheck size={14} />
            <span>{isBangla ? 'লাইভ পার্সেল ও ডেলিভারি ট্র্যাকিং' : 'Live Parcel & Dispatch Tracking'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('orders.trackOrder', 'Track Your Order')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
            {isBangla
              ? 'লাইভ অর্ডার স্ট্যাটাস জানতে আপনার অর্ডার আইডি (যেমনঃ ORD-20261021-XXXX) বা ১১-ডিজিটের ফোন নম্বর লিখুন।'
              : 'Enter your Order Number or your 11-digit Phone Number to view live order progress.'}
          </p>
        </div>

        {/* Tracking Search Card */}
        <div className="glass-panel rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 sm:p-8 mb-8 backdrop-blur-xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('orders.trackPlaceholder', 'Enter Order Number or Mobile Number (e.g. 017XXXXXXXX)...')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--glass-border)] bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]/30 focus:border-[#008CFF] transition-all"
              />
              <Search size={18} className="absolute left-3.5 top-3.5 text-[var(--text-secondary)]" />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="py-3 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white shadow-lg shadow-[#008CFF]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('common.loading', 'Searching...')}</span>
                </>
              ) : (
                <>
                  <PackageCheck size={17} />
                  <span>{isBangla ? 'স্ট্যাটাস দেখুন' : 'Track Status'}</span>
                </>
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Results Container */}
        {orders && orders.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold flex items-center justify-between">
              <span>{isBangla ? 'পাওয়া অর্ডারসমূহ' : 'Matching Orders'} ({formatNumber(orders.length)})</span>
              <span className="text-xs font-normal text-[var(--text-secondary)]">
                {isBangla ? 'সর্বশেষ অর্ডার অনুযায়ী সাজানো' : 'Sorted by most recent'}
              </span>
            </h2>

            {orders.map((order) => (
              <div
                key={order.id}
                className="glass-panel rounded-3xl border border-[var(--glass-border)] shadow-xl p-6 space-y-5 backdrop-blur-xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--glass-border)]">
                  <div>
                    <span className="text-xs text-[var(--text-secondary)] font-mono block">
                      {t('orders.orderId', 'Order ID')}
                    </span>
                    <span className="text-lg font-black font-mono text-[#008CFF]">
                      {order.orderNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <Link
                      href={`/order-confirmation/${order.orderNumber}`}
                      className="text-xs font-bold text-[#008CFF] hover:underline"
                    >
                      {t('orders.viewReceipt', 'View Invoice')} →
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--text-secondary)] block mb-1">
                      {isBangla ? 'গ্রাহক ও ডেলিভারি তথ্য' : 'Customer & Delivery'}
                    </span>
                    <p className="font-semibold text-[var(--text-primary)]">{order.customerName}</p>
                    <p className="text-[var(--text-secondary)] font-mono">{order.customerPhone}</p>
                    <p className="text-[var(--text-secondary)] mt-1">{order.deliveryAddress}, {order.district}</p>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block mb-1">
                      {t('orders.orderDate', 'Order Placement Date')}
                    </span>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {new Date(order.createdAt).toLocaleDateString(isBangla ? 'bn-BD' : 'en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-[var(--text-secondary)] mt-1">
                      {isBangla ? 'পেমেন্ট' : 'Payment'}: {order.paymentMethod.replace(/_/g, ' ')}
                    </p>
                    <p className="text-emerald-600 font-semibold">{order.paymentStatus}</p>
                  </div>

                  <div>
                    <span className="text-[var(--text-secondary)] block mb-1">
                      {isBangla ? 'কুরিয়ার ও ট্র্যাকিং' : 'Courier & Tracking'}
                    </span>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {order.courierPartner || 'Steadfast / Sundarban Courier'}
                    </p>
                    {order.trackingCode ? (
                      <p className="font-mono text-[#008CFF] mt-1">
                        Tracking: {order.trackingCode}
                      </p>
                    ) : (
                      <p className="text-[var(--text-secondary)] mt-1">
                        {isBangla ? 'শিপমেন্টের পর ট্র্যাকিং কোড এসএমএসে পাঠানো হবে।' : 'Waybill code will be SMS-dispatched upon shipment.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items preview */}
                <div className="rounded-2xl p-4 bg-white/40 dark:bg-black/20 border border-[var(--glass-border)]">
                  <span className="text-xs font-bold block mb-2">
                    {t('orders.items', 'Ordered Products')} ({formatNumber(order.items.length)})
                  </span>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-medium text-[var(--text-primary)]">{item.productName}</span>
                          <span className="text-[var(--text-secondary)] ml-2 font-mono">
                            ({item.sku}) × {formatNumber(item.quantity)}
                          </span>
                        </div>
                        <span className="font-bold font-mono text-[#008CFF]">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[var(--glass-border)] mt-3 pt-3 flex justify-between items-center text-xs font-bold">
                    <span>{t('orders.totalAmount', 'Total Amount')}</span>
                    <span className="text-base text-[#008CFF] font-mono font-black">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Help Notice */}
        <div className="mt-12 text-center glass-panel rounded-3xl border border-[var(--glass-border)] p-6 shadow-md backdrop-blur-xl">
          <p className="text-xs text-[var(--text-secondary)]">
            {isBangla
              ? 'অর্ডার সংক্রান্ত যেকোনো প্রশ্ন বা তাৎক্ষণিক আপডেটের জন্য আমাদের হটলাইনে যোগাযোগ করুন'
              : 'Have questions about your order or need instant delivery updates?'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
            <a
              href="tel:+8801733983752"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800 text-xs font-bold hover:border-[#008CFF] border border-[var(--glass-border)] transition-colors"
            >
              <Phone size={14} className="text-[#008CFF]" />
              <span>{isBangla ? 'হটলাইনে কল করুন: ০১৭৩৩-৯৮৩৭৫২' : 'Call Hotline: 01733-983752'}</span>
            </a>
            <a
              href="https://wa.me/8801733983752?text=Hello%20NEED%20ELECTRO%2C%20I%20would%20like%20to%20track%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
            >
              <span>{isBangla ? 'হোয়াটসঅ্যাপে চ্যাট করুন' : 'Chat on WhatsApp'}</span>
            </a>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
