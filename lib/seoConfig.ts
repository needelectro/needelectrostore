// NEED ELECTRO ERP & Customer Website — Centralized SEO & Geo-SEO Configuration
import type { Metadata } from 'next';

export const BUSINESS_INFO = {
  name: 'NEED ELECTRO',
  parentOrganization: 'AMDADS GROUP',
  tagline: 'Trusted Electrical and Technological Solutions',
  legalName: 'NEED ELECTRO',
  founder: 'Amdadur Rahman',
  phone: '+880 1733-983752',
  phoneClean: '+8801733983752',
  whatsappClean: '8801733983752',
  email: 'needelectro23@gmail.com',
  supportEmail: 'contact.amdadur@gmail.com',
  domain: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.needelectro.store',
  currency: 'BDT',
  currencySymbol: '৳',
  address: {
    addressLocality: 'Moulvibazar',
    addressRegion: 'Sylhet',
    postalCode: '3200',
    addressCountry: 'BD',
  },
  socialProfiles: {
    facebook: 'https://facebook.com/needelectro',
    instagram: 'https://instagram.com/needelectro',
    youtube: 'https://youtube.com/@needelectro',
    whatsapp: 'https://wa.me/8801733983752',
  },
  serviceAreas: [
    'Moulvibazar',
    'Sylhet Division',
    'Bangladesh (Nationwide Online Delivery)',
  ],
  categories: [
    { title: 'Laptops', slug: 'laptops', icon: 'Laptop', description: 'Business, student & gaming laptops from HP, Dell, Lenovo with warranty & EMI in Moulvibazar.' },
    { title: 'Computers', slug: 'computers', icon: 'Monitor', description: 'Custom desktop PCs, office setups, and high-performance computing hardware.' },
    { title: 'CCTV & Security', slug: 'cctv', icon: 'Camera', description: 'HD & IP CCTV camera solutions, DVR/NVR setup, mobile app monitoring, and professional installation.' },
    { title: 'Electrical Products', slug: 'electrical-products', icon: 'Zap', description: 'Industrial and home electrical circuit breakers, copper wiring, distribution boards, and switches.' },
    { title: 'Computer Accessories', slug: 'computer-accessories', icon: 'Cpu', description: 'High-speed NVMe SSDs, RAM upgrades, mechanical keyboards, precision mice, and adapters.' },
    { title: 'Networking Products', slug: 'networking', icon: 'Wifi', description: 'Dual-band Wi-Fi routers, Gigabit switches, ONU fiber optics, and patch cables.' },
    { title: 'Smart Devices', slug: 'smart-devices', icon: 'Smartphone', description: 'Smart plugs, converter hubs, audio devices, and home automation electronics.' },
  ],
};

