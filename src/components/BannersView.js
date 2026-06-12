import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ViewCarousel as CarouselIcon,
  CloudUpload as UploadIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { bannerService } from '../services/bannerService';

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
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Marketing
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Banners Section
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Promo Banners
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage main carousel advertisements and promotional banners displayed in the customer application.
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
          Add Banner
        </Button>
      </Box>

      {/* Telemetry Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(109, 40, 217, 0.08)', color: '#6D28D9', display: 'flex' }}>
                  <CarouselIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Total Banners
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={850} sx={{ mt: 1 }}>
                {totalBanners}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex' }}>
                  <ActiveIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Active Banners
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={850} color="#10B981" sx={{ mt: 1 }}>
                {activeBanners}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', display: 'flex' }}>
                  <InactiveIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Inactive Banners
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={850} color="#EF4444" sx={{ mt: 1 }}>
                {inactiveBanners}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main card with Banner list */}
      <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', overflow: 'hidden' }}>
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
            placeholder="Search by banner title or name..."
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
          </Box>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box align="center" sx={{ py: 8 }}>
              <CircularProgress size={40} sx={{ color: '#6D28D9', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading promo banners...
              </Typography>
            </Box>
          ) : filteredBanners.length === 0 ? (
            <Box align="center" sx={{ py: 8 }}>
              <CarouselIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5, mb: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                No banners found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Click "Add Banner" to upload your first advertisement.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pl: 3 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>PREVIEW</TableCell>
                    <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>BANNER DETAILS</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBanners.map((banner) => {
                    const isActive = banner.status === 1;
                    return (
                      <TableRow
                        key={banner.id}
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
                            {banner.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              width: 96,
                              height: 54,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              bgcolor: banner.background_color || '#ECE9FC',
                              border: '1px solid rgba(226, 232, 240, 0.8)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Box
                              component="img"
                              src={getBannerImageUrl(banner.banner_image)}
                              alt={banner.banner_name || 'Promo Banner'}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600';
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={750} color="#1E293B">
                              {banner.banner_name || 'Promo Banner'}
                            </Typography>
                            {banner.title && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {banner.title}
                              </Typography>
                            )}
                            {banner.subtitle && (
                              <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.2 }}>
                                {banner.subtitle}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Switch
                              checked={isActive}
                              onChange={() => handleToggleStatus(banner.id)}
                              color="primary"
                              size="small"
                            />
                            <Chip
                              label={isActive ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{
                                bgcolor: isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                color: isActive ? '#10B981' : '#EF4444',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                border: isActive ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(239,68,68,0.15)',
                              }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Banner Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => !submitting && setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(226, 232, 240, 0.8)', py: 2.5, px: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(109, 40, 217, 0.08)', color: '#6D28D9', display: 'flex' }}>
            <CarouselIcon sx={{ fontSize: 20 }} />
          </Box>
          Create Promo Banner
        </DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                BANNER IMAGE *
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadIcon />}
                sx={{
                  borderRadius: '12px',
                  py: 3,
                  textTransform: 'none',
                  borderColor: 'rgba(226, 232, 240, 0.8)',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#6D28D9',
                    backgroundColor: 'rgba(109, 40, 217, 0.02)',
                  },
                }}
              >
                {formData.banner_image ? formData.banner_image.name : 'Select or Upload Banner Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              {imagePreview && (
                <Box sx={{ mt: 2.5, border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '12px', overflow: 'hidden', p: 1, bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    Image Preview:
                  </Typography>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      maxHeight: '180px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                    }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <Button
              onClick={() => {
                resetForm();
                setOpenAddDialog(false);
              }}
              color="inherit"
              disabled={submitting}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 650,
                px: 3,
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(109, 40, 217, 0.25)',
              }}
            >
              {submitting ? 'Creating...' : 'Create Banner'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default BannersView;
