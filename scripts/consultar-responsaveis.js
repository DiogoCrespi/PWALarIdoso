import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function consultarResponsaveis() {
  try {
    console.log('🔍 Consultando responsáveis no banco de dados...');
    
    const responsaveis = await prisma.responsavel.findMany({
      include: {
        idosos: {
          where: { ativo: true }
        }
      },
      orderBy: { nome: 'asc' }
    });

    console.log(`📊 Total de responsáveis encontrados: ${responsaveis.length}`);
    console.log('\n📋 Lista de Responsáveis:');
    console.log('=' .repeat(80));

    if (responsaveis.length === 0) {
      console.log('❌ Nenhum responsável cadastrado no banco de dados.');
    } else {
      responsaveis.forEach((responsavel, index) => {
        console.log(`\n${index + 1}. ID: ${responsavel.id}`);
        console.log(`   Nome: ${responsavel.nome}`);
        console.log(`   CPF: ${responsavel.cpf}`);
        console.log(`   Telefone: ${responsavel.contatoTelefone || 'Não informado'}`);
        console.log(`   Email: ${responsavel.contatoEmail || 'Não informado'}`);
        console.log(`   Idosos vinculados: ${responsavel.idosos.length}`);
        console.log(`   Criado em: ${responsavel.createdAt.toLocaleString('pt-BR')}`);
        console.log(`   Atualizado em: ${responsavel.updatedAt.toLocaleString('pt-BR')}`);
        
        if (responsavel.idosos.length > 0) {
          console.log('   Idosos:');
          responsavel.idosos.forEach(idoso => {
            console.log(`     - ${idoso.nome} (ID: ${idoso.id})`);
          });
        }
        console.log('-'.repeat(60));
      });
    }

    console.log('\n✅ Consulta concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao consultar responsáveis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

consultarResponsaveis();

