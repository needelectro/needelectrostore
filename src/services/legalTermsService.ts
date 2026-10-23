// NEED ELECTRO ERP — Legal & Contract Terms Management Service
// Authoritative repository for Section A (Company General Terms) & Section B (EMI Terms)
// Fully bilingual (English & বাংলা) and compliant with applicable Bangladesh law.

export interface LegalClause {
  id: string;
  number: number;
  section: 'COMPANY' | 'EMI' | 'CUSTOM';
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  isMandatory: boolean;
  appliesToEmi: boolean;
  order: number;
  category: string;
}

export interface LegalTemplateVersion {
  versionId: string;
  versionNumber: string; // e.g. "v1.0"
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  effectiveDate: string;
  publishedAt?: string;
  publishedBy?: string;
  author: string;
  notes?: string;
  companyClauses: LegalClause[];
  emiClauses: LegalClause[];
}

export interface ContractInterpolationContext {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNid: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorRelation?: string;
  guarantorNid?: string;
  productName: string;
  serialNumber: string;
  contractNumber: string;
  agreementDate: string;
  contractPrice: number;
  downPayment: number;
  financedAmount: number;
  interestRate: number;
  isInterestFree: boolean;
  interestMethod: string;
  durationMonths: number;
  monthlyInstallment: number;
  finalInstallment: number;
  firstDueDate: string;
  finalDueDate: string;
  gracePeriodDays: number;
  lateFeePerDay: number;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  companyEmail?: string;
}

