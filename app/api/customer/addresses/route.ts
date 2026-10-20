import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/customerAuth';
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
      data: customer.addresses || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { label, address, district, deliveryArea, isDefault } = await req.json();

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return NextResponse.json({ success: false, error: 'Detailed address is required.' }, { status: 400 });
    }

    if (!district || typeof district !== 'string') {
      return NextResponse.json({ success: false, error: 'District is required.' }, { status: 400 });
    }

    const existingAddresses: any[] = Array.isArray(customer.addresses) ? [...customer.addresses] : [];
    const shouldBeDefault = isDefault || existingAddresses.length === 0;

    if (shouldBeDefault) {
      existingAddresses.forEach(a => { a.isDefault = false; });
    }

    const newAddress = {
      id: 'addr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      label: label?.trim() || 'Address ' + (existingAddresses.length + 1),
      address: address.trim(),
      district: district.trim(),
      deliveryArea: deliveryArea?.trim() || '',
      isDefault: shouldBeDefault,
      createdAt: new Date().toISOString(),
    };

    existingAddresses.push(newAddress);

    // If default, update main customer address and district as well
    const updateData: any = { addresses: existingAddresses };
    if (shouldBeDefault) {
      updateData.address = address.trim();
      updateData.district = district.trim();
      updateData.deliveryArea = deliveryArea?.trim() || null;
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery address added successfully.',
      data: existingAddresses,
    });
  } catch (err: any) {
    console.error('Add address error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to add address.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, label, address, district, deliveryArea, isDefault } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Address ID is required.' }, { status: 400 });
    }

    let existingAddresses: any[] = Array.isArray(customer.addresses) ? [...customer.addresses] : [];
    const targetIndex = existingAddresses.findIndex(a => a.id === id);

    if (targetIndex === -1) {
      return NextResponse.json({ success: false, error: 'Address not found.' }, { status: 404 });
    }

    if (isDefault) {
      existingAddresses.forEach(a => { a.isDefault = false; });
    }

    existingAddresses[targetIndex] = {
      ...existingAddresses[targetIndex],
      label: label !== undefined ? label.trim() : existingAddresses[targetIndex].label,
      address: address !== undefined ? address.trim() : existingAddresses[targetIndex].address,
      district: district !== undefined ? district.trim() : existingAddresses[targetIndex].district,
      deliveryArea: deliveryArea !== undefined ? deliveryArea.trim() : existingAddresses[targetIndex].deliveryArea,
      isDefault: isDefault !== undefined ? isDefault : existingAddresses[targetIndex].isDefault,
      updatedAt: new Date().toISOString(),
    };

    const updateData: any = { addresses: existingAddresses };
    if (existingAddresses[targetIndex].isDefault) {
      updateData.address = existingAddresses[targetIndex].address;
      updateData.district = existingAddresses[targetIndex].district;
      updateData.deliveryArea = existingAddresses[targetIndex].deliveryArea || null;
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully.',
      data: existingAddresses,
    });
  } catch (err: any) {
    console.error('Update address error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update address.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Address ID is required.' }, { status: 400 });
    }

    let existingAddresses: any[] = Array.isArray(customer.addresses) ? [...customer.addresses] : [];
    const filtered = existingAddresses.filter(a => a.id !== id);

    // If we deleted default and have remaining, set first as default
    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
      filtered[0].isDefault = true;
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: { addresses: filtered },
    });

    return NextResponse.json({
      success: true,
      message: 'Address removed successfully.',
      data: filtered,
    });
  } catch (err: any) {
    console.error('Delete address error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete address.' }, { status: 500 });
  }
}
