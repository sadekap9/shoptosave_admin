import React, { useState } from 'react';
import {
  Check,
  X,
  Eye,
  Info,
  ChevronRight,
  Gavel,
  Shield,
  Coins,
  CheckSquare
} from 'lucide-react';

const SellRequestsView = ({ sellRequests, onApproveRequest, onRejectRequest }) => {
  const [selectedReq, setSelectedReq] = useState(null);
  const [openAuditDialog, setOpenAuditDialog] = useState(false);

  // Dynamic audit calculations
  const pendingAuditsCount = sellRequests.length;

  const totalAuditFaceValue = sellRequests.reduce((sum, req) => {
    const val = parseFloat(req.value.replace(/[^0-9]/g, '')) || 0;
    return sum + val;
  }, 0);

  const totalPayoutValue = totalAuditFaceValue * 0.9;

  const handleOpenAudit = (req) => {
    setSelectedReq(req);
    setOpenAuditDialog(true);
  };

  const handleApproveFromAudit = (id) => {
    onApproveRequest(id);
    setOpenAuditDialog(false);
  };

  const handleRejectFromAudit = (id) => {
    onRejectRequest(id);
    setOpenAuditDialog(false);
  };

  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      {/* Header breadcrumbs */}
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Audits
            </span>
            <ChevronRight className="w-3 h-3 text-slate-350" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Card Sell Auditing
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sell Card Audits
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Perform fraud checks and balance verifications on gift cards sold back to Shop2Save.
          </p>
        </div>
      </div>

      {/* Security stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(109,40,217,0.06)] hover:border-primary transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending Audit Cases</span>
            <h3 className="text-2xl font-black text-slate-900">{pendingAuditsCount}</h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Awaiting credentials review</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Gavel className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(139,92,246,0.06)] hover:border-[#8B5CF6] transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sum Face Value under Audit</span>
            <h3 className="text-2xl font-black text-slate-900">₹{totalAuditFaceValue.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Submitted collateral balances</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center">
            <Coins className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(16,185,129,0.06)] hover:border-emerald-500 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Projected Wallet Payouts (90%)</span>
            <h3 className="text-2xl font-black text-emerald-500">₹{totalPayoutValue.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Cash rewards to be credited</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckSquare className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Main ledger audits */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-100">
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 pl-6">Request ID</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Customer User</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Gift Card Vendor</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Face Value</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Payout Value (90%)</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sellRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckSquare className="w-10 h-10 text-slate-300 opacity-50" />
                      <span className="text-xs font-semibold text-slate-400">No pending card sell-back audits are active!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                sellRequests.map((req) => {
                  const faceValueNum = parseFloat(req.value.replace(/[^0-9]/g, '')) || 0;
                  const payoutVal = `₹${(faceValueNum * 0.9).toFixed(0)}`;
                  const requestId = `SRQ-${req.id.substring(0, 5).toUpperCase()}`;
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-violet-50/10 transition-colors"
                    >
                      <td className="px-6 py-4 pl-6 text-xs font-mono font-bold text-[#8B5CF6] whitespace-nowrap">
                        {requestId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                        {req.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-650">
                        {req.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                        {req.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-extrabold text-emerald-500">
                        {payoutVal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center pr-6">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleOpenAudit(req)}
                            title="Examine Card Security Codes"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-50 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all duration-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onApproveRequest(req.id)}
                            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => onRejectRequest(req.id)}
                            className="flex items-center gap-1 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP: Card Pin Audit Security review */}
      {openAuditDialog && selectedReq && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-white">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Gift Card Code Security Review</h3>
            </div>
            <div className="p-6 space-y-5">
              {/* Caution warning block */}
              <div className="flex gap-3 p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block tracking-wider">Pre-Approval Checklist</span>
                  <p className="text-[10px] text-amber-700 leading-relaxed font-semibold">
                    Ensure balance checks have been completed using the brand merchant verification portal prior to approving wallet credits. Approve only if coordinates match precisely.
                  </p>
                </div>
              </div>

              {/* Data Grid details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Submitting Customer</span>
                  <span className="text-slate-800 font-bold block">{selectedReq.user}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Gift Card Vendor</span>
                  <span className="text-slate-800 font-bold block">{selectedReq.brand}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Face Value</span>
                  <span className="text-slate-900 font-extrabold block">{selectedReq.value}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Wallet Payout Offer</span>
                  <span className="text-emerald-500 font-extrabold block">
                    ₹{(parseFloat(selectedReq.value.replace(/[^0-9]/g, '')) * 0.9).toFixed(0)} <span className="text-[9px] text-slate-400 font-semibold">(90% standard)</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 my-2" />

              {/* Secret Codes dashboard */}
              <div className="bg-[#0F172A] text-[#38BDF8] p-4 rounded-xl font-mono text-[11px] border border-white/5 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-bold text-white/40 tracking-wider">SECURE CREDENTIAL DATABASE</span>
                  <span className="px-1.5 py-0.5 bg-sky-500/10 text-sky-400 rounded text-[9px] font-extrabold">AES-256 ENCRYPTED</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">CARD CODE / SERIAL:</span>
                  <span className="text-slate-200 font-bold font-mono tracking-wide">S2S-AMZ-8849-2049-9948</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">SECURITY PIN:</span>
                  <span className="text-sky-400 font-bold font-mono tracking-widest text-xs">992841</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setOpenAuditDialog(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel Audit
              </button>
              <button
                onClick={() => handleRejectFromAudit(selectedReq.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-md"
              >
                Reject Claim
              </button>
              <button
                onClick={() => handleApproveFromAudit(selectedReq.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-md"
              >
                Approve &amp; Credit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellRequestsView;
