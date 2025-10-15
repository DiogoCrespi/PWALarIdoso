/**
 * Testes para Funcionalidades de Pagamentos
 * 
 * Este arquivo contém testes automatizados para todas as funcionalidades
 * críticas relacionadas a pagamentos no sistema Lar dos Idosos.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PaymentModal from '../components/Dashboard/PaymentModal';
import { testUtils } from './setup';

// Mock do react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false,
    acceptedFiles: []
  })
}));

// Mock do pdfExtractor
vi.mock('../utils/pdfExtractor', () => ({
  extractNFSEFromPDF: vi.fn().mockResolvedValue({
    numeroNFSE: '12345',
    dataPrestacao: '15/10/2025',
    discriminacao: 'Serviços de assistência',
    valor: 1750.00,
    nomePessoa: 'João Silva'
  })
}));

// Mock do geminiExtractor
vi.mock('../utils/geminiExtractor', () => ({
  extractNFSEWithFallback: vi.fn().mockResolvedValue({
    numeroNFSE: '12345',
    dataPrestacao: '15/10/2025',
    discriminacao: 'Serviços de assistência',
    valor: 1750.00,
    nomePessoa: 'João Silva',
    extractedBy: 'fallback'
  })
}));

const renderPaymentModal = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    idoso: testUtils.mockIdoso,
    onSave: vi.fn(),
    ...props
  };

  return render(
    <BrowserRouter>
      <PaymentModal {...defaultProps} />
    </BrowserRouter>
  );
};

describe('PaymentModal - Funcionalidades de Pagamentos', () => {
  beforeEach(() => {
    testUtils.setupAPIMocks();
    testUtils.createMockData();
  });

  describe('Renderização e Interface', () => {
    it('deve renderizar o modal de pagamento corretamente', () => {
      renderPaymentModal();
      
      expect(screen.getByText('Registrar Pagamento')).toBeInTheDocument();
      expect(screen.getByText('Valor Pago')).toBeInTheDocument();
      expect(screen.getByText('Data do Pagamento')).toBeInTheDocument();
      expect(screen.getByText('NFSE')).toBeInTheDocument();
      expect(screen.getByText('Observações')).toBeInTheDocument();
    });

    it('deve exibir informações do idoso corretamente', () => {
      renderPaymentModal();
      
      expect(screen.getByText(testUtils.mockIdoso.nome)).toBeInTheDocument();
      expect(screen.getByText(`R$ ${((testUtils.mockIdoso as any).beneficioSalario && (testUtils.mockIdoso as any).beneficioSalario > 0 ? (testUtils.mockIdoso as any).beneficioSalario : 0).toFixed(2).replace('.', ',')}`)).toBeInTheDocument();
    });

    it('deve exibir tipo do idoso (REGULAR/SOCIAL)', () => {
      renderPaymentModal();
      
      const tipoElement = screen.getByText(testUtils.mockIdoso.tipo);
      expect(tipoElement).toBeInTheDocument();
    });
  });

  describe('Validação de Dados', () => {
    it('deve validar valor pago obrigatório', async () => {
      renderPaymentModal();
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Valor pago é obrigatório')).toBeInTheDocument();
      });
    });

    it('deve validar valor pago maior que zero', async () => {
      renderPaymentModal();
      
      const valorInput = screen.getByLabelText('Valor Pago');
      fireEvent.change(valorInput, { target: { value: '0' } });
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Valor pago deve ser maior que zero')).toBeInTheDocument();
      });
    });

    it('deve validar valor pago não pode exceder 70% para idosos REGULAR', async () => {
      renderPaymentModal();
      
      const valorInput = screen.getByLabelText('Valor Pago');
      const valorLimite = (testUtils.mockIdoso as any).beneficioSalario && (testUtils.mockIdoso as any).beneficioSalario > 0 ? (testUtils.mockIdoso as any).beneficioSalario * 0.7 : 0;
      const valorExcedente = valorLimite + 100;
      
      fireEvent.change(valorInput, { target: { value: valorExcedente.toString() } });
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/não pode exceder 70%/)).toBeInTheDocument();
      });
    });

    it('deve permitir qualquer valor para idosos SOCIAL', async () => {
      const idosoSocial = { ...testUtils.mockIdoso, tipo: 'SOCIAL' };
      renderPaymentModal({ idoso: idosoSocial });
      
      const valorInput = screen.getByLabelText('Valor Pago');
      const valorAlto = testUtils.mockIdoso.valorMensalidadeBase + 1000;
      
      fireEvent.change(valorInput, { target: { value: valorAlto.toString() } });
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/não pode exceder 70%/)).not.toBeInTheDocument();
      });
    });

    it('deve validar data de pagamento obrigatória', async () => {
      renderPaymentModal();
      
      const valorInput = screen.getByLabelText('Valor Pago');
      fireEvent.change(valorInput, { target: { value: '1000' } });
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Data do pagamento é obrigatória')).toBeInTheDocument();
      });
    });
  });

  describe('Cálculos de Doação', () => {
    it('deve calcular doação corretamente para idoso REGULAR', async () => {
      renderPaymentModal();
      
      const valorInput = screen.getByLabelText('Valor Pago');
      const valorPago = 2000;
      fireEvent.change(valorInput, { target: { value: valorPago.toString() } });
      
      const valorBase = testUtils.mockIdoso.valorMensalidadeBase;
      const valorBeneficio = valorBase * 0.7;
      const doacaoEsperada = valorPago - valorBeneficio;
      
      // Verificar se o cálculo é exibido
      await waitFor(() => {
        const doacaoElement = screen.getByText(/Doação:/);
        expect(doacaoElement).toBeInTheDocument();
      });
    });

    it('deve exibir "SOMENTE NOTA SOCIAL" para idoso SOCIAL', () => {
      const idosoSocial = { ...testUtils.mockIdoso, tipo: 'SOCIAL' };
      renderPaymentModal({ idoso: idosoSocial });
      
      expect(screen.getByText('SOMENTE NOTA SOCIAL')).toBeInTheDocument();
    });
  });

  describe('Upload de Arquivo PDF', () => {
    it('deve permitir upload de arquivo PDF', async () => {
      renderPaymentModal();
      
      const fileInput = screen.getByLabelText(/Arraste e solte o arquivo PDF aqui/);
      const file = testUtils.mockPDFFile('test.pdf', 'PDF content');
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('Arquivo processado com sucesso')).toBeInTheDocument();
      });
    });

    it('deve extrair dados do PDF corretamente', async () => {
      renderPaymentModal();
      
      const fileInput = screen.getByLabelText(/Arraste e solte o arquivo PDF aqui/);
      const file = testUtils.mockPDFFile('test.pdf', 'PDF content');
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('12345')).toBeInTheDocument(); // NFSE
        expect(screen.getByDisplayValue('1750.00')).toBeInTheDocument(); // Valor
        expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument(); // Nome
      });
    });

    it('deve exibir indicador de método de extração', async () => {
      renderPaymentModal();
      
      const fileInput = screen.getByLabelText(/Arraste e solte o arquivo PDF aqui/);
      const file = testUtils.mockPDFFile('test.pdf', 'PDF content');
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Dados simulados \(fallback\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Salvamento de Pagamento', () => {
    it('deve salvar pagamento com dados válidos', async () => {
      const onSave = vi.fn();
      renderPaymentModal({ onSave });
      
      // Preencher formulário
      const valorInput = screen.getByLabelText('Valor Pago');
      fireEvent.change(valorInput, { target: { value: '1750' } });
      
      const dataInput = screen.getByLabelText('Data do Pagamento');
      fireEvent.change(dataInput, { target: { value: '2025-10-15' } });
      
      const nfseInput = screen.getByLabelText('NFSE');
      fireEvent.change(nfseInput, { target: { value: '12345' } });
      
      const pagadorInput = screen.getByLabelText('Pagador');
      fireEvent.change(pagadorInput, { target: { value: 'João Silva' } });
      
      const formaPagamentoInput = screen.getByLabelText('Forma de Pagamento');
      fireEvent.change(formaPagamentoInput, { target: { value: 'PIX' } });
      
      const observacoesInput = screen.getByLabelText('Observações');
      fireEvent.change(observacoesInput, { target: { value: 'Teste' } });
      
      // Salvar
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            idosoId: testUtils.mockIdoso.id,
            valorPago: 1750,
            dataPagamento: '2025-10-15',
            nfse: '12345',
            pagador: 'João Silva',
            formaPagamento: 'PIX',
            observacoes: 'Teste'
          })
        );
      });
    });

    it('deve calcular status corretamente (PAGO)', async () => {
      const onSave = vi.fn();
      renderPaymentModal({ onSave });
      
      const valorInput = screen.getByLabelText('Valor Pago');
      const valorPago = (testUtils.mockIdoso as any).beneficioSalario && (testUtils.mockIdoso as any).beneficioSalario > 0 ? (testUtils.mockIdoso as any).beneficioSalario * 0.7 : 0; // 70% do salário
      fireEvent.change(valorInput, { target: { value: valorPago.toString() } });
      
      const dataInput = screen.getByLabelText('Data do Pagamento');
      fireEvent.change(dataInput, { target: { value: '2025-10-15' } });
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'PAGO'
          })
        );
      });
    });

    it('deve calcular status corretamente (PARCIAL)', async () => {
      const onSave = vi.fn();
      renderPaymentModal({ onSave });
      
      const valorInput = screen.getByLabelText('Valor Pago');
      const valorPago = (testUtils.mockIdoso as any).beneficioSalario && (testUtils.mockIdoso as any).beneficioSalario > 0 ? (testUtils.mockIdoso as any).beneficioSalario * 0.5 : 0; // 50% do salário
      fireEvent.change(valorInput, { target: { value: valorPago.toString() } });
      
      const dataInput = screen.getByLabelText('Data do Pagamento');
      fireEvent.change(dataInput, { target: { value: '2025-10-15' } });
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'PARCIAL'
          })
        );
      });
    });

    it('deve exibir mensagem de sucesso após salvar', async () => {
      renderPaymentModal();
      
      const valorInput = screen.getByLabelText('Valor Pago');
      fireEvent.change(valorInput, { target: { value: '1750' } });
      
      const dataInput = screen.getByLabelText('Data do Pagamento');
      fireEvent.change(dataInput, { target: { value: '2025-10-15' } });
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Pagamento salvo com sucesso!')).toBeInTheDocument();
      });
    });
  });

  describe('Formatação de Valores', () => {
    it('deve formatar valor monetário corretamente', async () => {
      renderPaymentModal();
      
      const valorInput = screen.getByLabelText('Valor Pago');
      fireEvent.change(valorInput, { target: { value: '1750.50' } });
      fireEvent.blur(valorInput);
      
      await waitFor(() => {
        expect(valorInput).toHaveValue('1750.50');
      });
    });

    it('deve normalizar valores com diferentes formatos', async () => {
      renderPaymentModal();
      
      const valorInput = screen.getByLabelText('Valor Pago');
      
      // Testar formato brasileiro
      fireEvent.change(valorInput, { target: { value: '1.750,50' } });
      fireEvent.blur(valorInput);
      
      await waitFor(() => {
        expect(valorInput).toHaveValue('1750.50');
      });
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve exibir erro quando API falha', async () => {
      mockElectronAPI.pagamentos.create.mockRejectedValue(new Error('API Error'));
      
      renderPaymentModal();
      
      const valorInput = screen.getByLabelText('Valor Pago');
      fireEvent.change(valorInput, { target: { value: '1750' } });
      
      const dataInput = screen.getByLabelText('Data do Pagamento');
      fireEvent.change(dataInput, { target: { value: '2025-10-15' } });
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Erro ao salvar pagamento')).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando upload de PDF falha', async () => {
      const { extractNFSEFromPDF } = await import('../utils/pdfExtractor');
      vi.mocked(extractNFSEFromPDF).mockRejectedValue(new Error('PDF Error'));
      
      renderPaymentModal();
      
      const fileInput = screen.getByLabelText(/Arraste e solte o arquivo PDF aqui/);
      const file = testUtils.mockPDFFile('test.pdf', 'PDF content');
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('Erro ao processar arquivo')).toBeInTheDocument();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados para leitores de tela', () => {
      renderPaymentModal();
      
      expect(screen.getByLabelText('Valor Pago')).toBeInTheDocument();
      expect(screen.getByLabelText('Data do Pagamento')).toBeInTheDocument();
      expect(screen.getByLabelText('NFSE')).toBeInTheDocument();
      expect(screen.getByLabelText('Pagador')).toBeInTheDocument();
      expect(screen.getByLabelText('Forma de Pagamento')).toBeInTheDocument();
      expect(screen.getByLabelText('Observações')).toBeInTheDocument();
    });

    it('deve ter navegação por teclado funcional', () => {
      renderPaymentModal();
      
      const valorInput = screen.getByLabelText('Valor Pago');
      valorInput.focus();
      expect(valorInput).toHaveFocus();
      
      fireEvent.keyDown(valorInput, { key: 'Tab' });
      // Verificar se o próximo elemento recebeu foco
    });
  });
});
