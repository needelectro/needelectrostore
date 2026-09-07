import React, { useState } from 'react';
import { useERP } from '../../services/erpStore';
import { 
  DollarSign, Landmark, Smartphone, Users, Truck, Package, 
  ShieldCheck, CheckCircle2, X, Plus, AlertCircle 
} from 'lucide-react';
import { OpeningBalanceEntry } from '../../types';

interface OpeningBalancesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpeningBalancesModal: React.FC<OpeningBalancesModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, financialAccounts, customers, suppliers, 
    openingBalances, recordOpeningBalance, addToast 
  } = useERP();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [balanceType, setBalanceType] = useState<OpeningBalanceEntry['type']>('CASH');
  const [targetId, setTargetId] = useState('acc-1');
  const [targetName, setTargetName] = useState('Main Cash Drawer');
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const handleTypeChange = (type: OpeningBalanceEntry['type']) => {
    setBalanceType(type);
    if (type === 'CASH') {
      const cashAcc = financialAccounts.find(a => a.type === 'CASH') || financialAccounts[0];
      setTargetId(cashAcc?.id || 'acc-1');
      setTargetName(cashAcc?.name || 'Main Cash Drawer');
    } else if (type === 'BANK') {
      const bankAcc = financialAccounts.find(a => a.type === 'BANK') || financialAccounts[1];
      setTargetId(bankAcc?.id || 'acc-2');
      setTargetName(bankAcc?.name || 'Bank Asia Current Account');
    } else if (type === 'MOBILE_BANKING') {
      const mfsAcc = financialAccounts.find(a => a.type === 'MOBILE_BANKING') || financialAccounts[2];
      setTargetId(mfsAcc?.id || 'acc-3');
      setTargetName(mfsAcc?.name || 'bKash Merchant Wallet');
    } else if (type === 'CUSTOMER_DUE') {
      const cust = customers[0];
      setTargetId(cust?.id || 'cust-1');
      setTargetName(cust?.name || 'Customer Receivable');
    } else if (type === 'SUPPLIER_PAYABLE') {
      const sup = suppliers[0];
      setTargetId(sup?.id || 'sup-1');
      setTargetName(sup?.name || 'Supplier Payable');
    } else if (type === 'STOCK') {
      setTargetId('CENTRAL-WH');
      setTargetName('Central Warehouse Starting Stock');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSuperAdmin) {
      setError('Opening balance entries strictly require Super Admin authorization.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    const res = recordOpeningBalance({
      date,
      type: balanceType,
      targetId,
      targetName,
      amount: Number(amount),
      notes: notes || `Initial ${balanceType} balance authorization`,
      approvedBy: `${currentUser.name} (Super Admin)`
    });

    setIsSubmitting(false);
    if (res.success) {
      setAmount('');
      setNotes('');
    } else {
      setError(res.error || 'Failed to post opening balance entry.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 25, 0.88)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1.5rem',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        background: '#0f172a',
        border: '1px solid rgba(2, 132, 199, 0.35)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(2, 132, 199, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-warning" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                SUPER ADMIN AUTHORIZED
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Double-Entry Journal Posting</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              Post Opening Business Balances
            </h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.75rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
              gap: '8px'
            }}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} color="#38bdf8" />
              <span>Authorize New Opening Entry</span>
            </div>

            {/* Type selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
              {[
                { type: 'CASH', label: 'Cash in Hand', icon: DollarSign },
                { type: 'BANK', label: 'Bank A/C', icon: Landmark },
                { type: 'MOBILE_BANKING', label: 'Mobile MFS', icon: Smartphone },
                { type: 'CUSTOMER_DUE', label: 'Customer Due', icon: Users },
                { type: 'SUPPLIER_PAYABLE', label: 'Supplier Due', icon: Truck },
                { type: 'STOCK', label: 'Stock Value', icon: Package }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = balanceType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleTypeChange(item.type as any)}
                    style={{
                      background: isSelected ? 'rgba(2, 132, 199, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${isSelected ? '#0284c7' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '10px',
                      padding: '0.65rem 0.4rem',
                      color: isSelected ? '#38bdf8' : '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '0.85rem' }}>
              {/* Target Entity / Account */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Target Account / Ledger Entity *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={targetName}
                  onChange={e => setTargetName(e.target.value)}
                  placeholder="e.g. Bank Asia Current A/C"
                  required
                />
              </div>

              {/* Amount */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Opening Balance Amount (৳ BDT) *
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  min="1"
                  required
                />
              </div>

              {/* Date */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Effective Date *
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                Audit Verification Reference & Notes
              </label>
              <input
                type="text"
                className="form-input"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Verified bank statement balance as of opening date"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !isSuperAdmin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0062d2 100%)'
                }}
              >
                <ShieldCheck size={16} />
                <span>Post & Authorize Opening Balance</span>
              </button>
            </div>
          </form>

          {/* Historical Opening Balance Audit Entries */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
              Authorized Opening Balance Ledgers ({openingBalances.length})
            </h3>
            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Target Account / Entity</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Authorized By</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {openingBalances.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                        No opening balance entries recorded yet.
                      </td>
                    </tr>
                  ) : (
                    openingBalances.map(entry => (
                      <tr key={entry.id}>
                        <td style={{ fontWeight: 600 }}>{entry.date}</td>
                        <td>
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                            {entry.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{entry.targetName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>
                          ৳{entry.amount.toLocaleString()}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{entry.approvedBy}</td>
                        <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{entry.createdAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
