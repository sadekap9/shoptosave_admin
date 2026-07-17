import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShoppingBag,
  Repeat,
  RefreshCw,
  Store,
  IndianRupee,
  Wallet,
  Search,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Grid,
  ShieldCheck,
  Image,
  Tag,
  PanelLeftClose
} from 'lucide-react';

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
import Login from './components/Login';
import BannersView from './components/BannersView';
import CouponsView from './components/CouponsView';

// Services & Models import
import authModel from './models/authModel';

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
  // Authentication status state
  const [isAuthenticated, setIsAuthenticated] = useState(authModel.isAuthenticated());

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Resize listener to track mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation active tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Collapsible sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Admin Profile state
  const [adminProfile, setAdminProfile] = useState(() => {
    const user = authModel.getUser();
    if (user) {
      return {
        name: user.name || user.email || 'Admin User',
        email: user.email || '',
        phone: user.phone || '',
        role: authModel.getReadableRole(),
        avatarInitials: authModel.getInitials(),
      };
    }
    return {
      name: 'Admin User',
      email: '',
      phone: '',
      role: 'Administrator',
      avatarInitials: 'AD',
    };
  });

  // Watch for auth changes (token storage edits or session expiration)
  useEffect(() => {
    const handleAuthChange = () => {
      const authState = authModel.isAuthenticated();
      setIsAuthenticated(authState);
      if (authState) {
        const user = authModel.getUser();
        setAdminProfile({
          name: user.name || user.email || 'Admin User',
          email: user.email || '',
          phone: user.phone || '',
          role: authModel.getReadableRole(),
          avatarInitials: authModel.getInitials(),
        });
      }
    };

    window.addEventListener('s2s_auth_change', handleAuthChange);
    window.addEventListener('s2s_auth_expired', handleAuthChange);

    return () => {
      window.removeEventListener('s2s_auth_change', handleAuthChange);
      window.removeEventListener('s2s_auth_expired', handleAuthChange);
    };
  }, []);

  // Shared state values
  const [orders] = useState(initialOrders);
  const [sellRequests, setSellRequests] = useState(initialSellRequests);
  const [stores, setStores] = useState(initialStores);
  const [systemStatus, setSystemStatus] = useState({ lastSync: '2h ago' });

  // Top header Profile menu state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Snackbar alerts state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success'); // success, info, warning, error
  const [toastTimerKey, setToastTimerKey] = useState(0);

  const triggerToast = (msg, severity = 'success') => {
    setToastMessage(msg);
    setToastSeverity(severity);
    setToastOpen(true);
    setToastTimerKey((prev) => prev + 1);
  };

  // Automatically close toast
  useEffect(() => {
    if (toastOpen) {
      const timer = setTimeout(() => {
        setToastOpen(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastOpen, toastTimerKey]);

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
      case 'banners':
        return <BannersView triggerToast={triggerToast} />;
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
        // Fallback for tab since earnings ledger view is simple or embedded in dashboard
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Earnings Ledger</h3>
            <p className="text-sm text-slate-600">Complete transaction details ledger coming soon.</p>
          </div>
        );
      case 'wallets':
        return <WalletsView triggerToast={triggerToast} />;
      case 'coupons':
        return <CouponsView triggerToast={triggerToast} />;
      case 'profile':
        return (
          <ProfileView
            adminProfile={adminProfile}
            onUpdateProfile={handleUpdateProfile}
            triggerToast={triggerToast}
          />
        );
      default:
        return <h5 className="text-base font-bold text-slate-900">Feature coming soon!</h5>;
    }
  };

  const sidebarWidth = isCollapsed ? 72 : 260;

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderNavItem = (tabName, label, IconComponent, badgeContent, badgeClass = 'bg-primary-light text-primary') => {
    const isSelected = activeTab === tabName;
    return (
      <li key={tabName}>
        <button
          onClick={() => {
            setActiveTab(tabName);
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            isSelected
              ? 'bg-[#F5F3FF] text-[#6D28D9] relative glowing-indicator'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
        >
          <IconComponent className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#6D28D9]' : 'text-slate-400'}`} />
          {(!isCollapsed || isMobile) && (
            <span className="flex-1 text-left truncate">{label}</span>
          )}
          {(!isCollapsed || isMobile) && badgeContent !== undefined && (
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${badgeClass}`}>
              {badgeContent}
            </span>
          )}
        </button>
      </li>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] w-full max-w-full overflow-x-hidden">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[4px] z-[1250]"
        />
      )}

      {/* 1. Sidebar Nav */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200/80 flex flex-col z-[1300] transition-all duration-300 ${
          isMobile
            ? `${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-[260px] shadow-2xl`
            : `${isCollapsed ? 'w-[72px]' : 'w-[260px]'}`
        }`}
      >
        {/* Brand Header */}
        <div
          className={`px-5 py-4 h-[72px] border-b border-slate-200/80 flex items-center ${
            isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
          }`}
        >
          {(!isCollapsed || isMobile) ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-extrabold text-sm shadow-[0_4px_10px_rgba(109,40,217,0.25)]">
                  S
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#0F172A] leading-none tracking-tight">
                    Shop2Save
                  </h2>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5 block">
                    PRO ENTERPRISE
                  </span>
                </div>
              </div>
              {isMobile && (
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-extrabold text-base shadow-[0_4px_10px_rgba(109,40,217,0.25)]">
              S
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
          {/* Overview Section */}
          <div>
            {(!isCollapsed || isMobile) && (
              <span className="px-3 text-[10px] font-bold text-slate-500 tracking-wider block mb-2 uppercase">
                OVERVIEW
              </span>
            )}
            <ul className="space-y-1">
              {renderNavItem('dashboard', 'Dashboard', LayoutDashboard)}
              {renderNavItem('users', 'User Accounts', Users, '1.2k', 'bg-[#F5F3FF] text-[#A855F7]')}
              {renderNavItem('sub-admins', 'Sub-Admins', ShieldCheck)}
            </ul>
          </div>

          {/* Gift Inventory Section */}
          <div>
            {(!isCollapsed || isMobile) && (
              <span className="px-3 text-[10px] font-bold text-slate-500 tracking-wider block mb-2 uppercase">
                GIFT INVENTORY
              </span>
            )}
            <ul className="space-y-1">
              {renderNavItem('woohoo-sync', 'Sync Woohoo', RefreshCw)}
              {renderNavItem('categories', 'Categories', Grid)}
              {renderNavItem('stores', 'Stores', Store)}
              {renderNavItem('gift-card-catalog', 'Gift Cards', CreditCard)}
              {renderNavItem('banners', 'Promo Banners', Image)}
              {renderNavItem('coupons', 'Coupons', Tag)}
            </ul>
          </div>
        </div>

        {/* Collapsible toggle */}
        {!isMobile && (
          <div className="border-t border-slate-200/80 p-2 flex justify-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-500 hover:text-[#6D28D9] rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        )}
      </aside>

      {/* 2. Main Content Wrapper */}
      <div
        className="min-h-screen flex flex-col bg-[#F8FAFC] transition-all duration-300"
        style={{
          marginLeft: isMobile ? '0px' : `${sidebarWidth}px`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
        }}
      >
        {/* Sticky top navbar */}
        <header className="glass-blur sticky top-0 z-[1000] h-[72px] flex items-center justify-between px-4 md:px-8 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
          {/* Left: Title & Collapsed menu toggler */}
          <div className="flex items-center gap-2">
            {(isMobile || isCollapsed) && (
              <button
                onClick={() => (isMobile ? setIsMobileSidebarOpen(true) : setIsCollapsed(false))}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 mr-1"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Page Title */}
            <h1 className="text-base md:text-lg font-bold text-[#0F172A] capitalize tracking-tight leading-none whitespace-nowrap">
              {activeTab.replace(/-/g, ' ')}
            </h1>
          </div>

          {/* Right: Search & Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-slate-100 border border-slate-200/60 rounded-lg px-3 py-1.5 w-80 focus-within:w-[360px] focus-within:bg-white focus-within:border-primary focus-within:shadow-[0_4px_16px_rgba(109,40,217,0.08)] transition-all duration-300">
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search transactions, users..."
                className="bg-transparent border-none outline-none text-xs w-full text-[#0F172A] font-medium placeholder-slate-400"
              />
              <span className="bg-white text-slate-500 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold shadow-sm flex-shrink-0 ml-1">
                ⌘K
              </span>
            </div>

            {/* Notifications badge */}
            <div className="relative">
              <button
                onClick={() => setActiveTab('sell-requests')}
                title="Pending Card Audits"
                className="w-[38px] h-[38px] flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 shadow-sm transition-all duration-200"
              >
                <Bell className="w-4.5 h-4.5" />
                {sellRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold rounded-full w-4 h-4 flex items-center justify-center text-[9px] border-2 border-white">
                    {sellRequests.length}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Avatar trigger dropdown */}
            <div className="relative">
              <button
                title={`${adminProfile.name} (${adminProfile.role})`}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-[38px] h-[38px] rounded-full bg-[#6D28D9] text-white flex items-center justify-center font-bold text-xs cursor-pointer border border-slate-200/80 shadow-[0_2px_8px_rgba(109,40,217,0.15)] hover:scale-105 transition-all duration-200"
              >
                {adminProfile.avatarInitials}
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border border-slate-200 bg-white p-1 z-50 animate-fadeIn">
                    <div className="px-4 py-3">
                      <p className="text-xs font-bold text-[#0F172A] leading-snug">{adminProfile.name}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{adminProfile.email}</p>
                    </div>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0F172A] rounded-lg transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0F172A] rounded-lg transition-colors"
                    >
                      Settings
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        authModel.clearAuth();
                        triggerToast('Logged out successfully', 'success');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 3. Screen Viewport rendering */}
        <main className="p-4 md:p-6 flex-1 w-full box-border">
          {renderContent()}
        </main>
      </div>

      {/* Global Snackbar Toast Notifications */}
      {toastOpen && (
        <div
          className="fixed bottom-6 right-6 z-[2000] flex items-center gap-2.5 px-4 py-3 rounded-xl text-white shadow-xl animate-fadeIn text-sm font-semibold transition-all duration-300"
          style={{
            backgroundColor:
              toastSeverity === 'success'
                ? '#10B981'
                : toastSeverity === 'error'
                ? '#EF4444'
                : toastSeverity === 'info'
                ? '#6D28D9'
                : '#F59E0B',
          }}
        >
          <div className="flex-1">{toastMessage}</div>
          <button
            onClick={() => setToastOpen(false)}
            className="ml-2 hover:opacity-80 text-white font-bold leading-none"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
