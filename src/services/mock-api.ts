// Mock da API Electron para desenvolvimento
// Este arquivo simula as funções da API real
import { getReciboMensalidadeHtml, getListaIdososHtml } from '../templates/recibo.template';
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
  const defaultData = [
    {
      id: '1',
      numeroNFSE: '1497',
      dataPrestacao: '03/10/2025',
      discriminacao: 'Valor referente a participação no custeio da entidade. Referente ao mês de junho de 2025. Conforme PIX Sicredi.',
      mesReferencia: '10/2025',
      valor: 2800.00,
      nomePessoa: 'IVONI LUCIA HANAUER',
      idosoId: '1',
      idosoNome: 'Ana Sangaleti Bonassa',
      responsavelNome: 'Antônio Marcos Bonassa',
      dataUpload: new Date('2025-10-03').toISOString()
    }
  ];
  
  return getFromStorage('notasFiscaisMock', defaultData);
};

const saveNotasFiscaisMock = (data: any[]) => {
  saveToStorage('notasFiscaisMock', data);
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
      ativo: true,
      observacoes: 'Registro de teste',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      nome: 'Maria Silva Santos',
      cpf: '123.456.789-00',
      dataNascimento: '1945-05-15',
      responsavelId: 1,
      responsavel: {
        id: 1,
        nome: 'Responsável de Teste',
        cpf: '000.000.000-00',
        contatoTelefone: '(45) 99999-9999',
        contatoEmail: 'teste@email.com',
      },
      valorMensalidadeBase: 2800.00,
      ativo: true,
      observacoes: 'Teste de cadastro manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  return getFromStorage('idososMock', defaultData);
};

const saveIdososMock = (data: any[]) => {
  saveToStorage('idososMock', data);
};

