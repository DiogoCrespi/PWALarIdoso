import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { theme } from './styles/theme';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import IdososPage from './pages/IdososPage';
import ResponsaveisPage from './pages/ResponsaveisPage';
import NotasFiscaisPage from './pages/NotasFiscaisPage';
import TemplatesPage from './pages/TemplatesPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';

function App() {
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




