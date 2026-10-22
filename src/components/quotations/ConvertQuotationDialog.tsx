import React, { useState } from 'react';
import { Quotation, Product } from '../../types';
import { useERP } from '../../services/erpStore';
import { CheckCircle2, AlertTriangle, ArrowRight, X, Loader2, Store, CreditCard, ShoppingBag } from 'lucide-react';

interface ConvertQuotationDialogProps {
  quotation: Quotation;
  isOpen: boolean;
  onClose: () => void;
  onConverted: (sale: any) => void;
}

export const ConvertQuotationDialog: React.FC<ConvertQuotationDialogProps> = ({
  quotation,
  isOpen,
  onClose,
  onConverted,
}) => {
  const { products, branches, financialAccounts, convertQuotationToOrder, addToast } = useERP();

  const [selectedBranchId, setSelectedBranchId] = useState<string>(quotation.branchId || branches[0]?.id || 'DHK-MAIN');
  const [paymentOption, setPaymentOption] = useState<'DUE' | 'PAID' | 'PARTIAL'>('DUE');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paymentAccountId, setPaymentAccountId] = useState<string>(financialAccounts[0]?.id || '');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [allowStockOverride, setAllowStockOverride] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  if (!isOpen || !quotation) return null;

  // Real-time stock check for items
  const itemsWithStock = (quotation.items || []).map((it) => {
    const prod = products.find((p) => p.id === it.productId || p.sku === it.sku);
    const stockAvailable = prod ? prod.currentStock : 0;
    const hasShortage = stockAvailable < it.quantity;
    return {
      ...it,
      currentStock: stockAvailable,
      hasShortage,
    };
  });

  const hasAnyShortage = itemsWithStock.some((it) => it.hasShortage);

  const handleConfirmConvert = async () => {
    if (hasAnyShortage && !allowStockOverride) {
      addToast('warning', 'Stock Shortage', 'Please acknowledge the inventory shortage notice before proceeding.');
      return;
    }

    setIsConverting(true);
    try {
      const effectivePaid =
        paymentOption === 'PAID'
          ? quotation.grandTotal
          : paymentOption === 'PARTIAL'
          ? paidAmount
          : 0;

      const res = await convertQuotationToOrder(quotation.id, {
        branchIdOverride: selectedBranchId,
        paymentMethod: effectivePaid > 0 ? paymentMethod : undefined,
        paymentAccountId: effectivePaid > 0 ? paymentAccountId : undefined,
        paidAmountInput: effectivePaid,
        allowStockOverride,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.sale) {
        onConverted(res.sale);
        onClose();
      }
    } catch (e: any) {
      // Toast already handled by erpStore
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <ShoppingBag className="text-primary" size={20} />
            Convert Quotation to Sales Order
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isConverting}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Summary Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(0, 43, 91, 0.08) 100%)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Quotation Number
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'monospace' }}>
                  {quotation.quotationNumber}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  <strong>Customer:</strong> {quotation.customerName} ({quotation.customerPhone})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Quoted Total
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>
                  {quotation.currencySymbol} {Number(quotation.grandTotal).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {quotation.items?.length || 0} items
                </div>
              </div>
            </div>
          </div>

          {/* Stock Availability Pre-check */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
              Line Items & Current Inventory Status:
            </label>
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                fontSize: '0.825rem',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card-muted)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Quoted Qty</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Current Stock</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsWithStock.map((it, idx) => (
                    <tr key={it.id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <div style={{ fontWeight: 600 }}>{it.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {it.sku}</div>
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>{it.quantity}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                        {it.hasShortage ? (
                          <span
                            style={{
                              color: '#ef4444',
                              fontWeight: 700,
                              background: 'rgba(239, 68, 68, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {it.currentStock} in stock (Low)
                          </span>
                        ) : (
                          <span
                            style={{
                              color: '#10b981',
                              fontWeight: 700,
                              background: 'rgba(16, 185, 129, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {it.currentStock} in stock
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                        {quotation.currencySymbol} {Number(it.lineTotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasAnyShortage && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'flex-start',
                }}
              >
                <AlertTriangle size={18} className="text-warning" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  <strong>Inventory Notice:</strong> One or more items in this quotation have insufficient showroom stock.
                  Converting will allocate and decrement available stock.
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', cursor: 'pointer', fontWeight: 700 }}>
                    <input
                      type="checkbox"
                      checked={allowStockOverride}
                      onChange={(e) => setAllowStockOverride(e.target.checked)}
                    />
                    I acknowledge inventory shortage and confirm order creation.
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Fulfillment & Payment Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>
                Fulfillment Branch:
              </label>
              <select
                className="input input-sm w-full"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>
                Order Payment Status:
              </label>
              <select
                className="input input-sm w-full"
                value={paymentOption}
                onChange={(e) => {
                  const opt = e.target.value as any;
                  setPaymentOption(opt);
                  if (opt === 'PAID') {
                    setPaidAmount(Number(quotation.grandTotal));
                  } else if (opt === 'DUE') {
                    setPaidAmount(0);
                  }
                }}
              >
                <option value="DUE">Mark as Due / Unpaid</option>
                <option value="PAID">Customer Paid Full Amount</option>
                <option value="PARTIAL">Partial Advance Payment</option>
              </select>
            </div>
          </div>

          {paymentOption !== 'DUE' && (
            <div
              style={{
                background: 'var(--bg-card-muted)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: paymentOption === 'PARTIAL' ? '1fr 1fr 1fr' : '1fr 1fr',
                gap: '0.75rem',
              }}
            >
              {paymentOption === 'PARTIAL' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                    Paid Amount ({quotation.currencySymbol}):
                  </label>
                  <input
                    type="number"
                    className="input input-sm w-full"
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                    min={0}
                    max={Number(quotation.grandTotal)}
                  />
                </div>
              )}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                  Payment Method:
                </label>
                <select
                  className="input input-sm w-full"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                  Deposit Account:
                </label>
                <select
                  className="input input-sm w-full"
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                >
                  {financialAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>
              Order Conversion Notes (Optional):
            </label>
            <textarea
              className="input input-sm w-full"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Customer confirmed order via phone call; proceed with delivery"
            />
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={isConverting}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleConfirmConvert}
            disabled={isConverting || (hasAnyShortage && !allowStockOverride)}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #002B5B 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700,
            }}
          >
            {isConverting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Converting...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Confirm & Convert to Sales Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
