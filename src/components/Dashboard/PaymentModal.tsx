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
  LinearProgress,
  Snackbar,
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
import { extractNFSEWithFallback } from '../../utils/geminiExtractor';
import { isGeminiConfigured, getGeminiApiKey } from '../../config/gemini';
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
    pagador?: string;
    formaPagamento?: string;
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
    pagador: '',
    formaPagamento: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success' | 'warning' | 'info'>('error');
  
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
        pagador: pagamentoExistente?.pagador || '',
        formaPagamento: pagamentoExistente?.formaPagamento || '',
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

  // Função para formatar valor quando o campo perde o foco
  const handleValueBlur = () => {
    if (formData.valorPago) {
      const formattedValue = formatValueOnBlur(formData.valorPago);
      setFormData(prev => ({
        ...prev,
        valorPago: formattedValue,
      }));
    }
  };

  const showSnackbar = (message: string, severity: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Função para normalizar valores (converter vírgula para ponto)
  const normalizeValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    
    let normalized = value.toString()
      .replace(/R\$\s*/g, '') // Remove R$ e espaços
      .replace(/[^\d.,]/g, ''); // Remove caracteres não numéricos exceto ponto e vírgula
    
    // Se tem vírgula, é formato brasileiro (vírgula = decimal)
    if (normalized.includes(',')) {
      // Remove pontos de milhares e converte vírgula para ponto
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    }
    // Se tem ponto, verificar se é decimal ou milhares
    else if (normalized.includes('.')) {
      // Se tem mais de 2 dígitos após o ponto, é milhares
      const parts = normalized.split('.');
      if (parts[1] && parts[1].length > 2) {
        // É formato de milhares, remover pontos
        normalized = normalized.replace(/\./g, '');
      }
      // Senão, é decimal, manter como está
    }
    
    const result = parseFloat(normalized) || 0;
    console.log('🔄 Normalizando valor:', value, '→', result);
    return result;
  };

  // Função para formatar valor com 2 casas decimais (apenas para exibição)
  const formatValue = (value: string | number): string => {
    if (!value) return '';
    
    const normalized = normalizeValue(value);
    return normalized.toFixed(2);
  };

  // Função para formatar valor apenas quando necessário (não em tempo real)
  const formatValueOnBlur = (value: string): string => {
    if (!value) return '';
    
    const normalized = normalizeValue(value);
    return normalized.toFixed(2);
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
      console.log('🔄 Processando arquivo:', file.name);
      
      // Verificar se Gemini está configurado
      const geminiConfigured = isGeminiConfigured();
      console.log('🤖 Gemini configurado:', geminiConfigured);
      
      // Extrair dados usando Gemini ou fallback
      const extractedData = await extractNFSEWithFallback(
        file, 
        geminiConfigured ? getGeminiApiKey() : undefined
      );
      
      console.log('✅ Dados extraídos:', extractedData);

      // Limpar qualquer erro anterior
      setError(null);

      setExtractedData(extractedData);
      
      // Preencher automaticamente os campos do formulário
      setFormData(prev => ({
        ...prev,
        valorPago: extractedData.valor.toString(),
        nfse: extractedData.numeroNFSE,
        dataPagamento: new Date(extractedData.dataPrestacao.split('/').reverse().join('-')),
        observacoes: extractedData.discriminacao
      }));
      
    } catch (err) {
      console.error('❌ Erro detalhado ao processar PDF:', err);
      setError(`Erro ao processar arquivo: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleUseExtractedData = () => {
    if (extractedData && idoso) {
      // Normalizar valor extraído
      const valorNormalizado = normalizeValue(extractedData.valor);
      
      // Validar valor: não pode exceder 70% do salário do idoso (para todos os tipos)
      const valorMaximo = idoso.valorMensalidadeBase * 0.7;
      if (valorNormalizado > valorMaximo) {
        setError(`Valor da NFSE (R$ ${valorNormalizado.toFixed(2)}) não pode exceder 70% do salário do idoso (R$ ${valorMaximo.toFixed(2)})`);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        valorPago: formatValue(valorNormalizado),
        nfse: extractedData.numeroNFSE,
        pagador: extractedData.nomePessoa || '',
        formaPagamento: extractedData.formaPagamento || '',
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
        const errorMsg = 'Valor deve ser maior ou igual a zero';
        showSnackbar(errorMsg, 'error');
        throw new Error(errorMsg);
      }

      if (!idoso) {
        const errorMsg = 'Idoso não encontrado';
        showSnackbar(errorMsg, 'error');
        throw new Error(errorMsg);
      }

      // Validar valor baseado no tipo do idoso
      const valorPago = normalizeValue(formData.valorPago);
      console.log('🔍 Validando pagamento para idoso:', idoso.nome, 'tipo:', idoso.tipo);
      
      // Validar valor: não pode exceder 70% do salário do idoso (para todos os tipos)
      const valorMaximo = idoso.valorMensalidadeBase * 0.7;
      console.log('⚠️ Validação 70% - limite:', valorMaximo, 'valor pago:', valorPago);
      if (valorPago > valorMaximo) {
        const errorMsg = `Valor pago (R$ ${valorPago.toFixed(2)}) não pode exceder 70% do salário do idoso (R$ ${valorMaximo.toFixed(2)})`;
        showSnackbar(errorMsg, 'error');
        throw new Error(errorMsg);
      }

      const dataToSave = {
        idosoId: idoso.id,
        mesReferencia: mes,
        anoReferencia: ano,
        valorPago: valorPago, // Já normalizado
        dataPagamento: formData.dataPagamento,
        nfse: formData.nfse || null,
        pagador: formData.pagador || null,
        formaPagamento: formData.formaPagamento || null,
        observacoes: formData.observacoes || null,
      };

      await onSave(dataToSave);
      setSuccess(true);
      showSnackbar(pagamentoExistente ? 'Pagamento atualizado com sucesso!' : 'Pagamento salvo com sucesso!', 'success');
      
      // Fechar modal após 3 segundos para dar tempo de ver o feedback
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);

    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao salvar pagamento';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
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
        showSnackbar('Recibo gerado com sucesso!', 'success');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao gerar recibo';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
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
                
                {/* Dados Básicos */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Nome do Idoso:</strong> {idoso?.nome} *
                  </Typography>
                  <Typography variant="body2">
                    <strong>CPF:</strong> {idoso?.cpf}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Mensalidade Base:</strong> R$ {valorBase.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Benefício:</strong> {valorBase.toFixed(2)} X 70% = R$ {(valorBase * 0.7).toFixed(2)}
                  </Typography>
                </Box>

                {/* Dados do Responsável */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>RESPONSAVEL:</strong> {idoso?.responsavel?.nome}
                  </Typography>
                  <Typography variant="body2">
                    <strong>CPF Responsável:</strong> {idoso?.responsavel?.cpf}
                  </Typography>
                </Box>

                {/* Dados do Pagamento (se existir) */}
                {pagamentoExistente && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Data Pagamento:</strong> {formData.dataPagamento ? new Date(formData.dataPagamento).toLocaleDateString('pt-BR') : 'Não informada'} R$ {formData.valorPago || '0,00'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Referência:</strong> {mes.toString().padStart(2, '0')}/{ano}
                    </Typography>
                    {formData.nfse && (
                      <Typography variant="body2">
                        <strong>NFS-e:</strong> {formData.nfse}
                      </Typography>
                    )}
                    {formData.pagador && (
                      <Typography variant="body2">
                        <strong>Pagador:</strong> {formData.pagador}
                      </Typography>
                    )}
                    {formData.formaPagamento && (
                      <Typography variant="body2">
                        <strong>Forma pagamento:</strong> {formData.formaPagamento}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Cálculo de Doação */}
                {formData.valorPago && (
                  <Box sx={{ mb: 2 }}>
                    {(() => {
                      const valorPago = normalizeValue(formData.valorPago);
                      const valorDoacao = Math.max(0, valorPago - (valorBase * 0.7));
                      return (
                        <Typography variant="body2">
                          <strong>Doação:</strong> R$ {valorDoacao.toFixed(2)}
                        </Typography>
                      );
                    })()}
                  </Box>
                )}
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
                type="text"
                value={formData.valorPago}
                onChange={(e) => handleInputChange('valorPago', e.target.value)}
                onBlur={handleValueBlur}
                placeholder="Ex: 1062.60 ou 1062,60"
                helperText={`Mensalidade base: R$ ${valorBase.toFixed(2)} - Aceita ponto ou vírgula como centavos`}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pagador"
                value={formData.pagador}
                onChange={(e) => handleInputChange('pagador', e.target.value)}
                placeholder="Nome de quem está pagando"
                helperText="Nome da pessoa/empresa que está efetuando o pagamento"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Forma de Pagamento"
                value={formData.formaPagamento}
                onChange={(e) => handleInputChange('formaPagamento', e.target.value)}
                placeholder="Ex: PIX, DINHEIRO, PIX BB, PIX SICREDI"
                helperText="Forma como o pagamento foi efetuado"
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
      
      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}


