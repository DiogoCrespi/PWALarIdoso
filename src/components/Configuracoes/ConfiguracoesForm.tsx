import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  FolderOpen as FolderIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

interface Configuracao {
  id: number;
  chave: string;
  valor: string;
  descricao: string;
}

interface BackupAgendado {
  id: number;
  nome: string;
  caminho: string;
  dataAgendamento: Date;
  ativo: boolean;
  ultimoBackup?: Date;
}

const ConfiguracoesForm: React.FC = () => {
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [backupsAgendados, setBackupsAgendados] = useState<BackupAgendado[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Estados para novo backup
  const [dialogBackup, setDialogBackup] = useState(false);
  const [novoBackup, setNovoBackup] = useState({
    nome: '',
    caminho: '',
    dataAgendamento: new Date(),
  });

  useEffect(() => {
    carregarConfiguracoes();
    carregarBackupsAgendados();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const configs = await window.electronAPI?.configuracoes.list() || [];
      setConfiguracoes(configs);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      mostrarSnackbar('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarBackupsAgendados = async () => {
    // Simular backups agendados (em produção viria do banco)
    const backups = [
      {
        id: 1,
        nome: 'Backup Semanal',
        caminho: 'C:\\Backups\\LarIdosos\\semanal',
        dataAgendamento: new Date('2025-10-15'),
        ativo: true,
        ultimoBackup: new Date('2025-10-08'),
      },
      {
        id: 2,
        nome: 'Backup Mensal',
        caminho: 'C:\\Backups\\LarIdosos\\mensal',
        dataAgendamento: new Date('2025-11-01'),
        ativo: false,
        ultimoBackup: new Date('2025-09-01'),
      },
    ];
    setBackupsAgendados(backups);
  };

  const salvarConfiguracao = async (config: Configuracao) => {
    try {
      setLoading(true);
      await window.electronAPI?.configuracoes.update(config.id, { valor: config.valor });
      mostrarSnackbar('Configuração salva com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      mostrarSnackbar('Erro ao salvar configuração', 'error');
    } finally {
      setLoading(false);
    }
  };

  const gerarBackupCSV = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os dados
      const [responsaveis, idosos, pagamentos] = await Promise.all([
        window.electronAPI?.responsaveis.list() || [],
        window.electronAPI?.idosos.list() || [],
        // Simular pagamentos (em produção viria da API)
        [
          { id: 1, idosoId: 1, mesReferencia: 9, anoReferencia: 2025, valorPago: 2500, status: 'PAGO' },
          { id: 2, idosoId: 1, mesReferencia: 10, anoReferencia: 2025, valorPago: 1500, status: 'PARCIAL' },
        ]
      ]);

      // Gerar CSV
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const nomeArquivo = `backup_lar_idosos_${timestamp}.csv`;
      
      // Simular geração de CSV
      const csvContent = gerarCSVContent(responsaveis, idosos, pagamentos);
      
      // Simular download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = nomeArquivo;
      link.click();
      
      mostrarSnackbar(`Backup gerado: ${nomeArquivo}`, 'success');
    } catch (error) {
      console.error('Erro ao gerar backup:', error);
      mostrarSnackbar('Erro ao gerar backup', 'error');
    } finally {
      setLoading(false);
    }
  };

  const gerarCSVContent = (responsaveis: any[], idosos: any[], pagamentos: any[]) => {
    let csv = 'TIPO,NOME,CPF,TELEFONE,EMAIL,DATA_NASCIMENTO,MENSALIDADE,STATUS_PAGAMENTO,VALOR_PAGO,NFSE,DATA_PAGAMENTO\n';
    
    // Responsáveis
    responsaveis.forEach(r => {
      csv += `RESPONSAVEL,"${r.nome}","${r.cpf}","${r.contatoTelefone || ''}","${r.contatoEmail || ''}",,,,,\n`;
    });
    
    // Idosos
    idosos.forEach(i => {
      csv += `IDOSO,"${i.nome}","${i.cpf || ''}","","","${i.dataNascimento || ''}","${i.valorMensalidadeBase}",,,,\n`;
    });
    
    // Pagamentos
    pagamentos.forEach(p => {
      const idoso = idosos.find(i => i.id === p.idosoId);
      csv += `PAGAMENTO,"${idoso?.nome || ''}","","","","","","${p.status}","${p.valorPago}","${p.nfse || ''}","${p.dataPagamento || ''}"\n`;
    });
    
    return csv;
  };

  const adicionarBackupAgendado = () => {
    const novoBackupAgendado: BackupAgendado = {
      id: Date.now(),
      nome: novoBackup.nome,
      caminho: novoBackup.caminho,
      dataAgendamento: novoBackup.dataAgendamento,
      ativo: true,
    };
    
    setBackupsAgendados([...backupsAgendados, novoBackupAgendado]);
    setDialogBackup(false);
    setNovoBackup({ nome: '', caminho: '', dataAgendamento: new Date() });
    mostrarSnackbar('Backup agendado adicionado!', 'success');
  };

  const removerBackupAgendado = (id: number) => {
    setBackupsAgendados(backupsAgendados.filter(b => b.id !== id));
    mostrarSnackbar('Backup agendado removido!', 'success');
  };

  const toggleBackupAtivo = (id: number) => {
    setBackupsAgendados(backupsAgendados.map(b => 
      b.id === id ? { ...b, ativo: !b.ativo } : b
    ));
  };

  const mostrarSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const fecharSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Configurações do Sistema
        </Typography>

        <Grid container spacing={3}>
          {/* Configurações Gerais */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configurações Gerais
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {configuracoes.map((config) => (
                  <Box key={config.id} sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label={config.descricao}
                      value={config.valor}
                      onChange={(e) => {
                        const novasConfigs = configuracoes.map(c => 
                          c.id === config.id ? { ...c, valor: e.target.value } : c
                        );
                        setConfiguracoes(novasConfigs);
                      }}
                      onBlur={() => salvarConfiguracao(config)}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Backup Manual */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Backup Manual
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Gere um backup completo dos dados em formato CSV
                </Alert>
                
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={gerarBackupCSV}
                  disabled={loading}
                  fullWidth
                >
                  Gerar Backup CSV
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Backups Agendados */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Backups Agendados
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogBackup(true)}
                  >
                    Adicionar Backup
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {backupsAgendados.map((backup) => (
                    <ListItem key={backup.id} divider>
                      <ListItemText
                        primary={backup.nome}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Caminho: {backup.caminho}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Próximo: {new Date(backup.dataAgendamento).toLocaleDateString('pt-BR')}
                            </Typography>
                            {backup.ultimoBackup && (
                              <Typography variant="body2" color="text.secondary">
                                Último: {new Date(backup.ultimoBackup).toLocaleDateString('pt-BR')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={backup.ativo}
                              onChange={() => toggleBackupAtivo(backup.id)}
                            />
                          }
                          label="Ativo"
                        />
                        <IconButton
                          edge="end"
                          onClick={() => removerBackupAgendado(backup.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Dialog para Novo Backup */}
        <Dialog open={dialogBackup} onClose={() => setDialogBackup(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Adicionar Backup Agendado</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nome do Backup"
                value={novoBackup.nome}
                onChange={(e) => setNovoBackup({ ...novoBackup, nome: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Caminho para Salvar"
                value={novoBackup.caminho}
                onChange={(e) => setNovoBackup({ ...novoBackup, caminho: e.target.value })}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <IconButton>
                      <FolderIcon />
                    </IconButton>
                  ),
                }}
              />
              
              <DatePicker
                label="Data do Próximo Backup"
                value={novoBackup.dataAgendamento}
                onChange={(date) => setNovoBackup({ ...novoBackup, dataAgendamento: date || new Date() })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogBackup(false)}>Cancelar</Button>
            <Button onClick={adicionarBackupAgendado} variant="contained">
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={fecharSnackbar}
        >
          <Alert onClose={fecharSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default ConfiguracoesForm;

