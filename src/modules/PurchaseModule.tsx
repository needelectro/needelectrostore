import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Truck, Plus, Search, Check, X, Hash, DollarSign, Building } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PurchaseModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const PurchaseModule: React.FC<PurchaseModuleProps> = ({ onNavigate }) => {
  const { 
    suppliers, products, purchases, createPurchase, recordSupplierPayment,
    branches, selectedBranch, financialAccounts 
  } = useERP();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('ALL');

  // Form State: Purchase
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [branchId, setBranchId] = useState<string>(selectedBranch.id);
  const [items, setItems] = useState<{ productId: string; quantity: number; costPrice: number; serials: string }[]>([
    { productId: products[0]?.id || '', quantity: 2, costPrice: products[0]?.costPrice || 35000, serials: '' }
  ]);
  const [paidAmount, setPaidAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [notes, setNotes] = useState<string>('');

  // Form State: Supplier Payment
  const [paySupplierId, setPaySupplierId] = useState<string>(suppliers[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(20000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payAccountId, setPayAccountId] = useState<string>(financialAccounts[0]?.id || '');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  const handleAddItemRow = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 1, costPrice: 35000, serials: '' }]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotalCost = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  };

  const handleSupplierPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const res = await recordSupplierPayment(
      paySupplierId,
      payAmount,
      payMethod,
      payAccountId,
      payRef,
      payNotes
    );

    if (res.success) {
      setShowPayModal(false);
      setPayRef('');
      setPayNotes('');
    } else {
      alert(`Payment failed: ${res.error}`);
    }
  };

  const handleCreatePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one product item.');
      return;
    }

    // Process serials
    let formattedItems;
    try {
      formattedItems = items.map(item => {
        const prod = products.find(p => p.id === item.productId);
        const serialArr = item.serials ? item.serials.split(',').map(s => s.trim()).filter(Boolean) : [];
        if (prod?.isSerialized && serialArr.length !== item.quantity) {
          throw new Error(`Product "${prod.name}" requires exactly ${item.quantity} serial number(s). You entered ${serialArr.length}.`);
        }
        return {
          productId: item.productId,
          productName: prod?.name || '',
          quantity: item.quantity,
          costPrice: item.costPrice,
          serials: serialArr,
          serialNumbers: serialArr
        };
      });
    } catch (err: any) {
      alert(err.message);
      return;
    }

    try {
      const supplier = suppliers.find(s => s.id === supplierId);
      const totalCost = calculateTotalCost();
      const res = await createPurchase({
        supplierId,
        supplierName: supplier?.name || '',
        branchId,
        items: formattedItems,
        subtotal: totalCost,
        total: totalCost,
        paidAmount,
        dueAmount: Math.max(0, totalCost - paidAmount),
        paymentMethod,
        notes
      });

      if (res.success) {
        setShowCreateModal(false);
        setNotes('');
      } else {
        alert(`Purchase failed: ${res.error}`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = 
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSupplier = filterSupplier === 'ALL' || p.supplierId === filterSupplier;
    return matchesSearch && matchesSupplier;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <Truck size={28} color="var(--brand-primary)" />
            Purchase & Stock Inflow Management
          </h1>
          <p>
            Receive supplier shipments, validate new physical serial numbers, record supplier payments, and restock inventory.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPayModal(true)}>
            <DollarSign size={16} /> Record Supplier Payment
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> New Stock Inflow (PO)
          </button>
        </div>
      </div>

      {/* Supplier Payables Summary */}
      <div className="kpi-grid">
        {suppliers.map(s => (
          <div key={s.id} className="kpi-card erp-card-interactive" onClick={() => onNavigate('ledgers')}>
            <div className="kpi-top">
              <span className="kpi-title">{s.name}</span>
              <div className="kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
                <Truck size={18} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: s.currentPayable > 0 ? '#ef4444' : '#10b981' }}>
              ৳{s.currentPayable.toLocaleString()}
            </div>
            <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
              Phone: {s.phone} • {s.category}
            </div>
          </div>
        ))}
      </div>

      {/* Purchases Table & Filters */}
      <div className="erp-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>
            Supplier Inflow Orders & Stock Receipts ({filteredPurchases.length})
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search PO or supplier..." 
                style={{ paddingLeft: '32px', width: '220px', height: '34px', fontSize: '0.8rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select 
              className="form-control" 
              style={{ height: '34px', fontSize: '0.8rem' }}
              value={filterSupplier}
              onChange={e => setFilterSupplier(e.target.value)}
            >
              <option value="ALL">All Suppliers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Branch</th>
                <th>Intake Date</th>
                <th>Items Received</th>
                <th style={{ textAlign: 'right' }}>Total Cost (৳)</th>
                <th style={{ textAlign: 'right' }}>Paid (৳)</th>
                <th style={{ textAlign: 'right' }}>Due (৳)</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No purchase records match current filter.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(p => {
                  const branch = branches.find(b => b.id === p.branchId);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>{p.invoiceNumber}</td>
                      <td style={{ fontWeight: '600' }}>{p.supplierName}</td>
                      <td>{branch?.name || selectedBranch.name}</td>
                      <td>{p.date}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {p.items.map((it, idx) => (
                            <span key={idx}>
                              {it.quantity}x {it.productName}
                              {idx < p.items.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>৳{p.total.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#10b981', fontWeight: '600' }}>৳{p.paidAmount.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: p.dueAmount > 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: '600' }}>
                        ৳{p.dueAmount.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${p.status === 'Paid' ? 'badge-success' : p.status === 'Partially Paid' ? 'badge-warning' : 'badge-info'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PURCHASE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-xl" style={{ maxHeight: '92vh' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Truck size={20} color="var(--brand-primary)" />
                Record Supplier Purchase & Serial Intake
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreateModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePurchaseSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Select Supplier *</label>
                    <select 
                      className="form-select"
                      value={supplierId}
                      onChange={e => setSupplierId(e.target.value)}
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.company})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Receiving Branch / Warehouse *</label>
                    <select 
                      className="form-select"
                      value={branchId}
                      onChange={e => setBranchId(e.target.value)}
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items Intake List */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>Products & Serials Intake:</span>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItemRow}>
                      + Add Item Row
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.map((row, idx) => {
                      const prod = products.find(p => p.id === row.productId);
                      return (
                        <div key={idx} style={{ background: 'var(--bg-card-muted)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 2.5fr auto', gap: '0.5rem', alignItems: 'center' }}>
                          <select
                            className="form-select"
                            value={row.productId}
                            onChange={e => {
                              const updated = [...items];
                              updated[idx].productId = e.target.value;
                              const p = products.find(pr => pr.id === e.target.value);
                              if (p) updated[idx].costPrice = p.costPrice;
                              setItems(updated);
                            }}
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>

                          <input
                            type="number"
                            min="1"
                            className="form-input"
                            placeholder="Qty"
                            value={row.quantity}
                            onChange={e => {
                              const updated = [...items];
                              updated[idx].quantity = Number(e.target.value) || 1;
                              setItems(updated);
                            }}
                          />

                          <input
                            type="number"
                            className="form-input"
                            placeholder="Cost Price (৳)"
                            value={row.costPrice}
                            onChange={e => {
                              const updated = [...items];
                              updated[idx].costPrice = Number(e.target.value) || 0;
                              setItems(updated);
                            }}
                          />

                          <input
                            type="text"
                            className="form-input"
                            placeholder={prod?.isSerialized ? "Comma-separated Serials (e.g. SN1, SN2)" : "N/A (Non-serialized)"}
                            disabled={!prod?.isSerialized}
                            value={row.serials}
                            onChange={e => {
                              const updated = [...items];
                              updated[idx].serials = e.target.value;
                              setItems(updated);
                            }}
                          />

                          <button 
                            type="button" 
                            className="btn btn-ghost btn-sm" 
                            style={{ color: '#ef4444' }}
                            onClick={() => handleRemoveItemRow(idx)}
                            disabled={items.length === 1}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div>
                    <label className="form-label">Total Purchase Cost</label>
                    <div style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--brand-primary)' }}>
                      ৳{calculateTotalCost().toLocaleString()}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Paid to Supplier (৳)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={paidAmount}
                      onChange={e => setPaidAmount(Number(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Channel</label>
                    <select
                      className="form-select"
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                    >
                      <option value="Bank Transfer">Bank Transfer / Cheque</option>
                      <option value="Cash">Cash</option>
                      <option value="bKash">bKash Corporate</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Record Stock Inflow & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD SUPPLIER PAYMENT MODAL */}
      {showPayModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-md">
            <div className="modal-header">
              <div className="modal-title">
                <DollarSign size={20} color="var(--brand-primary)" />
                Record Supplier Outflow / Payment
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPayModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSupplierPaymentSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Select Supplier *</label>
                  <select
                    className="form-control"
                    value={paySupplierId}
                    onChange={e => setPaySupplierId(e.target.value)}
                    required
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Current Payable: ৳{s.currentPayable.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Payment Amount (৳) *</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={payAmount}
                      onChange={e => setPayAmount(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Payment Channel</label>
                    <select
                      className="form-control"
                      value={payMethod}
                      onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                    >
                      <option value="Bank Transfer">Bank Transfer / Cheque</option>
                      <option value="Cash">Cash</option>
                      <option value="bKash">bKash Corporate</option>
                      <option value="Nagad">Nagad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Deduct From Financial Account</label>
                  <select
                    className="form-control"
                    value={payAccountId}
                    onChange={e => setPayAccountId(e.target.value)}
                    required
                  >
                    {financialAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Available: ৳{a.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Bank Ref / Cheque No. (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. CHQ-993821 or BEFTN-129"
                    value={payRef}
                    onChange={e => setPayRef(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Partial settlement for PO intake"
                    value={payNotes}
                    onChange={e => setPayNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPayModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Confirm Payment & Update Supplier Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
