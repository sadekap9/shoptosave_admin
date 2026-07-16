import React, { useState } from 'react';
import {
  Users,
  IndianRupee,
  Gift,
  RefreshCw,
  Store,
  Download,
  Check,
  X,
  CheckCircle2,
  ArrowUp,
  Hourglass,
  CreditCard
} from 'lucide-react';

// ─── Status Chip ────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const map = {
    Complete:   { bg: 'bg-emerald-50', border: 'border-emerald-500/10', color: 'text-emerald-600', label: 'Complete', pulseClass: 'pulse-dot-green' },
    Processing: { bg: 'bg-amber-50', border: 'border-amber-500/10', color: 'text-amber-600', label: 'Processing', pulseClass: 'pulse-dot-orange' },
    Failed:     { bg: 'bg-red-50', border: 'border-red-500/10', color: 'text-red-600', label: 'Failed', pulseClass: 'pulse-dot-red' },
    Live:       { bg: 'bg-emerald-50', border: 'border-emerald-500/10', color: 'text-emerald-600', label: 'Live', pulseClass: 'pulse-dot-green' },
    Paused:     { bg: 'bg-amber-50', border: 'border-amber-500/10', color: 'text-amber-600', label: 'Paused', pulseClass: 'pulse-dot-orange' },
    Active:     { bg: 'bg-emerald-50', border: 'border-emerald-500/10', color: 'text-emerald-600', label: 'Active', pulseClass: 'pulse-dot-green' },
    Pending:    { bg: 'bg-violet-50', border: 'border-violet-500/10', color: 'text-violet-600', label: 'Pending', pulseClass: 'pulse-dot-orange' },
    Unverified: { bg: 'bg-orange-50', border: 'border-orange-500/10', color: 'text-orange-600', label: 'Unverified', pulseClass: 'pulse-dot-orange' },
    Blocked:    { bg: 'bg-red-50', border: 'border-red-500/10', color: 'text-red-600', label: 'Blocked', pulseClass: 'pulse-dot-red' },
    Paid:       { bg: 'bg-emerald-50', border: 'border-emerald-500/10', color: 'text-emerald-600', label: 'Paid', pulseClass: 'pulse-dot-green' },
  };
  const cfg = map[status] || { bg: 'bg-slate-100', border: 'border-slate-500/10', color: 'text-slate-600', label: status, pulseClass: '' };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide gap-2 border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.pulseClass && (
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.pulseClass}`} style={{ backgroundColor: 'currentColor' }} />
      )}
      {cfg.label}
    </span>
  );
};

// ─── Quick Action Card ───────────────────────────────────────────────────────
const QuickActionCard = ({ icon, label, desc, color, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col gap-2 p-5 rounded-2xl border border-slate-200 bg-white cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
    style={{
      '--hover-border': color,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.boxShadow = `0 12px 24px -8px ${color}20`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#E2E8F0';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div
      className="width-11 h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-[0.88rem] text-slate-900 leading-tight">
        {label}
      </h4>
      <p className="text-[0.74rem] text-slate-500 mt-1">
        {desc}
      </p>
    </div>
    <div className="flex items-center mt-auto pt-2" style={{ color: color }}>
      <span className="text-[11px] font-bold">Open →</span>
    </div>
  </div>
);

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, badge, badgeColor, sub, iconColor }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white border border-slate-200 rounded-[16px] p-6 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: hovered ? iconColor : '#E2E8F0',
        boxShadow: hovered ? `0 12px 30px -10px ${iconColor}25, 0 4px 12px -5px ${iconColor}15` : 'none',
      }}
    >
      {/* Accent line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
        style={{
          backgroundColor: iconColor,
          opacity: hovered ? 1 : 0,
        }}
      />
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {label}
          </span>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            {value}
          </h3>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${iconColor}12`,
            color: iconColor,
          }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
              badgeColor === 'green'
                ? 'bg-emerald-50 text-emerald-600'
                : badgeColor === 'red'
                ? 'bg-red-50 text-red-600'
                : 'bg-violet-50 text-violet-600'
            }`}
          >
            <ArrowUp className="w-2.5 h-2.5" />
            {badge}
          </span>
        )}
        <span className="text-xs text-slate-400">{sub}</span>
      </div>
    </div>
  );
};

// Mock Data for new tables
const recentRegistrations = [
  { name: 'Ravi Mehta', phone: '98765xxxxx', wallet: '₹200', status: 'Active' },
  { name: 'Priya Shah', phone: '91234xxxxx', wallet: '₹0', status: 'Unverified' },
  { name: 'Amit Kumar', phone: '99001xxxxx', wallet: '₹1,500', status: 'Active' },
  { name: 'Sneha Patel', phone: '70000xxxxx', wallet: '₹50', status: 'Blocked' },
];

const recentPayments = [
  { user: 'Ravi M.', type: 'Wallet', amount: '₹500', status: 'Paid' },
  { user: 'Priya S.', type: 'Gift Card', amount: '₹1,000', status: 'Paid' },
  { user: 'Amit K.', type: 'Wallet', amount: '₹2,000', status: 'Paid' },
  { user: 'John D.', type: 'Gift Card', amount: '₹500', status: 'Failed' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const DashboardView = ({
  orders,
  sellRequests,
  stores,
  systemStatus,
  onApproveRequest,
  onRejectRequest,
  onSyncWoohoo,
  onAddStore,
  onToggleStoreStatus,
  triggerToast,
}) => {
  const [openStoreDialog, setOpenStoreDialog]   = useState(false);
  const [storeName, setStoreName]               = useState('');
  const [cashbackPct, setCashbackPct]           = useState('');
  const [storeStoreStatus, setStoreStoreStatus] = useState('Live');

  const [openFeatureDialog, setOpenFeatureDialog] = useState(false);
  const [selectedBrand, setSelectedBrand]         = useState('');

  const handleAddStoreSubmit = (e) => {
    e.preventDefault();
    if (!storeName || !cashbackPct) { triggerToast('Please fill all fields', 'warning'); return; }
    onAddStore({ name: storeName, cashback: `${cashbackPct}%`, status: storeStoreStatus });
    setStoreName(''); setCashbackPct(''); setStoreStoreStatus('Live');
    setOpenStoreDialog(false);
  };

  const handleFeatureSubmit = (e) => {
    e.preventDefault();
    if (!selectedBrand) { triggerToast('Please select a brand to feature', 'warning'); return; }
    triggerToast(`"${selectedBrand}" featured in the catalog!`, 'success');
    setSelectedBrand(''); setOpenFeatureDialog(false);
  };

  // Derived stats
  const totalOrdersVolume = orders.reduce((s, o) => s + (parseFloat(o.amount.replace(/[^0-9]/g, '')) || 0), 0);
  const pendingAuditsCount = sellRequests.length;
  const completeOrders = orders.filter(o => o.status === 'Complete').length;

  // Top selling brands
  const topSellingBrands = [
    { name: 'Amazon',      sales: 234, pct: 100 },
    { name: 'Flipkart',    sales: 190, pct: 81 },
    { name: 'Myntra',      sales: 145, pct: 62 },
    { name: 'Swiggy',      sales: 105, pct: 45 },
    { name: 'Zomato',      sales: 74,  pct: 32 },
    { name: 'Google Play', sales: 47,  pct: 20 },
  ];

  const quickActions = [
    { icon: <RefreshCw className="w-5 h-5" />,   label: 'Sync Woohoo',     desc: `Last: ${systemStatus.lastSync}`, color: '#6D28D9', onClick: onSyncWoohoo },
    { icon: <Store className="w-5 h-5" />,  label: 'Add Store',       desc: 'Register partner store',        color: '#10B981', onClick: () => setOpenStoreDialog(true) },
    { icon: <Gift className="w-5 h-5" />,   label: 'Feature Card',    desc: 'Feature brand in catalog',      color: '#F59E0B', onClick: () => setOpenFeatureDialog(true) },
    { icon: <Download className="w-5 h-5" />, label: 'Export Report',   desc: 'Download Excel summary',         color: '#2563EB', onClick: () => triggerToast('Preparing Excel summary reports...', 'info') },
  ];

  return (
    <div className="w-full box-border">

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Admin Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Shop2Save · Enterprise Console · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => triggerToast('Generating export report...', 'info')}
            className="flex items-center gap-2 border border-slate-200 hover:border-[#6D28D9] hover:bg-[#F5F3FF] hover:text-[#6D28D9] text-slate-600 px-4 py-2 text-xs font-bold rounded-lg transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={onSyncWoohoo}
            className="flex items-center gap-2 text-white bg-gradient-to-r from-primary to-secondary hover:from-[#7C3AED] hover:to-[#8B5CF6] px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-[0_4px_14px_rgba(109,40,217,0.25)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Woohoo
          </button>
        </div>
      </div>

      {/* ── KPI ROW ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label="Total Users"
          value="1,248"
          icon={<Users className="w-6 h-6" />}
          iconColor="#6D28D9"
          badge="+12.4%"
          badgeColor="green"
          sub="this month"
        />
        <KpiCard
          label="Checkout Volume"
          value={`₹${(totalOrdersVolume / 1000).toFixed(0)}K`}
          icon={<IndianRupee className="w-6 h-6" />}
          iconColor="#0D9488"
          badge="+14.5%"
          badgeColor="green"
          sub="this week"
        />
        <KpiCard
          label="Gift Cards Listed"
          value="52"
          icon={<Gift className="w-6 h-6" />}
          iconColor="#2563EB"
          badge="+3"
          badgeColor="purple"
          sub="new this week"
        />
        <KpiCard
          label="Pending Audits"
          value={pendingAuditsCount}
          icon={<Hourglass className="w-6 h-6" />}
          iconColor="#DC2626"
          badge={pendingAuditsCount > 0 ? `${pendingAuditsCount} open` : 'All clear'}
          badgeColor={pendingAuditsCount > 0 ? 'red' : 'green'}
          sub="sell requests"
        />
      </div>

      {/* ── QUICK ACTIONS ───────────────────────────────────────── */}
      <div className="mb-8">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Quick Actions
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <QuickActionCard
              key={i}
              icon={a.icon}
              label={a.label}
              desc={a.desc}
              color={a.color}
              onClick={a.onClick}
            />
          ))}
        </div>
      </div>

      {/* ── TABLES ROW ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
        {/* Recent Orders Table (2/3 width on large screens) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div>
              <h3 className="font-bold text-[0.95rem] text-slate-900">Recent Orders</h3>
              <p className="text-[0.74rem] text-slate-400 mt-0.5">{orders.length} transactions this week</p>
            </div>
            <button
              onClick={() => triggerToast('Opening full orders view...', 'info')}
              className="text-xs font-bold text-[#6D28D9] hover:bg-[#F5F3FF] px-3 py-1 rounded-md transition-colors"
            >
              View All &rarr;
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Order', 'Customer', 'Brand', 'Amount', 'Status', 'Time'].map(h => (
                    <th key={h} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-xs font-mono font-bold text-[#6D28D9] whitespace-nowrap">
                      {order.id}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full text-[10px] bg-[#EDE9FE] text-[#7C3AED] font-bold flex items-center justify-center">
                          {order.user.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-900">{order.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {order.brand}
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-900 whitespace-nowrap">
                      {order.amount}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <StatusChip status={order.status} />
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {order.timestamp?.split(' ')[1] || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Completed</span>
                <span className="text-[13px] font-black text-emerald-600 leading-none">{completeOrders}</span>
              </div>
            </div>

            <div className="hidden sm:block h-6 border-r border-slate-200" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Volume</span>
                <span className="text-[13px] font-black text-slate-900 leading-none">₹{totalOrdersVolume.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="hidden sm:block h-6 border-r border-slate-200" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-[#7C3AED] flex items-center justify-center">
                <ArrowUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Success Rate</span>
                <span className="text-[13px] font-black text-slate-900 leading-none">
                  {orders.length > 0 ? Math.round((completeOrders / orders.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sell Requests Table (1/3 width on large screens) */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[0.95rem] text-slate-900">Sell Requests</h3>
              {pendingAuditsCount > 0 && (
                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide">
                  {pendingAuditsCount} pending
                </span>
              )}
            </div>
          </div>

          {sellRequests.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">All Clear</h4>
              <p className="text-slate-400 text-xs mt-1">No pending resell audits</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Customer</th>
                    <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Brand/Value</th>
                    <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full text-[10px] bg-violet-50 text-violet-600 font-bold flex items-center justify-center flex-shrink-0">
                            {req.user.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-slate-900">{req.user}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-900">{req.brand}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{req.value}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onApproveRequest(req.id)}
                            title="Approve"
                            className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRejectRequest(req.id)}
                            title="Reject"
                            className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              pendingAuditsCount === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {pendingAuditsCount === 0 ? <Check className="w-4 h-4" /> : <Hourglass className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {pendingAuditsCount === 0 ? 'All Clear' : 'Review Required'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block leading-none">
                {pendingAuditsCount === 0 ? 'No pending audits' : `${pendingAuditsCount} requests awaiting review`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── WIDGETS ROW (3 Columns) ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Widget 1: Top Selling Brands */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-white">
            <h3 className="font-bold text-[0.9rem] text-slate-900">Top Selling Brands</h3>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Brand</th>
                  <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Sales</th>
                  <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Popularity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topSellingBrands.map((b, i) => (
                  <tr key={b.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          i === 0 ? 'bg-[#6D28D9]' : i === 1 ? 'bg-blue-600' : i === 2 ? 'bg-teal-600' : i === 3 ? 'bg-amber-600' : i === 4 ? 'bg-rose-600' : 'bg-slate-400'
                        }`} />
                        <span className="text-xs font-semibold text-slate-900">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-600 whitespace-nowrap">
                      {b.sales}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap min-w-[80px]">
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden w-full">
                        <div
                          className="h-full rounded-full transition-all duration-600"
                          style={{
                            width: `${b.pct}%`,
                            background: i === 0 ? 'linear-gradient(90deg,#6D28D9,#8B5CF6)' : i === 1 ? 'linear-gradient(90deg,#2563EB,#60A5FA)' : i === 2 ? 'linear-gradient(90deg,#0D9488,#34D399)' : i === 3 ? 'linear-gradient(90deg,#D97706,#FBB94C)' : i === 4 ? 'linear-gradient(90deg,#E11D48,#FDA4AF)' : 'linear-gradient(90deg,#64748B,#94A3B8)',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget 2: Cashback Stores */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center">
            <h3 className="font-bold text-[0.9rem] text-slate-900">Cashback Stores</h3>
            <button
              onClick={() => setOpenStoreDialog(true)}
              className="text-xs font-bold text-[#6D28D9] hover:opacity-80 px-2 py-0.5 rounded transition-opacity"
            >
              + Add
            </button>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Store</th>
                  <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Cashback</th>
                  <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stores.map((store) => {
                  const initials = store.name.substring(0, 1).toUpperCase() + store.name.substring(1, 2).toLowerCase();
                  let badgeBg = 'bg-slate-100';
                  let badgeColor = 'text-slate-600';
                  const nameLower = store.name.toLowerCase();
                  if (nameLower.includes('amazon')) {
                    badgeBg = 'bg-amber-50';
                    badgeColor = 'text-amber-600';
                  } else if (nameLower.includes('flipkart')) {
                    badgeBg = 'bg-blue-50';
                    badgeColor = 'text-blue-600';
                  } else if (nameLower.includes('ajio')) {
                    badgeBg = 'bg-rose-50';
                    badgeColor = 'text-rose-600';
                  } else if (nameLower.includes('nykaa')) {
                    badgeBg = 'bg-purple-50';
                    badgeColor = 'text-purple-600';
                  }
                  return (
                    <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${badgeBg} ${badgeColor}`}>
                            {initials}
                          </div>
                          <span className="text-xs font-bold text-slate-900">{store.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-400 whitespace-nowrap">
                        {store.cashback}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => onToggleStoreStatus(store.id)}
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all hover:opacity-85 ${
                            store.status === 'Live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {store.status}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget 3: System Status */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-white">
            <h3 className="font-bold text-[0.9rem] text-slate-900">System Status</h3>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Service</th>
                  <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Woohoo API', status: 'Online' },
                  { name: 'Razorpay', status: 'Online' },
                  { name: 'MSG91 OTP', status: 'Online' },
                ].map(node => (
                  <tr key={node.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-xs font-semibold text-slate-900 whitespace-nowrap">
                      {node.name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.4)]" />
                        {node.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 flex flex-col gap-4 border-t border-slate-100 mt-auto bg-slate-50">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Last Sync</span>
              <span className="text-slate-600">{systemStatus.lastSync || '2h ago'}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-900">SVC Balance</span>
              <span className="text-sm font-black text-emerald-500">₹48,200</span>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400">SVC Balance used (82%)</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden w-full">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NEW TABLES ROW (Recent Registrations & Recent Payments) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
        {/* Recent Registrations Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="font-bold text-[0.95rem] text-slate-900">Recent Registrations</h3>
            </div>
            <button
              onClick={() => triggerToast('Opening user management...', 'info')}
              className="text-xs font-bold text-[#6D28D9] hover:bg-[#F5F3FF] px-3 py-1 rounded-md transition-colors"
            >
              View all &rarr;
            </button>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Name', 'Phone', 'Wallet', 'Status'].map(h => (
                    <th key={h} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRegistrations.map((reg, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-xs font-semibold text-slate-900 whitespace-nowrap">{reg.name}</td>
                    <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">{reg.phone}</td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-900 whitespace-nowrap">{reg.wallet}</td>
                    <td className="px-6 py-3 whitespace-nowrap"><StatusChip status={reg.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-[0.95rem] text-slate-900">Recent Payments</h3>
            </div>
            <button
              onClick={() => triggerToast('Opening payments details...', 'info')}
              className="text-xs font-bold text-[#6D28D9] hover:bg-[#F5F3FF] px-3 py-1 rounded-md transition-colors"
            >
              View all &rarr;
            </button>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['User', 'Type', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map((pay, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-xs font-semibold text-slate-900 whitespace-nowrap">{pay.user}</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pay.type === 'Wallet' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-[#7C3AED]'
                      }`}>
                        {pay.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-900 whitespace-nowrap">{pay.amount}</td>
                    <td className="px-6 py-3 whitespace-nowrap"><StatusChip status={pay.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ADD STORE DIALOG (Modal) ─────────────────────────────── */}
      {openStoreDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <form onSubmit={handleAddStoreSubmit}>
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Register Partner Store</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swiggy, Amazon"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Cashback % *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 5.0"
                    value={cashbackPct}
                    onChange={e => setCashbackPct(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status *
                  </label>
                  <select
                    value={storeStoreStatus}
                    onChange={e => setStoreStoreStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-primary text-slate-700"
                  >
                    <option value="Live">Live</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenStoreDialog(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:from-primary-dark hover:to-secondary-dark transition-colors shadow-md"
                >
                  Add Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FEATURE CARD DIALOG (Modal) ──────────────────────────── */}
      {openFeatureDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <form onSubmit={handleFeatureSubmit}>
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Feature a Gift Card</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Select Brand *
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={e => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-primary text-slate-700"
                  >
                    <option value="">-- Choose Brand --</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Myntra">Myntra</option>
                    <option value="Swiggy">Swiggy</option>
                    <option value="Zomato">Zomato</option>
                    <option value="Nykaa">Nykaa</option>
                    <option value="Google Play">Google Play</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenFeatureDialog(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg transition-colors shadow-md"
                >
                  Feature Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardView;
