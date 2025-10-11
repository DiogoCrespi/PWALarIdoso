import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { CloudUpload, Description, CheckCircle, Error } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface NFSEUploadProps {
  onNFSEProcessed: (data: NFSEData) => void;
}

interface NFSEData {
  numeroNFSE: string;
  dataPrestacao: string;
  discriminacao: string;
  mesReferencia: string;
  valor: number;
  nomePessoa: string;
  arquivo: File;
}

const NFSEUpload: React.FC<NFSEUploadProps> = ({ onNFSEProcessed }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<NFSEData>>({});
  const [mesReferencia, setMesReferencia] = useState('');

  // Gerar lista de meses para seleção
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simular processamento de arquivo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dados simulados extraídos (em produção, usar biblioteca de OCR/PDF parsing)
      const mockData = {
        numeroNFSE: '1497',
        dataPrestacao: '03/10/2025',
        discriminacao: 'Valor referente a participação no custeio da entidade. Referente ao mês de junho de 2025. Conforme PIX Sicredi.',
        valor: 2800.00,
        nomePessoa: 'IVONI LUCIA HANAUER'
      };

      setExtractedData(mockData);
    } catch (err) {
      setError('Erro ao processar arquivo. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!extractedData.numeroNFSE || !extractedData.nomePessoa || !mesReferencia) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    const nfseData: NFSEData = {
      numeroNFSE: extractedData.numeroNFSE!,
      dataPrestacao: extractedData.dataPrestacao!,
      discriminacao: extractedData.discriminacao!,
      mesReferencia,
      valor: extractedData.valor || 0,
      nomePessoa: extractedData.nomePessoa!,
      arquivo: uploadedFile!
    };

    onNFSEProcessed(nfseData);
    
    // Reset form
    setUploadedFile(null);
    setExtractedData({});
    setMesReferencia('');
    setError(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Upload de Nota Fiscal de Serviço Eletrônica (NFSE)
      </Typography>
      
      <Paper 
        {...getRootProps()} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          mb: 3
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo NFSE ou clique para selecionar'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Formatos aceitos: PDF, DOCX
        </Typography>
      </Paper>

      {isProcessing && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Processando arquivo...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {uploadedFile && !isProcessing && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Description sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="h6">
              Arquivo Processado
            </Typography>
            <Chip 
              icon={<CheckCircle />} 
              label="Sucesso" 
              color="success" 
              size="small" 
              sx={{ ml: 2 }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {uploadedFile.name}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número da NFSE"
                value={extractedData.numeroNFSE || ''}
                onChange={(e) => setExtractedData(prev => ({ ...prev, numeroNFSE: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome/Razão Social"
                value={extractedData.nomePessoa || ''}
                onChange={(e) => setExtractedData(prev => ({ ...prev, nomePessoa: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data da Prestação"
                value={extractedData.dataPrestacao || ''}
                onChange={(e) => setExtractedData(prev => ({ ...prev, dataPrestacao: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Discriminação do Serviço"
                value={extractedData.discriminacao || ''}
                onChange={(e) => setExtractedData(prev => ({ ...prev, discriminacao: e.target.value }))}
                multiline
                rows={2}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor"
                type="number"
                value={extractedData.valor || ''}
                onChange={(e) => setExtractedData(prev => ({ ...prev, valor: parseFloat(e.target.value) }))}
                InputProps={{
                  startAdornment: 'R$ '
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Mês de Referência</InputLabel>
                <Select
                  value={mesReferencia}
                  onChange={(e) => setMesReferencia(e.target.value)}
                  label="Mês de Referência"
                >
                  {generateMonths().map((month) => (
                    <MenuItem key={month.key} value={month.key}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setUploadedFile(null);
                setExtractedData({});
                setMesReferencia('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleConfirm}
              disabled={!extractedData.numeroNFSE || !extractedData.nomePessoa || !mesReferencia}
            >
              Confirmar e Processar
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default NFSEUpload;
