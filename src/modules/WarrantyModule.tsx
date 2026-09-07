import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { ProductSerial, WarrantyClaim } from '../types';
import { ShieldCheck, Search, Plus, AlertTriangle, Check, X, RotateCcw } from 'lucide-react';

interface WarrantyModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const WarrantyModule: React.FC<WarrantyModuleProps> = ({ onNavigate }) => {
  const { serials, products, customers, warrantyClaims, submitWarrantyClaim, resolveWarrantyClaim } = useERP();
  const [activeTab, setActiveTab] = useState<'warranties' | 'claims'>('warranties');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Claim Form State
  const [claimSerial, setClaimSerial] = useState('');
  const [claimIssue, setClaimIssue] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Serialized sold items with warranties
  const soldSerials = serials.filter(s => s.status === 'SOLD' && s.warrantyEndDate);

  const filteredSerials = soldSerials.filter(s => {
    const q = searchQuery.toLowerCase();
    const prod = products.find(p => p.id === s.productId);
    const cust = customers.find(c => c.id === s.customerId);
    return s.serialNumber.toLowerCase().includes(q) ||
           (prod && prod.name.toLowerCase().includes(q)) ||
           (cust && cust.name.toLowerCase().includes(q));
  });

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ser = serials.find(s => s.serialNumber.toLowerCase() === claimSerial.trim().toLowerCase());
    if (!ser) {
      alert('Serial number not found in system!');
      return;
    }
    const prod = products.find(p => p.id === ser.productId);
    const cust = customers.find(c => c.id === ser.customerId);

    submitWarrantyClaim({
      serialNumber: ser.serialNumber,
      productName: prod?.name || 'Product',
      customerId: ser.customerId || 'cust-1',
      customerName: cust?.name || 'Retail Client',
      customerPhone: cust?.phone || 'N/A',
      invoiceNumber: ser.saleInvoiceId || 'INV-MANUAL',
      issueDescription: claimIssue
    });

    setShowClaimModal(false);
    setClaimSerial('');
    setClaimIssue('');
    setActiveTab('claims');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <ShieldCheck size={28} color="var(--brand-primary)" />
            Warranty & RMA Claim Management
          </h1>
          <p>
            Track device serial warranties, active validity periods, customer RMA claims, and replacement workflows.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowClaimModal(true)}>
          <Plus size={16} /> File New Warranty Claim
        </button>
      </div>

      <div className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'warranties' ? 'active' : ''}`}
          onClick={() => setActiveTab('warranties')}
        >
          Sold Units Warranty Status ({soldSerials.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          RMA Claims Log ({warrantyClaims.length})
        </button>
      </div>

      {activeTab === 'warranties' ? (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          <div style={{ position: 'relative', width: '320px', marginBottom: '1rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Serial, Customer, Model..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Product Model</th>
                  <th>Customer Name & Phone</th>
                  <th>Sale Date</th>
                  <th>Warranty Expiry</th>
                  <th style={{ textAlign: 'center' }}>Validity</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSerials.map(s => {
                  const prod = products.find(p => p.id === s.productId);
                  const cust = customers.find(c => c.id === s.customerId);
                  const isExpired = s.warrantyEndDate ? s.warrantyEndDate < today : false;

                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '800', color: 'var(--brand-primary)' }}>{s.serialNumber}</td>
                      <td>{prod?.name}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{cust?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cust?.phone}</div>
                      </td>
                      <td>{s.saleDate}</td>
                      <td><strong>{s.warrantyEndDate}</strong></td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}>
                          {isExpired ? 'EXPIRED' : 'ACTIVE WARRANTY'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setClaimSerial(s.serialNumber);
                            setShowClaimModal(true);
                          }}
                        >
                          File Claim
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
            Warranty RMA Claims Directory
          </h3>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Claim #</th>
                  <th>Serial Number</th>
                  <th>Customer</th>
                  <th>Issue Description</th>
                  <th>Claim Date</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {warrantyClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No active RMA claims logged.
                    </td>
                  </tr>
                ) : (
                  warrantyClaims.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>{c.claimNumber}</td>
                      <td style={{ fontWeight: 'bold' }}>{c.serialNumber}</td>
                      <td>{c.customerName} ({c.customerPhone})</td>
                      <td>{c.issueDescription}</td>
                      <td>{c.claimDate}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${c.status === 'APPROVED_REPLACE' ? 'badge-success' : 'badge-warning'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => resolveWarrantyClaim(c.id, 'APPROVED_REPLACE', 'Replaced with brand new unit under authorized distributor warranty')}
                        >
                          Resolve Claim
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Submit Claim */}
      {showClaimModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <ShieldCheck size={20} color="var(--brand-primary)" />
                File Warranty RMA Claim
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowClaimModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Physical Serial Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. HP840-77901-BD"
                    value={claimSerial}
                    onChange={e => setClaimSerial(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Defect / Issue Details *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe problem (e.g. display flickering, keyboard key malfunction)..."
                    value={claimIssue}
                    onChange={e => setClaimIssue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowClaimModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Register Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
