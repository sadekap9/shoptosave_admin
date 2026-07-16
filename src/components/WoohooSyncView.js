import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import {
  RefreshCw,
  Search,
  Gift,
  ChevronRight,
  Wifi,
  Cpu,
  X
} from 'lucide-react';

const WoohooSyncView = ({ systemStatus, onSyncWoohoo, triggerToast }) => {
  const [syncedProducts, setSyncedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Sync Dialog state
  const [openSyncDialog, setOpenSyncDialog] = useState(false);
  const [skuInput, setSkuInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    setLoadingProducts(true);
    try {
      const response = await storeService.getSyncedProducts();
      if (response && response.success && response.result && response.result.data) {
        setSyncedProducts(response.result.data);
      }
    } catch (error) {
      console.error('Failed to load synced products:', error);
      triggerToast('Failed to load synced products catalog', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSyncSubmit = async (e) => {
    e.preventDefault();
    if (!skuInput.trim()) {
      triggerToast('Please enter a valid SKU', 'warning');
      return;
    }

    setIsSyncing(true);
    try {
      let token = localStorage.getItem('woohoo_bearer_token');
      let productData = null;
      let success = false;
      const sku = skuInput.trim();

      if (token) {
        try {
          productData = await storeService.getWoohooProductBySku(sku, token);
          success = true;
        } catch (err) {
          const isTokenRejected = err.status === 401 ||
                                  (err.data && err.data.message && err.data.message.includes('token_rejected')) ||
                                  (err.message && err.message.includes('token_rejected'));

          if (!isTokenRejected) {
            throw err;
          }
          console.warn('Woohoo bearer token rejected/expired. Regenerating...');
        }
      }

      if (!success) {
        const codeRes = await storeService.generateWoohooCode();
        if (!codeRes || !codeRes.success || !codeRes.result?.authorizationCode) {
          throw new Error(codeRes?.message || 'Failed to generate authorization code');
        }
        const authCode = codeRes.result.authorizationCode;

        const tokenRes = await storeService.generateWoohooToken(authCode);
        if (!tokenRes || !tokenRes.success || !tokenRes.result?.token) {
          throw new Error(tokenRes?.message || 'Failed to exchange token');
        }
        const newToken = tokenRes.result.token;
        localStorage.setItem('woohoo_bearer_token', newToken);

        productData = await storeService.getWoohooProductBySku(sku, newToken);
      }

      triggerToast(`Product "${productData?.result?.name || sku}" synced successfully!`, 'success');
      onSyncWoohoo();

      setSkuInput('');
      setOpenSyncDialog(false);

      await loadData();
    } catch (err) {
      console.error('Woohoo Sync flow error:', err);
      let errorMsg = err.message || 'An error occurred during synchronization';
      if (err.data && err.data.message) {
        errorMsg = err.data.message;
      }
      triggerToast(errorMsg, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredProducts = syncedProducts.filter((p) => {
    const nameMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const skuMatch = p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || skuMatch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      {/* Header section */}
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Integrations
            </span>
            <ChevronRight className="w-3 h-3 text-slate-350" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Woohoo Api Bridge
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Woohoo Integration Sync
          </h2>
          <p className="text-xs text-slate-450 mt-1">
            Sync digital products from Woohoo by SKU and configure cashback store catalogs in the database.
          </p>
        </div>
        
        {systemStatus?.lastSync && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/50 text-[10px] font-bold text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Last Sync: {systemStatus.lastSync}
          </div>
        )}
      </div>

      {/* Sync Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Synced Products Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary" />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Synced Products
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-primary transition-colors">
              {syncedProducts.length}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Gift className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        {/* API Status Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Woohoo API Status
            </span>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl font-extrabold text-emerald-600 tracking-tight">
                ONLINE
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Wifi className="w-4 h-4" />
          </div>
        </div>

        {/* Environment Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Environment
            </span>
            <h3 className="text-lg font-extrabold text-teal-650 tracking-tight">
              SANDBOX / BETA
            </h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-650 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Synced Products Directory Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Title and Search Row */}
        <div className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search synced gift cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-200 text-slate-900 font-medium placeholder-slate-400"
            />
          </div>

          <button
            onClick={() => setOpenSyncDialog(true)}
            className="flex items-center justify-center gap-2 text-white bg-gradient-to-r from-primary to-secondary hover:from-[#7C3AED] hover:to-[#8B5CF6] px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(109,40,217,0.25)] active:scale-95 duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Sync New Gift Card
          </button>
        </div>

        {/* Synced Table */}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-100">
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5 pl-6">
                  Gift Card Name
                </th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5">
                  SKU Code
                </th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5 text-center pr-6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingProducts ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-400">Loading synced catalogs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Gift className="w-10 h-10 text-slate-355 opacity-40 mb-1" />
                      <span className="text-xs font-bold text-slate-400">No synced gift card products found.</span>
                      <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed">
                        Try searching with another query or sync a new SKU directly from the Woohoo network.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product, idx) => (
                  <tr
                    key={product.sku || idx}
                    className="hover:bg-violet-50/10 transition-all duration-155 group"
                  >
                    <td className="px-6 py-4 pl-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/15 text-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <Gift className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-primary transition-colors">
                          {product.name || 'Digital Gift Card'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/50">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center pr-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-extrabold border bg-emerald-50 text-emerald-600 border-emerald-500/10">
                        Synced
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-[#F8FAFC]/50 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Showing <span className="font-extrabold text-slate-800">{Math.min(startIndex + 1, filteredProducts.length)}</span> to <span className="font-extrabold text-slate-800">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of <span className="font-extrabold text-slate-800">{filteredProducts.length}</span> listings
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-650 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all ${
                        currentPage === pageNum
                          ? 'bg-primary text-white shadow-sm'
                          : 'border border-slate-200 text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-650 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sync Dialog */}
      {openSyncDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[4px] animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="text-sm font-extrabold text-slate-900">Sync Gift Card Listing</h3>
              <button
                type="button"
                onClick={() => setOpenSyncDialog(false)}
                disabled={isSyncing}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSyncSubmit}>
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Enter a gift card SKU to sync the product details.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Woohoo SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSyncing}
                    placeholder="e.g. GCGBFTV001"
                    value={skuInput}
                    onChange={(e) => setSkuInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-200 text-slate-800"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenSyncDialog(false)}
                  disabled={isSyncing}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:from-[#7C3AED] hover:to-[#8B5CF6] rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 animate-pulse-primary"
                >
                  {isSyncing && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isSyncing ? 'Syncing...' : 'Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WoohooSyncView;
