'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { Wrench, Zap, ShieldCheck, CheckCircle2, Phone, MessageCircle, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function ElectricianBookingPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Moulvibazar Town');
  const [serviceType, setServiceType] = useState('Wiring & Electrical Troubleshooting');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please provide your name and phone number so our electrician can contact you.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const breadcrumbs = [
    { name: 'Services', path: '/electrical-services' },
    { name: 'Book Electrician', path: '/services/electrician' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-amber-50/70 via-transparent to-transparent dark:from-amber-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-900/40 dark:border-amber-500/30 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Wrench size={14} />
            <span>Certified Electrician Booking in Moulvibazar</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Book a Certified Electrician in Moulvibazar
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Need an experienced electrician for your home, showroom, or industrial facility? {BUSINESS_INFO.name} provides certified technicians with transparent rates, prompt dispatch, and guaranteed workmanship across Moulvibazar.
          </p>
        </div>
      </section>

      {/* Main Content & Booking Form */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Col: Info & Standards */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Why Choose NEED ELECTRO Electricians?</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
                <ShieldCheck size={22} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Certified & Vetted Professionals</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Our electricians possess formal training in single-phase and 3-phase systems, circuit breaker calculations, and short-circuit fault identification.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
                <Clock size={22} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rapid Same-Day Dispatch</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Technicians are dispatched locally from Kusumbag, Moulvibazar, reaching Kusumbag, Chowmuhana, and Shamshernagar Road within 30 to 60 minutes.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
                <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transparent Pricing — No Hidden Fees</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Clear service estimates before starting work. You only pay for the actual labor and genuine components installed.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Contact Alternatives */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Prefer to call directly?</span>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs"
                >
                  <Phone size={14} className="text-blue-600 dark:text-cyan-400" />
                  <span>{BUSINESS_INFO.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=I%20want%20to%20book%20an%20electrician%20in%20Moulvibazar.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-400 font-bold text-xs px-4 py-2.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Dispatch</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Col: Booking Form */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Book Electrician Online</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Fill out the details below. Our service coordinator will call you to confirm your booking.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-bold text-emerald-900 dark:text-white">Booking Request Received!</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Thank you <strong>{name}</strong>. Our Moulvibazar coordinator will call you at <strong>{phone}</strong> within 30 minutes to confirm your technician schedule.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 text-xs text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number (Required for call) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01712-345678"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Service Area in Moulvibazar</label>
                    <select
                      value={area}
                      onChange={e => setArea(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Moulvibazar Town">Moulvibazar Town (Kusumbag / Chowmuhana)</option>
                      <option value="Shamshernagar Road">Shamshernagar Road</option>
                      <option value="Sreemangal Road">Sreemangal Road</option>
                      <option value="Sreemangal Upazila">Sreemangal Upazila</option>
                      <option value="Kulaura Upazila">Kulaura Upazila</option>
                      <option value="Rajnagar Upazila">Rajnagar Upazila</option>
                      <option value="Other Area in Sylhet">Other Area in Sylhet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Service Required</label>
                    <select
                      value={serviceType}
                      onChange={e => setServiceType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Wiring & Electrical Troubleshooting">Wiring & Electrical Troubleshooting</option>
                      <option value="Distribution Board (DB) & Breaker Setup">Distribution Board (DB) & Breaker Setup</option>
                      <option value="Short Circuit / Emergency Fault Inspection">Short Circuit / Emergency Fault Inspection</option>
                      <option value="Light Fixture & Fan Installation">Light Fixture & Fan Installation</option>
                      <option value="Earthing & Grounding System">Earthing & Grounding System</option>
                      <option value="IPS / Inverter / Generator Wiring">IPS / Inverter / Generator Wiring</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Problem Description / Address Details</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe the issue or give house/building address..."
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Submitting request...</span>
                    ) : (
                      <>
                        <Wrench size={14} />
                        <span>Confirm Booking Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
