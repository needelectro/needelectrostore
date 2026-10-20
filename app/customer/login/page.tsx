'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock, Phone, Mail, Eye, EyeOff, ArrowRight,
  AlertCircle, CheckCircle2, KeyRound, ArrowLeft
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { useCustomerAuth } from '@/src/services/customerAuthContext';
import { useLanguage } from '@/src/services/languageContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/customer/dashboard';

  const { login, customer } = useCustomerAuth();
  const { isBangla } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password mode
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
      setErrorMessage(isBangla ? 'অনুগ্রহ করে মোবাইল নম্বর বা ইমেইল লিখুন।' : 'Please enter your mobile number or email.');
      return;
    }

    if (!password) {
      setErrorMessage(isBangla ? 'অনুগ্রহ করে পাসওয়ার্ড লিখুন।' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        setSuccessMessage(isBangla ? 'সফলভাবে লগইন হয়েছে! রিডাইরেক্ট হচ্ছে...' : 'Signed in successfully! Redirecting...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 800);
      } else {
        setErrorMessage(res.error || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);

    if (!forgotIdentifier.trim()) {
      setForgotError(isBangla ? 'মোবাইল বা ইমেইল লিখুন।' : 'Please enter your mobile number or email.');
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
            ? `Recovery code generated: ${data.resetCodeHint} (Check SMS / Email)`
            : (data.message || 'Verification code sent.')
        );
      } else {
        setForgotError(data.error || 'Failed to send recovery code.');
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
      setForgotError(isBangla ? 'কোড ও নতুন পাসওয়ার্ড দিন।' : 'Please enter the reset code and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError(isBangla ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
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
        setSuccessMessage(isBangla ? 'পাসওয়ার্ড পরিবর্তিত হয়েছে! সাইন ইন হচ্ছে...' : 'Password reset! Signing you in...');
        setIsForgotMode(false);
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1200);
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
    <div className="max-w-md mx-auto w-full px-4 py-8 sm:py-16">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl backdrop-blur-xl">
        {!isForgotMode ? (
          <>
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#002B5B] to-[#008CFF] text-white shadow-lg shadow-[#008CFF]/25 mb-3">
                <Lock size={22} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isBangla ? 'কাস্টমার সাইন ইন' : 'Customer Sign In'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                {isBangla
                  ? 'আপনার অর্ডার ও প্রোফাইল অ্যাক্সেস করতে লগইন করুন।'
                  : 'Access your orders, saved addresses, and live order status.'}
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

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isBangla ? 'মোবাইল নম্বর বা ইমেইল *' : 'Mobile Number or Email *'}
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="017XXXXXXXX or user@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {isBangla ? 'পাসওয়ার্ড *' : 'Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setForgotIdentifier(identifier);
                    }}
                    className="text-xs text-[#008CFF] hover:underline font-semibold"
                  >
                    {isBangla ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </button>
                </div>
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0066cc] hover:from-[#0070cc] hover:to-[#0052a3] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#008CFF]/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isBangla ? 'সাইন ইন করুন' : 'Sign In to Account'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBangla ? 'কোন অ্যাকাউন্ট নেই?' : "Don't have a customer account yet?"}{' '}
                <Link
                  href={`/customer/register?redirect=${encodeURIComponent(redirectUrl)}`}
                  className="text-[#008CFF] font-bold hover:underline ml-1"
                >
                  {isBangla ? 'নিবন্ধন করুন →' : 'Register now →'}
                </Link>
              </p>
            </div>
          </>
        ) : (
          /* Forgot Password Recovery Flow */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setForgotError(null);
                  setForgotMessage(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isBangla ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset Password'}
              </h2>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {forgotError}
              </div>
            )}

            {forgotMessage && (
              <div className="mb-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-[#008CFF] text-xs">
                {forgotMessage}
              </div>
            )}

            {forgotStep === 'request' ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBangla
                    ? 'আপনার নিবন্ধিত মোবাইল নম্বর বা ইমেইল লিখুন। আমরা একটি ৬-ডিজিটের ভেরিফিকেশন কোড প্রদান করব।'
                    : 'Enter your registered mobile number or email. We will generate a 6-digit verification code.'}
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isBangla ? 'মোবাইল বা ইমেইল' : 'Mobile Number or Email'}
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="017XXXXXXXX or name@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
                >
                  {forgotLoading ? 'Processing...' : (isBangla ? 'রিকভারি কোড পাঠান' : 'Send Recovery Code')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isBangla ? '৬-ডিজিটের কোড' : '6-Digit Reset Code'}
                  </label>
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {isBangla ? 'নতুন পাসওয়ার্ড' : 'New Password (min 6 characters)'}
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
                >
                  {forgotLoading ? 'Resetting...' : (isBangla ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm & Sign In')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  const { t } = useLanguage();
  const breadcrumbs = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: 'Customer Login', path: '/customer/login' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d1e] text-slate-800 dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="p-12 text-center text-sm">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <CustomerFooter />
    </div>
  );
}
