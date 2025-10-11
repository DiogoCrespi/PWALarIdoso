import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import NFSEUpload from '../components/NFSE/NFSEUpload';

interface NotaFiscal {
  id: string;
  numeroNFSE: string;
  dataPrestacao: string;
  discriminacao: string;
  mesReferencia: string;
  valor: number;
  nomePessoa?: string;
  idosoId?: string;
  idosoNome?: string;
  responsavelNome?: string;
  arquivo?: File;
  dataUpload: Date;
}

const NotasFiscaisPage: React.FC = () => {
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
  const [formData, setFormData] = useState<Partial<NotaFiscal>>({});

  // Mock de idosos para seleção
  const [idosos] = useState([
    { id: '1', nome: 'Ana Sangaleti Bonassa', responsavel: 'Antônio Marcos Bonassa' },
    { id: '2', nome: 'João Silva', responsavel: 'Maria Silva Santos' },
    { id: '3', nome: 'Pedro Santos', responsavel: 'Ana Santos' }
  ]);

  useEffect(() => {
    loadNotasFiscais();
  }, []);

  const loadNotasFiscais = async () => {
    setLoading(true);
    try {
      const notas = await window.electronAPI.notasFiscais.list();
      setNotasFiscais(notas);
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNFSEProcessed = async (data: any) => {
    try {
      const novaNota = await window.electronAPI.notasFiscais.create({
        numeroNFSE: data.numeroNFSE,
        dataPrestacao: data.dataPrestacao,
        discriminacao: data.discriminacao,
        mesReferencia: data.mesReferencia,
        valor: data.valor,
        nomePessoa: data.nomePessoa,
        arquivo: data.arquivo
      });

      setNotasFiscais(prev => [novaNota, ...prev]);
      setSnackbarMessage('Nota fiscal processada com sucesso!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao processar nota fiscal:', error);
      setSnackbarMessage('Erro ao processar nota fiscal');
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (nota: NotaFiscal) => {
    setSelectedNota(nota);
    setFormData(nota);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await window.electronAPI.notasFiscais.delete(id);
      setNotasFiscais(prev => prev.filter(nota => nota.id !== id));
      setSnackbarMessage('Nota fiscal excluída com sucesso!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao excluir nota fiscal:', error);
      setSnackbarMessage('Erro ao excluir nota fiscal');
      setSnackbarOpen(true);
    }
  };

  const handleSave = async () => {
    if (selectedNota) {
      try {
        const notaAtualizada = await window.electronAPI.notasFiscais.update(selectedNota.id, formData);
        setNotasFiscais(prev => 
          prev.map(nota => 
            nota.id === selectedNota.id 
              ? notaAtualizada
              : nota
          )
        );
        setSnackbarMessage('Nota fiscal atualizada com sucesso!');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Erro ao atualizar nota fiscal:', error);
        setSnackbarMessage('Erro ao atualizar nota fiscal');
        setSnackbarOpen(true);
      }
    }
    setDialogOpen(false);
    setSelectedNota(null);
    setFormData({});
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciar Notas Fiscais
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Faça upload de notas fiscais de serviço eletrônicas (NFSE) e gerencie os dados extraídos.
      </Typography>

      {/* Upload de NFSE */}
      <Paper sx={{ mb: 4 }}>
        <NFSEUpload onNFSEProcessed={handleNFSEProcessed} />
      </Paper>

      {/* Lista de Notas Fiscais */}
      <Typography variant="h5" gutterBottom>
        Notas Fiscais Processadas
      </Typography>

      <Grid container spacing={3}>
        {notasFiscais.map((nota) => (
          <Grid item xs={12} md={6} lg={4} key={nota.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      NFSE {nota.numeroNFSE}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(nota)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(nota.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Data da Prestação: {formatDate(nota.dataPrestacao)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mês de Referência: {nota.mesReferencia}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(nota.valor)}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {nota.discriminacao}
                </Typography>

                {nota.nomePessoa && (
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={`Pagador: ${nota.nomePessoa}`} 
                      size="small" 
                      color="info" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                )}

                {nota.idosoNome && (
                  <Box>
                    <Chip 
                      label={`Idoso: ${nota.idosoNome}`} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {nota.responsavelNome && (
                      <Chip 
                        label={`Responsável: ${nota.responsavelNome}`} 
                        size="small" 
                        color="secondary"
                      />
                    )}
                  </Box>
                )}

                <Typography variant="caption" color="text.secondary">
                  Upload: {new Date(nota.dataUpload).toLocaleDateString('pt-BR')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {notasFiscais.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhuma nota fiscal processada ainda
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Faça upload de uma NFSE para começar
          </Typography>
        </Paper>
      )}

      {/* Dialog de Edição */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Editar Nota Fiscal NFSE {selectedNota?.numeroNFSE}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número da NFSE"
                value={formData.numeroNFSE || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroNFSE: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data da Prestação"
                value={formData.dataPrestacao || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dataPrestacao: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor"
                type="number"
                value={formData.valor || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) }))}
                InputProps={{
                  startAdornment: 'R$ '
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mês de Referência"
                value={formData.mesReferencia || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mesReferencia: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Vincular ao Idoso</InputLabel>
                <Select
                  value={formData.idosoId || ''}
                  onChange={(e) => {
                    const idoso = idosos.find(i => i.id === e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      idosoId: e.target.value,
                      idosoNome: idoso?.nome,
                      responsavelNome: idoso?.responsavel
                    }));
                  }}
                  label="Vincular ao Idoso"
                >
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>
                  {idosos.map((idoso) => (
                    <MenuItem key={idoso.id} value={idoso.id}>
                      {idoso.nome} - {idoso.responsavel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Discriminação do Serviço"
                value={formData.discriminacao || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, discriminacao: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotasFiscaisPage;
