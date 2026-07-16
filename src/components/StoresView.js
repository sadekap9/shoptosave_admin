import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { categoryService } from '../services/categoryService';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Store,
  Ticket,
  ArrowLeft,
  Eye,
  PlusCircle,
  Upload,
  X
} from 'lucide-react';

// Helper to get initials
const getInitials = (name) => {
  return name.substring(0, 2).toUpperCase();
};

// Helper to get matching avatar gradient
const getAvatarGradient = (name) => {
  const colors = [
    'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
    'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
    'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const getLogoUrl = (logoPath) => {
  if (!logoPath) return null;
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  const baseHost = 'https://api.shoptosave.in';
  const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
  return `${baseHost}${cleanPath}`;
};

let lastFetchTime = 0;

const StoresView = ({ triggerToast }) => {
  const [stores, setStores] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [storeLogo, setStoreLogo] = useState(null);
  const [editLogo, setEditLogo] = useState(null);

  const fetchStoresList = async (cats = categoriesList) => {
    try {
      const storeResponse = await storeService.getStores();
      if (storeResponse && storeResponse.success && storeResponse.result && storeResponse.result.data) {
        const mappedStores = storeResponse.result.data.map((store) => {
          const matchedCategory = cats.find(
            (c) => String(c.id) === String(store.category_id)
          );

          return {
            id: store.id,
            name: store.store_name,
            image: store.logo || '',
            category: matchedCategory ? matchedCategory.category_name : 'Unknown',
            status: store.status === 0 ? 'Inactive' : 'Active',
            vouchers: [],
            vouchersCount: store.voucher_count || 0,
            rawStore: store,
          };
        });
        setStores(mappedStores);
      }
    } catch (error) {
      console.error('Fetch stores list error:', error);
      triggerToast('Failed to load stores list', 'error');
    }
  };

  const fetchStoreVouchers = async (storeId) => {
    try {
      const response = await storeService.getStoreVouchers(storeId);
      if (response && response.success && response.result && response.result.data) {
        const mappedVouchers = response.result.data.map((item) => ({
          id: item.id,
          sku: item.sku,
          gift_card_name: item.gift_card_name || item.name || '',
          featured: item.featured === true || Number(item.featured) === 1 ? 1 : 0,
          giftcard_image: item.giftcard_image || '',
          category_id: item.category_id || '',
          validity: item.validity || '',
          product_type: item.product_type || '',
          min_denomination: item.min_denomination,
          max_denomination: item.max_denomination
        }));

        setStores((prevStores) => prevStores.map((s) => {
          if (String(s.rawStore?.id || s.id) === String(storeId)) {
            return { ...s, vouchers: mappedVouchers, vouchersCount: mappedVouchers.length };
          }
          return s;
        }));

        setSelectedStore((prevSelected) => {
          if (prevSelected && String(prevSelected.rawStore?.id || prevSelected.id) === String(storeId)) {
            return { ...prevSelected, vouchers: mappedVouchers };
          }
          return prevSelected;
        });
      }
    } catch (error) {
      console.error('Error fetching store vouchers:', error);
      triggerToast('Failed to load vouchers list for this store', 'error');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const catResponse = await categoryService.getCategories();
        let fetchedCategories = [];
        if (catResponse && catResponse.success && catResponse.result && catResponse.result.data) {
          fetchedCategories = catResponse.result.data;
          setCategoriesList(fetchedCategories);
        }
        await fetchStoresList(fetchedCategories);

        // Fetch synced products for SKU dropdown
        const productsResponse = await storeService.getSyncedProducts();
        if (productsResponse && productsResponse.success && productsResponse.result && productsResponse.result.data) {
          setSyncedProducts(productsResponse.result.data);
        }
      } catch (error) {
        console.error('Error loading data in StoresView:', error);
        triggerToast('Failed to load stores or categories data', 'error');
      }
    };

    const now = Date.now();
    if (now - lastFetchTime > 500) {
      lastFetchTime = now;
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Dialog States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'vouchers'
  const [openedVouchersListFirst, setOpenedVouchersListFirst] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form input states (Add)
  const [storeName, setStoreName] = useState('');
  const [storeStatus, setStoreStatus] = useState('Active');

  // Form input states (Edit)
  const [selectedStore, setSelectedStore] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  // Voucher management states

  const [voucherFormMode, setVoucherFormMode] = useState(null); // null = List, 'add' = Add, 'edit' = Edit

  // Voucher form states
  const [vchSku, setVchSku] = useState('');
  const [vchFeatured, setVchFeatured] = useState(0);
  const [vchCategoryId, setVchCategoryId] = useState('');
  const [syncedProducts, setSyncedProducts] = useState([]);
  const [showSkuDropdown, setShowSkuDropdown] = useState(false);
  const [vchImage, setVchImage] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      triggerToast('Please fill in the store name', 'warning');
      return;
    }
    if (!storeLogo) {
      triggerToast('Please select a store logo file', 'warning');
      return;
    }
    try {
      const response = await storeService.addStore(
        storeName.trim(),
        storeLogo
      );

      if (response && response.success) {
        await fetchStoresList(categoriesList);
        triggerToast(`Store "${storeName.trim()}" registered successfully!`, 'success');

        // Reset fields & close
        setStoreName('');
        setStoreLogo(null);
        setOpenAddDialog(false);
      } else {
        triggerToast(response.message || 'Failed to register store', 'error');
      }
    } catch (err) {
      console.error('Add Store API error:', err);
      triggerToast(err.message || 'An error occurred while registering the store', 'error');
    }
  };

  const handleOpenEdit = (store) => {
    setSelectedStore(store);
    setEditName(store.name);
    setEditLogo(null);
    setEditStatus(store.status);
    setOpenEditDialog(true);
  };

  const handleOpenViewDetails = (store) => {
    setSelectedStore(store);
    setVoucherFormMode(null);
    setOpenedVouchersListFirst(true);

    const storeId = store.rawStore?.id || store.id;
    fetchStoreVouchers(storeId);

    setViewMode('vouchers');
  };

  const handleOpenAddVoucherDirectly = (store) => {
    setSelectedStore(store);

    // Open the Add Voucher form mode immediately
    setVchSku('');
    setVchFeatured(0);
    setVchCategoryId(categoriesList.length > 0 ? categoriesList[0].id : '');
    setVoucherFormMode('add');
    setOpenedVouchersListFirst(false);

    const storeId = store.rawStore?.id || store.id;
    fetchStoreVouchers(storeId);

    setViewMode('vouchers');
  };

  const handleCancelVoucherForm = () => {
    setShowSkuDropdown(false);
    if (openedVouchersListFirst) {
      setVoucherFormMode(null);
    } else {
      setViewMode('list');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      triggerToast('Please fill in the store name', 'warning');
      return;
    }
    try {
      const databaseId = selectedStore.rawStore?.id || selectedStore.id;
      const response = await storeService.updateStore(
        databaseId,
        editName.trim(),
        editLogo,
        editStatus
      );

      if (response && response.success) {
        await fetchStoresList(categoriesList);
        triggerToast(`Store "${editName.trim()}" updated successfully!`, 'success');
        setOpenEditDialog(false);
      } else {
        triggerToast(response.message || 'Failed to update store', 'error');
      }
    } catch (err) {
      console.error('Update Store API error:', err);
      triggerToast(err.message || 'An error occurred while updating the store', 'error');
    }
  };

  const handleOpenAddVoucher = () => {
    setVchSku('');
    setVchFeatured(0);
    setVchCategoryId(categoriesList.length > 0 ? categoriesList[0].id : '');
    setVchImage(null);
    setSelectedVoucher(null);
    setVoucherFormMode('add');
  };

  const handleOpenEditVoucher = (v) => {
    setSelectedVoucher(v);
    setVchSku(v.sku);
    setVchFeatured(v.featured);
    setVchCategoryId(v.category_id || '');
    setVchImage(null);
    setVoucherFormMode('edit');
  };

  const handleVoucherSubmit = async (e) => {
    e.preventDefault();
    if (!vchSku.trim()) {
      triggerToast('Please enter a SKU', 'warning');
      return;
    }

    try {
      if (voucherFormMode === 'add') {
        const storeId = selectedStore.rawStore?.id || selectedStore.id;
        const response = await storeService.addVoucher(storeId, vchSku, vchFeatured, vchCategoryId, vchImage);

        if (response && response.success) {
          triggerToast(`Voucher SKU "${vchSku.trim()}" registered successfully!`, 'success');
          await fetchStoreVouchers(storeId);
        } else {
          // Parse potential errors list from return payload
          const errorsList = response?.errors || [];
          const hasUniqueError = errorsList.some((err) => err.message && err.message.toLowerCase().includes('unique'));

          if (hasUniqueError) {
            triggerToast('Gift card already added for this store', 'error');
          } else {
            triggerToast(response?.message || 'Failed to register voucher mapping', 'error');
          }
          return;
        }
      } else if (voucherFormMode === 'edit') {
        const storeId = selectedStore.rawStore?.id || selectedStore.id;
        const response = await storeService.updateVoucher(selectedVoucher.id, storeId, vchSku, vchFeatured, vchCategoryId, vchImage);

        if (response && response.success) {
          triggerToast(`Voucher SKU "${vchSku.trim()}" updated successfully!`, 'success');
          await fetchStoreVouchers(storeId);
        } else {
          triggerToast(response?.message || 'Failed to update voucher', 'error');
          return;
        }
      }

      if (openedVouchersListFirst) {
        setVoucherFormMode(null);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Voucher Mapping Submission error:', err);
      // Parse exception errors from axios/fetch responses
      const errorMsg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || '';
      if (errorMsg.toLowerCase().includes('unique')) {
        triggerToast('Gift card already added for this store', 'error');
      } else {
        triggerToast(err.message || 'An error occurred while submitting voucher mapping', 'error');
      }
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    try {
      const response = await storeService.deleteVoucher(voucherId);
      if (response && response.success) {
        const updatedVouchers = (selectedStore.vouchers || []).filter((v) => v.id !== voucherId);

        const updatedStores = stores.map((s) => {
          if (s.id === selectedStore.id) {
            return {
              ...s,
              vouchers: updatedVouchers,
              vouchersCount: updatedVouchers.length,
            };
          }
          return s;
        });

        setStores(updatedStores);
        setSelectedStore({
          ...selectedStore,
          vouchers: updatedVouchers,
        });

        triggerToast('Voucher deleted successfully.', 'error');
      } else {
        triggerToast(response?.message || 'Failed to delete voucher', 'error');
      }
    } catch (err) {
      console.error('Delete Voucher API error:', err);
      triggerToast(err.message || 'An error occurred while deleting the voucher', 'error');
    }
  };

  const handleOpenDelete = (store) => {
    setSelectedStore(store);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedStore) {
      try {
        const databaseId = selectedStore.rawStore?.id || selectedStore.id;
        const response = await storeService.deleteStore(databaseId);
        if (response && response.success) {
          setStores(stores.filter((s) => s.id !== selectedStore.id));
          triggerToast(`Store "${selectedStore.name}" has been deleted successfully!`, 'success');
          setOpenDeleteDialog(false);
        } else {
          triggerToast(response?.message || 'Failed to delete store', 'error');
        }
      } catch (err) {
        console.error('Delete Store API error:', err);
        triggerToast(err.message || 'An error occurred while deleting the store', 'error');
      }
    }
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || store.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredProducts = syncedProducts.filter(
    (p) =>
      (!selectedStore?.vouchers?.some((v) => v.sku === p.sku) ||
        (voucherFormMode === 'edit' && selectedVoucher?.sku === p.sku)) &&
      (p.name.toLowerCase().includes(vchSku.toLowerCase()) || p.sku.toLowerCase().includes(vchSku.toLowerCase()))
  );

  if (viewMode === 'vouchers') {
    return (
      <div className="w-full max-w-full box-border animate-fadeIn">
        {/* Header with Title & Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setViewMode('list')}
            className="p-2.5 text-[#8B5CF6] hover:bg-violet-50 rounded-xl transition-all flex-shrink-0"
            title="Back to Stores"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-8 h-8 rounded-xl bg-violet-100/60 text-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
              {selectedStore?.name}
            </h2>
            <span className="text-[10px] font-extrabold text-slate-400 mt-1 block">Store ID: {selectedStore?.id}</span>
          </div>
        </div>

        {/* Main white card block */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          {voucherFormMode === null ? (
            /* Voucher List View */
            <div className="space-y-6">
              {/* List Header Row */}
              <div className="pb-4 border-b border-slate-100 bg-white">
                <h4 className="font-extrabold text-base text-slate-950">Active Vouchers</h4>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Manage digital reward listings under {selectedStore?.name}.
                </p>
              </div>

              {/* List Table/Cards */}
              {(!selectedStore?.vouchers || selectedStore.vouchers.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 bg-[#F8FAFC] rounded-2xl gap-2 text-center">
                  <Ticket className="w-10 h-10 text-slate-300 opacity-50" />
                  <span className="text-xs font-semibold text-slate-400">No vouchers mapped for this store.</span>
                </div>
              ) : (
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-white">
                  {/* Desktop Vouchers Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-[#F8FAFC]">
                        <tr className="border-b border-slate-150">
                          <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5">Gift Card Name</th>
                          <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5">Type</th>
                          <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5">Validity</th>
                          <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5">Range</th>
                          <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3.5 text-right pr-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedStore.vouchers.map((v) => {
                          const isFeatured = v.featured === 1;
                          return (
                            <tr key={v.id} className="hover:bg-violet-50/10 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  {v.giftcard_image ? (
                                    <img
                                      src={getLogoUrl(v.giftcard_image)}
                                      alt={v.gift_card_name}
                                      className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-150 shadow-sm flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-50 text-violet-500 border border-violet-100 flex-shrink-0">
                                      <Ticket className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-xs font-bold text-slate-800 truncate max-w-[250px] block">
                                      {v.gift_card_name || syncedProducts.find((p) => p.sku === v.sku)?.name || v.sku}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">SKU: {v.sku}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs font-bold text-slate-600">
                                  {v.product_type || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs font-bold text-slate-600">
                                  {v.validity || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs font-bold text-slate-600">
                                  {v.min_denomination !== undefined && v.min_denomination !== null
                                    ? `₹${v.min_denomination} - ₹${v.max_denomination || v.min_denomination}`
                                    : 'N/A'}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-right pr-6 whitespace-nowrap">
                                <div className="flex justify-end gap-1.5 ml-auto w-fit">
                                  <button
                                    onClick={() => handleOpenEditVoucher(v)}
                                    title="Edit Voucher Details"
                                    className="w-8 h-8 flex items-center justify-center bg-violet-50 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white rounded-lg transition-all duration-200 shadow-sm"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVoucher(v.id)}
                                    title="Delete Voucher Mapping"
                                    className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 shadow-sm"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Vouchers Card List */}
                  <div className="block sm:hidden divide-y divide-slate-100 bg-white">
                    {selectedStore.vouchers.map((v) => {
                      const isFeatured = v.featured === 1;
                      return (
                        <div key={v.id} className="p-4 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            {v.giftcard_image ? (
                              <img
                                src={getLogoUrl(v.giftcard_image)}
                                alt={v.gift_card_name}
                                className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-150 shadow-sm flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-violet-50 text-violet-500 flex-shrink-0">
                                <Ticket className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-800 truncate">
                                {v.gift_card_name || syncedProducts.find((p) => p.sku === v.sku)?.name || v.sku}
                              </h5>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[9px] text-slate-400 font-semibold">
                                <span>SKU: {v.sku}</span>
                                {v.product_type && (
                                  <>
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300 flex-shrink-0" />
                                    <span>Type: {v.product_type}</span>
                                  </>
                                )}
                                {v.validity && (
                                  <>
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300 flex-shrink-0" />
                                    <span>Validity: {v.validity}</span>
                                  </>
                                )}
                                {(v.min_denomination !== undefined && v.min_denomination !== null) && (
                                  <>
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300 flex-shrink-0" />
                                    <span>Range: ₹{v.min_denomination}-₹{v.max_denomination || v.min_denomination}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end border-t border-slate-50 pt-2">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleOpenEditVoucher(v)}
                                className="px-3 py-1.5 flex items-center gap-1 bg-violet-50 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white rounded-lg text-[10px] font-bold transition-all"
                              >
                                <Edit3 className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteVoucher(v.id)}
                                className="px-3 py-1.5 flex items-center gap-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


            </div>
          ) : (
            /* Voucher Form View (Add/Edit) */
            <div className="max-w-xl mx-auto space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <button
                  type="button"
                  onClick={handleCancelVoucherForm}
                  className="p-2 text-[#8B5CF6] hover:bg-violet-50 rounded-xl transition-all flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h4 className="font-extrabold text-base text-slate-950 leading-tight">
                    {voucherFormMode === 'add' ? 'Register New Voucher' : 'Modify Voucher Details'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    {voucherFormMode === 'add' ? 'Add digital reward listings to the catalog.' : 'Update voucher configurations.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleVoucherSubmit} className="space-y-5">
                {/* Product Autocomplete Dropdown Search */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Voucher SKU *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-[#8B5CF6]" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Search synced products by name, or type custom SKU..."
                      value={vchSku}
                      onChange={(e) => {
                        setVchSku(e.target.value);
                        setShowSkuDropdown(true);
                      }}
                      onFocus={() => setShowSkuDropdown(true)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 outline-none transition-all text-slate-800 font-medium placeholder-slate-400 shadow-sm"
                    />
                  </div>

                  {showSkuDropdown && filteredProducts.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSkuDropdown(false)} />
                      <ul className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-1 divide-y divide-slate-100/70 animate-fadeIn">
                        {filteredProducts.map((option) => (
                          <li
                            key={option.sku}
                            onClick={() => {
                              setVchSku(option.sku);
                              setShowSkuDropdown(false);
                            }}
                            className="flex flex-col text-left py-2 px-3.5 cursor-pointer hover:bg-violet-50/50 rounded-lg transition-colors"
                          >
                            <span className="text-xs font-bold text-slate-800 leading-snug">{option.name}</span>
                            <span className="text-[10px] text-[#8B5CF6] font-bold tracking-wide mt-0.5">SKU: {option.sku}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mapped Category *
                  </label>
                  <select
                    value={vchCategoryId}
                    onChange={(e) => setVchCategoryId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-[#F8FAFC] outline-none focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 text-slate-700 font-semibold transition-all shadow-sm cursor-pointer"
                  >
                    <option value="">-- Choose Category --</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gift Card Image Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Gift Card Image (Optional)
                  </label>
                  
                  {vchImage ? (
                    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-violet-100 bg-violet-50/10 shadow-sm animate-fadeIn">
                      <span className="text-[9px] font-bold text-[#8B5CF6] block uppercase tracking-wider">New Image Preview</span>
                      <img
                        src={URL.createObjectURL(vchImage)}
                        alt="Voucher Preview"
                        className="w-20 h-12 rounded-lg object-cover border border-slate-150 shadow-sm"
                      />
                    </div>
                  ) : (
                    selectedVoucher && selectedVoucher.giftcard_image && (
                      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 bg-[#F8FAFC] shadow-sm animate-fadeIn">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Current Image</span>
                        <img
                          src={getLogoUrl(selectedVoucher.giftcard_image)}
                          alt="Current Voucher"
                          className="w-20 h-12 rounded-lg object-cover border border-slate-150 shadow-sm"
                        />
                      </div>
                    )
                  )}
                  
                  <label className="w-full py-4 px-4 flex flex-col items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#8B5CF6] hover:bg-violet-50/20 border border-dashed border-slate-250 hover:border-[#8B5CF6]/50 bg-slate-50/50 rounded-xl cursor-pointer transition-all duration-200">
                    <PlusCircle className="w-5 h-5 text-slate-400" />
                    <span>{vchImage ? vchImage.name : 'Select Gift Card Image'}</span>
                    <span className="text-[9px] text-slate-400 font-normal">PNG, JPG or WEBP up to 2MB</span>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setVchImage(e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCancelVoucherForm}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-all shadow-md"
                  >
                    {voucherFormMode === 'add' ? 'Create Voucher' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      {/* Header with Title & Add Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Stores
          </h2>
        </div>
        <button
          onClick={() => setOpenAddDialog(true)}
          className="flex items-center gap-2 text-white bg-gradient-to-r from-primary to-secondary hover:from-[#7C3AED] hover:to-[#8B5CF6] px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(109,40,217,0.25)]"
        >
          <Plus className="w-4 h-4" />
          Add Store
        </button>
      </div>

      {/* Main card Stores directory */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Search & Filter Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-100 bg-white gap-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search store name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-200 text-slate-900 font-medium placeholder-slate-400"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-primary outline-none transition-all text-slate-700 font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-100">
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 pl-6">ID</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Store Name</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center">Vouchers</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center">Status</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Store className="w-10 h-10 text-slate-300 opacity-50" />
                      <span className="text-xs font-semibold text-slate-400">No stores found matching criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const isActive = store.status === 'Active';
                  return (
                    <tr
                      key={store.id}
                      className="hover:bg-violet-50/10 transition-colors"
                    >
                      <td className="px-6 py-4 pl-6 whitespace-nowrap">
                        <span className="text-xs font-extrabold text-slate-400">
                          {store.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {store.image ? (
                            <img
                              src={getLogoUrl(store.image)}
                              alt={store.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-150 shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-sm flex-shrink-0"
                              style={{ background: getAvatarGradient(store.name) }}
                            >
                              {getInitials(store.name)}
                            </div>
                          )}
                          <span className="text-xs font-bold text-slate-800">{store.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-700">
                          {store.vouchersCount || 0} Vouchers
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`text-xs font-bold ${
                          isActive ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {store.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenViewDetails(store)}
                            title="View Store Details & Vouchers"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-50 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all duration-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(store)}
                            title="Edit Store Profile"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAddVoucherDirectly(store)}
                            title="Add Voucher"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(store)}
                            title="Delete Store"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Mobile Card List View */}
        <div className="block md:hidden p-4 space-y-4 bg-slate-50/50">
          {filteredStores.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <Store className="w-10 h-10 text-slate-300 opacity-50" />
              <span className="text-xs font-semibold text-slate-400">No stores found matching criteria.</span>
            </div>
          ) : (
            filteredStores.map((store) => {
              const isActive = store.status === 'Active';
              return (
                <div key={store.id} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-all duration-200 space-y-4">
                  {/* Header: Logo, Name, ID, Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {store.image ? (
                        <img
                          src={getLogoUrl(store.image)}
                          alt={store.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-150 shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm flex-shrink-0"
                          style={{ background: getAvatarGradient(store.name) }}
                        >
                          {getInitials(store.name)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">{store.name}</h4>
                        <span className="text-[10px] font-extrabold text-slate-400 mt-0.5 block">{store.id}</span>
                      </div>
                    </div>
                    
                    <span className={`text-xs font-bold ${
                      isActive ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {store.status}
                    </span>
                  </div>

                  {/* Vouchers Info */}
                  <div className="flex justify-between items-center bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">Vouchers</span>
                    <span className="text-xs font-bold text-slate-700">
                      {store.vouchersCount || 0} Vouchers
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100/60">
                    <button
                      onClick={() => handleOpenViewDetails(store)}
                      className="py-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-violet-50 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all duration-200 text-xs font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Vouchers
                    </button>
                    <button
                      onClick={() => handleOpenEdit(store)}
                      className="py-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200 text-xs font-bold"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => handleOpenAddVoucherDirectly(store)}
                      className="py-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200 text-xs font-bold"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Add Voucher
                    </button>
                    <button
                      onClick={() => handleOpenDelete(store)}
                      className="py-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 text-xs font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Store
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DIALOG 1: Add Store */}
      {openAddDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[4px]">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setStoreName('');
                setStoreLogo(null);
                setOpenAddDialog(false);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Register Store</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Add a new store listing to the system.</p>
              </div>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="p-6 space-y-5">
                {/* Store Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Myntra, Amazon"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none transition-all text-slate-800 shadow-sm"
                  />
                </div>

                {/* Logo Upload Dropzone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Store Logo *
                  </label>
                  <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#8B5CF6]/50 bg-slate-50/40 hover:bg-violet-50/10 rounded-xl p-5 cursor-pointer transition-all duration-200">
                    <Upload className="w-5 h-5 text-slate-450 mb-1.5" />
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[250px]">
                      {storeLogo ? storeLogo.name : 'Choose Logo Image'}
                    </span>
                    <span className="text-[9px] text-slate-455 mt-1 font-semibold">PNG, JPG, SVG up to 2MB</span>
                    <input
                      type="file"
                      required
                      hidden
                      accept="image/*"
                      onChange={(e) => setStoreLogo(e.target.files[0])}
                    />
                  </label>
                </div>

                {/* Visibility Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Visibility Status *
                  </label>
                  <select
                    value={storeStatus}
                    onChange={(e) => setStoreStatus(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all"
                  >
                    <option value="Active">Active (Permitted)</option>
                    <option value="Inactive">Inactive (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setStoreName('');
                    setStoreLogo(null);
                    setOpenAddDialog(false);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Register Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 2: Edit Store Profile */}
      {openEditDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[4px]">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn relative flex flex-col max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setOpenEditDialog(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-violet-100/60 text-[#8B5CF6] flex items-center justify-center shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Edit Store Profile
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Modify profiles and metadata details.</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="flex flex-col h-full justify-between">
                <div className="p-6 space-y-5">
                  {selectedStore && (
                    <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-slate-450 block tracking-wider uppercase mb-0.5">
                          Store Identifier
                        </span>
                        <span className="text-xs font-extrabold text-slate-700">
                          ID: {selectedStore.id}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                        selectedStore.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10'
                          : 'bg-red-50 text-red-600 border-red-500/10'
                      }`}>
                        {selectedStore.status}
                      </span>
                    </div>
                  )}

                  {/* Store Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Myntra, Amazon"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none transition-all text-slate-800 shadow-sm"
                    />
                  </div>

                  {/* Upload new image & current thumbnail display */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Store Logo (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      {selectedStore?.image && (
                        <div className="relative group w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm flex-shrink-0">
                          <img
                            src={getLogoUrl(selectedStore.image)}
                            alt="Current Logo"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-[8px] text-white font-extrabold">CURRENT</span>
                          </div>
                        </div>
                      )}
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#8B5CF6]/50 bg-slate-50/40 hover:bg-violet-50/10 rounded-xl p-4 cursor-pointer transition-all duration-200">
                        <Upload className="w-5 h-5 text-slate-450 mb-1.5" />
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                          {editLogo ? editLogo.name : 'Upload New Logo'}
                        </span>
                        <span className="text-[9px] text-slate-455 mt-1 font-semibold">PNG, JPG, SVG up to 2MB</span>
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => setEditLogo(e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Visibility Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Visibility Status *
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white hover:border-slate-350 focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 outline-none text-slate-700 font-semibold shadow-sm transition-all"
                    >
                      <option value="Active">Active </option>
                      <option value="Inactive">Inactive </option>
                    </select>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2.5 mt-auto">
                  <button
                    type="button"
                    onClick={() => setOpenEditDialog(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 3: Delete Confirm Dialog */}
      {openDeleteDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <div className="pt-6 px-6 pb-2">
              <h3 className="text-sm font-extrabold text-red-500 tracking-tight">Delete Store</h3>
            </div>
            <div className="px-6 pb-4">
              <p className="text-xs text-slate-650 leading-relaxed">
                Are you sure you want to delete store <strong>"{selectedStore?.name}"</strong>?
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setOpenDeleteDialog(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresView;
