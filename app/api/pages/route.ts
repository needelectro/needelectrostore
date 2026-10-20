// NEED ELECTRO ERP — Pages Management & CMS API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGES = [
  {
    slug: 'about',
    title: 'About NEED ELECTRO',
    titleBn: 'নিড ইলেকট্রো সম্পর্কে',
    seoTitle: 'About Us | Trusted Electrical & Technological Solutions | NEED ELECTRO',
    metaDescription: 'Learn about NEED ELECTRO, our journey, authorized showroom in Moulvibazar, certified technician services, and mission to deliver genuine laptops, CCTV, and electrical goods across Bangladesh.',
    isPublished: true,
    content: `## Welcome to NEED ELECTRO
**NEED ELECTRO** is Bangladesh's trusted destination for electrical and technological solutions. Headquartered in Moulvibazar, Sylhet Division, we bridge the gap between premium enterprise hardware and everyday consumer technology.

### Our Core Offerings
- **Business Laptops**: HP EliteBook, Dell Latitude, Lenovo ThinkPad with rigorous multi-point testing and hardware replacement warranty.
- **Desktop Computers**: Custom PC builds for gaming, graphic design, programming, and commercial offices.
- **CCTV & Security Solutions**: Authorized IP & Analog cameras from Hikvision, Dahua, and Imou with professional site installation.
- **Electrical & Automation**: Industrial circuit breakers, smart home switches, solar IPS inverters, and high-safety wiring accessories.
- **Certified Technician Services**: On-site electrical diagnostics, circuit repair, and computer servicing across Sylhet Division.

### Physical Showroom & Service Center
- **Address**: NEED ELECTRO Building, Central Road, Moulvibazar 3200, Bangladesh
- **Direct Hotline**: +880 1733-983752
- **Email**: contact.amdadur@gmail.com`,
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    titleBn: 'গোপনীয়তা নীতি',
    seoTitle: 'Privacy Policy | Data Protection | NEED ELECTRO',
    metaDescription: 'Read the official Privacy Policy of NEED ELECTRO. How we safeguard customer contact numbers, delivery addresses, and payment data across Bangladesh.',
    isPublished: true,
    content: `## Privacy & Data Protection Policy
At **NEED ELECTRO**, we take the privacy of our customers very seriously. This policy describes how we collect, handle, and protect your personal information when you order online, book a technician, or purchase from our showroom.

### 1. Information We Collect
- Contact details: Full name, phone number, delivery address, and optional email.
- Order details: Products purchased, serial numbers, warranty activation dates, and payment methods.
- Service details: Site location, appliance details, and technician notes.

### 2. How We Use Your Data
- To process, verify, and deliver your hardware orders with doorstep Cash on Delivery.
- To dispatch certified technicians to your address for confirmed service appointments.
- To maintain official warranty records and serial number tracking.
- We **NEVER** sell, rent, or trade your personal data to any third-party advertisers.`,
  },
  {
    slug: 'terms-conditions',
    title: 'Terms and Conditions',
    titleBn: 'শর্তাবলী',
    seoTitle: 'Terms & Conditions | NEED ELECTRO Bangladesh',
    metaDescription: 'Official terms and conditions governing hardware sales, orders, deliveries, warranties, and technical service bookings with NEED ELECTRO.',
    isPublished: true,
    content: `## General Terms & Conditions
By placing an order, booking a service, or visiting **NEED ELECTRO** (website: https://www.needelectro.store), you agree to comply with the terms set forth below.

### 1. Orders and Pricing
- All prices are displayed in Bangladeshi Taka (৳ BDT) and include applicable taxes unless otherwise stated.
- We strive to keep prices accurate. In the rare event of a typographical pricing error, we reserve the right to contact the customer and rectify the order before dispatch.
- Cash on Delivery (COD) is available nationwide across all 64 districts in Bangladesh.

### 2. Product Authenticity & Warranty
- All laptops, CCTV systems, and electrical products sold by NEED ELECTRO are 100% genuine and inspected by our hardware engineering team.
- Official warranty terms are detailed on your purchase invoice and serial tracking record.`,
  },
  {
    slug: 'shipping-policy',
    title: 'Shipping & Delivery Information',
    titleBn: 'ডেলিভারি এবং শিপিং তথ্য',
    seoTitle: 'Shipping & Delivery Policy | Fast Nationwide Delivery | NEED ELECTRO',
    metaDescription: 'Nationwide delivery terms for NEED ELECTRO. Doorstep delivery across Moulvibazar, Sylhet, Dhaka, and all 64 districts in Bangladesh with Cash on Delivery.',
    isPublished: true,
    content: `## Nationwide Shipping & Delivery
NEED ELECTRO provides reliable, rapid shipping for all hardware products across all 64 districts of Bangladesh.

### Delivery Timelines & Charges
- **Moulvibazar Town & Local Area**: Same-day or next-day delivery (Standard rate: ৳60).
- **Sylhet Division**: 24 to 48 hours (Standard rate: ৳60 - ৳100).
- **All Other Districts (Dhaka, Chittagong, Rajshahi, etc.)**: 48 to 72 hours via trusted courier partners (Standard rate: ৳120).
- **Free Delivery**: Available on major orders totaling ৳50,000 or more.

### Open-Box Inspection & Verification
Customers are encouraged to inspect the exterior package and verify hardware authenticity upon delivery before completing payment.`,
  },
  {
    slug: 'warranty-policy',
    title: 'Warranty & Service Policy',
    titleBn: 'ওয়ারেন্টি এবং সার্ভিস পলিসি',
    seoTitle: 'Official Warranty Policy | Hardware Coverage | NEED ELECTRO',
    metaDescription: 'Official warranty terms for NEED ELECTRO hardware. 7-day replacement guarantee, up to 1-year service warranty, and official brand coverage.',
    isPublished: true,
    content: `## Warranty Terms & Coverage
Every hardware purchase from NEED ELECTRO comes with our authentic serial-tracked warranty.

### Warranty Categories
- **7-Day Direct Replacement Guarantee**: For any technical or manufacturing defect discovered within 7 calendar days of purchase.
- **Service Warranty**: Up to 12 months free technical servicing and hardware diagnostics on selected laptops and desktop PCs.
- **Manufacturer Warranty**: Original brand warranties (HP, Dell, Hikvision, Schneider) supported through authorized distribution centers.

### Warranty Exclusions
Physical damage caused by drops, liquid spills, unauthorized third-party repairs, burned components resulting from high-voltage electrical surges, or tampering with serial number stickers are excluded from free replacement.`,
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug')?.trim();

    // Check if initial seeding is needed
    const count = await prisma.websitePage.count();
    if (count === 0) {
      for (const p of DEFAULT_PAGES) {
        await prisma.websitePage.create({ data: p });
      }
    }

    if (slug) {
      const page = await prisma.websitePage.findUnique({
        where: { slug },
      });
      if (!page) {
        return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: page });
    }

    const pages = await prisma.websitePage.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: pages });
  } catch (error: any) {
    console.error('Fetch pages error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, title, titleBn, content, contentBn, seoTitle, metaDescription, isPublished } = body;

    if (!slug || !title || !content) {
      return NextResponse.json({ success: false, error: 'Slug, title, and content are required' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const page = await prisma.websitePage.upsert({
      where: { slug: cleanSlug },
      create: {
        slug: cleanSlug,
        title: title.trim(),
        titleBn: titleBn ? titleBn.trim() : null,
        content: content.trim(),
        contentBn: contentBn ? contentBn.trim() : null,
        seoTitle: seoTitle ? seoTitle.trim() : null,
        metaDescription: metaDescription ? metaDescription.trim() : null,
        isPublished: isPublished ?? true,
      },
      update: {
        title: title.trim(),
        titleBn: titleBn ? titleBn.trim() : null,
        content: content.trim(),
        contentBn: contentBn ? contentBn.trim() : null,
        seoTitle: seoTitle ? seoTitle.trim() : null,
        metaDescription: metaDescription ? metaDescription.trim() : null,
        isPublished: isPublished ?? true,
      },
    });

    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error('Save page error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
