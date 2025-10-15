import { PrismaClient } from '@prisma/client';

class PrismaCleaner {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async cleanAllTables() {
    console.log('🗑️ Limpando todas as tabelas do Prisma...');
    
    try {
      // Ordem de exclusão respeitando foreign keys
      const operations = [
        { table: 'pagamento', model: this.prisma.pagamento },
        { table: 'notaFiscal', model: this.prisma.notaFiscal },
        { table: 'idoso', model: this.prisma.idoso },
        { table: 'responsavel', model: this.prisma.responsavel },
        { table: 'configuracao', model: this.prisma.configuracao }
      ];

      let totalRemoved = 0;

      for (const { table, model } of operations) {
        try {
          const result = await model.deleteMany({});
          console.log(`✅ ${table}: ${result.count} registros removidos`);
          totalRemoved += result.count;
        } catch (error) {
          console.log(`⚠️ ${table}: ${error.message}`);
        }
      }

      console.log(`✅ Total removido: ${totalRemoved} registros`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar tabelas:', error.message);
      return false;
    }
  }

  async resetDatabase() {
    console.log('🔄 Resetando banco de dados...');
    
    try {
      // Executar prisma db push com force reset
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      console.log('📋 Executando prisma db push --force-reset...');
      const { stdout, stderr } = await execAsync('npx prisma db push --force-reset');
      
      if (stderr && !stderr.includes('warning')) {
        console.error('❌ Erro no reset:', stderr);
        return false;
      }
      
      console.log('✅ Banco de dados resetado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao resetar banco:', error.message);
      return false;
    }
  }

  async seedDatabase() {
    console.log('🌱 Executando seed do banco...');
    
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      console.log('📋 Executando prisma db seed...');
      const { stdout, stderr } = await execAsync('npx prisma db seed');
      
      if (stderr && !stderr.includes('warning')) {
        console.error('❌ Erro no seed:', stderr);
        return false;
      }
      
      console.log('✅ Seed executado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao executar seed:', error.message);
      return false;
    }
  }

  async runFullClean() {
    console.log('🚀 LIMPEZA COMPLETA DO BANCO PRISMA');
    console.log('='.repeat(50));
    
    const results = {
      clean: false,
      reset: false,
      seed: false
    };
    
    try {
      // 1. Limpar todas as tabelas
      results.clean = await this.cleanAllTables();
      
      // 2. Resetar banco
      results.reset = await this.resetDatabase();
      
      // 3. Executar seed
      results.seed = await this.seedDatabase();
      
      // Relatório final
      console.log('\n' + '='.repeat(50));
      console.log('📊 RELATÓRIO DE LIMPEZA PRISMA');
      console.log('='.repeat(50));
      
      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;
      
      console.log(`✅ Sucessos: ${successCount}/${totalCount}`);
      console.log(`📈 Taxa de sucesso: ${((successCount / totalCount) * 100).toFixed(1)}%`);
      
      console.log('\n📋 Detalhes:');
      console.log(`${results.clean ? '✅' : '❌'} Limpeza de tabelas`);
      console.log(`${results.reset ? '✅' : '❌'} Reset do banco`);
      console.log(`${results.seed ? '✅' : '❌'} Seed inicial`);
      
      if (successCount === totalCount) {
        console.log('\n🎉 BANCO PRISMA LIMPO COM SUCESSO!');
        console.log('✅ Pronto para dados limpos!');
      } else {
        console.log('\n⚠️ LIMPEZA PARCIAL - Verifique os erros acima');
      }
      
      return results;
      
    } catch (error) {
      console.error('💥 Erro fatal:', error.message);
      return results;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Executar limpeza se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new PrismaCleaner();
  cleaner.runFullClean().then(results => {
    const successCount = Object.values(results).filter(Boolean).length;
    process.exit(successCount === Object.keys(results).length ? 0 : 1);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

export default PrismaCleaner;
