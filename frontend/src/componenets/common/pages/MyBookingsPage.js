import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Container, Typography, Box, Tabs, Tab, Card, CardContent, Grid,
  Chip, Button, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from '@mui/material';
import { Download, Cancel, FlightTakeoff, Hotel, Luggage } from '@mui/icons-material';
import api from '../services/api';

const STATUS_COLORS = { confirmed: 'success', pending: 'warning', cancelled: 'error', completed: 'default', refunded: 'info' };
const TYPE_ICONS = { flight: <FlightTakeoff />, train: <FlightTakeoff />, bus: <FlightTakeoff />, hotel: <Hotel />, package: <Luggage /> };

export default function MyBookingsPage() {
  const [tab, setTab] = useState(0);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const queryClient = useQueryClient();

  const statuses = ['all', 'confirmed', 'pending', 'cancelled', 'completed'];

  const { data, isLoading, error } = useQuery(
    ['myBookings', statuses[tab]],
    () => api.get('/bookings', { params: statuses[tab] !== 'all' ? { status: statuses[tab] } : {} }).then(r => r.data)
  );

  const cancelMutation = useMutation(
    ({ id, reason }) => api.put(`/bookings/${id}/cancel`, { reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myBookings');
        setCancelDialog(null);
        setCancelReason('');
      }
    }
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={1}>My Bookings</Typography>
      <Typography color="text.secondary" mb={3}>Track and manage all your travel bookings</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e0e0e0' }}>
        {statuses.map(s => <Tab key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} />)}
      </Tabs>

      {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">Failed to load bookings. Please try again.</Alert>}

      {!isLoading && !error && (
        <>
          {(!data?.bookings?.length) ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h1" sx={{ fontSize: 64 }}>🎒</Typography>
              <Typography variant="h6" mt={2}>No bookings found</Typography>
              <Typography color="text.secondary">Start exploring and book your next adventure!</Typography>
              <Button variant="contained" href="/" sx={{ mt: 2 }}>Explore Now</Button>
            </Box>
          ) : (
            data.bookings.map(booking => (
              <Card key={booking._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={1}>
                      <Box sx={{ color: 'primary.main', fontSize: 32 }}>
                        {TYPE_ICONS[booking.bookingType] || <FlightTakeoff />}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                        {booking.bookingRef}
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)} Booking
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Travel Date: {new Date(booking.travelDate).toDateString()}
                      </Typography>
                      {booking.passengers?.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {booking.passengers.length} Passenger(s)
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Chip label={booking.status.toUpperCase()} color={STATUS_COLORS[booking.status]} sx={{ fontWeight: 700 }} />
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="h6" fontWeight={800} color="primary.main">
                        ₹{booking.totalAmount?.toLocaleString('en-IN')}
                      </Typography>
                      {booking.refundAmount > 0 && (
                        <Typography variant="caption" color="success.main">
                          Refund: ₹{booking.refundAmount?.toLocaleString('en-IN')}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {booking.eTicketUrl && (
                        <Button size="small" variant="outlined" startIcon={<Download />}
                          href={booking.eTicketUrl} target="_blank">
                          E-Ticket
                        </Button>
                      )}
                      {['confirmed', 'pending'].includes(booking.status) && (
                        <Button size="small" variant="outlined" color="error" startIcon={<Cancel />}
                          onClick={() => setCancelDialog(booking)}>
                          Cancel
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}

      {/* Cancel Dialog */}
      <Dialog open={!!cancelDialog} onClose={() => setCancelDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            Are you sure you want to cancel booking <strong>{cancelDialog?.bookingRef}</strong>?
            Refund will be based on cancellation policy.
          </Typography>
          <TextField fullWidth label="Reason for cancellation" multiline rows={3}
            value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(null)}>Keep Booking</Button>
          <Button variant="contained" color="error" disabled={cancelMutation.isLoading}
            onClick={() => cancelMutation.mutate({ id: cancelDialog._id, reason: cancelReason })}>
            {cancelMutation.isLoading ? <CircularProgress size={20} /> : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
