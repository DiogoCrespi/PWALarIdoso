import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function consultarIdosos() {
  try {
    console.log('🔍 Consultando idosos no banco de dados...');
    
    const idosos = await prisma.idoso.findMany({
      include: {
        responsavel: true,
        pagamentos: true
      },
      orderBy: { nome: 'asc' }
    });

    console.log(`📊 Total de idosos encontrados: ${idosos.length}`);
    console.log('\n📋 Lista de Idosos:');
    console.log('=' .repeat(80));

    if (idosos.length === 0) {
      console.log('❌ Nenhum idoso cadastrado no banco de dados.');
    } else {
      idosos.forEach((idoso, index) => {
        console.log(`\n${index + 1}. ID: ${idoso.id}`);
        console.log(`   Nome: ${idoso.nome}`);
        console.log(`   CPF: ${idoso.cpf || 'Não informado'}`);
        console.log(`   Data Nascimento: ${idoso.dataNascimento ? idoso.dataNascimento.toLocaleDateString('pt-BR') : 'Não informada'}`);
        console.log(`   Responsável: ${idoso.responsavel.nome} (ID: ${idoso.responsavel.id})`);
        console.log(`   Mensalidade: R$ ${idoso.valorMensalidadeBase.toFixed(2)}`);
        console.log(`   Ativo: ${idoso.ativo ? 'Sim' : 'Não'}`);
        console.log(`   Pagamentos: ${idoso.pagamentos.length}`);
        console.log(`   Criado em: ${idoso.createdAt.toLocaleString('pt-BR')}`);
        console.log('-'.repeat(60));
      });
    }

    console.log('\n✅ Consulta concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao consultar idosos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

consultarIdosos();

