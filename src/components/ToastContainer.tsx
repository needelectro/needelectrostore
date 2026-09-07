import React from 'react';
import { useERP } from '../services/erpStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useERP();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}
      className="no-print"
    >
      {toasts.map(toast => {
        let icon = <CheckCircle2 size={20} color="#10b981" />;
        let borderColor = '#10b981';

        if (toast.type === 'error') {
          icon = <AlertCircle size={20} color="#ef4444" />;
          borderColor = '#ef4444';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle size={20} color="#f59e0b" />;
          borderColor = '#f59e0b';
        } else if (toast.type === 'info') {
          icon = <Info size={20} color="#38bdf8" />;
          borderColor = '#38bdf8';
        }

        return (
          <div
            key={toast.id}
            style={{
              background: 'var(--bg-card)',
              borderLeft: `4px solid ${borderColor}`,
              borderTop: '1px solid var(--border-color)',
              borderRight: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              pointerEvents: 'auto',
              animation: 'scaleUp 0.2s ease-out'
            }}
          >
            <div style={{ marginTop: '2px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '2px'
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
