import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  Button, Tabs, Tab, TextField, Paper, Chip, Autocomplete, Avatar
} from '@mui/material';
import { FlightTakeoff, Hotel, Luggage, Search, Star, TrendingUp } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';

const CITIES = ['Delhi (DEL)', 'Mumbai (BOM)', 'Bengaluru (BLR)', 'Hyderabad (HYD)', 'Chennai (MAA)', 'Kochi (COK)', 'Kolkata (CCU)', 'Jaipur (JAI)', 'Goa (GOI)', 'Ahmedabad (AMD)'];

const PACKAGES = [
  { title: 'Kerala Backwaters', price: 28000, days: 7, tag: 'Most Popular', color: '#E8F5E9', img: '🌿', dest: 'Kochi, Alleppey, Munnar' },
  { title: 'Rajasthan Royal', price: 32000, days: 6, tag: 'Heritage', color: '#FFF3E0', img: '🏰', dest: 'Jaipur, Jodhpur, Udaipur' },
  { title: 'Goa Beach Escape', price: 18000, days: 5, tag: 'Beach', color: '#E3F2FD', img: '🏖️', dest: 'North & South Goa' },
  { title: 'Manali Adventure', price: 14000, days: 5, tag: 'Adventure', color: '#F3E5F5', img: '⛰️', dest: 'Manali, Solang Valley' },
];

