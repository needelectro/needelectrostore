'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/src/App'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(0, 140, 255, 0.2)',
          borderTopColor: '#008CFF',
          borderRadius: '50%',
          animation: 'admin-login-spin 0.9s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite',
          marginBottom: '20px',
        }}
      />
      <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '0.5px', color: '#ffffff' }}>
        NEED ELECTRO ERP
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
        Loading secure administrator login portal...
      </p>
      <style>{`
        @keyframes admin-login-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  ),
});

export default function AdminLoginClient() {
  return <App initialMode="admin" />;
}
