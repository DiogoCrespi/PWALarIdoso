// Definições TypeScript para a API do Electron exposta

export interface Idoso {
  id: number;
  nome: string;
  cpf?: string;
  dataNascimento?: Date;
  responsavelId: number;
  responsavel?: Responsavel;
  valorMensalidadeBase: number;
  beneficioSalario: number; // ✅ CORRIGIDO: Salário do idoso (usado para calcular 70% na NFSE)
  tipo: 'REGULAR' | 'SOCIAL'; // REGULAR = 70% + doação, SOCIAL = valor fixo
  pagamentos?: Pagamento[];
  ativo: boolean;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Responsavel {
  id: number;
  nome: string;
  cpf: string;
  contatoTelefone?: string;
  contatoEmail?: string;
  idosos?: Idoso[];
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pagamento {
  id: number;
  idosoId: number;
  idoso?: Idoso;
  mesReferencia: number;
  anoReferencia: number;
  valorPago: number;
  dataPagamento?: Date;
  nfse?: string;
  pagador?: string;
  formaPagamento?: string;
  status: 'PENDENTE' | 'PARCIAL' | 'PAGO';
  valorDoacaoCalculado: number;
  caminhoReciboDoacao?: string;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Configuracao {
  id: number;
  chave: string;
  valor: string;
  descricao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotaFiscal {
  id: number;
  numeroNFSE?: string;
  dataPrestacao?: Date;
  dataEmissao?: Date;
  discriminacao?: string;
  valor?: number;
  nomePessoa?: string;
  idosoId: number;
  idoso?: Idoso;
  mesReferencia: number;
  anoReferencia: number;
  arquivoOriginal?: string;
  status: 'RASCUNHO' | 'COMPLETA' | 'PROCESSADA' | 'CANCELADA';
  pagamentoId?: number;
  pagamento?: Pagamento;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardData {
  idosos: Idoso[];
  pagamentos: Record<number, Record<number, {
    id: number;
    status: string;
    nfse?: string;
    valorPago: number;
    dataPagamento?: Date;
  }>>;
}

export interface ElectronAPI {
  idosos: {
    list: () => Promise<Idoso[]>;
    create: (data: Partial<Idoso>) => Promise<Idoso>;
    update: (id: number, data: Partial<Idoso>) => Promise<Idoso>;
    delete: (id: number) => Promise<Idoso>;
    activate: (id: number) => Promise<Idoso>;
    getById: (id: number) => Promise<Idoso>;
    getByPagador: (pagador: string) => Promise<Idoso[]>;
    getByNome: (nome: string) => Promise<Idoso[]>;
  };

  responsaveis: {
    list: () => Promise<Responsavel[]>;
    create: (data: Partial<Responsavel>) => Promise<Responsavel>;
    update: (id: number, data: Partial<Responsavel>) => Promise<Responsavel>;
    delete: (id: number) => Promise<Responsavel>;
    activate: (id: number) => Promise<Responsavel>;
    getById: (id: number) => Promise<Responsavel>;
  };

  dashboard: {
    get: (ano: number) => Promise<DashboardData>;
  };

  pagamentos: {
    upsert: (data: Partial<Pagamento>) => Promise<Pagamento>;
    getByIdoso: (idosoId: number, ano: number) => Promise<Pagamento[]>;
    getById: (id: number) => Promise<Pagamento>;
    getPagadoresByIdoso: (idosoId: number) => Promise<any[]>;
    getAllWithIdosos: () => Promise<any[]>;
  };

  recibos: {
    gerarDoacao: (pagamentoId: number) => Promise<{
      sucesso: boolean;
      caminho: string;
      nomeArquivo: string;
    }>;
    abrirPasta: (tipo: 'doacao' | 'mensalidade') => Promise<void>;
  };

  configuracoes: {
    list: () => Promise<Configuracao[]>;
    get: (chave: string) => Promise<Configuracao | null>;
    set: (chave: string, valor: string) => Promise<Configuracao>;
  };

      notasFiscais: {
        list: (filters?: { idosoId?: number; status?: string }) => Promise<NotaFiscal[]>;
        create: (data: Partial<NotaFiscal>) => Promise<NotaFiscal>;
        update: (id: number, data: Partial<NotaFiscal>) => Promise<NotaFiscal>;
        cancel: (id: number) => Promise<NotaFiscal>;
        delete: (id: number) => Promise<NotaFiscal>;
        getById: (id: number) => Promise<NotaFiscal>;
        getByIdoso: (idosoId: number) => Promise<NotaFiscal[]>;
        getByPagamento: (pagamentoId: number) => Promise<NotaFiscal>;
      };

  templates: {
    gerarMensalidade: (data: any) => Promise<{ fileName: string; path: string }>;
    gerarListaIdosos: (data: any) => Promise<{ fileName: string; path: string }>;
  };
  backup: {
    gerarCSV: () => Promise<{ fileName: string; content: string; stats: any }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    systemInfo: {
      platform: string;
      version: any;
    };
  }
}

export {};




