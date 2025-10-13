/**
 * Sistema de Logs Detalhado para o Lar dos Idosos
 * 
 * Este sistema fornece logging estruturado com diferentes níveis,
 * persistência local e integração com o console do navegador.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  stack?: string;
}

export interface LoggerConfig {
  maxEntries: number;
  persistToLocalStorage: boolean;
  enableConsole: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  logLevel: LogLevel;
}

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private sessionId: string;
  private userId?: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      maxEntries: 1000,
      persistToLocalStorage: true,
      enableConsole: true,
      enableRemoteLogging: false,
      logLevel: LogLevel.INFO,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.loadLogsFromStorage();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Capturar erros JavaScript não tratados
    window.addEventListener('error', (event) => {
      this.error('JavaScript Error', 'GLOBAL_ERROR', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Capturar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', 'PROMISE_REJECTION', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Capturar erros de recursos (imagens, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.warn('Resource Error', 'RESOURCE_ERROR', {
          target: event.target,
          type: (event.target as any).tagName
        });
      }
    }, true);
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any
  ): LogEntry {
    return {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: level >= LogLevel.ERROR ? new Error().stack : undefined
    };
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addLog(entry: LogEntry): void {
    // Verificar se o nível de log está habilitado
    if (entry.level < this.config.logLevel) {
      return;
    }

    this.logs.unshift(entry);

    // Manter apenas o número máximo de entradas
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(0, this.config.maxEntries);
    }

    // Persistir no localStorage se habilitado
    if (this.config.persistToLocalStorage) {
      this.saveLogsToStorage();
    }

    // Log no console se habilitado
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Enviar para servidor remoto se habilitado
    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleString('pt-BR');
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}] [${entry.category}]`;

    const logData = {
      message: entry.message,
      data: entry.data,
      sessionId: entry.sessionId,
      userId: entry.userId
    };

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, logData);
        break;
      case LogLevel.INFO:
        console.info(prefix, logData);
        break;
      case LogLevel.WARN:
        console.warn(prefix, logData);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, logData);
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Não logar erros de envio remoto para evitar loops
      console.warn('Failed to send log to remote endpoint:', error);
    }
  }

  private saveLogsToStorage(): void {
    try {
      localStorage.setItem('lar_idosos_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  private loadLogsFromStorage(): void {
    try {
      const savedLogs = localStorage.getItem('lar_idosos_logs');
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
    }
  }

  // Métodos públicos de logging
  public debug(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry(LogLevel.DEBUG, category, message, data));
  }

  public info(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry(LogLevel.INFO, category, message, data));
  }

  public warn(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry(LogLevel.WARN, category, message, data));
  }

  public error(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry(LogLevel.ERROR, category, message, data));
  }

  public critical(category: string, message: string, data?: any): void {
    this.addLog(this.createLogEntry(LogLevel.CRITICAL, category, message, data));
  }

  // Métodos de gerenciamento
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public getLogs(filter?: {
    level?: LogLevel;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.level !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.level >= filter.level!);
      }

      if (filter.category) {
        filteredLogs = filteredLogs.filter(log => 
          log.category.toLowerCase().includes(filter.category!.toLowerCase())
        );
      }

      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= filter.startDate!
        );
      }

      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= filter.endDate!
        );
      }

      if (filter.limit) {
        filteredLogs = filteredLogs.slice(0, filter.limit);
      }
    }

    return filteredLogs;
  }

  public clearLogs(): void {
    this.logs = [];
    if (this.config.persistToLocalStorage) {
      localStorage.removeItem('lar_idosos_logs');
    }
  }

  public exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Data', 'SessionId', 'UserId'];
      const csvRows = [headers.join(',')];
      
      this.logs.forEach(log => {
        const row = [
          log.timestamp,
          LogLevel[log.level],
          log.category,
          `"${log.message.replace(/"/g, '""')}"`,
          `"${JSON.stringify(log.data || {}).replace(/"/g, '""')}"`,
          log.sessionId,
          log.userId || ''
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    }

    return JSON.stringify(this.logs, null, 2);
  }

  public getStats(): {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    oldestLog?: string;
    newestLog?: string;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      oldestLog: undefined as string | undefined,
      newestLog: undefined as string | undefined
    };

    if (this.logs.length > 0) {
      stats.oldestLog = this.logs[this.logs.length - 1].timestamp;
      stats.newestLog = this.logs[0].timestamp;
    }

    this.logs.forEach(log => {
      const levelName = LogLevel[log.level];
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  }

  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Instância global do logger
export const logger = new Logger({
  maxEntries: 2000,
  persistToLocalStorage: true,
  enableConsole: true,
  logLevel: LogLevel.INFO
});

// Funções de conveniência para uso global
export const logDebug = (category: string, message: string, data?: any) => 
  logger.debug(category, message, data);

export const logInfo = (category: string, message: string, data?: any) => 
  logger.info(category, message, data);

export const logWarn = (category: string, message: string, data?: any) => 
  logger.warn(category, message, data);

export const logError = (category: string, message: string, data?: any) => 
  logger.error(category, message, data);

export const logCritical = (category: string, message: string, data?: any) => 
  logger.critical(category, message, data);

// Hook para React
export const useLogger = () => {
  return {
    debug: logDebug,
    info: logInfo,
    warn: logWarn,
    error: logError,
    critical: logCritical,
    getLogs: (filter?: any) => logger.getLogs(filter),
    clearLogs: () => logger.clearLogs(),
    exportLogs: (format?: 'json' | 'csv') => logger.exportLogs(format),
    getStats: () => logger.getStats()
  };
};

export default logger;
