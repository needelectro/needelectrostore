import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Sale, Product, ProductCategory, Customer, SaleItem, PaymentMethod, PaymentBreakdown } from '../types';
import { isProductInCategory, SHOWROOM_CATEGORIES } from '../services/categoryMatcher';
import { 
  ShoppingCart, Search, Plus, Trash2, CreditCard, 
  Printer, UserPlus, Hash, Percent, Tag, Check, X, 
  Laptop, ShieldCheck, ArrowRight, Zap, RefreshCw 
} from 'lucide-react';

interface POSModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const POSModule: React.FC<POSModuleProps> = ({ onNavigate }) => {
  const { 
    products, serials, customers, createCustomer, 
    createSale, selectedBranch, currentUser, 
    setActiveInvoiceToPrint, setActiveThermalReceiptToPrint 
  } = useERP();

  // Selected Customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNid, setNewCustNid] = useState('');

  // Product Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Cart
  interface CartItem extends SaleItem {
    availableSerials: string[];
  }
  const [cart, setCart] = useState<CartItem[]>([]);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(0);

  // Serial Selection Modal
  const [serialModalItemIndex, setSerialModalItemIndex] = useState<number | null>(null);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [primaryPaymentMethod, setPrimaryPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitPayments, setSplitPayments] = useState<{ method: PaymentMethod; amount: number; ref: string }[]>([
    { method: 'Cash', amount: 0, ref: '' },
    { method: 'bKash', amount: 0, ref: '' }
  ]);
  const [transactionRef, setTransactionRef] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [customSerialInput, setCustomSerialInput] = useState<string>('');

