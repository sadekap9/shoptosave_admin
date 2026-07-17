import React, { useState, useEffect } from 'react';
import { userService } from '../services/adminService';
import {
  Search,
  Edit3,
  CheckCircle2,
  Ban,
  Users,
  Shield,
  AlertTriangle,
  Coins,
  Plus,
  Minus,
  Eye,
  ArrowLeft,
  Landmark,
  Check,
  X
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
    'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)',
    'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

let lastFetchTime = 0;

const UsersView = ({ triggerToast }) => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      if (response && response.success && response.result && response.result.data) {
        const mappedUsers = response.result.data.map((user) => {
          return {
            id: String(user.id),
            dbId: user.id,
            name: user.name || 'NA',
            phone: user.phone || 'NA',
            email: user.email || 'NA',
            balance: Number(user.wallet_balance || 0),
            status: (user.status === 1 || user.is_active === 1) ? 'Active' : 'Inactive',
            joinedDate: (user.createdAt || user.created_at) ? new Date(user.createdAt || user.created_at).toLocaleDateString('en-IN') : 'NA',
            kycStatus: user.kyc_status === 0 ? 'Pending' : user.kyc_status === 1 ? 'Approved' : 'Rejected',
            kycDocument: user.kyc_doc_type ? {
              type: user.kyc_doc_type,
              number: user.kyc_doc_number || 'NA',
              docUrl: user.kyc_doc_file || 'NA',
            } : null,
            bankDetails: user.bank_name ? {
              bankName: user.bank_name,
              accountNumber: user.bank_account_number || 'NA',
              holderName: user.bank_holder_name || 'NA',
              ifscCode: user.bank_ifsc || 'NA',
            } : null
          };
        });
        setUsersList(mappedUsers);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      triggerToast(error.message || 'Failed to fetch users from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetchTime > 500) {
      lastFetchTime = now;
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selected details views
  const [selectedUserForView, setSelectedUserForView] = useState(null);

  // Dialog States
  const [openBalanceDialog, setOpenBalanceDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  // Balance Form States
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('Add'); // 'Add' or 'Deduct'

  // Status Form States
  const [targetStatus, setTargetStatus] = useState('Active');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const handleOpenBalance = (user) => {
    setSelectedUser(user);
    setAdjustmentAmount('');
    setAdjustmentType('Add');
    setOpenBalanceDialog(true);
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    if (!adjustmentAmount || Number(adjustmentAmount) <= 0) {
      triggerToast('Please enter a valid positive adjustment amount', 'warning');
      return;
    }
    const val = Number(adjustmentAmount);
    const amountVal = adjustmentType === 'Add' ? val : -val;

    try {
      const dbId = selectedUser.dbId;
      const response = await userService.adjustBalance(dbId, amountVal);

      if (response && response.success) {
        triggerToast(
          `Wallet of ${selectedUser.name} adjusted by ${adjustmentType === 'Add' ? '+' : '-'}₹${val} successfully!`,
          'success'
        );

        // Update local items immediately
        const newBalance = selectedUser.balance + amountVal;
        const updatedList = usersList.map((u) => {
          if (u.dbId === dbId) {
            return { ...u, balance: newBalance };
          }
          return u;
        });
        setUsersList(updatedList);

        if (selectedUserForView && selectedUserForView.dbId === dbId) {
          setSelectedUserForView({ ...selectedUserForView, balance: newBalance });
        }

        setOpenBalanceDialog(false);
      } else {
        triggerToast(response.message || 'Balance adjustment failed', 'error');
      }
    } catch (err) {
      console.error('Adjust balance API error:', err);
      triggerToast(err.message || 'Failed to adjust wallet balance', 'error');
    }
  };

  const handleOpenStatus = (user) => {
    setSelectedUser(user);
    setTargetStatus(user.status);
    setOpenStatusDialog(true);
  };

  const toggleUserStatus = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const statusValue = nextStatus === 'Active' ? 1 : 0;
    try {
      const response = await userService.updateUserStatus(user.dbId, statusValue);
      if (response && response.success) {
        triggerToast(`Status for "${user.name}" updated to ${nextStatus} successfully!`, 'success');
        setUsersList(prev => prev.map((u) => {
          if (u.dbId === user.dbId) {
            return { ...u, status: nextStatus };
          }
          return u;
        }));
        if (selectedUserForView && selectedUserForView.dbId === user.dbId) {
          setSelectedUserForView(prev => ({ ...prev, status: nextStatus }));
        }
      } else {
        triggerToast(response.message || 'Status update failed', 'error');
      }
    } catch (err) {
      console.error('Update status API error:', err);
      triggerToast(err.message || 'Failed to update user account status', 'error');
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusUpdating(true);
    try {
      const dbId = selectedUser.dbId;
      const statusValue = targetStatus === 'Active' ? 1 : 0;
      const response = await userService.updateUserStatus(dbId, statusValue);

      if (response && response.success) {
        triggerToast(`Status for ${selectedUser.name} updated to ${targetStatus} successfully!`, 'success');

        const updatedList = usersList.map((u) => {
          if (u.dbId === dbId) {
            return { ...u, status: targetStatus };
          }
          return u;
        });
        setUsersList(updatedList);

        if (selectedUserForView && selectedUserForView.dbId === dbId) {
          setSelectedUserForView({ ...selectedUserForView, status: targetStatus });
        }

        setOpenStatusDialog(false);
      } else {
        triggerToast(response.message || 'Status update failed', 'error');
      }
    } catch (err) {
      console.error('Update status API error:', err);
      triggerToast(err.message || 'Failed to update user account status', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleApproveKyc = async (userId) => {
    try {
      const response = await userService.verifyKyc(userId, 1); // 1 = Approve
      if (response && response.success) {
        triggerToast('KYC documents verified and approved successfully!', 'success');
        // Update local states
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, kycStatus: 'Approved' } : u));
        if (selectedUserForView && selectedUserForView.id === userId) {
          setSelectedUserForView(prev => ({ ...prev, kycStatus: 'Approved' }));
        }
      } else {
        triggerToast(response?.message || 'KYC verification update failed', 'error');
      }
    } catch (err) {
      console.error('Approve KYC API error:', err);
      triggerToast(err.message || 'An error occurred during KYC approval', 'error');
    }
  };

  const handleRejectKyc = async (userId) => {
    try {
      const response = await userService.verifyKyc(userId, 2); // 2 = Reject
      if (response && response.success) {
        triggerToast('KYC documents audit rejected and status updated.', 'info');
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, kycStatus: 'Rejected' } : u));
        if (selectedUserForView && selectedUserForView.id === userId) {
          setSelectedUserForView(prev => ({ ...prev, kycStatus: 'Rejected' }));
        }
      } else {
        triggerToast(response?.message || 'KYC status update failed', 'error');
      }
    } catch (err) {
      console.error('Reject KYC API error:', err);
      triggerToast(err.message || 'An error occurred during KYC rejection', 'error');
    }
  };

  // Stats calculation
  const totalUsersCount = usersList.length;
  const activeCount = usersList.filter((u) => u.status === 'Active').length;
  const reviewCount = usersList.filter((u) => u.status === 'Inactive').length;
  const totalWalletSum = usersList.reduce((s, u) => s + u.balance, 0);

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (selectedUserForView) {
    // ─── KYCS / BANK AUDITING WORKSPACE DETAIL VIEW ─────────────────
    return (
      <div className="w-full max-w-full box-border animate-fadeIn">
        {/* Header back navigation Row */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedUserForView(null)}
              className="p-2 text-[#8B5CF6] hover:bg-violet-50 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Customer Auditing Profile
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Audit identity credentials, wallet balance, and partner bank integrations.
              </p>
            </div>
          </div>
        </div>

        {/* Audit Workspace layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* LEFT SIDEBAR: PROFILE SUMMARY */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 flex flex-col items-center text-center bg-[#F8FAFC] border-b border-slate-200/80">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-2xl shadow-lg mb-5"
                style={{ background: getAvatarGradient(selectedUserForView.name) }}
              >
                {getInitials(selectedUserForView.name)}
              </div>
              <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                {selectedUserForView.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedUserForView.email}
              </p>

              <div className="flex gap-2 mt-6 flex-wrap justify-center">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  selectedUserForView.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10'
                    : 'bg-red-50 text-red-600 border-red-500/10'
                }`}>
                  Account: {selectedUserForView.status}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  selectedUserForView.kycStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10'
                    : selectedUserForView.kycStatus === 'Pending'
                    ? 'bg-amber-50 text-amber-600 border-amber-500/10'
                    : selectedUserForView.kycStatus === 'Rejected'
                    ? 'bg-red-50 text-red-600 border-red-500/10'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  KYC: {selectedUserForView.kycStatus || 'Pending'}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                CUSTOMER INFORMATION
              </span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">User ID</span>
                <span className="font-bold text-slate-900">{selectedUserForView.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-bold text-slate-900">{selectedUserForView.phone}</span>
              </div>

              <div className="border-t border-slate-100 my-4" />

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Wallet Balance</span>
                  <span className="text-lg font-black text-primary">₹{selectedUserForView.balance.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={() => handleOpenBalance(selectedUserForView)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
                >
                  Adjust
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT AUDITING WORKSPACE */}
          <div className="space-y-6">
            {/* 1. KYC Auditing Workspace Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-[0.95rem] text-slate-900">
                  KYC Verification & Auditing
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  selectedUserForView.kycStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10'
                    : selectedUserForView.kycStatus === 'Pending'
                    ? 'bg-amber-50 text-amber-600 border-amber-500/10'
                    : selectedUserForView.kycStatus === 'Rejected'
                    ? 'bg-red-50 text-red-600 border-red-500/10'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {selectedUserForView.kycStatus || 'Pending'}
                </span>
              </div>

              <div className="p-6 md:p-8">
                {selectedUserForView.kycDocument ? (
                  <div className="space-y-6">
                    {/* Document Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          DOCUMENT TYPE
                        </span>
                        <span className="text-xs font-bold text-slate-800">{selectedUserForView.kycDocument.type}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          DOCUMENT NUMBER
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-855 tracking-wide">{selectedUserForView.kycDocument.number}</span>
                      </div>
                    </div>

                    {/* Attachment Preview Box */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                        SUBMITTED DOCUMENT ATTACHMENT
                      </span>
                      <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 text-center min-h-[140px] hover:border-primary/25 hover:bg-primary/5 transition-all">
                        <Shield className="w-9 h-9 text-primary opacity-80" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">Verification Scan Proof</h4>
                          <span className="text-[10px] text-slate-400 block mt-1 font-semibold italic">{selectedUserForView.kycDocument.docUrl}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-2" />

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                      <button
                        disabled={selectedUserForView.kycStatus === 'Rejected'}
                        onClick={() => handleRejectKyc(selectedUserForView.id)}
                        className="flex items-center justify-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject KYC Document
                      </button>
                      <button
                        disabled={selectedUserForView.kycStatus === 'Approved'}
                        onClick={() => handleApproveKyc(selectedUserForView.id)}
                        className="flex items-center justify-center gap-1.5 text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve KYC Document
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                    <AlertTriangle className="w-9 h-9 text-amber-500 opacity-70" />
                    <span className="text-xs font-semibold text-slate-400">No KYC documents have been submitted by this user.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Bank Account Details Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-white">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[0.95rem] text-slate-900">
                  User Bank Account Details
                </h3>
              </div>
              <div className="p-6 md:p-8">
                {selectedUserForView.bankDetails ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        BANK NAME
                      </span>
                      <span className="text-xs font-bold text-slate-900">{selectedUserForView.bankDetails.bankName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        ACCOUNT NUMBER
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-855 tracking-wide">{selectedUserForView.bankDetails.accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        ACCOUNT HOLDER NAME
                      </span>
                      <span className="text-xs font-bold text-slate-900">{selectedUserForView.bankDetails.holderName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        IFSC CODE
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-855 tracking-wide">{selectedUserForView.bankDetails.ifscCode}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                    <Landmark className="w-9 h-9 text-slate-350 opacity-50" />
                    <span className="text-xs font-semibold text-slate-400">No bank details have been added by this user.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN USER LIST DIRECTORY SCREEN ──────────────────────────
  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      {/* 4-KPI Premium Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(109,40,217,0.06)] hover:border-primary hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Customers</span>
            <h3 className="text-2xl font-black text-slate-900">{totalUsersCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(16,185,129,0.06)] hover:border-emerald-500 hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Accounts</span>
            <h3 className="text-2xl font-black text-slate-900">{activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(239,68,68,0.06)] hover:border-red-500 hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Inactive Accounts</span>
            <h3 className="text-2xl font-black text-slate-900">{reviewCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <Ban className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(109,40,217,0.06)] hover:border-primary hover:-translate-y-0.5 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Wallet Reserves</span>
            <h3 className="text-2xl font-black text-slate-900">₹{totalWalletSum.toLocaleString('en-IN')}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Coins className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-sm">
        {/* Filter Bar */}
        <div className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 md:max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-primary" />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, phone or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-200 text-slate-900 font-medium placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-primary outline-none transition-all text-slate-700 font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              onClick={() => {
                triggerToast(`Applied filters. Showing ${filteredUsers.length} records.`, 'info');
              }}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-150">
                <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 pl-6 whitespace-nowrap">User ID</th>
                <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap">Customer</th>
                <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap">Phone</th>
                <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap">Email</th>
                <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap text-right">Wallet Balance</th>
                <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap text-center">Account Status</th>
                <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap">Joined Date</th>
                <th className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-400">Loading registered users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 text-slate-300 opacity-50" />
                      <span className="text-xs font-semibold text-slate-400">No registered users match your criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-violet-50/10 border-l-4 border-l-transparent hover:border-l-primary transition-all duration-200"
                  >
                    <td className="px-6 py-4 pl-6 text-xs font-mono font-bold text-primary whitespace-nowrap">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-sm flex-shrink-0"
                          style={{ background: getAvatarGradient(user.name) }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {user.phone}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="text-xs font-bold text-emerald-500">
                        ₹{user.balance.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-all active:scale-95 ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-600 border-red-500/10 hover:bg-red-100'
                        }`}
                      >
                        {user.status === 'Active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {user.joinedDate}
                    </td>
                    <td className="px-6 py-4 text-right pr-6 whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUserForView(user)}
                          title="View Profile Detail"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-50 text-primary hover:bg-primary hover:text-white transition-all duration-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP 1: Balance Adjustment Dialog */}
      {openBalanceDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <form onSubmit={handleBalanceSubmit}>
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Adjust Balance</h3>
              </div>
              <div className="p-6 space-y-4">
                {selectedUser && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                      Customer Profile
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">
                      {selectedUser.name} <span className="text-slate-400 font-semibold">({selectedUser.id})</span>
                    </h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Current Balance:</span>
                      <span className="font-bold text-emerald-500 font-mono">₹{selectedUser.balance.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('Add')}
                    className={`w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold border rounded-lg transition-all ${
                      adjustmentType === 'Add'
                        ? 'bg-primary border-primary text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Credit (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('Deduct')}
                    className={`w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold border rounded-lg transition-all ${
                      adjustmentType === 'Deduct'
                        ? 'bg-primary border-primary text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    Debit (Deduct)
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Adjustment Value (INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="Enter amount (e.g. 500, 1000)"
                      value={adjustmentAmount}
                      onChange={(e) => setAdjustmentAmount(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      className="w-full pl-7 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-primary outline-none transition-all text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                {/* Preset chips */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Presets
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[250, 500, 1000, 2000, 5000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAdjustmentAmount(preset.toString())}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          adjustmentAmount === preset.toString()
                            ? 'bg-[#F5F3FF] border-primary text-primary'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:bg-[#F5F3FF]'
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenBalanceDialog(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-[#5B21B6] rounded-lg transition-colors shadow-md"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP 2: Status Dialog */}
      {openStatusDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <form onSubmit={handleStatusSubmit}>
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Update Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-primary text-slate-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenStatusDialog(false)}
                  disabled={statusUpdating}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-[#5B21B6] rounded-lg transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  {statusUpdating ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    'Update Status'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
