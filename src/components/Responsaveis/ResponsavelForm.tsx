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
  CircularProgress,
  Grid,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { identifyDocument, validateCPF } from '../../utils/documentValidation';
import { useDuplicateCheck } from '../../hooks/useDuplicateCheck';
import { DuplicateCheckDialog } from '../Common/DuplicateCheckDialog';

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
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ' | null>(null);
  
  // Estados para verificação de duplicatas
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateData, setDuplicateData] = useState<{
    newItem: any;
    existingItems: any[];
  } | null>(null);
  
  const { checkResponsavelDuplicates } = useDuplicateCheck();

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
      setDocumentType(null);
    }
  }, [open, responsavel]);


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
    } else if (!validateCPF(formData.cpf)) {
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

  // Lidar com CPF/CNPJ (detecção automática e formatação)
  const handleCPFChange = (value: string) => {
    // Primeiro, atualizar o valor no estado para permitir digitação livre
    handleChange('cpf', value);
    
    // Limpar erros anteriores quando usuário está digitando
    if (errors.cpf) {
      setErrors(prev => ({ ...prev, cpf: '' }));
    }
    
    // Só validar se o campo não estiver vazio
    if (value.trim()) {
      const docInfo = identifyDocument(value);
      
      if (docInfo.type === 'INVALID') {
        setDocumentType(null);
        // Só mostrar erro se o usuário parou de digitar (mais de 3 caracteres)
        if (value.length > 3) {
          setErrors(prev => ({ ...prev, cpf: 'Documento inválido' }));
        }
      } else {
        setDocumentType(docInfo.type);
        
        if (docInfo.isValid) {
          setErrors(prev => ({ ...prev, cpf: '' }));
          // Aplicar formatação apenas se o documento for válido
          handleChange('cpf', docInfo.formatted);
        } else {
          // Só mostrar erro se o usuário parou de digitar (documento completo)
          if (value.length >= (docInfo.type === 'CPF' ? 11 : 14)) {
            setErrors(prev => ({ ...prev, cpf: `${docInfo.type} inválido` }));
          }
        }
      }
    } else {
      setDocumentType(null);
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

    // Se estiver editando um responsável existente, não verificar duplicatas
    if (responsavel) {
      await saveResponsavel();
      return;
    }

    // Verificar duplicatas antes de salvar
    try {
      console.log('🔍 Verificando duplicatas...');
      const duplicateResult = await checkResponsavelDuplicates(
        formData.nome, 
        formData.cpf.replace(/\D/g, '')
      );

      if (duplicateResult.hasDuplicates && duplicateResult.duplicatas.length > 0) {
        console.log('⚠️ Duplicatas encontradas:', duplicateResult.duplicatas);
        setDuplicateData({
          newItem: formData,
          existingItems: duplicateResult.duplicatas
        });
        setDuplicateDialogOpen(true);
        return;
      }

      // Se não há duplicatas, salvar normalmente
      await saveResponsavel();
    } catch (error) {
      console.error('❌ Erro ao verificar duplicatas:', error);
      // Em caso de erro na verificação, salvar normalmente
      await saveResponsavel();
    }
  };

  // Função para salvar o responsável
  const saveResponsavel = async () => {
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

  // Função para usar responsável existente
  const handleUseExisting = (existingResponsavel: any) => {
    console.log('✅ Usando responsável existente:', existingResponsavel);
    setDuplicateDialogOpen(false);
    setDuplicateData(null);
    onSave(existingResponsavel);
  };

  // Função para criar novo responsável mesmo com duplicatas
  const handleCreateNew = async () => {
    console.log('➕ Criando novo responsável mesmo com duplicatas');
    setDuplicateDialogOpen(false);
    setDuplicateData(null);
    await saveResponsavel();
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
                label={documentType ? `${documentType} do Responsável` : 'CPF/CNPJ do Responsável'}
                value={formData.cpf}
                onChange={(e) => handleCPFChange(e.target.value)}
                error={!!errors.cpf}
                helperText={errors.cpf || (documentType ? `Formato: ${documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}` : 'Digite CPF (11 dígitos) ou CNPJ (14 dígitos)')}
                placeholder={documentType ? (documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00') : '000.000.000-00 ou 00.000.000/0000-00'}
                InputProps={{
                  endAdornment: documentType && (
                    <Chip 
                      label={documentType} 
                      size="small" 
                      color={errors.cpf ? 'error' : 'success'}
                      variant="outlined"
                    />
                  )
                }}
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
      
      {/* Diálogo de Verificação de Duplicatas */}
      {duplicateData && (
        <DuplicateCheckDialog
          open={duplicateDialogOpen}
          onClose={() => {
            setDuplicateDialogOpen(false);
            setDuplicateData(null);
          }}
          onUseExisting={handleUseExisting}
          onCreateNew={handleCreateNew}
          title="Responsável Similar Encontrado"
          newItem={duplicateData.newItem}
          existingItems={duplicateData.existingItems}
          type="responsavel"
        />
      )}
    </Dialog>
  );
};

export default ResponsavelForm;

