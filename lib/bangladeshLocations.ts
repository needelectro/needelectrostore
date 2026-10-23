// NEED ELECTRO — Bangladesh 8 Divisions & 64 Districts Geographic Dataset
// Authoritative geographic structure according to Bangladesh administrative divisions.

export interface Division {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  districts: string[];
}

export interface District {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  divisionId: string;
  divisionSlug: string;
  deliveryTimeHours: string;
  deliveryChargeBdt: number;
  courierPartners: string[];
  serviceAvailability: {
    hasOnSiteElectrical: boolean;
    hasOnSiteCctv: boolean;
    hasOnSiteLaptopRepair: boolean;
    hasRemoteSupport: boolean;
    hasSoftwareServices: boolean;
    notesEn: string;
    notesBn: string;
  };
  isIndexable: boolean;
  seoTitle: string;
  seoDescription: string;
}

export const BANGLADESH_DIVISIONS: Division[] = [
  {
    id: 'sylhet',
    nameEn: 'Sylhet Division',
    nameBn: 'সিলেট বিভাগ',
    slug: 'sylhet-division',
    districts: ['moulvibazar', 'sylhet', 'habiganj', 'sunamganj'],
  },
  {
    id: 'dhaka',
    nameEn: 'Dhaka Division',
    nameBn: 'ঢাকা বিভাগ',
    slug: 'dhaka-division',
    districts: [
      'dhaka', 'faridpur', 'gazipur', 'gopalganj', 'kishoreganj',
      'madaripur', 'manikganj', 'munshiganj', 'narayanganj',
      'narsingdi', 'rajbari', 'shariatpur', 'tangail',
    ],
  },
  {
    id: 'chattogram',
    nameEn: 'Chattogram Division',
    nameBn: 'চট্টগ্রাম বিভাগ',
    slug: 'chattogram-division',
    districts: [
      'bandarban', 'brahmanbaria', 'chandpur', 'chattogram', 'coxs-bazar',
      'cumilla', 'feni', 'khagrachhari', 'lakshmipur', 'noakhali', 'rangamati',
    ],
  },
  {
    id: 'rajshahi',
    nameEn: 'Rajshahi Division',
    nameBn: 'রাজশাহী বিভাগ',
    slug: 'rajshahi-division',
    districts: [
      'bogura', 'joypurhat', 'naogaon', 'natore',
      'chapainawabganj', 'pabna', 'rajshahi', 'sirajganj',
    ],
  },
  {
    id: 'khulna',
    nameEn: 'Khulna Division',
    nameBn: 'খুলনা বিভাগ',
    slug: 'khulna-division',
    districts: [
      'bagerhat', 'chuadanga', 'jashore', 'jhenaidah', 'khulna',
      'kushtia', 'magura', 'meherpur', 'narail', 'satkhira',
    ],
  },
  {
    id: 'barishal',
    nameEn: 'Barishal Division',
    nameBn: 'বরিশাল বিভাগ',
    slug: 'barishal-division',
    districts: [
      'barguna', 'barishal', 'bhola', 'jhalokati', 'patuakhali', 'pirojpur',
    ],
  },
  {
    id: 'rangpur',
    nameEn: 'Rangpur Division',
    nameBn: 'রংপুর বিভাগ',
    slug: 'rangpur-division',
    districts: [
      'dinajpur', 'gaibandha', 'kurigram', 'lalmonirhat',
      'nilphamari', 'panchagarh', 'rangpur', 'thakurgaon',
    ],
  },
  {
    id: 'mymensingh',
    nameEn: 'Mymensingh Division',
    nameBn: 'ময়মনসিংহ বিভাগ',
    slug: 'mymensingh-division',
    districts: ['jamalpur', 'mymensingh', 'netrokona', 'sherpur'],
  },
];

