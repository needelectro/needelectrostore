'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Truck, Eye, ArrowLeft, Search,
  Calendar, ShoppingBag, ShieldCheck, ChevronRight
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { useCustomerAuth } from '@/src/services/customerAuthContext';
import { useLanguage } from '@/src/services/languageContext';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { customer, isLoading } = useCustomerAuth();
  const { t, isBangla, formatNumber } = useLanguage();

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/customer/login?redirect=/customer/orders');
      return;
    }

    if (customer) {
      const url = statusFilter === 'ALL'
        ? '/api/customer/orders'
        : `/api/customer/orders?status=${statusFilter}`;

      setLoadingOrders(true);
      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.data)) {
            setOrders(d.data);
          }
        })
        .catch((e) => console.error('Fetch orders error:', e))
        .finally(() => setLoadingOrders(false));
    }
  }, [customer, isLoading, statusFilter, router]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col">
        <CustomerHeader />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="w-8 h-8 border-3 border-[#008CFF] border-t-transparent rounded-full animate-spin" />
        </main>
        <CustomerFooter />
      </div>
    );
  }

  const breadcrumbs = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: 'Customer Dashboard', path: '/customer/dashboard' },
    { name: 'Order History', path: '/customer/orders' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.deliveryAddress.toLowerCase().includes(q) ||
      (Array.isArray(o.items) && o.items.some((i: any) => i.name.toLowerCase().includes(q)))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SHIPPED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'PROCESSING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const STATUS_TABS = [
    { key: 'ALL', label: isBangla ? 'সকল অর্ডার' : 'All Orders' },
    { key: 'PENDING', label: isBangla ? 'পেন্ডিং' : 'Pending' },
    { key: 'PROCESSING', label: isBangla ? 'প্রসেসিং' : 'Processing' },
    { key: 'SHIPPED', label: isBangla ? 'অন দ্য ওয়ে' : 'Shipped' },
    { key: 'DELIVERED', label: isBangla ? 'ডেলিভার্ড' : 'Delivered' },
    { key: 'CANCELLED', label: isBangla ? 'বাতিল' : 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col font-sans">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isBangla ? 'আমার অর্ডারের ইতিহাস' : 'My Order History'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isBangla ? 'আপনার সকল কেনাকাটা ও ডেলিভারি ট্র্যাক করুন।' : 'Track and manage your online purchases and official invoices.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/track-order"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <Truck size={14} />
              <span>{isBangla ? 'লাইভ ট্র্যাকিং' : 'Track Order'}</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === tab.key
                    ? 'bg-[#008CFF] text-white shadow-md shadow-[#008CFF]/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBangla ? 'অর্ডার নম্বর বা পণ্য খুঁজুন...' : 'Search order number or items...'}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
            />
          </div>
        </div>

        {/* Orders Listing */}
        {loadingOrders ? (
          <div className="glass-panel p-16 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-3 border-[#008CFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading your orders...
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              const totalItems = items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);

              return (
                <div
                  key={order.id}
                  className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md hover:border-[#008CFF]/50 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={13} />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((it: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                      >
                        {it.imageUrl ? (
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            className="w-10 h-10 object-contain rounded-lg bg-white shrink-0 p-1 border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <ShoppingBag size={16} className="text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {it.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Qty: {it.quantity} × ৳{Number(it.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer details & Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      <span>Delivery: </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {order.deliveryAddress}, {order.district}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Amount</span>
                        <span className="font-mono font-black text-base sm:text-lg text-[#008CFF]">
                          ৳{Number(order.total).toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/customer/orders/${order.orderNumber}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005ea8] text-white text-xs font-bold shadow-md shadow-[#008CFF]/20 flex items-center gap-1.5 transition-all"
                      >
                        <Eye size={13} />
                        <span>{isBangla ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-16 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
            <ShoppingBag size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {isBangla ? 'কোন অর্ডার পাওয়া যায়নি' : 'No matching orders found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {isBangla ? 'আপনি যে ফিল্টারে খুঁজছেন সেখানে কোনো অর্ডার নেই।' : 'There are no orders matching your current filter criteria.'}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-[#008CFF] text-white font-bold text-xs shadow-md"
            >
              <span>{isBangla ? 'কেনাকাটা করুন' : 'Start Shopping'}</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}
