import React, { useState } from 'react';
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
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storefront as StoreIcon,
  Image as ImageIcon,
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

const initialStores = [
  {
    id: 'STR-001',
    name: 'Amazon',
    image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=80&auto=format&fit=crop&q=60',
    category: 'Electronics & Mobiles',
    status: 'Active',
    vouchers: [
      {
        id: 'VCH-STR-001-1',
        title: 'Amazon Prime 1-Month',
        description: 'Get free delivery, early access to deals, and access to Prime Video.',
        image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=80&auto=format&fit=crop&q=60',
        amount: '₹299',
        terms: 'Valid for new Prime users only. Non-refundable.',
        expiryDate: '2026-12-31',
        quantity: 50,
        stockStatus: 'In Stock'
      },
      {
        id: 'VCH-STR-001-2',
        title: 'Amazon Pay Gift Card',
        description: 'Add balance to your Amazon Pay wallet.',
        image: '',
        amount: '₹500',
        terms: 'Can be used for all purchases on Amazon.in.',
        expiryDate: '2027-06-30',
        quantity: 100,
        stockStatus: 'In Stock'
      }
    ]
  },
  {
    id: 'STR-002',
    name: 'Flipkart',
    image: '',
    category: 'Electronics & Mobiles',
    status: 'Active',
    vouchers: [
      {
        id: 'VCH-STR-002-1',
        title: 'Flipkart Plus Membership',
        description: 'Get free shipping, double SuperCoins, and early access to sales.',
        image: '',
        amount: '₹499',
        terms: 'SuperCoins value required will be deducted.',
        expiryDate: '2026-10-31',
        quantity: 10,
        stockStatus: 'Limited Stock'
      }
    ]
  },
  {
    id: 'STR-003',
    name: 'Ajio',
    image: '',
    category: 'Fashion & Apparel',
    status: 'Inactive',
    vouchers: []
  },
  {
    id: 'STR-004',
    name: 'Nykaa',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&auto=format&fit=crop&q=60',
    category: 'Beauty & Wellness',
    status: 'Active',
    vouchers: [
      {
        id: 'VCH-STR-004-1',
        title: 'Nykaa Pink Friday Coupon',
        description: 'Get extra 15% off on orders above ₹2000.',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&auto=format&fit=crop&q=60',
        amount: '₹300',
        terms: 'Valid on select beauty categories.',
        expiryDate: '2026-07-15',
        quantity: 0,
        stockStatus: 'Out of Stock'
      }
    ]
  },
  {
    id: 'STR-005',
    name: 'Zomato',
    image: '',
    category: 'Food & Dining',
    status: 'Active',
    vouchers: [
      {
        id: 'VCH-STR-005-1',
        title: 'Zomato Gold 3-Month',
        description: 'Free delivery, no surge fee, up to 40% off on dining.',
        image: '',
        amount: '₹299',
        terms: 'Applicable in major metropolitan areas only.',
        expiryDate: '2026-08-30',
        quantity: 25,
        stockStatus: 'In Stock'
      }
    ]
  },
  {
    id: 'STR-006',
    name: 'MakeMyTrip',
    image: '',
    category: 'Travel & Flights',
    status: 'Active',
    vouchers: []
  }
];

const availableCategories = [
  'Electronics & Mobiles',
  'Fashion & Apparel',
  'Food & Dining',
  'Travel & Flights',
  'Beauty & Wellness',
  'Home Decor & Furniture',
  'Entertainment & Gaming',
];