  // Auto-load cloned invoice if duplicated from SalesModule
  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem('needelectro_duplicate_cart');
      if (stored) {
        sessionStorage.removeItem('needelectro_duplicate_cart');
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const loaded = parsed.map((item: any) => ({
            ...item,
            availableSerials: serials
              .filter(s => s.productId === item.productId && s.status === 'AVAILABLE')
              .map(s => s.serialNumber),
          }));
          setCart(loaded);
        }
      }
    } catch (e) {
      console.warn('Duplicate cart load error:', e);
    }
  }, [serials]);

  // Categories list
  const categories = ['ALL', ...SHOWROOM_CATEGORIES];

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesCat = isProductInCategory(p, selectedCategory);
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery && p.status === 'ACTIVE';
  });

  // Add Product to Cart
  const handleAddToCart = (prod: Product) => {
    if (prod.currentStock <= 0) {
      alert(`Cannot add ${prod.name}. Current stock is 0.`);
      return;
    }

    const existingIdx = cart.findIndex(item => item.productId === prod.id);

    // Available serials in current branch
    const availableSerialsForProd = serials
      .filter(s => s.productId === prod.id && s.status === 'AVAILABLE')
      .map(s => s.serialNumber);

    if (existingIdx !== -1) {
      const existing = cart[existingIdx];
      if (existing.quantity + 1 > prod.currentStock) {
        alert(`Cannot add more than ${prod.currentStock} units for ${prod.name}`);
        return;
      }
      const updated = [...cart];
      updated[existingIdx] = {
        ...existing,
        quantity: existing.quantity + 1,
        total: (existing.quantity + 1) * existing.unitPrice - existing.discount
      };
      setCart(updated);
    } else {
      const newItem: CartItem = {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        category: prod.category,
        quantity: 1,
        unitPrice: prod.retailPrice,
        discount: 0,
        total: prod.retailPrice,
        warrantyMonths: prod.warrantyPeriodMonths,
        isSerialized: prod.isSerialized,
        serialNumbers: prod.isSerialized && availableSerialsForProd.length > 0 ? [availableSerialsForProd[0]] : [],
        availableSerials: availableSerialsForProd,
        brand: prod.brand,
        model: prod.model,
        specs: prod.specs,
        product: prod
      };
      setCart([...cart, newItem]);
    }
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const item = cart[index];
    const prod = products.find(p => p.id === item.productId);
    if (prod && newQty > prod.currentStock) {
      alert(`Only ${prod.currentStock} units available in stock!`);
      return;
    }

    const updated = [...cart];
    updated[index] = {
      ...item,
      quantity: newQty,
      total: newQty * item.unitPrice - item.discount
    };
    setCart(updated);
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Cart Totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = Math.round(((subtotal - overallDiscount) * vatPercent) / 100);
  const grandTotal = Math.max(0, subtotal - overallDiscount + vatAmount);

  // Handle Quick Add Customer
  const handleSaveCustomer = async () => {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('Please enter customer name and phone number.');
      return;
    }
    const res = await createCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim() || 'Dhaka, Bangladesh',
      nid: newCustNid.trim(),
      creditLimit: 50000
    });
    if (res.success && res.customer) {
      setSelectedCustomerId(res.customer.id);
      setShowAddCustomerModal(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustAddress('');
      setNewCustNid('');
    }
  };

  // Open Checkout Modal
  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add products.');
      return;
    }

    // Serial numbers are optional for all products - no checkout block

    setPaidAmount(grandTotal);
    setShowPaymentModal(true);
  };

  // Complete Sale
  const handleCompleteSale = async () => {
    const cust = customers.find(c => c.id === selectedCustomerId);
    if (!cust) {
      alert('Please select or add a customer!');
      return;
    }

    let payments: PaymentBreakdown[] = [];

    if (isSplitPayment) {
      const splitTotal = splitPayments.reduce((s, p) => s + p.amount, 0);
      if (splitTotal <= 0) {
        alert('Please enter valid split payment amounts.');
        return;
      }
      payments = splitPayments.map(p => ({
        method: p.method,
        amount: p.amount,
        transactionRef: p.ref || undefined
      }));
    } else {
      payments = [{
        method: primaryPaymentMethod,
        amount: paidAmount,
        transactionRef: transactionRef || undefined
      }];
    }

    const actualPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const dueAmount = Math.max(0, grandTotal - actualPaid);
    const previousDue = Number(cust.currentBalance || 0);

    const saleResult = await createSale({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerEmail: cust.email || undefined,
      customerType: (cust as any).customerType || 'RETAIL',
      billingAddress: cust.address || 'Shop No: 5, MR Plaza, Kusumbag, Moulvibazar',
      shippingAddress: cust.address || 'Shop No: 5, MR Plaza, Kusumbag, Moulvibazar',
      previousDue,
      totalDue: previousDue + dueAmount,
      branchId: selectedBranch.id,
      date: new Date().toISOString().split('T')[0],
      items: cart.map(c => ({
        productId: c.productId,
        productName: c.productName,
        sku: c.sku,
        category: c.category,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        discount: c.discount,
        total: c.total,
        warrantyMonths: c.warrantyMonths,
        isSerialized: c.isSerialized,
        serialNumbers: c.serialNumbers
      })),
      subtotal,
      overallDiscount,
      vatAmount,
      vatPercent,
      grandTotal,
      paidAmount: actualPaid,
      dueAmount,
      payments,
      saleType: 'REGULAR',
      status: dueAmount === 0 ? 'COMPLETED' : 'PARTIALLY_PAID',
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      notes: saleNotes
    });

    if (saleResult.success && saleResult.sale) {
      setShowPaymentModal(false);
      
      const cartItemsSnapshot = [...cart];
      const paymentsSnapshot = [...payments];

      setCart([]);
      setOverallDiscount(0);
      setSaleNotes('');

      // Build guaranteed complete sale object for instant printing
      const completeSale: Sale = {
        ...saleResult.sale,
        customerAddress: saleResult.sale.customerAddress || cust.address || '',
        items: (saleResult.sale.items && Array.isArray(saleResult.sale.items) && saleResult.sale.items.length > 0)
          ? saleResult.sale.items
          : cartItemsSnapshot.map(c => ({
              id: 'si-' + c.productId,
              saleId: saleResult.sale?.id || '',
              productId: c.productId,
              productName: c.productName,
              sku: c.sku,
              category: c.category,
              quantity: c.quantity,
              unitPrice: c.unitPrice,
              discount: c.discount,
              total: c.total,
              warrantyMonths: c.warrantyMonths,
              isSerialized: c.isSerialized,
              serialNumbers: c.serialNumbers || [],
              brand: c.brand,
              model: c.model,
              specs: c.specs,
              product: c.product
            })),
        payments: (saleResult.sale.payments && Array.isArray(saleResult.sale.payments) && saleResult.sale.payments.length > 0)
          ? saleResult.sale.payments
          : paymentsSnapshot
      };

      // Directly launch the official invoice preview & print
      setActiveInvoiceToPrint(completeSale);
    } else {
      alert(`Error creating sale: ${saleResult.error}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Top POS Control Bar */}
      <div className="erp-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Customer Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <label style={{ fontWeight: '700', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Customer:</label>
          <select 
            className="form-select"
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            style={{ flex: 1 }}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone}) — {c.address}
              </option>
            ))}
          </select>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setShowAddCustomerModal(true)}
            title="Add New Customer"
          >
            <UserPlus size={15} /> + New
          </button>
        </div>

        {/* Action Link to EMI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Selling on Installments?</span>
          <button className="btn btn-warning btn-sm" onClick={() => onNavigate('emi', 'new')}>
            <Laptop size={15} /> Open Laptop EMI Wizard &rarr;
          </button>
        </div>
      </div>

      {/* Main POS Split Screen: Products Catalog (Left) + Billing Cart (Right) */}
      <div className="pos-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* LEFT: Product Catalog & Search */}
        <div className="erp-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', minHeight: 0, overflow: 'hidden' }}>
          {/* Search & Category Pills */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search products by Name, SKU, Model, Brand..."
                className="form-input"
                style={{ paddingLeft: '32px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <button className="btn btn-ghost btn-sm" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            {categories.map(cat => {
              const count = cat === 'ALL'
                ? products.filter(p => p.status === 'ACTIVE').length
                : products.filter(p => p.status === 'ACTIVE' && isProductInCategory(p, cat)).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    background: selectedCategory === cat ? 'var(--brand-primary)' : 'var(--bg-card-muted)',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        background: selectedCategory === cat ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)',
                        fontWeight: 700
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', alignContent: 'start' }}>
            {filteredProducts.map(prod => (
              <div
                key={prod.id}
                className="erp-card erp-card-interactive"
                onClick={() => handleAddToCart(prod)}
                style={{
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      {prod.category}
                    </span>
                    {prod.isSerialized && (
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                        Serialized
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.84rem', marginTop: '0.5rem', lineHeight: '1.3' }}>
                    {prod.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    SKU: {prod.sku}
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: 'var(--brand-primary)', fontSize: '0.95rem' }}>
                      ৳{prod.retailPrice.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: prod.currentStock <= prod.minStock ? '#ef4444' : '#10b981' }}>
                      Stock: {prod.currentStock}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.5rem' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No products found matching criteria.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Active Billing Cart */}
        <div className="erp-card pos-billing-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', background: 'var(--bg-card)', minHeight: 0, overflow: 'hidden' }}>
          {/* Cart Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem' }}>
              <ShoppingCart size={18} color="var(--brand-primary)" />
              Cart Items ({cart.reduce((s, i) => s + i.quantity, 0)})
            </div>
            {cart.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setCart([])} style={{ color: '#ef4444' }}>
                <Trash2 size={14} /> Clear Cart
              </button>
            )}
          </div>

          {/* Cart List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
            {cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <div>Cart is empty</div>
                <div style={{ fontSize: '0.75rem' }}>Select products from the catalog on the left to begin</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {cart.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      background: 'var(--bg-card-muted)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.84rem' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ৳{item.unitPrice.toLocaleString()} each • Warranty: {item.warrantyMonths} mos
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveItem(idx)} style={{ color: '#ef4444', padding: '2px' }}>
                        <X size={15} />
                      </button>
                    </div>

                    {/* Serial Number Picker Trigger (for serialized products or items with serials) */}
                    {(item.isSerialized || item.serialNumbers.length > 0) && (
                      <div style={{
                        background: item.serialNumbers.length > 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 140, 255, 0.06)',
                        border: `1px solid ${item.serialNumbers.length > 0 ? '#10b981' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}>
                        <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
                          <Hash size={13} color="var(--brand-primary)" />
                          <span style={{ fontWeight: 600, color: item.serialNumbers.length > 0 ? '#10b981' : 'var(--text-secondary)' }}>
                            {item.serialNumbers.length > 0 ? `S/N: ${item.serialNumbers.join(', ')}` : 'Serial No (Optional)'}
                          </span>
                        </div>
                        <button 
                          className="btn btn-sm btn-ghost" 
                          onClick={() => {
                            setCustomSerialInput('');
                            setSerialModalItemIndex(idx);
                          }}
                          style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 'bold', padding: '2px 8px' }}
                        >
                          {item.serialNumbers.length > 0 ? 'Edit' : '+ Add Serial'}
                        </button>
                      </div>
                    )}

                    {/* Quantity & Item Subtotal */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '0.2rem 0.5rem' }}
                          onClick={() => handleUpdateQty(idx, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: '700', minWidth: '24px', textAlign: 'center', fontSize: '0.85rem' }}>
                          {item.quantity}
                        </span>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '0.2rem 0.5rem' }}
                          onClick={() => handleUpdateQty(idx, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ fontWeight: '800', color: 'var(--brand-primary)', fontSize: '0.9375rem' }}>
                        ৳{item.total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary & Checkout */}
          <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal:</span>
              <span style={{ fontWeight: '700' }}>৳{subtotal.toLocaleString()}</span>
            </div>

            {/* Discount Input */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Overall Discount (৳):</span>
              <input
                type="number"
                min="0"
                value={overallDiscount}
                onChange={e => setOverallDiscount(Number(e.target.value) || 0)}
                style={{
                  width: '90px',
                  textAlign: 'right',
                  padding: '2px 6px',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Grand Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px dashed var(--border-color)',
              paddingTop: '0.5rem',
              marginBottom: '1rem'
            }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>Grand Total:</span>
              <span style={{ fontWeight: '800', fontSize: '1.35rem', color: 'var(--brand-primary)' }}>
                ৳{grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Checkout Action Button */}
            <button
              className="btn btn-success btn-lg"
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <CreditCard size={18} />
              Proceed to Payment (৳{grandTotal.toLocaleString()})
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Serial Number Picker */}
      {serialModalItemIndex !== null && cart[serialModalItemIndex] && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Hash size={18} color="var(--brand-primary)" />
                Manage Serial Numbers ({cart[serialModalItemIndex].productName})
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSerialModalItemIndex(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'rgba(0, 140, 255, 0.08)',
                border: '1px solid rgba(0, 140, 255, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                marginBottom: '0.85rem'
              }}>
                <strong>Optional:</strong> You can assign serial numbers (quantity: <strong>{cart[serialModalItemIndex].quantity}</strong>) for warranty coverage or leave empty to complete the sale without serial numbers.
              </div>

              {/* Currently Selected Serials */}
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Selected Serials ({cart[serialModalItemIndex].serialNumbers.length}):
                </div>
                {cart[serialModalItemIndex].serialNumbers.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {cart[serialModalItemIndex].serialNumbers.map((sn, snIdx) => (
                      <span
                        key={snIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid #10b981',
                          color: 'var(--text-primary)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          fontWeight: 700
                        }}
                      >
                        {sn}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = cart[serialModalItemIndex].serialNumbers.filter((_, i) => i !== snIdx);
                            const updatedCart = [...cart];
                            updatedCart[serialModalItemIndex] = {
                              ...cart[serialModalItemIndex],
                              serialNumbers: updated
                            };
                            setCart(updatedCart);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: 0,
                            lineHeight: 1
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No serial numbers added (Sale will proceed normally)
                  </div>
                )}
              </div>

              {/* Add Custom / Barcode Scan Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>
                  Scan Barcode or Type Serial Number:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SN-892301 (Press Enter to add)"
                    value={customSerialInput}
                    onChange={e => setCustomSerialInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = customSerialInput.trim();
                        if (val) {
                          if (cart[serialModalItemIndex].serialNumbers.includes(val)) {
                            alert('This serial number is already in the list.');
                            return;
                          }
                          const updated = [...cart[serialModalItemIndex].serialNumbers, val];
                          const updatedCart = [...cart];
                          updatedCart[serialModalItemIndex] = {
                            ...cart[serialModalItemIndex],
                            serialNumbers: updated
                          };
                          setCart(updatedCart);
                          setCustomSerialInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const val = customSerialInput.trim();
                      if (val) {
                        if (cart[serialModalItemIndex].serialNumbers.includes(val)) {
                          alert('This serial number is already in the list.');
                          return;
                        }
                        const updated = [...cart[serialModalItemIndex].serialNumbers, val];
                        const updatedCart = [...cart];
                        updatedCart[serialModalItemIndex] = {
                          ...cart[serialModalItemIndex],
                          serialNumbers: updated
                        };
                        setCart(updatedCart);
                        setCustomSerialInput('');
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* In-Stock Available Serials (Click to toggle) */}
              {cart[serialModalItemIndex].availableSerials.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Available Units in Stock (Click to toggle):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
                    {cart[serialModalItemIndex].availableSerials.map(sn => {
                      const isSelected = cart[serialModalItemIndex].serialNumbers.includes(sn);
                      return (
                        <div
                          key={sn}
                          onClick={() => {
                            const current = [...cart[serialModalItemIndex].serialNumbers];
                            let updated: string[];
                            if (isSelected) {
                              updated = current.filter(s => s !== sn);
                            } else {
                              updated = [...current, sn];
                            }
                            const updatedCart = [...cart];
                            updatedCart[serialModalItemIndex] = {
                              ...cart[serialModalItemIndex],
                              serialNumbers: updated
                            };
                            setCart(updatedCart);
                          }}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isSelected ? 'var(--bg-active)' : 'var(--bg-card-muted)',
                            border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span style={{ fontWeight: '700', fontSize: '0.82rem', fontFamily: 'monospace' }}>{sn}</span>
                          {isSelected ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                              <Check size={14} /> SELECTED
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>AVAILABLE</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const updatedCart = [...cart];
                  updatedCart[serialModalItemIndex] = {
                    ...cart[serialModalItemIndex],
                    serialNumbers: []
                  };
                  setCart(updatedCart);
                  setSerialModalItemIndex(null);
                }}
                style={{ color: '#ef4444' }}
              >
                Clear / Skip (Optional)
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setSerialModalItemIndex(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Complete Payment & Multi-Mode Checkout */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-lg" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <CreditCard size={20} color="var(--brand-primary)" />
                Finalize POS Sale & Payment
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPaymentModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Grand Total Highlight */}
              <div style={{ background: 'var(--bg-active)', border: '1px solid var(--brand-primary)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Amount Due for Invoice:</div>
                  <div style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--brand-primary)' }}>
                    ৳{grandTotal.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8125rem' }}>
                  <div>Customer: <strong>{customers.find(c => c.id === selectedCustomerId)?.name}</strong></div>
                  <div>Items: <strong>{cart.length} items ({cart.reduce((s, i) => s + i.quantity, 0)} qty)</strong></div>
                </div>
              </div>

              {/* Split Payment Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Split Payment across multiple methods?</span>
                <button
                  className={`btn btn-sm ${isSplitPayment ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setIsSplitPayment(!isSplitPayment)}
                >
                  {isSplitPayment ? 'Yes (Split Active)' : 'No (Single Method)'}
                </button>
              </div>

              {/* Single Payment Method Selector */}
              {!isSplitPayment ? (
                <div>
                  <label className="form-label">Select Payment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    {(['Cash', 'bKash (01884599271)', 'Eastern Bank (Amdadur)', 'Pubali Bank (Amdadur)', 'Pubali Bank (Fulori)', 'Card (POS)'] as PaymentMethod[]).map(method => (
                      <button
                        key={method}
                        onClick={() => setPrimaryPaymentMethod(method)}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${primaryPaymentMethod === method ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                          background: primaryPaymentMethod === method ? 'var(--bg-active)' : 'var(--bg-card-muted)',
                          color: primaryPaymentMethod === method ? 'var(--brand-primary)' : 'var(--text-primary)',
                          fontWeight: '700',
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Paid Amount (৳)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={paidAmount}
                        onChange={e => setPaidAmount(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Trx ID / Bank Slip Ref</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. BK9A887123"
                        value={transactionRef}
                        onChange={e => setTransactionRef(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Split Payment Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Specify breakdown (e.g. partial cash + partial bKash / Card):
                  </div>
                  {splitPayments.map((p, pIdx) => (
                    <div key={pIdx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '0.5rem' }}>
                      <select
                        className="form-select"
                        value={p.method}
                        onChange={e => {
                          const updated = [...splitPayments];
                          updated[pIdx].method = e.target.value as PaymentMethod;
                          setSplitPayments(updated);
                        }}
                      >
                        {(['Cash', 'bKash (01884599271)', 'Eastern Bank (Amdadur)', 'Pubali Bank (Amdadur)', 'Pubali Bank (Fulori)', 'Card (POS)'] as PaymentMethod[]).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Amount"
                        value={p.amount || ''}
                        onChange={e => {
                          const updated = [...splitPayments];
                          updated[pIdx].amount = Number(e.target.value) || 0;
                          setSplitPayments(updated);
                        }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ref/Trx ID"
                        value={p.ref}
                        onChange={e => {
                          const updated = [...splitPayments];
                          updated[pIdx].ref = e.target.value;
                          setSplitPayments(updated);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ alignSelf: 'flex-start', color: 'var(--brand-primary)' }}
                    onClick={() => setSplitPayments([...splitPayments, { method: 'Cash', amount: 0, ref: '' }])}
                  >
                    + Add Another Split Method
                  </button>
                </div>
              )}

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Invoice Internal Notes / Warranty Remarks</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optional note for invoice"
                  value={saleNotes}
                  onChange={e => setSaleNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success btn-sm" onClick={handleCompleteSale}>
                <Check size={16} /> Finalize Sale & Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Add Customer */}
      {showAddCustomerModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <UserPlus size={18} color="var(--brand-primary)" />
                Quick Add Customer
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCustomerModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MD. Anisul Haque"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 01711-223344"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dhanmondi, Dhaka"
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">National ID (NID)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optional for regular cash sales"
                  value={newCustNid}
                  onChange={e => setNewCustNid(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddCustomerModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveCustomer}>
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
