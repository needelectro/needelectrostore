// NEED ELECTRO ERP — Setup New 16:6 Panoramic Banners & Purge Old Banner Records and Files
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const prisma = new PrismaClient();

const NEW_BANNERS = [
  {
    id: 'banner-need-electro-laptops',
    title: 'NEED ELECTRO Flagship Laptops & Business Ultrabooks',
    subtitle: null,
    badge: null,
    imageUrl: '/banners/need-electro-laptops-flagship.jpg',
    mobileImageUrl: '/banners/need-electro-laptops-flagship.jpg',
    targetUrl: '/laptops',
    buttonText: null,
    sortOrder: 1,
    isActive: true,
    placement: 'HERO',
  },
  {
    id: 'banner-need-electro-custompc',
    title: 'NEED ELECTRO Custom PCs & Gaming Workstations',
    subtitle: null,
    badge: null,
    imageUrl: '/banners/need-electro-custompc-workstation.jpg',
    mobileImageUrl: '/banners/need-electro-custompc-workstation.jpg',
    targetUrl: '/computers',
    buttonText: null,
    sortOrder: 2,
    isActive: true,
    placement: 'HERO',
  },
  {
    id: 'banner-need-electro-cctv',
    title: 'NEED ELECTRO CCTV & Smart Security Systems',
    subtitle: null,
    badge: null,
    imageUrl: '/banners/need-electro-cctv-security.jpg',
    mobileImageUrl: '/banners/need-electro-cctv-security.jpg',
    targetUrl: '/cctv',
    buttonText: null,
    sortOrder: 3,
    isActive: true,
    placement: 'HERO',
  },
  {
    id: 'banner-need-electro-gadgets',
    title: 'NEED ELECTRO Premium Tech Gadgets & Accessories',
    subtitle: null,
    badge: null,
    imageUrl: '/banners/need-electro-smart-gadgets.jpg',
    mobileImageUrl: '/banners/need-electro-smart-gadgets.jpg',
    targetUrl: '/computer-accessories',
    buttonText: null,
    sortOrder: 4,
    isActive: true,
    placement: 'HERO',
  },
];

const OBSOLETE_BANNER_FILES = [
  'cctv-hikvision-banner.jpg',
  'custom-pc-banner.jpg',
  'dell-latitude-banner.jpg',
  'hp-elitebook-banner.jpg',
  'lenovo-thinkpad-banner.jpg',
  'need-electro-custom-pc.jpg',
  'need-electro-hero-partner.jpg',
  'need-electro-service-warranty.jpg',
  'warranty-care-banner.jpg',
];

async function main() {
  console.log('=== SETTING UP NEW BANNERS & REMOVING OLDS ===');

  // 1. Upsert 4 new banners
  const newBannerIds = NEW_BANNERS.map((b) => b.id);
  for (const banner of NEW_BANNERS) {
    await prisma.banner.upsert({
      where: { id: banner.id },
      update: banner,
      create: banner,
    });
    console.log(`Upserted banner: ${banner.id} -> ${banner.imageUrl}`);
  }

  // 2. Remove obsolete banner records from DB
  const deletedDb = await prisma.banner.deleteMany({
    where: {
      id: { notIn: newBannerIds },
    },
  });
  console.log(`Deleted ${deletedDb.count} obsolete banner records from database.`);

  // 3. Remove obsolete banner files from public/banners/
  const bannersDir = path.join(projectRoot, 'public', 'banners');
  for (const file of OBSOLETE_BANNER_FILES) {
    const fullPath = path.join(bannersDir, file);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted obsolete banner file: ${file}`);
    } else {
      console.log(`File already absent: ${file}`);
    }
  }

  // 4. Verify remaining files in public/banners/
  const remainingFiles = fs.readdirSync(bannersDir);
  console.log('Remaining files in public/banners/:', remainingFiles);

  // 5. Verify database records
  const dbBanners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log(`Active database banners (${dbBanners.length}):`);
  dbBanners.forEach((b) => {
    console.log(`- [${b.sortOrder}] ${b.id}: ${b.title} (${b.imageUrl})`);
  });

  console.log('=== BANNER SETUP COMPLETE ===');
}

main()
  .catch((e) => {
    console.error('Error during banner setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
