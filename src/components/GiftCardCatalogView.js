import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  Divider,
  Tabs,
  Tab,
  FormControlLabel,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  LocalOffer as TagIcon,
  Palette as PaletteIcon,
  ChevronRight as ChevronRightIcon,
  ShoppingBag as BuyIcon,
  Paid as SellIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  MenuBook as InstructionsIcon,
  Description as DocIcon,
  CardGiftcard as GiftcardIcon,
} from '@mui/icons-material';

import { storeService } from '../services/storeService';
import { categoryService } from '../services/categoryService';

const getBrandGradient = (brandName) => {
  const name = (brandName || '').toLowerCase();
  if (name.includes('amazon')) return 'linear-gradient(135deg, #232f3e 0%, #146eb4 100%)';
  if (name.includes('flipkart')) return 'linear-gradient(135deg, #2874f0 0%, #004ba0 100%)';
  if (name.includes('myntra')) return 'linear-gradient(135deg, #fe3f6c 0%, #e7184a 100%)';
  if (name.includes('swiggy')) return 'linear-gradient(135deg, #fc8019 0%, #d45e0c 100%)';
  if (name.includes('zomato')) return 'linear-gradient(135deg, #cb202d 0%, #9a101b 100%)';
  if (name.includes('nykaa')) return 'linear-gradient(135deg, #fc2779 0%, #c40a50 100%)';
  if (name.includes('google')) return 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)';
  if (name.includes('ajio')) return 'linear-gradient(135deg, #2d3e50 0%, #1e293b 100%)';

  // Fallback dynamic gradient
  const colors = [
    ['#6D28D9', '#8B5CF6'],
    ['#0D9488', '#14B8A6'],
    ['#4F46E5', '#818CF8'],
    ['#0284C7', '#38BDF8'],
    ['#059669', '#34D399'],
    ['#DB2777', '#F472B6']
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  const pair = colors[sum % colors.length];
  return `linear-gradient(135deg, ${pair[0]} 0%, ${pair[1]} 100%)`;
};

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
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = Buy Catalog, 1 = Sell Catalog

  // Dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newCat, setNewCat] = useState('Shopping');

  // View details dialog state
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let categoriesList = [];
      try {
        const catRes = await categoryService.getCategories();
        if (catRes && catRes.success && catRes.result && catRes.result.data) {
          categoriesList = catRes.result.data;
          setCategories(categoriesList);
        }
      } catch (catErr) {
        console.error('Failed to fetch categories:', catErr);
      }

      const response = await storeService.getGiftCards();
      if (response && response.success && response.result && response.result.data) {
        const fetchedCards = response.result.data.giftCards || [];
        const mappedCards = fetchedCards.map((card) => {
          const catNames = (card.categories || []).map(catId => {
            const matchedCat = categoriesList.find(c => String(c.id) === String(catId));
            return matchedCat ? matchedCat.category_name : null;
          }).filter(Boolean);

          const mainCategory = catNames.length > 0 ? catNames[0] : 'General';

          return {
            id: card.id,
            brand: card.gift_card_name || card.brand_name || 'N/A',
            category: mainCategory,
            allCategories: catNames,
            allowBuy: true,
            allowSell: card.payout_enabled === 1,
            buyDiscount: card.discounts && card.discounts.length > 0 ? `${card.discounts[0]}%` : '3.5%',
            sellPayout: card.payout_enabled === 1 ? '90.0%' : 'N/A',
            status: card.status === 1 ? 'Active' : 'Disabled',
            stock: card.stock || (100 + (card.id % 5) * 20),
            bg: getBrandGradient(card.gift_card_name || card.brand_name),
            raw: card,
          };
        });
        setCatalog(mappedCards);
      } else {
        triggerToast(response?.message || 'Failed to fetch gift cards', 'error');
      }
    } catch (err) {
      console.error('Error fetching catalog data:', err);
      triggerToast(err.message || 'An error occurred while fetching the gift card catalog', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const matchesTab = activeTab === 0 ? card.allowBuy : card.allowSell;
    return matchesTab;
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="450px" width="100%">
        <CircularProgress sx={{ color: '#6D28D9' }} />
      </Box>
    );
  }

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

      {/* Catalog Grid */}
      <Grid container spacing={3}>
        {filteredCatalog.length === 0 ? (
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                py: 10,
                px: 3,
                bgcolor: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 4px 20px -2px rgba(109, 40, 217, 0.05)',
                animation: 'fadeIn 0.6s ease-out-back',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 120,
                  height: 120,
                  mb: 3,
                }}
              >
                {/* Glowing Background Rings with Keyframes */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(109, 40, 217, 0.15) 0%, rgba(109, 40, 217, 0) 70%)',
                    animation: 'pulse 3s infinite alternate ease-in-out',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(0.92)', opacity: 0.6 },
                      '100%': { transform: 'scale(1.08)', opacity: 1 },
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: '80%',
                    height: '80%',
                    borderRadius: '50%',
                    border: '2px dashed rgba(109, 40, 217, 0.2)',
                    animation: 'spin 20s infinite linear',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 72,
                    height: 72,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
                    boxShadow: '0 12px 24px -6px rgba(109, 40, 217, 0.4)',
                    color: '#FFFFFF',
                    transform: 'rotate(-10deg)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'rotate(0deg) scale(1.05)',
                    }
                  }}
                >
                  <GiftcardIcon sx={{ fontSize: 36 }} />
                </Box>
              </Box>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ color: '#0F172A', mb: 1, letterSpacing: '-0.02em' }}
              >
                No Gift Cards Available
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 400, mb: 2, lineHeight: 1.6, fontSize: '0.9rem' }}
              >
                {activeTab === 0
                  ? "There are currently no active purchase gift cards registered in this catalog."
                  : "There are currently no active sell gift cards registered in this catalog."}
              </Typography>
            </Box>
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
                        {activeTab === 0 ? 'BUY CARD' : 'SELL CARD'}
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
                          {/* <Box display="flex" alignItems="center" gap={0.5}>
                            <StockIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={550}>
                              Inventory: <strong>{card.stock}</strong> units
                            </Typography>
                          </Box> */}
                          {/* <Typography variant="caption" fontWeight={750} color={card.stock > 20 ? 'success.main' : card.stock > 0 ? 'warning.main' : 'error.main'}>
                            {card.stock > 20 ? 'In Stock' : card.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                          </Typography> */}
                        </Box>
                        {/* <LinearProgress
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
                        /> */}
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
                          Allows customers to instantly resell surplus {card.brand} gift cards directly to their wallet.
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<InfoIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={() => {
                          setSelectedCard(card);
                          setOpenDetailsDialog(true);
                        }}
                        fullWidth
                        sx={{
                          mb: 1.5,
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderColor: 'rgba(109, 40, 217, 0.3)',
                          color: '#6D28D9',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#6D28D9',
                            bgcolor: 'rgba(109, 40, 217, 0.04)',
                            transform: 'translateY(-1px)',
                          }
                        }}
                      >
                        View Details
                      </Button>
                      <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                      {/* Dynamic Mode Badges & Toggles */}
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" fontWeight={750} color={isLive ? 'success.main' : 'text.disabled'} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {isLive ? 'Active' : 'Active'}
                        </Typography>
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
                        {categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.category_name}>
                            {cat.category_name}
                          </MenuItem>
                        ))}
                        {categories.length === 0 && (
                          <>
                            <MenuItem value="Shopping">Shopping</MenuItem>
                            <MenuItem value="Lifestyle">Lifestyle</MenuItem>
                            <MenuItem value="Food">Food</MenuItem>
                            <MenuItem value="Beauty">Beauty</MenuItem>
                            <MenuItem value="Entertainment">Entertainment</MenuItem>
                          </>
                        )}
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
                        {previewTab === 0 ? 'BUY CARD' : 'SELL CARD'}
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
          </DialogActions>
        </form>
      </Dialog>

      {/* POPUP: Gift Card Details Popup */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            border: 'none',
          },
        }}
      >
        {/* Dynamic Premium Header with Brand Gradient */}
        <Box
          sx={{
            background: selectedCard?.bg || 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
            p: 3,
            pb: 4,
            color: '#FFFFFF',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0, left: 0, right: 0, height: '24px',
              bgcolor: '#FFFFFF',
              borderRadius: '24px 24px 0 0',
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={selectedCard?.raw?.brand_logo}
                alt={selectedCard?.brand}
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  border: '2px solid #FFFFFF',
                  p: 0.5,
                }}
              />
              <Box>
                <Typography variant="h6" fontWeight={850} sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.15)', lineHeight: 1.2 }}>
                  {selectedCard?.raw?.gift_card_name || selectedCard?.brand}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600 }}>
                  {selectedCard?.raw?.brand_name || 'Gift Card'} • {selectedCard?.raw?.brand_code || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={selectedCard?.status === 'Active' ? 'Active' : 'Disabled'}
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: selectedCard?.status === 'Active' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                px: 1,
              }}
            />
          </Box>
        </Box>

        <DialogContent sx={{ p: 3, pt: 0, bgcolor: '#FFFFFF' }}>
          {selectedCard?.raw && (
            <Box display="flex" flexDirection="column" gap={3}>

              {/* Premium 2x2 Highlights Grid with Micro-Icons */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      bgcolor: '#F8FAFC',
                      p: 2,
                      borderRadius: '16px',
                      border: '1px solid rgba(226, 232, 240, 0.7)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} sx={{ color: 'text.secondary', mb: 0.5 }}>
                      <BuyIcon sx={{ fontSize: 16, color: '#6D28D9' }} />
                      <Typography variant="caption" fontWeight={750} sx={{ letterSpacing: '0.05em' }}>
                        DENOMINATIONS
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={850} color="#1E293B">
                      {selectedCard.raw.currency_symbol || '₹'}{parseFloat(selectedCard.raw.min_denomination).toFixed(0)} - {selectedCard.raw.currency_symbol || '₹'}{parseFloat(selectedCard.raw.max_denomination).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box
                    sx={{
                      bgcolor: '#F8FAFC',
                      p: 2,
                      borderRadius: '16px',
                      border: '1px solid rgba(226, 232, 240, 0.7)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} sx={{ color: 'text.secondary', mb: 0.5 }}>
                      <InstructionsIcon sx={{ fontSize: 16, color: '#10B981' }} />
                      <Typography variant="caption" fontWeight={750} sx={{ letterSpacing: '0.05em' }}>
                        VALIDITY
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={850} color="#1E293B">
                      {selectedCard.raw.validity || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box
                    sx={{
                      bgcolor: '#F8FAFC',
                      p: 2,
                      borderRadius: '16px',
                      border: '1px solid rgba(226, 232, 240, 0.7)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} sx={{ color: 'text.secondary', mb: 0.5 }}>
                      <TagIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
                      <Typography variant="caption" fontWeight={750} sx={{ letterSpacing: '0.05em' }}>
                        SKU CODE
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={850} color="#1E293B" sx={{ fontFamily: 'monospace' }}>
                      {selectedCard.raw.sku || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box
                    sx={{
                      bgcolor: '#F8FAFC',
                      p: 2,
                      borderRadius: '16px',
                      border: '1px solid rgba(226, 232, 240, 0.7)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} sx={{ color: 'text.secondary', mb: 0.5 }}>
                      <DocIcon sx={{ fontSize: 16, color: '#EC4899' }} />
                      <Typography variant="caption" fontWeight={750} sx={{ letterSpacing: '0.05em' }}>
                        CARD TYPE
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={850} color="#1E293B" sx={{ textTransform: 'uppercase' }}>
                      {selectedCard.raw.product_type?.replace('-', ' ') || 'e-gift-card'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Description Card */}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={800} display="block" sx={{ mb: 1, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Product Description
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, color: '#475569', bgcolor: '#F8FAFC', p: 2, borderRadius: '12px', borderLeft: `4px solid ${selectedCard?.bg ? (selectedCard.bg.includes('#') ? selectedCard.bg.split('#')[1]?.substring(0, 6) : '6D28D9') : '6D28D9'}` }}>
                  {selectedCard.raw.description || selectedCard.raw.short_description || 'No description available for this gift card.'}
                </Typography>
              </Box>

              {/* Redemption instructions */}
              {selectedCard.raw.redeem_steps && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={800} display="block" sx={{ mb: 1, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Steps To Redeem
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: '#F8FAFC',
                      p: 2.5,
                      borderRadius: '16px',
                      border: '1px solid rgba(226, 232, 240, 0.7)',
                      fontSize: '0.8rem',
                      color: '#475569',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      '& ul, & ol': { pl: 2.5, m: 0, mt: 0.5 },
                      '& li': { mb: 0.8 },
                      '& a': { color: '#6D28D9', fontWeight: 600 },
                      // Clean Scrollbar Styling
                      '&::-webkit-scrollbar': { width: '6px' },
                      '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedCard.raw.redeem_steps }}
                  />
                </Box>
              )}

              {/* Important terms or notes */}
              {selectedCard.raw.things_to_note && (
                <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: '16px', borderLeft: '4px solid #F59E0B' }}>
                  <Typography variant="caption" color="#B45309" fontWeight={800} display="block" sx={{ mb: 0.5 }}>
                    IMPORTANT NOTES
                  </Typography>
                  <Typography variant="body2" color="#78350F" sx={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                    {selectedCard.raw.things_to_note}
                  </Typography>
                </Box>
              )}

              {/* T&C Link */}
              {selectedCard.raw.tnc_link && (
                <Box display="flex" justifyContent="flex-start">
                  <Button
                    variant="text"
                    href={selectedCard.raw.tnc_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 750,
                      fontSize: '0.78rem',
                      color: '#6D28D9',
                      p: 0,
                      '&:hover': { bgcolor: 'transparent', color: '#5B21B6', textDecoration: 'underline' }
                    }}
                  >
                    View Official Terms & Conditions Link
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid rgba(226, 232, 240, 0.8)', bgcolor: '#FFFFFF' }}>
          <Button
            onClick={() => setOpenDetailsDialog(false)}
            variant="contained"
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
              py: 1.2,
              bgcolor: '#6D28D9',
              '&:hover': { bgcolor: '#5B21B6' },
              boxShadow: '0 4px 14px rgba(109, 40, 217, 0.2)',
            }}
          >
            Dismiss Details
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GiftCardCatalogView;
