'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Package, MapPin, ShieldCheck, LogOut,
  Clock, Truck, CheckCircle, ExternalLink,
  ChevronRight, ArrowRight, ShoppingBag, Eye, Phone, Mail
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { useCustomerAuth } from '@/src/services/customerAuthContext';
import { useLanguage } from '@/src/services/languageContext';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { customer, stats, isLoading, logout } = useCustomerAuth();
  const { t, isBangla, formatCurrency, formatNumber } = useLanguage();

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/customer/login?redirect=/customer/dashboard');
      return;
    }

    if (customer) {
      // Fetch customer orders
      fetch('/api/customer/orders')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.data)) {
            setRecentOrders(d.data.slice(0, 5));
          }
        })
        .catch((e) => console.error('Orders fetch err:', e))
        .finally(() => setLoadingOrders(false));
    }
  }, [customer, isLoading, router]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d1e] text-slate-800 dark:text-slate-100 flex flex-col">
        <CustomerHeader />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#008CFF] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading customer account...</p>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  const breadcrumbs = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: 'Customer Dashboard', path: '/customer/dashboard' },
  ];

  const defaultAddress = customer.addresses?.find((a) => a.isDefault) || customer.addresses?.[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'SHIPPED':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'PROCESSING':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'CONFIRMED':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d1e] text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 space-y-6 sm:space-y-8">
        {/* 1. Account Hero Greeting Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-[#002B5B] via-[#003d7a] to-[#081621] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#008CFF] to-sky-400 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-[#008CFF]/30 shrink-0 border-2 border-white/20">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{customer.name}</h1>
                <span className="font-mono bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide">
                  {customer.customerId}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-sky-100/90 mt-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-sky-300" />
                  <span className="font-mono">{customer.phone}</span>
                </span>
                {customer.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-sky-300" />
                      <span>{customer.email}</span>
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-sky-300" />
                  <span>{customer.district || 'Moulvibazar'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/customer/profile"
              className="flex-1 md:flex-initial text-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold transition-all"
            >
              {isBangla ? 'প্রোফাইল পরিবর্তন' : 'Edit Profile'}
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 text-xs font-bold transition-all"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>{isBangla ? 'লগআউট' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* 2. Key Metrics Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isBangla ? 'সর্বমোট অর্ডার' : 'Total Orders'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#008CFF] flex items-center justify-center">
                <Package size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {formatNumber(stats?.totalOrders ?? recentOrders.length)}
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isBangla ? 'প্রসেসিং অর্ডার' : 'In Processing'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {formatNumber(stats?.pendingOrders ?? 0)}
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isBangla ? 'ডেলিভার্ড অর্ডার' : 'Delivered'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {formatNumber(stats?.deliveredOrders ?? 0)}
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isBangla ? 'সংরক্ষিত ঠিকানা' : 'Saved Addresses'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <MapPin size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {formatNumber(customer.addresses?.length || 1)}
            </p>
          </div>
        </div>

        {/* 3. Navigation Hub Grid (4 Direct Action Modules) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/customer/orders"
            className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#008CFF] dark:hover:border-[#008CFF] transition-all group shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#008CFF] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#008CFF] transition-colors">
                  {isBangla ? 'আমার অর্ডারসমূহ' : 'My Orders'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBangla ? 'সম্পূর্ণ ইতিহাস ও ইনভয়েস' : 'Order history & invoices'}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/track-order"
            className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {isBangla ? 'লাইভ অর্ডার ট্র্যাকিং' : 'Live Order Tracking'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBangla ? 'ডেলিভারি স্ট্যাটাস চেক' : 'Real-time delivery status'}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/customer/addresses"
            className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 dark:hover:border-purple-500 transition-all group shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                  {isBangla ? 'ডেলিভারি ঠিকানা' : 'Saved Addresses'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBangla ? 'ঠিকানা যোগ ও এডিট' : 'Manage delivery locations'}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/customer/profile"
            className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 transition-all group shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  {isBangla ? 'প্রোফাইল ও নিরাপত্তা' : 'Profile & Security'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBangla ? 'পাসওয়ার্ড ও তথ্য পরিবর্তন' : 'Update details & password'}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4. Split Section: Recent Purchases (Left 2/3) + Saved Address (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Card */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isBangla ? 'সাম্প্রতিক অর্ডারসমূহ' : 'Recent Purchases'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBangla ? 'আপনার সর্বশেষ অর্ডার এবং বর্তমান অবস্থা' : 'Your latest orders and fulfillment status'}
                </p>
              </div>
              <Link
                href="/customer/orders"
                className="text-xs font-bold text-[#008CFF] hover:underline flex items-center gap-1"
              >
                <span>{isBangla ? 'সব দেখুন' : 'View All'}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {loadingOrders ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <div className="w-6 h-6 border-2 border-[#008CFF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading recent orders...
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentOrders.map((order) => {
                  const itemsCount = Array.isArray(order.items)
                    ? order.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0)
                    : 1;
                  return (
                    <div
                      key={order.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                          <span>•</span>
                          <span className="font-bold text-[#008CFF]">COD</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-between sm:justify-end">
                        <span className="font-mono font-black text-sm sm:text-base text-slate-900 dark:text-white">
                          ৳{Number(order.total).toLocaleString()}
                        </span>
                        <Link
                          href={`/customer/orders/${order.orderNumber}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>{isBangla ? 'বিবরণ' : 'Details'}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                <ShoppingBag size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {isBangla ? 'এখনো কোনো অর্ডার করা হয়নি।' : 'No orders placed yet.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isBangla ? 'আমাদের কালেকশন ব্রাউজ করে অর্ডার করুন।' : 'Browse our authentic hardware catalog to get started.'}
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-[#008CFF] text-white font-bold text-xs shadow-md"
                >
                  <span>{isBangla ? 'শপ করুন' : 'Browse Catalog'}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>

          {/* Delivery & Address Overview Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={17} className="text-[#008CFF]" />
                  <span>{isBangla ? 'মূল ডেলিভারি ঠিকানা' : 'Default Delivery Address'}</span>
                </h3>
              </div>

              {defaultAddress ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {defaultAddress.label || 'Home / Office'}
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Default
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {defaultAddress.address}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {defaultAddress.deliveryArea ? `${defaultAddress.deliveryArea}, ` : ''}
                    {defaultAddress.district}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono pt-1">
                    📞 {customer.phone}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    {customer.address || 'Central Road, Moulvibazar'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{customer.district || 'Moulvibazar'}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/customer/addresses"
                className="text-xs font-bold text-[#008CFF] hover:underline flex items-center gap-1"
              >
                <span>{isBangla ? 'ঠিকানা পরিচালনা করুন' : 'Manage All Addresses'}</span>
                <ChevronRight size={14} />
              </Link>
              <Link
                href="/track-order"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Truck size={14} />
                <span>{isBangla ? 'ট্র্যাক' : 'Track'}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
