import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { theme } from './styles/theme';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import IdososPage from './pages/IdososPage';
import ResponsaveisPage from './pages/ResponsaveisPage';
import NotasFiscaisPage from './pages/NotasFiscaisPage';
import TemplatesPage from './pages/TemplatesPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import { useSystemInitialization } from './hooks/useSystemInitialization';

function App() {
  const { isInitialized, isLoading, error } = useSystemInitialization();

  // Mostrar tela de carregamento enquanto inicializa
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Inicializando sistema...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Carregando dados existentes
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={2}
          p={3}
        >
          <Alert severity="warning" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Aviso de Inicialização
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              O sistema continuará funcionando, mas alguns dados podem não estar disponíveis.
            </Typography>
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/idosos" element={<IdososPage />} />
            <Route path="/responsaveis" element={<ResponsaveisPage />} />
            <Route path="/notas-fiscais" element={<NotasFiscaisPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;




