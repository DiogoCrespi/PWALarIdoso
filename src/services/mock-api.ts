// Mock da API Electron para desenvolvimento
// Este arquivo simula as funções da API real

export const mockElectronAPI = {
  // Responsáveis
  responsaveis: {
    list: async () => {
      console.log('📋 Mock API: Listando responsáveis...');
      await new Promise(resolve => setTimeout(resolve, 300));
      const responsaveis = [
        {
          id: 1,
          nome: 'Responsável de Teste',
          cpf: '000.000.000-00',
          contatoTelefone: '(45) 99999-9999',
          contatoEmail: 'teste@email.com',
          idosos: [
            { id: 1, nome: 'Amélia Sant\'Ana', ativo: true }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          nome: 'Maria Silva',
          cpf: '333.333.333-33',
          contatoTelefone: '(45) 88888-8888',
          contatoEmail: 'maria@email.com',
          idosos: [
            { id: 2, nome: 'João Silva', ativo: true }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      console.log('✅ Mock API: Responsáveis retornados:', responsaveis);
      return responsaveis;
    },
    create: async (data: any) => {
      console.log('➕ Mock API: Criando responsável:', data);
      await new Promise(resolve => setTimeout(resolve, 400));
      const novoResponsavel = { 
        id: Date.now(), 
        ...data,
        idosos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      console.log('✅ Mock API: Responsável criado:', novoResponsavel);
      return novoResponsavel;
    },
    update: async (id: number, data: any) => {
      console.log('📝 Mock API: Atualizando responsável ID:', id, 'com dados:', data);
      await new Promise(resolve => setTimeout(resolve, 400));
      const responsavelAtualizado = { 
        id, 
        ...data,
        updatedAt: new Date(),
      };
      console.log('✅ Mock API: Responsável atualizado:', responsavelAtualizado);
      return responsavelAtualizado;
    },
    delete: async (id: number) => {
      console.log('🗑️ Mock API: Excluindo responsável ID:', id);
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('✅ Mock API: Responsável excluído');
      return { success: true };
    },
  },

  // Idosos
  idosos: {
    list: async () => {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        {
          id: 1,
          nome: 'Amélia Sant\'Ana',
          cpf: '111.111.111-11',
          dataNascimento: new Date('1940-01-01'),
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          nome: 'João Silva',
          cpf: '222.222.222-22',
          dataNascimento: new Date('1935-05-15'),
          responsavelId: 2,
          responsavel: {
            id: 2,
            nome: 'Maria Silva',
            cpf: '333.333.333-33',
            contatoTelefone: '(45) 88888-8888',
            contatoEmail: 'maria@email.com',
          },
          valorMensalidadeBase: 2800.00,
          ativo: true,
          observacoes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    },
    create: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: Date.now(), ...data };
    },
    update: async (id: number, data: any) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id, ...data };
    },
    delete: async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id, ativo: false };
    },
    getById: async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        id,
        nome: 'Idoso Teste',
        cpf: '111.111.111-11',
        valorMensalidadeBase: 2500.00,
      };
    },
  },

  // Responsáveis
  responsaveis: {
    list: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return [
        {
          id: 1,
          nome: 'Responsável de Teste',
          cpf: '000.000.000-00',
          contatoTelefone: '(45) 99999-9999',
          contatoEmail: 'teste@email.com',
          idosos: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    },
    create: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: Date.now(), ...data };
    },
    update: async (id: number, data: any) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id, ...data };
    },
    delete: async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { sucesso: true };
    },
    getById: async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        id,
        nome: 'Responsável Teste',
        cpf: '000.000.000-00',
      };
    },
  },

  // Dashboard
  dashboard: {
    get: async (ano: number) => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const idosos = [
        {
          id: 1,
          nome: 'Amélia Sant\'Ana',
          cpf: '111.111.111-11',
          responsavel: {
            id: 1,
            nome: 'Responsável de Teste',
            cpf: '000.000.000-00',
          },
        },
        {
          id: 2,
          nome: 'João Silva',
          cpf: '222.222.222-22',
          responsavel: {
            id: 2,
            nome: 'Maria Silva',
            cpf: '333.333.333-33',
          },
        },
      ];

      // Simular alguns pagamentos
      const pagamentos: Record<number, Record<number, any>> = {
        1: {
          9: { id: 1, status: 'PAGO', nfse: '1491', valorPago: 2500, dataPagamento: new Date() },
          10: { id: 2, status: 'PARCIAL', nfse: '1492', valorPago: 1500, dataPagamento: new Date() },
          11: { id: 3, status: 'PENDENTE', nfse: null, valorPago: 0, dataPagamento: null },
        },
        2: {
          9: { id: 4, status: 'PAGO', nfse: '1493', valorPago: 2800, dataPagamento: new Date() },
          10: { id: 5, status: 'PAGO', nfse: '1494', valorPago: 2800, dataPagamento: new Date() },
          11: { id: 6, status: 'PENDENTE', nfse: null, valorPago: 0, dataPagamento: null },
        },
      };

      return { idosos, pagamentos };
    },
  },

  // Pagamentos
  pagamentos: {
    upsert: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Simular cálculo de status
      const valorBase = 2500; // Valor base do idoso
      const valorPago = data.valorPago || 0;
      let status = 'PENDENTE';
      
      if (valorPago >= valorBase) {
        status = 'PAGO';
      } else if (valorPago > 0) {
        status = 'PARCIAL';
      }
      
      const valorDoacao = Math.max(0, valorPago - valorBase);
      
      return { 
        id: Date.now(), 
        ...data,
        status,
        valorDoacaoCalculado: valorDoacao,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
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
      ];
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
  },
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
  window.electronAPI = mockElectronAPI;
  window.systemInfo = {
    platform: 'win32',
    version: { node: '18.0.0' },
  };
  console.log('✅ window.electronAPI configurado:', window.electronAPI);
}
