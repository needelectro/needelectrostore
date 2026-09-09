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
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      padding: 35px;
      border-radius: 8px;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    .brand-title { font-size: 26px; font-weight: 800; color: #002B5B; margin: 0; }
    .brand-sub { font-size: 13px; color: #008CFF; font-weight: 600; margin: 2px 0 0 0; }
    .inv-title { font-size: 22px; font-weight: 800; color: #008CFF; text-align: right; }
    .info-table { width: 100%; margin-bottom: 25px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    .items-table th { background: #002B5B; color: #fff; padding: 10px; text-align: left; font-size: 13px; }
    .summary-table { width: 320px; float: right; margin-bottom: 25px; }
    .summary-table td { padding: 6px 10px; }
    .grand-total { font-size: 16px; font-weight: 800; color: #002B5B; background: #f1f5f9; border-top: 2px solid #008CFF; }
    .footer-note { clear: both; margin-top: 40px; padding-top: 15px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="invoice-card">
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

    <div class="footer-note">
      <p>Thank you for choosing NEED ELECTRO! Goods once sold can be exchanged within 7 days with original receipt.</p>
      <p>For technical support and warranty claims, visit our service center or contact ${companyPhone}.</p>
      <p style="margin-top: 8px; font-weight: 800; font-size: 11px; color: #000; letter-spacing: 0.05em; text-transform: uppercase;">Software Development By AMDADS GROUP</p>
    </div>
  </div>
</body>
</html>
  `;
}
