import React, { useState, useEffect } from 'react';
import { useERP } from '../../services/erpStore';
import { api } from '../../services/api';
import { 
  Database, Server, ShieldCheck, RefreshCw, CheckCircle2, 
  AlertTriangle, Check, X, Key, Activity, 
  ExternalLink, Download, Upload, Copy, Terminal, Zap, Shield, Search
} from 'lucide-react';

interface DbStatusData {
  status: 'ONLINE' | 'OFFLINE';
  isConnected: boolean;
  latencyMs: number;
  serverVersion: string;
  connectionError: string | null;
  poolerConnection: {
    host: string;
    port: string;
    database: string;
    username: string;
    isPooler: boolean;
    ssl: string;
    provider: string;
    maskedUrl: string;
  };
  directConnection: {
    host: string;
    port: string;
    database: string;
    username: string;
    isPooler: boolean;
    ssl: string;
    provider: string;
    maskedUrl: string;
  };
  environment: {
    hasDatabaseUrl: boolean;
    hasDirectUrl: boolean;
    hasSupabaseAnonKey: boolean;
    hasServiceRoleKey: boolean;
    nodeEnv: string;
    databaseEngine: string;
  };
  schemaHealth: {
    tablesTracked: number;
    totalEntitiesTracked: number;
    totalRecords: number;
    tablesSummary: Record<string, { count: number; category: string }>;
    missingPermissions: boolean;
    missingRoles: boolean;
    missingAccounts: boolean;
  };
}

