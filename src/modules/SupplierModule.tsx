import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Supplier } from '../types';
import { Truck, Plus, Search, Phone, Mail, MapPin, X, Edit2, Trash2, ShieldCheck } from 'lucide-react';

interface SupplierModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const SupplierModule: React.FC<SupplierModuleProps> = ({ onNavigate }) => {
  const { suppliers, createSupplier, updateSupplier, deleteSupplier, currentUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Form
  const [company, setCompany] = useState('');
  const [code, setCode] = useState('');
  const [representative, setRepresentative] = useState('');
  const [contactBy, setContactBy] = useState('Amdadur');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Laptop');

  const filteredSuppliers = suppliers.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.representative || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.contactBy || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.phone || '').includes(searchQuery)
  );

  const totalPayables = suppliers.reduce((sum, s) => sum + s.currentPayable, 0);

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      alert('Company Name is required.');
      return;
    }

    const rep = representative.trim() || 'Unknown';
    createSupplier({
      name: rep,
      company: company.trim(),
      code: code.trim().toUpperCase(),
      representative: rep,
      contactBy: contactBy.trim() || 'Amdadur',
      phone: phone.trim(),
      email: email.trim() || (code.trim() ? `${code.trim().toLowerCase()}@needelectro.com` : ''),
      address: address.trim() || 'Dhaka, Bangladesh',
      category,
      openingBalance: 0
    });

    setShowAddModal(false);
    setCompany('');
    setCode('');
    setRepresentative('');
    setContactBy('Amdadur');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setIsSaving(true);
    try {
      const res = await updateSupplier(editingSupplier.id, {
        name: editForm.representative || editForm.name,
        company: editForm.company,
        code: editForm.code,
        representative: editForm.representative || editForm.name,
        contactBy: editForm.contactBy,
        phone: editForm.phone,
        email: editForm.email,
        address: editForm.address,
        category: editForm.category,
      });
      if (res.success) {
        setEditingSupplier(null);
      } else {
        alert(res.error || 'Failed to update supplier');
      }
    } catch (err: any) {
      alert('Update failed: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSupplier = async (s: Supplier) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete supplier "${s.company}" (${s.name})?\n\nThis will remove the supplier profile from the ERP.`)) {
      return;
    }
    const res = await deleteSupplier(s.id);
    if (!res.success) {
      alert('Delete failed: ' + (res.error || 'Unknown error'));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <Truck size={28} color="var(--brand-primary)" />
            Supplier & Vendor Management
          </h1>
          <p>
            Official distributor accounts, supply categories, purchase history, and outstanding payables.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add New Supplier
        </button>
      </div>

      <div className="erp-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Suppliers by Company, Name..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.875rem' }}>
            Total Payables to Distributors: <strong style={{ color: '#ef4444', fontSize: '1.1rem' }}>৳{totalPayables.toLocaleString()}</strong>
          </div>
        </div>

        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Supplier Company</th>
                <th>Contact Representative</th>
                <th>Category</th>
                <th>Contact Info</th>
                <th>Address</th>
                <th style={{ textAlign: 'right' }}>Outstanding Payable (৳)</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{s.company || s.name}</div>
                      {s.code && (
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', fontWeight: 'bold' }}>
                          {s.code}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Wholesale Partner</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{s.representative || s.name}</div>
                    {s.contactBy && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        Contact by: <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{s.contactBy}</span>
                      </div>
                    )}
                  </td>
                  <td><span className="badge badge-neutral">{s.category}</span></td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: '600' }}>{s.phone}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.email}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', maxWidth: '240px' }}>{s.address}</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: s.currentPayable > 0 ? '#ef4444' : '#10b981' }}>
                    ৳{s.currentPayable.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNavigate('ledgers')}
                        style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem' }}
                      >
                        Ledger
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEditingSupplier(s);
                          setEditForm({ ...s });
                        }}
                        title="Edit Supplier"
                        style={{ padding: '0.2rem 0.45rem' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      {isSuperAdmin && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteSupplier(s)}
                          title="Super Admin Delete"
                          style={{ padding: '0.2rem 0.45rem', color: '#ef4444' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add Supplier */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <Truck size={20} color="var(--brand-primary)" />
                Register New Supplier Partner
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Green View Computer"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. GB, AT"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Representative</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Imran Hossain"
                      value={representative}
                      onChange={e => setRepresentative(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact By</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Amdadur"
                      value={contactBy}
                      onChange={e => setContactBy(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="017..."
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="sales@..."
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Distributor Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="Laptops & Computer Components">Laptops & Computer Components</option>
                    <option value="CCTV & Security Solutions">CCTV & Security Solutions</option>
                    <option value="Electrical Wiring, Switches & Breakers">Electrical Wiring, Switches & Breakers</option>
                    <option value="Networking & Wi-Fi Equipment">Networking & Wi-Fi Equipment</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Office Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. IDB Bhaban, Agargaon, Dhaka"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Supplier (Super Admin / Manager) */}
      {editingSupplier && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <ShieldCheck size={20} color="var(--brand-primary)" />
                Edit Supplier Record ({editingSupplier.company})
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingSupplier(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.company || ''}
                      onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.code || ''}
                      onChange={e => setEditForm({ ...editForm, code: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Representative</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.representative || editForm.name || ''}
                      onChange={e => setEditForm({ ...editForm, representative: e.target.value, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact By</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.contactBy || ''}
                      onChange={e => setEditForm({ ...editForm, contactBy: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.phone || ''}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={editForm.email || ''}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Distributor Category</label>
                  <select
                    className="form-select"
                    value={editForm.category || 'Laptops & Computer Components'}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    <option value="Laptops & Computer Components">Laptops & Computer Components</option>
                    <option value="CCTV & Security Solutions">CCTV & Security Solutions</option>
                    <option value="Electrical Wiring, Switches & Breakers">Electrical Wiring, Switches & Breakers</option>
                    <option value="Networking & Wi-Fi Equipment">Networking & Wi-Fi Equipment</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Office Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.address || ''}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingSupplier(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Update Supplier Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