// URL slug generator
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate Canonical URL
export function getCanonicalUrl(path: string = ''): string {
  const base = BUSINESS_INFO.domain.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath === '/' ? '' : cleanPath}`;
}

// Universal Metadata Generator
export function generateSeoMetadata({
  title,
  description,
  path = '',
  keywords = [],
  ogImage = '/logo-dark-transparent.png',
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}): Metadata {
  const canonical = getCanonicalUrl(path);

  // Format concise title without duplicate branding (ideal <= 60 chars)
  const trimmedTitle = title.trim();
  let fullTitle: string;
  if (trimmedTitle.includes('NEED ELECTRO')) {
    fullTitle = trimmedTitle;
  } else {
    fullTitle = `${trimmedTitle} | ${BUSINESS_INFO.name}`;
  }

  // Enforce Bing & Google ideal meta description length (50 to 160 characters)
  let cleanDesc = description.replace(/\s+/g, ' ').trim();
  if (cleanDesc.length > 158) {
    cleanDesc = cleanDesc.slice(0, 155).trim() + '...';
  } else if (cleanDesc.length < 50) {
    cleanDesc = `${cleanDesc} Trusted electrical & tech solutions at NEED ELECTRO Bangladesh.`.slice(0, 158);
  }

  const imageUrl = ogImage.startsWith('http') ? ogImage : `${BUSINESS_INFO.domain.replace(/\/+$/, '')}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;

  return {
    title: {
      absolute: fullTitle,
    },
    description: cleanDesc,
    keywords: [
      ...keywords,
      'NEED ELECTRO',
      'Computer shop in Moulvibazar',
      'Computer price in Moulvibazar',
      'Laptop shop in Moulvibazar',
      'Laptop price in Moulvibazar',
      'CCTV camera shop in Moulvibazar',
      'CCTV camera price in Bangladesh',
      'Tech gadgets in Moulvibazar',
      'Tech gadgets price in Bangladesh',
      'Laptop price in Bangladesh',
      'HP EliteBook price in Bangladesh',
      'Desktop computer price in Bangladesh',
      'Computer accessories in Bangladesh',
      'Electrical shop online Bangladesh',
      'Electrical services in Moulvibazar',
      'Electrician service in Bangladesh',
      'CCTV installation service',
      'Laptop and computer servicing',
      'Networking and Wi-Fi installation',
      'Electrical products online Bangladesh',
      'Genuine laptop with warranty in Bangladesh',
      'Moulvibazar',
      'Sylhet',
      'Bangladesh',
      'মৌলভীবাজার ল্যাপটপ দোকান',
      'কম্পিউটার দোকান মৌলভীবাজার',
      'সিসিটিভি ক্যামেরা মৌলভীবাজার',
      'ইলেকট্রিশিয়ান মৌলভীবাজার',
      'ল্যাপটপ কিস্তিতে',
    ],
    alternates: {
      canonical,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: BUSINESS_INFO.name,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

// -------------------------------------------------------------
// Schema.org Structured Data Builders
// -------------------------------------------------------------

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BUSINESS_INFO.domain}/#organization`,
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    url: BUSINESS_INFO.domain,
    parentOrganization: {
      '@type': 'Organization',
      name: BUSINESS_INFO.parentOrganization,
    },
    logo: `${BUSINESS_INFO.domain}/logo-icon.png`,
    description: BUSINESS_INFO.tagline,
    telephone: BUSINESS_INFO.phoneClean,
    email: BUSINESS_INFO.email,
    sameAs: [
      BUSINESS_INFO.socialProfiles.facebook,
      BUSINESS_INFO.socialProfiles.instagram,
      BUSINESS_INFO.socialProfiles.youtube,
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS_INFO.phoneClean,
        contactType: 'customer service',
        areaServed: 'BD',
        availableLanguage: ['en', 'bn'],
      },
    ],
  };
}

