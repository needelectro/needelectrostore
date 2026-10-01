import React, { useState } from 'react';
import { Sale, SystemSettings } from '../../types';
import { Printer, X, Receipt, Download, Loader2, Share2, Check, Copy } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface A4InvoicePrintProps {
  sale: Sale;
  settings: SystemSettings;
  onClose: () => void;
  onSwitchToThermal?: () => void;
}

const safeArray = <T,>(val: any): T[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
};

export const A4InvoicePrint: React.FC<A4InvoicePrintProps> = ({ sale, settings, onClose, onSwitchToThermal }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    document.body.classList.add('is-printing-invoice');
    return () => {
      document.body.classList.remove('is-printing-invoice');
    };
  }, []);

  const rawDate = sale.createdAt || sale.date || new Date();
  const parsedDate = new Date(rawDate);
  const formattedDate = isNaN(parsedDate.getTime())
    ? new Date().toLocaleDateString('en-GB')
    : parsedDate.toLocaleDateString('en-GB');

  const formattedTime = isNaN(parsedDate.getTime())
    ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const safeSettings = settings || ({} as Partial<SystemSettings>);
  const items = safeArray<any>(sale.items);
  const payments = safeArray<any>(sale.payments);

  const subtotal = Number(sale.subtotal || 0);
  const overallDiscount = Number(sale.overallDiscount || 0);
  const vatAmount = Number(sale.vatAmount || 0);
  const vatPercent = Number(sale.vatPercent || 0);
  const deliveryCharge = Number((sale as any).deliveryCharge || 0);
  const serviceCharge = Number((sale as any).serviceCharge || 0);
  const otherCharges = Number((sale as any).otherCharges || 0);

  const grandTotal = Number(
    sale.grandTotal || (subtotal - overallDiscount + vatAmount + deliveryCharge + serviceCharge + otherCharges)
  );
  const paidAmount = Number(sale.paidAmount || 0);
  const dueAmount = Number(sale.dueAmount !== undefined ? sale.dueAmount : Math.max(0, grandTotal - paidAmount));
  const previousDue = Number((sale as any).previousDue || (sale as any).customer?.currentBalance || 0);
  const totalDue = Number((sale as any).totalDue || (previousDue + dueAmount));
  const changeAmount = Number((sale as any).changeAmount || (paidAmount > grandTotal ? paidAmount - grandTotal : 0));

  const isEMI = sale.saleType === 'EMI' || !!sale.emiAccountId || !!(sale as any).emiAccount;
  const isPaid = dueAmount <= 0;

  const customerEmail = (sale as any).customerEmail || (sale as any).customer?.email || '';
  const customerType = (sale as any).customerType || 'RETAIL';
  const customerCode = (sale as any).customerCode || (sale as any).customer?.customerId || '';
  const billingAddress = (sale as any).billingAddress || sale.customerAddress || (sale as any).customer?.address || 'Shop No: 5, MR Plaza, Kusumbag, Moulvibazar';
  const shippingAddress = (sale as any).shippingAddress || billingAddress;
  const branchName = (sale as any).branchName || (sale as any).branch?.name || 'Moulvibazar Showroom';

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyShareLink = () => {
    const text = `NEED ELECTRO Invoice #${sale.invoiceNumber}\nCustomer: ${sale.customerName}\nTotal: ৳${grandTotal.toLocaleString()}\nPaid: ৳${paidAmount.toLocaleString()}\nDue: ৳${dueAmount.toLocaleString()}\nThank you for choosing NEED ELECTRO! Hotline: 01733-983752`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const phone = (sale.customerPhone || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('88') ? phone : phone ? `88${phone}` : '';
    const message = encodeURIComponent(
      `Dear ${sale.customerName}, your NEED ELECTRO invoice #${sale.invoiceNumber} has been issued.\nTotal: ৳${grandTotal.toLocaleString()}\nPaid: ৳${paidAmount.toLocaleString()}\nDue: ৳${dueAmount.toLocaleString()}\nShop No: 5, MR Plaza, Kusumbag, Moulvibazar.\nHotline: 01733-983752. www.needelectro.com`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-a4-invoice');
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // 300 DPI equivalent
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('printable-a4-invoice');
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

      const safeInvoiceNumber = (sale.invoiceNumber || 'INV-DRAFT').replace(/[^a-zA-Z0-9-_]/g, '_');
      pdf.save(`NEED-ELECTRO-Invoice-${safeInvoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF directly. Please use the Print / Save PDF option.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const emiAccountData = (sale as any).emiAccount;

  return (
    <div className="modal-overlay print-active-modal" style={{ zIndex: 9999 }}>
      <div className="modal-content modal-content-xl" style={{ maxWidth: '940px' }}>
        <div className="modal-header no-print" style={{ padding: '0.75rem 1.25rem', background: '#002B5B', color: '#fff' }}>
          <div className="modal-title" style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} color="#008CFF" />
            Invoice Preview — <span style={{ color: '#008CFF' }}>{sale.invoiceNumber || 'INV-DRAFT'}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-sm"
              onClick={handleWhatsAppShare}
              style={{ background: '#25D366', color: '#fff', border: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              title="Share invoice with customer via WhatsApp"
            >
              <Share2 size={14} /> WhatsApp
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCopyShareLink}
              style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}
              title="Copy invoice summary to clipboard"
            >
              {copiedLink ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copiedLink ? 'Copied' : 'Copy'}
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Download high-resolution A4 PDF invoice"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Download size={15} /> Download PDF
                </>
              )}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#008CFF', borderColor: '#008CFF' }}
            >
              <Printer size={15} /> Print / Save
            </button>
            {onSwitchToThermal && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={onSwitchToThermal}
                style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Switch to 80mm Thermal Receipt"
              >
                <Receipt size={14} /> 80mm
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ color: '#fff' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body a4-preview-body" style={{ background: '#e2e8f0', padding: '16px', overflowY: 'auto', maxHeight: 'calc(90vh - 65px)' }}>
          {/* Printable Sheet */}
          <div
            className="a4-print-document"
            id="printable-a4-invoice"
            style={{
              position: 'relative',
              background: '#ffffff',
              maxWidth: '820px',
              margin: '0 auto',
              padding: '34px 38px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 43, 91, 0.1)',
              color: '#0f172a',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
              fontSize: '12px',
              lineHeight: '1.45',
            }}
          >
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
                style={{ width: '52%', height: 'auto', display: 'block', opacity: 0.08 }}
              />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', position: 'relative', zIndex: 1, borderBottom: '2px solid #002B5B', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <NeedElectroLogo variant="master-image" size="lg" theme="light" showSisterConcern={false} />
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#002B5B', letterSpacing: '-0.02em' }}>
                    NEED ELECTRO
                  </h1>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: 700, color: '#008CFF' }}>
                    Trusted Electrical & Technological Solutions
                  </p>
                  <p style={{ margin: '1px 0 0 0', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                    A Sister Concern of AMDADS Group
                  </p>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: '1.4' }}>
                    <strong>Main Branch:</strong> Shop No: 5, MR Plaza, Kusumbag, Moulvibazar<br />
                    Hotline: <strong>+880 1733-983752</strong> | Email: <strong>needelectro23@gmail.com</strong> | Web: <strong>www.needelectro.com</strong>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-block',
                    background: isEMI ? '#f59e0b' : '#002B5B',
                    color: '#ffffff',
                    padding: '4px 14px',
                    borderRadius: '4px',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {isEMI ? 'EMI INVOICE' : 'TAX INVOICE'}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#334155' }}>
                  <div><strong>Invoice #:</strong> <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 800, color: '#008CFF' }}>{sale.invoiceNumber}</span></div>
                  <div><strong>Date:</strong> {formattedDate}</div>
                  <div><strong>Time:</strong> {formattedTime}</div>
                  <div><strong>Salesperson:</strong> {sale.salespersonName || 'Showroom Sales'}</div>
                  <div><strong>Branch:</strong> {branchName}</div>
                </div>
              </div>
            </div>

            {/* Customer & Billing Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px', position: 'relative', zIndex: 1 }}>
              <div style={{ background: '#F4F6F8', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '4px' }}>
                  Billed To (ক্রেতার বিবরণ)
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#002B5B' }}>{sale.customerName || 'Walking Customer'}</div>
                <div style={{ fontSize: '11.5px', color: '#334155', marginTop: '2px' }}>
                  Phone: <strong>{sale.customerPhone || 'N/A'}</strong>
                  {customerEmail && ` | Email: ${customerEmail}`}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Billing Address: {billingAddress}
                </div>
                <div style={{ fontSize: '10.5px', color: '#008CFF', marginTop: '3px', fontWeight: 600 }}>
                  Customer ID: {customerCode || 'CUST-REGULAR'} | Type: {customerType}
                </div>
              </div>

              <div style={{ background: '#F4F6F8', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '4px' }}>
                  Invoice Status & Delivery
                </div>
                <div style={{ fontSize: '11.5px', color: '#334155' }}>
                  <div>
                    Payment Status:{' '}
                    <strong style={{ color: isPaid ? '#16a34a' : '#ea580c', fontSize: '12px' }}>
                      {isPaid ? 'PAID IN FULL' : `DUE: ৳${dueAmount.toLocaleString()}`}
                    </strong>
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    Sale Type: <strong>{sale.saleType || 'REGULAR'} SALE</strong>
                  </div>
                  {shippingAddress && shippingAddress !== billingAddress && (
                    <div style={{ marginTop: '2px', fontSize: '11px', color: '#64748b' }}>
                      Shipping Address: <strong>{shippingAddress}</strong>
                    </div>
                  )}
                  <div style={{ marginTop: '3px', fontSize: '11px', color: '#002B5B', fontWeight: 600 }}>
                    Official Commercial Record
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
              <thead>
                <tr style={{ background: '#002B5B', color: '#ffffff' }}>
                  <th style={{ width: '36px', padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 700 }}>SL</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: 700 }}>Product / Service & Serial Number</th>
                  <th style={{ width: '80px', padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 700 }}>Warranty</th>
                  <th style={{ width: '48px', padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 700 }}>Qty</th>
                  <th style={{ width: '90px', padding: '8px 8px', textAlign: 'right', fontSize: '11px', fontWeight: 700 }}>Unit Price</th>
                  <th style={{ width: '70px', padding: '8px 8px', textAlign: 'right', fontSize: '11px', fontWeight: 700 }}>Discount</th>
                  <th style={{ width: '100px', padding: '8px 10px', textAlign: 'right', fontSize: '11px', fontWeight: 700 }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item: any, idx: number) => {
                    const itemSerials = Array.isArray(item.serialNumbers)
                      ? item.serialNumbers
                      : typeof item.serialNumbers === 'string'
                        ? item.serialNumbers.split(',').map((s: string) => s.trim()).filter(Boolean)
                        : safeArray<string>(item.serials);
                    const itemPrice = Number(item.unitPrice || item.price || 0);
                    const itemQty = Number(item.quantity || item.qty || 1);
                    const itemDiscount = Number(item.discount || 0);
                    const itemTotal = Number(item.total || itemPrice * itemQty - itemDiscount);
                    const itemName = item.productName || item.name || 'Product Item';

                    return (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ textAlign: 'center', fontWeight: 700, padding: '8px 6px', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: 700, color: '#002B5B', fontSize: '12.5px' }}>{itemName}</div>
                          <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '1px' }}>
                            SKU: <strong style={{ color: '#334155' }}>{item.sku || 'N/A'}</strong> | Category: {item.category || 'General'}
                            {item.description && <span> | {item.description}</span>}
                          </div>
                          {(item.isSerialized || itemSerials.length > 0) && itemSerials.length > 0 && (
                            <div style={{ marginTop: '2px', fontSize: '10.5px', color: '#008CFF', fontFamily: 'monospace', fontWeight: 600 }}>
                              S/N: {itemSerials.join(', ')}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '11px', fontWeight: 600, color: '#0284c7' }}>
                          {item.warrantyMonths && Number(item.warrantyMonths) > 0 ? `${item.warrantyMonths} Mo` : 'Standard'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, padding: '8px 6px' }}>{itemQty}</td>
                        <td style={{ textAlign: 'right', padding: '8px 8px', color: '#334155' }}>৳{itemPrice.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', padding: '8px 8px', color: itemDiscount > 0 ? '#dc2626' : '#94a3b8' }}>
                          {itemDiscount > 0 ? `-৳${itemDiscount.toLocaleString()}` : '-'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, padding: '8px 10px', color: '#002B5B' }}>৳{itemTotal.toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                      Invoice details recorded. No line items attached.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* EMI Section (Shown exclusively for EMI sales) */}
            {isEMI && (
              <div style={{ margin: '14px 0', border: '1.5px solid #f59e0b', borderRadius: '8px', background: '#fffbeb', padding: '12px 16px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fde68a', paddingBottom: '6px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#b45309', fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    ★ EMI FINANCING AGREEMENT DETAILS (কিস্তির শর্ত ও বিবরণ)
                  </span>
                  <span style={{ fontSize: '11px', background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {emiAccountData?.status || 'ACTIVE'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 14px', fontSize: '11.5px' }}>
                  <div>
                    <span style={{ color: '#78350f' }}>EMI Number:</span><br />
                    <strong style={{ color: '#002B5B' }}>{emiAccountData?.emiNumber || sale.emiAccountId || 'EMI-CONTRACT'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78350f' }}>Product Price:</span><br />
                    <strong>৳{(emiAccountData ? Number(emiAccountData.laptopPrice) : grandTotal).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78350f' }}>Down Payment:</span><br />
                    <strong style={{ color: '#16a34a' }}>৳{(emiAccountData ? Number(emiAccountData.downPayment) : paidAmount).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78350f' }}>Financed Amount:</span><br />
                    <strong style={{ color: '#b45309' }}>৳{(emiAccountData ? Number(emiAccountData.financedAmount) : dueAmount).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78350f' }}>Duration:</span><br />
                    <strong>{emiAccountData?.durationMonths || 6} Months</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78350f' }}>Monthly Installment:</span><br />
                    <strong style={{ color: '#002B5B', fontSize: '12.5px' }}>৳{(emiAccountData ? Number(emiAccountData.monthlyInstallment) : Math.round(dueAmount / 6)).toLocaleString()} / mo</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78350f' }}>Total Paid To Date:</span><br />
                    <strong style={{ color: '#16a34a' }}>৳{(emiAccountData ? Number(emiAccountData.totalPaid) : paidAmount).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78350f' }}>Remaining Balance:</span><br />
                    <strong style={{ color: '#dc2626' }}>৳{(emiAccountData ? Number(emiAccountData.remainingBalance) : dueAmount).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Summary & Payment Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '18px', position: 'relative', zIndex: 1 }}>
              {/* Payment Methods Box */}
              <div style={{ flex: 1, background: '#F4F6F8', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '6px' }}>
                  Payment Method Breakdown (পরিশোধের বিবরণ)
                </div>
                {payments.length > 0 ? (
                  payments.map((p: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', padding: '2px 0' }}>
                      <span style={{ color: '#475569' }}>
                        • <strong>{p.method || 'Payment'}</strong>
                        {p.ref || p.transactionRef ? ` (Ref: ${p.ref || p.transactionRef})` : ''}:
                      </span>
                      <strong style={{ color: '#16a34a' }}>৳{Number(p.amount || 0).toLocaleString()}</strong>
                    </div>
                  ))
                ) : paidAmount > 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', padding: '2px 0' }}>
                    <span style={{ color: '#475569' }}>• Direct Cash:</span>
                    <strong style={{ color: '#16a34a' }}>৳{paidAmount.toLocaleString()}</strong>
                  </div>
                ) : (
                  <div style={{ fontSize: '11.5px', color: '#ea580c', fontWeight: 600 }}>
                    Credit Sale (Unpaid / Full Due)
                  </div>
                )}

                {sale.notes && (
                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1', fontSize: '11px', color: '#475569' }}>
                    <strong>Remarks:</strong> {sale.notes}
                  </div>
                )}
              </div>

              {/* Totals Table */}
              <table style={{ width: '280px', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '3px 0', color: '#475569' }}>Subtotal:</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 700 }}>৳{subtotal.toLocaleString()}</td>
                  </tr>
                  {overallDiscount > 0 && (
                    <tr>
                      <td style={{ padding: '3px 0', color: '#dc2626' }}>Invoice Discount:</td>
                      <td style={{ padding: '3px 0', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>-৳{overallDiscount.toLocaleString()}</td>
                    </tr>
                  )}
                  {vatAmount > 0 && (
                    <tr>
                      <td style={{ padding: '3px 0', color: '#475569' }}>VAT / Tax ({vatPercent}%):</td>
                      <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 700 }}>+৳{vatAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  {deliveryCharge > 0 && (
                    <tr>
                      <td style={{ padding: '3px 0', color: '#475569' }}>Delivery Charge:</td>
                      <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 700 }}>+৳{deliveryCharge.toLocaleString()}</td>
                    </tr>
                  )}
                  {serviceCharge > 0 && (
                    <tr>
                      <td style={{ padding: '3px 0', color: '#475569' }}>Service Charge:</td>
                      <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 700 }}>+৳{serviceCharge.toLocaleString()}</td>
                    </tr>
                  )}
                  {otherCharges > 0 && (
                    <tr>
                      <td style={{ padding: '3px 0', color: '#475569' }}>Other Charges:</td>
                      <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 700 }}>+৳{otherCharges.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr style={{ background: '#002B5B', color: '#ffffff' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 800, fontSize: '13px' }}>Grand Total:</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, fontSize: '13px' }}>৳{grandTotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#16a34a', fontWeight: 700 }}>Paid Amount:</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>৳{paidAmount.toLocaleString()}</td>
                  </tr>
                  {dueAmount > 0 && (
                    <tr>
                      <td style={{ padding: '4px 0', color: '#dc2626', fontWeight: 800 }}>Current Invoice Due:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>৳{dueAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  {previousDue > 0 && (
                    <>
                      <tr>
                        <td style={{ padding: '2px 0', color: '#d97706', fontSize: '11px' }}>Customer Previous Due:</td>
                        <td style={{ padding: '2px 0', textAlign: 'right', color: '#d97706', fontWeight: 700, fontSize: '11px' }}>৳{previousDue.toLocaleString()}</td>
                      </tr>
                      <tr style={{ borderTop: '1.5px solid #cbd5e1' }}>
                        <td style={{ padding: '4px 0', color: '#b45309', fontWeight: 800 }}>Total Customer Due:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', color: '#b45309', fontWeight: 800 }}>৳{totalDue.toLocaleString()}</td>
                      </tr>
                    </>
                  )}
                  {changeAmount > 0 && (
                    <tr>
                      <td style={{ padding: '4px 0', color: '#0284c7', fontWeight: 700 }}>Change / Return:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', color: '#0284c7', fontWeight: 800 }}>৳{changeAmount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Warranty Terms */}
            <div style={{ borderTop: '1.5px solid #002B5B', paddingTop: '10px', marginTop: '16px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '10.5px', color: '#002B5B', letterSpacing: '0.03em', marginBottom: '4px' }}>
                NEED ELECTRO WARRANTY & COMMERCIAL TERMS
              </div>
              <ol style={{ paddingLeft: '16px', margin: 0, fontSize: '9.5px', lineHeight: '1.45', color: '#334155' }}>
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
              <div style={{ marginTop: '6px', fontWeight: 800, fontSize: '10.5px', color: '#002B5B' }}>
                Thank you for choosing NEED ELECTRO.
              </div>
            </div>

            {/* Signature Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginTop: '36px', position: 'relative', zIndex: 1 }}>
              <div style={{ borderTop: '1px dashed #64748b', paddingTop: '5px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                Customer's Signature
              </div>
              <div style={{ borderTop: '1px dashed #64748b', paddingTop: '5px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                Prepared By: {sale.salespersonName || 'Amdadur Rahman'}
              </div>
              <div style={{ borderTop: '1px dashed #64748b', paddingTop: '5px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                Authorized NEED ELECTRO
              </div>
            </div>

            {/* Core Services Footer & Development Credit */}
            <div style={{ marginTop: '20px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', textAlign: 'center', fontSize: '10px', color: '#64748b', position: 'relative', zIndex: 1 }}>
              <div style={{ fontWeight: 700, color: '#002B5B', marginBottom: '2px' }}>
                Our Core Solutions: Laptops • Desktops • CCTV Systems • Smart Electrical Installations • Mobile & Web Development
              </div>
              <div>
                Shop No: 5, MR Plaza, Kusumbag, Moulvibazar • Hotline: +880 1733-983752 • Email: needelectro23@gmail.com
              </div>
              <div style={{ marginTop: '6px', fontWeight: 800, fontSize: '10px', color: '#000', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Software Developed By AMDADS GROUP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
