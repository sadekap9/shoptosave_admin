import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import useLoginViewModel from '../viewmodels/useLoginViewModel';

export default function Login({ onLoginSuccess }) {
  const {
    email,
    password,
    showPassword,
    emailError,
    passwordError,
    isLoading,
    apiError,
    handleEmailChange,
    handlePasswordChange,
    toggleShowPassword,
    handleSubmit,
  } = useLoginViewModel(onLoginSuccess);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgba(109, 40, 217, 0.08) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(248, 250, 252, 1) 100%)',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
      }}
    >
      {/* Decorative background shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.06) 0%, rgba(168, 85, 247, 0.06) 100%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(236, 72, 153, 0.06) 100%)',
          filter: 'blur(100px)',
          zIndex: 0,
        }}
      />

      <Fade in={true} timeout={800}>
        <Card
          sx={{
            width: '100%',
            maxWidth: 440,
            zIndex: 10,
            borderRadius: '24px',
            boxShadow: '0 20px 40px -15px rgba(109, 40, 217, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 30px 60px -20px rgba(109, 40, 217, 0.15), 0 2px 5px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
            {/* Header / Brand Logo */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 20px rgba(109, 40, 217, 0.3)',
                  mb: 2,
                }}
              >
                <AdminIcon sx={{ fontSize: 30 }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 850,
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  textAlign: 'center',
                }}
              >
                Shop2Save
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#64748B',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '0.72rem',
                  mt: 0.8,
                }}
              >
                Admin Management Portal
              </Typography>
            </Box>

            {/* Error alerts */}
            {apiError && (
              <Fade in={!!apiError}>
                <Alert
                  severity="error"
                  variant="outlined"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: '#FEF2F2',
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#EF4444',
                    '& .MuiAlert-icon': {
                      color: '#EF4444',
                    },
                  }}
                >
                  {apiError}
                </Alert>
              </Fade>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.8 }}>
                {/* Email Address */}
                <TextField
                  fullWidth
                  id="email"
                  label="Email Address"
                  variant="outlined"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!emailError}
                  helperText={emailError}
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: emailError ? '#EF4444' : '#94A3B8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      transition: 'all 0.2s',
                      backgroundColor: '#FFFFFF',
                      '&:hover fieldset': {
                        borderColor: '#A855F7',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6D28D9',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#64748B',
                      '&.Mui-focused': {
                        color: '#6D28D9',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      mx: 1,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                    },
                  }}
                />

                {/* Password Field */}
                <TextField
                  fullWidth
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!passwordError}
                  helperText={passwordError}
                  disabled={isLoading}
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: passwordError ? '#EF4444' : '#94A3B8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={toggleShowPassword}
                            edge="end"
                            disabled={isLoading}
                            sx={{ color: '#94A3B8' }}
                          >
                            {showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      transition: 'all 0.2s',
                      backgroundColor: '#FFFFFF',
                      '&:hover fieldset': {
                        borderColor: '#A855F7',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6D28D9',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#64748B',
                      '&.Mui-focused': {
                        color: '#6D28D9',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      mx: 1,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                    },
                  }}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    py: 1.8,
                    borderRadius: 3,
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
                    boxShadow: '0 4px 14px rgba(109, 40, 217, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
                      boxShadow: '0 6px 20px rgba(109, 40, 217, 0.3)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                      background: '#E2E8F0',
                      color: '#94A3B8',
                    },
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={18} color="inherit" thickness={5} />
                      <Typography variant="button" sx={{ fontWeight: 700 }}>
                        Signing In...
                      </Typography>
                    </Box>
                  ) : (
                    'Sign In to Admin Portal'
                  )}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Footer copyright */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: 24,
          color: '#94A3B8',
          fontWeight: 600,
          zIndex: 10,
          textAlign: 'center',
          width: '100%',
        }}
      >
        &copy; {new Date().getFullYear()} Shop2Save. All rights reserved.
      </Typography>
    </Box>
  );
}
