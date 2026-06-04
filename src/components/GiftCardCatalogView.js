import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  LocalOffer as TagIcon,
  Inventory as StockIcon,
  Palette as PaletteIcon,
  ChevronRight as ChevronRightIcon,
  ShoppingBag as BuyIcon,
  Paid as SellIcon,
} from '@mui/icons-material';

const initialCards = [
  { id: 1, brand: 'Amazon', category: 'Shopping', allowBuy: true, allowSell: true, buyDiscount: '3.5%', sellPayout: '90.0%', status: 'Active', stock: 120, bg: 'linear-gradient(135deg, #232f3e 0%, #146eb4 100%)' },
  { id: 2, brand: 'Flipkart', category: 'Shopping', allowBuy: true, allowSell: true, buyDiscount: '4.0%', sellPayout: '91.0%', status: 'Active', stock: 85, bg: 'linear-gradient(135deg, #2874f0 0%, #004ba0 100%)' },
  { id: 3, brand: 'Myntra', category: 'Lifestyle', allowBuy: true, allowSell: true, buyDiscount: '6.5%', sellPayout: '88.0%', status: 'Active', stock: 64, bg: 'linear-gradient(135deg, #fe3f6c 0%, #e7184a 100%)' },
  { id: 4, brand: 'Swiggy', category: 'Food', allowBuy: true, allowSell: true, buyDiscount: '5.0%', sellPayout: '89.5%', status: 'Active', stock: 110, bg: 'linear-gradient(135deg, #fc8019 0%, #d45e0c 100%)' },
  { id: 5, brand: 'Zomato', category: 'Food', allowBuy: true, allowSell: true, buyDiscount: '5.5%', sellPayout: '89.0%', status: 'Active', stock: 95, bg: 'linear-gradient(135deg, #cb202d 0%, #9a101b 100%)' },
  { id: 6, brand: 'Nykaa', category: 'Beauty', allowBuy: true, allowSell: true, buyDiscount: '4.5%', sellPayout: '87.5%', status: 'Active', stock: 42, bg: 'linear-gradient(135deg, #fc2779 0%, #c40a50 100%)' },
  { id: 7, brand: 'Google Play', category: 'Entertainment', allowBuy: true, allowSell: false, buyDiscount: '2.5%', sellPayout: 'N/A', status: 'Active', stock: 200, bg: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)' },
  { id: 8, brand: 'Ajio', category: 'Lifestyle', allowBuy: true, allowSell: true, buyDiscount: '7.0%', sellPayout: '86.0%', status: 'Disabled', stock: 0, bg: 'linear-gradient(135deg, #2d3e50 0%, #1e293b 100%)' },
];

