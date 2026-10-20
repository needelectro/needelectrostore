import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createCustomerSession } from '@/lib/customerAuth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      password,
      confirmPassword,
      address,
      district = 'Moulvibazar',
      deliveryArea,
    } = body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full name is required (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Mobile number is required.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedPhone = cleanPhone.startsWith('880')
      ? cleanPhone.slice(2)
      : cleanPhone.startsWith('88')
      ? cleanPhone.slice(2)
      : cleanPhone;

    if (normalizedPhone.length !== 11 || !normalizedPhone.startsWith('01')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX).',
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Detailed delivery address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    if (cleanEmail && !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 2. Check for duplicate account by mobile or email
    const existingByPhone = await prisma.customer.findFirst({
      where: { phone: normalizedPhone },
    });

    if (existingByPhone && existingByPhone.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this mobile number already exists. Please sign in.',
        },
        { status: 409 }
      );
    }

    if (cleanEmail) {
      const existingByEmail = await prisma.customer.findFirst({
        where: { email: cleanEmail },
      });
      if (existingByEmail && existingByEmail.passwordHash && existingByEmail.id !== existingByPhone?.id) {
        return NextResponse.json(
          {
            success: false,
            error: 'An account with this email address already exists. Please sign in.',
          },
          { status: 409 }
        );
      }
    }

    const hashedPassword = hashPassword(password);
    const initialAddress = {
      id: 'addr_' + Date.now(),
      label: 'Default Address',
      address: address.trim(),
      district: district.trim(),
      deliveryArea: deliveryArea?.trim() || '',
      isDefault: true,
      createdAt: new Date().toISOString(),
    };

    let customer;

    // If an ERP guest customer already exists with this phone, upgrade their account
    if (existingByPhone) {
      customer = await prisma.customer.update({
        where: { id: existingByPhone.id },
        data: {
          name: name.trim(),
          email: cleanEmail || existingByPhone.email,
          address: address.trim(),
          district: district.trim(),
          deliveryArea: deliveryArea?.trim() || null,
          passwordHash: hashedPassword,
          addresses: [initialAddress],
          lastLoginAt: new Date(),
          status: 'ACTIVE',
        },
      });
    } else {
      const customerCode = `CUST-${Date.now().toString().slice(-6)}`;
      customer = await prisma.customer.create({
        data: {
          id: 'cust-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          customerId: customerCode,
          name: name.trim(),
          phone: normalizedPhone,
          email: cleanEmail,
          address: address.trim(),
          district: district.trim(),
          deliveryArea: deliveryArea?.trim() || null,
          passwordHash: hashedPassword,
          addresses: [initialAddress],
          creditLimit: new Prisma.Decimal(0),
          currentBalance: new Prisma.Decimal(0),
          lastLoginAt: new Date(),
          status: 'ACTIVE',
          notes: 'Registered online via customer registration',
        },
      });
    }

    // 3. Create Session
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to NEED ELECTRO.',
      data: {
        id: customer.id,
        customerId: customer.customerId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        district: customer.district,
        deliveryArea: customer.deliveryArea,
        addresses: Array.isArray(customer.addresses) ? customer.addresses : [initialAddress],
      },
    });

    const { token } = await createCustomerSession(customer.id, req, response);
    // Include token in payload as well for client-side storage backup
    (response as any).token = token;

    return response;
  } catch (err: any) {
    console.error('Customer registration error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
