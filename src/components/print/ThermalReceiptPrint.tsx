import React from 'react';
import { Sale, SystemSettings } from '../../types';
import { Printer, X, FileText } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';

interface ThermalReceiptPrintProps {
  sale: Sale;
  settings: SystemSettings;
  onClose: () => void;
  onSwitchToA4?: () => void;
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

export const ThermalReceiptPrint: React.FC<ThermalReceiptPrintProps> = ({ sale, settings, onClose, onSwitchToA4 }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    document.body.classList.add('is-printing-thermal');
    return () => {
      document.body.classList.remove('is-printing-thermal');
    };
  }, []);

  const safeSettings = settings || ({} as Partial<SystemSettings>);
  const items = safeArray<any>(sale.items);
  const payments = safeArray<any>(sale.payments);

  const rawDate = sale.createdAt || sale.date || new Date();
  const parsedDate = new Date(rawDate);
  const formattedDate = isNaN(parsedDate.getTime()) 
    ? new Date().toLocaleString('en-GB') 
    : parsedDate.toLocaleString('en-GB');

  const subtotal = Number(sale.subtotal || 0);
  const overallDiscount = Number(sale.overallDiscount || 0);
  const vatAmount = Number(sale.vatAmount || 0);
  const vatPercent = Number(sale.vatPercent || 0);
  const grandTotal = Number(sale.grandTotal || (subtotal - overallDiscount + vatAmount));
  const paidAmount = Number(sale.paidAmount || 0);
  const dueAmount = Number(sale.dueAmount !== undefined ? sale.dueAmount : Math.max(0, grandTotal - paidAmount));

  const paidMethodsText = payments.length > 0 
    ? payments.map((p: any) => p.method || 'CASH').join('/') 
    : 'CASH';

  return (
    <div className="modal-overlay print-active-modal" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '420px', maxHeight: '95vh' }}>
        <div className="modal-header no-print">
          <div className="modal-title">
            <Printer size={18} />
            80mm Thermal Receipt — {sale.invoiceNumber || 'REC-DRAFT'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print
            </button>
            {onSwitchToA4 && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={onSwitchToA4}
                title="Switch to A4 Tax Invoice format"
              >
                <FileText size={14} /> A4 Invoice
              </button>
            )}
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
                {safeSettings.companyTagline || 'Trusted Electrical & Technological Solutions'}
              </div>
              <div style={{ fontSize: '8.5px', marginTop: '2px' }}>
                Main Branch: {safeSettings.address || 'Shop#5, MR Plaza, Kusumbag, Moulvibazar'}
              </div>
              <div style={{ fontSize: '8.5px' }}>
                Hotline: <strong>{safeSettings.phone || '01733-983752'}</strong> | Email: <strong>info.needelectro@gmail.com</strong>
              </div>
            </div>

            <div style={{ fontSize: '10px', marginBottom: '6px' }}>
              <div><strong>Invoice:</strong> {sale.invoiceNumber}</div>
              <div><strong>Date:</strong> {formattedDate}</div>
              <div><strong>Customer:</strong> {sale.customerName || 'Walking Customer'}</div>
              <div><strong>Phone:</strong> {sale.customerPhone || 'N/A'}</div>
              <div><strong>Address:</strong> {sale.customerAddress || (sale as any).customer?.address || 'Moulvibazar, Sylhet'}</div>
              <div><strong>Cashier:</strong> {sale.salespersonName || 'Amdadur Rahman'}</div>
            </div>

            <div className="thermal-line" />

            <div style={{ fontSize: '10px' }}>
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
                    <div key={item.id || idx} style={{ marginBottom: '6px' }}>
                      <div style={{ fontWeight: 'bold' }}>{itemName}</div>
                      {(item.isSerialized || itemSerials.length > 0) && itemSerials.length > 0 && (
                        <div style={{ fontSize: '9px' }}>SN: {itemSerials.join(', ')}</div>
                      )}
                      <div className="thermal-item-row">
                        <span>{itemQty} x ৳{itemPrice.toLocaleString()}</span>
                        <span>৳{itemTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '6px 0', color: '#64748b' }}>
                  No items listed
                </div>
              )}
            </div>

            <div className="thermal-line" />

            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <div className="thermal-item-row">
                <span>Subtotal:</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              {overallDiscount > 0 && (
                <div className="thermal-item-row">
                  <span>Discount:</span>
                  <span>-৳{overallDiscount.toLocaleString()}</span>
                </div>
              )}
              {vatAmount > 0 && (
                <div className="thermal-item-row">
                  <span>VAT ({vatPercent}%):</span>
                  <span>৳{vatAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="thermal-item-row" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                <span>Total:</span>
                <span>৳{grandTotal.toLocaleString()}</span>
              </div>
              <div className="thermal-item-row">
                <span>Paid ({paidMethodsText}):</span>
                <span>৳{paidAmount.toLocaleString()}</span>
              </div>
              {dueAmount > 0 && (
                <div className="thermal-item-row" style={{ fontWeight: 'bold' }}>
                  <span>Due:</span>
                  <span>৳{dueAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="thermal-line" />

            <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '8px' }}>
              <div>Goods once sold cannot be returned.</div>
              <div>Warranty valid with matching Serial No.</div>
              <div style={{ fontWeight: 'bold', marginTop: '4px' }}>Thank you for visiting NEED ELECTRO!</div>
              
              <div style={{ 
                marginTop: '6px', 
                paddingTop: '4px', 
                borderTop: '1px solid #000000', 
                fontWeight: 'bold', 
                fontSize: '8.5px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                Software Developed By AMDADS GROUP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
