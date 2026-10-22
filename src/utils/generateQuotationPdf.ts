// NEED ELECTRO ERP — Professional Vector Commercial Quotation PDF Generation Engine
// Generates publication-quality, multi-page vector A4 business sales quotations
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation, SystemSettings } from '../types';
import { amountToBangladeshiTakaWords } from './numberToWords';
import { NEED_ELECTRO_LOGO_BASE64 } from '../assets/logoBase64';

export interface GenerateQuotationPdfOptions {
  filename?: string;
  currencyLabel?: string; // Default: 'BDT'
}

/**
 * Generates an authoritative, multi-page vector A4 PDF for a NEED ELECTRO Sales Quotation
 */
export function buildQuotationPdf(
  quotation: Quotation,
  settings?: SystemSettings | null,
  options: GenerateQuotationPdfOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const printableWidth = pageWidth - marginX * 2; // 182mm

  // Brand Palette
  const brandDarkNavy: [number, number, number] = [0, 43, 91];     // #002B5B
  const brandElectricBlue: [number, number, number] = [0, 140, 255]; // #008CFF
  const brandLightGrey: [number, number, number] = [244, 246, 248];  // #F4F6F8
  const borderGrey: [number, number, number] = [226, 232, 240];      // #E2E8F0
  const textDark: [number, number, number] = [15, 23, 42];           // #0F172A
  const textMuted: [number, number, number] = [71, 85, 105];         // #475569
  const accentRed: [number, number, number] = [220, 38, 38];         // #DC2626
  const accentGreen: [number, number, number] = [16, 185, 129];      // #10B981

  // Verified Company Defaults
  const safeSettings = settings || ({} as Partial<SystemSettings>);
  const companyName = safeSettings.companyName || 'NEED ELECTRO';
  const companyPhone = safeSettings.phone || '+880 1733-983752';
  const companyEmail = safeSettings.email || 'contact.amdadur@gmail.com';
  const companyAddress = safeSettings.address || 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh';
  const companyWebsite = safeSettings.website || 'https://www.needelectro.com';
  const currency = options.currencyLabel || 'BDT';

  // Financial figures
  const subtotal = Number(quotation.subtotal || 0);
  const discountTotal = Number(quotation.discountTotal || 0);
  const vatAmount = Number(quotation.vatAmount || 0);
  const vatPercent = Number(quotation.vatPercent || 0);
  const deliveryCharge = Number(quotation.deliveryCharge || 0);
  const serviceCharge = Number(quotation.serviceCharge || 0);
  const otherCharges = Number(quotation.otherCharges || 0);
  const grandTotal = Number(quotation.grandTotal || 0);
  const items = quotation.items || [];

  // Check if any line has an individual item discount
  const hasItemDiscounts = items.some((it) => Number(it.discount || 0) > 0);

  // -------------------------------------------------------------
  // 1. PAGE 1 HEADER
  // -------------------------------------------------------------
  let currentY = 14;

  // Render Official NEED ELECTRO Logo
  try {
    doc.addImage(NEED_ELECTRO_LOGO_BASE64, 'PNG', marginX, currentY, 36, 18.2);
  } catch (e) {
    // Fallback vector logo text if image loading fails
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...brandDarkNavy);
    doc.text(companyName, marginX, currentY + 8);
  }

  // Company Details below logo
  const compDetailsY = currentY + 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  doc.text('NEED ELECTRO SHOWROOM & IT SOLUTIONS', marginX, compDetailsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(companyAddress, marginX, compDetailsY + 3.8);
  doc.text(`Phone: ${companyPhone}  |  Email: ${companyEmail}`, marginX, compDetailsY + 7.4);
  doc.text(`Web: ${companyWebsite}  |  Store: https://www.needelectro.store`, marginX, compDetailsY + 11);

  // Top-Right Header Metadata Block
  const metaRightX = pageWidth - marginX; // 196mm
  let metaY = currentY + 2;

  // "COMMERCIAL PROPOSAL" Pill Badge
  doc.setFillColor(...brandDarkNavy);
  doc.roundedRect(metaRightX - 44, metaY - 3, 44, 5.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('COMMERCIAL PROPOSAL', metaRightX - 22, metaY + 0.8, { align: 'center' });

  // Main Document Title
  metaY += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...brandDarkNavy);
  doc.text('SALES QUOTATION', metaRightX, metaY, { align: 'right' });

  // Quotation Number
  metaY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text('Quotation #:', metaRightX - 60, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...brandElectricBlue);
  doc.text(quotation.quotationNumber || 'DRAFT', metaRightX, metaY, { align: 'right' });

  // Reference Number (if provided)
  if (quotation.referenceNumber) {
    metaY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('Reference #:', metaRightX - 60, metaY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.text(quotation.referenceNumber, metaRightX, metaY, { align: 'right' });
  }

  // Quotation Date
  metaY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text('Quotation Date:', metaRightX - 60, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.text(quotation.quotationDate || new Date().toISOString().split('T')[0], metaRightX, metaY, { align: 'right' });

  // Valid Until
  metaY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text('Valid Until:', metaRightX - 60, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentRed);
  doc.text(quotation.validUntil || 'Subject to Confirmation', metaRightX, metaY, { align: 'right' });

  // Status
  metaY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text('Status:', metaRightX - 60, metaY);
  doc.setFont('helvetica', 'bold');
  if (quotation.status === 'ACCEPTED' || quotation.status === 'CONVERTED') {
    doc.setTextColor(...accentGreen);
  } else if (quotation.status === 'SENT') {
    doc.setTextColor(...brandElectricBlue);
  } else if (quotation.status === 'REJECTED' || quotation.status === 'EXPIRED') {
    doc.setTextColor(...accentRed);
  } else {
    doc.setTextColor(...textDark);
  }
  doc.text(quotation.status || 'DRAFT', metaRightX, metaY, { align: 'right' });

  // Horizontal separating rule
  currentY = Math.max(compDetailsY + 14, metaY + 4);
  doc.setDrawColor(...brandDarkNavy);
  doc.setLineWidth(0.6);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  // -------------------------------------------------------------
  // 2. CUSTOMER & ISSUER DETAILS BOXES
  // -------------------------------------------------------------
  currentY += 4;
  const boxWidth = (printableWidth - 6) / 2; // ~88mm
  const infoBoxStartY = currentY;

  // Build Customer details lines
  const customerLines: { label?: string; value: string; isBold?: boolean; color?: [number, number, number] }[] = [];
  customerLines.push({ value: quotation.customerName || 'Valued Customer', isBold: true, color: textDark });
  if (quotation.companyName) {
    customerLines.push({ value: quotation.companyName, isBold: true, color: brandDarkNavy });
  }
  if (quotation.customerPhone) {
    customerLines.push({ label: 'Phone: ', value: quotation.customerPhone });
  }
  if (quotation.customerEmail) {
    customerLines.push({ label: 'Email: ', value: quotation.customerEmail });
  }
  if (quotation.billingAddress) {
    customerLines.push({ label: 'Address: ', value: quotation.billingAddress });
  }
  if (quotation.deliveryAddress && quotation.deliveryAddress !== quotation.billingAddress) {
    customerLines.push({ label: 'Delivery: ', value: quotation.deliveryAddress });
  }

  // Build Issuer details lines
  const issuerLines: { label?: string; value: string; isBold?: boolean; color?: [number, number, number] }[] = [];
  issuerLines.push({ value: 'NEED ELECTRO Sales & Enterprise Solutions', isBold: true, color: textDark });
  issuerLines.push({ label: 'Prepared By: ', value: quotation.preparedByName || 'Showroom Sales Team', isBold: true });
  if (quotation.salespersonName) {
    issuerLines.push({ label: 'Sales Representative: ', value: quotation.salespersonName });
  }
  issuerLines.push({ value: 'Commercial Price Proposal • Authorized for Customer Evaluation', color: textMuted });

  // Compute maximum height required for info boxes
  const lineSpacing = 4;
  const custHeight = 8 + customerLines.length * lineSpacing;
  const issuerHeight = 8 + issuerLines.length * lineSpacing;
  const infoBoxHeight = Math.max(custHeight, issuerHeight, 26);

  // Left Box: Customer Details
  doc.setFillColor(...brandLightGrey);
  doc.setDrawColor(...borderGrey);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, infoBoxStartY, boxWidth, infoBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text('PREPARED FOR / CUSTOMER DETAILS:', marginX + 3.5, infoBoxStartY + 5);

  let cY = infoBoxStartY + 9.5;
  customerLines.forEach((line) => {
    doc.setFont('helvetica', line.isBold ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...(line.color || textDark));
    const fullText = (line.label || '') + line.value;
    const split = doc.splitTextToSize(fullText, boxWidth - 7);
    doc.text(split, marginX + 3.5, cY);
    cY += split.length * 3.5;
  });

  // Right Box: Issuer Details
  const rightBoxX = marginX + boxWidth + 6;
  doc.setFillColor(...brandLightGrey);
  doc.setDrawColor(...borderGrey);
  doc.roundedRect(rightBoxX, infoBoxStartY, boxWidth, infoBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text('ISSUER & COMMERCIAL DETAILS:', rightBoxX + 3.5, infoBoxStartY + 5);

  let iY = infoBoxStartY + 9.5;
  issuerLines.forEach((line) => {
    doc.setFont('helvetica', line.isBold ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...(line.color || textDark));
    const fullText = (line.label || '') + line.value;
    const split = doc.splitTextToSize(fullText, boxWidth - 7);
    doc.text(split, rightBoxX + 3.5, iY);
    iY += split.length * 3.5;
  });

  currentY = infoBoxStartY + infoBoxHeight + 5;

  // -------------------------------------------------------------
  // 3. PRODUCT TABLE (AutoTable with Multi-Page Flow)
  // -------------------------------------------------------------
  // Build columns based on whether item discounts exist
  let tableHeaders: string[];
  let columnStyles: { [key: number]: any };

  if (hasItemDiscounts) {
    tableHeaders = ['#', 'Item & Specifications', 'SKU / Model', 'Qty', `Unit Price (${currency})`, `Discount (${currency})`, `Line Total (${currency})`];
    columnStyles = {
      0: { cellWidth: 9, halign: 'center' },
      1: { cellWidth: 57, halign: 'left' },
      2: { cellWidth: 28, halign: 'left' },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    };
  } else {
    tableHeaders = ['#', 'Item & Specifications', 'SKU / Model', 'Qty', `Unit Price (${currency})`, `Line Total (${currency})`];
    columnStyles = {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 68, halign: 'left' },
      2: { cellWidth: 32, halign: 'left' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    };
  }

  // Format table body rows
  const tableBody = items.map((it, idx) => {
    const sl = String(idx + 1);

    // Product Title & Description
    let itemTitle = it.productName || 'Item';
    if (it.description && it.description.trim()) {
      itemTitle += `\n${it.description.trim()}`;
    }
    if (it.warrantyMonths && Number(it.warrantyMonths) > 0) {
      itemTitle += `\nWarranty: ${it.warrantyMonths} Months`;
    }

    // SKU / Model / Brand
    let skuModel = it.sku || '-';
    if (it.model && it.model !== it.sku) {
      skuModel += `\nMod: ${it.model}`;
    }
    if (it.brand) {
      skuModel += `\nBrand: ${it.brand}`;
    }

    const qty = String(it.quantity || 1);
    const unitPrice = Number(it.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const lineTotal = Number(it.lineTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (hasItemDiscounts) {
      const discountVal = Number(it.discount || 0);
      const discountStr = discountVal > 0
        ? `-${discountVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '-';
      return [sl, itemTitle, skuModel, qty, unitPrice, discountStr, lineTotal];
    }

    return [sl, itemTitle, skuModel, qty, unitPrice, lineTotal];
  });

  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableBody,
    theme: 'grid',
    margin: { left: marginX, right: marginX, top: 22, bottom: 20 },
    showHead: 'everyPage', // Repeat table header on continuation pages
    rowPageBreak: 'avoid',  // Never cut a table row across pages
    headStyles: {
      fillColor: brandDarkNavy,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2.2,
      lineWidth: 0.1,
      lineColor: brandDarkNavy,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: textDark,
      cellPadding: 2.2,
      lineWidth: 0.1,
      lineColor: borderGrey,
      valign: 'top',
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    columnStyles,
  });

  // Get position where product table ended
  const finalTableY = (doc as any).lastAutoTable.finalY || currentY + 40;
  currentY = finalTableY + 4;

  // -------------------------------------------------------------
  // 4. FINANCIAL SUMMARY & AMOUNT IN WORDS
  // -------------------------------------------------------------
  // Check if summary and terms fit on current page; if not, break cleanly
  const requiredSummaryHeight = 65;
  if (currentY + requiredSummaryHeight > pageHeight - 20) {
    doc.addPage();
    currentY = 24;
  }

  const totalsBoxWidth = 84;
  const totalsBoxX = pageWidth - marginX - totalsBoxWidth; // 112mm
  const leftBoxWidth = printableWidth - totalsBoxWidth - 6; // 92mm

  // Amount in Words Box on Left
  const amountWords = amountToBangladeshiTakaWords(grandTotal);
  doc.setFillColor(...brandLightGrey);
  doc.setDrawColor(...borderGrey);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, leftBoxWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...textMuted);
  doc.text('AMOUNT IN WORDS (BANGLADESHI TAKA):', marginX + 3.5, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...brandDarkNavy);
  const wordsSplit = doc.splitTextToSize(amountWords, leftBoxWidth - 7);
  doc.text(wordsSplit, marginX + 3.5, currentY + 9.5);

  // Totals Table on Right
  const totalsRows: [string, string, boolean?][] = [];
  totalsRows.push(['Subtotal:', `${currency} ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);

  if (discountTotal > 0) {
    totalsRows.push(['Total Discount:', `-${currency} ${discountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
  }
  if (vatAmount > 0) {
    const vatLabel = vatPercent > 0 ? `VAT / Tax (${vatPercent}%):` : 'VAT / Tax:';
    totalsRows.push([vatLabel, `+${currency} ${vatAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
  }
  if (deliveryCharge > 0) {
    totalsRows.push(['Delivery Charge:', `+${currency} ${deliveryCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
  }
  if (serviceCharge > 0) {
    totalsRows.push(['Service / Installation:', `+${currency} ${serviceCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
  }
  if (otherCharges > 0) {
    totalsRows.push(['Other Charges:', `+${currency} ${otherCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
  }

  // Draw Subtotal & Charges rows
  let tY = currentY + 3.5;
  totalsRows.forEach(([lbl, val]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    const isDiscount = lbl.includes('Discount');
    doc.setTextColor(...(isDiscount ? accentRed : textMuted));
    doc.text(lbl, totalsBoxX, tY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(isDiscount ? accentRed : textDark));
    doc.text(val, pageWidth - marginX, tY, { align: 'right' });
    tY += 4.5;
  });

  // Grand Total Highlighted Box
  const grandTotalBoxY = tY + 1;
  doc.setFillColor(...brandDarkNavy);
  doc.roundedRect(totalsBoxX - 2, grandTotalBoxY, totalsBoxWidth + 2, 8, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Grand Total:', totalsBoxX + 2, grandTotalBoxY + 5.2);
  doc.text(`${currency} ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - marginX - 2, grandTotalBoxY + 5.2, { align: 'right' });

  currentY = Math.max(currentY + 24, grandTotalBoxY + 12);

  // -------------------------------------------------------------
  // 5. COMMERCIAL TERMS & CUSTOMER NOTES
  // -------------------------------------------------------------
  const termsList: { title: string; content: string }[] = [];
  if (quotation.paymentTerms && quotation.paymentTerms.trim()) {
    termsList.push({ title: 'Payment Terms', content: quotation.paymentTerms.trim() });
  }
  if (quotation.deliveryTerms && quotation.deliveryTerms.trim()) {
    termsList.push({ title: 'Delivery Terms', content: quotation.deliveryTerms.trim() });
  }
  if (quotation.warrantyTerms && quotation.warrantyTerms.trim()) {
    termsList.push({ title: 'Warranty Terms', content: quotation.warrantyTerms.trim() });
  }
  if (quotation.customerNotes && quotation.customerNotes.trim()) {
    termsList.push({ title: 'Customer Notes', content: quotation.customerNotes.trim() });
  }

  if (termsList.length > 0) {
    if (currentY + 28 > pageHeight - 30) {
      doc.addPage();
      currentY = 24;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...brandDarkNavy);
    doc.text('COMMERCIAL TERMS & INSTRUCTIONS:', marginX, currentY);
    currentY += 3.5;

    termsList.forEach((term) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...textDark);
      doc.text(`• ${term.title}:`, marginX + 2, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...textMuted);
      const contentX = marginX + 30;
      const split = doc.splitTextToSize(term.content, printableWidth - 32);
      doc.text(split, contentX, currentY);
      currentY += Math.max(split.length * 3.2, 3.8);
    });

    currentY += 2;
  }

  // -------------------------------------------------------------
  // 6. OFFICIAL COMMERCIAL DISCLAIMER
  // -------------------------------------------------------------
  const disclaimerText =
    'This document is a quotation only. It is not a sales invoice, payment receipt, or confirmation of stock reservation. Product availability and final order processing are subject to confirmation under NEED ELECTRO\'s applicable sales terms.';

  if (currentY + 24 > pageHeight - 30) {
    doc.addPage();
    currentY = 24;
  }

  // Amber Notice Container
  doc.setFillColor(255, 251, 235); // #FFFBEB
  doc.setDrawColor(254, 243, 199); // #FEF3C7
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, printableWidth, 12, 1, 1, 'FD');

  // Left Amber Vertical Accent Bar
  doc.setFillColor(245, 158, 11); // #F59E0B
  doc.rect(marginX, currentY, 2, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(146, 64, 14); // #92400E
  doc.text('Important Commercial Notice:', marginX + 4, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, printableWidth - 8);
  doc.text(splitDisclaimer, marginX + 4, currentY + 7.5);

  currentY += 16;

  // -------------------------------------------------------------
  // 7. DUAL SIGNATURE BLOCKS
  // -------------------------------------------------------------
  if (currentY + 22 > pageHeight - 16) {
    doc.addPage();
    currentY = 24;
  }

  const sigBlockWidth = 56;
  const sigY = currentY + 12;

  // Customer Signature Block
  doc.setDrawColor(...textMuted);
  doc.setLineWidth(0.3);
  doc.line(marginX + 4, sigY, marginX + 4 + sigBlockWidth, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...textDark);
  doc.text('Customer Acceptance Signature & Date', marginX + 4 + sigBlockWidth / 2, sigY + 3.5, { align: 'center' });

  // Authorized Officer Signature Block
  const authSigX = pageWidth - marginX - sigBlockWidth - 4;
  doc.line(authSigX, sigY, authSigX + sigBlockWidth, sigY);
  doc.text('Authorized NEED ELECTRO Officer', authSigX + sigBlockWidth / 2, sigY + 3.5, { align: 'center' });

  // -------------------------------------------------------------
  // 8. MULTI-PAGE NUMBERING, CONTINUATION HEADERS & FOOTERS (TWO-PASS)
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    // Continuation Header on pages 2, 3, etc.
    if (page > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...brandDarkNavy);
      doc.text('NEED ELECTRO  •  Commercial Sales Quotation', marginX, 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...brandElectricBlue);
      doc.text(quotation.quotationNumber || '', pageWidth - marginX, 10, { align: 'right' });

      doc.setDrawColor(...brandDarkNavy);
      doc.setLineWidth(0.4);
      doc.line(marginX, 12, pageWidth - marginX, 12);
    }

    // Standardized Footer on EVERY page (at y = 288mm)
    const footerY = 289;
    doc.setDrawColor(...borderGrey);
    doc.setLineWidth(0.2);
    doc.line(marginX, footerY - 3, pageWidth - marginX, footerY - 3);

    // Left: Quotation info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...textMuted);
    doc.text(`Quotation: ${quotation.quotationNumber || 'DRAFT'}  |  ${quotation.quotationDate || ''}`, marginX, footerY);

    // Center: Developer Credit
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(0, 0, 0);
    doc.text('SOFTWARE DEVELOPED BY AMDADS GROUP', pageWidth / 2, footerY, { align: 'center' });

    // Right: Page Number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...brandDarkNavy);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - marginX, footerY, { align: 'right' });
  }

  return doc;
}

/**
 * Trigger browser download of the quotation PDF
 */
export function downloadQuotationPdf(
  quotation: Quotation,
  settings?: SystemSettings | null,
  options: GenerateQuotationPdfOptions = {}
): string {
  const doc = buildQuotationPdf(quotation, settings, options);
  const cleanQtn = (quotation.quotationNumber || 'QTN-DRAFT').replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = options.filename || `NEED-ELECTRO-Quotation-${cleanQtn}.pdf`;
  doc.save(filename);
  return filename;
}
