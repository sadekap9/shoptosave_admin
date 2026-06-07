import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Layers as LayersIcon,
  QueryStats as StatsIcon,
} from '@mui/icons-material';

import { categoryService } from '../services/categoryService';

// Helper to get initials
const getInitials = (name) => {
  return name.substring(0, 2).toUpperCase();
};

// Helper to get matching avatar gradient
const getAvatarGradient = (name) => {
  const colors = [
    'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
    'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
    'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch (e) {
    return isoString;
  }
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

const initialCategories = [
  { id: 'CAT-001', name: 'Electronics & Mobiles', status: 'Active', created: '2026-05-10 14:30' },
  { id: 'CAT-002', name: 'Fashion & Apparel', status: 'Active', created: '2026-05-12 09:15' },
  { id: 'CAT-003', name: 'Food & Dining', status: 'Active', created: '2026-05-15 18:45' },
  { id: 'CAT-004', name: 'Travel & Flights', status: 'Active', created: '2026-05-18 11:20' },
  { id: 'CAT-005', name: 'Beauty & Wellness', status: 'Inactive', created: '2026-05-20 16:00' },
  { id: 'CAT-006', name: 'Home Decor & Furniture', status: 'Active', created: '2026-05-22 10:05' },
  { id: 'CAT-007', name: 'Entertainment & Gaming', status: 'Inactive', created: '2026-05-24 15:30' },
];

const CategoriesView = ({ triggerToast }) => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  
  // Dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form input states
  const [catName, setCatName] = useState('');
  const [catStatus, setCatStatus] = useState('Active');
  const [catLogo, setCatLogo] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editLogo, setEditLogo] = useState(null);
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response && response.success && response.result && response.result.data) {
        const mappedCategories = response.result.data.map(cat => ({
          id: cat.id,
          name: cat.category_name,
          status: cat.status === 1 ? 'Active' : 'Inactive',
          created: formatDateTime(cat.created_at),
          logo: cat.logo
        }));
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      triggerToast(error.message || 'Failed to fetch categories from server', 'error');
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Stats calculation
  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.status === 'Active').length;
  const inactiveCount = categories.filter((c) => c.status === 'Inactive').length;
  const lastCreatedName = categories.length > 0 ? categories[categories.length - 1].name : 'N/A';

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      triggerToast('Please enter a valid category name', 'warning');
      return;
    }
    if (!catLogo) {
      triggerToast('Please select a category logo file', 'warning');
      return;
    }
    try {
      const response = await categoryService.addCategory(
        catName.trim(),
        catStatus,
        catLogo
      );

      if (response && response.success) {
        triggerToast(`Category "${catName.trim()}" added successfully!`, 'success');
        
        // Reset form & close dialog
        setCatName('');
        setCatStatus('Active');
        setCatLogo(null);
        setOpenAddDialog(false);

        // Fetch refreshed categories list
        fetchCategories();
      } else {
        triggerToast(response.message || 'Failed to add category', 'error');
      }
    } catch (err) {
      console.error('Add Category API error:', err);
      triggerToast(err.message || 'An error occurred while adding the category', 'error');
    }
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditStatus(category.status);
    setEditLogo(null);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      triggerToast('Please enter a valid category name', 'warning');
      return;
    }

    try {
      const response = await categoryService.updateCategory(
        selectedCategory.id,
        editName.trim(),
        editStatus,
        editLogo
      );

      if (response && response.success) {
        triggerToast(`Category "${editName}" updated successfully!`, 'success');
        setOpenEditDialog(false);
        setEditLogo(null);
        fetchCategories();
      } else {
        triggerToast(response.message || 'Failed to update category', 'error');
      }
    } catch (err) {
      console.error('Update Category API error:', err);
      triggerToast(err.message || 'An error occurred while updating the category', 'error');
    }
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      try {
        const response = await categoryService.deleteCategory(selectedCategory.id);
        if (response && response.success) {
          triggerToast(`Category "${selectedCategory.name}" has been deleted.`, 'error');
          setOpenDeleteDialog(false);
          fetchCategories();
        } else {
          triggerToast(response.message || 'Failed to delete category', 'error');
        }
      } catch (err) {
        console.error('Delete Category API error:', err);
        triggerToast(err.message || 'An error occurred while deleting the category', 'error');
      }
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = (cat.name ? cat.name.toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
                          String(cat.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || cat.status === statusFilter;

    // Date filtering logic
    let matchesDate = true;
    if (dateFilter !== 'All') {
      const createdDate = new Date(cat.created.replace(' ', 'T'));
      const now = new Date();
      const diffTime = Math.abs(now - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'Today') {
        matchesDate = createdDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'Week') {
        matchesDate = diffDays <= 7;
      } else if (dateFilter === 'Month') {
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header with breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Categories
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
          Add Category
        </Button>
      </Box>

      {/* Telemetry Summary Cards */}
      {/* Telemetry Summary Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Total Categories
                </Typography>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(109, 40, 217, 0.08)', color: '#6D28D9', display: 'flex' }}>
                  <LayersIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={850} sx={{ mb: 0.5 }}>
                {totalCategories}
              </Typography>
            </Box>

          </CardContent>
        </Card>

        <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Active Categories
                </Typography>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex' }}>
                  <ActiveIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={850} color="#10B981" sx={{ mb: 0.5 }}>
                {activeCount} Active
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Inactive Categories
                </Typography>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', display: 'flex' }}>
                  <InactiveIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={850} color="#EF4444" sx={{ mb: 0.5 }}>
                {inactiveCount} Hidden
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Recently Created
                </Typography>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(13, 148, 136, 0.08)', color: '#0D9488', display: 'flex' }}>
                  <StatsIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={850} color="#0D9488" sx={{ mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {lastCreatedName}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Main card Category directory */}
      <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Search Row */}
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
              placeholder="Search by category ID or name..."
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

              <FormControl size="small" sx={{ width: '180px' }}>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
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
                  <MenuItem value="All">All Time</MenuItem>
                  <MenuItem value="Today">Created Today</MenuItem>
                  <MenuItem value="Week">Last 7 Days</MenuItem>
                  <MenuItem value="Month">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pl: 3 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>CATEGORY NAME</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>CREATED AT</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pr: 3 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <CategoryIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          No categories found matching details.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat) => {
                    const isActive = cat.status === 'Active';
                    return (
                      <TableRow
                        key={cat.id}
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
                            {cat.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {cat.logo ? (
                              <Box
                                component="img"
                                src={getLogoUrl(cat.logo)}
                                alt={cat.name}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '10px',
                                  objectFit: 'cover',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                }}
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  background: getAvatarGradient(cat.name),
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
                                {getInitials(cat.name)}
                              </Box>
                            )}
                            <Typography variant="subtitle2" fontWeight={750} color="#1E293B">
                              {cat.name}
                            </Typography>
                          </Box>
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
                            {cat.status}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {cat.created}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Configure Category details">
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
                                onClick={() => handleOpenEdit(cat)}
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Category">
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
                                onClick={() => handleOpenDelete(cat)}
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

      {/* DIALOG 1: Add Category */}
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
            <CategoryIcon sx={{ fontSize: 20 }} />
          </Box>
          Create New Category
        </DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  CATEGORY NAME *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. Food & Dining, Fashion"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
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
                  CATEGORY LOGO *
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
                  {catLogo ? catLogo.name : 'Choose Logo Image *'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setCatLogo(e.target.files[0])}
                  />
                </Button>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  INITIAL STATUS *
                </Typography>
                <Select
                  value={catStatus}
                  onChange={(e) => setCatStatus(e.target.value)}
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
                  <MenuItem value="Active">Active (Visible)</MenuItem>
                  <MenuItem value="Inactive">Inactive (Hidden)</MenuItem>
                </Select>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <Button
              onClick={() => {
                setCatName('');
                setCatStatus('Active');
                setCatLogo(null);
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
              Create Category
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG 2: Edit Category */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
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
              bgcolor: 'rgba(139, 92, 246, 0.08)',
              color: '#8B5CF6',
            }}
          >
            <EditIcon sx={{ fontSize: 20 }} />
          </Box>
          Modify Category Details
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            {selectedCategory && (
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
                  MODIFYING CATEGORY
                </Typography>
                <Typography variant="subtitle2" color="#0F172A" fontWeight={750}>
                  ID: {selectedCategory.id}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Originally created: <strong>{selectedCategory.created}</strong>
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  CATEGORY NAME *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. Food & Dining, Fashion"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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
                  CATEGORY LOGO
                </Typography>

                {editLogo ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="caption" color="primary" fontWeight={700} sx={{ fontSize: '0.68rem' }}>
                      NEW LOGO PREVIEW
                    </Typography>
                    <Box
                      component="img"
                      src={URL.createObjectURL(editLogo)}
                      alt="New Preview"
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '12px',
                        objectFit: 'cover',
                        border: '2px dashed #6D28D9',
                        boxShadow: '0 4px 12px rgba(109, 40, 217, 0.1)',
                      }}
                    />
                  </Box>
                ) : (
                  selectedCategory && selectedCategory.logo && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
                        CURRENT LOGO
                      </Typography>
                      <Box
                        component="img"
                        src={getLogoUrl(selectedCategory.logo)}
                        alt={selectedCategory.name}
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '12px',
                          objectFit: 'cover',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                      />
                    </Box>
                  )
                )}

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
                  {editLogo ? editLogo.name : 'Change Logo Image (Optional)'}
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
                  VISIBILITY STATUS *
                </Typography>
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
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
                  <MenuItem value="Active">Active (Visible)</MenuItem>
                  <MenuItem value="Inactive">Inactive (Hidden)</MenuItem>
                </Select>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <Button
              onClick={() => {
                setOpenEditDialog(false);
                setEditLogo(null);
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
              Save Details
            </Button>
          </DialogActions>
        </form>
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
          Delete Category
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            Are you sure you want to delete category <strong>"{selectedCategory?.name}"</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This action cannot be undone. Any products under this category might lose their classification link.
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
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesView;
