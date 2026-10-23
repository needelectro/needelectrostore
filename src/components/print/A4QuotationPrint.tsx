import React, { useState } from 'react';
import { Quotation, SystemSettings } from '../../types';
import { Printer, X, Share2, Copy, Check, Edit2 } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';
import { amountToBangladeshiTakaWords } from '../../utils/numberToWords';

interface A4QuotationPrintProps {
  quotation: Quotation;
  settings: SystemSettings;
  onClose: () => void;
  onConvert?: () => void;
  onEdit?: (quotation: Quotation) => void;
}

export const A4QuotationPrint: React.FC<A4QuotationPrintProps> = ({
  quotation,
  settings,
  onClose,
  onConvert,
  onEdit,
}) => {
  if (!quotation) return null;

  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    document.body.classList.add('is-printing-invoice', 'is-printing-quotation', 'has-active-print-modal');
    return () => {
      document.body.classList.remove('is-printing-invoice', 'is-printing-quotation', 'has-active-print-modal');
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
    <div className="modal-overlay print-active-modal" style={{ zIndex: 999999 }}>
      <div className="modal-content modal-content-xl">
        <div className="modal-header no-print">
          <div className="modal-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            <Printer size={20} className="text-primary" />
            Official Sales Quotation Preview — {quotation.quotationNumber}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #002B5B 100%)',
                color: '#ffffff',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
                padding: '0.45rem 1.1rem',
                fontSize: '0.875rem',
                border: 'none',
              }}
              title="Print standard A4 Sales Quotation or Save as PDF"
            >
              <Printer size={16} /> Print Quotation (A4)
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleWhatsAppShare}
              title="Open prepared WhatsApp message for customer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600 }}
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
            {onEdit && quotation.status !== 'CONVERTED' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onEdit(quotation)}
                title="Edit Quotation details, pricing or items"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
              >
                <Edit2 size={15} /> Edit Quotation
              </button>
            )}
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
          <div className="a4-print-document a4-quotation-document" id="printable-a4-quotation">
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
                style={{ width: '55%', height: 'auto', display: 'block', opacity: 0.08 }}
              />
            </div>

            {/* Header */}
            <div className="a4-header a4-quotation-header" style={{ position: 'relative', zIndex: 1, borderBottom: '2px solid #0284c7', paddingBottom: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="a4-logo-group">
                  <NeedElectroLogo variant="master-image" size="lg" theme="light" showSisterConcern={false} />
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px', lineHeight: '1.4' }}>
                    <strong style={{ color: '#002B5B', fontSize: '11.5px' }}>NEED ELECTRO SHOWROOM & IT SOLUTIONS</strong><br />
                    {companyAddress}<br />
                    Phone: {companyPhone} | Email: {companyEmail}<br />
                    Web: {companyWebsite}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
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
              className="a4-party-details a4-quotation-parties"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '18px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#002B5B', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
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
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                  <strong>Phone:</strong> {quotation.customerPhone}
                </div>
                {quotation.customerEmail && (
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                    <strong>Email:</strong> {quotation.customerEmail}
                  </div>
                )}
                {quotation.billingAddress && (
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px', lineHeight: '1.35' }}>
                    <strong>Billing Address:</strong> {quotation.billingAddress}
                  </div>
                )}
                {quotation.deliveryAddress && (
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', lineHeight: '1.35' }}>
                    <strong>Delivery Address:</strong> {quotation.deliveryAddress}
                  </div>
                )}
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#002B5B', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
                  COMMERCIAL DETAILS & ISSUER:
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  NEED ELECTRO Sales Department
                </div>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                  <strong>Prepared By:</strong> {quotation.preparedByName || 'Showroom Sales Team'}
                </div>
                {quotation.salespersonName && (
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                    <strong>Sales Representative:</strong> {quotation.salespersonName}
                  </div>
                )}
                <div style={{ fontSize: '11.5px', color: '#0284c7', marginTop: '6px', fontWeight: 600 }}>
                  Official Commercial Proposal | Subject to Confirmation
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', lineHeight: '1.35' }}>
                  All prices are quoted in Bangladeshi Taka ({currency}) and valid until {quotation.validUntil}.
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="a4-quotation-table-container" style={{ position: 'relative', zIndex: 1, marginBottom: '18px' }}>
              <table className="a4-items-table a4-quotation-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #0284c7' }}>
                    <th style={{ padding: '8px 8px', textAlign: 'center', width: '35px', borderRadius: '4px 0 0 0', border: '1px solid #cbd5e1', borderBottom: '2px solid #0284c7', background: '#f8fafc', color: '#002B5B', fontWeight: 800 }}>#</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1', borderBottom: '2px solid #0284c7', background: '#f8fafc', color: '#002B5B', fontWeight: 800 }}>Item & Specifications</th>
                    <th style={{ padding: '8px 8px', textAlign: 'center', width: '55px', border: '1px solid #cbd5e1', borderBottom: '2px solid #0284c7', background: '#f8fafc', color: '#002B5B', fontWeight: 800 }}>Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '105px', border: '1px solid #cbd5e1', borderBottom: '2px solid #0284c7', background: '#f8fafc', color: '#002B5B', fontWeight: 800 }}>Unit Price</th>
                    {discountTotal > 0 && <th style={{ padding: '8px 10px', textAlign: 'right', width: '85px', border: '1px solid #cbd5e1', borderBottom: '2px solid #0284c7', background: '#f8fafc', color: '#002B5B', fontWeight: 800 }}>Disc.</th>}
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '115px', borderRadius: '0 4px 0 0', border: '1px solid #cbd5e1', borderBottom: '2px solid #0284c7', background: '#f8fafc', color: '#002B5B', fontWeight: 800 }}>Total ({currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.id || idx} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px 8px', textAlign: 'center', color: '#64748b', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '12px' }}>{it.productName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          <span style={{ fontWeight: 600 }}>SKU:</span> {it.sku}
                          {it.model && <span style={{ marginLeft: '8px' }}><span style={{ fontWeight: 600 }}>Model:</span> {it.model}</span>}
                          {it.brand && <span style={{ marginLeft: '8px' }}><span style={{ fontWeight: 600 }}>Brand:</span> {it.brand}</span>}
                        </div>
                        {it.warrantyMonths ? (
                          <div style={{ fontSize: '10.5px', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
                            Warranty: {it.warrantyMonths} Months Official Coverage
                          </div>
                        ) : null}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{it.quantity}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#334155', borderRight: '1px solid #cbd5e1' }}>{currency} {Number(it.unitPrice).toLocaleString('en-IN')}</td>
                      {discountTotal > 0 && (
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#ef4444', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>
                          {Number(it.discount || 0) > 0 ? `-${currency} ${Number(it.discount).toLocaleString('en-IN')}` : '-'}
                        </td>
                      )}
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#002B5B', borderRight: '1px solid #cbd5e1' }}>
                        {currency} {Number(it.lineTotal).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Amount in Words */}
            <div className="a4-totals-section a4-quotation-summary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', position: 'relative', zIndex: 1, gap: '20px' }}>
              <div style={{ flex: 1, maxWidth: '58%' }}>
                <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#002B5B', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '3px' }}>
                    AMOUNT IN WORDS:
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#002B5B', lineHeight: '1.45' }}>
                    {amountInWords}
                  </div>
                </div>
              </div>

              <div style={{ width: '280px', flexShrink: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
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
                        <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>+ {currency} {vatAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {deliveryCharge > 0 && (
                      <tr>
                        <td style={{ padding: '4px 8px', color: '#64748b' }}>Delivery Charge:</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>+ {currency} {deliveryCharge.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {serviceCharge > 0 && (
                      <tr>
                        <td style={{ padding: '4px 8px', color: '#64748b' }}>Service / Installation:</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>+ {currency} {serviceCharge.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {otherCharges > 0 && (
                      <tr>
                        <td style={{ padding: '4px 8px', color: '#64748b' }}>Other Charges:</td>
                        <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>+ {currency} {otherCharges.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    <tr style={{ background: '#f8fafc', borderTop: '2px solid #0284c7', borderBottom: '2px solid #0284c7' }}>
                      <td style={{ padding: '8px 8px', fontWeight: 800, color: '#002B5B', fontSize: '13px' }}>Grand Total:</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 900, color: '#002B5B', fontSize: '15px' }}>
                        {currency} {grandTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Commercial Terms & Notes */}
            {(quotation.paymentTerms || quotation.deliveryTerms || quotation.warrantyTerms || quotation.customerNotes) && (
              <div
                className="a4-quotation-terms"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '11px',
                  color: '#334155',
                  lineHeight: '1.45',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontWeight: 800, color: '#002B5B', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Commercial Terms & Instructions:
                </div>
                {quotation.paymentTerms && (
                  <div style={{ marginTop: '2px' }}><strong>• Payment Terms:</strong> {quotation.paymentTerms}</div>
                )}
                {quotation.deliveryTerms && (
                  <div style={{ marginTop: '2px' }}><strong>• Delivery Terms:</strong> {quotation.deliveryTerms}</div>
                )}
                {quotation.warrantyTerms && (
                  <div style={{ marginTop: '2px' }}><strong>• Warranty Terms:</strong> {quotation.warrantyTerms}</div>
                )}
                {quotation.customerNotes && (
                  <div style={{ marginTop: '2px' }}><strong>• Customer Notes:</strong> {quotation.customerNotes}</div>
                )}
              </div>
            )}

            {/* Disclaimer Box */}
            <div
              className="a4-quotation-disclaimer"
              style={{
                position: 'relative',
                zIndex: 1,
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderLeft: '4px solid #f59e0b',
                padding: '9px 12px',
                borderRadius: '4px',
                fontSize: '10.5px',
                color: '#92400e',
                lineHeight: '1.4',
                marginBottom: '16px',
              }}
            >
              <strong>Important Commercial Notice:</strong> This document is a quotation only. It is not a sales invoice, payment receipt, or confirmation of stock reservation. Product availability and final order processing are subject to confirmation under NEED ELECTRO's standard sales terms.
            </div>

            {/* Signature Block */}
            <div
              className="a4-signatures a4-quotation-signatures"
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '28px',
                paddingTop: '16px',
              }}
            >
              <div style={{ width: '220px', textAlign: 'center' }}>
                <div style={{ borderTop: '1.5px dashed #64748b', paddingTop: '6px', fontSize: '11px', color: '#334155', fontWeight: 700 }}>
                  Customer Acceptance Signature & Date
                </div>
              </div>

              <div style={{ width: '220px', textAlign: 'center' }}>
                <div style={{ borderTop: '1.5px dashed #64748b', paddingTop: '6px', fontSize: '11px', color: '#334155', fontWeight: 700 }}>
                  Authorized NEED ELECTRO Officer
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="a4-software-dev-credit a4-quotation-footer"
              style={{
                position: 'relative',
                zIndex: 1,
                clear: 'both',
                marginTop: '28px',
                paddingTop: '10px',
                borderTop: '1px dashed #cbd5e1',
                fontSize: '10px',
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, fontSize: '10px', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Software Developed By AMDADS GROUP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
