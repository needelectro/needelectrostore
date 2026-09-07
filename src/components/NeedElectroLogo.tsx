import React from 'react';

interface NeedElectroLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon-only' | 'master-image';
  theme?: 'dark' | 'light' | 'auto';
  showTagline?: boolean;
  showSisterConcern?: boolean;
  showDots?: boolean;
  className?: string;
}

export const NeedElectroLogo: React.FC<NeedElectroLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'auto',
  showTagline = true,
  showSisterConcern = false,
  showDots = false,
  className = ''
}) => {
  // Dimensions based on size
  const iconDimensions = {
    xs: { width: 20, height: 26 },
    sm: { width: 28, height: 36 },
    md: { width: 38, height: 48 },
    lg: { width: 52, height: 66 },
    xl: { width: 72, height: 92 }
  }[size];

  const fullImageHeights = {
    xs: '26px',
    sm: '34px',
    md: '44px',
    lg: '62px',
    xl: '84px'
  }[size];

  const fontSizes = {
    xs: { need: '0.9rem', electro: '0.95rem', tagline: '0.5rem', concern: '0.5rem' },
    sm: { need: '1.15rem', electro: '1.2rem', tagline: '0.58rem', concern: '0.55rem' },
    md: { need: '1.45rem', electro: '1.5rem', tagline: '0.68rem', concern: '0.62rem' },
    lg: { need: '1.95rem', electro: '2.05rem', tagline: '0.85rem', concern: '0.72rem' },
    xl: { need: '2.6rem', electro: '2.75rem', tagline: '1.1rem', concern: '0.85rem' }
  }[size];

  // 1. Master Image Variant (Direct rendering of the uploaded official logo)
  if (variant === 'master-image') {
    const imgSrc = theme === 'dark' ? '/logo-dark-transparent.png' : '/logo-transparent.png';
    return (
      <div className={`need-electro-master-logo ${className}`} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <img 
          src={imgSrc} 
          alt="NEED ELECTRO — Trusted Electrical and Technological Solutions" 
          style={{ 
            height: fullImageHeights, 
            width: 'auto', 
            objectFit: 'contain',
            display: 'block'
          }} 
        />
        {showSisterConcern && (
          <div style={{ marginTop: '4px', fontSize: fontSizes.concern, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            — A sister Concern Of <strong style={{ color: 'var(--brand-accent)' }}>AMDADS GROUP</strong> —
          </div>
        )}
      </div>
    );
  }

  // 2. Icon Only Variant (Strictly the official 3D lightning bolt)
  if (variant === 'icon-only') {
    return (
      <div className={`need-electro-logo-icon ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src="/logo-icon.png" 
          alt="Need Electro" 
          style={{ 
            width: `${iconDimensions.width}px`, 
            height: `${iconDimensions.height}px`, 
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 6px rgba(0, 120, 255, 0.45))' 
          }} 
        />
      </div>
    );
  }

  // 3. Full Composite Component (Official 3D bolt icon + typography tailored for dark or light backgrounds)
  const electroColor = theme === 'light' ? '#0F172A' : (theme === 'dark' ? '#FFFFFF' : 'var(--text-primary)');
  const taglineColor = theme === 'light' ? '#334155' : (theme === 'dark' ? '#94A3B8' : 'var(--text-secondary)');

  return (
    <div className={`need-electro-branding ${className}`} style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: size === 'xs' ? '0.4rem' : (size === 'sm' ? '0.55rem' : '0.75rem') }}>
        {/* Official 3D Bolt Icon */}
        <img 
          src="/logo-icon.png" 
          alt="Need Electro Logo" 
          style={{ 
            width: `${iconDimensions.width}px`, 
            height: `${iconDimensions.height}px`, 
            objectFit: 'contain',
            flexShrink: 0,
            filter: 'drop-shadow(0 2px 8px rgba(0, 120, 255, 0.4))' 
          }} 
        />

        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{ 
              fontWeight: 900, 
              fontSize: fontSizes.need, 
              color: '#0072FF',
              letterSpacing: '0.02em',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" 
            }}>
              NEED
            </span>
            <span style={{ 
              fontWeight: 900, 
              fontSize: fontSizes.electro, 
              color: electroColor,
              letterSpacing: '0.04em',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" 
            }}>
              ELECTRO
            </span>
          </div>

          {showTagline && (
            <div style={{ 
              fontSize: fontSizes.tagline, 
              fontWeight: 600, 
              color: taglineColor, 
              letterSpacing: '0.01em',
              marginTop: '2px',
              whiteSpace: 'nowrap'
            }}>
              Trusted Electrical and Technological Solutions
            </div>
          )}

          {showDots && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '3px', alignItems: 'center' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '1.5px', background: '#0072FF' }} />
              <span style={{ width: '5px', height: '5px', borderRadius: '1.5px', background: '#0072FF' }} />
              <span style={{ width: '5px', height: '5px', borderRadius: '1.5px', background: '#0072FF' }} />
            </div>
          )}
        </div>
      </div>

      {showSisterConcern && (
        <div style={{ 
          marginTop: '4px', 
          paddingTop: '4px', 
          borderTop: '1px dashed rgba(0, 114, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '2px'
        }}>
          <div style={{ fontSize: fontSizes.concern, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            — A sister Concern Of —
          </div>
          <div style={{ fontSize: fontSizes.concern, fontWeight: 800, color: '#0072FF', letterSpacing: '0.05em' }}>
            AMDADS GROUP
          </div>
        </div>
      )}
    </div>
  );
};
