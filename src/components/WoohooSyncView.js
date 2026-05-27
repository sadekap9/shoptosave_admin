import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  Chip,
} from '@mui/material';
import {
  Sync as SyncIcon,
  VpnKey as KeyIcon,
  ChevronRight as ChevronRightIcon,
  Terminal as TerminalIcon,
  SettingsInputHdmi as SyncPortIcon,
  Wifi as WifiIcon,
  Storage as DbIcon,
  AccessTime as LatencyIcon,
} from '@mui/icons-material';

const initialLogs = [
  '[12:05:10] SYSTEM: Initializing Woohoo API V3 sync engine...',
  '[12:05:11] SERVICE: Resolving sandbox endpoints for test integrations...',
  '[12:05:12] AUTH: Token retrieved successfully. Expiring in 3600 seconds.',
  '[12:05:13] SYNC: Crawling Woohoo digital card catalogue: found 52 active brands.',
  '[12:05:15] SYNC: Updating discount metrics for Amazon India - set discount to 3.5%.',
  '[12:05:16] SYNC: Fetching fresh inventory stock indexes... OK.',
  '[12:05:18] SYSTEM: Woohoo synchronization completed successfully. 52 listings synced.',
];

const WoohooSyncView = ({ systemStatus, onSyncWoohoo, triggerToast }) => {
  const [logs, setLogs] = useState(initialLogs);
  const [isSyncing, setIsSyncing] = useState(false);
  const [clientId, setClientId] = useState('shop2save_client_prod_88942');
  const [clientSecret, setClientSecret] = useState('********************************');
  const consoleEndRef = useRef(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleSyncTrigger = () => {
    setIsSyncing(true);
    triggerToast('Initiating catalog synchronizer...', 'info');

    // Add immediate sync log
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] SYNC: Force manual sync requested.`]);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] AUTH: Regenerating client tokens...`,
      ]);
    }, 800);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] SYNC: Re-indexing 7 cashback categories...`,
      ]);
    }, 1500);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] SYSTEM: Successfully reconciled API tables. Stock catalogs refreshed.`,
      ]);
      setIsSyncing(false);
      onSyncWoohoo(); // Update lastSync time state in App.js
    }, 2500);
  };

  const handleClearLogs = () => {
    setLogs([`[${new Date().toLocaleTimeString()}] SYSTEM: Console log buffers flushed.`]);
    triggerToast('Sync logs cleared', 'info');
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header section with breadcrumbs */}
      <Box sx={{ mb: 4 }} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Integrations
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Woohoo Api Bridge
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Woohoo Integration Sync
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coordinate manual vendor syncing, monitor API response streams, and manage secure credentials.
          </Typography>
        </Box>
      </Box>

      {/* Sync Telemetry Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex' }}>
                  <WifiIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  API Status
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="#10B981" sx={{ mt: 1 }}>
                ONLINE
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(109, 40, 217, 0.08)', color: '#6D28D9', display: 'flex' }}>
                  <DbIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Synced Products
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>
                52 Listings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6', display: 'flex' }}>
                  <LatencyIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  API Latency
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>
                142 ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(13, 148, 136, 0.08)', color: '#0D9488', display: 'flex' }}>
                  <SyncPortIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Environment
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="#0D9488" sx={{ mt: 1 }}>
                SANDBOX / BETA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main console and settings grid */}
      <Grid container spacing={3}>
        {/* Sync Console Screen */}
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              bgcolor: '#0B0F19', // Extremely sleek rich obsidian navy
              border: '1px solid #1E293B',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Console topbar with mac-style buttons */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ px: 3, py: 2, bgcolor: '#111827', borderBottom: '1px solid #1E293B' }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                {/* Mac window dots */}
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981', mr: 1.5 }} />
                <TerminalIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  live_event_stream_console.sh
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Chip
                  label={isSyncing ? 'SYNCING' : 'IDLE'}
                  size="small"
                  sx={{
                    bgcolor: isSyncing ? '#EF4444' : '#10B981',
                    color: '#ffffff',
                    height: 20,
                    fontWeight: 800,
                    fontSize: '0.6rem',
                    letterSpacing: '0.05em',
                  }}
                />
              </Box>
            </Box>
            
            {/* Raw Logs list */}
            <CardContent sx={{ height: 280, overflowY: 'auto', p: 3 }}>
              {logs.map((log, index) => {
                let color = '#E2E8F0';
                if (log.includes('SYSTEM:')) color = '#38BDF8'; // cyan
                if (log.includes('AUTH:')) color = '#C084FC'; // purple
                if (log.includes('SERVICE:')) color = '#F472B6'; // pink
                if (log.includes('SYNC:')) color = '#FBBF24'; // amber
                if (log.includes('completed') || log.includes('OK')) color = '#34D399'; // green

                return (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: 'Consolas, Monaco, monospace',
                      lineHeight: 1.6,
                      fontSize: '0.78rem',
                      color,
                      mb: 0.8,
                      opacity: 0.95,
                    }}
                  >
                    {log}
                  </Typography>
                );
              })}
              <div ref={consoleEndRef} />
            </CardContent>
          </Card>
          
          <Box display="flex" gap={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SyncIcon />}
              disabled={isSyncing}
              onClick={handleSyncTrigger}
              className={isSyncing ? '' : 'pulse-primary'}
              sx={{
                textTransform: 'none',
                fontWeight: 650,
                borderRadius: '10px',
                px: 3.5,
                py: 1,
                boxShadow: '0 4px 10px rgba(109, 40, 217, 0.2)',
              }}
            >
              {isSyncing ? 'Synchronizing API...' : 'Sync Catalog Now'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              disabled={isSyncing}
              onClick={handleClearLogs}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                px: 2.5,
              }}
            >
              Clear Buffer
            </Button>
          </Box>
        </Grid>

        {/* Credentials and endpoints configuration */}
        <Grid item xs={12} md={5}>
          <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '20px' }}>
            <Box sx={{ px: 3, pt: 3, pb: 1.5, borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                API Gateway Configuration
              </Typography>
            </Box>
            <CardContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Endpoint API Gateway URL"
                    value="https://api.woohoo.in/v3/merchant/sync"
                    variant="outlined"
                    size="small"
                    disabled
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Client ID"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    InputProps={{
                      startAdornment: <KeyIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Client Secret"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    type="password"
                    variant="outlined"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    InputProps={{
                      startAdornment: <KeyIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Merchant ID / Store Code"
                    value="SHOP2SAVE-SVR-MCH-994"
                    variant="outlined"
                    size="small"
                    disabled
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() => triggerToast('Secure environment configuration parameters saved!', 'success')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 650,
                      borderRadius: '10px',
                      py: 1.2,
                    }}
                  >
                    Save API Environment
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WoohooSyncView;
