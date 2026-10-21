'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock, Phone, Mail, Eye, EyeOff, ArrowRight,
  AlertCircle, CheckCircle2, ShieldCheck, Cpu,
  Sparkles, ArrowLeft, KeyRound, Zap, Laptop,
  Camera, Wifi, Radio
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { NeedElectroLogo } from '@/src/components/NeedElectroLogo';
import { useCustomerAuth } from '@/src/services/customerAuthContext';
import { useLanguage } from '@/src/services/languageContext';
import { BUSINESS_INFO } from '@/lib/seoConfig';

function FuturisticLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/customer/dashboard';

  const { login, customer } = useCustomerAuth();
  const { isBangla } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password state machine
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (customer) {
      router.push(redirectUrl);
    }
  }, [customer, redirectUrl, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage(
        isBangla
          ? 'অনুগ্রহ করে মোবাইল নম্বর বা ইমেইল ঠিকানা লিখুন।'
          : 'Please enter your registered mobile number or email.'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        isBangla
          ? 'অনুগ্রহ করে অ্যাকাউন্টের পাসওয়ার্ড লিখুন।'
          : 'Please enter your password.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        setSuccessMessage(
          isBangla
            ? 'সফলভাবে যাচাই হয়েছে! ড্যাশবোর্ডে প্রবেশ করানো হচ্ছে...'
            : 'Access granted! Securely redirecting to your account...'
        );
        setTimeout(() => {
          router.push(redirectUrl);
        }, 800);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);

    if (!forgotIdentifier.trim()) {
      setForgotError(
        isBangla ? 'মোবাইল বা ইমেইল লিখুন।' : 'Please enter your mobile number or email.'
      );
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/customer/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForgotStep('reset');
        setForgotMessage(
          data.resetCodeHint
            ? `Security code generated: ${data.resetCodeHint} (Check SMS / Email)`
            : (data.message || 'Verification code sent.')
        );
      } else {
        setForgotError(data.error || 'Failed to dispatch recovery code.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Request failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);

    if (!resetCode.trim() || !newPassword) {
      setForgotError(
        isBangla ? 'কোড ও নতুন পাসওয়ার্ড দিন।' : 'Please enter the reset code and new password.'
      );
      return;
    }

    if (newPassword.length < 6) {
      setForgotError(
        isBangla ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.'
      );
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/customer/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          resetCode: resetCode.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          isBangla
            ? 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! সাইন ইন হচ্ছে...'
            : 'Password updated successfully! Signing you in...'
        );
        setIsForgotMode(false);
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      } else {
        setForgotError(data.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Reset failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ================= LEFT PANEL: Brand Experience & Futuristic Visual ================= */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
          <div className="space-y-4">
            <Link href="/" className="inline-block group">
              <NeedElectroLogo size="lg" theme="light" showTagline={false} showSisterConcern={false} />
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF4FF] text-[#008CFF] border border-blue-200/80 backdrop-blur-md">
              <Radio size={13} className="text-[#008CFF] animate-pulse" />
              <span className="tracking-wider uppercase">
                {isBangla ? 'নিরাপদ কাস্টমার গেটওয়ে' : 'Secure Customer Gateway'}
              </span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black text-[#002B5B] tracking-tight leading-tight">
              {isBangla ? (
                <>
                  আপনার ডিজিটাল বিশ্বকে <br />
                  <span className="bg-gradient-to-r from-[#008CFF] to-blue-600 bg-clip-text text-transparent">
                    স্মার্টভাবে পরিচালনা করুন
                  </span>
                </>
              ) : (
                <>
                  Powering Your <br />
                  <span className="bg-gradient-to-r from-[#008CFF] to-blue-600 bg-clip-text text-transparent">
                    Digital World.
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
              {isBangla
                ? 'অ্যাকাউন্টে সাইন ইন করে ল্যাপটপ, সিসিটিভি ও ইলেকট্রিক্যাল অর্ডার ট্র্যাক করুন, অফিসিয়াল ওয়ারেন্টি ক্লেইম করুন এবং এক্সক্লুসিভ অফার উপভোগ করুন।'
                : 'Access your account to explore technology, shop smarter, and manage your orders with verified confidence.'}
            </p>
          </div>

          {/* Futuristic Circuit & Infrastructure Holographic Visual */}
          <div className="relative rounded-3xl p-6 border border-slate-200/90 bg-white/90 backdrop-blur-xl overflow-hidden shadow-md">
            {/* Tech grid texture overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#008CFF08_1px,transparent_1px),linear-gradient(to_bottom,#008CFF08_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#008CFF]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#008CFF] flex items-center gap-2">
                  <Cpu size={14} className="text-[#008CFF]" />
                  <span>Integrated Tech Matrix</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Online 24/7
                </span>
              </div>

              {/* 4 Connected Satellite Telemetry Nodes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#F4F6F8] border border-slate-200/80 hover:border-[#008CFF] transition-colors">
                  <div className="flex items-center gap-2 text-[#008CFF] font-bold mb-1">
                    <Laptop size={14} />
                    <span>Laptops &amp; PCs</span>
                  </div>
                  <p className="text-[11px] text-slate-600">HP, Dell, Lenovo with Serialized Warranty</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F4F6F8] border border-slate-200/80 hover:border-[#008CFF] transition-colors">
                  <div className="flex items-center gap-2 text-cyan-600 font-bold mb-1">
                    <Camera size={14} />
                    <span>CCTV Security</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Hikvision &amp; Dahua HD Live Remote-View</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F4F6F8] border border-slate-200/80 hover:border-[#008CFF] transition-colors">
                  <div className="flex items-center gap-2 text-amber-600 font-bold mb-1">
                    <Zap size={14} />
                    <span>Solar &amp; IPS Power</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Pure Sine Wave Backup &amp; Certified Electrician</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F4F6F8] border border-slate-200/80 hover:border-[#008CFF] transition-colors">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold mb-1">
                    <Wifi size={14} />
                    <span>Wi-Fi 6 Mesh</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Gigabit Structured Commercial Cabling</p>
                </div>
              </div>

              {/* Telemetry Footer Pill */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 font-mono">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  256-Bit SSL Encrypted
                </span>
                <span>Moulvibazar Showroom</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">
            {isBangla
              ? 'NEED ELECTRO — নির্ভরযোগ্য ইলেকট্রিক্যাল এবং প্রযুক্তি সমাধান।'
              : 'NEED ELECTRO — Trusted Electrical and Technological Solutions.'}
          </p>
        </div>

        {/* ================= RIGHT PANEL: Glass Login Card ================= */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <div className="relative rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-6 sm:p-9 shadow-xl overflow-hidden">
            {/* Subtle top glowing trace */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#008CFF] to-transparent pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-[#008CFF]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Mobile Header (Shown on mobile devices) */}
            <div className="lg:hidden text-center mb-6">
              <Link href="/" className="inline-block mb-3">
                <NeedElectroLogo size="sm" theme="light" showTagline={false} showSisterConcern={false} />
              </Link>
            </div>

            {!isForgotMode ? (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EAF4FF] text-[#008CFF] border border-blue-200 uppercase tracking-widest mb-2 backdrop-blur-xs">
                    <Sparkles size={11} className="text-[#008CFF]" />
                    <span>Customer Portal</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] tracking-tight">
                    {isBangla ? 'স্বাগতম' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {isBangla
                      ? 'NEED ELECTRO-তে সাইন ইন করুন।'
                      : 'Sign in to continue to NEED ELECTRO.'}
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

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Identifier Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#002B5B] uppercase tracking-wider mb-1.5">
                      {isBangla ? 'মোবাইল নম্বর বা ইমেইল *' : 'Mobile Number or Email *'}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Phone size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="017XXXXXXXX or name@example.com"
                        className="w-full bg-[#F4F6F8] border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/20 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#002B5B] uppercase tracking-wider">
                        {isBangla ? 'পাসওয়ার্ড *' : 'Password *'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotMode(true);
                          setForgotIdentifier(identifier);
                        }}
                        className="text-xs text-[#008CFF] hover:underline font-semibold transition-colors"
                      >
                        {isBangla ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#F4F6F8] border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/20 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Option */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-white border-slate-300 text-[#008CFF] focus:ring-[#008CFF] cursor-pointer"
                      />
                      <span className="text-xs text-slate-600">
                        {isBangla ? 'আমাকে মনে রাখুন' : 'Keep me signed in on this device'}
                      </span>
                    </label>
                  </div>

                  {/* Primary Futuristic Sign In Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer group/btn"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isBangla ? 'সাইন ইন করুন' : 'Sign In'}</span>
                        <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider & Registration Switch */}
                <div className="mt-6 pt-5 border-t border-slate-200 text-center space-y-3">
                  <div className="relative flex items-center justify-center">
                    <span className="bg-white px-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      {isBangla ? 'NEED ELECTRO-তে নতুন?' : 'New to NEED ELECTRO?'}
                    </span>
                  </div>

                  <Link
                    href={`/customer/register?redirect=${encodeURIComponent(redirectUrl)}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:border-[#008CFF] bg-[#F4F6F8] hover:bg-slate-100 text-[#002B5B] font-bold text-xs sm:text-sm transition-all"
                  >
                    <span>{isBangla ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}</span>
                    <ArrowRight size={14} className="text-[#008CFF]" />
                  </Link>
                </div>
              </>
            ) : (
              /* ================= FORGOT PASSWORD FLOW ================= */
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(false);
                      setForgotError(null);
                      setForgotMessage(null);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h2 className="text-lg sm:text-xl font-bold text-[#002B5B]">
                    {isBangla ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset Password'}
                  </h2>
                </div>

                {forgotError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {forgotError}
                  </div>
                )}

                {forgotMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#008CFF] text-xs font-mono">
                    {forgotMessage}
                  </div>
                )}

                {forgotStep === 'request' ? (
                  <form onSubmit={handleForgotRequest} className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isBangla
                        ? 'আপনার নিবন্ধিত মোবাইল নম্বর বা ইমেইল লিখুন। আমরা একটি ৬-ডিজিটের ভেরিফিকেশন কোড প্রদান করব।'
                        : 'Enter your registered mobile number or email. We will generate a 6-digit verification code.'}
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-[#002B5B] uppercase tracking-wider mb-1.5">
                        {isBangla ? 'মোবাইল বা ইমেইল' : 'Mobile Number or Email'}
                      </label>
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="017XXXXXXXX or name@example.com"
                        className="w-full bg-[#F4F6F8] border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-60"
                    >
                      {forgotLoading
                        ? 'Processing...'
                        : (isBangla ? 'রিকভারি কোড পাঠান' : 'Send Recovery Code')}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#002B5B] uppercase tracking-wider mb-1.5">
                        {isBangla ? '৬-ডিজিটের কোড' : '6-Digit Reset Code'}
                      </label>
                      <input
                        type="text"
                        required
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-[#F4F6F8] border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/20 rounded-xl px-4 py-2.5 text-sm sm:text-base text-slate-900 font-mono text-center tracking-widest outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#002B5B] uppercase tracking-wider mb-1.5">
                        {isBangla ? 'নতুন পাসওয়ার্ড' : 'New Password (min 6 characters)'}
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#F4F6F8] border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-[#008CFF] focus:ring-2 focus:ring-[#008CFF]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-60"
                    >
                      {forgotLoading
                        ? 'Resetting...'
                        : (isBangla ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm & Sign In')}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  const { t } = useLanguage();
  const breadcrumbs = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: 'Customer Sign In', path: '/customer/login' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col relative overflow-hidden font-sans">
      {/* Background Soft Tech Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#008CFF08_1px,transparent_1px),linear-gradient(to_bottom,#008CFF08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-sky-300/5 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#008CFF]/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-300/10 blur-3xl pointer-events-none" />

      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />
      
      <main className="flex-1 flex items-center justify-center relative z-10">
        <Suspense fallback={<div className="p-12 text-center text-sm font-mono text-[#008CFF]">Loading Secure Portal...</div>}>
          <FuturisticLoginForm />
        </Suspense>
      </main>

      <CustomerFooter />
    </div>
  );
}
