'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User, Phone, Mail, Lock, MapPin, Eye, EyeOff,
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle,
  Sparkles, Cpu, Laptop, Camera, Zap, Wifi, Radio,
  Check, X, Shield
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { NeedElectroLogo } from '@/src/components/NeedElectroLogo';
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

function calculatePasswordStrength(pwd: string) {
  if (!pwd) return { score: 0, labelEn: '', labelBn: '', color: '', text: '' };
  let points = 0;
  if (pwd.length >= 6) points += 1;
  if (pwd.length >= 8) points += 1;
  if (/[0-9]/.test(pwd)) points += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) points += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) points += 1;

  if (points <= 1) {
    return { score: 1, labelEn: 'Weak', labelBn: 'দুর্বল', color: 'bg-rose-500', text: 'text-rose-400' };
  } else if (points === 2) {
    return { score: 2, labelEn: 'Fair', labelBn: 'মোটামুটি', color: 'bg-amber-500', text: 'text-amber-400' };
  } else if (points <= 4) {
    return { score: 3, labelEn: 'Good', labelBn: 'ভালো', color: 'bg-sky-500', text: 'text-sky-400' };
  } else {
    return { score: 4, labelEn: 'Strong', labelBn: 'শক্তিশালী', color: 'bg-emerald-500', text: 'text-emerald-400' };
  }
}

function FuturisticRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/customer/dashboard';

  const { register: registerCustomer, customer } = useCustomerAuth();
  const { isBangla } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Moulvibazar');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (customer) {
      router.push(redirectUrl);
    }
  }, [customer, redirectUrl, router]);

  const strength = calculatePasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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
          ? 'অনুগ্রহ করে সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমনঃ 017XXXXXXXX)।'
          : 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).'
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

    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage(
        isBangla
          ? 'অনুগ্রহ করে বিস্তারিত ডেলিভারি ঠিকানা লিখুন।'
          : 'Please enter a detailed delivery address.'
      );
      return;
    }

    if (!agreedTerms) {
      setErrorMessage(
        isBangla
          ? 'অনুগ্রহ করে শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত হন।'
          : 'Please accept the Terms & Conditions and Privacy Policy.'
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
            ? 'অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। স্বাগতম!'
            : 'Welcome to NEED ELECTRO! Account created successfully. Redirecting...'
        );
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      } else {
        setErrorMessage(res.error || 'Registration failed. Please check your information.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* ================= LEFT PANEL: Brand Experience & Holographic Telemetry ================= */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 pr-2 sticky top-28">
          <div className="space-y-4">
            <Link href="/" className="inline-block group">
              <NeedElectroLogo size="lg" theme="dark" showTagline={false} showSisterConcern={false} />
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#008CFF]/15 text-[#008CFF] border border-[#008CFF]/30 backdrop-blur-md">
              <Radio size={13} className="text-[#008CFF] animate-pulse" />
              <span className="tracking-wider uppercase">
                {isBangla ? 'ভেরিফায়েড কাস্টমার অনবোর্ডিং' : 'Verified Customer Onboarding'}
              </span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              {isBangla ? (
                <>
                  প্রযুক্তির নতুন দিগন্তে <br />
                  <span className="bg-gradient-to-r from-sky-400 via-[#008CFF] to-blue-500 bg-clip-text text-transparent">
                    আপনার স্বাগতম
                  </span>
                </>
              ) : (
                <>
                  Powering Your <br />
                  <span className="bg-gradient-to-r from-sky-400 via-[#008CFF] to-blue-500 bg-clip-text text-transparent">
                    Digital World.
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              {isBangla
                ? 'NEED ELECTRO-তে যোগ দিন এবং জেনুইন ল্যাপটপ, সিসিটিভি ক্যামেরা, সোলার আইপিএস এবং ইলেকট্রিক্যাল সমাধানের নির্ভরযোগ্য সেবা গ্রহণ করুন।'
                : 'Join NEED ELECTRO and discover a smarter, faster, and more secure way to shop for modern technology and electrical equipment.'}
            </p>
          </div>

          {/* Futuristic Telemetry Matrix Box */}
          <div className="relative rounded-3xl p-6 border border-cyan-500/20 bg-gradient-to-b from-slate-900/40 via-slate-900/70 to-slate-950/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-[#008CFF]/10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#008CFF0a_1px,transparent_1px),linear-gradient(to_bottom,#008CFF0a_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#008CFF]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <Cpu size={14} className="text-[#008CFF] animate-spin-slow" />
                  <span>Platform Privileges</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Instant Access
                </span>
              </div>

              {/* 4 Privilege Telemetry Points */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#008CFF]/40 transition-colors">
                  <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                    <Laptop size={14} />
                    <span>Official Warranty</span>
                  </div>
                  <p className="text-[11px] text-slate-300">100% genuine serialized device warranty &amp; support</p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#008CFF]/40 transition-colors">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <Zap size={14} />
                    <span>Fast Delivery</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Same-day Moulvibazar &amp; Sylhet priority dispatch</p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#008CFF]/40 transition-colors">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                    <ShieldCheck size={14} />
                    <span>Direct ERP Sync</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Live order tracking, invoice print &amp; repair status</p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#008CFF]/40 transition-colors">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                    <Camera size={14} />
                    <span>Verified Techs</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Certified electrician &amp; CCTV field engineer support</p>
                </div>
              </div>

              {/* Telemetry Footer Pill */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 font-mono">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Shield size={13} className="text-emerald-400" />
                  256-Bit SSL Secured
                </span>
                <span>Sylhet Division Hub</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">
            {isBangla
              ? 'NEED ELECTRO — নির্ভরযোগ্য ইলেকট্রিক্যাল এবং প্রযুক্তি সমাধান।'
              : 'NEED ELECTRO — Trusted Electrical and Technological Solutions.'}
          </p>
        </div>

        {/* ================= RIGHT PANEL: Glass Registration Card ================= */}
        <div className="lg:col-span-7 w-full max-w-xl mx-auto lg:max-w-none">
          <div className="relative rounded-3xl border border-cyan-500/30 bg-slate-900/75 dark:bg-[#071324]/85 backdrop-blur-2xl p-6 sm:p-9 shadow-[0_0_50px_rgba(0,140,255,0.15)] overflow-hidden">
            {/* Top glowing neon beam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#008CFF] to-transparent pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-[#008CFF]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Mobile Header (Shown on mobile screens) */}
            <div className="lg:hidden text-center mb-6">
              <Link href="/" className="inline-block mb-3">
                <NeedElectroLogo size="sm" theme="dark" showTagline={false} showSisterConcern={false} />
              </Link>
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#008CFF]/20 text-sky-300 border border-[#008CFF]/30 uppercase tracking-widest mb-2 backdrop-blur-xs">
                <Sparkles size={11} className="text-sky-400" />
                <span>Customer Registration</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isBangla ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create Your Account'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isBangla
                  ? 'NEED ELECTRO-তে যোগ দিয়ে প্রযুক্তি কেনাকাটা আরও সহজ করুন।'
                  : 'Join NEED ELECTRO and discover a smarter way to shop.'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-start gap-2.5 text-xs sm:text-sm backdrop-blur-md">
                <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-start gap-2.5 text-xs sm:text-sm backdrop-blur-md">
                <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {isBangla ? 'সম্পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBangla ? 'যেমনঃ মো: রহিম চৌধুরী' : 'e.g. Md. Rahim Chowdhury'}
                    className="w-full bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/25 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Mobile Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    {isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Phone size={15} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/25 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white font-mono placeholder-slate-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    {isBangla ? 'ইমেইল (ঐচ্ছিক)' : 'Email Address (Optional)'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/25 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* District & Delivery Area Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    {isBangla ? 'জেলা *' : 'District *'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <MapPin size={15} />
                    </div>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/25 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white transition-all outline-none"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d} value={d} className="bg-slate-900 text-white">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    {isBangla ? 'থানা / উপজেলা / এলাকা' : 'Area / Upazila'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <MapPin size={15} />
                    </div>
                    <input
                      type="text"
                      value={deliveryArea}
                      onChange={(e) => setDeliveryArea(e.target.value)}
                      placeholder={isBangla ? 'যেমনঃ কুসুমবাগ, শ্রীমঙ্গল রোড' : 'e.g. Kusumbag, Sreemangal Rd'}
                      className="w-full bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/25 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {isBangla ? 'বিস্তারিত ডেলিভারি ঠিকানা *' : 'Detailed Delivery Address *'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isBangla ? 'বাসা/রোড নম্বর, হোল্ডিং, এলাকার বিবরণ...' : 'House, Road, Holding, landmark details...'}
                  className="w-full bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/25 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none resize-none"
                />
              </div>

              {/* Password & Confirm Password with Visibility Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    {isBangla ? 'পাসওয়ার্ড *' : 'Password *'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/25 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    {isBangla ? 'কনফার্ম পাসওয়ার্ড *' : 'Confirm Password *'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-slate-950/70 border rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none ${
                        passwordsMatch
                          ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25'
                          : passwordsMismatch
                          ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/25'
                          : 'border-slate-700/80 hover:border-slate-600 focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/25'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time Password Strength Meter & Matching Indicator */}
              {password.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {isBangla ? 'পাসওয়ার্ডের শক্তি:' : 'Password Strength:'}
                    </span>
                    <span className={`font-mono font-bold ${strength.text}`}>
                      {isBangla ? strength.labelBn : strength.labelEn}
                    </span>
                  </div>

                  {/* 4-Step Animated Strength Bar */}
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-slate-800'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-slate-800'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-slate-800'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-slate-800'}`} />
                  </div>

                  {/* Password Match Confirmation Status */}
                  {confirmPassword.length > 0 && (
                    <div className="pt-1 flex items-center gap-1.5 text-xs font-medium">
                      {passwordsMatch ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check size={13} className="stroke-[3]" />
                          {isBangla ? 'পাসওয়ার্ড মিলেছে' : 'Passwords match'}
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <X size={13} className="stroke-[3]" />
                          {isBangla ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Terms and Privacy Agreement Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-[#008CFF] focus:ring-[#008CFF] focus:ring-offset-slate-900 cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    {isBangla ? (
                      <>
                        আমি NEED ELECTRO-এর{' '}
                        <Link href="/terms-conditions" target="_blank" className="text-[#008CFF] hover:underline font-semibold">
                          ব্যবহারের শর্তাবলী
                        </Link>{' '}
                        ও{' '}
                        <Link href="/privacy-policy" target="_blank" className="text-[#008CFF] hover:underline font-semibold">
                          গোপনীয়তা নীতি
                        </Link>
                        -তে সম্মতি দিচ্ছি।
                      </>
                    ) : (
                      <>
                        I accept and agree to the{' '}
                        <Link href="/terms-conditions" target="_blank" className="text-[#008CFF] hover:underline font-semibold">
                          Terms &amp; Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy-policy" target="_blank" className="text-[#008CFF] hover:underline font-semibold">
                          Privacy Policy
                        </Link>
                        .
                      </>
                    )}
                  </span>
                </label>
              </div>

              {/* Primary Create Account Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#005fb8] hover:from-[#007be0] hover:to-[#004e9a] text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer group/btn"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isBangla ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Customer Account'}</span>
                    <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider & Sign In Redirection */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-3">
              <div className="relative flex items-center justify-center">
                <span className="bg-[#071324] px-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {isBangla ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}
                </span>
              </div>

              <Link
                href={`/customer/login?redirect=${encodeURIComponent(redirectUrl)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 hover:border-[#008CFF] bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm transition-all"
              >
                <span>{isBangla ? 'সাইন ইন করুন' : 'Sign In to Your Account'}</span>
                <ArrowRight size={14} className="text-[#008CFF]" />
              </Link>
            </div>
          </div>
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
    <div className="min-h-screen bg-[#030914] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background Cyber Grid & Radiant Neon Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#008CFF0c_1px,transparent_1px),linear-gradient(to_bottom,#008CFF0c_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-cyan-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#008CFF]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-700/15 blur-3xl pointer-events-none" />

      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />
      
      <main className="flex-1 flex items-center justify-center relative z-10">
        <Suspense fallback={<div className="p-12 text-center text-sm font-mono text-sky-400">Loading Secure Portal...</div>}>
          <FuturisticRegisterForm />
        </Suspense>
      </main>

      <CustomerFooter />
    </div>
  );
}
