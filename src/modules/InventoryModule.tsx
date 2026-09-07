import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Product, ProductSerial, InventoryTransaction } from '../types';
import {
  Boxes, Search, Hash, AlertTriangle, ArrowRightLeft, 
  Plus, Check, X, ShieldCheck, History, Laptop, Filter, TrendingDown, TrendingUp
} from 'lucide-react';

interface InventoryModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({ onNavigate }) => {
  const { 
    products, serials, inventoryTransactions, branches, 
    selectedBranch, suppliers, customers, stockAdjustment, stockTransfer 
  } = useERP();

  const [activeTab, setActiveTab] = useState<'stock' | 'serials' | 'ledger' | 'transfer' | 'adjust'>('stock');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Serial lifecycle modal
  const [inspectingSerial, setInspectingSerial] = useState<ProductSerial | null>(null);

  // Stock Transfer Form
  const [transferProdId, setTransferProdId] = useState<string>(products[0]?.id || '');
  const [transferFromBranch, setTransferFromBranch] = useState<string>(branches[0]?.id || '');
  const [transferToBranch, setTransferToBranch] = useState<string>(branches[1]?.id || '');
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferSerialsInput, setTransferSerialsInput] = useState<string>('');

  // Stock Adjustment Form
  const [adjustProdId, setAdjustProdId] = useState<string>(products[0]?.id || '');
  const [adjustQtyDiff, setAdjustQtyDiff] = useState<number>(-1);
  const [adjustReason, setAdjustReason] = useState<string>('Damaged in showroom handling');
  const [adjustSerialsInput, setAdjustSerialsInput] = useState<string>('');

  // Calculations
  const totalStockValuation = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
  const lowStockItems = products.filter(p => p.currentStock <= p.minStock);
  const totalSerializedUnits = serials.length;
  const availableSerialsCount = serials.filter(s => s.status === 'AVAILABLE').length;

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Filtered Serials
  const filteredSerials = serials.filter(s => {
    const prod = products.find(p => p.id === s.productId);
    const q = searchQuery.toLowerCase();
    return s.serialNumber.toLowerCase().includes(q) || 
           (prod && prod.name.toLowerCase().includes(q)) || 
           s.status.toLowerCase().includes(q);
  });

  const categories = ['ALL', 'Laptop', 'Desktop', 'CCTV', 'Router', 'Electrical Products', 'Cables', 'Chargers'];

  // Handle Transfer Submit
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFromBranch === transferToBranch) {
      alert('Source and destination branches cannot be the same!');
      return;
    }
    const serialArr = transferSerialsInput ? transferSerialsInput.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const res = await stockTransfer(transferProdId, transferFromBranch, transferToBranch, transferQty, serialArr);
    if (res.success) {
      setTransferSerialsInput('');
      setActiveTab('stock');
    } else {
      alert(`Transfer failed: ${res.error}`);
    }
  };

  // Handle Adjustment Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const serialArr = adjustSerialsInput ? adjustSerialsInput.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const res = await stockAdjustment(adjustProdId, selectedBranch.id, adjustQtyDiff, adjustReason, serialArr);
    if (res.success) {
      setAdjustSerialsInput('');
      setActiveTab('stock');
    } else {
      alert(`Adjustment failed: ${res.error}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <Boxes size={28} color="var(--brand-primary)" />
            Inventory & Serial Number Management
          </h1>
          <p>
            Real-time stock ledger, individualized laptop serial lifecycle tracking, valuation, and inter-branch transfers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'transfer' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('transfer')}
          >
            <ArrowRightLeft size={16} /> Inter-Branch Transfer
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'adjust' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('adjust')}
          >
            Stock Adjustment / Damage
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Inventory Valuation</span>
            <div className="kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
              <Boxes size={20} />
            </div>
          </div>
          <div className="kpi-value">৳{totalStockValuation.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Calculated automatically at FIFO cost price
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Serialized Laptops & Items</span>
            <div className="kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
              <Hash size={20} />
            </div>
          </div>
          <div className="kpi-value">{availableSerialsCount} Available</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Total {totalSerializedUnits} tracked units in system
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Low Stock Alert Count</span>
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: lowStockItems.length > 0 ? '#ef4444' : 'inherit' }}>
            {lowStockItems.length} Products
          </div>
          <div className="kpi-footer" style={{ color: lowStockItems.length > 0 ? '#ef4444' : '#10b981' }}>
            {lowStockItems.length > 0 ? 'Requires restocking purchase' : 'All stock levels healthy'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          Current Stock Levels ({products.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'serials' ? 'active' : ''}`}
          onClick={() => setActiveTab('serials')}
        >
          Serial Master Tracker ({serials.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          Stock Ledger ({inventoryTransactions.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfer')}
        >
          Stock Transfer
        </button>
        <button 
          className={`tab-btn ${activeTab === 'adjust' ? 'active' : ''}`}
          onClick={() => setActiveTab('adjust')}
        >
          Adjustment & Damage
        </button>
      </div>

      {/* TAB 1: CURRENT STOCK LEVELS */}
      {activeTab === 'stock' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          {/* Search and Category Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search products by SKU or Name..."
                className="form-input"
                style={{ paddingLeft: '32px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Table */}
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Tracking</th>
                  <th style={{ textAlign: 'right' }}>Cost Price</th>
                  <th style={{ textAlign: 'right' }}>Retail Price</th>
                  <th style={{ textAlign: 'center' }}>Current Stock</th>
                  <th style={{ textAlign: 'right' }}>Valuation</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const isLow = p.currentStock <= p.minStock;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          SKU: <strong>{p.sku}</strong> • Brand: {p.brand} {p.model}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{p.category}</span>
                      </td>
                      <td>
                        {p.isSerialized ? (
                          <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Hash size={12} /> Serialized
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity Batch</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>৳{p.costPrice.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>৳{p.retailPrice.toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontWeight: '800',
                          fontSize: '1rem',
                          color: isLow ? '#ef4444' : '#10b981'
                        }}>
                          {p.currentStock}
                        </span>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Min: {p.minStock}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--brand-primary)' }}>
                        ৳{(p.currentStock * p.costPrice).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
                          {isLow ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SERIAL NUMBER MASTER TRACKER */}
      {activeTab === 'serials' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '360px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Lookup any Serial Number or Model..."
                className="form-input"
                style={{ paddingLeft: '32px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Total Serials: <strong>{serials.length}</strong> | Available: <strong style={{ color: '#10b981' }}>{availableSerialsCount}</strong> | Sold: <strong>{serials.length - availableSerialsCount}</strong>
            </div>
          </div>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Product Model</th>
                  <th>Purchase Inflow</th>
                  <th style={{ textAlign: 'right' }}>Cost</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Sale / Customer Information</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSerials.map(s => {
                  const prod = products.find(p => p.id === s.productId);
                  const cust = customers.find(c => c.id === s.customerId);

                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '800', color: '#2563eb' }}>
                        {s.serialNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{prod?.name || 'Product'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SKU: {prod?.sku}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        <div>Date: {s.purchaseDate}</div>
                        <div style={{ color: 'var(--text-muted)' }}>PO: {s.purchaseId}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>৳{s.purchaseCost.toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${s.status === 'AVAILABLE' ? 'badge-success' : s.status === 'SOLD' ? 'badge-info' : 'badge-danger'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        {s.status === 'SOLD' ? (
                          <div>
                            <div style={{ fontWeight: '600' }}>{cust?.name || 'Retail Client'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Invoice: {s.saleInvoiceId} | Sold: {s.saleDate}
                            </div>
                            {s.emiAccountId && (
                              <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 'bold' }}>
                                (EMI Linked)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#10b981', fontSize: '0.75rem' }}>In Stock (Available for Sale)</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setInspectingSerial(s)}
                        >
                          Lifecycle Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK LEDGER */}
      {activeTab === 'ledger' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
            Complete Perpetual Stock Movement Ledger
          </h3>
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Trx #</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Opening</th>
                  <th style={{ textAlign: 'center' }}>Change</th>
                  <th style={{ textAlign: 'center' }}>Closing</th>
                  <th style={{ textAlign: 'right' }}>Unit Cost</th>
                  <th>Reference & Notes</th>
                </tr>
              </thead>
              <tbody>
                {inventoryTransactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: '700', fontSize: '0.8rem' }}>{t.transactionNumber}</td>
                    <td>{t.date}</td>
                    <td>
                      <span className={`badge ${t.type === 'PURCHASE' ? 'badge-success' : t.type === 'SALE' ? 'badge-info' : 'badge-warning'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td>{t.productName}</td>
                    <td style={{ textAlign: 'center' }}>{t.openingStock}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: t.quantity > 0 ? '#10b981' : '#ef4444' }}>
                      {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>{t.closingStock}</td>
                    <td style={{ textAlign: 'right' }}>৳{t.unitCost.toLocaleString()}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div>{t.referenceType}: {t.referenceId || 'Manual'}</div>
                      <div>{t.notes}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INTER-BRANCH STOCK TRANSFER */}
      {activeTab === 'transfer' && (
        <div className="erp-card" style={{ maxWidth: '600px', padding: '1.5rem', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRightLeft size={20} color="var(--brand-primary)" />
            Inter-Branch Stock Transfer
          </h3>

          <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Select Product to Move *</label>
              <select 
                className="form-select"
                value={transferProdId}
                onChange={e => setTransferProdId(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Stock: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Source Branch (From) *</label>
                <select 
                  className="form-select"
                  value={transferFromBranch}
                  onChange={e => setTransferFromBranch(e.target.value)}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destination Branch (To) *</label>
                <select 
                  className="form-select"
                  value={transferToBranch}
                  onChange={e => setTransferToBranch(e.target.value)}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity to Transfer *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={transferQty}
                onChange={e => setTransferQty(Number(e.target.value) || 1)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Serial Numbers (Comma-separated, if serialized)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. HP840-78192-BD, HP840-78193-BD"
                value={transferSerialsInput}
                onChange={e => setTransferSerialsInput(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
              Confirm Stock Transfer
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: ADJUSTMENT & DAMAGE */}
      {activeTab === 'adjust' && (
        <div className="erp-card" style={{ maxWidth: '600px', padding: '1.5rem', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            Stock Adjustment & Damaged Stock Reconciliation
          </h3>

          <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Product to Adjust *</label>
              <select 
                className="form-select"
                value={adjustProdId}
                onChange={e => setAdjustProdId(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity Change (Use negative for loss/damage, e.g. -1, -2) *</label>
              <input
                type="number"
                className="form-input"
                value={adjustQtyDiff}
                onChange={e => setAdjustQtyDiff(Number(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Incident Report *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Broken display during shipment or physical audit variance"
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Serial Numbers Involved (if applicable)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. HP840-78192-BD"
                value={adjustSerialsInput}
                onChange={e => setAdjustSerialsInput(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-warning btn-lg" style={{ marginTop: '0.5rem' }}>
              Execute Adjustment
            </button>
          </form>
        </div>
      )}

      {/* Serial Full Lifecycle Modal */}
      {inspectingSerial && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <ShieldCheck size={20} color="var(--brand-primary)" />
                360° Serial Lifecycle: {inspectingSerial.serialNumber}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setInspectingSerial(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <div style={{ fontWeight: '700', fontSize: '1rem' }}>
                  {products.find(p => p.id === inspectingSerial.productId)?.name}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                  <span className={`badge ${inspectingSerial.status === 'AVAILABLE' ? 'badge-success' : 'badge-info'}`}>
                    Status: {inspectingSerial.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div><strong>Purchase PO:</strong> {inspectingSerial.purchaseId}</div>
                <div><strong>Purchase Date:</strong> {inspectingSerial.purchaseDate}</div>
                <div><strong>Purchase Cost:</strong> ৳{inspectingSerial.purchaseCost.toLocaleString()}</div>
                <div><strong>Supplier:</strong> {suppliers.find(s => s.id === inspectingSerial.supplierId)?.name || 'Direct Import'}</div>
                
                {inspectingSerial.status === 'SOLD' && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <div style={{ fontWeight: '700', color: 'var(--brand-primary)', marginBottom: '4px' }}>
                      Customer & Warranty Records
                    </div>
                    <div><strong>Invoice No:</strong> {inspectingSerial.saleInvoiceId}</div>
                    <div><strong>Customer:</strong> {customers.find(c => c.id === inspectingSerial.customerId)?.name}</div>
                    <div><strong>Sale Date:</strong> {inspectingSerial.saleDate}</div>
                    <div><strong>Warranty Valid Until:</strong> {inspectingSerial.warrantyEndDate}</div>
                    {inspectingSerial.emiAccountId && (
                      <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                        Sold through EMI Account: {inspectingSerial.emiAccountId}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setInspectingSerial(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
