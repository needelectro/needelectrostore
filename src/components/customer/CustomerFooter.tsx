'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Clock, ExternalLink, ChevronRight,
  PackageSearch, MessageCircle, User, Truck, ShieldCheck,
  CreditCard, Globe, CheckCircle2, ShoppingBag, Wrench, HelpCircle
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';
import { FOOTER_SETTINGS, getVerifiedSocialLinks, SocialLink } from '@/lib/footerConfig';
import { useLanguage } from '@/src/services/languageContext';

// Verified Social Icon SVGs
const SocialPlatformIcon: React.FC<{ platform: SocialLink['platform'] }> = ({ platform }) => {
  switch (platform) {
    case 'Facebook':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'Instagram':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'YouTube':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'LinkedIn':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
  }
};

export const CustomerFooter: React.FC = () => {
  const { t, isBangla } = useLanguage();
  const verifiedSocials = getVerifiedSocialLinks();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F4F6F8] dark:bg-[#071328] text-[#334155] dark:text-slate-300 border-t border-slate-200/90 dark:border-slate-800 pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Website Network Banner — Clear Differentiation Between .store and .com */}
        <div className="bg-gradient-to-r from-[#002B5B] via-[#003B7B] to-[#008CFF] text-white rounded-2xl p-6 sm:p-7 shadow-lg shadow-blue-900/10 border border-blue-400/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-blue-100 border border-white/20">
                <Globe size={13} className="text-cyan-300" />
                <span>{isBangla ? 'নিড ইলেক্ট্রো ওয়েবসাইট নেটওয়ার্ক' : 'NEED ELECTRO Website Network'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {isBangla
                  ? FOOTER_SETTINGS.mainWebsiteLabel.bn
                  : FOOTER_SETTINGS.mainWebsiteLabel.en}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                {isBangla
                  ? FOOTER_SETTINGS.mainWebsitePurpose.bn
                  : FOOTER_SETTINGS.mainWebsitePurpose.en}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href={FOOTER_SETTINGS.mainWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#002B5B] hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition-all group focus:outline-hidden focus:ring-2 focus:ring-white/80"
              >
                <span>{t('footer.mainWebsiteCta', 'Visit Main Company & Services Website')}</span>
                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-colors"
              >
                <ShoppingBag size={14} />
                <span>{isBangla ? 'স্টোরে কেনাকাটা করুন' : 'Shop Products Here'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">

          {/* Column 1 — Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group focus:outline-hidden">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center p-1.5 shadow-xs">
                <img src="/logo-icon.png" alt="NEED ELECTRO Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-lg font-black text-[#002B5B] dark:text-white tracking-tight block">
                  {BUSINESS_INFO.name}
                </span>
                <span className="text-[11px] text-[#008CFF] font-semibold tracking-wide">
                  {isBangla ? '- বিশ্বস্ত ইলেকট্রিক্যাল ও প্রযুক্তি সমাধান -' : '- Trusted Electrical & Technological Solutions -'}
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#475569] dark:text-slate-400 leading-relaxed">
              {t(
                'footer.companyDesc',
                'NEED ELECTRO brings electrical products, modern technology, and reliable electrical and technical services together in one connected ecosystem.'
              )}
            </p>

            <div className="pt-1">
              <a
                href={FOOTER_SETTINGS.mainWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#008CFF] hover:text-[#002B5B] dark:hover:text-blue-300 font-semibold group"
              >
                <span>{isBangla ? 'প্রধান কোম্পানি ওয়েবসাইট' : 'Main Company Website'}</span>
                <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            <div className="space-y-2 text-xs text-[#334155] dark:text-slate-300 pt-1">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[#008CFF] shrink-0 mt-0.5" />
                <span>
                  <strong>{isBangla ? 'অপারেশনস বেস:' : 'Hub:'}</strong> {BUSINESS_INFO.address.addressLocality}, {BUSINESS_INFO.address.addressRegion}, Bangladesh
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#008CFF] shrink-0" />
                <span>
                  <strong>{t('footer.hotline', 'Hotline')}:</strong>{' '}
                  <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="text-[#002B5B] dark:text-white hover:text-[#008CFF] font-bold">
                    {BUSINESS_INFO.phone}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>WhatsApp:</strong>{' '}
                  <a
                    href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    {isBangla ? 'সরাসরি চ্যাট করুন' : 'Chat with Sales'}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#008CFF] shrink-0" />
                <span>{t('footer.hours', 'Hours: Sat – Thu (9:30 AM – 9:30 PM)')}</span>
              </div>
            </div>
          </div>

          {/* Column 2 — Shop Products */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#002B5B] dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <ShoppingBag size={13} className="text-[#008CFF]" />
              <span>{t('footer.shopProducts', 'Shop Products')}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.allProducts', 'All Products')}</span>
                </Link>
              </li>
              <li>
                <Link href="/laptops" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.laptops', 'Laptops')}</span>
                </Link>
              </li>
              <li>
                <Link href="/computers" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.desktopComputers', 'Desktop Computers')}</span>
                </Link>
              </li>
              <li>
                <Link href="/cctv" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.cctvCameras', 'CCTV Cameras')}</span>
                </Link>
              </li>
              <li>
                <Link href="/electrical-products" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.electricalProducts', 'Electrical Products')}</span>
                </Link>
              </li>
              <li>
                <Link href="/computer-accessories" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.gadgetsAccessories', 'Gadgets & Accessories')}</span>
                </Link>
              </li>
              <li>
                <Link href="/laptop-emi" className="text-[#008CFF] hover:underline font-semibold flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-[#008CFF]" />
                  <span>{t('footer.offersDeals', 'Offers & EMI Plans')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#002B5B] dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <Wrench size={13} className="text-[#008CFF]" />
              <span>{t('footer.services', 'Services')}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/electrical-services" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.electricalServices', 'Electrical Services')}</span>
                </Link>
              </li>
              <li>
                <Link href="/services/electrician" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.electricalMaintenance', 'Electrical Installation & Maintenance')}</span>
                </Link>
              </li>
              <li>
                <Link href="/services/cctv-installation" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.cctvInstallation', 'CCTV Installation')}</span>
                </Link>
              </li>
              <li>
                <Link href="/services/laptop-computer-repair" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.technicalSupport', 'Laptop & PC Repair Lab')}</span>
                </Link>
              </li>
              <li>
                <Link href="/services/networking" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.softwareDigital', 'Software & Digital Solutions')}</span>
                </Link>
              </li>
              <li className="pt-1">
                <a
                  href={FOOTER_SETTINGS.mainWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#002B5B] dark:text-cyan-300 font-bold hover:text-[#008CFF] flex items-center gap-1.5"
                >
                  <ExternalLink size={12} className="text-[#008CFF]" />
                  <span>{isBangla ? 'কোম্পানি সার্ভিসেস ওয়েবসাইট →' : 'Company Services Site →'}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 — Customer Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#002B5B] dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <HelpCircle size={13} className="text-[#008CFF]" />
              <span>{t('footer.customerSupport', 'Customer Support')}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/contact" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.contactUs', 'Contact Us')}</span>
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.helpSupport', 'Help & Guides')}</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.faqs', 'FAQs')}</span>
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.shippingPolicy', 'Shipping & Delivery Policy')}</span>
                </Link>
              </li>
              <li>
                <Link href="/return-refund-policy" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.returnPolicy', 'Return & Refund Policy')}</span>
                </Link>
              </li>
              <li>
                <Link href="/warranty-policy" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.warrantyPolicy', 'Warranty Policy')}</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.privacyPolicy', 'Privacy Policy')}</span>
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-[#008CFF] text-[#475569] dark:text-slate-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  <span>{t('footer.termsConditions', 'Terms & Conditions')}</span>
                </Link>
              </li>
              <li>
                <Link href="/customer/dashboard" className="text-[#008CFF] font-semibold hover:underline flex items-center gap-1.5">
                  <User size={12} className="text-[#008CFF]" />
                  <span>{t('footer.myAccount', 'My Account')}</span>
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1.5">
                  <PackageSearch size={12} className="text-emerald-600" />
                  <span>{t('footer.trackOrder', 'Track Order')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 — Follow Us (Exclusively Populated with Verified Links) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#002B5B] dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>{t('footer.followUs', 'Follow Us')}</span>
            </h3>

            <p className="text-xs text-[#475569] dark:text-slate-400 leading-relaxed">
              {t(
                'footer.followUsDesc',
                'Connect with our verified social channels for product releases and store updates.'
              )}
            </p>

            {/* Social Icons with Accessible Touch Targets (min 44x44px) */}
            <div className="flex items-center flex-wrap gap-2.5 pt-1">
              {verifiedSocials.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={isBangla ? link.ariaLabel.bn : link.ariaLabel.en}
                  className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-[#002B5B] dark:text-slate-200 hover:text-[#008CFF] dark:hover:text-[#008CFF] hover:border-[#008CFF] dark:hover:border-[#008CFF] hover:shadow-md hover:scale-105 transition-all flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-[#008CFF]/50"
                >
                  <SocialPlatformIcon platform={link.platform} />
                </a>
              ))}
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={11} />
                <span>{t('footer.verifiedOnly', 'Verified Channels')}</span>
              </span>
            </div>

            {/* Nationwide Delivery Notice */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-[11px] text-[#64748B] dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-[#002B5B] dark:text-slate-200">
                <Truck size={12} className="text-[#008CFF]" />
                <span>{isBangla ? 'সারা বাংলাদেশে ডেলিভারি' : 'Nationwide Delivery'}</span>
              </div>
              <p className="leading-normal">
                {t('footer.districtCoverage', 'Express courier delivery across all 64 districts in Bangladesh.')}
              </p>
              <Link href="/locations" className="text-[#008CFF] hover:underline font-semibold block pt-0.5">
                {isBangla ? '৬৪ জেলার তালিকা দেখুন →' : 'View all 64 districts →'}
              </Link>
            </div>
          </div>

        </div>

        {/* Payment Methods & Trust Notice */}
        <div className="border-t border-slate-200/90 dark:border-slate-800 pt-6 pb-2 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#475569] dark:text-slate-400">
          <div>
            <span className="font-semibold text-[#002B5B] dark:text-slate-200 block mb-1">
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
          <div className="flex items-center gap-2.5 text-[#334155] dark:text-slate-300 shrink-0">
            <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-[#002B5B] dark:text-slate-200 font-mono text-[11px] shadow-2xs">
              {t('footer.bdtCurrency', '৳ BDT Currency')}
            </span>
            <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-[#002B5B] dark:text-slate-200 font-mono text-[11px] shadow-2xs">
              {t('footer.genuineGuarantee', '🔒 100% Genuine Guaranteed')}
            </span>
          </div>
        </div>

        {/* Bottom Copyright Bar with Dynamic Year and Network Links */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-[#64748B] dark:text-slate-400">
          <p>
            © {currentYear} {BUSINESS_INFO.name}. {t('footer.rightsReserved', 'All rights reserved.')}
          </p>

          <div className="flex items-center flex-wrap gap-2.5">
            <a
              href={FOOTER_SETTINGS.mainWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#008CFF] hover:underline font-semibold flex items-center gap-1"
            >
              <span>{isBangla ? 'প্রধান ওয়েবসাইট' : 'Main Website'}</span>
              <ExternalLink size={10} />
            </a>
            <span>•</span>
            <Link href="/" className="hover:text-[#008CFF] font-semibold text-[#002B5B] dark:text-slate-300">
              {FOOTER_SETTINGS.storeLabel.en}
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-[#008CFF]">About Us</Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-[#008CFF]">Privacy</Link>
            <span>•</span>
            <Link href="/terms-conditions" className="hover:text-[#008CFF]">Terms</Link>
            <span>•</span>
            <Link href="/shipping-policy" className="hover:text-[#008CFF]">Shipping</Link>
            <span>•</span>
            <Link href="/return-refund-policy" className="hover:text-[#008CFF]">Returns</Link>
            <span>•</span>
            <Link href="/warranty-policy" className="hover:text-[#008CFF]">Warranty</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#008CFF]">Contact</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-[#008CFF] opacity-75">Staff ERP</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
