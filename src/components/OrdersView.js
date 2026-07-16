import React, { useState } from 'react';
import {
  Search,
  Calendar,
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Coins
} from 'lucide-react';

const OrdersView = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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
    <div className="w-full max-w-full box-border animate-fadeIn">
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
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 pl-6">Order ID</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Timestamp</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Customer</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Gift Card Brand</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Value</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center pr-6">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
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
                      className="hover:bg-violet-50/10 transition-colors"
                    >
                      <td className="px-6 py-4 pl-6 text-xs font-mono font-bold text-primary whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {order.timestamp || '2026-05-22 10:15'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                        {order.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-700">
                        {order.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-extrabold text-slate-900">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4 text-center pr-6 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border ${
                          status === 'Complete'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10'
                            : status === 'Processing'
                            ? 'bg-amber-50 text-amber-600 border-amber-500/10'
                            : 'bg-red-50 text-red-600 border-red-500/10'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            status === 'Complete' ? 'bg-emerald-500' : status === 'Processing' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersView;
