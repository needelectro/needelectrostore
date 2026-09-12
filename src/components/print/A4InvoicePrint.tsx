import React from 'react';
import { Sale, SystemSettings } from '../../types';
import { Printer, X, Receipt } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';

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
    ? new Date().toLocaleString('en-GB')
    : parsedDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

  const safeSettings = settings || ({} as Partial<SystemSettings>);
  const items = safeArray<any>(sale.items);
  const payments = safeArray<any>(sale.payments);

  const subtotal = Number(sale.subtotal || 0);
  const overallDiscount = Number(sale.overallDiscount || 0);
  const vatAmount = Number(sale.vatAmount || 0);
  const vatPercent = Number(sale.vatPercent || 0);
  const grandTotal = Number(sale.grandTotal || (subtotal - overallDiscount + vatAmount));
  const paidAmount = Number(sale.paidAmount || 0);
  const dueAmount = Number(sale.dueAmount !== undefined ? sale.dueAmount : Math.max(0, grandTotal - paidAmount));

  // Ensure payment breakdown amounts accurately reflect the actual paidAmount
  let paymentMethodsText = 'Direct Cash';
  if (payments.length === 1) {
    const singleMethod = payments[0].method || 'Cash';
    const effectiveAmount = paidAmount > 0 ? paidAmount : Number(payments[0].amount || 0);
    paymentMethodsText = `${singleMethod} (৳${effectiveAmount.toLocaleString()})`;
  } else if (payments.length > 1) {
    const paymentsSum = payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    const diff = paidAmount - paymentsSum;
    paymentMethodsText = payments.map((p: any, idx: number) => {
      const adjustedAmount = idx === 0 ? Number(p.amount || 0) + diff : Number(p.amount || 0);
      return `${p.method || 'Payment'} (৳${adjustedAmount.toLocaleString()})`;
    }).join(', ');
  } else if (paidAmount > 0) {
    paymentMethodsText = `Cash (৳${paidAmount.toLocaleString()})`;
  }

  return (
    <div className="modal-overlay print-active-modal" style={{ zIndex: 9999 }}>
      <div className="modal-content modal-content-xl">
        <div className="modal-header no-print">
          <div className="modal-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            <Printer size={20} className="text-primary" />
            Official A4 Invoice Preview — {sale.invoiceNumber || 'INV-DRAFT'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint} style={{ fontWeight: 600 }}>
              <Printer size={16} /> Print / Save PDF
            </button>
            {onSwitchToThermal && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={onSwitchToThermal}
                title="Switch to 80mm Thermal Receipt format"
              >
                <Receipt size={15} /> 80mm Receipt
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={16} /> Close
            </button>
          </div>
        </div>

        <div className="modal-body a4-preview-body">
          {/* Printable Sheet */}
          <div className="a4-print-document" id="printable-a4-invoice">
            {/* Watermark Background — Full Page Logo */}
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
                userSelect: 'none'
              }}
            >
              <img 
                src="/logo-transparent.png" 
                alt="NEED ELECTRO Watermark" 
                style={{ width: '55%', height: 'auto', display: 'block', opacity: 0.10 }}
              />
            </div>

            {/* Header */}
            <div className="a4-header" style={{ position: 'relative', zIndex: 1 }}>
              <div className="a4-logo-group">
                <NeedElectroLogo 
                  variant="master-image"
                  size="lg" 
                  theme="light" 
                  showSisterConcern={false} 
                />

                <div className="a4-company-details">
                  <p><strong>Main Branch Moulvibazar:</strong> {safeSettings.address || 'Shop#5, MR Plaza, Kusumbag, Moulvibazar, Sylhet, Bangladesh'}</p>
                  <p>Hotline: <strong>{safeSettings.phone || '+880 1733-983752'}</strong> | Email: <strong>info.needelectro@gmail.com</strong></p>
                </div>
              </div>

              <div className="a4-invoice-meta">
                <div className="a4-invoice-badge">
                  {sale.saleType === 'EMI' ? 'EMI INVOICE' : 'TAX INVOICE'}
                </div>
                <div className="a4-meta-table">
                  <p><strong>Invoice No:</strong> {sale.invoiceNumber}</p>
                  <p><strong>Date & Time:</strong> {formattedDate}</p>
                  <p><strong>Salesperson:</strong> {sale.salespersonName || 'Amdadur Rahman'}</p>
                  {sale.emiAccountId && <p><strong style={{ color: '#0284c7' }}>EMI Account:</strong> Linked</p>}
                </div>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="a4-party-details" style={{ position: 'relative', zIndex: 1 }}>
              <div className="a4-bill-to">
                <h4>Customer Information (ক্রেতার বিবরণ)</h4>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#000000', margin: '2px 0' }}>{sale.customerName || 'Walking Customer'}</p>
                <p>Phone: <strong>{sale.customerPhone || 'N/A'}</strong></p>
                <p>Address: <strong>{sale.customerAddress || (sale as any).customer?.address || 'Moulvibazar, Sylhet'}</strong></p>
                <p>Account Status: <strong>Registered Commercial Customer</strong></p>
              </div>
              <div className="a4-bill-to" style={{ maxWidth: '300px' }}>
                <h4>Payment Mode & Status</h4>
                <p>Sale Type: <strong>{sale.saleType || 'REGULAR'} SALE</strong></p>
                <p>Payment Method: <strong>{paymentMethodsText}</strong></p>
                <p>Payment Status: <strong style={{ color: dueAmount === 0 ? '#16a34a' : '#c2410c' }}>{dueAmount === 0 ? 'FULLY PAID' : `DUE: ৳${dueAmount.toLocaleString()}`}</strong></p>
              </div>
            </div>

            {/* Products Table */}
            <table className="a4-items-table" style={{ position: 'relative', zIndex: 1 }}>
              <thead>
                <tr>
                  <th style={{ width: '5%', textAlign: 'center' }}>#</th>
                  <th style={{ width: '47%' }}>Item Description & Serial / IMEI</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Warranty</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>Total (৳)</th>
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
                    const itemPrice = Number(item.unitPrice || item.price || item.rate || 0);
                    const itemQty = Number(item.quantity || item.qty || 1);
                    const itemTotal = Number(item.total || (itemPrice * itemQty) - Number(item.discount || 0));
                    const itemName = item.productName || item.name || item.title || 'Product Item';

                    return (
                      <tr key={item.id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#000000' }}>{itemName}</div>
                          <div style={{ fontSize: '10.5px', color: '#1e293b', marginTop: '1px' }}>
                            SKU: <strong>{item.sku || 'N/A'}</strong> | Category: {item.category || 'General'}
                          </div>
                          {(item.isSerialized || itemSerials.length > 0) && itemSerials.length > 0 && (
                            <div style={{ marginTop: '2px', fontSize: '10.5px', color: '#002b5b' }}>
                              <strong>S/N:</strong> {itemSerials.join(', ')}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          {item.warrantyMonths && Number(item.warrantyMonths) > 0 ? `${item.warrantyMonths} Months` : 'Official Warranty'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{itemQty}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{itemPrice.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{itemTotal.toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                      Invoice details recorded. No line items attached.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Summary & Totals */}
            <div className="a4-totals-section" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ flex: 1, fontSize: '10px', color: '#1e293b', lineHeight: '1.4', paddingRight: '12px' }}>
                <h5 style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', color: '#000000', fontSize: '10.5px', letterSpacing: '0.02em' }}>
                  NEED ELECTRO WARRANTY TERMS
                </h5>
                <ol style={{ paddingLeft: '14px', margin: 0, fontSize: '9px', lineHeight: '1.38', color: '#0f172a' }}>
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
                <div style={{ marginTop: '5px', fontWeight: 800, fontSize: '10px', color: '#000000' }}>
                  Thank you for choosing NEED ELECTRO.
                </div>
              </div>

              <div style={{ width: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #cbd5e1' }}>
                  <span>Subtotal:</span>
                  <strong>৳{subtotal.toLocaleString()}</strong>
                </div>
                {overallDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #cbd5e1' }}>
                    <span>Discount:</span>
                    <strong style={{ color: '#dc2626' }}>-৳{overallDiscount.toLocaleString()}</strong>
                  </div>
                )}
                {vatAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #cbd5e1' }}>
                    <span>VAT ({vatPercent}%):</span>
                    <span>৳{vatAmount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '2px solid #000000', borderBottom: '2px solid #000000', fontSize: '14px', fontWeight: 800 }}>
                  <span>Grand Total:</span>
                  <span>৳{grandTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>Paid Amount:</span>
                  <strong>৳{paidAmount.toLocaleString()}</strong>
                </div>
                {dueAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#c2410c', fontWeight: 800 }}>
                    <span>Due Balance:</span>
                    <strong>৳{dueAmount.toLocaleString()}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="a4-signatures" style={{ position: 'relative', zIndex: 1 }}>
              <div className="a4-signature-box">
                Customer Signature
              </div>
              <div className="a4-signature-box">
                Prepared By: {sale.salespersonName || 'Amdadur Rahman'}
              </div>
              <div className="a4-signature-box">
                Authorized NEED ELECTRO
              </div>
            </div>

            {/* Thank you footnote & Services List from Business Card */}
            <div style={{ position: 'relative', zIndex: 1, marginTop: '18px', paddingTop: '8px', borderTop: '1px dashed #94a3b8', textAlign: 'center', fontSize: '10px', color: '#1e293b' }}>
              <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Our Core Services (আমাদের সেবাসমূহ)
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 14px', color: '#000000', fontWeight: 600 }}>
                <span>💻 Laptops, Computers, CCTV, Computer Accessories</span>
                <span>🏠 Complete electrical work of the house</span>
                <span>💡 Safe and modern smart electric solutions</span>
                <span>📹 CCTV camera installation and setup services</span>
              </div>
              <div style={{ marginTop: '5px', color: '#334155', fontSize: '9.5px', fontWeight: 600 }}>
                Shop#5, MR Plaza, Kusumbag, Moulvibazar • Hotline: 01733-983752 • Email: info.needelectro@gmail.com
              </div>
              
              {/* Mandatory Software Development Credit */}
              <div 
                className="a4-software-dev-credit"
                style={{
                  marginTop: '8px',
                  paddingTop: '6px',
                  borderTop: '1.5px solid #000000',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#000000',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                Software Developed By AMDADS GROUP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
