// PackageDetailPage.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, Chip, Divider, CircularProgress
} from '@mui/material';
import { CheckCircle, AccessTime, Group } from '@mui/icons-material';
import api from '../services/api';

export default function PackageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['package', id], () => api.get(`/packages/${id}`).then(r => r.data));
  const pkg = data?.package;

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!pkg) return <Container sx={{ py: 8, textAlign: 'center' }}><Typography>Package not found.</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={1}>{pkg.name}</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={pkg.category} variant="outlined" />
        <Chip icon={<AccessTime />} label={`${pkg.duration} Nights`} />
        <Chip icon={<Group />} label={`Max ${pkg.maxGroupSize} people`} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={1}>About This Package</Typography>
              <Typography color="text.secondary" mb={2}>{pkg.description}</Typography>
              <Typography variant="h6" fontWeight={700} mb={1}>Destinations</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {pkg.destinations?.map(d => <Chip key={d.city} label={`${d.city} (${d.nights}N)`} color="primary" variant="outlined" />)}
              </Box>
              {pkg.inclusions?.length > 0 && (
                <>
                  <Typography variant="h6" fontWeight={700} mb={1}>Inclusions</Typography>
                  <Grid container spacing={1}>
                    {pkg.inclusions.map(inc => (
                      <Grid item xs={6} key={inc}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckCircle fontSize="small" color="success" />
                          <Typography variant="body2">{inc}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
              {pkg.itinerary?.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight={700} mb={2}>Itinerary</Typography>
                  {pkg.itinerary.map(day => (
                    <Box key={day.day} sx={{ mb: 2, pl: 2, borderLeft: '3px solid #1F4E79' }}>
                      <Typography fontWeight={700} color="primary.main">Day {day.day}: {day.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{day.description}</Typography>
                    </Box>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Starting from</Typography>
              <Typography variant="h4" fontWeight={900} color="primary.main" mb={1}>
                ₹{pkg.priceTiers?.standard?.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">per person</Typography>
              <Divider sx={{ my: 2 }} />
              {pkg.priceTiers?.deluxe && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Deluxe</Typography>
                  <Typography fontWeight={700}>₹{pkg.priceTiers.deluxe.toLocaleString('en-IN')}</Typography>
                </Box>
              )}
              {pkg.priceTiers?.premium && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Premium</Typography>
                  <Typography fontWeight={700}>₹{pkg.priceTiers.premium.toLocaleString('en-IN')}</Typography>
                </Box>
              )}
              <Button variant="contained" fullWidth size="large" onClick={() => navigate('/login')}>
                Book This Package
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
