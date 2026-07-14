import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  PeopleAlt as UsersIcon,
  MonetizationOn as RevenueIcon,
  CardGiftcard as CardIcon,
  Sync as SyncIcon,
  Store as StoreIcon,
  GetApp as ExportIcon,
  Check as ApproveIcon,
  Clear as RejectIcon,
  CheckCircle as CheckIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowForward as ArrowIcon,
  HourglassEmpty as PendingIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';

// ─── Status Chip ────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const map = {
    Complete:   { bg: '#ECFDF5', color: '#059669', label: 'Complete', pulseClass: 'pulse-dot-green' },
    Processing: { bg: '#FEF3C7', color: '#D97706', label: 'Processing', pulseClass: 'pulse-dot-orange' },
    Failed:     { bg: '#FEF2F2', color: '#DC2626', label: 'Failed', pulseClass: 'pulse-dot-red' },
    Live:       { bg: '#ECFDF5', color: '#059669', label: 'Live', pulseClass: 'pulse-dot-green' },
    Paused:     { bg: '#FEF3C7', color: '#D97706', label: 'Paused', pulseClass: 'pulse-dot-orange' },
    Active:     { bg: '#ECFDF5', color: '#059669', label: 'Active', pulseClass: 'pulse-dot-green' },
    Pending:    { bg: '#F5F3FF', color: '#7C3AED', label: 'Pending', pulseClass: 'pulse-dot-orange' },
    Unverified: { bg: '#FFF7ED', color: '#C2410C', label: 'Unverified', pulseClass: 'pulse-dot-orange' },
    Blocked:    { bg: '#FEF2F2', color: '#DC2626', label: 'Blocked', pulseClass: 'pulse-dot-red' },
    Paid:       { bg: '#ECFDF5', color: '#059669', label: 'Paid', pulseClass: 'pulse-dot-green' },
  };
  const cfg = map[status] || { bg: '#F1F5F9', color: '#475569', label: status, pulseClass: '' };
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', px: 1.5, py: 0.4,
      borderRadius: '20px', bgcolor: cfg.bg, color: cfg.color,
      fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.01em',
      gap: 0.8,
      border: `1px solid ${cfg.color}18`,
    }}>
      {cfg.pulseClass && (
        <Box 
          className={cfg.pulseClass}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: cfg.color,
          }}
        />
      )}
      {cfg.label}
    </Box>
  );
};

