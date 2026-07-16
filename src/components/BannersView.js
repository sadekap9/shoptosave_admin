import React, { useState, useEffect } from 'react';
import { bannerService } from '../services/bannerService';
import {
  Search,
  Plus,
  Image as CarouselIcon,
  Upload,
  CheckCircle2,
  Ban,
  ChevronRight
} from 'lucide-react';

const getBannerImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseHost = 'https://api.shoptosave.in';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseHost}${cleanPath}`;
};

const BannersView = ({ triggerToast }) => {
  const [banners, setBanners] = useState([]);
  const handleToggleStatus = (bannerId) => {
    setBanners((prevBanners) =>
      prevBanners.map((b) =>
        b.id === bannerId ? { ...b, status: b.status === 1 ? 0 : 1 } : b
      )
    );
    triggerToast('Banner status updated locally (no API call)', 'success');
  };
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add Dialog State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    banner_image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await bannerService.getBanners();
      if (response && response.success && response.result && response.result.data) {
        setBanners(response.result.data);
      }
    } catch (error) {
      console.error('Fetch banners error:', error);
      triggerToast(error.message || 'Failed to fetch banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        banner_image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      banner_image: null,
    });
    setImagePreview(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.banner_image) {
      triggerToast('Please upload a banner image file', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const response = await bannerService.addBanner(formData);
      if (response && response.success) {
        triggerToast('Banner added successfully!', 'success');
        resetForm();
        setOpenAddDialog(false);
        fetchBanners();
      } else {
        triggerToast(response.message || 'Failed to add banner', 'error');
      }
    } catch (error) {
      console.error('Add banner error:', error);
      triggerToast(error.message || 'An error occurred while adding the banner', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats
  const totalBanners = banners.length;
  const activeBanners = banners.filter((b) => b.status === 1).length;
  const inactiveBanners = banners.filter((b) => b.status === 0).length;

  // Filters
  const filteredBanners = banners.filter((banner) => {
    const matchesSearch =
      (banner.banner_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banner.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banner.subtitle || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && banner.status === 1) ||
      (statusFilter === 'Inactive' && banner.status === 0);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      {/* Header section */}
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Marketing
            </span>
            <ChevronRight className="w-3 h-3 text-slate-350" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Banners Section
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Promo Banners
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage main carousel advertisements and promotional banners displayed in the customer application.
          </p>
        </div>
        <button
          onClick={() => setOpenAddDialog(true)}
          className="flex items-center gap-2 text-white bg-primary hover:bg-[#5B21B6] px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(109,40,217,0.25)]"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(109,40,217,0.06)] hover:border-primary transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Banners</span>
            <h3 className="text-xl font-black text-slate-900">{totalBanners}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CarouselIcon className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(16,185,129,0.06)] hover:border-emerald-500 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Banners</span>
            <h3 className="text-xl font-black text-emerald-500">{activeBanners}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-[0_4px_20px_0_rgba(239,68,68,0.06)] hover:border-red-500 transition-all duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Inactive Banners</span>
            <h3 className="text-xl font-black text-red-500">{inactiveBanners}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <Ban className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Main card with Banner list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Search / Filter Row */}
        <div className="p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by banner title or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-200 text-slate-900 font-medium placeholder-slate-400"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-primary outline-none transition-all text-slate-700 font-semibold w-full sm:w-44"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Banners Table */}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-100">
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 pl-6">ID</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Preview</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Banner Details</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-400">Loading promo banners...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CarouselIcon className="w-10 h-10 text-slate-300 opacity-50" />
                      <span className="text-xs font-semibold text-slate-400">No banners found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => {
                  const isActive = banner.status === 1;
                  return (
                    <tr
                      key={banner.id}
                      className="hover:bg-violet-50/10 transition-colors"
                    >
                      <td className="px-6 py-4 pl-6 text-xs font-mono font-bold text-slate-400 whitespace-nowrap">
                        {banner.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="w-24 h-14 rounded-lg overflow-hidden border border-slate-200/80 flex items-center justify-center"
                          style={{ backgroundColor: banner.background_color || '#ECE9FC' }}
                        >
                          <img
                            src={getBannerImageUrl(banner.banner_image)}
                            alt={banner.banner_name || 'Promo Banner'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{banner.banner_name || 'Promo Banner'}</span>
                          {banner.title && (
                            <span className="text-[10px] text-slate-450 block mt-0.5">{banner.title}</span>
                          )}
                          {banner.subtitle && (
                            <span className="text-[9px] text-slate-400 block mt-0.5">{banner.subtitle}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center pr-6 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(banner.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-600 border-red-500/10 hover:bg-red-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {isActive ? 'Active' : 'Inactive'}
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

      {/* Add Banner Dialog */}
      {openAddDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-white">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CarouselIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Create Promo Banner</h3>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Banner Image *
                  </label>
                  <label className="w-full py-6 border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 text-center px-4 max-w-[250px] truncate">
                      {formData.banner_image ? formData.banner_image.name : 'Select or Upload Banner Image'}
                    </span>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {imagePreview && (
                  <div className="p-2 border border-slate-250/60 rounded-xl bg-slate-50 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Image Preview</span>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-40 object-contain rounded-lg bg-white p-1 border"
                    />
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setOpenAddDialog(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-[#5B21B6] rounded-lg transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {submitting ? 'Creating...' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersView;
