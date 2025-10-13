import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { setupIdososHandlers } from './ipc-handlers/idosos.handler';
import { setupResponsaveisHandlers } from './ipc-handlers/responsaveis.handler';
import { setupPagamentosHandlers } from './ipc-handlers/pagamentos.handler';
import { setupRecibosHandlers } from './ipc-handlers/recibos.handler';
import { setupConfiguracoesHandlers } from './ipc-handlers/configuracoes.handler';
import { setupNotasFiscaisHandlers } from './ipc-handlers/notas-fiscais.handler';
import { setupTemplatesHandlers } from './ipc-handlers/templates.handler';

// Garantir que apenas uma instância rode
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow: BrowserWindow | null = null;

  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 768,
      title: 'Lar dos Idosos - Sistema de Controle',
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
      autoHideMenuBar: true,
      icon: join(__dirname, '../public/icon.png'),
    });

    // Carregar o app
    if (process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
      // Abrir DevTools em desenvolvimento
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(join(__dirname, '../dist/index.html'));
    }

    // Limpar referência quando fechar
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  };

  // Criar janela quando o app estiver pronto
  app.whenReady().then(() => {
    // Registrar todos os handlers IPC
    setupIdososHandlers();
    setupResponsaveisHandlers();
    setupPagamentosHandlers();
    setupRecibosHandlers();
    setupConfiguracoesHandlers();
    setupNotasFiscaisHandlers();
    setupTemplatesHandlers();

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  // Fechar app quando todas as janelas forem fechadas (exceto no macOS)
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // Se tentar abrir segunda instância, focar na primeira
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}




