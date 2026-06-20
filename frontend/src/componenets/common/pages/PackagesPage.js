import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, Box, CircularProgress, ToggleButtonGroup, ToggleButton,
  TextField, Slider, InputAdornment
} from '@mui/material';
import { Search, Luggage, Star, AccessTime } from '@mui/icons-material';
import api from '../services/api';

const CATEGORIES = ['All', 'beach', 'adventure', 'heritage', 'honeymoon', 'family', 'hill', 'international'];
const CAT_EMOJIS = { beach: '🏖️', adventure: '⛰️', heritage: '🏰', honeymoon: '💑', family: '👨‍👩‍👧‍👦', hill: '🌄', international: '🌍', All: '🎒' };

export default function PackagesPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(100000);

  const { data, isLoading } = useQuery(
    ['packages', category, search],
    () => api.get('/packages').then(r => r.data)
  );

  const packages = (data?.packages || []).filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.destinations?.some(d => d.city.toLowerCase().includes(search.toLowerCase()));
    const matchPrice = (p.priceTiers?.standard || 0) <= maxPrice;
    return matchCat && matchSearch && matchPrice;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={1}>🎒 Travel Packages</Typography>
      <Typography color="text.secondary" mb={4}>Curated holiday packages for every type of traveler</Typography>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <TextField
          placeholder="Search destinations or packages..."
          value={search} onChange={e => setSearch(e.target.value)}
          size="small" sx={{ mb: 2, width: { xs: '100%', sm: 360 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup value={category} exclusive onChange={(_, v) => v && setCategory(v)} size="small" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {CATEGORIES.map(cat => (
              <ToggleButton key={cat} value={cat} sx={{ borderRadius: '20px !important', px: 2, border: '1px solid #e0e0e0 !important', mb: 0.5 }}>
                {CAT_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ maxWidth: 360 }}>
          <Typography variant="body2" fontWeight={600}>Max Price: ₹{maxPrice.toLocaleString('en-IN')}</Typography>
          <Slider value={maxPrice} onChange={(_, v) => setMaxPrice(v)} min={5000} max={200000} step={5000}
            valueLabelDisplay="auto" valueLabelFormat={v => `₹${(v/1000).toFixed(0)}k`} />
        </Box>
      </Box>

      {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>}

      {!isLoading && packages.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h1" sx={{ fontSize: 64 }}>🌐</Typography>
          <Typography variant="h6" mt={2}>No packages found</Typography>
          <Typography color="text.secondary">Try adjusting your filters</Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {packages.map(pkg => (
          <Grid item xs={12} sm={6} md={4} key={pkg._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Package Header */}
              <Box sx={{
                height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, #1F4E79, #2E75B6)`,
                position: 'relative', overflow: 'hidden'
              }}>
                <Typography sx={{ fontSize: 64 }}>{CAT_EMOJIS[pkg.category] || '🌍'}</Typography>
                {pkg.isFeatured && (
                  <Chip label="⭐ Featured" size="small"
                    sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#F39C12', color: '#fff', fontWeight: 700 }} />
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Chip label={pkg.category} size="small" variant="outlined" sx={{ mb: 1, textTransform: 'capitalize' }} />
                <Typography variant="h6" fontWeight={700} mb={0.5}>{pkg.name}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1} sx={{
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                }}>
                  {pkg.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  {pkg.destinations?.map(d => (
                    <Chip key={d.city} label={`${d.city} (${d.nights}N)`} size="small" sx={{ bgcolor: '#f0f7ff' }} />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="caption">{pkg.duration} Nights</Typography>
                  </Box>
                  {pkg.averageRating > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star fontSize="small" sx={{ color: '#F39C12' }} />
                      <Typography variant="caption">{pkg.averageRating?.toFixed(1)} ({pkg.reviewCount})</Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {pkg.inclusions?.slice(0, 3).map(inc => (
                    <Chip key={inc} label={`✓ ${inc}`} size="small" color="success" variant="outlined" />
                  ))}
                  {pkg.inclusions?.length > 3 && (
                    <Chip label={`+${pkg.inclusions.length - 3} more`} size="small" variant="outlined" />
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Per person from</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={800}>
                    ₹{pkg.priceTiers?.standard?.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Button variant="contained" size="small" onClick={() => navigate(`/packages/${pkg._id}`)}>
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
