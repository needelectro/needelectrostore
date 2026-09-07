import React from 'react';
import { Sale, SystemSettings } from '../../types';
import { Printer, X, Download } from 'lucide-react';
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

  return (
    <div className="modal-overlay print-active-modal" style={{ zIndex: 9999 }}>
      <div className="modal-content modal-content-xl" style={{ maxHeight: '96vh' }}>
        <div className="modal-header no-print">
          <div className="modal-title">
            <Printer size={20} className="text-primary" />
            Official A4 Invoice Preview — {sale.invoiceNumber}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={16} /> Print / Save PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={16} /> Close
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#f8fafc', padding: '1.5rem' }}>
          {/* Printable Sheet */}
          <div className="a4-print-document" id="printable-a4-invoice" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            {/* Header */}
            <div className="a4-header" style={{ paddingBottom: '1rem', borderBottom: '2px solid #0284c7' }}>
              <div className="a4-logo-group">
                <NeedElectroLogo 
                  variant="master-image"
                  size="lg" 
                  theme="light" 
                  showSisterConcern={false} 
                />
                
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#0284C7', fontWeight: 'bold', letterSpacing: '0.04em' }}>
                  — A sister Concern Of AMDADS GROUP —
                </div>

                <div className="a4-company-details" style={{ marginTop: '4px', fontSize: '11px', color: '#475569', lineHeight: '1.45' }}>
                  <p><strong>Main Branch Moulvibazar:</strong> {settings.address}</p>
                  <p>Hotline: <strong>{settings.phone}</strong> | Email: {settings.email} | Web: {settings.website}</p>
                  <p>VAT Reg: <strong>{settings.vatRegistrationNo}</strong></p>
                </div>
              </div>

              <div className="a4-invoice-meta">
                <div className="a4-invoice-badge">
                  {sale.saleType === 'EMI' ? 'EMI INVOICE' : 'TAX INVOICE'}
                </div>
                <div className="a4-meta-table">
                  <p><strong>Invoice No:</strong> {sale.invoiceNumber}</p>
                  <p><strong>Date & Time:</strong> {new Date(sale.createdAt).toLocaleString('en-GB')}</p>
                  <p><strong>Salesperson:</strong> {sale.salespersonName}</p>
                  {sale.emiAccountId && <p><strong style={{ color: '#2563eb' }}>EMI Account:</strong> Linked</p>}
                </div>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="a4-party-details">
              <div className="a4-bill-to">
                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Customer Information (ক্রেতার বিবরণ)</h4>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>{sale.customerName}</p>
                <p>Phone: <strong>{sale.customerPhone}</strong></p>
                <p>Status: Registered Retail Customer</p>
              </div>
              <div className="a4-bill-to" style={{ maxWidth: '300px' }}>
                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Payment Mode & Status</h4>
                <p>Sale Type: <strong style={{ color: sale.saleType === 'EMI' ? '#2563eb' : '#10b981' }}>{sale.saleType} SALE</strong></p>
                <p>Method: {sale.payments.map(p => `${p.method} (৳${p.amount.toLocaleString()})`).join(', ') || 'Direct'}</p>
                <p>Payment Status: <strong>{sale.dueAmount === 0 ? 'FULLY PAID' : `DUE: ৳${sale.dueAmount.toLocaleString()}`}</strong></p>
              </div>
            </div>

            {/* Products Table */}
            <table className="a4-items-table">
              <thead>
                <tr>
                  <th style={{ width: '4%' }}>#</th>
                  <th style={{ width: '48%' }}>Item Description & Serial / IMEI</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Warranty</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>Total ({settings.currencySymbol})</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.productName}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>SKU: {item.sku} | Category: {item.category}</div>
                      {item.isSerialized && item.serialNumbers.length > 0 && (
                        <div style={{ marginTop: '3px', fontSize: '10px', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', border: '1px solid #bfdbfe' }}>
                          <strong style={{ color: '#1e40af' }}>Serial No:</strong> {item.serialNumbers.join(', ')}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      {item.warrantyMonths > 0 ? `${item.warrantyMonths} Months` : 'No Warranty'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>৳{item.unitPrice.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>৳{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary & Totals */}
            <div className="a4-totals-section">
              <div style={{ flex: 1, fontSize: '10px', color: '#475569', lineHeight: '1.5' }}>
                <h5 style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', color: '#1e293b' }}>Terms & Conditions:</h5>
                <ol style={{ paddingLeft: '14px' }}>
                  <li>Warranty is valid only with original invoice and matching serial number.</li>
                  <li>Burned, physical damage, liquid damage or unauthorized servicing voids warranty.</li>
                  <li>No cash refund once product is sold. Exchange eligible within 3 days for defective units.</li>
                  <li>For EMI sales, product remains company asset until 100% installments are completed.</li>
                </ol>
              </div>

              <div style={{ width: '260px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Subtotal:</span>
                  <strong>৳{sale.subtotal.toLocaleString()}</strong>
                </div>
                {sale.overallDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#dc2626', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Discount:</span>
                    <strong>-৳{sale.overallDiscount.toLocaleString()}</strong>
                  </div>
                )}
                {sale.vatAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span>VAT ({sale.vatPercent}%):</span>
                    <span>৳{sale.vatAmount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a', fontSize: '14px', fontWeight: '800' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: '#2563eb' }}>৳{sale.grandTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#16a34a' }}>
                  <span>Paid Amount:</span>
                  <strong>৳{sale.paidAmount.toLocaleString()}</strong>
                </div>
                {sale.dueAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#ea580c', fontWeight: 'bold' }}>
                    <span>Due Balance:</span>
                    <strong>৳{sale.dueAmount.toLocaleString()}</strong>
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
                Prepared By: {sale.salespersonName}
              </div>
              <div className="a4-signature-box">
                Authorized NEED ELECTRO
              </div>
            </div>

            {/* Thank you footnote & Services List from Business Card */}
            <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', textAlign: 'center', fontSize: '9.5px', color: '#64748b' }}>
              <div style={{ fontWeight: 700, color: '#0284C7', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Our Core Services (আমাদের সেবাসমূহ)
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 16px', color: '#334155' }}>
                <span>💻 Laptops, Computers, CCTV, Computer Accessories</span>
                <span>🏠 Complete electrical work of the house</span>
                <span>💡 Safe and modern smart electric solutions</span>
                <span>📹 CCTV camera installation and setup services</span>
              </div>
              <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '9px' }}>
                Shop#5, MR Plaza, Kusumbag, Moulvibazar • Hotline: 01733-983752 • www.needelectro.com • A sister Concern Of AMDADS GROUP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
