'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Phone, Mail, Lock, ShieldCheck, CheckCircle2,
  AlertCircle, KeyRound, Save, ArrowLeft
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { useCustomerAuth } from '@/src/services/customerAuthContext';
import { useLanguage } from '@/src/services/languageContext';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { customer, isLoading, updateProfile } = useCustomerAuth();
  const { t, isBangla } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/customer/login?redirect=/customer/profile');
      return;
    }

    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
    }
  }, [customer, isLoading, router]);

  if (isLoading || !customer) {
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

  const breadcrumbs = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: 'Customer Dashboard', path: '/customer/dashboard' },
    { name: 'Profile & Security', path: '/customer/profile' },
  ];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!name.trim()) {
      setProfileError(isBangla ? 'নাম আবশ্যক।' : 'Name is required.');
      return;
    }

    setProfileSaving(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      });

      if (res.success) {
        setProfileSuccess(isBangla ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!');
      } else {
        setProfileError(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileError(err.message || 'An unexpected error occurred.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError(isBangla ? 'বর্তমান পাসওয়ার্ড দিন।' : 'Current password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(isBangla ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(isBangla ? 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।' : 'Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess(isBangla ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || 'Failed to change password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d1e] text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isBangla ? 'প্রোফাইল ও নিরাপত্তা সেটিংস' : 'Profile & Security Settings'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isBangla ? 'আপনার ব্যক্তিগত তথ্য ও অ্যাকাউন্ট নিরাপত্তা পরিচালনা করুন।' : 'Manage your personal details and account credentials.'}
            </p>
          </div>
          <Link
            href="/customer/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{isBangla ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Personal Details */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-lg">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-[#008CFF]/10 text-[#008CFF] flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isBangla ? 'ব্যক্তিগত তথ্য' : 'Personal Details'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {isBangla ? 'আপনার নাম ও যোগাযোগের তথ্য' : 'Your name & verified contact'}
                </p>
              </div>
            </div>

            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isBangla ? 'সম্পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isBangla ? 'মোবাইল নম্বর (ভেরিফাইড)' : 'Mobile Number (Account ID)'}
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    disabled
                    value={customer.phone}
                    className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Primary mobile number is tied to your ERP customer record and order history.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isBangla ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs shadow-md shadow-[#008CFF]/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
              >
                {profileSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={14} />
                    <span>{isBangla ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card 2: Security & Password */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-lg">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <KeyRound size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {isBangla ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {isBangla ? 'অ্যাকাউন্ট সুরক্ষিত রাখতে নিয়মিত পাসওয়ার্ড আপডেট করুন' : 'Protect your customer account & orders'}
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isBangla ? 'বর্তমান পাসওয়ার্ড *' : 'Current Password *'}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isBangla ? 'নতুন পাসওয়ার্ড *' : 'New Password * (min 6 chars)'}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isBangla ? 'কনফার্ম নতুন পাসওয়ার্ড *' : 'Confirm New Password *'}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
              >
                {passwordSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    <span>{isBangla ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
