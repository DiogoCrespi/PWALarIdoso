import { createTheme } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

// Tema personalizado com cores vibrantes
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',      // Azul Material
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',      // Rosa destaque
      light: '#ff5983',
      dark: '#9a0036',
    },
    success: {
      main: '#4caf50',      // Verde vibrante - PAGO
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',      // Laranja chamativo - PARCIAL
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',      // Vermelho alerta - PENDENTE
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#2196f3',      // Azul claro
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
}, ptBR);

// Cores personalizadas para status de pagamento
export const statusColors = {
  PAGO: '#4caf50',        // Verde
  PARCIAL: '#ff9800',     // Laranja
  PENDENTE: '#f44336',    // Vermelho
};

export const statusLabels = {
  PAGO: 'Pago',
  PARCIAL: 'Parcial',
  PENDENTE: 'Pendente',
};




