import React, { useState, useEffect, useMemo } from 'react';
import { Quotation, Product, Customer } from '../../types';
import { useERP } from '../../services/erpStore';
import { 
  X, Plus, Trash2, Search, FileText, Calendar, User, Phone, 
  MapPin, Shield, DollarSign, Tag, Info, AlertCircle, CheckCircle2,
  Building, Sparkles, Loader2, ArrowRight
} from 'lucide-react';
import { amountToBangladeshiTakaWords } from '../../utils/numberToWords';

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationToEdit?: Quotation | null;
  initialDuplicateQuotation?: Quotation | null;
}

interface FormLineItem {
  tempId: string;
  productId?: string;
  productName: string;
  sku: string;
  category?: string;
  brand?: string;
  model?: string;
  description?: string;
  unitOfMeasure: string;
  catalogPrice: number;
  unitPrice: number;
  quantity: number;
  discount: number;
  taxPercent: number;
  currentStock: number;
}

export const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({
  isOpen,
  onClose,
  quotationToEdit,
  initialDuplicateQuotation,
}) => {
  const { products, customers, branches, currentUser, createQuotation, updateQuotation, addToast, setActiveQuotationToPrint } = useERP();

  // Next suggested quotation number preview
  const currentYear = new Date().getFullYear();
  const suggestedNumber = useMemo(() => {
    const timestamp = Date.now().toString().slice(-4);
    return `NE-QTN-${currentYear}-00${timestamp}`;
  }, [currentYear]);

  // Form State
  const [quotationNumber, setQuotationNumber] = useState(suggestedNumber);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 14 days default validity
    return d.toISOString().split('T')[0];
  });

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || 'DHK-MAIN');

  // Line items state
  const [lineItems, setLineItems] = useState<FormLineItem[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);

  // Financial Charges & Totals
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);

  // Terms & Notes
  const [paymentTerms, setPaymentTerms] = useState('Full payment upon confirmed order placement.');
  const [deliveryTerms, setDeliveryTerms] = useState('Showroom collection or scheduled courier delivery.');
  const [warrantyTerms, setWarrantyTerms] = useState('Official NEED ELECTRO product warranty terms apply.');
  const [customerNotes, setCustomerNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // Populate form if editing or duplicating
  useEffect(() => {
    const src = quotationToEdit || initialDuplicateQuotation;
    if (src && isOpen) {
      if (quotationToEdit) {
        setQuotationNumber(src.quotationNumber);
      } else {
        setQuotationNumber(suggestedNumber);
      }
      setReferenceNumber(src.referenceNumber || '');
      setQuotationDate(src.quotationDate || new Date().toISOString().split('T')[0]);
      setValidUntil(src.validUntil || '');
      setSelectedCustomerId(src.customerId || '');
      setCustomerName(src.customerName || '');
      setCompanyName(src.companyName || '');
      setCustomerPhone(src.customerPhone || '');
      setCustomerEmail(src.customerEmail || '');
      setBillingAddress(src.billingAddress || '');
      setDeliveryAddress(src.deliveryAddress || '');
      setSelectedBranchId(src.branchId || branches[0]?.id || 'DHK-MAIN');

      setOverallDiscount(Number(src.discountTotal || 0));
      setVatPercent(Number(src.vatPercent || 0));
      setDeliveryCharge(Number(src.deliveryCharge || 0));
      setServiceCharge(Number(src.serviceCharge || 0));
      setOtherCharges(Number(src.otherCharges || 0));

      setPaymentTerms(src.paymentTerms || 'Full payment upon confirmed order placement.');
      setDeliveryTerms(src.deliveryTerms || 'Showroom collection or scheduled courier delivery.');
      setWarrantyTerms(src.warrantyTerms || 'Official NEED ELECTRO product warranty terms apply.');
      setCustomerNotes(src.customerNotes || '');
      setInternalNotes(src.internalNotes || '');

      if (src.items && src.items.length > 0) {
        setLineItems(
          src.items.map((it, idx) => {
            const prod = products.find((p) => p.id === it.productId || p.sku === it.sku);
            return {
              tempId: 'it-' + Date.now() + '-' + idx,
              productId: it.productId,
              productName: it.productName,
              sku: it.sku,
              category: it.category,
              brand: it.brand,
              model: it.model,
              description: it.description,
              unitOfMeasure: it.unitOfMeasure || 'Unit',
              catalogPrice: Number(it.catalogPriceSnapshot || prod?.retailPrice || it.unitPrice),
              unitPrice: Number(it.unitPrice),
              quantity: it.quantity,
              discount: Number(it.discount || 0),
              taxPercent: Number(it.taxPercent || 0),
              currentStock: prod ? prod.currentStock : 0,
            };
          })
        );
      }
    } else if (isOpen) {
      // Fresh new quotation
      setQuotationNumber(suggestedNumber);
      setQuotationDate(new Date().toISOString().split('T')[0]);
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setValidUntil(d.toISOString().split('T')[0]);
      setLineItems([]);
      setSelectedCustomerId('');
      setCustomerSearch('');
      setCustomerName('');
      setCompanyName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setBillingAddress('');
      setDeliveryAddress('');
      setOverallDiscount(0);
      setVatPercent(0);
      setDeliveryCharge(0);
      setServiceCharge(0);
      setOtherCharges(0);
      setCustomerNotes('');
      setInternalNotes('');
    }
  }, [quotationToEdit, initialDuplicateQuotation, isOpen, suggestedNumber]);

  // Customer Autocomplete Filter
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 10);
    const q = customerSearch.toLowerCase().trim();
    return customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q)))
      .slice(0, 10);
  }, [customers, customerSearch]);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerEmail(c.email || '');
    setBillingAddress(c.address || '');
    setDeliveryAddress(c.address || '');
    setCustomerSearch(c.name);
    setIsCustomerDropdownOpen(false);
  };

  // Product Search Filter
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return products.slice(0, 12);
    const q = productSearchQuery.toLowerCase().trim();
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.model && p.model.toLowerCase().includes(q)))
      .slice(0, 15);
  }, [products, productSearchQuery]);

  const handleAddProduct = (prod: Product) => {
    const existing = lineItems.find((it) => it.productId === prod.id);
    if (existing) {
      setLineItems((prev) =>
        prev.map((it) => (it.productId === prod.id ? { ...it, quantity: it.quantity + 1 } : it))
      );
      addToast('info', 'Quantity Updated', `Increased quantity for ${prod.name}`);
    } else {
      const newItem: FormLineItem = {
        tempId: 'line-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        category: prod.category,
        brand: prod.brand,
        model: prod.model,
        description: prod.description,
        unitOfMeasure: 'Unit',
        catalogPrice: Number(prod.retailPrice),
        unitPrice: Number(prod.retailPrice),
        quantity: 1,
        discount: 0,
        taxPercent: 0,
        currentStock: prod.currentStock,
      };
      setLineItems((prev) => [...prev, newItem]);
    }
    setProductSearchQuery('');
    setIsProductPickerOpen(false);
  };

  const handleRemoveLineItem = (tempId: string) => {
    setLineItems((prev) => prev.filter((it) => it.tempId !== tempId));
  };

  const handleUpdateLineItem = (tempId: string, updates: Partial<FormLineItem>) => {
    setLineItems((prev) => prev.map((it) => (it.tempId === tempId ? { ...it, ...updates } : it)));
  };

  // Calculation summaries
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, it) => acc + Math.max(0, it.unitPrice * it.quantity - it.discount), 0);
  }, [lineItems]);

  const itemDiscountsTotal = useMemo(() => {
    return lineItems.reduce((acc, it) => acc + (it.discount || 0), 0);
  }, [lineItems]);

  const taxableAmount = Math.max(0, subtotal - overallDiscount);
  const vatAmount = vatPercent > 0 ? Math.round((taxableAmount * vatPercent) / 100) : 0;
  const grandTotal = Math.max(0, taxableAmount + vatAmount + deliveryCharge + serviceCharge + otherCharges);

  const amountInWords = useMemo(() => {
    return amountToBangladeshiTakaWords(grandTotal);
  }, [grandTotal]);

  const handleSubmit = async (targetStatus: 'DRAFT' | 'SENT') => {
    // Validations
    if (!customerName.trim()) {
      addToast('error', 'Validation Error', 'Please enter a customer name.');
      return;
    }
    if (!customerPhone.trim()) {
      addToast('error', 'Validation Error', 'Please enter a customer phone number.');
      return;
    }
    if (!validUntil) {
      addToast('error', 'Validation Error', 'Please specify a quotation validity date.');
      return;
    }
    if (lineItems.length === 0) {
      addToast('error', 'Validation Error', 'Please add at least one product item to the quotation.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        quotationNumber: quotationToEdit ? quotationToEdit.quotationNumber : undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        customerId: selectedCustomerId || undefined,
        customerName: customerName.trim(),
        companyName: companyName.trim() || undefined,
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        billingAddress: billingAddress.trim() || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        branchId: selectedBranchId,
        quotationDate,
        validUntil,
        status: targetStatus,
        subtotal,
        discountTotal: overallDiscount,
        vatPercent,
        vatAmount,
        deliveryCharge,
        serviceCharge,
        otherCharges,
        grandTotal,
        paymentTerms,
        deliveryTerms,
        warrantyTerms,
        customerNotes: customerNotes.trim() || undefined,
        internalNotes: internalNotes.trim() || undefined,
        salespersonId: currentUser?.id,
        salespersonName: currentUser?.name,
        items: lineItems.map((it, idx) => ({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          category: it.category,
          brand: it.brand,
          model: it.model,
          description: it.description,
          unitOfMeasure: it.unitOfMeasure,
          catalogPriceSnapshot: it.catalogPrice,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          discount: it.discount,
          taxPercent: it.taxPercent,
          taxAmount: 0,
          lineTotal: Math.max(0, it.unitPrice * it.quantity - it.discount),
          warrantyMonths: 0,
          sortOrder: idx,
        })),
      };

      if (quotationToEdit) {
        const res = await updateQuotation(quotationToEdit.id, payload);
        if (res.success && res.data) {
          onClose();
          if (targetStatus === 'SENT') {
            setActiveQuotationToPrint(res.data);
          }
        }
      } else {
        const res = await createQuotation(payload);
        if (res.success && res.data) {
          onClose();
          if (targetStatus === 'SENT') {
            setActiveQuotationToPrint(res.data);
          }
        }
      }
    } catch (e: any) {
      // Toast already handled
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9990 }}>
      <div className="modal-content modal-content-xl" style={{ maxWidth: '1080px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '1rem 1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText className="text-primary" size={22} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {quotationToEdit ? `Edit Draft Quotation — ${quotationToEdit.quotationNumber}` : 'Create Commercial Sales Quotation'}
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Official price proposal for customer evaluation. <strong style={{ color: '#10b981' }}>Zero inventory deduction or financial realization.</strong>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isSaving}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Top Parameters Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
              background: 'var(--bg-card-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                QUOTATION NUMBER (SYSTEM)
              </label>
              <input
                type="text"
                className="input input-sm w-full font-mono font-bold"
                value={quotationNumber}
                readOnly
                style={{ background: 'rgba(0, 140, 255, 0.08)', color: 'var(--brand-primary)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                QUOTATION DATE
              </label>
              <input
                type="date"
                className="input input-sm w-full"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', display: 'block', marginBottom: '0.25rem' }}>
                VALID UNTIL (EXPIRY) *
              </label>
              <input
                type="date"
                className="input input-sm w-full font-semibold"
                value={validUntil}
                min={quotationDate}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                REFERENCE # (OPTIONAL)
              </label>
              <input
                type="text"
                className="input input-sm w-full"
                placeholder="e.g. PO-REQ-981"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                ISSUING SHOWROOM / OUTLET
              </label>
              <select
                className="input input-sm w-full"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Information Section */}
          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
                <User size={16} className="text-primary" />
                Customer & Client Details
              </div>
              <div style={{ position: 'relative', width: '280px' }}>
                <input
                  type="text"
                  className="input input-sm w-full"
                  placeholder="🔍 Search existing customer..."
                  value={customerSearch}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setIsCustomerDropdownOpen(true);
                  }}
                />
                {isCustomerDropdownOpen && filteredCustomers.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 100,
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    {filteredCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)',
                          fontSize: '0.8rem',
                        }}
                        className="hover:bg-primary/10"
                      >
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone} {c.email ? `• ${c.email}` : ''}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  className="input input-sm w-full"
                  placeholder="e.g. Tanvir Ahmed"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  className="input input-sm w-full"
                  placeholder="e.g. Sylhet Engineering Works"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                  Phone Number *
                </label>
                <input
                  type="text"
                  className="input input-sm w-full"
                  placeholder="017XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="input input-sm w-full"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                  Billing / Office Address
                </label>
                <input
                  type="text"
                  className="input input-sm w-full"
                  placeholder="e.g. Central Road, Moulvibazar"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                  Delivery / Site Address (Optional)
                </label>
                <input
                  type="text"
                  className="input input-sm w-full"
                  placeholder="Same as billing or project site address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Product Items Selection */}
          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
                <Tag size={16} className="text-primary" />
                Quotation Line Items ({lineItems.length})
              </div>
              <div style={{ position: 'relative', width: '320px' }}>
                <input
                  type="text"
                  className="input input-sm w-full"
                  placeholder="🔍 Add product from catalog..."
                  value={productSearchQuery}
                  onFocus={() => setIsProductPickerOpen(true)}
                  onChange={(e) => {
                    setProductSearchQuery(e.target.value);
                    setIsProductPickerOpen(true);
                  }}
                />
                {isProductPickerOpen && filteredProducts.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)',
                      zIndex: 100,
                      maxHeight: '260px',
                      overflowY: 'auto',
                    }}
                  >
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProduct(p)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)',
                          fontSize: '0.8rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        className="hover:bg-primary/10"
                      >
                        <div>
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            SKU: {p.sku} • Stock: {p.currentStock} {p.currentStock === 0 ? '(0 Stock - Quoted OK)' : ''}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-primary)' }}>
                          ৳{Number(p.retailPrice).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            {lineItems.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  background: 'var(--bg-card-muted)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                }}
              >
                <Tag size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No items added yet</p>
                <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0' }}>Search and select products above to quote prices.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card-muted)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.6rem', textAlign: 'left' }}>Product Details</th>
                      <th style={{ padding: '0.6rem', textAlign: 'center', width: '130px' }}>Stock Info</th>
                      <th style={{ padding: '0.6rem', textAlign: 'center', width: '100px' }}>Qty</th>
                      <th style={{ padding: '0.6rem', textAlign: 'right', width: '130px' }}>Quoted Unit Price (৳)</th>
                      <th style={{ padding: '0.6rem', textAlign: 'right', width: '100px' }}>Disc. (৳)</th>
                      <th style={{ padding: '0.6rem', textAlign: 'right', width: '120px' }}>Line Total (৳)</th>
                      <th style={{ padding: '0.6rem', textAlign: 'center', width: '50px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((it) => {
                      const isOverridden = it.unitPrice !== it.catalogPrice;
                      const lineTotal = Math.max(0, it.unitPrice * it.quantity - it.discount);

                      return (
                        <tr key={it.tempId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.6rem' }}>
                            <div style={{ fontWeight: 700 }}>{it.productName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              SKU: {it.sku} {it.brand ? `• ${it.brand}` : ''} {it.model ? `• ${it.model}` : ''}
                            </div>
                            <input
                              type="text"
                              className="input input-sm w-full"
                              style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}
                              placeholder="Line note or item description (optional)..."
                              value={it.description || ''}
                              onChange={(e) => handleUpdateLineItem(it.tempId, { description: e.target.value })}
                            />
                          </td>

                          <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'inline-block',
                                background: it.currentStock > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: it.currentStock > 0 ? '#10b981' : '#f59e0b',
                                fontWeight: 600,
                              }}
                            >
                              {it.currentStock} in stock
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Catalog: ৳{it.catalogPrice.toLocaleString()}
                            </div>
                          </td>

                          <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                            <input
                              type="number"
                              className="input input-sm"
                              style={{ width: '70px', textAlign: 'center' }}
                              value={it.quantity}
                              min={1}
                              onChange={(e) => handleUpdateLineItem(it.tempId, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                            />
                          </td>

                          <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                            <input
                              type="number"
                              className="input input-sm"
                              style={{ width: '110px', textAlign: 'right' }}
                              value={it.unitPrice}
                              min={0}
                              onChange={(e) => handleUpdateLineItem(it.tempId, { unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                            />
                            {isOverridden && (
                              <div style={{ fontSize: '0.65rem', color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
                                Overridden Price
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                            <input
                              type="number"
                              className="input input-sm"
                              style={{ width: '80px', textAlign: 'right' }}
                              value={it.discount}
                              min={0}
                              onChange={(e) => handleUpdateLineItem(it.tempId, { discount: Math.max(0, parseFloat(e.target.value) || 0) })}
                            />
                          </td>

                          <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 800, color: 'var(--brand-primary)' }}>
                            ৳{lineTotal.toLocaleString()}
                          </td>

                          <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                            <button
                              className="btn btn-ghost btn-xs text-danger"
                              onClick={() => handleRemoveLineItem(it.tempId)}
                              title="Remove line item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom Grid: Terms & Financial Totals */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
            {/* Commercial Terms & Staff Notes */}
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Commercial Terms & Instructions</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    className="input input-sm w-full"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    Delivery Terms
                  </label>
                  <input
                    type="text"
                    className="input input-sm w-full"
                    value={deliveryTerms}
                    onChange={(e) => setDeliveryTerms(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                  Warranty Terms
                </label>
                <input
                  type="text"
                  className="input input-sm w-full"
                  value={warrantyTerms}
                  onChange={(e) => setWarrantyTerms(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                  Customer Notes (Printed on Quotation PDF)
                </label>
                <textarea
                  className="input input-sm w-full"
                  rows={2}
                  placeholder="Special instructions or notes for the customer..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.3)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                  <Shield size={14} /> Internal Staff Notes (Private — Never printed on PDF)
                </label>
                <textarea
                  className="input input-sm w-full"
                  rows={1}
                  placeholder="Confidential margin notes or staff remarks..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Authoritative Financial Calculations Card */}
            <div
              style={{
                background: 'var(--bg-card-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
                  QUOTATION FINANCIAL SUMMARY
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                  <span style={{ fontWeight: 700 }}>৳{subtotal.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#ef4444' }}>Overall Discount (৳):</span>
                  <input
                    type="number"
                    className="input input-sm"
                    style={{ width: '90px', textAlign: 'right' }}
                    value={overallDiscount || ''}
                    min={0}
                    onChange={(e) => setOverallDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>VAT / Tax (%):</span>
                  <input
                    type="number"
                    className="input input-sm"
                    style={{ width: '90px', textAlign: 'right' }}
                    value={vatPercent || ''}
                    min={0}
                    max={100}
                    onChange={(e) => setVatPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
                {vatAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span>Calculated VAT:</span>
                    <span>+৳{vatAmount.toLocaleString()}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Charge (৳):</span>
                  <input
                    type="number"
                    className="input input-sm"
                    style={{ width: '90px', textAlign: 'right' }}
                    value={deliveryCharge || ''}
                    min={0}
                    onChange={(e) => setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Service / Install (৳):</span>
                  <input
                    type="number"
                    className="input input-sm"
                    style={{ width: '90px', textAlign: 'right' }}
                    value={serviceCharge || ''}
                    min={0}
                    onChange={(e) => setServiceCharge(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Other Charges (৳):</span>
                  <input
                    type="number"
                    className="input input-sm"
                    style={{ width: '90px', textAlign: 'right' }}
                    value={otherCharges || ''}
                    min={0}
                    onChange={(e) => setOtherCharges(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>

                <div
                  style={{
                    borderTop: '2px solid var(--border-color)',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Grand Total:</span>
                  <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#10b981' }}>
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', fontStyle: 'italic' }}>
                  {amountInWords}
                </div>
              </div>

              {/* Informational Protection Note */}
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 0.6rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '0.7rem',
                  color: '#10b981',
                  lineHeight: '1.3',
                }}
              >
                🔒 <strong>Stock Protection:</strong> Saving this quotation does NOT deduct inventory, create invoices, or lock stock.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          className="modal-footer"
          style={{
            borderTop: '1px solid var(--border-color)',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Prepared by: <strong>{currentUser?.name || 'Sales Staff'}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleSubmit('DRAFT')}
              disabled={isSaving}
              style={{ fontWeight: 600 }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              Save as Draft
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleSubmit('SENT')}
              disabled={isSaving}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #002B5B 100%)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Save & Issue Quotation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
