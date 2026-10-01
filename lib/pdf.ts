// NEED ELECTRO ERP — Production Vector-Grade PDF Generation Engine
// Generates pixel-perfect, printable A4 HTML/PDF documents for Invoices & EMI Contracts

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  invoiceTime?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerType?: string;
  customerCode?: string;
  billingAddress?: string;
  shippingAddress?: string;
  branchName: string;
  branchPhone?: string;
  branchAddress?: string;
  salespersonName?: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxAmount?: number;
    total: number;
    warrantyMonths?: number;
    serialNumbers?: string[];
    description?: string;
  }>;
  subtotal: number;
  discount: number;
  vatAmount: number;
  vatPercent?: number;
  deliveryCharge?: number;
  serviceCharge?: number;
  otherCharges?: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  previousDue?: number;
  totalDue?: number;
  changeAmount?: number;
  payments?: Array<{
    method: string;
    amount: number;
    ref?: string;
    date?: string;
  }>;
  saleType?: string;
  emiDetails?: {
    emiNumber?: string;
    laptopPrice?: number;
    downPayment?: number;
    financedAmount?: number;
    durationMonths?: number;
    monthlyInstallment?: number;
    totalPayable?: number;
    totalPaid?: number;
    remainingBalance?: number;
    nextPaymentDate?: string;
    status?: string;
  };
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
 * Generate standard A4 printable invoice HTML document matching Need Electro Brand Style Guide
 */
