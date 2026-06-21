import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Typography, Box, Grid, Card, CardContent, TextField,
  Button, Avatar, Chip, Divider, Alert, CircularProgress, Tabs, Tab
} from '@mui/material';
import { Person, Lock, Star } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from 'react-query';
import api from '../services/api';
import { updateUser } from '../features/authSlice';
import { showNotification } from '../features/uiSlice';

export default function ProfilePage() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);

  const profileMutation = useMutation(
    values => api.put('/users/me', values),
    {
      onSuccess: ({ data }) => {
        dispatch(updateUser(data.user));
        dispatch(showNotification({ type: 'success', message: 'Profile updated successfully!' }));
      }
    }
  );

  const passwordMutation = useMutation(
    values => api.put('/users/me/password', values),
    {
      onSuccess: () => {
        dispatch(showNotification({ type: 'success', message: 'Password changed successfully!' }));
        pwFormik.resetForm();
      },
      onError: (err) => dispatch(showNotification({ type: 'error', message: err.response?.data?.message || 'Failed to change password' }))
    }
  );

  const profileFormik = useFormik({
    initialValues: { name: user?.name || '', phone: user?.phone || '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required').min(2),
      phone: Yup.string().matches(/^[+]?[0-9]{10,13}$/, 'Invalid phone number'),
    }),
    enableReinitialize: true,
    onSubmit: values => profileMutation.mutate(values),
  });

  const pwFormik = useFormik({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Required'),
      newPassword: Yup.string().required('Required').min(8, 'Min 8 characters')
        .matches(/[A-Z]/, 'Must contain uppercase').matches(/[0-9]/, 'Must contain number'),
      confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required('Required'),
    }),
    onSubmit: ({ confirmPassword, ...values }) => passwordMutation.mutate(values),
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={1}>My Profile</Typography>
      <Typography color="text.secondary" mb={3}>Manage your account settings and preferences</Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 32, fontWeight: 800 }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>{user?.email}</Typography>
              <Chip
                label={user?.role?.toUpperCase()}
                color={user?.role === 'admin' ? 'error' : 'primary'}
                size="small" sx={{ fontWeight: 700 }}
              />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={800} color="primary.main">{user?.loyaltyPoints || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Loyalty Points</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={800} color="warning.main">
                    {user?.loyaltyPoints >= 5000 ? 'Gold' : user?.loyaltyPoints >= 1000 ? 'Silver' : 'Bronze'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Tier</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e0e0e0' }}>
                <Tab label="Profile Info" icon={<Person fontSize="small" />} iconPosition="start" />
                <Tab label="Change Password" icon={<Lock fontSize="small" />} iconPosition="start" />
              </Tabs>

              {tab === 0 && (
                <form onSubmit={profileFormik.handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Full Name" name="name"
                        value={profileFormik.values.name} onChange={profileFormik.handleChange}
                        error={profileFormik.touched.name && !!profileFormik.errors.name}
                        helperText={profileFormik.touched.name && profileFormik.errors.name} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Email Address" value={user?.email} disabled
                        helperText="Email address cannot be changed" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Phone Number" name="phone"
                        value={profileFormik.values.phone} onChange={profileFormik.handleChange}
                        error={profileFormik.touched.phone && !!profileFormik.errors.phone}
                        helperText={profileFormik.touched.phone && profileFormik.errors.phone} />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" disabled={profileMutation.isLoading}>
                        {profileMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}

              {tab === 1 && (
                <form onSubmit={pwFormik.handleSubmit}>
                  <Grid container spacing={2}>
                    {[
                      { name: 'currentPassword', label: 'Current Password' },
                      { name: 'newPassword', label: 'New Password' },
                      { name: 'confirmPassword', label: 'Confirm New Password' },
                    ].map(field => (
                      <Grid item xs={12} key={field.name}>
                        <TextField fullWidth type="password" label={field.label} name={field.name}
                          value={pwFormik.values[field.name]} onChange={pwFormik.handleChange}
                          error={pwFormik.touched[field.name] && !!pwFormik.errors[field.name]}
                          helperText={pwFormik.touched[field.name] && pwFormik.errors[field.name]} />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" color="warning" disabled={passwordMutation.isLoading}>
                        {passwordMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : 'Change Password'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
