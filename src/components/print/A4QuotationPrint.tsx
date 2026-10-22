import React, { useState } from 'react';
import { Quotation, SystemSettings } from '../../types';
import { Printer, X, Download, Loader2, Share2, Copy, Check } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { amountToBangladeshiTakaWords } from '../../utils/numberToWords';

interface A4QuotationPrintProps {
  quotation: Quotation;
  settings: SystemSettings;
  onClose: () => void;
  onConvert?: () => void;
}

export const A4QuotationPrint: React.FC<A4QuotationPrintProps> = ({
  quotation,
  settings,
  onClose,
  onConvert,
}) => {
  if (!quotation) return null;

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    document.body.classList.add('is-printing-invoice');
    return () => {
      document.body.classList.remove('is-printing-invoice');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const safeSettings = settings || ({} as Partial<SystemSettings>);
  const companyName = safeSettings.companyName || 'NEED ELECTRO';
  const companyTagline = safeSettings.companyTagline || 'Trusted Electrical & Technological Solutions';
  const companyPhone = safeSettings.phone || '+880 1733-983752';
  const companyEmail = safeSettings.email || 'contact.amdadur@gmail.com';
  const companyAddress = safeSettings.address || 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh';
  const companyWebsite = safeSettings.website || 'https://needelectroerp.vercel.app';
  const currency = quotation.currencySymbol || safeSettings.currencySymbol || '৳';

  const items = quotation.items || [];
  const subtotal = Number(quotation.subtotal || 0);
  const discountTotal = Number(quotation.discountTotal || 0);
  const vatAmount = Number(quotation.vatAmount || 0);
  const deliveryCharge = Number(quotation.deliveryCharge || 0);
  const serviceCharge = Number(quotation.serviceCharge || 0);
  const otherCharges = Number(quotation.otherCharges || 0);
  const grandTotal = Number(quotation.grandTotal || 0);

  const amountInWords = amountToBangladeshiTakaWords(grandTotal);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-a4-quotation');
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('printable-a4-quotation');
          if (clonedElement) {
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.margin = '0 auto';
            clonedElement.style.width = '210mm';
            clonedElement.style.maxWidth = '210mm';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgProps = pdf.getImageProperties(imgData);
      const calculatedHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (calculatedHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, calculatedHeight, undefined, 'FAST');
      } else {
        let heightLeft = calculatedHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        while (heightLeft > 1) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;
        }
      }

      const safeQtn = (quotation.quotationNumber || 'QTN-DRAFT').replace(/[^a-zA-Z0-9-_]/g, '_');
      pdf.save(`NEED-ELECTRO-Quotation-${safeQtn}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF directly. Please use the Print / Save PDF option.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopy = () => {
    const text = `NEED ELECTRO SALES QUOTATION\nQuotation #: ${quotation.quotationNumber}\nCustomer: ${quotation.customerName}\nValid Until: ${quotation.validUntil}\nTotal Amount: ${currency} ${grandTotal.toLocaleString()}\n\nContact: ${companyPhone}\nWebsite: ${companyWebsite}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    let cleanPhone = quotation.customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '88' + cleanPhone;
    } else if (cleanPhone.startsWith('1')) {
      cleanPhone = '880' + cleanPhone;
    }

    const message = `Hello ${quotation.customerName}, your NEED ELECTRO sales quotation ${quotation.quotationNumber} is ready.\n\nTotal Quoted Amount: ${currency} ${grandTotal.toLocaleString()}\nValid Until: ${quotation.validUntil}\n\nPlease review your quotation document for full item specifications and terms.\nThank you for choosing NEED ELECTRO!\nHotline: ${companyPhone}`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="modal-overlay print-active-modal" style={{ zIndex: 9999 }}>
      <div className="modal-content modal-content-xl">
        <div className="modal-header no-print">
          <div className="modal-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            <Printer size={20} className="text-primary" />
            Official Sales Quotation Preview — {quotation.quotationNumber}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn btn-success btn-sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Directly download high-quality A4 PDF quotation"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download size={16} /> Download PDF
                </>
              )}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleWhatsAppShare}
              title="Open prepared WhatsApp message for customer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}
            >
              <Share2 size={15} /> WhatsApp
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCopy}
              title="Copy Quotation Details to clipboard"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {onConvert && quotation.status !== 'CONVERTED' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={onConvert}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #002B5B 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                }}
              >
                Convert to Order
              </button>
            )}
            <button
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <X size={16} /> Close
            </button>
          </div>
        </div>

        <div className="modal-body a4-preview-body">
          {/* Printable Sheet */}
          <div className="a4-print-document" id="printable-a4-quotation">
            {/* Watermark Background */}
            <div
              className="a4-watermark-overlay"
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                userSelect: 'none',
              }}
            >
              <img
                src="/logo-transparent.png"
                alt="NEED ELECTRO Watermark"
                style={{ width: '55%', height: 'auto', display: 'block', opacity: 0.1 }}
              />
            </div>

            {/* Header */}
            <div className="a4-header" style={{ position: 'relative', zIndex: 1, borderBottom: '2px solid #002B5B', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="a4-logo-group">
                  <NeedElectroLogo variant="master-image" size="lg" theme="light" showSisterConcern={false} />
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px', lineHeight: '1.4' }}>
                    <strong>NEED ELECTRO SHOWROOM & IT SOLUTIONS</strong><br />
                    {companyAddress}<br />
                    Phone: {companyPhone} | Email: {companyEmail}<br />
                    Web: {companyWebsite}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#002B5B',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      marginBottom: '6px',
                    }}
                  >
                    COMMERCIAL PROPOSAL
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#002B5B', margin: '4px 0' }}>
                    SALES QUOTATION
                  </h2>
                  <div style={{ fontSize: '13px', color: '#1e293b', marginTop: '4px' }}>
                    <strong>Quotation #:</strong>{' '}
                    <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 700, fontSize: '14px' }}>
                      {quotation.quotationNumber}
                    </span>
                  </div>
                  {quotation.referenceNumber && (
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      <strong>Ref:</strong> {quotation.referenceNumber}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                    <strong>Date:</strong> {quotation.quotationDate}
                  </div>
                  <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>
                    <strong>Valid Until:</strong> {quotation.validUntil}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Status: <strong style={{ color: quotation.status === 'CONVERTED' ? '#10b981' : '#0284c7' }}>{quotation.status}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Prepared By Info Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px' }}>
                  QUOTATION PREPARED FOR:
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  {quotation.customerName}
                </div>
                {quotation.companyName && (
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#002B5B', marginTop: '2px' }}>
                    {quotation.companyName}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px' }}>
                  <strong>Phone:</strong> {quotation.customerPhone}
                </div>
                {quotation.customerEmail && (
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    <strong>Email:</strong> {quotation.customerEmail}
                  </div>
                )}
                {quotation.billingAddress && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    <strong>Address:</strong> {quotation.billingAddress}
                  </div>
                )}
                {quotation.deliveryAddress && (
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    <strong>Delivery:</strong> {quotation.deliveryAddress}
                  </div>
                )}
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px' }}>
                  COMMERCIAL DETAILS & ISSUER:
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  NEED ELECTRO Sales Department
                </div>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px' }}>
                  <strong>Prepared By:</strong> {quotation.preparedByName || 'Showroom Sales Team'}
                </div>
                {quotation.salespersonName && (
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    <strong>Sales Representative:</strong> {quotation.salespersonName}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '4px' }}>
                  Official Commercial Proposal | Subject to Confirmation
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div style={{ position: 'relative', zIndex: 1, marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#002B5B', color: '#ffffff' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '35px', borderRadius: '4px 0 0 0' }}>#</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Item Description / SKU / Specs</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '55px' }}>Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '100px' }}>Unit Price</th>
                    {discountTotal > 0 && <th style={{ padding: '8px 10px', textAlign: 'right', width: '85px' }}>Disc.</th>}
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '115px', borderRadius: '0 4px 0 0' }}>Total ({currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{it.productName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                          SKU: {it.sku}
                          {it.model && <span style={{ marginLeft: '10px' }}>Model: {it.model}</span>}
                          {it.brand && <span style={{ marginLeft: '10px' }}>Brand: {it.brand}</span>}
                        </div>
                        {it.description && (
                          <div style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                            {it.description}
                          </div>
                        )}
                        {it.warrantyMonths ? (
                          <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '1px' }}>
                            Warranty: {it.warrantyMonths} Months
                          </div>
                        ) : null}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>{it.quantity}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{currency} {Number(it.unitPrice).toLocaleString('en-IN')}</td>
                      {discountTotal > 0 && (
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#ef4444' }}>
                          {Number(it.discount || 0) > 0 ? `-${currency} ${Number(it.discount).toLocaleString('en-IN')}` : '-'}
                        </td>
                      )}
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#002B5B' }}>
                        {currency} {Number(it.lineTotal).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Amount in Words */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
              <div style={{ maxWidth: '55%' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '2px' }}>
                    AMOUNT IN WORDS:
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#002B5B', lineHeight: '1.4' }}>
                    {amountInWords}
                  </div>
                </div>
              </div>

              <div style={{ width: '300px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 8px', color: '#64748b' }}>Subtotal:</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{currency} {subtotal.toLocaleString('en-IN')}</td>
                    </tr>
                    {discountTotal > 0 && (
                      <tr>
                        <td style={{ padding: '4px 8px', color: '#ef4444' }}>Total Discount:</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>- {currency} {discountTotal.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {vatAmount > 0 && (
                      <tr>
                        <td style={{ padding: '4px 8px', color: '#64748b' }}>VAT / Tax ({quotation.vatPercent}%):</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>+ {currency} {vatAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {deliveryCharge > 0 && (
                      <tr>
                        <td style={{ padding: '4px 8px', color: '#64748b' }}>Delivery Charge:</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>+ {currency} {deliveryCharge.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {serviceCharge > 0 && (
                      <tr>
                        <td style={{ padding: '4px 8px', color: '#64748b' }}>Service / Installation:</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>+ {currency} {serviceCharge.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {otherCharges > 0 && (
                      <tr>
                        <td style={{ padding: '4px 8px', color: '#64748b' }}>Other Charges:</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>+ {currency} {otherCharges.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    <tr style={{ background: '#f1f5f9', borderTop: '2px solid #002B5B', borderBottom: '2px solid #002B5B' }}>
                      <td style={{ padding: '8px 8px', fontWeight: 800, color: '#002B5B', fontSize: '14px' }}>Grand Total:</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 900, color: '#002B5B', fontSize: '15px' }}>
                        {currency} {grandTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Disclaimer Box */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderLeft: '4px solid #f59e0b',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#92400e',
                lineHeight: '1.45',
                marginBottom: '16px',
              }}
            >
              <strong>Important Commercial Notice:</strong> This quotation is a commercial price proposal only and does not constitute a sales invoice, payment receipt, stock reservation, or confirmation of product availability. Prices and availability are subject to the terms and validity period stated in this quotation.
            </div>

            {/* Commercial Terms & Notes */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '12px 14px',
                fontSize: '11px',
                color: '#334155',
                lineHeight: '1.5',
                marginBottom: '35px',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', color: '#002B5B', marginBottom: '4px' }}>
                COMMERCIAL TERMS & INSTRUCTIONS:
              </div>
              <div><strong>Payment Terms:</strong> {quotation.paymentTerms || 'Full payment upon confirmed order placement.'}</div>
              <div><strong>Delivery Terms:</strong> {quotation.deliveryTerms || 'Showroom collection or scheduled courier delivery.'}</div>
              <div><strong>Warranty Terms:</strong> {quotation.warrantyTerms || 'Official NEED ELECTRO product warranty terms apply.'}</div>
              {quotation.customerNotes && (
                <div style={{ marginTop: '4px', color: '#0284c7' }}>
                  <strong>Customer Notes:</strong> {quotation.customerNotes}
                </div>
              )}
            </div>

            {/* Signature Block */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '30px',
                paddingTop: '20px',
              }}
            >
              <div style={{ width: '220px', textAlign: 'center' }}>
                <div style={{ borderTop: '1px dashed #64748b', paddingTop: '6px', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                  Customer Acceptance Signature & Date
                </div>
              </div>

              <div style={{ width: '220px', textAlign: 'center' }}>
                <div style={{ borderTop: '1px dashed #64748b', paddingTop: '6px', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                  Authorized NEED ELECTRO Officer
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                clear: 'both',
                marginTop: '35px',
                paddingTop: '12px',
                borderTop: '1px dashed #cbd5e1',
                fontSize: '10px',
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontWeight: 800, fontSize: '10px', color: '#000', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Software Developed By AMDADS GROUP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
