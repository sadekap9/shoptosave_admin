import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { categoryService } from '../services/categoryService';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  Select,
  Tooltip,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  Chip,
  Autocomplete,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storefront as StoreIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

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


const availableCategories = [
  'Electronics & Mobiles',
  'Fashion & Apparel',
  'Food & Dining',
  'Travel & Flights',
  'Beauty & Wellness',
  'Home Decor & Furniture',
  'Entertainment & Gaming',
];

let lastFetchTime = 0;

const StoresView = ({ triggerToast }) => {
  const [stores, setStores] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [storeCategoryId, setStoreCategoryId] = useState('');
  const [storeLogo, setStoreLogo] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editLogo, setEditLogo] = useState(null);

  const fetchStoresList = async (cats = categoriesList) => {
    try {
      const storeResponse = await storeService.getStores();
      if (storeResponse && storeResponse.success && storeResponse.result && storeResponse.result.data) {
        const mappedStores = await Promise.all(
          storeResponse.result.data.map(async (store) => {
            const matchedCategory = cats.find(
              (c) => String(c.id) === String(store.category_id)
            );

            let vouchersList = [];
            try {
              const vResponse = await storeService.getStoreVouchers(store.id);
              if (vResponse && vResponse.success && vResponse.result && vResponse.result.data) {
                vouchersList = vResponse.result.data.map((item) => ({
                  id: item.id,
                  sku: item.sku,
                  gift_card_name: item.gift_card_name || item.name || '',
                  featured: item.featured === true || Number(item.featured) === 1 ? 1 : 0
                }));
              }
            } catch (vErr) {
              console.error(`Failed to fetch vouchers for store ${store.id}:`, vErr);
            }

            return {
              id: `STR-${String(store.id).padStart(3, '0')}`,
              name: store.store_name,
              image: store.logo || '',
              category: matchedCategory ? matchedCategory.category_name : 'Unknown',
              status: store.status === 0 ? 'Inactive' : 'Active',
              vouchers: vouchersList,
              rawStore: store,
            };
          })
        );
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
          featured: item.featured === true || Number(item.featured) === 1 ? 1 : 0
        }));

        setStores((prevStores) => prevStores.map((s) => {
          if (String(s.rawStore?.id || s.id.replace('STR-', '')) === String(storeId)) {
            return { ...s, vouchers: mappedVouchers };
          }
          return s;
        }));

        setSelectedStore((prevSelected) => {
          if (prevSelected && String(prevSelected.rawStore?.id || prevSelected.id.replace('STR-', '')) === String(storeId)) {
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
          if (fetchedCategories.length > 0) {
            setStoreCategoryId(fetchedCategories[0].id);
          }
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
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Dialog States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form input states (Add)
  const [storeName, setStoreName] = useState('');
  const [storeStatus, setStoreStatus] = useState('Active');

  // Form input states (Edit)
  const [selectedStore, setSelectedStore] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  // Voucher management states
  const [detailTab, setDetailTab] = useState(0); // 0 = Profile, 1 = Vouchers
  const [voucherFormMode, setVoucherFormMode] = useState(null); // null = List, 'add' = Add, 'edit' = Edit

  // Voucher form states
  const [vchSku, setVchSku] = useState('');
  const [vchFeatured, setVchFeatured] = useState(1);
  const [syncedProducts, setSyncedProducts] = useState([]);

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      bgcolor: '#F8FAFC',
      transition: 'all 0.2s',
      '&:hover': {
        bgcolor: '#F1F5F9',
      },
      '&.Mui-focused': {
        bgcolor: '#FFFFFF',
        boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.1)',
      },
    },
  };

  const selectSx = {
    borderRadius: '12px',
    bgcolor: '#F8FAFC',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(226, 232, 240, 0.8)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#CBD5E1',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#8B5CF6',
    },
  };

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
    if (!storeCategoryId) {
      triggerToast('Please select a valid category', 'warning');
      return;
    }

    try {
      const response = await storeService.addStore(
        storeName.trim(),
        storeCategoryId,
        storeLogo
      );

      if (response && response.success) {
        await fetchStoresList(categoriesList);
        triggerToast(`Store "${storeName.trim()}" registered successfully!`, 'success');

        // Reset fields & close
        setStoreName('');
        setStoreLogo(null);
        if (categoriesList.length > 0) {
          setStoreCategoryId(categoriesList[0].id);
        } else {
          setStoreCategoryId('');
        }
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

    // Resolve the category ID from the category name string
    const matchedCategory = categoriesList.find(
      (c) => c.category_name === store.category
    );
    setEditCategoryId(matchedCategory ? matchedCategory.id : '');
    setEditLogo(null);
    setEditStatus(store.status);
    setDetailTab(0);
    setVoucherFormMode(null);

    const storeId = store.rawStore?.id || store.id.replace('STR-', '');
    fetchStoreVouchers(storeId);

    setOpenEditDialog(true);
  };

  const handleOpenAddVoucherDirectly = (store) => {
    setSelectedStore(store);
    setEditName(store.name);

    // Resolve the category ID from the category name string
    const matchedCategory = categoriesList.find(
      (c) => c.category_name === store.category
    );
    setEditCategoryId(matchedCategory ? matchedCategory.id : '');
    setEditLogo(null);
    setEditStatus(store.status);

    // Switch directly to Vouchers tab (Tab index 1)
    setDetailTab(1);

    // Open the Add Voucher form mode immediately
    setVchSku('');
    setVchFeatured(1);
    setVoucherFormMode('add');

    const storeId = store.rawStore?.id || store.id.replace('STR-', '');
    fetchStoreVouchers(storeId);

    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      triggerToast('Please fill in the store name', 'warning');
      return;
    }
    if (!editCategoryId) {
      triggerToast('Please select a valid category', 'warning');
      return;
    }

    try {
      const databaseId = selectedStore.rawStore?.id || selectedStore.id.replace('STR-', '');
      const response = await storeService.updateStore(
        databaseId,
        editName.trim(),
        editCategoryId,
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
    setVchFeatured(1);
    setVoucherFormMode('add');
  };

  const handleVoucherSubmit = async (e) => {
    e.preventDefault();
    if (!vchSku.trim()) {
      triggerToast('Please enter a SKU', 'warning');
      return;
    }

    try {
      if (voucherFormMode === 'add') {
        const storeId = selectedStore.rawStore?.id || selectedStore.id.replace('STR-', '');
        const response = await storeService.addVoucher(storeId, vchSku, vchFeatured);

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
      }

      setVoucherFormMode(null);
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

  const handleDeleteConfirm = () => {
    if (selectedStore) {
      setStores(stores.filter((s) => s.id !== selectedStore.id));
      triggerToast(`Store "${selectedStore.name}" has been deleted.`, 'error');
      setOpenDeleteDialog(false);
    }
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || store.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || store.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header with Title & Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Stores
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 650,
            px: 3,
            py: 1.2,
            boxShadow: '0 4px 14px rgba(109, 40, 217, 0.25)',
          }}
        >
          Add Store
        </Button>
      </Box>

      {/* Main card Stores directory */}
      <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Search & Filter Row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 3,
              borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: '#FFFFFF',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <TextField
              variant="outlined"
              sx={{
                width: '320px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#F1F5F9',
                  },
                  '&.Mui-focused': {
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 0 0 2px rgba(109, 40, 217, 0.1)',
                  },
                },
              }}
              size="small"
              placeholder="Search store name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" sx={{ fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl size="small" sx={{ width: '180px' }}>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(226, 232, 240, 0.8)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CBD5E1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6D28D9',
                    },
                  }}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  {categoriesList.length > 0 ? (
                    categoriesList.map((cat) => (
                      <MenuItem key={cat.id} value={cat.category_name}>
                        {cat.category_name}
                      </MenuItem>
                    ))
                  ) : (
                    availableCategories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ width: '180px' }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(226, 232, 240, 0.8)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CBD5E1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6D28D9',
                    },
                  }}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Active">Active Only</MenuItem>
                  <MenuItem value="Inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pl: 3 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>STORE NAME</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>MAPPED CATEGORY</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>VOUCHERS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>STATUS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pr: 3 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <StoreIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          No stores found matching criteria.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStores.map((store) => {
                    const isActive = store.status === 'Active';
                    return (
                      <TableRow
                        key={store.id}
                        hover
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(109, 40, 217, 0.015) !important',
                          },
                        }}
                      >
                        <TableCell sx={{ pl: 3 }}>
                          <Typography variant="subtitle2" fontWeight={800} color="#64748B">
                            {store.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {store.image ? (
                              <Avatar
                                src={getLogoUrl(store.image)}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '10px',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  background: getAvatarGradient(store.name),
                                  color: '#FFFFFF',
                                  width: 36,
                                  height: 36,
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.8rem',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                }}
                              >
                                {getInitials(store.name)}
                              </Box>
                            )}
                            <Typography variant="subtitle2" fontWeight={750} color="#1E293B">
                              {store.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={550} color="#475569">
                            {store.category}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${(store.vouchers || []).length} Vouchers`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(109, 40, 217, 0.08)',
                              color: '#6D28D9',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: '6px'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.8,
                              px: 1.5,
                              py: 0.6,
                              borderRadius: '20px',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              bgcolor: isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                              color: isActive ? '#10B981' : '#EF4444',
                              border: isActive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)',
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: isActive ? '#10B981' : '#EF4444',
                              }}
                            />
                            {store.status}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Configure Store Details">
                              <IconButton
                                size="small"
                                sx={{
                                  color: '#8B5CF6',
                                  bgcolor: 'rgba(139, 92, 246, 0.05)',
                                  '&:hover': {
                                    bgcolor: '#8B5CF6',
                                    color: '#FFFFFF',
                                  },
                                  width: 32,
                                  height: 32,
                                  transition: 'all 0.2s',
                                }}
                                onClick={() => handleOpenEdit(store)}
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Add Voucher">
                              <IconButton
                                size="small"
                                sx={{
                                  color: '#10B981',
                                  bgcolor: 'rgba(16, 185, 129, 0.05)',
                                  '&:hover': {
                                    bgcolor: '#10B981',
                                    color: '#FFFFFF',
                                  },
                                  width: 32,
                                  height: 32,
                                  transition: 'all 0.2s',
                                }}
                                onClick={() => handleOpenAddVoucherDirectly(store)}
                              >
                                <ConfirmationNumberIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Store">
                              <IconButton
                                size="small"
                                sx={{
                                  color: '#EF4444',
                                  bgcolor: 'rgba(239, 68, 68, 0.05)',
                                  '&:hover': {
                                    bgcolor: '#EF4444',
                                    color: '#FFFFFF',
                                  },
                                  width: 32,
                                  height: 32,
                                  transition: 'all 0.2s',
                                }}
                                onClick={() => handleOpenDelete(store)}
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* DIALOG 1: Add Store */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pb: 2,
            pt: 3,
            px: 3,
            fontSize: '1.2rem',
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 1,
              borderRadius: '10px',
              bgcolor: 'rgba(109, 40, 217, 0.08)',
              color: '#6D28D9',
            }}
          >
            <StoreIcon sx={{ fontSize: 20 }} />
          </Box>
          Register Store
        </DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  STORE NAME *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. Myntra, Amazon"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  variant="outlined"
                  size="small"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: '#F1F5F9',
                      },
                      '&.Mui-focused': {
                        bgcolor: '#FFFFFF',
                        boxShadow: '0 0 0 2px rgba(109, 40, 217, 0.1)',
                      },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  STORE LOGO *
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    borderRadius: '12px',
                    py: 1.2,
                    textTransform: 'none',
                    borderColor: 'rgba(226, 232, 240, 0.8)',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    '&:hover': {
                      borderColor: '#CBD5E1',
                      backgroundColor: '#F1F5F9',
                    },
                  }}
                >
                  {storeLogo ? storeLogo.name : 'Choose Logo Image *'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setStoreLogo(e.target.files[0])}
                  />
                </Button>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  MAPPED CATEGORY *
                </Typography>
                <Select
                  value={storeCategoryId}
                  onChange={(e) => setStoreCategoryId(e.target.value)}
                  size="small"
                  fullWidth
                  required
                  sx={{
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(226, 232, 240, 0.8)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CBD5E1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6D28D9',
                    },
                  }}
                >
                  {categoriesList.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  VISIBILITY STATUS *
                </Typography>
                <Select
                  value={storeStatus}
                  onChange={(e) => setStoreStatus(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(226, 232, 240, 0.8)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#CBD5E1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6D28D9',
                    },
                  }}
                >
                  <MenuItem value="Active">Active (Permitted)</MenuItem>
                  <MenuItem value="Inactive">Inactive (Suspended)</MenuItem>
                </Select>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <Button
              onClick={() => {
                setStoreName('');
                setStoreLogo(null);
                if (categoriesList.length > 0) {
                  setStoreCategoryId(categoriesList[0].id);
                } else {
                  setStoreCategoryId('');
                }
                setOpenAddDialog(false);
              }}
              color="inherit"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                textTransform: 'none',
                fontWeight: 650,
                borderRadius: '10px',
                px: 2.5,
              }}
            >
              Register Store
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG 2: Edit Store & Voucher Management */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pb: 0,
            pt: 3,
            px: 4,
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 1,
                borderRadius: '10px',
                bgcolor: 'rgba(139, 92, 246, 0.08)',
                color: '#8B5CF6',
              }}
            >
              <StoreIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              Store Manager: {selectedStore?.name}
            </Typography>
          </Box>

          <Tabs
            value={detailTab}
            onChange={(e, newValue) => {
              setDetailTab(newValue);
              setVoucherFormMode(null);
            }}
            sx={{
              '& .MuiTabs-indicator': {
                height: '3px',
                borderRadius: '3px 3px 0 0',
                bgcolor: '#8B5CF6',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#64748B',
                minWidth: 'auto',
                px: 3,
                pb: 1.5,
                '&.Mui-selected': {
                  color: '#8B5CF6',
                },
              },
            }}
          >
            <Tab label="Store Profile" />
            <Tab label={`Vouchers (${(selectedStore?.vouchers || []).length})`} />
          </Tabs>
        </DialogTitle>

        {detailTab === 0 ? (
          <form onSubmit={handleEditSubmit}>
            <DialogContent sx={{ p: 4 }}>
              {selectedStore && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: '#F8FAFC',
                    borderRadius: '14px',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                    STORE IDENTIFIER
                  </Typography>
                  <Typography variant="subtitle2" color="#0F172A" fontWeight={750}>
                    ID: {selectedStore.id}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    STORE NAME *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g. Myntra, Amazon"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    variant="outlined"
                    size="small"
                    required
                    sx={textFieldSx}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    STORE LOGO (OPTIONAL)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{
                      borderRadius: '12px',
                      py: 1.2,
                      textTransform: 'none',
                      borderColor: 'rgba(226, 232, 240, 0.8)',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      '&:hover': {
                        borderColor: '#CBD5E1',
                        backgroundColor: '#F1F5F9',
                      },
                    }}
                  >
                    {editLogo ? editLogo.name : 'Choose New Logo Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setEditLogo(e.target.files[0])}
                    />
                  </Button>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    MAPPED CATEGORY *
                  </Typography>
                  <Select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    size="small"
                    fullWidth
                    required
                    sx={selectSx}
                  >
                    {categoriesList.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    VISIBILITY STATUS *
                  </Typography>
                  <Select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    size="small"
                    fullWidth
                    sx={selectSx}
                  >
                    <MenuItem value="Active">Active (Permitted)</MenuItem>
                    <MenuItem value="Inactive">Inactive (Suspended)</MenuItem>
                  </Select>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 4, pb: 3, pt: 2, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <Button
                onClick={() => setOpenEditDialog(false)}
                color="inherit"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 650,
                  borderRadius: '10px',
                  px: 2.5,
                  bgcolor: '#8B5CF6',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#7C3AED' }
                }}
              >
                Save Details
              </Button>
            </DialogActions>
          </form>
        ) : (
          /* Tab 2: Vouchers */
          <DialogContent sx={{ p: 4, minHeight: '350px' }}>
            {voucherFormMode === null ? (
              /* Voucher List View */
              <Box>
                {/* Header Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 3 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                      Active Vouchers
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Manage all digital vouchers and rewards listed under {selectedStore?.name}.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddVoucher}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#8B5CF6',
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: '#7C3AED' }
                    }}
                  >
                    Add Voucher
                  </Button>
                </Box>

                {/* List Table */}
                {(!selectedStore?.vouchers || selectedStore.vouchers.length === 0) ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 8,
                      border: '1px dashed rgba(226, 232, 240, 1)',
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      gap: 1.5
                    }}
                  >
                    <ConfirmationNumberIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={550}>
                      No vouchers found for this store.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '12px', overflow: 'hidden' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 650, color: '#475569', py: 1.5 }}>GIFT CARD NAME</TableCell>
                          <TableCell sx={{ fontWeight: 650, color: '#475569', py: 1.5 }}>FEATURED STATUS</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 650, color: '#475569', py: 1.5 }}>ACTIONS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedStore.vouchers.map((v) => {
                          const isFeatured = v.featured === 1;
                          return (
                            <TableRow key={v.id} hover>
                              <TableCell sx={{ py: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar sx={{ width: 32, height: 32, borderRadius: '6px', bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                                    <ConfirmationNumberIcon sx={{ fontSize: 16 }} />
                                  </Avatar>
                                  <Typography variant="subtitle2" fontWeight={700} color="#1E293B">
                                    {v.gift_card_name || syncedProducts.find((p) => p.sku === v.sku)?.name || v.sku}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Chip
                                  label={isFeatured ? 'Featured' : 'Standard'}
                                  size="small"
                                  sx={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    bgcolor: isFeatured ? 'rgba(16, 185, 129, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                                    color: isFeatured ? '#10B981' : '#64748B',
                                    border: isFeatured ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(100, 116, 139, 0.15)',
                                    height: '22px'
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ py: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                  <IconButton size="small" sx={{ color: '#EF4444' }} onClick={() => handleDeleteVoucher(v.id)}>
                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <Button onClick={() => setOpenEditDialog(false)} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Close Dialog
                  </Button>
                </Box>
              </Box>
            ) : (
              /* Voucher Form View (Add/Edit) */
              <form onSubmit={handleVoucherSubmit}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, pb: 2, borderBottom: '1px solid rgba(226, 232, 240, 0.6)' }}>
                  <IconButton
                    size="small"
                    onClick={() => setVoucherFormMode(null)}
                    sx={{
                      color: '#8B5CF6',
                      bgcolor: 'rgba(139, 92, 246, 0.05)',
                      '&:hover': {
                        bgcolor: '#8B5CF6',
                        color: '#FFFFFF',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight={850} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                      {voucherFormMode === 'add' ? 'Register New Voucher' : 'Modify Voucher Details'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {voucherFormMode === 'add' ? 'Add a digital reward listing under this store catalog.' : 'Update current voucher configurations and parameters.'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, mt: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      VOUCHER SKU *
                    </Typography>
                    <Autocomplete
                      freeSolo
                      options={syncedProducts}
                      getOptionLabel={(option) => {
                        if (typeof option === 'string') return option;
                        return option.sku;
                      }}
                      value={syncedProducts.find((p) => p.sku === vchSku) || vchSku || null}
                      onChange={(event, newValue) => {
                        if (typeof newValue === 'string') {
                          setVchSku(newValue);
                        } else if (newValue && newValue.sku) {
                          setVchSku(newValue.sku);
                        } else {
                          setVchSku('');
                        }
                      }}
                      onInputChange={(event, newInputValue) => {
                        setVchSku(newInputValue);
                      }}
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          {...props}
                          sx={{
                            display: 'flex !important',
                            flexDirection: 'column !important',
                            alignItems: 'flex-start !important',
                            textAlign: 'left !important',
                            width: '100% !important',
                            py: 1.2,
                            px: 2,
                            borderBottom: '1px solid #F1F5F9',
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={750} color="#1E293B" sx={{ fontSize: '0.85rem', mb: 0.2, textAlign: 'left !important', width: '100% !important' }}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="#8B5CF6" fontWeight={700} sx={{ letterSpacing: '0.02em', fontSize: '0.72rem', textAlign: 'left !important', width: '100% !important' }}>
                            SKU: {option.sku}
                          </Typography>
                        </Box>
                      )}
                      slotProps={{
                        paper: {
                          sx: {
                            borderRadius: '16px',
                            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            mt: 1,
                            backgroundColor: '#FFFFFF',
                            '& .MuiAutocomplete-listbox': {
                              p: 0,
                            }
                          }
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search synced products by name, or type custom SKU..."
                          variant="outlined"
                          size="small"
                          required
                          sx={textFieldSx}
                          InputProps={{
                            ...(params.InputProps || {}),
                            startAdornment: (
                              <>
                                <InputAdornment position="start" sx={{ pl: 0.5, mr: 0.5 }}>
                                  <SearchIcon sx={{ fontSize: 18, color: '#8B5CF6' }} />
                                </InputAdornment>
                                {params.InputProps?.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#CBD5E1',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                    }
                  }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} color="#1E293B" sx={{ mb: 0.5 }}>
                        Featured Status
                      </Typography>
                      <Typography variant="caption" color="#64748B">
                        Show this voucher in banners and highlighted sections on the store page.
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={vchFeatured === 1}
                          onChange={(e) => setVchFeatured(e.target.checked ? 1 : 0)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#8B5CF6',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#8B5CF6',
                              },
                            },
                          }}
                        />
                      }
                      label={vchFeatured === 1 ? 'Featured' : 'Standard'}
                      labelPlacement="start"
                      sx={{
                        mr: 0,
                        gap: 1.5,
                        '& .MuiFormControlLabel-label': {
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: vchFeatured === 1 ? '#8B5CF6' : '#64748B',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 2, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <Button onClick={() => setVoucherFormMode(null)} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 650,
                      bgcolor: '#8B5CF6',
                      color: '#FFFFFF',
                      px: 3,
                      '&:hover': { bgcolor: '#7C3AED' }
                    }}
                  >
                    {voucherFormMode === 'add' ? 'Create Voucher' : 'Save Changes'}
                  </Button>
                </Box>
              </form>
            )}
          </DialogContent>
        )}
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
            maxWidth: 380,
            width: '100%',
          },
        }}
      >
        {/* Header Section */}
        <Box sx={{ pt: 3.5, px: 3.5, pb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 750, fontSize: '1.25rem', color: '#EF4444', letterSpacing: '-0.02em' }}>
            Delete Store
          </Typography>
        </Box>

        <DialogContent sx={{ p: 0, px: 3.5, pb: 2 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
            Are you sure you want to delete store <strong>"{selectedStore?.name}"</strong>?
          </Typography>
        </DialogContent>

        <DialogActions 
          sx={{ 
            px: 3.5, 
            pb: 3.5, 
            pt: 1.5, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 1.5
          }}
        >
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600, 
              fontSize: '0.82rem', 
              color: '#64748B', 
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              px: 2,
              py: 0.8,
              borderRadius: '6px',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              borderRadius: '6px',
              px: 2.5,
              py: 0.8,
              bgcolor: '#EF4444',
              color: '#FFFFFF',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': { 
                bgcolor: '#DC2626',
                boxShadow: 'none',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoresView;