export function generateInvoiceHTML(data: InvoiceData, settings?: any): string {
  const companyName = settings?.companyName || 'NEED ELECTRO';
  const companyTagline = settings?.companyTagline || 'Trusted Electrical & Technological Solutions';
  const sisterConcern = settings?.sisterConcern || 'A Sister Concern of AMDADS Group';
  const companyPhone = settings?.phone || '+880 1733-983752';
  const companyEmail = settings?.email || 'needelectro23@gmail.com';
  const companyWebsite = settings?.website || 'www.needelectro.com';
  const companyAddress = settings?.address || 'Shop No: 5, MR Plaza, Kusumbag, Moulvibazar';
  const currency = settings?.currencySymbol || '৳';

  const isEMI = data.saleType === 'EMI' || !!data.emiDetails;
  const isPaid = data.dueAmount <= 0;

  const rowsHtml = data.items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 9px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 700; color: #475569;">${idx + 1}</td>
      <td style="padding: 9px 10px; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: 700; color: #002B5B; font-size: 13px;">${item.name}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          SKU: <strong style="color: #334155;">${item.sku}</strong>
          ${item.warrantyMonths ? ` | Warranty: <strong style="color: #008CFF;">${item.warrantyMonths} Months</strong>` : ''}
          ${item.description ? ` | <span>${item.description}</span>` : ''}
        </div>
        ${
          item.serialNumbers && item.serialNumbers.length > 0
            ? `<div style="font-size: 10.5px; color: #008CFF; font-family: 'Consolas', monospace; margin-top: 3px; font-weight: 600;">
                S/N: ${item.serialNumbers.join(', ')}
              </div>`
            : ''
        }
      </td>
      <td style="padding: 9px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 700; color: #0f172a;">${item.quantity}</td>
      <td style="padding: 9px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #334155;">${currency} ${item.unitPrice.toLocaleString('en-IN')}</td>
      ${
        item.discount && item.discount > 0
          ? `<td style="padding: 9px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #dc2626;">-${currency} ${item.discount.toLocaleString('en-IN')}</td>`
          : `<td style="padding: 9px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #94a3b8;">-</td>`
      }
      <td style="padding: 9px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 800; color: #002B5B;">${currency} ${item.total.toLocaleString('en-IN')}</td>
    </tr>
  `
    )
    .join('');

  // Payment breakdown text
  let paymentsHtml = '';
  if (data.payments && data.payments.length > 0) {
    paymentsHtml = data.payments
      .map(
        (p) =>
          `<div style="display: flex; justify-content: space-between; font-size: 11.5px; padding: 2px 0;">
            <span style="color: #475569;">• ${p.method}${p.ref ? ` (Ref: ${p.ref})` : ''}:</span>
            <strong style="color: #16a34a;">${currency} ${Number(p.amount).toLocaleString('en-IN')}</strong>
          </div>`
      )
      .join('');
  } else if (data.paidAmount > 0) {
    paymentsHtml = `<div style="display: flex; justify-content: space-between; font-size: 11.5px; padding: 2px 0;">
      <span style="color: #475569;">• Direct Payment:</span>
      <strong style="color: #16a34a;">${currency} ${data.paidAmount.toLocaleString('en-IN')}</strong>
    </div>`;
  }

  // EMI block if EMI sale
  const emiBlockHtml = isEMI && data.emiDetails ? `
    <div style="margin: 16px 0; border: 1.5px solid #f59e0b; border-radius: 8px; background: #fffbeb; padding: 12px 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #fde68a; padding-bottom: 6px; margin-bottom: 8px;">
        <span style="font-weight: 800; color: #b45309; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase;">
          ★ LAPTOP EMI FINANCING DETAILS (কিস্তির বিবরণ)
        </span>
        <span style="font-size: 11px; background: #f59e0b; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: 700;">
          ${data.emiDetails.status || 'ACTIVE'}
        </span>
      </div>
      <table style="width: 100%; font-size: 11.5px; border-collapse: collapse;">
        <tr>
          <td style="padding: 3px 0; color: #78350f;">EMI Contract No:</td>
          <td style="text-align: right; font-weight: 700; color: #78350f;">${data.emiDetails.emiNumber || 'N/A'}</td>
          <td style="padding: 3px 0 3px 20px; color: #78350f;">Product Price:</td>
          <td style="text-align: right; font-weight: 700; color: #78350f;">${currency} ${(data.emiDetails.laptopPrice || data.grandTotal).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding: 3px 0; color: #78350f;">Down Payment Paid:</td>
          <td style="text-align: right; font-weight: 700; color: #16a34a;">${currency} ${(data.emiDetails.downPayment || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 3px 0 3px 20px; color: #78350f;">Financed Balance:</td>
          <td style="text-align: right; font-weight: 700; color: #b45309;">${currency} ${(data.emiDetails.financedAmount || 0).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding: 3px 0; color: #78350f;">Duration:</td>
          <td style="text-align: right; font-weight: 700; color: #78350f;">${data.emiDetails.durationMonths || 6} Months</td>
          <td style="padding: 3px 0 3px 20px; color: #78350f;">Monthly Installment:</td>
          <td style="text-align: right; font-weight: 800; color: #002B5B; font-size: 12.5px;">${currency} ${(data.emiDetails.monthlyInstallment || 0).toLocaleString('en-IN')} / mo</td>
        </tr>
        ${data.emiDetails.nextPaymentDate ? `
        <tr>
          <td style="padding: 3px 0; color: #78350f;">Next Payment Date:</td>
          <td style="text-align: right; font-weight: 700; color: #b45309;">${new Date(data.emiDetails.nextPaymentDate).toLocaleDateString()}</td>
          <td style="padding: 3px 0 3px 20px; color: #78350f;">Outstanding Balance:</td>
          <td style="text-align: right; font-weight: 800; color: #dc2626;">${currency} ${(data.emiDetails.remainingBalance || data.dueAmount).toLocaleString('en-IN')}</td>
        </tr>` : ''}
      </table>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invoice - ${data.invoiceNumber}</title>
  <style>
    @media print {
      @page {
        size: A4 portrait;
        margin: 10mm 12mm 12mm 12mm;
      }
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        background: #fff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .invoice-card {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .page-break-inside-avoid {
        page-break-inside: avoid;
      }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f1f5f9;
      margin: 0;
      padding: 24px 12px;
      font-size: 12px;
      line-height: 1.45;
    }
    .invoice-card {
      position: relative;
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 32px 36px;
      box-shadow: 0 4px 20px rgba(0, 43, 91, 0.08);
      overflow: hidden;
    }
    .watermark {
      position: absolute;
      top: 48%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 440px;
      max-width: 80%;
      opacity: 0.07;
      pointer-events: none;
      z-index: 0;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; position: relative; z-index: 1; }
    .brand-title { font-size: 26px; font-weight: 900; color: #002B5B; margin: 0; letter-spacing: -0.02em; }
    .brand-sub { font-size: 12px; color: #008CFF; font-weight: 700; margin: 2px 0 0 0; }
    .sister-concern { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 1px; }
    .inv-badge {
      display: inline-block;
      background: ${isEMI ? '#f59e0b' : '#002B5B'};
      color: #ffffff;
      padding: 4px 14px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .info-boxes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 18px;
      position: relative;
      z-index: 1;
    }
    .info-box {
      background: #F4F6F8;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
    }
    .box-title {
      font-size: 10px;
      font-weight: 800;
      color: #008CFF;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
    }
    .items-table th {
      background: #002B5B;
      color: #ffffff;
      padding: 8px 10px;
      font-size: 11.5px;
      font-weight: 700;
      text-align: left;
    }
    .summary-container {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 18px;
      position: relative;
      z-index: 1;
    }
    .payment-info-box {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
    }
    .totals-table {
      width: 290px;
      border-collapse: collapse;
      font-size: 12px;
    }
    .totals-table td {
      padding: 4px 8px;
    }
    .grand-total-row {
      background: #002B5B;
      color: #ffffff;
      font-weight: 800;
      font-size: 13.5px;
    }
    .grand-total-row td {
      padding: 6px 8px;
    }
    .warranty-section {
      border-top: 1.5px solid #002B5B;
      padding-top: 10px;
      margin-top: 16px;
      position: relative;
      z-index: 1;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
      margin-top: 36px;
      position: relative;
      z-index: 1;
    }
    .signature-line {
      border-top: 1px dashed #64748b;
      padding-top: 5px;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      color: #334155;
    }
    .footer-bar {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e1;
      text-align: center;
      font-size: 10px;
      color: #64748b;
      position: relative;
      z-index: 1;
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="watermark">
      <img src="/logo-transparent.png" alt="NEED ELECTRO Watermark" style="width: 100%; display: block;" />
    </div>

    <!-- Header -->
    <table class="header-table">
      <tr>
        <td style="vertical-align: top; width: 62%;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
            <img src="/logo.png" alt="Need Electro Logo" style="height: 44px; width: auto; object-fit: contain;" onerror="this.style.display='none'" />
            <div>
              <h1 class="brand-title">${companyName}</h1>
              <p class="brand-sub">${companyTagline}</p>
              <div class="sister-concern">${sisterConcern}</div>
            </div>
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 6px; line-height: 1.4;">
            <strong>Main Branch:</strong> ${data.branchAddress || companyAddress}<br/>
            Hotline: <strong>${companyPhone}</strong> | Email: <strong>${companyEmail}</strong> | Web: <strong>${companyWebsite}</strong>
          </div>
        </td>
        <td style="vertical-align: top; text-align: right; width: 38%;">
          <div class="inv-badge">${isEMI ? 'EMI INVOICE' : 'TAX INVOICE'}</div>
          <div style="margin-top: 8px; font-size: 12px;">
            <div><strong>Invoice No:</strong> <span style="font-family: monospace; font-size: 13px; font-weight: 800; color: #008CFF;">${data.invoiceNumber}</span></div>
            <div style="color: #475569; margin-top: 2px;"><strong>Date:</strong> ${new Date(data.date).toLocaleDateString('en-GB')} ${data.invoiceTime || ''}</div>
            <div style="color: #475569; margin-top: 2px;"><strong>Salesperson:</strong> ${data.salespersonName || 'Showroom Sales'}</div>
            <div style="color: #475569; margin-top: 2px;"><strong>Branch:</strong> ${data.branchName || 'Moulvibazar Main'}</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Customer & Bill To Details -->
    <div class="info-boxes-grid">
      <div class="info-box">
        <div class="box-title">Billed To (ক্রেতার বিবরণ)</div>
        <div style="font-weight: 800; font-size: 13.5px; color: #002B5B;">${data.customerName || 'Walking Customer'}</div>
        <div style="font-size: 11.5px; color: #334155; margin-top: 2px;">
          Phone: <strong>${data.customerPhone || 'N/A'}</strong>
          ${data.customerEmail ? ` | Email: ${data.customerEmail}` : ''}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          Address: ${data.billingAddress || data.customerAddress || 'Moulvibazar, Sylhet'}
        </div>
        <div style="font-size: 10.5px; color: #008CFF; margin-top: 3px; font-weight: 600;">
          Customer ID: ${data.customerCode || 'CUST-REGULAR'} | Type: ${data.customerType || 'Retail'}
        </div>
      </div>

      <div class="info-box">
        <div class="box-title">Invoice & Shipping Information</div>
        <div style="font-size: 11.5px; color: #334155;">
          <div><strong>Payment Status:</strong> 
            <span style="font-weight: 800; color: ${isPaid ? '#16a34a' : '#ea580c'};">
              ${isPaid ? 'PAID IN FULL' : `DUE: ${currency} ${data.dueAmount.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div style="margin-top: 3px;"><strong>Sale Type:</strong> ${data.saleType || 'REGULAR'} SALE</div>
          ${data.shippingAddress && data.shippingAddress !== data.billingAddress ? `
            <div style="margin-top: 3px; font-size: 11px; color: #64748b;">
              <strong>Shipping Address:</strong> ${data.shippingAddress}
            </div>` : ''}
          <div style="margin-top: 3px; font-size: 11px; color: #002B5B; font-weight: 600;">
            Original Verified Tax Invoice
          </div>
        </div>
      </div>
    </div>

    <!-- Line Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 36px; text-align: center;">SL</th>
          <th>Product / Service Description & Serial</th>
          <th style="width: 50px; text-align: center;">Qty</th>
          <th style="width: 95px; text-align: right;">Unit Price</th>
          <th style="width: 75px; text-align: right;">Discount</th>
          <th style="width: 105px; text-align: right;">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <!-- EMI Block (Shown only if EMI Sale) -->
    ${emiBlockHtml}

    <!-- Financial Summary & Payment Breakdown -->
    <div class="summary-container page-break-inside-avoid">
      <div class="payment-info-box">
        <div class="box-title" style="margin-bottom: 6px;">Payment Breakdown (পরিশোধের বিবরণ)</div>
        ${paymentsHtml}
        ${
          data.notes
            ? `<div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #475569;">
                <strong>Invoice Remarks:</strong> ${data.notes}
              </div>`
            : ''
        }
      </div>

      <table class="totals-table">
        <tr>
          <td style="color: #475569;">Subtotal:</td>
          <td style="text-align: right; font-weight: 700;">${currency} ${data.subtotal.toLocaleString('en-IN')}</td>
        </tr>
        ${
          data.discount > 0
            ? `<tr>
                <td style="color: #dc2626;">Invoice Discount:</td>
                <td style="text-align: right; color: #dc2626; font-weight: 700;">-${currency} ${data.discount.toLocaleString('en-IN')}</td>
              </tr>`
            : ''
        }
        ${
          data.vatAmount > 0
            ? `<tr>
                <td style="color: #475569;">VAT / Tax${data.vatPercent ? ` (${data.vatPercent}%)` : ''}:</td>
                <td style="text-align: right; font-weight: 700;">+${currency} ${data.vatAmount.toLocaleString('en-IN')}</td>
              </tr>`
            : ''
        }
        ${
          data.deliveryCharge && data.deliveryCharge > 0
            ? `<tr>
                <td style="color: #475569;">Delivery Charge:</td>
                <td style="text-align: right; font-weight: 700;">+${currency} ${data.deliveryCharge.toLocaleString('en-IN')}</td>
              </tr>`
            : ''
        }
        ${
          data.serviceCharge && data.serviceCharge > 0
            ? `<tr>
                <td style="color: #475569;">Service Charge:</td>
                <td style="text-align: right; font-weight: 700;">+${currency} ${data.serviceCharge.toLocaleString('en-IN')}</td>
              </tr>`
            : ''
        }
        ${
          data.otherCharges && data.otherCharges > 0
            ? `<tr>
                <td style="color: #475569;">Other Charges:</td>
                <td style="text-align: right; font-weight: 700;">+${currency} ${data.otherCharges.toLocaleString('en-IN')}</td>
              </tr>`
            : ''
        }
        <tr class="grand-total-row">
          <td>Grand Total:</td>
          <td style="text-align: right;">${currency} ${data.grandTotal.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="color: #16a34a; font-weight: 700;">Paid Amount:</td>
          <td style="text-align: right; color: #16a34a; font-weight: 800;">${currency} ${data.paidAmount.toLocaleString('en-IN')}</td>
        </tr>
        ${
          data.dueAmount > 0
            ? `<tr>
                <td style="color: #dc2626; font-weight: 800;">Current Invoice Due:</td>
                <td style="text-align: right; color: #dc2626; font-weight: 800;">${currency} ${data.dueAmount.toLocaleString('en-IN')}</td>
              </tr>`
            : ''
        }
        ${
          data.previousDue && data.previousDue > 0
            ? `<tr>
                <td style="color: #d97706; font-size: 11px;">Customer Previous Due:</td>
                <td style="text-align: right; color: #d97706; font-weight: 700; font-size: 11px;">${currency} ${data.previousDue.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="border-top: 1.5px solid #cbd5e1;">
                <td style="color: #b45309; font-weight: 800;">Total Customer Due:</td>
                <td style="text-align: right; color: #b45309; font-weight: 800;">${currency} ${(data.totalDue || (data.previousDue + data.dueAmount)).toLocaleString('en-IN')}</td>
              </tr>`
            : ''
        }
        ${
          data.changeAmount && data.changeAmount > 0
            ? `<tr>
                <td style="color: #0284c7; font-weight: 700;">Return / Change:</td>
                <td style="text-align: right; color: #0284c7; font-weight: 800;">${currency} ${data.changeAmount.toLocaleString('en-IN')}</td>
              </tr>`
            : ''
        }
      </table>
    </div>

    <!-- Official Warranty Terms & Conditions -->
    <div class="warranty-section page-break-inside-avoid">
      <div style="font-weight: 800; text-transform: uppercase; font-size: 10.5px; color: #002B5B; letter-spacing: 0.03em; margin-bottom: 4px;">
        NEED ELECTRO WARRANTY & COMMERCIAL TERMS
      </div>
      <ol style="padding-left: 16px; margin: 0; font-size: 9.5px; line-height: 1.45; color: #334155;">
        <li>Warranty is valid only upon presentation of this original official tax invoice.</li>
        <li>Warranty covers manufacturing and hardware operational defects only.</li>
        <li>Physical damage, liquid damage, power burn/short-circuit, and accidental drops are not covered under warranty.</li>
        <li>Warranty will be rendered null and void if repaired or tampered with by unauthorized personnel.</li>
        <li>Broken, scratched, or removed warranty stickers, holograms, or factory seals void all warranty coverage.</li>
        <li>Software corruption, operating system issues, virus attacks, and data loss are not covered.</li>
        <li>Warranty service is subject to technical assessment by our authorized service department (3 to 7 working days).</li>
        <li>NEED ELECTRO reserves the right to accept, repair, replace, or reject warranty claims based on inspection findings.</li>
        <li>Customer is responsible for courier/delivery charges associated with return or warranty transportation.</li>
      </ol>
      <div style="margin-top: 6px; font-weight: 800; font-size: 10.5px; color: #002B5B;">
        Thank you for choosing NEED ELECTRO.
      </div>
    </div>

    <!-- Authorized Signatures -->
    <div class="signature-grid page-break-inside-avoid">
      <div class="signature-line">
        Customer's Signature
      </div>
      <div class="signature-line">
        Prepared By: ${data.salespersonName || 'Amdadur Rahman'}
      </div>
      <div class="signature-line">
        Authorized NEED ELECTRO
      </div>
    </div>

    <!-- Core Services Footer & Development Credit -->
    <div class="footer-bar page-break-inside-avoid">
      <div style="font-weight: 700; color: #002B5B; margin-bottom: 2px;">
        Our Core Solutions: Laptops • Desktops • CCTV Systems • Smart Electrical Installations • Mobile & Web Development
      </div>
      <div>
        ${companyAddress} • Hotline: ${companyPhone} • Email: ${companyEmail}
      </div>
      <div style="margin-top: 6px; font-weight: 800; font-size: 10px; color: #000; letter-spacing: 0.06em; text-transform: uppercase;">
        Software Developed By AMDADS GROUP
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
