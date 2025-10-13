import { contextBridge, ipcRenderer } from 'electron';

// Interface da API exposta para o frontend
export interface ElectronAPI {
  // Idosos
  idosos: {
    list: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
    getById: (id: number) => Promise<any>;
    getByNome: (nome: string) => Promise<any[]>;
    getByPagador: (pagador: string) => Promise<any[]>;
  };

  // Responsáveis
  responsaveis: {
    list: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
    getById: (id: number) => Promise<any>;
  };

  // Dashboard
  dashboard: {
    get: (ano: number) => Promise<any>;
  };

  // Pagamentos
  pagamentos: {
    upsert: (data: any) => Promise<any>;
    getByIdoso: (idosoId: number, ano: number) => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    getPagadoresByIdoso: (idosoId: number) => Promise<any[]>;
    getAllWithIdosos: () => Promise<any[]>;
  };

  // Recibos
  recibos: {
    gerarDoacao: (pagamentoId: number) => Promise<any>;
    abrirPasta: (tipo: 'doacao' | 'mensalidade') => Promise<void>;
  };

  // Configurações
  configuracoes: {
    list: () => Promise<any[]>;
    get: (chave: string) => Promise<any>;
    set: (chave: string, valor: string) => Promise<any>;
  };

  // Notas Fiscais
  notasFiscais: {
    list: (filters?: { idosoId?: number; status?: string }) => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    cancel: (id: number) => Promise<any>;
    delete: (id: number) => Promise<any>;
    getById: (id: number) => Promise<any>;
    getByIdoso: (idosoId: number) => Promise<any[]>;
    getByPagamento: (pagamentoId: number) => Promise<any>;
  };

  // Templates
  templates: {
    gerarMensalidade: (data: any) => Promise<{ fileName: string; path: string }>;
    gerarListaIdosos: (data: any) => Promise<{ fileName: string; path: string }>;
  };

  // Backup
  backup: {
    gerarCSV: () => Promise<{ fileName: string; content: string; stats: any }>;
  };
}

// Expor API protegida no contexto do renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Idosos
  idosos: {
    list: () => ipcRenderer.invoke('idosos:list'),
    create: (data: any) => ipcRenderer.invoke('idosos:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('idosos:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('idosos:delete', id),
    getById: (id: number) => ipcRenderer.invoke('idosos:getById', id),
    getByNome: (nome: string) => ipcRenderer.invoke('idosos:getByNome', nome),
    getByPagador: (pagador: string) => ipcRenderer.invoke('idosos:getByPagador', pagador),
  },

  // Responsáveis
  responsaveis: {
    list: () => ipcRenderer.invoke('responsaveis:list'),
    create: (data: any) => ipcRenderer.invoke('responsaveis:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('responsaveis:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('responsaveis:delete', id),
    getById: (id: number) => ipcRenderer.invoke('responsaveis:getById', id),
  },

  // Dashboard
  dashboard: {
    get: (ano: number) => ipcRenderer.invoke('dashboard:get', ano),
  },

  // Pagamentos
  pagamentos: {
    upsert: (data: any) => ipcRenderer.invoke('pagamento:upsert', data),
    getByIdoso: (idosoId: number, ano: number) => 
      ipcRenderer.invoke('pagamento:getByIdoso', idosoId, ano),
    getById: (id: number) => ipcRenderer.invoke('pagamento:getById', id),
    getPagadoresByIdoso: (idosoId: number) => 
      ipcRenderer.invoke('pagamento:getPagadoresByIdoso', idosoId),
    getAllWithIdosos: () => ipcRenderer.invoke('pagamento:getAllWithIdosos'),
  },

  // Recibos
  recibos: {
    gerarDoacao: (pagamentoId: number) => 
      ipcRenderer.invoke('recibo:gerar-doacao', pagamentoId),
    abrirPasta: (tipo: 'doacao' | 'mensalidade') => 
      ipcRenderer.invoke('recibo:abrir-pasta', tipo),
  },

  // Configurações
  configuracoes: {
    list: () => ipcRenderer.invoke('configuracoes:list'),
    get: (chave: string) => ipcRenderer.invoke('configuracoes:get', chave),
    set: (chave: string, valor: string) => 
      ipcRenderer.invoke('configuracoes:set', chave, valor),
  },

  // Notas Fiscais
  notasFiscais: {
    list: (filters?: { idosoId?: number; status?: string }) => 
      ipcRenderer.invoke('notas-fiscais:list', filters),
    create: (data: any) => ipcRenderer.invoke('notas-fiscais:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('notas-fiscais:update', id, data),
    cancel: (id: number) => ipcRenderer.invoke('notas-fiscais:cancel', id),
    delete: (id: number) => ipcRenderer.invoke('notas-fiscais:delete', id),
    getById: (id: number) => ipcRenderer.invoke('notas-fiscais:getById', id),
    getByIdoso: (idosoId: number) => ipcRenderer.invoke('notas-fiscais:getByIdoso', idosoId),
    getByPagamento: (pagamentoId: number) => ipcRenderer.invoke('notas-fiscais:getByPagamento', pagamentoId),
  },

  // Templates
  templates: {
    gerarMensalidade: (data: any) => ipcRenderer.invoke('template:gerar-mensalidade', data),
    gerarListaIdosos: (data: any) => ipcRenderer.invoke('template:gerar-lista-idosos', data),
  },

  // Backup
  backup: {
    gerarCSV: () => ipcRenderer.invoke('backup:gerar-csv'),
  },
} as ElectronAPI);

// Expor também informações do sistema
contextBridge.exposeInMainWorld('systemInfo', {
  platform: process.platform,
  version: process.versions,
});