// -------------------------------------------------------------
// SECTION A: 20 NEED ELECTRO GENERAL COMPANY TERMS & CONDITIONS
// -------------------------------------------------------------
export const DEFAULT_20_COMPANY_CLAUSES: LegalClause[] = [
  {
    id: 'comp-1',
    number: 1,
    section: 'COMPANY',
    category: 'IDENTITY',
    title: 'Company Identity and Operational Scope',
    titleBn: 'কোম্পানির পরিচিতি ও ব্যবসায়িক পরিধি',
    isMandatory: true,
    appliesToEmi: true,
    order: 1,
    content:
      '{COMPANY_NAME} ("the Company", "Seller", or "Service Provider"), operating its central showroom and service facility at {COMPANY_ADDRESS}, Contact: {COMPANY_PHONE}, Email: {COMPANY_EMAIL}, is a leading retail enterprise specializing in genuine technological equipment, laptops, electrical appliances, engineering solutions, and consumer electronics in Bangladesh. All sales, repair services, online transactions, hire-purchase agreements, and business engagements are governed by these General Terms & Conditions alongside applicable transaction-specific terms.',
    contentBn:
      '{COMPANY_NAME} ("কোম্পানি", "বিক্রেতা" বা "সেবা প্রদানকারী"), প্রধান শোরুম ও সেবা কেন্দ্র: {COMPANY_ADDRESS}, হটলাইন: {COMPANY_PHONE}, ইমেইল: {COMPANY_EMAIL}, বাংলাদেশে আসল ও মানসম্মত ল্যাপটপ, ইলেকট্রনিক সামগ্রী, প্রযুক্তি সেবা ও বৈদ্যুতিক সরঞ্জাম বিক্রয়ের একটি প্রতিষ্ঠিত প্রতিষ্ঠান। কোম্পানির সকল বিক্রয়, সেবা, অনলাইন অর্ডার ও কিস্তি অর্থায়ন এই সাধারণ শর্তাবলি এবং সংশ্লিষ্ট চুক্তিভিত্তিক শর্তের অধীনে পরিচালিত হইবে।',
  },
  {
    id: 'comp-2',
    number: 2,
    section: 'COMPANY',
    category: 'PRICING',
    title: 'Product Information, Specifications & Transparent Pricing',
    titleBn: 'পণ্যের তথ্য, স্পেসিফিকেশন ও স্বচ্ছ মূল্য কাঠামো',
    isMandatory: true,
    appliesToEmi: true,
    order: 2,
    content:
      'All products displayed, quoted, or invoiced by {COMPANY_NAME} are original units accompanied by verifiable model numbers, manufacturer technical specifications, and physical serial numbers or IMEIs. Prices are quoted in Bangladeshi Taka (৳/BDT) and accurately reflect selling rates, documented promotional discounts, and statutory taxes/VAT where applicable. The Company strictly prohibits hidden charges, undisclosed surcharges, or post-confirmation price adjustments on confirmed orders.',
    contentBn:
      '{COMPANY_NAME} কর্তৃক প্রদর্শিত বা ইনভয়েসকৃত সকল পণ্য মূল প্রস্তুতকারকের আসল মডেল নম্বর, কারিগরি স্পেসিফিকেশন ও ভেরিফায়েবল সিরিয়াল/IMEI সম্বলিত। সকল মূল্য বাংলাদেশী টাকায় (৳) নির্ধারিত এবং প্রযোজ্য সরকারি ভ্যাট ও অনুমোদিত ছাড় সুস্পষ্টভাবে ইনভয়েসে প্রতিফলিত হয়। নিশ্চিতকৃত অর্ডারে কোনো প্রকার গোপন চার্জ বা অননুমোদিত মূল্য বৃদ্ধি সম্পূর্ণ নিষিদ্ধ।',
  },
  {
    id: 'comp-3',
    number: 3,
    section: 'COMPANY',
    category: 'ORDERS',
    title: 'Order Placement, Verification & Contract Formation',
    titleBn: 'অর্ডার স্থাপন, যাচাইকরণ ও চুক্তি কার্যকরিতা',
    isMandatory: true,
    appliesToEmi: true,
    order: 3,
    content:
      'Orders placed in-store, via website, or through authorized communication channels constitute an offer to purchase. An order is formally accepted and becomes binding upon verification of stock, validation of customer identification, and issuance of an official computerized sales invoice, hire-purchase contract, or booking receipt by authorized {COMPANY_NAME} management. The Company reserves the right to decline orders involving fraudulent details, unverified identity, or inventory discrepancies prior to formal acceptance.',
    contentBn:
      'শোরুম, ওয়েবসাইট বা অনুমোদিত মাধ্যমে প্রদত্ত অর্ডার ক্রয় প্রস্তাব হিসেবে গণ্য হয়। পণ্য প্রাপ্যতা, গ্রাহকের তথ্য যাচাই এবং {COMPANY_NAME} কর্তৃক কম্পিউটারাইজড ইনভয়েস বা চুক্তিপত্র ইস্যুর মাধ্যমে অর্ডারটি চূড়ান্তভাবে কার্যকর হয়। ভুল তথ্য, জালিয়াতি বা অস্তিত্বহীন যোগাযোগের ক্ষেত্রে কোম্পানি যেকোনো অর্ডার বাতিল বা পুনর্বিবেচনার অধিকার সংরক্ষণ করে।',
  },
  {
    id: 'comp-4',
    number: 4,
    section: 'COMPANY',
    category: 'PAYMENTS',
    title: 'Accepted Payment Methods, Receipts & Reconciliation',
    titleBn: 'অনুমোদিত মূল্য পরিশোধ পদ্ধতি, রসিদ ও হিসাব সমন্বয়',
    isMandatory: true,
    appliesToEmi: true,
    order: 4,
    content:
      'Payments must be remitted exclusively through authorized {COMPANY_NAME} channels: physical cash at official cash counters, validated Mobile Financial Services (bKash, Nagad, Rocket merchant accounts), authorized point-of-sale card terminals, or direct scheduled bank transfers. A system-generated receipt containing an official receipt number or bank transaction ID is mandatory proof of payment. Payments remitted to unauthorized personal accounts of staff or third parties shall not be recognized.',
    contentBn:
      'সকল লেনদেন অবশ্যই {COMPANY_NAME}-এর অনুমোদিত কাউন্টার ক্যাশ, অফিশিয়াল মার্চেন্ট এমএফএস (বিকাশ/নগদ/রকেট), পিওএস ব্যাংক কার্ড বা অফিশিয়াল ব্যাংক অ্যাকাউন্টের মাধ্যমে সম্পন্ন করিতে হইবে। সিস্টেম-জেনারেটেড কম্পিউটারাইজড রসিদ বা ব্যাংক ট্রানজেকশন রেফারেন্স ছাড়া কোনো পেমেন্ট গ্রহণযোগ্য নহে। কোনো কর্মচারীর ব্যক্তিগত অ্যাকাউন্টে প্রেরিত অর্থ কোম্পানি কর্তৃক স্বীকৃত হইবে না।',
  },
  {
    id: 'comp-5',
    number: 5,
    section: 'COMPANY',
    category: 'DELIVERY',
    title: 'Delivery, Showroom Handover & Transit Handling',
    titleBn: 'ডেলিভারি, শোরুম হস্তান্তর ও পরিবহন নীতিমালা',
    isMandatory: true,
    appliesToEmi: true,
    order: 5,
    content:
      'Products may be collected directly from the {COMPANY_NAME} showroom or dispatched through trusted, insured courier services within Bangladesh. Showroom handovers require immediate physical examination and signed delivery acknowledgement. Courier shipments are dispatched with tamper-evident packaging and tracking references. In the event of courier delay due to weather, regional transportation disruption, or transit verification, the customer shall be promptly notified.',
    contentBn:
      'পণ্য শোরুম হইতে সরাসরি সংগ্রহ বা বাংলাদেশের যেকোনো প্রান্তে অনুমোদিত কুরিয়ার সার্ভিসের মাধ্যমে ডেলিভারি গ্রহণ করা যাইবে। শোরুম হস্তান্তরের ক্ষেত্রে ক্রেতা পণ্য স্বচক্ষে যাচাইপূর্বক প্রাপ্তি স্বীকারপত্রে স্বাক্ষর করিবেন। কুরিয়ার ডেলিভারির ক্ষেত্রে ট্র্যাকিং নম্বর প্রদান করা হইবে এবং অনিবার্য প্রাকৃতিক বা পরিবহনগত কারণে বিলম্ব ঘটিলে গ্রাহককে তাৎক্ষণিক অবহিত করা হইবে।',
  },
  {
    id: 'comp-6',
    number: 6,
    section: 'COMPANY',
    category: 'INSPECTION',
    title: 'Product Inspection, Accessories & Physical Condition',
    titleBn: 'পণ্য পরিদর্শন, এক্সেসরিজ ও শারীরিক অবস্থা যাচাই',
    isMandatory: true,
    appliesToEmi: true,
    order: 6,
    content:
      'The Customer is entitled and required to inspect the equipment, exterior chassis, display, ports, original adapter/charger, documentation, and matching serial number before leaving the showroom or within twenty-four (24) hours of courier receipt. Any visible transit damage, cosmetic defect, missing accessory, or serial mismatch must be reported to {COMPANY_NAME} customer service immediately with photographic or video evidence.',
    contentBn:
      'পণ্য গ্রহণের সময় ক্রেতা এর বডি, ডিসপ্লে, পোর্ট, চার্জার, এক্সেসরিজ ও সিরিয়াল নম্বর সম্পূর্ণ যাচাই করিয়া লইবেন। কুরিয়ারে প্রাপ্ত পণ্যের ক্ষেত্রে কোনো প্রকার বাহ্যিক ক্ষতি, ভাঙা বা অমিল পরিলক্ষিত হইলে গ্রহণের ২৪ ঘণ্টার মধ্যে প্রয়োজনীয় ছবি/ভিডিও প্রমাণসহ {COMPANY_NAME}-এ অভিযোগ দায়ের করিতে হইবে।',
  },
  {
    id: 'comp-7',
    number: 7,
    section: 'COMPANY',
    category: 'WARRANTY',
    title: 'Warranty Coverage, Service Support & Exclusions',
    titleBn: 'ওয়ারেন্টি সুবিধা, আফটার-সেলস সার্ভিস ও ব্যতিক্রমসমূহ',
    isMandatory: true,
    appliesToEmi: true,
    order: 7,
    content:
      'All brand-new equipment carries official manufacturer warranty or {COMPANY_NAME} written service warranty as specified on the sales invoice. Warranty covers internal component and manufacturing defects under normal recommended operational conditions. Warranty explicitly excludes physical breakage, liquid intrusion, electrical surge or lightning damage caused by faulty home grounding, burn marks, unauthorized tampering or third-party disassembly, software virus corruption, and cosmetic wear.',
    contentBn:
      'ইনভয়েসে উল্লিখিত মেয়াদের ভিত্তিতে পণ্য অফিশিয়াল ব্র্যান্ড ওয়ারেন্টি বা {COMPANY_NAME} সার্ভিস ওয়ারেন্টির আওতাভুক্ত থাকিবে। সাধারণ ব্যবহারের ত্রুটি ওয়ারেন্টির আওতায় মেরামতযোগ্য। তবে যেকোনো প্রকার শারীরিক আঘাত, তরল পদার্থ প্রবেশ, বজ্রপাত বা বিদ্যুৎ ওঠানামার কারণে সৃষ্ট বার্ন, অননুমোদিত খোলা বা বাইরের মেকানিক দ্বারা মেরামত এবং সফটওয়্যার বা ভাইরাসজনিত ক্ষতি ওয়ারেন্টির আওতাভুক্ত হইবে না।',
  },
  {
    id: 'comp-8',
    number: 8,
    section: 'COMPANY',
    category: 'RETURNS',
    title: 'Returns, Replacement, Cancellations & Refund Policy',
    titleBn: 'রিটার্ন, পণ্য প্রতিস্থাপন, বাতিল ও রিফান্ড নীতিমালা',
    isMandatory: true,
    appliesToEmi: true,
    order: 8,
    content:
      'Pursuant to the Consumer Rights Protection Act 2009 of Bangladesh, if a newly purchased hardware unit demonstrates an unrepairable manufacturer defect within seven (7) days of purchase, {COMPANY_NAME} shall provide an identical replacement or equivalent exchange upon technical evaluation. Items returned must include original box, serial stickers, accessories, and invoice. Change of mind after box seal breakage, usage, or physical alterations is not eligible for return.',
    contentBn:
      'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ অনুযায়ী, ক্রয়ের ৭ (সাত) দিনের মধ্যে পণ্যে প্রস্তুতকারকজনিত জটিল হার্ডওয়্যার ত্রুটি ধরা পড়িলে কারিগরি মূল্যায়নের পর সমমূল্যের পণ্য প্রতিস্থাপন বা সমাধান প্রদান করা হইবে। রিটার্নের ক্ষেত্রে মূল বক্স, সিরিয়াল স্টিকার, আনুষঙ্গিক সরঞ্জাম ও ইনভয়েস অক্ষত থাকিতে হইবে। পণ্য ব্যবহারের পর নিছক পছন্দ পরিবর্তনজনিত কারণে রিটার্ন গ্রহণযোগ্য নহে।',
  },
  {
    id: 'comp-9',
    number: 9,
    section: 'COMPANY',
    category: 'CUSTOMER_DUTIES',
    title: 'Customer Responsibilities & Accurate Disclosure',
    titleBn: 'গ্রাহকের দায়িত্ব ও সঠিক তথ্য প্রদানের বাধ্যবাধকতা',
    isMandatory: true,
    appliesToEmi: true,
    order: 9,
    content:
      'The Customer affirms that all personal data, National ID (NID), delivery address, contact numbers, and payment details provided to {COMPANY_NAME} are true, accurate, and lawfully owned. The Customer undertakes to operate electronic equipment in compliance with technical manuals, maintain adequate electrical grounding, safe surge protection, and preserve all purchase receipts for warranty validation.',
    contentBn:
      'গ্রাহক নিশ্চয়তা প্রদান করিতেছেন যে, কোম্পানিকে প্রদত্ত সকল ব্যক্তিগত তথ্য, জাতীয় পরিচয়পত্র (NID), বর্তমান ও স্থায়ী ঠিকানা এবং মোবাইল নম্বর সম্পূর্ণ সঠিক ও সত্য। গ্রাহক পণ্যটি প্রস্তুতকারকের নিয়মাবলি অনুযায়ী যথাযথ বিদ্যুৎ সুরক্ষা ও সুরক্ষামূলক পরিবেশে ব্যবহার করিবেন এবং ওয়ারেন্টির জন্য ইনভয়েস সংরক্ষণ করিবেন।',
  },
  {
    id: 'comp-10',
    number: 10,
    section: 'COMPANY',
    category: 'WEBSITE',
    title: 'Website Usage, Security & Digital Portal Policy',
    titleBn: 'ওয়েবসাইট ব্যবহার, সাইবার নিরাপত্তা ও ডিজিটাল সেবা নীতি',
    isMandatory: true,
    appliesToEmi: true,
    order: 10,
    content:
      'Users of the {COMPANY_NAME} online portal, ERP customer dashboard, or e-commerce website agree not to engage in unauthorized scraping, malicious automated access, payment gateway manipulation, account sharing, or fraudulent activity. The Company implements industry-standard data security and encrypts sensitive transactions to protect customer credentials and operational integrity.',
    contentBn:
      '{COMPANY_NAME}-এর ওয়েবসাইট, গ্রাহক ড্যাশবোর্ড বা অনলাইন পোর্টাল ব্যবহারকালে কোনো প্রকার অননুমোদিত স্ক্র্যাপিং, হ্যাকিং, পেমেন্ট গেটওয়েতে জালিয়াতি বা সাইবার নিরাপত্তা লঙ্ঘন আইনত দণ্ডনীয় অপরাধ। গ্রাহকের তথ্যের সুরক্ষা ও গোপনীয়তা বজায় রাখিতে কোম্পানি আধুনিক এনক্রিপশন ও সাইবার নিরাপত্তা ব্যবস্থা অনুসরণ করে।',
  },
  {
    id: 'comp-11',
    number: 11,
    section: 'COMPANY',
    category: 'PRIVACY',
    title: 'Privacy Policy & Protection of Personal Information',
    titleBn: 'গোপনীয়তা নীতি ও ব্যক্তিগত তথ্যের সুরক্ষা',
    isMandatory: true,
    appliesToEmi: true,
    order: 11,
    content:
      '{COMPANY_NAME} collects and processes customer personal data strictly for order fulfillment, warranty registration, installment loan management, courier delivery, SMS service alerts, and statutory tax compliance. Personal data is never sold or rented to third-party marketing brokers. Disclosure is restricted to authorized courier partners, payment processors, and lawful government authorities where mandated by Bangladesh law.',
    contentBn:
      '{COMPANY_NAME} গ্রাহকের তথ্য শুধুমাত্র ইনভয়েস তৈরি, ওয়ারেন্টি সার্ভিস, কিস্তি অর্থায়ন ব্যবস্থাপনা, কুরিয়ার ডেলিভারি, প্রয়োজনীয় এসএমএস নোটিফিকেশন ও আইনগত হিসাব সংরক্ষণে ব্যবহার করে। গ্রাহকের ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের নিকট বিপণন উদ্দেশ্যে বিক্রয় বা হস্তান্তর করা হয় না।',
  },
  {
    id: 'comp-12',
    number: 12,
    section: 'COMPANY',
    category: 'SERVICES',
    title: 'Electrical, Engineering & Technical Repair Services',
    titleBn: 'বৈদ্যুতিক, ইঞ্জিনিয়ারিং ও কারিগরি সার্ভিস নীতিমালা',
    isMandatory: false,
    appliesToEmi: true,
    order: 12,
    content:
      'Where {COMPANY_NAME} undertakes technical servicing, hardware upgrades, motherboard diagnostics, or electrical installation, work shall proceed upon written customer authorization and diagnostic cost quotation. The Company utilizes genuine spare components. Any unforeseen technical defect discovered during deep diagnostics shall require customer confirmation before proceeding with chargeable repairs.',
    contentBn:
      '{COMPANY_NAME} কর্তৃক প্রদত্ত ল্যাপটপ মেরামত, হার্ডওয়্যার আপগ্রেড বা প্রযুক্তি সেবার ক্ষেত্রে প্রাথমিক ডায়াগনস্টিক ও সম্ভাব্য খরচের অনুমোদন লইয়া কাজ শুরু করা হয়। কোম্পানি সর্বোচ্চ মানসম্মত যন্ত্রাংশ ব্যবহার করে। মেরামতের সময় অতিরিক্ত কোনো জটিলতা পাওয়া গেলে গ্রাহকের অনুমতি সাপেক্ষে কাজ সম্পন্ন করা হয়।',
  },
  {
    id: 'comp-13',
    number: 13,
    section: 'COMPANY',
    category: 'AVAILABILITY',
    title: 'Product Availability, Stock Realignment & Substitution',
    titleBn: 'পণ্যের প্রাপ্যতা, স্টক সমন্বয় ও প্রতিস্থাপন সংক্রান্ত নিয়ম',
    isMandatory: true,
    appliesToEmi: true,
    order: 13,
    content:
      'Product listings reflect active inventory. In the rare event of concurrent in-store sale or supplier stock depletion, {COMPANY_NAME} shall notify the customer within twenty-four (24) business hours and provide options for: (a) alternative specification model with mutual price reconciliation, (b) priority waiting for new shipment, or (c) immediate full refund of any deposit collected.',
    contentBn:
      'স্টকের প্রাপ্যতা সাপেক্ষে অর্ডার কার্যকর হয়। কোনো কারণে একসাথে অধিক বিক্রির ফলে নির্দিষ্ট মডেলের স্টক ফুরিয়ে গেলে কোম্পানি ২৪ ঘণ্টার মধ্যে গ্রাহকের সহিত যোগাযোগ করিয়া সমমানের বিকল্প মডেল গ্রহণ, পরবর্তী লটের জন্য অপেক্ষা অথবা জমাকৃত টাকা সম্পূর্ণ ফেরতের সুযোগ প্রদান করিবে।',
  },
  {
    id: 'comp-14',
    number: 14,
    section: 'COMPANY',
    category: 'COMPLAINTS',
    title: 'Complaints Escalation, Customer Support & Dispute Redressal',
    titleBn: 'অভিযোগ নিষ্পত্তি, গ্রাহক সহায়তা ও বিরোধ প্রতিকার ব্যবস্থা',
    isMandatory: true,
    appliesToEmi: true,
    order: 14,
    content:
      '{COMPANY_NAME} maintains a dedicated Customer Experience and Grievance Cell. Customers may submit support tickets, warranty claims, or service feedback via Helpline: {COMPANY_PHONE}, Showroom Helpdesk at {COMPANY_ADDRESS}, or Official Email: {COMPANY_EMAIL}. Standard inquiries are acknowledged within 24 hours, and formal resolutions are rendered within three to seven (3-7) working days in good faith.',
    contentBn:
      'গ্রাহক সেবায় সর্বোচ্চ স্বচ্ছতা নিশ্চিত করিতে {COMPANY_NAME}-এ অভিযোগ ও বিরোধ প্রতিকার সেল সক্রিয় রহিয়াছে। যেকোনো অভিযোগ, ওয়ারেন্টি দাবি বা মতামতের জন্য হটলাইন: {COMPANY_PHONE}, শোরুম ডেস্ক: {COMPANY_ADDRESS} বা ইমেইল: {COMPANY_EMAIL}-এ যোগাযোগ করা যাইবে। কোম্পানি ৩ হইতে ৭ কার্যদিবসের মধ্যে আন্তরিকতার সহিত সমাধানের ব্যবস্থা গ্রহণ করে।',
  },
  {
    id: 'comp-15',
    number: 15,
    section: 'COMPANY',
    category: 'LIABILITY',
    title: 'Limitation of Liability & Commercial Boundaries',
    titleBn: 'দায়বদ্ধতার সীমাবদ্ধতা ও বাণিজ্যিক সুরক্ষা',
    isMandatory: true,
    appliesToEmi: true,
    order: 15,
    content:
      'To the maximum extent permitted under Bangladesh law, {COMPANY_NAME}\'s total aggregate liability arising out of any sale, service, delivery, or warranty engagement shall not exceed the actual monetary amount paid by the customer for the specific product or service giving rise to the claim. The Company shall not be liable for indirect commercial losses, personal data loss resulting from customer\'s failure to backup hard drives, or business interruption.',
    contentBn:
      'বাংলাদেশের প্রচলিত আইন অনুযায়ী, যেকোনো লেনদেন বা পণ্যজনিত বিরোধের ক্ষেত্রে {COMPANY_NAME}-এর আর্থিক দায় সংশ্লিষ্ট পণ্যের বাবদ গ্রাহকের পরিশোধিত মূল্যের অধিক হইবে না। গ্রাহকের কম্পিউটারের গুরুত্বপূর্ণ ডাটা ব্যাকআপ না রাখার ফলে সৃষ্ট কোনো তথ্য হারানো বা পরোক্ষ ব্যবসায়িক ক্ষতির দায় কোম্পানি বহন করিবে না।',
  },
  {
    id: 'comp-16',
    number: 16,
    section: 'COMPANY',
    category: 'FORCE_MAJEURE',
    title: 'Force Majeure & Uncontrollable Operational Disruptions',
    titleBn: 'অপ্রত্যাশিত প্রাকৃতিক বা রাষ্ট্রীয় দুর্যোগ (ফোর্স মেজার)',
    isMandatory: true,
    appliesToEmi: true,
    order: 16,
    content:
      'Neither party shall be considered in breach of contract for failure or delay in fulfilling delivery or service timelines where caused by occurrences beyond reasonable control, including natural disasters (floods, earthquakes, cyclones), nationwide telecommunication or power grid blackouts, government lockdowns, border import embargoes, or civil unrest. Affected timelines shall extend proportionally during such disruption.',
    contentBn:
      'বন্যা, ভূমিকম্প, ঘূর্ণিঝড়, জাতীয় গ্রিড বিপর্যয়, ইন্টারনেট ব্ল্যাকআউট, সরকারি বিধিনিষেধ বা অনাকাঙ্ক্ষিত হরতাল/অবরোধের মতো নিয়ন্ত্রণের বাইরে কোনো কারণে পণ্য সরবরাহ বা সার্ভিসে সাময়িক বিলম্ব ঘটিলে তাহা চুক্তিভঙ্গ বলিয়া গণ্য হইবে না এবং পরিস্থিতি স্বাভাবিক হওয়া মাত্র সেবা সচল হইবে।',
  },
  {
    id: 'comp-17',
    number: 17,
    section: 'COMPANY',
    category: 'AMENDMENTS',
    title: 'Policy Updates, Institutional Amendments & Non-Retroactivity',
    titleBn: 'নীতিমালা হালনাগাদ, সংশোধন ও পূর্ববর্তী চুক্তির সুরক্ষা',
    isMandatory: true,
    appliesToEmi: true,
    order: 17,
    content:
      '{COMPANY_NAME} may periodically update its general retail terms to reflect statutory tax changes, consumer guidelines, or operational improvements. Updated company terms become effective upon publication on the official ERP and website. Crucially, updates shall not retroactively alter the financial obligations, interest rates, or schedule of previously signed and accepted EMI contracts.',
    contentBn:
      'বাণিজ্যিক নিয়ম বা সরকারি বিধিমালার পরিবর্তনের সাথে সামঞ্জস্য রাখিতে {COMPANY_NAME} যেকোনো সময় সাধারণ শর্তাবলি হালনাগাদ করিতে পারে। তবে ইতিমধ্যে কার্যকর ও স্বাক্ষরিত কোনো কিস্তি চুক্তি বা ক্রয়ের আর্থিক শর্তাবলি কোনোক্রমেই একতরফাভাবে পরিবর্তন করা হইবে না।',
  },
  {
    id: 'comp-18',
    number: 18,
    section: 'COMPANY',
    category: 'IP',
    title: 'Intellectual Property, Trademarks & Content Rights',
    titleBn: 'বৌদ্ধিক সম্পত্তি, ট্রেডমার্ক ও কনটেন্ট স্বত্বাধিকার',
    isMandatory: true,
    appliesToEmi: true,
    order: 18,
    content:
      'The trade name "NEED ELECTRO", logo, corporate color schemes, slogan ("Trusted Electrical and Technological Solutions"), ERP portal software, product photographs, buying guides, and technical literature are proprietary intellectual property. Unauthorized commercial reproduction, impersonation, or brand infringement is strictly prohibited and subject to legal prosecution under the Trademark Act and Copyright laws of Bangladesh.',
    contentBn:
      '"NEED ELECTRO" নাম, ট্রেডমার্ক, লোগো, স্লোগান ("Trusted Electrical and Technological Solutions"), ইআরপি সফটওয়্যার ও ওয়েবসাইটের কনটেন্ট কোম্পানির নিজস্ব সম্পত্তি। বিনা অনুমতিতে এর অনুকরণ, অননুমোদিত ব্যবহার বা বাণিজ্যিক অপব্যবহার বাংলাদেশ ট্রেডমার্ক ও কপিরাইট আইনে আইনত দণ্ডনীয়।',
  },
  {
    id: 'comp-19',
    number: 19,
    section: 'COMPANY',
    category: 'GOVERNING_LAW',
    title: 'Governing Law, Jurisdiction & Territorial Compliance',
    titleBn: 'প্রযোজ্য আইন, আঞ্চলিক এখতিয়ার ও আইনি বৈধতা',
    isMandatory: true,
    appliesToEmi: true,
    order: 19,
    content:
      'All commercial dealings, sales contracts, hire-purchase agreements, and terms of service shall be governed by and construed in accordance with the laws of the People\'s Republic of Bangladesh, including the Contract Act 1872, Sale of Goods Act 1930, Consumer Rights Protection Act 2009, and Information and Communication Technology Act 2006. The competent civil courts of Moulvibazar / Sylhet Division shall hold territorial jurisdiction.',
    contentBn:
      'এই শর্তাবলি ও চুক্তি সংক্রান্ত যাবতীয় বিষয়াদি গণপ্রজাতন্ত্রী বাংলাদেশের প্রচলিত আইন (চুক্তি আইন ১৮৭২, পণ্য বিক্রয় আইন ১৯৩০, ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এবং আইসিটি আইন ২০০৬) দ্বারা পরিচালিত হইবে। কোনো আইনি বিরোধ নিষ্পত্তির ক্ষেত্রে মৌলভীবাজার / সিলেট বিভাগের উপযুক্ত আদালত আঞ্চলিক এখতিয়ারভুক্ত থাকিবে।',
  },
  {
    id: 'comp-20',
    number: 20,
    section: 'COMPANY',
    category: 'GENERAL',
    title: 'General Contractual Provisions, Precedence & Severability',
    titleBn: 'সাধারণ চুক্তিগত বিধান, অগ্রাধিকার ও পৃথকীকরণ নীতি',
    isMandatory: true,
    appliesToEmi: true,
    order: 20,
    content:
      'These General Terms & Conditions represent the standard institutional policies of {COMPANY_NAME}. Where a customer enters into a specific Hire-Purchase (EMI) Agreement, the customized financial figures and repayment terms of the EMI Agreement (Section B) shall supplement these terms. If any provision is deemed unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full legal force and effect.',
    contentBn:
      'এই সাধারণ শর্তাবলি {COMPANY_NAME}-এর মূল ব্যবসায়িক ভিত্তি। কোনো গ্রাহক যখন নির্দিষ্ট কিস্তি চুক্তিতে (ইএমআই) আবদ্ধ হন, তখন ইএমআই চুক্তিপত্রের আর্থিক বিবরণী ও তফসিল (বিভাগ খ) এই সাধারণ শর্তাবলির সহিত অবিচ্ছেদ্য অংশ হিসেবে গণ্য হইবে। কোনো একটি ধারা আইনের দৃষ্টিতে অকার্যকর ঘোষিত হইলেও অন্যান্য ধারাসমূহ সম্পূর্ণ বহাল থাকিবে।',
  },
];