export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${BUSINESS_INFO.domain}/#onlinestore`,
    name: BUSINESS_INFO.name,
    parentOrganization: {
      '@type': 'Organization',
      name: BUSINESS_INFO.parentOrganization,
    },
    image: `${BUSINESS_INFO.domain}/main-logo.jpg`,
    url: BUSINESS_INFO.domain,
    telephone: BUSINESS_INFO.phoneClean,
    priceRange: '৳৳',
    description: `${BUSINESS_INFO.name} is a trusted electrical, technology and software solutions platform in Bangladesh. A Sister Concern of ${BUSINESS_INFO.parentOrganization}. Offering authentic laptops, desktop computers, CCTV security systems, electrical components, and certified technical services.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS_INFO.address.addressLocality,
      addressRegion: BUSINESS_INFO.address.addressRegion,
      postalCode: BUSINESS_INFO.address.postalCode,
      addressCountry: BUSINESS_INFO.address.addressCountry,
    },
    areaServed: [
      {
        '@type': 'Country',
        name: 'Bangladesh',
      },
    ],
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash on Delivery, bKash, Nagad, Bank Transfer, EMI Installment',
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path),
    })),
  };
}

export function buildItemListSchema({
  name,
  description,
  url,
  path,
  items,
}: {
  name: string;
  description?: string;
  url?: string;
  path?: string;
  items: Array<{
    name: string;
    url?: string;
    path?: string;
    image?: string | null;
    price?: number;
    brand?: string;
    category?: string;
  }>;
}) {
  const targetUrl = url || path || '';
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    ...(description ? { description } : {}),
    url: getCanonicalUrl(targetUrl),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => {
      const itemUrl = item.url || item.path || '';
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: itemUrl.startsWith('http') ? itemUrl : getCanonicalUrl(itemUrl),
        ...(item.image ? { image: item.image.startsWith('http') ? item.image : `${BUSINESS_INFO.domain}${item.image}` } : {}),
        ...(item.price !== undefined
          ? {
              offers: {
                '@type': 'Offer',
                priceCurrency: BUSINESS_INFO.currency,
                price: item.price.toFixed(2),
                availability: 'https://schema.org/InStock',
              },
            }
          : {}),
      };
    }),
  };
}

export function buildProductSchema(product: {
  name: string;
  sku: string;
  category: string;
  brand: string;
  model?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  images?: string[];
  retailPrice: number;
  currentStock: number;
  warrantyPeriodMonths?: number;
  specs?: any;
}) {
  const canonical = getCanonicalUrl(`/product/${slugify(product.name)}-${product.sku.toLowerCase()}`);
  const fallbackImg = `${BUSINESS_INFO.domain}/logo-dark-transparent.png`;
  const primaryImg = product.imageUrl 
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BUSINESS_INFO.domain}${product.imageUrl}`)
    : fallbackImg;
  const imageList = product.images && product.images.length > 0
    ? product.images.map(img => img.startsWith('http') ? img : `${BUSINESS_INFO.domain}${img}`)
    : [primaryImg];

  const isRefurbished = product.name.toLowerCase().includes('refurbished') || 
                        product.name.toLowerCase().includes('used') ||
                        (product.description && (product.description.toLowerCase().includes('used') || product.description.toLowerCase().includes('refurbished')));

  // Strip markdown and HTML tags for Schema.org clean plain-text requirement
  const rawDesc = (product.description || '').trim();
  const cleanPlainDesc = rawDesc
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*#_`|~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const finalDesc = cleanPlainDesc || `${product.name} available at ${BUSINESS_INFO.name} Moulvibazar. Genuine product with warranty and fast delivery across Bangladesh.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: imageList.length > 1 ? imageList : primaryImg,
    description: finalDesc,
    sku: product.sku,
    mpn: product.model || product.sku,
    ...(product.model ? { model: product.model } : {}),
    brand: {
      '@type': 'Brand',
      name: product.brand || 'NEED ELECTRO',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: BUSINESS_INFO.currency,
      price: product.retailPrice > 0 ? product.retailPrice.toFixed(2) : '0.00',
      priceValidUntil: '2027-12-31',
      itemCondition: isRefurbished ? 'https://schema.org/RefurbishedCondition' : 'https://schema.org/NewCondition',
      availability: product.currentStock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/BackOrder',
      seller: {
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BD',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '60.00',
          currency: 'BDT',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'BD',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
    },
  };
}

export function buildFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function buildArticleSchema(article: {
  title: string;
  slug: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
}) {
  const canonical = getCanonicalUrl(`/blog/${article.slug}`);
  const img = article.imageUrl || `${BUSINESS_INFO.domain}/main-logo.jpg`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: img.startsWith('http') ? img : `${BUSINESS_INFO.domain}${img}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.authorName || BUSINESS_INFO.founder,
      jobTitle: 'Founder & Managing Director',
      worksFor: {
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
      logo: {
        '@type': 'ImageObject',
        url: `${BUSINESS_INFO.domain}/logo-icon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
  };
}

export function buildServiceSchema({
  name,
  serviceType,
  description,
  path,
}: {
  name: string;
  serviceType: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType,
    description,
    url: getCanonicalUrl(path),
    provider: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: BUSINESS_INFO.address.addressLocality,
        addressRegion: BUSINESS_INFO.address.addressRegion,
        postalCode: BUSINESS_INFO.address.postalCode,
        addressCountry: BUSINESS_INFO.address.addressCountry,
      },
      telephone: BUSINESS_INFO.phoneClean,
    },
    areaServed: BUSINESS_INFO.serviceAreas.map(area => ({
      '@type': 'AdministrativeArea',
      name: area,
    })),
  };
}

