import React, { useState, useCallback, useEffect } from 'react';
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
  Divider,
  Autocomplete,
  Switch,
  FormControlLabel
} from '@mui/material';
import { CloudUpload, Description, CheckCircle } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { extractNFSEWithFallback } from '../../utils/geminiExtractor';
import { isGeminiConfigured, getGeminiApiKey } from '../../config/gemini';

interface NFSEUploadProps {
  onNFSEProcessed: (data: NFSEData) => void;
}

interface NFSEData {
  numeroNFSE: string;
  dataPrestacao: string;
  dataEmissao?: string;
  discriminacao: string;
  mesReferencia: string;
  valor: number;
  idosoNome: string; // Nome do idoso (razão social) - OBRIGATÓRIO
  responsavelNome: string; // Nome do responsável - OBRIGATÓRIO
  responsavelCpf: string; // CPF do responsável - OBRIGATÓRIO
  pagadorNome?: string; // Nome do pagador (quem efetua o pagamento) - OPCIONAL
  formaPagamento?: string;
  arquivo: File;
}

const NFSEUpload: React.FC<NFSEUploadProps> = ({ onNFSEProcessed }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>({});
  const [mesReferencia, setMesReferencia] = useState('');
  const [usingGemini, setUsingGemini] = useState<boolean | null>(null);
  
  // Campos obrigatórios
  const [idosoNome, setIdosoNome] = useState('');
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelCpf, setResponsavelCpf] = useState('');
  
  // Campos opcionais
  const [pagadorNome, setPagadorNome] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  
  // Estados para autocomplete
  const [idososList, setIdososList] = useState<any[]>([]);
  const [loadingIdosos, setLoadingIdosos] = useState(false);
  
  // Estado para regra de 70%
  const [aplicarRegra70, setAplicarRegra70] = useState(true);

  // Carregar lista de idosos para autocomplete
  const loadIdosos = async () => {
    try {
      setLoadingIdosos(true);
      const idosos = await window.electronAPI.idosos.list();
      setIdososList(idosos);
    } catch (error) {
      console.error('Erro ao carregar idosos:', error);
    } finally {
      setLoadingIdosos(false);
    }
  };

  // Carregar idosos quando o componente montar
  useEffect(() => {
    loadIdosos();
  }, []);

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
      console.log('🔄 Processando arquivo NFSE:', file.name);
      
      // Verificar se Gemini está configurado
      const geminiConfigured = isGeminiConfigured();
      console.log('🤖 Gemini configurado:', geminiConfigured);
      setUsingGemini(geminiConfigured);
      
      // Extrair dados usando Gemini ou fallback
      const extractedData = await extractNFSEWithFallback(
        file, 
        geminiConfigured ? getGeminiApiKey() : undefined
      );
      
      console.log('✅ Dados extraídos da NFSE:', extractedData);

      setExtractedData(extractedData);
      
      // Preencher automaticamente os campos extraídos pela IA
      if (extractedData.mesReferencia) {
        setMesReferencia(extractedData.mesReferencia);
      }
      if (extractedData.formaPagamento) {
        setFormaPagamento(extractedData.formaPagamento);
      }
      
      // Preencher idoso e responsável se extraídos
      if (extractedData.nomePessoa) {
        setIdosoNome(extractedData.nomePessoa);
      }
      if (extractedData.responsavelNome) {
        setResponsavelNome(extractedData.responsavelNome);
      }
    } catch (err) {
      console.error('❌ Erro ao processar arquivo NFSE:', err);
      setError('Erro ao processar arquivo. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    // Validar campos obrigatórios
    if (!extractedData.numeroNFSE || !idosoNome || !responsavelNome || !responsavelCpf || !mesReferencia) {
      setError('Preencha todos os campos obrigatórios: NFSE, Idoso, Responsável, CPF e Mês/Ano');
      return;
    }

    // Aplicar regra de 70% se ativada
    let valorFinal = extractedData.valor || 0;
    if (aplicarRegra70 && valorFinal > 0) {
      valorFinal = valorFinal * 0.7;
    }

    const nfseData: NFSEData = {
      numeroNFSE: extractedData.numeroNFSE!,
      dataPrestacao: extractedData.dataPrestacao!,
      dataEmissao: extractedData.dataEmissao || undefined,
      discriminacao: extractedData.discriminacao!,
      mesReferencia,
      valor: valorFinal,
      idosoNome: idosoNome.trim(),
      responsavelNome: responsavelNome.trim(),
      responsavelCpf: responsavelCpf.trim(),
      pagadorNome: pagadorNome.trim() || undefined,
      formaPagamento: formaPagamento.trim() || undefined,
      arquivo: uploadedFile!
    };

    console.log('📤 NFSEUpload: Dados enviados para processamento:', nfseData);
    console.log('📅 NFSEUpload: dataPrestacao enviada:', nfseData.dataPrestacao);
    console.log('📅 NFSEUpload: dataEmissao enviada:', nfseData.dataEmissao);
    console.log('📅 NFSEUpload: mesReferencia enviado:', nfseData.mesReferencia);

    onNFSEProcessed(nfseData);
    
    // Reset form
    setUploadedFile(null);
    setExtractedData({});
    setMesReferencia('');
    setIdosoNome('');
    setResponsavelNome('');
    setResponsavelCpf('');
    setPagadorNome('');
    setFormaPagamento('');
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Description sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="h6">
              Arquivo Processado
            </Typography>
            <Chip 
              icon={<CheckCircle />} 
              label="Sucesso" 
              color="success" 
              size="small" 
            />
            {usingGemini !== null && (
              <Chip 
                label={usingGemini ? "🤖 Extraído com Gemini AI" : "⚠️ Dados simulados (fallback)"}
                color={usingGemini ? "primary" : "warning"}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          {/* Switch para regra de 70% */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={aplicarRegra70}
                  onChange={(e) => setAplicarRegra70(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Aplicar Regra de 70%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {aplicarRegra70 
                      ? `Valor será reduzido para 70% (R$ ${((extractedData.valor || 0) * 0.7).toFixed(2)})`
                      : `Valor será mantido integral (R$ ${(extractedData.valor || 0).toFixed(2)})`
                    }
                  </Typography>
                </Box>
              }
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
                onChange={(e) => setExtractedData((prev: any) => ({ ...prev, numeroNFSE: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                fullWidth
                options={idososList}
                getOptionLabel={(option) => option.nome}
                value={idososList.find(idoso => idoso.nome === idosoNome) || null}
                inputValue={idosoNome}
                onChange={(_, newValue) => {
                  if (newValue) {
                    setIdosoNome(newValue.nome);
                    // Preencher responsável se disponível
                    if (newValue.responsavel) {
                      setResponsavelNome(newValue.responsavel.nome);
                      setResponsavelCpf(newValue.responsavel.cpf || '');
                    }
                  } else {
                    setIdosoNome('');
                  }
                }}
                onInputChange={(_, newInputValue) => {
                  setIdosoNome(newInputValue);
                }}
                freeSolo
                loading={loadingIdosos}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Idoso* (Razão Social)"
                    required
                    helperText="Digite para buscar ou selecione da lista"
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {option.nome}
                        </Typography>
                        {option.responsavel && (
                          <Typography variant="caption" color="text.secondary">
                            Responsável: {option.responsavel.nome}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data da Prestação"
                value={extractedData.dataPrestacao || ''}
                onChange={(e) => setExtractedData((prev: any) => ({ ...prev, dataPrestacao: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Emissão"
                value={extractedData.dataEmissao || ''}
                onChange={(e) => setExtractedData((prev: any) => ({ ...prev, dataEmissao: e.target.value }))}
                placeholder="DD/MM/AAAA"
                helperText="Data de emissão da NFSE"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Responsável*"
                value={responsavelNome}
                onChange={(e) => setResponsavelNome(e.target.value)}
                required
                helperText="Nome do responsável pelo idoso"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPF/CNPJ do Responsável*"
                value={responsavelCpf}
                onChange={(e) => setResponsavelCpf(e.target.value)}
                required
                placeholder="000.000.000-00"
                helperText="CPF ou CNPJ do responsável"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Discriminação do Serviço"
                value={extractedData.discriminacao || ''}
                onChange={(e) => setExtractedData((prev: any) => ({ ...prev, discriminacao: e.target.value }))}
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
                onChange={(e) => setExtractedData((prev: any) => ({ ...prev, valor: parseFloat(e.target.value) }))}
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
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pagador (Opcional)"
                value={pagadorNome}
                onChange={(e) => setPagadorNome(e.target.value)}
                placeholder="Digite o nome do pagador"
                helperText="Nome da pessoa ou empresa que está pagando a NFSE"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Forma de Pagamento (Opcional)"
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                placeholder="Ex: PIX, DINHEIRO, PIX BB, PIX SICREDI"
                helperText="Forma como o pagamento foi efetuado"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setUploadedFile(null);
                setExtractedData({});
                setMesReferencia('');
                setIdosoNome('');
                setResponsavelNome('');
                setResponsavelCpf('');
                setPagadorNome('');
                setFormaPagamento('');
                setUsingGemini(null);
                setError(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleConfirm}
              disabled={!extractedData.numeroNFSE || !idosoNome || !responsavelNome || !responsavelCpf || !mesReferencia}
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
