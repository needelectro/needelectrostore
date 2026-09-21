import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildFaqSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { CreditCard, ShieldCheck, CheckCircle2, Phone, MessageCircle, FileText, Calculator, ArrowRight } from 'lucide-react';
import { EmiCalculatorWidget } from './EmiCalculatorWidget';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Laptop EMI in Moulvibazar | Buy Laptops with Easy Installments | NEED ELECTRO',
    description: 'Buy laptops with flexible monthly EMI installments in Moulvibazar at NEED ELECTRO. 3, 6, 9, and 12-month plans with 0% interest on selected options. No credit card required — apply with NID and local guarantor.',
    path: '/laptop-emi',
    keywords: [
      'Laptop EMI in Moulvibazar',
      'Buy laptop in installments Moulvibazar',
      'Laptop loan Moulvibazar',
      'Student laptop EMI Moulvibazar',
      'Laptop finance Bangladesh',
      'কিস্তিতে ল্যাপটপ মৌলভীবাজার',
      'ল্যাপটপ ইএমআই',
    ],
  });
}

export default async function LaptopEmiPage() {
  // Query active EMI plans from PostgreSQL via Prisma
  let emiPlans: any[] = [];
  try {
    emiPlans = await prisma.eMIPlan.findMany({
      where: { isActive: true },
      orderBy: { durationMonths: 'asc' },
    });
  } catch (err) {
    console.error('EMI plans query error:', err);
  }

  // Fallback defaults if table is empty
  if (emiPlans.length === 0) {
    emiPlans = [
      {
        id: 'emi-3m',
        name: '3 Months Quick Tech Plan',
        durationMonths: 3,
        minDownPaymentPercent: 30,
        interestRatePercent: 0,
        processingFee: 300,
        description: 'Short 3-month plan with 30% down payment and 0% interest.',
        eligibilityRules: 'Requires National ID & verified local guarantor.',
      },
      {
        id: 'emi-6m',
        name: '6 Months Popular Laptop Plan',
        durationMonths: 6,
        minDownPaymentPercent: 25,
        interestRatePercent: 0,
        processingFee: 500,
        description: 'Standard 6-month laptop financing with 0% interest.',
        eligibilityRules: 'Original NID copy, utility bill, and one verified guarantor.',
      },
      {
        id: 'emi-12m',
        name: '12 Months Enterprise / Student Plan',
        durationMonths: 12,
        minDownPaymentPercent: 20,
        interestRatePercent: 4,
        processingFee: 1000,
        description: 'Annual 12-month installment plan for students and professionals.',
        eligibilityRules: 'Strict background verification with two local guarantors.',
      },
    ];
  }

  const emiFaqs = [
    {
      question: 'Is a credit card required for laptop EMI at NEED ELECTRO?',
      answer: 'No credit card is mandatory! We offer in-house direct installment management through our ERP system with NID and local guarantor verification.',
    },
    {
      question: 'What documents are required to apply for laptop EMI in Moulvibazar?',
      answer: 'You will need: 1. Applicant NID photocopy and 2 passport-size photographs. 2. Current electricity or utility bill of residence. 3. Guarantor NID photocopy and contact number.',
    },
    {
      question: 'Can I pay my monthly installments through bKash or Nagad?',
      answer: 'Yes! Installments can be paid directly via bKash, Nagad, bank transfer, or at our Kusumbag showroom in Moulvibazar.',
    },
    {
      question: 'Does the laptop warranty stay valid during the EMI period?',
      answer: 'Yes! Your 7-day replacement warranty and 2-year service warranty are 100% active throughout the entire installment period.',
    },
  ];

  const faqSchema = buildFaqSchema(emiFaqs);
  const breadcrumbs = [{ name: 'Laptop EMI', path: '/laptop-emi' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <CreditCard size={14} />
            <span>In-House Laptop Installment Financing</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Laptop EMI in Moulvibazar — Buy Genuine Laptops with Easy Installments
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Own the laptop you need for work, university, or freelancing without financial strain. At {BUSINESS_INFO.name}, we provide transparent in-house installment plans (3 to 12 months) with minimal down payments and zero hidden charges.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="#calculator"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2"
            >
              <Calculator size={15} />
              <span>Calculate Monthly Payment ↓</span>
            </a>
            <Link
              href="/laptops"
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>Browse Available Laptops →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Active Plans from ERP */}
      <section className="py-14 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Available Installment Plans</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current live financing options managed directly through the NEED ELECTRO ERP system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {emiPlans.map(plan => (
            <div
              key={plan.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-cyan-400 dark:border-blue-500/30 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-fit mb-3">
                  {plan.durationMonths} Months Tenure
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{plan.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Min Down Payment:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{Number(plan.minDownPaymentPercent)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Interest Rate:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {Number(plan.interestRatePercent) === 0 ? '0% Interest' : `${Number(plan.interestRatePercent)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Processing Fee:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">৳{Number(plan.processingFee).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%2C%20I%20am%20interested%20in%20the%20${encodeURIComponent(plan.name)}%20for%20a%20laptop%20at%20NEED%20ELECTRO%20Moulvibazar.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-300 font-bold text-xs py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageCircle size={14} />
                  <span>Apply for this Plan</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section id="calculator" className="py-12 px-4 bg-white dark:bg-slate-950/80 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Interactive Laptop EMI Calculator</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estimate your initial down payment and monthly installment amount
            </p>
          </div>
          <EmiCalculatorWidget emiPlans={emiPlans} />
        </div>
      </section>

      {/* Eligibility & Documentation Checklist */}
      <section className="py-14 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Who is Eligible for Laptop EMI?</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We believe technology should be accessible to all honest and hard-working individuals in Moulvibazar. You are welcome to apply if you meet the following criteria:
            </p>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Bangladeshi Citizen:</strong> Must possess an authentic National ID (NID) card or Smart Card.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Local Residence:</strong> Resident of Moulvibazar Town, Sreemangal, Kulaura, Rajnagar, or Sylhet Division.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Students or Working Professionals:</strong> University students, freelancers, business owners, teachers, and private/gov employees.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>One Local Guarantor:</strong> A parent, sibling, teacher, or verified local resident to co-sign the agreement.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Required Documents</h2>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-300 shadow-xs">
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>Applicant Photocopy of National ID Card (NID) & 2 Passport Photos</span>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>Recent Utility Bill (Electricity/Gas/Water) of residence</span>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>Guarantor NID Photocopy & 1 Passport Photo</span>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>Student ID card or Salary Certificate / Trade License (if applicable)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12 px-4 bg-white dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Frequently Asked Questions about Laptop EMI</h2>
          <div className="space-y-4">
            {emiFaqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{faq.question}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
