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
      
      // 🔧 Verificar idosos sem ID e atribuir IDs temporários localmente
      const idososSemId: string[] = [];
      const idososComIdCorrigido = data.idosos.map((idoso, index) => {
        if (!idoso.id) {
          // Gerar ID temporário único localmente (sem salvar no banco)
          const idTemporario = Date.now() + index;
          console.warn('⚠️ Idoso sem ID encontrado:', idoso.nome);
          console.log('🔧 Atribuindo ID temporário:', idTemporario);
          
          // Guardar nome para exibir no snackbar
          idososSemId.push(idoso.nome);
          
          return {
            ...idoso,
            id: idTemporario
          };
        }
        return idoso;
      });
      
      // Atualizar dados com IDs temporários
      setDashboardData({
        ...data,
        idosos: idososComIdCorrigido
      });
      
      // Mostrar snackbar se houver idosos sem ID
      if (idososSemId.length > 0) {
        console.log('💡 Dica: IDs permanentes serão gerados ao editar/salvar os idosos');
        
        let mensagem = '';
        if (idososSemId.length === 1) {
          mensagem = `⚠️ 1 idoso importado sem ID: "${idososSemId[0]}". ID temporário atribuído. Dashboard funciona normalmente. Para corrigir permanentemente, edite e salve este idoso.`;
        } else if (idososSemId.length <= 5) {
          mensagem = `⚠️ ${idososSemId.length} idosos importados sem ID: ${idososSemId.join(', ')}. IDs temporários atribuídos. Dashboard funciona normalmente. Para corrigir permanentemente, edite e salve cada um.`;
        } else {
          mensagem = `⚠️ ${idososSemId.length} idosos importados sem ID. IDs temporários atribuídos. Dashboard funciona normalmente. Para corrigir permanentemente, edite e salve cada idoso em "Gerenciar Idosos".`;
        }
        
        setSnackbarMessage(mensagem);
        setSnackbarOpen(true);
      }
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 0 },
        mb: { xs: 1.5, sm: 2 }
      }}>
        <Box>
          <Typography variant="h4" component="h1" fontSize={{ xs: '1.5rem', sm: '2rem' }} sx={{ mb: 0.5 }}>
            Dashboard de Pagamentos
          </Typography>
          {/* Legenda no cabeçalho */}
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1.5, sm: 2 }, 
            alignItems: 'center',
            flexWrap: 'wrap',
            mt: 0.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 14, height: 14, backgroundColor: '#4caf50', borderRadius: 0.5 }} />
              <Typography variant="caption" fontSize={{ xs: '0.7rem', sm: '0.75rem' }} color="text.secondary">
                Pago
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 14, height: 14, backgroundColor: '#ff9800', borderRadius: 0.5 }} />
              <Typography variant="caption" fontSize={{ xs: '0.7rem', sm: '0.75rem' }} color="text.secondary">
                Parcial
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 14, height: 14, backgroundColor: '#f44336', borderRadius: 0.5 }} />
              <Typography variant="caption" fontSize={{ xs: '0.7rem', sm: '0.75rem' }} color="text.secondary">
                Pendente
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          alignItems: 'center',
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNovoPagamento}
            size="small"
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1.5, sm: 2 }
            }}
          >
            Novo Pagamento
          </Button>
          
          <FormControl sx={{ minWidth: { xs: 90, sm: 120 } }} size="small">
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
        autoHideDuration={8000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarMessage.includes('⚠️') ? 'warning' : 'success'}
          sx={{ width: '100%', maxWidth: '600px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}


