import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert, Snackbar, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DashboardGrid from '../components/Dashboard/DashboardGrid';
import PaymentModal from '../components/Dashboard/PaymentModal';
import type { DashboardData, Idoso } from '../electron.d';

export default function DashboardPage() {
  const [ano, setAno] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  // Estados do modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIdoso, setSelectedIdoso] = useState<Idoso | null>(null);
  const [selectedMes, setSelectedMes] = useState<number>(1);
  const [selectedPagamento, setSelectedPagamento] = useState<any>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Estados para modal de novo pagamento
  const [novoPagamentoOpen, setNovoPagamentoOpen] = useState(false);
  const [idosoSelecionado, setIdosoSelecionado] = useState<Idoso | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);

  // Gerar lista de anos (5 anos atrás até 2 anos à frente)
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 8 }, (_, i) => anoAtual - 5 + i);

  useEffect(() => {
    loadDashboard();
  }, [ano]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.electronAPI.dashboard.get(ano);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (idosoId: number, mes: number) => {
    console.log('🔍 DashboardPage: Célula clicada - Idoso ID:', idosoId, 'Mês:', mes);
    console.log('📊 DashboardPage: Dados disponíveis:', dashboardData);
    
    // Buscar dados do idoso
    const idoso = dashboardData?.idosos.find(i => i.id === idosoId);
    console.log('👤 DashboardPage: Idoso encontrado:', idoso);
    
    if (!idoso) {
      console.error('❌ DashboardPage: Idoso não encontrado para ID:', idosoId);
      return;
    }

    // Buscar pagamento existente
    const pagamento = dashboardData?.pagamentos[idosoId]?.[mes];
    console.log('💰 DashboardPage: Pagamento existente:', pagamento);

    setSelectedIdoso(idoso);
    setSelectedMes(mes);
    setSelectedPagamento(pagamento || null);
    setModalOpen(true);
  };

  const handleSavePayment = async (data: any) => {
    try {
      // Simular chamada da API
      await window.electronAPI.pagamentos.upsert(data);
      
      // Recarregar dados do dashboard
      await loadDashboard();
      
      setSnackbarMessage('Pagamento salvo com sucesso!');
      setSnackbarOpen(true);
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao salvar pagamento');
    }
  };

  const handleGerarRecibo = async (pagamentoId: number) => {
    try {
      const result = await window.electronAPI.recibos.gerarDoacao(pagamentoId);
      
      setSnackbarMessage(`Recibo gerado: ${result.nomeArquivo}`);
      setSnackbarOpen(true);
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao gerar recibo');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedIdoso(null);
    setSelectedMes(1);
    setSelectedPagamento(null);
  };

  const handleNovoPagamento = () => {
    setNovoPagamentoOpen(true);
  };

  const handleSelecionarIdoso = (idoso: Idoso) => {
    setIdosoSelecionado(idoso);
    setNovoPagamentoOpen(false);
    setModalOpen(true);
    setSelectedIdoso(idoso);
    setSelectedMes(mesSelecionado);
    setSelectedPagamento(null);
  };

  const handleCloseNovoPagamento = () => {
    setNovoPagamentoOpen(false);
    setIdosoSelecionado(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard de Pagamentos
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNovoPagamento}
            sx={{ mr: 2 }}
          >
            Novo Pagamento
          </Button>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Ano</InputLabel>
            <Select
              value={ano}
              label="Ano"
              onChange={(e) => setAno(Number(e.target.value))}
            >
              {anos.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      ) : dashboardData ? (
        <Paper elevation={3}>
          <DashboardGrid
            idosos={dashboardData.idosos}
            pagamentos={dashboardData.pagamentos}
            onCellClick={handleCellClick}
          />
        </Paper>
      ) : (
        <Alert severity="info">
          Nenhum dado disponível
        </Alert>
      )}

      {dashboardData && !loading && (
        <Box sx={{ mt: 3, display: 'flex', gap: 3, justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 24, height: 24, backgroundColor: '#4caf50', borderRadius: 1 }} />
            <Typography variant="body2">Pago</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 24, height: 24, backgroundColor: '#ff9800', borderRadius: 1 }} />
            <Typography variant="body2">Parcial</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 24, height: 24, backgroundColor: '#f44336', borderRadius: 1 }} />
            <Typography variant="body2">Pendente</Typography>
          </Box>
        </Box>
      )}

      {/* Modal de Pagamento */}
      <PaymentModal
        open={modalOpen}
        onClose={handleCloseModal}
        idoso={selectedIdoso}
        mes={selectedMes}
        ano={ano}
        pagamentoExistente={selectedPagamento}
        onSave={handleSavePayment}
        onGerarRecibo={handleGerarRecibo}
      />

      {/* Modal de Seleção de Idoso para Novo Pagamento */}
      <Dialog
        open={novoPagamentoOpen}
        onClose={handleCloseNovoPagamento}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Selecionar Idoso para Novo Pagamento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Escolha o idoso e o mês para criar um novo pagamento
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {dashboardData && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Mês</InputLabel>
                  <Select
                    value={mesSelecionado}
                    label="Mês"
                    onChange={(e) => setMesSelecionado(Number(e.target.value))}
                  >
                    {[
                      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                    ].map((mes, index) => (
                      <MenuItem key={index + 1} value={index + 1}>
                        {mes}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                {dashboardData.idosos.map((idoso) => (
                  <Paper
                    key={idoso.id}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover'
                      }
                    }}
                    onClick={() => handleSelecionarIdoso(idoso)}
                  >
                    <Typography variant="h6" gutterBottom>
                      {idoso.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>CPF:</strong> {idoso.cpf}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Mensalidade:</strong> R$ {idoso.valorMensalidadeBase?.toFixed(2) || '0,00'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Responsável:</strong> {idoso.responsavel?.nome}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseNovoPagamento}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}


