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
    observacoes: '',
  });
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpfError, setCpfError] = useState<string | null>(null);

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
          valorMensalidadeBase: idoso.valorMensalidadeBase.toString(),
          observacoes: idoso.observacoes || '',
        });
      } else {
        setFormData({
          nome: '',
          cpf: '',
          dataNascimento: null,
          responsavelId: '',
          valorMensalidadeBase: '',
          observacoes: '',
        });
      }
      setError(null);
      setCpfError(null);
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

  const validateCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    // Algoritmo de validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
    
    return true;
  };

  const formatCPF = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Validação de CPF em tempo real
    if (field === 'cpf' && value) {
      const cleanCpf = value.replace(/\D/g, '');
      if (cleanCpf.length === 11) {
        const isValid = validateCPF(value);
        setCpfError(isValid ? null : 'CPF inválido');
      } else {
        setCpfError(null);
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

      if (formData.cpf && !validateCPF(formData.cpf)) {
        throw new Error('CPF inválido');
      }

      if (!formData.responsavelId) {
        throw new Error('Responsável é obrigatório');
      }

      if (!formData.valorMensalidadeBase || parseFloat(formData.valorMensalidadeBase) <= 0) {
        throw new Error('Valor da mensalidade deve ser maior que zero');
      }

      const dataToSave = {
        nome: formData.nome.trim(),
        cpf: formData.cpf || null,
        dataNascimento: formData.dataNascimento,
        responsavelId: parseInt(formData.responsavelId),
        valorMensalidadeBase: parseFloat(formData.valorMensalidadeBase),
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
                label="CPF"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                error={!!cpfError}
                helperText={cpfError || 'Formato: 000.000.000-00'}
                placeholder="000.000.000-00"
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
                label="Valor da Mensalidade (R$) *"
                type="number"
                value={formData.valorMensalidadeBase}
                onChange={(e) => handleInputChange('valorMensalidadeBase', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                error={!formData.valorMensalidadeBase || parseFloat(formData.valorMensalidadeBase) <= 0}
                helperText="Valor base da mensalidade"
              />
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


