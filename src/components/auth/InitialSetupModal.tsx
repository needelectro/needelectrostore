import React, { useState } from 'react';
import { useERP } from '../../services/erpStore';
import { NeedElectroLogo } from '../NeedElectroLogo';
import { ShieldCheck, User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface InitialSetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const InitialSetupModal: React.FC<InitialSetupModalProps> = ({ isOpen, onClose }) => {
  const { completeInitialSetup, settings } = useERP();

  const [fullName, setFullName] = useState('Amdadur Rahman');
  const [email, setEmail] = useState('contact.amdadur@gmail.com');
  const [username, setUsername] = useState('amdadur');
  const [phone, setPhone] = useState('01733-983752');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid corporate email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide an official telephone/mobile number.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long for Super Admin.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completeInitialSetup({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        username: username.trim().toLowerCase(),
        password
      });

      if (res.success) {
        setIsCompleted(true);
        setTimeout(() => {
          if (onClose) onClose();
        }, 1200);
      } else {
        setError(res.error || 'Failed to complete initial setup.');
      }
    } catch (err: any) {
      setError(err?.message || 'Setup encountered an unexpected error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 25, 0.94)',
      backdropFilter: 'blur(25px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '1.5rem',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: '#0f172a',
        border: '1px solid rgba(2, 132, 199, 0.4)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(2, 132, 199, 0.2)',
        position: 'relative'
      }}>
        {/* Branding header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <NeedElectroLogo size="lg" theme="dark" showTagline={true} />
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(2, 132, 199, 0.15)',
            border: '1px solid rgba(2, 132, 199, 0.35)',
            color: '#38bdf8',
            padding: '4px 12px',
            borderRadius: '99px',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}>
            <ShieldCheck size={14} />
            <span>INITIAL SYSTEM PROVISIONING</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Master Super Admin Account Setup
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: '1.4' }}>
            Create the permanent highest-level administrator account for NEED ELECTRO ERP. This first-run setup will lock automatically once completed.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}

        {isCompleted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Super Admin Initialized!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Password securely hashed using PBKDF2-HMAC-SHA256. Transitioning to terminal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Amdadur Rahman"
                    required
                    style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.85rem' }}
                  />
                  <User size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>

              {/* Username */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Admin Username *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="superadmin"
                  required
                  style={{ height: '40px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '0.85rem' }}>
              {/* Email */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Official Email *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@needelectro.com"
                    required
                    style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.85rem' }}
                  />
                  <Mail size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>

              {/* Phone */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Phone Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01733-983752"
                    required
                    style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.85rem' }}
                  />
                  <Phone size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {/* Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Master Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    style={{ paddingLeft: '2.2rem', paddingRight: '2rem', height: '40px', fontSize: '0.85rem' }}
                  />
                  <Lock size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.85rem' }}
                  />
                  <Lock size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              color: '#94a3b8',
              lineHeight: '1.4'
            }}>
              <strong style={{ color: '#e2e8f0' }}>Production Security Notice:</strong>
              <div>Passphrase will be cryptographically salted and hashed using 100,000 PBKDF2 iterations. Plain-text credentials are never stored.</div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                height: '46px',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0284c7 0%, #0062d2 100%)',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '0.5rem'
              }}
            >
              {isSubmitting ? (
                <span>Generating Cryptographic Credentials...</span>
              ) : (
                <>
                  <span>Create Master Super Admin Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
