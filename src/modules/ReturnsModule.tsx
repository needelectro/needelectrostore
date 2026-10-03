import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { ProductReturn, ReturnType, PaymentMethod } from '../types';
import { RotateCcw, Plus, Search, Check, AlertCircle, RefreshCw, X, ShieldAlert, FileText, CheckCircle2, Loader2 } from 'lucide-react';

interface ReturnsModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const ReturnsModule: React.FC<ReturnsModuleProps> = ({ onNavigate }) => {
  const { returns, sales, products, serials, financialAccounts, recordReturn } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ReturnType>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Form State
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState('');
  const [returnType, setReturnType] = useState<ReturnType>('CUSTOMER_RETURN');
  const [reason, setReason] = useState('Customer changed mind within 3-day policy');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [selectedSerials, setSelectedSerials] = useState<string>('');
  const [condition, setCondition] = useState<'RESALEABLE' | 'DAMAGED' | 'UNDER_REPAIR'>('RESALEABLE');
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>('Cash');
  const [accountId, setAccountId] = useState<string>(financialAccounts[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Match invoice
  const matchedSale = sales.find(s => s.invoiceNumber.toLowerCase() === selectedInvoiceNumber.trim().toLowerCase());

  const handleSelectInvoice = (invNum: string) => {
    setSelectedInvoiceNumber(invNum);
    const sale = sales.find(s => s.invoiceNumber.toLowerCase() === invNum.trim().toLowerCase());
    if (sale && sale.items.length > 0) {
      const firstItem = sale.items[0];
      setSelectedProductId(firstItem.productId);
      setQuantity(1);
      setRefundAmount(firstItem.unitPrice);
      if (firstItem.serialNumbers && firstItem.serialNumbers.length > 0) {
        setSelectedSerials(firstItem.serialNumbers[0]);
      }
    }
  };

  const handleItemSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    if (matchedSale) {
      const item = matchedSale.items.find(i => i.productId === prodId);
      if (item) {
        setRefundAmount(item.unitPrice * quantity);
        if (item.serialNumbers && item.serialNumbers.length > 0) {
          setSelectedSerials(item.serialNumbers.slice(0, quantity).join(', '));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingReturn) return;
    setError(null);

    if (!matchedSale) {
      setError('Please provide a valid, existing Sales Invoice Number.');
      return;
    }

    const item = matchedSale.items.find(i => i.productId === selectedProductId);
    if (!item) {
      setError('Selected product was not found on this invoice.');
      return;
    }

    if (quantity <= 0 || quantity > item.quantity) {
      setError(`Return quantity must be between 1 and ${item.quantity}.`);
      return;
    }

    const prod = products.find(p => p.id === selectedProductId);
    const unitCost = prod?.costPrice || (item.unitPrice * 0.75);

    const serialArr = selectedSerials ? selectedSerials.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    setIsSubmittingReturn(true);
    try {
      const res = await recordReturn({
      date: new Date().toISOString().split('T')[0],
      saleInvoiceId: matchedSale.invoiceNumber,
      customerId: matchedSale.customerId,
      customerName: matchedSale.customerName,
      customerPhone: matchedSale.customerPhone,
      returnType,
      reason,
      items: [
        {
          productId: selectedProductId,
          productName: item.productName,
          quantity,
          unitPrice: item.unitPrice,
          unitCost,
          refundAmount,
          serialNumbers: serialArr,
          condition
        }
      ],
      totalRefundAmount: refundAmount,
      refundMethod,
      accountId,
      status: 'COMPLETED',
      notes
    });

      if (res.success) {
        setShowModal(false);
        setSelectedInvoiceNumber('');
        setNotes('');
        setRefundAmount(0);
      } else {
        setError(res.error || 'Failed to process return.');
      }
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const filteredReturns = returns.filter(r => {
    const matchesType = typeFilter === 'ALL' || r.returnType === typeFilter;
    const q = searchQuery.toLowerCase();
    const matchesQ = r.returnNumber.toLowerCase().includes(q) ||
                     r.saleInvoiceId.toLowerCase().includes(q) ||
                     r.customerName.toLowerCase().includes(q) ||
                     r.customerPhone.includes(q);
    return matchesType && matchesQ;
  });

  const totalRefunds = filteredReturns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
  const resaleableRestocked = filteredReturns.reduce((sum, r) => sum + r.items.filter(i => i.condition === 'RESALEABLE').reduce((iSum, i) => iSum + i.quantity, 0), 0);
  const defectiveRma = filteredReturns.reduce((sum, r) => sum + r.items.filter(i => i.condition !== 'RESALEABLE').reduce((iSum, i) => iSum + i.quantity, 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <RotateCcw size={28} color="var(--brand-primary)" />
            Customer Returns, RMA & Reversals
          </h1>
          <p>
            Controlled stock restoration, invoice adjustment, customer ledger reconciliation, and cash refund vouchers.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Process New Return / RMA
        </button>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Returns Processed</span>
            <div className="kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
              <RotateCcw size={20} />
            </div>
          </div>
          <div className="kpi-value">{filteredReturns.length}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Audited return credit notes
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Refunds Issued</span>
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
              <RefreshCw size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>৳{totalRefunds.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Reconciled via cash / bank outflow
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Resaleable Items Restocked</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>{resaleableRestocked} Units</div>
          <div className="kpi-footer" style={{ color: '#10b981' }}>
            Available for immediate resale
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Defective / RMA to Supplier</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>{defectiveRma} Units</div>
          <div className="kpi-footer" style={{ color: '#f59e0b' }}>
            Marked defective / pending supplier claim
          </div>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="erp-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Return #, Invoice #, Customer..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(['ALL', 'CUSTOMER_RETURN', 'DEFECTIVE_RMA', 'WARRANTY', 'EXCHANGE'] as const).map(t => (
              <button
                key={t}
                className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTypeFilter(t)}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Return No</th>
                <th>Date</th>
                <th>Original Invoice</th>
                <th>Customer Name</th>
                <th>Returned Items</th>
                <th>Type</th>
                <th>Condition</th>
                <th style={{ textAlign: 'right' }}>Refund Amount</th>
                <th>Handled By</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map(ret => (
                <tr key={ret.id}>
                  <td style={{ fontWeight: '800', color: 'var(--brand-primary)' }}>{ret.returnNumber}</td>
                  <td>{ret.date}</td>
                  <td style={{ fontWeight: '700' }}>{ret.saleInvoiceId}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{ret.customerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{ret.customerPhone}</div>
                  </td>
                  <td>
                    {ret.items.map((i, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem' }}>
                        {i.quantity}x {i.productName}
                        {i.serialNumbers && i.serialNumbers.length > 0 && (
                          <span style={{ color: '#2563eb', marginLeft: '4px', fontSize: '0.72rem' }}>
                            ({i.serialNumbers.join(', ')})
                          </span>
                        )}
                      </div>
                    ))}
                  </td>
                  <td>
                    <span className="badge badge-neutral">{ret.returnType.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <span className={`badge ${ret.items[0]?.condition === 'RESALEABLE' ? 'badge-success' : 'badge-warning'}`}>
                      {ret.items[0]?.condition || 'RESALEABLE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#ef4444' }}>
                    ৳{ret.totalRefundAmount.toLocaleString()}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ret.handledBy}</td>
                </tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No return records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Process Return */}
      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={18} color="var(--brand-primary)" />
                <span>Process Return / RMA Reversal</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {error && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} color="#ef4444" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Sales Invoice Number *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={selectedInvoiceNumber}
                      onChange={e => handleSelectInvoice(e.target.value)}
                      placeholder="e.g. INV-2026-0001"
                      required
                    />
                    <select
                      className="form-select"
                      style={{ maxWidth: '200px' }}
                      value={selectedInvoiceNumber}
                      onChange={e => handleSelectInvoice(e.target.value)}
                    >
                      <option value="">-- Quick Pick --</option>
                      {sales.map(s => (
                        <option key={s.id} value={s.invoiceNumber}>
                          {s.invoiceNumber} ({s.customerName})
                        </option>
                      ))}
                    </select>
                  </div>
                  {matchedSale && (
                    <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px' }}>
                      ✓ Verified Invoice: {matchedSale.customerName} (৳{matchedSale.grandTotal.toLocaleString()} on {matchedSale.date})
                    </div>
                  )}
                </div>

                {matchedSale && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Item to Return *</label>
                        <select
                          className="form-select"
                          value={selectedProductId}
                          onChange={e => handleItemSelect(e.target.value)}
                          required
                        >
                          {matchedSale.items.map(item => (
                            <option key={item.productId} value={item.productId}>
                              {item.productName} (Qty: {item.quantity} @ ৳{item.unitPrice.toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Return Quantity *</label>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          max={matchedSale.items.find(i => i.productId === selectedProductId)?.quantity || 1}
                          value={quantity}
                          onChange={e => {
                            const q = Number(e.target.value);
                            setQuantity(q);
                            const item = matchedSale.items.find(i => i.productId === selectedProductId);
                            if (item) setRefundAmount(item.unitPrice * q);
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Return Type *</label>
                        <select
                          className="form-select"
                          value={returnType}
                          onChange={e => setReturnType(e.target.value as ReturnType)}
                        >
                          <option value="CUSTOMER_RETURN">Customer Return</option>
                          <option value="DEFECTIVE_RMA">Defective / RMA</option>
                          <option value="WARRANTY">Warranty Replacement</option>
                          <option value="EXCHANGE">Exchange</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Physical Item Condition *</label>
                        <select
                          className="form-select"
                          value={condition}
                          onChange={e => setCondition(e.target.value as any)}
                        >
                          <option value="RESALEABLE">Resaleable (Restock to Showroom)</option>
                          <option value="DAMAGED">Damaged (Hold for Supplier RMA)</option>
                          <option value="UNDER_REPAIR">Sent to Service Bench</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Serial Number(s) Returned (if applicable)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. HP840-77901-BD"
                        value={selectedSerials}
                        onChange={e => setSelectedSerials(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Total Refund Amount (৳) *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={refundAmount}
                          onChange={e => setRefundAmount(Number(e.target.value))}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Refund Payment Account *</label>
                        <select
                          className="form-select"
                          value={accountId}
                          onChange={e => setAccountId(e.target.value)}
                        >
                          {financialAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name} (৳{acc.balance.toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Reason for Return *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Reason description..."
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowModal(false)}
                  disabled={isSubmittingReturn}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm" 
                  disabled={!matchedSale || isSubmittingReturn}
                >
                  {isSubmittingReturn ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing Return...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Finalize Return & Reconcile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
