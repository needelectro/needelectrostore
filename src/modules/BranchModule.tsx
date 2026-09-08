import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Branch } from '../types';
import { 
  GitFork, Building2, Warehouse, MapPin, Phone, Mail, 
  ArrowRightLeft, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, ShieldCheck
} from 'lucide-react';

interface BranchModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const BranchModule: React.FC<BranchModuleProps> = ({ onNavigate }) => {
  const { branches, selectedBranch, setSelectedBranchId, addBranch, updateBranch, deleteBranch } = useERP();

  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isWarehouse, setIsWarehouse] = useState(false);
  const [active, setActive] = useState(true);

  // Delete State
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setEmail('');
    setIsWarehouse(false);
    setActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch(b);
    setName(b.name);
    setCode(b.code);
    setAddress(b.address || '');
    setPhone(b.phone || '');
    setEmail(b.email || '');
    setIsWarehouse(Boolean(b.isWarehouse));
    setActive(b.active !== undefined ? b.active : true);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Branch name and code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBranch) {
        const res = await updateBranch({
          ...editingBranch,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          isWarehouse,
          active,
        });
        if (res.success) {
          setShowModal(false);
        }
      } else {
        const res = await addBranch({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          isWarehouse,
          active,
        });
        if (res.success) {
          setShowModal(false);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (b: Branch) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete branch '${b.name}' (${b.code})?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingBranchId(b.id);
    try {
      await deleteBranch(b.id);
    } finally {
      setDeletingBranchId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <GitFork size={28} color="var(--brand-primary)" />
            Multi-Branch & Warehouse Hubs
          </h1>
          <p>
            Configure commercial retail showrooms, regional distribution points, and central warehousing hubs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Add New Branch
          </button>
          {branches.length > 1 && (
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('inventory')}>
              <ArrowRightLeft size={16} /> Inter-Branch Stock Transfers
            </button>
          )}
        </div>
      </div>

      {/* Empty State when no branches exist */}
      {branches.length === 0 ? (
        <div className="erp-card" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--brand-primary-light, rgba(37, 99, 235, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <Building2 size={32} color="var(--brand-primary)" />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            No Branches Configured Yet
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            Get started by creating your primary showroom, retail store location, or central warehouse hub. 
            Admins have full control to add, edit, or remove branches at any time.
          </p>
          <button className="btn btn-primary" onClick={handleOpenAdd} style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}>
            <Plus size={18} /> Create First Branch
          </button>
        </div>
      ) : (
        /* Branch Grid Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {branches.map(b => {
            const isCurrent = b.id === selectedBranch.id;
            const isDeleting = deletingBranchId === b.id;

            return (
              <div 
                key={b.id} 
                className="erp-card" 
                style={{
                  padding: '1.5rem',
                  borderTop: `4px solid ${isCurrent ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isDeleting ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Badge Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className="badge badge-info" style={{ fontWeight: 700 }}>{b.code}</span>
                      <span className={`badge ${b.active ? 'badge-success' : 'badge-danger'}`}>
                        {b.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <span className={`badge ${b.isWarehouse ? 'badge-warning' : 'badge-primary'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {b.isWarehouse ? <Warehouse size={13} /> : <Building2 size={13} />}
                      {b.isWarehouse ? 'Warehouse' : 'Showroom'}
                    </span>
                  </div>

                  {/* Branch Name */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    {b.name}
                  </h3>

                  {/* Contact & Location Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <MapPin size={15} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{b.address || 'No physical address specified'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      <span>{b.phone || 'No phone number'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      <span>{b.email || 'No email registered'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ 
                  marginTop: '1.25rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid var(--border-color)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    {isCurrent ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Active Session
                      </span>
                    ) : (
                      <button 
                        className="btn btn-ghost btn-xs"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setSelectedBranchId(b.id)}
                      >
                        Switch to this
                      </button>
                    )}
                  </div>

                  {/* Admin Management Actions: Edit & Delete */}
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button 
                      className="btn btn-secondary btn-xs" 
                      title="Edit Branch Location"
                      onClick={() => handleOpenEdit(b)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.6rem' }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-xs" 
                      title="Delete Branch Location"
                      onClick={() => handleDelete(b)}
                      disabled={isDeleting}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.6rem' }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT BRANCH MODAL */}
      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '540px', width: '95%' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="var(--brand-primary)" />
                {editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Add New Branch Location'}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Branch / Hub Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Moulvibazar Main Showroom"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Branch Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. MB-MAIN"
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Facility Classification</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.75rem 1rem',
                      border: `1.5px solid ${!isWarehouse ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: !isWarehouse ? 'var(--brand-primary-light, rgba(37, 99, 235, 0.05))' : 'var(--bg-card)',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="branchType" 
                        checked={!isWarehouse} 
                        onChange={() => setIsWarehouse(false)} 
                      />
                      <Building2 size={16} color="var(--brand-primary)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Retail Showroom</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Commercial POS store</div>
                      </div>
                    </label>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.75rem 1rem',
                      border: `1.5px solid ${isWarehouse ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: isWarehouse ? 'var(--brand-primary-light, rgba(37, 99, 235, 0.05))' : 'var(--bg-card)',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name="branchType" 
                        checked={isWarehouse} 
                        onChange={() => setIsWarehouse(true)} 
                      />
                      <Warehouse size={16} color="var(--brand-primary)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Central Warehouse</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Inventory & Service Hub</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Street Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shop#5, MR Plaza, Kusumbag, Moulvibazar"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 01733-983752"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. branch@needelectro.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={e => setActive(e.target.checked)}
                    />
                    <span>Active & Operational Status</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
