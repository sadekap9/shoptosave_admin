import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  Avatar,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CancelIcon,
  Shield as ShieldIcon,
  Https as HttpsIcon,
  History as HistoryIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';

// Helper to get initials dynamically from name
const getInitials = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ProfileView = ({ adminProfile, onUpdateProfile, triggerToast }) => {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Form Fields State
  const [name, setName] = useState(adminProfile.name);
  const [email, setEmail] = useState(adminProfile.email);
  const [phone, setPhone] = useState(adminProfile.phone);

  // Validation errors
  const [errors, setErrors] = useState({});

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCancel = () => {
    setName(adminProfile.name);
    setEmail(adminProfile.email);
    setPhone(adminProfile.phone);
    setErrors({});
    setEditMode(false);
    triggerToast('Profile changes discarded', 'info');
  };

  const handleSave = () => {
    // Basic validation
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!phone.trim()) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerToast('Please fix the errors in the form', 'error');
      return;
    }

    // Apply updates
    const initials = getInitials(name);
    const updated = {
      ...adminProfile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatarInitials: initials,
    };

    onUpdateProfile(updated);
    setEditMode(false);
    triggerToast('Administrator profile updated successfully!', 'success');
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out-back', width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 1 }}>
          Administrator Account Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your credentials, edit security configurations, and view workspace status.
        </Typography>
      </Box>

      {/* Main Profile Grid Wrapper */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '350px 1fr' },
          gap: '28px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: AVATAR & QUICK STATS */}
        <Box sx={{ minWidth: 0 }}>
          <Card
            sx={{
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            }}
          >
            {/* Gradient Avatar Header */}
            <Box
              sx={{
                p: 4,
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
                  width: 96,
                  height: 96,
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)',
                  boxShadow: '0 8px 24px rgba(109, 40, 217, 0.18)',
                  mb: 2.5,
                }}
              >
                {adminProfile.avatarInitials}
              </Avatar>
              <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
                {adminProfile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                {adminProfile.email}
              </Typography>

              {/* Status Badges */}
              <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.6,
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                  }}
                >
                  Status: Online
                </Box>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.6,
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(109, 40, 217, 0.08)',
                    color: '#6D28D9',
                    border: '1px solid rgba(109, 40, 217, 0.15)',
                  }}
                >
                  Role: Super Admin
                </Box>
              </Box>
            </Box>

            {/* Quick Stats list */}
            <Box sx={{ p: 3 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={750}
                sx={{ display: 'block', mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Security & Access Meta
              </Typography>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Access Group</Typography>
                <Typography variant="body2" fontWeight={700} color="#0F172A">System Admins</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Access Level</Typography>
                <Typography variant="body2" fontWeight={700} color="#6D28D9">Level 5 (Max)</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">2FA Status</Typography>
                <Typography variant="body2" fontWeight={700} color="#10B981">Enabled (MFA)</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Session Age</Typography>
                <Typography variant="body2" fontWeight={700} color="#0F172A">1h 40m</Typography>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* RIGHT COLUMN: DETAIL TABS & SETTINGS */}
        <Box sx={{ minWidth: 0 }}>
          <Card
            sx={{
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              overflow: 'visible',
            }}
          >
            {/* Premium Tabs Panel */}
            <Box
              sx={{
                px: 3.5,
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                bgcolor: '#FFFFFF',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTabs-indicator': {
                    height: '3px',
                    borderRadius: '3px 3px 0 0',
                    bgcolor: '#6D28D9',
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    minWidth: 100,
                    px: 1,
                    py: 2.2,
                    color: '#64748B',
                    '&.Mui-selected': {
                      color: '#6D28D9',
                    },
                  },
                }}
              >
                <Tab label="General Info" />
                <Tab label="Security & System Policy" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 3.5 }}>
              {/* TAB 0: GENERAL INFO */}
              {activeTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                      Administrative Identity & Contact Info
                    </Typography>
                    {!editMode && (
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(true)}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          px: 2,
                          py: 0.8,
                          color: '#6D28D9',
                          borderColor: 'rgba(109, 40, 217, 0.24)',
                          '&:hover': {
                            borderColor: '#6D28D9',
                            bgcolor: '#F5F3FF',
                          },
                        }}
                      >
                        Edit Details
                      </Button>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 3.5,
                      mt: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: editMode ? 1.2 : 0.6, fontWeight: 700, letterSpacing: '0.05em' }}
                      >
                        FULL NAME
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          error={!!errors.name}
                          helperText={errors.name}
                          InputProps={{
                            sx: { borderRadius: '10px' },
                          }}
                        />
                      ) : (
                        <Typography variant="body1" fontWeight={750} color="#1E293B">
                          {adminProfile.name}
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: editMode ? 1.2 : 0.6, fontWeight: 700, letterSpacing: '0.05em' }}
                      >
                        ASSIGNED ROLE
                      </Typography>
                      <Typography variant="body1" fontWeight={750} color="#64748B">
                        {adminProfile.role}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: editMode ? 1.2 : 0.6, fontWeight: 700, letterSpacing: '0.05em' }}
                      >
                        EMAIL ADDRESS
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          error={!!errors.email}
                          helperText={errors.email}
                          InputProps={{
                            sx: { borderRadius: '10px' },
                          }}
                        />
                      ) : (
                        <Typography variant="body1" fontWeight={750} color="#1E293B">
                          {adminProfile.email}
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: editMode ? 1.2 : 0.6, fontWeight: 700, letterSpacing: '0.05em' }}
                      >
                        PHONE NUMBER
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          error={!!errors.phone}
                          helperText={errors.phone}
                          InputProps={{
                            sx: { borderRadius: '10px' },
                          }}
                        />
                      ) : (
                        <Typography variant="body1" fontWeight={750} color="#1E293B" sx={{ fontFamily: 'monospace' }}>
                          {adminProfile.phone}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {editMode && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ my: 2 }} />
                      <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            py: 1,
                            borderWidth: '1.5px',
                            '&:hover': { borderWidth: '1.5px' },
                          }}
                        >
                          Discard
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            py: 1,
                            bgcolor: '#6D28D9',
                            '&:hover': { bgcolor: '#5B21B6' },
                            boxShadow: 'none',
                          }}
                        >
                          Save Profile
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* TAB 1: SECURITY & SYSTEM POLICY */}
              {activeTab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                    Security Architecture & Logging Protocols
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        bgcolor: 'rgba(16, 185, 129, 0.02)',
                      }}
                    >
                      <ShieldIcon sx={{ color: '#10B981', mt: 0.2 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
                          Multi-Factor Authentication (MFA)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.74rem' }}>
                          MFA via Google Authenticator is strictly enforced for your administrator account.
                        </Typography>
                      </Box>
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        bgcolor: 'rgba(109, 40, 217, 0.02)',
                      }}
                    >
                      <HttpsIcon sx={{ color: '#6D28D9', mt: 0.2 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
                          Cryptographic Session Logs
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.74rem' }}>
                          All administrator requests are signed and logged via secure SHA-256 hashing.
                        </Typography>
                      </Box>
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        gridColumn: { md: 'span 2' },
                      }}
                    >
                      <HistoryIcon sx={{ color: '#64748B', mt: 0.2 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
                          Recent Security Access Auditing
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.74rem', mb: 1.5 }}>
                          The following logins were registered for this identity:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                          <Box display="flex" justifyContent="space-between" sx={{ fontSize: '0.72rem', color: '#475569' }}>
                            <Typography variant="caption" fontWeight={650}>2026-05-22 16:59 (Current Session)</Typography>
                            <Typography variant="caption" fontWeight={600} color="#10B981">IP: 103.45.12.89 (Delhi, IN)</Typography>
                          </Box>
                          <Divider />
                          <Box display="flex" justifyContent="space-between" sx={{ fontSize: '0.72rem', color: '#475569' }}>
                            <Typography variant="caption" fontWeight={650}>2026-05-21 10:14 (Expired)</Typography>
                            <Typography variant="caption" fontWeight={600} color="text.disabled">IP: 103.45.12.89 (Delhi, IN)</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileView;
