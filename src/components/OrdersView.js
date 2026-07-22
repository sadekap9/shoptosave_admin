import React, { useState } from 'react';
import {
  Search,
  Calendar,
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Coins,
  Eye,
  X
} from 'lucide-react';

const OrdersView = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Dynamically calculate order statistics
  const totalCount = orders.length;
  const completeCount = orders.filter((o) => o.status === 'Complete').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const failedCount = orders.filter((o) => o.status === 'Failed').length;

  // Calculate total checkout volume
  const totalVolume = orders.reduce((sum, o) => {
    const numericStr = o.amount.replace(/[^0-9]/g, '');
    const value = parseFloat(numericStr) || 0;
    return sum + value;
  }, 0);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-full box-border animate-fadeIn relative">
      {/* Header section */}
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sales
            </span>
            <ChevronRight className="w-3 h-3 text-slate-350" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Orders Ledger
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gift Card Orders
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track transaction purchases, order processing pipelines, and client distributions.
          </p>
        </div>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(109,40,217,0.06)] hover:border-primary transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Orders</span>
            <h3 className="text-2xl font-black text-slate-900">{totalCount}</h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Purchased gift cards</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(16,185,129,0.06)] hover:border-emerald-500 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Completed Handover</span>
            <h3 className="text-2xl font-black text-emerald-500">{completeCount}</h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Delivered successfully</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(245,158,11,0.06)] hover:border-amber-500 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active / Failed</span>
            <h3 className="text-2xl font-black text-amber-500">
              {processingCount} <span className="text-xs text-red-500 font-bold">/ {failedCount} Failed</span>
            </h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Processing queue status</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(13,148,136,0.06)] hover:border-teal-500 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Volume</span>
            <h3 className="text-2xl font-black text-slate-900">₹{totalVolume.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Total checkout value</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Coins className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Filters bar */}
        <div className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by order ID, customer name, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-200 text-slate-900 font-medium placeholder-slate-400"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-primary outline-none transition-all text-slate-700 font-semibold w-full md:w-44"
            >
              <option value="All">All Orders</option>
              <option value="Complete">Complete</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-100">
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 pl-6">Order ID</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Gift Name</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 text-center">Qty</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Store</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Total Amount</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 text-center">Reward</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Order Placed</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 text-center">Status</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 text-center pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingBag className="w-10 h-10 text-slate-300 opacity-50" />
                      <span className="text-xs font-semibold text-slate-400">No orders recorded matching your criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const status = order.status;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-violet-50/50 transition-colors"
                    >
                      <td className="px-4 py-4 pl-6 text-[11px] font-mono font-bold text-primary whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                        {order.brand}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-slate-700 text-center">
                        {order.quantity || 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                        {order.store || order.brand}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] font-medium text-slate-500">
                        {order.category || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-extrabold text-slate-900">
                        {order.amount}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        {order.instantDiscount && order.instantDiscount !== '₹0' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-emerald-600">{order.instantDiscount}</span>
                            <span className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-wider mt-0.5">Inst. Discount</span>
                          </div>
                        ) : order.cashback && order.cashback !== '₹0' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-teal-600">{order.cashback}</span>
                            <span className="text-[9px] font-bold text-teal-600/70 uppercase tracking-wider mt-0.5">Cashback</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[10px] text-slate-500 font-semibold">
                        {order.timestamp || '2026-05-22 10:15'}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                          status === 'Complete'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                            : status === 'Processing'
                            ? 'bg-amber-50 text-amber-600 border-amber-500/20'
                            : 'bg-red-50 text-red-600 border-red-500/20'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center pr-6 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          ></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-fadeIn overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Order Details
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="flex flex-col gap-4">
                
                {/* ID & Status */}
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Order ID</p>
                    <p className="text-xs font-mono font-bold text-primary">{selectedOrder.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</p>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedOrder.status === 'Complete'
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedOrder.status === 'Processing'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Core Details Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Gift Name</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedOrder.brand}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Customer</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedOrder.user}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Store / Category</p>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {selectedOrder.store || 'N/A'} • {selectedOrder.category || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Order Placed</p>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {selectedOrder.timestamp || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{selectedOrder.amount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Quantity</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{selectedOrder.quantity || 1}</p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="mt-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 rounded-xl">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-[11px] font-bold text-emerald-800">Instant Discount</span>
                     <span className="text-xs font-black text-emerald-700">{selectedOrder.instantDiscount || '₹0'}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-bold text-teal-800">Earned Cashback</span>
                     <span className="text-xs font-black text-teal-700">{selectedOrder.cashback || '₹0'}</span>
                   </div>
                </div>

                {/* Coupon Information */}
                <div className="mt-2">
                  <h4 className="text-xs font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Coupon Details</h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Coupon Code</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-mono font-bold text-slate-800 tracking-wider">
                          {selectedOrder.couponCode || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">PIN</p>
                        <p className="text-xs font-mono font-bold text-slate-800">
                          {selectedOrder.couponPin || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Date</p>
                        <p className="text-xs font-semibold text-slate-700">
                          {selectedOrder.couponExpiry || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-[#F8FAFC]">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