const getPagamentosMock = () => {
  const defaultData = [
    {
      id: 1,
      idosoId: 1,
      mesReferencia: 9,
      anoReferencia: 2025,
      valorPago: 2500,
      dataPagamento: '2025-09-15',
      nfse: '1491',
      status: 'PAGO',
      valorDoacaoCalculado: 0,
      observacoes: 'Pagamento integral de setembro',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      idosoId: 1,
      mesReferencia: 10,
      anoReferencia: 2025,
      valorPago: 1500,
      dataPagamento: '2025-10-10',
      nfse: '1492',
      status: 'PARCIAL',
      valorDoacaoCalculado: 0,
      observacoes: 'Pagamento parcial de outubro',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      idosoId: 1,
      mesReferencia: 11,
      anoReferencia: 2025,
      valorPago: 0,
      dataPagamento: null,
      nfse: null,
      status: 'PENDENTE',
      valorDoacaoCalculado: 0,
      observacoes: 'Pagamento pendente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  return getFromStorage('pagamentosMock', defaultData);
};

const savePagamentosMock = (data: any[]) => {
  saveToStorage('pagamentosMock', data);
};

export const mockElectronAPI = {

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
      const responsavel = responsaveisMock.find(r => r.id === data.responsavelId);
      
      const novoIdoso = {
        id: Date.now(),
        ...data,
        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento).toISOString().split('T')[0] : null,
        responsavel: responsavel || {
          id: data.responsavelId,
          nome: 'Responsável não encontrado',
          cpf: '000.000.000-00',
        },
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
      const index = idososMock.findIndex(i => i.id === id);
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
      const index = idososMock.findIndex(i => i.id === id);
      if (index !== -1) {
        idososMock[index].ativo = false;
        idososMock[index].updatedAt = new Date().toISOString();
        saveIdososMock(idososMock);
        console.log('✅ Mock API: Idoso desativado');
        return idososMock[index];
      }
      throw new Error('Idoso não encontrado');
    },
    getById: async (id: number) => {
      console.log('🔍 Mock API: Buscando idoso ID:', id);
      await new Promise(resolve => setTimeout(resolve, 200));
      const idososMock = getIdososMock();
      const idoso = idososMock.find(i => i.id === id);
      if (!idoso) {
        throw new Error('Idoso não encontrado');
      }
      return idoso;
    },
  },

  // Responsáveis
  responsaveis: {
    list: async () => {
      console.log('📋 Mock API: Listando responsáveis...');
      await new Promise(resolve => setTimeout(resolve, 400));
      const responsaveisMock = getResponsaveisMock();
      console.log('✅ Mock API: Responsáveis retornados:', responsaveisMock);
      return responsaveisMock;
    },
    create: async (data: any) => {
      console.log('➕ Mock API: Criando responsável:', data);
      await new Promise(resolve => setTimeout(resolve, 400));
      const responsaveisMock = getResponsaveisMock();
      const novoResponsavel = { 
        id: Date.now(), 
        ...data,
        idosos: [],
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
      const index = responsaveisMock.findIndex(r => r.id === id);
      if (index !== -1) {
        responsaveisMock[index] = { ...responsaveisMock[index], ...data, updatedAt: new Date().toISOString() };
        saveResponsaveisMock(responsaveisMock);
        console.log('✅ Mock API: Responsável atualizado:', responsaveisMock[index]);
        return responsaveisMock[index];
      }
      throw new Error('Responsável não encontrado');
    },
    delete: async (id: number) => {
      console.log('🗑️ Mock API: Excluindo responsável ID:', id);
      await new Promise(resolve => setTimeout(resolve, 300));
      const responsaveisMock = getResponsaveisMock();
      const index = responsaveisMock.findIndex(r => r.id === id);
      if (index !== -1) {
        const responsavelDeletado = responsaveisMock[index];
        responsaveisMock.splice(index, 1);
        saveResponsaveisMock(responsaveisMock);
        console.log('✅ Mock API: Responsável excluído');
        return responsavelDeletado; // Retornar o objeto deletado
      }
      throw new Error('Responsável não encontrado');
    },
    getById: async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const responsaveisMock = getResponsaveisMock();
      const responsavel = responsaveisMock.find(r => r.id === id);
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
      const idosos = idososMock.map(idoso => ({
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
      const pagamentosAno = pagamentosMock.filter(p => p.anoReferencia === ano);
      
      // Organizar pagamentos por idoso e mês
      pagamentosAno.forEach(pagamento => {
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
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const idososMock = getIdososMock();
      const pagamentosMock = getPagamentosMock();
      
      // Buscar idoso para calcular status
      const idoso = idososMock.find(i => i.id === data.idosoId);
      const valorBase = idoso?.valorMensalidadeBase || 2500;
      const valorPago = data.valorPago || 0;
      let status = 'PENDENTE';
      
      if (valorPago >= valorBase) {
        status = 'PAGO';
      } else if (valorPago > 0) {
        status = 'PARCIAL';
      }
      
      const valorDoacao = Math.max(0, valorPago - valorBase);
      
      // Verificar se já existe pagamento para este idoso/mês/ano
      const pagamentoExistente = pagamentosMock.find(p => 
        p.idosoId === data.idosoId && 
        p.mesReferencia === data.mesReferencia && 
        p.anoReferencia === data.anoReferencia
      );
      
      if (pagamentoExistente) {
        // Atualizar pagamento existente
        pagamentoExistente.valorPago = valorPago;
        pagamentoExistente.dataPagamento = data.dataPagamento ? new Date(data.dataPagamento).toISOString().split('T')[0] : null;
        pagamentoExistente.nfse = data.nfse;
        pagamentoExistente.status = status;
        pagamentoExistente.valorDoacaoCalculado = valorDoacao;
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
          status,
          valorDoacaoCalculado: valorDoacao,
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
      await new Promise(resolve => setTimeout(resolve, 300));
      return [];
    },
    getById: async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { id, valorPago: 2500, status: 'PAGO' };
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
    list: async () => {
      console.log('📋 Mock API: Listando notas fiscais...');
      await new Promise(resolve => setTimeout(resolve, 300));
      const notas = getNotasFiscaisMock();
      console.log('✅ Mock API: Notas fiscais retornadas:', notas);
      return notas;
    },
    create: async (data: any) => {
      console.log('➕ Mock API: Criando nota fiscal:', data);
      await new Promise(resolve => setTimeout(resolve, 400));
      const notas = getNotasFiscaisMock();
      const novaNota = {
        id: Date.now().toString(),
        ...data,
        dataUpload: new Date().toISOString()
      };
      notas.push(novaNota);
      saveNotasFiscaisMock(notas);
      console.log('✅ Mock API: Nota fiscal criada:', novaNota);
      return novaNota;
    },
    update: async (id: string, data: any) => {
      console.log('📝 Mock API: Atualizando nota fiscal ID:', id, 'com dados:', data);
      await new Promise(resolve => setTimeout(resolve, 400));
      const notas = getNotasFiscaisMock();
      const index = notas.findIndex(nota => nota.id === id);
      if (index !== -1) {
        notas[index] = { ...notas[index], ...data };
        saveNotasFiscaisMock(notas);
        console.log('✅ Mock API: Nota fiscal atualizada:', notas[index]);
        return notas[index];
      }
      throw new Error('Nota fiscal não encontrada');
    },
    delete: async (id: string) => {
      console.log('🗑️ Mock API: Excluindo nota fiscal ID:', id);
      await new Promise(resolve => setTimeout(resolve, 300));
      const notas = getNotasFiscaisMock();
      const notasFiltradas = notas.filter(nota => nota.id !== id);
      saveNotasFiscaisMock(notasFiltradas);
      console.log('✅ Mock API: Nota fiscal excluída');
      return true;
    },
    getById: async (id: string) => {
      console.log('🔍 Mock API: Buscando nota fiscal ID:', id);
      await new Promise(resolve => setTimeout(resolve, 200));
      const notas = getNotasFiscaisMock();
      const nota = notas.find(nota => nota.id === id);
      console.log('✅ Mock API: Nota fiscal encontrada:', nota);
      return nota;
    }
  },
  templates: {
    gerarMensalidade: async (data: any) => {
      console.log('📄 Mock API: Gerando template de mensalidade:', data);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const fileName = `NFSE_${data.numeroNFSE}_MENSALIDADE_${data.nomeIdoso.replace(/\s+/g, '_')}_${data.mesReferencia.replace('/', '_')}.html`;
      
      // Simular download automático
      try {
        console.log('📄 Mock API: Criando documento para impressão...');
        
        // Converter valor para extenso
        const valorNumerico = parseFloat(data.valorPagamento.toString().replace(',', '.'));
        const valorPorExtenso = extenso(valorNumerico, { mode: 'currency' });
        
        // Adicionar valor por extenso aos dados
        const dataComExtenso = {
          ...data,
          valorPorExtenso: valorPorExtenso
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
        
        // Gerar HTML usando template
        const htmlContent = getListaIdososHtml(data);
        
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
declare global {
  interface Window {
    electronAPI: typeof mockElectronAPI;
    systemInfo: {
      platform: string;
      version: any;
    };
  }
}

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
