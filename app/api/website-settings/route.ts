// NEED ELECTRO ERP — Website Settings & Announcement Bar API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'main' },
      select: {
        companyName: true,
        companyTagline: true,
        phone: true,
        email: true,
        supportEmail: true,
        address: true,
        facebookUrl: true,
        youtubeUrl: true,
        linkedinUrl: true,
        whatsappNumber: true,
        footerText: true,
        logoUrl: true,
        accentColor: true,
        announcementText: true,
        announcementActive: true,
        announcementLink: true,
        maintenanceMode: true,
        homepageSections: true,
        navigationConfig: true,
        footerConfig: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings || {
        companyName: 'NEED ELECTRO',
        companyTagline: 'Trusted Electrical & Technological Solutions',
        phone: '+880 1733-983752',
        email: 'contact.amdadur@gmail.com',
        announcementText: '🔥 Flash Sale: Get up to 15% discount on HP & Dell Laptops + 7-Day Replacement Guarantee!',
        announcementActive: true,
        announcementLink: '/laptops',
        maintenanceMode: false,
      },
    });
  } catch (err: any) {
    console.error('Fetch website settings error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      companyTagline,
      phone,
      email,
      supportEmail,
      address,
      facebookUrl,
      youtubeUrl,
      linkedinUrl,
      whatsappNumber,
      footerText,
      logoUrl,
      accentColor,
      announcementText,
      announcementActive,
      announcementLink,
      maintenanceMode,
      homepageSections,
      navigationConfig,
      footerConfig,
    } = body;

    const updated = await prisma.systemSettings.upsert({
      where: { id: 'main' },
      create: {
        id: 'main',
        companyName: companyName || 'NEED ELECTRO',
        companyTagline: companyTagline || 'Trusted Electrical & Technological Solutions',
        phone: phone || '+880 1733-983752',
        email: email || 'contact.amdadur@gmail.com',
        supportEmail: supportEmail || 'info.needelectro@gmail.com',
        address: address || 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh',
        facebookUrl,
        youtubeUrl,
        linkedinUrl,
        whatsappNumber,
        footerText,
        logoUrl,
        accentColor: accentColor || '#008CFF',
        announcementText,
        announcementActive: announcementActive ?? false,
        announcementLink,
        maintenanceMode: maintenanceMode ?? false,
        homepageSections,
        navigationConfig,
        footerConfig,
      },
      update: {
        ...(companyName !== undefined && { companyName }),
        ...(companyTagline !== undefined && { companyTagline }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(supportEmail !== undefined && { supportEmail }),
        ...(address !== undefined && { address }),
        ...(facebookUrl !== undefined && { facebookUrl }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(whatsappNumber !== undefined && { whatsappNumber }),
        ...(footerText !== undefined && { footerText }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(accentColor !== undefined && { accentColor }),
        ...(announcementText !== undefined && { announcementText }),
        ...(announcementActive !== undefined && { announcementActive }),
        ...(announcementLink !== undefined && { announcementLink }),
        ...(maintenanceMode !== undefined && { maintenanceMode }),
        ...(homepageSections !== undefined && { homepageSections }),
        ...(navigationConfig !== undefined && { navigationConfig }),
        ...(footerConfig !== undefined && { footerConfig }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Update website settings error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
