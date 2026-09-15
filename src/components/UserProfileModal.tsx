import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { 
  User, Mail, Phone, Building, Shield, Lock, 
  KeyRound, LogOut, X, CheckCircle, Clock, Smartphone
} from 'lucide-react';
import { ChangePasswordModal } from './auth/ChangePasswordModal';

interface UserProfileModalProps {
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
  const { currentUser, selectedBranch, lockSession, logout } = useERP();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
        <div 
          className="modal-content" 
          style={{ maxWidth: '480px', width: '92vw', padding: 0, overflow: 'hidden' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a, #0284c7)',
            padding: '1.5rem 1.25rem 1rem 1.25rem',
            position: 'relative',
            color: '#ffffff'
          }}>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                color: '#ffffff',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close profile modal"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.5rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.4)',
                flexShrink: 0
              }}>
                {currentUser.name?.charAt(0) || 'U'}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  color: '#ffffff',
                  lineHeight: '1.25',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentUser.name}
                </div>
                {currentUser.username && (
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
                    @{currentUser.username}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 8px',
                    borderRadius: '99px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase'
                  }}>
                    {currentUser.role}
                  </span>
                  <span style={{
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '99px',
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle size={10} /> Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Body */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Contact & Branch Cards */}
            <div style={{
              background: 'var(--bg-card-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.8125rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Mail size={15} color="var(--brand-primary)" />
                  <span>Email:</span>
                </div>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {currentUser.email}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Smartphone size={15} color="#10b981" />
                  <span>Phone:</span>
                </div>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  {currentUser.phone || '01733-983752'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Building size={15} color="#f59e0b" />
                  <span>Branch:</span>
                </div>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  {selectedBranch?.name || 'Main Branch Moulvibazar'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Shield size={15} color="#8b5cf6" />
                  <span>Access Level:</span>
                </div>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin (Full Access)' : currentUser.role}
                </span>
              </div>
            </div>

            {/* Quick Actions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Account & Security Actions
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsPasswordModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  justifyContent: 'flex-start',
                  padding: '0.6rem 0.85rem',
                  fontWeight: '600'
                }}
              >
                <KeyRound size={16} color="#10b981" />
                <span>Change Account Password</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose();
                  lockSession();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  justifyContent: 'flex-start',
                  padding: '0.6rem 0.85rem',
                  fontWeight: '600'
                }}
              >
                <Lock size={16} color="var(--brand-accent)" />
                <span>Lock Terminal Screen</span>
              </button>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  onClose();
                  logout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  justifyContent: 'flex-start',
                  padding: '0.6rem 0.85rem',
                  fontWeight: '700',
                  marginTop: '0.25rem'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out / Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </>
  );
};
