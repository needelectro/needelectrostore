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
        gap: '28px',
      }}
    >
      {/* Rotating ring + logo */}
      <div style={{ position: 'relative', width: '110px', height: '110px' }}>
        {/* Outer spinning arc */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#008CFF',
            borderRightColor: 'rgba(0,140,255,0.35)',
            animation: 'ne-spin 1s cubic-bezier(0.6,0.05,0.4,0.95) infinite',
          }}
        />
        {/* Inner glow ring */}
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '2px solid rgba(0,140,255,0.12)',
            boxShadow: '0 0 18px rgba(0,140,255,0.18)',
          }}
        />
        {/* Logo circle */}
        <div
          style={{
            position: 'absolute',
            inset: '14px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #0d1526 0%, #111827 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,140,255,0.15)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-icon.png"
            alt="NEED ELECTRO"
            style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(0,140,255,0.5))' }}
          />
        </div>
      </div>

      {/* Brand name */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '18px',
            fontWeight: '800',
            letterSpacing: '1.5px',
            background: 'linear-gradient(90deg, #60a5fa, #008CFF, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '6px',
            animation: 'ne-pulse 2s ease-in-out infinite',
          }}
        >
          NEED ELECTRO
        </div>
        <div style={{ color: '#475569', fontSize: '12px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
          Loading
          <span style={{ animation: 'ne-dot 1.2s 0s infinite' }}>.</span>
          <span style={{ animation: 'ne-dot 1.2s 0.2s infinite' }}>.</span>
          <span style={{ animation: 'ne-dot 1.2s 0.4s infinite' }}>.</span>
        </div>
      </div>

      <style>{`
        @keyframes ne-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ne-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.65; }
        }
        @keyframes ne-dot {
          0%, 80%, 100% { opacity: 0; }
          40%            { opacity: 1; }
        }
      `}</style>
    </div>
  ),
});

export default function ClientApp() {
  return <App />;
}
