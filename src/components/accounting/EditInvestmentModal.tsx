import React, { useState } from 'react';
import { Investment, InvestmentType, FinancialAccount, PaymentMethod } from '../../types';
import { 
  X, Check, AlertTriangle, Building, User, Phone, Mail, MapPin, 
  CreditCard, Calendar, Hash, FileText, Landmark, Printer, ShieldCheck,
  Tag, Clock, AlertCircle
} from 'lucide-react';

interface EditInvestmentModalProps {
  investment: Investment;
  financialAccounts: FinancialAccount[];
  onSave: (updatedData: any) => Promise<boolean>;
  onPrintMemo?: (investment: Investment) => void;
  onClose: () => void;
}

export const EditInvestmentModal: React.FC<EditInvestmentModalProps> = ({
  investment,
  financialAccounts,
  onSave,
  onPrintMemo,
  onClose,
}) => {
  // Form State initialized from investment
  const [investorName, setInvestorName] = useState(investment.investorName || '');
  const [investorPhone, setInvestorPhone] = useState(investment.investorPhone || '');
  const [investorEmail, setInvestorEmail] = useState(investment.investorEmail || '');
  const [investorAddress, setInvestorAddress] = useState(investment.investorAddress || '');
  const [investorNid, setInvestorNid] = useState(investment.investorNid || '');
  const [organization, setOrganization] = useState(investment.organization || '');

  const [amount, setAmount] = useState<number>(Number(investment.amount) || 0);
  const [investmentType, setInvestmentType] = useState<InvestmentType>(
    (investment.investmentType as InvestmentType) || (investment.type as InvestmentType) || 'EQUITY'
  );
  const [depositAccountId, setDepositAccountId] = useState<string>(
    investment.depositAccountId || financialAccounts[0]?.id || 'acc-1'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    (investment.paymentMethod as PaymentMethod) || 'Cash'
  );
  const [date, setDate] = useState<string>(() => {
    if (!investment.date) return new Date().toISOString().split('T')[0];
    try {
      return new Date(investment.date).toISOString().split('T')[0];
    } catch {
      return String(investment.date).substring(0, 10);
    }
  });

  const [reference, setReference] = useState(investment.reference || '');
  const [referenceNumber, setReferenceNumber] = useState(investment.referenceNumber || '');
  const [purpose, setPurpose] = useState(investment.purpose || '');
  const [description, setDescription] = useState(investment.description || '');
  const [notes, setNotes] = useState(
    investment.notes && investment.notes !== '{}' && !investment.notes.startsWith('{')
      ? investment.notes
      : ''
  );
  const [status, setStatus] = useState<'ACTIVE' | 'REVERSED' | 'RETURNED' | 'CONVERTED'>(
    (investment.status as any) || 'ACTIVE'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const originalAmount = Number(investment.amount) || 0;
  const isAmountChanged = amount !== originalAmount;
  const isAccountChanged = depositAccountId !== investment.depositAccountId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!investorName.trim()) {
      setErrorMessage('Please enter the investor name.');
      return;
    }

    if (!amount || amount <= 0) {
      setErrorMessage('Please enter a valid capital amount greater than zero.');
      return;
    }

    if (!depositAccountId) {
      setErrorMessage('Please select a target deposit account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: investment.id,
        investorName: investorName.trim(),
        amount: Number(amount),
        investmentType,
        depositAccountId,
        paymentMethod,
        date,
        reference: reference.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        purpose: purpose.trim() || undefined,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        investorPhone: investorPhone.trim() || undefined,
        investorEmail: investorEmail.trim() || undefined,
        investorAddress: investorAddress.trim() || undefined,
        investorNid: investorNid.trim() || undefined,
        organization: organization.trim() || undefined,
        status,
      };

      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update investment record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '780px', 
          width: '95%', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--bg-card)',
          borderRadius: '14px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}
      >
        {/* MODAL HEADER */}
        <div 
          className="modal-header" 
          style={{ 
            padding: '1.25rem 1.5rem', 
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Building size={20} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Edit Capital Investment
              </h3>
              <span 
                style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                {investment.referenceNumber || investment.reference || investment.id}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Modify investor profile, capital allocation, deposit account, and accounting notes
            </p>
          </div>

          <button 
            className="btn btn-ghost btn-sm" 
            onClick={onClose}
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div 
            className="modal-body" 
            style={{ 
              padding: '1.5rem', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.25rem' 
            }}
          >
            {errorMessage && (
              <div 
                style={{ 
                  background: 'rgba(239, 68, 68, 0.15)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  borderRadius: '8px', 
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ef4444',
                  fontSize: '0.85rem'
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* BALANCE ADJUSTMENT NOTICE */}
            {(isAmountChanged || isAccountChanged) && (
              <div 
                style={{ 
                  background: 'rgba(245, 158, 11, 0.12)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)', 
                  borderRadius: '8px', 
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  color: '#f59e0b',
                  fontSize: '0.825rem'
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Automatic Financial Ledger Rebalancing:</strong>
                  {isAmountChanged && (
                    <div>
                      Capital amount changed from <strong>৳{originalAmount.toLocaleString()}</strong> to{' '}
                      <strong>৳{Number(amount || 0).toLocaleString()}</strong> (Net: {amount - originalAmount >= 0 ? '+' : ''}৳{(amount - originalAmount).toLocaleString()}).
                    </div>
                  )}
                  {isAccountChanged && (
                    <div>
                      Target account reassigned to <strong>{financialAccounts.find(a => a.id === depositAccountId)?.name || depositAccountId}</strong>.
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '2px' }}>
                    Financial account balances and ledger entries will be mathematically synchronized upon save.
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 1: INVESTOR PROFILE */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.01)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} />
                1. Investor Profile & Identification
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Investor Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Khaladur Rahman"
                    value={investorName}
                    onChange={e => setInvestorName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Organization / Entity (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Amdadur Group / Tech Syndicate"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Contact Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +880 1711-XXXXXX"
                    value={investorPhone}
                    onChange={e => setInvestorPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. investor@example.com"
                    value={investorEmail}
                    onChange={e => setInvestorEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>National ID / Passport</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 1992837492817"
                    value={investorNid}
                    onChange={e => setInvestorNid(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Investor Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Kusumbag, Moulvibazar, Sylhet"
                    value={investorAddress}
                    onChange={e => setInvestorAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: CAPITAL & FINANCIAL ALLOCATION */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.01)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Landmark size={15} />
                2. Capital & Financial Allocation
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Capital Amount (৳) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    style={{ fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}
                    required
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    BDT {Number(amount || 0).toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Investment Type *</label>
                  <select
                    className="form-control"
                    value={investmentType}
                    onChange={e => setInvestmentType(e.target.value as InvestmentType)}
                    required
                  >
                    <option value="EQUITY">Equity (Owner / Partner Capital)</option>
                    <option value="SEED_FUNDING">Seed Funding (Startup Capital)</option>
                    <option value="DIRECTOR_LOAN">Director Loan</option>
                    <option value="WORKING_CAPITAL">Working Capital</option>
                    <option value="OTHER">Other Investment</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Deposit Target Account *</label>
                  <select
                    className="form-control"
                    value={depositAccountId}
                    onChange={e => setDepositAccountId(e.target.value)}
                    required
                  >
                    {financialAccounts.length === 0 ? (
                      <option value="acc-1">Main Cash Drawer (Default Cash Vault)</option>
                    ) : (
                      financialAccounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.type}) — Bal: ৳{Number(a.balance || 0).toLocaleString()}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Payment Method *</label>
                  <select
                    className="form-control"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="bKash">bKash Business</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Investment Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Record Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                  >
                    <option value="ACTIVE">ACTIVE (Normal Capital Stake)</option>
                    <option value="REVERSED">REVERSED (Voided / Reconciled Out)</option>
                    <option value="RETURNED">RETURNED (Capital Withdrawn)</option>
                    <option value="CONVERTED">CONVERTED (Converted to Equity)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: PURPOSE, REFERENCES & NOTES */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.01)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={15} />
                3. Purpose, Reference & Terms
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>External Reference / Cheque No.</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. CHQ-883921 / SLIP-102"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Official Memo Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Purpose of Capital</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Shop Assets & Inventory Procurement"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Seed funding for Moulvibazar Showroom opening"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Notes / Special Terms</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Partner agreement signed; eligible for 25% pool"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MODAL FOOTER */}
          <div 
            className="modal-footer" 
            style={{ 
              padding: '1rem 1.5rem', 
              borderTop: '1px solid var(--border-color)', 
              background: 'var(--bg-card-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              {onPrintMemo && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => onPrintMemo(investment)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Printer size={14} />
                  Print Official Memo
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <Check size={16} />
                {isSubmitting ? 'Saving Changes...' : 'Save Investment Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
