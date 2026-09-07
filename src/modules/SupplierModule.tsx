import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Truck, Plus, Search, Phone, Mail, MapPin, X } from 'lucide-react';

interface SupplierModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const SupplierModule: React.FC<SupplierModuleProps> = ({ onNavigate }) => {
  const { suppliers, createSupplier } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Laptops & Computer Components');

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  const totalPayables = suppliers.reduce((sum, s) => sum + s.currentPayable, 0);

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) {
      alert('Supplier Name and Company are required.');
      return;
    }

    createSupplier({
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || 'Dhaka, Bangladesh',
      category,
      openingBalance: 0
    });

    setShowAddModal(false);
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setAddress('');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', width: '320px' }}>
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
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{s.company}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Partner</div>
                  </td>
                  <td style={{ fontWeight: '600' }}>{s.name}</td>
                  <td><span className="badge badge-neutral">{s.category}</span></td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <div>{s.phone}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{s.email}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{s.address}</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: s.currentPayable > 0 ? '#ef4444' : '#10b981' }}>
                    ৳{s.currentPayable.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => onNavigate('ledgers')}
                    >
                      View Ledger
                    </button>
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
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Smart Technologies BD Ltd"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Person *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Tanvir Alam (Corporate Manager)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
    </div>
  );
};
