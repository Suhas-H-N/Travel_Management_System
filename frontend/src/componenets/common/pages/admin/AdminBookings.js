// AdminBookings.js
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Container, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Paper, Chip, CircularProgress, Box, TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import api from '../../services/api';

export default function AdminBookings() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery(['adminBookings', status], () =>
    api.get('/admin/bookings', { params: status ? { status } : {} }).then(r => r.data)
  );
  const STATUS_COLORS = { confirmed: 'success', pending: 'warning', cancelled: 'error', completed: 'default' };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>All Bookings</Typography>
      <FormControl size="small" sx={{ mb: 3, minWidth: 160 }}>
        <InputLabel>Filter by Status</InputLabel>
        <Select value={status} label="Filter by Status" onChange={e => setStatus(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {['confirmed','pending','cancelled','completed','refunded'].map(s =>
            <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</MenuItem>
          )}
        </Select>
      </FormControl>
      {isLoading ? <CircularProgress /> : (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Ref', 'User', 'Type', 'Travel Date', 'Amount', 'Status', 'Created'].map(h =>
                  <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.bookings?.map(b => (
                <TableRow key={b._id} hover>
                  <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>{b.bookingRef}</Typography></TableCell>
                  <TableCell>{b.userId?.name || 'N/A'}<br/><Typography variant="caption" color="text.secondary">{b.userId?.email}</Typography></TableCell>
                  <TableCell><Chip label={b.bookingType} size="small" variant="outlined" /></TableCell>
                  <TableCell>{new Date(b.travelDate).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell fontWeight={700}>₹{b.totalAmount?.toLocaleString('en-IN')}</TableCell>
                  <TableCell><Chip label={b.status} size="small" color={STATUS_COLORS[b.status]||'default'} /></TableCell>
                  <TableCell>{new Date(b.createdAt).toLocaleDateString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
