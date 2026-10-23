// NEED ELECTRO ERP — EMI Contract 25 Standard Terms & Conditions Definition & Interpolation Engine
// Compliant with Bangladesh Law guidelines and Hire-Purchase commercial conventions.

export interface EMIContractClause {
  id: string;
  number: number;
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  isMandatory: boolean;
  order: number;
  category: 'PARTIES' | 'FINANCIAL' | 'SCHEDULE' | 'LEGAL' | 'OPERATIONAL' | 'CUSTOM';
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
}

export const DEFAULT_25_EMI_CLAUSES: EMIContractClause[] = [
  {
    id: 'clause-1',
    number: 1,
    title: 'Parties to the Agreement',
    titleBn: 'চুক্তির পক্ষসমূহের পরিচয়',
    category: 'PARTIES',
    isMandatory: true,
    order: 1,
    content:
      'This Hire-Purchase and Commercial Financing Agreement (the "Agreement") is entered into on {AGREEMENT_DATE} by and between {COMPANY_NAME}, having its principal sales and administrative center at {COMPANY_ADDRESS} (hereinafter referred to as the "Seller/Financier"), and {CUSTOMER_NAME}, National ID: {CUSTOMER_NID}, residing at {CUSTOMER_ADDRESS}, Contact: {CUSTOMER_PHONE} (hereinafter referred to as the "Customer/Hirer"). Where applicable, the Guarantor named herein joins as an unconditional guarantor of performance.',
    contentBn:
      'এই হায়ার-পারচেজ ও কিস্তি অর্থায়ন চুক্তি (চুক্তি নং: {CONTRACT_NUMBER}) {AGREEMENT_DATE} তারিখে {COMPANY_NAME}, প্রধান কার্যালয়: {COMPANY_ADDRESS} ("বিক্রেতা/অর্থায়নকারী") এবং {CUSTOMER_NAME}, জাতীয় পরিচয়পত্র: {CUSTOMER_NID}, ঠিকানা: {CUSTOMER_ADDRESS}, মোবাইল: {CUSTOMER_PHONE} ("ক্রেতা/গ্রাহক")-এর মধ্যে স্বাক্ষরিত হইল। প্রযোজ্য ক্ষেত্রে জামিনদার নিঃশর্ত নিশ্চয়তাদানকারী হিসেবে যুক্ত থাকিবেন।',
  },
  {
    id: 'clause-2',
    number: 2,
    title: 'Product Description & Serial Verification',
    titleBn: 'পণ্যের বিবরণ ও সিরিয়াল নম্বর যাচাই',
    category: 'OPERATIONAL',
    isMandatory: true,
    order: 2,
    content:
      'The subject of this Agreement is one unit of genuine equipment: {PRODUCT_NAME}, Physical Serial Number / IMEI: {SERIAL_NUMBER}. The Customer acknowledges that the product has been inspected, tested, and found to be in complete working condition, brand new, with all standard accessories, charger, and manufacturer warranty documentation intact at the time of execution.',
    contentBn:
      'এই চুক্তির অধীন হস্তান্তরিত পণ্যটি হইলো: {PRODUCT_NAME}, সিরিয়াল নম্বর/IMEI: {SERIAL_NUMBER}। ক্রেতা স্বীকার করিতেছেন যে, পণ্যটি হস্তান্তরের পূর্বে যথাযথভাবে পরীক্ষা করা হইয়াছে এবং উহা ত্রুটিহীন, নতুন এবং প্রয়োজনীয় চার্জার ও এক্সেসরিজসহ সক্রিয় অবস্থায় প্রাপ্ত হইয়াছেন।',
  },
  {
    id: 'clause-3',
    number: 3,
    title: 'Contract Price & Price Structure',
    titleBn: 'চুক্তিমূল্য ও মূল্য কাঠামো',
    category: 'FINANCIAL',
    isMandatory: true,
    order: 3,
    content:
      'The total agreed contract price for the equipment is ৳{CONTRACT_PRICE} (Bangladeshi Taka). This contract price comprises the agreed selling price, all documented discounts, eligible statutory taxes/VAT where applicable, and approved administrative charges expressly disclosed in the financial summary.',
    contentBn:
      'পণ্যটির সর্বমোট চুক্তিমূল্য নির্ধারিত হইয়াছে ৳{CONTRACT_PRICE} (বাংলাদেশী টাকা)। এই মূল্যের মধ্যে প্রযোজ্য ছাড়, সরকার নির্ধারিত কর/ভ্যাট এবং অনুমোদিত প্রশাসনিক ও ডকুমেন্টিং ফি অন্তর্ভুক্ত রহিয়াছে, যাহা আর্থিক বিবরণীতে সুস্পষ্টভাবে ব্যক্ত হইয়াছে।',
  },
  {
    id: 'clause-4',
    number: 4,
    title: 'Down Payment Terms & Receipt Verification',
    titleBn: 'ডাউন পেমেন্টের শর্তাবলি ও রসিদ যাচাই',
    category: 'FINANCIAL',
    isMandatory: true,
    order: 4,
    content:
      'The Customer agrees to pay an initial down payment of ৳{DOWN_PAYMENT} prior to or upon physical delivery of the equipment. A valid computerized payment receipt or electronic transaction reference issued by {COMPANY_NAME} is mandatory before the down payment is recorded as satisfied. Unverified transaction references or pending payment submissions do not constitute receipt.',
    contentBn:
      'ক্রেতা পণ্য গ্রহণের পূর্বে বা হস্তান্তরকালে এককালীন ৳{DOWN_PAYMENT} টাকা ডাউন পেমেন্ট পরিশোধ করিতে সম্মত হইলেন। {COMPANY_NAME} কর্তৃক ইস্যুকৃত কম্পিউটারাইজড ক্যাশ মেমো বা ডিজিটাল ট্রানজেকশন রসিদ ছাড়া কোনো পেমেন্ট পরিশোধিত বলিয়া গণ্য হইবে না।',
  },
  {
    id: 'clause-5',
    number: 5,
    title: 'Financed Principal Amount',
    titleBn: 'অর্থায়নকৃত মূল টাকার পরিমাণ',
    category: 'FINANCIAL',
    isMandatory: true,
    order: 5,
    content:
      'After deducting the initial down payment of ৳{DOWN_PAYMENT} from the contract price, the remaining financed principal obligation is ৳{FINANCED_AMOUNT}. This principal balance is divided into the agreed installment schedule and is strictly subject to the repayment terms set forth herein.',
    contentBn:
      'সর্বমোট চুক্তিমূল্য হইতে ডাউন পেমেন্ট ৳{DOWN_PAYMENT} কর্তনপূর্বক অর্থায়নকৃত অবশিষ্ট মূল মূলধন (Financed Principal) হইলো ৳{FINANCED_AMOUNT}। এই অবশিষ্ট অর্থ কিস্তির তপশিল অনুযায়ী পরিশোধযোগ্য হইবে।',
  },
  {
    id: 'clause-6',
    number: 6,
    title: 'Interest Rate and Calculation',
    titleBn: 'সুদের হার ও হিসাব পদ্ধতি',
    category: 'FINANCIAL',
    isMandatory: true,
    order: 6,
    content:
      '{INTEREST_DISCLOSURE_TEXT} Calculation basis: {INTEREST_METHOD_TEXT}. No undisclosed fees, compounding charges, or unilateral post-acceptance rate alterations shall apply to this contract.',
    contentBn:
      '{INTEREST_DISCLOSURE_TEXT_BN} হিসাব পদ্ধতি: {INTEREST_METHOD_TEXT_BN}। কোনো গোপন চার্জ বা চুক্তি স্বাক্ষরের পর একতরফাভাবে সুদের হার বৃদ্ধি করা হইবে না।',
  },
  {
    id: 'clause-7',
    number: 7,
    title: 'Installment Plan & Repayment Obligations',
    titleBn: 'কিস্তির পরিকল্পনা ও পরিশোধের বাধ্যবাধকতা',
    category: 'SCHEDULE',
    isMandatory: true,
    order: 7,
    content:
      'The financed balance shall be repaid in {DURATION_MONTHS} consecutive monthly installments. Each regular installment shall be ৳{MONTHLY_INSTALLMENT}, with a final reconciling installment of ৳{FINAL_INSTALLMENT}. The first installment is due on {FIRST_DUE_DATE}, and subsequent installments are due on or before the designated recurring due date of each calendar month through {FINAL_DUE_DATE}.',
    contentBn:
      'অর্থায়নকৃত টাকা মোট {DURATION_MONTHS}টি মাসিক কিস্তিতে পরিশোধযোগ্য। প্রতিটি নিয়মিত কিস্তির পরিমাণ ৳{MONTHLY_INSTALLMENT} এবং সমন্বয়কৃত শেষ কিস্তির পরিমাণ ৳{FINAL_INSTALLMENT}। ১ম কিস্তির শেষ তারিখ {FIRST_DUE_DATE} এবং সর্বশেষ কিস্তির তারিখ {FINAL_DUE_DATE}।',
  },
  {
    id: 'clause-8',
    number: 8,
    title: 'Authorized Payment Methods',
    titleBn: 'অনুমোদিত পেমেন্ট পদ্ধতি',
    category: 'OPERATIONAL',
    isMandatory: true,
    order: 8,
    content:
      'Installments may be paid via: (a) Official {COMPANY_NAME} showroom POS / cash counter; (b) Official Merchant bKash / Nagad / Rocket accounts; or (c) Designated corporate bank account transfer. The Customer must quote Contract No. {CONTRACT_NUMBER} on all digital payments and retain the issued digital receipt.',
    contentBn:
      'কিস্তির অর্থ নিম্নোক্ত অনুমোদিত মাধ্যমে পরিশোধযোগ্য: (ক) {COMPANY_NAME} শোরুম ক্যাশ কাউন্টার/পিওএস; (খ) অফিশিয়াল মার্চেন্ট বিকাশ/নগদ/রকেট; অথবা (গ) ব্যাংক হিসাব। প্রতিটি পেমেন্টে চুক্তি নং {CONTRACT_NUMBER} উল্লেখ করিতে হইবে।',
  },
  {
    id: 'clause-9',
    number: 9,
    title: 'Payment Receipts and Reconciliation',
    titleBn: 'পেমেন্ট রসিদ ও হিসাব সমন্বয়',
    category: 'OPERATIONAL',
    isMandatory: true,
    order: 9,
    content:
      'Every verified payment generates an official printed or SMS/digital receipt with a unique Receipt Number. Customers must inspect their online statement or showroom ledger within 7 (seven) days of payment. Any discrepancies or uncredited amounts must be reported immediately with transaction reference evidence.',
    contentBn:
      'প্রতিটি সফল পেমেন্টের পর একটি অনন্য রসিদ নম্বর সংবলিত রসিদ বা এসএমএস প্রদান করা হইবে। কোনো অমিল পরিলক্ষিত হইলে ট্রানজেকশন প্রুফসহ ৭ (সাত) কার্যদিবসের মধ্যে শোরুমে অবহিত করিতে হইবে।',
  },
  {
    id: 'clause-10',
    number: 10,
    title: 'Due Dates and Grace Period',
    titleBn: 'পরিশোধের তারিখ ও গ্রেস পিরিয়ড',
    category: 'SCHEDULE',
    isMandatory: true,
    order: 10,
    content:
      'Installments become due on the date specified in the Repayment Schedule. A grace period of {GRACE_PERIOD_DAYS} calendar days is granted after the due date to accommodate banking holidays or unforeseen transaction delays without triggering default status.',
    contentBn:
      'কিস্তি পরিশোধের নির্দিষ্ট তারিখের পর সর্বোচ্চ {GRACE_PERIOD_DAYS} দিন গ্রেস পিরিয়ড (অতিরিক্ত সময়) প্রযোজ্য হইবে, যাহাতে সরকারি ছুটি বা ব্যাংকিং বিলম্বের কারণে গ্রাহক অসুবিধায় না পড়েন।',
  },
  {
    id: 'clause-11',
    number: 11,
    title: 'Late or Missed Payments Policy',
    titleBn: 'বকেয়া কিস্তি ও বিলম্ব ফি নীতিমালা',
    category: 'SCHEDULE',
    isMandatory: true,
    order: 11,
    content:
      '{LATE_FEE_DISCLOSURE_TEXT} Reminders via automated SMS, WhatsApp, and telephone will be issued for overdue installments. {COMPANY_NAME} does not impose arbitrary compounding penalties or unlawful interest additions.',
    contentBn:
      '{LATE_FEE_DISCLOSURE_TEXT_BN} বকেয়া কিস্তির ক্ষেত্রে এসএমএস, হোয়াটসঅ্যাপ ও ফোন কলের মাধ্যমে রিমাইন্ডার প্রদান করা হইবে। কোনো অযৌক্তিক বা বেআইনি জরিমানা ধার্য করা হইবে না।',
  },
  {
    id: 'clause-12',
    number: 12,
    title: 'Early Repayment & Full Settlement Policy',
    titleBn: 'অগ্রিম সম্পূর্ণ পরিশোধ ও নিষ্পত্তির নীতিমালা',
    category: 'FINANCIAL',
    isMandatory: false,
    order: 12,
    content:
      'The Customer has the full legal right to repay the entire remaining balance at any time prior to the maturity date. No prepayment penalty, early settlement lock-in fee, or termination charge shall be assessed. Upon early settlement, {COMPANY_NAME} shall issue a formal No Objection Certificate (NOC) and full ownership release.',
    contentBn:
      'গ্রাহক যেকোনো সময় মেয়াদপূর্তির পূর্বে অবশিষ্ট সম্পূর্ণ অর্থ পরিশোধ করিয়া অ্যাকাউন্ট চূড়ান্ত নিষ্পত্তি করিতে পারিবেন। এজন্য কোনো প্রিপেমেন্ট জরিমানা বা বাড়তি ফি কর্তন করা হইবে না এবং তৎক্ষণাৎ সম্পূর্ণ দায়মুক্তি সনদ (NOC) প্রদান করা হইবে।',
  },
  {
    id: 'clause-13',
    number: 13,
    title: 'Ownership and Title Transfer',
    titleBn: 'মালিকানা ও স্বত্ব হস্তান্তর',
    category: 'LEGAL',
    isMandatory: true,
    order: 13,
    content:
      'Under the Hire-Purchase structure governed by the Contract Act and Sale of Goods Act, legal title and ownership of the equipment remains with {COMPANY_NAME} as security until all installments, fees, and charges under this Agreement are liquidated in full. Beneficial possession, safe custody, and operational use are granted to the Customer from the delivery date.',
    contentBn:
      'হায়ার-পারচেজ চুক্তি অনুযায়ী সমুদয় কিস্তি ও বকেয়া অর্থ সম্পূর্ণ পরিশোধ না হওয়া পর্যন্ত পণ্যের মূল মালিকানা ও স্বত্ব {COMPANY_NAME}-এর অনুকূলে সংরক্ষিত থাকিবে। অর্থ সম্পূর্ণ পরিশোধের সাথে সাথে স্বয়ংক্রিয়ভাবে পূর্ণ মালিকানা ক্রেতার নিকট হস্তান্তরিত হইবে।',
  },
  {
    id: 'clause-14',
    number: 14,
    title: 'Product Delivery and Serial Verification',
    titleBn: 'পণ্য সরবরাহ ও গ্রাহক যাচাই',
    category: 'OPERATIONAL',
    isMandatory: true,
    order: 14,
    content:
      'Physical handover of the equipment is conditioned upon: (a) affirmative customer acceptance of this Agreement; (b) verified collection of the required down payment; and (c) positive verification of customer identity and serial number {SERIAL_NUMBER}. Delivery challan is signed by the Customer upon receiving the equipment.',
    contentBn:
      'পণ্য হস্তান্তর কেবল তখনই সম্পন্ন হইবে যখন: (ক) চুক্তিতে গ্রাহকের ইতিবাচক সম্মতি নিশ্চিত হইবে; (খ) ডাউন পেমেন্ট যাচাইপূর্বক সংগৃহীত হইবে; এবং (গ) পণ্যের সিরিয়াল নম্বর {SERIAL_NUMBER} যাচাইপূর্বক ডেলিভারি চালান স্বাক্ষরিত হইবে।',
  },
  {
    id: 'clause-15',
    number: 15,
    title: 'Warranty and After-Sales Service',
    titleBn: 'ওয়ারেন্টি ও বিক্রয়োত্তর সেবা',
    category: 'OPERATIONAL',
    isMandatory: true,
    order: 15,
    content:
      'The equipment is covered by standard warranty terms as specified in the warranty certificate. Timely servicing, parts replacement, and technical support are honored regardless of ongoing installment status, provided the Customer is not in default under Clause 17. Physical damage, liquid spillage, or unauthorized third-party tampering void the warranty.',
    contentBn:
      'পণ্যটি নির্দিষ্ট ওয়ারেন্টি সনদ অনুযায়ী ওয়ারেন্টি সুবিধার আওতায় থাকিবে। নিয়মিত কিস্তি প্রদানকারী গ্রাহক সর্বতোভাবে শোরুম বিক্রয়োত্তর সেবা পাইবেন। তবে বাহ্যিক আঘাত, পানিতে পড়া বা অননুমোদিত মেকানিক দ্বারা মেরামতের ক্ষেত্রে ওয়ারেন্টি প্রযোজ্য হইবে না।',
  },
  {
    id: 'clause-16',
    number: 16,
    title: 'Returns, Cancellation, and Refunds',
    titleBn: 'পণ্য ফেরত, বাতিল ও রিফান্ড নীতি',
    category: 'LEGAL',
    isMandatory: false,
    order: 16,
    content:
      'In the event of an inherent hardware defect verified by {COMPANY_NAME} within 7 (seven) days of delivery that cannot be repaired or replaced under warranty, the Customer may request cancellation of the agreement. In such case, all verified payments collected will be refunded after deduction of any verified external delivery fees.',
    contentBn:
      'ডেলিভারির ৭ (সাত) দিনের মধ্যে প্রস্তুতকারকজনিত গুরুতর ত্রুটি পরিলক্ষিত হইলে এবং তা মেরামতযোগ্য না হইলে চুক্তি বাতিলের আবেদন করা যাইবে এবং সংগৃহীত অর্থ বিধি মোতাবেক ফেরত প্রদান করা হইবে।',
  },
  {
    id: 'clause-17',
    number: 17,
    title: 'Default, Acceleration & Lawful Remedies',
    titleBn: 'চুক্তিভঙ্গ ও আইনানুগ প্রতিকার',
    category: 'LEGAL',
    isMandatory: true,
    order: 17,
    content:
      'A default occurs if: (a) the Customer fails to pay 2 (two) consecutive installments following written reminder notice and expiry of grace periods; (b) the Customer provides fraudulent identity documents; or (c) the Customer attempts to sell, pledge, or tamper with the equipment before full payment. Upon default, {COMPANY_NAME} may accelerate the remaining balance and pursue lawful civil and contractual recovery under Bangladesh law.',
    contentBn:
      'পরপর ২টি কিস্তি বকেয়া থাকিলে, ভুয়া তথ্য প্রদান করিলে বা সম্পূর্ণ মূল্য পরিশোধের পূর্বে পণ্যটি অন্যত্র বিক্রয়/বন্ধক রাখিলে তা চুক্তিভঙ্গ বলিয়া গণ্য হইবে। এই ক্ষেত্রে {COMPANY_NAME} অবশিষ্ট সম্পূর্ণ অর্থ তলব করিতে এবং দেশের প্রচলিত আইন অনুযায়ী আইনানুগ ব্যবস্থা গ্রহণ করিতে পারিবে।',
  },
  {
    id: 'clause-18',
    number: 18,
    title: 'Restructuring and Contract Amendments',
    titleBn: 'চুক্তি পুনর্বিন্যাস ও সংশোধনী পদ্ধতি',
    category: 'LEGAL',
    isMandatory: true,
    order: 18,
    content:
      'Any amendment to the installment schedule, tenure extension, interest rate revision, or temporary moratorium requires mutual written agreement, supervisor approval in the ERP audit log, and generation of an Addendum Agreement. No verbal promise or undocumented field modification shall be legally binding.',
    contentBn:
      'কিস্তির সময় বৃদ্ধি, পুনর্নির্ধারণ বা শর্ত পরিবর্তনের ক্ষেত্রে উভয় পক্ষের লিখিত সম্মতি এবং ইআরপি অডিট লগে সুপারভাইজারের অনুমোদন সাপেক্ষে আনুষ্ঠানিক সংশোধনী পত্র প্রস্তুত করিতে হইবে। কোনো মৌখিক প্রতিশ্রুতি কার্যকর হইবে না।',
  },
  {
    id: 'clause-19',
    number: 19,
    title: 'Customer Responsibilities & Equipment Care',
    titleBn: 'গ্রাহকের দায়িত্ব ও পণ্যের সুরক্ষা',
    category: 'OPERATIONAL',
    isMandatory: true,
    order: 19,
    content:
      'The Customer undertakes to: (a) maintain the equipment in good working order; (b) notify {COMPANY_NAME} within 48 hours of any change of mobile phone number or residential address; (c) avoid installing malicious or illegal software; and (d) report any loss or theft immediately with a police general diary (GD) copy.',
    contentBn:
      'গ্রাহক পণ্যটির সঠিক যত্ন নিবেন, মোবাইল নম্বর বা ঠিকানা পরিবর্তন হইলে ৪৮ ঘণ্টার মধ্যে শোরুমকে জানাইবেন এবং পণ্যটি কোনো বেআইনি কাজে ব্যবহার করিবেন না। পণ্যটি চুরি বা হারাইয়া গেলে তাৎক্ষণিক থানায় জিডি করিয়া শোরুমে অবহিত করিবেন।',
  },
  {
    id: 'clause-20',
    number: 20,
    title: 'Complaints and Dispute Resolution',
    titleBn: 'অভিযোগ ও বিরোধ নিষ্পত্তি পদ্ধতি',
    category: 'LEGAL',
    isMandatory: true,
    order: 20,
    content:
      'In the event of any operational grievance, billing dispute, or service concern, the Customer shall first lodge a complaint with {COMPANY_NAME} Customer Care at {COMPANY_PHONE}. Both parties agree to attempt amicable settlement in good faith. If unresolved, disputes are subject to the jurisdiction of competent courts in Moulvibazar / Sylhet, Bangladesh.',
    contentBn:
      'যেকোনো অভিযোগ বা বিরোধের ক্ষেত্রে গ্রাহক প্রথমে {COMPANY_PHONE} নম্বরে কাস্টমার কেয়ারে যোগাযোগ করিবেন এবং উভয় পক্ষ আলোচনা ও সৌহার্দ্যপূর্ণভাবে বিরোধ নিষ্পত্তির চেষ্টা করিবেন। অন্যথায় মৌলভীবাজার/সিলেট জেলা আদালতের এখতিয়ার প্রযোজ্য হইবে।',
  },
  {
    id: 'clause-21',
    number: 21,
    title: 'Notices and Official Communication',
    titleBn: 'আনুষ্ঠানিক নোটিশ ও যোগাযোগ মাধ্যম',
    category: 'OPERATIONAL',
    isMandatory: true,
    order: 21,
    content:
      'All formal contractual notices, statements, payment receipts, and reminders shall be delivered electronically via SMS, WhatsApp, and email to the Customer contact details recorded herein, or by registered physical post to the verified residential address.',
    contentBn:
      'চুক্তির সকল নোটিশ, হিসাবের বিবরণী, পেমেন্ট কনফার্মেশন ও তাগিদপত্র গ্রাহকের প্রদত্ত মোবাইল নম্বর, হোয়াটসঅ্যাপ, ইমেইল অথবা আবাসিক ঠিকানায় প্রেরণের মাধ্যমে কার্যকর গণ্য হইবে।',
  },
  {
    id: 'clause-22',
    number: 22,
    title: 'Electronic Acceptance and Document Records',
    titleBn: 'ইলেকট্রনিক স্বীকৃতি ও ডকুমেন্টের বৈধতা',
    category: 'LEGAL',
    isMandatory: true,
    order: 22,
    content:
      'This Agreement may be executed by electronic affirmative confirmation, digital OTP verification, or physical handwritten signature pursuant to the Information and Communication Technology (ICT) Act of Bangladesh. Electronic records and digital timestamps maintained in the ERP system serve as conclusive evidence of contract terms.',
    contentBn:
      'এই চুক্তিটি আইসিটি আইন অনুযায়ী ইলেকট্রনিক সম্মতি, ওটিপি ভেরিফিকেশন অথবা সনাতন হস্তাক্ষর স্বাক্ষরের মাধ্যমে কার্যকর করা যাইবে। ইআরপি সিস্টেমে সংরক্ষিত ডিজিটাল টাইমস্ট্যাম্প ও অডিট লগ প্রমাণ হিসেবে গ্রাহ্য হইবে।',
  },
  {
    id: 'clause-23',
    number: 23,
    title: 'Privacy and Personal Information Protection',
    titleBn: 'ব্যক্তিগত তথ্যের গোপনীয়তা ও নিরাপত্তা',
    category: 'LEGAL',
    isMandatory: true,
    order: 23,
    content:
      '{COMPANY_NAME} shall maintain customer NID copies, contact details, and financial repayment histories securely with encrypted access controls. Customer information will be used solely for credit evaluation, contract administration, payment processing, and statutory compliance, and will not be sold or shared with unauthorized commercial third parties.',
    contentBn:
      'গ্রাহকের জাতীয় পরিচয়পত্র, ছবি ও ব্যক্তিগত তথ্যের সর্বোচ্চ গোপনীয়তা ও ডিজিটাল সুরক্ষা নিশ্চিত করা হইবে। চুক্তি পরিচালনা ও কিস্তির হিসাব ব্যতীত কোনো অননুমোদিত তৃতীয় পক্ষের নিকট গ্রাহকের তথ্য প্রকাশ করা হইবে না।',
  },
  {
    id: 'clause-24',
    number: 24,
    title: 'Entire Agreement & Severability',
    titleBn: 'সম্পূর্ণ চুক্তি ও পৃথকীকরণ যোগ্যতা',
    category: 'LEGAL',
    isMandatory: true,
    order: 24,
    content:
      'This document, together with the verified Repayment Schedule and Delivery Challan, constitutes the complete and exclusive agreement between the parties concerning this hire-purchase financing. If any provision is determined to be invalid or unenforceable under Bangladesh law, the remaining provisions shall remain in full force and effect.',
    contentBn:
      'এই চুক্তিপত্র এবং সংযুক্ত কিস্তির তপশিল ও ডেলিভারি চালানই পক্ষদ্বয়ের মধ্যকার পূর্ণাঙ্গ চুক্তি। কোনো একটি ধারা বা অংশ অপ্রয়োগযোগ্য বলিয়া গণ্য হইলেও চুক্তির অবশিষ্ট ধারাসমূহ পূর্ণ কার্যকর ও বলবৎ থাকিবে।',
  },
  {
    id: 'clause-25',
    number: 25,
    title: 'Customer Affirmative Confirmation & Acknowledgment',
    titleBn: 'গ্রাহকের চূড়ান্ত সম্মতি ও স্বীকৃতি',
    category: 'LEGAL',
    isMandatory: true,
    order: 25,
    content:
      'I, {CUSTOMER_NAME}, hereby solemnly declare that: (a) I have personally read, understood, and received a copy of all 25 contractual clauses of this Agreement; (b) I have reviewed the live financial summary and repayment schedule; (c) I agree to pay all installments on time; and (d) I have entered into this Agreement willingly and without any coercion.',
    contentBn:
      'আমি, {CUSTOMER_NAME}, সজ্ঞানে ঘোষণা করিতেছি যে: (ক) আমি এই চুক্তির সকল ২৫টি শর্ত নিজে পড়িয়া বা বুঝিয়া গ্রহণ করিলাম; (খ) আমি আর্থিক বিবরণী ও কিস্তির তপশিল পর্যালোচনা করিয়াছি; (গ) আমি যথাসময়ে কিস্তি পরিশোধ করিতে দায়বদ্ধ রহিব; এবং (ঘ) কাহারো কোনো প্রকার প্ররোচনা ব্যতীত স্বেচ্ছায় এই চুক্তিতে সম্মতি প্রদান করিলাম।',
  },
];

