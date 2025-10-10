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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import SaveIcon from '@mui/icons-material/Save';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CloseIcon from '@mui/icons-material/Close';
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

  // Resetar formulário quando modal abrir
  useEffect(() => {
    if (open) {
      setFormData({
        valorPago: pagamentoExistente?.valorPago?.toString() || '',
        dataPagamento: pagamentoExistente?.dataPagamento || new Date(),
        nfse: pagamentoExistente?.nfse || '',
        observacoes: pagamentoExistente?.observacoes || '',
      });
      setError(null);
      setSuccess(false);
    }
  }, [open, pagamentoExistente]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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

            {/* Status Atual */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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


