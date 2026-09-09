import React, { useState } from 'react';
import { useERP } from '../../services/erpStore';
import { 
  ShieldCheck, Search, Edit2, Trash2, CheckCircle2, 
  AlertTriangle, Filter, Eye, RefreshCw, X, Save, 
  Receipt, CreditCard, Package, ShoppingCart, RotateCcw, 
  Users, Building, Wrench, Shield, DollarSign, UserCheck, 
  Layers, ChevronRight, FileText, Lock
} from 'lucide-react';
import { 
  Sale, EMIAccount, Product, Purchase, ProductReturn, 
  Customer, Supplier, ServiceJob, WarrantyClaim, Expense, 
  User, Branch, FinancialAccount 
} from '../../types';

export type MasterEntityType = 
  | 'sales' 
  | 'emi' 
  | 'products' 
  | 'purchases' 
  | 'returns' 
  | 'customers' 
  | 'suppliers' 
  | 'services' 
  | 'warranty' 
  | 'expenses' 
  | 'users' 
  | 'branches';

interface MasterEntityHubProps {
  initialEntity?: MasterEntityType;
  onClose?: () => void;
  isModal?: boolean;
}

export const MasterEntityHub: React.FC<MasterEntityHubProps> = ({ 
  initialEntity = 'sales', 
  onClose,
  isModal = false 
}) => {
  const {
    currentUser,
    sales, updateSale, deleteSale,
    emiAccounts, updateEMIAccount, deleteEMIAccount,
    products, updateProduct, deleteProduct,
    purchases, updatePurchase, deletePurchase,
    returns, updateReturn, deleteReturn,
    customers, updateCustomer, deleteCustomer,
    suppliers, updateSupplier, deleteSupplier,
    services, updateServiceJob, deleteServiceJob,
    warrantyClaims, updateWarrantyClaim, deleteWarrantyClaim,
    expenses, updateExpense, deleteExpense,
    users, updateUser, deleteEmployee,
    branches, updateBranch, deleteBranch,
    refreshFromDatabase, addToast
  } = useERP();

  const [selectedEntity, setSelectedEntity] = useState<MasterEntityType>(initialEntity);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<{ type: MasterEntityType; data: any } | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [isRawJsonMode, setIsRawJsonMode] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const entityDefinitions: { id: MasterEntityType; label: string; count: number; icon: any; color: string }[] = [
    { id: 'sales', label: 'Sales & Invoices', count: sales.length, icon: Receipt, color: '#3b82f6' },
    { id: 'emi', label: 'Laptop EMI Accounts', count: emiAccounts.length, icon: CreditCard, color: '#8b5cf6' },
    { id: 'products', label: 'Product Catalog & Stock', count: products.length, icon: Package, color: '#10b981' },
    { id: 'purchases', label: 'Purchases Inflow', count: purchases.length, icon: ShoppingCart, color: '#f59e0b' },
    { id: 'returns', label: 'Returns & RMA', count: returns.length, icon: RotateCcw, color: '#ec4899' },
    { id: 'customers', label: 'Customer CRM', count: customers.length, icon: Users, color: '#06b6d4' },
    { id: 'suppliers', label: 'Suppliers & Vendors', count: suppliers.length, icon: Building, color: '#6366f1' },
    { id: 'services', label: 'Service & Repairs', count: services.length, icon: Wrench, color: '#eab308' },
    { id: 'warranty', label: 'Warranty Claims', count: warrantyClaims.length, icon: Shield, color: '#14b8a6' },
    { id: 'expenses', label: 'Operating Expenses', count: expenses.length, icon: DollarSign, color: '#ef4444' },
    { id: 'users', label: 'Employees & Users', count: users.length, icon: UserCheck, color: '#64748b' },
    { id: 'branches', label: 'Branches & Stores', count: branches.length, icon: Layers, color: '#0ea5e9' }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshFromDatabase();
    setIsRefreshing(false);
    addToast('info', 'Data Synchronized', 'Master entity records synced with database.');
  };

  // Filter records based on selected entity & search query
  const getFilteredRecords = () => {
    const q = searchQuery.toLowerCase().trim();
    let records: any[] = [];

    switch (selectedEntity) {
      case 'sales':
        records = sales;
        break;
      case 'emi':
        records = emiAccounts;
        break;
      case 'products':
        records = products;
        break;
      case 'purchases':
        records = purchases;
        break;
      case 'returns':
        records = returns;
        break;
      case 'customers':
        records = customers;
        break;
      case 'suppliers':
        records = suppliers;
        break;
      case 'services':
        records = services;
        break;
      case 'warranty':
        records = warrantyClaims;
        break;
      case 'expenses':
        records = expenses;
        break;
      case 'users':
        records = users;
        break;
      case 'branches':
        records = branches;
        break;
      default:
        records = [];
    }

    if (!q) return records;

    return records.filter(item => {
      const str = JSON.stringify(item).toLowerCase();
      return str.includes(q);
    });
  };

  const filteredRecords = getFilteredRecords();

  const handleOpenEdit = (record: any) => {
    setEditingRecord({ type: selectedEntity, data: record });
    setEditFormData({ ...record });
    setRawJsonText(JSON.stringify(record, null, 2));
    setIsRawJsonMode(false);
  };

  const handleDelete = async (record: any) => {
    const recordLabel = record.invoiceNumber || record.accountNumber || record.name || record.claimNumber || record.voucherNumber || record.id;
    if (!window.confirm(`⚠️ [SUPER ADMIN MASTER ACTION]\nAre you absolutely sure you want to permanently delete this ${selectedEntity.toUpperCase()} record?\n\nIdentifier: ${recordLabel}\n\nThis action cannot be undone and will be logged in system audit logs.`)) {
      return;
    }

    try {
      let res: { success: boolean; error?: string } = { success: false };
      switch (selectedEntity) {
        case 'sales':
          res = await deleteSale(record.id);
          break;
        case 'emi':
          res = await deleteEMIAccount(record.id);
          break;
        case 'products':
          res = await deleteProduct(record.id);
          break;
        case 'purchases':
          res = await deletePurchase(record.id);
          break;
        case 'returns':
          res = await deleteReturn(record.id);
          break;
        case 'customers':
          res = await deleteCustomer(record.id);
          break;
        case 'suppliers':
          res = await deleteSupplier(record.id);
          break;
        case 'services':
          res = await deleteServiceJob(record.id);
          break;
        case 'warranty':
          res = await deleteWarrantyClaim(record.id);
          break;
        case 'expenses':
          res = await deleteExpense(record.id);
          break;
        case 'users':
          res = await deleteEmployee(record.id);
          break;
        case 'branches':
          res = await deleteBranch(record.id);
          break;
      }
      if (!res.success && res.error) {
        alert(`Error deleting record: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSaving(true);

    try {
      let payloadToSave: any = editFormData;
      if (isRawJsonMode) {
        try {
          payloadToSave = JSON.parse(rawJsonText);
        } catch (jsonErr: any) {
          alert(`Invalid JSON format: ${jsonErr.message}`);
          setIsSaving(false);
          return;
        }
      }

      let res: { success: boolean; error?: string } = { success: false };
      const id = editingRecord.data.id;

      switch (editingRecord.type) {
        case 'sales':
          res = await updateSale(id, payloadToSave);
          break;
        case 'emi':
          res = await updateEMIAccount(id, payloadToSave);
          break;
        case 'products':
          res = await updateProduct(payloadToSave);
          break;
        case 'purchases':
          res = await updatePurchase(id, payloadToSave);
          break;
        case 'returns':
          res = await updateReturn(id, payloadToSave);
          break;
        case 'customers':
          res = await updateCustomer(payloadToSave);
          break;
        case 'suppliers':
          res = await updateSupplier(id, payloadToSave);
          break;
        case 'services':
          res = await updateServiceJob(id, payloadToSave);
          break;
        case 'warranty':
          res = await updateWarrantyClaim(id, payloadToSave);
          break;
        case 'expenses':
          res = await updateExpense(id, payloadToSave);
          break;
        case 'users':
          res = await updateUser(payloadToSave);
          break;
        case 'branches':
          res = await updateBranch(payloadToSave);
          break;
      }

      if (res.success) {
        setEditingRecord(null);
      } else if (res.error) {
        alert(`Save failed: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const containerStyle: React.CSSProperties = isModal
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%'
      };

  const innerStyle: React.CSSProperties = isModal
    ? {
        background: 'var(--bg-surface, #1e293b)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: '12px',
        width: '95vw',
        maxWidth: '1360px',
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%'
      };

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        {/* Top Super Admin Banner */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Super Admin Master Entity Hub
                </h2>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.4)'
                }}>
                  OMNIPOTENT MASTER EDIT & DELETE
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Full system control: modify, override, reconcile, or purge records across all 20 modules with live PostgreSQL synchronization.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin-animation' : ''} />
              {isRefreshing ? 'Syncing...' : 'Sync Database'}
            </button>
            {isModal && onClose && (
              <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ color: '#fff' }}>
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Entity Selector Pills Strip */}
        <div style={{
          padding: '0.75rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto'
        }}>
          {entityDefinitions.map(def => {
            const Icon = def.icon;
            const isSelected = selectedEntity === def.id;
            return (
              <button
                key={def.id}
                onClick={() => setSelectedEntity(def.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  background: isSelected ? def.color : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${isSelected ? def.color : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{def.label}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.1)',
                  fontWeight: 700
                }}>
                  {def.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Actions Filter Bar */}
        <div style={{
          padding: '0.85rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '460px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px', width: '100%', fontSize: '0.875rem' }}
              placeholder={`Search in ${selectedEntity.toUpperCase()} (by ID, Name, Phone, Code, Ref, etc.)...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredRecords.length}</strong> of {entityDefinitions.find(d => d.id === selectedEntity)?.count} records
          </div>
        </div>

        {/* Main Entity Data Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isModal ? '1rem 1.5rem' : '0' }}>
          <div className="table-container" style={{ maxHeight: isModal ? 'calc(92vh - 250px)' : '600px', overflowY: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Identifier / Code</th>
                  <th>Primary Name / Title</th>
                  <th>Secondary Info</th>
                  <th>Amounts / Financials</th>
                  <th style={{ textAlign: 'center' }}>Status / Mode</th>
                  <th style={{ textAlign: 'center', width: '140px' }}>Super Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      No {selectedEntity.toUpperCase()} records found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item, idx) => {
                    const id = item.id;
                    const code = item.invoiceNumber || item.accountNumber || item.sku || item.voucherNumber || item.returnNumber || item.jobNumber || item.claimNumber || item.code || id.slice(0, 10);
                    const name = item.customerName || item.supplierName || item.productName || item.name || item.deviceModel || item.category || 'Record #' + (idx + 1);
                    const secondary = item.customerPhone || item.phone || item.supplierPhone || item.brand || item.email || item.reason || item.description || (item.date ? new Date(item.date).toLocaleDateString() : '');
                    const amount = item.grandTotal !== undefined ? `Total: ৳${Number(item.grandTotal).toLocaleString()}`
                      : item.principal !== undefined ? `Principal: ৳${Number(item.principal).toLocaleString()} (Rem: ৳${Number(item.remainingBalance || 0).toLocaleString()})`
                      : item.total !== undefined ? `৳${Number(item.total).toLocaleString()}`
                      : item.amount !== undefined ? `৳${Number(item.amount).toLocaleString()}`
                      : item.retailPrice !== undefined ? `Price: ৳${Number(item.retailPrice).toLocaleString()}`
                      : item.balance !== undefined ? `Bal: ৳${Number(item.balance).toLocaleString()}`
                      : item.currentBalance !== undefined ? `Due: ৳${Number(item.currentBalance).toLocaleString()}`
                      : '—';
                    const status = item.status || (item.active !== undefined ? (item.active ? 'ACTIVE' : 'INACTIVE') : 'ACTIVE');

                    return (
                      <tr key={id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'monospace' }}>
                          {code}
                        </td>
                        <td style={{ fontWeight: 600 }}>{name}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{secondary}</td>
                        <td style={{ fontWeight: 600 }}>{amount}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${status === 'ACTIVE' || status === 'COMPLETED' || status === 'RESOLVED' ? 'badge-success' : status === 'OVERDUE' || status === 'VOID' || status === 'DEFAULTED' ? 'badge-danger' : 'badge-neutral'}`}>
                            {status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEdit(item)}
                              title="Super Admin Master Edit"
                              style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleDelete(item)}
                              title="Super Admin Master Delete"
                              style={{ padding: '0.25rem 0.5rem', color: '#ef4444' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Master Record Edit Modal */}
        {editingRecord && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}>
            <div style={{
              background: 'var(--bg-card, #1e293b)',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              width: '90vw',
              maxWidth: '850px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}>
              {/* Header */}
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(59, 130, 246, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Edit2 size={20} color="#3b82f6" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                      Super Admin Record Editor — {editingRecord.type.toUpperCase()}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {editingRecord.data.id}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${isRawJsonMode ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setIsRawJsonMode(!isRawJsonMode)}
                  >
                    {isRawJsonMode ? 'Form Mode' : 'Raw JSON Mode'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => setEditingRecord(null)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
                  {isRawJsonMode ? (
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Direct JSON Editor: You can modify any property directly. Changes will be validated and applied.
                      </p>
                      <textarea
                        className="form-input"
                        rows={16}
                        style={{ fontFamily: 'monospace', fontSize: '0.85rem', width: '100%', whiteSpace: 'pre' }}
                        value={rawJsonText}
                        onChange={e => setRawJsonText(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {Object.keys(editFormData).map(key => {
                        // Skip complex array fields in simple form mode, or render as text
                        const val = editFormData[key];
                        const isObject = typeof val === 'object' && val !== null;
                        if (isObject) return null; // Can be edited via JSON mode

                        return (
                          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                              {key.replace(/([A-Z])/g, ' $1')}
                            </label>
                            <input
                              type={typeof val === 'number' ? 'number' : 'text'}
                              className="form-input"
                              disabled={key === 'id'}
                              value={val !== undefined && val !== null ? val : ''}
                              onChange={e => {
                                const newV = typeof val === 'number' ? Number(e.target.value) : e.target.value;
                                setEditFormData(prev => ({ ...prev, [key]: newV }));
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  background: 'rgba(0,0,0,0.2)'
                }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditingRecord(null)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSaving}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving Updates...' : 'Save & Overwrite Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
