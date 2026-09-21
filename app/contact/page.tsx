'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitted(true);
  };

  const breadcrumbs = [{ name: 'Contact Us', path: '/contact' }];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-cyan-300">
            <MapPin size={14} />
            <span>Moulvibazar Showroom & Support</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Contact NEED ELECTRO Moulvibazar
          </h1>

          <p className="text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Have a question about laptop stock, EMI eligibility, CCTV camera installation, or need an electrician dispatched to your home? We are ready to help.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Showroom & Contact Details</h2>

            <div className="space-y-4 text-xs">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                <MapPin size={22} className="text-cyan-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Physical Address</h3>
                  <p className="text-slate-300 leading-relaxed">
                    {BUSINESS_INFO.address.streetAddress}, {BUSINESS_INFO.address.addressLocality}, {BUSINESS_INFO.address.addressRegion} - {BUSINESS_INFO.address.postalCode}, Bangladesh.
                  </p>
                  <span className="text-slate-500 block">MR Plaza, Kusumbag (Near Moulvibazar Central Circle).</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                <Phone size={22} className="text-emerald-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Phone & WhatsApp Hotline</h3>
                  <p className="text-slate-300">
                    Direct Showroom: <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="text-white font-bold hover:underline">{BUSINESS_INFO.phone}</a>
                  </p>
                  <p className="text-slate-300">
                    WhatsApp: <a href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">+880 1733-983752</a>
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                <Mail size={22} className="text-blue-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Email Addresses</h3>
                  <p className="text-slate-300">
                    Customer Inquiries: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-cyan-400 hover:underline">{BUSINESS_INFO.email}</a>
                  </p>
                  <p className="text-slate-300">
                    Technical Support: <a href={`mailto:${BUSINESS_INFO.supportEmail}`} className="text-cyan-400 hover:underline">{BUSINESS_INFO.supportEmail}</a>
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                <Clock size={22} className="text-amber-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Business Hours</h3>
                  <p className="text-slate-300">Saturday – Thursday: <strong>9:30 AM – 9:30 PM</strong></p>
                  <p className="text-rose-400">Friday: Closed (Weekend)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2">Send Us a Direct Message</h2>
              <p className="text-xs text-slate-400 mb-6">
                Have an inquiry about a product or service? Leave a note and we will call you back.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Message Received!</h3>
                  <p className="text-xs text-slate-300">
                    Thank you <strong>{name}</strong>. Our team in Moulvibazar will reach out to <strong>{phone}</strong> promptly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahfuzur Rahman"
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
                      placeholder="e.g. 01733-983752"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Inquiry Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Laptop Inquiry">Laptop Inquiry (HP, Dell, Lenovo)</option>
                      <option value="Laptop EMI Financing">Laptop EMI Financing</option>
                      <option value="CCTV Installation & Survey">CCTV Installation & Survey</option>
                      <option value="Electrician Service Booking">Electrician Service Booking</option>
                      <option value="General Inquiry">General Inquiry / Wholesale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Message / Requirements</label>
                    <textarea
                      rows={4}
                      placeholder="How can we assist you today?"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-2.5 rounded-lg transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    <span>Send Inquiry</span>
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
