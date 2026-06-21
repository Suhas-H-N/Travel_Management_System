import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Card, CardContent, Typography, TextField, Button, Alert, CircularProgress, Grid } from '@mui/material';
import { FlightTakeoff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerUser, clearError } from '../features/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(s => s.auth);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);
  useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

  const formik = useFormik({
    initialValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required').min(2),
      email: Yup.string().email('Invalid email').required('Required'),
      phone: Yup.string().matches(/^[+]?[0-9]{10,13}$/, 'Invalid phone'),
      password: Yup.string().required('Required').min(8, 'Min 8 chars').matches(/[A-Z]/, 'Must have uppercase').matches(/[0-9]/, 'Must have number'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Required'),
    }),
    onSubmit: ({ confirmPassword, ...values }) => dispatch(registerUser(values)),
  });

  return (
    <Box sx={{ minHeight: '90vh', display: 'flex', alignItems: 'center', bgcolor: '#f0f7ff', py: 4 }}>
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <FlightTakeoff sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight={800}>Create Your Account</Typography>
              <Typography variant="body2" color="text.secondary">Join thousands of happy travelers</Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Full Name" name="name" value={formik.values.name}
                    onChange={formik.handleChange} error={formik.touched.name && !!formik.errors.name}
                    helperText={formik.touched.name && formik.errors.name} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" name="email" type="email" value={formik.values.email}
                    onChange={formik.handleChange} error={formik.touched.email && !!formik.errors.email}
                    helperText={formik.touched.email && formik.errors.email} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" name="phone" value={formik.values.phone}
                    onChange={formik.handleChange} error={formik.touched.phone && !!formik.errors.phone}
                    helperText={formik.touched.phone && formik.errors.phone} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Password" name="password" type="password" value={formik.values.password}
                    onChange={formik.handleChange} error={formik.touched.password && !!formik.errors.password}
                    helperText={formik.touched.password && formik.errors.password} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password"
                    value={formik.values.confirmPassword} onChange={formik.handleChange}
                    error={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword} />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                  </Button>
                </Grid>
              </Grid>
            </form>
            <Typography variant="body2" textAlign="center" mt={2}>
              Already have an account? <Link to="/login" style={{ color: '#1F4E79', fontWeight: 700 }}>Sign In</Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
