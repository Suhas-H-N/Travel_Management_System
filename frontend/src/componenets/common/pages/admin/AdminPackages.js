// AdminPackages.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Container, Typography, Grid, Card, CardContent, CardActions, Button,
  Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../../services/api';

export default function AdminPackages() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery('adminPackages', () => api.get('/packages').then(r => r.data));
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'beach', duration: 5, priceTiers: { standard: 10000 } });

  const createMutation = useMutation(
    () => api.post('/packages', form),
    { onSuccess: () => { qc.invalidateQueries('adminPackages'); setDialog(false); } }
  );

  const deleteMutation = useMutation(
    id => api.delete(`/packages/${id}`),
    { onSuccess: () => qc.invalidateQueries('adminPackages') }
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Manage Packages</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialog(true)}>Add Package</Button>
      </Box>

      {isLoading ? <CircularProgress /> : (
        <Grid container spacing={3}>
          {data?.packages?.map(pkg => (
            <Grid item xs={12} sm={6} md={4} key={pkg._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={pkg.category} size="small" variant="outlined" textTransform="capitalize" />
                    <Chip label={pkg.isActive ? 'Active' : 'Inactive'} size="small" color={pkg.isActive ? 'success' : 'default'} />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>{pkg.name}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1} sx={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {pkg.description}
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={800}>
                    ₹{pkg.priceTiers?.standard?.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{pkg.duration} nights · {pkg.bookingCount || 0} bookings</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <Button size="small" startIcon={<Delete />} color="error"
                    onClick={() => deleteMutation.mutate(pkg._id)}>
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Package</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Package Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Duration (nights)" type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Standard Price (₹)" type="number" value={form.priceTiers.standard} onChange={e => setForm({...form, priceTiers: {...form.priceTiers, standard: e.target.value}})} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createMutation.mutate()} disabled={createMutation.isLoading}>
            Create Package
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
