// Mock da API Electron para desenvolvimento
// Este arquivo simula as funções da API real
import { getReciboMensalidadeHtml, getListaIdososHtml } from '../templates/recibo.template';
import { logInfo, logError } from '../utils/logger';
import extenso from 'extenso';

// Funções para gerenciar localStorage
const getFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Erro ao ler do localStorage:', error);
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

// Arrays em memória para simular banco de dados (com persistência)
const getNotasFiscaisMock = () => {
  const defaultData: any[] = [
    {
      id: 1,
      numeroNFSE: '12345',
      dataPrestacao: '2025-10-07T00:00:00.000Z', // Data da prestação (diferente da data de pagamento)
      dataEmissao: '2025-10-05T00:00:00.000Z',   // Data de emissão
      discriminacao: 'Valor referente participação no custeio da entidade. Referente ao mês de Outubro de 2025. Conforme PIX Banco do Brasil.',
      valor: 2500.00,
      nomePessoa: 'Ana Sangaleti Bonassa',
      idosoId: 1,
      mesReferencia: 10,
      anoReferencia: 2025,
      status: 'COMPLETA',
      pagamentoId: 1,
      arquivoOriginal: 'nfse_12345.pdf',
      createdAt: '2025-10-15T00:00:00.000Z',
      updatedAt: '2025-10-15T00:00:00.000Z'
    },
    {
      id: 2,
      numeroNFSE: '12346',
      dataPrestacao: '2025-11-07T00:00:00.000Z', // Data da prestação (diferente da data de pagamento)
      dataEmissao: '2025-11-05T00:00:00.000Z',   // Data de emissão
      discriminacao: 'Valor referente participação no custeio da entidade. Referente ao mês de Novembro de 2025. Conforme PIX Banco do Brasil.',
      valor: 2500.00,
      nomePessoa: 'Ana Sangaleti Bonassa',
      idosoId: 1,
      mesReferencia: 11,
      anoReferencia: 2025,
      status: 'COMPLETA',
      pagamentoId: 2,
      arquivoOriginal: 'nfse_12346.pdf',
      createdAt: '2025-11-15T00:00:00.000Z',
      updatedAt: '2025-11-15T00:00:00.000Z'
    }
  ];
  
  return getFromStorage('notasFiscaisMock', defaultData);
};

const saveNotasFiscaisMock = (data: any[]) => {
  saveToStorage('notasFiscaisMock', data);
};

// Função para limpar todas as NFSEs (para teste)
const clearNotasFiscaisMock = () => {
  console.log('🗑️ Limpando todas as NFSEs...');
  saveToStorage('notasFiscaisMock', []);
  console.log('✅ Todas as NFSEs foram removidas');
};

// Função global para limpar dados (disponível no console)
(window as any).clearAllMockData = () => {
  console.log('🗑️ Limpando todos os dados mock...');
  clearNotasFiscaisMock();
  clearPagamentosMock();
  console.log('✅ Todos os dados foram limpos');
  console.log('🔄 Recarregue a página para ver os dados limpos');
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
    console.log('🔄 Mock API: Convertendo data brasileira:', dateString, '→', isoDate);
    return new Date(isoDate);
  }
  
  // Fallback para new Date() se não conseguir converter
  console.warn('⚠️ Mock API: Não foi possível converter a data:', dateString);
  return new Date();
};

