import React from 'react';
import { Sale, SystemSettings } from '../../types';
import { Printer, X } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';

interface ThermalReceiptPrintProps {
  sale: Sale;
  settings: SystemSettings;
  onClose: () => void;
}

export const ThermalReceiptPrint: React.FC<ThermalReceiptPrintProps> = ({ sale, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay print-active-modal" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '420px', maxHeight: '95vh' }}>
        <div className="modal-header no-print">
          <div className="modal-title">
            <Printer size={18} />
            80mm Thermal Receipt
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#e2e8f0', display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          <div className="thermal-receipt-document" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
            <div className="thermal-header" style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                <NeedElectroLogo size="sm" variant="master-image" theme="light" />
              </div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#0284C7' }}>
                {settings.companyTagline}
              </div>
              <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '2px', fontWeight: 'bold' }}>
                A sister Concern Of AMDADS GROUP
              </div>
              <div style={{ fontSize: '8.5px', marginTop: '2px' }}>
                Main Branch: {settings.address}
              </div>
              <div style={{ fontSize: '8.5px' }}>
                Hotline: <strong>{settings.phone}</strong> | {settings.website}
              </div>
              <div style={{ fontSize: '8.5px', color: '#475569' }}>
                {settings.vatRegistrationNo}
              </div>
            </div>

            <div style={{ fontSize: '10px', marginBottom: '6px' }}>
              <div><strong>Invoice:</strong> {sale.invoiceNumber}</div>
              <div><strong>Date:</strong> {new Date(sale.createdAt).toLocaleString('en-GB')}</div>
              <div><strong>Customer:</strong> {sale.customerName}</div>
              <div><strong>Phone:</strong> {sale.customerPhone}</div>
              <div><strong>Cashier:</strong> {sale.salespersonName}</div>
            </div>

            <div className="thermal-line" />

            <div style={{ fontSize: '10px' }}>
              {sale.items.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '6px' }}>
                  <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
                  {item.isSerialized && item.serialNumbers.length > 0 && (
                    <div style={{ fontSize: '9px' }}>SN: {item.serialNumbers.join(', ')}</div>
                  )}
                  <div className="thermal-item-row">
                    <span>{item.quantity} x ৳{item.unitPrice.toLocaleString()}</span>
                    <span>৳{item.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="thermal-line" />

            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <div className="thermal-item-row">
                <span>Subtotal:</span>
                <span>৳{sale.subtotal.toLocaleString()}</span>
              </div>
              {sale.overallDiscount > 0 && (
                <div className="thermal-item-row">
                  <span>Discount:</span>
                  <span>-৳{sale.overallDiscount.toLocaleString()}</span>
                </div>
              )}
              {sale.vatAmount > 0 && (
                <div className="thermal-item-row">
                  <span>VAT ({sale.vatPercent}%):</span>
                  <span>৳{sale.vatAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="thermal-item-row" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                <span>Total:</span>
                <span>৳{sale.grandTotal.toLocaleString()}</span>
              </div>
              <div className="thermal-item-row">
                <span>Paid ({sale.payments.map(p => p.method).join('/')}):</span>
                <span>৳{sale.paidAmount.toLocaleString()}</span>
              </div>
              {sale.dueAmount > 0 && (
                <div className="thermal-item-row" style={{ fontWeight: 'bold' }}>
                  <span>Due:</span>
                  <span>৳{sale.dueAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="thermal-line" />

            <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '8px' }}>
              <div>Goods once sold cannot be returned.</div>
              <div>Warranty valid with matching Serial No.</div>
              <div style={{ fontWeight: 'bold', marginTop: '4px' }}>Thank you for visiting NEED ELECTRO!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
