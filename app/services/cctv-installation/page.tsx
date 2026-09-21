'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { Video, ShieldCheck, CheckCircle2, Phone, MessageCircle, Eye, Wifi, HardDrive, Smartphone } from 'lucide-react';

export default function CctvInstallationPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cameraCount, setCameraCount] = useState('4 Cameras Setup');
  const [propertyType, setPropertyType] = useState('Residence / Home');
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please provide your name and contact phone number.');
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
    { name: 'CCTV Installation', path: '/services/cctv-installation' },
  ];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-12 px-4 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-cyan-300">
            <Video size={14} />
            <span>Turnkey CCTV Surveillance Installation</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            CCTV Camera Installation in Moulvibazar — Site Survey, Cabling & Setup
          </h1>

          <p className="text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Protect your family, retail business, or warehouse with professional CCTV installation from {BUSINESS_INFO.name}. Our experienced technicians handle complete on-site camera positioning, concealed coaxial/Cat6 cabling, DVR/NVR configuration, surveillance hard drive setup, and mobile live viewing on your smartphone.
          </p>
        </div>
      </section>

      {/* Steps & Booking Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Our 4-Step CCTV Installation Process</h2>
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 text-cyan-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Free Site Assessment & Camera Angle Planning</h3>
                    <p className="text-slate-400 mt-1">We inspect building blind spots, entry gates, cash counters, and boundary walls to determine optimal focal lengths.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 text-cyan-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Concealed Wiring & Camera Mounting</h3>
                    <p className="text-slate-400 mt-1">Using pure copper Cat6 / coaxial cables with weather-tight conduit pipes, protecting cables from rat bites and sun damage.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 text-cyan-400 font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">DVR / NVR Configuration & Hard Drive Setup</h3>
                    <p className="text-slate-400 mt-1">Surveillance hard drive installation with motion detection recording enabled to maximize 20+ days of storage history.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 text-cyan-400 font-bold flex items-center justify-center shrink-0">4</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Remote Phone Viewing Configuration</h3>
                    <p className="text-slate-400 mt-1">We connect your system to your mobile phone (Android / iPhone) with secure cloud P2P, enabling real-time monitoring from anywhere.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact */}
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-700"
              >
                <Phone size={14} className="text-cyan-400" />
                <span>Call Technician: {BUSINESS_INFO.phone}</span>
              </a>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%2C%20I%20want%20to%20install%20CCTV%20cameras%20at%20my%20property%20in%20Moulvibazar.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 font-bold text-xs px-4 py-2.5 rounded-lg border border-emerald-500/30"
              >
                <MessageCircle size={14} />
                <span>WhatsApp Site Inspection</span>
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-1">Request CCTV Site Survey</h2>
              <p className="text-xs text-slate-400 mb-6">
                Tell us about your property. Our technician will contact you for a site survey and quote.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Survey Request Received!</h3>
                  <p className="text-xs text-slate-300">
                    Thank you <strong>{name}</strong>. Our CCTV team will call you at <strong>{phone}</strong> to confirm your site visit.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shakil Chowdhury"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01712-345678"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Estimated Cameras Needed</label>
                    <select
                      value={cameraCount}
                      onChange={e => setCameraCount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="2 Cameras (Basic Entry/Exit)">2 Cameras (Basic Entry/Exit)</option>
                      <option value="4 Cameras (Home / Medium Shop)">4 Cameras (Home / Medium Shop)</option>
                      <option value="8 Cameras (Showroom / Multi-Room)">8 Cameras (Showroom / Multi-Room)</option>
                      <option value="16+ Cameras (Factory / Commercial Building)">16+ Cameras (Factory / Commercial Building)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Property Type</label>
                    <select
                      value={propertyType}
                      onChange={e => setPropertyType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Residence / Home">Residence / Home</option>
                      <option value="Retail Shop / Showroom">Retail Shop / Showroom</option>
                      <option value="Office / Commercial Space">Office / Commercial Space</option>
                      <option value="Warehouse / Industrial Yard">Warehouse / Industrial Yard</option>
                      <option value="Mosque / School / Institution">Mosque / School / Institution</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Address / Location</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Kusumbag, Moulvibazar town"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-2.5 rounded-lg transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Submitting survey request...</span>
                    ) : (
                      <>
                        <Video size={14} />
                        <span>Schedule Free Site Survey</span>
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
