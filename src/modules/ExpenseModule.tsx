import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { ExpenseCategory, PaymentMethod, Expense } from '../types';
import { Wallet, Plus, Search, Calendar, Tag, DollarSign, X, Edit2, Trash2, Save, ShieldCheck, Loader2 } from 'lucide-react';

interface ExpenseModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const ExpenseModule: React.FC<ExpenseModuleProps> = ({ onNavigate }) => {
  const { expenses, createExpense, updateExpense, deleteExpense, selectedBranch, currentUser, expenseCategoriesConfig } = useERP();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('Shop Assets & Equipment');
  const [amount, setAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories: ExpenseCategory[] = Array.from(
    new Set([
      'Shop Assets & Equipment',
      'Office Supplies & Hospitality',
      'Marketing & Advertising',
      'Internet & Communications',
      'Office Rent',
      'Electricity & Utility',
      'Staff Salaries & Commission',
      'Transport & Courier',
      'Maintenance & Repairs',
      'Other Operating Expenses',
      'Office Supplies & Snacks',
      'Marketing',
      'Other',
      ...(expenseCategoriesConfig || []).map(c => c.name),
      ...expenses.map(e => e.category),
    ])
  ).filter(Boolean) as ExpenseCategory[];

  const filterTabs = ['ALL', ...Array.from(
    new Set([
      'Shop Assets & Equipment',
      'Office Supplies & Hospitality',
      'Marketing & Advertising',
      'Internet & Communications',
      'Other Operating Expenses',
      ...expenses.map(e => e.category)
    ])
  ).filter(Boolean)];

  const filteredExpenses = expenses.filter(e => {
    if ((e as any).status === 'CANCELLED') return false;
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = e.description.toLowerCase().includes(q) ||
                         e.voucherNumber.toLowerCase().includes(q) ||
                         e.category.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingExpense) return;
    if (amount <= 0 || !description.trim()) {
      alert('Please enter amount and description.');
      return;
    }

    setIsSubmittingExpense(true);
    try {
      await createExpense({
        category,
        amount,
        date,
        paymentMethod,
        branchId: selectedBranch.id,
        description: description.trim()
      });

      setShowAddModal(false);
      setDescription('');
      setAmount(1000);
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    setIsSaving(true);
    try {
      await updateExpense(editingExpense.id, {
        category: editForm.category,
        amount: Number(editForm.amount) || 0,
        date: editForm.date,
        paymentMethod: editForm.paymentMethod,
        description: editForm.description,
      });
      setEditingExpense(null);
    } catch (err: any) {
      alert('Failed to update expense: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <Wallet size={28} color="#ef4444" />
            Operating Expense & Overhead Management
          </h1>
          <p>
            Track showroom rent, DESCO electricity, staff allowances, transport, and administrative expenses.
          </p>
        </div>

        <button className="btn btn-danger btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Record Expense Voucher
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Filtered Expenses</span>
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>৳{totalExpenseAmount.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Across {filteredExpenses.length} expense vouchers
          </div>
        </div>
      </div>

      <div className="erp-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search expenses..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', flexWrap: 'wrap' }}>
            {filterTabs.map(c => (
              <button
                key={c}
                className={`btn btn-sm ${categoryFilter === c ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Voucher #</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Payment Mode</th>
                <th>Recorded By</th>
                <th style={{ textAlign: 'right' }}>Amount (৳)</th>
                <th style={{ textAlign: 'center', width: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(exp => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>{exp.voucherNumber}</td>
                  <td>{exp.date}</td>
                  <td><span className="badge badge-neutral">{exp.category}</span></td>
                  <td>{exp.description}</td>
                  <td>{exp.paymentMethod}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.createdBy}</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#ef4444' }}>
                    ৳{exp.amount.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEditingExpense(exp);
                          setEditForm({ ...exp });
                        }}
                        title="Edit Expense"
                        style={{ padding: '0.2rem 0.45rem' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={async () => {
                          if (window.confirm(`⚠️ Are you sure you want to delete expense voucher ${exp.voucherNumber} (${exp.category} - ৳${exp.amount})?`)) {
                            await deleteExpense(exp.id);
                          }
                        }}
                        title="Delete Expense"
                        style={{ padding: '0.2rem 0.45rem', color: '#ef4444' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add Expense */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <Wallet size={20} color="#ef4444" />
                Record New Expense Voucher
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Expense Category *</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (৳) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Channel</label>
                    <select
                      className="form-select"
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    >
                      <option value="Cash">Cash in Hand</option>
                      <option value="bKash">bKash Merchant</option>
                      <option value="Nagad">Nagad Merchant</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Purpose *</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Provide details of the expenditure..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmittingExpense}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-danger btn-sm"
                  disabled={isSubmittingExpense}
                >
                  {isSubmittingExpense ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Recording...
                    </>
                  ) : (
                    'Record Expense'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Expense (Super Admin / Manager) */}
      {editingExpense && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <ShieldCheck size={20} color="var(--brand-primary)" />
                Edit Expense Voucher ({editingExpense.voucherNumber})
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingExpense(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Expense Category *</label>
                  <select
                    className="form-select"
                    value={editForm.category || ''}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (৳) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editForm.amount || 0}
                      onChange={e => setEditForm({ ...editForm, amount: Number(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Channel</label>
                    <select
                      className="form-select"
                      value={editForm.paymentMethod || 'Cash'}
                      onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    >
                      <option value="Cash">Cash in Hand</option>
                      <option value="bKash">bKash Merchant</option>
                      <option value="Nagad">Nagad Merchant</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editForm.date || ''}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Purpose *</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={editForm.description || ''}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingExpense(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Update Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
