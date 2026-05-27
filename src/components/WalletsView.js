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
  Grid,
  TextField,
  InputAdornment,
  Button,
  Avatar,
} from '@mui/material';
import {
  AccountBalance as ReservesIcon,
  MonetizationOn as DisbursedIcon,
  HourglassEmpty as PendingIcon,
  Search as SearchIcon,
  GetApp as ExportIcon,
  ChevronRight as ChevronRightIcon,
  ReceiptLong as LedgerIcon,
} from '@mui/icons-material';

// Helper to get initials
const getInitials = (name) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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

const initialLedgers = [
  { id: 'TXN-99042', user: 'Ravi Kumar M.', type: 'Cashback Credit', amount: '₹145', status: 'Settled', date: '2026-05-22' },
  { id: 'TXN-99041', user: 'Amit Verma K.', type: 'Card Sold Refund', amount: '₹500', status: 'Settled', date: '2026-05-22' },
  { id: 'TXN-99040', user: 'Priya Sharma S.', type: 'Cashback Credit', amount: '₹75', status: 'Settled', date: '2026-05-21' },
  { id: 'TXN-99039', user: 'Rahul Saxena S.', type: 'Bulk Wallet Add', amount: '₹4,500', status: 'Settled', date: '2026-05-21' },
  { id: 'TXN-99038', user: 'Meera Rawat R.', type: 'Cashback Credit', amount: '₹110', status: 'Settled', date: '2026-05-20' },
  { id: 'TXN-99037', user: 'Dev Patel P.', type: 'Cashback Credit', amount: '₹35', status: 'Settled', date: '2026-05-20' },
];

const WalletsView = ({ triggerToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ledgers] = useState(initialLedgers);

  const filteredLedgers = ledgers.filter((l) =>
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header section with breadcrumbs */}
      <Box sx={{ mb: 4 }} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Finances
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Ledger
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Platform Ledger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor user wallet balances, disbursed cashback reports, and operational financial ledger logs.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ExportIcon />}
          onClick={() => triggerToast('Generating comprehensive audit spreadsheets...', 'success')}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 650,
            px: 2.5,
            py: 1,
            border: '1px solid rgba(109, 40, 217, 0.25)',
          }}
        >
          Export Ledger
        </Button>
      </Box>

      {/* Reserves Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                    User Wallet Liability
                  </Typography>
                  <Typography variant="h4" fontWeight={850} color="#0F172A" sx={{ mb: 0.5 }}>
                    ₹4,82,400
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Combined value of active user wallets
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(109, 40, 217, 0.08)',
                    color: '#6D28D9',
                    display: 'flex',
                  }}
                >
                  <ReservesIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                    Cashback Disbursed
                  </Typography>
                  <Typography variant="h4" fontWeight={850} color="#10B981" sx={{ mb: 0.5 }}>
                    ₹1,24,900
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total rewards disbursed to date
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                    color: '#10B981',
                    display: 'flex',
                  }}
                >
                  <DisbursedIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                    Pending Payout Reserve
                  </Typography>
                  <Typography variant="h4" fontWeight={850} color="#F59E0B" sx={{ mb: 0.5 }}>
                    ₹24,500
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Reserves locked for active audits
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(245, 158, 11, 0.08)',
                    color: '#F59E0B',
                    display: 'flex',
                  }}
                >
                  <PendingIcon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ledger Table Section */}
      <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            sx={{ p: 3, borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}
          >
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
              System Ledger Transactions
            </Typography>
            <TextField
              size="small"
              placeholder="Search ledger by transaction ID or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                minWidth: 320,
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
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>TRANSACTION ID</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>SETTLEMENT DATE</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>CUSTOMER</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>ACTIVITY TYPE</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>LEDGER IMPACT</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pr: 3 }}>SETTLEMENT STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLedgers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                        <LedgerIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          No transactions recorded matching your search.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLedgers.map((txn) => {
                    const isDeduction = txn.type.toLowerCase().includes('deduct');
                    return (
                      <TableRow
                        key={txn.id}
                        hover
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(109, 40, 217, 0.015) !important',
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 700, color: '#6D28D9', fontFamily: 'monospace' }}>
                          {txn.id}
                        </TableCell>
                        <TableCell sx={{ color: '#475569' }}>{txn.date}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: getAvatarGradient(txn.user),
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                              }}
                            >
                              {getInitials(txn.user)}
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight={700} color="#1E293B">
                              {txn.user}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                          {txn.type}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: isDeduction ? '#EF4444' : '#10B981' }}>
                          {isDeduction ? '-' : '+'}{txn.amount}
                        </TableCell>
                        <TableCell align="center" sx={{ pr: 3 }}>
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
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: '#10B981',
                              }}
                            />
                            {txn.status}
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
    </Box>
  );
};

export default WalletsView;
