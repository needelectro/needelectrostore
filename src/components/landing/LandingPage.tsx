import React, { useState } from 'react';
import { NeedElectroLogo } from '../NeedElectroLogo';
import { 
  ArrowRight, ShieldCheck, Zap, Monitor, Cpu, Receipt, 
  CreditCard, Smartphone, Boxes, Wrench, BarChart3, Database, 
  Lock, CheckCircle2, Building2, Phone, Mail, MapPin, 
  ChevronRight, ExternalLink, Sparkles, Layers, DollarSign,
  TrendingUp, Users, RefreshCw, FileText, ArrowUpRight
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin }) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'emi' | 'accounting' | 'service'>('pos');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#070c18',
      color: '#f8fafc',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: 'hidden',
      lineHeight: 1.6
    }}>
      {/* -------------------------------------------------------------
          1. STICKY EXECUTIVE HEADER
          ------------------------------------------------------------- */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(7, 12, 24, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <NeedElectroLogo size="sm" showSisterConcern={true} theme="dark" />
          </div>

          {/* Nav Links */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <a href="#overview" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>Overview</a>
            <a href="#modules" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>Modules</a>
            <a href="#capabilities" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>Capabilities</a>
            <a href="#technology" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>Tech Stack</a>
            <a href="#contact" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</a>
          </nav>

          {/* Action Portal Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={onOpenLogin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #0072FF 0%, #00C6FF 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 114, 255, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>Staff Portal</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          2. HERO SECTION WITH GLOW & METRICS
          ------------------------------------------------------------- */}
      <section id="overview" style={{
        position: 'relative',
        padding: '5rem 1.5rem 4rem',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% -20%, rgba(0, 114, 255, 0.22) 0%, transparent 65%)'
      }}>
        {/* Decorative Grid Lines */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          opacity: 0.35,
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Top Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(0, 114, 255, 0.12)',
            border: '1px solid rgba(0, 114, 255, 0.3)',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#60a5fa',
            marginBottom: '1.75rem',
            boxShadow: '0 2px 10px rgba(0, 114, 255, 0.15)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }} />
            <span>Enterprise Cloud ERP v1.0 • Multi-Branch Electronics & Service Center</span>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            margin: '0 auto 1.5rem',
            maxWidth: '960px',
            color: '#ffffff'
          }}>
            The Operating System for Modern <span style={{
              background: 'linear-gradient(135deg, #008CFF 0%, #38bdf8 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Electronics Retail & Workshop</span> Enterprises
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#94a3b8',
            maxWidth: '780px',
            margin: '0 auto 2.5rem',
            fontWeight: 400
          }}>
            A unified platform combining high-speed POS billing, serialized IMEI/barcode stock management, automated laptop EMI installment plans, technical repair service jobs, and real-time double-entry cash liquidity.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '3.5rem'
          }}>
            <button
              onClick={onOpenLogin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'linear-gradient(135deg, #0072FF 0%, #00C6FF 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.9rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 114, 255, 0.45)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Zap size={18} fill="#ffffff" />
              <span>Launch Staff Portal</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="#modules"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '0.9rem 1.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            >
              <Monitor size={18} />
              <span>Explore Live Tour</span>
            </a>
          </div>

          {/* Metric Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            maxWidth: '1080px',
            margin: '0 auto',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.5rem',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ textAlign: 'left', padding: '0.5rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00C6FF' }}>100%</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>Serialized Stock Accuracy</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>IMEI / Barcode single-unit tracking</div>
            </div>

            <div style={{ textAlign: 'left', padding: '0.5rem', borderLeft: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>Live BDT</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>Dual Liquidity Engine</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Showroom cash drawer vs bank ledgers</div>
            </div>

            <div style={{ textAlign: 'left', padding: '0.5rem', borderLeft: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>Automated</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>Laptop EMI Subsystem</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Installments, penalties & guarantors</div>
            </div>

            <div style={{ textAlign: 'left', padding: '0.5rem', borderLeft: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7' }}>ACID Cloud</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>PostgreSQL & Prisma</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Zero data loss transactional integrity</div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. INTERACTIVE SYSTEM TOUR & MODULE SHOWCASE
          ------------------------------------------------------------- */}
      <section id="modules" style={{
        padding: '5rem 1.5rem',
        backgroundColor: '#0b1120',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              System Walkthrough
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem' }}>
              Engineered Specifically for Electronics Operations
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto', fontSize: '1rem' }}>
              Select any core subsystem below to explore how Need Electro ERP replaces fragmented spreadsheets with unified business intelligence.
            </p>
          </div>

          {/* Module Selector Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2.5rem'
          }}>
            {[
              { id: 'pos', label: 'POS & Billing', icon: Receipt },
              { id: 'inventory', label: 'Serialized Inventory', icon: Boxes },
              { id: 'emi', label: 'Laptop EMI Engine', icon: CreditCard },
              { id: 'accounting', label: 'Cash & Liquidity', icon: DollarSign },
              { id: 'service', label: 'Repair Workshop', icon: Wrench },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '10px',
                    border: isActive ? '1px solid #008CFF' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isActive ? 'rgba(0, 140, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: isActive ? '#38bdf8' : '#cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Feature Display Frame */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(9, 17, 34, 0.95) 100%)',
            border: '1px solid rgba(0, 140, 255, 0.25)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center'
          }}>
            {/* Left Content Column */}
            <div>
              {activeTab === 'pos' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#008CFF', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <Receipt size={16} /> Instant Point-of-Sale Counter
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem' }}>
                    Dual A4 & 80mm Thermal Billing in Under 5 Seconds
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Built for rapid customer checkouts in busy electronics retail showrooms. Scan barcodes, assign exact serial numbers to each item sold, split payments across channels, and generate print-ready tax invoices.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Official A4 Tax Invoices with Need Electro Watermark & AMDADS GROUP details
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> 80mm Thermal Receipt format for rapid POS counter printing
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Multi-tender split payment: Cash in Hand, Bank Asia, bKash, Nagad
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Real-time customer due tracking with 1-click collection ledger
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'inventory' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#008CFF', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <Boxes size={16} /> Strict Serialized Inventory Matrix
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem' }}>
                    Every IMEI & Laptop Serial Tracked from Purchase to Sale
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Eliminates showroom shrinkage and stock discrepancies. Serialized units maintain complete audit records including purchase costs, supplier origin, customer sale date, warranty lifespan, and repair logs.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Barcode & Serial Number generation with batch import capabilities
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#10b981' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Inter-branch and warehouse stock transfers with chain-of-custody
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Automatic low-stock warnings & purchase replenishment alerts
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Instant stock valuation report by retail price and cost price
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'emi' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#008CFF', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <CreditCard size={16} /> Complete Laptop EMI Subsystem
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem' }}>
                    Flexible Installments with Automated Repayment Schedules
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Designed specifically for high-value laptops and devices sold on monthly installments. Automatically calculates down payments, monthly dues, late fees, and archives customer NID and guarantor profiles.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Automated monthly EMI repayment schedules (3, 6, 9, 12 months)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Printable Legal EMI Agreement contract with customer and guarantor signatures
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Late fee rules, grace periods, and overdue installment flags
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> One-click EMI installment receipt printing and account balance sync
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'accounting' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#008CFF', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <DollarSign size={16} /> Real-Time Cash & Liquidity Control
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem' }}>
                    Live Position Tracking Isolated from Artificial Revenue
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Know the exact physical cash in drawer versus digital bank balances at any second. Capital investments are isolated from taxable revenue, guaranteeing accurate profit-and-loss statements.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Real-time liquidity position: Opening Cash + Inflows − Outflows
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Dedicated Capital Investment registry with investor contact & equity %
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Cash Balance vs Accounting Profit Reconciliation engine
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Super Admin Cash Adjustment with permanent compliance audit logging
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'service' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#008CFF', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <Wrench size={16} /> Electrical & Hardware Workshop Center
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem' }}>
                    Job Cards, Technician Allocation & Spare Parts Ledger
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Manage client repair orders from intake to testing and delivery. Track device serial numbers, technician labor charges, spare parts deducted directly from inventory, and post-service warranty.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Service Job Card with reported issue, device serial, and estimated completion
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Technician assignment and individual technician performance tracking
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Workshop spare parts used with automated inventory deduction
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Post-repair service warranty validation (30 to 90 days coverage)
                    </li>
                  </ul>
                </>
              )}

              <button
                onClick={onOpenLogin}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '8px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>Access Module in Portal</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Right Interactive Preview Card */}
            <div style={{
              background: '#070d1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '0.5rem', fontFamily: 'monospace' }}>needelectroerp.production</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> ACTIVE
                </div>
              </div>

              {activeTab === 'pos' && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600 }}>LIVE POS CART SNAPSHOT</div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>HP Pavilion Core i5 12th Gen</div>
                      <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>SN: HP-SN-2026-9042 • 24M Warranty</div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>৳74,500</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Logitech G102 Gaming Mouse</div>
                      <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>SN: LOGI-G102-114 • 12M Warranty</div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>৳1,850</div>
                  </div>
                  <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Total Payable (VAT Inc.)</span>
                    <span style={{ color: '#00C6FF', fontSize: '1.1rem' }}>৳76,350</span>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600 }}>STOCK MATRIX & SERIAL AUDIT</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(0, 140, 255, 0.08)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Total SKU Catalog</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>142 Products</div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Available Serials</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>9,993 Units</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', padding: '0.5rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Asus ZenBook 14 (OLED)</span>
                      <strong style={{ color: '#10b981' }}>In Stock: 8 units</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Dell Latitude 5420</span>
                      <strong style={{ color: '#10b981' }}>In Stock: 14 units</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>MacBook Air M2 256GB</span>
                      <strong style={{ color: '#10b981' }}>In Stock: 6 units</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'emi' && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600 }}>ACTIVE EMI REPAYMENT ENGINE</div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700 }}>Dell Vostro 15 (EMI-2026-042)</span>
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>6 Months Plan</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Customer: Tanvir Hasan • Guarantor Verified</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                      <div style={{ color: '#94a3b8' }}>Total Financed</div>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>৳60,000</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                      <div style={{ color: '#94a3b8' }}>Monthly Due</div>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>৳10,000 / mo</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'accounting' && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600 }}>LIVE LIQUIDITY RECONCILIATION</div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Live Showroom Liquidity</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>৳1,67,789 BDT</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Physical Cash in Hand</span>
                      <strong style={{ color: '#f8fafc' }}>৳1,67,789</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Digital / Bank Accounts</span>
                      <strong style={{ color: '#f8fafc' }}>৳0</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                      <span>Capital Investments Isolated</span>
                      <strong>৳2,53,000</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'service' && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600 }}>REPAIR WORKSHOP JOB CARD</div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700 }}>Job #JOB-2026-118</span>
                      <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>In Progress</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Device: MacBook Pro 13" (No Display Signal)</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Assigned Technician</span>
                      <strong style={{ color: '#f8fafc' }}>Sumon (Lead Tech)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Parts Used</span>
                      <strong style={{ color: '#f8fafc' }}>Display Flex Cable (Original)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                      <span>Total Billable</span>
                      <strong>৳4,200</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. CORE CAPABILITIES (THE 6 PILLARS)
          ------------------------------------------------------------- */}
      <section id="capabilities" style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            Enterprise Capabilities
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem' }}>
            Engineered Without Compromise
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto', fontSize: '1rem' }}>
            Every module was built to solve the real operational challenges of electronics retail, wholesale procurement, and technical service delivery.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Card 1 */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2rem',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(0, 140, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#008CFF' }}>
              <Receipt size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem' }}>High-Speed POS & Billing</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Process counter sales in seconds. Includes multi-format printing for standard A4 Tax Invoices and 80mm thermal receipts with custom branding.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <span>Thermal & A4 Watermarked Print</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2rem',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#10b981' }}>
              <Boxes size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem' }}>Serialized IMEI / Barcode Stock</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Zero inventory leakage with individual device serial tracking. Follow every unit from purchase order intake through inter-branch transfers to end sale.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <span>Zero-Leakage Unit Audit</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2rem',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#f59e0b' }}>
              <CreditCard size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem' }}>Laptop EMI Subsystem</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Complete installment underwriting with down payment deduction, schedule generation, legal agreement printing, and guarantor tracking.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <span>Guarantors & Penalty Automation</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 4 */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2rem',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#818cf8' }}>
              <DollarSign size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem' }}>Dual-Engine Cash Liquidity</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Monitors physical cash in showroom drawer alongside digital banking channels. Excludes partner capital investments from taxable operating revenue.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <span>Non-Revenue Capital Isolation</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 5 */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2rem',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#06b6d4' }}>
              <Wrench size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem' }}>Technical Service Workshop</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Tracks customer repair intake, diagnostic tickets, technician labor costs, and automatic inventory spare-part deductions with warranty guarantees.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <span>Job Card Lifecycle Tracking</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 6 */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2rem',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#ef4444' }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem' }}>Bank-Grade RBAC & Security</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Granular permission matrix for Super Admins, Branch Managers, Cashiers, and Technicians. Tamper-evident activity logs track every business action.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <span>Full Audit Trail & Session Shield</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. TECHNOLOGY ARCHITECTURE
          ------------------------------------------------------------- */}
      <section id="technology" style={{
        padding: '5rem 1.5rem',
        backgroundColor: '#0b1120',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              Technology & Reliability
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem' }}>
              Production Cloud Architecture
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto', fontSize: '1rem' }}>
              Engineered with modern full-stack web standards ensuring sub-second response times, offline-resilience, and relational data integrity.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ color: '#008CFF', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Next.js 14 & React</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Full-stack serverless routes with modern reactive UI state management.</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>PostgreSQL & Prisma ORM</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>ACID-compliant relational database on Supabase with zero constraint deadlock.</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>TypeScript Strictly Typed</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>100% type-checked frontend and backend validation for zero runtime regressions.</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ color: '#a855f7', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Vercel Edge Global CDN</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>High availability production hosting with automatic CI/CD deployment pipelines.</div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. CALL TO ACTION BANNER
          ------------------------------------------------------------- */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(0, 43, 91, 0.8) 0%, rgba(7, 13, 30, 0.95) 100%)',
        position: 'relative',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <NeedElectroLogo size="md" showSisterConcern={true} theme="dark" className="justify-center" />
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#ffffff', margin: '1.5rem 0 1rem' }}>
            Ready to Access the ERP Portal?
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
            Authorized personnel can access showroom operations, POS counters, serialized inventories, and financial ledgers immediately.
          </p>

          <button
            onClick={onOpenLogin}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'linear-gradient(135deg, #0072FF 0%, #00C6FF 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '1rem 2.5rem',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0, 114, 255, 0.5)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Lock size={18} />
            <span>Sign In to Staff Portal</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* -------------------------------------------------------------
          7. EXECUTIVE FOOTER
          ------------------------------------------------------------- */}
      <footer id="contact" style={{
        backgroundColor: '#040710',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '4rem 1.5rem 2rem'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Col 1: Branding */}
          <div>
            <NeedElectroLogo size="sm" showSisterConcern={true} theme="dark" />
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem', maxWidth: '300px' }}>
              Comprehensive enterprise resource planning software purpose-built for multi-branch electronics, hardware retail, laptop EMI financing, and workshop engineering.
            </p>
          </div>

          {/* Col 2: Operations & Branch */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', marginBottom: '1rem' }}>Showroom & Operations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={15} color="#008CFF" />
                <span>Moulvibazar Main Showroom & Warehouse</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={15} color="#008CFF" />
                <span>Moulvibazar, Sylhet, Bangladesh</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} color="#008CFF" />
                <span>+880 1733-983752</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} color="#008CFF" />
                <span>info.needelectro@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Col 3: Core Modules */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', marginBottom: '1rem' }}>System Subsystems</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div>• Point of Sale (POS) Counter</div>
              <div>• Serialized Inventory & Barcodes</div>
              <div>• Laptop EMI & Installment Vault</div>
              <div>• Real-Time Liquidity Management</div>
              <div>• Electrical & Hardware Repair Center</div>
              <div>• Supplier Purchases & Ledger Entries</div>
            </div>
          </div>

          {/* Col 4: Corporate & Developer */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', marginBottom: '1rem' }}>Corporate Information</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
              <div>A Sister Concern of:</div>
              <strong style={{ color: '#008CFF', fontSize: '1rem', display: 'block', margin: '4px 0 8px' }}>AMDADS GROUP</strong>
              <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                Software Developed By AMDADS GROUP Engineering. Built with high-security enterprise standards.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} NEED ELECTRO ERP. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span>Software Developed By AMDADS GROUP</span>
            <span>•</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>v1.0.0 Production Release</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
