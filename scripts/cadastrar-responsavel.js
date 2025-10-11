import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cadastrarResponsavel() {
  try {
    console.log('➕ Cadastrando novo responsável no banco de dados...');
    
    const novoResponsavel = await prisma.responsavel.create({
      data: {
        nome: 'Maria Silva Santos',
        cpf: '123.456.789-00',
        contatoTelefone: '(45) 98888-7777',
        contatoEmail: 'maria.silva@email.com'
      }
    });

    console.log('✅ Responsável cadastrado com sucesso!');
    console.log('📋 Dados do responsável:');
    console.log(`   ID: ${novoResponsavel.id}`);
    console.log(`   Nome: ${novoResponsavel.nome}`);
    console.log(`   CPF: ${novoResponsavel.cpf}`);
    console.log(`   Telefone: ${novoResponsavel.contatoTelefone}`);
    console.log(`   Email: ${novoResponsavel.contatoEmail}`);
    console.log(`   Criado em: ${novoResponsavel.createdAt.toLocaleString('pt-BR')}`);

    // Listar todos os responsáveis após o cadastro
    console.log('\n🔍 Listando todos os responsáveis:');
    const todosResponsaveis = await prisma.responsavel.findMany({
      orderBy: { nome: 'asc' }
    });

    console.log(`📊 Total de responsáveis: ${todosResponsaveis.length}`);
    todosResponsaveis.forEach((resp, index) => {
      console.log(`${index + 1}. ${resp.nome} (CPF: ${resp.cpf})`);
    });

  } catch (error) {
    console.error('❌ Erro ao cadastrar responsável:', error);
    
    if (error.code === 'P2002') {
      console.log('💡 Erro: CPF já existe no banco de dados');
    }
  } finally {
    await prisma.$disconnect();
  }
}

cadastrarResponsavel();

