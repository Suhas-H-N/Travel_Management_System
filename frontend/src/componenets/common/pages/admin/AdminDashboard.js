import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, CircularProgress
} from '@mui/material';
import { TrendingUp, People, BookOnline, Cancel, AttachMoney } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';

const COLORS = ['#1F4E79', '#F39C12', '#27AE60', '#E74C3C', '#8E44AD'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery('adminAnalytics', () =>
    api.get('/admin/analytics?period=30').then(r => r.data.analytics)
  );

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress size={60} />
    </Box>
  );

  const kpis = [
    { label: 'Total Revenue (30d)', value: `₹${((data?.totalRevenue || 0) / 100).toLocaleString('en-IN')}`, icon: <AttachMoney />, color: '#27AE60' },
    { label: 'Total Bookings', value: data?.totalBookings || 0, icon: <BookOnline />, color: '#1F4E79' },
    { label: 'New Users', value: data?.newUsers || 0, icon: <People />, color: '#F39C12' },
    { label: 'Cancellation Rate', value: `${data?.cancellationRate || 0}%`, icon: <Cancel />, color: '#E74C3C' },
  ];

  const revenueData = (data?.revenueByDay || []).map(d => ({
    date: d._id?.slice(5), revenue: (d.revenue || 0) / 100, bookings: d.count
  }));

  const pieData = (data?.bookingsByType || []).map(b => ({
    name: b._id, value: b.count
  }));

  const statusColor = { confirmed: 'success', pending: 'warning', cancelled: 'error', completed: 'default' };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Admin Dashboard</Typography>
          <Typography color="text.secondary">Last 30 days overview</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/admin/bookings')}>All Bookings</Button>
          <Button variant="contained" onClick={() => navigate('/admin/users')}>Manage Users</Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        {kpis.map(kpi => (
          <Grid item xs={12} sm={6} md={3} key={kpi.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: kpi.color }}>{kpi.value}</Typography>
                  </Box>
                  <Box sx={{ bgcolor: kpi.color + '20', borderRadius: 2, p: 1, color: kpi.color }}>{kpi.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Revenue Trend (₹)</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#1F4E79" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Bookings by Type</Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Bookings */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>Recent Bookings</Typography>
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  {['Ref', 'User', 'Type', 'Date', 'Amount', 'Status'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.recentBookings || []).map(b => (
                  <TableRow key={b._id} hover>
                    <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{b.bookingRef}</Typography></TableCell>
                    <TableCell>{b.userId?.name || 'N/A'}</TableCell>
                    <TableCell><Chip label={b.bookingType} size="small" variant="outlined" /></TableCell>
                    <TableCell>{new Date(b.travelDate).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell fontWeight={700}>₹{b.totalAmount?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip label={b.status} size="small" color={statusColor[b.status] || 'default'} />
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.recentBookings?.length) && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No recent bookings</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>
    </Container>
  );
}