const StoresView = ({ triggerToast }) => {
  const [stores, setStores] = useState(initialStores);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Dialog States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form input states (Add)
  const [storeName, setStoreName] = useState('');
  const [storeImage, setStoreImage] = useState('');
  const [storeCategory, setStoreCategory] = useState(availableCategories[0]);
  const [storeStatus, setStoreStatus] = useState('Active');

  // Form input states (Edit)
  const [selectedStore, setSelectedStore] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  // Voucher management states
  const [detailTab, setDetailTab] = useState(0); // 0 = Profile, 1 = Vouchers
  const [voucherFormMode, setVoucherFormMode] = useState(null); // null = List, 'add' = Add, 'edit' = Edit
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Voucher form states
  const [vchTitle, setVchTitle] = useState('');
  const [vchDescription, setVchDescription] = useState('');
  const [vchImage, setVchImage] = useState('');
  const [vchAmount, setVchAmount] = useState('');
  const [vchTerms, setVchTerms] = useState('');
  const [vchExpiryDate, setVchExpiryDate] = useState('');
  const [vchQuantity, setVchQuantity] = useState(100);
  const [vchStockStatus, setVchStockStatus] = useState('In Stock');

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

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      triggerToast('Please fill in the store name', 'warning');
      return;
    }

    // Auto-generate numeric ID
    let nextIdNum = 1;
    if (stores.length > 0) {
      const ids = stores.map((s) => parseInt(s.id.replace('STR-', ''))).filter((n) => !isNaN(n));
      if (ids.length > 0) {
        nextIdNum = Math.max(...ids) + 1;
      }
    }
    const generatedId = `STR-${String(nextIdNum).padStart(3, '0')}`;

    const newStore = {
      id: generatedId,
      name: storeName.trim(),
      image: storeImage.trim(),
      category: storeCategory,
      status: storeStatus,
      vouchers: [],
    };

    setStores([...stores, newStore]);
    triggerToast(`Store "${newStore.name}" registered successfully!`, 'success');

    // Reset fields & close
    setStoreName('');
    setStoreImage('');
    setStoreCategory(availableCategories[0]);
    setStoreStatus('Active');
    setOpenAddDialog(false);
  };

  const handleOpenEdit = (store) => {
    setSelectedStore(store);
    setEditName(store.name);
    setEditImage(store.image || '');
    setEditCategory(store.category);
    setEditStatus(store.status);
    setDetailTab(0);
    setVoucherFormMode(null);
    setSelectedVoucher(null);
    setOpenEditDialog(true);
  };

  const handleOpenAddVoucherDirectly = (store) => {
    setSelectedStore(store);
    setEditName(store.name);
    setEditImage(store.image || '');
    setEditCategory(store.category);
    setEditStatus(store.status);
    
    // Switch directly to Vouchers tab (Tab index 1)
    setDetailTab(1);
    
    // Open the Add Voucher form mode immediately
    setVchTitle('');
    setVchDescription('');
    setVchImage('');
    setVchAmount('');
    setVchTerms('');
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    const yyyy = threeMonths.getFullYear();
    const mm = String(threeMonths.getMonth() + 1).padStart(2, '0');
    const dd = String(threeMonths.getDate()).padStart(2, '0');
    setVchExpiryDate(`${yyyy}-${mm}-${dd}`);
    setVchQuantity(100);
    setVchStockStatus('In Stock');
    setVoucherFormMode('add');
    setSelectedVoucher(null);
    
    setOpenEditDialog(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      triggerToast('Please fill in the store name', 'warning');
      return;
    }

    setStores(
      stores.map((s) => {
        if (s.id === selectedStore.id) {
          return {
            ...s,
            name: editName.trim(),
            image: editImage.trim(),
            category: editCategory,
            status: editStatus,
            vouchers: s.vouchers || [],
          };
        }
        return s;
      })
    );

    triggerToast(`Store "${editName}" updated successfully!`, 'success');
    setOpenEditDialog(false);
  };

  const handleOpenAddVoucher = () => {
    setVchTitle('');
    setVchDescription('');
    setVchImage('');
    setVchAmount('');
    setVchTerms('');
    // Default expiry date is 3 months from now
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    const yyyy = threeMonths.getFullYear();
    const mm = String(threeMonths.getMonth() + 1).padStart(2, '0');
    const dd = String(threeMonths.getDate()).padStart(2, '0');
    setVchExpiryDate(`${yyyy}-${mm}-${dd}`);
    setVchQuantity(100);
    setVchStockStatus('In Stock');
    setVoucherFormMode('add');
  };

  const handleOpenEditVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setVchTitle(voucher.title);
    setVchDescription(voucher.description || '');
    setVchImage(voucher.image || '');
    setVchAmount(voucher.amount);
    setVchTerms(voucher.terms || '');
    setVchExpiryDate(voucher.expiryDate);
    setVchQuantity(voucher.quantity || 0);
    setVchStockStatus(voucher.stockStatus || 'In Stock');
    setVoucherFormMode('edit');
  };

  const handleVoucherSubmit = (e) => {
    e.preventDefault();
    if (!vchTitle.trim()) {
      triggerToast('Please enter a voucher title', 'warning');
      return;
    }
    if (!vchAmount.trim()) {
      triggerToast('Please enter an amount', 'warning');
      return;
    }
    if (!vchExpiryDate) {
      triggerToast('Please enter an expiry date', 'warning');
      return;
    }

    let updatedVouchers = [];

    if (voucherFormMode === 'add') {
      const currentVouchers = selectedStore.vouchers || [];
      let nextIdNum = 1;
      if (currentVouchers.length > 0) {
        const ids = currentVouchers.map((v) => {
          const parts = v.id.split('-');
          const lastNum = parseInt(parts[parts.length - 1]);
          return isNaN(lastNum) ? 0 : lastNum;
        });
        nextIdNum = Math.max(...ids) + 1;
      }
      const newVchId = `VCH-${selectedStore.id}-${nextIdNum}`;

      const newVoucher = {
        id: newVchId,
        title: vchTitle.trim(),
        description: vchDescription.trim(),
        image: vchImage.trim(),
        amount: vchAmount.trim(),
        terms: vchTerms.trim(),
        expiryDate: vchExpiryDate,
        quantity: parseInt(vchQuantity) || 0,
        stockStatus: vchStockStatus,
      };

      updatedVouchers = [...currentVouchers, newVoucher];
      triggerToast(`Voucher "${vchTitle}" registered successfully!`, 'success');
    } else if (voucherFormMode === 'edit') {
      updatedVouchers = (selectedStore.vouchers || []).map((v) => {
        if (v.id === selectedVoucher.id) {
          return {
            ...v,
            title: vchTitle.trim(),
            description: vchDescription.trim(),
            image: vchImage.trim(),
            amount: vchAmount.trim(),
            terms: vchTerms.trim(),
            expiryDate: vchExpiryDate,
            quantity: parseInt(vchQuantity) || 0,
            stockStatus: vchStockStatus,
          };
        }
        return v;
      });
      triggerToast(`Voucher "${vchTitle}" updated successfully!`, 'success');
    }

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

    setVoucherFormMode(null);
    setSelectedVoucher(null);
  };

  const handleDeleteVoucher = (voucherId) => {
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
                  {availableCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
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
                  <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>STATUS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pr: 3 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
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
                                src={store.image}
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
                  STORE IMAGE URL (OPTIONAL)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. https://domain.com/logo.png"
                  value={storeImage}
                  onChange={(e) => setStoreImage(e.target.value)}
                  variant="outlined"
                  size="small"
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ImageIcon color="action" sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  MAPPED CATEGORY *
                </Typography>
                <Select
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
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
                  {availableCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
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
              onClick={() => setOpenAddDialog(false)}
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
                    STORE IMAGE URL (OPTIONAL)
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g. https://domain.com/logo.png"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={textFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ImageIcon color="action" sx={{ fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    MAPPED CATEGORY *
                  </Typography>
                  <Select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    size="small"
                    fullWidth
                    sx={selectSx}
                  >
                    {availableCategories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                          <TableCell sx={{ fontWeight: 650, color: '#475569', py: 1.5 }}>VOUCHER</TableCell>
                          <TableCell sx={{ fontWeight: 650, color: '#475569', py: 1.5 }}>AMOUNT</TableCell>
                          <TableCell sx={{ fontWeight: 650, color: '#475569', py: 1.5 }}>EXPIRY</TableCell>
                          <TableCell sx={{ fontWeight: 650, color: '#475569', py: 1.5 }}>STOCK STATUS</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 650, color: '#475569', py: 1.5 }}>ACTIONS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedStore.vouchers.map((v) => {
                          const isOutOfStock = v.stockStatus === 'Out of Stock' || v.quantity === 0;
                          const isLimited = v.stockStatus === 'Limited Stock' || (v.quantity > 0 && v.quantity <= 15);
                          return (
                            <TableRow key={v.id} hover>
                              <TableCell sx={{ py: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  {v.image ? (
                                    <Avatar src={v.image} sx={{ width: 32, height: 32, borderRadius: '6px' }} />
                                  ) : (
                                    <Avatar sx={{ width: 32, height: 32, borderRadius: '6px', bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                                      <ConfirmationNumberIcon sx={{ fontSize: 16 }} />
                                    </Avatar>
                                  )}
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight={700} color="#1E293B">
                                      {v.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {v.description || 'No description'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight={800} color="#10B981">
                                  {v.amount}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                                  {v.expiryDate}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Chip
                                  label={`${v.quantity} units (${v.stockStatus})`}
                                  size="small"
                                  sx={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    bgcolor: isOutOfStock ? 'rgba(239, 68, 68, 0.08)' : isLimited ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                    color: isOutOfStock ? '#EF4444' : isLimited ? '#F59E0B' : '#10B981',
                                    border: isOutOfStock ? '1px solid rgba(239, 68, 68, 0.15)' : isLimited ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)',
                                    height: '22px'
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ py: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                  <IconButton size="small" sx={{ color: '#8B5CF6' }} onClick={() => handleOpenEditVoucher(v)}>
                                    <EditIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
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
                  <Box>
                    <Typography variant="subtitle1" fontWeight={850} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                      {voucherFormMode === 'add' ? 'Register New Voucher' : 'Modify Voucher Details'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {voucherFormMode === 'add' ? 'Add a digital reward listing under this store catalog.' : 'Update current voucher configurations and parameters.'}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={4}>
                  {/* Left Column: Form Fields */}
                  <Grid item xs={12} md={7.5}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          VOUCHER TITLE *
                        </Typography>
                        <TextField
                          fullWidth
                          required
                          placeholder="e.g. Amazon Prime Annual Subscription"
                          value={vchTitle}
                          onChange={(e) => setVchTitle(e.target.value)}
                          variant="outlined"
                          size="small"
                          sx={textFieldSx}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          AMOUNT / VALUE *
                        </Typography>
                        <TextField
                          fullWidth
                          required
                          placeholder="e.g. ₹500, Free, 10% Off"
                          value={vchAmount}
                          onChange={(e) => setVchAmount(e.target.value)}
                          variant="outlined"
                          size="small"
                          sx={textFieldSx}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          EXPIRY DATE *
                        </Typography>
                        <TextField
                          fullWidth
                          required
                          type="date"
                          value={vchExpiryDate}
                          onChange={(e) => setVchExpiryDate(e.target.value)}
                          variant="outlined"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={textFieldSx}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          STOCK QUANTITY
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          placeholder="e.g. 50"
                          value={vchQuantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setVchQuantity(val);
                            if (val === 0) {
                              setVchStockStatus('Out of Stock');
                            } else if (val <= 15) {
                              setVchStockStatus('Limited Stock');
                            } else {
                              setVchStockStatus('In Stock');
                            }
                          }}
                          variant="outlined"
                          size="small"
                          sx={textFieldSx}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          STOCK STATUS *
                        </Typography>
                        <Select
                          value={vchStockStatus}
                          onChange={(e) => setVchStockStatus(e.target.value)}
                          size="small"
                          fullWidth
                          sx={selectSx}
                        >
                          <MenuItem value="In Stock">In Stock (Available)</MenuItem>
                          <MenuItem value="Limited Stock">Limited Stock (Low Inventory)</MenuItem>
                          <MenuItem value="Out of Stock">Out of Stock (Suspended)</MenuItem>
                        </Select>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          VOUCHER IMAGE URL (OPTIONAL)
                        </Typography>
                        <TextField
                          fullWidth
                          placeholder="e.g. https://domain.com/voucher.png"
                          value={vchImage}
                          onChange={(e) => setVchImage(e.target.value)}
                          variant="outlined"
                          size="small"
                          sx={textFieldSx}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ImageIcon color="action" sx={{ fontSize: 18 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          VOUCHER DESCRIPTION
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2.5}
                          placeholder="Explain what the voucher gives, e.g. Free shipping..."
                          value={vchDescription}
                          onChange={(e) => setVchDescription(e.target.value)}
                          variant="outlined"
                          size="small"
                          sx={textFieldSx}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          TERMS & CONDITIONS
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2.5}
                          placeholder="Terms and conditions for usage..."
                          value={vchTerms}
                          onChange={(e) => setVchTerms(e.target.value)}
                          variant="outlined"
                          size="small"
                          sx={textFieldSx}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Right Column: Live Preview Card */}
                  <Grid item xs={12} md={4.5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 2, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        LIVE PREVIEW
                      </Typography>
                      <Box
                        sx={{
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          bgcolor: '#FFFFFF',
                        }}
                      >
                        {/* Coupon Header Banner */}
                        <Box
                          sx={{
                            background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
                            color: '#FFFFFF',
                            p: 3,
                            position: 'relative',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.15em', opacity: 0.85, fontSize: '0.62rem', display: 'block', mb: 1 }}>
                            {selectedStore?.name.toUpperCase()} REWARD VOUCHER
                          </Typography>
                          <Typography variant="h5" fontWeight={850} sx={{ letterSpacing: '-0.02em', mb: 1, wordBreak: 'break-word', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {vchTitle.trim() || 'Voucher Title'}
                          </Typography>
                          <Typography variant="h4" fontWeight={900} sx={{ color: '#FCD34D' }}>
                            {vchAmount.trim() || '₹0.00'}
                          </Typography>
                        </Box>

                        {/* Ticket Edge Punches / Ticket Separator */}
                        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', height: '20px', bgcolor: '#F8FAFC' }}>
                          <Box sx={{ width: '10px', height: '20px', borderRadius: '0 10px 10px 0', bgcolor: '#FFFFFF', borderRight: '1px solid rgba(226, 232, 240, 0.8)', position: 'absolute', left: 0 }} />
                          <Box sx={{ width: '100%', height: '1px', borderTop: '2px dashed rgba(226, 232, 240, 0.8)', mx: 2 }} />
                          <Box sx={{ width: '10px', height: '20px', borderRadius: '10px 0 0 10px', bgcolor: '#FFFFFF', borderLeft: '1px solid rgba(226, 232, 240, 0.8)', position: 'absolute', right: 0 }} />
                        </Box>

                        {/* Coupon Details Body */}
                        <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: '#F8FAFC' }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                              DESCRIPTION
                            </Typography>
                            <Typography variant="body2" color="#334155" sx={{ wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {vchDescription.trim() || 'No description provided yet. Explain details of this reward voucher.'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block' }}>
                                EXPIRES ON
                              </Typography>
                              <Typography variant="caption" fontWeight={750} color="#EF4444">
                                {vchExpiryDate || 'DD-MM-YYYY'}
                              </Typography>
                            </Box>
                            
                            <Chip
                              label={vchStockStatus}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                bgcolor: vchStockStatus === 'Out of Stock' ? 'rgba(239, 68, 68, 0.08)' : vchStockStatus === 'Limited Stock' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                color: vchStockStatus === 'Out of Stock' ? '#EF4444' : vchStockStatus === 'Limited Stock' ? '#F59E0B' : '#10B981',
                                border: vchStockStatus === 'Out of Stock' ? '1px solid rgba(239, 68, 68, 0.15)' : vchStockStatus === 'Limited Stock' ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)',
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

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

      {/* DIALOG 3: Delete Confirmation */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
            }}
          >
            <DeleteIcon sx={{ fontSize: 20 }} />
          </Box>
          Remove Store
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            Are you sure you want to delete store <strong>"{selectedStore?.name}"</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Deleting this merchant will remove it from the partner directory, and users will no longer see it listed in active store offers.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            color="inherit"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 650,
              borderRadius: '10px',
              px: 2.5,
            }}
          >
            Delete Store
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoresView;
