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
  Tooltip,
  IconButton,
  Checkbox,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocalOffer as CouponIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Tag as TagIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { couponService } from '../services/couponService';

// Helpers
const OFFER_TYPE_LABELS = {
  1: 'Instant Discount',
  2: 'Cashback',
  3: 'Promo Code',
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
  priority: 1,
  start_date: '',
  end_date: '',
  status: 1,
};

const CouponsView = ({ triggerToast }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Pagination state ──────────────────────────────────────────────────────
  const [page, setPage] = useState(0);               // MUI TablePagination is 0-based
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, totalPages: 1 });

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCoupons = async (pageNum = page, limitNum = rowsPerPage) => {
    setLoading(true);
    try {
      // API is 1-based; MUI TablePagination is 0-based
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
    fetchCoupons(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // ─── Form helpers ──────────────────────────────────────────────────────────
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
    if (!formData.promo_code.trim()) errors.promo_code = 'Promo code is required';
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

  // ─── Submit ────────────────────────────────────────────────────────────────
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

      const response = await couponService.addCoupon(payload);
      if (response && response.success) {
        triggerToast('Coupon created successfully!', 'success');
        resetForm();
        setOpenAddDialog(false);
        setPage(0);           // go back to page 1 after adding
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

  // ─── Toggle Status ─────────────────────────────────────────────────────────
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

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await couponService.deleteCoupon(deleteTarget.id);
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      triggerToast(`Coupon "${deleteTarget.offer_name}" deleted`, 'success');
      setDeleteTarget(null);
      // If we deleted the last item on a non-first page, go back one page
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

  // ─── Copy promo code ───────────────────────────────────────────────────────
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      triggerToast(`Copied "${code}" to clipboard`, 'success');
    });
  };

  // ─── Stats — use API total for all coupons, local page slice for active/inactive
  const totalCoupons = paginationMeta.total;
  const activeCoupons = coupons.filter((c) => c.status === 1).length;
  const inactiveCoupons = coupons.filter((c) => c.status === 0).length;

  // ─── Filters ───────────────────────────────────────────────────────────────
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

  // ─── Shared field label style ──────────────────────────────────────────────
  const labelSx = { fontWeight: 700, color: '#1E293B', mb: 0.5, display: 'block' };
  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Offers &amp; Finances
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Coupons
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Coupons &amp; Offers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage discount coupons, promo codes, and limited-time offers for your customers.
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
          Add New Coupon
        </Button>
      </Box>

      {/* ── Stats Cards ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(109, 40, 217, 0.08)', color: '#6D28D9', display: 'flex' }}>
                  <CouponIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Total Coupons
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={850} sx={{ mt: 1 }}>{totalCoupons}</Typography>
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
                  Active Coupons
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={850} color="#10B981" sx={{ mt: 1 }}>{activeCoupons}</Typography>
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
                  Inactive Coupons
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={850} color="#EF4444" sx={{ mt: 1 }}>{inactiveCoupons}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Main Table Card ── */}
      <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', overflow: 'hidden' }}>
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
            size="small"
            placeholder="Search by coupon name or promo code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: '340px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#F1F5F9' },
                '&.Mui-focused': { bgcolor: '#FFFFFF', boxShadow: '0 0 0 2px rgba(109, 40, 217, 0.1)' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" sx={{ fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ width: '180px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              sx={{
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(226, 232, 240, 0.8)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6D28D9' },
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Active">Active Only</MenuItem>
              <MenuItem value="Inactive">Inactive Only</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box align="center" sx={{ py: 8 }}>
              <CircularProgress size={40} sx={{ color: '#6D28D9', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">Loading coupons...</Typography>
            </Box>
          ) : filteredCoupons.length === 0 ? (
            <Box align="center" sx={{ py: 8 }}>
              <CouponIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5, mb: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                No coupons found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Click "Add New Coupon" to create your first promo offer.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pl: 3 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>OFFER</TableCell>
                    <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>PROMO CODE</TableCell>
                    <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>DISCOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>VALIDITY</TableCell>
                    <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>USAGE</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>STATUS</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCoupons.map((coupon) => {
                    const isActive = coupon.status === 1;
                    const isPercent = coupon.value_type === 2;
                    return (
                      <TableRow
                        key={coupon.id}
                        hover
                        sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(109, 40, 217, 0.015) !important' } }}
                      >
                        <TableCell sx={{ pl: 3 }}>
                          <Typography variant="subtitle2" fontWeight={800} color="#64748B">#{coupon.id}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={750} color="#1E293B">
                              {coupon.offer_name}
                            </Typography>
                            <Chip
                              label={OFFER_TYPE_LABELS[coupon.offer_type] || `Type ${coupon.offer_type}`}
                              size="small"
                              sx={{ mt: 0.5, bgcolor: 'rgba(109, 40, 217, 0.08)', color: '#6D28D9', fontWeight: 700, fontSize: '0.68rem', borderRadius: '6px', height: 20 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ bgcolor: '#F1F5F9', border: '1px dashed rgba(100, 116, 139, 0.4)', borderRadius: '8px', px: 1.2, py: 0.4, fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: '#334155', letterSpacing: '0.04em' }}>
                              {coupon.promo_code}
                            </Box>
                            <Tooltip title="Copy code">
                              <IconButton size="small" onClick={() => handleCopyCode(coupon.promo_code)} sx={{ color: '#94A3B8', '&:hover': { color: '#6D28D9' } }}>
                                <CopyIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ color: isPercent ? '#F59E0B' : '#10B981', display: 'flex' }}>
                              {isPercent ? <PercentIcon sx={{ fontSize: 16 }} /> : <MoneyIcon sx={{ fontSize: 16 }} />}
                            </Box>
                            <Typography variant="subtitle2" fontWeight={750} color="#1E293B">
                              {isPercent ? `${coupon.value}%` : `₹${coupon.value}`}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block">Min: ₹{coupon.min_order_amount} </Typography>
                          {coupon.max_discount > 0 && (
                            <Typography variant="caption" color="text.secondary" display="block">Max: ₹{coupon.max_discount}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" display="block">
                            From: <strong>{formatDate(coupon.start_date)} </strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            To: <strong>{formatDate(coupon.end_date)}</strong>
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Limit: <strong>{coupon.total_usage_limit} </strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Per user: <strong>{coupon.per_user_limit} </strong>
                          </Typography>
                          {coupon.unique_users_only === 1 && (
                            <Chip label="Unique" size="small" sx={{ mt: 0.3, fontSize: '0.62rem', height: 16, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', fontWeight: 700, borderRadius: '4px' }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Switch checked={isActive} onChange={() => handleToggleStatus(coupon)} color="primary" size="small" />
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
                        <TableCell align="center">
                          <Tooltip title="Delete coupon">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteTarget(coupon)}
                              sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.06)' } }}
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>

        {/* ── Pagination footer ── */}
        {!loading && paginationMeta.total > 0 && (
          <Box sx={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', bgcolor: '#FAFBFC' }}>
            <TablePagination
              component="div"
              count={paginationMeta.total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Coupons per page:"
              sx={{
                '& .MuiTablePagination-toolbar': { px: 3 },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.78rem',
                  color: '#64748B',
                  fontWeight: 600,
                },
                '& .MuiTablePagination-select': {
                  fontSize: '0.78rem',
                  fontWeight: 700,
                },
              }}
            />
          </Box>
        )}
      </Card>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ADD COUPON DIALOG — Sectioned, easy-to-follow layout             */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={openAddDialog}
        onClose={() => !submitting && (resetForm(), setOpenAddDialog(false))}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        {/* Title */}
        <DialogTitle
          sx={{
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            py: 2.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(109, 40, 217, 0.08)', color: '#6D28D9', display: 'flex' }}>
            <CouponIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>Create New Coupon</Typography>
            <Typography variant="caption" color="text.secondary">
              Fill the form below — fields marked <span style={{ color: '#EF4444' }}>*</span> are required.
            </Typography>
          </Box>
        </DialogTitle>

        <form onSubmit={handleAddSubmit}>
          <DialogContent sx={{ p: 0, maxHeight: '70vh', overflowY: 'auto' }}>

            {/* ── SECTION 1: Basic Info ─────────────────────────────────── */}
            <Box sx={{ px: 3, pt: 3, pb: 3, borderBottom: '1px solid rgba(226,232,240,0.6)' }}>
              {/* Section header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(109,40,217,0.1)', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                  1
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">Basic Information</Typography>
                  <Typography variant="caption" color="text.secondary">Name your offer and choose how it will be categorised</Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                {/* Offer Name */}
                <Grid item xs={12} sm={8}>
                  <Typography variant="body2" sx={labelSx}>
                    Offer Name <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth size="small"
                    placeholder="e.g. Summer Sale — 10% Off Everything"
                    value={formData.offer_name}
                    onChange={handleFormChange('offer_name')}
                    error={!!formErrors.offer_name}
                    helperText={formErrors.offer_name || 'A friendly name that describes this offer'}
                    sx={inputSx}
                  />
                </Grid>

                {/* Offer Type */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={labelSx}>
                    Offer Type <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select value={formData.offer_type} onChange={handleFormChange('offer_type')} sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}>
                      <MenuItem value={1}>⚡ Instant Discount</MenuItem>
                      <MenuItem value={2}>🎁 Cashback</MenuItem>
                      <MenuItem value={3}>🏷️ Promo Code</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    How this offer is categorised
                  </Typography>
                </Grid>

                {/* Promo Code */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={labelSx}>
                    Promo Code <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth size="small"
                    placeholder="e.g. SAVE100"
                    value={formData.promo_code}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, promo_code: e.target.value.toUpperCase() }));
                      if (formErrors.promo_code) setFormErrors((p) => ({ ...p, promo_code: '' }));
                    }}
                    error={!!formErrors.promo_code}
                    helperText={formErrors.promo_code || 'The code customers enter at checkout (auto-uppercased)'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><TagIcon sx={{ fontSize: 16, color: '#94A3B8' }} /></InputAdornment>,
                      sx: { fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.06em' },
                    }}
                    sx={inputSx}
                  />
                </Grid>


              </Grid>
            </Box>

            {/* ── SECTION 2: Discount Settings ──────────────────────────── */}
            <Box sx={{ px: 3, pt: 3, pb: 3, borderBottom: '1px solid rgba(226,232,240,0.6)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(245,158,11,0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                  2
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">Discount Settings</Typography>
                  <Typography variant="caption" color="text.secondary">Choose whether the discount is a flat amount or a percentage</Typography>
                </Box>
              </Box>

              {/* Discount Type — compact radio pills */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Typography variant="body2" fontWeight={700} color="#1E293B" sx={{ whiteSpace: 'nowrap' }}>
                  Discount Type <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[
                    { v: 1, label: '₹ Fixed' },
                    { v: 2, label: '% Percentage' },
                  ].map(({ v, label }) => (
                    <Box
                      key={v}
                      onClick={() => setFormData((p) => ({ ...p, value_type: v }))}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8,
                        px: 1.5,
                        py: 0.6,
                        borderRadius: '20px',
                        border: '1.5px solid',
                        borderColor: formData.value_type === v ? '#6D28D9' : 'rgba(226,232,240,0.9)',
                        bgcolor: formData.value_type === v ? 'rgba(109,40,217,0.07)' : '#F8FAFC',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: '#A78BFA', bgcolor: 'rgba(109,40,217,0.04)' },
                      }}
                    >
                      {/* Radio dot */}
                      <Box sx={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: '2px solid',
                        borderColor: formData.value_type === v ? '#6D28D9' : '#CBD5E1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {formData.value_type === v && (
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6D28D9' }} />
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={formData.value_type === v ? 700 : 500} color={formData.value_type === v ? '#6D28D9' : '#475569'} sx={{ fontSize: '0.82rem' }}>
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                {/* Value */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={labelSx}>
                    Discount Value <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth size="small" type="number"
                    placeholder={formData.value_type === 2 ? '10' : '50'}
                    value={formData.value}
                    onChange={handleFormChange('value')}
                    error={!!formErrors.value}
                    helperText={formErrors.value || (formData.value_type === 2 ? 'Enter a number like 10 for 10% off' : 'Enter the rupee amount, e.g. 50')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography fontWeight={800} color="#6D28D9">{formData.value_type === 2 ? '%' : '₹'}</Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Grid>

                {/* Min Order Amount */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={labelSx}>
                    Minimum Cart Amount <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth size="small" type="number"
                    placeholder="100"
                    value={formData.min_order_amount}
                    onChange={handleFormChange('min_order_amount')}
                    error={!!formErrors.min_order_amount}
                    helperText={formErrors.min_order_amount || 'The cart must be at least this much to apply the coupon'}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                    sx={inputSx}
                  />
                </Grid>

                {/* Max Discount */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={labelSx}>Max Discount Cap</Typography>
                  <TextField
                    fullWidth size="small" type="number"
                    placeholder="500"
                    value={formData.max_discount}
                    onChange={handleFormChange('max_discount')}
                    helperText="Maximum ₹ a customer can save. Set 0 for no cap (useful for % discounts)"
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ── SECTION 3: Usage Rules ────────────────────────────────── */}
            <Box sx={{ px: 3, pt: 3, pb: 3, borderBottom: '1px solid rgba(226,232,240,0.6)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                  3
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">Usage Rules</Typography>
                  <Typography variant="caption" color="text.secondary">Control how many times this coupon can be redeemed</Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5} alignItems="flex-start">
                {/* Total Usage Limit */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={labelSx}>
                    Total Usage Limit <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth size="small" type="number"
                    placeholder="100"
                    value={formData.total_usage_limit}
                    onChange={handleFormChange('total_usage_limit')}
                    error={!!formErrors.total_usage_limit}
                    helperText={formErrors.total_usage_limit || 'Max number of times anyone can redeem this coupon in total'}
                    sx={inputSx}
                  />
                </Grid>

                {/* Per User Limit */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={labelSx}>Per User Limit</Typography>
                  <TextField
                    fullWidth size="small" type="number"
                    placeholder="1"
                    value={formData.per_user_limit}
                    onChange={handleFormChange('per_user_limit')}
                    helperText="How many times a single customer can use this coupon"
                    sx={inputSx}
                  />
                </Grid>

                {/* Unique Users Only — clickable card */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ ...labelSx, mb: 1 }}>Restriction</Typography>
                  <Box
                    onClick={() => setFormData((p) => ({ ...p, unique_users_only: p.unique_users_only === 1 ? 0 : 1 }))}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.2,
                      p: 1.5,
                      borderRadius: '10px',
                      border: '2px solid',
                      borderColor: formData.unique_users_only === 1 ? '#6D28D9' : 'rgba(226,232,240,0.8)',
                      bgcolor: formData.unique_users_only === 1 ? 'rgba(109,40,217,0.05)' : '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      '&:hover': { borderColor: '#A78BFA' },
                    }}
                  >
                    <Checkbox
                      checked={formData.unique_users_only === 1}
                      color="primary"
                      size="small"
                      sx={{ p: 0, mt: 0.1 }}
                      onChange={() => {}}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={700} color={formData.unique_users_only === 1 ? '#6D28D9' : '#334155'}>
                        New Users Only
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Only customers who haven't used this coupon before
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* ── SECTION 4: Validity & Status ──────────────────────────── */}
            <Box sx={{ px: 3, pt: 3, pb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                  4
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">Validity &amp; Status</Typography>
                  <Typography variant="caption" color="text.secondary">Set when the coupon is active and whether to publish it now</Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                {/* Start Date */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={labelSx}>
                    Start Date &amp; Time <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth size="small" type="datetime-local"
                    value={formData.start_date}
                    onChange={handleFormChange('start_date')}
                    error={!!formErrors.start_date}
                    helperText={formErrors.start_date || 'When the coupon becomes active for customers'}
                    InputLabelProps={{ shrink: true }}
                    sx={inputSx}
                  />
                </Grid>

                {/* End Date */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={labelSx}>
                    End Date &amp; Time <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth size="small" type="datetime-local"
                    value={formData.end_date}
                    onChange={handleFormChange('end_date')}
                    error={!!formErrors.end_date}
                    helperText={formErrors.end_date || 'Coupon automatically stops working after this date'}
                    InputLabelProps={{ shrink: true }}
                    sx={inputSx}
                  />
                </Grid>

                {/* Status toggle */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: formData.status === 1 ? 'rgba(16,185,129,0.3)' : 'rgba(226,232,240,0.8)',
                      bgcolor: formData.status === 1 ? 'rgba(16,185,129,0.04)' : '#F8FAFC',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Switch
                      checked={formData.status === 1}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked ? 1 : 0 }))}
                      color="primary"
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={700} color={formData.status === 1 ? '#10B981' : '#64748B'}>
                        {formData.status === 1 ? '✅ Active — Publish now' : '⏸️ Inactive — Save as draft'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.status === 1
                          ? 'Customers can use this coupon immediately after saving'
                          : 'Coupon is saved but hidden — you can activate it later'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, borderTop: '1px solid rgba(226,232,240,0.8)', gap: 1 }}>
            <Button
              onClick={() => { resetForm(); setOpenAddDialog(false); }}
              color="inherit"
              disabled={submitting}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', px: 2.5 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
              sx={{ textTransform: 'none', fontWeight: 650, px: 3.5, borderRadius: '12px', boxShadow: '0 4px 14px rgba(109,40,217,0.25)' }}
            >
              {submitting ? 'Creating Coupon...' : 'Create Coupon'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRM DIALOG                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Delete Coupon?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete <strong>"{deleteTarget?.offer_name}"</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            color="inherit"
            disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon />}
            sx={{ textTransform: 'none', fontWeight: 650, px: 3, borderRadius: '10px', bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }, boxShadow: 'none' }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CouponsView;
