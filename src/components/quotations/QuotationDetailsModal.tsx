import React, { useState } from 'react';
import { Quotation, Sale } from '../../types';
import { useERP } from '../../services/erpStore';
import { 
  X, Printer, Download, Share2, Copy, Check, FileCheck, ArrowRight,
  User, Phone, Mail, MapPin, Calendar, Clock, AlertTriangle, ShieldCheck,
  CheckCircle2, XCircle, RotateCcw, ExternalLink
} from 'lucide-react';
import { amountToBangladeshiTakaWords } from '../../utils/numberToWords';

interface QuotationDetailsModalProps {
  quotation: Quotation;
  isOpen: boolean;
  onClose: () => void;
  onOpenConvertDialog: (quotation: Quotation) => void;
  onViewInvoice?: (invoiceNumber: string) => void;
  onEditDraft?: (quotation: Quotation) => void;
}

export const QuotationDetailsModal: React.FC<QuotationDetailsModalProps> = ({
  quotation,
  isOpen,
  onClose,
  onOpenConvertDialog,
  onViewInvoice,
  onEditDraft,
}) => {
  const { setActiveQuotationToPrint, updateQuotationStatus, addToast, settings } = useERP();
  const [copied, setCopied] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!isOpen || !quotation) return null;

  const isExpired = new Date(quotation.validUntil).getTime() < Date.now() && quotation.status !== 'CONVERTED';
  const effectiveStatus = quotation.status === 'CONVERTED' ? 'CONVERTED' : (isExpired && quotation.status !== 'ACCEPTED' ? 'EXPIRED' : quotation.status);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'DRAFT':
        return <span className="badge badge-secondary" style={{ fontWeight: 700 }}>DRAFT</span>;
      case 'SENT':
        return <span className="badge badge-info" style={{ fontWeight: 700, background: '#0284c7', color: '#fff' }}>SENT / ISSUED</span>;
      case 'ACCEPTED':
        return <span className="badge badge-success" style={{ fontWeight: 700, background: '#10b981', color: '#fff' }}>ACCEPTED</span>;
      case 'CONVERTED':
        return <span className="badge badge-primary" style={{ fontWeight: 700, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff' }}>CONVERTED TO ORDER</span>;
      case 'EXPIRED':
        return <span className="badge badge-warning" style={{ fontWeight: 700, background: '#f59e0b', color: '#000' }}>EXPIRED</span>;
      case 'REJECTED':
        return <span className="badge badge-danger" style={{ fontWeight: 700, background: '#ef4444', color: '#fff' }}>REJECTED</span>;
      default:
        return <span className="badge">{st}</span>;
    }
  };

  const handleCopy = () => {
    const text = `NEED ELECTRO SALES QUOTATION\nQuotation #: ${quotation.quotationNumber}\nCustomer: ${quotation.customerName} (${quotation.customerPhone})\nValid Until: ${quotation.validUntil}\nTotal Amount: ${quotation.currencySymbol} ${Number(quotation.grandTotal).toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    let cleanPhone = quotation.customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01')) cleanPhone = '88' + cleanPhone;
    else if (cleanPhone.startsWith('1')) cleanPhone = '880' + cleanPhone;

    const message = `Hello ${quotation.customerName}, your NEED ELECTRO sales quotation ${quotation.quotationNumber} is ready.\n\nTotal Quoted Amount: ${quotation.currencySymbol} ${Number(quotation.grandTotal).toLocaleString()}\nValid Until: ${quotation.validUntil}\n\nPlease review your quotation document for full details.\nThank you!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await updateQuotationStatus(quotation.id, newStatus, `Manual status change to ${newStatus}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const amountInWords = amountToBangladeshiTakaWords(Number(quotation.grandTotal));

  return (
    <div className="modal-overlay" style={{ zIndex: 9995 }}>
      <div className="modal-content modal-content-xl" style={{ maxWidth: '980px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '1rem 1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--brand-primary)' }}>
                {quotation.quotationNumber}
              </span>
              {getStatusBadge(effectiveStatus)}
              {isExpired && quotation.status !== 'CONVERTED' && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <AlertTriangle size={14} /> Validity Expired
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Issued: <strong>{quotation.quotationDate}</strong> • Valid Until: <strong>{quotation.validUntil}</strong> • Prepared by: <strong>{quotation.preparedByName || 'Showroom Staff'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveQuotationToPrint(quotation)}
              style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={16} /> Print / PDF
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleWhatsApp}
              style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Share2 size={15} /> WhatsApp
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy} title="Copy summary">
              {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Converted Alert Banner */}
          {quotation.status === 'CONVERTED' && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={28} className="text-success" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>
                    Converted into Sales Invoice
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Linked Invoice: <strong style={{ color: 'var(--text-primary)' }}>{quotation.convertedInvoiceNumber || 'INV-COMPLETED'}</strong>
                    {quotation.convertedAt ? ` on ${new Date(quotation.convertedAt).toLocaleString()}` : ''}
                  </div>
                </div>
              </div>
              {onViewInvoice && quotation.convertedInvoiceNumber && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onViewInvoice(quotation.convertedInvoiceNumber!)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <ExternalLink size={14} /> View Invoice
                </button>
              )}
            </div>
          )}

          {/* Customer & Quotation Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                background: 'var(--bg-card-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                CUSTOMER INFORMATION
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {quotation.customerName}
              </div>
              {quotation.companyName && (
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '0.1rem' }}>
                  {quotation.companyName}
                </div>
              )}
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} /> {quotation.customerPhone}
              </div>
              {quotation.customerEmail && (
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} /> {quotation.customerEmail}
                </div>
              )}
              {quotation.billingAddress && (
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> {quotation.billingAddress}
                </div>
              )}
            </div>

            <div
              style={{
                background: 'var(--bg-card-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                COMMERCIAL PROPOSAL STATUS
              </div>
              <div style={{ fontSize: '0.825rem', marginBottom: '0.3rem' }}>
                <strong>Issue Date:</strong> {quotation.quotationDate}
              </div>
              <div style={{ fontSize: '0.825rem', marginBottom: '0.3rem' }}>
                <strong>Valid Until:</strong> <span style={{ color: isExpired ? '#ef4444' : 'inherit', fontWeight: 700 }}>{quotation.validUntil}</span>
              </div>
              {quotation.referenceNumber && (
                <div style={{ fontSize: '0.825rem', marginBottom: '0.3rem' }}>
                  <strong>Client Reference:</strong> {quotation.referenceNumber}
                </div>
              )}
              {quotation.salespersonName && (
                <div style={{ fontSize: '0.825rem', marginBottom: '0.3rem' }}>
                  <strong>Assigned Salesperson:</strong> {quotation.salespersonName}
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 600 }}>
                🔒 Zero inventory impact active
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                Quoted Product Items ({quotation.items?.length || 0})
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Historical snapshot preserved
              </span>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card-muted)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', width: '35px' }}>#</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Item & Specifications</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', width: '70px' }}>Qty</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', width: '120px' }}>Quoted Unit (৳)</th>
                    {Number(quotation.discountTotal || 0) > 0 && (
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', width: '90px' }}>Discount</th>
                    )}
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', width: '120px' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(quotation.items || []).map((it, idx) => (
                    <tr key={it.id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <div style={{ fontWeight: 700 }}>{it.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          SKU: {it.sku} {it.brand ? `• ${it.brand}` : ''} {it.model ? `• ${it.model}` : ''}
                        </div>
                        {it.warrantyMonths ? (
                          <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '1px' }}>
                            Warranty: {it.warrantyMonths} Months
                          </div>
                        ) : null}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>{it.quantity}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>৳{Number(it.unitPrice).toLocaleString()}</td>
                      {Number(quotation.discountTotal || 0) > 0 && (
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#ef4444' }}>
                          {Number(it.discount || 0) > 0 ? `-৳${Number(it.discount).toLocaleString()}` : '-'}
                        </td>
                      )}
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--brand-primary)' }}>
                        ৳{Number(it.lineTotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Amount in Words */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ background: 'var(--bg-card-muted)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  AMOUNT IN WORDS:
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                  {amountInWords}
                </div>
              </div>

              {/* Optional Customer Notes */}
              {quotation.customerNotes && (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', fontSize: '0.8rem', lineHeight: '1.5' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    CUSTOMER NOTES:
                  </div>
                  <div style={{ color: '#0284c7' }}>{quotation.customerNotes}</div>
                </div>
              )}

              {quotation.internalNotes && (
                <div style={{ marginTop: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.75rem' }}>🔒 Internal Staff Notes:</div>
                  <div style={{ color: 'var(--text-primary)', marginTop: '0.2rem' }}>{quotation.internalNotes}</div>
                </div>
              )}
            </div>

            {/* Calculations Column */}
            <div style={{ background: 'var(--bg-card-muted)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span style={{ fontWeight: 700 }}>৳{Number(quotation.subtotal).toLocaleString()}</span>
              </div>
              {Number(quotation.discountTotal || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '0.4rem' }}>
                  <span>Total Discount:</span>
                  <span style={{ fontWeight: 700 }}>-৳{Number(quotation.discountTotal).toLocaleString()}</span>
                </div>
              )}
              {Number(quotation.vatAmount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <span>VAT / Tax ({quotation.vatPercent}%):</span>
                  <span>+৳{Number(quotation.vatAmount).toLocaleString()}</span>
                </div>
              )}
              {Number(quotation.deliveryCharge || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <span>Delivery Charge:</span>
                  <span>+৳{Number(quotation.deliveryCharge).toLocaleString()}</span>
                </div>
              )}
              {Number(quotation.serviceCharge || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <span>Service Charge:</span>
                  <span>+৳{Number(quotation.serviceCharge).toLocaleString()}</span>
                </div>
              )}
              {Number(quotation.otherCharges || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <span>Other Charges:</span>
                  <span>+৳{Number(quotation.otherCharges).toLocaleString()}</span>
                </div>
              )}
              <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.6rem', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Grand Total:</span>
                <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#10b981' }}>
                  ৳{Number(quotation.grandTotal).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline / History */}
          {Array.isArray(quotation.statusHistory) && quotation.statusHistory.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                STATUS & AUDIT TIMELINE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(quotation.statusHistory as any[]).map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Clock size={13} />
                    <span>{new Date(h.timestamp).toLocaleString()}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>[{h.status}]</span>
                    <span>by {h.updatedBy}:</span>
                    <span>{h.notes}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Quick status change toggles */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {quotation.status === 'DRAFT' && onEditDraft && (
              <button className="btn btn-secondary btn-sm" onClick={() => onEditDraft(quotation)}>
                Edit Draft
              </button>
            )}
            {quotation.status === 'DRAFT' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleStatusChange('SENT')}
                disabled={isUpdatingStatus}
              >
                Mark as Sent
              </button>
            )}
            {quotation.status === 'SENT' && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleStatusChange('ACCEPTED')}
                disabled={isUpdatingStatus}
              >
                Mark as Accepted
              </button>
            )}
            {(quotation.status === 'DRAFT' || quotation.status === 'SENT') && (
              <button
                className="btn btn-ghost btn-sm text-danger"
                onClick={() => handleStatusChange('REJECTED')}
                disabled={isUpdatingStatus}
              >
                Mark as Rejected
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {quotation.status !== 'CONVERTED' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onOpenConvertDialog(quotation)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #002B5B 100%)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <ArrowRight size={16} /> Convert to Sales Order
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
