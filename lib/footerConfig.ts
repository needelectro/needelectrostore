// Centralized Footer & Verified Social Link Configuration for NEED ELECTRO
// Strictly enforces publishing rules: Only verified, domain-whitelisted HTTPS destinations are rendered.

export type SocialPlatform = 'Facebook' | 'Instagram' | 'YouTube' | 'LinkedIn';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  verified: boolean;
  handle: string;
  ariaLabel: {
    en: string;
    bn: string;
  };
  notes?: string;
}

export interface FooterSettings {
  mainWebsiteUrl: string;
  mainWebsiteLabel: {
    en: string;
    bn: string;
  };
  mainWebsitePurpose: {
    en: string;
    bn: string;
  };
  storeUrl: string;
  storeLabel: {
    en: string;
    bn: string;
  };
  storePurpose: {
    en: string;
    bn: string;
  };
  socialLinks: SocialLink[];
}

export const FOOTER_SETTINGS: FooterSettings = {
  // Main company & services website (Corporate, Electrical & Technical Solutions)
  mainWebsiteUrl: 'https://www.needelectro.com',
  mainWebsiteLabel: {
    en: 'NEED ELECTRO — Electrical & Technical Services',
    bn: 'নিড ইলেক্ট্রো — ইলেকট্রিক্যাল ও টেকনিক্যাল সার্ভিসেস',
  },
  mainWebsitePurpose: {
    en: 'Explore electrical engineering services, technical solutions, industrial installations, troubleshooting, and enterprise maintenance.',
    bn: 'ইলেকট্রিক্যাল ইঞ্জিনিয়ারিং সার্ভিস, টেকনিক্যাল সলিউশনস, ইন্ডাস্ট্রিয়াল ইন্সটলেশন এবং এন্টারপ্রাইজ মেইনটেন্যান্স দেখুন।',
  },

  // E-Commerce Product Marketplace (Retail, Hardware, Laptops & Accessories)
  storeUrl: 'https://www.needelectro.store',
  storeLabel: {
    en: 'NEED ELECTRO Store',
    bn: 'নিড ইলেক্ট্রো স্টোর',
  },
  storePurpose: {
    en: 'Browse original laptops, custom desktop PCs, CCTV surveillance equipment, electrical products, and gadgets with nationwide delivery.',
    bn: 'জেনুইন ল্যাপটপ, কাস্টম ডেস্কটপ পিসি, সিসিটিভি ক্যামেরা, ইলেকট্রিক্যাল পণ্য ও গ্যাজেট কিনুন হোম ডেলিভারিসহ।',
  },

  // Candidate and verified social media configuration
  socialLinks: [
    {
      platform: 'Facebook',
      url: 'https://facebook.com/needelectro',
      verified: true,
      handle: '@needelectro',
      ariaLabel: {
        en: 'NEED ELECTRO on Facebook',
        bn: 'ফেসবুকে নিড ইলেক্ট্রো',
      },
      notes: 'Verified Official Facebook Page for NEED ELECTRO (Moulvibazar & Bangladesh). Active customer updates & support.',
    },
    {
      platform: 'Facebook',
      url: 'https://facebook.com/needelectron',
      verified: false,
      handle: '@needelectron',
      ariaLabel: {
        en: 'NEED ELECTRO on Facebook (Secondary Handle)',
        bn: 'ফেসবুকে নিড ইলেক্ট্রো (বিকল্প হ্যান্ডেল)',
      },
      notes: 'Secondary/alternate handle variant. Excluded from public footer per rule prohibiting duplicate/alternate destinations.',
    },
    {
      platform: 'Instagram',
      url: 'https://instagram.com/needelectro',
      verified: true,
      handle: '@needelectro',
      ariaLabel: {
        en: 'NEED ELECTRO on Instagram',
        bn: 'ইনস্টাগ্রামে নিড ইলেক্ট্রো',
      },
      notes: 'Verified Official Instagram Profile for NEED ELECTRO. Showcases laptops, hardware, and customer tech stories.',
    },
    {
      platform: 'YouTube',
      url: 'https://youtube.com/@needelectro',
      verified: true,
      handle: '@needelectro',
      ariaLabel: {
        en: 'NEED ELECTRO on YouTube',
        bn: 'ইউটিউবে নিড ইলেক্ট্রো',
      },
      notes: 'Verified Official YouTube Channel for NEED ELECTRO. Product overviews, tech teardowns, and setup guides.',
    },
    {
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/company/need-electro',
      verified: false,
      handle: 'need-electro',
      ariaLabel: {
        en: 'NEED ELECTRO on LinkedIn',
        bn: 'লিংকডইনে নিড ইলেক্ট্রো',
      },
      notes: 'Pending verification. No active official corporate company page currently indexed or claimed. Excluded from public footer.',
    },
  ],
};

// Domain whitelist map for security against arbitrary external URL injection
const PLATFORM_DOMAIN_WHITELIST: Record<SocialPlatform, RegExp> = {
  Facebook: /^https:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+(\/)?$/,
  Instagram: /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+(\/)?$/,
  YouTube: /^https:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9._-]+|[a-zA-Z0-9._-]+)(\/)?$/,
  LinkedIn: /^https:\/\/(www\.)?linkedin\.com\/(company\/[a-zA-Z0-9._-]+|in\/[a-zA-Z0-9._-]+)(\/)?$/,
};

/**
 * Validates a social destination URL against strict security and domain rules.
 */
export function isValidSocialUrl(platform: SocialPlatform, url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const rule = PLATFORM_DOMAIN_WHITELIST[platform];
    return rule ? rule.test(url) : false;
  } catch {
    return false;
  }
}

/**
 * Returns only verified, validated social links safe for public rendering.
 * Strictly guarantees that unverified or invalid URLs are never exposed.
 */
export function getVerifiedSocialLinks(): SocialLink[] {
  return FOOTER_SETTINGS.socialLinks.filter(
    (link) => link.verified === true && isValidSocialUrl(link.platform, link.url)
  );
}
