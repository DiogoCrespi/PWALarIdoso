import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

interface Responsavel {
  id: number;
  nome: string;
  cpf: string;
  contatoTelefone?: string;
  contatoEmail?: string;
}

interface ResponsavelFormProps {
  open: boolean;
  onClose: () => void;
  responsavel?: Responsavel | null;
  onSave: (data: any) => void;
}

const ResponsavelForm: React.FC<ResponsavelFormProps> = ({
  open,
  onClose,
  responsavel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    contatoTelefone: '',
    contatoEmail: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Resetar formulário quando abrir/fechar
  useEffect(() => {
    if (open) {
      if (responsavel) {
        setFormData({
          nome: responsavel.nome,
          cpf: responsavel.cpf,
          contatoTelefone: responsavel.contatoTelefone || '',
          contatoEmail: responsavel.contatoEmail || '',
        });
      } else {
        setFormData({
          nome: '',
          cpf: '',
          contatoTelefone: '',
          contatoEmail: '',
        });
      }
      setErrors({});
    }
  }, [open, responsavel]);

  // Validar CPF
  const validarCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
    
    // Validação do algoritmo do CPF
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(10))) return false;
    
    return true;
  };

  // Formatar CPF
  const formatarCPF = (value: string): string => {
    const cpfLimpo = value.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Validar email
  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar telefone
  const validarTelefone = (telefone: string): boolean => {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
  };

  // Validar formulário
  const validarFormulario = (): boolean => {
    console.log('🔍 Validando formulário com dados:', formData);
    const novosErros: Record<string, string> = {};

    // Nome obrigatório
    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
      console.log('❌ Erro: Nome é obrigatório');
    } else {
      console.log('✅ Nome válido:', formData.nome);
    }

    // CPF obrigatório e válido
    if (!formData.cpf.trim()) {
      novosErros.cpf = 'CPF é obrigatório';
      console.log('❌ Erro: CPF é obrigatório');
    } else if (!validarCPF(formData.cpf)) {
      novosErros.cpf = 'CPF inválido';
      console.log('❌ Erro: CPF inválido:', formData.cpf);
    } else {
      console.log('✅ CPF válido:', formData.cpf);
    }

    // Email opcional, mas se preenchido deve ser válido
    if (formData.contatoEmail && !validarEmail(formData.contatoEmail)) {
      novosErros.contatoEmail = 'Email inválido';
      console.log('❌ Erro: Email inválido:', formData.contatoEmail);
    } else if (formData.contatoEmail) {
      console.log('✅ Email válido:', formData.contatoEmail);
    }

    // Telefone opcional, mas se preenchido deve ser válido
    if (formData.contatoTelefone && !validarTelefone(formData.contatoTelefone)) {
      novosErros.contatoTelefone = 'Telefone inválido';
      console.log('❌ Erro: Telefone inválido:', formData.contatoTelefone);
    } else if (formData.contatoTelefone) {
      console.log('✅ Telefone válido:', formData.contatoTelefone);
    }

    console.log('📊 Erros encontrados:', novosErros);
    setErrors(novosErros);
    const isValid = Object.keys(novosErros).length === 0;
    console.log('🎯 Formulário válido:', isValid);
    return isValid;
  };

  // Lidar com mudanças nos campos
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Lidar com CPF (formatação automática)
  const handleCPFChange = (value: string) => {
    const cpfLimpo = value.replace(/\D/g, '');
    if (cpfLimpo.length <= 11) {
      const cpfFormatado = formatarCPF(cpfLimpo);
      handleChange('cpf', cpfFormatado);
    }
  };

  // Lidar com telefone (formatação automática)
  const handleTelefoneChange = (value: string) => {
    const telefoneLimpo = value.replace(/\D/g, '');
    let telefoneFormatado = telefoneLimpo;
    
    if (telefoneLimpo.length > 0) {
      if (telefoneLimpo.length <= 10) {
        telefoneFormatado = telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        telefoneFormatado = telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    }
    
    handleChange('contatoTelefone', telefoneFormatado);
  };

  // Salvar
  const handleSave = async () => {
    console.log('🚀 handleSave chamado!');
    console.log('🔍 Validando formulário...');
    if (!validarFormulario()) {
      console.log('❌ Formulário inválido');
      return;
    }

    try {
      console.log('💾 Iniciando salvamento...');
      setSaving(true);
      
      // Preparar dados para envio
      const dadosParaEnvio = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''), // Enviar CPF sem formatação
        contatoTelefone: formData.contatoTelefone || null,
        contatoEmail: formData.contatoEmail || null,
      };

      console.log('📤 Dados preparados para envio:', dadosParaEnvio);
      console.log('🔄 Chamando onSave...');
      await onSave(dadosParaEnvio);
      console.log('✅ onSave concluído!');
      setSaving(false);
      console.log('✅ setSaving(false) executado!');
    } catch (error) {
      console.error('❌ Erro ao salvar responsável:', error);
      alert('Erro ao salvar responsável: ' + (error as Error).message);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {responsavel ? 'Editar Responsável' : 'Novo Responsável'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Nome */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                error={!!errors.nome}
                helperText={errors.nome}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>

            {/* CPF */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CPF"
                value={formData.cpf}
                onChange={(e) => handleCPFChange(e.target.value)}
                error={!!errors.cpf}
                helperText={errors.cpf || 'Digite apenas números'}
                placeholder="000.000.000-00"
                required
              />
            </Grid>

            {/* Telefone */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.contatoTelefone}
                onChange={(e) => handleTelefoneChange(e.target.value)}
                error={!!errors.contatoTelefone}
                helperText={errors.contatoTelefone || 'Opcional'}
                placeholder="(00) 00000-0000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.contatoEmail}
                onChange={(e) => handleChange('contatoEmail', e.target.value)}
                error={!!errors.contatoEmail}
                helperText={errors.contatoEmail || 'Opcional'}
                placeholder="email@exemplo.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Informações adicionais */}
          <Box mt={3}>
            <Typography variant="body2" color="text.secondary">
              <strong>Informações:</strong>
              <br />
              • Nome e CPF são obrigatórios
              <br />
              • Telefone e email são opcionais
              <br />
              • O CPF será validado automaticamente
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResponsavelForm;

