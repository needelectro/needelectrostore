import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Sale } from '../types';
import { 
  ReceiptText, Search, Printer, FileText, Eye, 
  RotateCcw, Calendar, Check, X, ArrowUpRight,
  Edit2, Trash2, Save, ShieldCheck
} from 'lucide-react';

interface SalesModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const SalesModule: React.FC<SalesModuleProps> = ({ onNavigate }) => {
  const { 
    sales, setActiveInvoiceToPrint, setActiveThermalReceiptToPrint,
    currentUser, updateSale, deleteSale 
  } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'REGULAR' | 'EMI'>('ALL');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  // Super Admin Edit Sale Modal State
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

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

                      {/* Super Admin Direct Edit & Delete Controls */}
                      {isSuperAdmin && (
                        <>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                              setEditingSale(sale);
                              setEditForm({ ...sale });
                            }}
                            title="Super Admin Master Edit Sale"
                            style={{ padding: '0.2rem 0.45rem' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={async () => {
                              if (window.confirm(`⚠️ [SUPER ADMIN MASTER ACTION]\nAre you sure you want to permanently delete sale ${sale.invoiceNumber}?\n\nCustomer: ${sale.customerName}\nAmount: ৳${sale.grandTotal}\n\nAny serialized stock will be released back to inventory.`)) {
                                await deleteSale(sale.id);
                              }
                            }}
                            title="Super Admin Master Delete Sale"
                            style={{ padding: '0.2rem 0.45rem', color: '#ef4444' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Super Admin Edit Sale Modal */}
      {editingSale && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            width: '90vw',
            maxWidth: '680px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(245, 158, 11, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  Super Admin Master Edit — {editingSale.invoiceNumber}
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingSale(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSaving(true);
              const res = await updateSale(editingSale.id, editForm);
              setIsSaving(false);
              if (res.success) {
                setEditingSale(null);
              }
            }} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Invoice Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.invoiceNumber || ''}
                    onChange={e => setEditForm({ ...editForm, invoiceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Sale Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editForm.date ? new Date(editForm.date).toISOString().slice(0, 10) : ''}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Customer Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.customerName || ''}
                    onChange={e => setEditForm({ ...editForm, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Customer Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.customerPhone || ''}
                    onChange={e => setEditForm({ ...editForm, customerPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Grand Total (৳)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.grandTotal || 0}
                    onChange={e => {
                      const grandTotal = Number(e.target.value);
                      const paidAmount = Number(editForm.paidAmount || 0);
                      setEditForm({ ...editForm, grandTotal, dueAmount: Math.max(0, grandTotal - paidAmount) });
                    }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Paid Amount (৳)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.paidAmount || 0}
                    onChange={e => {
                      const paidAmount = Number(e.target.value);
                      const grandTotal = Number(editForm.grandTotal || 0);
                      setEditForm({ ...editForm, paidAmount, dueAmount: Math.max(0, grandTotal - paidAmount) });
                    }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Sale Status</label>
                  <select
                    className="form-select"
                    value={editForm.status || 'COMPLETED'}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="RETURNED">RETURNED</option>
                    <option value="VOID">VOID / CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Salesperson Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.salespersonName || ''}
                    onChange={e => setEditForm({ ...editForm, salespersonName: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Notes / Warranty Remarks</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={editForm.notes || ''}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSale(null)} disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                  <Save size={15} />
                  {isSaving ? 'Saving...' : 'Save & Overwrite Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
