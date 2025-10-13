// Serviço de API que detecta se está rodando no Electron ou navegador
import { mockElectronAPI } from './mock-api';

// Função para detectar se está rodando no Electron
function isElectron(): boolean {
  return !!(window && window.electronAPI);
}

// API unificada que usa Electron quando disponível, senão usa mock
export const api = {
  // Responsáveis
  responsaveis: {
    list: async () => {
      if (isElectron()) {
        console.log('🔌 Usando API do Electron (banco real)');
        return await window.electronAPI.responsaveis.list();
      } else {
        console.log('🎭 Usando Mock API (desenvolvimento)');
        return await mockElectronAPI.responsaveis.list();
      }
    },

    create: async (data: any) => {
      if (isElectron()) {
        console.log('🔌 Criando no banco real via Electron');
        return await window.electronAPI.responsaveis.create(data);
      } else {
        console.log('🎭 Criando no mock (desenvolvimento)');
        return await mockElectronAPI.responsaveis.create(data);
      }
    },

    update: async (id: number, data: any) => {
      if (isElectron()) {
        console.log('🔌 Atualizando no banco real via Electron');
        return await window.electronAPI.responsaveis.update(id, data);
      } else {
        console.log('🎭 Atualizando no mock (desenvolvimento)');
        return await mockElectronAPI.responsaveis.update(id, data);
      }
    },

    delete: async (id: number) => {
      if (isElectron()) {
        console.log('🔌 Excluindo do banco real via Electron');
        return await window.electronAPI.responsaveis.delete(id);
      } else {
        console.log('🎭 Excluindo do mock (desenvolvimento)');
        return await mockElectronAPI.responsaveis.delete(id);
      }
    },

    getById: async (id: number) => {
      if (isElectron()) {
        return await window.electronAPI.responsaveis.getById(id);
      } else {
        return await mockElectronAPI.responsaveis.getById(id);
      }
    },
  },

  // Idosos
  idosos: {
    list: async () => {
      if (isElectron()) {
        console.log('🔌 Usando API do Electron (banco real)');
        return await window.electronAPI.idosos.list();
      } else {
        console.log('🎭 Usando Mock API (desenvolvimento)');
        return await mockElectronAPI.idosos.list();
      }
    },

    create: async (data: any) => {
      if (isElectron()) {
        console.log('🔌 Criando idoso no banco real via Electron');
        return await window.electronAPI.idosos.create(data);
      } else {
        console.log('🎭 Criando idoso no mock (desenvolvimento)');
        return await mockElectronAPI.idosos.create(data);
      }
    },

    update: async (id: number, data: any) => {
      if (isElectron()) {
        console.log('🔌 Atualizando idoso no banco real via Electron');
        return await window.electronAPI.idosos.update(id, data);
      } else {
        console.log('🎭 Atualizando idoso no mock (desenvolvimento)');
        return await mockElectronAPI.idosos.update(id, data);
      }
    },

    delete: async (id: number) => {
      if (isElectron()) {
        console.log('🔌 Excluindo idoso do banco real via Electron');
        return await window.electronAPI.idosos.delete(id);
      } else {
        console.log('🎭 Excluindo idoso do mock (desenvolvimento)');
        return await mockElectronAPI.idosos.delete(id);
      }
    },

    getById: async (id: number) => {
      if (isElectron()) {
        return await window.electronAPI.idosos.getById(id);
      } else {
        return await mockElectronAPI.idosos.getById(id);
      }
    },
  },

  // Dashboard
  dashboard: {
    get: async (ano: number) => {
      if (isElectron()) {
        console.log('🔌 Buscando dados do dashboard no banco real');
        return await window.electronAPI.dashboard.get(ano);
      } else {
        console.log('🎭 Usando dados mock do dashboard');
        return await mockElectronAPI.dashboard.get(ano);
      }
    },
  },

  // Pagamentos
  pagamentos: {
    upsert: async (data: any) => {
      if (isElectron()) {
        console.log('🔌 Salvando pagamento no banco real');
        return await window.electronAPI.pagamentos.upsert(data);
      } else {
        console.log('🎭 Salvando pagamento no mock');
        return await mockElectronAPI.pagamentos.upsert(data);
      }
    },

    getByIdoso: async (idosoId: number, ano: number) => {
      if (isElectron()) {
        return await window.electronAPI.pagamentos.getByIdoso(idosoId, ano);
      } else {
        return await mockElectronAPI.pagamentos.getByIdoso(idosoId, ano);
      }
    },

    getById: async (id: number) => {
      if (isElectron()) {
        return await window.electronAPI.pagamentos.getById(id);
      } else {
        return await mockElectronAPI.pagamentos.getById(id);
      }
    },
  },

  // Recibos
  recibos: {
    gerarDoacao: async (pagamentoId: number) => {
      if (isElectron()) {
        console.log('🔌 Gerando recibo real via Electron');
        return await window.electronAPI.recibos.gerarDoacao(pagamentoId);
      } else {
        console.log('🎭 Simulando geração de recibo');
        return await mockElectronAPI.recibos.gerarDoacao(pagamentoId);
      }
    },

    abrirPasta: async (tipo: 'doacao' | 'mensalidade') => {
      if (isElectron()) {
        return await window.electronAPI.recibos.abrirPasta(tipo);
      } else {
        return await mockElectronAPI.recibos.abrirPasta(tipo);
      }
    },
  },

  // Configurações
  configuracoes: {
    list: async () => {
      if (isElectron()) {
        return await window.electronAPI.configuracoes.list();
      } else {
        return await mockElectronAPI.configuracoes.list();
      }
    },

    get: async (chave: string) => {
      if (isElectron()) {
        return await window.electronAPI.configuracoes.get(chave);
      } else {
        return await mockElectronAPI.configuracoes.get(chave);
      }
    },

    set: async (chave: string, valor: string) => {
      if (isElectron()) {
        return await window.electronAPI.configuracoes.set(chave, valor);
      } else {
        return await mockElectronAPI.configuracoes.set(chave, valor);
      }
    },
  },

  // Backup
  backup: {
    limparTodosOsDados: async () => {
      if (isElectron()) {
        console.log('🔌 Limpando dados via Electron');
        return await window.electronAPI.backup.limparTodosOsDados();
      } else {
        console.log('🎭 Limpando dados via mock');
        return await mockElectronAPI.backup.limparTodosOsDados();
      }
    },
    
    inicializarSistema: async () => {
      if (isElectron()) {
        console.log('🔌 Inicializando sistema via Electron');
        return await window.electronAPI.backup.inicializarSistema();
      } else {
        console.log('🎭 Inicializando sistema via mock');
        return await mockElectronAPI.backup.inicializarSistema();
      }
    },
    
    importarDadosDoCSV: async (csvContent: string) => {
      if (isElectron()) {
        console.log('🔌 Importando dados via Electron');
        return await window.electronAPI.backup.importarDadosDoCSV(csvContent);
      } else {
        console.log('🎭 Importando dados via mock');
        return await mockElectronAPI.backup.importarDadosDoCSV(csvContent);
      }
    },
    
    gerarCSV: async () => {
      if (isElectron()) {
        console.log('🔌 Gerando backup real via Electron');
        return await window.electronAPI.backup.gerarCSV();
      } else {
        console.log('🎭 Gerando backup mock');
        return await mockElectronAPI.backup.gerarCSV();
      }
    },
  },
};

// Configurar window.electronAPI para desenvolvimento
if (!isElectron()) {
  console.log('🚀 Configurando API unificada para desenvolvimento...');
  (window as any).electronAPI = api;
  console.log('✅ API unificada configurada!');
}

