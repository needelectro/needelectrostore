'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Clock, ShieldCheck, CreditCard,
  Laptop, Monitor, Camera, Zap, Cpu, Wifi, ExternalLink,
  ChevronRight, Heart, PackageSearch, MessageCircle, User
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';
import { useLanguage } from '@/src/services/languageContext';

export const CustomerFooter: React.FC = () => {
  const { t, isBangla } = useLanguage();

  return (
    <footer className="bg-[#F4F6F8] text-[#334155] border-t border-slate-200/90 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-12">
          {/* Col 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center p-1.5 shadow-sm shadow-blue-500/10">
                <img src="/logo-icon.png" alt="NEED ELECTRO" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-black text-[#002B5B] tracking-tight block">
                  {BUSINESS_INFO.name}
                </span>
                <span className="text-[11px] text-[#008CFF] font-semibold tracking-wide">
                  {isBangla ? '- বিশ্বস্ত ইলেকট্রিক্যাল ও প্রযুক্তি সমাধান -' : '- Trusted Electrical & Technological Solutions -'}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-md">
              {t(
                'footer.companyDesc',
                "Moulvibazar's trusted destination for genuine laptops (HP, Dell, Lenovo), custom desktop computers, CCTV surveillance packages, certified electrician services, and flexible laptop EMI installment plans."
              )}
            </p>

            <div className="space-y-2.5 text-xs text-[#334155] pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#008CFF] shrink-0 mt-0.5" />
                <span>
                  <strong>Showroom:</strong> {BUSINESS_INFO.address.streetAddress}, {BUSINESS_INFO.address.addressLocality}, {BUSINESS_INFO.address.addressRegion} - {BUSINESS_INFO.address.postalCode}, Bangladesh
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-[#008CFF] shrink-0" />
                <span>
                  <strong>Hotline:</strong>{' '}
                  <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="text-[#002B5B] hover:text-[#008CFF] font-bold">
                    {BUSINESS_INFO.phone}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle size={14} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>WhatsApp:</strong>{' '}
                  <a
                    href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline font-semibold"
                  >
                    Chat with Sales &amp; Support
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={14} className="text-[#008CFF] shrink-0" />
                <span>
                  <strong>Hours:</strong> Saturday – Thursday: 9:30 AM – 9:30 PM (Friday Closed)
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#002B5B] uppercase tracking-wider border-b border-slate-200 pb-2">
              Featured Categories
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/laptops" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>All Laptops Overview</span>
                </Link>
              </li>
              <li>
                <Link href="/laptops/hp" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>HP Laptops (EliteBook, ProBook)</span>
                </Link>
              </li>
              <li>
                <Link href="/laptops/dell" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>Dell Laptops (Latitude, Inspiron)</span>
                </Link>
              </li>
              <li>
                <Link href="/laptops/lenovo" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>Lenovo Laptops (ThinkPad)</span>
                </Link>
              </li>
              <li>
                <Link href="/computers" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>Desktop Computers &amp; PCs</span>
                </Link>
              </li>
              <li>
                <Link href="/cctv" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>CCTV Camera &amp; Security</span>
                </Link>
              </li>
              <li>
                <Link href="/electrical-products" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>Electrical Switchgear &amp; Breakers</span>
                </Link>
              </li>
              <li>
                <Link href="/networking" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>Wi-Fi Routers &amp; Networking</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#002B5B] uppercase tracking-wider border-b border-slate-200 pb-2">
              Customer Services
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/customer/dashboard" className="text-[#008CFF] font-bold hover:underline flex items-center gap-1.5">
                  <User size={13} className="text-[#008CFF]" />
                  <span>Customer Dashboard &amp; Orders</span>
                </Link>
              </li>
              <li>
                <Link href="/customer/login" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>Customer Sign In / Register</span>
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-[#008CFF] font-bold hover:underline flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-[#008CFF]" />
                  <span>💡 Guides &amp; Advice (Prices &amp; Specs)</span>
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-emerald-600 font-bold hover:underline flex items-center gap-1.5">
                  <PackageSearch size={13} className="text-emerald-600" />
                  <span>Track Your Order Online</span>
                </Link>
              </li>
              <li>
                <Link href="/laptop-emi" className="text-[#008CFF] font-bold hover:underline flex items-center gap-1.5">
                  <CreditCard size={13} className="text-[#008CFF]" />
                  <span>Laptop EMI (3 to 12 Months)</span>
                </Link>
              </li>
              <li>
                <Link href="/services/laptop-computer-repair" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>💻 Laptop &amp; PC Servicing Lab</span>
                </Link>
              </li>
              <li>
                <Link href="/services/electrician" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>⚡ Book Electrician (Moulvibazar)</span>
                </Link>
              </li>
              <li>
                <Link href="/services/cctv-installation" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>📹 CCTV Camera Installation</span>
                </Link>
              </li>
              <li>
                <Link href="/services/networking" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>🌐 Networking &amp; Wi-Fi Setup</span>
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>Shipping &amp; Delivery Terms</span>
                </Link>
              </li>
              <li>
                <Link href="/warranty-policy" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>Warranty &amp; Return Terms</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Regional Service Hubs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#002B5B] uppercase tracking-wider border-b border-slate-200 pb-2">
              Service Areas
            </h3>
            <p className="text-[11px] text-[#64748B] leading-normal">
              Direct showroom pickup, emergency technician dispatch, and express courier delivery across:
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/moulvibazar" className="hover:text-[#008CFF] font-semibold text-[#334155] flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#008CFF]" />
                  <span>Moulvibazar Town (Kusumbag)</span>
                </Link>
              </li>
              <li>
                <Link href="/sylhet" className="hover:text-[#008CFF] font-semibold text-[#334155] flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#008CFF]" />
                  <span>Sylhet Division Express Hub</span>
                </Link>
              </li>
              <li>
                <Link href="/sreemangal" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-400" />
                  <span>Sreemangal Upazila</span>
                </Link>
              </li>
              <li>
                <Link href="/kulaura" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-400" />
                  <span>Kulaura Upazila</span>
                </Link>
              </li>
              <li>
                <Link href="/rajnagar" className="hover:text-[#008CFF] text-[#475569] transition-colors flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-400" />
                  <span>Rajnagar Upazila</span>
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-[#64748B]">
                <span>Nationwide delivery via Steadfast &amp; Sundarban across all 64 districts in Bangladesh.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Trust Notice */}
        <div className="border-t border-slate-200/90 pt-6 pb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#475569]">
          <div>
            <span className="font-semibold text-[#002B5B] block mb-1">
              {isBangla
                ? 'মৌলভীবাজার ও সারা বাংলাদেশে বিশ্বস্ত প্রযুক্তি ও ইলেকট্রিক্যাল সমাধান'
                : 'Trusted Technology & Electrical Solutions in Moulvibazar and All Over Bangladesh'}
            </span>
            <span>
              {isBangla
                ? 'পেমেন্ট মেথডঃ ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, রকেট, ব্যাংক ট্রান্সফার, ভিসা/মাস্টারকার্ড এবং ইন-হাউস ল্যাপটপ ইএমআই।'
                : 'Payment Methods: Cash on Delivery, bKash, Nagad, Rocket, Bank Transfer, Visa / Mastercard, and In-House Laptop EMI.'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-[#334155]">
            <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[#002B5B] font-mono text-[11px] shadow-2xs">
              ৳ BDT Currency
            </span>
            <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[#002B5B] font-mono text-[11px] shadow-2xs">
              🔒 100% Genuine
            </span>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-slate-200 pt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-[#64748B]">
          <p>
            © {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved. Registered Business in Moulvibazar, Bangladesh.
          </p>
          <div className="flex items-center flex-wrap gap-3">
            <Link href="/about" className="hover:text-[#008CFF]">About Us</Link>
            <span>•</span>
            <Link href="/guides" className="text-[#008CFF] hover:underline font-semibold">Guides &amp; Advice</Link>
            <span>•</span>
            <Link href="/guides/faqs" className="hover:text-[#008CFF]">FAQs</Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-[#008CFF]">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms-conditions" className="hover:text-[#008CFF]">Terms &amp; Conditions</Link>
            <span>•</span>
            <Link href="/shipping-policy" className="hover:text-[#008CFF]">Shipping Policy</Link>
            <span>•</span>
            <Link href="/return-refund-policy" className="hover:text-[#008CFF]">Return &amp; Refund</Link>
            <span>•</span>
            <Link href="/warranty-policy" className="hover:text-[#008CFF]">Warranty Policy</Link>
            <span>•</span>
            <Link href="/track-order" className="hover:text-[#008CFF]">Track Order</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#008CFF]">Contact</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-[#008CFF]">Staff ERP Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
