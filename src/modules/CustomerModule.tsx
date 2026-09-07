import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Customer } from '../types';
import { 
  Users, Search, Plus, Phone, Mail, MapPin, 
  CreditCard, Calendar, Wrench, ShieldCheck, 
  FileText, ArrowRight, X, Check, Printer 
} from 'lucide-react';

interface CustomerModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const CustomerModule: React.FC<CustomerModuleProps> = ({ onNavigate }) => {
  const { customers, sales, emiAccounts, services, createCustomer, updateCustomer, ledgerEntries, settings } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState(false);

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
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
                  onClick={() => setSelectedCustomerId(c.id)}
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
                  {hasEmi && (
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                      EMI Client
                    </span>
                  )}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => alert(`Customer financial statement printed for ${selectedCustomer.name}`)}
                >
                  <Printer size={15} /> Print Ledger Statement
                </button>
              </div>

              {/* Bio Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
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
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
    </div>
  );
};
