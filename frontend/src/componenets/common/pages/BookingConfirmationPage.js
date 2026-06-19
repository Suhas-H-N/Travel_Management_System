import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Container, Typography, Box, Card, CardContent, Button, Grid,
  Divider, Chip, CircularProgress, Alert
} from '@mui/material';
import { CheckCircle, Download, Home, BookOnline } from '@mui/icons-material';
import api from '../services/api';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery(
    ['bookingConfirmation', bookingId],
    () => api.get(`/bookings/${bookingId}`).then(r => r.data)
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress size={60} /></Box>;

  const booking = data?.booking;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h3" fontWeight={900} color="success.main">Booking Confirmed!</Typography>
        <Typography variant="h6" color="text.secondary" mt={1}>
          Your trip is booked. Have a great journey! ✈️
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Booking Ref Banner */}
          <Box sx={{ bgcolor: '#f0f7ff', borderRadius: 2, p: 3, textAlign: 'center', mb: 3 }}>
            <Typography variant="caption" color="text.secondary">Your Booking Reference</Typography>
            <Typography variant="h4" fontWeight={900} sx={{ fontFamily: 'monospace', color: 'primary.main', letterSpacing: 2 }}>
              {booking?.bookingRef}
            </Typography>
            <Chip label="CONFIRMED" color="success" sx={{ mt: 1, fontWeight: 800 }} />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Booking Type</Typography>
              <Typography variant="body1" fontWeight={700} textTransform="capitalize">{booking?.bookingType}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Travel Date</Typography>
              <Typography variant="body1" fontWeight={700}>{new Date(booking?.travelDate).toDateString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Passengers</Typography>
              <Typography variant="body1" fontWeight={700}>{booking?.passengers?.length || 1}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Amount Paid</Typography>
              <Typography variant="body1" fontWeight={700} color="success.main">
                ₹{booking?.totalAmount?.toLocaleString('en-IN')}
              </Typography>
            </Grid>
          </Grid>

          {booking?.passengers?.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" fontWeight={700} mb={1}>Passengers</Typography>
              <Grid container spacing={1}>
                {booking.passengers.map((p, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 1, p: 1.5 }}>
                      <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">Age: {p.age} · Seat: {p.seatNumber || 'TBA'}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          <Alert severity="info" sx={{ mb: 3 }}>
            A confirmation email with your e-ticket has been sent to your registered email address.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {booking?.eTicketUrl && (
              <Button variant="contained" startIcon={<Download />} href={booking.eTicketUrl} target="_blank">
                Download E-Ticket
              </Button>
            )}
            <Button variant="outlined" startIcon={<BookOnline />} onClick={() => navigate('/my-bookings')}>
              My Bookings
            </Button>
            <Button variant="text" startIcon={<Home />} onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
