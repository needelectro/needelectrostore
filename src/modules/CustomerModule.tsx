import React, { useState, useEffect } from 'react';
import { useERP } from '../services/erpStore';
import { Customer } from '../types';
import { 
  Users, Search, Plus, Phone, Mail, MapPin, 
  CreditCard, Calendar, Wrench, ShieldCheck, 
  FileText, ArrowRight, X, Check, Printer,
  Edit2, Trash2
} from 'lucide-react';

interface CustomerModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
  initialCustomerId?: string;
}

export const CustomerModule: React.FC<CustomerModuleProps> = ({ onNavigate, initialCustomerId }) => {
  const { 
    customers, sales, emiAccounts, services, createCustomer, updateCustomer, 
    deleteCustomer, ledgerEntries, settings, currentUser, financialAccounts, collectCustomerDue 
  } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(() => {
    if (initialCustomerId) {
      const match = customers.find(c => c.id === initialCustomerId || c.customerId === initialCustomerId);
      if (match) return match.id;
      return initialCustomerId;
    }
    return customers[0]?.id || null;
  });

  useEffect(() => {
    if (initialCustomerId) {
      const match = customers.find(c => c.id === initialCustomerId || c.customerId === initialCustomerId);
      if (match) setSelectedCustomerId(match.id);
      else setSelectedCustomerId(initialCustomerId);
    }
  }, [initialCustomerId, customers]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [dueMethod, setDueMethod] = useState<any>('Cash');
  const [dueAccount, setDueAccount] = useState(financialAccounts[0]?.id || 'acc-1');
  const [dueRef, setDueRef] = useState('');
  const [dueNotes, setDueNotes] = useState('');
  const [isSubmittingDue, setIsSubmittingDue] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Add form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nid, setNid] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorNid, setGuarantorNid] = useState('');
  const [guarantorRelationship, setGuarantorRelationship] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery) || 
    c.customerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Customer 360 Records
  const customerSales = selectedCustomer ? sales.filter(s => s.customerId === selectedCustomer.id) : [];
  const customerEmi = selectedCustomer ? emiAccounts.filter(e => e.customerId === selectedCustomer.id) : [];
  const customerServices = selectedCustomer ? services.filter(srv => srv.customerId === selectedCustomer.id) : [];
  const customerLedger = selectedCustomer ? ledgerEntries.filter(l => l.partyId === selectedCustomer.id) : [];

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please enter Customer Name and Phone Number.');
      return;
    }

    const res = await createCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || 'Dhaka, Bangladesh',
      nid: nid.trim(),
      guarantor: guarantorName ? {
        name: guarantorName.trim(),
        relationship: guarantorRelationship || 'Relative',
        phone: guarantorPhone.trim(),
        nid: guarantorNid.trim(),
        address: ''
      } : undefined,
      creditLimit: 50000,
      notes: notes.trim() || undefined
    });

    if (res.success && res.customer) {
      setSelectedCustomerId(res.customer.id);
      setShowAddModal(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNid('');
      setGuarantorName('');
      setGuarantorPhone('');
      setGuarantorNid('');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSaving(true);
    try {
      const res = await updateCustomer({
        ...editingCustomer,
        ...editForm
      });
      if (res.success) {
        setEditingCustomer(null);
      } else {
        alert(res.error || 'Failed to update customer');
      }
    } catch (err: any) {
      alert('Update failed: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async (c: Customer) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete customer "${c.name}" (${c.phone})?\n\nThis will remove their profile.`)) {
      return;
    }
    const res = await deleteCustomer(c.id);
    if (!res.success) {
      alert('Delete failed: ' + (res.error || 'Unknown error'));
    } else {
      if (selectedCustomerId === c.id) {
        setSelectedCustomerId(customers.find(item => item.id !== c.id)?.id || null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <Users size={28} color="var(--brand-primary)" />
            Customer Relationship Management (CRM 360°)
          </h1>
          <p>
            Complete client profile with invoice history, active EMI installments, service history, and ledger accounts.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add New Customer
        </button>
      </div>

      {/* Main Split Layout: Customer List (Left) + 360° Profile (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.25rem' }}>
        {/* Left Column: Customer Directory */}
        <div className="erp-card" style={{ padding: '1.25rem', height: 'fit-content' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Name, Phone, ID..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '650px', overflowY: 'auto' }}>
            {filteredCustomers.map(c => {
              const isSelected = selectedCustomer?.id === c.id;
              const hasEmi = emiAccounts.some(e => e.customerId === c.id);

              return (
                <div
                  key={c.id}
                  className="erp-card erp-card-interactive"
                  onClick={() => {
                    setSelectedCustomerId(c.id);
                    onNavigate('customers', c.id);
                  }}
                  style={{
                    padding: '0.85rem 1rem',
                    background: isSelected ? 'var(--bg-active)' : 'var(--bg-card-muted)',
                    border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {c.phone} • {c.customerId}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {hasEmi && (
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                        EMI
                      </span>
                    )}
                    {isSuperAdmin && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(c);
                        }}
                        title="Super Admin Delete"
                        style={{ color: '#ef4444', padding: '0.2rem 0.35rem' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 360° Profile Card & Timeline */}
        {selectedCustomer ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Bio Card */}
            <div className="erp-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '800'
                  }}>
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{selectedCustomer.name}</h2>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      ID: <strong>{selectedCustomer.customerId}</strong> • Registered: {selectedCustomer.createdAt}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {Number(selectedCustomer.currentBalance) > 0 && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setDueAmount(Number(selectedCustomer.currentBalance));
                        setShowDueModal(true);
                      }}
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                    >
                      <CreditCard size={14} /> Collect Due (৳{Number(selectedCustomer.currentBalance).toLocaleString('en-IN')})
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditingCustomer(selectedCustomer);
                      setEditForm({ ...selectedCustomer });
                    }}
                  >
                    <Edit2 size={14} /> Edit Customer
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => alert(`Customer financial statement printed for ${selectedCustomer.name}`)}
                  >
                    <Printer size={15} /> Print Statement
                  </button>
                  {isSuperAdmin && (
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDeleteCustomer(selectedCustomer)}
                      title="Super Admin Permanent Delete"
                      style={{ color: '#ef4444', padding: '0.4rem 0.6rem' }}
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Bio Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                  <div style={{ fontWeight: '600' }}>{selectedCustomer.phone}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>National ID (NID):</span>
                  <div style={{ fontWeight: '600' }}>{selectedCustomer.nid || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Address:</span>
                  <div style={{ fontWeight: '600' }}>{selectedCustomer.address}</div>
                </div>

                {selectedCustomer.guarantor && (
                  <>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Guarantor Name:</span>
                      <div style={{ fontWeight: '600' }}>{selectedCustomer.guarantor.name} ({selectedCustomer.guarantor.relationship})</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Guarantor Phone:</span>
                      <div style={{ fontWeight: '600' }}>{selectedCustomer.guarantor.phone}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Guarantor NID:</span>
                      <div style={{ fontWeight: '600' }}>{selectedCustomer.guarantor.nid}</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Invoices History */}
            <div className="erp-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={18} color="var(--brand-primary)" />
                Purchase & Invoices History ({customerSales.length})
              </h3>

              {customerSales.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No invoices recorded yet.
                </div>
              ) : (
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Products</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th style={{ textAlign: 'right' }}>Paid</th>
                        <th style={{ textAlign: 'center' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerSales.map(s => (
                        <tr key={s.id} onClick={() => onNavigate('sales', s.id)} style={{ cursor: 'pointer' }}>
                          <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>{s.invoiceNumber}</td>
                          <td>{s.date}</td>
                          <td>{s.items.map(i => i.productName).join(', ')}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>৳{s.grandTotal.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', color: '#10b981' }}>৳{s.paidAmount.toLocaleString()}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${s.saleType === 'EMI' ? 'badge-warning' : 'badge-neutral'}`}>
                              {s.saleType}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Active & Past EMI Accounts */}
            <div className="erp-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={18} color="#f59e0b" />
                Laptop EMI Accounts ({customerEmi.length})
              </h3>

              {customerEmi.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No EMI accounts active for this customer.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {customerEmi.map(e => (
                    <div 
                      key={e.id}
                      className="erp-card erp-card-interactive"
                      onClick={() => onNavigate('emi', e.id)}
                      style={{ padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: '700' }}>{e.emiNumber} — {e.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Serial: {e.serialNumber} • Tenure: {e.durationMonths} Months
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', color: '#ef4444' }}>
                          Remaining: ৳{e.remainingBalance.toLocaleString()}
                        </div>
                        <span className="badge badge-success">{e.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="erp-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a customer on the left to view profile.
          </div>
        )}
      </div>

      {/* Modal: Add Customer */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-lg">
            <div className="modal-header">
              <div className="modal-title">
                <Users size={20} color="var(--brand-primary)" />
                Register New Customer (CRM)
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Customer Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Phone *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="01711-..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">National ID (NID)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="NID Number (Required for EMI)"
                    value={nid}
                    onChange={e => setNid(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Road, Sector, City"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', fontWeight: '700', fontSize: '0.85rem', color: 'var(--brand-primary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  Guarantor Details (Optional for cash sales, required for EMI):
                </div>

                <div className="form-group">
                  <label className="form-label">Guarantor Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Guarantor Full Name"
                    value={guarantorName}
                    onChange={e => setGuarantorName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Guarantor Relationship</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Uncle / Father / Colleague"
                    value={guarantorRelationship}
                    onChange={e => setGuarantorRelationship(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Guarantor Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="01819-..."
                    value={guarantorPhone}
                    onChange={e => setGuarantorPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Guarantor NID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Guarantor NID"
                    value={guarantorNid}
                    onChange={e => setGuarantorNid(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Customer (Super Admin / Manager) */}
      {editingCustomer && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <ShieldCheck size={20} color="var(--brand-primary)" />
                Edit Customer Record ({editingCustomer.customerId})
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingCustomer(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.phone || ''}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">National ID (NID)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.nid || ''}
                    onChange={e => setEditForm({ ...editForm, nid: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email || ''}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Credit Limit (৳)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.creditLimit || 0}
                    onChange={e => setEditForm({ ...editForm, creditLimit: Number(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.address || ''}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Internal Admin Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={editForm.notes || ''}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingCustomer(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  {isSaving ? 'Saving Changes...' : 'Update Customer Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Due Collection Modal */}
      {showDueModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowDueModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Collect Customer Due</h3>
              <button className="btn-close" onClick={() => setShowDueModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (dueAmount <= 0) {
                  alert('Please enter a valid payment amount.');
                  return;
                }
                setIsSubmittingDue(true);
                try {
                  const res = await collectCustomerDue(
                    selectedCustomer.id,
                    dueAmount,
                    dueMethod,
                    dueAccount,
                    dueRef || undefined,
                    dueNotes || undefined
                  );
                  if (res.success) {
                    setShowDueModal(false);
                    setDueRef('');
                    setDueNotes('');
                  }
                } finally {
                  setIsSubmittingDue(false);
                }
              }}
              className="modal-body"
            >
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedCustomer.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedCustomer.phone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Due Balance</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>
                    ৳{Number(selectedCustomer.currentBalance).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Payment Amount Collected (৳ BDT) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={dueAmount}
                  onChange={e => setDueAmount(Number(e.target.value))}
                  min={1}
                  max={Number(selectedCustomer.currentBalance)}
                  step="any"
                  required
                  style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Payment Channel *</label>
                <select
                  className="form-control"
                  value={dueMethod}
                  onChange={e => setDueMethod(e.target.value as any)}
                  required
                >
                  <option value="Cash">Cash Drawer</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Target Financial Account *</label>
                <select
                  className="form-control"
                  value={dueAccount}
                  onChange={e => setDueAccount(e.target.value)}
                  required
                >
                  {financialAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Reference / TrxID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. bKash TrxID or receipt ref"
                  value={dueRef}
                  onChange={e => setDueRef(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Collection Notes</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Optional notes"
                  value={dueNotes}
                  onChange={e => setDueNotes(e.target.value)}
                />
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDueModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmittingDue}>
                  {isSubmittingDue ? 'Processing...' : 'Record Payment & Reconcile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
