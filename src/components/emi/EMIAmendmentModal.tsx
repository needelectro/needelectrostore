import React, { useState } from 'react';
import { EMIAccount, EMIInstallment, User } from '../../types';
import { 
  FileEdit, AlertTriangle, CheckCircle2, Lock, Calendar, DollarSign, 
  RotateCcw, Save, X, ShieldAlert, Sparkles, Scale
} from 'lucide-react';

interface EMIAmendmentModalProps {
  account: EMIAccount;
  currentUser: User;
  onClose: () => void;
  onSuccess: (updatedAccount: any) => void;
}

export const EMIAmendmentModal: React.FC<EMIAmendmentModalProps> = ({
  account,
  currentUser,
  onClose,
  onSuccess
}) => {
  // Parse existing contract terms if JSON
  let existingTermsObj: any = null;
  try {
    if (account.contractTerms && account.contractTerms.startsWith('{')) {
      existingTermsObj = JSON.parse(account.contractTerms);
    }
  } catch (e) {
    existingTermsObj = null;
  }

  // Separate paid vs unpaid installments
  const verifiedPaidInstallments = account.installments.filter(i => i.status === 'PAID');
  const initialUnpaid = account.installments.filter(i => i.status !== 'PAID');

  const [unpaidInstallments, setUnpaidInstallments] = useState(
    initialUnpaid.map(i => ({
      id: i.id,
      installmentNumber: i.installmentNumber,
      dueDate: i.dueDate,
      amount: i.amount,
      status: i.status || 'PENDING'
    }))
  );

  const [amendmentReason, setAmendmentReason] = useState('');
  const [amendmentNote, setAmendmentNote] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculations
  const totalPaidSum = verifiedPaidInstallments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const currentUnpaidSum = unpaidInstallments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalScheduledSum = totalPaidSum + currentUnpaidSum;
  const targetFinanced = Number(account.financedAmount) || 0;
  const diff = currentUnpaidSum - (Number(account.remainingBalance) || (targetFinanced - totalPaidSum));

  const handleDateChange = (id: string, newDate: string) => {
    setUnpaidInstallments(prev =>
      prev.map(item => item.id === id ? { ...item, dueDate: newDate } : item)
    );
  };

  const handleAmountChange = (id: string, newAmount: number) => {
    setUnpaidInstallments(prev =>
      prev.map(item => item.id === id ? { ...item, amount: Math.max(0, Math.round(newAmount)) } : item)
    );
  };

  const handleAutoReconcile = () => {
    if (unpaidInstallments.length === 0) return;
    const targetRemaining = Number(account.remainingBalance) || (targetFinanced - totalPaidSum);
    
    // Spread evenly across unpaid installments except last one, putting remainder on last
    const count = unpaidInstallments.length;
    const basePerItem = Math.floor(targetRemaining / count);
    const lastItemAmount = targetRemaining - (basePerItem * (count - 1));

    setUnpaidInstallments(prev =>
      prev.map((item, idx) => ({
        ...item,
        amount: idx === count - 1 ? lastItemAmount : basePerItem
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!amendmentReason.trim()) {
      setErrorMsg('Please specify an official reason for this contract amendment.');
      return;
    }

    if (!isConfirmed) {
      setErrorMsg('You must check the confirmation box acknowledging this formal amendment.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build amendment log
      const amendmentRecord = {
        amendmentNumber: `AMD-${Date.now().toString().slice(-4)}`,
        amendedAt: new Date().toISOString(),
        amendedBy: currentUser.name,
        role: currentUser.role,
        reason: amendmentReason.trim(),
        notes: amendmentNote.trim(),
        previousRemaining: account.remainingBalance,
        newRemaining: currentUnpaidSum,
        modifiedInstallmentCount: unpaidInstallments.length
      };

      const updatedTermsObj = existingTermsObj ? {
        ...existingTermsObj,
        amendments: [...(existingTermsObj.amendments || []), amendmentRecord]
      } : {
        amendments: [amendmentRecord],
        originalTerms: account.contractTerms
      };

      const payload = {
        remainingBalance: currentUnpaidSum,
        monthlyInstallment: unpaidInstallments.length > 0 ? unpaidInstallments[0].amount : account.monthlyInstallment,
        amendedInstallments: unpaidInstallments.map(i => ({
          id: i.id,
          dueDate: i.dueDate,
          amount: i.amount,
          status: i.status
        })),
        contractTerms: updatedTermsObj,
        amendmentReason: amendmentReason.trim()
      };

      const res = await fetch(`/api/emi/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to apply amendment.');
      }

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing contract amendment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content modal-content-lg" style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileEdit size={22} className="text-warning" />
            <span>Formal EMI Contract Amendment & Restructuring</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={isSubmitting}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Account Overview Header */}
          <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Contract No:</span>
              <p style={{ fontWeight: 700, margin: 0, color: 'var(--brand-primary)' }}>{account.emiNumber}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
              <p style={{ fontWeight: 700, margin: 0 }}>{account.customerName}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Product:</span>
              <p style={{ fontWeight: 600, margin: 0 }}>{account.productName}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Serial Number:</span>
              <p style={{ fontWeight: 600, margin: 0, fontFamily: 'monospace' }}>{account.serialNumber}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Verified Paid:</span>
              <p style={{ fontWeight: 700, margin: 0, color: '#16a34a' }}>৳{totalPaidSum.toLocaleString()} ({verifiedPaidInstallments.length} inst)</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Current Remaining:</span>
              <p style={{ fontWeight: 700, margin: 0, color: '#2563eb' }}>৳{account.remainingBalance.toLocaleString()}</p>
            </div>
          </div>

          {/* Audit Rule Notification */}
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.85rem', color: '#92400e', fontSize: '0.85rem', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Audit & Compliance Guardrail:</strong>
              <p style={{ margin: '4px 0 0 0' }}>
                All historical verified collections (৳{totalPaidSum.toLocaleString()}) are strictly immutable and protected by PostgreSQL transaction controls.
                Only future unpaid installments can have their due dates or amounts restructured. All changes will be logged under your administrator credentials with timestamps.
              </p>
            </div>
          </div>

          {/* Locked Verified Paid Installments */}
          {verifiedPaidInstallments.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                <Lock size={15} /> Verified Historical Payments ({verifiedPaidInstallments.length} Installments — Immutable)
              </div>
              <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <table className="table" style={{ margin: 0, fontSize: '0.8rem' }}>
                  <thead style={{ background: 'var(--surface-color)' }}>
                    <tr>
                      <th>#</th>
                      <th>Due Date</th>
                      <th>Paid Date</th>
                      <th>Amount Paid</th>
                      <th>Status</th>
                      <th>Receipt / Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifiedPaidInstallments.map(i => (
                      <tr key={i.id} style={{ opacity: 0.85 }}>
                        <td style={{ fontWeight: 700 }}>#{i.installmentNumber}</td>
                        <td>{i.dueDate}</td>
                        <td style={{ color: '#16a34a', fontWeight: 600 }}>{i.paidDate || 'Verified'}</td>
                        <td style={{ fontWeight: 700, color: '#16a34a' }}>৳{i.amount.toLocaleString()}</td>
                        <td><span className="badge badge-success">PAID</span></td>
                        <td>{i.receiptNumber || 'Verified Payment'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Editable Future Installments */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} /> Future & Unpaid Installments ({unpaidInstallments.length} Installments)
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAutoReconcile}
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Automatically redistribute remaining balance across unpaid installments"
              >
                <RotateCcw size={13} /> Auto-Balance Unpaid Sum
              </button>
            </div>

            {unpaidInstallments.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                All installments for this EMI contract have already been completed and paid in full.
              </div>
            ) : (
              <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <table className="table" style={{ margin: 0, fontSize: '0.85rem' }}>
                  <thead style={{ background: 'var(--surface-color)', position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ width: '8%' }}>#</th>
                      <th style={{ width: '38%' }}>Due Date</th>
                      <th style={{ width: '34%' }}>Installment Amount (৳)</th>
                      <th style={{ width: '20%' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidInstallments.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700 }}>#{item.installmentNumber}</td>
                        <td>
                          <input
                            type="date"
                            className="form-input form-input-sm"
                            value={item.dueDate}
                            onChange={e => handleDateChange(item.id, e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>৳</span>
                            <input
                              type="number"
                              className="form-input form-input-sm"
                              value={item.amount}
                              min={0}
                              onChange={e => handleAmountChange(item.id, Number(e.target.value))}
                              required
                            />
                          </div>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={item.status}
                            onChange={e => {
                              const s = e.target.value as any;
                              setUnpaidInstallments(prev => prev.map(x => x.id === item.id ? { ...x, status: s } : x));
                            }}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="OVERDUE">OVERDUE</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Schedule Reconciliation Box */}
          <div style={{
            background: diff === 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${diff === 0 ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={18} color={diff === 0 ? '#16a34a' : '#dc2626'} />
              <div>
                <strong>Reconciliation Balance:</strong> Unpaid Sum ৳{currentUnpaidSum.toLocaleString()} + Paid ৳{totalPaidSum.toLocaleString()} = ৳{totalScheduledSum.toLocaleString()}
              </div>
            </div>
            <div>
              {diff === 0 ? (
                <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} /> Exactly Reconciled (Diff: ৳0)
                </span>
              ) : (
                <span style={{ color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={16} /> Variance: {diff > 0 ? `+৳${diff.toLocaleString()}` : `-৳${Math.abs(diff).toLocaleString()}`}
                </span>
              )}
            </div>
          </div>

          {/* Mandatory Amendment Reason & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Formal Reason for Restructuring / Amendment *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Due date extended by 15 days upon customer written request and management approval"
                value={amendmentReason}
                onChange={e => setAmendmentReason(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Additional Internal Notes / Clause Additions (Optional)
              </label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Reference any approved document, branch manager sign-off, or special customer conditions..."
                value={amendmentNote}
                onChange={e => setAmendmentNote(e.target.value)}
              />
            </div>
          </div>

          {/* Administrator Affirmative Checkbox */}
          <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={e => setIsConfirmed(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <span>
                I, <strong>{currentUser.name}</strong> ({currentUser.role}), formally confirm that this amendment is authorized, reconciles with the customer contract obligations, and preserves historical verified payment records without modification.
              </span>
            </label>
          </div>

          {errorMsg && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} /> {errorMsg}
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: 0 }}>
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
              disabled={isSubmitting || !isConfirmed || !amendmentReason.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSubmitting ? (
                <>Applying Amendment...</>
              ) : (
                <>
                  <Save size={16} /> Save & Apply Contract Amendment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
