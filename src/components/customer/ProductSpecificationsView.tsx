import React from 'react';
import { FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { sanitizeHtml } from '@/src/lib/sanitizeHtml';

interface ProductSpecificationsViewProps {
  description?: string | null;
  specs?: any;
  warrantyPeriodMonths?: number;
  productName: string;
  sku: string;
}

// Inline formatting helper for bold markdown (**text** or __text__)
function renderFormattedInlineText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return parts.map((part, i) => {
    if (
      (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'))
    ) {
      return (
        <strong key={i} className="font-bold text-[#002B5B]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// Block element types for structured plain-text/markdown rendering
type Block =
  | { type: 'heading'; text: string; level: number }
  | { type: 'kv-group'; items: Array<{ key: string; value: string }> }
  | { type: 'bullet-list'; items: Array<{ key?: string; value?: string; text: string }> }
  | { type: 'numbered-list'; items: Array<{ number: string; text: string }> }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'paragraph'; text: string }
  | { type: 'divider' }
  | { type: 'spacer' };

function parseDescriptionIntoBlocks(rawText: string): Block[] {
  if (!rawText) return [];
  const lines = rawText.split(/\r?\n/);
  const blocks: Block[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Empty lines -> spacer
    if (!trimmed) {
      blocks.push({ type: 'spacer' });
      i++;
      continue;
    }

    // 2. Horizontal divider (---, ***, ___ )
    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push({ type: 'divider' });
      i++;
      continue;
    }

    // 3. Markdown tables (starts and ends with |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith('|') &&
        lines[i].trim().endsWith('|')
      ) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (line: string) =>
          line
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());

        const headers = parseRow(tableLines[0]);
        // Filter out delimiter row like |---|---|
        const dataRows = tableLines
          .slice(1)
          .filter((line) => !/^[|\s-:]+$/.test(line))
          .map(parseRow);

        blocks.push({
          type: 'table',
          headers,
          rows: dataRows,
        });
        continue;
      }
    }

    // 4. Markdown Headings (# Heading, ## Heading, ### Heading, #### Heading)
    const mdHeadingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (mdHeadingMatch) {
      blocks.push({
        type: 'heading',
        level: mdHeadingMatch[1].length,
        text: mdHeadingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // 5. Short category header candidate (ends with colon, e.g. "Processor & Memory:", "Technical Specifications:")
    if (
      trimmed.endsWith(':') &&
      trimmed.length < 50 &&
      !trimmed.includes('\t') &&
      trimmed.split(/\s+/).length <= 6
    ) {
      blocks.push({
        type: 'heading',
        level: 3,
        text: trimmed.replace(/:$/, '').trim(),
      });
      i++;
      continue;
    }

    // 6. Numbered Lists (1. Item, 2. Item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      const items: Array<{ number: string; text: string }> = [];
      while (i < lines.length) {
        const curTrim = lines[i].trim();
        const curMatch = curTrim.match(/^(\d+)\.\s+(.+)$/);
        if (!curMatch) break;
        items.push({ number: curMatch[1], text: curMatch[2] });
        i++;
      }
      blocks.push({ type: 'numbered-list', items });
      continue;
    }

    // 7. Bullet Lists (starts with -, *, •, +)
    if (/^([-*•+]|\u2022)\s+/.test(trimmed)) {
      const items: Array<{ key?: string; value?: string; text: string }> = [];
      while (i < lines.length) {
        const curTrim = lines[i].trim();
        const curMatch = curTrim.match(/^([-*•+]|\u2022)\s+(.+)$/);
        if (!curMatch) break;

        const content = curMatch[2].trim();
        const colonIdx = content.indexOf(':');
        if (colonIdx > 0 && colonIdx < 35 && colonIdx < content.length - 1) {
          items.push({
            key: content.substring(0, colonIdx).trim(),
            value: content.substring(colonIdx + 1).trim(),
            text: content,
          });
        } else {
          items.push({ text: content });
        }
        i++;
      }
      blocks.push({ type: 'bullet-list', items });
      continue;
    }

    // 8. Key-Value Specifications block (e.g. "Processor: Intel i7", "RAM: 16GB")
    const colonIdx = trimmed.indexOf(':');
    const isKvCandidate =
      colonIdx > 0 &&
      colonIdx < 45 &&
      colonIdx < trimmed.length - 1 &&
      !trimmed.substring(0, colonIdx).includes('.') &&
      trimmed.substring(0, colonIdx).split(/\s+/).length <= 6;

    if (isKvCandidate) {
      const items: Array<{ key: string; value: string }> = [];
      while (i < lines.length) {
        const curTrim = lines[i].trim();
        if (!curTrim) break;
        const curColon = curTrim.indexOf(':');
        const valid =
          curColon > 0 &&
          curColon < 45 &&
          curColon < curTrim.length - 1 &&
          !curTrim.substring(0, curColon).includes('.') &&
          curTrim.substring(0, curColon).split(/\s+/).length <= 6;

        if (!valid) break;

        items.push({
          key: curTrim.substring(0, curColon).trim(),
          value: curTrim.substring(curColon + 1).trim(),
        });
        i++;
      }

      if (items.length > 0) {
        blocks.push({ type: 'kv-group', items });
        continue;
      }
    }

    // 9. Regular narrative text paragraph
    blocks.push({
      type: 'paragraph',
      text: trimmed,
    });
    i++;
  }

  return blocks;
}

export const ProductSpecificationsView: React.FC<ProductSpecificationsViewProps> = ({
  description,
  specs,
  warrantyPeriodMonths,
  productName,
  sku,
}) => {
  const cleanDescription = (description || '').trim();
  const hasLegacySpecs =
    specs && typeof specs === 'object' && Object.keys(specs).length > 0;

  // Do not render if there are neither specifications nor description
  if (!cleanDescription && !hasLegacySpecs) {
    return null;
  }

  const isHtml = /<[a-z][\s\S]*>/i.test(cleanDescription);
  const sanitizedHtmlContent = isHtml ? sanitizeHtml(cleanDescription) : '';
  const parsedBlocks = !isHtml && cleanDescription ? parseDescriptionIntoBlocks(cleanDescription) : [];

  return (
    <section
      id="specifications"
      aria-label="Full Specifications and Description"
      className="mt-12 sm:mt-16 scroll-mt-24 space-y-4 select-text"
    >
      {/* Section Header (Clean, professional, without copy button) */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#008CFF] shrink-0 shadow-2xs">
          <FileText size={18} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] tracking-tight">
            Full Specifications &amp; Description
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Verified technical hardware details and complete product overview for {productName}
          </p>
        </div>
      </div>

      {/* Main Specifications Content Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs select-text">
        {cleanDescription ? (
          <div className="p-5 sm:p-7 md:p-8 space-y-3">
            {isHtml ? (
              /* Sanitized Rich Text HTML Renderer */
              <div
                className="prose prose-sm max-w-none text-[#002B5B] leading-relaxed [&_h1]:text-lg [&_h1]:font-black [&_h1]:text-[#002B5B] [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[#002B5B] [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[#002B5B] [&_table]:w-full [&_table]:border-collapse [&_th]:bg-slate-50 [&_th]:text-slate-700 [&_th]:font-bold [&_th]:p-3 [&_th]:border [&_th]:border-slate-200 [&_td]:p-3 [&_td]:border [&_td]:border-slate-200 [&_td]:text-[#002B5B] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-[#002B5B] [&_strong]:font-bold select-text"
                dangerouslySetInnerHTML={{ __html: sanitizedHtmlContent }}
              />
            ) : (
              /* High-Fidelity Markdown & Structured Plain-Text Renderer */
              <div className="space-y-3 leading-relaxed text-sm text-[#002B5B] select-text">
                {parsedBlocks.map((block, idx) => {
                  if (block.type === 'spacer') {
                    return <div key={idx} className="h-2" />;
                  }

                  if (block.type === 'divider') {
                    return <hr key={idx} className="my-3 border-slate-200" />;
                  }

                  if (block.type === 'heading') {
                    return (
                      <div key={idx} className="pt-3 pb-1">
                        <h3 className="text-sm sm:text-base font-bold text-[#002B5B] flex items-center gap-2 border-b border-slate-100 pb-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#008CFF] shrink-0" />
                          <span>{block.text}</span>
                        </h3>
                      </div>
                    );
                  }

                  if (block.type === 'table') {
                    return (
                      <div
                        key={idx}
                        className="overflow-x-auto my-3 rounded-xl border border-slate-200 shadow-2xs"
                      >
                        <table className="w-full text-xs sm:text-sm text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                            <tr>
                              {block.headers.map((h, hi) => (
                                <th key={hi} className="py-2.5 px-4 font-bold">
                                  {renderFormattedInlineText(h)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {block.rows.map((row, ri) => (
                              <tr key={ri} className="hover:bg-slate-50/70 transition-colors">
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className={`py-2.5 px-4 ${
                                      ci === 0
                                        ? 'font-bold text-slate-700 bg-slate-50/40 w-1/3 sm:w-1/4'
                                        : 'font-semibold text-[#002B5B]'
                                    }`}
                                  >
                                    {renderFormattedInlineText(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  if (block.type === 'kv-group') {
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200/90 overflow-hidden my-3 shadow-2xs"
                      >
                        <table className="w-full text-xs sm:text-sm text-left">
                          <tbody className="divide-y divide-slate-100">
                            {block.items.map((item, itemIdx) => (
                              <tr
                                key={itemIdx}
                                className={itemIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}
                              >
                                <td className="py-2.5 px-4 sm:px-6 font-bold text-slate-600 w-1/3 sm:w-1/4 bg-slate-50/70 border-r border-slate-100">
                                  {item.key}
                                </td>
                                <td className="py-2.5 px-4 sm:px-6 font-semibold text-[#002B5B] break-words">
                                  {renderFormattedInlineText(item.value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  if (block.type === 'bullet-list') {
                    return (
                      <ul key={idx} className="space-y-1.5 my-2 pl-1">
                        {block.items.map((b, bIdx) => (
                          <li
                            key={bIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700"
                          >
                            <span className="text-[#008CFF] font-black text-sm shrink-0 leading-tight mt-0.5">
                              •
                            </span>
                            <span className="leading-relaxed font-medium break-words text-[#002B5B]">
                              {b.key && (
                                <strong className="font-bold text-slate-700 mr-1.5">
                                  {b.key}:
                                </strong>
                              )}
                              {renderFormattedInlineText(b.value || b.text)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  if (block.type === 'numbered-list') {
                    return (
                      <ol key={idx} className="space-y-1.5 my-2 pl-1">
                        {block.items.map((n, nIdx) => (
                          <li
                            key={nIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700"
                          >
                            <span className="text-[11px] font-bold font-mono text-[#008CFF] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                              {n.number}
                            </span>
                            <span className="leading-relaxed font-medium break-words text-[#002B5B]">
                              {renderFormattedInlineText(n.text)}
                            </span>
                          </li>
                        ))}
                      </ol>
                    );
                  }

                  // Default narrative paragraph
                  return (
                    <p
                      key={idx}
                      className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal py-0.5 break-words"
                    >
                      {renderFormattedInlineText(block.text)}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {/* Graceful Fallback for Older Products with only legacy specs JSON */}
        {!cleanDescription && hasLegacySpecs && (
          <div className="p-5 sm:p-7 md:p-8 space-y-4">
            <div className="rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
              <table className="w-full text-xs sm:text-sm text-left">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(specs).map(([key, value], idx) => {
                    if (!value || typeof value === 'object') return null;
                    const readableKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <tr
                        key={key}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}
                      >
                        <td className="py-3 px-5 sm:px-8 font-bold text-slate-600 w-1/3 sm:w-1/4 bg-slate-50/70 border-r border-slate-100">
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
          </div>
        )}

        {/* Showroom Warranty & Authenticity Assurance Footer */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/60 to-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs select-text">
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

export default ProductSpecificationsView;
