/**
 * Testes para Geração de Relatórios
 * 
 * Este arquivo contém testes automatizados para todas as funcionalidades
 * críticas relacionadas à geração de relatórios no sistema Lar dos Idosos.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ListaIdososTemplate from '../components/Templates/ListaIdososTemplate';
import MensalidadeTemplate from '../components/Templates/MensalidadeTemplate';
import { testUtils } from './setup';

// Mock do window.print
Object.defineProperty(window, 'print', {
  value: vi.fn(),
  writable: true
});

// Mock do window.open
Object.defineProperty(window, 'open', {
  value: vi.fn(() => ({
    document: {
      write: vi.fn(),
      close: vi.fn()
    },
    focus: vi.fn(),
    print: vi.fn()
  })),
  writable: true
});

const renderListaIdososTemplate = (props = {}) => {
  const defaultProps = {
    onClose: vi.fn(),
    ...props
  };

  return render(
    <BrowserRouter>
      <ListaIdososTemplate {...defaultProps} />
    </BrowserRouter>
  );
};

const renderMensalidadeTemplate = (props = {}) => {
  const defaultProps = {
    onClose: vi.fn(),
    ...props
  };

  return render(
    <BrowserRouter>
      <MensalidadeTemplate {...defaultProps} />
    </BrowserRouter>
  );
};

describe('Geração de Relatórios - Lista de Idosos', () => {
  beforeEach(() => {
    testUtils.setupAPIMocks();
    testUtils.createMockData();
  });

  describe('Renderização e Interface', () => {
    it('deve renderizar o template de lista de idosos corretamente', () => {
      renderListaIdososTemplate();
      
      expect(screen.getByText('Gerar Lista de Idosos')).toBeInTheDocument();
      expect(screen.getByText('Mês/Ano de Referência')).toBeInTheDocument();
      expect(screen.getByText('Formato')).toBeInTheDocument();
      expect(screen.getByText('Gerar Lista')).toBeInTheDocument();
    });

    it('deve exibir opções de formato corretas', () => {
      renderListaIdososTemplate();
      
      const formatoSelect = screen.getByLabelText('Formato');
      fireEvent.mouseDown(formatoSelect);
      
      expect(screen.getByText('Lista Simples')).toBeInTheDocument();
      expect(screen.getByText('Lista Detalhada')).toBeInTheDocument();
      expect(screen.getByText('Lista para Impressão')).toBeInTheDocument();
    });
  });

  describe('Validação de Dados', () => {
    it('deve validar mês/ano de referência obrigatório', async () => {
      renderListaIdososTemplate();
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Mês/Ano de referência é obrigatório')).toBeInTheDocument();
      });
    });

    it('deve validar formato obrigatório', async () => {
      renderListaIdososTemplate();
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Formato é obrigatório')).toBeInTheDocument();
      });
    });

    it('deve validar formato de mês/ano', async () => {
      renderListaIdososTemplate();
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '13/2025' } });
      
      const formatoSelect = screen.getByLabelText('Formato');
      fireEvent.mouseDown(formatoSelect);
      fireEvent.click(screen.getByText('Lista Simples'));
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Mês deve estar entre 1 e 12')).toBeInTheDocument();
      });
    });
  });

  describe('Geração de Lista', () => {
    it('deve gerar lista simples com sucesso', async () => {
      renderListaIdososTemplate();
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const formatoSelect = screen.getByLabelText('Formato');
      fireEvent.mouseDown(formatoSelect);
      fireEvent.click(screen.getByText('Lista Simples'));
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Lista gerada com sucesso!')).toBeInTheDocument();
      });
    });

    it('deve gerar lista detalhada com sucesso', async () => {
      renderListaIdososTemplate();
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const formatoSelect = screen.getByLabelText('Formato');
      fireEvent.mouseDown(formatoSelect);
      fireEvent.click(screen.getByText('Lista Detalhada'));
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Lista gerada com sucesso!')).toBeInTheDocument();
      });
    });

    it('deve gerar lista para impressão com sucesso', async () => {
      renderListaIdososTemplate();
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const formatoSelect = screen.getByLabelText('Formato');
      fireEvent.mouseDown(formatoSelect);
      fireEvent.click(screen.getByText('Lista para Impressão'));
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Lista gerada com sucesso!')).toBeInTheDocument();
      });
    });

    it('deve abrir nova janela para impressão', async () => {
      renderListaIdososTemplate();
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const formatoSelect = screen.getByLabelText('Formato');
      fireEvent.mouseDown(formatoSelect);
      fireEvent.click(screen.getByText('Lista para Impressão'));
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('', '_blank');
      });
    });
  });

  describe('Dados da Lista', () => {
    it('deve incluir informações completas dos idosos', async () => {
      renderListaIdososTemplate();
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const formatoSelect = screen.getByLabelText('Formato');
      fireEvent.mouseDown(formatoSelect);
      fireEvent.click(screen.getByText('Lista Detalhada'));
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        // Verificar se a API foi chamada com os parâmetros corretos
        expect(mockElectronAPI.gerarListaIdosos).toHaveBeenCalledWith(
          expect.objectContaining({
            mesReferencia: '10/2025',
            formato: 'detalhada',
            idosos: expect.arrayContaining([
              expect.objectContaining({
                id: testUtils.mockIdoso.id,
                nome: testUtils.mockIdoso.nome
              })
            ])
          })
        );
      });
    });

    it('deve incluir informações de pagamento quando disponível', async () => {
      renderListaIdososTemplate();
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const formatoSelect = screen.getByLabelText('Formato');
      fireEvent.mouseDown(formatoSelect);
      fireEvent.click(screen.getByText('Lista Detalhada'));
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(mockElectronAPI.gerarListaIdosos).toHaveBeenCalledWith(
          expect.objectContaining({
            idosos: expect.arrayContaining([
              expect.objectContaining({
                status: testUtils.mockPagamento.status,
                valorPagamento: testUtils.mockPagamento.valorPago.toFixed(2).replace('.', ',')
              })
            ])
          })
        );
      });
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve exibir erro quando API falha', async () => {
      mockElectronAPI.gerarListaIdosos.mockRejectedValue(new Error('API Error'));
      
      renderListaIdososTemplate();
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const formatoSelect = screen.getByLabelText('Formato');
      fireEvent.mouseDown(formatoSelect);
      fireEvent.click(screen.getByText('Lista Simples'));
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Erro ao gerar lista')).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando não há idosos cadastrados', async () => {
      mockElectronAPI.idosos.getAll.mockResolvedValue([]);
      
      renderListaIdososTemplate();
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const formatoSelect = screen.getByLabelText('Formato');
      fireEvent.mouseDown(formatoSelect);
      fireEvent.click(screen.getByText('Lista Simples'));
      
      const gerarButton = screen.getByText('Gerar Lista');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Nenhum idoso cadastrado')).toBeInTheDocument();
      });
    });
  });
});

describe('Geração de Relatórios - Recibo de Mensalidade', () => {
  beforeEach(() => {
    testUtils.setupAPIMocks();
    testUtils.createMockData();
  });

  describe('Renderização e Interface', () => {
    it('deve renderizar o template de recibo corretamente', () => {
      renderMensalidadeTemplate();
      
      expect(screen.getByText('Gerar Recibo de Mensalidade')).toBeInTheDocument();
      expect(screen.getByText('Idoso')).toBeInTheDocument();
      expect(screen.getByText('Mês/Ano de Referência')).toBeInTheDocument();
      expect(screen.getByText('Tipo do Idoso')).toBeInTheDocument();
      expect(screen.getByText('Gerar Recibo')).toBeInTheDocument();
    });

    it('deve exibir opções de tipo de idoso', () => {
      renderMensalidadeTemplate();
      
      const tipoSelect = screen.getByLabelText('Tipo do Idoso');
      fireEvent.mouseDown(tipoSelect);
      
      expect(screen.getByText('REGULAR')).toBeInTheDocument();
      expect(screen.getByText('SOCIAL')).toBeInTheDocument();
    });
  });

  describe('Validação de Dados', () => {
    it('deve validar idoso obrigatório', async () => {
      renderMensalidadeTemplate();
      
      const gerarButton = screen.getByText('Gerar Recibo');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Idoso é obrigatório')).toBeInTheDocument();
      });
    });

    it('deve validar mês/ano de referência obrigatório', async () => {
      renderMensalidadeTemplate();
      
      const idosoSelect = screen.getByLabelText('Idoso');
      fireEvent.mouseDown(idosoSelect);
      fireEvent.click(screen.getByText(testUtils.mockIdoso.nome));
      
      const gerarButton = screen.getByText('Gerar Recibo');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Mês/Ano de referência é obrigatório')).toBeInTheDocument();
      });
    });

    it('deve validar tipo de idoso obrigatório', async () => {
      renderMensalidadeTemplate();
      
      const idosoSelect = screen.getByLabelText('Idoso');
      fireEvent.mouseDown(idosoSelect);
      fireEvent.click(screen.getByText(testUtils.mockIdoso.nome));
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const gerarButton = screen.getByText('Gerar Recibo');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Tipo do idoso é obrigatório')).toBeInTheDocument();
      });
    });
  });

  describe('Geração de Recibo', () => {
    it('deve gerar recibo para idoso REGULAR com sucesso', async () => {
      renderMensalidadeTemplate();
      
      const idosoSelect = screen.getByLabelText('Idoso');
      fireEvent.mouseDown(idosoSelect);
      fireEvent.click(screen.getByText(testUtils.mockIdoso.nome));
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const tipoSelect = screen.getByLabelText('Tipo do Idoso');
      fireEvent.mouseDown(tipoSelect);
      fireEvent.click(screen.getByText('REGULAR'));
      
      const gerarButton = screen.getByText('Gerar Recibo');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Recibo gerado com sucesso!')).toBeInTheDocument();
      });
    });

    it('deve gerar recibo para idoso SOCIAL com sucesso', async () => {
      renderMensalidadeTemplate();
      
      const idosoSelect = screen.getByLabelText('Idoso');
      fireEvent.mouseDown(idosoSelect);
      fireEvent.click(screen.getByText(testUtils.mockIdoso.nome));
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const tipoSelect = screen.getByLabelText('Tipo do Idoso');
      fireEvent.mouseDown(tipoSelect);
      fireEvent.click(screen.getByText('SOCIAL'));
      
      const gerarButton = screen.getByText('Gerar Recibo');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Recibo gerado com sucesso!')).toBeInTheDocument();
      });
    });

    it('deve abrir nova janela para impressão', async () => {
      renderMensalidadeTemplate();
      
      const idosoSelect = screen.getByLabelText('Idoso');
      fireEvent.mouseDown(idosoSelect);
      fireEvent.click(screen.getByText(testUtils.mockIdoso.nome));
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const tipoSelect = screen.getByLabelText('Tipo do Idoso');
      fireEvent.mouseDown(tipoSelect);
      fireEvent.click(screen.getByText('REGULAR'));
      
      const gerarButton = screen.getByText('Gerar Recibo');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('', '_blank');
      });
    });
  });

  describe('Conteúdo do Recibo', () => {
    it('deve incluir informações do idoso no recibo', async () => {
      renderMensalidadeTemplate();
      
      const idosoSelect = screen.getByLabelText('Idoso');
      fireEvent.mouseDown(idosoSelect);
      fireEvent.click(screen.getByText(testUtils.mockIdoso.nome));
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const tipoSelect = screen.getByLabelText('Tipo do Idoso');
      fireEvent.mouseDown(tipoSelect);
      fireEvent.click(screen.getByText('REGULAR'));
      
      const gerarButton = screen.getByText('Gerar Recibo');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(mockElectronAPI.gerarReciboMensalidade).toHaveBeenCalledWith(
          expect.objectContaining({
            idoso: expect.objectContaining({
              nome: testUtils.mockIdoso.nome,
              cpf: testUtils.mockIdoso.cpf
            }),
            mesReferencia: '10/2025',
            tipoIdoso: 'REGULAR'
          })
        );
      });
    });

    it('deve exibir "SOMENTE NOTA SOCIAL" para idoso SOCIAL', async () => {
      renderMensalidadeTemplate();
      
      const idosoSelect = screen.getByLabelText('Idoso');
      fireEvent.mouseDown(idosoSelect);
      fireEvent.click(screen.getByText(testUtils.mockIdoso.nome));
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const tipoSelect = screen.getByLabelText('Tipo do Idoso');
      fireEvent.mouseDown(tipoSelect);
      fireEvent.click(screen.getByText('SOCIAL'));
      
      const gerarButton = screen.getByText('Gerar Recibo');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(mockElectronAPI.gerarReciboMensalidade).toHaveBeenCalledWith(
          expect.objectContaining({
            tipoIdoso: 'SOCIAL'
          })
        );
      });
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve exibir erro quando API falha', async () => {
      mockElectronAPI.gerarReciboMensalidade.mockRejectedValue(new Error('API Error'));
      
      renderMensalidadeTemplate();
      
      const idosoSelect = screen.getByLabelText('Idoso');
      fireEvent.mouseDown(idosoSelect);
      fireEvent.click(screen.getByText(testUtils.mockIdoso.nome));
      
      const mesAnoInput = screen.getByLabelText('Mês/Ano de Referência');
      fireEvent.change(mesAnoInput, { target: { value: '10/2025' } });
      
      const tipoSelect = screen.getByLabelText('Tipo do Idoso');
      fireEvent.mouseDown(tipoSelect);
      fireEvent.click(screen.getByText('REGULAR'));
      
      const gerarButton = screen.getByText('Gerar Recibo');
      fireEvent.click(gerarButton);
      
      await waitFor(() => {
        expect(screen.getByText('Erro ao gerar recibo')).toBeInTheDocument();
      });
    });
  });
});

describe('Geração de Relatórios - Backup CSV', () => {
  beforeEach(() => {
    testUtils.setupAPIMocks();
    testUtils.createMockData();
  });

  describe('Geração de Backup', () => {
    it('deve gerar backup CSV com todos os dados', async () => {
      const backupData = await mockElectronAPI.backup.gerarCSV();
      
      expect(backupData).toHaveProperty('fileName');
      expect(backupData).toHaveProperty('content');
      expect(backupData).toHaveProperty('stats');
      
      expect(backupData.fileName).toMatch(/backup_lar_idosos_\d{4}-\d{2}-\d{2}\.csv/);
      expect(backupData.content).toContain('TIPO,ID,NOME');
      expect(backupData.stats).toHaveProperty('responsaveis');
      expect(backupData.stats).toHaveProperty('idosos');
      expect(backupData.stats).toHaveProperty('pagamentos');
      expect(backupData.stats).toHaveProperty('configuracoes');
      expect(backupData.stats).toHaveProperty('notasFiscais');
    });

    it('deve incluir dados de responsáveis no backup', async () => {
      const backupData = await mockElectronAPI.backup.gerarCSV();
      
      expect(backupData.content).toContain('RESPONSAVEL');
      expect(backupData.content).toContain(testUtils.mockResponsavel.nome);
      expect(backupData.content).toContain(testUtils.mockResponsavel.cpf);
    });

    it('deve incluir dados de idosos no backup', async () => {
      const backupData = await mockElectronAPI.backup.gerarCSV();
      
      expect(backupData.content).toContain('IDOSO');
      expect(backupData.content).toContain(testUtils.mockIdoso.nome);
      expect(backupData.content).toContain(testUtils.mockIdoso.cpf);
      expect(backupData.content).toContain(testUtils.mockIdoso.tipo);
    });

    it('deve incluir dados de pagamentos no backup', async () => {
      const backupData = await mockElectronAPI.backup.gerarCSV();
      
      expect(backupData.content).toContain('PAGAMENTO');
      expect(backupData.content).toContain(testUtils.mockPagamento.status);
      expect(backupData.content).toContain(testUtils.mockPagamento.valorPago.toString());
    });

    it('deve incluir dados de notas fiscais no backup', async () => {
      const backupData = await mockElectronAPI.backup.gerarCSV();
      
      expect(backupData.content).toContain('NOTA_FISCAL');
      expect(backupData.content).toContain(testUtils.mockNotaFiscal.nomePessoa);
      expect(backupData.content).toContain(testUtils.mockNotaFiscal.valor.toString());
    });
  });

  describe('Estatísticas do Backup', () => {
    it('deve contar corretamente os registros por tipo', async () => {
      const backupData = await mockElectronAPI.backup.gerarCSV();
      
      expect(backupData.stats.responsaveis).toBe(1);
      expect(backupData.stats.idosos).toBe(1);
      expect(backupData.stats.pagamentos).toBe(1);
      expect(backupData.stats.notasFiscais).toBe(1);
    });

    it('deve retornar zero quando não há dados', async () => {
      testUtils.clearMockData();
      
      const backupData = await mockElectronAPI.backup.gerarCSV();
      
      expect(backupData.stats.responsaveis).toBe(0);
      expect(backupData.stats.idosos).toBe(0);
      expect(backupData.stats.pagamentos).toBe(0);
      expect(backupData.stats.notasFiscais).toBe(0);
    });
  });
});
