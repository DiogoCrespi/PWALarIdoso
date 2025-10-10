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
} as ElectronAPI);

// Expor também informações do sistema
contextBridge.exposeInMainWorld('systemInfo', {
  platform: process.platform,
  version: process.versions,
});




