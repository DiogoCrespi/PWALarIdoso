import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupIdososHandlers() {
  // Listar todos os idosos ativos
  ipcMain.handle('idosos:list', async () => {
    try {
      const idosos = await prisma.idoso.findMany({
        include: {
          responsavel: true,
        },
        where: { ativo: true },
        orderBy: { nome: 'asc' },
      });
      return idosos;
    } catch (error) {
      console.error('Erro ao listar idosos:', error);
      throw error;
    }
  });

  // Buscar idoso por ID
  ipcMain.handle('idosos:getById', async (event, id: number) => {
    try {
      const idoso = await prisma.idoso.findUnique({
        where: { id },
        include: {
          responsavel: true,
          pagamentos: {
            orderBy: [
              { anoReferencia: 'desc' },
              { mesReferencia: 'desc' },
            ],
          },
        },
      });
      return idoso;
    } catch (error) {
      console.error('Erro ao buscar idoso:', error);
      throw error;
    }
  });

  // Criar novo idoso
  ipcMain.handle('idosos:create', async (event, data) => {
    try {
      const idoso = await prisma.idoso.create({
        data: {
          nome: data.nome,
          cpf: data.cpf,
          dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
          responsavelId: data.responsavelId,
          valorMensalidadeBase: parseFloat(data.valorMensalidadeBase),
          observacoes: data.observacoes,
        },
        include: {
          responsavel: true,
        },
      });
      return idoso;
    } catch (error) {
      console.error('Erro ao criar idoso:', error);
      throw error;
    }
  });

  // Atualizar idoso
  ipcMain.handle('idosos:update', async (event, id: number, data) => {
    try {
      const updateData: any = {};
      
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.cpf !== undefined) updateData.cpf = data.cpf;
      if (data.dataNascimento !== undefined) {
        updateData.dataNascimento = data.dataNascimento ? new Date(data.dataNascimento) : null;
      }
      if (data.responsavelId !== undefined) updateData.responsavelId = data.responsavelId;
      if (data.valorMensalidadeBase !== undefined) {
        updateData.valorMensalidadeBase = parseFloat(data.valorMensalidadeBase);
      }
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      if (data.ativo !== undefined) updateData.ativo = data.ativo;

      const idoso = await prisma.idoso.update({
        where: { id },
        data: updateData,
        include: {
          responsavel: true,
        },
      });
      return idoso;
    } catch (error) {
      console.error('Erro ao atualizar idoso:', error);
      throw error;
    }
  });

  // Desativar idoso (soft delete)
  ipcMain.handle('idosos:delete', async (event, id: number) => {
    try {
      const idoso = await prisma.idoso.update({
        where: { id },
        data: { ativo: false },
      });
      return idoso;
    } catch (error) {
      console.error('Erro ao desativar idoso:', error);
      throw error;
    }
  });

  // Ativar idoso
  ipcMain.handle('idosos:activate', async (event, id: number) => {
    try {
      const idoso = await prisma.idoso.update({
        where: { id },
        data: { ativo: true },
        include: {
          responsavel: true,
        },
      });
      return idoso;
    } catch (error) {
      console.error('Erro ao ativar idoso:', error);
      throw error;
    }
  });

  // Buscar idoso por nome/razão social
  ipcMain.handle('idosos:getByNome', async (event, nome: string) => {
    try {
      const idosos = await prisma.idoso.findMany({
        where: {
          nome: {
            contains: nome,
            mode: 'insensitive',
          },
        },
        include: {
          responsavel: true,
        },
        orderBy: { nome: 'asc' },
      });
      return idosos;
    } catch (error) {
      console.error('Erro ao buscar idosos por nome:', error);
      throw error;
    }
  });
}




