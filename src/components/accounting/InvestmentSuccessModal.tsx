import React, { useState } from 'react';
import { Investment } from '../../types';
import { CheckCircle2, FileText, Printer, Download, X, AlertTriangle, Loader2 } from 'lucide-react';

interface InvestmentSuccessModalProps {
  investment: Investment;
  onViewMemo: () => void;
  onPrintMemo: () => void;
  onDownloadPDF: () => void;
  onClose: () => void;
}

export const InvestmentSuccessModal: React.FC<InvestmentSuccessModalProps> = ({
  investment,
  onViewMemo,
  onPrintMemo,
  onDownloadPDF,
  onClose,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: () => void | Promise<void>) => {
    try {
      setIsProcessing(true);
      setHasError(false);
      await action();
    } catch (err) {
      console.error('Memo action error:', err);
      setHasError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const amountVal = Number(investment.amount) || 0;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content modal-content-md" style={{ maxWidth: '480px', textAlign: 'center' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: 0, paddingBottom: '1.5rem' }}>
          {/* Success Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Investment Added Successfully
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            The capital investment transaction has been recorded and posted to the Central Account Ledger.
          </p>

          {/* Investment Details Box */}
          <div
            style={{
              background: 'var(--bg-card-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Investment No:</span>
              <strong style={{ fontSize: '0.95rem', fontFamily: 'monospace', color: 'var(--brand-primary)' }}>
                {investment.referenceNumber}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Investor:</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {investment.investorName}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Amount:</span>
              <strong style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>
                BDT {amountVal.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Error Message if generation failed */}
          {hasError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#ef4444',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textAlign: 'left',
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <div>
                <strong>Memo generation failed.</strong> You can retry below or view it later from the Investment List.
              </div>
            </div>
          )}

          {/* Action Buttons as requested */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => handleAction(onViewMemo)}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <FileText size={18} />
              View Memo
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleAction(onPrintMemo)}
                disabled={isProcessing}
                style={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <Printer size={16} />
                Print Memo
              </button>

              <button
                className="btn btn-success"
                onClick={() => handleAction(onDownloadPDF)}
                disabled={isProcessing}
                style={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Preparing...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Download PDF
                  </>
                )}
              </button>
            </div>

            {hasError && (
              <button
                className="btn btn-warning btn-sm"
                onClick={() => handleAction(onViewMemo)}
                style={{ marginTop: '0.25rem' }}
              >
                Retry Memo Generation
              </button>
            )}

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
