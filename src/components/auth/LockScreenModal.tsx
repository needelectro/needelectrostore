import React, { useState } from 'react';
import { useERP } from '../../services/erpStore';
import { NeedElectroLogo } from '../NeedElectroLogo';
import { Lock, ArrowRight, LogOut, KeyRound, AlertCircle } from 'lucide-react';

export const LockScreenModal: React.FC = () => {
  const { currentUser, selectedBranch, unlockSession, logout } = useERP();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await unlockSession(password);
    if (!res.success) {
      setError(res.error || 'Incorrect password');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(7, 13, 30, 0.88)',
      backdropFilter: 'blur(25px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem 0.75rem',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        maxHeight: 'calc(94dvh - env(safe-area-inset-bottom, 0px))',
        background: '#0f172a',
        border: '1px solid rgba(2, 132, 199, 0.3)',
        borderRadius: '20px',
        padding: '2rem 1.5rem',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(2, 132, 199, 0.15)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto'
      }}>
        {/* Logo Icon */}
        <div style={{ marginBottom: '1.25rem' }}>
          <NeedElectroLogo size="sm" variant="icon-only" />
        </div>

        {/* User Avatar */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0284c7, #0062d2)',
          color: '#ffffff',
          fontSize: '1.75rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4)',
          border: '3px solid #1e293b'
        }}>
          {currentUser.name.charAt(0)}
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
          {currentUser.name}
        </h2>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
          {currentUser.email}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.72rem', background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '99px', fontWeight: 'bold' }}>
            {currentUser.role}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>•</span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {selectedBranch.name}
          </span>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.5rem 0.8rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: '100%'
          }}>
            <AlertCircle size={14} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter security password"
              autoFocus
              required
              style={{
                background: '#1e293b',
                borderColor: 'rgba(2, 132, 199, 0.4)',
                color: '#ffffff',
                paddingLeft: '2.5rem',
                height: '44px',
                fontSize: '0.875rem'
              }}
            />
            <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              height: '44px',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0284c7 0%, #0062d2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>Unlock Terminal</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <button
          type="button"
          onClick={logout}
          style={{
            marginTop: '1.5rem',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          <LogOut size={14} />
          <span>Switch Account / Sign Out</span>
        </button>
      </div>
    </div>
  );
};
