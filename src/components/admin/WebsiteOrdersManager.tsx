'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Truck, CheckCircle2, Clock, XCircle,
  Phone, MessageCircle, MapPin, Search, Filter,
  RefreshCw, AlertCircle, Eye, DollarSign, Calendar
} from 'lucide-react';
import { api } from '@/src/services/api';
import { WebsiteOrder } from '@/src/types';

type OrderStatusType = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export const WebsiteOrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<WebsiteOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
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
    } catch (err: any) {
      alert(err.message || 'Failed to record payment collection');
    } finally {
      setUpdatingId(null);
    }
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
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="text-blue-600 dark:text-cyan-400" size={20} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Website Online &amp; COD Orders
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage customer direct website orders, verify delivery addresses, and record COD collection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
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
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading website orders...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <ShoppingBag size={36} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Orders Found</h3>
          <p className="text-xs text-slate-500">Orders placed by customers on the website will appear here in real-time.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Order # &amp; Date</th>
                  <th className="py-3 px-4">Customer &amp; Phone</th>
                  <th className="py-3 px-4">Delivery District</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-600 dark:text-cyan-400 block">
                        {o.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {o.customerName}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`tel:${o.customerPhone}`}
                          className="text-[11px] font-mono text-slate-500 hover:text-blue-600 flex items-center gap-1"
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
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {o.district}
                      </span>
                      <span className="block text-[11px] text-slate-400 truncate max-w-[180px]">
                        {o.deliveryAddress}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ৳{o.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {o.paymentStatus === 'UNPAID' ? 'COD (Unpaid)' : 'Paid'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.orderStatus}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatusType)}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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
                        {o.paymentStatus === 'UNPAID' && o.orderStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => handleMarkPaymentCollected(o.id)}
                            disabled={updatingId === o.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors"
                            title="Mark COD Cash Collected"
                          >
                            Collect Cash
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="View order details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Order Details</span>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white font-mono">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="font-bold text-slate-500 block">Customer Information</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.customerName}</p>
                <p className="text-slate-600 dark:text-slate-300">{selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && <p className="text-slate-400">{selectedOrder.customerEmail}</p>}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="font-bold text-slate-500 block">Delivery Address</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrder.district}, Bangladesh</p>
                <p className="text-slate-600 dark:text-slate-400">{selectedOrder.deliveryAddress}</p>
                {selectedOrder.deliveryNotes && <p className="text-blue-500 italic mt-1">&quot;{selectedOrder.deliveryNotes}&quot;</p>}
              </div>
            </div>

            {/* Items Table */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Ordered Products
              </span>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {Array.isArray(selectedOrder.items) &&
                      selectedOrder.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-sans">
                            <span className="font-semibold block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                          </td>
                          <td className="py-2 px-3 text-center">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">৳{item.price?.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-bold">৳{(item.price * item.quantity)?.toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financials */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="text-slate-400">
                Payment: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="text-right space-y-1">
                <div className="text-slate-500">Subtotal: ৳{selectedOrder.subtotal?.toLocaleString()}</div>
                <div className="text-slate-500">Delivery: ৳{selectedOrder.deliveryCharge?.toLocaleString()}</div>
                <div className="text-sm font-black text-blue-600 dark:text-cyan-400 font-mono">
                  Total Payable: ৳{selectedOrder.total?.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs"
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
