import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { theme } from './styles/theme';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import IdososPage from './pages/IdososPage';
import ResponsaveisPage from './pages/ResponsaveisPage';
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
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;