// -------------------------------------------------------------
// SECTION B: 25 EMI-SPECIFIC TERMS & CONDITIONS (Bilingual)
// -------------------------------------------------------------
export const DEFAULT_25_EMI_CLAUSES: LegalClause[] = [
  {
    id: 'emi-1',
    number: 1,
    section: 'EMI',
    category: 'PARTIES',
    title: 'Parties to the Agreement & Formal Preamble',
    titleBn: 'চুক্তির পক্ষসমূহের পরিচয় ও প্রারম্ভিক ঘোষণা',
    isMandatory: true,
    appliesToEmi: true,
    order: 1,
    content:
      'This Hire-Purchase and Commercial Financing Agreement (the "Agreement", Contract No: {CONTRACT_NUMBER}) is entered into on {AGREEMENT_DATE} by and between {COMPANY_NAME}, having its principal sales and administrative center at {COMPANY_ADDRESS} (hereinafter referred to as the "Seller/Financier"), and {CUSTOMER_NAME}, National ID: {CUSTOMER_NID}, residing at {CUSTOMER_ADDRESS}, Contact: {CUSTOMER_PHONE} (hereinafter referred to as the "Customer/Hirer"). Where applicable, the Guarantor named herein joins as an unconditional guarantor of performance.',
    contentBn:
      'এই হায়ার-পারচেজ ও কিস্তি অর্থায়ন চুক্তি (চুক্তি নং: {CONTRACT_NUMBER}) {AGREEMENT_DATE} তারিখে {COMPANY_NAME}, প্রধান কার্যালয়: {COMPANY_ADDRESS} ("বিক্রেতা/অর্থায়নকারী") এবং {CUSTOMER_NAME}, জাতীয় পরিচয়পত্র: {CUSTOMER_NID}, ঠিকানা: {CUSTOMER_ADDRESS}, মোবাইল: {CUSTOMER_PHONE} ("ক্রেতা/গ্রাহক")-এর মধ্যে স্বাক্ষরিত হইল। প্রযোজ্য ক্ষেত্রে জামিনদার নিঃশর্ত নিশ্চয়তাদানকারী হিসেবে যুক্ত থাকিবেন।',
  },
  {
    id: 'emi-2',
    number: 2,
    section: 'EMI',
    category: 'OPERATIONAL',
    title: 'Product Description & Physical Serial Verification',
    titleBn: 'পণ্যের বিবরণ ও সিরিয়াল নম্বর যাচাই',
    isMandatory: true,
    appliesToEmi: true,
    order: 2,
    content:
      'The subject of this Agreement is one unit of genuine equipment: {PRODUCT_NAME}, Physical Serial Number / IMEI: {SERIAL_NUMBER}. The Customer acknowledges that the product has been inspected, tested, and found to be in complete working condition, brand new, with all standard accessories, charger, and manufacturer warranty documentation intact at the time of execution.',
    contentBn:
      'এই চুক্তির অধীন হস্তান্তরিত পণ্যটি হইলো: {PRODUCT_NAME}, সিরিয়াল নম্বর/IMEI: {SERIAL_NUMBER}। ক্রেতা স্বীকার করিতেছেন যে, পণ্যটি হস্তান্তরের পূর্বে যথাযথভাবে পরীক্ষা করা হইয়াছে এবং উহা ত্রুটিহীন, নতুন এবং প্রয়োজনীয় চার্জার ও এক্সেসরিজসহ সক্রিয় অবস্থায় প্রাপ্ত হইয়াছেন।',
  },
  {
    id: 'emi-3',
    number: 3,
    section: 'EMI',
    category: 'FINANCIAL',
    title: 'Contract Price & Transparent Financial Structure',
    titleBn: 'চুক্তিমূল্য ও মূল্য কাঠামো',
    isMandatory: true,
    appliesToEmi: true,
    order: 3,
    content:
      'The total agreed contract price for the equipment is ৳{CONTRACT_PRICE} (Bangladeshi Taka). This contract price comprises the agreed selling price, all documented discounts, eligible statutory taxes/VAT where applicable, and approved administrative charges expressly disclosed in the financial summary.',
    contentBn:
      'পণ্যটির সর্বমোট চুক্তিমূল্য নির্ধারিত হইয়াছে ৳{CONTRACT_PRICE} (বাংলাদেশী টাকা)। এই মূল্যের মধ্যে প্রযোজ্য ছাড়, সরকার নির্ধারিত কর/ভ্যাট এবং অনুমোদিত প্রশাসনিক ও ডকুমেন্টিং ফি অন্তর্ভুক্ত রহিয়াছে, যাহা আর্থিক বিবরণীতে সুস্পষ্টভাবে ব্যক্ত হইয়াছে।',
  },
  {
    id: 'emi-4',
    number: 4,
    section: 'EMI',
    category: 'FINANCIAL',
    title: 'Down Payment Terms & Receipt Verification',
    titleBn: 'ডাউন পেমেন্টের শর্তাবলি ও রসিদ যাচাই',
    isMandatory: true,
    appliesToEmi: true,
    order: 4,
    content:
      'The Customer agrees to pay an initial down payment of ৳{DOWN_PAYMENT} prior to or upon physical delivery of the equipment. A valid computerized payment receipt or electronic transaction reference issued by {COMPANY_NAME} is mandatory before the down payment is recorded as satisfied. Unverified transaction references or pending payment submissions do not constitute receipt.',
    contentBn:
      'ক্রেতা পণ্য গ্রহণের পূর্বে বা হস্তান্তরকালে এককালীন ৳{DOWN_PAYMENT} টাকা ডাউন পেমেন্ট পরিশোধ করিতে সম্মত হইলেন। {COMPANY_NAME} কর্তৃক ইস্যুকৃত কম্পিউটারাইজড ক্যাশ মেমো বা ডিজিটাল ট্রানজেকশন রসিদ ছাড়া কোনো পেমেন্ট পরিশোধিত বলিয়া গণ্য হইবে না।',
  },
  {
    id: 'emi-5',
    number: 5,
    section: 'EMI',
    category: 'FINANCIAL',
    title: 'Financed Principal & Repayment Obligation',
    titleBn: 'অর্থায়িত মূল অর্থ ও পরিশোধের দায়বদ্ধতা',
    isMandatory: true,
    appliesToEmi: true,
    order: 5,
    content:
      'Following full deduction of the verified down payment from the contract price, the remaining financed principal balance is ৳{FINANCED_AMOUNT}. The Customer undertakes an absolute, irrevocable obligation to repay this principal balance along with any contractually agreed financing charges strictly in accordance with the Authoritative Repayment Schedule.',
    contentBn:
      'চুক্তিমূল্য হইতে ডাউন পেমেন্ট বাদ দেওয়ার পর অবশিষ্ট অর্থায়িত মূল পরিমাণ (Financed Principal) দাঁড়ায় ৳{FINANCED_AMOUNT} টাকা। ক্রেতা এই অর্থ নির্ধারিত কিস্তি তফসিলে উল্লিখিত শর্তানুযায়ী পরিশোধ করিতে আইনত বাধ্য থাকিবেন।',
  },
  {
    id: 'emi-6',
    number: 6,
    section: 'EMI',
    category: 'FINANCIAL',
    title: 'Financing Rate & Interest Addition into Monthly Installments',
    titleBn: 'অর্থায়ন চার্জ ও কিস্তির সহিত সুদের সমন্বয়',
    isMandatory: true,
    appliesToEmi: true,
    order: 6,
    content:
      'This agreement is executed under a {INTEREST_RATE}% financing scheme ({INTEREST_METHOD}). In compliance with transparent retail practice, the total agreed interest amount is divided evenly across the tenure and explicitly added into each monthly installment, ensuring full clarity of monthly principal and monthly interest portions throughout the loan duration.',
    contentBn:
      'এই চুক্তিটি {INTEREST_RATE}% অর্থায়ন হারে ({INTEREST_METHOD}) পরিচালিত হইতেছে। স্বচ্ছ বাণিজ্যিক নিয়মানুযায়ী নির্ধারিত মোট লাভ বা সুদের অংশটি মাসিক কিস্তির মধ্যে সুষমভাবে বণ্টন করিয়া মূল কিস্তির সহিত যুক্ত করা হইয়াছে।',
  },
  {
    id: 'emi-7',
    number: 7,
    section: 'EMI',
    category: 'SCHEDULE',
    title: 'Installment Tenure & Reconciled Repayment Schedule',
    titleBn: 'কিস্তির মেয়াদ ও মাসিক পরিশোধ সূচি',
    isMandatory: true,
    appliesToEmi: true,
    order: 7,
    content:
      'The repayment obligation shall be satisfied across {DURATION_MONTHS} consecutive monthly installments. Each regular monthly installment is ৳{MONTHLY_INSTALLMENT}, with the first installment maturing on {FIRST_DUE_DATE} and the final maturity date falling on {FINAL_DUE_DATE}. The final installment may reconcile minor integer rounding remainders so the total repayments reconcile to exact balance.',
    contentBn:
      'ঋণ পরিশোধের মেয়াদ সর্বমোট {DURATION_MONTHS} টি মাসিক কিস্তিতে বিভক্ত। প্রতি নিয়মিত মাসিক কিস্তির পরিমাণ ৳{MONTHLY_INSTALLMENT} টাকা। প্রথম কিস্তির পরিশোধের তারিখ {FIRST_DUE_DATE} এবং সর্বশেষ কিস্তির পরিপক্বতা {FINAL_DUE_DATE} তারিখে নির্ধারিত।',
  },
  {
    id: 'emi-8',
    number: 8,
    section: 'EMI',
    category: 'FINANCIAL',
    title: 'Authorized Payment Channels & Verification Protocol',
    titleBn: 'অনুমোদিত পেমেন্ট চ্যানেল ও যাচাইকরণ পদ্ধতি',
    isMandatory: true,
    appliesToEmi: true,
    order: 8,
    content:
      'All installment payments must be remitted exclusively to the verified accounts of {COMPANY_NAME}: official showroom cash counters, verified bKash/Nagad merchant accounts, or designated commercial bank accounts. Payments must reference the Contract Number {CONTRACT_NUMBER}. Payments made to unauthorized individuals or unverified accounts shall not be credited toward the balance.',
    contentBn:
      'সকল কিস্তি পরিশোধ শুধুমাত্র {COMPANY_NAME}-এর অফিসিয়াল শোরুম কাউন্টারে অথবা অনুমোদিত ব্যাংক/বিকাশ/নগদ মার্চেন্ট অ্যাকাউন্টে চুক্তি নম্বর {CONTRACT_NUMBER} উল্লেখপূর্বক করিতে হইবে। কোনো ব্যক্তির ব্যক্তিগত অ্যাকাউন্টে অর্থ প্রদান করিলে তাহা গ্রহণযোগ্য হইবে না।',
  },
  {
    id: 'emi-9',
    number: 9,
    section: 'EMI',
    category: 'FINANCIAL',
    title: 'Grace Period & Contractual Overdue Late Surcharge',
    titleBn: 'গ্রেস পিরিয়ড ও বিলম্বিত কিস্তির জরিমানা নীতিমালা',
    isMandatory: true,
    appliesToEmi: true,
    order: 9,
    content:
      'A grace period of {GRACE_PERIOD_DAYS} calendar days from each monthly due date is granted to the Customer. If payment is not received upon expiration of the grace period, a documented late surcharge of ৳{LATE_FEE_PER_DAY} per calendar day of delay may be applied to cover administrative costs and debt management.',
    contentBn:
      'প্রতিটি কিস্তির জন্য নির্ধারিত শেষ তারিখ হইতে {GRACE_PERIOD_DAYS} দিন পর্যন্ত গ্রেস পিরিয়ড বা অতিরিক্ত সময় দেওয়া হইবে। গ্রেস পিরিয়ড অতিক্রমের পর বকেয়া থাকা অবস্থায় প্রতিদিন ৳{LATE_FEE_PER_DAY} টাকা হারে বিলম্ব ফি বা লেট ফি প্রযোজ্য হইবে।',
  },
  {
    id: 'emi-10',
    number: 10,
    section: 'EMI',
    category: 'LEGAL',
    title: 'Retention of Legal Title & Beneficial Ownership Transfer',
    titleBn: 'মালিকানা স্বত্ব সংরক্ষণ ও চূড়ান্ত হস্তান্তরের শর্ত',
    isMandatory: true,
    appliesToEmi: true,
    order: 10,
    content:
      'Legal title and ownership of the equipment remain exclusively with {COMPANY_NAME} until all installments, penalties, and balance obligations under this Agreement are settled in full. Beneficial possession is granted to the Customer as a bailee and hirer. Full legal ownership vests in the Customer automatically upon issuance of a formal Certificate of Full Settlement.',
    contentBn:
      'চুক্তির অধীন সকল কিস্তি ও পাওনা সম্পূর্ণ পরিশোধ না হওয়া পর্যন্ত পণ্যের আইনগত পূর্ণ মালিকানা {COMPANY_NAME}-এর নিকট সংরক্ষিত থাকিবে। গ্রাহক কেবল পণ্যটির ব্যবহারকারী হিসেবে গণ্য হইবেন। সকল কিস্তি সফলভাবে পরিশোধের পরই তিনি পণ্যটির একক মালিক হইবেন।',
  },
  {
    id: 'emi-11',
    number: 11,
    section: 'EMI',
    category: 'FINANCIAL',
    title: 'Early Settlement Policy & Voluntary Prepayment',
    titleBn: 'মেয়াদপূর্ব এককালীন পরিশোধ ও সেটেলমেন্ট সুবিধা',
    isMandatory: false,
    appliesToEmi: true,
    order: 11,
    content:
      'The Customer retains the right to settle the remaining financed principal balance ahead of the agreed tenure. Upon verified full prepayment, any unaccrued future financing charges shall be recalculated in good faith, and an official No-Objection Certificate (NOC) and ownership release shall be issued within two (2) working days.',
    contentBn:
      'গ্রাহক যেকোনো সময় মেয়াদের পূর্বে অবশিষ্ট সকল কিস্তির মূল অর্থ এককালীন পরিশোধ করিতে পারিবেন। মেয়াদপূর্ব পরিশোধের ক্ষেত্রে অনাদায়ী ভবিষৎ মুনাফা মওকুফপূর্বক কোম্পানি দুই (২) কার্যদিবসের মধ্যে অনাপত্তিপত্র (NOC) প্রদান করিবে।',
  },
  {
    id: 'emi-12',
    number: 12,
    section: 'EMI',
    category: 'OPERATIONAL',
    title: 'Equipment Maintenance, Loss Risk & Prohibition of Alienation',
    titleBn: 'যন্ত্রপাতির রক্ষণাবেক্ষণ ও হস্তান্তর বা বন্ধক নিষেদ্ধকরণ',
    isMandatory: true,
    appliesToEmi: true,
    order: 12,
    content:
      'The Customer assumes all risk of physical damage, theft, loss, or degradation of the equipment upon taking delivery. The Customer covenants to maintain the equipment in good working order and agrees strictly not to sell, pledge, pawn, mortgage, or transfer possession of the product to any third party until full ownership is transferred.',
    contentBn:
      'পণ্য গ্রহণের পর উহার যেকোনো ক্ষতি, চুরি বা নষ্ট হইবার সকল ঝুঁকি গ্রাহকের উপর বর্তাইবে। কিস্তি সম্পূর্ণ পরিশোধ না হওয়া পর্যন্ত পণ্যটি অন্য কারো নিকট বিক্রয়, বন্ধক বা হস্তান্তর করা সম্পূর্ণ বেআইনি ও চুক্তিভঙ্গ বলিয়া গণ্য হইবে।',
  },
  {
    id: 'emi-13',
    number: 13,
    section: 'EMI',
    category: 'LEGAL',
    title: 'Events of Default & Legal Repossession Rights',
    titleBn: 'চুক্তিভঙ্গের ক্ষেত্রসমূহ ও পণ্য প্রত্যাহারের অধিকার',
    isMandatory: true,
    appliesToEmi: true,
    order: 13,
    content:
      'An Event of Default occurs if: (a) two consecutive installments remain unpaid, (b) the Customer fails to respond to formal notices for thirty (30) days, or (c) fraudulent identity or asset alienation is identified. Upon default, {COMPANY_NAME} reserves the statutory right under Bangladesh law to demand immediate balance acceleration and repossess the equipment upon due notice.',
    contentBn:
      'যদি গ্রাহক পরপর দুটি কিস্তি পরিশোধে ব্যর্থ হন অথবা ৩০ দিন পর্যন্ত যোগাযোগ বিচ্ছিন্ন রাখেন, তবে তাহা চুক্তিভঙ্গ হিসেবে গণ্য হইবে। এই অবস্থায় {COMPANY_NAME} আইনানুগ নোটিশ প্রদানের মাধ্যমে অবশিষ্ট সম্পূর্ণ অর্থ তাৎক্ষণিক দাবি এবং পণ্যটি প্রত্যাহার (Repossess) করিবার অধিকার রাখে।',
  },
  {
    id: 'emi-14',
    number: 14,
    section: 'EMI',
    category: 'PARTIES',
    title: 'Guarantor Undertaking & Joint Several Liability',
    titleBn: 'জামিনদারের অঙ্গীকার ও যৌথ দায়বদ্ধতা',
    isMandatory: false,
    appliesToEmi: true,
    order: 14,
    content:
      'The Guarantor identified in this Agreement unconditionally guarantees the prompt, faithful repayment of all installments and liabilities incurred by the Customer. The Guarantor agrees to be jointly and severally liable with the Customer, and the Company may seek satisfaction from the Guarantor if the Customer defaults.',
    contentBn:
      'চুক্তিতে উল্লেখিত জামিনদার গ্রাহকের সকল কিস্তি ও পাওনা পরিশোধে নিঃশর্ত জামিনদার হইলেন। গ্রাহক কিস্তি পরিশোধে ব্যর্থ হইলে জামিনদার যৌথভাবে উক্ত বকেয়া পরিশোধ করিতে আইনত দায়ী থাকিবেন।',
  },
  {
    id: 'emi-15',
    number: 15,
    section: 'EMI',
    category: 'LEGAL',
    title: 'Customer Representations & Authentic NID Verification',
    titleBn: 'গ্রাহকের সত্যতা ঘোষণা ও জাতীয় পরিচয়পত্র যাচাই',
    isMandatory: true,
    appliesToEmi: true,
    order: 15,
    content:
      'The Customer confirms that all information provided—including National ID (NID), physical residential address, employment or business particulars, and emergency phone numbers—is authentic, valid, and legally binding. The Customer warrants full legal capacity to enter into binding credit commitments under Bangladesh law.',
    contentBn:
      'গ্রাহক প্রত্যয়ন করিতেছেন যে, তাহার প্রদত্ত জাতীয় পরিচয়পত্র (NID), স্থায়ী ও বর্তমান ঠিকানা এবং যোগাযোগের নম্বর সম্পূর্ণ সঠিক ও নির্ভুল। ভুল বা ভুয়া তথ্য প্রদান বাংলাদেশের প্রচলিত আইনে ফৌজদারি অপরাধ বলিয়া গণ্য হইবে।',
  },
  {
    id: 'emi-16',
    number: 16,
    section: 'EMI',
    category: 'LEGAL',
    title: 'Electronic Affirmative Acceptance & Admissibility',
    titleBn: 'ডিজিটাল সম্মতি ও আইনগত গ্রহণযোগ্যতা',
    isMandatory: true,
    appliesToEmi: true,
    order: 16,
    content:
      'Execution of this Agreement via electronic affirmative check, biometric verification, digital signature, or physical execution constitutes valid, binding assent under the Information and Communication Technology Act 2006 of Bangladesh and shall be legally admissible as conclusive evidence of debt obligation.',
    contentBn:
      'তথ্য ও যোগাযোগ প্রযুক্তি আইন ২০০৬ অনুযায়ী ডিজিটাল স্বীকৃতি, স্বাক্ষর বা ইলেকট্রনিক সম্মতি আইনত বৈধ চুক্তি হিসেবে গণ্য হইবে এবং দেশের যেকোনো আদালতে প্রমাণ্য দলিল হিসেবে গণ্য হইবে।',
  },
  {
    id: 'emi-17',
    number: 17,
    section: 'EMI',
    category: 'OPERATIONAL',
    title: 'Data Protection, Regulatory Compliance & Credit Reporting',
    titleBn: 'তথ্য সংরক্ষণ, গোপনীয়তা ও ক্রেডিট রেকর্ডিং',
    isMandatory: true,
    appliesToEmi: true,
    order: 17,
    content:
      '{COMPANY_NAME} safeguards customer financial records in compliance with applicable confidentiality standards. The Customer consents to lawful recording of payment performance, which may be referenced for future credit assessments, verified institutional references, or judicial recovery proceedings.',
    contentBn:
      'কোম্পানি গ্রাহকের আর্থিক তথ্যের গোপনীয়তা সংরক্ষণ করে। তবে নিয়মিত কিস্তি পরিশোধ সংক্রান্ত তথ্য ভবিষৎ ক্রেডিট স্কোরিং অথবা আইনগত প্রয়োজনে সংশ্লিষ্ট বৈধ কর্তৃপক্ষের নিকট উপস্থাপন করিবার সম্মতি গ্রাহক প্রদান করিলেন।',
  },
  {
    id: 'emi-18',
    number: 18,
    section: 'EMI',
    category: 'LEGAL',
    title: 'Contract Amendments & Structured Restructuring Protocol',
    titleBn: 'চুক্তি সংশোধন ও কিস্তি পুনর্গঠন নীতিমালা',
    isMandatory: true,
    appliesToEmi: true,
    order: 18,
    content:
      'Any modification to due dates, installment amounts, or restructuring of tenure must be formalized through an authorized electronic amendment in the ERP system with recorded administrative audit notes. Verified historical payments remain immutable and cannot be deleted or overwritten.',
    contentBn:
      'কিস্তির তারিখ বা পরিমাণে কোনো পরিবর্তন আনিতে হইলে অফিশিয়াল ইআরপি সিস্টেমে যথাযথ অনুমোদনের মাধ্যমে সংশোধন করিতে হইবে। পূর্বের পরিশোধিত কিস্তির রেকর্ড সম্পূর্ণ অপরিবর্তনীয় ও সুরক্ষিত থাকিবে।',
  },
  {
    id: 'emi-19',
    number: 19,
    section: 'EMI',
    category: 'LEGAL',
    title: 'Statutory Consumer Safeguards & Mandatory Rights',
    titleBn: 'ভোক্তা অধিকার সুরক্ষা ও বিধিবদ্ধ অধিকারসমূহ',
    isMandatory: true,
    appliesToEmi: true,
    order: 19,
    content:
      'Nothing in this Hire-Purchase Agreement shall derogate from mandatory consumer rights protected under the Consumer Rights Protection Act 2009 of Bangladesh. The Customer retains full entitlement to transparent transaction statements, genuine equipment, and manufacturer-specified warranty service.',
    contentBn:
      'এই চুক্তির কোনো শর্তই ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ দ্বারা প্রদত্ত মৌলিক অধিকার ক্ষুণ্ন করিবে না। গ্রাহক যেকোনো সময় তাহার পরিশোধের সঠিক হিসাব ও রসিদ প্রাপ্তির পূর্ণ অধিকারী।',
  },
  {
    id: 'emi-20',
    number: 20,
    section: 'EMI',
    category: 'OPERATIONAL',
    title: 'Force Majeure & Extraordinary Disruption Safeguards',
    titleBn: 'অপ্রত্যাশিত প্রাকৃতিক দুর্যোগ ও জরুরি পরিস্থিতি',
    isMandatory: true,
    appliesToEmi: true,
    order: 20,
    content:
      'In the event of nationwide civil disruption, catastrophic floods, or declared state emergencies rendering bank transfers impossible, late fees shall be frozen for the duration of the impossibility upon formal notification to the Company.',
    contentBn:
      'জাতীয় দুর্যোগ, বন্যা বা ব্যাংকিং অচলাবস্থার মতো পরিস্থিতির কারণে সাময়িকভাবে কিস্তি প্রদানে বিঘ্ন ঘটিলে কোম্পানিকে তাৎক্ষণিক অবহিতকরণ সাপেক্ষে অতিরিক্ত জরিমানা মওকুফ বিবেচনা করা হইবে।',
  },
  {
    id: 'emi-21',
    number: 21,
    section: 'EMI',
    category: 'LEGAL',
    title: 'Dispute Resolution, Conciliation & Jurisdiction',
    titleBn: 'বিরোধ নিষ্পত্তি, সমঝোতা ও আঞ্চলিক এখতিয়ার',
    isMandatory: true,
    appliesToEmi: true,
    order: 21,
    content:
      'The parties agree to resolve any dispute arising from this Agreement first through good-faith mutual conciliation. Failing amicable resolution within thirty (30) days, the competent civil courts of Moulvibazar / Sylhet Division shall hold exclusive territorial jurisdiction.',
    contentBn:
      'চুক্তি সংক্রান্ত যেকোনো বিরোধ প্রথমে দ্বিপাক্ষিক আলোচনা ও সমঝোতার মাধ্যমে নিরসনের চেষ্টা করা হইবে। ব্যর্থতায় মৌলভীবাজার / সিলেট বিভাগের সংশ্লিষ্ট উপযুক্ত আদালতের এখতিয়ার বলবৎ হইবে।',
  },
  {
    id: 'emi-22',
    number: 22,
    section: 'EMI',
    category: 'LEGAL',
    title: 'Severability, Entire Agreement & Precedence',
    titleBn: 'চুক্তির অখণ্ডতা, পৃথকীকরণ নীতি ও প্রাধান্য',
    isMandatory: true,
    appliesToEmi: true,
    order: 22,
    content:
      'This Agreement constitutes the entire agreement between the parties concerning the subject equipment. If any provision is deemed unenforceable by a court of law, all remaining clauses shall remain in full force and effect.',
    contentBn:
      'এই চুক্তিপত্রটি উভয় পক্ষের মধ্যে চূড়ান্ত ও সম্পূর্ণ সমঝোতা হিসেবে গণ্য। কোনো নির্দিষ্ট ধারা আদালত কর্তৃক অকার্যকর ঘোষিত হইলেও চুক্তির অবশিষ্ট সকল ধারা সম্পূর্ণরূপে কার্যকর থাকিবে।',
  },
  {
    id: 'emi-23',
    number: 23,
    section: 'EMI',
    category: 'OPERATIONAL',
    title: 'Software Attribution & Technological Credit',
    titleBn: 'সফটওয়্যার ডেভেলপমেন্ট ও প্রযুক্তি স্বত্বাধিকার',
    isMandatory: true,
    appliesToEmi: true,
    order: 23,
    content:
      'This Enterprise Management & EMI Contract Automation System is engineered and maintained by AMDADS GROUP. Mandatory credit: "Software Developed By AMDADS GROUP". All system interfaces and intellectual property are protected under copyright.',
    contentBn:
      'এই ইআরপি ও চুক্তি অটোমেশন সফটওয়্যারটি AMDADS GROUP কর্তৃক প্রস্তুতকৃত ও পরিচালিত। ক্রেডিট: "Software Developed By AMDADS GROUP"।',
  },
  {
    id: 'emi-24',
    number: 24,
    section: 'EMI',
    category: 'OPERATIONAL',
    title: 'Warranty Support & Technical After-Sales on Financed Goods',
    titleBn: 'কিস্তিতে ক্রয়কৃত পণ্যের ওয়ারেন্টি ও আফটার-সেলস সেবা',
    isMandatory: true,
    appliesToEmi: true,
    order: 24,
    content:
      'Financed equipment enjoys complete manufacturer or showroom service warranty under the same terms as regular cash sales, contingent upon the customer maintaining active, non-defaulted contract status. Warranty service shall not be withheld due to active EMI schedule unless the account is in formal default.',
    contentBn:
      'নিয়মিত কিস্তি সচল থাকা সাপেক্ষে পণ্যটি সাধারণ নগদ বিক্রয়ের ন্যায় পূর্ণ ওয়ারেন্টি ও আফটার-সেলস সার্ভিস সুবিধা প্রাপ্ত হইবে। কিস্তিতে ক্রয়ের কারণে ওয়ারেন্টি সেবা কোনোক্রমেই ব্যাহত হইবে না।',
  },
  {
    id: 'emi-25',
    number: 25,
    section: 'EMI',
    category: 'LEGAL',
    title: 'Mutual Affirmation, Execution & Counterparts',
    titleBn: 'উভয় পক্ষের চূড়ান্ত সম্মতি ও চুক্তি সম্পাদন',
    isMandatory: true,
    appliesToEmi: true,
    order: 25,
    content:
      'The parties declare that they have carefully read, fully understood, and affirmatively agreed to every clause and financial figure stated in this Agreement. Executed in duplicate originals with one counterpart retained by {COMPANY_NAME} and one delivered to the Customer.',
    contentBn:
      'উভয় পক্ষ স্বীকার করিতেছেন যে, তাহারা চুক্তির প্রতিটি শর্ত ও আর্থিক বিবরণী মনোযোগ সহকারে পাঠ করিয়া ও বুঝিয়া সানন্দে স্বাক্ষর করিয়াছেন। এই চুক্তির একটি কপি {COMPANY_NAME}-এ এবং অপরটি গ্রাহকের নিকট সংরক্ষিত থাকিবে।',
  },
];

