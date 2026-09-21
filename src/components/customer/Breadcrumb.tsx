import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { buildBreadcrumbSchema } from '@/lib/seoConfig';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const allItems: BreadcrumbItem[] = [{ name: 'Home', path: '/' }, ...items];
  const schema = buildBreadcrumbSchema(allItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="py-3 px-4 max-w-7xl mx-auto w-full">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          {allItems.map((item, idx) => {
            const isLast = idx === allItems.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight size={13} className="text-slate-600 shrink-0" />}
                {isLast ? (
                  <span className="text-cyan-400 font-medium truncate max-w-xs md:max-w-md" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className="hover:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    {idx === 0 && <Home size={12} className="text-slate-500" />}
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};
