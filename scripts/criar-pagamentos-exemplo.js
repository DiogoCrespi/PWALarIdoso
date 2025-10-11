import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criarPagamentosExemplo() {
  try {
    console.log('➕ Criando pagamentos de exemplo no banco de dados...');
    
    // Buscar o idoso de teste
    const idoso = await prisma.idoso.findFirst({
      where: { ativo: true }
    });

    if (!idoso) {
      console.log('❌ Nenhum idoso ativo encontrado. Criando um primeiro...');
      return;
    }

    console.log(`📋 Idoso encontrado: ${idoso.nome} (ID: ${idoso.id})`);

    // Criar pagamentos de exemplo para 2025
    const pagamentosExemplo = [
      {
        idosoId: idoso.id,
        mesReferencia: 9, // Setembro
        anoReferencia: 2025,
        valorPago: 2500.00,
        dataPagamento: new Date('2025-09-15'),
        nfse: '1491',
        status: 'PAGO',
        valorDoacaoCalculado: 0,
        observacoes: 'Pagamento integral de setembro'
      },
      {
        idosoId: idoso.id,
        mesReferencia: 10, // Outubro
        anoReferencia: 2025,
        valorPago: 1500.00,
        dataPagamento: new Date('2025-10-10'),
        nfse: '1492',
        status: 'PARCIAL',
        valorDoacaoCalculado: 0,
        observacoes: 'Pagamento parcial de outubro'
      },
      {
        idosoId: idoso.id,
        mesReferencia: 11, // Novembro
        anoReferencia: 2025,
        valorPago: 0,
        dataPagamento: null,
        nfse: null,
        status: 'PENDENTE',
        valorDoacaoCalculado: 0,
        observacoes: 'Pagamento pendente'
      }
    ];

    console.log('\n💾 Criando pagamentos...');
    
    for (const pagamentoData of pagamentosExemplo) {
      const pagamento = await prisma.pagamento.create({
        data: pagamentoData
      });
      
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesNome = meses[pagamentoData.mesReferencia - 1];
      
      console.log(`✅ Pagamento criado: ${mesNome}/2025 - ${pagamentoData.status} (R$ ${pagamentoData.valorPago.toFixed(2)})`);
    }

    // Verificar total de pagamentos
    const totalPagamentos = await prisma.pagamento.count({
      where: { anoReferencia: 2025 }
    });

    console.log(`\n📊 Total de pagamentos em 2025: ${totalPagamentos}`);

    // Listar todos os pagamentos
    const todosPagamentos = await prisma.pagamento.findMany({
      where: { anoReferencia: 2025 },
      include: {
        idoso: true
      },
      orderBy: [
        { idosoId: 'asc' },
        { mesReferencia: 'asc' }
      ]
    });

    console.log('\n📋 Lista de Pagamentos:');
    todosPagamentos.forEach(pag => {
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesNome = meses[pag.mesReferencia - 1];
      console.log(`   ${pag.idoso.nome} - ${mesNome}/2025: ${pag.status} (R$ ${pag.valorPago.toFixed(2)})`);
    });

    console.log('\n✅ Pagamentos de exemplo criados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar pagamentos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarPagamentosExemplo();

