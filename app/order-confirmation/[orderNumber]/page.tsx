'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, PackageCheck, Phone, MessageCircle,
  Truck, ArrowRight, Printer, ShieldCheck, Clock, MapPin
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { BUSINESS_INFO } from '@/lib/seoConfig';

interface OrderConfirmationProps {
  params: {
    orderNumber: string;
  };
}

export default function OrderConfirmationPage({ params }: OrderConfirmationProps) {
  const { orderNumber } = params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        const json = await res.json();
        if (json.success && json.data) {
          setOrder(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch order confirmation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />

      <main className="max-w-4xl mx-auto w-full px-4 py-12 flex-1">
        {/* Success Banner */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-lg text-center space-y-4 mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/20 animate-in zoom-in duration-300">
            <CheckCircle2 size={40} className="sm:size-12" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Order Confirmed &amp; Queued in ERP
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3">
              Thank You For Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
              Your order has been recorded into the NEED ELECTRO showroom system. Our team will verify and dispatch your package shortly.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl font-mono text-sm sm:text-base border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 text-xs uppercase font-sans font-bold">Order Reference:</span>
            <span className="font-extrabold text-blue-600 dark:text-cyan-400">{orderNumber}</span>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        {order && (
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Receipt Details</h2>
                <p className="text-xs text-slate-400">Date: {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                  {order.paymentStatus === 'UNPAID' ? 'Cash on Delivery (Pending)' : order.paymentStatus}
                </span>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Printer size={13} />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

            {/* Delivery address & contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                  <MapPin size={14} className="text-blue-500" />
                  <span>Delivery Address</span>
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">{order.customerName}</p>
                <p className="text-slate-600 dark:text-slate-400">{order.deliveryAddress}</p>
                <p className="text-slate-600 dark:text-slate-400 font-bold">{order.district}, Bangladesh</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                  <Phone size={14} className="text-emerald-500" />
                  <span>Contact Information</span>
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">{order.customerPhone}</p>
                {order.customerEmail && <p className="text-slate-600 dark:text-slate-400">{order.customerEmail}</p>}
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Payment: Cash on Delivery (৳{order.total?.toLocaleString()})
                </p>
              </div>
            </div>

            {/* Items Table */}
            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300">Item</th>
                      <th className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 text-center">Qty</th>
                      <th className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 text-right">Price</th>
                      <th className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {order.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">
                          {item.name}
                          <span className="block text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                        </td>
                        <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-right">৳{item.price?.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right font-bold">৳{(item.price * item.quantity)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financial summary */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div className="text-slate-500 space-y-1">
                <p>• Inspection permitted before paying the delivery rider.</p>
                <p>• Official invoice generated in NEED ELECTRO ERP upon delivery.</p>
              </div>
              <div className="w-full sm:w-64 space-y-2 text-right">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">৳{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Delivery Charge:</span>
                  <span className="font-mono font-bold">৳{order.deliveryCharge?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span>Total Payable:</span>
                  <span className="font-mono text-blue-600 dark:text-cyan-400">৳{order.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What Happens Next Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
              <Phone size={18} />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Verification Call</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our showroom executive will call you to confirm your address and preferred delivery time.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Truck size={18} />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Insured Dispatch</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Carefully packed in bubble wrap and double box with serial numbers recorded in ERP.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Open-Box &amp; Pay</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect the package seal and physical condition upon delivery, then hand cash to the courier.
            </p>
          </div>
        </div>

        {/* Assistance / Support bar */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-500/20">
          <div>
            <h3 className="font-bold text-base">Have questions about your order?</h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Contact our Moulvibazar showroom helpline directly via phone or WhatsApp.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Phone size={14} />
              <span>{BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20placed%20order%20${orderNumber}.%20Can%20you%20confirm%20dispatch%20status%3F`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
          >
            <span>Return to NEED ELECTRO Home</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
