import React from 'react';
import { Sale, SystemSettings } from '../../types';
import { Printer, X } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';

interface A4InvoicePrintProps {
  sale: Sale;
  settings: SystemSettings;
  onClose: () => void;
}

export const A4InvoicePrint: React.FC<A4InvoicePrintProps> = ({ sale, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.createdAt || sale.date).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="modal-overlay print-active-modal" style={{ zIndex: 9999 }}>
      <div className="modal-content modal-content-xl">
        <div className="modal-header no-print">
          <div className="modal-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            <Printer size={20} className="text-primary" />
            Official A4 Invoice Preview — {sale.invoiceNumber}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint} style={{ fontWeight: 600 }}>
              <Printer size={16} /> Print / Save PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={16} /> Close
            </button>
          </div>
        </div>

        <div className="modal-body a4-preview-body">
          {/* Printable Sheet */}
          <div className="a4-print-document" id="printable-a4-invoice">
            {/* Header */}
            <div className="a4-header">
              <div className="a4-logo-group">
                <NeedElectroLogo 
                  variant="master-image"
                  size="lg" 
                  theme="light" 
                  showSisterConcern={false} 
                />
                
                <div style={{ marginTop: '5px', fontSize: '11px', color: '#0284c7', fontWeight: 800, letterSpacing: '0.04em' }}>
                  — A sister Concern Of AMDADS GROUP —
                </div>

                <div className="a4-company-details">
                  <p><strong>Main Branch Moulvibazar:</strong> {settings.address || 'Shop#5, MR Plaza, Kusumbag, Moulvibazar, Sylhet, Bangladesh'}</p>
                  <p>Hotline: <strong>{settings.phone || '+880 1733-983752'}</strong> | Email: <strong>{settings.email || 'contact.amdadur@gmail.com'}</strong></p>
                  <p>Website: <strong>{settings.website || 'https://needelectroerp.vercel.app'}</strong> | VAT Reg: <strong>{settings.vatRegistrationNo || 'VAT-NEED-2026-BD'}</strong></p>
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
            <div className="a4-party-details">
              <div className="a4-bill-to">
                <h4>Customer Information (ক্রেতার বিবরণ)</h4>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#000000', margin: '2px 0' }}>{sale.customerName}</p>
                <p>Phone: <strong>{sale.customerPhone || 'N/A'}</strong></p>
                <p>Account Status: <strong>Registered Commercial Customer</strong></p>
              </div>
              <div className="a4-bill-to" style={{ maxWidth: '300px' }}>
                <h4>Payment Mode & Status</h4>
                <p>Sale Type: <strong>{sale.saleType || 'REGULAR'} SALE</strong></p>
                <p>Payment Method: <strong>{sale.payments && sale.payments.length > 0 ? sale.payments.map(p => `${p.method} (৳${Number(p.amount).toLocaleString()})`).join(', ') : 'Direct Cash'}</strong></p>
                <p>Payment Status: <strong style={{ color: sale.dueAmount === 0 ? '#16a34a' : '#c2410c' }}>{sale.dueAmount === 0 ? 'FULLY PAID' : `DUE: ৳${Number(sale.dueAmount).toLocaleString()}`}</strong></p>
              </div>
            </div>

            {/* Products Table */}
            <table className="a4-items-table">
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
                {sale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#000000' }}>{item.productName}</div>
                      <div style={{ fontSize: '10.5px', color: '#1e293b', marginTop: '1px' }}>
                        SKU: <strong>{item.sku}</strong> | Category: {item.category}
                      </div>
                      {item.isSerialized && item.serialNumbers && item.serialNumbers.length > 0 && (
                        <div style={{ marginTop: '2px', fontSize: '10.5px', color: '#002b5b' }}>
                          <strong>S/N:</strong> {item.serialNumbers.join(', ')}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {item.warrantyMonths && item.warrantyMonths > 0 ? `${item.warrantyMonths} Months` : 'Official Warranty'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{Number(item.unitPrice).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{Number(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary & Totals */}
            <div className="a4-totals-section">
              <div style={{ flex: 1, fontSize: '10.5px', color: '#1e293b', lineHeight: '1.45' }}>
                <h5 style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: '3px', color: '#000000' }}>Terms & Conditions:</h5>
                <ol style={{ paddingLeft: '14px', margin: 0 }}>
                  <li>Warranty is valid only with original invoice and matching hardware serial number.</li>
                  <li>Burned, physical damage, liquid damage, or unauthorized servicing voids warranty.</li>
                  <li>No cash refund once product is sold. Exchange eligible within 3 days for defective units.</li>
                  <li>For EMI sales, equipment remains company asset until 100% installments are liquidated.</li>
                </ol>
              </div>

              <div style={{ width: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #cbd5e1' }}>
                  <span>Subtotal:</span>
                  <strong>৳{Number(sale.subtotal).toLocaleString()}</strong>
                </div>
                {sale.overallDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #cbd5e1' }}>
                    <span>Discount:</span>
                    <strong style={{ color: '#dc2626' }}>-৳{Number(sale.overallDiscount).toLocaleString()}</strong>
                  </div>
                )}
                {sale.vatAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #cbd5e1' }}>
                    <span>VAT ({sale.vatPercent}%):</span>
                    <span>৳{Number(sale.vatAmount).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '2px solid #000000', borderBottom: '2px solid #000000', fontSize: '14px', fontWeight: 800 }}>
                  <span>Grand Total:</span>
                  <span>৳{Number(sale.grandTotal).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>Paid Amount:</span>
                  <strong>৳{Number(sale.paidAmount).toLocaleString()}</strong>
                </div>
                {sale.dueAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#c2410c', fontWeight: 800 }}>
                    <span>Due Balance:</span>
                    <strong>৳{Number(sale.dueAmount).toLocaleString()}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="a4-signatures">
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
            <div style={{ marginTop: '18px', paddingTop: '8px', borderTop: '1px dashed #94a3b8', textAlign: 'center', fontSize: '10px', color: '#1e293b' }}>
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
                Shop#5, MR Plaza, Kusumbag, Moulvibazar • Hotline: 01733-983752 • www.needelectro.com • A sister Concern Of AMDADS GROUP
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
                Software Development By AMDADS GROUP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
