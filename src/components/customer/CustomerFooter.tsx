import React from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Clock, ShieldCheck, CreditCard,
  Laptop, Monitor, Camera, Zap, Cpu, Wifi, ExternalLink,
  ChevronRight, Heart
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';

export const CustomerFooter: React.FC = () => {
  return (
    <footer className="bg-[#050811] text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1: Brand & NAP */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center p-1 shadow-lg shadow-blue-500/20">
                <img src="/logo-icon.png" alt="NEED ELECTRO" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight block">
                  {BUSINESS_INFO.name}
                </span>
                <span className="text-xs text-cyan-400 font-medium">
                  {BUSINESS_INFO.tagline}
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Moulvibazar's trusted technology and electrical solutions center. Offering genuine laptops (HP, Dell, Lenovo), custom desktop PCs, CCTV surveillance systems, electrical wiring supplies, certified electrician service, and convenient laptop EMI installment facilities.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Showroom:</strong> {BUSINESS_INFO.address.streetAddress}, {BUSINESS_INFO.address.addressLocality}, {BUSINESS_INFO.address.addressRegion} - {BUSINESS_INFO.address.postalCode}, Bangladesh
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-cyan-400 shrink-0" />
                <span>
                  <strong>Phone / WhatsApp:</strong>{' '}
                  <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="text-white hover:text-cyan-400 font-semibold">
                    {BUSINESS_INFO.phone}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-cyan-400 shrink-0" />
                <span>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${BUSINESS_INFO.email}`} className="text-slate-300 hover:text-cyan-400">
                    {BUSINESS_INFO.email}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={15} className="text-cyan-400 shrink-0" />
                <span>
                  <strong>Hours:</strong> Saturday – Thursday: 9:30 AM – 9:30 PM (Friday Closed)
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Products & Brands */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Products & Brands
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/laptops" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>All Laptops Overview</span>
                </Link>
              </li>
              <li>
                <Link href="/laptops/hp" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>HP Laptops (EliteBook & ProBook)</span>
                </Link>
              </li>
              <li>
                <Link href="/laptops/dell" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Dell Laptops (Latitude & Inspiron)</span>
                </Link>
              </li>
              <li>
                <Link href="/laptops/lenovo" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Lenovo Laptops (ThinkPad)</span>
                </Link>
              </li>
              <li>
                <Link href="/computers" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Desktop Computers & PCs</span>
                </Link>
              </li>
              <li>
                <Link href="/cctv" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>CCTV Cameras & Security</span>
                </Link>
              </li>
              <li>
                <Link href="/electrical-products" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Electrical Supplies & Breakers</span>
                </Link>
              </li>
              <li>
                <Link href="/computer-accessories" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Computer Accessories & SSD</span>
                </Link>
              </li>
              <li>
                <Link href="/networking" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Wi-Fi Routers & Networking</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services & Financing */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Services & Financing
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/laptop-emi" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-cyan-500" />
                  <span>💳 Laptop EMI (3 to 12 Months)</span>
                </Link>
              </li>
              <li>
                <Link href="/services/electrician" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>⚡ Book an Electrician (Moulvibazar)</span>
                </Link>
              </li>
              <li>
                <Link href="/services/cctv-installation" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>📹 CCTV Camera Installation</span>
                </Link>
              </li>
              <li>
                <Link href="/electrical-services" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Home & Commercial Electrical Services</span>
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Delivery & Courier Coverage</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Customer FAQs & Policies</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-600" />
                  <span>Knowledge Center & Tech Guides</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Local Service Areas */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Service Areas
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Direct showroom pickup, same-day technician dispatch, and express courier delivery across:
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/moulvibazar" className="hover:text-cyan-400 font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin size={12} className="text-cyan-400" />
                  <span>Moulvibazar Town (Kusumbag / Chowmuhana)</span>
                </Link>
              </li>
              <li>
                <Link href="/sreemangal" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-500" />
                  <span>Sreemangal Upazila</span>
                </Link>
              </li>
              <li>
                <Link href="/kulaura" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-500" />
                  <span>Kulaura Upazila</span>
                </Link>
              </li>
              <li>
                <Link href="/rajnagar" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-500" />
                  <span>Rajnagar Upazila</span>
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-400">
                <span>Nationwide delivery via Sundarban & Steadfast Courier across all 64 districts in Bangladesh.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Bangla Notice */}
        <div className="border-t border-slate-800/80 pt-8 pb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-300 block mb-1">
              মৌলভীবাজার ও সারা বাংলাদেশে বিশ্বস্ত প্রযুক্তি ও ইলেকট্রিক্যাল সমাধান
            </span>
            <span>
              We accept Cash on Delivery, bKash, Nagad, Bank Transfer, Visa / Mastercard, and In-House Laptop EMI.
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono text-[11px]">
              ৳ BDT Currency
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono text-[11px]">
              🔒 100% Genuine Tech
            </span>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved. Registered Business in Moulvibazar, Bangladesh.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-300">About Us</Link>
            <span>•</span>
            <Link href="/delivery" className="hover:text-slate-300">Delivery Policy</Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-slate-300">Warranty Terms</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-300">Contact</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-slate-300">ERP Staff Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
