import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, generateSeoMetadata, buildFaqSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { HelpCircle, Phone, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Frequently Asked Questions (FAQ) | NEED ELECTRO Moulvibazar',
    description: 'Find answers to common customer questions about laptop warranties, laptop EMI installment rules, CCTV installations, electrician services, payment methods, and delivery coverage at NEED ELECTRO.',
    path: '/faq',
    keywords: [
      'NEED ELECTRO FAQ',
      'Laptop warranty Moulvibazar',
      'EMI rules NEED ELECTRO',
      'Laptop delivery Moulvibazar',
      'মৌলভীবাজার ল্যাপটপ প্রশ্নোত্তর',
    ],
  });
}

const FAQS = [
  {
    category: 'Laptops & Hardware',
    items: [
      {
        question: 'What laptops are available at NEED ELECTRO Moulvibazar?',
        answer: 'We stock genuine HP EliteBook and ProBook, Dell Latitude and Inspiron, Lenovo ThinkPad, and high-performance laptops for students, freelance programmers, and corporate office work. All models undergo 24-point hardware testing.',
      },
      {
        question: 'Where is NEED ELECTRO located?',
        answer: 'Our main showroom is located at Shop No: 5, MR Plaza, Kusumbag, Moulvibazar, Sylhet Division, Bangladesh. We are open Saturday to Thursday from 9:30 AM to 9:30 PM.',
      },
      {
        question: 'Does NEED ELECTRO sell tested used or pre-owned laptops?',
        answer: 'Yes! We specialize in top-tier, tested business-grade pre-owned laptops. Every device comes with guaranteed 80%+ battery health, genuine chargers, 7-day replacement warranty, and 2-year service warranty.',
      },
      {
        question: 'What warranty is provided on laptops?',
        answer: 'Every tested laptop includes a 7-day instant replacement warranty for any hardware defect, plus up to 2 years of free service warranty handled locally in Moulvibazar.',
      },
    ],
  },
  {
    category: 'Laptop EMI & Financing',
    items: [
      {
        question: 'Does NEED ELECTRO provide laptop EMI in Moulvibazar?',
        answer: 'Yes! We provide structured 3, 6, 9, and 12-month installment plans with 0% interest on selected options. A credit card is not mandatory — apply with your National ID (NID) and one local guarantor.',
      },
      {
        question: 'What is the required down payment for laptop EMI?',
        answer: 'Typically between 20% to 30% of the laptop price depending on the chosen plan duration.',
      },
      {
        question: 'How do I pay my monthly installment?',
        answer: 'You can pay via bKash, Nagad, bank transfer, or directly at our Kusumbag showroom by the 10th of each calendar month.',
      },
    ],
  },
  {
    category: 'Services & CCTV',
    items: [
      {
        question: 'Does NEED ELECTRO install CCTV cameras?',
        answer: 'Yes! Our certified technicians handle site surveys, camera placement, concealed cabling, DVR/NVR setup, and remote mobile viewing configuration for homes, shops, resorts, and warehouses across Moulvibazar.',
      },
      {
        question: 'Does NEED ELECTRO provide electrician services?',
        answer: 'Yes. We dispatch licensed electricians for residential wiring, DB board installations, circuit breaker repairs, short-circuit troubleshooting, and earthing setups.',
      },
    ],
  },
  {
    category: 'Delivery & Payment',
    items: [
      {
        question: 'Does NEED ELECTRO provide hand delivery in Moulvibazar?',
        answer: 'Yes! Orders placed inside Moulvibazar town are delivered same-day within 2 to 4 hours. We also ship across all 64 districts in Bangladesh via Sundarban and Steadfast Courier.',
      },
      {
        question: 'Can I verify the product before paying the courier?',
        answer: 'Yes. We support open-box verification, allowing you to power on the laptop and inspect the condition before making the final payment.',
      },
    ],
  },
];

export default function FaqPage() {
  const flatFaqs = FAQS.flatMap(c => c.items);
  const faqSchema = buildFaqSchema(flatFaqs);
  const breadcrumbs = [{ name: 'Customer FAQs', path: '/faq' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 dark:bg-blue-900/40 dark:border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 dark:text-cyan-300">
            <HelpCircle size={14} />
            <span>Help Center & Answers</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Frequently Asked Questions — NEED ELECTRO Moulvibazar
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Everything you need to know about our laptops, testing standards, EMI financing, CCTV installations, electrician services, and delivery policies.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 max-w-4xl mx-auto w-full flex-1 space-y-12">
        {FAQS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-4">
            <h2 className="text-xl font-bold text-blue-600 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              {group.category}
            </h2>
            <div className="space-y-4">
              {group.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                    {item.question}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Still Have a Question?</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Our showroom team is available to assist you via phone or WhatsApp during opening hours.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Phone size={14} />
              <span>Call Showroom: {BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5"
            >
              <MessageCircle size={14} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