// Helper to create uniform district records with accurate service constraints
function createDistrict(
  id: string,
  nameEn: string,
  nameBn: string,
  slug: string,
  divisionId: string,
  divisionSlug: string,
  overrides?: Partial<District>
): District {
  const isMoulvibazar = id === 'moulvibazar';
  const isSylhetDivision = divisionId === 'sylhet';

  const defaultDeliveryCharge = isSylhetDivision ? 60 : 120;
  const defaultDeliveryTime = isMoulvibazar
    ? 'Same-day or next-day delivery'
    : isSylhetDivision
    ? '24 to 48 hours'
    : '48 to 72 hours';

  // Accurate service availability (Section 9 & Section 11 of master prompt)
  const serviceAvailability = isMoulvibazar
    ? {
        hasOnSiteElectrical: true,
        hasOnSiteCctv: true,
        hasOnSiteLaptopRepair: true,
        hasRemoteSupport: true,
        hasSoftwareServices: true,
        notesEn: 'Central operations base with full on-site technician dispatch, CCTV installation, and electrical servicing.',
        notesBn: 'সেন্ট্রাল অপারেশনাল বেস: সরাসরি অন-সাইট টেকনিশিয়ান সার্ভিস, সিসিটিভি ইনস্টলেশন এবং ইলেকট্রিশিয়ান সাপোর্ট।',
      }
    : isSylhetDivision
    ? {
        hasOnSiteElectrical: true,
        hasOnSiteCctv: true,
        hasOnSiteLaptopRepair: false,
        hasRemoteSupport: true,
        hasSoftwareServices: true,
        notesEn: 'Scheduled on-site CCTV projects and commercial electrical contracts available. Laptops serviced via express courier to Moulvibazar lab.',
        notesBn: 'শিডিউল সাপেক্ষে সিসিটিভি প্রজেক্ট ও কমার্শিয়াল ইলেকট্রিক্যাল কাজ উপলব্ধ। ল্যাপটপ কুরিয়ার সার্ভিসে গ্রহণ করা হয়।',
      }
    : {
        hasOnSiteElectrical: false,
        hasOnSiteCctv: false,
        hasOnSiteLaptopRepair: false,
        hasRemoteSupport: true,
        hasSoftwareServices: true,
        notesEn: 'Nationwide courier product delivery with cash-on-delivery. Remote IT support and custom software/ERP development available. On-site corporate projects upon custom consultation.',
        notesBn: 'সারাদেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা। রিমোট আইটি সাপোর্ট ও কাস্টম সফটওয়্যার/ইআরপি সমাধান উপলব্ধ।',
      };

  // Bing compliant titles (<= 60 chars) and meta descriptions (50-158 chars)
  const defaultTitle = isMoulvibazar
    ? 'Computer & Laptop Shop in Moulvibazar | NEED ELECTRO'
    : `${nameEn} Tech & Laptops | NEED ELECTRO`.slice(0, 60);
  const defaultDescription = isMoulvibazar
    ? `Moulvibazar's trusted computer & laptop shop. Buy genuine HP, Dell, Lenovo laptops, desktop PCs, and CCTV cameras with warranty & fast local delivery.`
    : `Buy laptops, CCTV cameras and electrical components in ${nameEn}. Fast nationwide delivery, cash on delivery and warranty at NEED ELECTRO.`;

  return {
    id,
    nameEn,
    nameBn,
    slug,
    divisionId,
    divisionSlug,
    deliveryTimeHours: defaultDeliveryTime,
    deliveryChargeBdt: defaultDeliveryCharge,
    courierPartners: ['Steadfast Courier', 'RedX', 'Sundarban Courier'],
    serviceAvailability,
    isIndexable: true,
    seoTitle: defaultTitle,
    seoDescription: defaultDescription,
    ...overrides,
  };
}

