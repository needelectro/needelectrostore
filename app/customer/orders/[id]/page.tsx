'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Truck, ArrowLeft, CheckCircle2, Clock,
  MapPin, Phone, Mail, ShoppingBag, ShieldCheck, Printer,
  FileText, AlertCircle, ChevronRight
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { useCustomerAuth } from '@/src/services/customerAuthContext';
import { useLanguage } from '@/src/services/languageContext';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { customer, isLoading: authLoading } = useCustomerAuth();
  const { t, isBangla, formatNumber } = useLanguage();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push(`/customer/login?redirect=/customer/orders/${orderId}`);
      return;
    }

    if (orderId && customer) {
      setLoading(true);
      fetch(`/api/customer/orders/${orderId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            setOrder(data.data);
          } else {
            setError(data.error || 'Order not found or permission denied');
          }
        })
        .catch((e) => setError(e.message || 'Failed to load order'))
        .finally(() => setLoading(false));
    }
  }, [orderId, customer, authLoading, router]);

  const breadcrumbs = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: 'Customer Dashboard', path: '/customer/dashboard' },
    { name: 'My Orders', path: '/customer/orders' },
    { name: orderId || 'Order Details', path: `/customer/orders/${orderId}` },
  ];

  const ORDER_STEPS = [
    { key: 'PENDING', label: isBangla ? 'অর্ডার গ্রহণ' : 'Order Placed', desc: 'Received in system' },
    { key: 'CONFIRMED', label: isBangla ? 'নিশ্চিত করা হয়েছে' : 'Confirmed', desc: 'Verified by team' },
    { key: 'PROCESSING', label: isBangla ? 'প্যাকেজিং হচ্ছে' : 'Processing', desc: 'Packed from showroom' },
    { key: 'SHIPPED', label: isBangla ? 'ডেলিভারিতে বের হয়েছে' : 'Out for Delivery', desc: 'Handed to courier' },
    { key: 'DELIVERED', label: isBangla ? 'সফলভাবে ডেলিভার্ড' : 'Delivered', desc: 'Received & paid' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d1e] text-slate-800 dark:text-slate-100 flex flex-col">
        <CustomerHeader />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="w-8 h-8 border-3 border-[#008CFF] border-t-transparent rounded-full animate-spin" />
        </main>
        <CustomerFooter />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d1e] text-slate-800 dark:text-slate-100 flex flex-col">
        <CustomerHeader />
        <Breadcrumb items={breadcrumbs} />
        <main className="max-w-md mx-auto w-full px-4 py-16 text-center">
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
            <h1 className="text-lg font-bold">{error || 'Order not found'}</h1>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              This order might not belong to your account or the order number is invalid.
            </p>
            <Link
              href="/customer/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008CFF] text-white text-xs font-bold shadow-md"
            >
              <ArrowLeft size={14} />
              <span>Back to My Orders</span>
            </Link>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  const currentStep = getStepIndex(order.orderStatus);
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d1e] text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 space-y-6">
        {/* Header with Order ID & Print Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/customer/orders"
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                title="Back to Orders"
              >
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {order.orderNumber}
              </h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#008CFF]/10 text-[#008CFF] border border-[#008CFF]/20">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-9">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2 pl-9 sm:pl-0">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors no-print"
            >
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>
            <Link
              href={`/track-order?orderNumber=${order.orderNumber}&phone=${order.customerPhone}`}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <Truck size={14} />
              <span>Live Track</span>
            </Link>
          </div>
        </div>

        {/* Status Timeline */}
        {order.orderStatus !== 'CANCELLED' ? (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Order Fulfillment Progress
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs mb-2 transition-all shadow-md ${
                        isCurrent
                          ? 'bg-[#008CFF] text-white ring-4 ring-[#008CFF]/20 scale-110'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>
                    <span className={`text-xs font-bold ${isPassed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
            <AlertCircle size={18} />
            <span>This order was cancelled. If you have any inquiries, please contact NEED ELECTRO hotline.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Ordered Items Table */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Ordered Items ({items.length})
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((it: any, idx: number) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className="w-14 h-14 object-contain rounded-xl bg-white border p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <ShoppingBag size={20} className="text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {it.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                          {it.sku}
                        </span>
                        <span>•</span>
                        <span>Qty: {it.quantity}</span>
                        {it.warrantyMonths > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-500 font-semibold">{it.warrantyMonths}m Warranty</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                      ৳{Number(it.total || it.price * it.quantity).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ৳{Number(it.price).toLocaleString()} each
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  ৳{Number(order.subtotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Charge ({order.district})</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  ৳{Number(order.deliveryCharge).toLocaleString()}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount Applied</span>
                  <span className="font-mono">-৳{Number(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t text-sm font-black text-slate-900 dark:text-white">
                <span>Final Payable Amount</span>
                <span className="font-mono text-base text-[#008CFF]">
                  ৳{Number(order.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right Col: Customer & Delivery Info */}
          <div className="space-y-4">
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Delivery Information
              </h4>
              <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-sm text-slate-900 dark:text-white">{order.customerName}</p>
                <p className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#008CFF] shrink-0 mt-0.5" />
                  <span>
                    {order.deliveryAddress}
                    {order.deliveryArea ? `, ${order.deliveryArea}` : ''}, {order.district}
                  </span>
                </p>
                <p className="flex items-center gap-2 font-mono">
                  <Phone size={14} className="text-[#008CFF] shrink-0" />
                  <span>{order.customerPhone}</span>
                </p>
                {order.customerEmail && (
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-[#008CFF] shrink-0" />
                    <span>{order.customerEmail}</span>
                  </p>
                )}
                {order.deliveryNotes && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 italic mt-2">
                    Note: "{order.deliveryNotes}"
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Payment Method
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Cash on Delivery (COD)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/20">
                  {order.paymentStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pay safely with physical cash directly to the courier agent upon doorstep package inspection.
              </p>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