const getResponsaveisMock = () => {
  const defaultData = [
    {
      id: 1,
      nome: 'Responsável de Teste',
      cpf: '000.000.000-00',
      contatoTelefone: '(45) 99999-9999',
      contatoEmail: 'teste@email.com',
      idosos: [],
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      nome: 'Maria Silva Santos',
      cpf: '123.456.789-00',
      contatoTelefone: '(45) 98888-7777',
      contatoEmail: 'maria.silva@email.com',
      idosos: [],
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  return getFromStorage('responsaveisMock', defaultData);
};

const saveResponsaveisMock = (data: any[]) => {
  saveToStorage('responsaveisMock', data);
};

const getIdososMock = () => {
  const defaultData = [
    {
      id: 1,
      nome: 'Idoso de Teste',
      cpf: '111.111.111-11',
      dataNascimento: '1939-12-31',
      responsavelId: 1,
      responsavel: {
        id: 1,
        nome: 'Responsável de Teste',
        cpf: '000.000.000-00',
        contatoTelefone: '(45) 99999-9999',
        contatoEmail: 'teste@email.com',
      },
      valorMensalidadeBase: 2500.00,
      tipo: 'REGULAR',
      ativo: true,
      observacoes: 'Registro de teste',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  const data = getFromStorage('idososMock', defaultData);
  
  // Migrar dados existentes: garantir que todos os idosos tenham o campo 'tipo'
  const migratedData = data.map((idoso: any) => {
    let tipo = idoso.tipo || 'REGULAR';
    
    // Identificar idosos que deveriam ser SOCIAL baseado no nome
    const nomesSocial = [
      'OLICIO DOS SANTOS',
      'Pe. Jose Antonio Dalla Dasparina',
      'José Maria de Souza',
      'Lourdes Maria Anderle',
      'Lourdes Meneguzzi Valentini',
      'Maria Adolina Scherer',
      'Maria Ines Jung',
      'Mauri Antonio de Moraes',
      'Nadir Rodrigues',
      'Rainilda Defreyn Kruger',
      'Rosa Terhorst',
      'Aloisio Luiz Grumicher'
    ];
    
    // Forçar migração baseada no nome, mesmo se já tiver tipo definido
    if (nomesSocial.includes(idoso.nome)) {
      tipo = 'SOCIAL';
      if (idoso.tipo !== 'SOCIAL') {
        console.log('🔄 Forçando migração do idoso:', idoso.nome, 'de', idoso.tipo, 'para SOCIAL');
      }
    }
    
    if (!idoso.tipo) {
      console.log('🔄 Migrando idoso:', idoso.nome, 'para tipo:', tipo);
    }
    
    return {
      ...idoso,
      tipo: tipo
    };
  });
  
  // Salvar dados migrados se houve mudanças
  const hasChanges = migratedData.some((idoso: any, index: number) => idoso.tipo !== data[index]?.tipo);
  if (hasChanges) {
    console.log('💾 Salvando dados migrados...');
    saveIdososMock(migratedData);
  }
  
  return migratedData;
};

const saveIdososMock = (data: any[]) => {
  saveToStorage('idososMock', data);
};

const getPagamentosMock = () => {
  const defaultData: any[] = [
    {
      id: 1,
      idosoId: 1,
      mesReferencia: 10,
      anoReferencia: 2025,
      valorPago: 2500.00,
      dataPagamento: '2025-10-15T00:00:00.000Z',
      nfse: '12345',
      pagador: 'Ana Sangaleti Bonassa',
      formaPagamento: 'PIX Banco do Brasil',
      observacoes: 'Pagamento de mensalidade',
      createdAt: '2025-10-15T00:00:00.000Z',
      updatedAt: '2025-10-15T00:00:00.000Z'
    },
    {
      id: 2,
      idosoId: 1,
      mesReferencia: 11,
      anoReferencia: 2025,
      valorPago: 2500.00,
      dataPagamento: '2025-11-15T00:00:00.000Z',
      nfse: '12346',
      pagador: 'Ana Sangaleti Bonassa',
      formaPagamento: 'PIX Banco do Brasil',
      observacoes: 'Pagamento de mensalidade',
      createdAt: '2025-11-15T00:00:00.000Z',
      updatedAt: '2025-11-15T00:00:00.000Z'
    }
  ];
  
  return getFromStorage('pagamentosMock', defaultData);
};

const savePagamentosMock = (data: any[]) => {
  saveToStorage('pagamentosMock', data);
};

// Função para limpar todos os pagamentos (para teste)
const clearPagamentosMock = () => {
  console.log('🗑️ Limpando todos os pagamentos...');
  saveToStorage('pagamentosMock', []);
  console.log('✅ Todos os pagamentos foram removidos');
};

export const mockElectronAPI = {

  // Função para limpar todos os dados (para teste)
  clearAllData: async () => {
    console.log('🗑️ Limpando todos os dados mock...');
    clearNotasFiscaisMock();
    clearPagamentosMock();
    console.log('✅ Todos os dados foram limpos');
    return { success: true };
  },

  // Idosos
  idosos: {
    list: async () => {
      console.log('📋 Mock API: Listando idosos...');
      await new Promise(resolve => setTimeout(resolve, 500));
      const idososMock = getIdososMock();
      console.log('✅ Mock API: Idosos retornados:', idososMock);
      return idososMock;
    },
    create: async (data: any) => {
      console.log('➕ Mock API: Criando idoso:', data);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const idososMock = getIdososMock();
      const responsaveisMock = getResponsaveisMock();
      
      // Buscar responsável para incluir dados completos
      const responsavel = responsaveisMock.find((r: any) => r.id === data.responsavelId);
      
      const novoIdoso = {
        id: Date.now(),
        ...data,
        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento).toISOString().split('T')[0] : null,
        responsavel: responsavel || {
          id: data.responsavelId,
          nome: 'Responsável não encontrado',
          cpf: '000.000.000-00',
        },
        tipo: data.tipo || 'REGULAR', // Garantir que tipo seja definido
        ativo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      idososMock.push(novoIdoso);
      saveIdososMock(idososMock);
      console.log('✅ Mock API: Idoso criado:', novoIdoso);
      return novoIdoso;
    },
    update: async (id: number, data: any) => {
      console.log('📝 Mock API: Atualizando idoso ID:', id, 'com dados:', data);
      await new Promise(resolve => setTimeout(resolve, 400));
      const idososMock = getIdososMock();
      const index = idososMock.findIndex((i: any) => i.id === id);
      if (index !== -1) {
        idososMock[index] = { 
          ...idososMock[index], 
          ...data, 
          dataNascimento: data.dataNascimento ? new Date(data.dataNascimento).toISOString().split('T')[0] : idososMock[index].dataNascimento,
          updatedAt: new Date().toISOString() 
        };
        saveIdososMock(idososMock);
        console.log('✅ Mock API: Idoso atualizado:', idososMock[index]);
        return idososMock[index];
      }
      throw new Error('Idoso não encontrado');
    },
    delete: async (id: number) => {
      console.log('🗑️ Mock API: Excluindo idoso ID:', id);
      await new Promise(resolve => setTimeout(resolve, 300));
      const idososMock = getIdososMock();
      const index = idososMock.findIndex((i: any) => i.id === id);
      if (index !== -1) {
        idososMock[index].ativo = false;
        idososMock[index].updatedAt = new Date().toISOString();
        saveIdososMock(idososMock);
        console.log('✅ Mock API: Idoso desativado');
        return idososMock[index];
      }
      throw new Error('Idoso não encontrado');
    },
    activate: async (id: number) => {
      console.log('✅ Mock API: Ativando idoso ID:', id);
      await new Promise(resolve => setTimeout(resolve, 300));
      const idososMock = getIdososMock();
      const index = idososMock.findIndex((i: any) => i.id === id);
      if (index !== -1) {
        idososMock[index].ativo = true;
        idososMock[index].updatedAt = new Date().toISOString();
        saveIdososMock(idososMock);
        console.log('✅ Mock API: Idoso ativado');
        return idososMock[index];
      }
      throw new Error('Idoso não encontrado');
    },
    getById: async (id: number) => {
      console.log('🔍 Mock API: Buscando idoso ID:', id);
      await new Promise(resolve => setTimeout(resolve, 200));
      const idososMock = getIdososMock();
      const idoso = idososMock.find((i: any) => i.id === id);
      if (!idoso) {
        throw new Error('Idoso não encontrado');
      }
      return idoso;
    },

    getByPagador: async (pagador: string) => {
      console.log('🔍 Mock API: Buscando idosos por pagador:', pagador);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const pagamentosMock = getPagamentosMock();
      const idososMock = getIdososMock();
      
      // Filtrar pagamentos que contêm o pagador
      const pagamentosComPagador = pagamentosMock.filter((p: any) => 
        p.pagador && p.pagador.toLowerCase().includes(pagador.toLowerCase())
      );
      
      // Agrupar por idoso
      const idososMap = new Map();
      pagamentosComPagador.forEach((p: any) => {
        if (!idososMap.has(p.idosoId)) {
          const idoso = idososMock.find((i: any) => i.id === p.idosoId);
          if (idoso) {
            idososMap.set(p.idosoId, {
              ...idoso,
              ultimoPagamento: {
                pagador: p.pagador,
                formaPagamento: p.formaPagamento,
                valorPago: p.valorPago,
                dataPagamento: p.dataPagamento,
                mesReferencia: p.mesReferencia,
                anoReferencia: p.anoReferencia,
              },
            });
          }
        }
      });
      
      const idosos = Array.from(idososMap.values());
      console.log('✅ Mock API: Idosos encontrados por pagador:', idosos.length);
      return idosos;
    },

    getByNome: async (nome: string) => {
      console.log('🔍 Mock API: Buscando idosos por nome:', nome);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const idososMock = getIdososMock();
      const idosos = idososMock.filter((i: any) => 
        i.nome.toLowerCase().includes(nome.toLowerCase())
      );
      
      console.log('✅ Mock API: Idosos encontrados por nome:', idosos.length);
      return idosos;
    },
  },

  // Responsáveis
  responsaveis: {
    list: async () => {
      console.log('📋 Mock API: Listando responsáveis...');
      await new Promise(resolve => setTimeout(resolve, 400));
      const responsaveisMock = getResponsaveisMock();
      const idososMock = getIdososMock();
      
      // Associar idosos aos responsáveis
      const responsaveisComIdosos = responsaveisMock.map((responsavel: any) => ({
        ...responsavel,
        idosos: idososMock.filter((idoso: any) => idoso.responsavelId === responsavel.id && idoso.ativo)
      }));
      
      console.log('✅ Mock API: Responsáveis retornados:', responsaveisComIdosos);
      return responsaveisComIdosos;
    },
    create: async (data: any) => {
      console.log('➕ Mock API: Criando responsável:', data);
      await new Promise(resolve => setTimeout(resolve, 400));
      const responsaveisMock = getResponsaveisMock();
      const novoResponsavel = { 
        id: Date.now(), 
        ...data,
        idosos: [],
        ativo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      responsaveisMock.push(novoResponsavel);
      saveResponsaveisMock(responsaveisMock);
      console.log('✅ Mock API: Responsável criado:', novoResponsavel);
      return novoResponsavel;
    },
    update: async (id: number, data: any) => {
      console.log('📝 Mock API: Atualizando responsável ID:', id, 'com dados:', data);
      await new Promise(resolve => setTimeout(resolve, 400));
      const responsaveisMock = getResponsaveisMock();
      const index = responsaveisMock.findIndex((r: any) => r.id === id);
      if (index !== -1) {
        responsaveisMock[index] = { ...responsaveisMock[index], ...data, updatedAt: new Date().toISOString() };
        saveResponsaveisMock(responsaveisMock);
        console.log('✅ Mock API: Responsável atualizado:', responsaveisMock[index]);
        return responsaveisMock[index];
      }
      throw new Error('Responsável não encontrado');
    },
    delete: async (id: number) => {
      console.log('🗑️ Mock API: Desativando responsável ID:', id);
      await new Promise(resolve => setTimeout(resolve, 300));
      const responsaveisMock = getResponsaveisMock();
      const index = responsaveisMock.findIndex((r: any) => r.id === id);
      if (index !== -1) {
        // Marcar como inativo em vez de remover
        responsaveisMock[index].ativo = false;
        responsaveisMock[index].updatedAt = new Date().toISOString();
        saveResponsaveisMock(responsaveisMock);
        console.log('✅ Mock API: Responsável desativado');
        return responsaveisMock[index];
      }
      throw new Error('Responsável não encontrado');
    },
    activate: async (id: number) => {
      console.log('✅ Mock API: Ativando responsável ID:', id);
      await new Promise(resolve => setTimeout(resolve, 300));
      const responsaveisMock = getResponsaveisMock();
      const index = responsaveisMock.findIndex((r: any) => r.id === id);
      if (index !== -1) {
        responsaveisMock[index].ativo = true;
        responsaveisMock[index].updatedAt = new Date().toISOString();
        saveResponsaveisMock(responsaveisMock);
        console.log('✅ Mock API: Responsável ativado');
        return responsaveisMock[index];
      }
      throw new Error('Responsável não encontrado');
    },
    getById: async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const responsaveisMock = getResponsaveisMock();
      const responsavel = responsaveisMock.find((r: any) => r.id === id);
      if (!responsavel) {
        throw new Error('Responsável não encontrado');
      }
      return responsavel;
    },
  },

  // Dashboard
  dashboard: {
    get: async (ano: number) => {
      console.log('📊 Mock API: Buscando dados do dashboard para ano:', ano);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const idososMock = getIdososMock();
      const pagamentosMock = getPagamentosMock();
      
      // Usar idosos do array em memória
      const idosos = idososMock.map((idoso: any) => ({
        id: idoso.id,
        nome: idoso.nome,
        cpf: idoso.cpf,
        responsavel: idoso.responsavel,
        valorMensalidadeBase: idoso.valorMensalidadeBase,
        ativo: idoso.ativo,
      }));

      // Usar pagamentos do array em memória
      const pagamentos: Record<number, Record<number, any>> = {};
      
      // Filtrar pagamentos pelo ano
      const pagamentosAno = pagamentosMock.filter((p: any) => p.anoReferencia === ano);
      
      // Organizar pagamentos por idoso e mês
      pagamentosAno.forEach((pagamento: any) => {
        if (!pagamentos[pagamento.idosoId]) {
          pagamentos[pagamento.idosoId] = {};
        }
        pagamentos[pagamento.idosoId][pagamento.mesReferencia] = {
          id: pagamento.id,
          status: pagamento.status,
          nfse: pagamento.nfse,
          valorPago: pagamento.valorPago,
          dataPagamento: pagamento.dataPagamento ? new Date(pagamento.dataPagamento) : null,
        };
      });

      console.log('✅ Mock API: Dashboard retornado - Idosos:', idosos.length, 'Pagamentos:', pagamentosAno.length);
      return { idosos, pagamentos };
    },
  },

  // Pagamentos
  pagamentos: {
    upsert: async (data: any) => {
      console.log('💰 Mock API: Upsert pagamento:', data);
      console.log('📅 Mock API: mesReferencia recebido:', data.mesReferencia);
      console.log('📅 Mock API: anoReferencia recebido:', data.anoReferencia);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const idososMock = getIdososMock();
      const pagamentosMock = getPagamentosMock();
      
      // Buscar idoso para calcular status
      const idoso = idososMock.find((i: any) => i.id === data.idosoId);
      const valorBase = idoso?.valorMensalidadeBase || 2500;
      const valorPago = data.valorPago || 0;
      const tipoIdoso = idoso?.tipo || 'REGULAR';
      let status = 'PENDENTE';
      
      // Status baseado no limite de 70% (não no valor total)
      const limite70Porcento = valorBase * 0.7;
      
      if (valorPago >= limite70Porcento) {
        status = 'PAGO';
      } else if (valorPago > 0) {
        status = 'PARCIAL';
      }
      
      // Calcular valores de benefício
      const valorBeneficio = valorBase;
      const percentualBeneficio = 70; // Percentual padrão
      const totalBeneficioAplicado = valorBeneficio * (percentualBeneficio / 100);
      
      // Para idosos SOCIAL: não há doação (município paga o restante)
      // Para idosos REGULAR: doação = valor pago - 70% do benefício
      let valorDoacao = 0;
      if (tipoIdoso === 'SOCIAL') {
        valorDoacao = 0; // Idosos SOCIAL não geram doação
      } else {
        // Idosos REGULAR: doação = valor pago - 70% do benefício
        valorDoacao = Math.max(0, valorPago - totalBeneficioAplicado);
      }
      
      // Verificar se já existe pagamento para este idoso/mês/ano
      const pagamentoExistente = pagamentosMock.find((p: any) => 
        p.idosoId === data.idosoId && 
        p.mesReferencia === data.mesReferencia && 
        p.anoReferencia === data.anoReferencia
      );
      
      if (pagamentoExistente) {
        // Atualizar pagamento existente
        pagamentoExistente.valorPago = valorPago;
        pagamentoExistente.dataPagamento = data.dataPagamento ? new Date(data.dataPagamento).toISOString().split('T')[0] : null;
        pagamentoExistente.mesReferencia = data.mesReferencia; // ✅ Atualizar mês de referência
        pagamentoExistente.anoReferencia = data.anoReferencia; // ✅ Atualizar ano de referência
        pagamentoExistente.nfse = data.nfse;
        pagamentoExistente.pagador = data.pagador;
        pagamentoExistente.formaPagamento = data.formaPagamento;
        pagamentoExistente.status = status;
        pagamentoExistente.valorDoacaoCalculado = valorDoacao;
        // Novos campos de cálculo de benefício
        pagamentoExistente.valorBeneficio = valorBeneficio;
        pagamentoExistente.percentualBeneficio = percentualBeneficio;
        pagamentoExistente.totalBeneficioAplicado = totalBeneficioAplicado;
        pagamentoExistente.observacoes = data.observacoes;
        pagamentoExistente.updatedAt = new Date().toISOString();
        
        savePagamentosMock(pagamentosMock);
        console.log('✅ Mock API: Pagamento atualizado:', pagamentoExistente);
        return pagamentoExistente;
      } else {
        // Criar novo pagamento
        const novoPagamento = {
          id: Date.now(),
          idosoId: data.idosoId,
          mesReferencia: data.mesReferencia,
          anoReferencia: data.anoReferencia,
          valorPago,
          dataPagamento: data.dataPagamento ? new Date(data.dataPagamento).toISOString().split('T')[0] : null,
          nfse: data.nfse,
          pagador: data.pagador,
          formaPagamento: data.formaPagamento,
          status,
          valorDoacaoCalculado: valorDoacao,
          // Novos campos de cálculo de benefício
          valorBeneficio,
          percentualBeneficio,
          totalBeneficioAplicado,
          observacoes: data.observacoes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        pagamentosMock.push(novoPagamento);
        savePagamentosMock(pagamentosMock);
        console.log('✅ Mock API: Pagamento criado:', novoPagamento);
        return novoPagamento;
      }
    },
    getByIdoso: async (idosoId: number, ano: number) => {
      console.log('💰 Mock API: Buscando pagamentos do idoso ID:', idosoId, 'ano:', ano);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const pagamentosMock = getPagamentosMock();
      
      // Filtrar pagamentos do idoso para o ano especificado
      const pagamentosIdoso = pagamentosMock.filter((p: any) => 
        p.idosoId === idosoId && p.anoReferencia === ano
      );
      
      console.log('✅ Mock API: Pagamentos do idoso encontrados:', pagamentosIdoso.length);
      return pagamentosIdoso;
    },

    getPagadoresByIdoso: async (idosoId: number) => {
      console.log('👥 Mock API: Buscando pagadores do idoso ID:', idosoId);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const pagamentosMock = getPagamentosMock();
      
      // Filtrar pagamentos do idoso com pagador
      const pagamentosComPagador = pagamentosMock.filter((p: any) => 
        p.idosoId === idosoId && p.pagador
      );
      
      // Extrair pagadores únicos
      const pagadoresMap = new Map();
      pagamentosComPagador.forEach((p: any) => {
        if (p.pagador && !pagadoresMap.has(p.pagador)) {
          pagadoresMap.set(p.pagador, {
            nome: p.pagador,
            formaPagamento: p.formaPagamento,
            ultimoValor: p.valorPago,
            ultimaData: p.dataPagamento,
            ultimoMes: p.mesReferencia,
            ultimoAno: p.anoReferencia,
          });
        }
      });
      
      const pagadores = Array.from(pagadoresMap.values());
      console.log('✅ Mock API: Pagadores encontrados:', pagadores.length);
      return pagadores;
    },
    getById: async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { id, valorPago: 2500, status: 'PAGO' };
    },
    getAllWithIdosos: async () => {
      console.log('🔍 Mock API: Buscando todos os pagamentos com idosos');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const pagamentos = getPagamentosMock();
      const idosos = getIdososMock();
      const responsaveis = getResponsaveisMock();
      const notasFiscais = getNotasFiscaisMock();
      
      const pagamentosComIdosos = pagamentos.map((pagamento: any) => {
        const idoso = idosos.find((i: any) => i.id === pagamento.idosoId);
        const responsavel = idoso ? responsaveis.find((r: any) => r.id === idoso.responsavelId) : null;
        
        // Buscar Nota Fiscal correspondente para obter dataPrestacao
        const notaFiscal = notasFiscais.find((nf: any) => nf.pagamentoId === pagamento.id);
        
        console.log('🔍 Mock API: Pagamento ID:', pagamento.id, 'mesReferencia:', pagamento.mesReferencia, 'anoReferencia:', pagamento.anoReferencia);
        if (notaFiscal) {
          console.log('📄 Mock API: Nota Fiscal encontrada - mesReferencia:', notaFiscal.mesReferencia, 'anoReferencia:', notaFiscal.anoReferencia);
        }
        
        return {
          ...pagamento,
          dataPrestacao: notaFiscal?.dataPrestacao, // ✅ Incluir dataPrestacao da Nota Fiscal
          idoso: idoso ? {
            ...idoso,
            responsavel: responsavel
          } : null
        };
      });
      
      console.log('✅ Mock API: Pagamentos com idosos encontrados:', pagamentosComIdosos.length);
      return pagamentosComIdosos;
    },
  },

  // Recibos
  recibos: {
    gerarDoacao: async (pagamentoId: number) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular geração de recibo
      const nomeArquivo = `RECIBO_DOACAO_${pagamentoId}_${Date.now()}.docx`;
      const caminhoCompleto = `C:\\Nestjs\\PWALarIdosos\\RECIBOS DOAÇÃO LAR\\${nomeArquivo}`;
      
      console.log('📄 Recibo de doação gerado:', caminhoCompleto);
      
      return {
        sucesso: true,
        caminho: caminhoCompleto,
        nomeArquivo,
      };
    },
    abrirPasta: async (tipo: 'doacao' | 'mensalidade') => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const caminho = tipo === 'doacao' 
        ? 'C:\\Nestjs\\PWALarIdosos\\RECIBOS DOAÇÃO LAR'
        : 'C:\\Nestjs\\PWALarIdosos\\RECIBOS';
      
      console.log('📁 Abrindo pasta:', caminho);
      
      return { sucesso: true, caminho };
    },
  },

  // Configurações
  configuracoes: {
    list: async () => {
      console.log('⚙️ Mock API: Listando configurações...');
      await new Promise(resolve => setTimeout(resolve, 300));
      const configs = [
        {
          id: 1,
          chave: 'caminho_recibos_doacao',
          valor: 'C:\\Nestjs\\PWALarIdosos\\RECIBOS DOAÇÃO LAR',
          descricao: 'Pasta de rede para salvar recibos de doação',
        },
        {
          id: 2,
          chave: 'nome_instituicao',
          valor: 'Associação Filhas de São Camilo',
          descricao: 'Nome da instituição',
        },
        {
          id: 3,
          chave: 'cnpj_instituicao',
          valor: 'XX.XXX.XXX/XXXX-XX',
          descricao: 'CNPJ da instituição',
        },
        {
          id: 4,
          chave: 'endereco_instituicao',
          valor: 'Rua das Flores, 123 - Matelândia/PR',
          descricao: 'Endereço da instituição',
        },
        {
          id: 5,
          chave: 'caminho_backup',
          valor: 'C:\\Backups\\LarIdosos',
          descricao: 'Pasta padrão para backups',
        },
        {
          id: 6,
          chave: 'frequencia_backup',
          valor: 'semanal',
          descricao: 'Frequência de backup automático',
        },
      ];
      console.log('✅ Mock API: Configurações retornadas:', configs);
      return configs;
    },
    get: async (chave: string) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        id: 1,
        chave,
        valor: 'Valor de teste',
        descricao: 'Configuração de teste',
      };
    },
    set: async (chave: string, valor: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: Date.now(), chave, valor };
    },
    update: async (id: number, data: any) => {
      console.log('📝 Mock API: Atualizando configuração ID:', id, 'com dados:', data);
      await new Promise(resolve => setTimeout(resolve, 300));
      const configAtualizada = { id, ...data };
      console.log('✅ Mock API: Configuração atualizada:', configAtualizada);
      return configAtualizada;
    },
  },
  notasFiscais: {
    list: async (filters?: { idosoId?: number; status?: string }) => {
      console.log('📋 Mock API: Listando notas fiscais...', filters);
      await new Promise(resolve => setTimeout(resolve, 300));
      const notas = getNotasFiscaisMock();
      
      let filteredNotas = notas;
      
      if (filters?.idosoId) {
        filteredNotas = filteredNotas.filter((n: any) => n.idosoId === filters.idosoId);
      }
      
      if (filters?.status) {
        filteredNotas = filteredNotas.filter((n: any) => n.status === filters.status);
      }
      
      console.log('✅ Mock API: Notas fiscais retornadas:', filteredNotas.length);
      return filteredNotas;
    },
    create: async (data: any) => {
      console.log('➕ Mock API: Criando nota fiscal:', data);
      console.log('📅 Mock API: dataPrestacao recebida:', data.dataPrestacao);
      console.log('📅 Mock API: dataEmissao recebida:', data.dataEmissao);
      console.log('📅 Mock API: mesReferencia recebido:', data.mesReferencia);
      console.log('📅 Mock API: anoReferencia recebido:', data.anoReferencia);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const notas = getNotasFiscaisMock();
      let idosos = getIdososMock();
      let responsaveis = getResponsaveisMock();
      
      let idosoId = data.idosoId;
        let idoso = idosos.find((i: any) => i.id === idosoId);
      
      // Se não tem idosoId, buscar ou criar idoso automaticamente
      if (!idosoId && data.nomePessoa) {
        // Primeiro, buscar idoso existente com nome EXATO (case-insensitive)
        idoso = idosos.find((i: any) => 
          i.nome.toLowerCase() === data.nomePessoa.toLowerCase()
        );
        
        if (idoso) {
          idosoId = idoso.id;
          console.log('👤 Mock API: Idoso encontrado com nome exato:', idoso.nome);
        } else {
          // Se não encontrou com nome exato, buscar com contains (mais flexível)
          idoso = idosos.find((i: any) => 
            i.nome.toLowerCase().includes(data.nomePessoa.toLowerCase())
          );
          
          if (idoso) {
            idosoId = idoso.id;
            console.log('👤 Mock API: Idoso similar encontrado:', idoso.nome);
          } else {
            // Criar novo idoso
            let responsavelId = null;
          
          if (data.responsavelNome) {
            // Buscar responsável existente
            let responsavel = responsaveis.find((r: any) => 
              r.nome.toLowerCase().includes(data.responsavelNome.toLowerCase())
            );
            
            if (responsavel) {
              responsavelId = responsavel.id;
            } else {
              // Criar novo responsável
              const novoResponsavel = {
                id: responsaveis.length + 1,
                nome: data.responsavelNome,
                cpf: data.responsavelCpf || '',
                contatoTelefone: '',
                contatoEmail: '',
                endereco: '',
                ativo: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              responsaveis.push(novoResponsavel);
              saveResponsaveisMock(responsaveis);
              responsavelId = novoResponsavel.id;
            }
          }
          
          // Criar novo idoso
          const novoIdoso = {
            id: idosos.length + 1,
            nome: data.nomePessoa,
            cpf: '',
            dataNascimento: null,
            responsavelId: responsavelId,
            valorMensalidadeBase: 2500,
            tipo: 'REGULAR',
            observacoes: 'Idoso criado automaticamente via NFSE',
            ativo: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
            idosos.push(novoIdoso);
            saveIdososMock(idosos);
            idosoId = novoIdoso.id;
            idoso = novoIdoso;
            console.log('👤 Mock API: Novo idoso criado:', novoIdoso.nome);
          }
        }
      }
      
      const responsavel = idoso ? responsaveis.find((r: any) => r.id === idoso.responsavelId) : null;
      
      const novaNota = {
        id: Date.now(),
        ...data,
        idosoId: idosoId,
        // Converter datas brasileiras para Date objects
        dataPrestacao: data.dataPrestacao ? parseBrazilianDate(data.dataPrestacao) : null,
        dataEmissao: data.dataEmissao ? parseBrazilianDate(data.dataEmissao) : null,
        idoso: idoso ? {
          ...idoso,
          responsavel: responsavel
        } : null,
        status: data.status || 'RASCUNHO',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      notas.push(novaNota);
      saveNotasFiscaisMock(notas);
      console.log('✅ Mock API: Nota fiscal criada:', novaNota);
      return novaNota;
    },
    update: async (id: number, data: any) => {
      console.log('📝 Mock API: Atualizando nota fiscal ID:', id, 'com dados:', data);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const notas = getNotasFiscaisMock();
      let idosos = getIdososMock();
      let responsaveis = getResponsaveisMock();
      
      const index = notas.findIndex((nota: any) => nota.id === id);
      if (index !== -1) {
        let idosoId = data.idosoId || notas[index].idosoId;
        let idoso = idosos.find((i: any) => i.id === idosoId);
        
        // Se não tem idosoId, buscar ou criar idoso automaticamente
        if (!idosoId && data.nomePessoa) {
          // Primeiro, buscar idoso existente com nome EXATO (case-insensitive)
          idoso = idosos.find((i: any) => 
            i.nome.toLowerCase() === data.nomePessoa.toLowerCase()
          );
          
          if (idoso) {
            idosoId = idoso.id;
            console.log('👤 Mock API: Idoso encontrado com nome exato na atualização:', idoso.nome);
          } else {
            // Se não encontrou com nome exato, buscar com contains (mais flexível)
            idoso = idosos.find((i: any) => 
              i.nome.toLowerCase().includes(data.nomePessoa.toLowerCase())
            );
            
            if (idoso) {
              idosoId = idoso.id;
              console.log('👤 Mock API: Idoso similar encontrado na atualização:', idoso.nome);
            } else {
            // Criar novo idoso
            let responsavelId = null;
            
            if (data.responsavelNome) {
              // Buscar responsável existente
              let responsavel = responsaveis.find((r: any) => 
                r.nome.toLowerCase().includes(data.responsavelNome.toLowerCase())
              );
              
              if (responsavel) {
                responsavelId = responsavel.id;
              } else {
                // Criar novo responsável
                const novoResponsavel = {
                  id: responsaveis.length + 1,
                  nome: data.responsavelNome,
                  cpf: data.responsavelCpf || '',
                  contatoTelefone: '',
                  contatoEmail: '',
                  endereco: '',
                  ativo: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                responsaveis.push(novoResponsavel);
                saveResponsaveisMock(responsaveis);
                responsavelId = novoResponsavel.id;
              }
            }
            
            // Criar novo idoso
            const novoIdoso = {
              id: idosos.length + 1,
              nome: data.nomePessoa,
              cpf: '',
              dataNascimento: null,
              responsavelId: responsavelId,
              valorMensalidadeBase: 2500,
              tipo: 'REGULAR',
              observacoes: 'Idoso criado automaticamente via NFSE',
              ativo: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
              idosos.push(novoIdoso);
              saveIdososMock(idosos);
              idosoId = novoIdoso.id;
              idoso = novoIdoso;
              console.log('👤 Mock API: Novo idoso criado na atualização:', novoIdoso.nome);
            }
          }
        }
        
        const responsavel = idoso ? responsaveis.find((r: any) => r.id === idoso.responsavelId) : null;
        
        notas[index] = { 
          ...notas[index], 
          ...data,
          idosoId: idosoId,
          // Converter datas brasileiras para Date objects
          dataPrestacao: data.dataPrestacao ? parseBrazilianDate(data.dataPrestacao) : notas[index].dataPrestacao,
          dataEmissao: data.dataEmissao ? parseBrazilianDate(data.dataEmissao) : notas[index].dataEmissao,
          idoso: idoso ? {
            ...idoso,
            responsavel: responsavel
          } : notas[index].idoso,
          updatedAt: new Date(),
        };
        
        saveNotasFiscaisMock(notas);
        console.log('✅ Mock API: Nota fiscal atualizada:', notas[index]);
        return notas[index];
      }
      throw new Error('Nota fiscal não encontrada');
    },
      cancel: async (id: number) => {
        console.log('🚫 Mock API: Cancelando nota fiscal ID:', id);
        await new Promise(resolve => setTimeout(resolve, 300));
        const notas = getNotasFiscaisMock();
        const index = notas.findIndex((nota: any) => nota.id === id);
        if (index !== -1) {
          notas[index].status = 'CANCELADA';
          notas[index].updatedAt = new Date();
          saveNotasFiscaisMock(notas);
          console.log('✅ Mock API: Nota fiscal cancelada');
          return notas[index];
        }
        throw new Error('Nota fiscal não encontrada');
      },

      delete: async (id: number) => {
        console.log('🗑️ Mock API: Excluindo nota fiscal ID:', id);
        await new Promise(resolve => setTimeout(resolve, 300));
        const notas = getNotasFiscaisMock();
        const index = notas.findIndex((nota: any) => nota.id === id);
        if (index !== -1) {
          const notaRemovida = notas.splice(index, 1)[0];
          saveNotasFiscaisMock(notas);
          console.log('✅ Mock API: Nota fiscal excluída');
          return notaRemovida;
        }
        throw new Error('Nota fiscal não encontrada');
      },
    getById: async (id: number) => {
      console.log('🔍 Mock API: Buscando nota fiscal ID:', id);
      await new Promise(resolve => setTimeout(resolve, 200));
      const notas = getNotasFiscaisMock();
      const nota = notas.find((nota: any) => nota.id === id);
      console.log('✅ Mock API: Nota fiscal encontrada:', nota);
      return nota;
    },
    getByIdoso: async (idosoId: number) => {
      console.log('🔍 Mock API: Buscando notas fiscais do idoso ID:', idosoId);
      await new Promise(resolve => setTimeout(resolve, 300));
      const notas = getNotasFiscaisMock();
      return notas.filter((n: any) => n.idosoId === idosoId);
    },
    getByPagamento: async (pagamentoId: number) => {
      console.log('🔍 Mock API: Buscando nota fiscal por pagamento ID:', pagamentoId);
      await new Promise(resolve => setTimeout(resolve, 200));
      const notas = getNotasFiscaisMock();
      return notas.find((n: any) => n.pagamentoId === pagamentoId) || null;
    }
  },
  backup: {
    gerarCSV: async () => {
      logInfo('MOCK_API', 'Iniciando geração de backup CSV');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Buscar todos os dados
        const [responsaveis, idosos, pagamentos, configuracoes, notasFiscais] = await Promise.all([
          getResponsaveisMock(),
          getIdososMock(),
          getPagamentosMock(),
          [
            { id: 1, chave: 'nome_instituicao', valor: 'Associação Filhas de São Camilo', descricao: 'Nome da instituição' },
            { id: 2, chave: 'cnpj_instituicao', valor: '61.986.402/0019-20', descricao: 'CNPJ da instituição' },
            { id: 3, chave: 'endereco_instituicao', valor: 'Rua Alfredo Chaves, nº 778', descricao: 'Endereço da instituição' },
            { id: 4, chave: 'telefone_instituicao', valor: '(45)3262-1251', descricao: 'Telefone da instituição' },
            { id: 5, chave: 'email_instituicao', valor: 'larnssaude@gmail.com.br', descricao: 'Email da instituição' },
          ],
          getNotasFiscaisMock()
        ]);

        logInfo('MOCK_API', 'Dados encontrados para backup', {
          responsaveis: responsaveis.length,
          idosos: idosos.length,
          pagamentos: pagamentos.length,
          configuracoes: configuracoes.length,
          notasFiscais: notasFiscais.length
        });

        // Gerar timestamp para nome do arquivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const nomeArquivo = `backup_lar_idosos_${timestamp}.csv`;
        
        // Gerar conteúdo CSV
        let csvContent = '';
        
        // Cabeçalho
        csvContent += 'TIPO,ID,NOME,CPF,TELEFONE,EMAIL,DATA_NASCIMENTO,MENSALIDADE_BASE,TIPO_IDOSO,ATIVO,RESPONSAVEL_ID,RESPONSAVEL_NOME,RESPONSAVEL_CPF,STATUS_PAGAMENTO,VALOR_PAGO,NFSE,PAGADOR,FORMA_PAGAMENTO,DATA_PAGAMENTO,MES_REFERENCIA,ANO_REFERENCIA,VALOR_DOACAO,VALOR_BENEFICIO,PERCENTUAL_BENEFICIO,TOTAL_BENEFICIO_APLICADO,OBSERVACOES,CRIADO_EM,ATUALIZADO_EM\n';
        
        // Responsáveis
        responsaveis.forEach((r: any) => {
          csvContent += `RESPONSAVEL,${r.id},"${r.nome}","${r.cpf}","${r.contatoTelefone || ''}","${r.contatoEmail || ''}",,,,,,,,${r.ativo ? 'ATIVO' : 'INATIVO'},,,,,,,,,,,"${r.createdAt}","${r.updatedAt}"\n`;
        });
        
        // Idosos
        idosos.forEach((i: any) => {
          csvContent += `IDOSO,${i.id},"${i.nome}","${i.cpf || ''}","","","${i.dataNascimento || ''}","${i.valorMensalidadeBase || 0}","${i.tipo || 'REGULAR'}","${i.ativo ? 'ATIVO' : 'INATIVO'}",${i.responsavel?.id || ''},"${i.responsavel?.nome || ''}","${i.responsavel?.cpf || ''}",,,,,,,,,,,"${i.createdAt}","${i.updatedAt}"\n`;
        });
        
        // Pagamentos
        pagamentos.forEach((p: any) => {
          const idoso = idosos.find((i: any) => i.id === p.idosoId);
          
          // Calcular valores de benefício
          const valorBeneficio = idoso?.valorMensalidadeBase || 0;
          const percentualBeneficio = 70; // Percentual padrão
          const totalBeneficioAplicado = valorBeneficio * (percentualBeneficio / 100);
          
          csvContent += `PAGAMENTO,${p.id},"${idoso?.nome || ''}","","","","","","","","","","","${p.status}","${p.valorPago}","${p.nfse || ''}","${p.pagador || ''}","${p.formaPagamento || ''}","${p.dataPagamento || ''}",${p.mesReferencia},${p.anoReferencia},"${p.valorDoacaoCalculado || 0}","${valorBeneficio}","${percentualBeneficio}","${totalBeneficioAplicado}","${p.observacoes || ''}","${p.createdAt}","${p.updatedAt}"\n`;
        });
        
        // Notas Fiscais
        notasFiscais.forEach((n: any) => {
          csvContent += `NOTA_FISCAL,${n.id},"${n.nomePessoa || ''}","","","","","","","","","","","","${n.valor || 0}","${n.numeroNFSE || ''}","","","${n.dataPrestacao || ''}",,,,,,,"${n.discriminacao || ''}","${n.dataUpload}","${n.dataUpload}"\n`;
        });
        
        // Configurações
        configuracoes.forEach(c => {
          csvContent += `CONFIGURACAO,${c.id},"${c.chave}","","","","","","","","","","","","","","","","","","","","","${c.valor}","${c.descricao || ''}","",""\n`;
        });
        
        logInfo('MOCK_API', 'Backup CSV gerado com sucesso', {
          fileName: nomeArquivo,
          totalRecords: csvContent.split('\n').length - 1, // -1 para excluir cabeçalho
          stats: {
            responsaveis: responsaveis.length,
            idosos: idosos.length,
            pagamentos: pagamentos.length,
            configuracoes: configuracoes.length,
            notasFiscais: notasFiscais.length
          }
        });
        
        return {
          fileName: nomeArquivo,
          content: csvContent,
          stats: {
            responsaveis: responsaveis.length,
            idosos: idosos.length,
            pagamentos: pagamentos.length,
            configuracoes: configuracoes.length,
            notasFiscais: notasFiscais.length
          }
        };
      } catch (error) {
        logError('MOCK_API', 'Erro ao gerar backup CSV', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    }
  },

  templates: {
    gerarMensalidade: async (data: any) => {
      console.log('📄 Mock API: Gerando template de mensalidade:', data);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const fileName = `${data.numeroNFSE}_MENSALIDADE_${data.nomeIdoso.replace(/\s+/g, '_')}_${data.mesReferencia.replace('/', '_')}.html`;
      
      // Simular download automático
      try {
        console.log('📄 Mock API: Criando documento para impressão...');
        
        // Converter valor para extenso
        const valorNumerico = parseFloat(data.valorPagamento.toString().replace(',', '.'));
        const valorPorExtenso = extenso(valorNumerico, { mode: 'currency' });
        
        // Buscar tipo do idoso
        const idososMock = getIdososMock();
        const idoso = idososMock.find((i: any) => i.nome === data.nomeIdoso);
        const tipoIdoso = idoso?.tipo || 'REGULAR';
        
        // Adicionar valor por extenso e tipo aos dados
        const dataComExtenso = {
          ...data,
          valorPorExtenso: valorPorExtenso,
          tipoIdoso: tipoIdoso
        };
        
        // Gerar HTML usando template
        const htmlContent = getReciboMensalidadeHtml(dataComExtenso);
        
        // Criar nova janela para impressão
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          // Aguardar carregamento e abrir diálogo de impressão
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              // Fechar janela após impressão
              setTimeout(() => {
                printWindow.close();
              }, 1000);
            }, 500);
          };
        }
        
        // Também criar um arquivo HTML para download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Mock API: Download automático de HTML iniciado:', fileName);
        console.log('💡 Arquivo HTML gerado com sucesso! Nome organizado por NFSE para fácil localização.');
      } catch (error) {
        console.error('❌ Mock API: Erro no download automático:', error);
        
        // Fallback: criar arquivo de texto simples
        try {
          const txtContent = `
RECIBO DE MENSALIDADE

Nome do Idoso: ${data.nomeIdoso}
Data Pagamento: ${data.dataPagamento} R$ ${data.valorPagamento.toFixed(2).replace('.', ',')}   Referencia: ${data.mesReferencia}
Benefício: ${data.beneficio.toFixed(2).replace('.', ',')} X ${data.percentualBeneficio}% = ${data.valorBeneficio.toFixed(2).replace('.', ',')}
Doação: ${data.doacao.toFixed(2).replace('.', ',')}
CPF ${data.cpfIdoso}   Forma pagamento: ${data.formaPagamento}   NFS-e ${data.numeroNFSE}

RESPONSAVEL: ${data.nomeResponsavel}
CPF: ${data.cpfResponsavel}

DETALHES DO CÁLCULO:
- Valor Base do Benefício: R$ ${data.beneficio.toFixed(2).replace('.', ',')}
- Percentual Aplicado: ${data.percentualBeneficio}%
- Total do Benefício: R$ ${data.valorBeneficio.toFixed(2).replace('.', ',')}
- Valor Pago: R$ ${data.valorPagamento.toFixed(2).replace('.', ',')}
- Doação Calculada: R$ ${data.doacao.toFixed(2).replace('.', ',')}
          `.trim();

          const txtFileName = fileName.replace('.docx', '.txt');
          const blob = new Blob([txtContent], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = txtFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          console.log('✅ Mock API: Download de arquivo TXT como fallback:', txtFileName);
        } catch (fallbackError) {
          console.error('❌ Mock API: Erro no fallback:', fallbackError);
        }
      }
      
      return { fileName, path: `C:\\Documentos\\${fileName}` };
    },
    gerarListaIdosos: async (data: any) => {
      console.log('📄 Mock API: Gerando lista de idosos:', data);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const fileName = `LISTA_IDOSOS_${data.mesReferencia.replace('/', '_')}_${data.formato}_${new Date().toISOString().slice(0, 10)}.html`;
      
      // Simular download automático
      try {
        console.log('📄 Mock API: Criando lista para impressão...');
        
        // Buscar dados completos dos idosos e pagamentos
        const idososMock = getIdososMock();
        const pagamentosMock = getPagamentosMock();
        const responsaveisMock = getResponsaveisMock();
        
        // Enriquecer dados dos idosos com informações de pagamento
        const idososCompletos = data.idosos.map((idoso: any) => {
          // Buscar idoso completo no mock
          const idosoCompleto = idososMock.find((i: any) => i.id.toString() === idoso.id);
          
          // Buscar pagamentos do idoso para o mês/ano especificado
          const [mes, ano] = data.mesReferencia.split('/');
          const pagamento = pagamentosMock.find((p: any) => 
            p.idosoId === parseInt(idoso.id) && 
            p.mesReferencia === parseInt(mes) && 
            p.anoReferencia === parseInt(ano)
          );
          
          // Buscar responsável completo
          const responsavelCompleto = responsaveisMock.find((r: any) => r.id === idosoCompleto?.responsavel?.id);
          
          return {
            ...idoso,
            // Dados do idoso
            cpf: idosoCompleto?.cpf || '',
            tipo: idosoCompleto?.tipo || 'REGULAR',
            valorMensalidadeBase: idosoCompleto?.valorMensalidadeBase || 0,
            ativo: idosoCompleto?.ativo !== false,
            // Dados do responsável
            responsavel: responsavelCompleto?.nome || idoso.responsavel?.nome || '',
            cpfResponsavel: responsavelCompleto?.cpf || idoso.responsavel?.cpf || '',
            // Dados do pagamento
            dataPagamento: pagamento?.dataPagamento ? new Date(pagamento.dataPagamento).toLocaleDateString('pt-BR') : '',
            valorPagamento: pagamento?.valorPago ? pagamento.valorPago.toFixed(2).replace('.', ',') : '0,00',
            numeroNFSE: pagamento?.nfse || '',
            formaPagamento: pagamento?.formaPagamento || '',
            pagador: pagamento?.pagador || '',
            status: pagamento?.status || 'PENDENTE',
            valorDoacao: pagamento?.valorDoacaoCalculado ? pagamento.valorDoacaoCalculado.toFixed(2).replace('.', ',') : '0,00',
            // Cálculos - usar dados estruturados do pagamento se disponíveis
            beneficio: pagamento?.valorBeneficio ? pagamento.valorBeneficio.toFixed(2).replace('.', ',') : (idosoCompleto?.valorMensalidadeBase ? idosoCompleto.valorMensalidadeBase.toFixed(2).replace('.', ',') : '0,00'),
            percentualBeneficio: pagamento?.percentualBeneficio || 70,
            valorBeneficio: pagamento?.totalBeneficioAplicado ? pagamento.totalBeneficioAplicado.toFixed(2).replace('.', ',') : (idosoCompleto?.valorMensalidadeBase ? (idosoCompleto.valorMensalidadeBase * 0.7).toFixed(2).replace('.', ',') : '0,00'),
            doacao: pagamento?.valorDoacaoCalculado ? pagamento.valorDoacaoCalculado.toFixed(2).replace('.', ',') : '0,00'
          };
        });
        
        // Atualizar dados com informações completas
        const dataCompleta = {
          ...data,
          idosos: idososCompletos
        };
        
        // Gerar HTML usando template
        const htmlContent = getListaIdososHtml(dataCompleta);
        
        // Criar nova janela para impressão
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          // Aguardar carregamento e abrir diálogo de impressão
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              // Fechar janela após impressão
              setTimeout(() => {
                printWindow.close();
              }, 1000);
            }, 500);
          };
        }
        
        // Também criar um arquivo HTML para download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Mock API: Download automático da lista HTML iniciado:', fileName);
        console.log('💡 Arquivo HTML gerado com sucesso! Nome organizado por data para fácil localização.');
      } catch (error) {
        console.error('❌ Mock API: Erro no download automático da lista:', error);
        
        // Fallback: criar arquivo de texto simples
        try {
          const txtContent = `
LISTA DE IDOSOS - ${data.mesReferencia}
Formato: ${data.formato}

${data.idosos?.map((idoso: any) => `
Nome do Idoso: ${idoso.nome}
Data Pagamento: ${idoso.dataPagamento || 'N/A'} R$ ${idoso.valorPagamento || '0,00'}   Referencia: ${data.mesReferencia}
Benefício: ${idoso.beneficio || '0,00'} X ${idoso.percentualBeneficio || 70}% = ${idoso.valorBeneficio || '0,00'}
Doação: ${idoso.doacao || '0,00'}
CPF ${idoso.cpf || 'N/A'}   Forma pagamento: ${idoso.formaPagamento || 'N/A'}   NFS-e ${idoso.numeroNFSE || 'N/A'}
RESPONSAVEL: ${idoso.responsavel || 'N/A'}   CPF ${idoso.cpfResponsavel || 'N/A'}
          `).join('\n') || 'Nenhum idoso encontrado.'}
          `.trim();

          const txtFileName = fileName.replace('.docx', '.txt');
          const blob = new Blob([txtContent], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = txtFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          console.log('✅ Mock API: Download de arquivo TXT como fallback:', txtFileName);
        } catch (fallbackError) {
          console.error('❌ Mock API: Erro no fallback da lista:', fallbackError);
        }
      }
      
      return { fileName, path: `C:\\Documentos\\${fileName}` };
    }
  }
};

// Mock do window.electronAPI para desenvolvimento
// Removido declare global para evitar conflito de tipos com electron.d.ts

// Inicializar mock no window
if (typeof window !== 'undefined') {
  console.log('🚀 Mock API inicializado!');
  window.electronAPI = mockElectronAPI as any; // Cast para evitar erro de tipo
  window.systemInfo = {
    platform: 'win32',
    version: { node: '18.0.0' },
  };
  console.log('✅ window.electronAPI configurado:', window.electronAPI);
}
