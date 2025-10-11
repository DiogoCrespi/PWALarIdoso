import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testarCadastroIdoso() {
  try {
    console.log('🧪 Testando cadastro de idoso no banco de dados...');
    
    // Buscar responsável existente
    const responsavel = await prisma.responsavel.findFirst();
    
    if (!responsavel) {
      console.log('❌ Nenhum responsável encontrado. Criando um primeiro...');
      return;
    }

    console.log(`📋 Responsável encontrado: ${responsavel.nome} (ID: ${responsavel.id})`);

    // Dados do novo idoso
    const novoIdoso = {
      nome: 'Maria Silva Santos',
      cpf: '123.456.789-00',
      dataNascimento: new Date('1945-05-15'),
      responsavelId: responsavel.id,
      valorMensalidadeBase: 2800.00,
      ativo: true,
      observacoes: 'Teste de cadastro manual'
    };

    console.log('\n💾 Criando novo idoso...');
    console.log('📤 Dados:', novoIdoso);

    const idosoCriado = await prisma.idoso.create({
      data: novoIdoso,
      include: {
        responsavel: true
      }
    });

    console.log('✅ Idoso criado com sucesso!');
    console.log('📋 Dados do idoso criado:');
    console.log(`   ID: ${idosoCriado.id}`);
    console.log(`   Nome: ${idosoCriado.nome}`);
    console.log(`   CPF: ${idosoCriado.cpf}`);
    console.log(`   Data Nascimento: ${idosoCriado.dataNascimento?.toLocaleDateString()}`);
    console.log(`   Responsável: ${idosoCriado.responsavel.nome}`);
    console.log(`   Mensalidade: R$ ${idosoCriado.valorMensalidadeBase.toFixed(2)}`);
    console.log(`   Ativo: ${idosoCriado.ativo ? 'Sim' : 'Não'}`);
    console.log(`   Criado em: ${idosoCriado.createdAt.toLocaleString()}`);

    // Verificar total de idosos
    const totalIdosos = await prisma.idoso.count();
    console.log(`\n📊 Total de idosos no banco: ${totalIdosos}`);

    // Listar todos os idosos
    const todosIdosos = await prisma.idoso.findMany({
      include: {
        responsavel: true
      },
      orderBy: { nome: 'asc' }
    });

    console.log('\n📋 Lista de todos os idosos:');
    todosIdosos.forEach((idoso, index) => {
      console.log(`${index + 1}. ${idoso.nome} (CPF: ${idoso.cpf}) - Responsável: ${idoso.responsavel.nome}`);
    });

    console.log('\n✅ Teste de cadastro concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao testar cadastro de idoso:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarCadastroIdoso();