// ─── Quick Action Card ───────────────────────────────────────────────────────
const QuickActionCard = ({ icon, label, desc, color, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex', flexDirection: 'column', gap: 1,
      p: 2.5, borderRadius: '14px', border: '1px solid #E2E8F0',
      bgcolor: '#FFFFFF', cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        borderColor: color,
        boxShadow: `0 12px 24px -8px ${color}20`,
        transform: 'translateY(-4px)',
      },
    }}
  >
    <Box sx={{
      width: 44, height: 44, borderRadius: '10px',
      bgcolor: `${color}15`, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', lineHeight: 1.3 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.74rem', color: '#64748B', mt: 0.3 }}>
        {desc}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', color: color, mt: 'auto', pt: 0.5 }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>Open →</Typography>
    </Box>
  </Box>
);

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, badge, badgeColor, sub, iconColor }) => (
  <Box sx={{
    bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px',
    p: '24px', display: 'flex', flexDirection: 'column', gap: 2,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: '4px',
      bgcolor: iconColor,
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    '&:hover': { 
      borderColor: iconColor, 
      boxShadow: `0 12px 30px -10px ${iconColor}25, 0 4px 12px -5px ${iconColor}15`, 
      transform: 'translateY(-4px)',
      '&::before': {
        opacity: 1,
      }
    },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <Box>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{
        width: 48, height: 48, borderRadius: '12px',
        bgcolor: `${iconColor}12`, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {badge && (
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.3,
          px: 1, py: 0.3, borderRadius: '6px',
          bgcolor: badgeColor === 'green' ? '#ECFDF5' : badgeColor === 'red' ? '#FEF2F2' : '#F5F3FF',
          color: badgeColor === 'green' ? '#059669' : badgeColor === 'red' ? '#DC2626' : '#7C3AED',
          fontSize: '0.72rem', fontWeight: 700,
        }}>
          <ArrowUpIcon sx={{ fontSize: 11 }} />
          {badge}
        </Box>
      )}
      <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8' }}>{sub}</Typography>
    </Box>
  </Box>
);

// Mock Data for new tables
const recentRegistrations = [
  { name: 'Ravi Mehta', phone: '98765xxxxx', wallet: '₹200', status: 'Active' },
  { name: 'Priya Shah', phone: '91234xxxxx', wallet: '₹0', status: 'Unverified' },
  { name: 'Amit Kumar', phone: '99001xxxxx', wallet: '₹1,500', status: 'Active' },
  { name: 'Sneha Patel', phone: '70000xxxxx', wallet: '₹50', status: 'Blocked' },
];

const recentPayments = [
  { user: 'Ravi M.', type: 'Wallet', amount: '₹500', status: 'Paid' },
  { user: 'Priya S.', type: 'Gift Card', amount: '₹1,000', status: 'Paid' },
  { user: 'Amit K.', type: 'Wallet', amount: '₹2,000', status: 'Paid' },
  { user: 'John D.', type: 'Gift Card', amount: '₹500', status: 'Failed' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const DashboardView = ({
  orders,
  sellRequests,
  stores,
  systemStatus,
  onApproveRequest,
  onRejectRequest,
  onSyncWoohoo,
  onAddStore,
  onToggleStoreStatus,
  triggerToast,
}) => {
  const [openStoreDialog, setOpenStoreDialog]   = useState(false);
  const [storeName, setStoreName]               = useState('');
  const [cashbackPct, setCashbackPct]           = useState('');
  const [storeStoreStatus, setStoreStoreStatus] = useState('Live');

  const [openFeatureDialog, setOpenFeatureDialog] = useState(false);
  const [selectedBrand, setSelectedBrand]         = useState('');

  const handleAddStoreSubmit = (e) => {
    e.preventDefault();
    if (!storeName || !cashbackPct) { triggerToast('Please fill all fields', 'warning'); return; }
    onAddStore({ name: storeName, cashback: `${cashbackPct}%`, status: storeStoreStatus });
    setStoreName(''); setCashbackPct(''); setStoreStoreStatus('Live');
    setOpenStoreDialog(false);
  };

  const handleFeatureSubmit = (e) => {
    e.preventDefault();
    if (!selectedBrand) { triggerToast('Please select a brand to feature', 'warning'); return; }
    triggerToast(`"${selectedBrand}" featured in the catalog!`, 'success');
    setSelectedBrand(''); setOpenFeatureDialog(false);
  };

  // Derived stats
  const totalOrdersVolume = orders.reduce((s, o) => s + (parseFloat(o.amount.replace(/[^0-9]/g, '')) || 0), 0);
  const pendingAuditsCount = sellRequests.length;
  const completeOrders = orders.filter(o => o.status === 'Complete').length;

  // Top selling brands
  const topSellingBrands = [
    { name: 'Amazon',      sales: 234, pct: 100 },
    { name: 'Flipkart',    sales: 190, pct: 81 },
    { name: 'Myntra',      sales: 145, pct: 62 },
    { name: 'Swiggy',      sales: 105, pct: 45 },
    { name: 'Zomato',      sales: 74,  pct: 32 },
    { name: 'Google Play', sales: 47,  pct: 20 },
  ];

  const quickActions = [
    { icon: <SyncIcon />,   label: 'Sync Woohoo',     desc: `Last: ${systemStatus.lastSync}`, color: '#6D28D9', onClick: onSyncWoohoo },
    { icon: <StoreIcon />,  label: 'Add Store',       desc: 'Register partner store',        color: '#10B981', onClick: () => setOpenStoreDialog(true) },
    { icon: <CardIcon />,   label: 'Feature Card',    desc: 'Feature brand in catalog',      color: '#F59E0B', onClick: () => setOpenFeatureDialog(true) },
    { icon: <ExportIcon />, label: 'Export Report',   desc: 'Download Excel summary',         color: '#2563EB', onClick: () => triggerToast('Preparing Excel summary reports...', 'info') },
  ];

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        mb: 4, flexWrap: 'wrap', gap: 2,
      }}>
        <Box>
          <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Admin Dashboard
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#64748B', mt: 0.5, fontWeight: 500 }}>
            Shop2Save · Enterprise Management Console · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => triggerToast('Generating export report...', 'info')}
            sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem', px: 2.5, borderColor: '#E2E8F0', color: '#475569', '&:hover': { borderColor: '#6D28D9', color: '#6D28D9', bgcolor: '#F5F3FF' } }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={onSyncWoohoo}
            sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem', px: 2.5, background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)', boxShadow: '0 4px 14px rgba(109,40,217,0.25)', '&:hover': { background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)' } }}
          >
            Sync Woohoo
          </Button>
        </Box>
      </Box>

      {/* ── KPI ROW  (4 × 3 cols = 12) ──────────────────────────── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, minmax(0, 1fr))',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))'
        },
        gap: '24px',
        mb: 4,
      }}>
        <KpiCard
          label="Total Users"
          value="1,248"
          icon={<UsersIcon />}
          iconColor="#6D28D9"
          badge="+12.4%"
          badgeColor="green"
          sub="this month"
        />
        <KpiCard
          label="Checkout Volume"
          value={`₹${(totalOrdersVolume / 1000).toFixed(0)}K`}
          icon={<RevenueIcon />}
          iconColor="#0D9488"
          badge="+14.5%"
          badgeColor="green"
          sub="this week"
        />
        <KpiCard
          label="Gift Cards Listed"
          value="52"
          icon={<CardIcon />}
          iconColor="#2563EB"
          badge="+3"
          badgeColor="purple"
          sub="new this week"
        />
        <KpiCard
          label="Pending Audits"
          value={pendingAuditsCount}
          icon={<PendingIcon />}
          iconColor="#DC2626"
          badge={pendingAuditsCount > 0 ? `${pendingAuditsCount} open` : 'All clear'}
          badgeColor={pendingAuditsCount > 0 ? 'red' : 'green'}
          sub="sell requests"
        />
      </Box>

      {/* ── QUICK ACTIONS (8 × 4 cols) ───────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))'
          },
          gap: '16px',
        }}>
          {quickActions.map((a, i) => (
            <QuickActionCard
              key={i}
              icon={a.icon}
              label={a.label}
              desc={a.desc}
              color={a.color}
              onClick={a.onClick}
            />
          ))}
        </Box>
      </Box>

      {/* ── TABLES ROW  (65% + 35%) ───────────────────────────────── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, minmax(0, 1fr))',
          md: '65fr 35fr'
        },
        gap: '24px',
        mb: 4,
        alignItems: 'start',
      }}>
        {/* ─ Recent Orders Table (65%) ─────────────────────────── */}
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Card Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Recent Orders</Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8', mt: 0.2 }}>{orders.length} transactions this week</Typography>
            </Box>
            <Button
              size="small" endIcon={<ArrowIcon />}
              sx={{ fontSize: '0.74rem', fontWeight: 600, color: '#6D28D9', textTransform: 'none', '&:hover': { bgcolor: '#F5F3FF' } }}
              onClick={() => triggerToast('Opening full orders view...', 'info')}
            >
              View All
            </Button>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['Order', 'Customer', 'Brand', 'Amount', 'Status', 'Time'].map(h => (
                    <TableCell key={h} sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: '#6D28D9' }}>
                        {order.id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #F1F5F9' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.68rem', bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700 }}>
                          {order.user.substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>{order.user}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>{order.brand}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{order.amount}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #F1F5F9' }}>
                      <StatusChip status={order.status} />
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                        {order.timestamp?.split(' ')[1] || '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer Summary */}
          <Box sx={{
            px: 3,
            py: 1.8,
            bgcolor: '#F8FAFC',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: { xs: 2.5, sm: 4 },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px',
                bgcolor: '#ECFDF5', color: '#059669',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckIcon sx={{ fontSize: 16 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', mb: 0.2 }}>
                  Completed
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
                  {completeOrders}
                </Typography>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: '#E2E8F0', my: 0.5, display: { xs: 'none', sm: 'block' } }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px',
                bgcolor: '#EFF6FF', color: '#2563EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RevenueIcon sx={{ fontSize: 16 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', mb: 0.2 }}>
                  Total Volume
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  ₹{totalOrdersVolume.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: '#E2E8F0', my: 0.5, display: { xs: 'none', sm: 'block' } }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px',
                bgcolor: '#F5F3FF', color: '#7C3AED',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ArrowUpIcon sx={{ fontSize: 16 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', mb: 0.2 }}>
                  Success Rate
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {orders.length > 0 ? Math.round((completeOrders / orders.length) * 100) : 0}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ─ Sell Requests Table (35%) ─────────────────────────── */}
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Sell Requests</Typography>
                {pendingAuditsCount > 0 && (
                  <Box sx={{ bgcolor: '#FEF2F2', color: '#DC2626', px: 1, py: 0.2, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                    {pendingAuditsCount} pending
                  </Box>
                )}
              </Box>
              <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8', mt: 0.2 }}>Require audit approval</Typography>
            </Box>
          </Box>

          {sellRequests.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 40, color: '#10B981', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>All Clear</Typography>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.78rem', mt: 0.5 }}>No pending requests</Typography>
            </Box>
          ) : (
            <Box sx={{ divide: 'y' }}>
              {sellRequests.map((req, i) => (
                <Box key={req.id}>
                  <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Avatar sx={{ width: 36, height: 36, fontSize: '0.72rem', bgcolor: '#F5F3FF', color: '#7C3AED', fontWeight: 700, flexShrink: 0 }}>
                        {req.user.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {req.user}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {req.brand} · {req.value}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.8, flexShrink: 0 }}>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          onClick={() => onApproveRequest(req.id)}
                          sx={{ bgcolor: '#ECFDF5', color: '#059669', width: 30, height: 30, '&:hover': { bgcolor: '#10B981', color: '#FFFFFF' } }}
                        >
                          <ApproveIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          onClick={() => onRejectRequest(req.id)}
                          sx={{ bgcolor: '#FEF2F2', color: '#DC2626', width: 30, height: 30, '&:hover': { bgcolor: '#EF4444', color: '#FFFFFF' } }}
                        >
                          <RejectIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  {i < sellRequests.length - 1 && <Divider sx={{ borderColor: '#F1F5F9' }} />}
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{
            px: 3,
            py: 2,
            bgcolor: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              bgcolor: pendingAuditsCount === 0 ? '#ECFDF5' : '#FEF2F2',
              color: pendingAuditsCount === 0 ? '#059669' : '#DC2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {pendingAuditsCount === 0 ? (
                <CheckIcon sx={{ fontSize: 16 }} />
              ) : (
                <PendingIcon sx={{ fontSize: 16 }} />
              )}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                {pendingAuditsCount === 0 ? 'All Clear' : 'Review Required'}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748B', mt: 0.1 }}>
                {pendingAuditsCount === 0 ? 'No pending audits' : `${pendingAuditsCount} requests awaiting review`}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── WIDGETS ROW (3 Columns) ────────────────────────────── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '24px',
        mb: 4,
      }}>
        {/* Widget 1: Top Selling Brands */}
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Top Selling Brands</Typography>
          </Box>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            {topSellingBrands.map((b, i) => (
              <Box key={b.name}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: i === 0 ? '#6D28D9' : i === 1 ? '#2563EB' : i === 2 ? '#0D9488' : i === 3 ? '#D97706' : i === 4 ? '#E11D48' : '#64748B' }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>{b.name}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>{b.sales}</Typography>
                </Box>
                <Box sx={{ height: 5, borderRadius: 9999, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
                  <Box sx={{
                    height: '100%', borderRadius: 9999,
                    width: `${b.pct}%`,
                    background: i === 0 ? 'linear-gradient(90deg,#6D28D9,#8B5CF6)' : i === 1 ? 'linear-gradient(90deg,#2563EB,#60A5FA)' : i === 2 ? 'linear-gradient(90deg,#0D9488,#34D399)' : i === 3 ? 'linear-gradient(90deg,#D97706,#FBB94C)' : i === 4 ? 'linear-gradient(90deg,#E11D48,#FDA4AF)' : 'linear-gradient(90deg,#64748B,#94A3B8)',
                    transition: 'width 0.6s ease',
                  }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Widget 2: Cashback Stores */}
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Cashback Stores</Typography>
            <Button
              size="small"
              onClick={() => setOpenStoreDialog(true)}
              sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#6D28D9', textTransform: 'none', minWidth: 0, p: 0, '&:hover': { bgcolor: 'transparent', opacity: 0.8 } }}
            >
              + Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', divide: 'y' }}>
            {stores.map((store, i) => {
              const initials = store.name.substring(0, 1).toUpperCase() + store.name.substring(1, 2).toLowerCase();
              let badgeBg = '#F1F5F9';
              let badgeColor = '#475569';
              const nameLower = store.name.toLowerCase();
              if (nameLower.includes('amazon')) {
                badgeBg = '#FFF5E6';
                badgeColor = '#D97706';
              } else if (nameLower.includes('flipkart')) {
                badgeBg = '#E0F2FE';
                badgeColor = '#0284C7';
              } else if (nameLower.includes('ajio')) {
                badgeBg = '#FFF1F2';
                badgeColor = '#E11D48';
              } else if (nameLower.includes('nykaa')) {
                badgeBg = '#F5F3FF';
                badgeColor = '#7C3AED';
              }

              return (
                <Box key={store.id}>
                  <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: badgeColor }}>
                          {initials}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{store.name}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>{store.cashback} cashback</Typography>
                      </Box>
                    </Box>
                    <Box
                      onClick={() => onToggleStoreStatus(store.id)}
                      sx={{
                        px: 1.5, py: 0.4, borderRadius: '6px', cursor: 'pointer',
                        bgcolor: store.status === 'Live' ? '#ECFDF5' : '#FEF3C7',
                        color: store.status === 'Live' ? '#059669' : '#D97706',
                        fontSize: '0.72rem', fontWeight: 700,
                        transition: 'all 0.15s',
                        '&:hover': { opacity: 0.8 },
                      }}
                    >
                      {store.status}
                    </Box>
                  </Box>
                  {i < stores.length - 1 && <Divider sx={{ borderColor: '#F8FAFC' }} />}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Widget 3: System Status */}
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>System Status</Typography>
          </Box>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.2, flexGrow: 1 }}>
            {[
              { name: 'Woohoo API', status: 'Online' },
              { name: 'Razorpay', status: 'Online' },
              { name: 'MSG91 OTP', status: 'Online' },
            ].map(node => (
              <Box key={node.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>{node.name}</Typography>
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.6,
                  px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: '#ECFDF5', color: '#047857',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.4)' }} />
                  {node.status}
                </Box>
              </Box>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Last Sync</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{systemStatus.lastSync || '2h ago'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 700 }}>SVC Balance</Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#10B981', fontWeight: 800 }}>₹48,200</Typography>
            </Box>

            <Box sx={{ mt: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>SVC Balance used (82%)</Typography>
              </Box>
              <Box sx={{ height: 6, borderRadius: 9999, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: '82%', bgcolor: '#F59E0B', borderRadius: 9999 }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── NEW TABLES ROW (Recent Registrations & Recent Payments) ── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '24px',
        mb: 4,
        alignItems: 'start',
      }}>
        {/* Recent Registrations Table */}
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UsersIcon sx={{ color: '#7C3AED', fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Recent Registrations</Typography>
            </Box>
            <Button
              size="small"
              sx={{ fontSize: '0.74rem', fontWeight: 600, color: '#6D28D9', textTransform: 'none', '&:hover': { bgcolor: '#F5F3FF' } }}
              onClick={() => triggerToast('Opening user management...', 'info')}
            >
              View all →
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['Name', 'Phone', 'Wallet', 'Status'].map(h => (
                    <TableCell key={h} sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentRegistrations.map((reg, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' }, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.8, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>{reg.name}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.8, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>{reg.phone}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.8, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{reg.wallet}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.8, borderBottom: '1px solid #F1F5F9' }}>
                      <StatusChip status={reg.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Recent Payments Table */}
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCardIcon sx={{ color: '#2563EB', fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Recent Payments</Typography>
            </Box>
            <Button
              size="small"
              sx={{ fontSize: '0.74rem', fontWeight: 600, color: '#6D28D9', textTransform: 'none', '&:hover': { bgcolor: '#F5F3FF' } }}
              onClick={() => triggerToast('Opening payments details...', 'info')}
            >
              View all →
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['User', 'Type', 'Amount', 'Status'].map(h => (
                    <TableCell key={h} sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentPayments.map((pay, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' }, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.8, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>{pay.user}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.8, borderBottom: '1px solid #F1F5F9' }}>
                      <Box component="span" sx={{
                        display: 'inline-flex', alignItems: 'center', px: 1.2, py: 0.3,
                        borderRadius: '12px',
                        bgcolor: pay.type === 'Wallet' ? '#EFF6FF' : '#F5F3FF',
                        color: pay.type === 'Wallet' ? '#2563EB' : '#7C3AED',
                        fontSize: '0.72rem', fontWeight: 700,
                      }}>
                        {pay.type}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.8, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{pay.amount}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.8, borderBottom: '1px solid #F1F5F9' }}>
                      <StatusChip status={pay.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* ── ADD STORE DIALOG ──────────────────────────────────────── */}
      <Dialog open={openStoreDialog} onClose={() => setOpenStoreDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', border: '1px solid #E2E8F0' } }}>
        <form onSubmit={handleAddStoreSubmit}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', pb: 1 }}>
            Register Partner Store
          </DialogTitle>
          <DialogContent sx={{ pt: '8px !important' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  STORE NAME *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. Swiggy, Amazon"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  variant="outlined"
                  size="small"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
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
                  CASHBACK % *
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="e.g. 5.0"
                  value={cashbackPct}
                  onChange={e => setCashbackPct(e.target.value)}
                  variant="outlined"
                  size="small"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
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
                  STATUS *
                </Typography>
                <Select
                  value={storeStoreStatus}
                  onChange={e => setStoreStoreStatus(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    borderRadius: '10px',
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
                  <MenuItem value="Live">Live</MenuItem>
                  <MenuItem value="Paused">Paused</MenuItem>
                </Select>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setOpenStoreDialog(false)} color="inherit" sx={{ fontWeight: 600, borderRadius: '8px' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 600, borderRadius: '8px', background: 'linear-gradient(135deg,#6D28D9,#7C3AED)' }}>
              Add Store
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── FEATURE CARD DIALOG ───────────────────────────────────── */}
      <Dialog open={openFeatureDialog} onClose={() => setOpenFeatureDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', border: '1px solid #E2E8F0' } }}>
        <form onSubmit={handleFeatureSubmit}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', pb: 1 }}>
            Feature a Gift Card
          </DialogTitle>
          <DialogContent sx={{ pt: '8px !important' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                SELECT BRAND *
              </Typography>
              <Select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  borderRadius: '10px',
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
                <MenuItem value="Amazon">Amazon</MenuItem>
                <MenuItem value="Flipkart">Flipkart</MenuItem>
                <MenuItem value="Myntra">Myntra</MenuItem>
                <MenuItem value="Swiggy">Swiggy</MenuItem>
                <MenuItem value="Zomato">Zomato</MenuItem>
                <MenuItem value="Nykaa">Nykaa</MenuItem>
                <MenuItem value="Google Play">Google Play</MenuItem>
              </Select>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setOpenFeatureDialog(false)} color="inherit" sx={{ fontWeight: 600, borderRadius: '8px' }}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary" sx={{ fontWeight: 600, borderRadius: '8px' }}>
              Feature Card
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </Box>
  );
};

export default DashboardView;
