import React from 'react';
import { Layers } from 'lucide-react';
import { ComparisonTable } from '@/lib/guidesData';

interface ComparisonTableProps {
  table: ComparisonTable;
  title?: string;
}

export const ComparisonTableComponent: React.FC<ComparisonTableProps> = ({
  table,
  title = 'Side-by-Side Technical Comparison',
}) => {
  if (!table || !table.columns || table.columns.length === 0) return null;

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1320] shadow-sm">
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers size={18} className="text-indigo-500" />
          <span>{title}</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          {table.rows.length} Features Evaluated
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 text-xs font-bold">
              {table.columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 ${
                    idx === 0
                      ? 'w-1/3 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-[11px]'
                      : idx === 1
                      ? 'text-[#008CFF] dark:text-cyan-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {table.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors"
              >
                <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-900/20 whitespace-nowrap">
                  {row.feature}
                </td>
                {row.values.map((val, vIdx) => (
                  <td key={vIdx} className="py-3 px-4 min-w-[200px] leading-relaxed">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
