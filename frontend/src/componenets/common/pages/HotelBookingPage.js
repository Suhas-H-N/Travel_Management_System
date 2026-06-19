// HotelBookingPage.js
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Rating, Divider, Alert
} from '@mui/material';
import { useMutation } from 'react-query';
import api from '../services/api';
import { showNotification } from '../features/uiSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function HotelBookingPage() {
  const { hotelId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hotel = state?.hotel;
  const sp = state?.searchParams || {};
  const nights = Math.ceil((new Date(sp.checkOut) - new Date(sp.checkIn)) / (1000 * 60 * 60 * 24)) || 1;

  const formik = useFormik({
    initialValues: { guestName: '', guestAge: '', roomType: 'standard', specialRequests: '' },
    validationSchema: Yup.object({ guestName: Yup.string().required('Required'), guestAge: Yup.number().required('Required').min(1) }),
    onSubmit: values => mutation.mutate(values),
  });

  const roomPrice = hotel?.rooms?.find(r => r.roomType === formik.values.roomType)?.pricePerNight || hotel?.minPrice || 0;
  const total = roomPrice * nights;

  const mutation = useMutation(
    () => api.post('/bookings', {
      bookingType: 'hotel', itemId: hotelId, bookingTypeRef: 'Hotel',
      rooms: [{ roomType: formik.values.roomType, guests: parseInt(sp.guests) || 1 }],
      travelDate: sp.checkIn, returnDate: sp.checkOut,
      totalAmount: total, baseFare: total * 0.82, taxes: total * 0.18,
    }),
    {
      onSuccess: ({ data }) => navigate(`/payment/${data.booking._id}`),
      onError: err => dispatch(showNotification({ type: 'error', message: err.response?.data?.message || 'Booking failed' }))
    }
  );

  if (!hotel) return <Container sx={{ py: 8, textAlign: 'center' }}><Typography>No hotel data. Please search again.</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>Book Hotel</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Guest Details</Typography>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Guest Name" name="guestName" value={formik.values.guestName}
                      onChange={formik.handleChange} error={formik.touched.guestName && !!formik.errors.guestName}
                      helperText={formik.touched.guestName && formik.errors.guestName} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Age" name="guestAge" type="number" value={formik.values.guestAge}
                      onChange={formik.handleChange} error={formik.touched.guestAge && !!formik.errors.guestAge}
                      helperText={formik.touched.guestAge && formik.errors.guestAge} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Special Requests (optional)" name="specialRequests" multiline rows={3}
                      value={formik.values.specialRequests} onChange={formik.handleChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" size="large" disabled={mutation.isLoading}>
                      Proceed to Payment
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>{hotel.name}</Typography>
              <Rating value={hotel.starRating} readOnly size="small" sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary" mb={2}>📍 {hotel.location?.city}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Check-in</Typography><Typography fontWeight={700}>{sp.checkIn}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Check-out</Typography><Typography fontWeight={700}>{sp.checkOut}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{nights} Night(s) × ₹{roomPrice.toLocaleString('en-IN')}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={800}>Total</Typography>
                <Typography variant="h6" fontWeight={800} color="primary.main">₹{total.toLocaleString('en-IN')}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
