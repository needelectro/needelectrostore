import React from 'react';
import { useERP } from '../services/erpStore';
import { GitFork, Building, MapPin, Phone, Mail, ArrowRightLeft } from 'lucide-react';

interface BranchModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const BranchModule: React.FC<BranchModuleProps> = ({ onNavigate }) => {
  const { branches, selectedBranch, setSelectedBranchId } = useERP();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('inventory')}>
          <ArrowRightLeft size={16} /> Inter-Branch Stock Transfers
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {branches.map(b => {
          const isCurrent = b.id === selectedBranch.id;

          return (
            <div 
              key={b.id} 
              className="erp-card" 
              style={{
                padding: '1.5rem',
                borderTop: `4px solid ${isCurrent ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-info">{b.code}</span>
                  <span className={`badge ${b.isWarehouse ? 'badge-warning' : 'badge-success'}`}>
                    {b.isWarehouse ? 'Central Warehouse' : 'Retail Showroom'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                  {b.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="var(--text-muted)" />
                    <span>{b.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={15} color="var(--text-muted)" />
                    <span>{b.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={15} color="var(--text-muted)" />
                    <span>{b.email}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: isCurrent ? 'var(--brand-primary)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                  {isCurrent ? 'Currently Active Session' : 'Ready'}
                </span>
                {!isCurrent && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedBranchId(b.id)}
                  >
                    Switch to this Branch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
