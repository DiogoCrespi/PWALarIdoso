import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function consultarDashboard() {
  try {
    console.log('🔍 Consultando dados do dashboard no banco de dados...');
    
    // Buscar idosos ativos
    const idosos = await prisma.idoso.findMany({
      where: { ativo: true },
      include: {
        responsavel: true,
        pagamentos: {
          where: { anoReferencia: 2025 }
        }
      },
      orderBy: { nome: 'asc' }
    });

    console.log(`📊 Total de idosos ativos: ${idosos.length}`);
    
    // Buscar pagamentos do ano 2025
    const pagamentos = await prisma.pagamento.findMany({
      where: { anoReferencia: 2025 },
      include: {
        idoso: {
          include: {
            responsavel: true
          }
        }
      }
    });

    console.log(`📊 Total de pagamentos em 2025: ${pagamentos.length}`);

    // Organizar dados para o dashboard
    const pagamentosMap = {};
    pagamentos.forEach(pagamento => {
      if (!pagamentosMap[pagamento.idosoId]) {
        pagamentosMap[pagamento.idosoId] = {};
      }
      pagamentosMap[pagamento.idosoId][pagamento.mesReferencia] = {
        id: pagamento.id,
        status: pagamento.status,
        nfse: pagamento.nfse,
        valorPago: pagamento.valorPago,
        dataPagamento: pagamento.dataPagamento,
      };
    });

    console.log('\n📋 Dados do Dashboard:');
    console.log('=' .repeat(80));

    if (idosos.length === 0) {
      console.log('❌ Nenhum idoso ativo encontrado.');
    } else {
      console.log('\n👥 Idosos Ativos:');
      idosos.forEach((idoso, index) => {
        console.log(`\n${index + 1}. ${idoso.nome}`);
        console.log(`   CPF: ${idoso.cpf || 'Não informado'}`);
        console.log(`   Responsável: ${idoso.responsavel.nome}`);
        console.log(`   Mensalidade: R$ ${idoso.valorMensalidadeBase.toFixed(2)}`);
        console.log(`   Pagamentos em 2025: ${idoso.pagamentos.length}`);
        
        if (idoso.pagamentos.length > 0) {
          console.log('   Detalhes dos pagamentos:');
          idoso.pagamentos.forEach(pag => {
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            console.log(`     - ${meses[pag.mesReferencia - 1]}: ${pag.status} (R$ ${pag.valorPago.toFixed(2)})`);
          });
        }
        console.log('-'.repeat(60));
      });
    }

    console.log('\n📊 Resumo dos Pagamentos por Status:');
    const statusCount = pagamentos.reduce((acc, pag) => {
      acc[pag.status] = (acc[pag.status] || 0) + 1;
      return acc;
    }, {});

    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} pagamento(s)`);
    });

    console.log('\n✅ Consulta do dashboard concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao consultar dashboard:', error);
  } finally {
    await prisma.$disconnect();
  }
}

consultarDashboard();

