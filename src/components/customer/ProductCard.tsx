import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MessageCircle, ArrowRight, Laptop, Cpu, CheckCircle } from 'lucide-react';
import { BUSINESS_INFO, slugify } from '@/lib/seoConfig';

export interface ProductCardData {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  retailPrice: number;
  emiPrice?: number;
  currentStock: number;
  warrantyPeriodMonths?: number;
  specs?: any;
}

interface ProductCardProps {
  product: ProductCardData;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const slug = `${slugify(product.name)}-${product.sku.toLowerCase()}`;
  const isLaptop = product.category.toLowerCase().includes('laptop') || product.name.toLowerCase().includes('laptop');
  const fallbackImage = isLaptop ? '/logo-dark-transparent.png' : '/logo-icon.png';
  const imgUrl = product.imageUrl || fallbackImage;
  const isAvailable = product.currentStock > 0;
  
  // Calculate approximate 6-month EMI starting payment
  const emiMonthly = product.retailPrice > 0 ? Math.round((product.retailPrice * 0.75) / 6) : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition-all duration-200 flex flex-col group">
      {/* Product Image */}
      <Link href={`/product/${slug}`} className="relative block bg-slate-950/70 p-6 aspect-[4/3] overflow-hidden">
        <img
          src={imgUrl}
          alt={`${product.name} available at ${BUSINESS_INFO.name} Moulvibazar`}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-slate-900/90 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide">
            {product.brand}
          </span>
          {isLaptop && emiMonthly && (
            <span className="bg-blue-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold">
              EMI from ৳{emiMonthly.toLocaleString()}/mo
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isAvailable ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
          }`}>
            {isAvailable ? 'In Stock' : 'Pre-Order'}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1">
            <span>SKU: {product.sku}</span>
            <span>{product.category}</span>
          </div>

          <Link href={`/product/${slug}`}>
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Quick Specs preview if laptop */}
          {product.specs && typeof product.specs === 'object' && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
              {product.specs.processor && (
                <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                  {product.specs.processor}
                </span>
              )}
              {product.specs.ram && (
                <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                  {product.specs.ram}
                </span>
              )}
              {product.specs.storage && (
                <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                  {product.specs.storage}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Price</span>
            <span className="text-lg font-extrabold text-cyan-400">
              ৳{product.retailPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20am%20interested%20in%20buying%20${encodeURIComponent(product.name)}%20(SKU:%20${product.sku}).%20Is%20it%20available%20at%20Moulvibazar%20showroom%3F`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Inquire about ${product.name} on WhatsApp`}
              className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 transition-colors"
            >
              <MessageCircle size={15} />
            </a>
            <Link
              href={`/product/${slug}`}
              className="p-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-500/30 transition-colors"
              aria-label={`View details of ${product.name}`}
            >
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