// -------------------------------------------------------------
// DEFAULT INITIAL PUBLISHED VERSION
// -------------------------------------------------------------
export const INITIAL_LEGAL_TEMPLATE_VERSION: LegalTemplateVersion = {
  versionId: 'ver-standard-v1',
  versionNumber: 'v1.0',
  title: 'NEED ELECTRO Master Institutional Terms & Conditions',
  description: 'Complete standard legal and commercial terms covering retail sales, warranty, privacy, and hire-purchase installment operations.',
  status: 'PUBLISHED',
  effectiveDate: '2026-01-01',
  publishedAt: new Date().toISOString(),
  publishedBy: 'System Super Administrator',
  author: 'NEED ELECTRO Legal & Compliance Department',
  notes: 'Authoritative baseline standard reviewed in accordance with Bangladesh Contract Act 1872 and Consumer Rights Protection Act 2009.',
  companyClauses: DEFAULT_20_COMPANY_CLAUSES,
  emiClauses: DEFAULT_25_EMI_CLAUSES,
};

// -------------------------------------------------------------
// INTERPOLATION & COMBINATION ENGINE
// -------------------------------------------------------------
export function interpolateClauseText(template: string, ctx: ContractInterpolationContext): string {
  if (!template) return '';
  return template
    .replace(/{CUSTOMER_NAME}/g, ctx.customerName || 'N/A')
    .replace(/{CUSTOMER_PHONE}/g, ctx.customerPhone || 'N/A')
    .replace(/{CUSTOMER_ADDRESS}/g, ctx.customerAddress || 'Showroom Address')
    .replace(/{CUSTOMER_NID}/g, ctx.customerNid || 'Verified NID')
    .replace(/{GUARANTOR_NAME}/g, ctx.guarantorName || 'N/A')
    .replace(/{GUARANTOR_PHONE}/g, ctx.guarantorPhone || 'N/A')
    .replace(/{GUARANTOR_RELATION}/g, ctx.guarantorRelation || 'N/A')
    .replace(/{GUARANTOR_NID}/g, ctx.guarantorNid || 'N/A')
    .replace(/{PRODUCT_NAME}/g, ctx.productName || 'Equipment Unit')
    .replace(/{SERIAL_NUMBER}/g, ctx.serialNumber || 'Pending Assignment')
    .replace(/{CONTRACT_NUMBER}/g, ctx.contractNumber || 'EMI-PENDING')
    .replace(/{AGREEMENT_DATE}/g, ctx.agreementDate || new Date().toISOString().split('T')[0])
    .replace(/{CONTRACT_PRICE}/g, (ctx.contractPrice || 0).toLocaleString())
    .replace(/{DOWN_PAYMENT}/g, (ctx.downPayment || 0).toLocaleString())
    .replace(/{FINANCED_AMOUNT}/g, (ctx.financedAmount || 0).toLocaleString())
    .replace(/{INTEREST_RATE}/g, ctx.isInterestFree ? '0% Interest-Free' : `${ctx.interestRate}%`)
    .replace(/{INTEREST_METHOD}/g, ctx.interestMethod || 'Flat Calculation')
    .replace(/{DURATION_MONTHS}/g, String(ctx.durationMonths || 6))
    .replace(/{MONTHLY_INSTALLMENT}/g, (ctx.monthlyInstallment || 0).toLocaleString())
    .replace(/{FINAL_INSTALLMENT}/g, (ctx.finalInstallment || 0).toLocaleString())
    .replace(/{FIRST_DUE_DATE}/g, ctx.firstDueDate || '1st Next Month')
    .replace(/{FINAL_DUE_DATE}/g, ctx.finalDueDate || 'Maturity Date')
    .replace(/{GRACE_PERIOD_DAYS}/g, String(ctx.gracePeriodDays || 5))
    .replace(/{LATE_FEE_PER_DAY}/g, String(ctx.lateFeePerDay || 50))
    .replace(/{COMPANY_NAME}/g, ctx.companyName || 'NEED ELECTRO')
    .replace(/{COMPANY_PHONE}/g, ctx.companyPhone || '+880 1733-983752')
    .replace(/{COMPANY_ADDRESS}/g, ctx.companyAddress || 'Shop#5, MR Plaza, Kusumbag, Moulvibazar, Sylhet, Bangladesh')
    .replace(/{COMPANY_EMAIL}/g, ctx.companyEmail || 'info.needelectro@gmail.com');
}

/**
 * Returns combined clauses for a contract:
 * Part 1: Company General Terms (Section A) where appliesToEmi === true
 * Part 2: EMI-Specific Terms (Section B)
 * Part 3: Custom Deal-Specific Clauses (Section C)
 */
export function getCombinedContractClauses(
  companyClauses: LegalClause[] = DEFAULT_20_COMPANY_CLAUSES,
  emiClauses: LegalClause[] = DEFAULT_25_EMI_CLAUSES,
  customClauses: LegalClause[] = []
): {
  sectionA: LegalClause[];
  sectionB: LegalClause[];
  sectionC: LegalClause[];
  allClauses: LegalClause[];
} {
  const sectionA = companyClauses.filter(c => c.appliesToEmi !== false);
  const sectionB = emiClauses;
  const sectionC = customClauses;

  let counter = 1;
  const allClauses: LegalClause[] = [
    ...sectionA.map(c => ({ ...c, section: 'COMPANY' as const, number: counter++ })),
    ...sectionB.map(c => ({ ...c, section: 'EMI' as const, number: counter++ })),
    ...sectionC.map(c => ({ ...c, section: 'CUSTOM' as const, number: counter++ })),
  ];

  return { sectionA, sectionB, sectionC, allClauses };
}
