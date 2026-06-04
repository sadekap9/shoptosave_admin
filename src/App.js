import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  IconButton,
  Badge,
  InputBase,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PeopleAlt as UsersIcon,
  CardGiftcard as GiftCardIcon,
  ShoppingBag as OrdersIcon,
  CompareArrows as SellRequestsIcon,
  SyncAlt as WoohooSyncIcon,
  Store as StoresIcon,
  MonetizationOn as EarningsIcon,
  AccountBalanceWallet as WalletsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  KeyboardArrowRight as ChevronRightIcon,
  Category as CategoryIcon,
  SupervisorAccount as SubAdminIcon,
} from '@mui/icons-material';

// Subcomponents import
import DashboardView from './components/DashboardView';
import UsersView from './components/UsersView';
import GiftCardCatalogView from './components/GiftCardCatalogView';
import OrdersView from './components/OrdersView';
import SellRequestsView from './components/SellRequestsView';
import WoohooSyncView from './components/WoohooSyncView';
import StoresView from './components/StoresView';
import WalletsView from './components/WalletsView';
import ProfileView from './components/ProfileView';
import CategoriesView from './components/CategoriesView';
import SubAdminsView from './components/SubAdminsView';

// Initial Mock Orders
const initialOrders = [
  { id: 'ORD-2041', user: 'Ravi M.', brand: 'Amazon', amount: '₹1,000', status: 'Complete', timestamp: '2026-05-22 11:45' },
  { id: 'ORD-2040', user: 'Priya S.', brand: 'Flipkart', amount: '₹500', status: 'Complete', timestamp: '2026-05-22 10:30' },
  { id: 'ORD-2039', user: 'Amit K.', brand: 'Myntra', amount: '₹2,000', status: 'Processing', timestamp: '2026-05-22 09:15' },
  { id: 'ORD-2038', user: 'Sneha R.', brand: 'Google Play', amount: '₹1,500', status: 'Complete', timestamp: '2026-05-21 17:40' },
  { id: 'ORD-2037', user: 'Rahul P.', brand: 'Swiggy', amount: '₹750', status: 'Failed', timestamp: '2026-05-21 14:22' },
];

// Initial Mock Resell Card Requests
const initialSellRequests = [
  { id: '1', user: 'Kiran B.', brand: 'Amazon', value: '₹500' },
  { id: '2', user: 'Meera R.', brand: 'Flipkart', value: '₹1,000' },
  { id: '3', user: 'Dev P.', brand: 'Myntra', value: '₹750' },
  { id: '4', user: 'Anjali T.', brand: 'Nykaa', value: '₹300' },
];

// Initial Mock Partner Cashback Stores
const initialStores = [
  { id: 1, name: 'Amazon', cashback: '5%', status: 'Live' },
  { id: 2, name: 'Flipkart', cashback: '4%', status: 'Live' },
  { id: 3, name: 'Ajio', cashback: '6%', status: 'Paused' },
  { id: 4, name: 'Nykaa', cashback: '3.5%', status: 'Live' },
];

