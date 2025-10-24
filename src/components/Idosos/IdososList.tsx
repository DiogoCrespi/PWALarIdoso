import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Idoso } from '../../electron.d';
import IdosoForm from './IdosoForm';

interface IdososListProps {
  onRefresh: () => void;
}

export default function IdososList({ onRefresh }: IdososListProps) {
  const [idosos, setIdosos] = useState<Idoso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchByPagador, setSearchByPagador] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingIdoso, setEditingIdoso] = useState<Idoso | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idosoToDelete, setIdosoToDelete] = useState<Idoso | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIdoso, setSelectedIdoso] = useState<Idoso | null>(null);

  useEffect(() => {
    loadIdosos();
  }, []);

  const loadIdosos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.electronAPI.idosos.list();
      // Ordenar: ativos primeiro, depois inativos
      const sortedData = data.sort((a, b) => {
        if (a.ativo && !b.ativo) return -1;
        if (!a.ativo && b.ativo) return 1;
        return 0;
      });
      setIdosos(sortedData);
    } catch (err: any) {
      console.error('Erro ao carregar idosos:', err);
      setError(err.message || 'Erro ao carregar idosos');
    } finally {
      setLoading(false);
    }
  };

  const searchIdososByPagador = async (pagador: string) => {
    if (!pagador.trim()) {
      loadIdosos();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await window.electronAPI.idosos.getByPagador(pagador);
      setIdosos(data);
    } catch (err: any) {
      console.error('Erro ao buscar idosos por pagador:', err);
      setError(err.message || 'Erro ao buscar idosos por pagador');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchByPagador = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchByPagador(value);
    searchIdososByPagador(value);
  };

  const handleAdd = () => {
    setEditingIdoso(null);
    setFormOpen(true);
  };

  const handleEdit = (idoso: Idoso) => {
    setEditingIdoso(idoso);
    setFormOpen(true);
    setAnchorEl(null);
  };

  const handleDelete = (idoso: Idoso) => {
    setIdosoToDelete(idoso);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleTrashClick = (idoso: Idoso) => {
    if (idoso.ativo) {
      // Primeira vez - desativar
      handleDeactivate(idoso);
    } else {
      // Segunda vez - excluir permanentemente
      setIdosoToDelete(idoso);
      setDeleteDialogOpen(true);
    }
    setAnchorEl(null);
  };

  const handleDeactivate = async (idoso: Idoso) => {
    try {
      await window.electronAPI.idosos.delete(idoso.id);
      await loadIdosos();
      setAnchorEl(null);
    } catch (error) {
      console.error('Erro ao desativar idoso:', error);
      setError('Erro ao desativar idoso');
    }
  };

  const handleActivate = async (idoso: Idoso) => {
    try {
      await window.electronAPI.idosos.activate(idoso.id);
      await loadIdosos();
      setAnchorEl(null);
    } catch (error) {
      console.error('Erro ao ativar idoso:', error);
      setError('Erro ao ativar idoso');
    }
  };

  const confirmDelete = async () => {
    if (!idosoToDelete) return;

    try {
      await window.electronAPI.idosos.delete(idosoToDelete.id);
      await loadIdosos();
      onRefresh();
      setDeleteDialogOpen(false);
      setIdosoToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir idoso');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingIdoso(null);
  };

  const handleFormSave = async () => {
    await loadIdosos();
    onRefresh();
    handleFormClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, idoso: Idoso) => {
    setAnchorEl(event.currentTarget);
    setSelectedIdoso(idoso);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedIdoso(null);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Não informado';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredIdosos = idosos.filter(idoso => {
    // Filtro por busca (nome, CPF, responsável)
    const matchesSearch = !searchTerm || (
      idoso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idoso.responsavel?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idoso.cpf?.includes(searchTerm) ||
      idoso.responsavel?.cpf.includes(searchTerm)
    );
    
    // Filtro por status ativo/inativo
    const matchesStatus = showInactive || idoso.ativo;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header com busca e botão adicionar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Gerenciar Idosos ({filteredIdosos.length})
        </Typography>
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
            onClick={handleAdd}
            sx={{ minWidth: 140 }}
          >
            Novo Idoso
          </Button>
        </Box>
      </Box>

      {/* Campos de busca */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome, CPF ou responsável..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          placeholder="Buscar por pagador..."
          value={searchByPagador}
          onChange={handleSearchByPagador}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          helperText="Digite o nome de quem efetuou pagamentos"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Lista de idosos */}
      {filteredIdosos.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm || searchByPagador ? 'Nenhum idoso encontrado' : 'Nenhum idoso cadastrado'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || searchByPagador ? 'Tente ajustar os termos de busca' : 'Clique em "Novo Idoso" para começar'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredIdosos.map((idoso, index) => {
            // Gerar chave única (fallback para índice se ID não existir)
            const uniqueKey = idoso.id ? `idoso-${idoso.id}` : `idoso-temp-${index}`;
            
            return (
            <Grid item xs={12} sm={6} md={4} key={uniqueKey}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header do card */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="primary" />
                      <Typography variant="h6" component="div" noWrap>
                        {idoso.nome}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, idoso)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Informações do idoso */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>CPF:</strong> {idoso.cpf || 'Não informado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Nascimento:</strong> {formatDate(idoso.dataNascimento)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Mensalidade:</strong> {formatCurrency(idoso.valorMensalidadeBase)}
                    </Typography>
                  </Box>

                  {/* Responsável */}
                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Responsável
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {idoso.responsavel?.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      CPF: {idoso.responsavel?.cpf}
                    </Typography>
                    {idoso.responsavel?.contatoTelefone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {idoso.responsavel.contatoTelefone}
                        </Typography>
                      </Box>
                    )}
                    {idoso.responsavel?.contatoEmail && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {idoso.responsavel.contatoEmail}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Informações do último pagamento (quando busca por pagador) */}
                  {searchByPagador && (idoso as any).ultimoPagamento && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Último Pagamento
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Pagador:</strong> {(idoso as any).ultimoPagamento.pagador}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Valor:</strong> {formatCurrency((idoso as any).ultimoPagamento.valorPago)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Forma:</strong> {(idoso as any).ultimoPagamento.formaPagamento || 'Não informado'}
                      </Typography>
                      {(idoso as any).ultimoPagamento.dataPagamento && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Data:</strong> {format(new Date((idoso as any).ultimoPagamento.dataPagamento), 'dd/MM/yyyy', { locale: ptBR })}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={idoso.ativo ? 'Ativo' : 'Inativo'}
                        color={idoso.ativo ? 'success' : 'error'}
                        size="small"
                      />
                      {idoso.tipo === 'SOCIAL' && (
                        <Chip
                          label="SOCIAL"
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      ID: {idoso.id}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      )}

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedIdoso!)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        {selectedIdoso?.ativo ? (
          <MenuItem onClick={() => handleDeactivate(selectedIdoso!)} sx={{ color: 'warning.main' }}>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Desativar</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleActivate(selectedIdoso!)} sx={{ color: 'success.main' }}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Ativar</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleTrashClick(selectedIdoso!)} sx={{ color: 'warning.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>{selectedIdoso?.ativo ? 'Desativar' : 'Excluir Permanentemente'}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o idoso <strong>{idosoToDelete?.nome}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita. O idoso será marcado como inativo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulário de idoso */}
      <IdosoForm
        open={formOpen}
        onClose={handleFormClose}
        idoso={editingIdoso}
        onSave={handleFormSave}
      />
    </Box>
  );
}