const GiftCardCatalogView = ({ triggerToast }) => {
  const [catalog, setCatalog] = useState(initialCards);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [activeTab, setActiveTab] = useState(0); // 0 = Buy Catalog, 1 = Sell Catalog

  // Dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newCat, setNewCat] = useState('Shopping');
  
  // Dual configurations state
  const [allowBuy, setAllowBuy] = useState(true);
  const [allowSell, setAllowSell] = useState(true);
  const [newDisc, setNewDisc] = useState('5.0');
  const [newStock, setNewStock] = useState('100');
  const [newSellPayout, setNewSellPayout] = useState('90.0');
  
  // Custom design style
  const [newColor1, setNewColor1] = useState('#6D28D9');
  const [newColor2, setNewColor2] = useState('#8B5CF6');
  
  // Mini Dialog Visual Preview Tab (0 = Buy layout preview, 1 = Sell layout preview)
  const [previewTab, setPreviewTab] = useState(0);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newBrand) {
      triggerToast('Please specify the brand name', 'warning');
      return;
    }
    if (allowBuy && (!newDisc || !newStock)) {
      triggerToast('Please fill all purchase (buy) options', 'warning');
      return;
    }
    if (allowSell && !newSellPayout) {
      triggerToast('Please fill the resell (sell) payout rate', 'warning');
      return;
    }
    if (!allowBuy && !allowSell) {
      triggerToast('A product listing must support at least Purchase or Resell operations!', 'error');
      return;
    }

    const cardBg = `linear-gradient(135deg, ${newColor1} 0%, ${newColor2} 100%)`;
    const newCard = {
      id: catalog.length + 1,
      brand: newBrand,
      category: newCat,
      allowBuy: allowBuy,
      allowSell: allowSell,
      buyDiscount: allowBuy ? `${parseFloat(newDisc).toFixed(1)}%` : 'N/A',
      sellPayout: allowSell ? `${parseFloat(newSellPayout).toFixed(1)}%` : 'N/A',
      status: 'Active',
      stock: allowBuy ? parseInt(newStock) : 0,
      bg: cardBg,
    };

    setCatalog([newCard, ...catalog]);
    triggerToast(`"${newBrand}" successfully registered into the catalog!`, 'success');
    
    // Reset fields
    setNewBrand('');
    setNewDisc('5.0');
    setNewStock('100');
    setNewSellPayout('90.0');
    setAllowBuy(true);
    setAllowSell(true);
    setOpenAddDialog(false);
  };

  const handleToggleStatus = (id) => {
    setCatalog(
      catalog.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'Active' ? 'Disabled' : 'Active';
          triggerToast(`"${c.brand}" status updated to ${nextStatus}`, 'info');
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const filteredCatalog = catalog.filter((card) => {
    const matchesSearch = card.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === 'All' || card.category === filterCat;
    const matchesTab = activeTab === 0 ? card.allowBuy : card.allowSell;
    return matchesSearch && matchesCat && matchesTab;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header section with breadcrumbs */}
      <Box sx={{ mb: 4 }} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Inventory
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gift Card Products
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Gift Card Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage purchase discount structures, resell payout percentages, and physical card parameters.
          </Typography>
        </Box>
      </Box>

      {/* Main Mode Switcher Tab Bar */}
      <Box sx={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)', mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newVal) => setActiveTab(newVal)}
          sx={{
            '& .MuiTabs-indicator': {
              height: '3px',
              borderRadius: '3px 3px 0 0',
              bgcolor: '#6D28D9',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 750,
              fontSize: '0.88rem',
              color: '#64748B',
              px: 3,
              pb: 1.8,
              '&.Mui-selected': {
                color: '#6D28D9',
              },
            },
          }}
        >
          <Tab label="Buy Gift Cards (Purchase Catalog)" icon={<BuyIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Sell Gift Cards (Resell Rates)" icon={<SellIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Unified Search & Actions Control Bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
        sx={{
          mb: 3,
          bgcolor: '#FFFFFF',
          p: 2,
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box display="flex" gap={2} flexWrap="wrap" sx={{ flexGrow: 1, maxWidth: { xs: '100%', md: '75%' } }}>
          <TextField
            sx={{
              flexGrow: 1,
              minWidth: 280,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#F1F5F9',
                  borderColor: 'rgba(109, 40, 217, 0.3)',
                },
                '&.Mui-focused': {
                  bgcolor: '#FFFFFF',
                  borderColor: '#6D28D9',
                  boxShadow: '0 0 0 2px rgba(109, 40, 217, 0.1)',
                },
              },
            }}
            size="small"
            placeholder="Filter catalog by brand name..."
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

          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#F1F5F9',
                  borderColor: 'rgba(109, 40, 217, 0.3)',
                },
                '&.Mui-focused': {
                  bgcolor: '#FFFFFF',
                  borderColor: '#6D28D9',
                },
              },
            }}
          >
            <InputLabel id="category-filter-label">Filter Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={filterCat}
              label="Filter Category"
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <MenuItem value="All">All Categories</MenuItem>
              <MenuItem value="Shopping">Shopping</MenuItem>
              <MenuItem value="Lifestyle">Lifestyle</MenuItem>
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Beauty">Beauty</MenuItem>
              <MenuItem value="Entertainment">Entertainment</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setPreviewTab(activeTab); // Sync preview mode initially with active view mode
            setOpenAddDialog(true);
          }}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 650,
            px: 3,
            py: 1,
            height: '40px',
            bgcolor: '#6D28D9',
            boxShadow: '0 4px 14px rgba(109, 40, 217, 0.25)',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: '#5B21B6',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(109, 40, 217, 0.35)',
            },
          }}
        >
          Create Digital Listing
        </Button>
      </Box>

      {/* Catalog Grid */}
      <Grid container spacing={3}>
        {filteredCatalog.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ textAlign: 'center', py: 8, border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
              <Typography variant="body1" color="text.secondary">
                No gift cards match your filter criteria.
              </Typography>
            </Card>
          </Grid>
        ) : (
          filteredCatalog.map((card) => {
            const isLive = card.status === 'Active';
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '16px',
                    opacity: isLive ? 1 : 0.75,
                    bgcolor: '#FFFFFF',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px -10px rgba(109, 40, 217, 0.15)',
                      borderColor: 'rgba(109, 40, 217, 0.25)',
                    },
                  }}
                >
                  {/* Card Visual Graphic */}
                  <Box
                    sx={{
                      background: card.bg,
                      height: 150,
                      m: 2,
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 2.5,
                      color: '#FFFFFF',
                      position: 'relative',
                      boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.2)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        borderRadius: 'inherit',
                        background: 'linear-gradient(225deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.15em', opacity: 0.85, fontSize: '0.62rem' }}>
                        {activeTab === 0 ? 'SHOP2SAVE BUY CARD' : 'SHOP2SAVE SELL CARD'}
                      </Typography>
                      <Chip
                        label={card.category}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          height: '20px',
                          textTransform: 'uppercase',
                        }}
                      />
                    </Box>
                    <Typography variant="h5" fontWeight={850} sx={{ letterSpacing: '-0.02em', mt: 1, textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                      {card.brand}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                      <Box>
                        {activeTab === 0 ? (
                          <>
                            <Typography variant="caption" sx={{ opacity: 0.65, fontSize: '0.6rem', display: 'block', fontWeight: 600 }}>
                              MAX CASHBACK OFFER
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                              {card.buyDiscount} OFF
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="caption" sx={{ opacity: 0.65, fontSize: '0.6rem', display: 'block', fontWeight: 600 }}>
                              PLATFORM PAYOUT RATE
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                              {card.sellPayout} Payout
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Card Content & Operations Info */}
                  <CardContent sx={{ pt: 1, pb: '20px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {activeTab === 0 ? (
                      /* BUY VIEW SPECIFIC DETAILS */
                      <Box sx={{ mb: 2.5 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <StockIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={550}>
                              Inventory: <strong>{card.stock}</strong> units
                            </Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={750} color={card.stock > 20 ? 'success.main' : card.stock > 0 ? 'warning.main' : 'error.main'}>
                            {card.stock > 20 ? 'In Stock' : card.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (card.stock / 200) * 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#F1F5F9',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: card.stock > 20 ? '#10B981' : '#EF4444',
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      /* SELL VIEW SPECIFIC DETAILS */
                      <Box sx={{ mb: 2.5 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <SellIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={550}>
                              Resell Rate: <strong>{card.sellPayout}</strong>
                            </Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={750} color="#6D28D9">
                            Enabled
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.72rem', display: 'block', lineHeight: 1.3, mt: 0.6 }}>
                          Allows customers to resell their surplus {card.brand} gift cards. Verified claims are paid instantly into the user's wallet with a 10% fee.
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 'auto' }}>
                      <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                      {/* Dynamic Mode Badges & Toggles */}
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: isLive ? '#10B981' : '#EF4444',
                            }}
                          />
                          <Typography variant="caption" fontWeight={750} color={isLive ? 'success.main' : 'text.disabled'} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {isLive ? 'Active (Live)' : 'Disabled'}
                          </Typography>
                        </Box>
                        <Switch
                          size="small"
                          checked={isLive}
                          onChange={() => handleToggleStatus(card.id)}
                          color="primary"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#6D28D9',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              bgcolor: '#6D28D9',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* POPUP: Dual Config Add Listing Creator with Visual Mockups */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pb: 2,
            pt: 3,
            px: 4,
            fontSize: '1.25rem',
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
            <TagIcon sx={{ fontSize: 20 }} />
          </Box>
          Create Multi-Option Gift Card
        </DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {/* Form Input fields */}
              <Grid item xs={12} md={7}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        BRAND NAME *
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="e.g. Myntra, Swiggy"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        CATEGORY *
                      </Typography>
                      <Select
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value)}
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
                        <MenuItem value="Shopping">Shopping</MenuItem>
                        <MenuItem value="Lifestyle">Lifestyle</MenuItem>
                        <MenuItem value="Food">Food</MenuItem>
                        <MenuItem value="Beauty">Beauty</MenuItem>
                        <MenuItem value="Entertainment">Entertainment</MenuItem>
                      </Select>
                    </Box>
                  </Grid>

                  {/* Buy Options Selector Segment */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155' }}>
                        1. Buy Operations Config
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={allowBuy}
                            onChange={(e) => setAllowBuy(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={<Typography variant="caption" fontWeight={700}>Enable Purchase</Typography>}
                      />
                    </Box>
                  </Grid>

                  {allowBuy && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            DISCOUNT RATE (%) *
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="e.g. 5.0"
                            type="number"
                            inputProps={{ step: '0.1', min: '0', max: '100' }}
                            value={newDisc}
                            onChange={(e) => setNewDisc(e.target.value)}
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
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            INITIAL STOCK *
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="e.g. 100"
                            type="number"
                            inputProps={{ min: '0' }}
                            value={newStock}
                            onChange={(e) => setNewStock(e.target.value)}
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
                      </Grid>
                    </>
                  )}

                  {/* Sell Options Selector Segment */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155' }}>
                        2. Sell (Resell) Operations Config
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={allowSell}
                            onChange={(e) => setAllowSell(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={<Typography variant="caption" fontWeight={700}>Accept Resell</Typography>}
                      />
                    </Box>
                  </Grid>

                  {allowSell && (
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          PLATFORM PAYOUT RATE (%) *
                        </Typography>
                        <TextField
                          fullWidth
                          placeholder="e.g. 90.0"
                          type="number"
                          inputProps={{ step: '0.1', min: '0', max: '100' }}
                          value={newSellPayout}
                          onChange={(e) => setNewSellPayout(e.target.value)}
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
                          InputProps={{
                            endAdornment: <InputAdornment position="end">% Payout</InputAdornment>,
                          }}
                        />
                      </Box>
                    </Grid>
                  )}

                  {/* Graphic Gradient Styles */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                      <PaletteIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155' }}>
                        3. Visual Customization
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          GRADIENT COLOR START
                        </Typography>
                        <TextField
                          type="color"
                          value={newColor1}
                          onChange={(e) => setNewColor1(e.target.value)}
                          sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC' },
                            '& input': { height: '36px', p: 0.5, cursor: 'pointer' },
                          }}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          GRADIENT COLOR END
                        </Typography>
                        <TextField
                          type="color"
                          value={newColor2}
                          onChange={(e) => setNewColor2(e.target.value)}
                          sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC' },
                            '& input': { height: '36px', p: 0.5, cursor: 'pointer' },
                          }}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* REAL-TIME PREVIEW CONTAINER */}
              <Grid item xs={12} md={5} display="flex" flexDirection="column" justifyContent="center">
                <Box
                  sx={{
                    p: 2,
                    border: '2px dashed rgba(109, 40, 217, 0.2)',
                    borderRadius: '20px',
                    bgcolor: '#F8FAFC',
                    position: 'relative',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#6D28D9', fontWeight: 800, textTransform: 'uppercase', position: 'absolute', top: -10, left: 20, px: 1, bgcolor: '#FFFFFF', border: '1px solid rgba(109, 40, 217, 0.2)', borderRadius: '6px' }}>
                    Real-time Visual Auditing
                  </Typography>

                  {/* Preview Selector Segment Controls */}
                  <Box display="flex" justifyContent="center" gap={1} sx={{ mt: 1.5, mb: 2 }}>
                    <Button
                      size="small"
                      type="button"
                      variant={previewTab === 0 ? "contained" : "outlined"}
                      onClick={() => setPreviewTab(0)}
                      disabled={!allowBuy}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        py: 0.4,
                        bgcolor: previewTab === 0 ? '#6D28D9' : 'transparent',
                        color: previewTab === 0 ? '#FFFFFF' : '#64748B',
                        borderColor: 'rgba(226, 232, 240, 0.8)',
                      }}
                    >
                      Buy Visual
                    </Button>
                    <Button
                      size="small"
                      type="button"
                      variant={previewTab === 1 ? "contained" : "outlined"}
                      onClick={() => setPreviewTab(1)}
                      disabled={!allowSell}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        py: 0.4,
                        bgcolor: previewTab === 1 ? '#6D28D9' : 'transparent',
                        color: previewTab === 1 ? '#FFFFFF' : '#64748B',
                        borderColor: 'rgba(226, 232, 240, 0.8)',
                      }}
                    >
                      Sell Visual
                    </Button>
                  </Box>

                  {/* Simulated card mockup */}
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${newColor1} 0%, ${newColor2} 100%)`,
                      height: 150,
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 2.5,
                      color: '#FFFFFF',
                      boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.3)',
                      transition: 'all 0.3s',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.15em', opacity: 0.85, fontSize: '0.62rem' }}>
                        {previewTab === 0 ? 'SHOP2SAVE BUY CARD' : 'SHOP2SAVE SELL CARD'}
                      </Typography>
                      <Chip
                        label={newCat}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          height: '20px',
                          textTransform: 'uppercase',
                        }}
                      />
                    </Box>
                    <Typography variant="h5" fontWeight={850} sx={{ letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {newBrand || 'Brand Name'}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                      <Box>
                        {previewTab === 0 ? (
                          <>
                            <Typography variant="caption" sx={{ opacity: 0.65, fontSize: '0.6rem', display: 'block', fontWeight: 600 }}>
                              MAX CASHBACK OFFER
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                              {newDisc ? `${parseFloat(newDisc).toFixed(1)}%` : '0.0%'} OFF
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="caption" sx={{ opacity: 0.65, fontSize: '0.6rem', display: 'block', fontWeight: 600 }}>
                              PLATFORM PAYOUT RATE
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                              {newSellPayout ? `${parseFloat(newSellPayout).toFixed(1)}%` : '0.0%'} Payout
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 4, pt: 2, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
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
                px: 3,
                py: 1,
                bgcolor: '#6D28D9',
                '&:hover': { bgcolor: '#5B21B6' },
                boxShadow: '0 4px 10px rgba(109, 40, 217, 0.2)',
              }}
            >
              Create Product Listing
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default GiftCardCatalogView;
