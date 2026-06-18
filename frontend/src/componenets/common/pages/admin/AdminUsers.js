// AdminUsers.js
import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Container, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Paper, Chip, CircularProgress, Select, MenuItem, Avatar, Box
} from '@mui/material';
import api from '../../services/api';

export default function AdminUsers() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery('adminUsers', () => api.get('/admin/users').then(r => r.data));

  const roleMutation = useMutation(
    ({ id, role }) => api.put(`/admin/users/${id}/role`, { role }),
    { onSuccess: () => qc.invalidateQueries('adminUsers') }
  );

  const ROLE_COLORS = { admin: 'error', agent: 'warning', user: 'default' };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>Manage Users</Typography>
      {isLoading ? <CircularProgress /> : (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['User', 'Email', 'Phone', 'Role', 'Loyalty Points', 'Joined'].map(h =>
                  <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.users?.map(u => (
                <TableRow key={u._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </Avatar>
                      {u.name}
                    </Box>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || '-'}</TableCell>
                  <TableCell>
                    <Select size="small" value={u.role}
                      onChange={e => roleMutation.mutate({ id: u._id, role: e.target.value })}
                      sx={{ minWidth: 90, fontSize: 13 }}>
                      {['user', 'agent', 'admin'].map(r =>
                        <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</MenuItem>
                      )}
                    </Select>
                  </TableCell>
                  <TableCell>{u.loyaltyPoints || 0}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
