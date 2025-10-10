import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupPagamentosHandlers() {
  // Buscar dados para o dashboard (principal)
  ipcMain.handle('dashboard:get', async (event, ano: number) => {
    try {
      // Buscar todos os idosos ativos
      const idosos = await prisma.idoso.findMany({
        where: { ativo: true },
        include: { responsavel: true },
        orderBy: { nome: 'asc' },
      });

      // Buscar todos os pagamentos do ano
      const pagamentos = await prisma.pagamento.findMany({
        where: { anoReferencia: ano },
      });

      // Formatar dados para o grid
      const pagamentosMap: Record<number, Record<number, any>> = {};
      
      pagamentos.forEach(p => {
        if (!pagamentosMap[p.idosoId]) {
          pagamentosMap[p.idosoId] = {};
        }
        pagamentosMap[p.idosoId][p.mesReferencia] = {
          id: p.id,
          status: p.status,
          nfse: p.nfse,
          valorPago: p.valorPago,
          dataPagamento: p.dataPagamento,
          valorDoacaoCalculado: p.valorDoacaoCalculado,
        };
      });

      return {
        idosos,
        pagamentos: pagamentosMap,
      };
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      throw error;
    }
  });

  // Criar ou atualizar pagamento
  ipcMain.handle('pagamento:upsert', async (event, data) => {
    try {
      // Buscar dados do idoso para calcular status
      const idoso = await prisma.idoso.findUnique({
        where: { id: data.idosoId },
      });

      if (!idoso) {
        throw new Error('Idoso não encontrado');
      }

      // Calcular status baseado no valor pago
      let status = 'PENDENTE';
      const valorPago = parseFloat(data.valorPago) || 0;
      const valorBase = idoso.valorMensalidadeBase;

      if (valorPago >= valorBase) {
        status = 'PAGO';
      } else if (valorPago > 0) {
        status = 'PARCIAL';
      }

      // Calcular doação (se houver excedente)
      const valorDoacaoCalculado = Math.max(0, valorPago - valorBase);

      // Criar ou atualizar pagamento
      const pagamento = await prisma.pagamento.upsert({
        where: {
          idosoId_mesReferencia_anoReferencia: {
            idosoId: data.idosoId,
            mesReferencia: data.mesReferencia,
            anoReferencia: data.anoReferencia,
          },
        },
        update: {
          valorPago,
          dataPagamento: data.dataPagamento ? new Date(data.dataPagamento) : null,
          nfse: data.nfse,
          status,
          valorDoacaoCalculado,
          observacoes: data.observacoes,
        },
        create: {
          idosoId: data.idosoId,
          mesReferencia: data.mesReferencia,
          anoReferencia: data.anoReferencia,
          valorPago,
          dataPagamento: data.dataPagamento ? new Date(data.dataPagamento) : null,
          nfse: data.nfse,
          status,
          valorDoacaoCalculado,
          observacoes: data.observacoes,
        },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
        },
      });

      return pagamento;
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      throw error;
    }
  });

  // Buscar pagamentos de um idoso em um ano
  ipcMain.handle('pagamento:getByIdoso', async (event, idosoId: number, ano: number) => {
    try {
      const pagamentos = await prisma.pagamento.findMany({
        where: {
          idosoId,
          anoReferencia: ano,
        },
        orderBy: { mesReferencia: 'asc' },
      });
      return pagamentos;
    } catch (error) {
      console.error('Erro ao buscar pagamentos do idoso:', error);
      throw error;
    }
  });

  // Buscar pagamento por ID
  ipcMain.handle('pagamento:getById', async (event, id: number) => {
    try {
      const pagamento = await prisma.pagamento.findUnique({
        where: { id },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
        },
      });
      return pagamento;
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      throw error;
    }
  });
}