// -------------------------------------------------------------
// Static Knowledge Center / Blog Articles
// -------------------------------------------------------------

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  bnTitle: string;
  description: string;
  category: 'Laptops' | 'Computers' | 'CCTV' | 'Electrical' | 'Financing';
  publishedDate: string;
  readingTime: string;
  author: string;
  summary: string;
  sections: Array<{ heading: string; content: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'laptop-buying-guide-students-moulvibazar',
    title: 'How to Choose the Best Laptop for Students in Moulvibazar (2026 Guide)',
    bnTitle: 'মৌলভীবাজারে শিক্ষার্থীদের জন্য সেরা ল্যাপটপ বাছাই করার পূর্ণাঙ্গ গাইড',
    description: 'A comprehensive buying guide for college and university students in Moulvibazar looking for dependable, budget-friendly laptops for coding, freelancing, and academic coursework.',
    category: 'Laptops',
    publishedDate: '2026-03-01',
    readingTime: '6 min read',
    author: 'Amdadur Rahman',
    summary: 'Finding the right balance between budget, battery life, and processing power is critical for students. Discover recommended configurations for HP EliteBook, Dell Latitude, and Lenovo ThinkPad laptops available locally in Moulvibazar.',
    sections: [
      {
        heading: '1. Processor & RAM Requirements for Modern Students',
        content: 'For everyday coursework, browsing, and document editing, an Intel Core i5 or AMD Ryzen 5 processor paired with 8GB RAM is the minimum benchmark. For computer science students, web developers, or graphic designers in Moulvibazar, 16GB of DDR4 or DDR5 RAM guarantees smooth multitasking without freezing when running VS Code, Figma, and multiple browser tabs.',
      },
      {
        heading: '2. Solid State Drive (SSD) is Mandatory',
        content: 'Never purchase a laptop with only a mechanical hard disk (HDD). A 256GB or 512GB NVMe M.2 SSD boots Windows 11 in under 10 seconds and opens office software instantaneously. NEED ELECTRO configures all student laptops with authentic, health-tested SSDs.',
      },
      {
        heading: '3. Battery Life & Portability in Moulvibazar',
        content: 'Students commuting from Sreemangal, Rajnagar, or rural Moulvibazar need at least 4 to 6 hours of dependable battery backup. Lightweight 14-inch laptops such as the HP EliteBook 840 G6/G7 or Dell Latitude 7400 weigh under 1.4 kg and fit comfortably into college backpacks.',
      },
      {
        heading: '4. Student EMI & Installment Options at NEED ELECTRO',
        content: 'We offer structured 3, 6, and 12-month installment plans for students with a verified local guardian or guarantor. You can walk out with an enterprise-grade laptop with an initial down payment, making quality education tech affordable.',
      },
    ],
    faqs: [
      {
        question: 'Can I get a laptop on EMI as a student in Moulvibazar?',
        answer: 'Yes! NEED ELECTRO provides flexible installment financing for students with a parent or local guarantor NID verification.',
      },
      {
        question: 'Which brand is best for engineering or computer science students?',
        answer: 'HP EliteBook and Dell Latitude series are the top choices due to their durable magnesium chassis, upgradable RAM, and thermal efficiency.',
      },
    ],
  },
  {
    id: 'blog-2',
    slug: 'used-laptop-buying-checklist',
    title: 'Used Laptop Buying Checklist: 7 Critical Hardware Checks Before Paying',
    bnTitle: 'ব্যবহৃত (Used) ল্যাপটপ কেনার পূর্বে ৭টি গুরুত্বপূর্ণ হার্ডওয়্যার চেকলিস্ট',
    description: 'Learn how to inspect used and refurbished laptops in Moulvibazar. Check battery health, display bleeding, motherboard thermals, and keyboard functionality with professional testing tips.',
    category: 'Laptops',
    publishedDate: '2026-03-05',
    readingTime: '7 min read',
    author: 'Amdadur Rahman',
    summary: 'Avoid costly mistakes when buying pre-owned laptops. Use our 7-step hardware verification checklist to verify laptop condition, authentic chargers, and warranty coverage in Moulvibazar.',
    sections: [
      {
        heading: '1. Inspect the Physical Body & Hinges',
        content: 'Check the chassis for dents, hairline cracks, or loose display hinges. Open and close the screen smoothly. High-quality business laptops like Lenovo ThinkPad and HP EliteBook feature aluminum or carbon fiber bodies that withstand years of use.',
      },
      {
        heading: '2. Check Battery Health & Cycle Count',
        content: 'Run Windows PowerShell command "powercfg /batteryreport" to verify the design capacity versus full charge capacity. At NEED ELECTRO, we test all laptop batteries with commercial load analyzers, guaranteeing minimum 80%+ battery health.',
      },
      {
        heading: '3. Scan Display for Dead Pixels & Backlight Bleed',
        content: 'Open full-screen solid white, black, and RGB color images to inspect for dead pixels, bright spots, or edge backlight bleeding. An IPS Full HD (1920x1080) panel provides crisp colors and wide viewing angles.',
      },
      {
        heading: '4. Stress-Test CPU & Thermals',
        content: 'Run a short CPU benchmark and verify that cooling fans spin cleanly without grinding noise. Thermal paste should be fresh to prevent thermal throttling under heavy workloads.',
      },
    ],
    faqs: [
      {
        question: 'Does NEED ELECTRO test used laptops before selling?',
        answer: 'Yes. Every pre-owned laptop passes a 24-point hardware diagnostic test including RAM stress tests, SSD health verification, thermal checks, keyboard and port testing.',
      },
      {
        question: 'What replacement warranty do I get on used laptops in Moulvibazar?',
        answer: 'NEED ELECTRO provides a 7-day replacement warranty and up to 2 years of free service warranty on tested laptops.',
      },
    ],
  },
  {
    id: 'blog-3',
    slug: 'cctv-camera-installation-guide-moulvibazar',
    title: 'Complete CCTV Camera Installation Guide for Homes & Shops in Moulvibazar',
    bnTitle: 'মৌলভীবাজারে বাসা-বাড়ি ও ব্যবসা প্রতিষ্ঠানের জন্য সিসিটিভি ক্যামেরা ইনস্টলেশন গাইড',
    description: 'Everything you need to know about setting up CCTV security cameras in Moulvibazar: selecting IP vs HD cameras, DVR/NVR storage calculations, night vision, and remote smartphone monitoring.',
    category: 'CCTV',
    publishedDate: '2026-03-10',
    readingTime: '5 min read',
    author: 'Amdadur Rahman',
    summary: 'Protect your home, retail store, or commercial facility in Moulvibazar with professional CCTV camera installation. Learn about camera types, wiring best practices, and remote surveillance.',
    sections: [
      {
        heading: '1. Choosing Between HD Analog and IP Network Cameras',
        content: 'For standard retail shops and home entrances in Moulvibazar, 2MP to 5MP HD analog cameras connected to a DVR provide crystal-clear 1080p recording at an economical price. For large multi-story commercial buildings, warehouse yards, or long-distance monitoring, PoE IP cameras with an NVR offer superior resolution, optical zoom, and digital noise reduction.',
      },
      {
        heading: '2. Smart Color Night Vision & Weatherproofing',
        content: 'Ensure all outdoor cameras feature minimum IP66 or IP67 weatherproof ratings to resist Sylhet rainy season downpours. ColorVu and smart infrared cameras maintain vivid full-color recording even in pitch-black midnight environments.',
      },
      {
        heading: '3. Hard Drive Surveillance Storage Calculation',
        content: 'Always install dedicated surveillance-grade hard drives (such as Western Digital Purple or Seagate SkyHawk). A 4-camera setup with H.265+ compression on a 1TB drive provides approximately 15 to 20 days of continuous 24/7 video backup.',
      },
      {
        heading: '4. Live Remote Viewing on Android & iPhone',
        content: 'Our technicians configure your DVR or NVR with secure cloud P2P mobile apps (Hik-Connect, EZVIZ, or DMSS). You can view live feeds, rewind historical recordings, and receive motion detection alerts on your smartphone anywhere in the world.',
      },
    ],
    faqs: [
      {
        question: 'Can NEED ELECTRO technicians install CCTV at my home in Moulvibazar?',
        answer: 'Yes! Our certified technicians handle complete site survey, cabling, camera mounting, DVR setup, and mobile viewing configuration across Moulvibazar, Sreemangal, Kulaura, and Rajnagar.',
      },
      {
        question: 'Can I view my CCTV cameras from abroad or Dhaka on my mobile phone?',
        answer: 'Yes. All our CCTV installations feature P2P cloud connectivity, allowing you to watch live feeds securely from anywhere via Wi-Fi or mobile data.',
      },
    ],
  },
  {
    id: 'blog-4',
    slug: 'home-electrical-safety-tips',
    title: 'Essential Home Electrical Safety Tips: Prevent Short Circuits & Fire Hazards',
    bnTitle: 'বাসাবাড়ির ইলেকট্রিক্যাল সেফটি টিপস: শর্ট সার্কিট ও দুর্ঘটনা এড়ানোর উপায়',
    description: 'Learn critical electrical safety measures for homes and commercial buildings in Moulvibazar. Choosing the right circuit breakers, grounding/earthing systems, and certified electrician inspections.',
    category: 'Electrical',
    publishedDate: '2026-03-15',
    readingTime: '5 min read',
    author: 'Amdadur Rahman',
    summary: 'Electrical faults and short circuits cause severe property damage. Follow these certified electrician safety recommendations to safeguard your residential and commercial wiring in Moulvibazar.',
    sections: [
      {
        heading: '1. Install Certified Miniature Circuit Breakers (MCB) & RCCB',
        content: 'Never rely on obsolete fuse wire systems. Install high-grade MCBs to protect circuits against overload and short circuits. Furthermore, Residual Current Circuit Breakers (RCCB) prevent fatal electric shocks by instantly tripping if current leaks to ground.',
      },
      {
        heading: '2. Importance of Proper Grounding (Earthing)',
        content: 'In Sylhet and Moulvibazar, heavy monsoon thunderstorms and lightning strikes are frequent. A copper earthing rod driven deep into moist soil protects delicate electronics, refrigerators, laptops, and air conditioners from high-voltage electrical surges.',
      },
      {
        heading: '3. Avoid Overloading Multi-Plugs & Sockets',
        content: 'Connecting heavy inductive loads (such as heaters, kettles, and high-tonnage AC units) to cheap plastic multi-plugs is a major fire hazard. Ensure heavy appliances have dedicated 16A or 20A wiring directly connected to the main distribution board.',
      },
      {
        heading: '4. Schedule Periodic Professional Inspections',
        content: 'Wiring older than 5 years should be checked with an insulation resistance meter (Megger) to detect hidden insulation degradation. NEED ELECTRO provides certified residential and commercial electrical inspection services across Moulvibazar.',
      },
    ],
    faqs: [
      {
        question: 'How do I book an electrician in Moulvibazar town?',
        answer: 'You can book an expert electrician directly on our website or call +880 1733-983752. Our team handles wiring, DB boards, lighting, and troubleshooting.',
      },
    ],
  },
  {
    id: 'blog-5',
    slug: 'laptop-emi-installment-guide-moulvibazar',
    title: 'Laptop EMI in Moulvibazar: How to Buy Laptops with Easy Monthly Installments',
    bnTitle: 'মৌলভীবাজারে কিস্তিতে ল্যাপটপ কেনার সহজ নিয়ম ও সুবিধা (Laptop EMI Guide)',
    description: 'Complete guide to laptop financing and EMI in Moulvibazar. Learn eligibility requirements, down payment structures, installment durations (3 to 12 months), and ownership terms at NEED ELECTRO.',
    category: 'Financing',
    publishedDate: '2026-03-18',
    readingTime: '6 min read',
    author: 'Amdadur Rahman',
    summary: 'You do not need to pay the full price upfront to get a high-performance laptop for your studies, career, or business. Discover how NEED ELECTRO makes laptop ownership easy with transparent EMI in Moulvibazar.',
    sections: [
      {
        heading: '1. What is Laptop EMI at NEED ELECTRO?',
        content: 'Equated Monthly Installment (EMI) allows customers to take home their desired laptop by paying an affordable down payment (typically 20% to 30%), with the remaining balance divided into equal monthly payments over 3, 6, 9, or 12 months.',
      },
      {
        heading: '2. Who is Eligible for Laptop EMI in Moulvibazar?',
        content: 'Eligibility is straightforward. Applicants must be Bangladeshi citizens with a valid National ID (NID) card, permanent or verified resident address in Moulvibazar or Sylhet Division, and provide one local guarantor (family member, business owner, or teacher).',
      },
      {
        heading: '3. Required Documents for EMI Application',
        content: '1. Applicant National ID (NID) photocopy and passport photo. 2. Utility bill (electricity/gas) of residence. 3. Guarantor NID photocopy and contact phone number. 4. Student ID card or job employment letter (if applicable).',
      },
      {
        heading: '4. Warranty Protection During Installment Period',
        content: 'Your laptop warranty remains completely active throughout the EMI tenure. You receive the exact same 7-day replacement warranty and 2-year service warranty as full cash buyers.',
      },
    ],
    faqs: [
      {
        question: 'Is a credit card required for laptop EMI at NEED ELECTRO?',
        answer: 'No credit card is mandatory! We offer in-house direct installment management through our ERP system with NID and local guarantor verification.',
      },
      {
        question: 'Can I pay my monthly installments through bKash or Nagad?',
        answer: 'Yes! Customers can pay their monthly installment via bKash, Nagad, bank transfer, or directly at our Kusumbag, Moulvibazar showroom.',
      },
    ],
  },
  {
    id: 'blog-6',
    slug: 'hp-elitebook-series-price-guide-bangladesh',
    title: 'HP EliteBook Price in Bangladesh: 840 G3 to G8 Comparison & Buying Guide',
    bnTitle: 'বাংলাদেশে এইচপি এলিটবুক ল্যাপটপের দাম ও পূর্ণাঙ্গ মডেল তুলনা গাইড',
    description: 'Detailed HP EliteBook price in Bangladesh breakdown. Compare HP EliteBook 840 G3, G5, G6, G7, and G8 specifications, thermal performance, battery backup, and current market prices at NEED ELECTRO.',
    category: 'Laptops',
    publishedDate: '2026-03-22',
    readingTime: '7 min read',
    author: 'Amdadur Rahman',
    summary: 'The HP EliteBook series dominates the business and student laptop market in Bangladesh. Discover why the 840 series offers the best value for money, durable aluminum construction, and smooth multitasking performance.',
    sections: [
      {
        heading: '1. Why HP EliteBook is the #1 Business Laptop in Bangladesh',
        content: 'HP EliteBook laptops are engineered with CNC-machined aluminum chassis, spill-resistant backlit keyboards, and Bang & Olufsen tuned audio. They are designed for military-standard MIL-STD-810G durability, making them far sturdier than plastic consumer laptops.',
      },
      {
        heading: '2. HP EliteBook 840 G5 vs G6 vs G7 Comparison',
        content: 'The EliteBook 840 G5 and G6 feature 8th Gen Quad-Core Intel processors with dual-channel upgradable DDR4 RAM slots. The 840 G7 introduces a sleeker narrow-bezel design, 10th Gen Intel processors, and improved battery runtime exceeding 5 to 7 hours.',
      },
      {
        heading: '3. Current Price Range in Bangladesh (2026)',
        content: 'Pre-owned and certified refurbished HP EliteBooks range from ৳22,000 to ৳45,000 BDT depending on generation and configuration. Every unit sold by NEED ELECTRO includes an authentic HP charger, 7-day replacement warranty, and 2-year service warranty.',
      },
      {
        heading: '4. Buying Safely in Moulvibazar & Nationwide Delivery',
        content: 'Customers in Moulvibazar can reach our operations base for direct pickup and testing. We also ship across all 64 districts of Bangladesh via courier with open-box verification before payment.',
      },
    ],
    faqs: [
      {
        question: 'What is the price of an HP EliteBook 840 in Bangladesh?',
        answer: 'At NEED ELECTRO, HP EliteBook 840 laptops start from approximately ৳22,500 for G3/G4 models up to ৳45,000+ for G7/G8 configurations with SSD and 16GB RAM.',
      },
      {
        question: 'Can I upgrade RAM and SSD on HP EliteBook 840 laptops?',
        answer: 'Yes! Unlike soldered ultrabooks, the HP EliteBook 840 series features two SO-DIMM RAM slots (supporting up to 32GB or 64GB) and standard M.2 NVMe SSD slots.',
      },
    ],
  },
  {
    id: 'blog-7',
    slug: 'laptop-ram-ssd-upgrade-guide-bangladesh',
    title: 'Laptop RAM and SSD Upgrade Guide: Double Your PC Speed in Bangladesh',
    bnTitle: 'ল্যাপটপের র‍্যাম ও এসএসডি আপগ্রেড গাইড: পুরনো ল্যাপটপের গতি দ্বিগুণ করুন',
    description: 'Learn how upgrading from HDD to NVMe SSD and adding DDR4/DDR5 RAM can restore lightning-fast responsiveness to your laptop or desktop PC. Price guide and installation steps in Moulvibazar.',
    category: 'Computers',
    publishedDate: '2026-03-25',
    readingTime: '5 min read',
    author: 'Amdadur Rahman',
    summary: 'Before spending ৳50,000 on a brand-new laptop, a ৳3,000 to ৳6,000 upgrade to a high-speed SSD and additional RAM can make your existing machine run 5 times faster. Here is how it works.',
    sections: [
      {
        heading: '1. Why Traditional Hard Drives (HDD) Cause Extreme Slowness',
        content: 'Traditional 5400 RPM hard drives have read/write speeds of only 80-120 MB/s. Modern Windows 11 updates constantly hammer the disk with background tasks, pegging disk usage at 100%. Upgrading to a SATA or NVMe SSD (delivering 500 to 3,500+ MB/s) cures this bottleneck instantly.',
      },
      {
        heading: '2. Choosing Between DDR3, DDR4, and DDR5 RAM',
        content: 'Check your CPU generation before buying. 4th to 5th gen laptops use DDR3L, 6th to 11th gen use DDR4 SO-DIMM, and 12th gen+ use DDR5. Moving from 4GB or 8GB to 16GB dual-channel allows effortless multitasking without stutter.',
      },
      {
        heading: '3. Professional Cloned OS Migration at NEED ELECTRO',
        content: 'You do not need to lose your files or reinstall Windows. Our Moulvibazar technician team provides 1-to-1 disk cloning, transferring all your software, documents, and license keys directly to your new NVMe SSD in under 30 minutes.',
      },
    ],
    faqs: [
      {
        question: 'How much does an SSD upgrade cost in Bangladesh?',
        answer: 'A high-quality 256GB NVMe SSD costs approximately ৳2,200 to ৳2,800 BDT, while 512GB drives range from ৳3,800 to ৳4,800 BDT including cloning and installation.',
      },
      {
        question: 'Will an SSD upgrade improve gaming and video editing?',
        answer: 'Yes! Games load in seconds, video project timelines scrub smoothly, and render cache writing becomes virtually instantaneous.',
      },
    ],
  },
];
