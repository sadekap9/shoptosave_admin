import React, { useState } from 'react';
import {
  Landmark,
  Coins,
  Clock,
  Search,
  Download,
  ChevronRight,
  FileText
} from 'lucide-react';

// Helper to get initials
const getInitials = (name) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Helper to get matching avatar gradient
const getAvatarGradient = (name) => {
  const colors = [
    'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
    'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
    'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const initialLedgers = [
  { id: 'TXN-99042', user: 'Ravi Kumar M.', type: 'Cashback Credit', amount: '₹145', status: 'Settled', date: '2026-05-22' },
  { id: 'TXN-99041', user: 'Amit Verma K.', type: 'Card Sold Refund', amount: '₹500', status: 'Settled', date: '2026-05-22' },
  { id: 'TXN-99040', user: 'Priya Sharma S.', type: 'Cashback Credit', amount: '₹75', status: 'Settled', date: '2026-05-21' },
  { id: 'TXN-99039', user: 'Rahul Saxena S.', type: 'Bulk Wallet Add', amount: '₹4,500', status: 'Settled', date: '2026-05-21' },
  { id: 'TXN-99038', user: 'Meera Rawat R.', type: 'Cashback Credit', amount: '₹110', status: 'Settled', date: '2026-05-20' },
  { id: 'TXN-99037', user: 'Dev Patel P.', type: 'Cashback Credit', amount: '₹35', status: 'Settled', date: '2026-05-20' },
];

const WalletsView = ({ triggerToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ledgers] = useState(initialLedgers);

  const filteredLedgers = ledgers.filter((l) =>
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      {/* Header section with breadcrumbs */}
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Finances
            </span>
            <ChevronRight className="w-3 h-3 text-slate-350" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Platform Ledger
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Platform Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor user wallet balances, disbursed cashback reports, and operational financial ledger logs.
          </p>
        </div>
        <button
          onClick={() => triggerToast('Generating comprehensive audit spreadsheets...', 'success')}
          className="flex items-center gap-2 border border-primary/30 text-primary hover:bg-primary/5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all"
        >
          <Download className="w-4 h-4" />
          Export Ledger
        </button>
      </div>

      {/* Reserves Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(109,40,217,0.06)] hover:border-primary transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">User Wallet Liability</span>
            <h3 className="text-2xl font-black text-slate-900">₹4,82,400</h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Combined value of active user wallets</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Landmark className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(16,185,129,0.06)] hover:border-emerald-500 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cashback Disbursed</span>
            <h3 className="text-2xl font-black text-emerald-500">₹1,24,900</h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Total rewards disbursed to date</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Coins className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(245,158,11,0.06)] hover:border-amber-500 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending Payout Reserve</span>
            <h3 className="text-2xl font-black text-amber-550">₹24,500</h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Reserves locked for active audits</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Title and Search Row */}
        <div className="p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h3 className="font-bold text-sm text-slate-900">
            System Ledger Transactions
          </h3>
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search ledger by txn ID or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-200 text-slate-900 font-medium placeholder-slate-400"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-100">
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 pl-6">Transaction ID</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Settlement Date</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Customer</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Activity Type</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Ledger Impact</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center pr-6">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 text-slate-300 opacity-50" />
                      <span className="text-xs font-semibold text-slate-400">No transactions recorded matching your search.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLedgers.map((txn) => {
                  const isDeduction = txn.type.toLowerCase().includes('deduct');
                  return (
                    <tr
                      key={txn.id}
                      className="hover:bg-violet-50/10 transition-colors"
                    >
                      <td className="px-6 py-4 pl-6 text-xs font-mono font-bold text-primary whitespace-nowrap">
                        {txn.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-semibold">
                        {txn.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-extrabold text-[10px] shadow-sm flex-shrink-0"
                            style={{ background: getAvatarGradient(txn.user) }}
                          >
                            {getInitials(txn.user)}
                          </div>
                          <span className="text-xs font-bold text-slate-800">{txn.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-650">
                        {txn.type}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-xs font-extrabold ${isDeduction ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isDeduction ? '-' : '+'}{txn.amount}
                      </td>
                      <td className="px-6 py-4 text-center pr-6 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-600 border-emerald-500/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {txn.status}
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

export default WalletsView;
