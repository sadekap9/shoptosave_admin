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
  Select,
  Tooltip,
  IconButton,
  Chip,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { subadminService } from '../services/subadminService';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SupervisorAccount as SubAdminIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

// Helper to get initials
const getInitials = (name) => {
  return name.substring(0, 2).toUpperCase();
};

// Helper to get matching avatar gradient
const getAvatarGradient = (name) => {
  const colors = [
    'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
    'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
    'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch (e) {
    return isoString;
  }
};

const MENU_ACCESS_STORAGE_KEY = 's2s_subadmin_menu_access';

const getStoredMenuAccess = () => {
  try {
    const data = localStorage.getItem(MENU_ACCESS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to parse sub-admin menu access:', e);
    return {};
  }
};

const saveStoredMenuAccess = (email, menus) => {
  try {
    const data = getStoredMenuAccess();
    data[email.toLowerCase()] = menus;
    localStorage.setItem(MENU_ACCESS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save sub-admin menu access:', e);
  }
};

const deleteStoredMenuAccess = (email) => {
  try {
    const data = getStoredMenuAccess();
    delete data[email.toLowerCase()];
    localStorage.setItem(MENU_ACCESS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to delete sub-admin menu access:', e);
  }
};

const availableMenus = [
  'Dashboard',
  'User Accounts',
  'Gift Cards',
  'Categories',
  'Redeem Orders',
  'Sell Requests',
  'Sync Woohoo',
  'Partner Stores',
  'Earnings Ledger',
  'System Wallets',
];

const SubAdminsView = ({ triggerToast }) => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [menuFilter, setMenuFilter] = useState('All');

  const fetchSubAdmins = async () => {
    setLoading(true);
    try {
      const response = await subadminService.getSubAdmins();
      if (response && response.success && response.result && response.result.data) {
        const storedAccess = getStoredMenuAccess();
        const mappedSubAdmins = response.result.data.map((sub) => {
          const emailKey = sub.email.toLowerCase();
          const menuAccess = storedAccess[emailKey] || ['Dashboard'];
          return {
            id: `SADM-${String(sub.id).padStart(3, '0')}`,
            dbId: sub.id,
            name: sub.name,
            email: sub.email,
            phone: sub.phone,
            menuAccess: menuAccess,
            status: (sub.is_active !== undefined ? sub.is_active === 1 : sub.status === 1) ? 'Active' : 'Inactive',
            created: formatDateTime(sub.createdAt || sub.created_at),
          };
        });
        setSubAdmins(mappedSubAdmins);
      }
    } catch (error) {
      console.error('Fetch sub-admins error:', error);
      triggerToast(error.message || 'Failed to fetch sub-admins from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Form input states (Add)
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subPassword, setSubPassword] = useState('');
  const [subMenuAccess, setSubMenuAccess] = useState(['Dashboard']);
  const [subStatus, setSubStatus] = useState('Active');

  // Form input states (Edit)
  const [selectedSub, setSelectedSub] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState(''); // Optional password update
  const [editMenuAccess, setEditMenuAccess] = useState([]);
  const [editStatus, setEditStatus] = useState('Active');



  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!subName.trim() || !subEmail.trim() || !subPhone.trim() || !subPassword.trim()) {
      triggerToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const response = await subadminService.addSubAdmin(
        subName.trim(),
        subEmail.trim(),
        subPhone.trim(),
        subPassword.trim(),
        subStatus
      );

      if (response && response.success) {
        // Save static menu access to localStorage mapped by email
        saveStoredMenuAccess(subEmail.trim(), subMenuAccess);

        triggerToast(`Sub-Admin account for "${subName.trim()}" created successfully!`, 'success');

        // Reset fields & close
        setSubName('');
        setSubEmail('');
        setSubPhone('');
        setSubPassword('');
        setSubMenuAccess(['Dashboard']);
        setSubStatus('Active');
        setShowPassword(false);
        setOpenAddDialog(false);

        // Refresh list
        fetchSubAdmins();
      } else {
        triggerToast(response.message || 'Failed to create sub-admin', 'error');
      }
    } catch (err) {
      console.error('Add Sub-Admin error:', err);
      triggerToast(err.message || 'An error occurred while creating the sub-admin', 'error');
    }
  };

  const handleOpenEdit = (sub) => {
    setSelectedSub(sub);
    setEditName(sub.name);
    setEditEmail(sub.email);
    setEditPhone(sub.phone);
    setEditPassword(''); // Blank initially, only updated if typed
    setEditMenuAccess(sub.menuAccess || []);
    setEditStatus(sub.status);
    setShowPassword(false);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editPhone.trim()) {
      triggerToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const dbId = selectedSub.dbId;
      const response = await subadminService.updateSubAdmin(
        dbId,
        editName.trim(),
        editEmail.trim(),
        editPhone.trim(),
        editPassword.trim(),
        editStatus
      );

      if (response && response.success) {
        // If email has changed, we should clean up the old email storage
        if (selectedSub.email.toLowerCase() !== editEmail.trim().toLowerCase()) {
          deleteStoredMenuAccess(selectedSub.email);
        }
        // Save static menu access to localStorage mapped by email
        saveStoredMenuAccess(editEmail.trim(), editMenuAccess);

        if (editPassword.trim()) {
          triggerToast(`Account for "${editName}" updated successfully (including password)!`, 'success');
        } else {
          triggerToast(`Account for "${editName}" updated successfully!`, 'success');
        }
        setOpenEditDialog(false);
        // Refresh list
        fetchSubAdmins();
      } else {
        triggerToast(response.message || 'Failed to update sub-admin', 'error');
      }
    } catch (err) {
      console.error('Edit Sub-Admin error:', err);
      triggerToast(err.message || 'An error occurred while updating the sub-admin', 'error');
    }
  };

  const handleOpenDelete = (sub) => {
    setSelectedSub(sub);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSub) {
      try {
        const dbId = selectedSub.dbId;
        const response = await subadminService.deleteSubAdmin(dbId);
        if (response && response.success) {
          // Delete static menu access mapping from localStorage
          deleteStoredMenuAccess(selectedSub.email);

          triggerToast(`Sub-Admin account for "${selectedSub.name}" has been deleted.`, 'error');
          setOpenDeleteDialog(false);
          // Refresh list
          fetchSubAdmins();
        } else {
          triggerToast(response.message || 'Failed to delete sub-admin', 'error');
        }
      } catch (err) {
        console.error('Delete Sub-Admin error:', err);
        triggerToast(err.message || 'An error occurred while deleting the sub-admin', 'error');
      }
    }
  };

  const filteredSubAdmins = subAdmins.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;
    const matchesMenu = menuFilter === 'All' || (sub.menuAccess && sub.menuAccess.includes(menuFilter));

    return matchesSearch && matchesStatus && matchesMenu;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header with Title & Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Sub-Admins
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
          Add Sub-Admin
        </Button>
      </Box>

     

      {/* Main card Sub-Admin directory */}
      <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Search & Filter Row */}
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
              size="small"
              placeholder="Search by ID, name or email..."
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

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl size="small" sx={{ width: '180px' }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
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
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Active">Active Only</MenuItem>
                  <MenuItem value="Inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ width: '180px' }}>
                <Select
                  value={menuFilter}
                  onChange={(e) => setMenuFilter(e.target.value)}
                  displayEmpty
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
                  <MenuItem value="All">All Menus</MenuItem>
                  {availableMenus.map((menu) => (
                    <MenuItem key={menu} value={menu}>
                      {menu}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pl: 3 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>SUB-ADMIN</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>CONTACT DETAILS</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>MENU ACCESS</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>CREATED AT</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>STATUS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pr: 3 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <CircularProgress size={40} color="primary" />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Loading sub-admins...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filteredSubAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <SubAdminIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          No sub-admins found matching criteria.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubAdmins.map((sub) => {
                    const isActive = sub.status === 'Active';
                    return (
                      <TableRow
                        key={sub.id}
                        hover
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(109, 40, 217, 0.015) !important',
                          },
                        }}
                      >
                        <TableCell sx={{ pl: 3 }}>
                          <Typography variant="subtitle2" fontWeight={800} color="#64748B">
                            {sub.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                background: getAvatarGradient(sub.name),
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
                              {getInitials(sub.name)}
                            </Box>
                            <Typography variant="subtitle2" fontWeight={750} color="#1E293B">
                              {sub.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#475569' }}>
                              <EmailIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                              <Typography variant="caption" fontWeight={550}>
                                {sub.email}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#475569' }}>
                              <PhoneIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                              <Typography variant="caption" fontWeight={550}>
                                {sub.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '280px' }}>
                            {sub.menuAccess && sub.menuAccess.map((menu) => (
                              <Chip
                                key={menu}
                                label={menu}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  bgcolor: 'rgba(109, 40, 217, 0.06)',
                                  color: '#6D28D9',
                                  border: '1px solid rgba(109, 40, 217, 0.12)',
                                  borderRadius: '6px',
                                  height: '20px',
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {sub.created}
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
                              bgcolor: isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                              color: isActive ? '#10B981' : '#EF4444',
                              border: isActive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)',
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: isActive ? '#10B981' : '#EF4444',
                              }}
                            />
                            {sub.status}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Configure Account settings">
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
                                onClick={() => handleOpenEdit(sub)}
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Sub-Admin">
                              <IconButton
                                size="small"
                                sx={{
                                  color: '#EF4444',
                                  bgcolor: 'rgba(239, 68, 68, 0.05)',
                                  '&:hover': {
                                    bgcolor: '#EF4444',
                                    color: '#FFFFFF',
                                  },
                                  width: 32,
                                  height: 32,
                                  transition: 'all 0.2s',
                                }}
                                onClick={() => handleOpenDelete(sub)}
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
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

      {/* DIALOG 1: Add Sub-Admin */}
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
            <SubAdminIcon sx={{ fontSize: 20 }} />
          </Box>
          Create Sub-Admin
        </DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  NAME *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. Rahul Verma"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
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

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  EMAIL ADDRESS *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. rahul@shop2save.in"
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
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

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  PHONE NUMBER *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. +91 98765 43210"
                  value={subPhone}
                  onChange={(e) => setSubPhone(e.target.value)}
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

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  ACCESS PASSWORD *
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={subPassword}
                  onChange={(e) => setSubPassword(e.target.value)}
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  MENU ACCESS PERMISSIONS
                </Typography>
                <Box sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '12px', p: 2, bgcolor: '#F8FAFC' }}>
                  <Grid container spacing={1}>
                    {availableMenus.map((menu) => {
                      const isChecked = subMenuAccess.includes(menu);
                      return (
                        <Grid item xs={6} key={menu}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSubMenuAccess([...subMenuAccess, menu]);
                                  } else {
                                    setSubMenuAccess(subMenuAccess.filter((m) => m !== menu));
                                  }
                                }}
                                color="primary"
                                size="small"
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 550, color: '#475569' }}>
                                {menu}
                              </Typography>
                            }
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  VISIBILITY STATUS *
                </Typography>
                <Select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value)}
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
                  <MenuItem value="Active">Active (Permitted)</MenuItem>
                  <MenuItem value="Inactive">Inactive (Suspended)</MenuItem>
                </Select>
              </Box>
            </Box>
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
              Register Account
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG 2: Edit Sub-Admin */}
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
          Modify Sub-Admin Account
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            {selectedSub && (
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
                  ACCOUNT IDENTIFIER
                </Typography>
                <Typography variant="subtitle2" color="#0F172A" fontWeight={750}>
                  ID: {selectedSub.id}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Registered on: <strong>{selectedSub.created}</strong>
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  NAME *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. Rahul Verma"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  EMAIL ADDRESS *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. rahul@shop2save.in"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
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

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  PHONE NUMBER *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. +91 98765 43210"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
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

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  RESET PASSWORD (OPTIONAL)
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Leave blank to keep current password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  variant="outlined"
                  size="small"
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  MENU ACCESS PERMISSIONS
                </Typography>
                <Box sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '12px', p: 2, bgcolor: '#F8FAFC' }}>
                  <Grid container spacing={1}>
                    {availableMenus.map((menu) => {
                      const isChecked = editMenuAccess.includes(menu);
                      return (
                        <Grid item xs={6} key={menu}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditMenuAccess([...editMenuAccess, menu]);
                                  } else {
                                    setEditMenuAccess(editMenuAccess.filter((m) => m !== menu));
                                  }
                                }}
                                color="primary"
                                size="small"
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 550, color: '#475569' }}>
                                {menu}
                              </Typography>
                            }
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  VISIBILITY STATUS *
                </Typography>
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
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
                  <MenuItem value="Active">Active (Permitted)</MenuItem>
                  <MenuItem value="Inactive">Inactive (Suspended)</MenuItem>
                </Select>
              </Box>
            </Box>
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
              Save Details
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG 3: Delete Confirmation */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
            }}
          >
            <DeleteIcon sx={{ fontSize: 20 }} />
          </Box>
          Remove Credentials
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            Are you sure you want to revoke sub-admin credentials for <strong>"{selectedSub?.name}"</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Revoking credentials will block their dashboard session immediately. They will not be able to log in to perform administrative tasks.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            color="inherit"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 650,
              borderRadius: '10px',
              px: 2.5,
            }}
          >
            Revoke Access
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubAdminsView;
