import fs from 'fs';
import path from 'path';

console.log('🚀 INICIANDO LIMPEZA DO SISTEMA PARA ENTREGA');
console.log('='.repeat(60));

// Função para log com timestamp
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

// Limpar arquivos de backup
function cleanBackups() {
  log('Limpando arquivos de backup...');
  
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    let removedCount = 0;
    
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir);
      
      files.forEach(file => {
        if (file.endsWith('.csv')) {
          const filePath = path.join(backupDir, file);
          fs.unlinkSync(filePath);
          log(`Removido backup: ${file}`, 'success');
          removedCount++;
        }
      });
    }
    
    if (removedCount === 0) {
      log('Nenhum arquivo de backup encontrado');
    } else {
      log(`${removedCount} arquivos de backup removidos`, 'success');
    }
    
    return removedCount;
  } catch (error) {
    log(`Erro ao limpar backups: ${error.message}`, 'error');
    return 0;
  }
}

// Limpar arquivos de log
function cleanLogs() {
  log('Limpando arquivos de log...');
  
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
        log(`Removido log: ${file}`, 'success');
        removedCount++;
      }
    });
    
    if (removedCount === 0) {
      log('Nenhum arquivo de log encontrado');
    } else {
      log(`${removedCount} arquivos de log removidos`, 'success');
    }
    
    return removedCount;
  } catch (error) {
    log(`Erro ao limpar logs: ${error.message}`, 'error');
    return 0;
  }
}

// Limpar arquivos temporários
function cleanTempFiles() {
  log('Limpando arquivos temporários...');
  
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
        log(`Removido temp: ${file}`, 'success');
        removedCount++;
      }
    });
    
    if (removedCount === 0) {
      log('Nenhum arquivo temporário encontrado');
    } else {
      log(`${removedCount} arquivos temporários removidos`, 'success');
    }
    
    return removedCount;
  } catch (error) {
    log(`Erro ao limpar arquivos temporários: ${error.message}`, 'error');
    return 0;
  }
}

// Criar script de limpeza do localStorage
function createLocalStorageCleaner() {
  log('Criando script de limpeza do localStorage...');
  
  try {
    const mockKeys = [
      'responsaveisMock',
      'idososMock', 
      'pagamentosMock',
      'notasFiscaisMock',
      'configuracoesMock',
      'logsMock'
    ];

    const cleanScript = `// Script para limpar localStorage
// Execute no console do navegador

const keys = ${JSON.stringify(mockKeys)};
console.log('🗑️ Limpando localStorage...');

keys.forEach(key => {
  localStorage.removeItem(key);
  console.log('✅ Removido:', key);
});

console.log('✅ localStorage limpo com sucesso!');
console.log('🔄 Recarregue a página para aplicar as mudanças');
`;

    const scriptPath = path.join(process.cwd(), 'clean-localStorage.js');
    fs.writeFileSync(scriptPath, cleanScript);
    
    log('Script criado: clean-localStorage.js', 'success');
    return true;
  } catch (error) {
    log(`Erro ao criar script: ${error.message}`, 'error');
    return false;
  }
}

// Criar instruções de limpeza
function createCleanupInstructions() {
  log('Criando instruções de limpeza...');
  
  try {
    const instructions = `# 🧹 INSTRUÇÕES DE LIMPEZA COMPLETA PARA ENTREGA

## ✅ Limpeza Automática Concluída:
- Arquivos de backup antigos removidos
- Arquivos de log antigos removidos  
- Arquivos temporários removidos
- Script de limpeza do localStorage criado

## 🔧 Limpeza Manual Necessária:

### 1. Limpar localStorage no navegador:
\`\`\`javascript
// Execute no console do navegador (F12)
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

### 3. Limpar cache do npm (opcional):
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

## 📋 Comandos Úteis:
\`\`\`bash
# Limpeza simples
npm run clean

# Limpeza do Prisma
npm run clean:prisma

# Limpeza completa
npm run clean:full

# Testar duplicatas
npm run test:duplicates:simple
\`\`\`
`;

    const instructionsPath = path.join(process.cwd(), 'CLEANUP_INSTRUCTIONS.md');
    fs.writeFileSync(instructionsPath, instructions);
    
    log('Instruções salvas em: CLEANUP_INSTRUCTIONS.md', 'success');
    return true;
  } catch (error) {
    log(`Erro ao criar instruções: ${error.message}`, 'error');
    return false;
  }
}

// Executar limpeza
async function runCleanup() {
  try {
    const results = {
      backups: cleanBackups(),
      logs: cleanLogs(),
      temp: cleanTempFiles(),
      script: createLocalStorageCleaner(),
      instructions: createCleanupInstructions()
    };
    
    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE LIMPEZA');
    console.log('='.repeat(60));
    
    const totalFiles = results.backups + results.logs + results.temp;
    const successCount = Object.values(results).filter(Boolean).length;
    
    console.log(`✅ Arquivos removidos: ${totalFiles}`);
    console.log(`✅ Operações bem-sucedidas: ${successCount}/5`);
    console.log(`📈 Taxa de sucesso: ${((successCount / 5) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detalhes:');
    console.log(`✅ Backups: ${results.backups} arquivos`);
    console.log(`✅ Logs: ${results.logs} arquivos`);
    console.log(`✅ Temporários: ${results.temp} arquivos`);
    console.log(`${results.script ? '✅' : '❌'} Script localStorage`);
    console.log(`${results.instructions ? '✅' : '❌'} Instruções`);
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Execute as limpezas manuais em CLEANUP_INSTRUCTIONS.md');
    console.log('2. Teste o sistema com dados limpos');
    console.log('3. Gere novo backup inicial');
    console.log('4. Sistema pronto para entrega!');
    
    console.log('\n🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('✅ Sistema preparado para entrega final!');
    
  } catch (error) {
    log(`Erro fatal: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Executar limpeza
runCleanup();
