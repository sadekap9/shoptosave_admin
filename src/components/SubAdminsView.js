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
} from '@mui/material';
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

const initialSubAdmins = [
  { id: 'SADM-001', name: 'Rohan Sharma', email: 'rohan.s@shop2save.in', phone: '+91 99887 76655', menuAccess: ['Dashboard', 'Gift Cards', 'Categories'], status: 'Active', created: '2026-05-10 11:00' },
  { id: 'SADM-002', name: 'Aditi Patel', email: 'aditi.p@shop2save.in', phone: '+91 88776 65544', menuAccess: ['Dashboard', 'Categories', 'Redeem Orders'], status: 'Active', created: '2026-05-12 15:30' },
  { id: 'SADM-003', name: 'Vikram Singh', email: 'vikram.s@shop2save.in', phone: '+91 77665 54433', menuAccess: ['Dashboard', 'Partner Stores'], status: 'Inactive', created: '2026-05-15 09:45' },
  { id: 'SADM-004', name: 'Neha Gupta', email: 'neha.g@shop2save.in', phone: '+91 66554 43322', menuAccess: ['Dashboard', 'User Accounts'], status: 'Active', created: '2026-05-18 14:15' },
];

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
  const [subAdmins, setSubAdmins] = useState(initialSubAdmins);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [menuFilter, setMenuFilter] = useState('All');

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



  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!subName.trim() || !subEmail.trim() || !subPhone.trim() || !subPassword.trim()) {
      triggerToast('Please fill in all required fields', 'warning');
      return;
    }

    // Auto-generate numeric ID
    let nextIdNum = 1;
    if (subAdmins.length > 0) {
      const ids = subAdmins.map((s) => parseInt(s.id.replace('SADM-', ''))).filter((n) => !isNaN(n));
      if (ids.length > 0) {
        nextIdNum = Math.max(...ids) + 1;
      }
    }
    const generatedId = `SADM-${String(nextIdNum).padStart(3, '0')}`;

    // Format current date
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newSubAdmin = {
      id: generatedId,
      name: subName.trim(),
      email: subEmail.trim(),
      phone: subPhone.trim(),
      menuAccess: subMenuAccess,
      status: subStatus,
      created: formattedDate,
    };

    setSubAdmins([...subAdmins, newSubAdmin]);
    triggerToast(`Sub-Admin account for "${newSubAdmin.name}" created successfully!`, 'success');

    // Reset fields & close
    setSubName('');
    setSubEmail('');
    setSubPhone('');
    setSubPassword('');
    setSubMenuAccess(['Dashboard']);
    setSubStatus('Active');
    setShowPassword(false);
    setOpenAddDialog(false);
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

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editPhone.trim()) {
      triggerToast('Please fill in all required fields', 'warning');
      return;
    }

    setSubAdmins(
      subAdmins.map((s) => {
        if (s.id === selectedSub.id) {
          return {
            ...s,
            name: editName.trim(),
            email: editEmail.trim(),
            phone: editPhone.trim(),
            menuAccess: editMenuAccess,
            status: editStatus,
          };
        }
        return s;
      })
    );

    if (editPassword.trim()) {
      triggerToast(`Account for "${editName}" updated successfully (including password)!`, 'success');
    } else {
      triggerToast(`Account for "${editName}" updated successfully!`, 'success');
    }
    setOpenEditDialog(false);
  };

  const handleOpenDelete = (sub) => {
    setSelectedSub(sub);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedSub) {
      setSubAdmins(subAdmins.filter((s) => s.id !== selectedSub.id));
      triggerToast(`Sub-Admin account for "${selectedSub.name}" has been deleted.`, 'error');
      setOpenDeleteDialog(false);
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
                {filteredSubAdmins.length === 0 ? (
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
