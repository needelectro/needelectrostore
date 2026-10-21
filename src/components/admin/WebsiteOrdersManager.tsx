'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Truck, CheckCircle2, Clock, XCircle,
  Phone, MessageCircle, MapPin, Search, Filter,
  RefreshCw, AlertCircle, Eye, DollarSign, Calendar,
  FileText, ReceiptText, ShieldCheck, AlertTriangle, Printer
} from 'lucide-react';
import { api } from '@/src/services/api';
import { useERP } from '@/src/services/erpStore';
import { WebsiteOrder } from '@/src/types';

type OrderStatusType = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export const WebsiteOrdersManager: React.FC = () => {
  const { products, currentUser } = useERP();
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<WebsiteOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [invoicingId, setInvoicingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'warning', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.websiteOrders.getOrders();
      setOrders(res.data || []);
    } catch (err: any) {
      console.error('Failed to load website orders:', err);
      setError(err.message || 'Failed to fetch online website orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatusType) => {
    setUpdatingId(id);
    try {
      await api.websiteOrders.updateOrderStatus(id, { orderStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
      }
      showToast('success', `Order status updated to ${newStatus}`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGenerateInvoice = async (order: WebsiteOrder, allowOverride = false) => {
    if (order.saleInvoiceId) {
      showToast('warning', `Order is already invoiced (${order.saleInvoiceId})`);
      return;
    }

    setInvoicingId(order.id);
    try {
      const res = await api.websiteOrders.generateInvoice(order.id, { allowZeroStockOverride: allowOverride });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  saleInvoiceId: res.invoiceNumber || res.sale?.invoiceNumber || res.sale?.id,
                  orderStatus: o.orderStatus === 'PENDING' ? 'CONFIRMED' : o.orderStatus,
                  fulfillmentStatus: 'PACKED',
                }
              : o
          )
        );
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder((prev) =>
            prev
              ? {
                  ...prev,
                  saleInvoiceId: res.invoiceNumber || res.sale?.invoiceNumber || res.sale?.id,
                  orderStatus: prev.orderStatus === 'PENDING' ? 'CONFIRMED' : prev.orderStatus,
                  fulfillmentStatus: 'PACKED',
                }
              : null
          );
        }
        showToast('success', res.message || 'ERP Sales invoice generated and inventory deducted successfully!');
      } else if (res.requiresProcurement) {
        const missingList = res.missingProducts?.map((m: any) => `${m.name} (In warehouse: ${m.currentStock}, Needed: ${m.requested})`).join('\n') || '';
        const shouldOverride = window.confirm(
          `⚠️ PROCUREMENT REQUIRED FOR THIS ORDER:\n\n${missingList}\n\nPhysical inventory is currently 0 or insufficient.\nDo you want to override and bill now (e.g., if goods are in-transit or arriving today)?`
        );
        if (shouldOverride) {
          await handleGenerateInvoice(order, true);
        }
      } else {
        showToast('error', res.message || 'Failed to generate invoice');
      }
    } catch (err: any) {
      if (err.data?.requiresProcurement) {
        const missingList = err.data.missingProducts?.map((m: any) => `${m.name} (In warehouse: ${m.currentStock}, Needed: ${m.requested})`).join('\n') || '';
        const shouldOverride = window.confirm(
          `⚠️ PROCUREMENT REQUIRED FOR THIS ORDER:\n\n${missingList}\n\nPhysical inventory is currently 0 or insufficient.\nDo you want to override and bill now (e.g., if goods are in-transit or arriving today)?`
        );
        if (shouldOverride) {
          await handleGenerateInvoice(order, true);
        }
      } else {
        showToast('error', err.message || 'Failed to generate invoice');
      }
    } finally {
      setInvoicingId(null);
    }
  };

  const handleMarkPaymentCollected = async (id: string) => {
    if (!confirm('Confirm that cash payment has been collected from the customer upon delivery?')) return;
    setUpdatingId(id);
    try {
      await api.websiteOrders.updateOrderStatus(id, {
        paymentStatus: 'PAID',
        fulfillmentStatus: 'DELIVERED',
        orderStatus: 'DELIVERED',
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, paymentStatus: 'PAID' as const, fulfillmentStatus: 'DELIVERED' as const, orderStatus: 'DELIVERED' as const }
            : o
        )
      );
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) =>
          prev
            ? { ...prev, paymentStatus: 'PAID', fulfillmentStatus: 'DELIVERED', orderStatus: 'DELIVERED' }
            : null
        );
      }
      showToast('success', 'Payment marked as PAID and order completed.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to record payment collection');
    } finally {
      setUpdatingId(null);
    }
  };

  // Check if an order contains items requiring procurement (zero physical stock)
  const orderNeedsProcurement = (order: WebsiteOrder): boolean => {
    if (!order.items || !Array.isArray(order.items)) return false;
    return order.items.some((item) => {
      const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
      return prod ? prod.currentStock < item.quantity : false;
    });
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.district.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || o.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2.5 transition-all animate-in slide-in-from-top-4 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600" />
          ) : (
            <AlertCircle size={16} className="text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="text-[#008CFF]" size={20} />
            <h2 className="text-lg font-bold text-[#002B5B]">
              Website Online &amp; COD Orders Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accept orders for in-stock and zero-stock items. Confirm orders without altering physical inventory, and generate official ERP billing when ready for fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-500"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#008CFF] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-[#008CFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading website orders...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <ShoppingBag size={36} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 text-sm">No Orders Found</h3>
          <p className="text-xs text-slate-500">Orders placed by customers on the website will appear here in real-time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F8] border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Order # &amp; Date</th>
                  <th className="py-3 px-4">Customer &amp; Phone</th>
                  <th className="py-3 px-4">Delivery District</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">ERP Billing</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => {
                  const needsProcure = orderNeedsProcurement(o);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#008CFF] block">
                          {o.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#002B5B] block">
                          {o.customerName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`tel:${o.customerPhone}`}
                            className="text-[11px] font-mono text-slate-500 hover:text-[#008CFF] flex items-center gap-1"
                          >
                            <Phone size={11} />
                            <span>{o.customerPhone}</span>
                          </a>
                          <a
                            href={`https://wa.me/88${o.customerPhone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(o.customerName)}%2C%20regarding%20your%20NEED%20ELECTRO%20order%20${o.orderNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle size={13} />
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {o.district}
                        </span>
                        <span className="block text-[11px] text-slate-400 truncate max-w-[150px]">
                          {o.deliveryAddress}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {needsProcure ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle size={11} />
                            Procure Needed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} />
                            In Warehouse
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {o.saleInvoiceId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title={`Linked Invoice: ${o.saleInvoiceId}`}>
                            <ReceiptText size={12} />
                            Invoiced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Unbilled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#002B5B]">
                        ৳{o.total?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={o.orderStatus}
                          disabled={updatingId === o.id}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatusType)}
                          className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PROCESSING">Processing / Packed</option>
                          <option value="SHIPPED">Out for Delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!o.saleInvoiceId && o.orderStatus !== 'CANCELLED' && (
                            <button
                              onClick={() => handleGenerateInvoice(o)}
                              disabled={invoicingId === o.id}
                              className="px-2.5 py-1 rounded-lg bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                              title="Generate Official ERP Sales Invoice & Deduct Physical Stock"
                            >
                              <ReceiptText size={12} />
                              <span>{invoicingId === o.id ? 'Billing...' : 'Bill in ERP'}</span>
                            </button>
                          )}
                          {o.paymentStatus === 'UNPAID' && o.orderStatus !== 'CANCELLED' && (
                            <button
                              onClick={() => handleMarkPaymentCollected(o.id)}
                              disabled={updatingId === o.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors"
                              title="Mark COD Cash Collected"
                            >
                              Collect
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                            title="View order details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Order Details &amp; Fulfillment</span>
                <h3 className="font-extrabold text-lg text-[#002B5B] font-mono">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/order-confirmation/${selectedOrder.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-xl bg-blue-50 text-[#008CFF] border border-blue-200 text-xs font-bold hover:underline"
                >
                  Customer Receipt ↗
                </a>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                <span className="font-bold text-slate-500 block">Customer Information</span>
                <p className="font-bold text-[#002B5B]">{selectedOrder.customerName}</p>
                <p className="text-slate-600 font-mono">{selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && <p className="text-slate-400">{selectedOrder.customerEmail}</p>}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                <span className="font-bold text-slate-500 block">Delivery Address</span>
                <p className="font-semibold text-slate-800">{selectedOrder.district}, Bangladesh</p>
                <p className="text-slate-600">{selectedOrder.deliveryAddress}</p>
                {selectedOrder.deliveryNotes && <p className="text-blue-500 italic mt-1">&quot;{selectedOrder.deliveryNotes}&quot;</p>}
              </div>
            </div>

            {/* Items Table with Live Warehouse Stock Level */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Ordered Products &amp; Warehouse Stock Verification
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F4F6F8] text-slate-600 font-bold">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-center">Warehouse Stock</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {Array.isArray(selectedOrder.items) &&
                      selectedOrder.items.map((item: any, idx: number) => {
                        const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
                        const stockOnHand = prod ? prod.currentStock : 0;
                        const isStockSufficient = stockOnHand >= item.quantity;
                        return (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-sans">
                              <span className="font-semibold block">{item.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                            </td>
                            <td className="py-2 px-3 text-center font-bold">{item.quantity}</td>
                            <td className="py-2 px-3 text-center font-sans">
                              {isStockSufficient ? (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {stockOnHand} in warehouse
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  {stockOnHand} units (Procure)
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">৳{item.price?.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right font-bold">৳{(item.price * item.quantity)?.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ERP Invoicing Control Box */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#002B5B] flex items-center gap-1.5">
                  <ReceiptText size={16} className="text-[#008CFF]" />
                  <span>ERP Billing &amp; Inventory Workflow</span>
                </span>
                {selectedOrder.saleInvoiceId ? (
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    Invoice: {selectedOrder.saleInvoiceId}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
                    Not Yet Invoiced
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                {selectedOrder.saleInvoiceId
                  ? 'Official sales invoice has been generated. Physical stock was deducted from inventory.'
                  : 'Customer order placement does not alter physical stock. Click "Generate ERP Invoice" when items are packed to record the sale and decrement inventory.'}
              </p>
              {!selectedOrder.saleInvoiceId && selectedOrder.orderStatus !== 'CANCELLED' && (
                <button
                  onClick={() => handleGenerateInvoice(selectedOrder)}
                  disabled={invoicingId === selectedOrder.id}
                  className="px-4 py-2 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <ReceiptText size={14} />
                  <span>{invoicingId === selectedOrder.id ? 'Generating Invoice...' : 'Generate Official ERP Sales Invoice & Deduct Stock'}</span>
                </button>
              )}
            </div>

            {/* Financials */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
              <div className="text-slate-400">
                Payment: <span className="font-bold text-slate-700">{selectedOrder.paymentMethod}</span>
                <span className="ml-2 font-semibold">({selectedOrder.paymentStatus})</span>
              </div>
              <div className="text-right space-y-1">
                <div className="text-slate-500">Subtotal: ৳{selectedOrder.subtotal?.toLocaleString()}</div>
                <div className="text-slate-500">Delivery: ৳{selectedOrder.deliveryCharge?.toLocaleString()}</div>
                <div className="text-sm font-black text-[#008CFF] font-mono">
                  Total Payable: ৳{selectedOrder.total?.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
