'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Plus, Trash2, Edit3, CheckCircle2,
  AlertCircle, ArrowLeft, Home, Building2, Briefcase
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { useCustomerAuth, CustomerAddress } from '@/src/services/customerAuthContext';
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

export default function CustomerAddressesPage() {
  const router = useRouter();
  const { customer, isLoading, refreshCustomer } = useCustomerAuth();
  const { t, isBangla } = useLanguage();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [label, setLabel] = useState('Home');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Moulvibazar');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/customer/login?redirect=/customer/addresses');
      return;
    }

    if (customer) {
      setAddresses(customer.addresses || []);
    }
  }, [customer, isLoading, router]);

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
    { name: 'Saved Addresses', path: '/customer/addresses' },
  ];

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setLabel('Home');
    setAddress('');
    setDistrict('Moulvibazar');
    setDeliveryArea('');
    setIsDefault(false);
    setError(null);
  };

  const handleStartEdit = (addr: CustomerAddress) => {
    setEditingId(addr.id);
    setIsAdding(true);
    setLabel(addr.label || 'Home');
    setAddress(addr.address || '');
    setDistrict(addr.district || 'Moulvibazar');
    setDeliveryArea(addr.deliveryArea || '');
    setIsDefault(addr.isDefault || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!address.trim() || address.trim().length < 5) {
      setError(isBangla ? 'বিস্তারিত ঠিকানা দিন।' : 'Detailed address is required.');
      return;
    }

    setSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const payload: any = {
        label: label.trim(),
        address: address.trim(),
        district,
        deliveryArea: deliveryArea.trim() || undefined,
        isDefault,
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch('/api/customer/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(isBangla ? 'ঠিকানা সফলভাবে সংরক্ষণ হয়েছে!' : 'Address saved successfully!');
        setAddresses(data.data || []);
        await refreshCustomer();
        resetForm();
      } else {
        setError(data.error || 'Failed to save address.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isBangla ? 'আপনি কি এই ঠিকানাটি মুছতে চান?' : 'Are you sure you want to remove this address?')) {
      return;
    }

    try {
      const res = await fetch(`/api/customer/addresses?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses(data.data || []);
        await refreshCustomer();
      } else {
        alert(data.error || 'Failed to remove address');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to remove address');
    }
  };

  const handleSetDefault = async (addr: CustomerAddress) => {
    try {
      const res = await fetch('/api/customer/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: addr.id, isDefault: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses(data.data || []);
        await refreshCustomer();
      }
    } catch (e) {
      console.error('Failed to set default address:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col font-sans">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-4xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full px-3 sm:px-6 lg:px-8 3xl:px-12 py-6 sm:py-10 flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isBangla ? 'সংরক্ষিত ডেলিভারি ঠিকানা' : 'Saved Delivery Addresses'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isBangla ? 'চেকআউটে দ্রুত অর্ডারের জন্য আপনার ডেলিভারি ঠিকানাসমূহ পরিচালনা করুন।' : 'Manage multiple shipping addresses for one-click express checkout.'}
            </p>
          </div>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005ea8] text-white text-xs font-bold shadow-md shadow-[#008CFF]/20 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus size={15} />
              <span>{isBangla ? 'নতুন ঠিকানা যোগ করুন' : 'Add New Address'}</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Add / Edit Form Modal / Panel */}
        {isAdding && (
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-[#008CFF]/40 bg-white/95 dark:bg-slate-900/95 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? (isBangla ? 'ঠিকানা এডিট করুন' : 'Edit Delivery Address') : (isBangla ? 'নতুন ঠিকানা যোগ করুন' : 'Add New Delivery Address')}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Label (e.g. Home, Office)
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Home / Office / Shop"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Area / Upazila
                  </label>
                  <input
                    type="text"
                    value={deliveryArea}
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    placeholder="e.g. Kusumbag, Sreemangal Road"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Detailed Street Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, Road number, landmark, holding..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008CFF] resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#008CFF] rounded"
                />
                <label htmlFor="isDefaultCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Set as my primary default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update Address' : 'Save Address')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                addr.isDefault
                  ? 'border-[#008CFF] bg-[#008CFF]/5 shadow-md ring-1 ring-[#008CFF]/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {addr.label || 'Address'}
                  </span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(addr)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#008CFF] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Address"
                  >
                    <Edit3 size={15} />
                  </button>
                  {addresses.length > 1 && (
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-1">
                {addr.address}
              </p>
              <p className="text-[11px] text-slate-400">
                {addr.deliveryArea ? `${addr.deliveryArea}, ` : ''}
                {addr.district}
              </p>

              {!addr.isDefault && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr)}
                    className="text-xs text-[#008CFF] hover:underline font-bold"
                  >
                    Set as default address →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