/**
 * Replace placeholders in clause text with live contract variables.
 */
export function interpolateClauseText(text: string, context: ContractInterpolationContext): string {
  if (!text) return '';

  const interestDisclosureEn = context.isInterestFree
    ? 'Interest Rate: 0%. No interest will be charged under this agreement, subject to the other expressly disclosed contractual terms and applicable law.'
    : `Interest Rate: ${context.interestRate}% per annum / period. Total financing interest charge is ৳${context.interestRate > 0 ? (context.contractPrice - context.downPayment > 0 ? (context.monthlyInstallment * context.durationMonths - (context.contractPrice - context.downPayment)) : 0) : 0}.`;

  const interestDisclosureBn = context.isInterestFree
    ? 'সুদের হার: ০% (Interest Free)। এই চুক্তির আওতায় কোনো সুদ ধার্য করা হইবে না।'
    : `সুদের হার: ${context.interestRate}%। অনুমোদিত অর্থায়ন সুদ প্রযোজ্য হইবে।`;

  const interestMethodEn = context.interestMethod === 'REDUCING_BALANCE'
    ? 'Reducing Balance Amortization Formula'
    : 'Fixed Flat Rate Financial Calculation';

  const interestMethodBn = context.interestMethod === 'REDUCING_BALANCE'
    ? 'হ্রাসমান ব্যালেন্স পদ্ধতি (Reducing Balance)'
    : 'ফিক্সড ফ্ল্যাট রেট হিসাব পদ্ধতি';

  const lateFeeEn = context.lateFeePerDay > 0
    ? `An administrative late notification fee of ৳${context.lateFeePerDay} per day may accrue after the grace period until the overdue installment is cured.`
    : 'No late fee penalty shall apply under this contract; standard reminder notices apply.';

  const lateFeeBn = context.lateFeePerDay > 0
    ? `গ্রেস পিরিয়ড অতিবাহিত হইবার পর বকেয়া কিস্তির জন্য দৈনিক ৳${context.lateFeePerDay} প্রশাসনিক বিলম্ব ফি প্রযোজ্য হইতে পারে।`
    : 'এই চুক্তিতে কোনো অতিরিক্ত বিলম্ব জরিমানা ধার্য করা হইবে না।';

  return text
    .replace(/\{CUSTOMER_NAME\}/g, context.customerName || 'N/A')
    .replace(/\{CUSTOMER_PHONE\}/g, context.customerPhone || 'N/A')
    .replace(/\{CUSTOMER_NID\}/g, context.customerNid || 'Verified NID')
    .replace(/\{CUSTOMER_ADDRESS\}/g, context.customerAddress || 'Showroom Record')
    .replace(/\{GUARANTOR_NAME\}/g, context.guarantorName || 'N/A')
    .replace(/\{GUARANTOR_PHONE\}/g, context.guarantorPhone || 'N/A')
    .replace(/\{PRODUCT_NAME\}/g, context.productName || 'Laptop Equipment')
    .replace(/\{SERIAL_NUMBER\}/g, context.serialNumber || 'N/A')
    .replace(/\{CONTRACT_NUMBER\}/g, context.contractNumber || 'EMI-PENDING')
    .replace(/\{AGREEMENT_DATE\}/g, context.agreementDate || new Date().toISOString().split('T')[0])
    .replace(/\{CONTRACT_PRICE\}/g, Number(context.contractPrice || 0).toLocaleString())
    .replace(/\{DOWN_PAYMENT\}/g, Number(context.downPayment || 0).toLocaleString())
    .replace(/\{FINANCED_AMOUNT\}/g, Number(context.financedAmount || 0).toLocaleString())
    .replace(/\{INTEREST_RATE\}/g, String(context.interestRate || 0))
    .replace(/\{DURATION_MONTHS\}/g, String(context.durationMonths || 6))
    .replace(/\{MONTHLY_INSTALLMENT\}/g, Number(context.monthlyInstallment || 0).toLocaleString())
    .replace(/\{FINAL_INSTALLMENT\}/g, Number(context.finalInstallment || context.monthlyInstallment || 0).toLocaleString())
    .replace(/\{FIRST_DUE_DATE\}/g, context.firstDueDate || 'Next Calendar Month')
    .replace(/\{FINAL_DUE_DATE\}/g, context.finalDueDate || 'Maturity Date')
    .replace(/\{GRACE_PERIOD_DAYS\}/g, String(context.gracePeriodDays || 5))
    .replace(/\{LATE_FEE_PER_DAY\}/g, String(context.lateFeePerDay || 0))
    .replace(/\{INTEREST_DISCLOSURE_TEXT\}/g, interestDisclosureEn)
    .replace(/\{INTEREST_DISCLOSURE_TEXT_BN\}/g, interestDisclosureBn)
    .replace(/\{INTEREST_METHOD_TEXT\}/g, interestMethodEn)
    .replace(/\{INTEREST_METHOD_TEXT_BN\}/g, interestMethodBn)
    .replace(/\{LATE_FEE_DISCLOSURE_TEXT\}/g, lateFeeEn)
    .replace(/\{LATE_FEE_DISCLOSURE_TEXT_BN\}/g, lateFeeBn)
    .replace(/\{COMPANY_NAME\}/g, context.companyName || 'NEED ELECTRO')
    .replace(/\{COMPANY_PHONE\}/g, context.companyPhone || '+880 1733-983752')
    .replace(/\{COMPANY_ADDRESS\}/g, context.companyAddress || 'Moulvibazar, Sylhet, Bangladesh');
}

export function getDefaultEMIClauses(): EMIContractClause[] {
  return JSON.parse(JSON.stringify(DEFAULT_25_EMI_CLAUSES));
}

