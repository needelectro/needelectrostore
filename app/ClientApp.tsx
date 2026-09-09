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
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(0, 140, 255, 0.2)',
          borderTopColor: '#008CFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px',
        }}
      />
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>
        NEED ELECTRO ERP
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
        Initializing secure production environment...
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  ),
});

export default function ClientApp() {
  return <App />;
}
