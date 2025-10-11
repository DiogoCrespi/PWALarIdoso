import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import SaveIcon from '@mui/icons-material/Save';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDropzone } from 'react-dropzone';
import type { Idoso } from '../../electron.d';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  idoso: Idoso | null;
  mes: number;
  ano: number;
  pagamentoExistente?: {
    id: number;
    valorPago: number;
    dataPagamento?: Date;
    nfse?: string;
    status: string;
    observacoes?: string;
  } | null;
  onSave: (data: any) => Promise<void>;
  onGerarRecibo?: (pagamentoId: number) => Promise<void>;
}

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function PaymentModal({
  open,
  onClose,
  idoso,
  mes,
  ano,
  pagamentoExistente,
  onSave,
  onGerarRecibo,
}: PaymentModalProps) {
  const [formData, setFormData] = useState({
    valorPago: '',
    dataPagamento: new Date(),
    nfse: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Estados para upload de NFSE
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Resetar formulário quando modal abrir
  useEffect(() => {
    console.log('🔄 PaymentModal: useEffect - open:', open, 'idoso:', idoso, 'pagamentoExistente:', pagamentoExistente);
    
    if (open) {
      if (pagamentoExistente) {
        console.log('📝 PaymentModal: Editando pagamento existente');
      } else {
        console.log('➕ PaymentModal: Criando novo pagamento');
      }
      
      setFormData({
        valorPago: pagamentoExistente?.valorPago?.toString() || '',
        dataPagamento: pagamentoExistente?.dataPagamento || new Date(),
        nfse: pagamentoExistente?.nfse || '',
        observacoes: pagamentoExistente?.observacoes || '',
      });
      setError(null);
      setSuccess(false);
    }
  }, [open, pagamentoExistente, idoso]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Funções para upload de NFSE
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
      processFile(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    setError(null);

    try {
      // Simular processamento de arquivo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dados simulados extraídos (em produção, usar biblioteca de OCR/PDF parsing)
      // Simular diferentes cenários baseados no idoso selecionado
      let mockData;
      
      if (idoso?.nome === 'Ana Sangaleti Bonassa') {
        // NFSE correta para Ana Sangaleti Bonassa
        mockData = {
          numeroNFSE: '1497',
          dataPrestacao: '03/10/2025',
          discriminacao: 'Valor referente a participação no custeio da entidade. Referente ao mês de junho de 2025. Conforme PIX Sicredi.',
          valor: 2800.00,
          nomePessoa: 'Ana Sangaleti Bonassa' // Nome correto do idoso
        };
      } else {
        // NFSE de outro idoso (para testar validação)
        mockData = {
          numeroNFSE: '1497',
          dataPrestacao: '03/10/2025',
          discriminacao: 'Valor referente a participação no custeio da entidade. Referente ao mês de junho de 2025. Conforme PIX Sicredi.',
          valor: 2800.00,
          nomePessoa: 'IVONI LUCIA HANAUER' // Nome diferente para testar validação
        };
      }

      // Validar se a NFSE é do idoso correto
      if (idoso && mockData.nomePessoa !== idoso.nome && mockData.nomePessoa !== idoso.responsavel?.nome) {
        setError(`⚠️ ATENÇÃO: Esta NFSE é de "${mockData.nomePessoa}", mas o idoso selecionado é "${idoso.nome}". Verifique se está correto.`);
      } else if (idoso && (mockData.nomePessoa === idoso.nome || mockData.nomePessoa === idoso.responsavel?.nome)) {
        // Limpar erro se a NFSE for do idoso correto
        setError(null);
      }

      setExtractedData(mockData);
      
      // Preencher automaticamente os campos do formulário
      setFormData(prev => ({
        ...prev,
        valorPago: mockData.valor.toString(),
        nfse: mockData.numeroNFSE,
        dataPagamento: new Date(mockData.dataPrestacao.split('/').reverse().join('-')),
        observacoes: mockData.discriminacao
      }));
      
    } catch (err) {
      setError('Erro ao processar arquivo. Tente novamente.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleUseExtractedData = () => {
    if (extractedData && idoso) {
      // Validar se o valor não excede 70% do salário do idoso
      const valorMaximo = idoso.valorMensalidadeBase * 0.7;
      if (extractedData.valor > valorMaximo) {
        setError(`Valor da NFSE (R$ ${extractedData.valor.toFixed(2)}) não pode exceder 70% do salário do idoso (R$ ${valorMaximo.toFixed(2)})`);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        valorPago: extractedData.valor.toString(),
        nfse: extractedData.numeroNFSE,
        dataPagamento: new Date(extractedData.dataPrestacao.split('/').reverse().join('-')),
        observacoes: extractedData.discriminacao
      }));
      
      setExtractedData(null);
      setUploadedFile(null);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validações
      if (!formData.valorPago || parseFloat(formData.valorPago) < 0) {
        throw new Error('Valor deve ser maior ou igual a zero');
      }

      if (!idoso) {
        throw new Error('Idoso não encontrado');
      }

      // Validar se o valor não excede 70% do salário do idoso
      const valorPago = parseFloat(formData.valorPago);
      const valorMaximo = idoso.valorMensalidadeBase * 0.7;
      if (valorPago > valorMaximo) {
        throw new Error(`Valor pago (R$ ${valorPago.toFixed(2)}) não pode exceder 70% do salário do idoso (R$ ${valorMaximo.toFixed(2)})`);
      }

      const dataToSave = {
        idosoId: idoso.id,
        mesReferencia: mes,
        anoReferencia: ano,
        valorPago: parseFloat(formData.valorPago),
        dataPagamento: formData.dataPagamento,
        nfse: formData.nfse || null,
        observacoes: formData.observacoes || null,
      };

      await onSave(dataToSave);
      setSuccess(true);
      
      // Fechar modal após 1 segundo
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Erro ao salvar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarRecibo = async () => {
    if (!pagamentoExistente?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (onGerarRecibo) {
        await onGerarRecibo(pagamentoExistente.id);
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar recibo');
    } finally {
      setLoading(false);
    }
  };

  const valorBase = idoso?.valorMensalidadeBase || 0;
  const valorPago = parseFloat(formData.valorPago) || 0;
  const valorDoacao = Math.max(0, valorPago - valorBase);
  const status = valorPago >= valorBase ? 'PAGO' : valorPago > 0 ? 'PARCIAL' : 'PENDENTE';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGO': return 'success';
      case 'PARCIAL': return 'warning';
      default: return 'error';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAGO': return 'Pago';
      case 'PARCIAL': return 'Parcial';
      default: return 'Pendente';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '500px' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="div">
                {pagamentoExistente ? 'Editar Pagamento' : 'Novo Pagamento'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {idoso?.nome} - {meses[mes - 1]} de {ano}
              </Typography>
            </Box>
            <Button
              onClick={onClose}
              size="small"
              startIcon={<CloseIcon />}
            >
              Fechar
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {pagamentoExistente ? 'Pagamento atualizado com sucesso!' : 'Pagamento salvo com sucesso!'}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Informações do Idoso */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Informações do Idoso
                </Typography>
                <Typography variant="body2">
                  <strong>Nome:</strong> {idoso?.nome}
                </Typography>
                <Typography variant="body2">
                  <strong>Responsável:</strong> {idoso?.responsavel?.nome}
                </Typography>
                <Typography variant="body2">
                  <strong>Mensalidade Base:</strong> R$ {valorBase.toFixed(2)}
                </Typography>
              </Box>
            </Grid>

            {/* Upload de NFSE */}
            {!pagamentoExistente && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, border: '2px dashed', borderColor: 'primary.main' }}>
                  <Typography variant="h6" gutterBottom>
                    Upload de Nota Fiscal (NFSE)
                  </Typography>
                  
                  {!uploadedFile ? (
                    <Box
                      {...getRootProps()}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: isDragActive ? 'primary.main' : 'grey.300',
                        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                        cursor: 'pointer',
                        borderRadius: 1
                      }}
                    >
                      <input {...getInputProps()} />
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo NFSE ou clique para selecionar'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Formatos aceitos: PDF, DOCX
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DescriptionIcon sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="h6">
                          Arquivo Processado
                        </Typography>
                        <CheckCircleIcon sx={{ ml: 1, color: 'success.main' }} />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {uploadedFile.name}
                      </Typography>

                      {isProcessingFile && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Processando arquivo...
                          </Typography>
                          <LinearProgress />
                        </Box>
                      )}

                      {extractedData && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.50', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Dados Extraídos:
                          </Typography>
                          <Typography variant="body2">
                            <strong>NFSE:</strong> {extractedData.numeroNFSE}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Valor:</strong> R$ {extractedData.valor.toFixed(2)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Data:</strong> {extractedData.dataPrestacao}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Pagador:</strong> {extractedData.nomePessoa}
                          </Typography>
                          
                          {/* Indicador de validação do idoso */}
                          {idoso && (
                            <Box sx={{ mt: 1 }}>
                              {extractedData.nomePessoa === idoso.nome || extractedData.nomePessoa === idoso.responsavel?.nome ? (
                                <Chip
                                  label="✅ NFSE do idoso correto"
                                  color="success"
                                  size="small"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip
                                  label="⚠️ NFSE de outro idoso"
                                  color="warning"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          )}
                          
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={handleUseExtractedData}
                            >
                              Usar Dados Extraídos
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setUploadedFile(null);
                                setExtractedData(null);
                              }}
                            >
                              Cancelar
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Status Atual */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2">Status:</Typography>
                <Chip
                  label={getStatusLabel(status)}
                  color={getStatusColor(status) as any}
                  size="small"
                />
                {valorDoacao > 0 && (
                  <Chip
                    label={`Doação: R$ ${valorDoacao.toFixed(2)}`}
                    color="info"
                    size="small"
                    variant="outlined"
                  />
                )}
                <Chip
                  label={`Limite: R$ ${(valorBase * 0.7).toFixed(2)} (70%)`}
                  color="warning"
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Grid>

            <Divider sx={{ width: '100%', my: 1 }} />

            {/* Campos do Formulário */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valor Pago (R$)"
                type="number"
                value={formData.valorPago}
                onChange={(e) => handleInputChange('valorPago', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                helperText={`Mensalidade base: R$ ${valorBase.toFixed(2)}`}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Data do Pagamento"
                value={formData.dataPagamento}
                onChange={(date) => handleInputChange('dataPagamento', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número da NFSE"
                value={formData.nfse}
                onChange={(e) => handleInputChange('nfse', e.target.value)}
                placeholder="Ex: 1491"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações adicionais sobre o pagamento..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          {pagamentoExistente && valorDoacao > 0 && onGerarRecibo && (
            <Button
              variant="outlined"
              startIcon={<ReceiptIcon />}
              onClick={handleGerarRecibo}
              disabled={loading}
              color="secondary"
            >
              Gerar Recibo de Doação
            </Button>
          )}
          
          <Button
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Salvando...' : (pagamentoExistente ? 'Atualizar' : 'Salvar')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}


