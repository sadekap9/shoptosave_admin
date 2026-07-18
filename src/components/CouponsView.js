import React, { useState, useEffect } from 'react';
import { couponService, storeService } from '../services/adminService';
import {
  Search,
  Plus,
  Tag,
  CheckCircle2,
  Ban,
  Trash2,
  Pencil,
  ArrowLeft,
  Filter
} from 'lucide-react';

const OFFER_TYPE_LABELS = {
  1: 'Instant Discount',
  2: 'Cashback',
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

const formatForDatetimeInput = (isoStr) => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const pad = (num) => String(num).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

const INITIAL_FORM = {
  offer_name: '',
  offer_type: 1,
  description: '',
  value: '',
  start_date: '',
  end_date: '',
  status: 1,
  store_id: '',
  gift_card_id: '',
};

let lastFetchTime = 0;

// ─── Premium Stat Card ────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accentColor, hoverShadow }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden transition-all duration-300 cursor-default"
      style={{
        borderColor: hovered ? accentColor : '#E2E8F0',
        boxShadow: hovered ? `0 12px 30px -10px ${hoverShadow}, 0 4px 12px -5px ${hoverShadow}` : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
          opacity: hovered ? 1 : 0,
        }}
      />
      <div>
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">{label}</span>
        <h3 className="text-2xl font-black" style={{ color: accentColor }}>{value}</h3>
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
        style={{
          backgroundColor: `${accentColor}12`,
          color: accentColor,
          transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'none',
        }}
      >
        {icon}
      </div>
    </div>
  );
};

