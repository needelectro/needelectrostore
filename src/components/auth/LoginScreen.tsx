import React, { useState } from 'react';
import { useERP } from '../../services/erpStore';
import { NeedElectroLogo } from '../NeedElectroLogo';
import { 
  Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, 
  Building, CheckCircle2, UserCheck, AlertCircle, Phone, Globe, MapPin 
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, branches, selectedBranch, settings } = useERP();

  const [email, setEmail] = useState('contact.amdadur@gmail.com');
  const [password, setPassword] = useState('NeedElectro@Admin2026');
  const [branchId, setBranchId] = useState(selectedBranch?.id || 'branch-1');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both account email and security password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email.trim(), password, rememberMe, branchId);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login encountered an unexpected server error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 15% 50%, rgba(0, 140, 255, 0.15), transparent 45%), radial-gradient(circle at 85% 30%, rgba(0, 43, 91, 0.8), #070d1e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient decorative shapes */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 140, 255, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 43, 91, 0.3) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Main Container */}
      <div style={{
        width: '100%',
        maxWidth: '1080px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(0, 140, 255, 0.3)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 140, 255, 0.15)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left: Brand Presentation Banner */}
        <div style={{
          padding: '3rem',
          background: 'linear-gradient(135deg, rgba(0, 43, 91, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <NeedElectroLogo size="lg" showTagline={true} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.3,
                marginBottom: '0.75rem'
              }}>
                Enterprise Business Management Portal
              </h1>
              <p style={{
                fontSize: '0.9rem',
                color: '#94a3b8',
                lineHeight: 1.6
              }}>
                Centralized production ERP for <strong>NEED ELECTRO</strong>. Complete real database operations for Point of Sale, Laptop EMI financing, inventory serial tracking, customer ledgers, and Super Admin control.
              </p>
            </div>

            {/* Feature Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { title: 'Laptop EMI Financing', desc: 'Real installment ledger, payment schedules & receipts' },
                { title: 'Hardware Serial Tracking', desc: 'Unique lifecycle from purchase to customer warranty' },
                { title: 'Centralized Production Database', desc: 'Single centralized database with ACID transactions' },
                { title: 'Super Admin Control Center', desc: '100% database-driven business configuration' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(0, 140, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#008CFF',
                    marginTop: '2px',
                    flexShrink: 0
                  }}>
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Hotline info */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
              <MapPin size={14} color="#008CFF" />
              <span>Shop#5, MR Plaza, Kusumbag, Moulvibazar, Bangladesh</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
              <Phone size={14} color="#008CFF" />
              <span>Hotline: 01733-983752</span>
            </div>
          </div>
        </div>

        {/* Right: Real Security Authentication Form */}
        <div style={{
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} color="#008CFF" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Secure Access
              </span>
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              Sign in to ERP
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '1.75rem' }}>
              Enter your verified credentials to access your designated workspace.
            </p>

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '1.5rem',
                color: '#fca5a5',
                fontSize: '0.825rem',
                lineHeight: 1.4
              }}>
                <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Branch Selection */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Branch / Operating Location
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="form-select"
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    style={{
                      paddingLeft: '2.5rem',
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderColor: 'rgba(0, 140, 255, 0.3)',
                      color: '#ffffff',
                      height: '42px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {branches && branches.length > 0 ? (
                      branches.map(b => (
                        <option key={b.id} value={b.id} style={{ background: '#0f172a' }}>
                          {b.name} ({b.code}){b.isWarehouse ? ' — Warehouse' : ''}
                        </option>
                      ))
                    ) : (
                      <option value="branch-1" style={{ background: '#0f172a' }}>
                        Main Branch Moulvibazar (MB-MAIN)
                      </option>
                    )}
                  </select>
                  <Building size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              {/* Email / Username */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Official Email or Username *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. contact.amdadur@gmail.com"
                    required
                    style={{
                      paddingLeft: '2.5rem',
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderColor: 'rgba(0, 140, 255, 0.3)',
                      color: '#ffffff',
                      height: '42px',
                      fontSize: '0.875rem'
                    }}
                  />
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Security Password *</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    required
                    style={{
                      paddingLeft: '2.5rem',
                      paddingRight: '2.5rem',
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderColor: 'rgba(0, 140, 255, 0.3)',
                      color: '#ffffff',
                      height: '42px',
                      fontSize: '0.875rem'
                    }}
                  />
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('contact.amdadur@gmail.com');
                      setPassword('NeedElectro@Admin2026');
                    }}
                    style={{
                      background: 'rgba(0, 140, 255, 0.12)',
                      border: '1px solid rgba(0, 140, 255, 0.3)',
                      color: '#38bdf8',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <UserCheck size={12} /> Auto-Fill Super Admin
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#008CFF' }}
                  />
                  <span>Remember session on this computer</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{
                  height: '46px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #008CFF 0%, #002B5B 100%)',
                  boxShadow: '0 4px 15px rgba(0, 140, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '0.5rem'
                }}
              >
                {isLoading ? (
                  <span>Authenticating with Central Database...</span>
                ) : (
                  <>
                    <span>Sign In to NEED ELECTRO ERP</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Production Database Security Banner */}
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{
              background: 'rgba(0, 140, 255, 0.08)',
              border: '1px solid rgba(0, 140, 255, 0.25)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldCheck size={22} color="#008CFF" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
                  REAL DATABASE AUTHENTICATION ACTIVE
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  Connected to central SQLite database (WAL mode). Passwords hashed using PBKDF2-HMAC-SHA256 (100k rounds). Super Admin: <strong style={{ color: '#008CFF' }}>Amdadur Rahman</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
