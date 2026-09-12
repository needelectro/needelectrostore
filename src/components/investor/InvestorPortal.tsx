import React, { useState, useEffect } from 'react';
import { useERP } from '../../services/erpStore';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  ShieldCheck, LogOut, Calendar, BarChart3, AlertCircle,
  RefreshCw, CheckCircle2, Clock, Sparkles, Building2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, LineChart, Line 
} from 'recharts';

interface InvestorPortalProps {
  onBackToLanding?: () => void;
}

interface MonthlyData {
  id: string;
  year: number;
  month: number;
  periodLabel: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  myProfit: number;
  myInvestment: number;
  mySharePercentage: number;
  isFinalized: boolean;
  finalizedAt?: string;
}

interface PortalData {
  investor: {
    investorId: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
  };
  myInvestment: number;
  mySharePercentage: number;
  profitPoolRate: number;
  currentMonth: MonthlyData;
  history: MonthlyData[];
}

export const InvestorPortal: React.FC<InvestorPortalProps> = ({ onBackToLanding }) => {
  const { logout, settings } = useERP();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortalData | null>(null);
  const [selectedMonthId, setSelectedMonthId] = useState<string>('');

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/investor/portal');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load investor data.');
      }

      setData(json.data);
      if (json.data?.currentMonth?.id) {
        setSelectedMonthId(json.data.currentMonth.id);
      } else if (json.data?.history?.[0]?.id) {
        setSelectedMonthId(json.data.history[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading your portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleLogout = async () => {
    await logout();
    if (onBackToLanding) {
      onBackToLanding();
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-main, #0f172a)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '4px solid rgba(59, 130, 246, 0.2)',
          borderTopColor: '#3b82f6',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Loading your verified financial ledger...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-main, #0f172a)',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '2.5rem',
          maxWidth: '480px',
          textAlign: 'center',
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Access Verification Failed</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {error || 'Unable to load investor information.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={fetchPortalData}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid #475569',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active viewed month data
  const selectedPeriod =
    data.history.find(h => h.id === selectedMonthId) || data.currentMonth;

  // Format Recharts data (reverse to show chronological Jan -> Sep)
  const chartData = [...data.history]
    .reverse()
    .map(h => ({
      name: h.periodLabel.split(' ')[0], // e.g. "Sep"
      period: h.periodLabel,
      revenue: h.revenue,
      expenses: h.expenses,
      netProfit: h.netProfit,
      myProfit: h.myProfit,
    }));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main, #0b1120)',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      paddingBottom: '4rem',
    }}>
      {/* 1. TOP HEADER / APP BAR */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0072FF 0%, #00C6FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 114, 255, 0.35)',
              fontWeight: 900,
              fontSize: '1.25rem',
              color: '#ffffff',
            }}>
              ⚡
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  {settings.companyName || 'NEED ELECTRO'}
                </span>
                <span style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>
                  INVESTOR PORTAL
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Verified Financial Reporting Ledger
              </div>
            </div>
          </div>

          {/* Investor Profile Badge & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '0.4rem 0.85rem',
              borderRadius: '10px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}>
                {data.investor.name.charAt(0)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9' }}>
                  {data.investor.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {data.investor.investorId} • <span style={{ color: '#10b981' }}>{data.investor.status}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '0.5rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Sign Out"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Period Selector Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Reporting Financial Period
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
                {selectedPeriod.periodLabel}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {selectedPeriod.isFinalized ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                <CheckCircle2 size={13} /> Finalized & Approved
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                <Clock size={13} /> Live Ongoing Estimate
              </span>
            )}

            <select
              value={selectedPeriod.id}
              onChange={e => setSelectedMonthId(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {data.history.map(m => (
                <option key={m.id} value={m.id}>
                  {m.periodLabel} {m.isFinalized ? '(Finalized)' : '(Current Live)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. FOUR PRIMARY CARDS (SECTION 2 IN SPEC) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}>
          {/* Card 1: Monthly Revenue */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                Monthly Revenue
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div style={{
              fontSize: '1.85rem',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}>
              ৳ {selectedPeriod.revenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
              Realized customer sales in {selectedPeriod.periodLabel}
            </div>
          </div>

          {/* Card 2: Monthly Expenses */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                Monthly Expenses
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TrendingDown size={16} />
              </div>
            </div>
            <div style={{
              fontSize: '1.85rem',
              fontWeight: 900,
              color: '#fb7185',
              letterSpacing: '-0.02em',
            }}>
              ৳ {selectedPeriod.expenses.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
              Total operating expenditures (aggregated only)
            </div>
          </div>

          {/* Card 3: Monthly Net Profit */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                Monthly Net Profit
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <DollarSign size={16} />
              </div>
            </div>
            <div style={{
              fontSize: '1.85rem',
              fontWeight: 900,
              color: selectedPeriod.netProfit >= 0 ? '#34d399' : '#ef4444',
              letterSpacing: '-0.02em',
            }}>
              ৳ {selectedPeriod.netProfit.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
              Revenue − (COGS + Operating Expenses)
            </div>
          </div>

          {/* Card 4: My Profit (Highlight Gold/Cyan Gradient) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(14, 165, 233, 0.2) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.4)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(14, 165, 233, 0.15)',
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '80px',
              height: '80px',
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                My Profit Share
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(14, 165, 233, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={16} />
              </div>
            </div>
            <div style={{
              fontSize: '1.95rem',
              fontWeight: 900,
              color: '#38bdf8',
              letterSpacing: '-0.02em',
            }}>
              ৳ {selectedPeriod.myProfit.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
              Your {selectedPeriod.mySharePercentage}% of the 25% Investor Pool
            </div>
          </div>
        </div>

        {/* 4. SECONDARY INVESTOR CAPITAL STRIP */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {/* My Investment */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Wallet size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                My Active Investment Capital
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                ৳ {selectedPeriod.myInvestment.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Separately accounted capital contribution
              </div>
            </div>
          </div>

          {/* My Investment Share */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(168, 85, 247, 0.12)',
              color: '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                My Investment Share
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                {selectedPeriod.mySharePercentage}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Your proportion of active investor equity
              </div>
            </div>
          </div>

          {/* Profit Pool Share Policy */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                Business Investor Pool Rate
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                25.0% of Net Profit
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Formula: Net Profit × 25% × My Share %
              </div>
            </div>
          </div>
        </div>

        {/* 5. VISUAL PERFORMANCE TREND CHART */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Monthly Financial Performance Trend
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Month-by-month revenue, net profit, and your proportional profit share
              </p>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={val => `৳${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                  }}
                  formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, '']}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '0.8rem' }}
                />
                <Bar dataKey="revenue" name="Monthly Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="netProfit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="myProfit" name="My Profit" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. MONTHLY HISTORY TABLE (SECTION 9 IN SPEC) */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Monthly Performance History
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Chronological record of business revenue, expenses, net profit, and your earnings
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.85rem',
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Financial Month</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Revenue (৳)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Expenses (৳)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Net Profit (৳)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>My Profit (৳)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map(item => {
                  const isSelected = item.id === selectedPeriod.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedMonthId(item.id)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: 700, color: isSelected ? '#60a5fa' : '#f8fafc' }}>
                        {item.periodLabel}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#f8fafc', fontWeight: 600 }}>
                        ৳ {item.revenue.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#fb7185' }}>
                        ৳ {item.expenses.toLocaleString()}
                      </td>
                      <td style={{
                        padding: '1rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: item.netProfit >= 0 ? '#34d399' : '#ef4444',
                      }}>
                        ৳ {item.netProfit.toLocaleString()}
                      </td>
                      <td style={{
                        padding: '1rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        color: '#38bdf8',
                        fontSize: '0.95rem',
                      }}>
                        ৳ {item.myProfit.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {item.isFinalized ? (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}>
                            Finalized
                          </span>
                        ) : (
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}>
                            Live Estimate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. FINANCIAL POLICY NOTICE (SECTION 10 & 16 IN SPEC) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ShieldCheck size={20} />
            </div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.7 }}>
              <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>Financial Governance & Transparency Policy:</strong>
              <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
                <li>
                  <strong style={{ color: '#f1f5f9' }}>Core Profit Allocation:</strong> Business investor pool is strictly <strong>25% of Net Operating Profit</strong>. Individual profit is calculated proportionally based on your active capital share.
                </li>
                <li>
                  <strong style={{ color: '#f1f5f9' }}>No Profit = No Return:</strong> If the business achieves ৳0 net profit or incurs a net loss in any period, investor profit share is ৳0. There are no fixed interest or guaranteed debt obligations.
                </li>
                <li>
                  <strong style={{ color: '#f1f5f9' }}>Capital Segregation:</strong> Your investment capital (৳{data.myInvestment.toLocaleString()}) represents equity capital and is accounted for independently from operating sales and revenue.
                </li>
                <li>
                  <strong style={{ color: '#f1f5f9' }}>Period Finalization:</strong> Finalized months are verified by management and locked against retroactive alterations.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
