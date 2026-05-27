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
  Chip,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ToggleOn as LiveIcon,
  ToggleOff as PausedIcon,
  ChevronRight as ChevronRightIcon,
  Store as StoreIcon,
  Storefront as StorefrontIcon,
  Link as LinkIcon,
  TrendingUp as RateIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';

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

const StoresView = ({ stores, onAddStore, onToggleStoreStatus, triggerToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [cashbackPct, setCashbackPct] = useState('');
  const [storeStatus, setStoreStatus] = useState('Live');

  // Edit dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [editCashback, setEditCashback] = useState('');

  // Dynamically calculate affiliate metrics
  const totalPartners = stores.length;
  const liveCount = stores.filter((s) => s.status === 'Live').length;
  const pausedCount = stores.filter((s) => s.status === 'Paused').length;
  
  const avgCommission = totalPartners > 0
    ? (stores.reduce((sum, s) => {
        const val = parseFloat(s.cashback.replace('%', '')) || 0;
        return sum + val;
      }, 0) / totalPartners).toFixed(1)
    : '0.0';

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!storeName || !cashbackPct) {
      triggerToast('Please input store details', 'warning');
      return;
    }
    onAddStore({
      name: storeName,
      cashback: `${parseFloat(cashbackPct).toFixed(1)}%`,
      status: storeStatus,
    });
    setStoreName('');
    setCashbackPct('');
    setStoreStatus('Live');
    setOpenAddDialog(false);
  };

  const handleOpenEdit = (store) => {
    setSelectedStore(store);
    setEditCashback(store.cashback.replace('%', ''));
    setOpenEditDialog(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editCashback || isNaN(editCashback) || parseFloat(editCashback) < 0) {
      triggerToast('Please input a valid percentage rate', 'warning');
      return;
    }
    // Update store cashback in state
    stores.forEach((s) => {
      if (s.id === selectedStore.id) {
        s.cashback = `${parseFloat(editCashback).toFixed(1)}%`;
      }
    });
    triggerToast(`Cashback rate for ${selectedStore.name} updated to ${parseFloat(editCashback).toFixed(1)}%`, 'success');
    setOpenEditDialog(false);
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header with breadcrumbs */}
      <Box sx={{ mb: 4 }} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Affiliation
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Merchant Registry
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Partner Stores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage partner merchant links, adjust commission rates, and track system status.
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
          Add Partner Store
        </Button>
      </Box>

      {/* Dynamic Telemetry row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Total Partners
                </Typography>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(109, 40, 217, 0.08)', color: '#6D28D9', display: 'flex' }}>
                  <StorefrontIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={850} sx={{ mb: 0.5 }}>
                {totalPartners} Brands
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registered affiliates
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Live Links
                </Typography>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex' }}>
                  <LinkIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={850} color="#10B981" sx={{ mb: 0.5 }}>
                {liveCount} Active
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generating sales traffic
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Paused Links
                </Typography>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', display: 'flex' }}>
                  <LinkOffIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={850} color="#EF4444" sx={{ mb: 0.5 }}>
                {pausedCount} Paused
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Affiliation suspended
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Avg Cashback Payout
                </Typography>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(13, 148, 136, 0.08)', color: '#0D9488', display: 'flex' }}>
                  <RateIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={850} color="#0D9488" sx={{ mb: 0.5 }}>
                {avgCommission}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Platform-wide average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main card stores directory */}
      <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Search Row */}
          <Box
            display="flex"
            gap={2}
            sx={{
              p: 3,
              borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: '#FFFFFF',
            }}
          >
            <TextField
              sx={{
                flexGrow: 1,
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
              placeholder="Search partner store by brand name..."
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
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>STORE NAME</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>CASHBACK COMMISSION</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>AFFILIATE STATUS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pr: 3 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                        <StorefrontIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          No partner merchants found.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStores.map((store) => {
                    const isLive = store.status === 'Live';
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
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
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
                            <Typography variant="subtitle2" fontWeight={750} color="#1E293B">
                              {store.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={800} color="#6D28D9">
                            {store.cashback} Commission Payout
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
                              bgcolor: isLive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                              color: isLive ? '#10B981' : '#F59E0B',
                              border: isLive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(245, 158, 11, 0.15)',
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: isLive ? '#10B981' : '#F59E0B',
                              }}
                            />
                            {store.status}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3 }}>
                          <Box display="flex" justifyContent="flex-end" gap={1}>
                            <Tooltip title={isLive ? 'Pause Affiliate Commission' : 'Resume Affiliate Commission'}>
                              <IconButton
                                size="small"
                                sx={{
                                  color: isLive ? '#F59E0B' : '#10B981',
                                  bgcolor: isLive ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                                  '&:hover': {
                                    bgcolor: isLive ? '#F59E0B' : '#10B981',
                                    color: '#FFFFFF',
                                  },
                                  width: 32,
                                  height: 32,
                                  transition: 'all 0.2s',
                                }}
                                onClick={() => onToggleStoreStatus(store.id)}
                              >
                                {isLive ? <PausedIcon sx={{ fontSize: 16 }} /> : <LiveIcon sx={{ fontSize: 16 }} />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Configure Commission %">
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

      {/* POPUP 1: Add Store */}
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
          Register Partner Merchant
        </DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Store Name"
                  placeholder="e.g. Starbucks, Zomato"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  variant="outlined"
                  size="small"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cashback Offer (%)"
                  placeholder="e.g. 5.5"
                  type="number"
                  inputProps={{ step: '0.1', min: '0', max: '100' }}
                  value={cashbackPct}
                  onChange={(e) => setCashbackPct(e.target.value)}
                  variant="outlined"
                  size="small"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              
              {/* Presets for cashback percentage */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                  POPULAR COMMISSION PRESETS
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {[2.5, 4.0, 5.0, 6.5, 8.0, 10.0].map((preset) => (
                    <Chip
                      key={preset}
                      label={`${preset}%`}
                      onClick={() => setCashbackPct(preset.toString())}
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        bgcolor: cashbackPct === preset.toString() ? 'rgba(109, 40, 217, 0.08)' : '#FFFFFF',
                        color: cashbackPct === preset.toString() ? '#6D28D9' : '#475569',
                        borderColor: cashbackPct === preset.toString() ? '#6D28D9' : 'rgba(226, 232, 240, 0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(109, 40, 217, 0.04)',
                          borderColor: '#6D28D9',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                  <InputLabel id="new-store-status-label">Affiliate Status</InputLabel>
                  <Select
                    labelId="new-store-status-label"
                    value={storeStatus}
                    label="Affiliate Status"
                    onChange={(e) => setStoreStatus(e.target.value)}
                  >
                    <MenuItem value="Live">Live (Affiliation Active)</MenuItem>
                    <MenuItem value="Paused">Paused (Affiliation Suspended)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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

      {/* POPUP 2: Edit Store commission */}
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
          Configure Store Commission
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ p: 3, pt: 3 }}>
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
                  PARTNER MERCHANT
                </Typography>
                <Typography variant="subtitle2" color="#0F172A" fontWeight={750}>
                  {selectedStore.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Current Rate: <strong>{selectedStore.cashback}</strong>
                </Typography>
              </Box>
            )}

            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cashback Percentage Rate"
                  placeholder="e.g. 6.5"
                  type="number"
                  inputProps={{ step: '0.1', min: '0', max: '100' }}
                  value={editCashback}
                  onChange={(e) => setEditCashback(e.target.value)}
                  variant="outlined"
                  size="small"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                  POPULAR COMMISSION PRESETS
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {[2.5, 4.0, 5.0, 6.5, 8.0, 10.0].map((preset) => (
                    <Chip
                      key={preset}
                      label={`${preset}%`}
                      onClick={() => setEditCashback(preset.toString())}
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        bgcolor: editCashback === preset.toString() ? 'rgba(109, 40, 217, 0.08)' : '#FFFFFF',
                        color: editCashback === preset.toString() ? '#6D28D9' : '#475569',
                        borderColor: editCashback === preset.toString() ? '#6D28D9' : 'rgba(226, 232, 240, 0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(109, 40, 217, 0.04)',
                          borderColor: '#6D28D9',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
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
              color="primary"
              sx={{
                textTransform: 'none',
                fontWeight: 650,
                borderRadius: '10px',
                px: 2.5,
              }}
            >
              Save Rates
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default StoresView;
