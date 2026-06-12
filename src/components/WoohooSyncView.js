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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Search as SearchIcon,
  CardGiftcard as GiftCardIcon,
  ChevronRight as ChevronRightIcon,
  Wifi as WifiIcon,
  SettingsInputHdmi as SyncPortIcon,
} from '@mui/icons-material';
import { storeService } from '../services/storeService';

const WoohooSyncView = ({ systemStatus, onSyncWoohoo, triggerToast }) => {
  const [syncedProducts, setSyncedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Sync Dialog state
  const [openSyncDialog, setOpenSyncDialog] = useState(false);
  const [skuInput, setSkuInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

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

      // Step 1: Attempt to call product API with current token if it exists
      if (token) {
        try {
          productData = await storeService.getWoohooProductBySku(sku, token);
          success = true;
        } catch (err) {
          const isTokenRejected = err.status === 401 || 
                                  (err.data && err.data.message && err.data.message.includes('token_rejected')) ||
                                  (err.message && err.message.includes('token_rejected'));
          
          if (!isTokenRejected) {
            throw err; // Re-throw other errors (e.g. invalid SKU)
          }
          console.warn('Woohoo bearer token rejected/expired. Regenerating...');
        }
      }

      // Step 2: Regenerate token if previous call failed or no token was stored
      if (!success) {
        // Generate code
        const codeRes = await storeService.generateWoohooCode();
        if (!codeRes || !codeRes.success || !codeRes.result?.authorizationCode) {
          throw new Error(codeRes?.message || 'Failed to generate authorization code');
        }
        const authCode = codeRes.result.authorizationCode;

        // Exchange code for token
        const tokenRes = await storeService.generateWoohooToken(authCode);
        if (!tokenRes || !tokenRes.success || !tokenRes.result?.token) {
          throw new Error(tokenRes?.message || 'Failed to exchange token');
        }
        const newToken = tokenRes.result.token;
        localStorage.setItem('woohoo_bearer_token', newToken);

        // Retry product call
        productData = await storeService.getWoohooProductBySku(sku, newToken);
      }

      triggerToast(`Product "${productData?.result?.name || sku}" synced successfully!`, 'success');
      onSyncWoohoo(); // Update lastSync time in parent App.js state
      
      // Reset inputs & close dialog
      setSkuInput('');
      setOpenSyncDialog(false);
      
      // Reload list of synced products
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

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header section */}
      <Box sx={{ mb: 4 }} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Integrations
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Woohoo Api Bridge
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Woohoo Integration Sync
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sync digital products from Woohoo by SKU and configure cashback store catalogs in the database.
          </Typography>
        </Box>
      </Box>

      {/* Sync Telemetry Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(109, 40, 217, 0.08)', color: '#6D28D9', display: 'flex' }}>
                  <GiftCardIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Synced Products
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                {syncedProducts.length} Listings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex' }}>
                  <WifiIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Woohoo API Status
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={800} color="#10B981" sx={{ mt: 1 }}>
                ONLINE
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(13, 148, 136, 0.08)', color: '#0D9488', display: 'flex' }}>
                  <SyncPortIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Environment
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={800} color="#0D9488" sx={{ mt: 1 }}>
                SANDBOX / BETA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Synced Products Directory Section */}
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
            placeholder="Search synced gift cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" sx={{ fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<SyncIcon />}
            onClick={() => setOpenSyncDialog(true)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 650,
              px: 3,
              py: 1.2,
              boxShadow: '0 4px 14px rgba(109, 40, 217, 0.25)',
            }}
          >
            Sync New Gift Card from Woohoo
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pl: 3 }}>GIFT CARD NAME</TableCell>
                <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>SKU CODE</TableCell>
                <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingProducts ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={30} sx={{ color: '#6D28D9', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Loading synced catalogs...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      <GiftCardIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        No synced gift card products found.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, idx) => (
                  <TableRow
                    key={product.sku || idx}
                    hover
                    sx={{
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(109, 40, 217, 0.015) !important',
                      },
                    }}
                  >
                    <TableCell sx={{ pl: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                          }}
                        >
                          <GiftCardIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={750} color="#1E293B">
                          {product.name || 'Digital Gift Card'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.sku}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(109, 40, 217, 0.08)',
                          color: '#6D28D9',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: '6px',
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
                          bgcolor: 'rgba(16, 185, 129, 0.08)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.15)',
                        }}
                      >
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981' }} />
                        Synced
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Sync New Gift Card Dialog */}
      <Dialog
        open={openSyncDialog}
        onClose={() => !isSyncing && setOpenSyncDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1.5,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
          Sync New Gift Card
        </DialogTitle>
        <form onSubmit={handleSyncSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Input a gift card SKU identifier from Woohoo to synchronize the product catalog parameters in the database.
            </Typography>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                GIFT CARD SKU *
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                disabled={isSyncing}
                placeholder="e.g. GCGBFTV001"
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              onClick={() => setOpenSyncDialog(false)}
              disabled={isSyncing}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: '#64748B',
                borderRadius: '10px',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSyncing}
              startIcon={isSyncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 650,
                px: 3,
                boxShadow: '0 4px 10px rgba(109, 40, 217, 0.2)',
              }}
            >
              {isSyncing ? 'Syncing...' : 'Sync & Map'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default WoohooSyncView;