function App() {
  // Navigation active tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Collapsible sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Admin Profile state
  const [adminProfile, setAdminProfile] = useState({
    name: 'Alex Rivera',
    email: 'alex.rivera@shop2save.in',
    phone: '+91 98765 00123',
    role: 'System Administrator',
    avatarInitials: 'AR',
  });



  // Shared state values
  const [orders] = useState(initialOrders);
  const [sellRequests, setSellRequests] = useState(initialSellRequests);
  const [stores, setStores] = useState(initialStores);
  const [systemStatus, setSystemStatus] = useState({ lastSync: '2h ago' });

  // Top header Profile menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // Snackbar alerts state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success'); // success, info, warning, error

  const triggerToast = (msg, severity = 'success') => {
    setToastMessage(msg);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  // Actions
  const handleApproveRequest = (id) => {
    const targetReq = sellRequests.find((r) => r.id === id);
    if (targetReq) {
      setSellRequests(sellRequests.filter((r) => r.id !== id));
      triggerToast(`Request from ${targetReq.user} for ₹${targetReq.value} approved. Wallet credited.`, 'success');
    }
  };

  const handleRejectRequest = (id) => {
    const targetReq = sellRequests.find((r) => r.id === id);
    if (targetReq) {
      setSellRequests(sellRequests.filter((r) => r.id !== id));
      triggerToast(`Resell request from ${targetReq.user} has been rejected.`, 'error');
    }
  };

  const handleSyncWoohoo = () => {
    setSystemStatus({ lastSync: 'Just now' });
    triggerToast('Woohoo API inventory catalog synced successfully!', 'success');
  };

  const handleAddStore = (newStore) => {
    const freshStore = {
      id: stores.length + 1,
      ...newStore,
    };
    setStores([freshStore, ...stores]);
    triggerToast(`"${newStore.name}" registered successfully as a cashback partner!`, 'success');
  };

  const handleToggleStoreStatus = (id) => {
    setStores(
      stores.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'Live' ? 'Paused' : 'Live';
          triggerToast(`Cashback offer for ${s.name} is now ${nextStatus}`, 'info');
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleUpdateProfile = (updatedProfile) => {
    setAdminProfile(updatedProfile);
  };

  // Content switcher
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            orders={orders}
            sellRequests={sellRequests}
            stores={stores}
            systemStatus={systemStatus}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onSyncWoohoo={handleSyncWoohoo}
            onAddStore={handleAddStore}
            onToggleStoreStatus={handleToggleStoreStatus}
            triggerToast={triggerToast}
          />
        );
      case 'users':
        return <UsersView triggerToast={triggerToast} />;
      case 'categories':
        return <CategoriesView triggerToast={triggerToast} />;
      case 'sub-admins':
        return <SubAdminsView triggerToast={triggerToast} />;
      case 'gift-card-catalog':
        return <GiftCardCatalogView triggerToast={triggerToast} />;
      case 'orders':
        return <OrdersView orders={orders} />;
      case 'sell-requests':
        return (
          <SellRequestsView
            sellRequests={sellRequests}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
          />
        );
      case 'woohoo-sync':
        return (
          <WoohooSyncView
            systemStatus={systemStatus}
            onSyncWoohoo={handleSyncWoohoo}
            triggerToast={triggerToast}
          />
        );
      case 'stores':
        return (
          <StoresView
            triggerToast={triggerToast}
          />
        );
      case 'cashback-earnings':
      case 'wallets':
        return <WalletsView triggerToast={triggerToast} />;
      case 'profile':
        return (
          <ProfileView
            adminProfile={adminProfile}
            onUpdateProfile={handleUpdateProfile}
            triggerToast={triggerToast}
          />
        );
      default:
        return <Typography variant="h5">Feature coming soon!</Typography>;
    }
  };

  const sidebarWidth = isCollapsed ? 72 : 260;

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: '#F8FAFC', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* 1. Sidebar Nav */}
      <Box
        className="sidebar-container"
        sx={{
          width: sidebarWidth,
          borderRight: '1px solid rgba(226, 232, 240, 0.8)',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1200,
        }}
      >
        {/* Brand Header */}
        <Box
          sx={{
            p: 2.5,
            height: 72,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          {!isCollapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1rem',
                  boxShadow: '0 4px 10px rgba(109, 40, 217, 0.25)',
                }}
              >
                S
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Shop2Save
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
                  PRO ENTERPRISE
                </Typography>
              </Box>
            </Box>
          )}

          {isCollapsed && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.2rem',
                boxShadow: '0 4px 10px rgba(109, 40, 217, 0.25)',
              }}
            >
              S
            </Box>
          )}
        </Box>

        {/* Navigation Items */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2, px: 1 }}>
          {/* Main Category */}
          {!isCollapsed && (
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
              OVERVIEW
            </Typography>
          )}
          <List sx={{ p: 0, mb: isCollapsed ? 0 : 2 }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
                className={activeTab === 'dashboard' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'dashboard' ? '#6D28D9' : '#64748B' }}>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Dashboard" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'users'}
                onClick={() => setActiveTab('users')}
                className={activeTab === 'users' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'users' ? '#6D28D9' : '#64748B' }}>
                  <UsersIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="User Accounts" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
                {!isCollapsed && <Badge badgeContent="1.2k" color="primary" sx={{ mr: 1, '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16, fontWeight: 700, backgroundColor: 'rgba(109, 40, 217, 0.1)', color: '#6D28D9' } }} />}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'sub-admins'}
                onClick={() => setActiveTab('sub-admins')}
                className={activeTab === 'sub-admins' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'sub-admins' ? '#6D28D9' : '#64748B' }}>
                  <SubAdminIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Sub-Admins" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
              </ListItemButton>
            </ListItem>
          </List>

          {/* Catalog Category */}
          {!isCollapsed && (
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
              GIFT INVENTORY
            </Typography>
          )}
          <List sx={{ p: 0, mb: isCollapsed ? 0 : 2 }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'gift-card-catalog'}
                onClick={() => setActiveTab('gift-card-catalog')}
                className={activeTab === 'gift-card-catalog' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'gift-card-catalog' ? '#6D28D9' : '#64748B' }}>
                  <GiftCardIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Gift Cards" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'categories'}
                onClick={() => setActiveTab('categories')}
                className={activeTab === 'categories' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'categories' ? '#6D28D9' : '#64748B' }}>
                  <CategoryIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Categories" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
                className={activeTab === 'orders' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'orders' ? '#6D28D9' : '#64748B' }}>
                  <OrdersIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Redeem Orders" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
                {!isCollapsed && <Badge badgeContent={orders.length} color="error" sx={{ mr: 1, '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16, fontWeight: 700 } }} />}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'sell-requests'}
                onClick={() => setActiveTab('sell-requests')}
                className={activeTab === 'sell-requests' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'sell-requests' ? '#6D28D9' : '#64748B' }}>
                  <SellRequestsIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Sell Requests" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
                {!isCollapsed && <Badge badgeContent={sellRequests.length} color="error" sx={{ mr: 1, '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16, fontWeight: 700 } }} />}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'woohoo-sync'}
                onClick={() => setActiveTab('woohoo-sync')}
                className={activeTab === 'woohoo-sync' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'woohoo-sync' ? '#6D28D9' : '#64748B' }}>
                  <WoohooSyncIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Sync Woohoo" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
              </ListItemButton>
            </ListItem>
          </List>

          {/* Cashback Category */}
          {!isCollapsed && (
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
              OFFERS & FINANCES
            </Typography>
          )}
          <List sx={{ p: 0, mb: isCollapsed ? 0 : 2 }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'stores'}
                onClick={() => setActiveTab('stores')}
                className={activeTab === 'stores' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'stores' ? '#6D28D9' : '#64748B' }}>
                  <StoresIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Stores" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'cashback-earnings'}
                onClick={() => setActiveTab('cashback-earnings')}
                className={activeTab === 'cashback-earnings' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'cashback-earnings' ? '#6D28D9' : '#64748B' }}>
                  <EarningsIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Earnings Ledger" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTab === 'wallets'}
                onClick={() => setActiveTab('wallets')}
                className={activeTab === 'wallets' ? 'glowing-indicator' : ''}
              >
                <ListItemIcon sx={{ color: activeTab === 'wallets' ? '#6D28D9' : '#64748B' }}>
                  <WalletsIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="System Wallets" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />}
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        {/* Collapsible toggle */}
        <Box sx={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', p: 1, display: 'flex', justifyContent: 'center' }}>
          <IconButton size="small" onClick={() => setIsCollapsed(!isCollapsed)} sx={{ color: '#64748B', '&:hover': { color: '#6D28D9' } }}>
            {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
          </IconButton>
        </Box>

      </Box>

      {/* 2. Main Content Wrapper */}
      <Box
        sx={{
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100% - ${sidebarWidth}px)`,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F8FAFC',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Sticky top navbar */}
        <Box
          className="glass-blur"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 },
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            boxSizing: 'border-box',
          }}
        >
          {/* Left: Breadcrumbs / Collapsed menu toggler */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isCollapsed && (
              <IconButton size="small" onClick={() => setIsCollapsed(false)} sx={{ mr: 1, color: '#64748B' }}>
                <MenuIcon fontSize="small" />
              </IconButton>
            )}

            {/* Page Title */}
            <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 750, textTransform: 'capitalize', fontSize: '1.12rem', letterSpacing: '-0.015em' }}>
              {activeTab.replace('-', ' ')}
            </Typography>
          </Box>

          {/* Right: Global Actions & Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
            {/* Search Bar */}
            <Box
              sx={{
                bgcolor: '#F1F5F9',
                border: '1px solid rgba(226, 232, 240, 0.6)',
                borderRadius: 2,
                px: 1.5,
                py: 0.6,
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                width: 320,
                transition: 'all 0.2s',
                '&:focus-within': {
                  bgcolor: '#FFFFFF',
                  borderColor: '#6D28D9',
                  boxShadow: '0 0 0 2px rgba(109, 40, 217, 0.1)',
                },
              }}
            >
              <SearchIcon sx={{ color: '#94A3B8', fontSize: 16, mr: 1 }} />
              <InputBase placeholder="Search transactions, users..." sx={{ fontSize: '0.75rem', width: '100%', color: '#0F172A', fontWeight: 500 }} />
              <Box
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#64748B',
                  borderRadius: 1.2,
                  px: 0.6,
                  py: 0.2,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(226,232,240,0.8)',
                }}
              >
                ⌘K
              </Box>
            </Box>

            {/* Notifications badge */}
            <Tooltip title="Pending Card Audits">
              <IconButton
                size="medium"
                onClick={() => setActiveTab('sell-requests')}
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  color: '#64748B',
                  width: 38,
                  height: 38,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  '&:hover': {
                    color: '#EF4444',
                    borderColor: 'rgba(239,68,68,0.2)',
                    backgroundColor: '#FEF2F2',
                  },
                }}
              >
                <Badge badgeContent={sellRequests.length} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.62rem', height: 16, minWidth: 16 } }}>
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile Avatar trigger */}
            <Tooltip title={`${adminProfile.name} (${adminProfile.role})`}>
              <Avatar
                sx={{
                  bgcolor: '#6D28D9',
                  color: '#FFFFFF',
                  width: 38,
                  height: 38,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(109, 40, 217, 0.15)',
                  border: '1.5px solid rgba(226,232,240,0.8)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(109, 40, 217, 0.25)',
                  },
                }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                {adminProfile.avatarInitials}
              </Avatar>
            </Tooltip>
          </Box>
        </Box>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 3,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              p: 0.5,
              minWidth: 180,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
              {adminProfile.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              {adminProfile.email}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setActiveTab('profile');
            }}
            sx={{ fontSize: '0.78rem', py: 1, borderRadius: 1.5 }}
          >
            View Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setActiveTab('profile');
            }}
            sx={{ fontSize: '0.78rem', py: 1, borderRadius: 1.5 }}
          >
            Settings
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              triggerToast('Simulating secure administrator logout...', 'info');
            }}
            sx={{ color: '#EF4444', fontSize: '0.78rem', py: 1, borderRadius: 1.5, '&:hover': { backgroundColor: '#FEF2F2' } }}
          >
            <LogoutIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
            Log Out
          </MenuItem>
        </Menu>

        {/* 3. Screen Viewport rendering */}
        <Box sx={{ p: 3, flexGrow: 1, boxSizing: 'border-box', width: '100%' }}>
          {renderContent()}
        </Box>
      </Box>

      {/* Global Snackbar Toast Notifications */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
          variant="filled"
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
            bgcolor:
              toastSeverity === 'success'
                ? '#10B981'
                : toastSeverity === 'error'
                ? '#EF4444'
                : toastSeverity === 'info'
                ? '#6D28D9'
                : '#F59E0B',
            color: '#FFFFFF',
            fontSize: '0.8rem',
            '& .MuiAlert-icon': {
              color: '#FFFFFF',
            },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
