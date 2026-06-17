import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  Avatar, Box, Drawer, List, ListItem, ListItemText, ListItemIcon,
  Chip, useTheme, useMediaQuery, Divider
} from '@mui/material';
import {
  FlightTakeoff, Hotel, Luggage, Menu as MenuIcon,
  AccountCircle, BookOnline, AdminPanelSettings, Logout, Person
} from '@mui/icons-material';
import { logoutUser } from '../../features/authSlice';
import { showNotification } from '../../features/uiSlice';

export default function Navbar() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(showNotification({ type: 'success', message: 'Logged out successfully' }));
    navigate('/');
    setAnchorEl(null);
  };

  const navLinks = [
    { label: 'Flights', icon: <FlightTakeoff fontSize="small" />, path: '/search?type=flight' },
    { label: 'Hotels', icon: <Hotel fontSize="small" />, path: '/hotels' },
    { label: 'Packages', icon: <Luggage fontSize="small" />, path: '/packages' },
  ];

  return (
    <AppBar position="sticky" elevation={0}
      sx={{ background: 'linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: 4 }}>
          <FlightTakeoff sx={{ color: '#F39C12', fontSize: 32, mr: 1 }} />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Travel<span style={{ color: '#F39C12' }}>MS</span>
          </Typography>
        </Box>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
            {navLinks.map(link => (
              <Button key={link.label} component={Link} to={link.path}
                startIcon={link.icon}
                sx={{ color: 'rgba(255,255,255,0.9)', '&:hover': { color: '#F39C12', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

        {/* Auth section */}
        {user ? (
          <>
            <Chip label={user.role.toUpperCase()} size="small"
              sx={{ bgcolor: 'rgba(243,156,18,0.2)', color: '#F39C12', border: '1px solid #F39C12', mr: 1, fontWeight: 700, display: { xs: 'none', sm: 'flex' } }} />
            <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{ bgcolor: '#F39C12', width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>{user.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                <Person fontSize="small" sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate('/my-bookings'); setAnchorEl(null); }}>
                <BookOnline fontSize="small" sx={{ mr: 1 }} /> My Bookings
              </MenuItem>
              {user.role === 'admin' && (
                <MenuItem onClick={() => { navigate('/admin'); setAnchorEl(null); }}>
                  <AdminPanelSettings fontSize="small" sx={{ mr: 1 }} /> Admin Panel
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={Link} to="/login" variant="outlined"
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Login
            </Button>
            <Button component={Link} to="/register" variant="contained"
              sx={{ bgcolor: '#F39C12', '&:hover': { bgcolor: '#e08e0b' }, color: '#fff', display: { xs: 'none', sm: 'flex' } }}>
              Register
            </Button>
          </Box>
        )}

        {/* Mobile menu */}
        {isMobile && (
          <IconButton sx={{ color: '#fff', ml: 1 }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <List>
            {navLinks.map(link => (
              <ListItem key={link.label} button component={Link} to={link.path} onClick={() => setDrawerOpen(false)}>
                <ListItemIcon>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