const DESTINATIONS = [
  { city: 'Goa', emoji: '🏖️', temp: '28°C' },
  { city: 'Manali', emoji: '🏔️', temp: '5°C' },
  { city: 'Kerala', emoji: '🌴', temp: '30°C' },
  { city: 'Jaipur', emoji: '🏰', temp: '32°C' },
  { city: 'Mysore', emoji: '🏛️', temp: '26°C' },
  { city: 'Andaman', emoji: '🐠', temp: '27°C' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [date, setDate] = useState(addDays(new Date(), 7));
  const [checkIn, setCheckIn] = useState(addDays(new Date(), 7));
  const [checkOut, setCheckOut] = useState(addDays(new Date(), 10));
  const [city, setCity] = useState(null);

  const handleSearch = () => {
    if (tab === 0) {
      if (!origin || !destination) return;
      const o = origin.split(' (')[1]?.replace(')', '') || '';
      const d = destination.split(' (')[1]?.replace(')', '') || '';
      navigate(`/search?type=flight&origin=${o}&destination=${d}&date=${format(date, 'yyyy-MM-dd')}&passengers=1`);
    } else if (tab === 1) {
      if (!city) return;
      const c = city.split(' (')[0];
      navigate(`/hotels?city=${c}&checkIn=${format(checkIn, 'yyyy-MM-dd')}&checkOut=${format(checkOut, 'yyyy-MM-dd')}&guests=1&rooms=1`);
    } else {
      navigate('/packages');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0D2E4E 0%, #1F4E79 50%, #2E75B6 100%)',
        minHeight: 500, display: 'flex', alignItems: 'center', pb: 8, pt: 6, position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ color: '#fff', fontWeight: 900, textAlign: 'center', mb: 1, fontSize: { xs: '2rem', md: '3rem' } }}>
            ✈️ Your Journey Starts Here
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', mb: 4, fontWeight: 400 }}>
            Search, compare and book flights, hotels & travel packages — all in one place
          </Typography>

          {/* Search Box */}
          <Paper elevation={8} sx={{ borderRadius: 4, overflow: 'hidden', maxWidth: 900, mx: 'auto' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e0e0e0' }}>
              {[{ label: 'Flights', icon: <FlightTakeoff /> }, { label: 'Hotels', icon: <Hotel /> }, { label: 'Packages', icon: <Luggage /> }].map((t, i) => (
                <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" sx={{ fontWeight: 600, px: 3 }} />
              ))}
            </Tabs>
            <Box sx={{ p: 3 }}>
              {tab === 0 && (
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Autocomplete options={CITIES} value={origin} onChange={(_, v) => setOrigin(v)}
                      renderInput={params => <TextField {...params} label="From" size="small" fullWidth />} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Autocomplete options={CITIES} value={destination} onChange={(_, v) => setDestination(v)}
                      renderInput={params => <TextField {...params} label="To" size="small" fullWidth />} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <DatePicker label="Departure" value={date} onChange={setDate} minDate={new Date()}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button variant="contained" fullWidth size="large" startIcon={<Search />} onClick={handleSearch}
                      sx={{ py: 1.2, fontWeight: 700, fontSize: '1rem' }}>
                      Search Flights
                    </Button>
                  </Grid>
                </Grid>
              )}
              {tab === 1 && (
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Autocomplete options={CITIES.map(c => c.split(' (')[0])} value={city} onChange={(_, v) => setCity(v)}
                      renderInput={params => <TextField {...params} label="City / Hotel" size="small" fullWidth />} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <DatePicker label="Check-in" value={checkIn} onChange={setCheckIn} minDate={new Date()}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <DatePicker label="Check-out" value={checkOut} onChange={setCheckOut} minDate={checkIn || new Date()}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button variant="contained" fullWidth size="large" startIcon={<Search />} onClick={handleSearch}
                      sx={{ py: 1.2, fontWeight: 700 }}>
                      Search Hotels
                    </Button>
                  </Grid>
                </Grid>
              )}
              {tab === 2 && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" mb={2}>Discover curated travel packages for every budget</Typography>
                  <Button variant="contained" size="large" startIcon={<Luggage />} onClick={handleSearch} sx={{ fontWeight: 700 }}>
                    Explore All Packages
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Popular Destinations */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>🗺️ Popular Destinations</Typography>
            <Typography color="text.secondary">Top picks by our travelers</Typography>
          </Box>
          <Chip icon={<TrendingUp />} label="Trending" color="warning" />
        </Box>
        <Grid container spacing={2}>
          {DESTINATIONS.map(dest => (
            <Grid item xs={6} sm={4} md={2} key={dest.city}>
              <Card sx={{ textAlign: 'center', cursor: 'pointer', p: 2 }}
                onClick={() => navigate(`/search?type=flight&destination=${dest.city}&date=${format(addDays(new Date(), 7), 'yyyy-MM-dd')}`)}>
                <Typography sx={{ fontSize: 40, mb: 1 }}>{dest.emoji}</Typography>
                <Typography variant="subtitle2" fontWeight={700}>{dest.city}</Typography>
                <Typography variant="caption" color="text.secondary">{dest.temp}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Packages */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>🎒 Featured Packages</Typography>
            <Typography color="text.secondary">Hand-picked holidays for every type of traveler</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate('/packages')}>View All</Button>
        </Box>
        <Grid container spacing={3}>
          {PACKAGES.map(pkg => (
            <Grid item xs={12} sm={6} md={3} key={pkg.title}>
              <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/packages')}>
                <Box sx={{ bgcolor: pkg.color, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                  {pkg.img}
                </Box>
                <CardContent>
                  <Chip label={pkg.tag} size="small" color="warning" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight={700}>{pkg.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{pkg.dest}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Starting from</Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={800}>₹{pkg.price.toLocaleString('en-IN')}</Typography>
                    </Box>
                    <Chip label={`${pkg.days}D`} size="small" variant="outlined" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Why Us */}
      <Box sx={{ bgcolor: '#f0f7ff', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={800} textAlign="center" mb={1}>Why Choose TravelMS?</Typography>
          <Typography color="text.secondary" textAlign="center" mb={5}>Trusted by thousands of travelers across India</Typography>
          <Grid container spacing={4}>
            {[
              { emoji: '🔒', title: 'Secure Payments', desc: 'All transactions protected by Razorpay with 256-bit SSL encryption' },
              { emoji: '⚡', title: 'Instant Booking', desc: 'Real-time seat availability and instant booking confirmation' },
              { emoji: '💰', title: 'Best Price Guarantee', desc: 'Dynamic pricing ensures you get the best deals at the right time' },
              { emoji: '📞', title: '24/7 Support', desc: 'Round the clock customer support via chat, email and phone' },
            ].map(f => (
              <Grid item xs={12} sm={6} md={3} key={f.title}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography sx={{ fontSize: 48, mb: 1 }}>{f.emoji}</Typography>
                  <Typography variant="h6" fontWeight={700} mb={1}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}
