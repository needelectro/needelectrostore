import React from 'react';
import { Investment, FinancialAccount, SystemSettings } from '../../types';
import { Printer, X, Download, ShieldCheck, Building } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';

interface PrintInvestmentLedgerModalProps {
  investments: Investment[];
  financialAccounts: FinancialAccount[];
  settings: SystemSettings;
  onClose: () => void;
}

export const PrintInvestmentLedgerModal: React.FC<PrintInvestmentLedgerModalProps> = ({
  investments,
  financialAccounts,
  settings,
  onClose,
}) => {
  const activeInvestments = investments.filter(i => i.status !== 'REVERSED');
  const totalActiveCapital = activeInvestments.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalReversedCapital = investments
    .filter(i => i.status === 'REVERSED')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="modal-overlay" style={{ zIndex: 10000, overflowY: 'auto', padding: '1rem' }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '1000px',
          width: '100%',
          margin: '2rem auto',
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* ACTION BAR (HIDDEN IN PRINT) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            background: '#1e293b',
            color: '#ffffff',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Capital Injections & Investment Ledger — Official Print View
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <Printer size={15} />
              Print Ledger (A4)
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <X size={15} />
              Close
            </button>
          </div>
        </div>

        {/* PRINTABLE A4 CONTAINER */}
        <div
          id="printable-investment-ledger"
          style={{
            padding: '2.5rem',
            background: '#ffffff',
            color: '#0f172a',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2.5px solid #000000',
              paddingBottom: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <NeedElectroLogo variant="master-image" size="lg" theme="light" showSisterConcern />
              <div style={{ marginTop: '0.4rem', fontSize: '11px', color: '#334155', lineHeight: 1.4 }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#000000' }}>
                  {settings?.companyName || 'NEED ELECTRO'}
                </div>
                <div>{settings?.address || 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet'}</div>
                <div>
                  <strong>Hotline:</strong> {settings?.phone || '+880 1733-983752'} | <strong>Email:</strong> {settings?.email || 'contact.amdadur@gmail.com'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'inline-block',
                  background: '#000000',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '5px 14px',
                  borderRadius: '3px',
                  marginBottom: '6px',
                }}
              >
                CAPITAL INVESTMENT LEDGER
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                <div><strong>Statement Date:</strong> {currentDate}</div>
                <div><strong>Total Active Capital:</strong> ৳{totalActiveCapital.toLocaleString()}</div>
                <div><strong>Total Records:</strong> {investments.length} injections</div>
              </div>
            </div>
          </div>

          {/* SUMMARY STATS TILES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem', background: '#f8fafc' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Total Active Capital Injected
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f766e', marginTop: '2px' }}>
                BDT {totalActiveCapital.toLocaleString()}
              </div>
            </div>

            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem', background: '#f8fafc' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Active Capital Deposits
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#0369a1', marginTop: '2px' }}>
                {activeInvestments.length} Active Records
              </div>
            </div>

            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem', background: '#f8fafc' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Reversed / Voided Capital
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#b91c1c', marginTop: '2px' }}>
                BDT {totalReversedCapital.toLocaleString()}
              </div>
            </div>
          </div>

          {/* LEDGER TABLE */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '11px',
              marginBottom: '2rem',
            }}
          >
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #000000', borderTop: '1px solid #cbd5e1' }}>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 800 }}>SL</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 800 }}>Ref ID</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 800 }}>Investor Name</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 800 }}>Type</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 800 }}>Date</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 800 }}>Target Account</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 800 }}>Capital Amount</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 800 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv, index) => {
                const acc = financialAccounts.find(a => a.id === inv.depositAccountId);
                const isRev = inv.status === 'REVERSED';
                const formattedDate = inv.date
                  ? new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—';

                return (
                  <tr
                    key={inv.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                    }}
                  >
                    <td style={{ padding: '7px 6px', color: '#64748b' }}>{index + 1}</td>
                    <td style={{ padding: '7px 6px', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                      {inv.referenceNumber || inv.reference || inv.id}
                    </td>
                    <td style={{ padding: '7px 6px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{inv.investorName}</div>
                      {inv.organization && (
                        <div style={{ fontSize: '9px', color: '#64748b' }}>{inv.organization}</div>
                      )}
                    </td>
                    <td style={{ padding: '7px 6px' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '9px',
                          fontWeight: 700,
                          background: '#e2e8f0',
                          color: '#334155',
                        }}
                      >
                        {inv.investmentType || inv.type || 'EQUITY'}
                      </span>
                    </td>
                    <td style={{ padding: '7px 6px', color: '#334155' }}>{formattedDate}</td>
                    <td style={{ padding: '7px 6px' }}>
                      <div style={{ fontWeight: 600 }}>{acc?.name || 'Main Cash'}</div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>{inv.paymentMethod || 'Cash'}</div>
                    </td>
                    <td
                      style={{
                        padding: '7px 6px',
                        textAlign: 'right',
                        fontWeight: 800,
                        color: isRev ? '#dc2626' : '#059669',
                      }}
                    >
                      ৳{Number(inv.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '7px 6px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontSize: '9px',
                          fontWeight: 800,
                          background: isRev ? '#fee2e2' : '#dcfce7',
                          color: isRev ? '#991b1b' : '#166534',
                        }}
                      >
                        {isRev ? 'REVERSED' : 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f1f5f9', borderTop: '2px solid #000000', fontWeight: 800 }}>
                <td colSpan={6} style={{ padding: '10px 6px', textAlign: 'right', fontSize: '12px' }}>
                  TOTAL ACTIVE CAPITAL INJECTED:
                </td>
                <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '13px', color: '#059669' }}>
                  BDT {totalActiveCapital.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {/* SIGNATURES */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '4rem',
              paddingTop: '1rem',
            }}
          >
            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ borderBottom: '1px solid #000000', marginBottom: '6px', height: '30px' }}></div>
              <div style={{ fontWeight: 700, fontSize: '11px', color: '#000000' }}>Prepared By</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Accounts & Audit Officer</div>
            </div>

            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ borderBottom: '1px solid #000000', marginBottom: '6px', height: '30px' }}></div>
              <div style={{ fontWeight: 700, fontSize: '11px', color: '#000000' }}>Approved By</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Managing Director, NEED ELECTRO</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
