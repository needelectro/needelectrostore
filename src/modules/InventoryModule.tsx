import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Product, ProductSerial } from '../types';
import {
  Boxes, Search, Hash, AlertTriangle, ArrowRightLeft,
  X, ShieldCheck, Tag, Edit2, Trash2, Package,
  Save, RefreshCw, Settings
} from 'lucide-react';
import { api } from '../services/api';
import { isProductInCategory, SHOWROOM_CATEGORIES } from '../services/categoryMatcher';

interface InventoryModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

const CATEGORIES = SHOWROOM_CATEGORIES;

// ─── Edit Product Modal ────────────────────────────────────────────────────────
interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSaved }) => {
  const { addToast, fetchProducts, suppliers } = useERP() as any;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    category: product.category,
    brand: product.brand,
    model: product.model,
    description: product.description || '',
    costPrice: product.costPrice,
    retailPrice: product.retailPrice,
    wholesalePrice: product.wholesalePrice,
    emiPrice: product.emiPrice,
    minStock: product.minStock,
    warrantyPeriodMonths: product.warrantyPeriodMonths,
    supplierId: product.supplierId || '',
    status: product.status || 'ACTIVE',
  });

  const field = (key: keyof typeof form) => ({
    value: form[key] as any,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  });

  const handleSave = async () => {
    if (!form.name.trim()) { addToast('error', 'Validation', 'Product name is required.'); return; }
    setSaving(true);
    try {
      const res = await api.products.updateProduct(product.id, form);
      if (res.success) {
        addToast('success', 'Product Updated', `${form.name} has been saved.`);
        if (fetchProducts) await fetchProducts();
        onSaved();
        onClose();
      } else {
        addToast('error', 'Update Failed', (res as any).error || 'Unknown error');
      }
    } catch (e: any) {
      addToast('error', 'Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Edit2 size={18} color="var(--brand-primary)" />
            Edit Product — {product.sku}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-input" {...field('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" {...field('status')}>
                <option value="ACTIVE">Active</option>
                <option value="DISCONTINUED">Discontinued</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" {...field('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input className="form-input" {...field('brand')} />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input className="form-input" {...field('model')} />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select className="form-select" {...field('supplierId')}>
                <option value="">-- Select Supplier --</option>
                {suppliers?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.company || s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div style={{ background: 'var(--bg-card-muted)', borderRadius: 'var(--radius-md)', padding: '0.875rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Pricing (৳)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
              {([['costPrice', 'Cost Price'], ['retailPrice', 'Retail Price'], ['wholesalePrice', 'Wholesale'], ['emiPrice', 'EMI Price']] as const).map(([k, l]) => (
                <div className="form-group" key={k} style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>{l}</label>
                  <input className="form-input" type="number" min="0" {...field(k)} />
                </div>
              ))}
            </div>
          </div>

          {/* Row 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Min Stock Alert Level</label>
              <input className="form-input" type="number" min="0" {...field('minStock')} />
            </div>
            <div className="form-group">
              <label className="form-label">Warranty (Months)</label>
              <input className="form-input" type="number" min="0" {...field('warrantyPeriodMonths')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} style={{ resize: 'vertical' }} {...field('description')} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
interface DeleteProductModalProps {
  product: Product;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({ product, onClose, onDeleted }) => {
  const { addToast, fetchProducts } = useERP() as any;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.products.deleteProduct(product.id);
      if (res.success) {
        addToast('success', 'Product Deleted', `${product.name} has been permanently removed.`);
        if (fetchProducts) await fetchProducts();
        onDeleted();
        onClose();
      } else {
        addToast('error', 'Delete Failed', (res as any).error || 'Unknown error');
      }
    } catch (e: any) {
      addToast('error', 'Error', e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Trash2 size={18} color="#ef4444" />
            Delete Product
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>⚠️ Permanent Action</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              This will permanently delete <strong>{product.name}</strong> (SKU: <strong>{product.sku}</strong>), including all serial records and inventory history.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', background: 'var(--bg-card-muted)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Category:</span> <strong>{product.category}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Stock:</span> <strong>{product.currentStock} units</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Retail Price:</span> <strong>৳{product.retailPrice.toLocaleString()}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Valuation:</span> <strong>৳{(product.currentStock * product.costPrice).toLocaleString()}</strong></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-sm"
            style={{ background: '#ef4444', color: '#fff', borderColor: '#ef4444' }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
            {deleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Stock Adjust Modal ──────────────────────────────────────────────────
interface StockAdjustModalProps {
  product: Product;
  onClose: () => void;
  onAdjusted: () => void;
}

const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ product, onClose, onAdjusted }) => {
  const { addToast, stockAdjustment, selectedBranch } = useERP() as any;
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'add' | 'remove' | 'set'>('add');
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('');
  const [serials, setSerials] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) { addToast('error', 'Validation', 'Please provide a reason for adjustment.'); return; }
    if (qty <= 0) { addToast('error', 'Validation', 'Quantity must be greater than 0.'); return; }

    let diff = mode === 'add' ? qty : mode === 'remove' ? -qty : (qty - product.currentStock);
    if (mode === 'remove' && product.currentStock + diff < 0) {
      addToast('error', 'Invalid', `Cannot remove more than current stock (${product.currentStock})`);
      return;
    }

    setSaving(true);
    try {
      const serialArr = serials ? serials.split(',').map(s => s.trim()).filter(Boolean) : undefined;
      const res = await stockAdjustment(product.id, selectedBranch?.id || 'branch-main-1', diff, reason, serialArr);
      if (res.success) {
        addToast('success', 'Stock Updated', `Stock for ${product.name} adjusted successfully.`);
        onAdjusted();
        onClose();
      } else {
        addToast('error', 'Adjustment Failed', res.error || 'Unknown error');
      }
    } catch (e: any) {
      addToast('error', 'Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const newStock = mode === 'add' ? product.currentStock + qty
    : mode === 'remove' ? Math.max(0, product.currentStock - qty)
    : qty;

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Package size={18} color="var(--brand-primary)" />
            Stock Management — {product.name}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Current Stock Display */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <div style={{ background: 'var(--bg-card-muted)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Stock</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: product.currentStock <= product.minStock ? '#ef4444' : '#10b981' }}>
                {product.currentStock}
              </div>
            </div>
            <div style={{ background: 'var(--bg-card-muted)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min Level</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{product.minStock}</div>
            </div>
            <div style={{ background: 'rgba(37,99,235,0.08)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1.5px dashed var(--brand-primary)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>After Adjustment</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{newStock}</div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            {([['add', '+ Add Stock', '#10b981'], ['remove', '− Remove Stock', '#ef4444'], ['set', '= Set Exact', '#f59e0b']] as const).map(([m, l, c]) => (
              <button
                key={m}
                className="btn btn-sm"
                onClick={() => setMode(m)}
                style={{
                  background: mode === m ? c : 'var(--bg-card-muted)',
                  color: mode === m ? '#fff' : 'var(--text-primary)',
                  borderColor: mode === m ? c : 'var(--border-color)',
                  fontWeight: 700
                }}
              >
                {mode === m ? '✓ ' : ''}{l}
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              {mode === 'add' ? 'Units to Add' : mode === 'remove' ? 'Units to Remove' : 'Set Stock To'}
            </label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={qty}
              onChange={e => setQty(Math.max(0, Number(e.target.value)))}
              style={{ fontSize: '1.1rem', fontWeight: 700 }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Reason / Note *</label>
            <input
              className="form-input"
              placeholder="e.g. Physical audit, Damage, Customer return, Restock..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          {product.isSerialized && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Serial Numbers (Optional — comma-separated)</label>
              <input
                className="form-input"
                placeholder="e.g. SN123456, SN789012"
                value={serials}
                onChange={e => setSerials(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
            {saving ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Applying...' : 'Apply Adjustment'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Inventory Module ─────────────────────────────────────────────────────
export const InventoryModule: React.FC<InventoryModuleProps> = ({ onNavigate }) => {
  const {
    products, serials, inventoryTransactions, branches,
    selectedBranch, suppliers, customers, stockAdjustment, stockTransfer,
    setActiveBarcodeToPrint, currentUser
  } = useERP() as any;

  const [activeTab, setActiveTab] = useState<'stock' | 'serials' | 'ledger' | 'transfer' | 'adjust'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [inspectingSerial, setInspectingSerial] = useState<ProductSerial | null>(null);

  // Admin management state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Transfer form
  const [transferProdId, setTransferProdId] = useState<string>(products[0]?.id || '');
  const [transferFromBranch, setTransferFromBranch] = useState<string>(branches[0]?.id || '');
  const [transferToBranch, setTransferToBranch] = useState<string>(branches[1]?.id || '');
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferSerialsInput, setTransferSerialsInput] = useState<string>('');

  // Adjust form (tab)
  const [adjustProdId, setAdjustProdId] = useState<string>(products[0]?.id || '');
  const [adjustQtyDiff, setAdjustQtyDiff] = useState<number>(-1);
  const [adjustReason, setAdjustReason] = useState<string>('Damaged in showroom handling');
  const [adjustSerialsInput, setAdjustSerialsInput] = useState<string>('');

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  const totalStockValuation = products.reduce((sum: number, p: Product) => sum + (p.currentStock * p.costPrice), 0);
  const lowStockItems = products.filter((p: Product) => p.currentStock <= p.minStock);
  const totalSerializedUnits = serials.length;
  const availableSerialsCount = serials.filter((s: ProductSerial) => s.status === 'AVAILABLE').length;

  const filteredProducts = products.filter((p: Product) => {
    const matchesCat = isProductInCategory(p, categoryFilter);
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const filteredSerials = serials.filter((s: ProductSerial) => {
    const prod = products.find((p: Product) => p.id === s.productId);
    const q = searchQuery.toLowerCase();
    return s.serialNumber.toLowerCase().includes(q) ||
      (prod && prod.name.toLowerCase().includes(q)) ||
      s.status.toLowerCase().includes(q);
  });

  const categories = ['ALL', ...CATEGORIES];

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFromBranch === transferToBranch) { alert('Source and destination branches cannot be the same!'); return; }
    const serialArr = transferSerialsInput ? transferSerialsInput.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const res = await stockTransfer(transferProdId, transferFromBranch, transferToBranch, transferQty, serialArr);
    if (res.success) { setTransferSerialsInput(''); setActiveTab('stock'); }
    else alert(`Transfer failed: ${res.error}`);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const serialArr = adjustSerialsInput ? adjustSerialsInput.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const res = await stockAdjustment(adjustProdId, selectedBranch.id, adjustQtyDiff, adjustReason, serialArr);
    if (res.success) { setAdjustSerialsInput(''); setActiveTab('stock'); }
    else alert(`Adjustment failed: ${res.error}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Modals */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => setRefreshKey(k => k + 1)}
        />
      )}
      {deletingProduct && (
        <DeleteProductModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onDeleted={() => setRefreshKey(k => k + 1)}
        />
      )}
      {adjustingProduct && (
        <StockAdjustModal
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onAdjusted={() => setRefreshKey(k => k + 1)}
        />
      )}

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <Boxes size={28} color="var(--brand-primary)" />
            Inventory & Serial Number Management
          </h1>
          <p>Real-time stock ledger, serial lifecycle tracking, valuation, and inter-branch transfers.</p>
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
            <div className="kpi-icon" style={{ background: 'rgba(37,99,235,0.12)', color: '#2563eb' }}>
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
            <div className="kpi-icon" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>
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
            <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
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
        {(['stock', 'serials', 'ledger', 'transfer', 'adjust'] as const).map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'stock' && `Current Stock Levels (${products.length})`}
            {tab === 'serials' && `Serial Master Tracker (${serials.length})`}
            {tab === 'ledger' && `Stock Ledger (${inventoryTransactions.length})`}
            {tab === 'transfer' && 'Stock Transfer'}
            {tab === 'adjust' && 'Adjustment & Damage'}
          </button>
        ))}
      </div>

      {/* ── TAB 1: CURRENT STOCK LEVELS ── */}
      {activeTab === 'stock' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
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
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '4px' }}>
              {categories.map(cat => {
                const count = cat === 'ALL'
                  ? products.length
                  : products.filter(p => isProductInCategory(p, cat)).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                      fontWeight: categoryFilter === cat ? 700 : 500
                    }}
                  >
                    <span>{cat}</span>
                    {count > 0 && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 5px',
                          borderRadius: '999px',
                          background: categoryFilter === cat ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.08)',
                          fontWeight: 700
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {isAdmin && (
            <div style={{
              background: 'rgba(37,99,235,0.06)',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.875rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Settings size={14} color="var(--brand-primary)" />
              <strong style={{ color: 'var(--brand-primary)' }}>Admin Mode Active</strong> — You can edit product details, manage stock, and delete products using the action buttons in each row.
            </div>
          )}

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
                  {isAdmin && <th style={{ textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p: Product) => {
                  const isLow = p.currentStock <= p.minStock;
                  const supplier = suppliers?.find((s: any) => s.id === p.supplierId);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          SKU: <strong>{p.sku}</strong> • Brand: {p.brand} {p.model}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px', fontSize: '0.72rem' }}>
                          {supplier && (
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
                              Supplier: {supplier.name}
                            </span>
                          )}
                          {p.warrantyPeriodMonths > 0 && (
                            <span style={{ color: '#0284c7' }}>
                              Warranty: {p.warrantyPeriodMonths} months
                            </span>
                          )}
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
                        <span style={{ fontWeight: '800', fontSize: '1rem', color: isLow ? '#ef4444' : '#10b981' }}>
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
                        {p.status === 'DISCONTINUED' && (
                          <div><span className="badge badge-warning" style={{ fontSize: '0.65rem', marginTop: '2px' }}>DISCONTINUED</span></div>
                        )}
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {/* Stock +/- quick buttons */}
                            <button
                              className="btn btn-sm"
                              title="Manage Stock"
                              onClick={() => setAdjustingProduct(p)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: 'rgba(16,185,129,0.1)',
                                color: '#10b981',
                                borderColor: 'rgba(16,185,129,0.3)',
                                fontSize: '0.72rem',
                                gap: '3px'
                              }}
                            >
                              <Package size={11} /> Stock
                            </button>
                            <button
                              className="btn btn-sm"
                              title="Edit Product"
                              onClick={() => setEditingProduct(p)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: 'rgba(37,99,235,0.1)',
                                color: 'var(--brand-primary)',
                                borderColor: 'rgba(37,99,235,0.3)',
                                fontSize: '0.72rem',
                                gap: '3px'
                              }}
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') && (
                              <button
                                className="btn btn-sm"
                                title="Delete Product"
                                onClick={() => setDeletingProduct(p)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  background: 'rgba(239,68,68,0.08)',
                                  color: '#ef4444',
                                  borderColor: 'rgba(239,68,68,0.25)',
                                  fontSize: '0.72rem',
                                  gap: '3px'
                                }}
                              >
                                <Trash2 size={11} /> Del
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: SERIAL MASTER TRACKER ── */}
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
              Total: <strong>{serials.length}</strong> | Available: <strong style={{ color: '#10b981' }}>{availableSerialsCount}</strong> | Sold: <strong>{serials.length - availableSerialsCount}</strong>
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
                {filteredSerials.map((s: ProductSerial) => {
                  const prod = products.find((p: Product) => p.id === s.productId);
                  const cust = customers.find((c: any) => c.id === s.customerId);
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '800', color: '#2563eb' }}>{s.serialNumber}</td>
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
                              <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 'bold' }}>(EMI Linked)</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#10b981', fontSize: '0.75rem' }}>In Stock (Available for Sale)</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.3rem' }}
                            title="Print Barcode Label"
                            onClick={() => { if (prod) setActiveBarcodeToPrint({ product: prod, serials: [s.serialNumber] }); }}
                          >
                            <Tag size={12} /> Label
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => setInspectingSerial(s)}
                          >
                            Lifecycle
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: STOCK LEDGER ── */}
      {activeTab === 'ledger' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Complete Perpetual Stock Movement Ledger</h3>
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
                {inventoryTransactions.map((t: any) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: '700', fontSize: '0.8rem' }}>{t.transactionNumber}</td>
                    <td>{t.date}</td>
                    <td>
                      <span className={`badge ${t.type === 'PURCHASE' || t.type === 'PURCHASE_IN' ? 'badge-success' : t.type === 'SALE' || t.type === 'SALE_OUT' ? 'badge-info' : 'badge-warning'}`}>
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

      {/* ── TAB 4: INTER-BRANCH TRANSFER ── */}
      {activeTab === 'transfer' && (
        <div className="erp-card" style={{ maxWidth: '600px', padding: '1.5rem', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRightLeft size={20} color="var(--brand-primary)" />
            Inter-Branch Stock Transfer
          </h3>
          <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Select Product to Move *</label>
              <select className="form-select" value={transferProdId} onChange={e => setTransferProdId(e.target.value)}>
                {products.map((p: Product) => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">From Branch *</label>
                <select className="form-select" value={transferFromBranch} onChange={e => setTransferFromBranch(e.target.value)}>
                  {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">To Branch *</label>
                <select className="form-select" value={transferToBranch} onChange={e => setTransferToBranch(e.target.value)}>
                  {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity to Transfer *</label>
              <input type="number" min="1" className="form-input" value={transferQty} onChange={e => setTransferQty(Number(e.target.value) || 1)} />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Numbers (Optional — comma-separated, if serialized)</label>
              <input type="text" className="form-input" placeholder="e.g. HP840-78192-BD, HP840-78193-BD" value={transferSerialsInput} onChange={e => setTransferSerialsInput(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
              <ArrowRightLeft size={16} /> Confirm Stock Transfer
            </button>
          </form>
        </div>
      )}

      {/* ── TAB 5: ADJUSTMENT & DAMAGE ── */}
      {activeTab === 'adjust' && (
        <div className="erp-card" style={{ maxWidth: '600px', padding: '1.5rem', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            Stock Adjustment & Damaged Stock Reconciliation
          </h3>
          <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Product to Adjust *</label>
              <select className="form-select" value={adjustProdId} onChange={e => setAdjustProdId(e.target.value)}>
                {products.map((p: Product) => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Change (negative for loss/damage, e.g. -1) *</label>
              <input type="number" className="form-input" value={adjustQtyDiff} onChange={e => setAdjustQtyDiff(Number(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Reason / Incident Report *</label>
              <input type="text" className="form-input" placeholder="e.g. Broken display during shipment or physical audit variance" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Numbers Involved (Optional — comma-separated)</label>
              <input type="text" className="form-input" placeholder="e.g. HP840-78192-BD" value={adjustSerialsInput} onChange={e => setAdjustSerialsInput(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-warning btn-lg" style={{ marginTop: '0.5rem' }}>
              Execute Adjustment
            </button>
          </form>
        </div>
      )}

      {/* ── Serial Lifecycle Modal ── */}
      {inspectingSerial && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <ShieldCheck size={20} color="var(--brand-primary)" />
                360° Serial Lifecycle: {inspectingSerial.serialNumber}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setInspectingSerial(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <div style={{ fontWeight: '700', fontSize: '1rem' }}>
                  {products.find((p: Product) => p.id === inspectingSerial.productId)?.name}
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
                <div><strong>Supplier:</strong> {suppliers.find((s: any) => s.id === inspectingSerial.supplierId)?.name || 'Direct Import'}</div>
                {inspectingSerial.status === 'SOLD' && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <div style={{ fontWeight: '700', color: 'var(--brand-primary)', marginBottom: '4px' }}>Customer & Warranty Records</div>
                    <div><strong>Invoice No:</strong> {inspectingSerial.saleInvoiceId}</div>
                    <div><strong>Customer:</strong> {customers.find((c: any) => c.id === inspectingSerial.customerId)?.name}</div>
                    <div><strong>Sale Date:</strong> {inspectingSerial.saleDate}</div>
                    <div><strong>Warranty Valid Until:</strong> {inspectingSerial.warrantyEndDate}</div>
                    {inspectingSerial.emiAccountId && (
                      <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>Sold through EMI Account: {inspectingSerial.emiAccountId}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setInspectingSerial(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
