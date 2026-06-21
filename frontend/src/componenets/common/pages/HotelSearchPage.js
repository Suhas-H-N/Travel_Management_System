// HotelSearchPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, Box, CircularProgress, Rating, Slider
} from '@mui/material';
import { Pool, Wifi, Restaurant, FitnessCenter } from '@mui/icons-material';
import api from '../services/api';

const AMENITY_ICONS = { Pool: <Pool />, WiFi: <Wifi />, Restaurant: <Restaurant />, Gym: <FitnessCenter /> };

export default function HotelSearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [starFilter, setStarFilter] = useState(1);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/search/hotels', { params: Object.fromEntries(params) });
        setHotels(data.results || []);
      } catch { setHotels([]); }
      setLoading(false);
    };
    if (params.get('city')) fetchHotels();
  }, [params.toString()]);

  const filtered = hotels.filter(h => (h.starRating || 0) >= starFilter);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={800} mb={1}>
        Hotels in {params.get('city') || 'All Cities'}
      </Typography>
      <Typography color="text.secondary" mb={3}>
        {params.get('checkIn')} → {params.get('checkOut')} · {filtered.length} hotels found
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography fontWeight={700} mb={2}>Min Star Rating</Typography>
              <Rating value={starFilter} onChange={(_, v) => setStarFilter(v || 1)} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>}
          {!loading && filtered.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h1" sx={{ fontSize: 64 }}>🏨</Typography>
              <Typography variant="h6" mt={2}>No hotels found</Typography>
              <Typography color="text.secondary">Try a different city or dates</Typography>
            </Box>
          )}
          {filtered.map(hotel => (
            <Card key={hotel._id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" fontWeight={700}>{hotel.name}</Typography>
                      <Rating value={hotel.starRating} readOnly size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      📍 {hotel.location?.address}, {hotel.location?.city}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {hotel.amenities?.slice(0, 5).map(a => (
                        <Chip key={a} label={a} size="small" variant="outlined" />
                      ))}
                    </Box>
                    {hotel.averageRating > 0 && (
                      <Chip label={`⭐ ${hotel.averageRating?.toFixed(1)} (${hotel.reviewCount} reviews)`}
                        size="small" color="warning" variant="outlined" />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
                    <Typography variant="caption" color="text.secondary">Per night from</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary.main">
                      ₹{hotel.minPrice?.toLocaleString('en-IN')}
                    </Typography>
                    {hotel.nights && (
                      <Typography variant="body2" color="text.secondary">
                        ₹{hotel.estimatedTotal?.toLocaleString('en-IN')} for {hotel.nights} nights
                      </Typography>
                    )}
                    <Button variant="contained" size="small" sx={{ mt: 1 }}
                      onClick={() => navigate(`/hotel-booking/${hotel._id}`, {
                        state: { hotel, searchParams: Object.fromEntries(params) }
                      })}>
                      Book Now
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
}
