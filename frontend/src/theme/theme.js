import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1F4E79', light: '#2E75B6', dark: '#0D2E4E', contrastText: '#fff' },
    secondary: { main: '#F39C12', light: '#F5B041', dark: '#CA8A04', contrastText: '#fff' },
    success: { main: '#27AE60' },
    error: { main: '#E74C3C' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#1A1A2E', secondary: '#5A6472' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h1: { fontWeight: 800, fontSize: '3rem' },
    h2: { fontWeight: 700, fontSize: '2.25rem' },
    h3: { fontWeight: 700, fontSize: '1.75rem' },
    h4: { fontWeight: 700, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '10px 24px', fontSize: '0.95rem' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #0D2E4E 0%, #1F4E79 100%)' },
          boxShadow: '0 4px 15px rgba(31,78,121,0.3)',
        },
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.16)', transform: 'translateY(-2px)', transition: 'all 0.2s ease' }
        }
      }
    },
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

export default theme;
