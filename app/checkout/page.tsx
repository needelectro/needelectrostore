'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, Truck, ArrowLeft, CheckCircle2,
  AlertCircle, Lock, ShoppingBag, Phone, MapPin, User, Mail
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { useCart } from '@/src/services/cartContext';
import { useCustomerAuth } from '@/src/services/customerAuthContext';
import { useLanguage } from '@/src/services/languageContext';

const BANGLADESH_DISTRICTS = [
  'Moulvibazar', 'Sylhet', 'Habiganj', 'Sunamganj',
  'Dhaka', 'Chittagong', 'Gazipur', 'Narayanganj', 'Comilla', 'Brahmanbaria',
  'Bagerhat', 'Bandarban', 'Barguna', 'Barisal', 'Bhola', 'Bogra',
  'Chandpur', 'Chapadawabganj', 'Chuadanga', 'Cox\'s Bazar',
  'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gopalganj',
  'Jamalpur', 'Jessore', 'Jhalokati', 'Jhenaidah', 'Joypurhat',
  'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia',
  'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj',
  'Meherpur', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail',
  'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali',
  'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari',
  'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur',
  'Sherpur', 'Sirajganj', 'Tangail', 'Thakurgaon'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { t, formatCurrency, formatNumber, isBangla } = useLanguage();

  const breadcrumbs = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('cart.title', 'Shopping Cart'), path: '/cart' },
    { name: t('checkout.title', 'Checkout'), path: '/checkout' },
  ];

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [district, setDistrict] = useState('Moulvibazar');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { customer, isLoading: authLoading } = useCustomerAuth();

  // Autofill from authenticated customer profile
  React.useEffect(() => {
    if (customer) {
      setCustomerName((prev) => prev || customer.name || '');
      setCustomerPhone((prev) => prev || customer.phone || '');
      setCustomerEmail((prev) => prev || customer.email || '');
      const defaultAddr = customer.addresses?.find((a: any) => a.isDefault) || customer.addresses?.[0];
      if (defaultAddr) {
        setDeliveryAddress((prev) => prev || defaultAddr.address || '');
        if (defaultAddr.district) setDistrict(defaultAddr.district);
      } else if (customer.address) {
        setDeliveryAddress((prev) => prev || customer.address || '');
        if (customer.district) setDistrict(customer.district);
      }
    }
  }, [customer]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Delivery charge calculation
  const isSylhetDivision = ['Moulvibazar', 'Sylhet', 'Habiganj', 'Sunamganj'].includes(district);
  const deliveryCharge = isSylhetDivision ? 60 : 120;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAppliedCoupon({
          code: json.data.code,
          discountAmount: json.data.discountAmount
        });
      } else {
        setCouponError(json.error || t('cart.couponInvalid', 'Invalid coupon code'));
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client validation
    if (!customerName.trim()) {
      setErrorMessage(isBangla ? 'অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 11 || (!cleanPhone.startsWith('01') && !cleanPhone.startsWith('8801'))) {
      setErrorMessage(
        isBangla
          ? 'অনুগ্রহ করে সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমনঃ 017XXXXXXXX)।'
          : 'Please enter a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX).'
      );
      return;
    }
    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 8) {
      setErrorMessage(
        isBangla
          ? 'অনুগ্রহ করে বাসা/সড়ক/এলাকার বিবরণসহ বিস্তারিত ঠিকানা দিন।'
          : 'Please enter a detailed delivery address with house/road/area details.'
      );
      return;
    }
    if (items.length === 0) {
      setErrorMessage(
        isBangla
          ? 'আপনার কার্ট খালি। অর্ডার করার আগে পণ্য যোগ করুন।'
          : 'Your cart is empty. Please add products before checking out.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone.startsWith('88') ? cleanPhone.slice(2) : cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        deliveryAddress: deliveryAddress.trim(),
        district,
        notes: notes.trim() || undefined,
        paymentMethod: 'COD',
        couponCode: appliedCoupon?.code,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      // Order created successfully!
      const orderNumber = data.data.orderNumber;
      clearCart();
      router.push(`/order-confirmation/${orderNumber}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while submitting your order.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
        <CustomerHeader />
        <Breadcrumb items={breadcrumbs} />
        <main className="max-w-md mx-auto w-full px-4 py-16 text-center">
          <div className="glass-panel p-8 rounded-3xl border border-[var(--glass-border)] shadow-xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#008CFF]/15 text-[#008CFF] flex items-center justify-center mx-auto mb-4 border border-[#008CFF]/20 shadow-md">
              <ShoppingBag size={28} />
            </div>
            <h1 className="text-xl font-bold">{t('cart.emptyCart', 'Your cart is empty')}</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-2 mb-6">
              {t('cart.emptyCartMsg', 'Please add at least one product to your cart to proceed with checkout.')}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-semibold text-xs shadow-md shadow-[#008CFF]/25 transition-all active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>{t('cart.continueShopping', 'Return to Storefront')}</span>
            </Link>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
        <CustomerHeader />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="w-8 h-8 border-3 border-[#008CFF] border-t-transparent rounded-full animate-spin" />
        </main>
        <CustomerFooter />
      </div>
    );
  }

  // Mandatory Requirement 4: Require Login Before Purchasing
  if (!customer) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
        <CustomerHeader />
        <Breadcrumb items={breadcrumbs} />
        <main className="max-w-xl mx-auto w-full px-4 py-12 sm:py-16 flex-1 flex items-center justify-center">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#002B5B] to-[#008CFF] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#008CFF]/25">
              <Lock size={28} />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#008CFF]/10 text-[#008CFF] border border-[#008CFF]/20 mb-2">
                <ShieldCheck size={13} />
                <span>{isBangla ? 'অ্যাকাউন্ট প্রয়োজন' : 'Customer Account Required'}</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isBangla ? 'অর্ডার সম্পন্ন করতে সাইন ইন করুন' : 'Sign In or Register to Checkout'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                {isBangla
                  ? 'আপনার অর্ডার ও ওয়ারেন্টি ট্র্যাক করতে কাস্টমার অ্যাকাউন্ট প্রয়োজন। আপনার কার্ট সম্পূর্ণ সংরক্ষিত আছে!'
                  : 'Please sign in or create an account to place your order. Your cart items are preserved and waiting!'}
              </p>
            </div>

            {/* Cart summary preview */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-[#008CFF]" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                </span>
              </div>
              <span className="font-mono font-black text-sm text-[#008CFF]">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                href="/customer/login?redirect=/checkout"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005ea8] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#008CFF]/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>{isBangla ? 'লগইন করে চেকআউট' : 'Sign In & Checkout'}</span>
                <ArrowLeft size={14} className="rotate-180" />
              </Link>
              <Link
                href="/customer/register?redirect=/checkout"
                className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>{isBangla ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Account'}</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-center gap-4">
              <span>✓ Doorstep Cash on Delivery</span>
              <span>✓ Live SMS Tracking</span>
              <span>✓ Official Warranty</span>
            </div>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full px-3 sm:px-6 lg:px-8 3xl:px-12 py-6 sm:py-8 flex-1">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#008CFF] bg-[#008CFF]/10 px-3 py-1 rounded-full border border-[#008CFF]/20 mb-2">
            <Lock size={12} />
            <span>
              {isBangla ? 'সুরক্ষিত ক্যাশ অন ডেলিভারি চেকআউট' : 'Secure Cash on Delivery Checkout'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('checkout.title', 'Complete Your Order')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {isBangla
              ? 'ডেলিভারি ঠিকানা ও ফোন নম্বর প্রদান করুন। পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করুন।'
              : 'Provide your shipping details. Pay in cash after inspecting your package upon delivery.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-bold">{isBangla ? 'অনুগ্রহ করে তথ্য যাচাই করুন:' : 'Please check your details:'}</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Shipping Details Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel rounded-3xl border border-[var(--glass-border)] p-6 shadow-xl space-y-5 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <User size={18} className="text-[#008CFF]" />
                  <span>{t('checkout.billingDetails', 'Customer Information')}</span>
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Ordering as:</span>
                  <span className="font-bold text-[#008CFF]">{customer.name}</span>
                </div>
              </div>

              {/* Saved Address Pills Selector */}
              {customer.addresses && customer.addresses.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {isBangla ? 'সংরক্ষিত ঠিকানা নির্বাচন করুন:' : 'Select Saved Delivery Address:'}
                    </span>
                    <Link
                      href="/customer/addresses"
                      className="text-[11px] font-bold text-[#008CFF] hover:underline"
                    >
                      {isBangla ? '+ নতুন ঠিকানা' : '+ Manage Addresses'}
                    </Link>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {customer.addresses.map((addr: any) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setDeliveryAddress(addr.address);
                          if (addr.district) setDistrict(addr.district);
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all shrink-0 text-xs ${
                          deliveryAddress === addr.address
                            ? 'border-[#008CFF] bg-[#008CFF]/10 text-[#008CFF] font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="block font-bold">{addr.label || 'Address'}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">{addr.address}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                    {t('checkout.fullName', 'Full Name')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isBangla ? 'যেমনঃ তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]/30 focus:border-[#008CFF] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                    {t('checkout.phone', 'Mobile Phone Number')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]/30 focus:border-[#008CFF] font-mono transition-all"
                    />
                    <Phone size={15} className="absolute right-3 top-3 text-[var(--text-secondary)]" />
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
                    {isBangla ? 'অর্ডার নিশ্চিত করার জন্য এই নম্বরে কল করা হবে।' : 'We will call you on this number to confirm dispatch.'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                  {t('checkout.email', 'Email Address')} <span className="text-[var(--text-secondary)] font-normal">({t('common.optional', 'Optional')})</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]/30 focus:border-[#008CFF] transition-all"
                  />
                  <Mail size={15} className="absolute right-3 top-3 text-[var(--text-secondary)]" />
                </div>
              </div>
            </div>

            {/* Delivery Address Box */}
            <div className="glass-panel rounded-3xl border border-[var(--glass-border)] p-6 shadow-xl space-y-5 backdrop-blur-xl">
              <h2 className="text-base font-bold flex items-center gap-2 pb-3 border-b border-[var(--glass-border)]">
                <MapPin size={18} className="text-[#008CFF]" />
                <span>{isBangla ? 'ডেলিভারি ঠিকানা (বাংলাদেশ)' : 'Delivery Address in Bangladesh'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                    {t('checkout.district', 'District')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]/30 focus:border-[#008CFF] transition-all"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d} value={d} className="bg-[var(--bg-app)] text-[var(--text-primary)]">
                        {d} {['Moulvibazar', 'Sylhet', 'Habiganj', 'Sunamganj'].includes(d) ? `(${isBangla ? 'সিলেট বিভাগ - ৳৬০' : 'Sylhet Div - ৳60'})` : `(${isBangla ? '৳১২০' : '৳120'})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                    {isBangla ? 'ডেলিভারি স্পিড' : 'Delivery Speed'}
                  </label>
                  <div className="p-2.5 rounded-xl bg-white/40 dark:bg-black/20 border border-[var(--glass-border)] text-xs">
                    <span className="font-bold text-[var(--text-primary)] block">
                      {isSylhetDivision ? (isBangla ? '⚡ সেইম-ডে / নেক্সট-ডে এক্সপ্রেস' : '⚡ Same-Day / Next-Day Express') : (isBangla ? '🚚 স্ট্যান্ডার্ড কুরিয়ার (২-৩ দিন)' : '🚚 Standard Nationwide Courier (2-3 Days)')}
                    </span>
                    <span className="text-[var(--text-secondary)] text-[11px]">
                      {isSylhetDivision ? (isBangla ? 'মৌলভীবাজার শোরুম থেকে সরাসরি প্রেরণ' : 'Local dispatch from Moulvibazar showroom') : (isBangla ? 'স্টেডফাস্ট / রেডএক্স ইন্সুরেন্সড কুরিয়ার' : 'Steadfast / RedX insured courier')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                  {t('checkout.address', 'Detailed Street Address')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={isBangla ? 'বাসা/হোল্ডিং নম্বর, রোড, গ্রাম/এলাকা, থানা/উপজেলা...' : 'House/Holding number, Road name, Village/Area, Thana/Upazila...'}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]/30 focus:border-[#008CFF] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                  {t('checkout.notes', 'Special Delivery Instructions')} <span className="text-[var(--text-secondary)] font-normal">({t('common.optional', 'Optional')})</span>
                </label>
                <input
                  type="text"
                  placeholder={isBangla ? 'যেমনঃ পৌঁছানোর পূর্বে কল দিন, দুপুর ২টার পরে...' : 'e.g. Call before arrival, deliver after 2 PM...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]/30 focus:border-[#008CFF] transition-all"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="glass-panel rounded-3xl border border-[var(--glass-border)] p-6 shadow-xl space-y-4 backdrop-blur-xl">
              <h2 className="text-base font-bold flex items-center gap-2 pb-3 border-b border-[var(--glass-border)]">
                <Truck size={18} className="text-[#008CFF]" />
                <span>{t('checkout.paymentMethod', 'Payment Method')}</span>
              </h2>

              <div className="p-4 rounded-2xl border-2 border-[#008CFF] bg-[#008CFF]/10 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#008CFF] bg-[#008CFF] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">
                    {t('checkout.cod', 'Cash on Delivery (COD)')}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    {t(
                      'checkout.codDesc',
                      'Pay in cash directly to the delivery courier when your order arrives at your address. You are allowed to inspect the package seal and device before completing final payment.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Review & Submit Column */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-3xl border border-[var(--glass-border)] p-6 shadow-xl space-y-5 sticky top-24 backdrop-blur-xl">
              <h2 className="text-base font-bold border-b border-[var(--glass-border)] pb-3 flex items-center justify-between">
                <span>{t('checkout.orderSummary', 'Order Summary')}</span>
                <span className="text-xs font-normal text-[var(--text-secondary)]">
                  {formatNumber(totalItems)} {isBangla ? 'টি পণ্য' : totalItems === 1 ? 'item' : 'items'}
                </span>
              </h2>

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-[var(--glass-border)] pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1 shrink-0 border border-[var(--glass-border)] flex items-center justify-center">
                        <img
                          src={item.imageUrl || '/logo-icon.png'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                          {isBangla ? 'পরিমাণ' : 'Qty'}: {formatNumber(item.quantity)} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold shrink-0 text-[#008CFF]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2.5 pt-3 border-t border-[var(--glass-border)] text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{t('cart.subtotal', 'Subtotal')}</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{t('cart.shipping', 'Delivery')} ({district})</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">
                    {formatCurrency(deliveryCharge)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>{t('cart.discount', 'Discount')} ({appliedCoupon.code})</span>
                    <span className="font-mono">
                      -{formatCurrency(appliedCoupon.discountAmount)}
                    </span>
                  </div>
                )}

                {/* Promo Code Input Box */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder={t('cart.couponPlaceholder', 'Promo / Coupon Code')}
                      className="flex-1 px-3 py-2 min-h-[42px] rounded-xl border border-[var(--glass-border)] bg-white/50 dark:bg-black/20 text-xs uppercase font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-[#008CFF]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 min-h-[42px] rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold shrink-0 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {couponLoading ? '...' : t('cart.applyCoupon', 'Apply')}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold">{couponError}</p>
                  )}
                  {appliedCoupon && (
                    <p className="text-[11px] text-emerald-600 mt-1 font-bold">
                      ✓ {t('cart.couponApplied', 'Coupon applied:')} {formatCurrency(appliedCoupon.discountAmount)} saved
                    </p>
                  )}
                </div>
                <div className="border-t border-[var(--glass-border)] pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold">{isBangla ? 'ডেলিভারিতে প্রদেয় মোট' : 'Payable on Delivery'}</span>
                  <span className="text-2xl font-black text-[#008CFF] font-mono">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] disabled:opacity-60 text-white font-extrabold text-sm shadow-xl shadow-[#008CFF]/25 transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('checkout.processingOrder', 'Placing Your Order...')}</span>
                  </>
                ) : (
                  <>
                    <Truck size={17} />
                    <span>{isBangla ? 'অর্ডার নিশ্চিত করুন (ক্যাশ অন ডেলিভারি)' : 'Confirm Order (Cash on Delivery)'}</span>
                  </>
                )}
              </button>

              <div className="space-y-2 pt-2 border-t border-[var(--glass-border)] text-[11px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span>{isBangla ? 'যাচাইকৃত নিড ইলেক্ট্রো সেলস অর্ডার' : 'Verified NEED ELECTRO Sales Order'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#008CFF] shrink-0" />
                  <span>{isBangla ? 'শোরুম ইআরপি ইনভেন্টরির সাথে রিয়েল-টাইমে সিঙ্কড' : 'Synchronized with ERP showroom inventory'}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <CustomerFooter />
    </div>
  );
}
