'use client';

import React, { useState } from 'react';
import {
  FileText, Copy, Check, ShieldCheck, Sparkles,
  ChevronRight, Laptop, CheckCircle2
} from 'lucide-react';

interface ProductSpecificationsViewProps {
  description?: string | null;
  specs?: any;
  warrantyPeriodMonths?: number;
  productName: string;
  sku: string;
}

interface ParsedLine {
  type: 'heading' | 'kv' | 'bullet' | 'bullet-kv' | 'paragraph' | 'empty';
  key?: string;
  value?: string;
  text?: string;
}

// Parses raw pasted text into structured elements while retaining 100% fidelity
function parseSpecsText(rawText: string): ParsedLine[] {
  if (!rawText) return [];
  const lines = rawText.split(/\r?\n/);
  const result: ParsedLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      result.push({ type: 'empty' });
      continue;
    }

    // Markdown heading format: ### Heading or ## Heading
    if (/^#{1,4}\s+/.test(trimmed)) {
      result.push({
        type: 'heading',
        text: trimmed.replace(/^#{1,4}\s+/, '').trim(),
      });
      continue;
    }

    // Bullet points: starts with -, *, •, or numbered (1., 2.)
    if (/^([-*•]|\d+\.)\s+/.test(trimmed)) {
      const content = trimmed.replace(/^([-*•]|\d+\.)\s+/, '').trim();
      const colonIdx = content.indexOf(':');
      // If bullet item contains key: value
      if (colonIdx > 0 && colonIdx < 35 && colonIdx < content.length - 1) {
        result.push({
          type: 'bullet-kv',
          key: content.substring(0, colonIdx).trim(),
          value: content.substring(colonIdx + 1).trim(),
        });
      } else {
        result.push({
          type: 'bullet',
          text: content,
        });
      }
      continue;
    }

    // Header candidate: ends with a colon and is short (e.g. "Key Specifications:", "Features:")
    if (trimmed.endsWith(':') && trimmed.length < 50) {
      result.push({
        type: 'heading',
        text: trimmed.replace(/:$/, '').trim(),
      });
      continue;
    }

    // Key-value pair candidate: "Processor: Intel Core i7 12th Gen"
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0 && colonIdx < 35 && colonIdx < trimmed.length - 1) {
      const keyCandidate = trimmed.substring(0, colonIdx).trim();
      // Ensure the key looks like a label rather than a sentence
      if (!/[.!?]/.test(keyCandidate) && keyCandidate.split(/\s+/).length <= 5) {
        result.push({
          type: 'kv',
          key: keyCandidate,
          value: trimmed.substring(colonIdx + 1).trim(),
        });
        continue;
      }
    }

    // Default to regular text paragraph
    result.push({
      type: 'paragraph',
      text: trimmed,
    });
  }

  return result;
}

export const ProductSpecificationsView: React.FC<ProductSpecificationsViewProps> = ({
  description,
  specs,
  warrantyPeriodMonths,
  productName,
  sku,
}) => {
  const [copied, setCopied] = useState(false);

  const cleanDescription = (description || '').trim();
  const hasLegacySpecs = specs && typeof specs === 'object' && Object.keys(specs).length > 0;

  // Do not render if there are no specifications or description
  if (!cleanDescription && !hasLegacySpecs) {
    return null;
  }

  const parsedLines = cleanDescription ? parseSpecsText(cleanDescription) : [];

  const handleCopy = () => {
    let copyText = cleanDescription;
    if (!copyText && hasLegacySpecs) {
      copyText = Object.entries(specs)
        .filter(([_, v]) => v && typeof v !== 'object')
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
    }

    if (copyText) {
      navigator.clipboard.writeText(copyText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <section id="specifications" className="mt-12 sm:mt-16 scroll-mt-24 space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#008CFF]">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] tracking-tight">
              Full Specifications &amp; Description
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Verified technical hardware details and official product overview for {productName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs hover:border-slate-300'
            }`}
            title="Copy complete specifications text"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600 stroke-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-[#008CFF]" />
                <span>Copy Specifications</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Specifications Content Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {cleanDescription ? (
          <div className="p-5 sm:p-7 md:p-8 space-y-4">
            <div className="space-y-2.5 leading-relaxed text-sm text-[#002B5B]">
              {parsedLines.map((line, idx) => {
                if (line.type === 'empty') {
                  return <div key={idx} className="h-2" />;
                }

                if (line.type === 'heading') {
                  return (
                    <div key={idx} className="pt-3 pb-1">
                      <h3 className="text-sm sm:text-base font-bold text-[#002B5B] flex items-center gap-2 border-b border-slate-100 pb-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#008CFF]" />
                        <span>{line.text}</span>
                      </h3>
                    </div>
                  );
                }

                if (line.type === 'kv') {
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2 px-3 sm:px-4 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
                    >
                      <span className="sm:col-span-4 lg:col-span-3 text-xs sm:text-sm font-bold text-slate-600">
                        {line.key}
                      </span>
                      <span className="sm:col-span-8 lg:col-span-9 text-xs sm:text-sm font-semibold text-[#002B5B] break-words">
                        {line.value}
                      </span>
                    </div>
                  );
                }

                if (line.type === 'bullet-kv') {
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-1.5 px-3 sm:px-4 rounded-xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="sm:col-span-4 lg:col-span-3 flex items-start gap-2">
                        <span className="text-[#008CFF] font-black text-sm leading-tight">•</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-600">{line.key}</span>
                      </div>
                      <span className="sm:col-span-8 lg:col-span-9 text-xs sm:text-sm font-semibold text-[#002B5B] pl-4 sm:pl-0 break-words">
                        {line.value}
                      </span>
                    </div>
                  );
                }

                if (line.type === 'bullet') {
                  return (
                    <div key={idx} className="flex items-start gap-2.5 py-1 px-3 sm:px-4 text-xs sm:text-sm text-slate-700">
                      <span className="text-[#008CFF] font-black text-base leading-tight shrink-0">•</span>
                      <span className="break-words leading-relaxed font-medium">{line.text}</span>
                    </div>
                  );
                }

                // Default regular paragraph
                return (
                  <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal py-0.5">
                    {line.text}
                  </p>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Legacy Structured Specs Table (if specs object exists and has attributes) */}
        {hasLegacySpecs && (
          <div className={`${cleanDescription ? 'border-t border-slate-200/90' : ''}`}>
            {cleanDescription && (
              <div className="px-5 sm:px-8 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Additional Hardware Attributes
                </span>
                <span className="text-[11px] font-mono text-slate-400">SKU: {sku}</span>
              </div>
            )}
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-100">
                {Object.entries(specs).map(([key, value]) => {
                  if (!value || typeof value === 'object') return null;
                  const readableKey = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());
                  return (
                    <tr key={key} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 sm:px-8 font-semibold text-slate-500 w-1/3 bg-slate-50/60">
                        {readableKey}
                      </td>
                      <td className="py-3 px-5 sm:px-8 text-[#002B5B] font-semibold break-words">
                        {String(value)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Showroom Warranty & Authenticity Assurance Footer */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/60 to-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0 stroke-[2.2]" />
            <span>
              {warrantyPeriodMonths
                ? `${warrantyPeriodMonths} Months Official Showroom Warranty with Inspection Support`
                : 'Official Showroom Warranty with 7-Day Replacement Guarantee'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#008CFF] font-bold">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>100% Genuine Hardware &amp; Original Packaging</span>
          </div>
        </div>
      </div>
    </section>
  );
};
