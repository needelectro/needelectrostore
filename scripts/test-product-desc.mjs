import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: {
      status: 'ACTIVE',
      category: { contains: 'Laptop', mode: 'insensitive' },
    },
  });

  if (!product) {
    console.log('No laptop product found, fetching any active product');
    const anyP = await prisma.product.findFirst({ where: { status: 'ACTIVE' } });
    console.log('Active product:', anyP?.name, anyP?.sku);
    return;
  }

  console.log('Target Laptop Product:');
  console.log('Name:', product.name);
  console.log('SKU:', product.sku);
  console.log('Description Length:', (product.description || '').length);
  console.log('Specs:', product.specs);

  // Let's test what http://localhost:3000/product/${slug} returns in HTML
  const slug = `${product.name.toLowerCase().replace(/[\s\W-]+/g, '-')}-${product.sku.toLowerCase()}`;
  console.log('Testing URL:', `http://localhost:3000/product/${slug}`);

  try {
    const res = await fetch(`http://localhost:3000/product/${slug}`);
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('HTML size:', html.length, 'bytes');

    // Check if "Full Specifications & Description" exists in HTML
    const hasSection = html.includes('Full Specifications &amp; Description') || html.includes('Full Specifications & Description');
    console.log('Has Specifications Section in SSR HTML:', hasSection);

    // Check if "Copy Specifications" was completely removed
    const hasCopyButton = html.includes('Copy Specifications');
    console.log('Has "Copy Specifications" (should be false):', hasCopyButton);

    // Check if Schema.org Product JSON-LD is in HTML
    const hasSchema = html.includes('"@type":"Product"');
    console.log('Has Schema.org Product JSON-LD in SSR HTML:', hasSchema);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

main().finally(() => prisma.$disconnect());