export const BANGLADESH_DISTRICTS: District[] = [
  // --- Sylhet Division (4 Districts) ---
  createDistrict('moulvibazar', 'Moulvibazar', 'মৌলভীবাজার', 'moulvibazar', 'sylhet', 'sylhet-division', {
    seoTitle: 'Moulvibazar Tech & Laptops | NEED ELECTRO',
    seoDescription: 'Explore laptops, computers, CCTV & electrical solutions in Moulvibazar. Official warranty, local technician support, and express delivery.',
  }),
  createDistrict('sylhet', 'Sylhet', 'সিলেট', 'sylhet', 'sylhet', 'sylhet-division', {
    seoTitle: 'Sylhet Tech & Laptop Store | NEED ELECTRO',
    seoDescription: 'Buy authentic laptops, CCTV cameras & electrical components in Sylhet. 24-hour express courier delivery and warranty protection.',
  }),
  createDistrict('habiganj', 'Habiganj', 'হবিগঞ্জ', 'habiganj', 'sylhet', 'sylhet-division', {
    seoTitle: 'Habiganj Tech & Laptops | NEED ELECTRO',
    seoDescription: 'Buy genuine laptops, CCTV security cameras and electrical supplies in Habiganj. Fast courier delivery, warranty, and cash on delivery.',
  }),
  createDistrict('sunamganj', 'Sunamganj', 'সুনামগঞ্জ', 'sunamganj', 'sylhet', 'sylhet-division', {
    seoTitle: 'Sunamganj Tech & Laptops | NEED ELECTRO',
    seoDescription: 'Order laptops, desktop PCs and CCTV cameras online in Sunamganj. Express delivery from Moulvibazar hub with authentic warranty.',
  }),

  // --- Dhaka Division (13 Districts) ---
  createDistrict('dhaka', 'Dhaka', 'ঢাকা', 'dhaka', 'dhaka', 'dhaka-division', {
    seoTitle: 'Dhaka Tech & Laptop Store | NEED ELECTRO',
    seoDescription: 'Buy authentic laptops, computers and CCTV cameras delivered to Dhaka. Cash on delivery, open-box inspection and brand warranty.',
  }),
  createDistrict('gazipur', 'Gazipur', 'গাজীপুর', 'gazipur', 'dhaka', 'dhaka-division', {
    seoTitle: 'Gazipur Tech & Laptops | NEED ELECTRO',
    seoDescription: 'Shop laptops, CCTV systems and electrical supplies online in Gazipur. Fast courier delivery, cash on delivery and warranty protection.',
  }),
  createDistrict('narayanganj', 'Narayanganj', 'নারায়ণগঞ্জ', 'narayanganj', 'dhaka', 'dhaka-division', {
    seoTitle: 'Narayanganj Tech & Laptops | NEED ELECTRO',
    seoDescription: 'Buy genuine laptops, CCTV security systems and electrical products in Narayanganj. Doorstep delivery with verified warranty support.',
  }),
  createDistrict('faridpur', 'Faridpur', 'ফরিদপুর', 'faridpur', 'dhaka', 'dhaka-division'),
  createDistrict('gopalganj', 'Gopalganj', 'গোপালগঞ্জ', 'gopalganj', 'dhaka', 'dhaka-division'),
  createDistrict('kishoreganj', 'Kishoreganj', 'কিশোরগঞ্জ', 'kishoreganj', 'dhaka', 'dhaka-division'),
  createDistrict('madaripur', 'Madaripur', 'মাদারীপুর', 'madaripur', 'dhaka', 'dhaka-division'),
  createDistrict('manikganj', 'Manikganj', 'মানিকগঞ্জ', 'manikganj', 'dhaka', 'dhaka-division'),
  createDistrict('munshiganj', 'Munshiganj', 'মুন্সিগঞ্জ', 'munshiganj', 'dhaka', 'dhaka-division'),
  createDistrict('narsingdi', 'Narsingdi', 'নরসিংদী', 'narsingdi', 'dhaka', 'dhaka-division'),
  createDistrict('rajbari', 'Rajbari', 'রাজবাড়ী', 'rajbari', 'dhaka', 'dhaka-division'),
  createDistrict('shariatpur', 'Shariatpur', 'শরীয়তপুর', 'shariatpur', 'dhaka', 'dhaka-division'),
  createDistrict('tangail', 'Tangail', 'টাঙ্গাইল', 'tangail', 'dhaka', 'dhaka-division'),

  // --- Chattogram Division (11 Districts) ---
  createDistrict('chattogram', 'Chattogram', 'চট্টগ্রাম', 'chattogram', 'chattogram', 'chattogram-division', {
    seoTitle: 'Chattogram Tech & Laptops | NEED ELECTRO',
    seoDescription: 'Order laptops, CCTV cameras and computer accessories in Chattogram. Verified warranty, cash on delivery and fast courier shipping.',
  }),
  createDistrict('coxs-bazar', "Cox's Bazar", 'কক্সবাজার', 'coxs-bazar', 'chattogram', 'chattogram-division'),
  createDistrict('cumilla', 'Cumilla', 'কুমিল্লা', 'cumilla', 'chattogram', 'chattogram-division'),
  createDistrict('feni', 'Feni', 'ফেনী', 'feni', 'chattogram', 'chattogram-division'),
  createDistrict('brahmanbaria', 'Brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 'brahmanbaria', 'chattogram', 'chattogram-division'),
  createDistrict('chandpur', 'Chandpur', 'চাঁদপুর', 'chandpur', 'chattogram', 'chattogram-division'),
  createDistrict('noakhali', 'Noakhali', 'নোয়াখালী', 'noakhali', 'chattogram', 'chattogram-division'),
  createDistrict('lakshmipur', 'Lakshmipur', 'লক্ষ্মীপুর', 'lakshmipur', 'chattogram', 'chattogram-division'),
  createDistrict('bandarban', 'Bandarban', 'বান্দরবান', 'bandarban', 'chattogram', 'chattogram-division'),
  createDistrict('khagrachhari', 'Khagrachhari', 'খাগড়াছড়ি', 'khagrachhari', 'chattogram', 'chattogram-division'),
  createDistrict('rangamati', 'Rangamati', 'রাঙামাটি', 'rangamati', 'chattogram', 'chattogram-division'),

  // --- Rajshahi Division (8 Districts) ---
  createDistrict('rajshahi', 'Rajshahi', 'রাজশাহী', 'rajshahi', 'rajshahi', 'rajshahi-division', {
    seoTitle: 'Rajshahi Tech & Laptops | NEED ELECTRO',
    seoDescription: 'Buy authentic laptops, computers and CCTV equipment in Rajshahi. Doorstep courier delivery, verified warranty and cash on delivery.',
  }),
  createDistrict('bogura', 'Bogura', 'বগুড়া', 'bogura', 'rajshahi', 'rajshahi-division'),
  createDistrict('pabna', 'Pabna', 'পাবনা', 'pabna', 'rajshahi', 'rajshahi-division'),
  createDistrict('sirajganj', 'Sirajganj', 'সিরাজগঞ্জ', 'sirajganj', 'rajshahi', 'rajshahi-division'),
  createDistrict('naogaon', 'Naogaon', 'নওগাঁ', 'naogaon', 'rajshahi', 'rajshahi-division'),
  createDistrict('natore', 'Natore', 'নাটোর', 'natore', 'rajshahi', 'rajshahi-division'),
  createDistrict('joypurhat', 'Joypurhat', 'জয়পুরহাট', 'joypurhat', 'rajshahi', 'rajshahi-division'),
  createDistrict('chapainawabganj', 'Chapainawabganj', 'চাঁপাইনবাবগঞ্জ', 'chapainawabganj', 'rajshahi', 'rajshahi-division'),

  // --- Khulna Division (10 Districts) ---
  createDistrict('khulna', 'Khulna', 'খুলনা', 'khulna', 'khulna', 'khulna-division', {
    seoTitle: 'Khulna Tech & Laptop Store | NEED ELECTRO',
    seoDescription: 'Shop enterprise laptops, desktop computers and CCTV cameras in Khulna. 48-72h door delivery with warranty and cash on delivery.',
  }),
  createDistrict('jashore', 'Jashore', 'যশোর', 'jashore', 'khulna', 'khulna-division'),
  createDistrict('kushtia', 'Kushtia', 'কুষ্টিয়া', 'kushtia', 'khulna', 'khulna-division'),
  createDistrict('jhenaidah', 'Jhenaidah', 'ঝিনাইদহ', 'jhenaidah', 'khulna', 'khulna-division'),
  createDistrict('satkhira', 'Satkhira', 'সাতক্ষীরা', 'satkhira', 'khulna', 'khulna-division'),
  createDistrict('bagerhat', 'Bagerhat', 'বাগেরহাট', 'bagerhat', 'khulna', 'khulna-division'),
  createDistrict('chuadanga', 'Chuadanga', 'চুয়াডাঙ্গা', 'chuadanga', 'khulna', 'khulna-division'),
  createDistrict('magura', 'Magura', 'মাগুরা', 'magura', 'khulna', 'khulna-division'),
  createDistrict('meherpur', 'Meherpur', 'মেহেরপুর', 'meherpur', 'khulna', 'khulna-division'),
  createDistrict('narail', 'Narail', 'নড়াইল', 'narail', 'khulna', 'khulna-division'),

  // --- Barishal Division (6 Districts) ---
  createDistrict('barishal', 'Barishal', 'বরিশাল', 'barishal', 'barishal', 'barishal-division', {
    seoTitle: 'Barishal Tech & Laptops | NEED ELECTRO',
    seoDescription: 'Buy laptops, CCTV cameras and computer accessories in Barishal. Reliable courier delivery, cash on delivery and warranty protection.',
  }),
  createDistrict('bhola', 'Bhola', 'ভোলা', 'bhola', 'barishal', 'barishal-division'),
  createDistrict('patuakhali', 'Patuakhali', 'পটুয়াখালী', 'patuakhali', 'barishal', 'barishal-division'),
  createDistrict('pirojpur', 'Pirojpur', 'পিরোজপুর', 'pirojpur', 'barishal', 'barishal-division'),
  createDistrict('barguna', 'Barguna', 'বরগুনা', 'barguna', 'barishal', 'barishal-division'),
  createDistrict('jhalokati', 'Jhalokati', 'ঝালকাঠি', 'jhalokati', 'barishal', 'barishal-division'),

  // --- Rangpur Division (8 Districts) ---
  createDistrict('rangpur', 'Rangpur', 'রংপুর', 'rangpur', 'rangpur', 'rangpur-division', {
    seoTitle: 'Rangpur Tech & Laptop Store | NEED ELECTRO',
    seoDescription: 'Explore laptops, desktop PCs and CCTV surveillance systems in Rangpur. 48-72h doorstep delivery, cash on delivery and brand warranty.',
  }),
  createDistrict('dinajpur', 'Dinajpur', 'দিনাজপুর', 'dinajpur', 'rangpur', 'rangpur-division'),
  createDistrict('gaibandha', 'Gaibandha', 'গাইবান্ধা', 'gaibandha', 'rangpur', 'rangpur-division'),
  createDistrict('kurigram', 'Kurigram', 'কুড়িগ্রাম', 'kurigram', 'rangpur', 'rangpur-division'),
  createDistrict('lalmonirhat', 'Lalmonirhat', 'লালমনিরহাট', 'lalmonirhat', 'rangpur', 'rangpur-division'),
  createDistrict('nilphamari', 'Nilphamari', 'নীলফামারী', 'nilphamari', 'rangpur', 'rangpur-division'),
  createDistrict('panchagarh', 'Panchagarh', 'পঞ্চগড়', 'panchagarh', 'rangpur', 'rangpur-division'),
  createDistrict('thakurgaon', 'Thakurgaon', 'ঠাকুরগাঁও', 'thakurgaon', 'rangpur', 'rangpur-division'),

  // --- Mymensingh Division (4 Districts) ---
  createDistrict('mymensingh', 'Mymensingh', 'ময়মনসিংহ', 'mymensingh', 'mymensingh', 'mymensingh-division', {
    seoTitle: 'Mymensingh Tech & Laptops | NEED ELECTRO',
    seoDescription: 'Buy authentic laptops, computers and CCTV cameras in Mymensingh. Fast courier delivery, cash on delivery and official warranty support.',
  }),
  createDistrict('jamalpur', 'Jamalpur', 'জামালপুর', 'jamalpur', 'mymensingh', 'mymensingh-division'),
  createDistrict('netrokona', 'Netrokona', 'নেত্রকোনা', 'netrokona', 'mymensingh', 'mymensingh-division'),
  createDistrict('sherpur', 'Sherpur', 'শেরপুর', 'sherpur', 'mymensingh', 'mymensingh-division'),
];

// Helper Functions
export function getAllDivisions(): Division[] {
  return BANGLADESH_DIVISIONS;
}

export function getAllDistricts(): District[] {
  return BANGLADESH_DISTRICTS;
}

export function getDivisionBySlug(slug: string): Division | undefined {
  const clean = slug.toLowerCase().trim();
  return BANGLADESH_DIVISIONS.find((d) => d.slug === clean || d.id === clean);
}

export function getDistrictBySlug(slug: string): District | undefined {
  const clean = slug.toLowerCase().trim();
  return BANGLADESH_DISTRICTS.find((d) => d.slug === clean || d.id === clean);
}

export function getDistrictsByDivision(divisionId: string): District[] {
  return BANGLADESH_DISTRICTS.filter((d) => d.divisionId === divisionId);
}

export function getDistrictNamesList(): string[] {
  return BANGLADESH_DISTRICTS.map((d) => d.nameEn);
}

export function calculateDeliveryCharge(districtNameOrSlug: string): number {
  const clean = districtNameOrSlug.toLowerCase().trim();
  const district = BANGLADESH_DISTRICTS.find(
    (d) => d.nameEn.toLowerCase() === clean || d.slug === clean || d.id === clean
  );
  if (!district) return 120; // Default outside Sylhet division
  return district.deliveryChargeBdt;
}
