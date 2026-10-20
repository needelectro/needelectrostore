import React from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Clock, ShieldCheck, CreditCard,
  Laptop, Monitor, Camera, Zap, Cpu, Wifi, ExternalLink,
  ChevronRight, Heart, PackageSearch, MessageCircle
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';

export const CustomerFooter: React.FC = () => {
  return (
    <footer className="bg-[#081621] text-slate-400 border-t border-slate-800/90 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-12">
          {/* Col 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0084d6] to-cyan-500 flex items-center justify-center p-1.5 shadow-md shadow-blue-500/20">
                <img src="/logo-icon.png" alt="NEED ELECTRO" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight block">
                  {BUSINESS_INFO.name}
                </span>
                <span className="text-[11px] text-[#0084d6] font-semibold tracking-wide">
                  - Trusted Electrical &amp; Technological Solutions -
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              Moulvibazar's trusted destination for genuine laptops (HP, Dell, Lenovo), custom desktop computers, CCTV surveillance packages, certified electrician services, and flexible laptop EMI installment plans.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#0084d6] shrink-0 mt-0.5" />
                <span>
                  <strong>Showroom:</strong> {BUSINESS_INFO.address.streetAddress}, {BUSINESS_INFO.address.addressLocality}, {BUSINESS_INFO.address.addressRegion} - {BUSINESS_INFO.address.postalCode}, Bangladesh
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-[#0084d6] shrink-0" />
                <span>
                  <strong>Hotline:</strong>{' '}
                  <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="text-white hover:text-[#0084d6] font-bold">
                    {BUSINESS_INFO.phone}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle size={14} className="text-emerald-400 shrink-0" />
                <span>
                  <strong>WhatsApp:</strong>{' '}
                  <a
                    href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Chat with Sales &amp; Support
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={14} className="text-[#0084d6] shrink-0" />
                <span>
                  <strong>Hours:</strong> Saturday – Thursday: 9:30 AM – 9:30 PM (Friday Closed)
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Featured Categories
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/laptops" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>All Laptops Overview</span>
                </Link>
              </li>
              <li>
                <Link href="/laptops/hp" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>HP Laptops (EliteBook, ProBook)</span>
                </Link>
              </li>
              <li>
                <Link href="/laptops/dell" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Dell Laptops (Latitude, Inspiron)</span>
                </Link>
              </li>
              <li>
                <Link href="/laptops/lenovo" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Lenovo Laptops (ThinkPad)</span>
                </Link>
              </li>
              <li>
                <Link href="/computers" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Desktop Computers &amp; PCs</span>
                </Link>
              </li>
              <li>
                <Link href="/cctv" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>CCTV Camera &amp; Security</span>
                </Link>
              </li>
              <li>
                <Link href="/electrical-products" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Electrical Switchgear &amp; Breakers</span>
                </Link>
              </li>
              <li>
                <Link href="/networking" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Wi-Fi Routers &amp; Networking</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Customer Services
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track-order" className="text-emerald-400 font-bold hover:underline flex items-center gap-1.5">
                  <PackageSearch size={13} className="text-emerald-400" />
                  <span>Track Your Order Online</span>
                </Link>
              </li>
              <li>
                <Link href="/laptop-emi" className="text-[#0084d6] font-bold hover:underline flex items-center gap-1.5">
                  <CreditCard size={13} className="text-[#0084d6]" />
                  <span>Laptop EMI (3 to 12 Months)</span>
                </Link>
              </li>
              <li>
                <Link href="/services/laptop-computer-repair" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>💻 Laptop &amp; PC Servicing Lab</span>
                </Link>
              </li>
              <li>
                <Link href="/services/electrician" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>⚡ Book Electrician (Moulvibazar)</span>
                </Link>
              </li>
              <li>
                <Link href="/services/cctv-installation" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>📹 CCTV Camera Installation</span>
                </Link>
              </li>
              <li>
                <Link href="/services/networking" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>🌐 Networking &amp; Wi-Fi Setup</span>
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Shipping &amp; Delivery Terms</span>
                </Link>
              </li>
              <li>
                <Link href="/warranty-policy" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Warranty &amp; Return Terms</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Regional Service Hubs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Service Areas
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Direct showroom pickup, emergency technician dispatch, and express courier delivery across:
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/moulvibazar" className="hover:text-[#0084d6] font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#0084d6]" />
                  <span>Moulvibazar Town (Kusumbag)</span>
                </Link>
              </li>
              <li>
                <Link href="/sylhet" className="hover:text-[#0084d6] font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#0084d6]" />
                  <span>Sylhet Division Express Hub</span>
                </Link>
              </li>
              <li>
                <Link href="/sreemangal" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-500" />
                  <span>Sreemangal Upazila</span>
                </Link>
              </li>
              <li>
                <Link href="/kulaura" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-500" />
                  <span>Kulaura Upazila</span>
                </Link>
              </li>
              <li>
                <Link href="/rajnagar" className="hover:text-[#0084d6] transition-colors flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-500" />
                  <span>Rajnagar Upazila</span>
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-400">
                <span>Nationwide delivery via Steadfast &amp; Sundarban across all 64 districts in Bangladesh.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Bangla Notice */}
        <div className="border-t border-slate-800/80 pt-6 pb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-200 block mb-1">
              মৌলভীবাজার ও সারা বাংলাদেশে বিশ্বস্ত প্রযুক্তি ও ইলেকট্রিক্যাল সমাধান
            </span>
            <span>
              Payment Methods: Cash on Delivery, bKash, Nagad, Rocket, Bank Transfer, Visa / Mastercard, and In-House Laptop EMI.
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400">
            <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono text-[11px]">
              ৳ BDT Currency
            </span>
            <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono text-[11px]">
              🔒 100% Genuine
            </span>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-slate-800/90 pt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved. Registered Business in Moulvibazar, Bangladesh.
          </p>
          <div className="flex items-center flex-wrap gap-3">
            <Link href="/about" className="hover:text-slate-300">About Us</Link>
            <span>•</span>
            <Link href="/shipping-policy" className="hover:text-slate-300">Shipping Policy</Link>
            <span>•</span>
            <Link href="/return-refund-policy" className="hover:text-slate-300">Return &amp; Refund</Link>
            <span>•</span>
            <Link href="/warranty-policy" className="hover:text-slate-300">Warranty Policy</Link>
            <span>•</span>
            <Link href="/track-order" className="hover:text-slate-300">Track Order</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-300">Contact</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-slate-300">Staff ERP Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
