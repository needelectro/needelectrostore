'use client';

import React, { useState } from 'react';
import { Calculator, ArrowRight, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';

interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  minDownPaymentPercent: number | string;
  interestRatePercent: number | string;
  processingFee: number | string;
}

interface EmiCalculatorProps {
  emiPlans: Plan[];
}

export const EmiCalculatorWidget: React.FC<EmiCalculatorProps> = ({ emiPlans }) => {
  const [laptopPrice, setLaptopPrice] = useState<number>(35000);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(emiPlans[0]?.id || 'emi-6m');

  const selectedPlan = emiPlans.find(p => p.id === selectedPlanId) || emiPlans[0] || {
    durationMonths: 6,
    minDownPaymentPercent: 25,
    interestRatePercent: 0,
    processingFee: 500,
  };

  const downPaymentPercent = Number(selectedPlan.minDownPaymentPercent) || 25;
  const downPaymentAmount = Math.round((laptopPrice * downPaymentPercent) / 100);
  const remainingPrincipal = laptopPrice - downPaymentAmount;
  const interestRate = Number(selectedPlan.interestRatePercent) || 0;
  const totalInterest = Math.round((remainingPrincipal * interestRate) / 100);
  const totalPayable = remainingPrincipal + totalInterest;
  const monthlyInstallment = Math.round(totalPayable / (selectedPlan.durationMonths || 6));
  const processingFee = Number(selectedPlan.processingFee) || 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Inputs */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-slate-300">Laptop Total Price:</span>
              <span className="text-blue-600 dark:text-cyan-400 font-mono text-sm font-bold">৳{laptopPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={20000}
              max={120000}
              step={1000}
              value={laptopPrice}
              onChange={e => setLaptopPrice(Number(e.target.value))}
              className="w-full accent-blue-600 dark:accent-cyan-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
              <span>৳20,000</span>
              <span>৳60,000</span>
              <span>৳120,000</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-2">
              Select Installment Duration:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {emiPlans.map(plan => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    selectedPlanId === plan.id
                      ? 'bg-blue-600 text-white border-blue-600 dark:border-cyan-400 shadow-md shadow-blue-500/30'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span>{plan.durationMonths} Months</span>
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                    {Number(plan.interestRatePercent) === 0 ? '0% Int.' : `${plan.interestRatePercent}% Int.`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Calculated Summary */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block border-b border-slate-200 dark:border-slate-800 pb-2">
              Estimated Payment Breakdown
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Initial Down Payment ({downPaymentPercent}%):</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold font-mono">৳{downPaymentAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Financed Principal:</span>
              <span className="text-slate-900 dark:text-slate-100 font-mono">৳{remainingPrincipal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Total Interest ({interestRate}%):</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">৳{totalInterest.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Processing Fee:</span>
              <span className="text-slate-900 dark:text-slate-100 font-mono">৳{processingFee.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Monthly Installment</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">for {selectedPlan.durationMonths} months</span>
              </div>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400 font-mono">
                ৳{monthlyInstallment.toLocaleString()}
              </span>
            </div>
          </div>

          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%2C%20I%20used%20your%20EMI%20calculator%20for%20a%20laptop%20priced%20at%20৳${laptopPrice.toLocaleString()}%20with%20the%20${selectedPlan.durationMonths}-month%20plan%20(approx%20৳${monthlyInstallment.toLocaleString()}/month).%20I%20would%20like%20to%20apply.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <MessageCircle size={14} />
            <span>Apply for this EMI on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
