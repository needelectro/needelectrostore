// Seed default Gallery Categories and Initial Business Update Posts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: 'Laptops & Computers',
    nameBn: 'ল্যাপটপ ও কম্পিউটার',
    slug: 'laptops-computers',
    description: 'High-performance laptops, desktop workstations, and computer systems.',
    sortOrder: 1,
  },
  {
    name: 'Gadgets & Accessories',
    nameBn: 'গ্যাজেটস ও এক্সেসরিজ',
    slug: 'gadgets-accessories',
    description: 'Peripherals, smart watches, headphones, SSDs, and tech accessories.',
    sortOrder: 2,
  },
  {
    name: 'Electrical Products',
    nameBn: 'ইলেকট্রিক্যাল প্রোডাক্টস',
    slug: 'electrical-products',
    description: 'Circuit breakers, distribution boards, switches, and industrial switchgear.',
    sortOrder: 3,
  },
  {
    name: 'New Arrivals',
    nameBn: 'নতুন স্টক ও অ্যারাইভাল',
    slug: 'new-arrivals',
    description: 'Fresh stock shipments and newly arrived technology products.',
    sortOrder: 4,
  },
  {
    name: 'Sales & Offers',
    nameBn: 'স্পেশাল অফার ও ক্যাম্পেইন',
    slug: 'sales-offers',
    description: 'Exclusive seasonal discounts, bundle packages, and special promotions.',
    sortOrder: 5,
  },
  {
    name: 'Customer Deliveries',
    nameBn: 'কাস্টমার ডেলিভারি ও হ্যান্ডওভার',
    slug: 'customer-deliveries',
    description: 'Successful product handovers and doorstep deliveries across Bangladesh.',
    sortOrder: 6,
  },
  {
    name: 'Completed Projects',
    nameBn: 'কমপ্লিটেড প্রজেক্ট ও ওয়্যারিং',
    slug: 'completed-projects',
    description: 'Commercial CCTV installations, solar IPS setups, and certified electrical wiring.',
    sortOrder: 7,
  },
  {
    name: 'Company Activities',
    nameBn: 'কোম্পানি কার্যক্রম ও টিম',
    slug: 'company-activities',
    description: 'Showroom events, technician training, and team milestones.',
    sortOrder: 8,
  },
  {
    name: 'Events & Announcements',
    nameBn: 'ঘোষণা ও ইভেন্টস',
    slug: 'events-announcements',
    description: 'Important store announcements, holiday hours, and official updates.',
    sortOrder: 9,
  },
];

