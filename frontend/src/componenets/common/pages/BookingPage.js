import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container, Typography, Box, Grid, Card, CardContent, TextField,
  Button, Stepper, Step, StepLabel, Divider, Chip, Alert, CircularProgress
} from '@mui/material';
import { FlightTakeoff, ArrowForward } from '@mui/icons-material';
import { useMutation } from 'react-query';
import api from '../services/api';
import { showNotification } from '../features/uiSlice';

const STEPS = ['Passenger Details', 'Review', 'Payment'];

export default function BookingPage() {
  const { type, itemId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const item = state?.item;
  const searchParams = state?.searchParams || {};
  const passengerCount = parseInt(searchParams.passengers) || 1;

  const [passengers, setPassengers] = useState(
    Array.from({ length: passengerCount }, () => ({ name: '', age: '', gender: 'male', seatNumber: '' }))
  );

  const updatePassenger = (i, field, value) => {
    const updated = [...passengers];
    updated[i] = { ...updated[i], [field]: value };
    setPassengers(updated);
  };

  const isStep0Valid = passengers.every(p => p.name && p.age);

  const createBookingMutation = useMutation(
    () => api.post('/bookings', {
      bookingType: type,
      itemId,
      passengers,
      travelDate: searchParams.date,
      totalAmount: item?.pricing?.totalPrice * passengerCount || 0,
      baseFare: item?.pricing?.dynamicPrice * passengerCount || 0,
      taxes: item?.pricing?.taxes * passengerCount || 0,
    }),
    {
      onSuccess: ({ data }) => {
        dispatch(showNotification({ type: 'success', message: 'Booking created! Proceed to payment.' }));
        navigate(`/payment/${data.booking._id}`);
      },
      onError: (err) => dispatch(showNotification({ type: 'error', message: err.response?.data?.message || 'Booking failed' }))
    }
  );

  if (!item) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6">No booking data found. Please search again.</Typography>
        <Button variant="contained" href="/" sx={{ mt: 2 }}>Go Home</Button>
      </Container>
    );
  }

  const totalAmount = (item?.pricing?.totalPrice || 0) * passengerCount;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>Complete Your Booking</Typography>

      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {step === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={3}>Passenger Details</Typography>
                {passengers.map((p, i) => (
                  <Box key={i} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                      Passenger {i + 1}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <TextField fullWidth size="small" label="Full Name" value={p.name}
                          onChange={e => updatePassenger(i, 'name', e.target.value)} required />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField fullWidth size="small" label="Age" type="number" value={p.age}
                          onChange={e => updatePassenger(i, 'age', e.target.value)} required />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <TextField fullWidth size="small" label="Seat No." value={p.seatNumber}
                          onChange={e => updatePassenger(i, 'seatNumber', e.target.value)}
                          placeholder="e.g. A12" />
                      </Grid>
                    </Grid>
                    {i < passengers.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
                <Button variant="contained" onClick={() => setStep(1)} disabled={!isStep0Valid}
                  endIcon={<ArrowForward />} sx={{ mt: 1 }}>
                  Continue to Review
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={3}>Review Booking</Typography>
                <Box sx={{ bgcolor: '#f0f7ff', borderRadius: 2, p: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontWeight={700}>{type.toUpperCase()}</Typography>
                    <Chip label={item.transportNumber || item.carrier} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>
                        {new Date(item.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Typography variant="body2">{item.origin}</Typography>
                    </Box>
                    <FlightTakeoff sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6" fontWeight={800}>
                        {new Date(item.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Typography variant="body2">{item.destination}</Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="subtitle2" fontWeight={700} mb={1}>Passengers</Typography>
                {passengers.map((p, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography>{p.name}, Age {p.age}</Typography>
                    <Typography color="text.secondary">Seat: {p.seatNumber || 'Auto-assign'}</Typography>
                  </Box>
                ))}

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button variant="outlined" onClick={() => setStep(0)}>Back</Button>
                  <Button variant="contained" onClick={() => createBookingMutation.mutate()}
                    disabled={createBookingMutation.isLoading} endIcon={<ArrowForward />}>
                    {createBookingMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : 'Proceed to Payment'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Price Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Price Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Base Fare × {passengerCount}</Typography>
                <Typography>₹{((item?.pricing?.dynamicPrice || 0) * passengerCount).toLocaleString('en-IN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Taxes & Fees</Typography>
                <Typography>₹{((item?.pricing?.taxes || 0) * passengerCount).toLocaleString('en-IN')}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={800}>Total</Typography>
                <Typography variant="h6" fontWeight={800} color="primary.main">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                Free cancellation available until 72 hours before travel
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
