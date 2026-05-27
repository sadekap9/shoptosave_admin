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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as DateIcon,
  ChevronRight as ChevronRightIcon,
  ShoppingBag as OrdersIcon,
  CheckCircle as CompleteIcon,
  HourglassEmpty as PendingIcon,
  Paid as RevenueIcon,
} from '@mui/icons-material';

const OrdersView = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Dynamically calculate order statistics
  const totalCount = orders.length;
  const completeCount = orders.filter((o) => o.status === 'Complete').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const failedCount = orders.filter((o) => o.status === 'Failed').length;
  
  // Calculate total checkout volume
  const totalVolume = orders.reduce((sum, o) => {
    const numericStr = o.amount.replace(/[^0-9]/g, '');
    const value = parseFloat(numericStr) || 0;
    return sum + value;
  }, 0);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header section with breadcrumbs */}
      <Box sx={{ mb: 4 }} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sales
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Orders Ledger
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Gift Card Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track transaction purchases, order processing pipelines, and client distributions.
          </Typography>
        </Box>
      </Box>

      {/* Orders quick stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Total Orders
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    background: 'rgba(109, 40, 217, 0.08)',
                    color: '#6D28D9',
                    display: 'flex',
                  }}
                >
                  <OrdersIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                {totalCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Purchased gift cards
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Completed Handover
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    color: '#10B981',
                    display: 'flex',
                  }}
                >
                  <CompleteIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, color: '#10B981' }}>
                {completeCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Delivered successfully
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Active Handover / Failed
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    color: '#F59E0B',
                    display: 'flex',
                  }}
                >
                  <PendingIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, color: '#F59E0B' }}>
                {processingCount} <span style={{ fontSize: '1rem', color: '#EF4444', fontWeight: 600 }}>/ {failedCount} Failed</span>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Processing queue status
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Total Volume
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    background: 'rgba(13, 148, 136, 0.08)',
                    color: '#0D9488',
                    display: 'flex',
                  }}
                >
                  <RevenueIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                ₹{totalVolume.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total checkout value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Filters Row */}
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            sx={{
              p: 3,
              borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: '#FFFFFF',
              alignItems: 'center',
            }}
          >
            <TextField
              sx={{
                flexGrow: 1,
                minWidth: 280,
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
              placeholder="Search by order ID, customer name, or brand..."
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
                },
              }}
            >
              <InputLabel id="order-status-filter-label">Order Status</InputLabel>
              <Select
                labelId="order-status-filter-label"
                value={statusFilter}
                label="Order Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Orders</MenuItem>
                <MenuItem value="Complete">Complete</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Orders Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>ORDER ID</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>TIMESTAMP</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>CUSTOMER</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>GIFT CARD BRAND</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>VALUE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pr: 3 }}>DELIVERY STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                        <OrdersIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          No orders recorded matching your criteria.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      sx={{
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(109, 40, 217, 0.015) !important',
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: '#6D28D9', fontFamily: 'monospace' }}>
                        {order.id}
                      </TableCell>
                      <TableCell sx={{ color: '#475569' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DateIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                          <Typography variant="body2" color="#475569" sx={{ fontSize: '0.85rem' }}>
                            {order.timestamp || '2026-05-22 10:15'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>
                        {order.user}
                      </TableCell>
                      <TableCell sx={{ color: '#1E293B', fontWeight: 500 }}>{order.brand}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {order.amount}
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
                            bgcolor:
                              order.status === 'Complete'
                                ? 'rgba(16, 185, 129, 0.08)'
                                : order.status === 'Processing'
                                ? 'rgba(245, 158, 11, 0.08)'
                                : 'rgba(239, 68, 68, 0.08)',
                            color:
                              order.status === 'Complete'
                                ? '#10B981'
                                : order.status === 'Processing'
                                ? '#F59E0B'
                                : '#EF4444',
                            border:
                              order.status === 'Complete'
                                ? '1px solid rgba(16, 185, 129, 0.15)'
                                : order.status === 'Processing'
                                ? '1px solid rgba(245, 158, 11, 0.15)'
                                : '1px solid rgba(239, 68, 68, 0.15)',
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor:
                                order.status === 'Complete'
                                  ? '#10B981'
                                  : order.status === 'Processing'
                                  ? '#F59E0B'
                                  : '#EF4444',
                            }}
                          />
                          {order.status}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrdersView;
