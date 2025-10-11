import React, { useState } from 'react';
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
  CardContent
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon
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
  tipoIdoso?: 'REGULAR' | 'SOCIAL';
}

const MensalidadeTemplate: React.FC = () => {
  const [formData, setFormData] = useState<MensalidadeData>({
    nomeIdoso: 'Ana Sangaleti Bonassa',
    dataPagamento: '06/06/2025',
    valorPagamento: 3225.00,
    mesReferencia: '06/2025',
    beneficio: 2100.00,
    percentualBeneficio: 70,
    valorBeneficio: 1470.00,
    doacao: 1755.00,
    cpfIdoso: '559.068.779-91',
    formaPagamento: 'PIX BB',
    numeroNFSE: '1409',
    nomeResponsavel: 'Antônio Marcos Bonassa',
    cpfResponsavel: '726.052.279-87',
    tipoIdoso: 'REGULAR'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleInputChange = (field: keyof MensalidadeData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calcular valor do benefício automaticamente
    if (field === 'beneficio' || field === 'percentualBeneficio') {
      const beneficio = field === 'beneficio' ? value as number : prev.beneficio;
      const percentual = field === 'percentualBeneficio' ? value as number : prev.percentualBeneficio;
      const valorBeneficio = (beneficio * percentual) / 100;
      const doacao = prev.valorPagamento - valorBeneficio;
      
      setFormData(prev => ({
        ...prev,
        valorBeneficio,
        doacao: doacao > 0 ? doacao : 0
      }));
    }
    
    // Calcular doação automaticamente
    if (field === 'valorPagamento') {
      const doacao = (value as number) - prev.valorBeneficio;
      setFormData(prev => ({ ...prev, doacao: doacao > 0 ? doacao : 0 }));
    }
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
