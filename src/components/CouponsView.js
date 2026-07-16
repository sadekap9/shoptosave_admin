import React, { useState, useEffect } from 'react';
import { couponService } from '../services/couponService';
import { storeService } from '../services/storeService';
import {
  Search,
  Plus,
  Tag,
  CheckCircle2,
  Ban,
  ChevronRight,
  Trash2,
  Copy,
  Percent,
  Coins,
  X,
  ArrowLeft
} from 'lucide-react';

const OFFER_TYPE_LABELS = {
  1: 'Instant Discount',
  2: 'Cashback',
  // 3: 'Promo Code',
};

const formatDate = (isoStr) => {
  if (!isoStr) return '—';
  try {
    return new Date(isoStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoStr;
  }
};

const INITIAL_FORM = {
  offer_name: '',
  offer_type: 2,
  promo_code: '',
  value_type: 2,
  value: '',
  min_order_amount: '',
  max_discount: '',
  total_usage_limit: '',
  per_user_limit: 1,
  unique_users_only: 0,
  start_date: '',
  end_date: '',
  status: 1,
  store_id: '',
  gift_card_id: '',
};

let lastFetchTime = 0;

const CouponsView = ({ triggerToast }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stores, setStores] = useState([]);
  const [giftCards, setGiftCards] = useState([]);

  // View mode state: 'list' or 'create'
  const [viewMode, setViewMode] = useState('list');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0); // 0-based index
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, totalPages: 1 });

  const fetchCoupons = async (pageNum = page, limitNum = rowsPerPage) => {
    setLoading(true);
    try {
      const response = await couponService.getCoupons(pageNum + 1, limitNum);
      if (response && response.success && response.result && response.result.data) {
        setCoupons(response.result.data);
        if (response.result.pagination) {
          setPaginationMeta({
            total: response.result.pagination.total,
            totalPages: response.result.pagination.totalPages,
          });
        }
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error('Fetch coupons error:', error);
      triggerToast(error.message || 'Failed to fetch coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetchTime > 500) {
      lastFetchTime = now;
      fetchCoupons(page, rowsPerPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const storeRes = await storeService.getStores();
        if (storeRes && storeRes.success && storeRes.result && storeRes.result.data) {
          setStores(storeRes.result.data);
        }
        const giftRes = await storeService.getGiftCards();
        if (giftRes && giftRes.success && giftRes.result && giftRes.result.data) {
          const fetchedCards = Array.isArray(giftRes.result.data)
            ? giftRes.result.data
            : (giftRes.result.data.giftCards || []);
          setGiftCards(fetchedCards);
        }
      } catch (err) {
        console.error('Error fetching stores/giftcards for coupons:', err);
      }
    };
    fetchSelectData();
  }, []);

  const handleFormChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.offer_name.trim()) errors.offer_name = 'Offer name is required';
    if (!formData.value || Number(formData.value) <= 0) errors.value = 'Value must be > 0';
    if (!formData.min_order_amount || Number(formData.min_order_amount) < 0)
      errors.min_order_amount = 'Minimum order amount is required';
    if (!formData.total_usage_limit || Number(formData.total_usage_limit) <= 0)
      errors.total_usage_limit = 'Total usage limit must be > 0';
    if (!formData.start_date) errors.start_date = 'Start date is required';
    if (!formData.end_date) errors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date)
      errors.end_date = 'End date must be after start date';
    return errors;
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setFormErrors({});
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const toIso = (localDt) => {
        if (!localDt) return '';
        return new Date(localDt).toISOString();
      };

      const payload = {
        ...formData,
        start_date: toIso(formData.start_date),
        end_date: toIso(formData.end_date),
      };
      delete payload.priority;

      const response = await couponService.addCoupon(payload);
      if (response && response.success) {
        triggerToast('Coupon created successfully!', 'success');
        resetForm();
        setViewMode('list');
        setPage(0);
        fetchCoupons(0, rowsPerPage);
      } else {
        triggerToast(response?.message || 'Failed to create coupon', 'error');
      }
    } catch (error) {
      console.error('Add coupon error:', error);
      triggerToast(error.message || 'An error occurred while creating the coupon', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    const newStatus = coupon.status === 1 ? 0 : 1;
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, status: newStatus } : c))
    );
    try {
      await couponService.updateCouponStatus(coupon.id, newStatus);
      triggerToast(
        `Coupon "${coupon.offer_name}" is now ${newStatus === 1 ? 'Active' : 'Inactive'}`,
        'info'
      );
    } catch (error) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, status: coupon.status } : c))
      );
      triggerToast(error.message || 'Failed to update coupon status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await couponService.deleteCoupon(deleteTarget.id);
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      triggerToast(`Coupon "${deleteTarget.offer_name}" deleted`, 'success');
      setDeleteTarget(null);
      if (coupons.length === 1 && page > 0) {
        setPage((p) => p - 1);
      } else {
        fetchCoupons(page, rowsPerPage);
      }
    } catch (error) {
      triggerToast(error.message || 'Failed to delete coupon', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      triggerToast(`Copied "${code}" to clipboard`, 'success');
    });
  };

  const totalCoupons = paginationMeta.total;
  const activeCoupons = coupons.filter((c) => c.status === 1).length;
  const inactiveCoupons = coupons.filter((c) => c.status === 0).length;

  const filteredCoupons = coupons.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (c.offer_name || '').toLowerCase().includes(q) ||
      (c.promo_code || '').toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && c.status === 1) ||
      (statusFilter === 'Inactive' && c.status === 0);
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const startRow = page * rowsPerPage + 1;
  const endRow = Math.min((page + 1) * rowsPerPage, paginationMeta.total);

  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      {viewMode === 'list' ? (
        <>
          {/* Header Row */}
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Offers &amp; Finances
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Coupons
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Coupons &amp; Offers
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Create and manage discount coupons, promo codes, and limited-time offers for your customers.
              </p>
            </div>
            <button
              onClick={() => setViewMode('create')}
              className="flex items-center gap-2 text-white bg-gradient-to-r from-primary to-secondary hover:from-[#7C3AED] hover:to-[#8B5CF6] px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(109,40,217,0.25)]"
            >
              <Plus className="w-4 h-4" />
              Add New Coupon
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(109,40,217,0.06)] hover:border-primary transition-all duration-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Coupons</span>
                <h3 className="text-xl font-black text-slate-900">{totalCoupons}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Tag className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(16,185,129,0.06)] hover:border-emerald-500 transition-all duration-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Coupons</span>
                <h3 className="text-xl font-black text-emerald-500">{activeCoupons}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(239,68,68,0.06)] hover:border-red-500 transition-all duration-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Inactive Coupons</span>
                <h3 className="text-xl font-black text-red-500">{inactiveCoupons}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <Ban className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            {/* Search / Filter header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-100 bg-white gap-4">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search coupon name or promo code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-200 text-slate-900 font-medium placeholder-slate-400"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-primary outline-none transition-all text-slate-700 font-semibold"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-100">
                    <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 pl-6">ID</th>
                    <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Offer</th>
                    <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Discount</th>
                    <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Validity</th>
                    <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Usage</th>
                    <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center">Status</th>
                    <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center bg-white">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="animate-spin h-6 w-6 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-400">Loading coupons...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center bg-white">
                        <div className="flex flex-col items-center gap-2">
                          <Tag className="w-10 h-10 text-slate-300 opacity-55" />
                          <span className="text-xs font-semibold text-slate-400">No coupons found.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => {
                      const isLive = coupon.status === 1;
                      return (
                        <tr
                          key={coupon.id}
                          className="hover:bg-violet-50/10 transition-colors"
                        >
                          <td className="px-6 py-4 pl-6 whitespace-nowrap text-xs font-semibold text-slate-400">
                            #{coupon.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800">
                                {coupon.offer_name}
                              </span>
                              <span className="mt-1">
                                <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-purple-50 text-purple-600 border border-purple-100">
                                  {OFFER_TYPE_LABELS[coupon.offer_type] || 'Promo Code'}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-amber-500">
                                {coupon.value_type === 2 ? `${parseFloat(coupon.value).toFixed(2)}%` : `₹ ${parseFloat(coupon.value).toFixed(2)}`}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                Min Order: ₹{parseFloat(coupon.min_order_amount).toFixed(2)}
                              </span>
                              {coupon.max_discount && (
                                <span className="text-[9px] text-slate-400 font-semibold">
                                  Max Discount: ₹{parseFloat(coupon.max_discount).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col text-[10px] text-slate-500 font-semibold gap-0.5">
                              <span>From: <strong className="text-slate-750">{formatDate(coupon.start_date)}</strong></span>
                              <span>To: <strong className="text-slate-750">{formatDate(coupon.end_date)}</strong></span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col text-[10px] text-slate-500 font-semibold gap-0.5">
                              <span>Limit: <strong className="text-slate-750">{coupon.total_usage_limit || 'Unlimited'}</strong></span>
                              <span>Per User: <strong className="text-slate-750">{coupon.per_user_limit || '1'}</strong></span>
                              {coupon.unique_users_only === 1 && (
                                <span className="mt-1">
                                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-50 text-amber-600 border border-amber-100 font-extrabold">Unique Users Only</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleToggleStatus(coupon)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors inline-flex items-center gap-1.5 ${
                                isLive
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-250 hover:bg-emerald-100/50'
                                  : 'bg-red-50 text-red-650 border-red-250 hover:bg-red-100/50'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {isLive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right pr-6">
                            <button
                              onClick={() => setDeleteTarget(coupon)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredCoupons.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Coupons per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                      fetchCoupons(0, parseInt(e.target.value, 10));
                    }}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white outline-none focus:border-primary text-slate-700"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-slate-400">
                    {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, totalCoupons)} of {totalCoupons}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => {
                      const newPage = page - 1;
                      setPage(newPage);
                      fetchCoupons(newPage, rowsPerPage);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Prev
                  </button>
                  <button
                    disabled={(page + 1) * rowsPerPage >= totalCoupons}
                    onClick={() => {
                      const newPage = page + 1;
                      setPage(newPage);
                      fetchCoupons(newPage, rowsPerPage);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="animate-fadeIn">
          {/* Header with Title & Back Button */}
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setViewMode('list');
              }}
              className="p-2.5 text-[#8B5CF6] hover:bg-violet-50 rounded-xl transition-all flex-shrink-0"
              title="Back to Coupons"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="w-8 h-8 rounded-xl bg-violet-100/60 text-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none animate-slideDown">
                Create New Coupon
              </h2>
              <span className="text-[10px] font-extrabold text-slate-400 mt-1 block">Add an automatic Instant Discount or Cashback offer</span>
            </div>
          </div>

          {/* Form inside a clean white card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleAddSubmit} className="space-y-6">
              {/* Section 1 */}
              <div className="space-y-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-50 text-[#8B5CF6] flex items-center justify-center font-extrabold text-xs shadow-sm">1</span>
                  <h4 className="text-xs font-bold text-slate-800">Basic Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Offer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Summer Sale — 10% Off Everything"
                      value={formData.offer_name}
                      onChange={handleFormChange('offer_name')}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all ${
                        formErrors.offer_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.offer_name && <span className="text-[10px] text-red-500 font-semibold">{formErrors.offer_name}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Offer Type *
                    </label>
                    <select
                      value={formData.offer_type}
                      onChange={handleFormChange('offer_type')}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all"
                    >
                      <option value={1}>Instant Discount</option>
                      <option value={2}>Cashback</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Apply to Store (Optional)
                    </label>
                    <select
                      value={formData.store_id}
                      onChange={handleFormChange('store_id')}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all"
                    >
                      <option value="">All Stores (Global Offer)</option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.store_name} (ID: {s.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Apply to Gift Card (Optional)
                    </label>
                    <select
                      value={formData.gift_card_id}
                      onChange={handleFormChange('gift_card_id')}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all"
                    >
                      <option value="">All Gift Cards (Global Offer)</option>
                      {giftCards.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.gift_card_name || g.brand_name} (SKU: {g.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-50 text-[#8B5CF6] flex items-center justify-center font-extrabold text-xs shadow-sm">2</span>
                  <h4 className="text-xs font-bold text-slate-800">Value &amp; Discount Details</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Value Type *
                    </label>
                    <select
                      value={formData.value_type}
                      onChange={handleFormChange('value_type')}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all"
                    >
                      <option value={1}>Flat Amount (₹)</option>
                      <option value={2}>Percentage (%)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={formData.value_type === 2 ? 'e.g. 10' : 'e.g. 150'}
                      value={formData.value}
                      onChange={handleFormChange('value')}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all ${
                        formErrors.value ? 'border-red-500 focus:border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.value && <span className="text-[10px] text-red-500 font-semibold">{formErrors.value}</span>}
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-50 text-[#8B5CF6] flex items-center justify-center font-extrabold text-xs shadow-sm">3</span>
                  <h4 className="text-xs font-bold text-slate-800">Limits &amp; Rules</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Min Order Amount *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 499"
                      value={formData.min_order_amount}
                      onChange={handleFormChange('min_order_amount')}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all ${
                        formErrors.min_order_amount ? 'border-red-500 focus:border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.min_order_amount && <span className="text-[10px] text-red-500 font-semibold">{formErrors.min_order_amount}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Max Discount (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={formData.max_discount}
                      onChange={handleFormChange('max_discount')}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Total Usage Limit *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1000"
                      value={formData.total_usage_limit}
                      onChange={handleFormChange('total_usage_limit')}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all ${
                        formErrors.total_usage_limit ? 'border-red-500 focus:border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.total_usage_limit && <span className="text-[10px] text-red-500 font-semibold">{formErrors.total_usage_limit}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Per User Limit *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1"
                      value={formData.per_user_limit}
                      onChange={handleFormChange('per_user_limit')}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, unique_users_only: prev.unique_users_only === 1 ? 0 : 1 }))}
                    className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all select-none ${
                      formData.unique_users_only === 1
                        ? 'border-[#8B5CF6] bg-violet-50/20 text-[#8B5CF6]'
                        : 'border-slate-200 bg-white text-[#8B5CF6] hover:border-slate-350'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.unique_users_only === 1}
                      readOnly
                      className="h-4 w-4 mt-0.5 text-[#8B5CF6] border-slate-300 rounded focus:ring-[#8B5CF6] pointer-events-none"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold leading-none text-slate-800">New Users Only</span>
                      <span className="text-[10px] text-slate-400 leading-tight">Only customers who haven't used this coupon before</span>
                  </div>
                </div>
              </div>
            </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-50 text-[#8B5CF6] flex items-center justify-center font-extrabold text-xs shadow-sm">4</span>
                  <h4 className="text-xs font-bold text-slate-800">Validity &amp; Status</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Start Date &amp; Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start_date}
                      onChange={handleFormChange('start_date')}
                      onClick={(e) => {
                        if (typeof e.target.showPicker === 'function') {
                          try {
                            e.target.showPicker();
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all ${
                        formErrors.start_date ? 'border-red-500 focus:border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.start_date && <span className="text-[10px] text-red-500 font-semibold">{formErrors.start_date}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      End Date &amp; Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.end_date}
                      onChange={handleFormChange('end_date')}
                      onClick={(e) => {
                        if (typeof e.target.showPicker === 'function') {
                          try {
                            e.target.showPicker();
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all ${
                        formErrors.end_date ? 'border-red-500 focus:border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.end_date && <span className="text-[10px] text-red-500 font-semibold">{formErrors.end_date}</span>}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setViewMode('list');
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:from-[#7C3AED] hover:to-[#8B5CF6] rounded-xl transition-all shadow-[0_4px_14px_rgba(109,40,217,0.25)] flex items-center gap-1.5"
                >
                  {submitting ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <div className="pt-6 px-6 pb-2">
              <h3 className="text-sm font-extrabold text-red-500 tracking-tight">Delete Coupon</h3>
            </div>
            <div className="px-6 pb-4">
              <p className="text-xs text-slate-650 leading-relaxed">
                Are you sure you want to delete coupon <strong>"{deleteTarget.offer_name}"</strong>?
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-md flex items-center gap-1.5"
              >
                {deleting && (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsView;