async function seed() {
  console.log('Seeding Gallery Categories...');
  const catMap = new Map();

  for (const cat of CATEGORIES) {
    const upserted = await prisma.galleryCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameBn: cat.nameBn,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        nameBn: cat.nameBn,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    catMap.set(cat.slug, upserted.id);
    console.log(`  - Category: ${cat.name} (${upserted.id})`);
  }

  // Fetch some real products for linking
  const sampleProducts = await prisma.product.findMany({
    where: { status: 'ACTIVE', isPublished: true },
    select: { id: true, name: true, sku: true, category: true, imageUrl: true, retailPrice: true },
    take: 10,
  });

  const hpLaptop = sampleProducts.find(p => p.name.toLowerCase().includes('hp') || p.category.toLowerCase().includes('laptop'));
  const cctvProduct = sampleProducts.find(p => p.category.toLowerCase().includes('cctv') || p.name.toLowerCase().includes('camera'));
  const routerProduct = sampleProducts.find(p => p.category.toLowerCase().includes('network') || p.name.toLowerCase().includes('router') || p.name.toLowerCase().includes('ups'));

  const INITIAL_POSTS = [
    {
      title: 'Fresh Shipment of HP & Dell Business Laptops Arrived at Moulvibazar Showroom',
      titleBn: 'মৌলভীবাজার শোরুমে এইচপি ও ডেল বিজনেস ল্যাপটপের নতুন স্টক এসে পৌঁছেছে',
      slug: 'hp-dell-business-laptops-arrival-moulvibazar',
      description: 'Tested Grade-A business laptops including HP EliteBook 840 G7, 845 G8, and Dell Latitude series now in stock with 15-day replacement and 2-year service warranty. Available with 0% EMI financing.',
      descriptionBn: '১৫ দিনের রিপ্লেসমেন্ট এবং ২ বছরের সার্ভিস ওয়ারেন্টি সহ এইচপি এলিটবুক ও ডেল ল্যাটিটিউড সিরিজের প্রিমিয়াম ল্যাপটপের ফ্রেশ স্টক এখন মৌলভীবাজার শোরুমে। সহজ কিস্তিতে কেনার সুবিধা রয়েছে।',
      categorySlug: 'new-arrivals',
      coverImage: '/banners/need-electro-laptops-flagship.jpg',
      images: [
        {
          url: '/banners/need-electro-laptops-flagship.jpg',
          caption: 'Flagship business laptops on display at NEED ELECTRO showroom, Central Road, Moulvibazar.',
          captionBn: 'নিড ইলেক্ট্রো সেন্ট্রাল রোড শোরুমে ডিসপ্লেতে থাকা প্রিমিয়াম বিজনেস ল্যাপটপ।',
          alt: 'HP and Dell Laptops at NEED ELECTRO Showroom',
          order: 1,
        },
        {
          url: '/banners/laptop-emi-promo-banner.jpg',
          caption: 'Instant laptop EMI consultation available for students and professionals.',
          captionBn: 'শিক্ষার্থী ও পেশাজীবীদের জন্য তাৎক্ষণিক ল্যাপটপ ইএমআই সুবিধা।',
          alt: 'Laptop EMI Financing at NEED ELECTRO',
          order: 2,
        },
      ],
      tags: ['Laptops', 'HP EliteBook', 'Dell Latitude', 'New Arrivals', 'Moulvibazar', 'EMI'],
      productId: hpLaptop ? hpLaptop.id : null,
      destinationUrl: '/laptops',
      isPinned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: 'Turnkey CCTV Camera Security Surveillance Installation at Commercial Complex',
      titleBn: 'বাণিজ্যিক প্রতিষ্ঠানে টার্নকি সিসিটিভি ক্যামেরা সিকিউরিটি সার্ভেইল্যান্স সফলভাবে সম্পন্ন',
      slug: 'turnkey-cctv-camera-installation-moulvibazar',
      description: 'Our certified engineering team completed a comprehensive 8-camera Hikvision IP security surveillance setup with NVR storage and mobile remote live viewing in Moulvibazar.',
      descriptionBn: 'আমাদের দক্ষ ইঞ্জিনিয়ারিং টিম মৌলভীবাজারে ৮-ক্যামেরা বিশিষ্ট হিকভিশন আইপি সিকিউরিটি ক্যামেরা ও এনভিআর সফলভাবে ইনস্টল ও মোবাইল লাইভ ভিউ কনফিগারেশন সম্পন্ন করেছে।',
      categorySlug: 'completed-projects',
      coverImage: '/banners/need-electro-cctv-security.jpg',
      images: [
        {
          url: '/banners/need-electro-cctv-security.jpg',
          caption: 'Hikvision & Dahua HD CCTV surveillance setup and cable structuring.',
          captionBn: 'হিকভিশন ও ডাহুয়া এইচডি সিসিটিভি ক্যামেরা ও ক্যাবল ওয়্যারিং সেটআপ।',
          alt: 'CCTV Installation Project Moulvibazar',
          order: 1,
        },
      ],
      tags: ['CCTV', 'Hikvision', 'Security', 'Installation', 'Moulvibazar'],
      productId: cctvProduct ? cctvProduct.id : null,
      destinationUrl: '/services/cctv-installation',
      isPinned: true,
      isPublished: true,
      publishedAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      title: 'Solar IPS & Pure Sine Wave Inverter Emergency Backup Installation',
      titleBn: 'বাসাবাড়ি ও অফিসের জন্য সোলার আইপিএস ও সাইন ওয়েভ ইনভার্টার পাওয়ার ব্যাকআপ সেটআপ',
      slug: 'solar-ips-inverter-backup-setup',
      description: 'Heavy-duty pure sine wave inverter and tubular deep-cycle battery installation completed by our certified electricians, ensuring zero reboot downtime for computers, Wi-Fi routers, and lighting.',
      descriptionBn: 'কম্পিউটার, ওয়াই-ফাই রাউটার ও প্রয়োজনীয় বাতির জন্য জিরো রিবুট ডাউনটাইম নিশ্চিত করতে আমাদের সার্টিফাইড ইলেকট্রিশিয়ানদের দ্বারা সোলার আইপিএস সেটআপ সম্পন্ন হয়েছে।',
      categorySlug: 'completed-projects',
      coverImage: '/banners/solar-ips-power-banner.jpg',
      images: [
        {
          url: '/banners/solar-ips-power-banner.jpg',
          caption: '24/7 Uninterrupted pure sine wave emergency power backup setup.',
          captionBn: '২৪/৭ নিরবচ্ছিন্ন বিদ্যুৎ ব্যাকআপ সোলার ও আইপিএস ইনভার্টার সেটআপ।',
          alt: 'Solar IPS Power Setup at NEED ELECTRO',
          order: 1,
        },
      ],
      tags: ['Solar IPS', 'Inverter', 'Electrician', 'Power Backup', 'Moulvibazar'],
      productId: null,
      destinationUrl: '/electrical-products',
      isPinned: false,
      isPublished: true,
      publishedAt: new Date(Date.now() - 86400000 * 4),
    },
    {
      title: 'High-Speed Wi-Fi 6 Structured Office Networking & Mesh Setup',
      titleBn: 'হাই-স্পিড ওয়াই-ফাই ৬ অফিস নেটওয়ার্কিং ও মেশ ক্যাবলিং সফলভাবে সম্পন্ন',
      slug: 'wifi-6-office-networking-mesh-setup',
      description: 'Gigabit dual-band Wi-Fi 6 routers and Cat6 structured cabling deployed for seamless connectivity across multiple office floors with zero blind spots.',
      descriptionBn: 'মাল্টি-ফ্লোর অফিসে কোনো ধরনের নেটওয়ার্ক ডেড-জোন ছাড়া দ্রুতগতির গিগাবিট ওয়াই-ফাই ৬ মেশ রাউটার ও ক্যাট-৬ স্ট্রাকচার্ড ক্যাবলিং সম্পন্ন।',
      categorySlug: 'gadgets-accessories',
      coverImage: '/banners/wifi-networking-banner.jpg',
      images: [
        {
          url: '/banners/wifi-networking-banner.jpg',
          caption: 'Structured office networking and dual-band Wi-Fi coverage.',
          captionBn: 'অফিস স্ট্রাকচার্ড নেটওয়ার্কিং এবং ডুয়াল-ব্যান্ড ওয়াই-ফাই কভারেজ।',
          alt: 'Wi-Fi 6 Networking Installation',
          order: 1,
        },
      ],
      tags: ['Networking', 'Wi-Fi 6', 'Router', 'Cat6', 'Moulvibazar'],
      productId: routerProduct ? routerProduct.id : null,
      destinationUrl: '/networking',
      isPinned: false,
      isPublished: true,
      publishedAt: new Date(Date.now() - 86400000 * 6),
    },
    {
      title: 'High-Performance Custom Desktop Workstation Builds for Architects & Creators',
      titleBn: 'আর্কিটেক্ট ও ক্রিয়েটরদের জন্য হাই-পারফরম্যান্স কাস্টম পিসি ওয়ার্কস্টেশন বিল্ড',
      slug: 'custom-desktop-workstation-build-creators',
      description: 'Custom video editing and AutoCAD workstations assembled with high-speed NVMe SSDs, multi-core processors, and thermal-optimized cooling at our Moulvibazar workshop.',
      descriptionBn: 'ভিডিও এডিটিং ও অটো-ক্যাড প্রফেশনালদের জন্য নিড ইলেক্ট্রো ওয়ার্কশপে এসেম্বল করা হাই-স্পিড এনভিএমই এসএসডি ও মাল্টি-কোর প্রসেসর সমন্বিত কাস্টম পিসি।',
      categorySlug: 'laptops-computers',
      coverImage: '/banners/need-electro-custompc-workstation.jpg',
      images: [
        {
          url: '/banners/need-electro-custompc-workstation.jpg',
          caption: 'Custom PC build assembly and stress testing at NEED ELECTRO workshop.',
          captionBn: 'নিড ইলেক্ট্রো ওয়ার্কশপে কাস্টম পিসি এসেম্বলি ও থার্মাল স্ট্রেস টেস্টিং।',
          alt: 'Custom Desktop PC Build Moulvibazar',
          order: 1,
        },
      ],
      tags: ['Desktop PC', 'Custom Workstation', 'Hardware', 'Moulvibazar'],
      productId: null,
      destinationUrl: '/computers',
      isPinned: false,
      isPublished: true,
      publishedAt: new Date(Date.now() - 86400000 * 8),
    },
  ];

  console.log('Seeding Initial Gallery Posts...');
  for (const post of INITIAL_POSTS) {
    const categoryId = catMap.get(post.categorySlug);
    const category = CATEGORIES.find(c => c.slug === post.categorySlug);
    await prisma.galleryPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        titleBn: post.titleBn,
        description: post.description,
        descriptionBn: post.descriptionBn,
        categoryId,
        categoryName: category ? category.name : 'General',
        coverImage: post.coverImage,
        images: post.images,
        tags: post.tags,
        productId: post.productId,
        destinationUrl: post.destinationUrl,
        isPinned: post.isPinned,
        isPublished: post.isPublished,
        publishedAt: post.publishedAt,
      },
      create: {
        title: post.title,
        titleBn: post.titleBn,
        slug: post.slug,
        description: post.description,
        descriptionBn: post.descriptionBn,
        categoryId,
        categoryName: category ? category.name : 'General',
        coverImage: post.coverImage,
        images: post.images,
        tags: post.tags,
        productId: post.productId,
        destinationUrl: post.destinationUrl,
        isPinned: post.isPinned,
        isPublished: post.isPublished,
        publishedAt: post.publishedAt,
      },
    });
    console.log(`  - Post: ${post.title}`);
  }

  console.log('Gallery seeding completed successfully! ✨');
}

seed()
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
