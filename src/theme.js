import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6D28D9', // Rich Royal Violet
      light: '#F5F3FF', // Light Violet backdrop
      dark: '#5B21B6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B5CF6', // Vibrant Lavender Violet
      light: '#EEF2F6', // Light grayish violet
      dark: '#7C3AED',
      contrastText: '#FFFFFF',
    },
    accent: {
      main: '#A855F7', // Bright glowing purple
      light: '#F3E8FF',
      dark: '#9333EA',
    },
    background: {
      default: '#F8FAFC', // Sleek Cool Slate Background
      paper: '#FFFFFF', // Pure White Card Background
    },
    text: {
      primary: '#0F172A', // Very dark slate (Linear/Stripe style)
      secondary: '#475569', // Slate grey
      disabled: '#94A3B8',
    },
    success: {
      main: '#10B981', // Clean Emerald Success
      light: '#ECFDF5',
      dark: '#047857',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B', // Clean Honey Warning
      light: '#FEF3C7',
      dark: '#B45309',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444', // Crimson / Coral Danger
      light: '#FEF2F2',
      dark: '#B91C1C',
      contrastText: '#FFFFFF',
    },
    divider: 'rgba(226, 232, 240, 0.8)', // Ultra-thin Slate-200 divider
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2rem',
      letterSpacing: '-0.025em',
      color: '#0F172A',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '-0.02em',
      color: '#0F172A',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.15rem',
      letterSpacing: '-0.015em',
      color: '#0F172A',
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.95rem',
      letterSpacing: '-0.01em',
      color: '#0F172A',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '0.875rem',
      color: '#475569',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#0F172A',
    },
    body2: {
      fontSize: '0.78rem',
      lineHeight: 1.45,
      color: '#475569',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.8rem',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '6px 14px',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(109, 40, 217, 0.12)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
            boxShadow: '0 6px 16px rgba(109, 40, 217, 0.2)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
            boxShadow: '0 6px 16px rgba(139, 92, 246, 0.2)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(109, 40, 217, 0.24)',
          color: '#6D28D9',
          '&:hover': {
            borderColor: '#6D28D9',
            backgroundColor: '#F5F3FF',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          backgroundImage: 'none',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
          fontSize: '0.72rem',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
          '&:last-child td, &:last-child th': {
            border: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#475569',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '10px 16px',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        body: {
          padding: '12px 16px',
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
          color: '#0F172A',
          fontSize: '0.8rem',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 36,
          color: '#64748B',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '6px 12px',
          color: '#475569',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&.Mui-selected': {
            backgroundColor: '#F5F3FF',
            color: '#6D28D9',
            '&:hover': {
              backgroundColor: '#EDE9FE',
            },
            '& .MuiListItemIcon-root': {
              color: '#6D28D9',
            },
          },
          '&:hover': {
            backgroundColor: '#F1F5F9',
            color: '#0F172A',
            '& .MuiListItemIcon-root': {
              color: '#0F172A',
            },
          },
        },
      },
    },
  },
});

export default theme;

