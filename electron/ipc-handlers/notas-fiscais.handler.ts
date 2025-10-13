import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para normalizar nomes e evitar duplicatas
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .trim();
}

// Função para buscar ou criar idoso
async function findOrCreateIdoso(nomePessoa: string, responsavelNome?: string, responsavelCpf?: string) {
  const nomeNormalizado = normalizeName(nomePessoa);
  
  // Primeiro, buscar idoso existente com nome EXATO (case-insensitive)
  const idosoExistente = await prisma.idoso.findFirst({
    where: {
      nome: {
        equals: nomePessoa,
        mode: 'insensitive',
      },
    },
    include: {
      responsavel: true,
    },
  });

  if (idosoExistente) {
    console.log('👤 Idoso encontrado com nome exato:', idosoExistente.nome);
    return idosoExistente;
  }

  // Se não encontrou com nome exato, buscar com contains (mais flexível)
  const idosoSimilar = await prisma.idoso.findFirst({
    where: {
      nome: {
        contains: nomePessoa,
        mode: 'insensitive',
      },
    },
    include: {
      responsavel: true,
    },
  });

  if (idosoSimilar) {
    console.log('👤 Idoso similar encontrado:', idosoSimilar.nome);
    return idosoSimilar;
  }

  // Se não encontrou, criar novo idoso
  let responsavelId = null;
  
  if (responsavelNome) {
    // Buscar responsável existente
    const responsavelExistente = await prisma.responsavel.findFirst({
      where: {
        nome: {
          contains: responsavelNome,
          mode: 'insensitive',
        },
      },
    });

    if (responsavelExistente) {
      responsavelId = responsavelExistente.id;
    } else {
      // Criar novo responsável
      const novoResponsavel = await prisma.responsavel.create({
        data: {
          nome: responsavelNome,
          cpf: responsavelCpf || '', // CPF fornecido ou vazio
          contatoTelefone: '',
          contatoEmail: '',
          endereco: '',
          ativo: true,
        },
      });
      responsavelId = novoResponsavel.id;
    }
  }

  // Criar novo idoso
  const novoIdoso = await prisma.idoso.create({
    data: {
      nome: nomePessoa,
      cpf: '', // CPF será preenchido posteriormente
      dataNascimento: null,
      responsavelId: responsavelId,
      valorMensalidadeBase: 2500, // Valor padrão
      tipo: 'REGULAR',
      observacoes: 'Idoso criado automaticamente via NFSE',
      ativo: true,
    },
    include: {
      responsavel: true,
    },
  });

  return novoIdoso;
}

