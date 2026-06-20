import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', bgcolor: '#f0f7ff' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ fontSize: 96, lineHeight: 1 }}>✈️</Typography>
        <Typography variant="h1" fontWeight={900} sx={{ fontSize: '6rem', color: 'primary.main', lineHeight: 1, mt: 1 }}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={700} mt={2} mb={1}>Oops! Page Not Found</Typography>
        <Typography color="text.secondary" mb={4}>
          Looks like this flight went off course. The page you're looking for doesn't exist.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="contained" startIcon={<Home />} onClick={() => navigate('/')}>Back to Home</Button>
        </Box>
      </Container>
    </Box>
  );
}
