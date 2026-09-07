import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Sale } from '../types';
import { 
  ReceiptText, Search, Printer, FileText, Eye, 
  RotateCcw, Calendar, Check, X, ArrowUpRight 
} from 'lucide-react';

interface SalesModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const SalesModule: React.FC<SalesModuleProps> = ({ onNavigate }) => {
  const { sales, setActiveInvoiceToPrint, setActiveThermalReceiptToPrint } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'REGULAR' | 'EMI'>('ALL');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter(s => {
    const matchesType = typeFilter === 'ALL' || s.saleType === typeFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = s.invoiceNumber.toLowerCase().includes(q) ||
                         s.customerName.toLowerCase().includes(q) ||
                         s.customerPhone.includes(q);
    return matchesType && matchesQuery;
  });

  const totalSalesVolume = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalPaidVolume = filteredSales.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalDueVolume = filteredSales.reduce((sum, s) => sum + s.dueAmount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <ReceiptText size={28} color="var(--brand-primary)" />
            Sales & Invoice Management
          </h1>
          <p>
            Complete commercial sales record, tax invoice reprint (A4 & 80mm POS Thermal), and return reconciliation.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('pos')}>
          + Open POS Billing Terminal
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Invoiced Amount</span>
            <div className="kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
              <ReceiptText size={20} />
            </div>
          </div>
          <div className="kpi-value">৳{totalSalesVolume.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Across {filteredSales.length} invoices
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Collected</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Check size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>৳{totalPaidVolume.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: '#10b981' }}>
            Paid at billing counter
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Uncollected Due / EMI Balance</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>৳{totalDueVolume.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: '#f59e0b' }}>
            Receivable via installments or credit
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="erp-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Invoice #, Customer Phone..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['ALL', 'REGULAR', 'EMI'] as const).map(t => (
              <button
                key={t}
                className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTypeFilter(t)}
              >
                {t} Sales
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Date</th>
                <th>Customer Details</th>
                <th>Items Summary</th>
                <th style={{ textAlign: 'right' }}>Total (৳)</th>
                <th style={{ textAlign: 'right' }}>Paid (৳)</th>
                <th style={{ textAlign: 'center' }}>Type</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Print & View</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.id}>
                  <td style={{ fontWeight: '800', color: 'var(--brand-primary)' }}>
                    {sale.invoiceNumber}
                  </td>
                  <td>{sale.date}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{sale.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sale.customerPhone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      {sale.items.map(i => i.productName).join(', ')}
                    </div>
                    {sale.items.some(i => i.isSerialized) && (
                      <div style={{ fontSize: '0.7rem', color: '#2563eb' }}>
                        SN: {sale.items.flatMap(i => i.serialNumbers).join(', ')}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>৳{sale.grandTotal.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', color: '#10b981', fontWeight: '600' }}>৳{sale.paidAmount.toLocaleString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${sale.saleType === 'EMI' ? 'badge-warning' : 'badge-neutral'}`}>
                      {sale.saleType}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success">{sale.status}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setActiveInvoiceToPrint(sale)}
                        title="Print A4 Tax Invoice"
                      >
                        <Printer size={14} /> A4
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setActiveThermalReceiptToPrint(sale)}
                        title="Print 80mm POS Thermal Receipt"
                      >
                        Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
