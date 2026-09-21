'use client';

import React, { useState } from 'react';
import { Video, Phone, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';

export function CctvBookingForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cameraCount, setCameraCount] = useState('4 Cameras Complete Package');
  const [propertyType, setPropertyType] = useState('Residence / Home');
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');
  const [submittedJobCard, setSubmittedJobCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Please provide your name and contact phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/services/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim() || 'Moulvibazar',
          serviceType: 'CCTV Installation & Security Setup',
          propertyType,
          details: `Package: ${cameraCount}. Property: ${propertyType}. Notes: ${details || 'None'}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit CCTV booking.');
      }

      setSubmittedJobCard(data.jobCardNumber);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to submit CCTV inquiry. Please contact our hotline directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      {submittedJobCard ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">CCTV Survey Request Confirmed!</h3>
          <div className="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Job Reference Number:</span>
            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-base">{submittedJobCard}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Thank you, <strong>{name}</strong>! Your CCTV site survey and installation request has been recorded in our ERP system. Our surveillance specialist will contact you at <strong>{phone}</strong> to coordinate the site survey.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Phone size={14} />
              <span>Call Hotline: {BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO,%20I%20requested%20a%20CCTV%20installation%20survey%20with%20Job%20Reference:%20${submittedJobCard}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Video size={18} className="text-blue-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Request CCTV Site Survey & Quote</h3>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-300 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Mahfuzur Rahman"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone Number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="017XX-XXXXXX"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CCTV Setup Size</label>
              <select
                value={cameraCount}
                onChange={e => setCameraCount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="2 Cameras Starter">2 Cameras Starter</option>
                <option value="4 Cameras Complete Package">4 Cameras Complete</option>
                <option value="8 Cameras Enterprise">8 Cameras Enterprise</option>
                <option value="16+ Cameras Commercial">16+ Cameras Commercial</option>
                <option value="Maintenance / Re-wiring Only">Maintenance Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Residence / Home">Residence / Home</option>
                <option value="Retail Shop / Showroom">Retail Showroom</option>
                <option value="Warehouse / Factory">Warehouse / Factory</option>
                <option value="School / College / Mosque">Institution / Mosque</option>
                <option value="Multi-story Commercial Building">Commercial Building</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Site Location / Address in Moulvibazar</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Kusumbag, Moulvibazar Town"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Additional Requirements (Optional)</label>
            <textarea
              rows={2}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="e.g. Need color night vision cameras, sound recording, mobile live viewing..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Submitting to Service ERP...</span>
            ) : (
              <>
                <Video size={14} />
                <span>Submit CCTV Survey Request</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-500 text-center">
            Free site consultation in Moulvibazar town. Transparent package pricing with 1-year equipment warranty.
          </p>
        </form>
      )}
    </div>
  );
}
