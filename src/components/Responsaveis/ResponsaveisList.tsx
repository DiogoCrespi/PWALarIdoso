import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import ResponsavelForm from './ResponsavelForm';

interface Responsavel {
  id: number;
  nome: string;
  cpf: string;
  contatoTelefone?: string;
  contatoEmail?: string;
  idosos?: Array<{
    id: number;
    nome: string;
    ativo: boolean;
  }>;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ResponsaveisListProps {
  onRefresh?: () => void;
}

const ResponsaveisList: React.FC<ResponsaveisListProps> = ({ onRefresh }) => {
  console.log('🎯 ResponsaveisList montado!');
  
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResponsavel, setSelectedResponsavel] = useState<Responsavel | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responsavelToDelete, setResponsavelToDelete] = useState<Responsavel | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Carregar responsáveis
  const loadResponsaveis = async () => {
    try {
      console.log('🔄 Carregando responsáveis...');
      setLoading(true);
      const data = await window.electronAPI.responsaveis.list();
      // Ordenar: ativos primeiro, depois inativos
      const sortedData = data.sort((a, b) => {
        // Primeiro critério: responsável ativo vs inativo
        if (a.ativo && !b.ativo) return -1;
        if (!a.ativo && b.ativo) return 1;
        
        // Segundo critério: se ambos ativos, ordenar por idosos ativos
        if (a.ativo && b.ativo) {
          const aAtivo = countIdososAtivos(a.idosos) > 0;
          const bAtivo = countIdososAtivos(b.idosos) > 0;
          if (aAtivo && !bAtivo) return -1;
          if (!aAtivo && bAtivo) return 1;
        }
        
        return 0;
      });
      console.log('✅ Responsáveis carregados:', sortedData);
      setResponsaveis(sortedData);
    } catch (error) {
      console.error('❌ Erro ao carregar responsáveis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponsaveis();
  }, []);

  // Filtrar responsáveis
  const filteredResponsaveis = responsaveis.filter(responsavel => {
    // Filtro por busca
    const matchesSearch = responsavel.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      responsavel.cpf.includes(searchTerm) ||
      responsavel.contatoTelefone?.includes(searchTerm) ||
      responsavel.contatoEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por status ativo/inativo
    const matchesStatus = showInactive || responsavel.ativo;
    
    return matchesSearch && matchesStatus;
  });

  // Abrir menu de ações
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, responsavel: Responsavel) => {
    setAnchorEl(event.currentTarget);
    setSelectedResponsavel(responsavel);
  };

  // Fechar menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedResponsavel(null);
  };

  // Abrir formulário para edição
  const handleEdit = () => {
    setFormOpen(true);
    handleMenuClose();
  };

  // Abrir formulário para novo
  const handleNew = () => {
    console.log('➕ Abrindo formulário para novo responsável');
    setSelectedResponsavel(null);
    setFormOpen(true);
  };

  // Fechar formulário
  const handleFormClose = () => {
    console.log('🚪 Fechando formulário...');
    console.log('🔍 Estado atual formOpen:', formOpen);
    setFormOpen(false);
    setSelectedResponsavel(null);
    console.log('✅ Formulário fechado!');
    console.log('🔍 Novo estado formOpen:', false);
  };

  // Salvar responsável
  const handleSave = async (data: any) => {
    try {
      console.log('💾 Salvando responsável:', data);
      
      if (selectedResponsavel) {
        console.log('📝 Atualizando responsável ID:', selectedResponsavel.id);
        const result = await window.electronAPI.responsaveis.update(selectedResponsavel.id, data);
        console.log('✅ Responsável atualizado:', result);
      } else {
        console.log('➕ Criando novo responsável');
        const result = await window.electronAPI.responsaveis.create(data);
        console.log('✅ Responsável criado:', result);
      }
      
      console.log('🔄 Recarregando lista...');
      await loadResponsaveis();
      console.log('🚪 Fechando formulário...');
      handleFormClose();
      onRefresh?.();
      console.log('✅ Operação concluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar responsável:', error);
      alert('Erro ao salvar responsável: ' + (error as Error).message);
    }
  };

  // Abrir dialog de exclusão
  const handleDeleteClick = () => {
    setResponsavelToDelete(selectedResponsavel);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Lixeira - primeira vez desativa, segunda vez exclui
  const handleTrashClick = () => {
    if (selectedResponsavel) {
      if (selectedResponsavel.ativo) {
        // Primeira vez - desativar
        handleDeactivate();
      } else {
        // Segunda vez - excluir permanentemente
        setResponsavelToDelete(selectedResponsavel);
        setDeleteDialogOpen(true);
      }
    }
    handleMenuClose();
  };

  // Desativar responsável
  const handleDeactivate = async () => {
    if (!selectedResponsavel) return;
    
    try {
      await window.electronAPI.responsaveis.deactivate(selectedResponsavel.id);
      await loadResponsaveis();
      handleMenuClose();
    } catch (error) {
      console.error('Erro ao desativar responsável:', error);
      alert('Erro ao desativar responsável: ' + (error as Error).message);
    }
  };

  // Ativar responsável
  const handleActivate = async () => {
    if (!selectedResponsavel) return;
    
    try {
      await window.electronAPI.responsaveis.activate(selectedResponsavel.id);
      await loadResponsaveis();
      handleMenuClose();
    } catch (error) {
      console.error('Erro ao ativar responsável:', error);
      alert('Erro ao ativar responsável: ' + (error as Error).message);
    }
  };

  // Confirmar exclusão
  const handleDeleteConfirm = async () => {
    if (!responsavelToDelete) return;

    try {
      setDeleting(true);
      await window.electronAPI.responsaveis.delete(responsavelToDelete.id);
      await loadResponsaveis();
      setDeleteDialogOpen(false);
      setResponsavelToDelete(null);
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao excluir responsável:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Cancelar exclusão
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setResponsavelToDelete(null);
  };

  // Formatar CPF
  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Contar idosos ativos
  const countIdososAtivos = (idosos?: Array<{ ativo: boolean }>) => {
    return idosos?.filter(idoso => idoso.ativo).length || 0;
  };

  // Determinar cor do status baseado no responsável e idosos
  const getStatusColor = (responsavel: Responsavel) => {
    if (!responsavel.ativo) {
      return 'error'; // Vermelho: responsável inativo
    }
    
    const idososAtivos = countIdososAtivos(responsavel.idosos);
    if (idososAtivos > 0) {
      return 'success'; // Verde: responsável ativo com idosos ativos
    } else {
      return 'warning'; // Amarelo: responsável ativo mas sem idosos ativos
    }
  };

  // Determinar label do status
  const getStatusLabel = (responsavel: Responsavel) => {
    if (!responsavel.ativo) {
      return 'Inativo';
    }
    
    const idososAtivos = countIdososAtivos(responsavel.idosos);
    if (idososAtivos > 0) {
      return 'Ativo';
    } else {
      return 'Sem Idosos Ativos';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header com busca e botão novo */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          placeholder="Buscar responsáveis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton
            onClick={() => setShowInactive(!showInactive)}
            color={showInactive ? 'primary' : 'default'}
            title={showInactive ? 'Ocultar inativos' : 'Mostrar inativos'}
            sx={{ 
              border: '1px solid', 
              borderColor: showInactive ? 'primary.main' : 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50'
              }
            }}
          >
            {showInactive ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNew}
            sx={{ ml: 2 }}
          >
            Novo Responsável
          </Button>
        </Box>
      </Box>

      {/* Lista de responsáveis */}
      {filteredResponsaveis.length === 0 ? (
        <Alert severity="info">
          {searchTerm ? 'Nenhum responsável encontrado com os critérios de busca.' : 'Nenhum responsável cadastrado.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredResponsaveis.map((responsavel) => (
            <Grid item xs={12} sm={6} md={4} key={responsavel.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header do card */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, flexShrink: 0 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="h6" component="h3" noWrap mb={0.5}>
                          {responsavel.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          CPF: {formatCPF(responsavel.cpf)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, responsavel)}
                      size="small"
                      sx={{ flexShrink: 0, ml: 1 }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Status do responsável */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip
                      label={getStatusLabel(responsavel)}
                      color={getStatusColor(responsavel) as any}
                      size="small"
                    />
                    <Box />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Informações de contato */}
                  <Box mb={2}>
                    {responsavel.contatoTelefone && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {responsavel.contatoTelefone}
                        </Typography>
                      </Box>
                    )}
                    
                    {responsavel.contatoEmail && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {responsavel.contatoEmail}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Status e idosos */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={`${countIdososAtivos(responsavel.idosos)} idoso(s) ativo(s)`}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                      setSelectedResponsavel(responsavel);
                      handleEdit();
                    }}
                  >
                    Editar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        {selectedResponsavel?.ativo ? (
          <MenuItem onClick={handleDeactivate} sx={{ color: 'warning.main' }}>
            <BlockIcon sx={{ mr: 1 }} />
            Desativar
          </MenuItem>
        ) : (
          <MenuItem onClick={handleActivate} sx={{ color: 'success.main' }}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Ativar
          </MenuItem>
        )}
        <MenuItem onClick={handleTrashClick} sx={{ color: 'warning.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          {selectedResponsavel?.ativo ? 'Desativar' : 'Excluir Permanentemente'}
        </MenuItem>
      </Menu>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o responsável{' '}
            <strong>{responsavelToDelete?.nome}</strong>?
          </Typography>
          {responsavelToDelete && countIdososAtivos(responsavelToDelete.idosos) > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Este responsável possui {countIdososAtivos(responsavelToDelete.idosos)} idoso(s) ativo(s) vinculado(s).
              A exclusão não será permitida.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting || (responsavelToDelete && countIdososAtivos(responsavelToDelete.idosos) > 0)}
          >
            {deleting ? <CircularProgress size={20} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulário */}
      <ResponsavelForm
        open={formOpen}
        onClose={handleFormClose}
        responsavel={selectedResponsavel}
        onSave={handleSave}
      />
    </Box>
  );
};

export default ResponsaveisList;

