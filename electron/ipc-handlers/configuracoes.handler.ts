import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupConfiguracoesHandlers() {
  // Listar todas as configurações
  ipcMain.handle('configuracoes:list', async () => {
    try {
      const configuracoes = await prisma.configuracao.findMany({
        orderBy: { chave: 'asc' },
      });
      return configuracoes;
    } catch (error) {
      console.error('Erro ao listar configurações:', error);
      throw error;
    }
  });

  // Buscar configuração por chave
  ipcMain.handle('configuracoes:get', async (event, chave: string) => {
    try {
      const configuracao = await prisma.configuracao.findUnique({
        where: { chave },
      });
      return configuracao;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      throw error;
    }
  });

  // Criar ou atualizar configuração
  ipcMain.handle('configuracoes:set', async (event, chave: string, valor: string) => {
    try {
      const configuracao = await prisma.configuracao.upsert({
        where: { chave },
        update: { valor },
        create: {
          chave,
          valor,
        },
      });
      return configuracao;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      throw error;
    }
  });
}




