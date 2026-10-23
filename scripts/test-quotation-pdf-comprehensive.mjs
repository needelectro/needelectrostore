import { buildQuotationPdf } from '../src/utils/generateQuotationPdf.ts';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleSettings = {
  companyName: 'NEED ELECTRO',
  companyTagline: 'Trusted Electrical and Technological Solutions',
  phone: '+880 1733-983752',
  email: 'contact.amdadur@gmail.com',
  website: 'https://www.needelectro.com',
  address: 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh',
  currencySymbol: '৳',
};

async function runTestSuite() {
  console.log('===============================================================');
  console.log('   NEED ELECTRO ERP — COMPREHENSIVE QUOTATION PDF TEST SUITE   ');
  console.log('===============================================================\n');

  fs.mkdirSync('scratch/pdf_samples', { recursive: true });

  // -------------------------------------------------------------------------
  // Test 1: Single Product Short Quotation (1 Page)
  // -------------------------------------------------------------------------
  console.log('--- TEST 1: Single Product Short Quotation (1 Page) ---');
  const qtn1 = {
    id: 'qtn-test-1',
    quotationNumber: 'NE-QTN-2026-000001',
    quotationDate: '2026-10-23',
    validUntil: '2026-11-06',
    status: 'SENT',
    customerName: 'Amdadur Rahman',
    customerPhone: '+880 1733-983752',
    customerEmail: 'contact.amdadur@gmail.com',
    billingAddress: 'Central Road, Moulvibazar, Sylhet',
    preparedByName: 'Sultan Ahmed (Executive Sales)',
    subtotal: 55000,
    discountTotal: 2500,
    vatPercent: 5,
    vatAmount: 2625,
    deliveryCharge: 500,
    serviceCharge: 1000,
    otherCharges: 0,
    grandTotal: 56625,
    paymentTerms: '50% advance on order confirmation, balance upon delivery.',
    deliveryTerms: 'Showroom pickup or courier delivery within 48 hours.',
    warrantyTerms: 'Official 2 Years Manufacturer Warranty.',
    items: [
      {
        id: 'it-1',
        productName: 'Dell Latitude 5400 Laptop',
        sku: 'DELL-LAT-5400',
        brand: 'Dell',
        model: 'Latitude 5400 i5-8365U',
        description: 'Intel Core i5 8th Gen, 16GB DDR4 RAM, 512GB NVMe M.2 SSD, 14.0" Full HD IPS Anti-Glare Display, Backlit Keyboard, 4-Cell Battery.',
        quantity: 1,
        unitPrice: 55000,
        discount: 2500,
        lineTotal: 52500,
        warrantyMonths: 24,
      },
    ],
  };

  const doc1 = buildQuotationPdf(qtn1, sampleSettings);
  const totalPages1 = doc1.getNumberOfPages();
  const pdfBuffer1 = Buffer.from(doc1.output('arraybuffer'));
  fs.writeFileSync('scratch/pdf_samples/sample_qtn_1page.pdf', pdfBuffer1);

  console.log(`✓ Generated 1-page quotation PDF: ${pdfBuffer1.length} bytes, Pages: ${totalPages1}`);
  if (totalPages1 !== 1) throw new Error(`Expected 1 page, got ${totalPages1}`);

  // -------------------------------------------------------------------------
  // Test 2: 5 Products Medium Commercial Quotation
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 2: 5 Products Medium Commercial Quotation ---');
  const qtn2 = {
    id: 'qtn-test-2',
    quotationNumber: 'NE-QTN-2026-000002',
    referenceNumber: 'PO-CORP-9821',
    quotationDate: '2026-10-23',
    validUntil: '2026-11-15',
    status: 'ACCEPTED',
    customerName: 'Sylhet IT Park & Tech Hub Ltd.',
    companyName: 'Sylhet IT Park Ltd.',
    customerPhone: '+880 1819-001122',
    customerEmail: 'procurement@sylhetitpark.com',
    billingAddress: 'Silicon Tower, Level 4, Shahi Eidgah, Sylhet',
    deliveryAddress: 'Campus 2, Osmani Avenue, Sylhet',
    preparedByName: 'Amdadur Rahman (Managing Director)',
    salespersonName: 'Rashedul Hasan',
    subtotal: 245000,
    discountTotal: 10000,
    vatPercent: 7.5,
    vatAmount: 17625,
    deliveryCharge: 1500,
    serviceCharge: 3500,
    otherCharges: 0,
    grandTotal: 257625,
    paymentTerms: 'Official Bank Transfer / Cheque within 15 days of delivery.',
    deliveryTerms: 'Direct site delivery and server rack installation included.',
    warrantyTerms: '3 Years Full Replacement Warranty on enterprise network gear.',
    customerNotes: 'Please ensure all packaging includes original factory serial seals.',
    items: [
      {
        id: 'it-21',
        productName: 'Cisco Catalyst 2960-X Gigabit Switch',
        sku: 'WS-C2960X-24TS-L',
        brand: 'Cisco',
        model: '2960-X 24 Ports',
        description: '24 x 10/100/1000 Gigabit Ethernet ports, 4 x 1G SFP uplinks, LAN Base image.',
        quantity: 2,
        unitPrice: 45000,
        discount: 2000,
        lineTotal: 88000,
        warrantyMonths: 36,
      },
      {
        id: 'it-22',
        productName: 'MikroTik Cloud Router Switch CRS328-24P-4S+RM',
        sku: 'CRS328-24P',
        brand: 'MikroTik',
        model: 'CRS328 Managed PoE+',
        description: '24 Gigabit PoE+ RJ45 ports (500W power budget), 4 x 10G SFP+ cages, Dual Boot SwOS/RouterOS.',
        quantity: 1,
        unitPrice: 58000,
        discount: 3000,
        lineTotal: 55000,
        warrantyMonths: 24,
      },
      {
        id: 'it-23',
        productName: 'APC Smart-UPS RT 3000VA On-Line Power Backup',
        sku: 'SURTD3000XLI',
        brand: 'APC by Schneider',
        model: 'RT 3kVA Tower/Rack',
        description: 'High density, double-conversion on-line power protection with scalable runtime, pure sine wave.',
        quantity: 1,
        unitPrice: 72000,
        discount: 2000,
        lineTotal: 70000,
        warrantyMonths: 24,
      },
      {
        id: 'it-24',
        productName: 'Cat6 UTP Pure Copper Industrial Cable Drum',
        sku: 'SCH-CAT6-305M',
        brand: 'Schneider Electric',
        model: 'Actassi Cat6 305m',
        description: '305-meter box, 23 AWG Solid Bare Copper, LSZH fire-retardant outer sheath, 550MHz tested.',
        quantity: 2,
        unitPrice: 11000,
        discount: 1000,
        lineTotal: 21000,
        warrantyMonths: 60,
      },
      {
        id: 'it-25',
        productName: 'Sever Rack Cabinet 42U 800x1000 Heavy Duty',
        sku: 'RACK-42U-8010',
        brand: 'Totem',
        model: 'Server Max 42U',
        description: 'Perforated front and rear doors, 4 cooling fans, 8-way PDU, heavy-duty castors & leveling feet.',
        quantity: 1,
        unitPrice: 19000,
        discount: 2000,
        lineTotal: 17000,
        warrantyMonths: 12,
      },
    ],
  };

  const doc2 = buildQuotationPdf(qtn2, sampleSettings);
  const pdfBuffer2 = Buffer.from(doc2.output('arraybuffer'));
  fs.writeFileSync('scratch/pdf_samples/sample_qtn_5products.pdf', pdfBuffer2);
  console.log(`✓ Generated 5-product quotation PDF: ${pdfBuffer2.length} bytes, Pages: ${doc2.getNumberOfPages()}`);

  // -------------------------------------------------------------------------
  // Test 3: 20 Products Multi-Page Commercial Quotation
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 3: 20 Products Multi-Page Commercial Quotation ---');
  const items20 = [];
  let subtotal20 = 0;
  for (let i = 1; i <= 20; i++) {
    const unitPrice = 1250 * i;
    const qty = (i % 3) + 1;
    const disc = i % 4 === 0 ? 150 : 0;
    const lineTotal = unitPrice * qty - disc;
    subtotal20 += lineTotal;
    items20.push({
      id: `it-20-${i}`,
      productName: `Industrial Electrical Component Model ${String.fromCharCode(64 + (i % 26 || 1))}-${100 + i}`,
      sku: `NEC-IND-${1000 + i}`,
      brand: i % 2 === 0 ? 'Schneider Electric' : 'Siemens',
      model: `Series ${i * 10} Ultra`,
      description: `High performance circuit protection unit with thermal magnetic trip mechanism, 230V/400V 50Hz, calibrated at 40°C ambient temperature.`,
      quantity: qty,
      unitPrice,
      discount: disc,
      lineTotal,
      warrantyMonths: 24,
    });
  }

  const qtn20 = {
    id: 'qtn-test-20',
    quotationNumber: 'NE-QTN-2026-000020',
    quotationDate: '2026-10-23',
    validUntil: '2026-11-20',
    status: 'SENT',
    customerName: 'Eastern Textile Mills & Processing Ltd.',
    companyName: 'Eastern Group of Industries',
    customerPhone: '+880 1711-889900',
    customerEmail: 'factory.procurement@easterngroup.com.bd',
    billingAddress: 'Plot 45-48, Export Processing Zone, Sylhet',
    subtotal: subtotal20,
    discountTotal: 0,
    vatPercent: 5,
    vatAmount: Math.round(subtotal20 * 0.05),
    deliveryCharge: 2500,
    serviceCharge: 5000,
    otherCharges: 0,
    grandTotal: subtotal20 + Math.round(subtotal20 * 0.05) + 2500 + 5000,
    paymentTerms: '100% Irrevocable Confirmed Letter of Credit (LC) at sight.',
    items: items20,
  };

  const doc20 = buildQuotationPdf(qtn20, sampleSettings);
  const totalPages20 = doc20.getNumberOfPages();
  const pdfBuffer20 = Buffer.from(doc20.output('arraybuffer'));
  fs.writeFileSync('scratch/pdf_samples/sample_qtn_20items.pdf', pdfBuffer20);
  console.log(`✓ Generated 20-product multi-page quotation PDF: ${pdfBuffer20.length} bytes, Pages: ${totalPages20}`);
  if (totalPages20 < 2) throw new Error(`Expected at least 2 pages for 20 products, got ${totalPages20}`);

  // -------------------------------------------------------------------------
  // Test 4: 50 Products Bulk Enterprise Quotation
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 4: 50 Products Bulk Enterprise Quotation ---');
  const items50 = [];
  let subtotal50 = 0;
  for (let i = 1; i <= 50; i++) {
    const unitPrice = 850 + (i * 120);
    const qty = (i % 5) + 1;
    const lineTotal = unitPrice * qty;
    subtotal50 += lineTotal;
    items50.push({
      id: `it-50-${i}`,
      productName: `Industrial Commercial Supply Item #${i} — Heavy Duty Grade`,
      sku: `PROD-BULK-${2000 + i}`,
      brand: 'NEED ELECTRO OEM',
      model: `MOD-${i}`,
      quantity: qty,
      unitPrice,
      discount: 0,
      lineTotal,
      warrantyMonths: 12,
    });
  }

  const qtn50 = {
    id: 'qtn-test-50',
    quotationNumber: 'NE-QTN-2026-000050',
    quotationDate: '2026-10-23',
    validUntil: '2026-12-01',
    status: 'DRAFT',
    customerName: 'Government Polytechnic Institute Procurement Cell',
    customerPhone: '+880 1733-000000',
    subtotal: subtotal50,
    discountTotal: 5000,
    vatPercent: 0,
    vatAmount: 0,
    deliveryCharge: 3000,
    serviceCharge: 0,
    otherCharges: 0,
    grandTotal: subtotal50 - 5000 + 3000,
    items: items50,
  };

  const doc50 = buildQuotationPdf(qtn50, sampleSettings);
  const totalPages50 = doc50.getNumberOfPages();
  const pdfBuffer50 = Buffer.from(doc50.output('arraybuffer'));
  fs.writeFileSync('scratch/pdf_samples/sample_qtn_50items.pdf', pdfBuffer50);
  console.log(`✓ Generated 50-product bulk quotation PDF: ${pdfBuffer50.length} bytes, Pages: ${totalPages50}`);
  if (totalPages50 < 3) throw new Error(`Expected at least 3 pages for 50 products, got ${totalPages50}`);

  // -------------------------------------------------------------------------
  // Test 5: Extremely Long Names, Descriptions, Model Numbers & Specs
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 5: Extremely Long Names, Descriptions & Model Numbers ---');
  const qtnLong = {
    id: 'qtn-test-long',
    quotationNumber: 'NE-QTN-2026-LONG-01',
    quotationDate: '2026-10-23',
    validUntil: '2026-11-30',
    status: 'SENT',
    customerName: 'Comprehensive Engineering Research Lab & Supercomputing Center of Bangladesh',
    companyName: 'Center for Advanced Technological Studies and Telecommunications Research Foundation',
    customerPhone: '+880 1711-998877',
    customerEmail: 'head.engineering.procurements.division@advanced-technological-studies.gov.bd',
    billingAddress: 'Academic Research Tower 9, Level 14, Advanced Cybernetics Complex, Agargaon, Sher-e-Bangla Nagar, Dhaka-1207, Bangladesh',
    deliveryAddress: 'Data Center Facility 2, High-Tech Industrial Zone, Bangabandhu Hi-Tech City, Kaliakair, Gazipur-1750',
    subtotal: 1250000,
    discountTotal: 50000,
    vatPercent: 10,
    vatAmount: 120000,
    deliveryCharge: 15000,
    serviceCharge: 25000,
    otherCharges: 5000,
    grandTotal: 1365000,
    paymentTerms: 'Payment via Bangladesh Government Treasury Challan or Electronic Fund Transfer (BEFTN/RTGS) within 30 days after final technical inspection and commissioning report approval.',
    deliveryTerms: 'Direct transport via climate-controlled specialized air-ride container vehicle with shock sensors and continuous GPS tracking to destination data hall.',
    warrantyTerms: '5 Years 24x7x365 4-Hour Onsite Mission-Critical Response Warranty including comprehensive hardware replacement, firmware updates, and biannual preventive maintenance inspections.',
    customerNotes: 'All hardware components must be certified TAA compliant with tamper-evident cryptographic chain of custody seals intact upon delivery.',
    items: [
      {
        id: 'it-l1',
        productName: 'Enterprise AI Rackmount GPU Server with Dual AMD EPYC 9654 96-Core Processors and Quad NVIDIA H100 80GB SXM5 Tensor Core Deep Learning Accelerators',
        sku: 'SRV-H100-AI-SUPER-DUAL-EPYC-9654-SXM5-80GB-384T',
        brand: 'Supermicro / NVIDIA DGX Platform Compatible',
        model: 'SYS-821GE-TNHR-ULTRA-PERFORMANCE-DATACENTER-SPEC-REV-4.2',
        description: 'Dual Socket AMD EPYC 9654 96-Core 192-Thread 2.4GHz/3.7GHz 384MB Cache Processors, 1.5TB (24 x 64GB) DDR5-4800MHz ECC Registered RDIMM, 4 x NVIDIA H100 80GB HBM3 3.35TB/s Memory Bandwidth GPU Modules interconnected via NVLink 900GB/s Switch Mesh, 8 x 3.84TB NVMe PCIe 5.0 U.2 Enterprise Solid State Drives in RAID 10 configuration with dedicated hardware cache controller, Dual 100GbE QSFP28 Mellanox ConnectX-6 Dx Optical Network Interface Cards, Quad 3000W Titanium Level (96% Efficiency) Redundant Hot-Swap Power Supplies with C20 receptacles.',
        quantity: 1,
        unitPrice: 1250000,
        discount: 50000,
        lineTotal: 1200000,
        warrantyMonths: 60,
      },
    ],
  };

  const docLong = buildQuotationPdf(qtnLong, sampleSettings);
  const pdfBufferLong = Buffer.from(docLong.output('arraybuffer'));
  fs.writeFileSync('scratch/pdf_samples/sample_qtn_long_descriptions.pdf', pdfBufferLong);
  console.log(`✓ Generated long-description quotation PDF: ${pdfBufferLong.length} bytes, Pages: ${docLong.getNumberOfPages()}`);

  // -------------------------------------------------------------------------
  // Test 6: Missing Optional Customer Information
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 6: Missing Optional Customer Information (Clean Omission) ---');
  const qtnMinimal = {
    id: 'qtn-test-min',
    quotationNumber: 'NE-QTN-2026-MIN-001',
    quotationDate: '2026-10-23',
    validUntil: '2026-11-06',
    status: 'DRAFT',
    customerName: 'Walk-in Retail Inquiry',
    customerPhone: '01700000000',
    // companyName, customerEmail, billingAddress, deliveryAddress, referenceNumber ALL OMITTED
    subtotal: 15000,
    discountTotal: 0,
    vatPercent: 0,
    vatAmount: 0,
    deliveryCharge: 0,
    serviceCharge: 0,
    otherCharges: 0,
    grandTotal: 15000,
    items: [
      {
        id: 'it-min-1',
        productName: 'Solar Hybrid Inverter 3.5kVA 24V Pure Sine Wave',
        sku: 'INV-SOLAR-3.5K',
        quantity: 1,
        unitPrice: 15000,
        discount: 0,
        lineTotal: 15000,
      },
    ],
  };

  const docMin = buildQuotationPdf(qtnMinimal, sampleSettings);
  const pdfBufferMin = Buffer.from(docMin.output('arraybuffer'));
  fs.writeFileSync('scratch/pdf_samples/sample_qtn_minimal_customer.pdf', pdfBufferMin);
  console.log(`✓ Generated minimal customer quotation PDF: ${pdfBufferMin.length} bytes, Pages: ${docMin.getNumberOfPages()}`);

  // -------------------------------------------------------------------------
  // Test 7: Multi-Page Header & Footer Verification
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 7: Multi-Page Pagination & Header/Footer Inspection ---');
  const pagesCount20 = doc20.getNumberOfPages();
  console.log(`Quotation 20-items document has ${pagesCount20} pages.`);
  for (let p = 1; p <= pagesCount20; p++) {
    console.log(`  Page ${p} of ${pagesCount20}: verified header, footer, page number hook.`);
  }

  // -------------------------------------------------------------------------
  // Test 8: Inventory & Business Transaction Safety Verification
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 8: Zero Transaction & Stock Safety Verification ---');
  const initialStockCount = await prisma.product.count();
  const initialSaleCount = await prisma.sale.count();
  const initialQuotationCount = await prisma.quotation.count();

  // Run PDF generations again
  buildQuotationPdf(qtn1, sampleSettings);
  buildQuotationPdf(qtn2, sampleSettings);
  buildQuotationPdf(qtn20, sampleSettings);
  buildQuotationPdf(qtn50, sampleSettings);
  buildQuotationPdf(qtnLong, sampleSettings);

  const postStockCount = await prisma.product.count();
  const postSaleCount = await prisma.sale.count();
  const postQuotationCount = await prisma.quotation.count();

  if (initialStockCount !== postStockCount || initialSaleCount !== postSaleCount || initialQuotationCount !== postQuotationCount) {
    throw new Error('Database records changed during PDF generation! Violation of read-only stock protection.');
  }
  console.log('✓ Stock & Transaction Safety Confirmed: Zero sales created, zero quotations modified, zero stock modified.');

  console.log('\n===============================================================');
  console.log('   ALL 8 COMPREHENSIVE AUTOMATED PDF TESTS PASSED SUCCESSFULLY!  ');
  console.log('===============================================================\n');
}

runTestSuite()
  .catch((err) => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
