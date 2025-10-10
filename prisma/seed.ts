import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar configurações padrão (usando upsert para evitar duplicatas)
  const configuracoes = [
    {
      chave: 'caminho_recibos_doacao',
      valor: 'C:\\Nestjs\\PWALarIdosos\\RECIBOS DOAÇÃO LAR',
      descricao: 'Pasta de rede para salvar recibos de doação',
    },
    {
      chave: 'caminho_recibos_mensalidade',
      valor: 'C:\\Nestjs\\PWALarIdosos\\RECIBOS',
      descricao: 'Pasta base para salvar recibos de mensalidade',
    },
    {
      chave: 'cnpj_instituicao',
      valor: 'XX.XXX.XXX/XXXX-XX',
      descricao: 'CNPJ da instituição',
    },
    {
      chave: 'nome_instituicao',
      valor: 'Associação Filhas de São Camilo',
      descricao: 'Nome completo da instituição',
    },
    {
      chave: 'endereco_instituicao',
      valor: 'Matelândia - PR',
      descricao: 'Endereço da instituição',
    },
    {
      chave: 'ano_atual',
      valor: '2025',
      descricao: 'Ano de referência atual do sistema',
    },
  ];

  for (const config of configuracoes) {
    await prisma.configuracao.upsert({
      where: { chave: config.chave },
      update: {},
      create: config,
    });
  }

  console.log('✅ Configurações padrão criadas');

  // Exemplo: Criar um responsável e idoso de teste (opcional)
  const responsavelTeste = await prisma.responsavel.upsert({
    where: { cpf: '000.000.000-00' },
    update: {},
    create: {
      nome: 'Responsável de Teste',
      cpf: '000.000.000-00',
      contatoTelefone: '(45) 99999-9999',
      contatoEmail: 'teste@email.com',
    },
  });

  await prisma.idoso.upsert({
    where: { cpf: '111.111.111-11' },
    update: {},
    create: {
      nome: 'Idoso de Teste',
      cpf: '111.111.111-11',
      dataNascimento: new Date('1940-01-01'),
      responsavelId: responsavelTeste.id,
      valorMensalidadeBase: 2500.00,
      observacoes: 'Registro de teste - pode ser excluído',
    },
  });

  console.log('✅ Dados de exemplo criados');
  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

