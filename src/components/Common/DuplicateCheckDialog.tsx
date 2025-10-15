import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface DuplicateItem {
  id: number;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  [key: string]: any;
}

interface DuplicateCheckDialogProps {
  open: boolean;
  onClose: () => void;
  onUseExisting: (item: DuplicateItem) => void;
  onCreateNew: () => void;
  title: string;
  newItem: Partial<DuplicateItem>;
  existingItems: DuplicateItem[];
  type: 'responsavel' | 'idoso';
}

export const DuplicateCheckDialog: React.FC<DuplicateCheckDialogProps> = ({
  open,
  onClose,
  onUseExisting,
  onCreateNew,
  title,
  newItem,
  existingItems,
  type
}) => {
  const getTypeLabel = () => {
    return type === 'responsavel' ? 'Responsável' : 'Idoso';
  };

  const getTypeIcon = () => {
    return <PersonIcon />;
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'Não informado';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Encontramos {existingItems.length} {getTypeLabel().toLowerCase()}(s) com nome similar ao que você está tentando cadastrar.
            Deseja usar um dos existentes ou criar um novo?
          </Typography>
        </Alert>

        {/* Novo Item */}
        <Card sx={{ mb: 2, border: '2px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AddIcon color="primary" />
              <Typography variant="h6" color="primary">
                Novo {getTypeLabel()}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Nome:</strong> {newItem.nome}
                </Typography>
              </Grid>
              {newItem.cpf && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>CPF:</strong> {formatCPF(newItem.cpf)}
                  </Typography>
                </Grid>
              )}
              {newItem.telefone && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Telefone:</strong> {formatPhone(newItem.telefone)}
                  </Typography>
                </Grid>
              )}
              {newItem.email && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {newItem.email}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {getTypeLabel()}s Existentes
          </Typography>
        </Divider>

        {/* Itens Existentes */}
        {existingItems.map((item, index) => (
          <Card key={item.id} sx={{ mb: 2, border: '1px solid', borderColor: 'grey.300' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CheckCircleIcon color="success" />
                <Typography variant="h6">
                  {item.nome}
                </Typography>
                <Chip 
                  label={`ID: ${item.id}`} 
                  size="small" 
                  color="default" 
                  variant="outlined"
                />
              </Box>
              
              <Grid container spacing={2}>
                {item.cpf && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>CPF:</strong> {formatCPF(item.cpf)}
                    </Typography>
                  </Grid>
                )}
                {item.telefone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Telefone:</strong> {formatPhone(item.telefone)}
                    </Typography>
                  </Grid>
                )}
                {item.email && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Email:</strong> {item.email}
                    </Typography>
                  </Grid>
                )}
                {type === 'idoso' && item.dataNascimento && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Data Nascimento:</strong> {new Date(item.dataNascimento).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Grid>
                )}
                {type === 'idoso' && item.valorMensalidadeBase && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Mensalidade Base:</strong> R$ {item.valorMensalidadeBase.toFixed(2)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button 
          onClick={onCreateNew} 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
        >
          Criar Novo
        </Button>
        {existingItems.map((item, index) => (
          <Button
            key={item.id}
            onClick={() => onUseExisting(item)}
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Usar {item.nome}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};
