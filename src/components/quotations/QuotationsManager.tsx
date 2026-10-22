import React, { useState, useEffect, useMemo } from 'react';
import { Quotation, Sale } from '../../types';
import { useERP } from '../../services/erpStore';
import { 
  FileText, Search, Plus, Filter, Calendar, Printer, Share2, 
  Copy, Eye, Edit2, CheckCircle2, AlertTriangle, ArrowRight, 
  RefreshCw, TrendingUp, Clock, ShieldAlert, Check, X, Building
} from 'lucide-react';
import { CreateQuotationModal } from './CreateQuotationModal';
import { QuotationDetailsModal } from './QuotationDetailsModal';
import { ConvertQuotationDialog } from './ConvertQuotationDialog';

interface QuotationsManagerProps {
  onNavigateToInvoice?: (invoiceNumber: string) => void;
}

export const QuotationsManager: React.FC<QuotationsManagerProps> = ({
  onNavigateToInvoice,
}) => {
  const { 
    quotations, 
    refreshQuotations, 
    setActiveQuotationToPrint, 
    activeQuotationToEdit,
    setActiveQuotationToEdit,
    currentUser, 
    hasPermission,
    addToast 
  } = useERP();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SENT' | 'ACCEPTED' | 'CONVERTED' | 'EXPIRED' | 'REJECTED'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [quotationToEdit, setQuotationToEdit] = useState<Quotation | null>(null);
  const [quotationToDuplicate, setQuotationToDuplicate] = useState<Quotation | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);
  const [convertingQuotation, setConvertingQuotation] = useState<Quotation | null>(null);

  // Sync latest quotations on mount
  useEffect(() => {
    refreshQuotations().catch(() => {});
  }, []);

  // Listen for global edit triggers (e.g. from Print Preview)
  useEffect(() => {
    if (activeQuotationToEdit) {
      setQuotationToDuplicate(null);
      setQuotationToEdit(activeQuotationToEdit);
      setIsCreateModalOpen(true);
      setActiveQuotationToEdit(null);
    }
  }, [activeQuotationToEdit, setActiveQuotationToEdit]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await refreshQuotations();
      addToast('success', 'Quotations Refreshed', `Synchronized ${data.length} quotations.`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Status mapping & expiry check
  const now = Date.now();
  const processedQuotations = useMemo(() => {
    return quotations.map((q) => {
      const isExpired = new Date(q.validUntil).getTime() < now && q.status !== 'CONVERTED' && q.status !== 'REJECTED';
      const effectiveStatus = q.status === 'CONVERTED' ? 'CONVERTED' : (isExpired && q.status !== 'ACCEPTED' ? 'EXPIRED' : q.status);
      return {
        ...q,
        effectiveStatus,
        isExpired,
      };
    });
  }, [quotations, now]);

  // Filtering
  const filteredQuotations = useMemo(() => {
    return processedQuotations.filter((q) => {
      // Status filter
      if (statusFilter !== 'ALL' && q.effectiveStatus !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'ALL') {
        const qDate = new Date(q.quotationDate).getTime();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        if (dateFilter === 'TODAY' && qDate < startOfToday.getTime()) {
          return false;
        }
        if (dateFilter === 'WEEK' && qDate < startOfToday.getTime() - 7 * 86400000) {
          return false;
        }
        if (dateFilter === 'MONTH' && qDate < startOfToday.getTime() - 30 * 86400000) {
          return false;
        }
      }

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesNumber = q.quotationNumber.toLowerCase().includes(query);
        const matchesCustomer = q.customerName.toLowerCase().includes(query);
        const matchesPhone = q.customerPhone.includes(query);
        const matchesCompany = (q.companyName || '').toLowerCase().includes(query);
        const matchesItem = (q.items || []).some(
          (it) => it.productName.toLowerCase().includes(query) || it.sku.toLowerCase().includes(query)
        );
        return matchesNumber || matchesCustomer || matchesPhone || matchesCompany || matchesItem;
      }

      return true;
    });
  }, [processedQuotations, statusFilter, dateFilter, searchQuery]);

  // Analytics Metrics
  const stats = useMemo(() => {
    const totalCount = processedQuotations.length;
    const totalQuoted = processedQuotations.reduce((sum, q) => sum + Number(q.grandTotal), 0);
    const converted = processedQuotations.filter((q) => q.effectiveStatus === 'CONVERTED');
    const convertedCount = converted.length;
    const convertedValue = converted.reduce((sum, q) => sum + Number(q.grandTotal), 0);
    const sentCount = processedQuotations.filter((q) => q.effectiveStatus === 'SENT').length;
    const acceptedCount = processedQuotations.filter((q) => q.effectiveStatus === 'ACCEPTED').length;
    const expiredCount = processedQuotations.filter((q) => q.effectiveStatus === 'EXPIRED').length;
    const draftCount = processedQuotations.filter((q) => q.effectiveStatus === 'DRAFT').length;

    const issuedEligible = sentCount + acceptedCount + convertedCount + expiredCount;
    const conversionRate = issuedEligible > 0 ? (convertedCount / issuedEligible) * 100 : 0;

    return {
      totalCount,
      totalQuoted,
      convertedCount,
      convertedValue,
      sentCount,
      acceptedCount,
      expiredCount,
      draftCount,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  }, [processedQuotations]);

  const handleDuplicate = (q: Quotation) => {
    setQuotationToEdit(null);
    setQuotationToDuplicate(q);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (q: Quotation) => {
    setQuotationToDuplicate(null);
    setQuotationToEdit(q);
    setIsCreateModalOpen(true);
  };

  const handleWhatsApp = (q: Quotation) => {
    let cleanPhone = q.customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01')) cleanPhone = '88' + cleanPhone;
    else if (cleanPhone.startsWith('1')) cleanPhone = '880' + cleanPhone;

    const message = `Hello ${q.customerName}, your NEED ELECTRO sales quotation ${q.quotationNumber} is ready.\n\nTotal Quoted Amount: ${q.currencySymbol || '৳'} ${Number(q.grandTotal).toLocaleString()}\nValid Until: ${q.validUntil}\n\nPlease review your quotation document for full details.\nThank you!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Informational Revenue Notice Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#0284c7',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
            }}
          >
            ৳
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Commercial Quotations & Proposals Management
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              A quotation is a commercial price proposal only. It does not reduce inventory, reserve stock, or count as realized sales revenue.
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setQuotationToEdit(null);
            setQuotationToDuplicate(null);
            setIsCreateModalOpen(true);
          }}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #002B5B 100%)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
          }}
        >
          <Plus size={16} /> Create Quotation
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Quotations
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {stats.totalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', marginTop: '0.2rem', fontWeight: 600 }}>
            Volume: ৳{stats.totalQuoted.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Active / Issued
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7', marginTop: '0.2rem' }}>
            {stats.sentCount + stats.acceptedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {stats.sentCount} sent • {stats.acceptedCount} accepted
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Converted to Orders
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: '0.2rem' }}>
            {stats.convertedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem', fontWeight: 600 }}>
            Realized: ৳{stats.convertedValue.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Conversion Rate
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#8b5cf6', marginTop: '0.2rem' }}>
            {stats.conversionRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Converted / eligible issued
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Expired / Draft
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', marginTop: '0.2rem' }}>
            {stats.expiredCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {stats.draftCount} in draft
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input input-sm w-full"
            style={{ paddingLeft: '2rem' }}
            placeholder="Search quotation #, customer, phone, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {(['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'CONVERTED', 'EXPIRED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              className={`btn btn-xs ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter(st)}
              style={{ fontWeight: statusFilter === st ? 700 : 500 }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Date Filter & Refresh */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <select
            className="input input-xs"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Past 7 Days</option>
            <option value="MONTH">Past 30 Days</option>
          </select>

          <button
            className="btn btn-secondary btn-xs"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh from database"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Quotations Data Table */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {filteredQuotations.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>No Quotations Found</div>
            <p style={{ fontSize: '0.825rem', margin: '0.25rem 0 1rem' }}>
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or status filter.'
                : 'Click "Create Quotation" above to prepare a commercial price proposal.'}
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setQuotationToEdit(null);
                setQuotationToDuplicate(null);
                setIsCreateModalOpen(true);
              }}
            >
              <Plus size={16} /> Create Quotation
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card-muted)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Quotation #</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Dates</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Items</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total (৳)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Prepared By</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((q) => {
                  const getStatusTag = (st: string) => {
                    switch (st) {
                      case 'DRAFT':
                        return <span className="badge badge-secondary" style={{ fontSize: '0.7rem', fontWeight: 700 }}>DRAFT</span>;
                      case 'SENT':
                        return <span className="badge badge-info" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#0284c7', color: '#fff' }}>SENT</span>;
                      case 'ACCEPTED':
                        return <span className="badge badge-success" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#10b981', color: '#fff' }}>ACCEPTED</span>;
                      case 'CONVERTED':
                        return <span className="badge badge-primary" style={{ fontSize: '0.7rem', fontWeight: 700, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff' }}>CONVERTED</span>;
                      case 'EXPIRED':
                        return <span className="badge badge-warning" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#f59e0b', color: '#000' }}>EXPIRED</span>;
                      case 'REJECTED':
                        return <span className="badge badge-danger" style={{ fontSize: '0.7rem', fontWeight: 700, background: '#ef4444', color: '#fff' }}>REJECTED</span>;
                      default:
                        return <span className="badge">{st}</span>;
                    }
                  };

                  return (
                    <tr
                      key={q.id}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                      className="hover:bg-card-muted/50"
                    >
                      {/* Quotation Number */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            color: 'var(--brand-primary)',
                            cursor: 'pointer',
                          }}
                          onClick={() => setViewingQuotation(q)}
                        >
                          {q.quotationNumber}
                        </div>
                        {q.referenceNumber && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Ref: {q.referenceNumber}
                          </div>
                        )}
                        {q.convertedInvoiceNumber && (
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: '#8b5cf6',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                            onClick={() => onNavigateToInvoice && onNavigateToInvoice(q.convertedInvoiceNumber!)}
                            title="View converted sales invoice"
                          >
                            Order: {q.convertedInvoiceNumber} →
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{q.customerName}</div>
                        {q.companyName && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                            {q.companyName}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.customerPhone}</div>
                      </td>

                      {/* Dates */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontSize: '0.8rem' }}>{q.quotationDate}</div>
                        <div style={{ fontSize: '0.725rem', color: q.isExpired ? '#ef4444' : 'var(--text-muted)', fontWeight: q.isExpired ? 700 : 400 }}>
                          Valid to: {q.validUntil}
                        </div>
                      </td>

                      {/* Items */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span className="badge badge-secondary" style={{ fontWeight: 700 }}>
                          {q.items?.length || 0}
                        </span>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#10b981', fontSize: '0.9rem' }}>
                        ৳{Number(q.grandTotal).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {getStatusTag(q.effectiveStatus)}
                      </td>

                      {/* Prepared By */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontSize: '0.8rem' }}>{q.preparedByName || 'Staff'}</div>
                        {q.salespersonName && q.salespersonName !== q.preparedByName && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rep: {q.salespersonName}</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-ghost btn-xs text-primary"
                            onClick={() => setViewingQuotation(q)}
                            title="View Quotation Details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setActiveQuotationToPrint(q)}
                            title="Print / Save PDF"
                          >
                            <Printer size={15} />
                          </button>

                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleWhatsApp(q)}
                            style={{ color: '#10b981' }}
                            title="Share on WhatsApp"
                          >
                            <Share2 size={15} />
                          </button>

                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleDuplicate(q)}
                            title="Duplicate Quotation"
                          >
                            <Copy size={15} />
                          </button>

                          {q.effectiveStatus !== 'CONVERTED' && (
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleEdit(q)}
                              title="Edit Quotation"
                            >
                              <Edit2 size={15} />
                            </button>
                          )}

                          {q.effectiveStatus !== 'CONVERTED' && (
                            <button
                              className="btn btn-xs btn-outline-primary"
                              onClick={() => setConvertingQuotation(q)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '2px 6px' }}
                              title="Convert to Sales Order"
                            >
                              <ArrowRight size={13} /> Order
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Quotation Modal */}
      {isCreateModalOpen && (
        <CreateQuotationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          quotationToEdit={quotationToEdit}
          initialDuplicateQuotation={quotationToDuplicate}
        />
      )}

      {/* Quotation Details Modal */}
      {viewingQuotation && (
        <QuotationDetailsModal
          quotation={viewingQuotation}
          isOpen={Boolean(viewingQuotation)}
          onClose={() => setViewingQuotation(null)}
          onOpenConvertDialog={(q) => {
            setViewingQuotation(null);
            setConvertingQuotation(q);
          }}
          onViewInvoice={onNavigateToInvoice}
          onEditDraft={(q) => {
            setViewingQuotation(null);
            handleEdit(q);
          }}
        />
      )}

      {/* Convert Quotation Dialog */}
      {convertingQuotation && (
        <ConvertQuotationDialog
          quotation={convertingQuotation}
          isOpen={Boolean(convertingQuotation)}
          onClose={() => setConvertingQuotation(null)}
          onConverted={(sale) => {
            if (onNavigateToInvoice && sale?.invoiceNumber) {
              onNavigateToInvoice(sale.invoiceNumber);
            }
          }}
        />
      )}
    </div>
  );
};
