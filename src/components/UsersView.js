import React, { useState, useEffect } from 'react';
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
  IconButton,
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
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { userService } from '../services/userService';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as ActiveIcon,
  Block as BannedIcon,
  PeopleAlt as UsersIcon,
  AdminPanelSettings as ShieldIcon,
  Warning as WarningIcon,
  Paid as MoneyIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
  AccountBalance as BankIcon,
  Check as ApproveIcon,
  Clear as RejectIcon,
} from '@mui/icons-material';


// Initial Mock Users List with KYC and Bank Details
// eslint-disable-next-line no-unused-vars
const initialUsers = [];

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
    'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)',
    'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

let lastFetchTime = 0;

const UsersView = ({ triggerToast }) => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterKyc, setFilterKyc] = useState('All');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      if (response && response.success && response.result && response.result.data) {
        const mappedUsers = response.result.data.map((user) => {
          return {
            id: String(user.id),
            dbId: user.id,
            name: user.name || 'NA',
            phone: user.phone,
            email: user.email || 'N/A',
            balance: user.balance || 0,
            status: user.is_active === 1 ? 'Active' : 'Inactive',
            kycStatus: (!user.kyc_status || user.kyc_status === 'Not Submitted') ? 'Pending' : user.kyc_status,
            kycDocument: user.kyc_document || null,
            bankDetails: user.bank_details || null,
            joinedDate: user.createdAt ? user.createdAt.split('T')[0] : 'N/A',
          };
        });
        setUsersList(mappedUsers);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      triggerToast(error.message || 'Failed to fetch users from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetchTime > 500) {
      lastFetchTime = now;
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selected user for full detail view
  const [selectedUserForView, setSelectedUserForView] = useState(null);

  // Balance edit modal state
  const [openBalanceDialog, setOpenBalanceDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('Add');

  // Status edit modal state
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [targetStatus, setTargetStatus] = useState('Active');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const handleApproveKyc = (userId) => {
    setUsersList(prev =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedUser = { ...u, kycStatus: 'Approved' };
          if (selectedUserForView && selectedUserForView.id === userId) {
            setSelectedUserForView(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
    triggerToast('KYC document has been successfully approved.', 'success');
  };

  const handleRejectKyc = (userId) => {
    setUsersList(prev =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedUser = { ...u, kycStatus: 'Rejected' };
          if (selectedUserForView && selectedUserForView.id === userId) {
            setSelectedUserForView(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
    triggerToast('KYC document has been rejected.', 'error');
  };

  // Calculated Dynamic stats
  const totalUsersCount = usersList.length;
  const activeCount = usersList.filter((u) => u.status === 'Active').length;
  const reviewCount = usersList.filter((u) => u.status === 'Inactive').length;
  const totalWalletSum = usersList.reduce((sum, u) => sum + u.balance, 0);

  const handleOpenBalance = (user) => {
    setSelectedUser(user);
    setAdjustmentAmount('');
    setAdjustmentType('Add');
    setOpenBalanceDialog(true);
  };

  const handleBalanceSubmit = (e) => {
    if (e) e.preventDefault();
    if (!adjustmentAmount || isNaN(adjustmentAmount) || parseFloat(adjustmentAmount) <= 0) {
      triggerToast('Please input a valid positive number', 'warning');
      return;
    }
    const val = parseFloat(adjustmentAmount);
    setUsersList(prev =>
      prev.map((u) => {
        if (u.id === selectedUser.id) {
          const delta = adjustmentType === 'Add' ? val : -val;
          const newBal = Math.max(0, u.balance + delta);
          const updatedUser = { ...u, balance: newBal };
          if (selectedUserForView && selectedUserForView.id === u.id) {
            setSelectedUserForView(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
    triggerToast(
      `Wallet balance for ${selectedUser.name} has been ${adjustmentType === 'Add' ? 'credited with' : 'debited by'
      } ₹${val.toLocaleString('en-IN')}`,
      'success'
    );
    setOpenBalanceDialog(false);
  };



  const handleOpenStatus = (user) => {
    setSelectedUser(user);
    setTargetStatus(user.status === 'Active' ? 'Active' : 'Inactive');
    setOpenStatusDialog(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    const isActiveVal = targetStatus === 'Active' ? 1 : 0;
    setStatusUpdating(true);
    try {
      const response = await userService.updateUserStatus(selectedUser.dbId, isActiveVal);
      if (response && response.success) {
        setUsersList(prev =>
          prev.map((u) => {
            if (u.id === selectedUser.id) {
              const updatedUser = { ...u, status: targetStatus };
              if (selectedUserForView && selectedUserForView.id === u.id) {
                setSelectedUserForView(updatedUser);
              }
              return updatedUser;
            }
            return u;
          })
        );
        triggerToast(`Status for ${selectedUser.name} updated to "${targetStatus}"`, 'success');
        setOpenStatusDialog(false);
      } else {
        triggerToast(response.message || 'Failed to update user status', 'error');
      }
    } catch (err) {
      console.error('Update status error:', err);
      triggerToast(err.message || 'An error occurred while updating status', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
    const matchesKyc = filterKyc === 'All' || user.kycStatus === filterKyc;

    return matchesSearch && matchesStatus && matchesKyc;
  });

  if (selectedUserForView) {
    return (
      <Box sx={{ animation: 'fadeIn 0.4s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        {/* Back Button & Title Panel */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Button
              variant="text"
              startIcon={<BackIcon />}
              onClick={() => setSelectedUserForView(null)}
              sx={{
                color: '#6D28D9',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.9rem',
                mb: 1.5,
                p: 0,
                '&:hover': { bgcolor: 'transparent', opacity: 0.8 }
              }}
            >
              Back to User Directory
            </Button>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A' }}>
              Customer Account Details
            </Typography>
          </Box>
        </Box>

        {/* High-fidelity Detail Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' },
            gap: '28px',
            alignItems: 'start',
          }}
        >
          {/* LEFT SIDEBAR: PROFILE SUMMARY */}
          <Box sx={{ minWidth: 0 }}>
            <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Box
                sx={{
                  p: { xs: 2.5, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  bgcolor: '#F8FAFC',
                  borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                }}
              >
                <Avatar
                  sx={{
                    width: 88,
                    height: 88,
                    fontSize: '1.9rem',
                    fontWeight: 800,
                    background: getAvatarGradient(selectedUserForView.name),
                    boxShadow: '0 8px 24px rgba(109, 40, 217, 0.15)',
                    mb: 2.5,
                  }}
                >
                  {getInitials(selectedUserForView.name)}
                </Avatar>
                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
                  {selectedUserForView.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {selectedUserForView.email}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.6,
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      bgcolor:
                        selectedUserForView.status === 'Active'
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'rgba(239, 68, 68, 0.08)',
                      color:
                        selectedUserForView.status === 'Active'
                          ? '#10B981'
                          : '#EF4444',
                      border: `1px solid ${selectedUserForView.status === 'Active'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)'
                        }`,
                    }}
                  >
                    Account: {selectedUserForView.status}
                  </Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.6,
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      bgcolor:
                        selectedUserForView.kycStatus === 'Approved'
                          ? 'rgba(16, 185, 129, 0.08)'
                          : selectedUserForView.kycStatus === 'Pending'
                            ? 'rgba(245, 158, 11, 0.08)'
                            : selectedUserForView.kycStatus === 'Rejected'
                              ? 'rgba(239, 68, 68, 0.08)'
                              : 'rgba(100, 116, 139, 0.08)',
                      color:
                        selectedUserForView.kycStatus === 'Approved'
                          ? '#10B981'
                          : selectedUserForView.kycStatus === 'Pending'
                            ? '#F59E0B'
                            : selectedUserForView.kycStatus === 'Rejected'
                              ? '#EF4444'
                              : '#64748B',
                      border: `1px solid ${selectedUserForView.kycStatus === 'Approved'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : selectedUserForView.kycStatus === 'Pending'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : selectedUserForView.kycStatus === 'Rejected'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(100, 116, 139, 0.15)'
                        }`,
                    }}
                  >
                    KYC: {selectedUserForView.kycStatus || 'Pending'}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={750} sx={{ display: 'block', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CUSTOMER INFORMATION
                </Typography>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">User ID</Typography>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">{selectedUserForView.id}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">{selectedUserForView.phone}</Typography>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Box
                  sx={{
                    py: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                      Wallet Balance
                    </Typography>
                    <Typography variant="h5" fontWeight={900} color="#6D28D9">
                      ₹{selectedUserForView.balance.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleOpenBalance(selectedUserForView)}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      px: 2,
                      py: 0.8,
                      bgcolor: '#6D28D9',
                      '&:hover': { bgcolor: '#5B21B6' }
                    }}
                  >
                    Adjust
                  </Button>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* RIGHT AUDITING WORKSPACE */}
          <Box sx={{ minWidth: 0 }}>
            <Box display="flex" flexDirection="column" gap={3.5}>

              {/* 1. KYC Auditing Workspace Card */}
              <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Box
                  sx={{
                    px: { xs: 2.5, md: 3.5 },
                    py: 2.5,
                    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                    KYC Verification & Auditing
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.8,
                      px: 1.5,
                      py: 0.6,
                      borderRadius: '20px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      bgcolor:
                        selectedUserForView.kycStatus === 'Approved'
                          ? 'rgba(16, 185, 129, 0.08)'
                          : selectedUserForView.kycStatus === 'Pending'
                            ? 'rgba(245, 158, 11, 0.08)'
                            : selectedUserForView.kycStatus === 'Rejected'
                              ? 'rgba(239, 68, 68, 0.08)'
                              : 'rgba(100, 116, 139, 0.08)',
                      color:
                        selectedUserForView.kycStatus === 'Approved'
                          ? '#10B981'
                          : selectedUserForView.kycStatus === 'Pending'
                            ? '#F59E0B'
                            : selectedUserForView.kycStatus === 'Rejected'
                              ? '#EF4444'
                              : '#64748B',
                      border: `1px solid ${selectedUserForView.kycStatus === 'Approved'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : selectedUserForView.kycStatus === 'Pending'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : selectedUserForView.kycStatus === 'Rejected'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(100, 116, 139, 0.15)'
                        }`,
                    }}
                  >
                    {selectedUserForView.kycStatus || 'Pending'}
                  </Box>
                </Box>
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  {selectedUserForView.kycDocument ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Document Details Grid */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 2.5,
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, letterSpacing: '0.05em' }}>
                            DOCUMENT TYPE
                          </Typography>
                          <Typography variant="body1" fontWeight={750} color="#1E293B">
                            {selectedUserForView.kycDocument.type}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, letterSpacing: '0.05em' }}>
                            DOCUMENT NUMBER
                          </Typography>
                          <Typography variant="body1" fontWeight={750} color="#1E293B" sx={{ fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                            {selectedUserForView.kycDocument.number}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Attachment Preview Box */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.2, fontWeight: 700, letterSpacing: '0.05em' }}>
                          SUBMITTED DOCUMENT ATTACHMENT
                        </Typography>
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: '16px',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            bgcolor: '#F8FAFC',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1.5,
                            minHeight: 140,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: 'rgba(109, 40, 217, 0.2)',
                              bgcolor: 'rgba(109, 40, 217, 0.02)',
                            }
                          }}
                        >
                          <ShieldIcon sx={{ fontSize: 38, color: '#6D28D9', opacity: 0.8 }} />
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" fontWeight={850} color="#1E293B">
                              Verification Scan Proof
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                              {selectedUserForView.kycDocument.docUrl}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      {/* Reject and Approve Action Buttons */}
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<RejectIcon />}
                          disabled={selectedUserForView.kycStatus === 'Rejected'}
                          onClick={() => handleRejectKyc(selectedUserForView.id)}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            py: 1,
                            borderWidth: '1.5px',
                            '&:hover': { borderWidth: '1.5px' },
                            width: { xs: '100%', sm: 'auto' }
                          }}
                        >
                          Reject KYC Document
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<ApproveIcon />}
                          disabled={selectedUserForView.kycStatus === 'Approved'}
                          onClick={() => handleApproveKyc(selectedUserForView.id)}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            py: 1,
                            bgcolor: '#10B981',
                            '&:hover': { bgcolor: '#059669' },
                            boxShadow: 'none',
                            width: { xs: '100%', sm: 'auto' }
                          }}
                        >
                          Approve KYC Document
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                      <WarningIcon sx={{ fontSize: 36, color: '#F59E0B', opacity: 0.7 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        No KYC documents have been submitted by this user.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* 2. Bank Account Details Card */}
              <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Box
                  sx={{
                    px: 3.5,
                    py: 2.5,
                    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Box
                    sx={{
                      p: 0.8,
                      borderRadius: '8px',
                      bgcolor: 'rgba(109, 40, 217, 0.08)',
                      color: '#6D28D9',
                      display: 'flex'
                    }}
                  >
                    <BankIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                    User Bank Account Details
                  </Typography>
                </Box>
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  {selectedUserForView.bankDetails ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2.5,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, letterSpacing: '0.05em' }}>
                          BANK NAME
                        </Typography>
                        <Typography variant="body1" fontWeight={750} color="#1E293B">
                          {selectedUserForView.bankDetails.bankName}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, letterSpacing: '0.05em' }}>
                          ACCOUNT NUMBER
                        </Typography>
                        <Typography variant="body1" fontWeight={750} color="#1E293B" sx={{ fontFamily: 'monospace' }}>
                          {selectedUserForView.bankDetails.accountNumber}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, letterSpacing: '0.05em' }}>
                          ACCOUNT HOLDER NAME
                        </Typography>
                        <Typography variant="body1" fontWeight={750} color="#1E293B">
                          {selectedUserForView.bankDetails.holderName}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, letterSpacing: '0.05em' }}>
                          IFSC CODE
                        </Typography>
                        <Typography variant="body1" fontWeight={750} color="#1E293B" sx={{ fontFamily: 'monospace' }}>
                          {selectedUserForView.bankDetails.ifscCode}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                      <BankIcon sx={{ fontSize: 36, color: 'text.disabled', opacity: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        No bank details have been added by this user.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* 4-KPI Premium Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          gap: '20px',
          mb: 3,
        }}
      >
        {/* KPI 1: Total Customers */}
        <Card
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            bgcolor: '#FFFFFF',
            p: '16px 20px',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            '&:hover': {
              boxShadow: '0 4px 20px 0 rgba(109, 40, 217, 0.06)',
              borderColor: '#6D28D9',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                Total Customers
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {totalUsersCount}
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'rgba(109, 40, 217, 0.06)',
              color: '#6D28D9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <UsersIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Card>

        {/* KPI 2: Active Accounts */}
        <Card
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            bgcolor: '#FFFFFF',
            p: '16px 20px',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            '&:hover': {
              boxShadow: '0 4px 20px 0 rgba(16, 185, 129, 0.06)',
              borderColor: '#10B981',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                Active Accounts
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {activeCount}
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'rgba(16, 185, 129, 0.06)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ActiveIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Card>

        {/* KPI 3: Inactive Accounts */}
        <Card
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            bgcolor: '#FFFFFF',
            p: '16px 20px',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            '&:hover': {
              boxShadow: '0 4px 20px 0 rgba(239, 68, 68, 0.06)',
              borderColor: '#EF4444',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                Inactive Accounts
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {reviewCount}
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'rgba(239, 68, 68, 0.06)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <BannedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Card>

        {/* KPI 4: Wallet Reserves */}
        <Card
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            bgcolor: '#FFFFFF',
            p: '16px 20px',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            '&:hover': {
              boxShadow: '0 4px 20px 0 rgba(109, 40, 217, 0.06)',
              borderColor: '#6D28D9',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                Wallet Reserves
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                ₹{totalWalletSum.toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'rgba(109, 40, 217, 0.06)',
              color: '#6D28D9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <MoneyIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Main Table Card */}
      <Card sx={{ border: '1px solid #F1F5F9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Reconstructed Sleek Single-Row Filter Bar */}
          <Box
            sx={{
              p: 2.5,
              borderBottom: '1px solid #F1F5F9',
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* Left: Search input */}
            <Box sx={{ flexGrow: 1, maxWidth: { md: '380px' } }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, email, phone or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#6D28D9', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.85rem',
                    border: '1px solid #F1F5F9',
                    '& fieldset': { border: 'none' },
                    '&:hover': { bgcolor: '#F1F5F9' },
                    '&.Mui-focused': { bgcolor: '#FFFFFF', border: '1px solid #6D28D9', boxShadow: '0 0 0 2px rgba(109, 40, 217, 0.1)' }
                  }
                }}
              />
            </Box>

            {/* Right: Selects & Apply button */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'center', 
                gap: 1.5, 
                width: { xs: '100%', md: 'auto' },
                justifyContent: { xs: 'stretch', md: 'flex-end' } 
              }}
            >
              {/* Dropdown 1: Account Status */}
              <FormControl size="small" sx={{ flexGrow: { xs: 1, md: 0 }, minWidth: { xs: '120px', md: 130 } }}>
                <InputLabel sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    height: '38px',
                    bgcolor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6D28D9' }
                  }}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              {/* Button: Apply Filter */}
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#6D28D9',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  height: '38px',
                  px: 3,
                  flexGrow: { xs: 1, md: 0 },
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#5B21B6', boxShadow: 'none' }
                }}
                onClick={() => {
                  triggerToast(`Applied filters. Showing ${filteredUsers.length} records.`, 'info');
                }}
              >
                Apply Filter
              </Button>
            </Box>
          </Box>

          {/* Table Container */}
          <TableContainer
            sx={{
              width: '100%',
              maxHeight: 600,
              overflow: 'auto',
              boxSizing: 'border-box',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <Table stickyHeader sx={{ minWidth: 950 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 2, pl: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>USER ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>CUSTOMER</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>PHONE</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>EMAIL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>WALLET BALANCE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>ACCOUNT STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>JOINED DATE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem', py: 2, pr: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                        <CircularProgress size={40} color="primary" />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Loading registered users...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                        <UsersIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          No registered users match your criteria.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          bgcolor: 'rgba(109, 40, 217, 0.02) !important',
                          boxShadow: 'inset 4px 0 0 0 #6D28D9',
                        },
                      }}
                    >
                      {/* Column 1: User ID */}
                      <TableCell sx={{ py: 2.2, pl: 3 }}>
                        <Typography sx={{
                          color: '#6D28D9',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                        }}>
                          {user.id}
                        </Typography>
                      </TableCell>

                      {/* Column 2: Customer */}
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: getAvatarGradient(user.name),
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            }}
                          >
                            {getInitials(user.name)}
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem' }}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Column 3: Phone */}
                      <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.82rem', py: 2.2 }}>
                        {user.phone}
                      </TableCell>

                      {/* Column 4: Email */}
                      <TableCell sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.82rem', py: 2.2 }}>
                        {user.email}
                      </TableCell>

                      {/* Column 5: Wallet Balance */}
                      <TableCell align="right" sx={{ py: 2.2 }}>
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.8}>
                          <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#10B981',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                          }}>
                            ₹{user.balance.toLocaleString('en-IN')}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Column 6: Account Status */}
                      <TableCell align="center" sx={{ py: 2.2 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            color: user.status === 'Active' ? '#10B981' : '#EF4444',
                          }}
                        >
                          {user.status === 'Active' ? 'Active' : 'Inactive'}
                        </Box>
                      </TableCell>

                      {/* Column 7: Joined Date */}
                      <TableCell sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500, py: 2.2 }}>
                        {user.joinedDate}
                      </TableCell>

                      {/* Column 9: Actions */}
                      <TableCell align="right" sx={{ py: 2.2, pr: 3, whiteSpace: 'nowrap' }}>
                        <Box display="flex" justifyContent="flex-end" gap={1.2} flexWrap="nowrap">
                          <Tooltip title="View Profile Detail">
                            <IconButton
                              size="small"
                              onClick={() => setSelectedUserForView(user)}
                              sx={{
                                color: '#6D28D9',
                                bgcolor: 'rgba(109, 40, 217, 0.04)',
                                '&:hover': {
                                  bgcolor: '#6D28D9',
                                  color: '#FFFFFF',
                                  transform: 'translateY(-1.5px)',
                                  boxShadow: '0 4px 12px rgba(109, 40, 217, 0.2)'
                                },
                                width: 34,
                                height: 34,
                                borderRadius: '10px',
                                border: '1px solid rgba(109, 40, 217, 0.08)',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <ViewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Status">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenStatus(user)}
                              sx={{
                                color: '#F59E0B',
                                bgcolor: 'rgba(245, 158, 11, 0.04)',
                                '&:hover': {
                                  bgcolor: '#F59E0B',
                                  color: '#FFFFFF',
                                  transform: 'translateY(-1.5px)',
                                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                                },
                                width: 34,
                                height: 34,
                                borderRadius: '10px',
                                border: '1px solid rgba(245, 158, 11, 0.08)',
                                transition: 'all 0.2s ease',
                                marginLeft: '8px',
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
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

      {/* POPUP 1: Balance Adjustment Dialog */}
      <Dialog
        open={openBalanceDialog}
        onClose={() => setOpenBalanceDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
            maxWidth: 380,
            width: '100%',
          },
        }}
      >
        <form onSubmit={handleBalanceSubmit}>
          {/* Header Section */}
          <Box sx={{ pt: 3.5, px: 3.5, pb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 750, fontSize: '1.2rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
              Adjust Balance
            </Typography>
          </Box>

          <DialogContent sx={{ p: 0, px: 3.5, pb: 2 }}>
            {selectedUser && (
              <Box
                sx={{
                  mb: 2.5,
                  p: 2.5,
                  bgcolor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <Typography 
                  sx={{ 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    color: '#64748B', 
                    letterSpacing: '0.06em', 
                    textTransform: 'uppercase',
                    mb: 1
                  }}
                >
                  Customer Profile
                </Typography>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A', mb: 1 }}>
                  {selectedUser.name} <span style={{ color: '#64748B', fontWeight: 500 }}>({selectedUser.id})</span>
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                    Current Balance:
                  </Typography>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>
                    ₹{selectedUser.balance.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" gap={1.2}>
                  <Button
                    type="button"
                    fullWidth
                    variant={adjustmentType === 'Add' ? 'contained' : 'outlined'}
                    onClick={() => setAdjustmentType('Add')}
                    startIcon={<AddIcon />}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      py: 0.8,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      bgcolor: adjustmentType === 'Add' ? '#6D28D9' : 'transparent',
                      color: adjustmentType === 'Add' ? '#FFFFFF' : '#475569',
                      borderColor: adjustmentType === 'Add' ? '#6D28D9' : '#E5E7EB',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: adjustmentType === 'Add' ? '#5B21B6' : '#F1F5F9',
                        borderColor: adjustmentType === 'Add' ? '#5B21B6' : '#CBD5E1',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    Credit (Add)
                  </Button>
                  <Button
                    type="button"
                    fullWidth
                    variant={adjustmentType === 'Deduct' ? 'contained' : 'outlined'}
                    onClick={() => setAdjustmentType('Deduct')}
                    startIcon={<RemoveIcon />}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      py: 0.8,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      bgcolor: adjustmentType === 'Deduct' ? '#6D28D9' : 'transparent',
                      color: adjustmentType === 'Deduct' ? '#FFFFFF' : '#475569',
                      borderColor: adjustmentType === 'Deduct' ? '#6D28D9' : '#E5E7EB',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: adjustmentType === 'Deduct' ? '#5B21B6' : '#F1F5F9',
                        borderColor: adjustmentType === 'Deduct' ? '#5B21B6' : '#CBD5E1',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    Debit (Deduct)
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography 
                    sx={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 700, 
                      color: '#64748B', 
                      letterSpacing: '0.06em', 
                      textTransform: 'uppercase',
                      mb: 1
                    }}
                  >
                    Adjustment Value (INR) *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter amount (e.g. 500, 1000)"
                    type="number"
                    inputProps={{ min: '1', step: 'any' }}
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    variant="outlined"
                    size="small"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '42px',
                        borderRadius: '8px',
                        bgcolor: '#FFFFFF',
                        transition: 'all 0.2s',
                        '& fieldset': {
                          borderColor: '#E5E7EB',
                        },
                        '&:hover fieldset': {
                          borderColor: '#CBD5E1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6D28D9',
                          borderWidth: '2px',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { fontWeight: 600, color: '#64748B' } }}>₹</InputAdornment>,
                    }}
                  />
                </Box>
              </Grid>

              {/* Preset chips */}
              <Grid item xs={12}>
                <Typography 
                  sx={{ 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    color: '#64748B', 
                    letterSpacing: '0.06em', 
                    textTransform: 'uppercase',
                    mb: 1
                  }}
                >
                  Quick Presets
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {[250, 500, 1000, 2000, 5000].map((preset) => (
                    <Chip
                      key={preset}
                      label={`₹${preset}`}
                      onClick={() => setAdjustmentAmount(preset.toString())}
                      sx={{
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid #E5E7EB',
                        bgcolor: adjustmentAmount === preset.toString() ? '#F5F3FF' : '#FFFFFF',
                        color: adjustmentAmount === preset.toString() ? '#6D28D9' : '#475569',
                        borderColor: adjustmentAmount === preset.toString() ? '#6D28D9' : '#E5E7EB',
                        '&:hover': {
                          bgcolor: '#F5F3FF',
                          borderColor: '#6D28D9',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions 
            sx={{ 
              px: 3.5, 
              pb: 3.5, 
              pt: 1.5, 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 1.5
            }}
          >
            <Button
              onClick={() => setOpenBalanceDialog(false)}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                fontSize: '0.82rem', 
                color: '#64748B', 
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                px: 2,
                py: 0.8,
                borderRadius: '6px',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                borderRadius: '6px',
                px: 2.5,
                py: 0.8,
                bgcolor: '#6D28D9',
                color: '#FFFFFF',
                boxShadow: 'none',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  bgcolor: '#5B21B6',
                  boxShadow: 'none',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Confirm Adjustment
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* POPUP 2: Status Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
            maxWidth: 380,
            width: '100%',
          },
        }}
      >
        <form onSubmit={handleStatusSubmit}>
          {/* Header Section */}
          <Box sx={{ pt: 3.5, px: 3.5, pb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 750, fontSize: '1.2rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
              Update Status
            </Typography>
          </Box>

          <DialogContent sx={{ p: 0, px: 3.5, pb: 2 }}>
            <Box>
              <Typography 
                sx={{ 
                  fontSize: '0.68rem', 
                  fontWeight: 700, 
                  color: '#64748B', 
                  letterSpacing: '0.06em', 
                  textTransform: 'uppercase',
                  mb: 1
                }}
              >
                Status
              </Typography>
              <Select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                fullWidth
                sx={{
                  height: '42px',
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                    borderWidth: '1px',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#CBD5E1',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6D28D9',
                    borderWidth: '2px',
                  },
                  '& .MuiSelect-select': {
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                  }
                }}
              >
                <MenuItem value="Active" sx={{ py: 1, fontSize: '0.85rem', fontWeight: 500 }}>
                  Active
                </MenuItem>
                <MenuItem value="Inactive" sx={{ py: 1, fontSize: '0.85rem', fontWeight: 500 }}>
                  Inactive
                </MenuItem>
              </Select>
            </Box>
          </DialogContent>

          <DialogActions 
            sx={{ 
              px: 3.5, 
              pb: 3.5, 
              pt: 1.5, 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 1.5
            }}
          >
            <Button
              onClick={() => setOpenStatusDialog(false)}
              disabled={statusUpdating}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                fontSize: '0.82rem', 
                color: '#64748B', 
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                px: 2,
                py: 0.8,
                borderRadius: '6px',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={statusUpdating}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                borderRadius: '6px',
                px: 2.5,
                py: 0.8,
                bgcolor: '#6D28D9',
                color: '#FFFFFF',
                boxShadow: 'none',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  bgcolor: '#5B21B6',
                  boxShadow: 'none',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&.Mui-disabled': {
                  bgcolor: '#E2E8F0',
                  color: '#94A3B8',
                },
              }}
            >
              {statusUpdating ? <CircularProgress size={16} color="inherit" /> : 'Update Status'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UsersView;
