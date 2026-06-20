// LoginPage.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Card, CardContent, Typography, TextField, Button, Divider, Alert, CircularProgress } from '@mui/material';
import { FlightTakeoff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser, clearError } from '../features/authSlice';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(s => s.auth);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);
  useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({ email: Yup.string().email('Invalid email').required('Required'), password: Yup.string().required('Required') }),
    onSubmit: values => dispatch(loginUser(values)),
  });

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', bgcolor: '#f0f7ff' }}>
      <Container maxWidth="xs">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <FlightTakeoff sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight={800}>Welcome Back</Typography>
              <Typography variant="body2" color="text.secondary">Sign in to your TravelMS account</Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={formik.handleSubmit}>
              <TextField fullWidth label="Email" name="email" type="email" value={formik.values.email}
                onChange={formik.handleChange} error={formik.touched.email && !!formik.errors.email}
                helperText={formik.touched.email && formik.errors.email} sx={{ mb: 2 }} />
              <TextField fullWidth label="Password" name="password" type="password" value={formik.values.password}
                onChange={formik.handleChange} error={formik.touched.password && !!formik.errors.password}
                helperText={formik.touched.password && formik.errors.password} sx={{ mb: 3 }} />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </form>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" textAlign="center">
              Don't have an account? <Link to="/register" style={{ color: '#1F4E79', fontWeight: 700 }}>Register</Link>
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={1}>
              Demo: admin@travelms.com / Admin@1234
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default LoginPage;
