import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
  List,
  ListItemText,
  ListItemButton,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Search as SearchIcon
} from '@mui/icons-material';

interface MensalidadeData {
  nomeIdoso: string;
  dataPagamento: string;
  valorPagamento: number;
  mesReferencia: string;
  beneficio: number;
  percentualBeneficio: number;
  valorBeneficio: number;
  doacao: number;
  cpfIdoso: string;
  formaPagamento: string;
  numeroNFSE: string;
  nomeResponsavel: string;
  cpfResponsavel: string;
  pagador?: string; // Campo opcional adicionado
  tipoIdoso?: 'REGULAR' | 'SOCIAL';
}

interface HistoricoData {
  id: number;
  valorPago: number;
  dataPagamento: string;
  dataPrestacao?: string; // ✅ Adicionado campo dataPrestacao da Nota Fiscal
  nfse?: string;
  pagador?: string;
  formaPagamento?: string;
  mesReferencia: number;
  anoReferencia: number;
  observacoes?: string;
  idoso: {
    id: number;
    nome: string;
    cpf: string;
    valorMensalidadeBase: number;
    responsavel: {
      nome: string;
      cpf: string;
    };
  };
}

const MensalidadeTemplate: React.FC = () => {
  const [formData, setFormData] = useState<MensalidadeData>({
    nomeIdoso: '',
    dataPagamento: '',
    valorPagamento: 0,
    mesReferencia: '',
    beneficio: 0,
    percentualBeneficio: 70,
    valorBeneficio: 0,
    doacao: 0,
    cpfIdoso: '',
    formaPagamento: '',
    numeroNFSE: '',
    nomeResponsavel: '',
    cpfResponsavel: '',
    pagador: '',
    tipoIdoso: 'REGULAR'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Estados para busca inteligente
  const [historicoData, setHistoricoData] = useState<HistoricoData[]>([]);
  const [searchResults, setSearchResults] = useState<HistoricoData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Carregar dados históricos ao inicializar
  useEffect(() => {
    loadHistoricoData();
  }, []);

  const loadHistoricoData = async () => {
    try {
      const pagamentos = await window.electronAPI.pagamentos.getAllWithIdosos();
      setHistoricoData(pagamentos);
    } catch (error) {
      console.error('Erro ao carregar dados históricos:', error);
    }
  };

      const searchHistorico = (term: string) => {
        if (!term || term.length < 2) {
          setSearchResults([]);
          setShowSearchResults(false);
          return;
        }

        setIsSearching(true);
        
        // Normalizar termo de busca (remover acentos e converter para minúscula)
        const normalizeSearchTerm = (text: string) => {
          return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/ç/g, 'c')
            .trim();
        };
        
        const normalizedTerm = normalizeSearchTerm(term);
        
        // Buscar por nome do idoso, responsável, pagador ou NFSE
        const results = historicoData.filter(item => {
          const nomeIdoso = normalizeSearchTerm(item.idoso.nome);
          const nomeResponsavel = normalizeSearchTerm(item.idoso.responsavel.nome);
          const pagador = item.pagador ? normalizeSearchTerm(item.pagador) : '';
          const nfse = item.nfse || '';
          
          return nomeIdoso.includes(normalizedTerm) ||
                 nomeResponsavel.includes(normalizedTerm) ||
                 pagador.includes(normalizedTerm) ||
                 nfse.includes(term); // NFSE mantém busca exata
        });

        setSearchResults(results);
        setShowSearchResults(true);
        setIsSearching(false);
      };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchHistorico(value);
  };

  const selectHistoricoItem = (item: HistoricoData) => {
    console.log('🔍 MensalidadeTemplate: Item selecionado:', item);
    console.log('📅 MensalidadeTemplate: mesReferencia:', item.mesReferencia);
    console.log('📅 MensalidadeTemplate: dataPagamento:', item.dataPagamento);
    
    const valorBeneficio = ((item.idoso as any).beneficioSalario && (item.idoso as any).beneficioSalario > 0 ? (item.idoso as any).beneficioSalario : 0) * 0.7;
    const doacao = Math.max(0, item.valorPago - valorBeneficio);
    
    // CORREÇÃO: Usar dataPrestacao da Nota Fiscal em vez de dataPagamento do Pagamento
    // Se não houver dataPrestacao, usar dataPagamento como fallback
    const dataParaExibir = item.dataPrestacao || item.dataPagamento;
    
    const formDataToSet = {
      nomeIdoso: item.idoso.nome,
      dataPagamento: new Date(dataParaExibir).toLocaleDateString('pt-BR'), // ✅ Usar dataPrestacao
      valorPagamento: item.valorPago,
      mesReferencia: `${item.mesReferencia.toString().padStart(2, '0')}/${item.anoReferencia}`,
      beneficio: item.idoso.valorMensalidadeBase,
      percentualBeneficio: 70,
      valorBeneficio,
      doacao,
      cpfIdoso: item.idoso.cpf,
      formaPagamento: item.formaPagamento || '',
      numeroNFSE: item.nfse || '',
      nomeResponsavel: item.idoso.responsavel.nome,
      cpfResponsavel: item.idoso.responsavel.cpf,
      pagador: item.pagador || '',
      tipoIdoso: 'REGULAR' as const
    };
    
    console.log('📝 MensalidadeTemplate: FormData a ser definido:', formDataToSet);
    console.log('📅 MensalidadeTemplate: Data usada (dataPrestacao ou dataPagamento):', dataParaExibir);
    setFormData(formDataToSet);

    setShowSearchResults(false);
    setSearchTerm('');
  };

  const handleInputChange = (field: keyof MensalidadeData, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Calcular valor do benefício automaticamente
      if (field === 'beneficio' || field === 'percentualBeneficio') {
        const beneficio = field === 'beneficio' ? value as number : newData.beneficio;
        const percentual = field === 'percentualBeneficio' ? value as number : newData.percentualBeneficio;
        const valorBeneficio = (beneficio * percentual) / 100;
        const doacao = newData.valorPagamento - valorBeneficio;
        
        return {
          ...newData,
          valorBeneficio,
          doacao: doacao > 0 ? doacao : 0
        };
      }
      
      // Calcular doação automaticamente
      if (field === 'valorPagamento') {
        const doacao = (value as number) - newData.valorBeneficio;
        return {
          ...newData,
          doacao: doacao > 0 ? doacao : 0
        };
      }
      
      return newData;
    });
  };

  const generateDocument = async () => {
    setIsGenerating(true);
    
    try {
      const result = await window.electronAPI.templates.gerarMensalidade(formData);
      setSnackbarMessage(`Documento gerado: ${result.fileName}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      setSnackbarMessage('Erro ao gerar documento');
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gerar Recibo de Mensalidade
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Preencha os dados para gerar o recibo de mensalidade no formato DOCX.
      </Typography>

      <Grid container spacing={3}>
        {/* Formulário */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dados do Recibo
            </Typography>
            
            {/* Busca Inteligente */}
            <Box sx={{ mb: 3, position: 'relative' }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Busca Inteligente - Digite nome do idoso, responsável, pagador ou NFSE
              </Typography>
              <TextField
                fullWidth
                placeholder="Digite para buscar dados históricos..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: isSearching ? <CircularProgress size={20} /> : <SearchIcon />,
                }}
              />
              
              {/* Lista de resultados */}
              {showSearchResults && searchResults.length > 0 && (
                <Paper 
                  sx={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    zIndex: 1000,
                    maxHeight: 300,
                    overflow: 'auto',
                    mt: 1
                  }}
                >
                  <List dense>
                    {searchResults.map((item, index) => (
                      <ListItemButton
                        key={index}
                        onClick={() => selectHistoricoItem(item)}
                        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                      >
                        <ListItemText
                          primary={
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <Typography variant="body2" fontWeight="bold" component="span">
                                {item.idoso.nome}
                              </Typography>
                              <Chip label={item.nfse || 'Sem NFSE'} size="small" color="primary" />
                              <Chip label={`R$ ${item.valorPago.toFixed(2)}`} size="small" color="success" />
                            </span>
                          }
                          secondary={
                            <span>
                              <Typography variant="caption" display="block">
                                <strong>Responsável:</strong> {item.idoso.responsavel.nome}
                              </Typography>
                              <Typography variant="caption" display="block">
                                <strong>Pagador:</strong> {item.pagador || 'Não informado'}
                              </Typography>
                              <Typography variant="caption" display="block">
                                <strong>Data:</strong> {new Date(item.dataPagamento).toLocaleDateString('pt-BR')} | 
                                <strong> Forma:</strong> {item.formaPagamento}
                              </Typography>
                            </span>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
              
              {showSearchResults && searchResults.length === 0 && searchTerm.length >= 2 && (
                <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, mt: 1, p: 2 }}>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Nenhum resultado encontrado para "{searchTerm}"
                  </Typography>
                </Paper>
              )}
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Idoso"
                  value={formData.nomeIdoso}
                  onChange={(e) => handleInputChange('nomeIdoso', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data do Pagamento"
                  value={formData.dataPagamento}
                  onChange={(e) => handleInputChange('dataPagamento', e.target.value)}
                  placeholder="DD/MM/AAAA"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mês de Referência"
                  value={formData.mesReferencia}
                  onChange={(e) => handleInputChange('mesReferencia', e.target.value)}
                  placeholder="MM/AAAA"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valor do Pagamento"
                  type="number"
                  value={formData.valorPagamento}
                  onChange={(e) => handleInputChange('valorPagamento', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: 'R$ '
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número da NFSE"
                  value={formData.numeroNFSE}
                  onChange={(e) => handleInputChange('numeroNFSE', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valor do Benefício"
                  type="number"
                  value={formData.beneficio}
                  onChange={(e) => handleInputChange('beneficio', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: 'R$ '
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Percentual do Benefício"
                  type="number"
                  value={formData.percentualBeneficio}
                  onChange={(e) => handleInputChange('percentualBeneficio', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: '%'
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF do Idoso"
                  value={formData.cpfIdoso}
                  onChange={(e) => handleInputChange('cpfIdoso', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo do Idoso</InputLabel>
                  <Select
                    value={formData.tipoIdoso || 'REGULAR'}
                    onChange={(e) => handleInputChange('tipoIdoso', e.target.value)}
                    label="Tipo do Idoso"
                  >
                    <MenuItem value="REGULAR">REGULAR</MenuItem>
                    <MenuItem value="SOCIAL">SOCIAL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Forma de Pagamento</InputLabel>
                  <Select
                    value={formData.formaPagamento}
                    onChange={(e) => handleInputChange('formaPagamento', e.target.value)}
                    label="Forma de Pagamento"
                  >
                    <MenuItem value="PIX BB">PIX BB</MenuItem>
                    <MenuItem value="PIX">PIX</MenuItem>
                    <MenuItem value="Transferência">Transferência</MenuItem>
                    <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                    <MenuItem value="Cartão">Cartão</MenuItem>
                    <MenuItem value="Boleto">Boleto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Responsável"
                  value={formData.nomeResponsavel}
                  onChange={(e) => handleInputChange('nomeResponsavel', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF do Responsável"
                  value={formData.cpfResponsavel}
                  onChange={(e) => handleInputChange('cpfResponsavel', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pagador (Opcional)"
                  value={formData.pagador}
                  onChange={(e) => handleInputChange('pagador', e.target.value)}
                  placeholder="Nome da pessoa/empresa que efetuou o pagamento"
                  helperText="Campo opcional - nome de quem efetivamente pagou"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={generateDocument}
                disabled={isGenerating}
                size="large"
              >
                {isGenerating ? 'Gerando...' : 'Gerar Documento DOCX'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Preview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview do Recibo
            </Typography>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" gutterBottom>
                  <strong>Nome do Idoso:</strong> {formData.nomeIdoso}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Data Pagamento:</strong> {formData.dataPagamento} - {formatCurrency(formData.valorPagamento)}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Referência:</strong> {formData.mesReferencia}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                {formData.tipoIdoso === 'SOCIAL' ? (
                  <Typography variant="body2" gutterBottom color="success.main">
                    <strong>SOMENTE NOTA SOCIAL</strong>
                  </Typography>
                ) : (
                  <>
                    <Typography variant="body2" gutterBottom>
                      <strong>Benefício:</strong> {formatCurrency(formData.beneficio)} × {formData.percentualBeneficio}% = {formatCurrency(formData.valorBeneficio)}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom color="success.main">
                      <strong>Doação:</strong> {formatCurrency(formData.doacao)}
                    </Typography>
                  </>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" gutterBottom>
                  <strong>CPF:</strong> {formData.cpfIdoso}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Forma pagamento:</strong> {formData.formaPagamento}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>NFS-e:</strong> {formData.numeroNFSE}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" gutterBottom>
                  <strong>RESPONSÁVEL:</strong> {formData.nomeResponsavel}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>CPF:</strong> {formData.cpfResponsavel}
                </Typography>
                
                {formData.pagador && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      <strong>Pagador:</strong> {formData.pagador}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
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

export default MensalidadeTemplate;
