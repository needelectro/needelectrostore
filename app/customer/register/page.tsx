'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User, Phone, Mail, Lock, MapPin, Eye, EyeOff,
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, ShoppingBag
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/customer/dashboard';

  const { register: registerCustomer, customer } = useCustomerAuth();
  const { t, isBangla } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Moulvibazar');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (customer) {
      router.push(redirectUrl);
    }
  }, [customer, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage(isBangla ? 'অনুগ্রহ করে সম্পূর্ণ নাম লিখুন।' : 'Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 11 || (!cleanPhone.startsWith('01') && !cleanPhone.startsWith('8801'))) {
      setErrorMessage(
        isBangla
          ? 'অনুগ্রহ করে সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন।'
          : 'Please enter a valid 11-digit Bangladeshi mobile number.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        isBangla
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        isBangla
          ? 'পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।'
          : 'Passwords do not match.'
      );
      return;
    }

    if (!address.trim() || address.trim().length < 6) {
      setErrorMessage(
        isBangla
          ? 'অনুগ্রহ করে বিস্তারিত ডেলিভারি ঠিকানা দিন।'
          : 'Please enter a detailed delivery address.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerCustomer({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        password,
        confirmPassword,
        address: address.trim(),
        district,
        deliveryArea: deliveryArea.trim() || undefined,
      });

      if (res.success) {
        setSuccessMessage(
          isBangla
            ? 'অভিনন্দন! আপনার অ্যাকাউন্ট তৈরি হয়েছে। রিডাইরেক্ট হচ্ছে...'
            : 'Welcome to NEED ELECTRO! Account created. Redirecting...'
        );
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-8 sm:py-12">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#002B5B] to-[#008CFF] text-white shadow-lg shadow-[#008CFF]/25 mb-3">
            <User size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBangla ? 'কাস্টমার অ্যাকাউন্ট তৈরি করুন' : 'Create Customer Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            {isBangla
              ? 'NEED ELECTRO-তে অর্ডার, ওয়ারেন্টি এবং ডেলিভারি ট্র্যাক করতে সাইন আপ করুন।'
              : 'Join NEED ELECTRO for express checkout, order tracking, and warranty benefits.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-xs sm:text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-xs sm:text-sm">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {isBangla ? 'সম্পূর্ণ নাম *' : 'Full Name *'}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isBangla ? 'যেমনঃ মো: রহিম চৌধুরী' : 'e.g. Md. Rahim Chowdhury'}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF] transition-all"
              />
            </div>
          </div>

          {/* Mobile Phone & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF] font-mono transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isBangla ? 'ইমেইল (ঐচ্ছিক)' : 'Email Address (Optional)'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF] transition-all"
                />
              </div>
            </div>
          </div>

          {/* District & Delivery Area Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isBangla ? 'জেলা *' : 'District *'}
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF] transition-all"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isBangla ? 'থানা / উপজেলা / এলাকা' : 'Area / Upazila'}
              </label>
              <input
                type="text"
                value={deliveryArea}
                onChange={(e) => setDeliveryArea(e.target.value)}
                placeholder={isBangla ? 'যেমনঃ কুসুমবাগ, শ্রীমঙ্গল রোড' : 'e.g. Kusumbag, Sreemangal Rd'}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF] transition-all"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {isBangla ? 'বিস্তারিত ঠিকানা *' : 'Street & Delivery Address *'}
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isBangla ? 'বাসা/রোড নম্বর, হোল্ডিং, এলাকার বিবরণ...' : 'House, Road, Holding, landmark details...'}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF] transition-all resize-none"
            />
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isBangla ? 'পাসওয়ার্ড *' : 'Password *'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isBangla ? 'কনফার্ম পাসওয়ার্ড *' : 'Confirm Password *'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF] transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0066cc] hover:from-[#0070cc] hover:to-[#0052a3] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#008CFF]/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isBangla ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Customer Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBangla ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
            <Link
              href={`/customer/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className="text-[#008CFF] font-bold hover:underline ml-1"
            >
              {isBangla ? 'লগইন করুন →' : 'Sign in here →'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  const { t } = useLanguage();
  const breadcrumbs = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: 'Customer Register', path: '/customer/register' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d1e] text-slate-800 dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="p-12 text-center text-sm">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
      <CustomerFooter />
    </div>
  );
}
