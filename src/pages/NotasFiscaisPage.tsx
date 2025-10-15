import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Sort as SortIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import NFSEUpload from '../components/NFSE/NFSEUpload';
import { api } from '../services/api';

interface NotaFiscal {
  id: number;
  numeroNFSE?: string;
  dataPrestacao?: Date;
  dataEmissao?: Date;
  discriminacao?: string;
  valor?: number;
  nomePessoa?: string;
  idosoId: number;
  idoso?: {
    id: number;
    nome: string;
    responsavel?: {
      nome: string;
    };
  };
  mesReferencia: number;
  anoReferencia: number;
  arquivoOriginal?: string;
  status: 'RASCUNHO' | 'COMPLETA' | 'PROCESSADA' | 'CANCELADA';
  pagamentoId?: number;
  createdAt: Date;
  updatedAt: Date;
}

const NotasFiscaisPage: React.FC = () => {
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
  const [formData, setFormData] = useState<Partial<NotaFiscal>>({});
  
  // Estados para filtros
  const [sortBy, setSortBy] = useState<'id' | 'dataPrestacao' | 'dataEmissao' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterByDate, setFilterByDate] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showCanceladas, setShowCanceladas] = useState(false);
  
  // Estados para lixeira
  const [notaParaExcluir, setNotaParaExcluir] = useState<NotaFiscal | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isCancelada, setIsCancelada] = useState(false);

  // Mock de idosos para seleção
  const [idosos] = useState([
    { id: '1', nome: 'Ana Sangaleti Bonassa', responsavel: 'Antônio Marcos Bonassa' },
    { id: '2', nome: 'João Silva', responsavel: 'Maria Silva Santos' },
    { id: '3', nome: 'Pedro Santos', responsavel: 'Ana Santos' }
  ]);

  useEffect(() => {
    loadNotasFiscais();
  }, []);

  const loadNotasFiscais = async () => {
    setLoading(true);
    try {
      const notas = await window.electronAPI.notasFiscais.list();
      setNotasFiscais(notas);
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para aplicar filtros e ordenação
  const getFilteredAndSortedNotas = () => {
    let filtered = [...notasFiscais];

      // Filtro por data
      if (filterByDate !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        filtered = filtered.filter(nota => {
          const notaDate = new Date(nota.createdAt);
          
          switch (filterByDate) {
            case 'today':
              return notaDate >= today;
            case 'week':
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return notaDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(today);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return notaDate >= monthAgo;
            default:
              return true;
          }
        });
      }

      // Filtro por notas canceladas
      if (!showCanceladas) {
        filtered = filtered.filter(nota => nota.status !== 'CANCELADA');
      }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'dataPrestacao':
          aValue = a.dataPrestacao ? new Date(a.dataPrestacao).getTime() : 0;
          bValue = b.dataPrestacao ? new Date(b.dataPrestacao).getTime() : 0;
          break;
        case 'dataEmissao':
          aValue = a.dataEmissao ? new Date(a.dataEmissao).getTime() : 0;
          bValue = b.dataEmissao ? new Date(b.dataEmissao).getTime() : 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const handleSort = (field: 'id' | 'dataPrestacao' | 'dataEmissao' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleNFSEProcessed = async (data: any) => {
    try {
      let idosoId = data.idosoId;
      let pagamentoId = data.pagamentoId;
      
      // Buscar ou criar idoso baseado no idosoNome (razão social)
      if (data.idosoNome) {
        // Primeiro, tentar buscar idoso existente com nome exato
        const idososEncontrados = await window.electronAPI.idosos.getByNome(data.idosoNome);
        const idosoExato = idososEncontrados.find(idoso => 
          idoso.nome.toLowerCase() === data.idosoNome.toLowerCase()
        );
        
        if (idosoExato) {
          idosoId = idosoExato.id;
          console.log('👤 Idoso encontrado com nome exato:', idosoExato.nome);
        } else {
          // Se não encontrou idoso com nome exato, criar um novo AGORA
          console.log('👤 Criando novo idoso para:', data.idosoNome);
          
          // Criar responsável primeiro se necessário
          let responsavelId = null;
          if (data.responsavelNome) {
            // Buscar responsável existente
            const responsaveis = await window.electronAPI.responsaveis.list();
            const responsavelExistente = responsaveis.find(r => 
              r.nome.toLowerCase() === data.responsavelNome.toLowerCase()
            );
            
            if (responsavelExistente) {
              responsavelId = responsavelExistente.id;
            } else {
              // Criar novo responsável
              const novoResponsavel = await window.electronAPI.responsaveis.create({
                nome: data.responsavelNome,
                cpf: data.responsavelCpf || '',
                contatoTelefone: '',
                contatoEmail: '',
                endereco: '',
                ativo: true,
              });
              responsavelId = novoResponsavel.id;
              console.log('👤 Novo responsável criado:', novoResponsavel.nome);
            }
          }
          
          // Criar novo idoso
          const novoIdoso = await window.electronAPI.idosos.create({
            nome: data.idosoNome,
            cpf: '',
            dataNascimento: null,
            responsavelId: responsavelId,
            valorMensalidadeBase: data.valor || 2500, // Usar valor da NFSE como mensalidade
            beneficioSalario: data.valor || 2500, // Usar valor da NFSE como benefício (salário)
            tipo: 'REGULAR',
            observacoes: 'Idoso criado automaticamente via NFSE',
            ativo: true,
          });
          
          idosoId = novoIdoso.id;
          console.log('👤 Novo idoso criado:', novoIdoso.nome);
        }
      }
      
      // Definir pagador e forma de pagamento
      let pagador = data.pagadorNome || 'Não informado'; // Pagador é opcional
      let formaPagamento = data.formaPagamento;
      
      // Se já tem idoso, buscar dados históricos para preencher campos faltantes
      if (idosoId) {
        const pagadoresHistorico = await window.electronAPI.pagamentos.getPagadoresByIdoso(idosoId);
        if (pagadoresHistorico.length > 0) {
          const ultimoPagador = pagadoresHistorico[0];
          if (!formaPagamento) formaPagamento = ultimoPagador.formaPagamento;
        }
      }
      
        // Criar novo pagamento se não existir
        if (!pagamentoId && data.idosoNome) {
          // Extrair mês e ano do mesReferencia extraído pela IA
          const { mes, ano } = parseMesReferencia(data.mesReferencia);
          
          // Usar o idosoId correto (já criado se necessário)
          const novoPagamento = await window.electronAPI.pagamentos.upsert({
            idosoId: idosoId, // Usar o idoso correto
            mesReferencia: mes,
            anoReferencia: ano,
            valorPago: data.valor || 0,
            dataPagamento: data.dataPrestacao ? parseBrazilianDate(data.dataPrestacao) : new Date(),
            nfse: data.numeroNFSE,
            pagador: pagador,
            formaPagamento: formaPagamento,
            observacoes: `Pagamento criado via upload de NFSE para ${data.idosoNome}`
          });
        
        pagamentoId = novoPagamento.id;
        console.log('💰 Novo pagamento criado:', novoPagamento.id);
      }
      
      // Buscar a nota fiscal existente (rascunho) para atualizar
      const notaExistente = await window.electronAPI.notasFiscais.getByPagamento(pagamentoId);
      
      if (notaExistente) {
        // Atualizar nota fiscal existente com dados do upload
        const notaAtualizada = await window.electronAPI.notasFiscais.update(notaExistente.id, {
          numeroNFSE: data.numeroNFSE,
          dataPrestacao: data.dataPrestacao,
          dataEmissao: data.dataEmissao,
          discriminacao: data.discriminacao,
          valor: data.valor,
          nomePessoa: data.idosoNome, // Usar o idosoNome (razão social)
          responsavelNome: data.responsavelNome, // Nome do responsável
          responsavelCpf: data.responsavelCpf, // CPF do responsável
          arquivoOriginal: data.arquivo?.name,
          status: 'COMPLETA'
        });

        setNotasFiscais(prev => prev.map(n => n.id === notaAtualizada.id ? notaAtualizada : n));
        setSnackbarMessage('Nota fiscal atualizada com sucesso!');
      } else {
        // Criar nova nota fiscal se não existir
        // Extrair mês e ano do mesReferencia extraído pela IA
        const { mes, ano } = parseMesReferencia(data.mesReferencia);
        
        const novaNota = await window.electronAPI.notasFiscais.create({
          idosoId: idosoId, // Usar o idoso correto
          mesReferencia: mes,
          anoReferencia: ano,
          numeroNFSE: data.numeroNFSE,
          dataPrestacao: data.dataPrestacao,
          dataEmissao: data.dataEmissao,
          discriminacao: data.discriminacao,
          valor: data.valor,
          nomePessoa: data.idosoNome, // Usar o idosoNome (razão social)
          responsavelNome: data.responsavelNome, // Nome do responsável
          responsavelCpf: data.responsavelCpf, // CPF do responsável
          pagamentoId: pagamentoId,
          arquivoOriginal: data.arquivo?.name,
          status: 'COMPLETA'
        });

        setNotasFiscais(prev => [novaNota, ...prev]);
        setSnackbarMessage('Nota fiscal processada com sucesso!');
        
        // Gerar recibo automaticamente se há doação
        try {
          if (pagamentoId) {
            // Buscar dados do pagamento para calcular doação
            const pagamento = await window.electronAPI.pagamentos.getById(pagamentoId);
            const idoso = await window.electronAPI.idosos.getById(idosoId);
            
            if (pagamento && idoso) {
              const salarioIdoso = (idoso as any).beneficioSalario && (idoso as any).beneficioSalario > 0 ? (idoso as any).beneficioSalario : 0; // Salário do idoso (ex: R$ 1.518,00)
              const valorPago = pagamento.valorPago || 0; // Mensalidade paga (ex: R$ 3.225,00)
              const valorNFSE = salarioIdoso * 0.7; // 70% do salário (ex: R$ 1.062,60)
              const valorDoacao = Math.max(0, valorPago - valorNFSE); // Doação (ex: R$ 2.162,40)
              
              if (valorDoacao > 0 && idoso.tipo !== 'SOCIAL') {
                console.log('📄 NotasFiscaisPage: Gerando recibo automático para doação', {
                  valorDoacao,
                  valorNFSE,
                  valorPago,
                  salarioIdoso,
                  pagamentoId
                });
                
                // Aguardar um pouco para garantir que o pagamento foi salvo
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const reciboResult = await api.recibos.gerarReciboAutomatico(pagamentoId);
                
                if (reciboResult.success) {
                  console.log('✅ NotasFiscaisPage: Recibo automático gerado com sucesso', {
                    pagamentoId,
                    valorDoacao: reciboResult.valorDoacao,
                    fileName: reciboResult.fileName
                  });
                  
                  setSnackbarMessage(
                    `Nota fiscal processada e recibo de doação gerado! Valor da doação: R$ ${reciboResult.valorDoacao?.toFixed(2) || valorDoacao.toFixed(2)}`
                  );
                } else {
                  console.error('❌ NotasFiscaisPage: Erro ao gerar recibo automático', reciboResult.error);
                  setSnackbarMessage('Nota fiscal processada, mas erro ao gerar recibo automático');
                }
                } else {
                  const motivo = idoso.tipo === 'SOCIAL' 
                    ? 'Idoso SOCIAL não gera recibo (prefeitura paga o restante)'
                    : 'Não há doação para gerar recibo';
                  console.log(`ℹ️ NotasFiscaisPage: ${motivo}`);
                  setSnackbarMessage(`Nota fiscal processada com sucesso! (${motivo})`);
                }
            }
          }
        } catch (reciboError) {
          console.error('❌ NotasFiscaisPage: Erro ao gerar recibo automático', reciboError);
          setSnackbarMessage('Nota fiscal processada, mas erro ao gerar recibo automático');
        }
      }
      
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao processar nota fiscal:', error);
      setSnackbarMessage('Erro ao processar nota fiscal');
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (nota: NotaFiscal) => {
    setSelectedNota(nota);
    setFormData(nota);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await window.electronAPI.notasFiscais.delete(id);
      setNotasFiscais(prev => prev.filter(nota => nota.id !== id));
      setSnackbarMessage('Nota fiscal excluída com sucesso!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao excluir nota fiscal:', error);
      setSnackbarMessage('Erro ao excluir nota fiscal');
      setSnackbarOpen(true);
    }
  };

  const handleTrashClick = (nota: NotaFiscal) => {
    setNotaParaExcluir(nota);
    setIsCancelada(nota.status === 'CANCELADA');
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!notaParaExcluir) return;

    try {
      if (isCancelada) {
        // Segunda vez - excluir permanentemente
        await window.electronAPI.notasFiscais.delete(notaParaExcluir.id);
        setNotasFiscais(prev => prev.filter(nota => nota.id !== notaParaExcluir.id));
        setSnackbarMessage('Nota fiscal excluída permanentemente!');
      } else {
        // Primeira vez - cancelar
        await window.electronAPI.notasFiscais.cancel(notaParaExcluir.id);
        setNotasFiscais(prev => prev.map(nota => 
          nota.id === notaParaExcluir.id 
            ? { ...nota, status: 'CANCELADA' as const }
            : nota
        ));
        setSnackbarMessage('Nota fiscal cancelada!');
      }
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao processar nota fiscal:', error);
      setSnackbarMessage('Erro ao processar nota fiscal');
      setSnackbarOpen(true);
    } finally {
      setConfirmDeleteOpen(false);
      setNotaParaExcluir(null);
      setIsCancelada(false);
    }
  };

  const handleSave = async () => {
    if (selectedNota) {
      try {
        const notaAtualizada = await window.electronAPI.notasFiscais.update(selectedNota.id, formData);
        setNotasFiscais(prev => 
          prev.map(nota => 
            nota.id === selectedNota.id 
              ? notaAtualizada
              : nota
          )
        );
        setSnackbarMessage('Nota fiscal atualizada com sucesso!');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Erro ao atualizar nota fiscal:', error);
        setSnackbarMessage('Erro ao atualizar nota fiscal');
        setSnackbarOpen(true);
      }
    }
    setDialogOpen(false);
    setSelectedNota(null);
    setFormData({});
  };

  const handleGerarRecibo = async (pagamentoId: number) => {
    try {
      const result = await window.electronAPI.recibos.gerarDoacao(pagamentoId);
      setSnackbarMessage(`Recibo gerado: ${result.nomeArquivo}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      setSnackbarMessage('Erro ao gerar recibo');
      setSnackbarOpen(true);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para converter data brasileira (DD/MM/AAAA) para Date
  const parseBrazilianDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    
    // Se já é uma string de data ISO, usar diretamente
    if (dateString.includes('T') || dateString.includes('-')) {
      return new Date(dateString);
    }
    
    // Converter formato brasileiro DD/MM/AAAA para AAAA-MM-DD
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      console.log('🔄 Convertendo data brasileira:', dateString, '→', isoDate);
      return new Date(isoDate);
    }
    
    // Fallback para new Date() se não conseguir converter
    console.warn('⚠️ Não foi possível converter a data:', dateString);
    return new Date();
  };

  // Função para extrair mês e ano do mesReferencia (MM/AAAA)
  const parseMesReferencia = (mesReferencia: string): { mes: number; ano: number } => {
    if (!mesReferencia) {
      const now = new Date();
      return { mes: now.getMonth() + 1, ano: now.getFullYear() };
    }
    
    const parts = mesReferencia.split('/');
    if (parts.length === 2) {
      const [mes, ano] = parts;
      console.log('🔄 Convertendo mês/ano:', mesReferencia, '→', { mes: parseInt(mes), ano: parseInt(ano) });
      return { mes: parseInt(mes), ano: parseInt(ano) };
    }
    
    // Fallback para mês/ano atual
    const now = new Date();
    console.warn('⚠️ Não foi possível converter mês/ano:', mesReferencia, 'usando mês/ano atual');
    return { mes: now.getMonth() + 1, ano: now.getFullYear() };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciar Notas Fiscais
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Faça upload de notas fiscais de serviço eletrônicas (NFSE) e gerencie os dados extraídos.
      </Typography>

      {/* Upload de NFSE */}
      <Paper sx={{ mb: 4 }}>
        <NFSEUpload onNFSEProcessed={handleNFSEProcessed} />
      </Paper>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros e Ordenação
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Filtro por data */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filtrar por data</InputLabel>
            <Select
              value={filterByDate}
              label="Filtrar por data"
              onChange={(e) => setFilterByDate(e.target.value as any)}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="today">Hoje</MenuItem>
              <MenuItem value="week">Última semana</MenuItem>
              <MenuItem value="month">Último mês</MenuItem>
            </Select>
          </FormControl>

          {/* Botões de ordenação */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Ordenar por:
            </Typography>
            
            <Button
              variant={sortBy === 'id' ? 'contained' : 'outlined'}
              size="small"
              startIcon={sortBy === 'id' ? (sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />) : <SortIcon />}
              onClick={() => handleSort('id')}
            >
              ID
            </Button>
            
            <Button
              variant={sortBy === 'dataPrestacao' ? 'contained' : 'outlined'}
              size="small"
              startIcon={sortBy === 'dataPrestacao' ? (sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />) : <SortIcon />}
              onClick={() => handleSort('dataPrestacao')}
            >
              Data Pagamento
            </Button>
            
            <Button
              variant={sortBy === 'dataEmissao' ? 'contained' : 'outlined'}
              size="small"
              startIcon={sortBy === 'dataEmissao' ? (sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />) : <SortIcon />}
              onClick={() => handleSort('dataEmissao')}
            >
              Data Emissão
            </Button>
            
            <Button
              variant={sortBy === 'createdAt' ? 'contained' : 'outlined'}
              size="small"
              startIcon={sortBy === 'createdAt' ? (sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />) : <SortIcon />}
              onClick={() => handleSort('createdAt')}
            >
              Data Criação
            </Button>
          </Box>

          {/* Botão para mostrar/esconder notas canceladas */}
          <IconButton
            onClick={() => setShowCanceladas(!showCanceladas)}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
            title={showCanceladas ? 'Mostrar Canceladas' : 'Esconder Canceladas'}
          >
            {showCanceladas ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Box>
      </Paper>

      {/* Lista de Notas Fiscais */}
      <Typography variant="h5" gutterBottom>
        Notas Fiscais Processadas ({getFilteredAndSortedNotas().length})
      </Typography>

      <Grid container spacing={3}>
        {getFilteredAndSortedNotas().map((nota) => (
          <Grid item xs={12} md={6} lg={4} key={nota.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {nota.numeroNFSE ? `NFSE ${nota.numeroNFSE}` : `Nota #${nota.id}`}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip 
                      label={nota.status} 
                      size="small" 
                      color={
                        nota.status === 'COMPLETA' ? 'success' : 
                        nota.status === 'PROCESSADA' ? 'primary' : 
                        nota.status === 'CANCELADA' ? 'error' : 
                        'warning'
                      }
                      sx={{ 
                        mr: 1,
                        color: nota.status === 'CANCELADA' ? 'white' : 'inherit'
                      }}
                    />
                    <IconButton size="small" onClick={() => handleEdit(nota)}>
                      <EditIcon />
                    </IconButton>
                    {nota.pagamentoId && nota.valor && nota.idoso && (() => {
                      const valorPago = nota.valor;
                      const salarioIdoso = (nota.idoso as any).beneficioSalario && (nota.idoso as any).beneficioSalario > 0 ? (nota.idoso as any).beneficioSalario : 0;
                      const valorDoacao = Math.max(0, valorPago - (salarioIdoso * 0.7));
                      return valorDoacao > 0 ? (
                        <IconButton 
                          size="small" 
                          onClick={() => handleGerarRecibo(nota.pagamentoId!)}
                          color="secondary"
                          title="Gerar Recibo de Doação"
                        >
                          <ReceiptIcon />
                        </IconButton>
                      ) : null;
                    })()}
                    <IconButton 
                      size="small" 
                      onClick={() => handleTrashClick(nota)}
                      color={nota.status === 'CANCELADA' ? 'error' : 'default'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Data da Prestação: {nota.dataPrestacao ? formatDate(nota.dataPrestacao) : 'Não informada'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mês/Ano: {nota.mesReferencia}/{nota.anoReferencia}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6" color="success.main">
                    {nota.valor ? formatCurrency(nota.valor) : 'Valor não informado'}
                  </Typography>
                </Box>

                {/* Cálculo de Doação e Validação */}
                {nota.valor && nota.idoso && (
                  <Box sx={{ mb: 2 }}>
                    {(() => {
                      const valorPago = nota.valor;
                      const salarioIdoso = (nota.idoso as any).beneficioSalario && (nota.idoso as any).beneficioSalario > 0 ? (nota.idoso as any).beneficioSalario : 0;
                      const valorDoacao = Math.max(0, valorPago - (salarioIdoso * 0.7));
                      const valorMaximo = salarioIdoso * 0.7;
                      const isExcedente = valorPago > valorMaximo;
                      
                      return (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Chip
                            label={`Doação: R$ ${valorDoacao.toFixed(2)}`}
                            color={valorDoacao > 0 ? "info" : "default"}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`Limite: R$ ${valorMaximo.toFixed(2)} (70%)`}
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                          {isExcedente && (
                            <Chip
                              label="⚠️ Excede 70%"
                              color="error"
                              size="small"
                            />
                          )}
                        </Box>
                      );
                    })()}
                  </Box>
                )}

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {nota.discriminacao || 'Descrição não informada'}
                </Typography>

                {nota.nomePessoa && (
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={`Pagador: ${nota.nomePessoa}`} 
                      size="small" 
                      color="info" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                )}

                {nota.idoso && (
                  <Box>
                    <Chip 
                      label={`Idoso: ${nota.idoso.nome}`} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {nota.idoso.responsavel && (
                      <Chip 
                        label={`Responsável: ${nota.idoso.responsavel.nome}`} 
                        size="small" 
                        color="secondary"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                    <Chip 
                      label={`Mensalidade: R$ ${nota.idoso.valorMensalidadeBase?.toFixed(2) || '0,00'}`} 
                      size="small" 
                      color="info"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      label={`70%: R$ ${((nota.idoso.valorMensalidadeBase || 0) * 0.7).toFixed(2)}`} 
                      size="small" 
                      color="warning"
                      variant="outlined"
                    />
                  </Box>
                )}

                <Typography variant="caption" color="text.secondary">
                  Criado: {new Date(nota.createdAt).toLocaleDateString('pt-BR')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {getFilteredAndSortedNotas().length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {notasFiscais.length === 0 
              ? 'Nenhuma nota fiscal processada ainda'
              : 'Nenhuma nota fiscal encontrada com os filtros aplicados'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {notasFiscais.length === 0 
              ? 'Faça upload de uma NFSE para começar'
              : 'Tente ajustar os filtros ou criar um novo pagamento'
            }
          </Typography>
        </Paper>
      )}

      {/* Dialog de Edição */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Editar Nota Fiscal NFSE {selectedNota?.numeroNFSE}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número da NFSE"
                value={formData.numeroNFSE || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroNFSE: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data da Prestação"
                value={formData.dataPrestacao || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dataPrestacao: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Emissão"
                value={formData.dataEmissao || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dataEmissao: e.target.value }))}
                placeholder="DD/MM/AAAA"
                helperText="Data de emissão da NFSE"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor"
                type="number"
                value={formData.valor || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) }))}
                InputProps={{
                  startAdornment: 'R$ '
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mês de Referência"
                value={formData.mesReferencia || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mesReferencia: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Vincular ao Idoso</InputLabel>
                <Select
                  value={formData.idosoId || ''}
                  onChange={(e) => {
                    const idoso = idosos.find(i => i.id === e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      idosoId: e.target.value,
                      idosoNome: idoso?.nome,
                      responsavelNome: idoso?.responsavel
                    }));
                  }}
                  label="Vincular ao Idoso"
                >
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>
                  {idosos.map((idoso) => (
                    <MenuItem key={idoso.id} value={idoso.id}>
                      {idoso.nome} - {idoso.responsavel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Discriminação do Serviço"
                value={formData.discriminacao || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, discriminacao: e.target.value }))}
                multiline
                rows={3}
                placeholder="Descrição detalhada do serviço prestado..."
                helperText="Descrição do serviço conforme a NFSE"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação para exclusão */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>
          {isCancelada ? 'Excluir Permanentemente' : 'Cancelar Nota Fiscal'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {isCancelada 
              ? 'Tem certeza que deseja excluir permanentemente esta nota fiscal? Esta ação não pode ser desfeita.'
              : 'Deseja cancelar esta nota fiscal? Ela será marcada como CANCELADA e poderá ser excluída permanentemente posteriormente.'
            }
          </Typography>
          {notaParaExcluir && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Nota:</strong> {notaParaExcluir.numeroNFSE ? `NFSE ${notaParaExcluir.numeroNFSE}` : `Nota #${notaParaExcluir.id}`}
              </Typography>
              <Typography variant="body2">
                <strong>Valor:</strong> R$ {notaParaExcluir.valor?.toFixed(2) || '0,00'}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {notaParaExcluir.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained"
            color={isCancelada ? 'error' : 'warning'}
          >
            {isCancelada ? 'Excluir Permanentemente' : 'Cancelar Nota'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotasFiscaisPage;
