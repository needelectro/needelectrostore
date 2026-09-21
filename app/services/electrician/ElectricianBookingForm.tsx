'use client';

import React, { useState } from 'react';
import { Wrench, Phone, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';

export function ElectricianBookingForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Moulvibazar Town');
  const [serviceType, setServiceType] = useState('Wiring & Electrical Troubleshooting');
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
          address: area,
          serviceType,
          details,
          propertyType: 'Residential / Commercial Electrician Service',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Booking request failed.');
      }

      setSubmittedJobCard(data.jobCardNumber);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to submit booking. Please call our hotline directly.');
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
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Booking Request Confirmed!</h3>
          <div className="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Job Reference Number:</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-base">{submittedJobCard}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Thank you, <strong>{name}</strong>! Your service job card has been created in our ERP system. Our certified electrician team in Moulvibazar will call you at <strong>{phone}</strong> within 15 to 30 minutes to confirm dispatch.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Phone size={14} />
              <span>Call Hotline: {BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO,%20I%20booked%20an%20electrician%20service%20with%20Job%20Reference:%20${submittedJobCard}`}
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
            <Wrench size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Book Electrician Dispatch</h3>
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
              placeholder="e.g. Tanvir Ahmed"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
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
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / Area in Moulvibazar *</label>
            <select
              value={area}
              onChange={e => setArea(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Moulvibazar Town">Moulvibazar Town</option>
              <option value="Kusumbag, Moulvibazar">Kusumbag</option>
              <option value="Chowmuhana, Moulvibazar">Chowmuhana</option>
              <option value="Shamshernagar Road">Shamshernagar Road</option>
              <option value="Court Road / Sadar">Court Road / Sadar</option>
              <option value="Sreemangal Road">Sreemangal Road</option>
              <option value="Sreemangal Upazila">Sreemangal Upazila</option>
              <option value="Kulaura Upazila">Kulaura Upazila</option>
              <option value="Rajnagar Upazila">Rajnagar Upazila</option>
              <option value="Kamalganj Upazila">Kamalganj Upazila</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type of Electrical Service *</label>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Wiring & Electrical Troubleshooting">Wiring & Troubleshooting</option>
              <option value="Circuit Breaker / DB Board Installation">Circuit Breaker & DB Board</option>
              <option value="Short Circuit / Power Failure Repair">Emergency Short-Circuit Repair</option>
              <option value="Ceiling Fan, Light & Socket Installation">Fan, Lighting & Switchboard</option>
              <option value="Earthing / Lightning Surge Protection">Earthing & Grounding Protection</option>
              <option value="Commercial Showroom Electrical Fit-out">Commercial Facility Fit-out</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Details / Address Details</label>
            <textarea
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Describe the issue or exact landmark..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Submitting to Service ERP...</span>
            ) : (
              <>
                <Wrench size={14} />
                <span>Confirm Electrician Booking</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-500 text-center">
            Standard technician service charge applies. Transparent billing with no hidden fees.
          </p>
        </form>
      )}
    </div>
  );
}