export const DatabaseConfigManager: React.FC = () => {
  const { addToast, refreshFromDatabase, currentUser } = useERP();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [loading, setLoading] = useState(true);
  const [dbData, setDbData] = useState<DbStatusData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Test connection state
  const [testUrl, setTestUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Maintenance actions state
  const [isSeedingPerms, setIsSeedingPerms] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  // Table search
  const [tableSearch, setTableSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchStatus = async () => {
    try {
      setRefreshing(true);
      const res = await api.database.getStatus();
      if (res && res.success && res.data) {
        setDbData(res.data);
      }
    } catch (err: any) {
      addToast('error', 'Status Check Failed', err.message || 'Could not fetch database health.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) {
      addToast('error', 'Validation Error', 'Enter a PostgreSQL connection string to test.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.database.testConnection({ databaseUrl: testUrl.trim() });
      if (res && res.success) {
        setTestResult({ success: true, ...res.data, message: res.data?.message || 'Connection verified successfully!' });
        addToast('success', 'Database Verified', 'Successfully connected to target PostgreSQL database.');
      } else {
        setTestResult({ success: false, error: res?.error || 'Connection failed' });
        addToast('error', 'Connection Failed', res?.error || 'Target database rejected connection.');
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Network handshake failed' });
      addToast('error', 'Test Error', err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSeedPermissions = async () => {
    setIsSeedingPerms(true);
    try {
      const res = await api.database.seedPermissions();
      if (res && res.success) {
        addToast('success', 'Permissions Synchronized', `Synchronized ${res.count} permissions in database.`);
        await fetchStatus();
        if (refreshFromDatabase) await refreshFromDatabase();
      } else {
        addToast('error', 'Sync Failed', res?.message || 'Could not sync permissions');
      }
    } catch (err: any) {
      addToast('error', 'Sync Error', err.message);
    } finally {
      setIsSeedingPerms(false);
    }
  };

  const handleRepairSystem = async () => {
    setIsRepairing(true);
    try {
      const res = await api.database.repairSystem();
      if (res && res.success) {
        addToast('success', 'System Repaired', 'Default roles, permissions, and system catalogs verified.');
        await fetchStatus();
        if (refreshFromDatabase) await refreshFromDatabase();
      } else {
        addToast('error', 'Repair Failed', res?.message || 'Could not execute system repair.');
      }
    } catch (err: any) {
      addToast('error', 'Repair Error', err.message);
    } finally {
      setIsRepairing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast('info', 'Copied to Clipboard', label);
  };

  const categories = ['ALL', 'Auth & Security', 'Catalog & Inventory', 'CRM & Stakeholders', 'Billing & POS', 'Accounting & Vault', 'Financing & EMI', 'Repairs & Services', 'Human Resources', 'Auditing & System', 'Enterprise Setup'];

  const filteredTables = dbData?.schemaHealth?.tablesSummary ? Object.entries(dbData.schemaHealth.tablesSummary).filter(([tbl, meta]) => {
    const matchesCategory = selectedCategory === 'ALL' || meta.category === selectedCategory;
    const matchesSearch = tbl.toLowerCase().includes(tableSearch.toLowerCase()) || meta.category.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  }) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner Card */}
      <div className="card" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(14, 165, 233, 0.25)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)'
            }}>
              <Database size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Custom Database Configuration & Cloud Engine
                </h2>
                <span className={`badge ${dbData?.isConnected ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '3px 8px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: dbData?.isConnected ? '#10b981' : '#ef4444',
                    boxShadow: dbData?.isConnected ? '0 0 8px #10b981' : 'none'
                  }} />
                  {dbData?.status || 'CHECKING...'}
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
                High-performance PostgreSQL connection pooler, multi-table schema registry, and 1-click self-healing engine.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={fetchStatus}
              disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh Diagnostics</span>
            </button>

            {isSuperAdmin && (
              <>
                <button
                  className="btn btn-sm"
                  onClick={handleSeedPermissions}
                  disabled={isSeedingPerms}
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>{isSeedingPerms ? 'Syncing...' : 'Sync Permissions Matrix'}</span>
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleRepairSystem}
                  disabled={isRepairing}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Zap size={14} />
                  <span>{isRepairing ? 'Repairing...' : 'Auto-Repair System Tables'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Health KPI Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Connection Latency</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (dbData?.latencyMs || 0) < 150 ? '#10b981' : '#f59e0b', marginTop: '2px' }}>
              {dbData?.latencyMs !== undefined ? `${dbData.latencyMs} ms` : '...'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>PgBouncer Pooler Round-Trip</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Database Engine</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dbData?.serverVersion || 'PostgreSQL 15+'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#38bdf8' }}>Supabase Singapore (AWS)</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Registered Tables</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              {dbData?.schemaHealth?.tablesTracked || 56} / 56 Tables
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#10b981' }}>Full Relational Schema Active</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Records Stored</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
              {dbData?.schemaHealth?.totalRecords?.toLocaleString() || '...'} Rows
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Live Business Footprint</div>
          </div>
        </div>
      </div>

      {/* Grid: Active Connection Config & Custom Tester */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        
        {/* CARD 1: Active Database Connection Properties */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} color="var(--brand-primary)" />
              <span>Active Database Connection Profile</span>
            </h3>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>PRODUCTION</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>Connection Pooler (DATABASE_URL)</span>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => copyToClipboard(dbData?.poolerConnection?.maskedUrl || '', 'Pooler Connection URL')}
                  title="Copy Masked Connection"
                  style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
              <code style={{ fontSize: '0.75rem', color: '#cbd5e1', wordBreak: 'break-all', display: 'block' }}>
                {dbData?.poolerConnection?.maskedUrl || 'postgresql://postgres.apvjf...:6543/postgres?pgbouncer=true'}
              </code>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '6px', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>Port: <strong>6543 (PgBouncer)</strong></span>
                <span>Mode: <strong>Transaction Pooling</strong></span>
                <span>SSL: <strong>{dbData?.poolerConnection?.ssl || 'Enforced'}</strong></span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>Direct PostgreSQL Port (DIRECT_URL)</span>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => copyToClipboard(dbData?.directConnection?.maskedUrl || '', 'Direct Connection URL')}
                  title="Copy Direct URL"
                  style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
              <code style={{ fontSize: '0.75rem', color: '#cbd5e1', wordBreak: 'break-all', display: 'block' }}>
                {dbData?.directConnection?.maskedUrl || 'postgresql://postgres.apvjf...:5432/postgres'}
              </code>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '6px', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>Port: <strong>5432 (Direct)</strong></span>
                <span>Purpose: <strong>DDL Migrations & Schema Engine</strong></span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Database Host:</span>
                <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {dbData?.poolerConnection?.host || 'aws-0-ap-southeast-1.pooler.supabase.com'}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Database:</span>
                <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
                  {dbData?.poolerConnection?.database || 'postgres'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Custom Connection Tester & Switcher */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} color="var(--brand-primary)" />
              <span>Test Custom PostgreSQL Connection</span>
            </h3>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>SANDBOX TESTER</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Test a custom or staging PostgreSQL connection string before modifying environment configuration files.
          </p>

          <form onSubmit={handleTestConnection} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Custom PostgreSQL URL</label>
              <textarea
                className="form-input"
                rows={2}
                value={testUrl}
                onChange={e => setTestUrl(e.target.value)}
                placeholder="postgresql://user:password@host:port/dbname?sslmode=require"
                style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setTestUrl('postgresql://postgres:password@localhost:5432/needelectro_db')}
                style={{ fontSize: '0.7rem' }}
              >
                + Local Template
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setTestUrl('postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/needelectro?sslmode=require')}
                style={{ fontSize: '0.7rem' }}
              >
                + Neon Template
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setTestUrl('postgresql://postgres.projectid:pass@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true')}
                style={{ fontSize: '0.7rem' }}
              >
                + Supabase Template
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={testing || !testUrl.trim()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {testing ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />}
              <span>{testing ? 'Testing Handshake...' : 'Execute Live Connection Test'}</span>
            </button>
          </form>

          {/* Test Results Display */}
          {testResult && (
            <div style={{
              padding: '0.85rem',
              borderRadius: '8px',
              background: testResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: testResult.success ? '#10b981' : '#ef4444', marginBottom: '4px' }}>
                {testResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{testResult.success ? 'Connection Successful' : 'Connection Failed'}</span>
              </div>
              {testResult.success ? (
                <div style={{ color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem' }}>
                  <div>Latency: <strong>{testResult.latencyMs} ms</strong></div>
                  <div>Server Version: <strong>{testResult.serverVersion}</strong></div>
                  <div>Tables in Schema: <strong>{testResult.tablesFoundInPublicSchema}</strong></div>
                </div>
              ) : (
                <div style={{ color: '#fca5a5', fontSize: '0.75rem' }}>
                  {testResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Database Tables & Schema Health Registry */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--brand-primary)" />
              <span>Relational Tables & System Schema Registry (56 Models)</span>
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Live row inventory mapped to Prisma ORM and Supabase PostgreSQL backend.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Filter tables..."
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.8rem', width: '180px' }}
              />
            </div>

            <select
              className="form-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ height: '34px', fontSize: '0.8rem' }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Table Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '0.75rem',
          maxHeight: '440px',
          overflowY: 'auto',
          padding: '2px'
        }}>
          {filteredTables.map(([tblName, meta]) => {
            const isEmpty = meta.count === 0;
            return (
              <div 
                key={tblName}
                style={{
                  background: 'var(--bg-card-muted)',
                  border: `1px solid ${isEmpty ? 'rgba(245, 158, 11, 0.25)' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <code style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
                    {tblName}
                  </code>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isEmpty ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: isEmpty ? '#f59e0b' : '#10b981'
                  }}>
                    {isEmpty ? '0 (Empty)' : `${meta.count.toLocaleString()} rows`}
                  </span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {meta.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
