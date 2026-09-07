import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { BookOpen, Search, Printer, ArrowDownRight, ArrowUpRight, User, Truck } from 'lucide-react';

interface LedgersModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const LedgersModule: React.FC<LedgersModuleProps> = ({ onNavigate }) => {
  const { customers, suppliers, sales, emiPayments, ledgerEntries, purchases, returns } = useERP();
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [selectedPartyId, setSelectedPartyId] = useState<string>(customers[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedPartyId) || customers[0];
  const selectedSupplier = suppliers.find(s => s.id === selectedPartyId) || suppliers[0];

  // Customer transactions
  const customerInvoices = selectedCustomer ? sales.filter(s => s.customerId === selectedCustomer.id) : [];
  const customerEmiCol = selectedCustomer ? emiPayments.filter(p => p.customerId === selectedCustomer.id) : [];
  const customerReturns = selectedCustomer ? returns.filter(r => r.customerId === selectedCustomer.id) : [];

  // Build Chronological Customer Ledger Entries
  interface LedgerRow {
    date: string;
    type: string;
    ref: string;
    description: string;
    debit: number; // Customer owes / Supplier payment
    credit: number; // Customer paid / Supplier intake
  }

  const customerRows: LedgerRow[] = [];
  customerInvoices.forEach(inv => {
    customerRows.push({
      date: inv.date,
      type: 'INVOICE',
      ref: inv.invoiceNumber,
      description: `Sale: ${inv.items.map(i => i.productName).join(', ')}`,
      debit: inv.grandTotal,
      credit: inv.paidAmount
    });
  });

  customerEmiCol.forEach(p => {
    customerRows.push({
      date: p.paymentDate,
      type: 'EMI_PAYMENT',
      ref: p.receiptNumber,
      description: `EMI Payment for ${p.emiNumber} (Inst #${p.installmentNumber}) via ${p.paymentMethod}`,
      debit: 0,
      credit: p.amount
    });
  });

  customerReturns.forEach(ret => {
    customerRows.push({
      date: ret.date,
      type: 'RETURN',
      ref: ret.returnNumber,
      description: `Return Refund/Credit: ${ret.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}`,
      debit: 0,
      credit: ret.totalRefundAmount
    });
  });

  // Sort customer rows by date
  customerRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate Running Balances
  let runningBal = 0;
  const customerRowsWithBalance = customerRows.map(row => {
    runningBal += (row.debit - row.credit);
    return { ...row, balance: runningBal };
  });

  // Dynamic Supplier Ledger Entries
  const supplierRows: LedgerRow[] = [];
  if (selectedSupplier) {
    // 1. Purchases from this supplier
    const supPurchases = purchases.filter(p => p.supplierId === selectedSupplier.id);
    supPurchases.forEach(p => {
      supplierRows.push({
        date: p.date,
        type: 'PURCHASE',
        ref: p.invoiceNumber,
        description: `Stock PO Intake: ${p.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}`,
        debit: 0,
        credit: p.total
      });

      if (p.paidAmount > 0) {
        supplierRows.push({
          date: p.date,
          type: 'PAYMENT',
          ref: `${p.invoiceNumber}-PAY`,
          description: `Intake payment via ${p.paymentMethod}`,
          debit: p.paidAmount,
          credit: 0
        });
      }
    });

    // 2. Direct payments to supplier recorded via recordSupplierPayment
    const supPayments = ledgerEntries.filter(l => 
      l.partyType === 'SUPPLIER' && 
      l.partyId === selectedSupplier.id && 
      l.referenceType !== 'PURCHASE'
    );
    supPayments.forEach(sp => {
      supplierRows.push({
        date: sp.date,
        type: 'PAYMENT',
        ref: sp.referenceNumber,
        description: sp.description,
        debit: sp.debit,
        credit: sp.credit
      });
    });
  }

  // Sort supplier rows by date
  supplierRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let supBal = selectedSupplier?.openingBalance || 0;
  const supplierRowsWithBalance = supplierRows.map(row => {
    supBal += (row.credit - row.debit); // net payable
    return { ...row, balance: supBal };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <BookOpen size={28} color="var(--brand-primary)" />
            Customer & Supplier Financial Ledgers
          </h1>
          <p>
            Detailed statement of account with chronological debit, credit, invoice links, payment vouchers, and running balances.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
          <Printer size={15} /> Print Statement
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('customer');
            setSelectedPartyId(customers[0]?.id || '');
          }}
        >
          Customer Statement Ledger
        </button>
        <button 
          className={`tab-btn ${activeTab === 'supplier' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('supplier');
            setSelectedPartyId(suppliers[0]?.id || '');
          }}
        >
          Supplier Payable Ledger
        </button>
      </div>

      {/* Main Split Layout: Party Picker (Left) + Statement (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.25rem' }}>
        {/* Left: Party Picker */}
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Select {activeTab === 'customer' ? 'Customer' : 'Supplier'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '550px', overflowY: 'auto' }}>
            {activeTab === 'customer' ? (
              customers.map(c => (
                <div
                  key={c.id}
                  className="erp-card erp-card-interactive"
                  onClick={() => setSelectedPartyId(c.id)}
                  style={{
                    padding: '0.75rem',
                    background: selectedPartyId === c.id ? 'var(--bg-active)' : 'var(--bg-card-muted)',
                    border: `1px solid ${selectedPartyId === c.id ? 'var(--brand-primary)' : 'var(--border-color)'}`
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.phone}</div>
                </div>
              ))
            ) : (
              suppliers.map(s => (
                <div
                  key={s.id}
                  className="erp-card erp-card-interactive"
                  onClick={() => setSelectedPartyId(s.id)}
                  style={{
                    padding: '0.75rem',
                    background: selectedPartyId === s.id ? 'var(--bg-active)' : 'var(--bg-card-muted)',
                    border: `1px solid ${selectedPartyId === s.id ? 'var(--brand-primary)' : 'var(--border-color)'}`
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: s.currentPayable > 0 ? '#ef4444' : '#10b981' }}>
                    Payable: ৳{s.currentPayable.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Statement Sheet */}
        <div className="erp-card" style={{ padding: '1.5rem' }}>
          {/* Statement Header */}
          <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '4px' }}>
                OFFICIAL STATEMENT OF ACCOUNT
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                {activeTab === 'customer' ? selectedCustomer?.name : selectedSupplier?.name}
              </h2>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {activeTab === 'customer' ? `Phone: ${selectedCustomer?.phone} • Address: ${selectedCustomer?.address}` : `Company: ${selectedSupplier?.company} • Phone: ${selectedSupplier?.phone}`}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Closing Balance Due:</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: activeTab === 'customer' ? (runningBal > 0 ? '#ef4444' : '#10b981') : (supBal > 0 ? '#ef4444' : '#10b981') }}>
                ৳{(activeTab === 'customer' ? runningBal : supBal).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Statement Table */}
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Particulars / Description</th>
                  <th style={{ textAlign: 'right' }}>Debit (৳)</th>
                  <th style={{ textAlign: 'right' }}>Credit (৳)</th>
                  <th style={{ textAlign: 'right' }}>Balance (৳)</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'customer' ? (
                  customerRowsWithBalance.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No transactions recorded for this customer.
                      </td>
                    </tr>
                  ) : (
                    customerRowsWithBalance.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.date}</td>
                        <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>{row.ref}</td>
                        <td>{row.description}</td>
                        <td style={{ textAlign: 'right', fontWeight: row.debit > 0 ? '600' : 'normal' }}>
                          {row.debit > 0 ? `৳${row.debit.toLocaleString()}` : '—'}
                        </td>
                        <td style={{ textAlign: 'right', color: '#10b981', fontWeight: row.credit > 0 ? '600' : 'normal' }}>
                          {row.credit > 0 ? `৳${row.credit.toLocaleString()}` : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '800', color: row.balance > 0 ? '#ef4444' : 'inherit' }}>
                          ৳{row.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  supplierRowsWithBalance.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.date}</td>
                      <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>{row.ref}</td>
                      <td>{row.description}</td>
                      <td style={{ textAlign: 'right' }}>
                        {row.debit > 0 ? `৳${row.debit.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', color: '#ef4444' }}>
                        {row.credit > 0 ? `৳${row.credit.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '800' }}>
                        ৳{row.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
