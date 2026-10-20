import React from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, HelpCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { PriceTableItem } from '@/lib/guidesData';

interface PriceTableProps {
  items: PriceTableItem[];
  title?: string;
  subtitle?: string;
}

export const PriceTableComponent: React.FC<PriceTableProps> = ({
  items,
  title = 'Verified Product Pricing & Market Estimates',
  subtitle = 'Prices verified against NEED ELECTRO actual inventory records and prevailing Bangladesh IT market benchmarks.',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1320] shadow-sm">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-slate-50 to-transparent dark:from-blue-950/20 dark:via-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#008CFF]" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={11} /> Verified Selling Price
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              <AlertCircle size={11} /> Indicative Market
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4">Product / Model</th>
              <th className="py-3.5 px-4">Hardware Specifications</th>
              <th className="py-3.5 px-4 text-right">Selling / Market Price</th>
              <th className="py-3.5 px-4 text-center">Price Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {items.map((row, idx) => {
              const isVerified = row.status === 'VERIFIED';
              const isIndicative = row.status === 'INDICATIVE';

              return (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {row.item}
                    {row.lastChecked && (
                      <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                        Checked: {row.lastChecked}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 min-w-[220px]">
                    {row.spec}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {row.verifiedPrice ? (
                      <span className="font-mono text-sm font-black text-[#008CFF] block">
                        {row.verifiedPrice}
                      </span>
                    ) : (
                      <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                        {row.indicativePrice}
                      </span>
                    )}
                    {row.verifiedPrice && row.indicativePrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        Market: {row.indicativePrice}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={11} /> Verified In-Stock
                      </span>
                    ) : isIndicative ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <AlertCircle size={11} /> Market Range
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <HelpCircle size={11} /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {row.productSku ? (
                      <Link
                        href={`/product/${row.productSku.toLowerCase()}`}
                        className="inline-flex items-center gap-1 bg-[#008CFF] hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                      >
                        <span>View</span>
                        <ExternalLink size={11} />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Market Ref</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>* Verified prices apply to physical stock at NEED ELECTRO Kusumbag, Moulvibazar.</span>
        <span>Nationwide courier delivery with open-box verification across Bangladesh.</span>
      </div>
    </div>
  );
};
