import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer, verifyPassword, hashPassword } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, address, district, deliveryArea } = body;

    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      return NextResponse.json({ success: false, error: 'Name must be at least 2 characters.' }, { status: 400 });
    }

    const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    if (cleanEmail && !cleanEmail.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Check email conflict
    if (cleanEmail && cleanEmail !== customer.email) {
      const conflict = await prisma.customer.findFirst({
        where: { email: cleanEmail, id: { not: customer.id } },
      });
      if (conflict) {
        return NextResponse.json({ success: false, error: 'This email is already registered to another account.' }, { status: 409 });
      }
    }

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: name ? name.trim() : customer.name,
        email: cleanEmail !== undefined ? cleanEmail : customer.email,
        address: address ? address.trim() : customer.address,
        district: district ? district.trim() : customer.district,
        deliveryArea: deliveryArea !== undefined ? deliveryArea : customer.deliveryArea,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: updated.id,
        customerId: updated.customerId,
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        address: updated.address,
        district: updated.district,
        deliveryArea: updated.deliveryArea,
        addresses: Array.isArray(updated.addresses) ? updated.addresses : [],
      },
    });
  } catch (err: any) {
    console.error('Customer profile update error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update profile.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Fetch customer with passwordHash
    const fullCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
    });

    if (!fullCustomer || !fullCustomer.passwordHash) {
      return NextResponse.json({ success: false, error: 'Customer record not found.' }, { status: 404 });
    }

    const isValid = verifyPassword(currentPassword, fullCustomer.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Incorrect current password.' }, { status: 401 });
    }

    const newHashed = hashPassword(newPassword);
    await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash: newHashed },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err: any) {
    console.error('Change password error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to change password.' }, { status: 500 });
  }
}
