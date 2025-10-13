/**
 * Configuração de Testes para o Lar dos Idosos
 * 
 * Este arquivo configura o ambiente de testes e fornece utilitários
 * para testes automatizados das funcionalidades críticas.
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { logger } from '../utils/logger';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Mock do window.electronAPI
const mockElectronAPI = {
  responsaveis: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  idosos: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  pagamentos: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  notasFiscais: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  backup: {
    gerarCSV: vi.fn()
  }
};

// Configuração global dos testes
beforeAll(() => {
  // Mock do localStorage
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });

  // Mock do window.electronAPI
  Object.defineProperty(window, 'electronAPI', {
    value: mockElectronAPI,
    writable: true
  });

  // Configurar logger para testes
  logger.updateConfig({
    enableConsole: false,
    persistToLocalStorage: false,
    logLevel: 0 // DEBUG
  });
});

beforeEach(() => {
  // Limpar mocks antes de cada teste
  vi.clearAllMocks();
  localStorageMock.clear();
  
  // Limpar logs
  logger.clearLogs();
});

afterEach(() => {
  // Limpar componentes React
  cleanup();
});

afterAll(() => {
  // Limpeza final
  vi.restoreAllMocks();
});

// Utilitários para testes
export const testUtils = {
  // Dados de teste
  mockResponsavel: {
    id: 1,
    nome: 'João Silva',
    cpf: '123.456.789-00',
    contatoTelefone: '(45) 99999-9999',
    contatoEmail: 'joao@email.com',
    ativo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  mockIdoso: {
    id: 1,
    nome: 'Maria Santos',
    cpf: '987.654.321-00',
    dataNascimento: '1940-01-01',
    responsavelId: 1,
    responsavel: {
      id: 1,
      nome: 'João Silva',
      cpf: '123.456.789-00',
      contatoTelefone: '(45) 99999-9999',
      contatoEmail: 'joao@email.com'
    },
    valorMensalidadeBase: 2500.00,
    tipo: 'REGULAR' as const,
    ativo: true,
    observacoes: 'Teste',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  mockPagamento: {
    id: 1,
    idosoId: 1,
    valorPago: 1750.00,
    dataPagamento: new Date().toISOString(),
    nfse: '12345',
    pagador: 'João Silva',
    formaPagamento: 'PIX',
    status: 'PAGO',
    mesReferencia: 10,
    anoReferencia: 2025,
    valorDoacaoCalculado: 750.00,
    observacoes: 'Teste',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  mockNotaFiscal: {
    id: 1,
    nomePessoa: 'João Silva',
    valor: 1750.00,
    numeroNFSE: '12345',
    dataPrestacao: '2025-10-15',
    discriminacao: 'Serviços de assistência',
    dataUpload: new Date().toISOString()
  },

  // Funções auxiliares
  createMockData: () => {
    localStorageMock.setItem('responsaveisMock', JSON.stringify([testUtils.mockResponsavel]));
    localStorageMock.setItem('idososMock', JSON.stringify([testUtils.mockIdoso]));
    localStorageMock.setItem('pagamentosMock', JSON.stringify([testUtils.mockPagamento]));
    localStorageMock.setItem('notasFiscaisMock', JSON.stringify([testUtils.mockNotaFiscal]));
  },

  clearMockData: () => {
    localStorageMock.removeItem('responsaveisMock');
    localStorageMock.removeItem('idososMock');
    localStorageMock.removeItem('pagamentosMock');
    localStorageMock.removeItem('notasFiscaisMock');
  },

  // Mock de respostas da API
  mockAPIResponses: {
    responsaveis: {
      getAll: () => Promise.resolve([testUtils.mockResponsavel]),
      create: (data: any) => Promise.resolve({ ...data, id: 1 }),
      update: (id: number, data: any) => Promise.resolve({ ...data, id }),
      delete: (id: number) => Promise.resolve({ success: true })
    },
    idosos: {
      getAll: () => Promise.resolve([testUtils.mockIdoso]),
      create: (data: any) => Promise.resolve({ ...data, id: 1 }),
      update: (id: number, data: any) => Promise.resolve({ ...data, id }),
      delete: (id: number) => Promise.resolve({ success: true })
    },
    pagamentos: {
      getAll: () => Promise.resolve([testUtils.mockPagamento]),
      create: (data: any) => Promise.resolve({ ...data, id: 1 }),
      update: (id: number, data: any) => Promise.resolve({ ...data, id }),
      delete: (id: number) => Promise.resolve({ success: true })
    },
    notasFiscais: {
      getAll: () => Promise.resolve([testUtils.mockNotaFiscal]),
      create: (data: any) => Promise.resolve({ ...data, id: 1 }),
      update: (id: number, data: any) => Promise.resolve({ ...data, id }),
      delete: (id: number) => Promise.resolve({ success: true })
    },
    backup: {
      gerarCSV: () => Promise.resolve({
        fileName: 'backup_test.csv',
        content: 'TIPO,ID,NOME\nRESPONSAVEL,1,João Silva\nIDOSO,1,Maria Santos',
        stats: {
          responsaveis: 1,
          idosos: 1,
          pagamentos: 1,
          configuracoes: 0,
          notasFiscais: 1
        }
      })
    }
  },

  // Configurar mocks da API
  setupAPIMocks: () => {
    mockElectronAPI.responsaveis.getAll.mockImplementation(testUtils.mockAPIResponses.responsaveis.getAll);
    mockElectronAPI.responsaveis.create.mockImplementation(testUtils.mockAPIResponses.responsaveis.create);
    mockElectronAPI.responsaveis.update.mockImplementation(testUtils.mockAPIResponses.responsaveis.update);
    mockElectronAPI.responsaveis.delete.mockImplementation(testUtils.mockAPIResponses.responsaveis.delete);

    mockElectronAPI.idosos.getAll.mockImplementation(testUtils.mockAPIResponses.idosos.getAll);
    mockElectronAPI.idosos.create.mockImplementation(testUtils.mockAPIResponses.idosos.create);
    mockElectronAPI.idosos.update.mockImplementation(testUtils.mockAPIResponses.idosos.update);
    mockElectronAPI.idosos.delete.mockImplementation(testUtils.mockAPIResponses.idosos.delete);

    mockElectronAPI.pagamentos.getAll.mockImplementation(testUtils.mockAPIResponses.pagamentos.getAll);
    mockElectronAPI.pagamentos.create.mockImplementation(testUtils.mockAPIResponses.pagamentos.create);
    mockElectronAPI.pagamentos.update.mockImplementation(testUtils.mockAPIResponses.pagamentos.update);
    mockElectronAPI.pagamentos.delete.mockImplementation(testUtils.mockAPIResponses.pagamentos.delete);

    mockElectronAPI.notasFiscais.getAll.mockImplementation(testUtils.mockAPIResponses.notasFiscais.getAll);
    mockElectronAPI.notasFiscais.create.mockImplementation(testUtils.mockAPIResponses.notasFiscais.create);
    mockElectronAPI.notasFiscais.update.mockImplementation(testUtils.mockAPIResponses.notasFiscais.update);
    mockElectronAPI.notasFiscais.delete.mockImplementation(testUtils.mockAPIResponses.notasFiscais.delete);

    mockElectronAPI.backup.gerarCSV.mockImplementation(testUtils.mockAPIResponses.backup.gerarCSV);
  },

  // Utilitários de validação
  validateResponsavel: (responsavel: any) => {
    expect(responsavel).toHaveProperty('nome');
    expect(responsavel).toHaveProperty('cpf');
    expect(responsavel).toHaveProperty('contatoTelefone');
    expect(responsavel).toHaveProperty('contatoEmail');
    expect(responsavel).toHaveProperty('ativo');
    expect(typeof responsavel.ativo).toBe('boolean');
  },

  validateIdoso: (idoso: any) => {
    expect(idoso).toHaveProperty('nome');
    expect(idoso).toHaveProperty('cpf');
    expect(idoso).toHaveProperty('dataNascimento');
    expect(idoso).toHaveProperty('responsavelId');
    expect(idoso).toHaveProperty('valorMensalidadeBase');
    expect(idoso).toHaveProperty('tipo');
    expect(['REGULAR', 'SOCIAL']).toContain(idoso.tipo);
    expect(idoso).toHaveProperty('ativo');
    expect(typeof idoso.ativo).toBe('boolean');
  },

  validatePagamento: (pagamento: any) => {
    expect(pagamento).toHaveProperty('idosoId');
    expect(pagamento).toHaveProperty('valorPago');
    expect(pagamento).toHaveProperty('dataPagamento');
    expect(pagamento).toHaveProperty('status');
    expect(['PENDENTE', 'PARCIAL', 'PAGO']).toContain(pagamento.status);
    expect(pagamento).toHaveProperty('mesReferencia');
    expect(pagamento).toHaveProperty('anoReferencia');
    expect(typeof pagamento.valorPago).toBe('number');
    expect(pagamento.valorPago).toBeGreaterThan(0);
  },

  validateNotaFiscal: (notaFiscal: any) => {
    expect(notaFiscal).toHaveProperty('nomePessoa');
    expect(notaFiscal).toHaveProperty('valor');
    expect(notaFiscal).toHaveProperty('numeroNFSE');
    expect(notaFiscal).toHaveProperty('dataPrestacao');
    expect(notaFiscal).toHaveProperty('discriminacao');
    expect(typeof notaFiscal.valor).toBe('number');
    expect(notaFiscal.valor).toBeGreaterThan(0);
  },

  // Utilitários de teste de componentes
  waitFor: (callback: () => boolean, timeout = 5000) => {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (callback()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },

  // Mock de eventos
  mockFile: (name: string, content: string, type = 'text/csv') => {
    const file = new File([content], name, { type });
    return file;
  },

  // Mock de PDF
  mockPDFFile: (name: string, content: string) => {
    const file = new File([content], name, { type: 'application/pdf' });
    return file;
  }
};

// Exportar para uso nos testes
export { mockElectronAPI, localStorageMock };
