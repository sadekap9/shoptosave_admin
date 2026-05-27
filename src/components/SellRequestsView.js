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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Clear as RejectIcon,
  Visibility as ViewIcon,
  Info as InfoIcon,
  ChevronRight as ChevronRightIcon,
  Gavel as AuditIcon,
  Shield as ShieldIcon,
  Paid as PayoutIcon,
  AssignmentTurnedIn as VerifiedIcon,
} from '@mui/icons-material';

const SellRequestsView = ({ sellRequests, onApproveRequest, onRejectRequest }) => {
  const [selectedReq, setSelectedReq] = useState(null);
  const [openAuditDialog, setOpenAuditDialog] = useState(false);

  // Dynamic audit calculations
  const pendingAuditsCount = sellRequests.length;
  
  const totalAuditFaceValue = sellRequests.reduce((sum, req) => {
    const val = parseFloat(req.value.replace(/[^0-9]/g, '')) || 0;
    return sum + val;
  }, 0);

  const totalPayoutValue = totalAuditFaceValue * 0.9;

  const handleOpenAudit = (req) => {
    setSelectedReq(req);
    setOpenAuditDialog(true);
  };

  const handleApproveFromAudit = (id) => {
    onApproveRequest(id);
    setOpenAuditDialog(false);
  };

  const handleRejectFromAudit = (id) => {
    onRejectRequest(id);
    setOpenAuditDialog(false);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out-back', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header breadcrumbs */}
      <Box sx={{ mb: 4 }} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Audits
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Card Sell Auditing
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}>
            Sell Card Audits
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Perform fraud checks and balance verifications on gift cards sold back to Shop2Save.
          </Typography>
        </Box>
      </Box>

      {/* Security stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Pending Audit Cases
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
                  <AuditIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                {pendingAuditsCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Awaiting credentials review
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Sum Face Value under Audit
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    background: 'rgba(139, 92, 246, 0.08)',
                    color: '#8B5CF6',
                    display: 'flex',
                  }}
                >
                  <PayoutIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                ₹{totalAuditFaceValue.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Submitted collateral balances
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                  Projected Wallet Payouts (90%)
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
                  <VerifiedIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, color: '#10B981' }}>
                ₹{totalPayoutValue.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cash rewards to be credited
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main ledger audits */}
      <Card sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '16px', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>REQUEST ID</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>CUSTOMER USER</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>GIFT CARD VENDOR</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>FACE VALUE</TableCell>
                  <TableCell sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2 }}>PAYOUT VALUE (90%)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 650, color: '#475569', fontSize: '0.8rem', py: 2, pr: 3 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sellRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                        <VerifiedIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          No pending card sell-back audits are active!
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  sellRequests.map((req) => {
                    const faceValueNum = parseFloat(req.value.replace(/[^0-9]/g, '')) || 0;
                    const payoutVal = `₹${(faceValueNum * 0.9).toFixed(0)}`;
                    const requestId = `SRQ-${req.id.substring(0, 5).toUpperCase()}`;
                    return (
                      <TableRow
                        key={req.id}
                        hover
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(109, 40, 217, 0.015) !important',
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 700, color: '#8B5CF6', fontFamily: 'monospace' }}>
                          {requestId}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>
                          {req.user}
                        </TableCell>
                        <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                          {req.brand}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {req.value}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#10B981' }}>
                          {payoutVal}
                        </TableCell>
                        <TableCell align="center" sx={{ pr: 3 }}>
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip title="Examine Card Security Codes">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenAudit(req)}
                                sx={{
                                  color: '#6D28D9',
                                  bgcolor: 'rgba(109, 40, 217, 0.05)',
                                  '&:hover': {
                                    bgcolor: '#6D28D9',
                                    color: '#FFFFFF',
                                  },
                                  width: 32,
                                  height: 32,
                                  transition: 'all 0.2s',
                                }}
                              >
                                <ViewIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<ApproveIcon />}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 650,
                                borderRadius: '8px',
                                px: 2,
                                boxShadow: 'none',
                                '&:hover': {
                                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                                },
                              }}
                              onClick={() => onApproveRequest(req.id)}
                            >
                              Approve
                            </Button>

                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<RejectIcon />}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: '8px',
                                px: 2,
                              }}
                              onClick={() => onRejectRequest(req.id)}
                            >
                              Reject
                            </Button>
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

      {/* POPUP: Card Pin Audit Security review */}
      <Dialog
        open={openAuditDialog}
        onClose={() => setOpenAuditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pb: 2,
            pt: 3,
            px: 4,
            fontSize: '1.25rem',
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
            <ShieldIcon sx={{ fontSize: 20 }} />
          </Box>
          Gift Card Code Security Review
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedReq && (
            <Box>
              {/* Caution warning block */}
              <Box
                display="flex"
                gap={2}
                alignItems="flex-start"
                sx={{
                  mb: 4,
                  p: 2.5,
                  bgcolor: '#FFFBEB',
                  borderRadius: '14px',
                  border: '1px solid #FEF3C7',
                }}
              >
                <InfoIcon sx={{ color: '#D97706', mt: 0.2, fontSize: 20 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#92400E', fontWeight: 800, mb: 0.5 }}>
                    PRE-APPROVAL CHECKLIST
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 550, display: 'block', lineHeight: 1.4 }}>
                    Ensure balance checks have been completed using the brand merchant verification portal prior to approving wallet credits. Approve only if coordinates match precisely.
                  </Typography>
                </Box>
              </Box>

              {/* Data Grid details */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    SUBMITTING CUSTOMER
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={750} color="#0F172A">
                    {selectedReq.user}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    GIFT CARD VENDOR
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={750} color="#0F172A">
                    {selectedReq.brand}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    FACE VALUE
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                    {selectedReq.value}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    WALLET PAYOUT OFFER
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={850} color="#10B981">
                    ₹{(parseFloat(selectedReq.value.replace(/[^0-9]/g, '')) * 0.9).toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>(90% standard offer)</span>
                  </Typography>
                </Grid>

                {/* Secret Codes dashboard */}
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                  <Box
                    sx={{
                      bgcolor: '#0F172A',
                      color: '#38BDF8',
                      p: 3,
                      borderRadius: '16px',
                      fontFamily: 'monospace',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontFamily: 'monospace' }}>
                        SECURE CREDENTIAL DATABASE
                      </Typography>
                      <Box sx={{ px: 1, py: 0.2, bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>
                        AES-256 ENCRYPTED
                      </Box>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
                        CARD CODE / SERIAL:
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 750, color: '#F1F5F9', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        S2S-AMZ-8849-2049-9948
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
                        SECURITY PIN:
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 750, color: '#38BDF8', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                        992841
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <Button
            onClick={() => setOpenAuditDialog(false)}
            color="inherit"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel Audit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleRejectFromAudit(selectedReq.id)}
            sx={{ textTransform: 'none', fontWeight: 650, borderRadius: '10px' }}
          >
            Reject Claim
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleApproveFromAudit(selectedReq.id)}
            sx={{
              textTransform: 'none',
              fontWeight: 650,
              borderRadius: '10px',
              px: 3,
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
            }}
          >
            Approve & Credit Wallet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellRequestsView;
