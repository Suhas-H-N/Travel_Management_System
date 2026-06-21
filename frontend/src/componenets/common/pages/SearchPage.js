// SearchPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, CircularProgress, TextField, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { FlightTakeoff, AccessTime, AirlineSeatReclineNormal } from '@mui/icons-material';
import api from '../services/api';

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/search/transport', { params: Object.fromEntries(params) });
        setResults(data.results || []);
      } catch { setResults([]); }
      setLoading(false);
    };
    fetchResults();
  }, [params.toString()]);

  const filtered = results.filter(r => {
    const price = r.pricing?.totalPrice || r.priceClasses?.economy || 0;
    return price >= priceRange[0] && price <= priceRange[1];
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={800} mb={1}>
        {params.get('origin')} → {params.get('destination')}
      </Typography>
      <Typography color="text.secondary" mb={3}>
        {params.get('date')} · {params.get('passengers') || 1} Passenger(s) · {results.length} results found
      </Typography>

      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Filters</Typography>
              <Typography variant="body2" fontWeight={600} mb={1}>Price Range (₹)</Typography>
              <Slider value={priceRange} onChange={(_, v) => setPriceRange(v)} min={0} max={50000} step={500}
                valueLabelDisplay="auto" valueLabelFormat={v => `₹${v.toLocaleString('en-IN')}`} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">₹{priceRange[0].toLocaleString('en-IN')}</Typography>
                <Typography variant="caption">₹{priceRange[1].toLocaleString('en-IN')}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h1" sx={{ fontSize: 64 }}>✈️</Typography>
              <Typography variant="h6" mt={2}>No flights found for this route</Typography>
              <Typography color="text.secondary">Try different dates or routes</Typography>
            </Box>
          ) : (
            filtered.map(t => (
              <Card key={t._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="h6" fontWeight={800}>{t.carrier}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.transportNumber}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={800}>{new Date(t.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Typography>
                          <Typography variant="caption">{t.origin}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">{Math.floor((t.duration||120)/60)}h {(t.duration||120)%60}m</Typography>
                          <Box sx={{ borderTop: '1px solid #ccc', mx: 1 }} />
                          <Typography variant="caption" color="success.main">Non-stop</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={800}>{new Date(t.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Typography>
                          <Typography variant="caption">{t.destination}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Chip icon={<AirlineSeatReclineNormal />} label={`${t.availableSeats} seats left`}
                        color={t.availableSeats < 10 ? 'error' : 'success'} size="small" />
                      {t.amenities?.slice(0, 2).map(a => <Chip key={a} label={a} size="small" variant="outlined" sx={{ ml: 0.5, mt: 0.5 }} />)}
                    </Grid>
                    <Grid item xs={12} sm={3} sx={{ textAlign: { sm: 'right' } }}>
                      <Typography variant="h5" color="primary.main" fontWeight={800}>
                        ₹{(t.pricing?.totalPrice || t.priceClasses?.economy || 0).toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">per person incl. taxes</Typography>
                      <br />
                      <Button variant="contained" size="small" sx={{ mt: 1 }}
                        onClick={() => navigate(`/booking/flight/${t._id}`, { state: { item: t, searchParams: Object.fromEntries(params) } })}>
                        Book Now
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
