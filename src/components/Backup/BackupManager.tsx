import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  CloudDownload as CloudDownloadIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

interface BackupInfo {
  fileName: string;
  content: string;
  stats: {
    responsaveis: number;
    idosos: number;
    pagamentos: number;
    configuracoes: number;
    notasFiscais: number;
  };
  timestamp: string;
  size: number;
}

interface BackupManagerProps {
  onClose?: () => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ onClose }) => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [restoreDialog, setRestoreDialog] = useState<{
    open: boolean;
    backup: BackupInfo | null;
  }>({
    open: false,
    backup: null
  });
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Carregar backups salvos no localStorage
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    try {
      console.log('📂 Carregando backups do localStorage...');
      const savedBackups = localStorage.getItem('lar_idosos_backups');
      
      if (savedBackups) {
        console.log('📦 Backups encontrados no localStorage:', {
          tamanho: savedBackups.length,
          tamanhoKB: (savedBackups.length / 1024).toFixed(2) + ' KB'
        });
        
        const parsedBackups = JSON.parse(savedBackups);
        console.log('✅ Backups parseados:', {
          quantidade: parsedBackups.length,
          backups: parsedBackups.map((b: BackupInfo) => ({
            fileName: b.fileName,
            timestamp: b.timestamp,
            hasContent: !!b.content,
            contentLength: b.content?.length || 0
          }))
        });
        
        setBackups(parsedBackups);
      } else {
        console.log('ℹ️ Nenhum backup encontrado no localStorage');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar backups:', error);
      showSnackbar('Erro ao carregar backups salvos', 'error');
    }
  };

  const saveBackups = (backupsList: BackupInfo[]) => {
    try {
      const backupsJSON = JSON.stringify(backupsList);
      console.log('💾 Tentando salvar backups no localStorage:', {
        quantidade: backupsList.length,
        tamanhoTotal: backupsJSON.length,
        tamanhoMB: (backupsJSON.length / 1024 / 1024).toFixed(2) + ' MB'
      });
      
      localStorage.setItem('lar_idosos_backups', backupsJSON);
      setBackups(backupsList);
      console.log('✅ Backups salvos com sucesso no localStorage');
    } catch (error: any) {
      console.error('❌ Erro ao salvar backups no localStorage:', error);
      
      // Verificar se é erro de quota
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.warn('⚠️ LocalStorage cheio! Tentando manter apenas os 5 backups mais recentes...');
        
        try {
          // Manter apenas os 5 backups mais recentes
          const recentBackups = backupsList.slice(0, 5);
          localStorage.setItem('lar_idosos_backups', JSON.stringify(recentBackups));
          setBackups(recentBackups);
          showSnackbar('Espaço limitado: mantidos apenas os 5 backups mais recentes', 'warning');
        } catch (retryError) {
          console.error('❌ Ainda assim falhou:', retryError);
          showSnackbar('Erro: LocalStorage cheio. Remova alguns backups antigos.', 'error');
        }
      } else {
        showSnackbar('Erro ao salvar lista de backups', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      console.log('🔄 Iniciando criação de backup...');
      
      // Usar a API mock para gerar backup
      const backupData = await window.electronAPI.backup.gerarCSV();
      console.log('📦 Backup recebido:', {
        fileName: backupData.fileName,
        contentLength: backupData.content?.length || 0,
        stats: backupData.stats
      });
      
      // Validar conteúdo
      if (!backupData.content || backupData.content.length === 0) {
        throw new Error('Backup gerado está vazio');
      }
      
      const backupInfo: BackupInfo = {
        fileName: backupData.fileName,
        content: backupData.content,
        stats: backupData.stats,
        timestamp: new Date().toISOString(),
        size: new Blob([backupData.content]).size
      };

      console.log('💾 Salvando backup:', {
        fileName: backupInfo.fileName,
        size: backupInfo.size,
        contentPreview: backupInfo.content.substring(0, 100)
      });

      // Adicionar à lista de backups
      const updatedBackups = [backupInfo, ...backups];
      saveBackups(updatedBackups);

      console.log('📥 Iniciando download automático...');
      // Fazer download automático
      downloadBackup(backupInfo);

      showSnackbar(
        `Backup criado com sucesso! ${backupData.stats.idosos} idosos, ${backupData.stats.pagamentos} pagamentos`,
        'success'
      );

      console.log('✅ Backup criado com sucesso:', backupData.stats);
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      showSnackbar('Erro ao criar backup. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportarDadosExistentes = async () => {
    setLoading(true);
    try {
      console.log('🔄 Importando dados do CSV existente...');
      
      // Ler o arquivo CSV existente
      const response = await fetch('/backup_lar_idosos_2025-10-13.csv');
      const csvContent = await response.text();
      
      // Importar dados do CSV
      const resultado = await window.electronAPI.backup.importarDadosDoCSV(csvContent);
      
      if (resultado.success) {
        showSnackbar(
          `Dados importados com sucesso! Responsáveis: ${resultado.responsaveisImportados}, Idosos: ${resultado.idososImportados}, Pagamentos: ${resultado.pagamentosImportados}, Notas Fiscais: ${resultado.notasFiscaisImportadas}`,
          'success'
        );
        
        // Recarregar a página para aplicar as mudanças
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showSnackbar(`Erro ao importar dados: ${resultado.message}`, 'error');
      }
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error);
      showSnackbar('Erro ao importar dados do CSV', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInicializarSistema = async () => {
    setLoading(true);
    try {
      console.log('🔄 Inicializando sistema...');
      
      // Inicializar sistema
      const resultado = await window.electronAPI.backup.inicializarSistema();
      
      if (resultado.success) {
        showSnackbar('Sistema inicializado com sucesso!', 'success');
        
        // Recarregar a página para aplicar as mudanças
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showSnackbar(`Erro ao inicializar sistema: ${resultado.message}`, 'error');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema:', error);
      showSnackbar('Erro ao inicializar sistema', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLimparEImportar = async () => {
    setLoading(true);
    try {
      console.log('🗑️ Limpando todos os dados...');
      
      // Primeiro, limpar todos os dados
      const resultadoLimpeza = await window.electronAPI.backup.limparTodosOsDados();
      
      if (!resultadoLimpeza.success) {
        showSnackbar(`Erro ao limpar dados: ${resultadoLimpeza.message}`, 'error');
        return;
      }
      
      console.log('✅ Dados limpos, importando do CSV...');
      
      // Depois, importar dados do CSV
      const response = await fetch('/backup_lar_idosos_2025-10-13.csv');
      const csvContent = await response.text();
      
      const resultadoImportacao = await window.electronAPI.backup.importarDadosDoCSV(csvContent);
      
      if (resultadoImportacao.success) {
        showSnackbar(
          `Sistema reinicializado! Responsáveis: ${resultadoImportacao.responsaveisImportados}, Idosos: ${resultadoImportacao.idososImportados}, Pagamentos: ${resultadoImportacao.pagamentosImportados}, Notas Fiscais: ${resultadoImportacao.notasFiscaisImportadas}`,
          'success'
        );
        
        // Recarregar a página para aplicar as mudanças
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showSnackbar(`Erro ao importar dados: ${resultadoImportacao.message}`, 'error');
      }
    } catch (error) {
      console.error('❌ Erro ao limpar e importar:', error);
      showSnackbar('Erro ao limpar e importar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = (backup: BackupInfo) => {
    try {
      console.log('📥 Iniciando download do backup:', backup.fileName);
      console.log('📊 Tamanho do conteúdo:', backup.content.length, 'caracteres');
      
      // Verificar se há conteúdo
      if (!backup.content || backup.content.length === 0) {
        console.error('❌ Backup vazio ou inválido');
        showSnackbar('Erro: Backup vazio ou inválido', 'error');
        return;
      }
      
      // Criar o blob com o conteúdo do backup
      const blob = new Blob([backup.content], { type: 'text/csv;charset=utf-8;' });
      console.log('✅ Blob criado com tamanho:', blob.size, 'bytes');
      
      // Método 1: Usar createObjectURL (preferido)
      try {
        const url = URL.createObjectURL(blob);
        console.log('✅ URL criada:', url);
        
        // Criar link temporário
        const link = document.createElement('a');
        link.href = url;
        link.download = backup.fileName;
        link.style.display = 'none';
        
        // Adicionar ao DOM, clicar e remover
        document.body.appendChild(link);
        console.log('✅ Link adicionado ao DOM');
        
        link.click();
        console.log('✅ Click executado');
        
        // Limpar
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(url);
          console.log('✅ Download concluído e recursos liberados');
        }, 100);
        
        showSnackbar('Download iniciado com sucesso!', 'success');
      } catch (urlError) {
        console.warn('⚠️ Método 1 falhou, tentando método alternativo...', urlError);
        
        // Método 2: Usar data URI (fallback)
        const reader = new FileReader();
        reader.onload = function() {
          const link = document.createElement('a');
          link.href = reader.result as string;
          link.download = backup.fileName;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
          }, 100);
          
          showSnackbar('Download iniciado com sucesso!', 'success');
        };
        reader.onerror = function(error) {
          console.error('❌ Erro ao ler blob:', error);
          showSnackbar('Erro ao processar arquivo para download', 'error');
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('❌ Erro ao fazer download do backup:', error);
      showSnackbar('Erro ao fazer download do backup. Verifique o console.', 'error');
    }
  };

  const handleRestoreBackup = async (backup: BackupInfo) => {
    console.log('🔄 handleRestoreBackup chamado');
    console.log('📦 Backup:', {
      fileName: backup.fileName,
      hasContent: !!backup.content,
      contentLength: backup.content?.length || 0,
      stats: backup.stats
    });
    
    setLoading(true);
    try {
      console.log('🔄 Iniciando restauração do backup:', backup.fileName);
      
      // Validar se há conteúdo
      if (!backup.content || backup.content.length === 0) {
        console.error('❌ Backup sem conteúdo!');
        showSnackbar('Erro: Backup vazio. Não é possível restaurar.', 'error');
        return;
      }
      
      console.log('📤 Enviando para API importarDadosDoCSV...');
      // Importar dados do CSV usando a API
      const resultado = await window.electronAPI.backup.importarDadosDoCSV(backup.content);
      console.log('📥 Resultado da importação:', resultado);
      
      if (resultado.success) {
        console.log('✅ Importação bem-sucedida!');
        showSnackbar(
          `Backup restaurado com sucesso! Responsáveis: ${resultado.responsaveisImportados}, Idosos: ${resultado.idososImportados}, Pagamentos: ${resultado.pagamentosImportados}, Notas Fiscais: ${resultado.notasFiscaisImportadas}`,
          'success'
        );
        setRestoreDialog({ open: false, backup: null });
        
        // Recarregar a página para aplicar as mudanças
        console.log('🔄 Recarregando página em 2 segundos...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('❌ Importação falhou:', resultado.message);
        showSnackbar(`Erro ao restaurar backup: ${resultado.message}`, 'error');
      }
      
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      showSnackbar('Erro ao restaurar backup. Verifique o arquivo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = (index: number) => {
    const updatedBackups = backups.filter((_, i) => i !== index);
    saveBackups(updatedBackups);
    showSnackbar('Backup removido da lista', 'info');
  };

  const handleCopyToClipboard = async (backup: BackupInfo) => {
    try {
      await navigator.clipboard.writeText(backup.content);
      showSnackbar('Conteúdo do backup copiado para a área de transferência!', 'success');
      console.log('✅ Backup copiado para clipboard');
    } catch (error) {
      console.error('❌ Erro ao copiar para clipboard:', error);
      showSnackbar('Erro ao copiar conteúdo. Tente fazer download.', 'error');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadBackup = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const content = await selectedFile.text();
      
      // Validar se é um CSV válido
      const lines = content.split('\n');
      if (lines.length < 2) {
        throw new Error('Arquivo CSV inválido');
      }
      
      const backupInfo: BackupInfo = {
        fileName: selectedFile.name,
        content,
        stats: {
          responsaveis: 0,
          idosos: 0,
          pagamentos: 0,
          configuracoes: 0,
          notasFiscais: 0
        },
        timestamp: new Date().toISOString(),
        size: selectedFile.size
      };
      
      // Contar registros por tipo
      lines.forEach(line => {
        const tipo = line.split(',')[0];
        switch (tipo) {
          case 'RESPONSAVEL':
            backupInfo.stats.responsaveis++;
            break;
          case 'IDOSO':
            backupInfo.stats.idosos++;
            break;
          case 'PAGAMENTO':
            backupInfo.stats.pagamentos++;
            break;
          case 'NOTA_FISCAL':
            backupInfo.stats.notasFiscais++;
            break;
          case 'CONFIGURACAO':
            backupInfo.stats.configuracoes++;
            break;
        }
      });
      
      const updatedBackups = [backupInfo, ...backups];
      saveBackups(updatedBackups);
      
      showSnackbar('Backup importado com sucesso!', 'success');
      setUploadDialog(false);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      showSnackbar('Erro ao importar backup. Verifique o arquivo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <StorageIcon color="primary" />
        <Typography variant="h4">
          Gerenciamento de Backups
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Ações Principais */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ações de Backup
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<BackupIcon />}
                  onClick={handleCreateBackup}
                  disabled={loading}
                  color="primary"
                >
                  Criar Backup
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadDialog(true)}
                  disabled={loading}
                >
                  Importar Backup
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloudDownloadIcon />}
                  onClick={handleImportarDadosExistentes}
                  disabled={loading}
                  color="secondary"
                >
                  Importar Dados Existentes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<StorageIcon />}
                  onClick={handleInicializarSistema}
                  disabled={loading}
                  color="info"
                >
                  Inicializar Sistema
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleLimparEImportar}
                  disabled={loading}
                  color="warning"
                >
                  Limpar e Importar
                </Button>
                {onClose && (
                  <Button
                    variant="text"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Fechar
                  </Button>
                )}
              </Box>
              {loading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Processando...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Informações do Sistema */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoIcon color="info" />
                <Typography variant="h6">
                  Informações do Sistema
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total de Backups:</Typography>
                  <Chip label={backups.length} color="primary" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Último Backup:</Typography>
                  <Typography variant="body2">
                    {backups.length > 0 ? formatDate(backups[0].timestamp) : 'Nenhum'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Espaço Total:</Typography>
                  <Typography variant="body2">
                    {formatFileSize(backups.reduce((total, backup) => total + backup.size, 0))}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Estatísticas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="h6">
                  Estatísticas do Último Backup
                </Typography>
              </Box>
              {backups.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Responsáveis:</Typography>
                    <Chip label={backups[0].stats.responsaveis} color="info" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Idosos:</Typography>
                    <Chip label={backups[0].stats.idosos} color="primary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Pagamentos:</Typography>
                    <Chip label={backups[0].stats.pagamentos} color="success" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Notas Fiscais:</Typography>
                    <Chip label={backups[0].stats.notasFiscais} color="warning" size="small" />
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum backup disponível
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Backups */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ScheduleIcon color="action" />
                <Typography variant="h6">
                  Histórico de Backups
                </Typography>
              </Box>
              {backups.length > 0 ? (
                <List>
                  {backups.map((backup, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={backup.fileName}
                          secondary={`${formatDate(backup.timestamp)} • ${backup.stats.idosos} idosos • ${backup.stats.pagamentos} pagamentos • ${backup.stats.responsaveis} responsáveis`}
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={formatFileSize(backup.size)} 
                              size="small" 
                              variant="outlined" 
                              color="info"
                            />
                            <Tooltip title="Baixar Arquivo">
                              <IconButton
                                onClick={() => downloadBackup(backup)}
                                size="small"
                                color="primary"
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Copiar Conteúdo">
                              <IconButton
                                onClick={() => handleCopyToClipboard(backup)}
                                size="small"
                                color="info"
                              >
                                <ContentCopyIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Restaurar Backup">
                              <IconButton
                                onClick={() => {
                                  console.log('🔄 Clicou no botão Restaurar:', backup.fileName);
                                  console.log('📊 Backup stats:', backup.stats);
                                  console.log('📦 Has content:', !!backup.content, 'Length:', backup.content?.length || 0);
                                  setRestoreDialog({ open: true, backup });
                                }}
                                size="small"
                                color="warning"
                                disabled={loading}
                              >
                                <RestoreIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remover da Lista">
                              <IconButton
                                onClick={() => handleDeleteBackup(index)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < backups.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum backup encontrado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Crie seu primeiro backup para começar
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de Restauração */}
      <Dialog
        open={restoreDialog.open}
        onClose={() => setRestoreDialog({ open: false, backup: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            Confirmar Restauração
          </Box>
        </DialogTitle>
        <DialogContent>
          {restoreDialog.backup && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Atenção:</strong> Esta ação irá substituir todos os dados atuais pelos dados do backup.
                  Esta operação não pode ser desfeita.
                </Typography>
              </Alert>
              <Typography variant="body1" gutterBottom>
                Você está prestes a restaurar o backup:
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {restoreDialog.backup.fileName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Criado em: {formatDate(restoreDialog.backup.timestamp)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tamanho: {formatFileSize(restoreDialog.backup.size)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip label={`${restoreDialog.backup.stats.idosos} idosos`} size="small" />
                  <Chip label={`${restoreDialog.backup.stats.pagamentos} pagamentos`} size="small" />
                  <Chip label={`${restoreDialog.backup.stats.responsaveis} responsáveis`} size="small" />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRestoreDialog({ open: false, backup: null })}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              console.log('🔘 Botão "Restaurar Backup" clicado no dialog');
              console.log('📦 restoreDialog.backup:', restoreDialog.backup?.fileName);
              if (restoreDialog.backup) {
                handleRestoreBackup(restoreDialog.backup);
              } else {
                console.error('❌ Nenhum backup selecionado!');
              }
            }}
            color="warning"
            variant="contained"
            disabled={loading}
            startIcon={<RestoreIcon />}
          >
            Restaurar Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Upload */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Importar Backup</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Selecione um arquivo CSV de backup para importar:
            </Typography>
            <TextField
              type="file"
              inputProps={{ accept: '.csv' }}
              onChange={handleFileUpload}
              fullWidth
              margin="normal"
            />
            {selectedFile && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Arquivo selecionado:</strong> {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tamanho: {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setUploadDialog(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUploadBackup}
            variant="contained"
            disabled={!selectedFile || loading}
            startIcon={<UploadIcon />}
          >
            Importar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BackupManager;
