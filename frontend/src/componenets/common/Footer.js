import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, IconButton } from '@mui/material';
import { FlightTakeoff, Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#1A1A2E', color: '#ccc', mt: 8, pt: 6, pb: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FlightTakeoff sx={{ color: '#F39C12', mr: 1 }} />
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>
                Travel<span style={{ color: '#F39C12' }}>MS</span>
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 2 }}>
              Your one-stop platform for seamless travel planning, booking, and management. Explore the world with confidence.
            </Typography>
            <Box>
              {[Facebook, Twitter, Instagram, LinkedIn].map((Icon, i) => (
                <IconButton key={i} size="small" sx={{ color: '#ccc', '&:hover': { color: '#F39C12' } }}>
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {[
            {
              title: 'Quick Links',
              links: ['Flights', 'Hotels', 'Travel Packages', 'Bus Tickets', 'Train Tickets']
            },
            {
              title: 'Support',
              links: ['Help Center', 'Contact Us', 'Cancellation Policy', 'Refund Status', 'Travel Insurance']
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Press', 'Privacy Policy', 'Terms of Service']
            }
          ].map(section => (
            <Grid item xs={6} md={2} key={section.title}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
                {section.title}
              </Typography>
              {section.links.map(link => (
                <Box key={link} sx={{ mb: 1 }}>
                  <Link href="#" underline="hover" sx={{ color: '#aaa', fontSize: '0.85rem', '&:hover': { color: '#F39C12' } }}>
                    {link}
                  </Link>
                </Box>
              ))}
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: '#333', my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#888' }}>
            © {new Date().getFullYear()} TravelMS. All rights reserved. | Built with ❤️ by CSE Students
          </Typography>
          <Typography variant="caption" sx={{ color: '#888' }}>
            Secured by SSL | Payments via Razorpay
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
