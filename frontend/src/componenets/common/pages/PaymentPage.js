import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Typography, Box, Card, CardContent, Button, Grid,
  Divider, Chip, CircularProgress, Alert, LinearProgress
} from '@mui/material';
import { Lock, CreditCard, CheckCircle } from '@mui/icons-material';
import api from '../services/api';
import { showNotification } from '../features/uiSlice';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minute countdown
  const [paying, setPaying] = useState(false);

  const { data: bookingData, isLoading } = useQuery(
    ['booking', bookingId],
    () => api.get(`/bookings/${bookingId}`).then(r => r.data)
  );

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      dispatch(showNotification({ type: 'error', message: 'Booking hold expired. Please try again.' }));
      navigate('/');
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const initiatePaymentMutation = useMutation(
    () => api.post('/payments/initiate', { bookingId }),
    {
      onSuccess: async ({ data }) => {
        // Load Razorpay SDK
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.body.appendChild(script);
        script.onload = () => {
          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: 'Travel Management System',
            description: `Booking: ${data.bookingRef}`,
            order_id: data.orderId,
            prefill: { name: user?.name, email: user?.email, contact: user?.phone },
            theme: { color: '#1F4E79' },
            handler: async (response) => {
              setPaying(true);
              try {
                await api.post('/payments/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId,
                });
                navigate(`/booking/confirmation/${bookingId}`);
              } catch {
                dispatch(showNotification({ type: 'error', message: 'Payment verification failed. Contact support.' }));
              }
              setPaying(false);
            },
            modal: { ondismiss: () => setPaying(false) }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
      },
      onError: (err) => dispatch(showNotification({ type: 'error', message: err.response?.data?.message || 'Payment initiation failed' }))
    }
  );

  const booking = bookingData?.booking;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress size={60} /></Box>;

  if (paying) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <CircularProgress size={60} />
      <Typography variant="h6" mt={3}>Verifying payment...</Typography>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={1}>Complete Payment</Typography>
      <Typography color="text.secondary" mb={3}>Your booking is held for a limited time. Complete payment to confirm.</Typography>

      {/* Countdown */}
      <Alert severity={timeLeft < 120 ? 'error' : 'warning'} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={700}>
            ⏱ Booking hold expires in: {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </Typography>
          <LinearProgress variant="determinate" value={(timeLeft / 600) * 100}
            sx={{ width: 100, height: 8, borderRadius: 4 }} />
        </Box>
      </Alert>

      <Grid container spacing={3}>
        {/* Booking Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Booking Summary</Typography>
              {booking && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Booking Ref</Typography>
                    <Typography fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                      {booking.bookingRef}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Type</Typography>
                    <Chip label={booking.bookingType} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Travel Date</Typography>
                    <Typography>{new Date(booking.travelDate).toDateString()}</Typography>
                  </Box>
                  {booking.passengers?.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color="text.secondary">Passengers</Typography>
                      <Typography>{booking.passengers.length}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Base Fare</Typography>
                    <Typography>₹{booking.baseFare?.toLocaleString('en-IN') || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Taxes</Typography>
                    <Typography>₹{booking.taxes?.toLocaleString('en-IN') || 0}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={800}>Total</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      ₹{booking.totalAmount?.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Payment Methods</Typography>
              <Box sx={{ border: '2px solid #1F4E79', borderRadius: 2, p: 2, mb: 2, bgcolor: '#f0f7ff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CreditCard color="primary" />
                  <Typography fontWeight={700}>Pay via Razorpay</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  UPI, Credit/Debit Cards, Net Banking, Wallets
                </Typography>
              </Box>

              <Button variant="contained" fullWidth size="large"
                startIcon={<Lock />}
                onClick={() => initiatePaymentMutation.mutate()}
                disabled={initiatePaymentMutation.isLoading}
                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 700 }}>
                {initiatePaymentMutation.isLoading
                  ? <CircularProgress size={24} color="inherit" />
                  : `Pay ₹${booking?.totalAmount?.toLocaleString('en-IN')}`
                }
              </Button>

              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                <Lock fontSize="small" color="success" />
                <Typography variant="caption" color="text.secondary">
                  Secured by Razorpay · 256-bit SSL encryption
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
