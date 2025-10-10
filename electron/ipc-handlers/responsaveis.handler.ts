import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupResponsaveisHandlers() {
  // Listar todos os responsáveis
  ipcMain.handle('responsaveis:list', async () => {
    try {
      const responsaveis = await prisma.responsavel.findMany({
        include: {
          idosos: {
            where: { ativo: true },
          },
        },
        orderBy: { nome: 'asc' },
      });
      return responsaveis;
    } catch (error) {
      console.error('Erro ao listar responsáveis:', error);
      throw error;
    }
  });

  // Buscar responsável por ID
  ipcMain.handle('responsaveis:getById', async (event, id: number) => {
    try {
      const responsavel = await prisma.responsavel.findUnique({
        where: { id },
        include: {
          idosos: {
            where: { ativo: true },
          },
        },
      });
      return responsavel;
    } catch (error) {
      console.error('Erro ao buscar responsável:', error);
      throw error;
    }
  });

  // Criar novo responsável
  ipcMain.handle('responsaveis:create', async (event, data) => {
    try {
      const responsavel = await prisma.responsavel.create({
        data: {
          nome: data.nome,
          cpf: data.cpf,
          contatoTelefone: data.contatoTelefone,
          contatoEmail: data.contatoEmail,
        },
      });
      return responsavel;
    } catch (error) {
      console.error('Erro ao criar responsável:', error);
      throw error;
    }
  });

  // Atualizar responsável
  ipcMain.handle('responsaveis:update', async (event, id: number, data) => {
    try {
      const updateData: any = {};
      
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.cpf !== undefined) updateData.cpf = data.cpf;
      if (data.contatoTelefone !== undefined) updateData.contatoTelefone = data.contatoTelefone;
      if (data.contatoEmail !== undefined) updateData.contatoEmail = data.contatoEmail;

      const responsavel = await prisma.responsavel.update({
        where: { id },
        data: updateData,
      });
      return responsavel;
    } catch (error) {
      console.error('Erro ao atualizar responsável:', error);
      throw error;
    }
  });

  // Deletar responsável (apenas se não tiver idosos vinculados)
  ipcMain.handle('responsaveis:delete', async (event, id: number) => {
    try {
      // Verificar se tem idosos vinculados
      const responsavel = await prisma.responsavel.findUnique({
        where: { id },
        include: {
          idosos: {
            where: { ativo: true },
          },
        },
      });

      if (responsavel && responsavel.idosos.length > 0) {
        throw new Error('Não é possível excluir responsável com idosos vinculados');
      }

      await prisma.responsavel.delete({
        where: { id },
      });

      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao deletar responsável:', error);
      throw error;
    }
  });
}




