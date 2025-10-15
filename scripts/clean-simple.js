import fs from 'fs';
import path from 'path';

class SimpleCleaner {
  constructor() {
    this.cleanedItems = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async cleanLocalStorage() {
    this.log('Limpando dados do localStorage...');
    
    const mockKeys = [
      'responsaveisMock',
      'idososMock', 
      'pagamentosMock',
      'notasFiscaisMock',
      'configuracoesMock',
      'logsMock'
    ];

    // Criar script de limpeza
    const cleanScript = `
// Script para limpar localStorage
const keys = ${JSON.stringify(mockKeys)};
console.log('🗑️ Limpando localStorage...');
keys.forEach(key => {
  localStorage.removeItem(key);
  console.log('✅ Removido:', key);
});
console.log('✅ localStorage limpo com sucesso!');
`;

    const scriptPath = path.join(process.cwd(), 'clean-localStorage.js');
    fs.writeFileSync(scriptPath, cleanScript);
    
    this.log('Script de limpeza criado: clean-localStorage.js');
    this.log('Execute no console do navegador ou importe o arquivo');
    
    this.cleanedItems.push('localStorage script');
    return true;
  }

  async cleanBackupFiles() {
    this.log('Limpando arquivos de backup...');
    
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      let removedCount = 0;
      
      if (fs.existsSync(backupDir)) {
        const files = fs.readdirSync(backupDir);
        
        files.forEach(file => {
          if (file.endsWith('.csv')) {
            const filePath = path.join(backupDir, file);
            fs.unlinkSync(filePath);
            this.log(`Removido backup: ${file}`, 'success');
            removedCount++;
          }
        });
      }
      
      if (removedCount === 0) {
        this.log('Nenhum arquivo de backup encontrado');
      } else {
        this.log(`${removedCount} arquivos de backup removidos`, 'success');
      }
      
      this.cleanedItems.push(`${removedCount} backups`);
      return true;
    } catch (error) {
      this.log(`Erro ao limpar backups: ${error.message}`, 'error');
      this.errors.push(`Backups: ${error.message}`);
      return false;
    }
  }