const CouponsView = ({ triggerToast }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stores, setStores] = useState([]);
  const [giftCards, setGiftCards] = useState([]);

  // View mode state: 'list' or 'create'
  const [viewMode, setViewMode] = useState('list');
  const [editingCoupon, setEditingCoupon] = useState(null);
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
  const [statsMeta, setStatsMeta] = useState({ total: 0, active: 0, inactive: 0 });

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
        if (response.result.statistics) {
          setStatsMeta({
            total: response.result.statistics.total || 0,
            active: response.result.statistics.active || 0,
            inactive: response.result.statistics.inactive || 0,
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
        const [storeRes, giftRes] = await Promise.all([
          storeService.getStores(1, 1000),
          storeService.getGiftCards(1, 1000)
        ]);
        if (storeRes && storeRes.success && storeRes.result && storeRes.result.data) {
          setStores(Array.isArray(storeRes.result.data) ? storeRes.result.data : []);
        }
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
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'store_id') {
        if (updated.gift_card_id && val) {
          const matchingCard = giftCards.find((g) => Number(g.id) === Number(updated.gift_card_id));
          if (!matchingCard || Number(matchingCard.store_id) !== Number(val)) {
            updated.gift_card_id = '';
          }
        }
      }
      return updated;
    });
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.offer_name.trim()) errors.offer_name = 'Offer name is required';
    if (!formData.value || Number(formData.value) <= 0) errors.value = 'Value must be > 0';
    if (Number(formData.value) > 100) errors.value = 'Value percentage must be <= 100';
    if (!formData.start_date) errors.start_date = 'Start date is required';
    if (!formData.end_date) errors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date)
      errors.end_date = 'End date must be after start date';
    return errors;
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setEditingCoupon(null);
  };

  const handleEditClick = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      offer_name: coupon.offer_name || coupon.title || '',
      description: coupon.description || '',
      offer_type: coupon.offer_type || 1,
      value: coupon.value !== undefined && coupon.value !== null ? coupon.value : '',
      start_date: formatForDatetimeInput(coupon.start_date),
      end_date: formatForDatetimeInput(coupon.end_date),
      status: coupon.status !== undefined ? coupon.status : 1,
      store_id: coupon.store_id || '',
      gift_card_id: coupon.gift_card_id || '',
    });
    setFormErrors({});
    setViewMode('create');
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

      let response;
      if (editingCoupon) {
        response = await couponService.updateCoupon(editingCoupon.id, payload);
      } else {
        response = await couponService.addCoupon(payload);
      }

      if (response && response.success) {
        triggerToast(
          editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!',
          'success'
        );
        resetForm();
        setViewMode('list');
        fetchCoupons(editingCoupon ? page : 0, rowsPerPage);
      } else {
        triggerToast(response?.message || `Failed to ${editingCoupon ? 'update' : 'create'} coupon`, 'error');
      }
    } catch (error) {
      console.error(`${editingCoupon ? 'Update' : 'Add'} coupon error:`, error);
      triggerToast(error.message || `An error occurred while ${editingCoupon ? 'updating' : 'creating'} the coupon`, 'error');
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
        `Coupon "${coupon.offer_name || coupon.title}" is now ${newStatus === 1 ? 'Active' : 'Inactive'}`,
        'info'
      );
      fetchCoupons(page, rowsPerPage);
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
      triggerToast(`Coupon "${deleteTarget.offer_name || deleteTarget.title}" deleted`, 'success');
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

  const totalCoupons = statsMeta.total;
  const activeCoupons = statsMeta.active;
  const inactiveCoupons = statsMeta.inactive;

  const filteredGiftCards = giftCards.filter((g) => {
    if (!formData.store_id) return true;
    return Number(g.store_id) === Number(formData.store_id);
  });

  const filteredCoupons = coupons.filter((c) => {
    const q = searchTerm.toLowerCase();
    const titleVal = c.offer_name || c.title || '';
    const matchesSearch = titleVal.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && c.status === 1) ||
      (statusFilter === 'Inactive' && c.status === 0);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      {viewMode === 'list' ? (
        <>
          {/* Header Row */}
          <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
            <div />
            <button
              onClick={() => setViewMode('create')}
              className="flex items-center gap-2 text-white bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] hover:from-[#7C3AED] hover:to-[#9333EA] px-5 py-2.5 text-[11px] font-bold rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(109,40,217,0.25)] hover:shadow-[0_8px_25px_rgba(109,40,217,0.35)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              Add New Coupon
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <StatCard
              label="Total Coupons"
              value={totalCoupons}
              icon={<Tag className="w-5 h-5" />}
              accentColor="#8B5CF6"
              hoverShadow="rgba(139,92,246,0.18)"
            />
            <StatCard
              label="Active Coupons"
              value={activeCoupons}
              icon={<CheckCircle2 className="w-5 h-5" />}
              accentColor="#10B981"
              hoverShadow="rgba(16,185,129,0.18)"
            />
            <StatCard
              label="Inactive Coupons"
              value={inactiveCoupons}
              icon={<Ban className="w-5 h-5" />}
              accentColor="#EF4444"
              hoverShadow="rgba(239,68,68,0.18)"
            />
          </div>

          {/* Main Table Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* Search / Filter header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 border-b border-slate-100 bg-white gap-4">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search coupon name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-[11px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 outline-none transition-all duration-200 text-slate-900 font-semibold placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 text-[11px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 outline-none transition-all duration-200 text-slate-700 font-bold cursor-pointer"
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
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-5 py-3.5 pl-6">ID</th>
                    <th className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-5 py-3.5">Offer Name</th>
                    <th className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-5 py-3.5">Store</th>
                    <th className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-5 py-3.5">Type</th>
                    <th className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-5 py-3.5">Discount</th>
                    <th className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-5 py-3.5">Validity</th>
                    <th className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-5 py-3.5 text-center">Status</th>
                    <th className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-5 py-3.5 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center bg-white">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-[#8B5CF6] animate-spin" />
                          <span className="text-[11px] font-semibold text-slate-400">Loading coupons...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center bg-white">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Tag className="w-7 h-7 text-slate-300" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-400 block">No coupons found</span>
                            <span className="text-[11px] text-slate-350 mt-0.5 block">Try adjusting your search or filters</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => {
                      const isLive = coupon.status === 1;
                      const valNum = parseFloat(coupon.value || 0).toFixed(2);
                      return (
                        <tr
                          key={coupon.id}
                          className="hover:bg-violet-50/30 transition-colors duration-150 group"
                        >
                          {/* ID */}
                          <td className="px-5 py-4 pl-6 whitespace-nowrap">
                            <span className="text-[11px] font-bold text-slate-400">#{coupon.id}</span>
                          </td>

                          {/* Offer Name */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-[12px] font-bold text-slate-800">{coupon.offer_name || coupon.title}</span>
                          </td>

                          {/* Store */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-[11px] font-semibold text-slate-600">
                              {coupon.store_name || coupon.gift_card_name || (
                                <span className="text-slate-400">All Stores</span>
                              )}
                            </span>
                          </td>

                          {/* Type */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              coupon.offer_type === 1
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {OFFER_TYPE_LABELS[coupon.offer_type] || 'Offer'}
                            </span>
                          </td>

                          {/* Discount */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-[13px] font-extrabold text-[#8B5CF6]">
                              {coupon.display_text || `${valNum}%`}
                            </span>
                          </td>

                          {/* Validity */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5 text-[10px] font-semibold text-slate-500">
                              <span>{formatDate(coupon.start_date)}</span>
                              <span className="text-slate-400">to {formatDate(coupon.end_date)}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleToggleStatus(coupon)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide border transition-all duration-200 ${
                                isLive
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 pulse-dot-green' : 'bg-red-500 pulse-dot-red'}`} />
                              {isLive ? 'Active' : 'Inactive'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 whitespace-nowrap text-right pr-6">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <button
                                onClick={() => handleEditClick(coupon)}
                                className="p-2 text-slate-300 hover:text-[#8B5CF6] hover:bg-violet-50 rounded-lg transition-all duration-200"
                                title="Edit Coupon"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(coupon)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Pagination Controls */}
            {filteredCoupons.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-semibold text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                      fetchCoupons(0, parseInt(e.target.value, 10));
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 text-slate-700 font-bold cursor-pointer transition-all"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-slate-400 ml-1">
                    <span className="text-slate-600 font-bold">{page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCoupons)}</span> of <span className="text-slate-600 font-bold">{totalCoupons}</span>
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
                    className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none font-bold"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={(page + 1) * rowsPerPage >= totalCoupons}
                    onClick={() => {
                      const newPage = page + 1;
                      setPage(newPage);
                      fetchCoupons(newPage, rowsPerPage);
                    }}
                    className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none font-bold"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="animate-fadeIn">
          {/* Header with Title & Back Button */}
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setViewMode('list');
              }}
              className="p-2.5 text-[#8B5CF6] hover:bg-violet-50 rounded-xl transition-all flex-shrink-0 border border-transparent hover:border-violet-200"
              title="Back to Coupons"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 text-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-sm border border-violet-100">
              <Tag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-[1.65rem] font-extrabold text-slate-900 tracking-tight leading-none">
                {editingCoupon ? `Edit Coupon #${editingCoupon.id}` : 'Create New Coupon'}
              </h2>
              <span className="text-[10px] font-bold text-slate-400 mt-1.5 block">
                {editingCoupon
                  ? 'Modify coupon parameters, or validity details'
                  : 'Add an automatic Instant Discount or Cashback offer for your customers'}
              </span>
            </div>
          </div>

          {/* Form inside a clean white card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <form onSubmit={handleAddSubmit}>
              {/* Section 1: Basic Information */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-center font-extrabold text-[11px] shadow-sm">1</span>
                  <h4 className="text-[13px] font-bold text-slate-800">Basic Information</h4>
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
                      className={`w-full px-4 py-2.5 text-[12px] rounded-xl border bg-white hover:border-slate-300 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all duration-200 ${
                        formErrors.offer_name ? 'border-red-400 focus:border-red-400 focus:ring-red-500/5' : 'border-slate-200'
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
                      className="w-full px-4 py-2.5 text-[12px] rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all duration-200 cursor-pointer"
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
                      className="w-full px-4 py-2.5 text-[12px] rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all duration-200 cursor-pointer"
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
                      className="w-full px-4 py-2.5 text-[12px] rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <option value="">
                        {formData.store_id ? 'All Gift Cards in Selected Store' : 'All Gift Cards (Global Offer)'}
                      </option>
                      {filteredGiftCards.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.gift_card_name || g.brand_name} (SKU: {g.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Discount Percentage */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-center font-extrabold text-[11px] shadow-sm">2</span>
                  <h4 className="text-[13px] font-bold text-slate-800">Discount Value</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Percentage Value (%) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      max="100"
                      step="0.01"
                      placeholder="e.g. 10"
                      value={formData.value}
                      onChange={handleFormChange('value')}
                      onWheel={(e) => e.target.blur()}
                      className={`w-full px-4 py-2.5 text-[12px] rounded-xl border bg-white hover:border-slate-300 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all duration-200 ${
                        formErrors.value ? 'border-red-400 focus:border-red-400 focus:ring-red-500/5' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.value && <span className="text-[10px] text-red-500 font-semibold">{formErrors.value}</span>}
                  </div>
                </div>
              </div>

              {/* Section 3: Validity & Status */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-center font-extrabold text-[11px] shadow-sm">3</span>
                  <h4 className="text-[13px] font-bold text-slate-800">Validity &amp; Status</h4>
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
                      className={`w-full px-4 py-2.5 text-[12px] rounded-xl border bg-white hover:border-slate-300 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all duration-200 ${
                        formErrors.start_date ? 'border-red-400 focus:border-red-400 focus:ring-red-500/5' : 'border-slate-200'
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
                      className={`w-full px-4 py-2.5 text-[12px] rounded-xl border bg-white hover:border-slate-300 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all duration-200 ${
                        formErrors.end_date ? 'border-red-400 focus:border-red-400 focus:ring-red-500/5' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.end_date && <span className="text-[10px] text-red-500 font-semibold">{formErrors.end_date}</span>}
                  </div>
                </div>
              </div>

              {/* Submit actions */}
              <div className="px-6 py-5 bg-slate-50/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setViewMode('list');
                  }}
                  className="px-5 py-2.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-[11px] font-bold text-white bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(109,40,217,0.25)] hover:shadow-[0_8px_25px_rgba(109,40,217,0.35)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {submitting ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : editingCoupon ? (
                    <Pencil className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {submitting
                    ? editingCoupon
                      ? 'Updating...'
                      : 'Creating...'
                    : editingCoupon
                    ? 'Update Coupon'
                    : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[3px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <div className="pt-6 px-6 pb-3 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 border border-red-100">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Delete Coupon</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  Are you sure you want to delete <strong className="text-slate-700">"{deleteTarget.offer_name || deleteTarget.title}"</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 disabled:opacity-60"
              >
                {deleting && (
                  <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
