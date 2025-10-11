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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import type { Idoso, Responsavel } from '../../electron.d';
import { identifyDocument, formatDocument } from '../../utils/documentValidation';

// Função para formatação de moeda brasileira
const formatCurrency = (value: string): string => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  // Converte para número e divide por 100 para centavos
  const number = parseFloat(numericValue) / 100;
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

// Função para converter valor formatado para número
const parseCurrency = (formattedValue: string): number => {
  // Remove R$, espaços e pontos (separadores de milhares)
  const cleanValue = formattedValue.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

interface IdosoFormProps {
  open: boolean;
  onClose: () => void;
  idoso: Idoso | null;
  onSave: () => void;
}

export default function IdosoForm({ open, onClose, idoso, onSave }: IdosoFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: null as Date | null,
    responsavelId: '',
    valorMensalidadeBase: '',
    tipo: 'REGULAR' as 'REGULAR' | 'SOCIAL',
    observacoes: '',
  });
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ' | null>(null);

  // Resetar formulário quando modal abrir
  useEffect(() => {
    if (open) {
      loadResponsaveis();
      if (idoso) {
        setFormData({
          nome: idoso.nome,
          cpf: idoso.cpf || '',
          dataNascimento: idoso.dataNascimento ? new Date(idoso.dataNascimento) : null,
          responsavelId: idoso.responsavelId.toString(),
          valorMensalidadeBase: formatCurrency(idoso.valorMensalidadeBase.toString()),
          tipo: idoso.tipo || 'REGULAR',
          observacoes: idoso.observacoes || '',
        });
      } else {
        setFormData({
          nome: '',
          cpf: '',
          dataNascimento: null,
          responsavelId: '',
          valorMensalidadeBase: '',
          tipo: 'REGULAR',
          observacoes: '',
        });
      }
      setError(null);
      setDocumentError(null);
      setDocumentType(null);
    }
  }, [open, idoso]);

  const loadResponsaveis = async () => {
    try {
      const data = await window.electronAPI.responsaveis.list();
      setResponsaveis(data);
    } catch (err: any) {
      console.error('Erro ao carregar responsáveis:', err);
    }
  };


  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Validação automática de documento (CPF/CNPJ) em tempo real
    if (field === 'cpf' && value) {
      const docInfo = identifyDocument(value);
      
      if (docInfo.type === 'INVALID') {
        setDocumentError('Documento inválido');
        setDocumentType(null);
      } else {
        setDocumentType(docInfo.type);
        
        if (docInfo.isValid) {
          setDocumentError(null);
          // Atualizar o valor formatado automaticamente
          setFormData(prev => ({
            ...prev,
            cpf: docInfo.formatted,
          }));
        } else {
          setDocumentError(`${docInfo.type} inválido`);
        }
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validações
      if (!formData.nome.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (formData.cpf && documentError) {
        throw new Error(documentError);
      }

      if (!formData.responsavelId) {
        throw new Error('Responsável é obrigatório');
      }

      if (!formData.valorMensalidadeBase || parseCurrency(formData.valorMensalidadeBase) <= 0) {
        throw new Error('Valor da mensalidade deve ser maior que zero');
      }

      const dataToSave = {
        nome: formData.nome.trim(),
        cpf: formData.cpf || null,
        dataNascimento: formData.dataNascimento,
        responsavelId: parseInt(formData.responsavelId),
        valorMensalidadeBase: parseCurrency(formData.valorMensalidadeBase),
        tipo: formData.tipo,
        observacoes: formData.observacoes.trim() || null,
      };

      if (idoso) {
        await window.electronAPI.idosos.update(idoso.id, dataToSave);
      } else {
        await window.electronAPI.idosos.create(dataToSave);
      }

      onSave();
      onClose();

    } catch (err: any) {
      setError(err.message || 'Erro ao salvar idoso');
    } finally {
      setLoading(false);
    }
  };

  const selectedResponsavel = responsaveis.find(r => r.id.toString() === formData.responsavelId);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '600px' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {idoso ? 'Editar Idoso' : 'Novo Idoso'}
            </Typography>
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

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Informações básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome Completo *"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                error={!formData.nome.trim() && formData.nome !== ''}
                helperText={!formData.nome.trim() && formData.nome !== '' ? 'Nome é obrigatório' : ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={documentType ? `${documentType} do Idoso` : 'CPF/CNPJ do Idoso'}
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                error={!!documentError}
                helperText={documentError || (documentType ? `Formato: ${documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}` : 'Digite CPF (11 dígitos) ou CNPJ (14 dígitos)')}
                placeholder={documentType ? (documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00') : '000.000.000-00 ou 00.000.000/0000-00'}
                InputProps={{
                  endAdornment: documentType && (
                    <Chip 
                      label={documentType} 
                      size="small" 
                      color={documentError ? 'error' : 'success'}
                      variant="outlined"
                    />
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Data de Nascimento"
                value={formData.dataNascimento}
                onChange={(date) => handleInputChange('dataNascimento', date)}
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
                label="Valor da Mensalidade *"
                value={formData.valorMensalidadeBase}
                onChange={(e) => {
                  const formatted = formatCurrency(e.target.value);
                  handleInputChange('valorMensalidadeBase', formatted);
                }}
                placeholder="R$ 0,00"
                error={!formData.valorMensalidadeBase || parseCurrency(formData.valorMensalidadeBase) <= 0}
                helperText="Digite o valor (ex: R$ 1.062,60)"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo do Idoso *</InputLabel>
                <Select
                  value={formData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                  label="Tipo do Idoso *"
                >
                  <MenuItem value="REGULAR">
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>REGULAR</span>
                      <Chip 
                        label="70% + Doação" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                  </MenuItem>
                  <MenuItem value="SOCIAL">
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>SOCIAL</span>
                      <Chip 
                        label="Valor Fixo" 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* Responsável */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Responsável
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Responsável *</InputLabel>
                <Select
                  value={formData.responsavelId}
                  label="Responsável *"
                  onChange={(e) => handleInputChange('responsavelId', e.target.value)}
                  error={!formData.responsavelId}
                >
                  {responsaveis.map((responsavel) => (
                    <MenuItem key={responsavel.id} value={responsavel.id.toString()}>
                      {responsavel.nome} - CPF: {responsavel.cpf}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedResponsavel && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Dados do Responsável Selecionado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Nome:</strong> {selectedResponsavel.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>CPF:</strong> {selectedResponsavel.cpf}
                  </Typography>
                  {selectedResponsavel.contatoTelefone && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Telefone:</strong> {selectedResponsavel.contatoTelefone}
                    </Typography>
                  )}
                  {selectedResponsavel.contatoEmail && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Email:</strong> {selectedResponsavel.contatoEmail}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* Observações */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Observações
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={4}
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre o idoso..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
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
            {loading ? 'Salvando...' : (idoso ? 'Atualizar' : 'Salvar')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}


