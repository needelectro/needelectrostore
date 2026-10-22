// NEED ELECTRO ERP — Production PDF Generation Engine
// Generates vector-grade, printable PDFs for Invoices, Thermal Receipts, EMI Contracts & Reports

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  branchName: string;
  branchPhone?: string;
  branchAddress?: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
    serialNumbers?: string[];
  }>;
  subtotal: number;
  discount: number;
  vatAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
}

export interface EMIAgreementData {
  emiNumber: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerNid?: string;
  customerAddress?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorNid?: string;
  guarantorAddress?: string;
  productName: string;
  serialNumber: string;
  laptopPrice: number;
  downPayment: number;
  financedAmount: number;
  durationMonths: number;
  monthlyInstallment: number;
  totalPayable: number;
  installments: Array<{
    installmentNumber: number;
    dueDate: string;
    amount: number;
  }>;
}

/**
 * Generate standard A4 printable invoice HTML document
 */
export function generateInvoiceHTML(data: InvoiceData, settings?: any): string {
  const companyName = settings?.companyName || 'NEED ELECTRO';
  const companyTagline = settings?.companyTagline || 'Trusted Electrical & Technological Solutions';
  const companyPhone = settings?.phone || '+880 1733-983752';
  const companyAddress = settings?.address || 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet';
  const currency = settings?.currencySymbol || '৳';

  const rowsHtml = data.items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
        <strong>${item.name}</strong>
        <div style="font-size: 11px; color: #64748b;">SKU: ${item.sku}</div>
        ${
          item.serialNumbers && item.serialNumbers.length > 0
            ? `<div style="font-size: 11px; color: #008CFF; font-family: monospace;">S/N: ${item.serialNumbers.join(', ')}</div>`
            : ''
        }
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${currency} ${item.unitPrice.toLocaleString('en-IN')}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${currency} ${item.total.toLocaleString('en-IN')}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${data.invoiceNumber}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 30px;
      background: #fff;
    }
    .invoice-card {
      position: relative;
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      padding: 35px;
      border-radius: 8px;
      overflow: hidden;
    }
    .watermark {
      position: absolute;
      top: 48%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 480px;
      max-width: 85%;
      opacity: 0.16;
      pointer-events: none;
      z-index: 0;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; position: relative; z-index: 1; }
    .brand-title { font-size: 26px; font-weight: 800; color: #002B5B; margin: 0; }
    .brand-sub { font-size: 13px; color: #008CFF; font-weight: 600; margin: 2px 0 0 0; }
    .inv-title { font-size: 22px; font-weight: 800; color: #008CFF; text-align: right; }
    .info-table { width: 100%; margin-bottom: 25px; position: relative; z-index: 1; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; position: relative; z-index: 1; background: transparent; }
    .items-table th { background: #002B5B; color: #fff; padding: 10px; text-align: left; font-size: 13px; }
    .items-table td { background: transparent; }
    .summary-table { width: 320px; float: right; margin-bottom: 25px; position: relative; z-index: 1; }
    .summary-table td { padding: 6px 10px; }
    .grand-total { font-size: 16px; font-weight: 800; color: #002B5B; background: #f1f5f9; border-top: 2px solid #008CFF; }
    .footer-note { clear: both; margin-top: 40px; padding-top: 15px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="watermark">
      <img src="/logo-transparent.png" alt="NEED ELECTRO Watermark" style="width: 100%; display: block;" />
    </div>
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <h1 class="brand-title">${companyName}</h1>
          <p class="brand-sub">${companyTagline}</p>
          <div style="font-size: 12px; color: #475569; margin-top: 6px;">
            ${companyAddress}<br/>
            Phone: ${companyPhone} | Branch: ${data.branchName}
          </div>
        </td>
        <td style="vertical-align: top; text-align: right;">
          <div class="inv-title">TAX INVOICE</div>
          <div style="font-size: 13px; margin-top: 4px;"><strong>Invoice #:</strong> ${data.invoiceNumber}</div>
          <div style="font-size: 13px; color: #64748b;"><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</div>
        </td>
      </tr>
    </table>

    <table class="info-table" style="width: 100%; border-collapse: separate; border-spacing: 12px 0;">
      <tr>
        <td style="width: 50%; vertical-align: top; padding: 0;">
          <div class="info-box">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px;">BILLED TO:</div>
            <strong style="font-size: 15px; color: #0f172a;">${data.customerName}</strong>
            <div style="font-size: 13px; color: #475569; margin-top: 2px;">Phone: ${data.customerPhone}</div>
            ${data.customerAddress ? `<div style="font-size: 12px; color: #64748b;">${data.customerAddress}</div>` : ''}
          </div>
        </td>
        <td style="width: 50%; vertical-align: top; padding: 0;">
          <div class="info-box">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px;">OUTLET & ISSUED BY:</div>
            <strong style="font-size: 14px; color: #0f172a;">${data.branchName}</strong>
            <div style="font-size: 12px; color: #475569;">Authorized Commercial Outlet</div>
            <div style="font-size: 12px; color: #008CFF; margin-top: 4px;">Verified Original Tax Invoice</div>
          </div>
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th>Description / Product / Serial</th>
          <th style="width: 60px; text-align: center;">Qty</th>
          <th style="width: 110px; text-align: right;">Unit Price</th>
          <th style="width: 120px; text-align: right;">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <table class="summary-table">
      <tr>
        <td>Subtotal:</td>
        <td style="text-align: right;">${currency} ${data.subtotal.toLocaleString('en-IN')}</td>
      </tr>
      ${
        data.discount > 0
          ? `<tr>
        <td style="color: #ef4444;">Discount:</td>
        <td style="text-align: right; color: #ef4444;">- ${currency} ${data.discount.toLocaleString('en-IN')}</td>
      </tr>`
          : ''
      }
      ${
        data.vatAmount > 0
          ? `<tr>
        <td>VAT / Tax:</td>
        <td style="text-align: right;">+ ${currency} ${data.vatAmount.toLocaleString('en-IN')}</td>
      </tr>`
          : ''
      }
      <tr class="grand-total">
        <td><strong>Grand Total:</strong></td>
        <td style="text-align: right;"><strong>${currency} ${data.grandTotal.toLocaleString('en-IN')}</strong></td>
      </tr>
      <tr>
        <td style="color: #16a34a;">Paid Amount:</td>
        <td style="text-align: right; color: #16a34a; font-weight: bold;">${currency} ${data.paidAmount.toLocaleString('en-IN')}</td>
      </tr>
      ${
        data.dueAmount > 0
          ? `<tr>
        <td style="color: #dc2626; font-weight: bold;">Balance Due:</td>
        <td style="text-align: right; color: #dc2626; font-weight: bold;">${currency} ${data.dueAmount.toLocaleString('en-IN')}</td>
      </tr>`
          : ''
      }
    </table>

    <div style="clear: both; margin-top: 25px; padding-top: 14px; border-top: 1.5px solid #0f172a; position: relative; z-index: 1;">
      <div style="font-weight: 800; text-transform: uppercase; font-size: 11px; margin-bottom: 6px; color: #000000; letter-spacing: 0.02em;">
        NEED ELECTRO WARRANTY TERMS
      </div>
      <ol style="padding-left: 18px; margin: 0; font-size: 10px; line-height: 1.45; color: #1e293b;">
        <li>Warranty is valid only with the original invoice.</li>
        <li>Warranty covers manufacturing defects only.</li>
        <li>Physical damage, liquid damage, burn damage, and accidental damage are not covered.</li>
        <li>Warranty will be void if the product is repaired or modified by unauthorized persons.</li>
        <li>Broken or removed warranty stickers/seals will void the warranty.</li>
        <li>Software issues, viruses, and data loss are not covered.</li>
        <li>Warranty service may include repair or replacement subject to product inspection.</li>
        <li>NEED ELECTRO reserves the right to accept or reject any warranty claim after technical assessment.</li>
        <li>Customer will pay delivery fee of warrenty support.</li>
      </ol>
      <div style="margin-top: 8px; font-weight: 800; font-size: 11px; color: #000000;">
        Thank you for choosing NEED ELECTRO.
      </div>
    </div>

    <div class="footer-note" style="position: relative; z-index: 1;">
      <p style="margin-top: 6px; font-weight: 800; font-size: 11px; color: #000; letter-spacing: 0.05em; text-transform: uppercase;">Software Developed By AMDADS GROUP</p>
    </div>
  </div>
</body>
</html>
  `;
}

export interface QuotationData {
  quotationNumber: string;
  referenceNumber?: string;
  quotationDate: string;
  validUntil: string;
  status: string;
  customerName: string;
  companyName?: string;
  customerPhone: string;
  customerEmail?: string;
  billingAddress?: string;
  deliveryAddress?: string;
  branchName: string;
  branchPhone?: string;
  branchAddress?: string;
  preparedByName?: string;
  salespersonName?: string;
  items: Array<{
    name: string;
    sku: string;
    category?: string;
    brand?: string;
    model?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxAmount?: number;
    total: number;
    warrantyMonths?: number;
  }>;
  subtotal: number;
  discountTotal: number;
  vatAmount: number;
  vatPercent: number;
  deliveryCharge: number;
  serviceCharge: number;
  otherCharges: number;
  grandTotal: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  customerNotes?: string;
}

/**
 * Generate standard A4 printable sales quotation HTML document
 */
export function generateQuotationHTML(data: QuotationData, settings?: any): string {
  const companyName = settings?.companyName || 'NEED ELECTRO';
  const companyTagline = settings?.companyTagline || 'Trusted Electrical & Technological Solutions';
  const companyPhone = settings?.phone || '+880 1733-983752';
  const companyAddress = settings?.address || 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh';
  const companyEmail = settings?.email || 'contact.amdadur@gmail.com';
  const companyWebsite = settings?.website || 'https://needelectroerp.vercel.app';
  const currency = settings?.currencySymbol || '৳';

  const rowsHtml = data.items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
        <strong style="color: #0f172a; font-size: 13px;">${item.name}</strong>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          <span>SKU: ${item.sku}</span>
          ${item.model ? `<span style="margin-left: 10px;">Model: ${item.model}</span>` : ''}
          ${item.brand ? `<span style="margin-left: 10px;">Brand: ${item.brand}</span>` : ''}
        </div>
        ${item.warrantyMonths ? `<div style="font-size: 11px; color: #0284c7; margin-top: 2px;">Warranty: ${item.warrantyMonths} Months</div>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 600;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${currency} ${item.unitPrice.toLocaleString('en-IN')}</td>
      ${
        data.discountTotal > 0 || data.items.some(i => (i.discount || 0) > 0)
          ? `<td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #ef4444;">${(item.discount || 0) > 0 ? `-${currency} ${(item.discount || 0).toLocaleString('en-IN')}` : '-'}</td>`
          : ''
      }
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #002B5B;">${currency} ${item.total.toLocaleString('en-IN')}</td>
    </tr>
  `
    )
    .join('');

  const hasItemDiscount = data.discountTotal > 0 || data.items.some(i => (i.discount || 0) > 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quotation - ${data.quotationNumber}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 30px;
      background: #fff;
    }
    .quotation-card {
      position: relative;
      max-width: 820px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      padding: 35px;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
    }
    .watermark {
      position: absolute;
      top: 48%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 480px;
      max-width: 85%;
      opacity: 0.12;
      pointer-events: none;
      z-index: 0;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; position: relative; z-index: 1; }
    .brand-title { font-size: 26px; font-weight: 800; color: #002B5B; margin: 0; }
    .brand-sub { font-size: 13px; color: #008CFF; font-weight: 600; margin: 2px 0 0 0; }
    .qtn-badge {
      display: inline-block;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      color: #0284c7;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .qtn-title { font-size: 24px; font-weight: 800; color: #002B5B; text-align: right; }
    .info-table { width: 100%; margin-bottom: 25px; position: relative; z-index: 1; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; position: relative; z-index: 1; background: transparent; }
    .items-table th { background: #002B5B; color: #fff; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .items-table td { background: transparent; }
    .summary-table { width: 340px; float: right; margin-bottom: 25px; position: relative; z-index: 1; border-collapse: collapse; }
    .summary-table td { padding: 6px 12px; font-size: 13px; }
    .grand-total { font-size: 16px; font-weight: 800; color: #002B5B; background: #f1f5f9; border-top: 2px solid #008CFF; border-bottom: 2px solid #008CFF; }
    .disclaimer-box {
      clear: both;
      margin-top: 25px;
      padding: 12px 14px;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      font-size: 11px;
      color: #92400e;
      line-height: 1.5;
      position: relative;
      z-index: 1;
    }
    .terms-box {
      margin-top: 18px;
      padding: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 11px;
      color: #334155;
      line-height: 1.5;
      position: relative;
      z-index: 1;
    }
    .signature-table {
      width: 100%;
      margin-top: 45px;
      border-collapse: collapse;
      position: relative;
      z-index: 1;
    }
    .signature-line {
      border-top: 1px dashed #64748b;
      margin-top: 40px;
      padding-top: 6px;
      font-size: 11px;
      color: #475569;
      text-align: center;
      font-weight: 600;
    }
    .footer-note { clear: both; margin-top: 30px; padding-top: 15px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="quotation-card">
    <div class="watermark">
      <img src="/logo-transparent.png" alt="NEED ELECTRO Watermark" style="width: 100%; display: block;" />
    </div>

    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <h1 class="brand-title">${companyName}</h1>
          <p class="brand-sub">${companyTagline}</p>
          <div style="font-size: 12px; color: #475569; margin-top: 6px; line-height: 1.4;">
            ${companyAddress}<br/>
            Phone: ${companyPhone} | Email: ${companyEmail}<br/>
            Website: ${companyWebsite}
          </div>
        </td>
        <td style="vertical-align: top; text-align: right;">
          <div class="qtn-badge">COMMERCIAL PRICE PROPOSAL</div>
          <div class="qtn-title">SALES QUOTATION</div>
          <div style="font-size: 13px; margin-top: 6px;"><strong>Quotation #:</strong> <span style="font-family: monospace; font-size: 14px; color: #008CFF;">${data.quotationNumber}</span></div>
          ${data.referenceNumber ? `<div style="font-size: 12px; color: #64748b;"><strong>Ref #:</strong> ${data.referenceNumber}</div>` : ''}
          <div style="font-size: 12px; color: #475569; margin-top: 4px;"><strong>Issue Date:</strong> ${data.quotationDate}</div>
          <div style="font-size: 12px; color: #dc2626; font-weight: 600; margin-top: 2px;"><strong>Valid Until:</strong> ${data.validUntil}</div>
        </td>
      </tr>
    </table>

    <table class="info-table" style="width: 100%; border-collapse: separate; border-spacing: 12px 0;">
      <tr>
        <td style="width: 50%; vertical-align: top; padding: 0;">
          <div class="info-box">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px;">PREPARED FOR:</div>
            <strong style="font-size: 15px; color: #0f172a;">${data.customerName}</strong>
            ${data.companyName ? `<div style="font-size: 13px; font-weight: 600; color: #002B5B; margin-top: 2px;">${data.companyName}</div>` : ''}
            <div style="font-size: 13px; color: #475569; margin-top: 3px;">Phone: ${data.customerPhone}</div>
            ${data.customerEmail ? `<div style="font-size: 12px; color: #475569;">Email: ${data.customerEmail}</div>` : ''}
            ${data.billingAddress ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">Address: ${data.billingAddress}</div>` : ''}
            ${data.deliveryAddress ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">Delivery: ${data.deliveryAddress}</div>` : ''}
          </div>
        </td>
        <td style="width: 50%; vertical-align: top; padding: 0;">
          <div class="info-box">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px;">OFFICE & PREPARED BY:</div>
            <strong style="font-size: 14px; color: #0f172a;">${data.branchName}</strong>
            <div style="font-size: 12px; color: #475569; margin-top: 2px;">Prepared by: <strong>${data.preparedByName || 'Showroom Sales Team'}</strong></div>
            ${data.salespersonName ? `<div style="font-size: 12px; color: #475569;">Sales Rep: ${data.salespersonName}</div>` : ''}
            <div style="font-size: 12px; color: #008CFF; margin-top: 6px; font-weight: 600;">Status: ${data.status}</div>
          </div>
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 35px; text-align: center;">#</th>
          <th>Item & Specifications</th>
          <th style="width: 55px; text-align: center;">Qty</th>
          <th style="width: 105px; text-align: right;">Unit Price</th>
          ${hasItemDiscount ? '<th style="width: 85px; text-align: right;">Discount</th>' : ''}
          <th style="width: 115px; text-align: right;">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <table class="summary-table">
      <tr>
        <td style="color: #475569;">Subtotal:</td>
        <td style="text-align: right; font-weight: 600;">${currency} ${data.subtotal.toLocaleString('en-IN')}</td>
      </tr>
      ${
        data.discountTotal > 0
          ? `<tr>
        <td style="color: #ef4444;">Overall Discount:</td>
        <td style="text-align: right; color: #ef4444; font-weight: 600;">- ${currency} ${data.discountTotal.toLocaleString('en-IN')}</td>
      </tr>`
          : ''
      }
      ${
        data.vatAmount > 0
          ? `<tr>
        <td style="color: #475569;">VAT / Tax (${data.vatPercent}%):</td>
        <td style="text-align: right;">+ ${currency} ${data.vatAmount.toLocaleString('en-IN')}</td>
      </tr>`
          : ''
      }
      ${
        data.deliveryCharge > 0
          ? `<tr>
        <td style="color: #475569;">Delivery Charge:</td>
        <td style="text-align: right;">+ ${currency} ${data.deliveryCharge.toLocaleString('en-IN')}</td>
      </tr>`
          : ''
      }
      ${
        data.serviceCharge > 0
          ? `<tr>
        <td style="color: #475569;">Service / Installation:</td>
        <td style="text-align: right;">+ ${currency} ${data.serviceCharge.toLocaleString('en-IN')}</td>
      </tr>`
          : ''
      }
      ${
        data.otherCharges > 0
          ? `<tr>
        <td style="color: #475569;">Other Charges:</td>
        <td style="text-align: right;">+ ${currency} ${data.otherCharges.toLocaleString('en-IN')}</td>
      </tr>`
          : ''
      }
      <tr class="grand-total">
        <td><strong>Grand Total:</strong></td>
        <td style="text-align: right;"><strong>${currency} ${data.grandTotal.toLocaleString('en-IN')}</strong></td>
      </tr>
    </table>

    <div style="clear: both;"></div>

    <div class="disclaimer-box">
      <strong>Important Commercial Disclaimer:</strong> This quotation is a commercial price proposal only and does not constitute a sales invoice, payment receipt, stock reservation, or confirmation of product availability. Prices and availability are subject to the terms and validity period stated in this quotation.
    </div>

    ${data.customerNotes ? `<div style="margin-top: 15px; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; color: #334155;"><strong>Notes:</strong> ${data.customerNotes}</div>` : ''}

    <table class="signature-table">
      <tr>
        <td style="width: 40%; vertical-align: top;">
          <div class="signature-line">
            Customer Acceptance Signature & Date
          </div>
        </td>
        <td style="width: 20%;"></td>
        <td style="width: 40%; vertical-align: top;">
          <div class="signature-line">
            Authorized NEED ELECTRO Officer
          </div>
        </td>
      </tr>
    </table>

    <div class="footer-note" style="position: relative; z-index: 1;">
      <p style="margin: 0; font-weight: 800; font-size: 11px; color: #000; letter-spacing: 0.05em; text-transform: uppercase;">Software Developed By AMDADS GROUP</p>
    </div>
  </div>
</body>
</html>
  `;
}
