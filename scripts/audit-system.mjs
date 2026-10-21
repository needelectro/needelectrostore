// NEED ELECTRO ERP — Product Image Catalog Audit Tool
import { PrismaClient } from '@prisma/client';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const KNOWN_PLACEHOLDERS = [
  '/logo-icon.png',
  '/logo-dark-transparent.png',
  '/logo.png',
  '/placeholder.png',
  '/placeholder.jpg',
  '/placeholder.svg',
  'placeholder',
  'no-image',
  'default-product.png'
];

function isPlaceholder(url) {
  if (!url) return true;
  const clean = url.trim().toLowerCase();
  return KNOWN_PLACEHOLDERS.some(p => clean === p || clean.endsWith(p));
}

async function audit() {
  console.log('--- STARTING NEED ELECTRO PRODUCT IMAGE AUDIT ---');
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      brand: true,
      model: true,
      imageUrl: true,
      images: true,
      status: true,
      isPublished: true,
      specs: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalScanned = products.length;
  let missingOrEmpty = 0;
  let placeholderCount = 0;
  let validImageCount = 0;
  let galleryOnly = 0;

  const requiringImages = [];
  const validProducts = [];

  for (const p of products) {
    const rawUrl = p.imageUrl ? p.imageUrl.trim() : '';
    const hasRaw = Boolean(rawUrl && rawUrl !== 'null' && rawUrl !== 'undefined');
    const placeholder = isPlaceholder(rawUrl);

    // Check gallery
    let galleryArr = [];
    if (Array.isArray(p.images)) {
      galleryArr = p.images.filter(x => typeof x === 'string' && x.trim() && !isPlaceholder(x));
    }

    if (!hasRaw || rawUrl === '') {
      if (galleryArr.length > 0) {
        galleryOnly++;
        validProducts.push({ ...p, note: 'Has gallery images but empty primary imageUrl' });
      } else {
        missingOrEmpty++;
        requiringImages.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          brand: p.brand,
          model: p.model,
          category: p.category,
          reason: 'EMPTY_OR_NULL'
        });
      }
    } else if (placeholder) {
      placeholderCount++;
      requiringImages.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        model: p.model,
        category: p.category,
        currentImage: rawUrl,
        reason: 'PLACEHOLDER_ICON'
      });
    } else {
      validImageCount++;
      validProducts.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        imageUrl: rawUrl
      });
    }
  }

  console.log('\n================ AUDIT REPORT ================');
  console.log(`Total Products in Database: ${totalScanned}`);
  console.log(`Products with Valid Images:  ${validImageCount}`);
  console.log(`Products with Gallery Only:  ${galleryOnly}`);
  console.log(`Products with Empty/Null:    ${missingOrEmpty}`);
  console.log(`Products with Placeholders:  ${placeholderCount}`);
  console.log(`Total Requiring Recovery:    ${requiringImages.length}`);
  console.log('==============================================\n');

  console.log('Testing connectivity of 8 existing images:');
  for (const vp of validProducts) {
    console.log(`- Product "${vp.name}" (SKU: ${vp.sku}): ${vp.imageUrl}`);
  }

  console.log('\nAll 57 Products Requiring Images:');
  requiringImages.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.category}] [Brand: ${p.brand}] "${p.name}" (Model: "${p.model || ''}") (ID: ${p.id}, SKU: ${p.sku})`);
  });

  await prisma.$disconnect();
}

audit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
