import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

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
          pagador: p.pagador,
          formaPagamento: p.formaPagamento,
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
          pagador: data.pagador,
          formaPagamento: data.formaPagamento,
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
          pagador: data.pagador,
          formaPagamento: data.formaPagamento,
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

      // Criar nota fiscal automaticamente se não existir
      const notaFiscalExistente = await prisma.notaFiscal.findFirst({
        where: { pagamentoId: pagamento.id },
      });

      if (!notaFiscalExistente) {
        await prisma.notaFiscal.create({
          data: {
            idosoId: data.idosoId,
            mesReferencia: data.mesReferencia,
            anoReferencia: data.anoReferencia,
            valor: valorPago,
            nomePessoa: data.pagador,
            pagamentoId: pagamento.id,
            status: 'RASCUNHO',
            discriminacao: data.discriminacao || `Mensalidade - ${meses[data.mesReferencia - 1]} ${data.anoReferencia}`,
            dataPrestacao: data.dataPagamento ? new Date(data.dataPagamento) : new Date(),
            dataEmissao: data.dataEmissao ? new Date(data.dataEmissao) : null,
            numeroNFSE: data.nfse,
          },
        });
      }

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

  // Buscar histórico de pagadores por idoso
  ipcMain.handle('pagamento:getPagadoresByIdoso', async (event, idosoId: number) => {
    try {
      const pagamentos = await prisma.pagamento.findMany({
        where: {
          idosoId,
          pagador: { not: null },
        },
        select: {
          pagador: true,
          formaPagamento: true,
          valorPago: true,
          dataPagamento: true,
          mesReferencia: true,
          anoReferencia: true,
        },
        orderBy: [
          { anoReferencia: 'desc' },
          { mesReferencia: 'desc' },
        ],
      });

      // Extrair pagadores únicos com informações
      const pagadoresMap = new Map();
      pagamentos.forEach(p => {
        if (p.pagador && !pagadoresMap.has(p.pagador)) {
          pagadoresMap.set(p.pagador, {
            nome: p.pagador,
            formaPagamento: p.formaPagamento,
            ultimoValor: p.valorPago,
            ultimaData: p.dataPagamento,
            ultimoMes: p.mesReferencia,
            ultimoAno: p.anoReferencia,
          });
        }
      });

      return Array.from(pagadoresMap.values());
    } catch (error) {
      console.error('Erro ao buscar pagadores do idoso:', error);
      throw error;
    }
  });

  // Buscar idosos por pagador
  ipcMain.handle('idosos:getByPagador', async (event, pagador: string) => {
    try {
      const pagamentos = await prisma.pagamento.findMany({
        where: {
          pagador: {
            contains: pagador,
            mode: 'insensitive',
          },
        },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
        },
        orderBy: [
          { anoReferencia: 'desc' },
          { mesReferencia: 'desc' },
        ],
      });

      // Agrupar por idoso e retornar informações únicas
      const idososMap = new Map();
      pagamentos.forEach(p => {
        if (!idososMap.has(p.idoso.id)) {
          idososMap.set(p.idoso.id, {
            ...p.idoso,
            ultimoPagamento: {
              pagador: p.pagador,
              formaPagamento: p.formaPagamento,
              valorPago: p.valorPago,
              dataPagamento: p.dataPagamento,
              mesReferencia: p.mesReferencia,
              anoReferencia: p.anoReferencia,
            },
          });
        }
      });

      return Array.from(idososMap.values());
    } catch (error) {
      console.error('Erro ao buscar idosos por pagador:', error);
      throw error;
    }
  });

  // Buscar todos os pagamentos com dados dos idosos para histórico
  ipcMain.handle('pagamento:getAllWithIdosos', async (event) => {
    try {
      const pagamentos = await prisma.pagamento.findMany({
        where: {
          valorPago: { gt: 0 }, // Apenas pagamentos com valor
        },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
        },
        orderBy: [
          { anoReferencia: 'desc' },
          { mesReferencia: 'desc' },
          { dataPagamento: 'desc' },
        ],
        take: 100, // Limitar a 100 registros para performance
      });

      return pagamentos.map(p => ({
        idoso: {
          id: p.idoso.id,
          nome: p.idoso.nome,
          cpf: p.idoso.cpf,
          valorMensalidadeBase: p.idoso.valorMensalidadeBase,
          responsavel: {
            nome: p.idoso.responsavel.nome,
            cpf: p.idoso.responsavel.cpf,
          },
        },
        pagamento: {
          valorPago: p.valorPago,
          dataPagamento: p.dataPagamento?.toISOString() || new Date().toISOString(),
          nfse: p.nfse,
          pagador: p.pagador,
          formaPagamento: p.formaPagamento,
          mesReferencia: p.mesReferencia,
          anoReferencia: p.anoReferencia,
        },
      }));
    } catch (error) {
      console.error('Erro ao buscar pagamentos com idosos:', error);
      throw error;
    }
  });
}