export function setupNotasFiscaisHandlers() {
  // Listar todas as notas fiscais
  ipcMain.handle('notas-fiscais:list', async (event, filters?: { idosoId?: number; status?: string }) => {
    try {
      const where: any = {};
      
      if (filters?.idosoId) {
        where.idosoId = filters.idosoId;
      }
      
      if (filters?.status) {
        where.status = filters.status;
      }

      const notasFiscais = await prisma.notaFiscal.findMany({
        where,
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
          pagamento: true,
        },
        orderBy: [
          { anoReferencia: 'desc' },
          { mesReferencia: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return notasFiscais;
    } catch (error) {
      console.error('Erro ao listar notas fiscais:', error);
      throw error;
    }
  });

  // Criar nova nota fiscal (automática no pagamento)
  ipcMain.handle('notas-fiscais:create', async (event, data) => {
    try {
      let idosoId = data.idosoId;
      
      // Se não tem idosoId, buscar ou criar idoso automaticamente
      if (!idosoId && data.nomePessoa) {
        const idoso = await findOrCreateIdoso(data.nomePessoa, data.responsavelNome, data.responsavelCpf);
        idosoId = idoso.id;
        console.log('👤 Idoso encontrado/criado automaticamente:', idoso.nome);
      }

      const notaFiscal = await prisma.notaFiscal.create({
        data: {
          idosoId: idosoId,
          mesReferencia: data.mesReferencia,
          anoReferencia: data.anoReferencia,
          valor: data.valor,
          nomePessoa: data.nomePessoa,
          pagamentoId: data.pagamentoId,
          status: data.status || 'RASCUNHO',
          discriminacao: data.discriminacao,
          dataPrestacao: data.dataPrestacao ? new Date(data.dataPrestacao) : null,
          dataEmissao: data.dataEmissao ? new Date(data.dataEmissao) : null,
          numeroNFSE: data.numeroNFSE,
        },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
          pagamento: true,
        },
      });

      return notaFiscal;
    } catch (error) {
      console.error('Erro ao criar nota fiscal:', error);
      throw error;
    }
  });

  // Atualizar nota fiscal (via upload ou edição manual)
  ipcMain.handle('notas-fiscais:update', async (event, id: number, data) => {
    try {
      let idosoId = data.idosoId;
      
      // Se não tem idosoId, buscar ou criar idoso automaticamente
      if (!idosoId && data.nomePessoa) {
        const idoso = await findOrCreateIdoso(data.nomePessoa, data.responsavelNome, data.responsavelCpf);
        idosoId = idoso.id;
        console.log('👤 Idoso encontrado/criado automaticamente na atualização:', idoso.nome);
      }

      const notaFiscal = await prisma.notaFiscal.update({
        where: { id },
        data: {
          idosoId: idosoId,
          numeroNFSE: data.numeroNFSE,
          dataPrestacao: data.dataPrestacao ? new Date(data.dataPrestacao) : null,
          dataEmissao: data.dataEmissao ? new Date(data.dataEmissao) : null,
          discriminacao: data.discriminacao,
          valor: data.valor,
          nomePessoa: data.nomePessoa,
          arquivoOriginal: data.arquivoOriginal,
          status: data.status || 'COMPLETA',
        },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
          pagamento: true,
        },
      });

      return notaFiscal;
    } catch (error) {
      console.error('Erro ao atualizar nota fiscal:', error);
      throw error;
    }
  });

  // Buscar nota fiscal por ID
  ipcMain.handle('notas-fiscais:getById', async (event, id: number) => {
    try {
      const notaFiscal = await prisma.notaFiscal.findUnique({
        where: { id },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
          pagamento: true,
        },
      });

      return notaFiscal;
    } catch (error) {
      console.error('Erro ao buscar nota fiscal:', error);
      throw error;
    }
  });

  // Buscar notas fiscais por idoso
  ipcMain.handle('notas-fiscais:getByIdoso', async (event, idosoId: number) => {
    try {
      const notasFiscais = await prisma.notaFiscal.findMany({
        where: { idosoId },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
          pagamento: true,
        },
        orderBy: [
          { anoReferencia: 'desc' },
          { mesReferencia: 'desc' },
        ],
      });

      return notasFiscais;
    } catch (error) {
      console.error('Erro ao buscar notas fiscais do idoso:', error);
      throw error;
    }
  });

  // Cancelar nota fiscal (marca como CANCELADA)
  ipcMain.handle('notas-fiscais:cancel', async (event, id: number) => {
    try {
      const notaCancelada = await prisma.notaFiscal.update({
        where: { id },
        data: { status: 'CANCELADA' },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
          pagamento: true,
        },
      });
      return notaCancelada;
    } catch (error) {
      console.error('Erro ao cancelar nota fiscal:', error);
      throw error;
    }
  });

  // Deletar nota fiscal permanentemente
  ipcMain.handle('notas-fiscais:delete', async (event, id: number) => {
    try {
      const notaFiscal = await prisma.notaFiscal.delete({
        where: { id },
      });

      return notaFiscal;
    } catch (error) {
      console.error('Erro ao deletar nota fiscal:', error);
      throw error;
    }
  });

  // Buscar nota fiscal por pagamento
  ipcMain.handle('notas-fiscais:getByPagamento', async (event, pagamentoId: number) => {
    try {
      const notaFiscal = await prisma.notaFiscal.findFirst({
        where: { pagamentoId },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
          pagamento: true,
        },
      });

      return notaFiscal;
    } catch (error) {
      console.error('Erro ao buscar nota fiscal por pagamento:', error);
      throw error;
    }
  });
}
