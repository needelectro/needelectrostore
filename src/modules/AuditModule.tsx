import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { ScrollText, Search, ShieldAlert, Lock } from 'lucide-react';

interface AuditModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const AuditModule: React.FC<AuditModuleProps> = ({ onNavigate }) => {
  const { auditLogs } = useERP();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(l => {
    const q = searchQuery.toLowerCase();
    return l.userName.toLowerCase().includes(q) ||
           l.action.toLowerCase().includes(q) ||
           l.recordId.toLowerCase().includes(q) ||
           l.details.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <ScrollText size={28} color="var(--brand-primary)" />
            Immutable System Audit Trail
          </h1>
          <p>
            Cryptographically sealed and timestamped action logs for commercial accountability and financial fraud prevention.
          </p>
        </div>

        <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Lock size={12} /> Append-Only Immutable Log
        </span>
      </div>

      <div className="erp-card" style={{ padding: '1.25rem' }}>
        <div style={{ position: 'relative', width: '320px', marginBottom: '1.25rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search audit trail..."
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
                <th>Timestamp</th>
                <th>Staff Member</th>
                <th>Module</th>
                <th>Operation / Action</th>
                <th>Target Record</th>
                <th>Activity Description</th>
                <th style={{ textAlign: 'center' }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                  <td style={{ fontWeight: '700' }}>{log.userName}</td>
                  <td><span className="badge badge-neutral">{log.module}</span></td>
                  <td>
                    <span className="badge badge-info">{log.action}</span>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--brand-primary)' }}>{log.recordId}</td>
                  <td style={{ fontSize: '0.85rem' }}>{log.details}</td>
                  <td style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