  async cleanLogFiles() {
    this.log('Limpando arquivos de log...');
    
    try {
      const logFiles = [
        'logs.json',
        'error.log',
        'access.log',
        'app.log',
        'console.log'
      ];
      
      let removedCount = 0;
      
      logFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.log(`Removido log: ${file}`, 'success');
          removedCount++;
        }
      });
      
      if (removedCount === 0) {
        this.log('Nenhum arquivo de log encontrado');
      } else {
        this.log(`${removedCount} arquivos de log removidos`, 'success');
      }
      
      this.cleanedItems.push(`${removedCount} logs`);
      return true;
    } catch (error) {
      this.log(`Erro ao limpar logs: ${error.message}`, 'error');
      this.errors.push(`Logs: ${error.message}`);
      return false;
    }
  }

  async cleanTempFiles() {
    this.log('Limpando arquivos temporários...');
    
    try {
      const tempFiles = [
        'temp-clean.html',
        'test-backup.html',
        'check_localStorage.html',
        'clean-localStorage.js'
      ];
      
      let removedCount = 0;
      
      tempFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.log(`Removido temp: ${file}`, 'success');
          removedCount++;
        }
      });
      
      if (removedCount === 0) {
        this.log('Nenhum arquivo temporário encontrado');
      } else {
        this.log(`${removedCount} arquivos temporários removidos`, 'success');
      }
      
      this.cleanedItems.push(`${removedCount} temp files`);
      return true;
    } catch (error) {
      this.log(`Erro ao limpar arquivos temporários: ${error.message}`, 'error');
      this.errors.push(`Temp files: ${error.message}`);
      return false;
    }
  }

  async cleanNodeModules() {
    this.log('Verificando node_modules...');
    
    try {
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');
      
      if (fs.existsSync(nodeModulesPath)) {
        this.log('node_modules encontrado - mantenha para produção');
        this.log('Para limpar completamente: rm -rf node_modules && npm install');
      } else {
        this.log('node_modules não encontrado');
      }
      
      return true;
    } catch (error) {
      this.log(`Erro ao verificar node_modules: ${error.message}`, 'error');
      return false;
    }
  }

  async generateCleanInstructions() {
    this.log('Gerando instruções de limpeza...');
    
    const instructions = `
# 🧹 INSTRUÇÕES DE LIMPEZA COMPLETA

## ✅ Arquivos Limpos Automaticamente:
${this.cleanedItems.map(item => `- ${item}`).join('\n')}

## 🔧 Limpeza Manual Necessária:

### 1. Limpar localStorage no navegador:
\`\`\`javascript
// Execute no console do navegador
const keys = ['responsaveisMock', 'idososMock', 'pagamentosMock', 'notasFiscaisMock', 'configuracoesMock', 'logsMock'];
keys.forEach(key => localStorage.removeItem(key));
console.log('✅ localStorage limpo!');
\`\`\`

### 2. Limpar banco de dados Prisma:
\`\`\`bash
# Resetar banco de dados
npx prisma db push --force-reset

# Gerar dados iniciais limpos
npx prisma db seed
\`\`\`

### 3. Limpar node_modules (opcional):
\`\`\`bash
# Remover e reinstalar dependências
rm -rf node_modules
npm install
\`\`\`

### 4. Limpar cache do npm:
\`\`\`bash
npm cache clean --force
\`\`\`

## 🎯 Sistema Pronto para Entrega:
- ✅ Dados mockados limpos
- ✅ Arquivos temporários removidos
- ✅ Backups antigos removidos
- ✅ Logs antigos removidos
- ✅ Instruções de limpeza geradas

## 🚀 Próximos Passos:
1. Execute as limpezas manuais acima
2. Teste o sistema com dados limpos
3. Gere novo backup inicial
4. Prepare para entrega final
`;

    const instructionsPath = path.join(process.cwd(), 'CLEANUP_INSTRUCTIONS.md');
    fs.writeFileSync(instructionsPath, instructions);
    
    this.log('Instruções salvas em: CLEANUP_INSTRUCTIONS.md', 'success');
    return true;
  }

  async runClean() {
    console.log('🚀 INICIANDO LIMPEZA SIMPLES DO SISTEMA');
    console.log('='.repeat(50));
    
    try {
      // Executar limpezas
      await this.cleanLocalStorage();
      await this.cleanBackupFiles();
      await this.cleanLogFiles();
      await this.cleanTempFiles();
      await this.cleanNodeModules();
      await this.generateCleanInstructions();
      
      // Relatório final
      console.log('\n' + '='.repeat(50));
      console.log('📊 RELATÓRIO DE LIMPEZA');
      console.log('='.repeat(50));
      
      console.log(`✅ Itens limpos: ${this.cleanedItems.length}`);
      this.cleanedItems.forEach(item => {
        console.log(`   - ${item}`);
      });
      
      if (this.errors.length > 0) {
        console.log(`❌ Erros: ${this.errors.length}`);
        this.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }
      
      console.log('\n📋 Próximos passos:');
      console.log('1. Execute as limpezas manuais em CLEANUP_INSTRUCTIONS.md');
      console.log('2. Teste o sistema com dados limpos');
      console.log('3. Gere novo backup inicial');
      console.log('4. Sistema pronto para entrega!');
      
      console.log('\n🎉 LIMPEZA CONCLUÍDA!');
      
      return {
        success: this.errors.length === 0,
        cleaned: this.cleanedItems.length,
        errors: this.errors.length
      };
      
    } catch (error) {
      this.log(`Erro fatal: ${error.message}`, 'error');
      return {
        success: false,
        cleaned: this.cleanedItems.length,
        errors: this.errors.length + 1
      };
    }
  }
}

// Executar limpeza se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new SimpleCleaner();
  cleaner.runClean().then(results => {
    process.exit(results.success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

export default SimpleCleaner;
