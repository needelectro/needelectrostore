// NEED ELECTRO ERP — Company Settings Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function PUT(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const settings = await req.json();

  const updated = await prisma.systemSettings.upsert({
    where: { id: 'main' },
    update: {
      ...(settings.companyName && { companyName: settings.companyName }),
      ...(settings.companyTagline !== undefined && { companyTagline: settings.companyTagline }),
      ...(settings.sisterConcern !== undefined && { sisterConcern: settings.sisterConcern }),
      ...(settings.mainBranchName !== undefined && { mainBranchName: settings.mainBranchName }),
      ...(settings.phone !== undefined && { phone: settings.phone }),
      ...(settings.email !== undefined && { email: settings.email }),
      ...(settings.website !== undefined && { website: settings.website }),
      ...(settings.address !== undefined && { address: settings.address }),
      ...(settings.vatRegistrationNo !== undefined && { vatRegistrationNo: settings.vatRegistrationNo }),
      ...(settings.binNumber !== undefined && { binNumber: settings.binNumber }),
      ...(settings.invoicePrefix !== undefined && { invoicePrefix: settings.invoicePrefix }),
      ...(settings.emiPrefix !== undefined && { emiPrefix: settings.emiPrefix }),
      ...(settings.defaultVatPercent !== undefined && { defaultVatPercent: new Prisma.Decimal(settings.defaultVatPercent) }),
      ...(settings.currencySymbol !== undefined && { currencySymbol: settings.currencySymbol }),
      ...(settings.currencyCode !== undefined && { currencyCode: settings.currencyCode }),
      ...(settings.enableSmsNotifications !== undefined && { enableSmsNotifications: settings.enableSmsNotifications }),
      ...(settings.enableWhatsappNotifications !== undefined && { enableWhatsappNotifications: settings.enableWhatsappNotifications }),
      ...(settings.theme !== undefined && { theme: settings.theme }),
      ...(settings.logoUrl !== undefined && { logoUrl: settings.logoUrl }),
      ...(settings.faviconUrl !== undefined && { faviconUrl: settings.faviconUrl }),
      ...(settings.facebookUrl !== undefined && { facebookUrl: settings.facebookUrl }),
      ...(settings.youtubeUrl !== undefined && { youtubeUrl: settings.youtubeUrl }),
      ...(settings.linkedinUrl !== undefined && { linkedinUrl: settings.linkedinUrl }),
      ...(settings.whatsappNumber !== undefined && { whatsappNumber: settings.whatsappNumber }),
      ...(settings.supportEmail !== undefined && { supportEmail: settings.supportEmail }),
      ...(settings.footerText !== undefined && { footerText: settings.footerText }),
      ...(settings.accentColor !== undefined && { accentColor: settings.accentColor }),
    },
    create: {
      id: 'main',
      companyName: settings.companyName || 'NEED ELECTRO',
      companyTagline: settings.companyTagline,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
    },
  });

  return NextResponse.json({ success: true, message: 'Settings saved successfully', data: updated });
}
