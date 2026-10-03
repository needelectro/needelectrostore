import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '../services/erpStore';
import { 
  Search, X, Laptop, User, FileText, Calendar, Hash, 
  Wrench, Truck, ArrowRight, ShieldCheck, CheckCircle2 
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule: (moduleName: string, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToModule
}) => {
  const { products, serials, customers, sales, emiAccounts, suppliers, services } = useERP();
  const [query, setQuery] = useState('');
  const [selectedSerialDetail, setSelectedSerialDetail] = useState<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedSerialDetail(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search matches
  const matchedProducts = q ? products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.sku.toLowerCase().includes(q) || 
    p.brand.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedSerials = q ? serials.filter(s => 
    s.serialNumber.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedCustomers = q ? customers.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.phone.toLowerCase().includes(q) || 
    c.customerId.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedSales = q ? sales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(q) || 
    s.customerName.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedEmi = q ? emiAccounts.filter(e => 
    e.emiNumber.toLowerCase().includes(q) || 
    e.customerName.toLowerCase().includes(q) || 
    e.serialNumber.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedServices = q ? services.filter(srv => 
    srv.jobCardNumber.toLowerCase().includes(q) || 
    srv.customerName.toLowerCase().includes(q) || 
    srv.deviceOrSite.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const totalResults = matchedProducts.length + matchedSerials.length + matchedCustomers.length + matchedSales.length + matchedEmi.length + matchedServices.length;

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: 'clamp(0.5rem, 5vh, 4rem)', padding: '0.5rem' }} onClick={onClose}>
      <div 
        className="modal-content modal-content-lg" 
        onClick={e => e.stopPropagation()}
        style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', maxHeight: 'calc(92dvh - env(safe-area-inset-bottom, 0px))', width: '100%', maxWidth: '780px' }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.1rem 1.4rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-card)'
        }}>
          <Search size={22} color="var(--brand-primary)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, serial numbers, customers, invoices, EMI accounts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}
          />
          {query && (
            <button className="btn btn-ghost btn-sm" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-card-muted)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            ESC to close
          </span>
        </div>

        {/* Search Results Area */}
        <div style={{ maxHeight: '65vh', overflowY: 'auto', padding: '1rem' }}>
          {!query ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Search size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontWeight: '600' }}>Global ERP Master Search</div>
              <div style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
                Quickly jump to serialized laptops, invoices, customer CRM, service jobs, or EMI installment accounts.
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No matches found for "<strong>{query}</strong>". Try searching by Serial Number, Phone, or Invoice ID.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Serial Number Direct Lifecycle Inspection */}
              {matchedSerials.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--brand-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Hash size={14} /> Serial Numbers (Instant Tracking)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {matchedSerials.map(s => {
                      const prod = products.find(p => p.id === s.productId);
                      return (
                        <div
                          key={s.id}
                          className="erp-card erp-card-interactive"
                          onClick={() => setSelectedSerialDetail(s)}
                          style={{
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                              <Hash size={18} />
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '0.9375rem' }}>
                                Serial: {s.serialNumber}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {prod?.name || 'Unknown Product'} • Cost: ৳{s.purchaseCost.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className={`badge ${s.status === 'AVAILABLE' ? 'badge-success' : s.status === 'SOLD' ? 'badge-info' : 'badge-warning'}`}>
                              {s.status}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: '600' }}>
                              View History &rarr;
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Laptop size={14} /> Products & Tech Catalog
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {matchedProducts.map(p => (
                      <div
                        key={p.id}
                        className="erp-card erp-card-interactive"
                        onClick={() => {
                          onNavigateToModule('inventory', p.id);
                          onClose();
                        }}
                        style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-card-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Laptop size={18} color="var(--brand-primary)" />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              SKU: {p.sku} • Category: {p.category}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>৳{p.retailPrice.toLocaleString()}</div>
                          <div style={{ fontSize: '0.75rem', color: p.currentStock <= p.minStock ? '#ef4444' : '#10b981' }}>
                            Stock: {p.currentStock} units
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={14} /> Customers (CRM)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {matchedCustomers.map(c => (
                      <div
                        key={c.id}
                        className="erp-card erp-card-interactive"
                        onClick={() => {
                          onNavigateToModule('customers', c.id);
                          onClose();
                        }}
                        style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            ID: {c.customerId} • Phone: {c.phone} • {c.address}
                          </div>
                        </div>
                        <ArrowRight size={16} color="var(--text-muted)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMI Accounts */}
              {matchedEmi.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--brand-accent)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> EMI Accounts
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {matchedEmi.map(e => (
                      <div
                        key={e.id}
                        className="erp-card erp-card-interactive"
                        onClick={() => {
                          onNavigateToModule('emi', e.id);
                          onClose();
                        }}
                        style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                            {e.emiNumber} — {e.customerName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Product: {e.productName} (SN: {e.serialNumber})
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '700', color: '#ef4444' }}>
                            Remaining: ৳{e.remainingBalance.toLocaleString()}
                          </div>
                          <span className={`badge ${e.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                            {e.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {matchedSales.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={14} /> Sales & Invoices
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {matchedSales.map(s => (
                      <div
                        key={s.id}
                        className="erp-card erp-card-interactive"
                        onClick={() => {
                          onNavigateToModule('sales', s.id);
                          onClose();
                        }}
                        style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                            {s.invoiceNumber} — {s.customerName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {new Date(s.createdAt).toLocaleDateString('en-GB')} • {s.items.length} items • Type: {s.saleType}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '700' }}>৳{s.grandTotal.toLocaleString()}</div>
                          <span className="badge badge-success">{s.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Serial Lifecycle Detail Modal Overlay inside Search */}
        {selectedSerialDetail && (
          <div className="modal-overlay" style={{ zIndex: 11000 }} onClick={() => setSelectedSerialDetail(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px' }}>
              <div className="modal-header">
                <div className="modal-title">
                  <ShieldCheck size={20} color="var(--brand-primary)" />
                  Serial Lifecycle: {selectedSerialDetail.serialNumber}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSerialDetail(null)}>
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                <div style={{ background: 'var(--bg-card-muted)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div><strong>Product:</strong> {products.find(p => p.id === selectedSerialDetail.productId)?.name || 'Serialized Product'}</div>
                  <div><strong>Status:</strong> <span className={`badge ${selectedSerialDetail.status === 'AVAILABLE' ? 'badge-success' : 'badge-info'}`}>{selectedSerialDetail.status}</span></div>
                  <div><strong>Purchase Cost:</strong> ৳{selectedSerialDetail.purchaseCost.toLocaleString()}</div>
                  <div><strong>Purchase Date:</strong> {selectedSerialDetail.purchaseDate}</div>
                  <div><strong>Supplier:</strong> {suppliers.find(s => s.id === selectedSerialDetail.supplierId)?.name || 'Direct'}</div>
                </div>

                {selectedSerialDetail.status === 'SOLD' ? (
                  <div style={{ borderLeft: '3px solid var(--brand-primary)', paddingLeft: '12px', marginTop: '0.75rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--brand-primary)' }}>Sale & Warranty Information</div>
                    <div><strong>Invoice No:</strong> {selectedSerialDetail.saleInvoiceId}</div>
                    <div><strong>Customer:</strong> {customers.find(c => c.id === selectedSerialDetail.customerId)?.name || 'Retail Client'}</div>
                    <div><strong>Sale Date:</strong> {selectedSerialDetail.saleDate}</div>
                    <div><strong>Warranty Valid Until:</strong> {selectedSerialDetail.warrantyEndDate || 'N/A'}</div>
                    {selectedSerialDetail.emiAccountId && (
                      <div style={{ color: '#f59e0b', fontWeight: 'bold', marginTop: '4px' }}>
                        Linked to Active EMI Account
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Ready for sale in showroom. Not yet sold.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSerialDetail(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
