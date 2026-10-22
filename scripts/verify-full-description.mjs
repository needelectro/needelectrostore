import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleLongDescription = `
### Premium Performance & Engineering Overview
The HP EliteBook 840 G9 is a flagship enterprise ultrabook engineered for demanding executives, developers, and mobile professionals. Built inside an ultra-durable CNC precision-machined aluminum chassis with military-grade MIL-STD-810H certification, it delivers unmatched reliability, silent thermal efficiency, and all-day battery endurance.

### Comprehensive Technical Specifications
Processor: Intel Core i7-1265U vPro (10 Cores, 12 Threads, Up to 4.80 GHz Max Turbo, 12MB Intel Smart Cache)
Memory: 32GB Dual-Channel DDR5 4800MHz (Upgradable to 64GB)
Internal Storage: 1TB PCIe Gen4 x4 NVMe M.2 Solid State Drive
Graphics: Integrated Intel Iris Xe Graphics with 96 Execution Units
Display: 14.0-inch WUXGA (1920 x 1200) 16:10 IPS Anti-Glare, 400 nits, 100% sRGB, HP Eye Ease Low Blue Light
Wireless Connectivity: Intel Wi-Fi 6E AX211 (2x2) and Bluetooth 5.3
Audio & Speakers: Dual Stereo Speakers tuned by Bang & Olufsen with Discrete Amplifiers
Webcam & Sensors: 5MP IR Camera with Privacy Shutter, Temporal Noise Reduction, and Windows Hello Face Authentication
Security Hardware: HP Wolf Security for Business, TPM 2.0 Embedded Chip, Smart Card Reader, Fingerprint Sensor
Keyboard & Touchpad: Spill-resistant backlit keyboard with drainage hole and Glass ClickPad with multi-touch gesture support
Battery: 3-Cell 51Wh Li-ion Polymer with HP Fast Charge (50% in 30 minutes)
Power Adapter: 65W USB Type-C Smart AC Power Adapter
Operating System: Windows 11 Pro 64-bit Official Pre-installed License

### External Connectivity & I/O Ports
| Port Type | Quantity | Specification & Capabilities |
| --- | --- | --- |
| Thunderbolt 4 / USB4 | 2 | 40Gbps signaling rate, USB Power Delivery, DisplayPort 1.4 |
| SuperSpeed USB Type-A | 2 | 5Gbps signaling rate (1 port with HP Sleep and Charge) |
| HDMI Video Output | 1 | HDMI 2.0b supporting up to 4K @ 60Hz |
| Headphone/Mic Combo | 1 | 3.5mm stereo audio jack |
| Security Lock Slot | 1 | Nano security lock slot |

### Key Enterprise Features
- HP Sure View Reflect privacy screen option to prevent visual hacking in public spaces
- Dynamic voice leveling with dual-array microphones filtering ambient background chatter
- Whisper-quiet dual fan cooling system optimized for extended high-load workloads
- Zero-bloatware clean operating system installation with verified drivers

### In the Official Retail Packaging
1. HP EliteBook 840 G9 Ultrabook
2. Genuine HP 65W USB Type-C Fast Charger
3. Power Cord with Bangladesh 3-pin plug
4. Warranty Documentation and Inspection Certificate
5. Premium Microfiber Keyboard Protection Cloth

### Showroom Inspection & Delivery Guarantee
Every device at NEED ELECTRO undergoes a comprehensive 24-point hardware diagnostics checklist covering display pixels, battery health, thermal cycling, keyboard responsiveness, and port throughput prior to dispatch. Available for personal testing at our Moulvibazar Kusumbag showroom or cash-on-delivery inspection nationwide across Bangladesh.
`.trim();

async function testLongDescription() {
  // Find a product or create a test product
  let product = await prisma.product.findFirst({
    where: { sku: 'PROD-TEST-FULLDESC' },
  });

  if (!product) {
    product = await prisma.product.create({
      data: {
        id: 'prod-test-fulldesc',
        name: 'HP EliteBook 840 G9 Core i7 12th Gen Enterprise Ultrabook',
        sku: 'PROD-TEST-FULLDESC',
        category: 'Laptops',
        brand: 'HP',
        model: 'EliteBook 840 G9',
        description: sampleLongDescription,
        retailPrice: 98500,
        currentStock: 5,
        warrantyPeriodMonths: 24,
        isPublished: true,
        status: 'ACTIVE',
      },
    });
    console.log('Created test product with full description:', product.sku);
  } else {
    product = await prisma.product.update({
      where: { id: product.id },
      data: {
        description: sampleLongDescription,
        model: 'EliteBook 840 G9',
        status: 'ACTIVE',
        isPublished: true,
      },
    });
    console.log('Updated test product with full description:', product.sku);
  }

  const slug = `${product.name.toLowerCase().replace(/[\s\W-]+/g, '-')}-${product.sku.toLowerCase()}`;
  console.log('Fetching URL:', `http://localhost:3000/product/${slug}`);

  const res = await fetch(`http://localhost:3000/product/${slug}`);
  console.log('HTTP Status:', res.status);
  const html = await res.text();

  // Test checks:
  const checks = [
    { name: 'Contains Processor in HTML', pass: html.includes('Intel Core i7-1265U vPro') },
    { name: 'Contains Memory in HTML', pass: html.includes('32GB Dual-Channel DDR5') },
    { name: 'Contains Display in HTML', pass: html.includes('14.0-inch WUXGA') },
    { name: 'Contains Table Port Type in HTML', pass: html.includes('Thunderbolt 4 / USB4') },
    { name: 'Contains In the Official Retail Packaging', pass: html.includes('In the Official Retail Packaging') },
    { name: 'Contains 24-point hardware diagnostics', pass: html.includes('24-point hardware diagnostics') },
    { name: 'No Copy Specifications button', pass: !html.includes('Copy Specifications') },
    { name: 'Contains Product JSON-LD schema', pass: html.includes('"@type":"Product"') },
    { name: 'Contains clean description in JSON-LD', pass: html.includes('flagship enterprise ultrabook') },
    { name: 'Model EliteBook 840 G9 in JSON-LD', pass: html.includes('"model":"EliteBook 840 G9"') },
    { name: 'Price 98500 in JSON-LD', pass: html.includes('"price":"98500.00"') },
    { name: 'BDT currency in JSON-LD', pass: html.includes('"priceCurrency":"BDT"') },
    { name: 'InStock in JSON-LD', pass: html.includes('https://schema.org/InStock') },
  ];

  console.log('\n--- VERIFICATION CHECKS ---');
  let allPass = true;
  for (const c of checks) {
    console.log(`${c.pass ? '✅ PASS' : '❌ FAIL'}: ${c.name}`);
    if (!c.pass) allPass = false;
  }

  if (allPass) {
    console.log('\n🌟 ALL 13 VERIFICATION CRITERIA PASSED 100%!');
  } else {
    console.error('\n⚠️ Some verification checks failed.');
  }
}

testLongDescription().finally(() => prisma.$disconnect());
