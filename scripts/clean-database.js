import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

class DatabaseCleaner {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async cleanPrismaDatabase() {
    console.log('🗑️ Limpando banco de dados Prisma...');
    
    try {
      // Ordem de exclusão (respeitando foreign keys)
      const tables = [
        'pagamento',
        'notaFiscal', 
        'idoso',
        'responsavel',
        'configuracao'
      ];

      for (const table of tables) {
        try {
          const result = await this.prisma[table].deleteMany({});
          console.log(`✅ ${table}: ${result.count} registros removidos`);
        } catch (error) {
          console.log(`⚠️ ${table}: ${error.message}`);
        }
      }

      console.log('✅ Banco de dados Prisma limpo com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar banco Prisma:', error.message);
      return false;
    }
  }

  async cleanMockData() {
    console.log('🗑️ Limpando dados mockados (localStorage)...');
    
    try {
      // Lista de chaves do localStorage para limpar
      const mockKeys = [
        'responsaveisMock',
        'idososMock', 
        'pagamentosMock',
        'notasFiscaisMock',
        'configuracoesMock',
        'logsMock'
      ];

      // Criar arquivo HTML temporário para limpar localStorage
      const cleanScript = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Limpando localStorage</title>
        </head>
        <body>
          <h1>Limpando dados mockados...</h1>
          <div id="status"></div>
          <script>
            const keys = ${JSON.stringify(mockKeys)};
            const status = document.getElementById('status');
            
            keys.forEach(key => {
              localStorage.removeItem(key);
              status.innerHTML += '<p>✅ Removido: ' + key + '</p>';
            });
            
            status.innerHTML += '<p><strong>✅ localStorage limpo com sucesso!</strong></p>';
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
        </html>
      `;

      const tempFile = path.join(process.cwd(), 'temp-clean.html');
      fs.writeFileSync(tempFile, cleanScript);
      
      console.log('📄 Arquivo temporário criado para limpeza do localStorage');
      console.log('ℹ️ Abra o arquivo temp-clean.html no navegador para limpar localStorage');
      console.log('ℹ️ Ou execute manualmente no console do navegador:');
      
      mockKeys.forEach(key => {
        console.log(`   localStorage.removeItem('${key}');`);
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar dados mockados:', error.message);
      return false;
    }
  }

  async cleanBackupFiles() {
    console.log('🗑️ Limpando arquivos de backup...');
    
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      
      if (fs.existsSync(backupDir)) {
        const files = fs.readdirSync(backupDir);
        let removedCount = 0;
        
        files.forEach(file => {
          if (file.endsWith('.csv')) {
            const filePath = path.join(backupDir, file);
            fs.unlinkSync(filePath);
            console.log(`✅ Removido: ${file}`);
            removedCount++;
          }
        });
        
        console.log(`✅ ${removedCount} arquivos de backup removidos`);
      } else {
        console.log('ℹ️ Diretório de backups não encontrado');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar backups:', error.message);
      return false;
    }
  }

  async cleanLogFiles() {
    console.log('🗑️ Limpando arquivos de log...');
    
    try {
      const logFiles = [
        'logs.json',
        'error.log',
        'access.log',
        'app.log'
      ];
      
      let removedCount = 0;
      
      logFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Removido: ${file}`);
          removedCount++;
        }
      });
      
      if (removedCount === 0) {
        console.log('ℹ️ Nenhum arquivo de log encontrado');
      } else {
        console.log(`✅ ${removedCount} arquivos de log removidos`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar logs:', error.message);
      return false;
    }
  }

  async cleanTempFiles() {
    console.log('🗑️ Limpando arquivos temporários...');
    
    try {
      const tempFiles = [
        'temp-clean.html',
        'test-backup.html',
        'check_localStorage.html'
      ];
      
      let removedCount = 0;
      
      tempFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Removido: ${file}`);
          removedCount++;
        }
      });
      
      if (removedCount === 0) {
        console.log('ℹ️ Nenhum arquivo temporário encontrado');
      } else {
        console.log(`✅ ${removedCount} arquivos temporários removidos`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar arquivos temporários:', error.message);
      return false;
    }
  }

  async resetDatabaseSchema() {
    console.log('🔄 Resetando schema do banco de dados...');
    
    try {
      // Executar prisma db push para resetar schema
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      console.log('📋 Executando prisma db push...');
      const { stdout, stderr } = await execAsync('npx prisma db push --force-reset');
      
      if (stderr && !stderr.includes('warning')) {
        console.error('❌ Erro no prisma db push:', stderr);
        return false;
      }
      
      console.log('✅ Schema do banco resetado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao resetar schema:', error.message);
      return false;
    }
  }

  async generateCleanDatabase() {
    console.log('🌱 Gerando banco de dados limpo...');
    
    try {
      // Executar seed para criar dados iniciais limpos
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      console.log('📋 Executando prisma seed...');
      const { stdout, stderr } = await execAsync('npx prisma db seed');
      
      if (stderr && !stderr.includes('warning')) {
        console.error('❌ Erro no prisma seed:', stderr);
        return false;
      }
      
      console.log('✅ Banco de dados limpo gerado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao gerar banco limpo:', error.message);
      return false;
    }
  }

  async runFullClean() {
    console.log('🚀 INICIANDO LIMPEZA COMPLETA DO SISTEMA');
    console.log('='.repeat(60));
    
    const results = {
      prisma: false,
      mock: false,
      backups: false,
      logs: false,
      temp: false,
      schema: false,
      seed: false
    };
    
    try {
      // 1. Limpar banco Prisma
      results.prisma = await this.cleanPrismaDatabase();
      
      // 2. Limpar dados mockados
      results.mock = await this.cleanMockData();
      
      // 3. Limpar arquivos de backup
      results.backups = await this.cleanBackupFiles();
      
      // 4. Limpar arquivos de log
      results.logs = await this.cleanLogFiles();
      
      // 5. Limpar arquivos temporários
      results.temp = await this.cleanTempFiles();
      
      // 6. Resetar schema do banco
      results.schema = await this.resetDatabaseSchema();
      
      // 7. Gerar banco limpo
      results.seed = await this.generateCleanDatabase();
      
      // Relatório final
      console.log('\n' + '='.repeat(60));
      console.log('📊 RELATÓRIO DE LIMPEZA');
      console.log('='.repeat(60));
      
      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;
      
      console.log(`✅ Sucessos: ${successCount}/${totalCount}`);
      console.log(`📈 Taxa de sucesso: ${((successCount / totalCount) * 100).toFixed(1)}%`);
      
      console.log('\n📋 Detalhes:');
      Object.entries(results).forEach(([key, success]) => {
        const status = success ? '✅' : '❌';
        const name = {
          prisma: 'Banco Prisma',
          mock: 'Dados Mockados',
          backups: 'Arquivos de Backup',
          logs: 'Arquivos de Log',
          temp: 'Arquivos Temporários',
          schema: 'Schema do Banco',
          seed: 'Dados Iniciais'
        }[key];
        console.log(`${status} ${name}`);
      });
      
      if (successCount === totalCount) {
        console.log('\n🎉 LIMPEZA COMPLETA REALIZADA COM SUCESSO!');
        console.log('✅ Sistema pronto para entrega!');
      } else {
        console.log('\n⚠️ LIMPEZA PARCIAL - Alguns itens falharam');
        console.log('🔧 Verifique os erros acima e execute novamente se necessário');
      }
      
      return results;
      
    } catch (error) {
      console.error('💥 Erro fatal durante limpeza:', error.message);
      return results;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Executar limpeza se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new DatabaseCleaner();
  cleaner.runFullClean().then(results => {
    const successCount = Object.values(results).filter(Boolean).length;
    process.exit(successCount === Object.keys(results).length ? 0 : 1);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

export default DatabaseCleaner;
