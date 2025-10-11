import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Download as DownloadIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

interface Idoso {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  valorMensalidade: number;
  responsavel: {
    nome: string;
    cpf: string;
    telefone?: string;
    email?: string;
  };
  ativo: boolean;
}

interface ListaIdososData {
  mesReferencia: string;
  incluirInativos: boolean;
  incluirValores: boolean;
  incluirContatos: boolean;
  formato: 'resumido' | 'completo';
}

const ListaIdososTemplate: React.FC = () => {
  const [idosos, setIdosos] = useState<Idoso[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [formData, setFormData] = useState<ListaIdososData>({
    mesReferencia: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }).replace('/', '/'),
    incluirInativos: false,
    incluirValores: true,
    incluirContatos: true,
    formato: 'completo'
  });

  useEffect(() => {
    loadIdosos();
  }, []);

  const loadIdosos = async () => {
    setLoading(true);
    try {
      const idososData = await window.electronAPI.idosos.list();
      // Transformar dados da API para o formato esperado
      const idososTransformados = idososData.map(idoso => ({
        id: idoso.id.toString(),
        nome: idoso.nome,
        cpf: idoso.cpf || '',
        dataNascimento: idoso.dataNascimento ? new Date(idoso.dataNascimento).toLocaleDateString('pt-BR') : '',
        valorMensalidade: idoso.valorMensalidadeBase,
        responsavel: {
          nome: idoso.responsavel?.nome || '',
          cpf: idoso.responsavel?.cpf || '',
          telefone: idoso.responsavel?.contatoTelefone || '',
          email: idoso.responsavel?.contatoEmail || ''
        },
        ativo: idoso.ativo
      }));
      setIdosos(idososTransformados);
    } catch (error) {
      console.error('Erro ao carregar idosos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = -12; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      });
      months.push({ key: monthKey, label: monthLabel });
    }
    
    return months;
  };

  const generateDocument = async () => {
    setIsGenerating(true);
    
    try {
      const idososFiltrados = idosos.filter(idoso => 
        formData.incluirInativos || idoso.ativo
      );
      
      const result = await window.electronAPI.templates.gerarListaIdosos({
        ...formData,
        idosos: idososFiltrados
      });
      
      setSnackbarMessage(`Lista gerada: ${result.fileName} (${idososFiltrados.length} idosos)`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao gerar lista:', error);
      setSnackbarMessage('Erro ao gerar lista');
      setSnackbarOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const idososFiltrados = idosos.filter(idoso => 
    formData.incluirInativos || idoso.ativo
  );

  const totalMensalidade = idososFiltrados.reduce((sum, idoso) => sum + idoso.valorMensalidade, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gerar Lista de Idosos
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Gere uma lista completa de todos os idosos em formato DOCX.
      </Typography>

      <Grid container spacing={3}>
        {/* Configurações */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configurações
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Mês de Referência</InputLabel>
              <Select
                value={formData.mesReferencia}
                onChange={(e) => setFormData(prev => ({ ...prev, mesReferencia: e.target.value }))}
                label="Mês de Referência"
              >
                {generateMonths().map((month) => (
                  <MenuItem key={month.key} value={month.key}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Formato</InputLabel>
              <Select
                value={formData.formato}
                onChange={(e) => setFormData(prev => ({ ...prev, formato: e.target.value as 'resumido' | 'completo' }))}
                label="Formato"
              >
                <MenuItem value="resumido">Resumido</MenuItem>
                <MenuItem value="completo">Completo</MenuItem>
              </Select>
            </FormControl>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.incluirInativos}
                    onChange={(e) => setFormData(prev => ({ ...prev, incluirInativos: e.target.checked }))}
                  />
                }
                label="Incluir idosos inativos"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.incluirValores}
                    onChange={(e) => setFormData(prev => ({ ...prev, incluirValores: e.target.checked }))}
                  />
                }
                label="Incluir valores de mensalidade"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.incluirContatos}
                    onChange={(e) => setFormData(prev => ({ ...prev, incluirContatos: e.target.checked }))}
                  />
                }
                label="Incluir contatos dos responsáveis"
              />
            </FormGroup>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={generateDocument}
              disabled={isGenerating}
              fullWidth
              sx={{ mt: 2 }}
            >
              {isGenerating ? 'Gerando...' : 'Gerar Lista DOCX'}
            </Button>
          </Paper>
        </Grid>

        {/* Preview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Preview da Lista
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  icon={<PeopleIcon />} 
                  label={`${idososFiltrados.length} idosos`} 
                  color="primary" 
                />
                <Chip 
                  icon={<MoneyIcon />} 
                  label={formatCurrency(totalMensalidade)} 
                  color="success" 
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {idososFiltrados.map((idoso) => (
                <Grid item xs={12} key={idoso.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {idoso.nome}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            CPF: {idoso.cpf} | Nascimento: {idoso.dataNascimento}
                          </Typography>
                          
                          <Typography variant="body2" gutterBottom>
                            <strong>Responsável:</strong> {idoso.responsavel.nome} (CPF: {idoso.responsavel.cpf})
                          </Typography>
                          
                          {formData.incluirContatos && (idoso.responsavel.telefone || idoso.responsavel.email) && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {idoso.responsavel.telefone && `Tel: ${idoso.responsavel.telefone}`}
                              {idoso.responsavel.telefone && idoso.responsavel.email && ' | '}
                              {idoso.responsavel.email && `Email: ${idoso.responsavel.email}`}
                            </Typography>
                          )}
                          
                          {formData.incluirValores && (
                            <Typography variant="body2" color="success.main">
                              <strong>Mensalidade:</strong> {formatCurrency(idoso.valorMensalidade)}
                            </Typography>
                          )}
                        </Box>
                        
                        <Box>
                          <Chip 
                            label={idoso.ativo ? 'Ativo' : 'Inativo'} 
                            color={idoso.ativo ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {idososFiltrados.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Nenhum idoso encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ajuste os filtros para incluir mais idosos
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

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

export default ListaIdososTemplate;
