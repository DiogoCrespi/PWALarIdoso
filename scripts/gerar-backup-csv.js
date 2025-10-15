import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function gerarBackupCSV() {
  try {
    console.log('📊 Gerando backup CSV dos dados...');
    
    // Buscar todos os dados
    const [responsaveis, idosos, pagamentos, configuracoes] = await Promise.all([
      prisma.responsavel.findMany({
        orderBy: { nome: 'asc' }
      }),
      prisma.idoso.findMany({
        include: {
          responsavel: true
        },
        orderBy: { nome: 'asc' }
      }),
      prisma.pagamento.findMany({
        include: {
          idoso: {
            include: {
              responsavel: true
            }
          }
        },
        orderBy: [
          { anoReferencia: 'desc' },
          { mesReferencia: 'desc' }
        ]
      }),
      prisma.configuracao.findMany({
        orderBy: { chave: 'asc' }
      })
    ]);

    console.log(`📋 Dados encontrados:`);
    console.log(`   - Responsáveis: ${responsaveis.length}`);
    console.log(`   - Idosos: ${idosos.length}`);
    console.log(`   - Pagamentos: ${pagamentos.length}`);
    console.log(`   - Configurações: ${configuracoes.length}`);

    // Gerar timestamp para nome do arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const nomeArquivo = `backup_lar_idosos_${timestamp}.csv`;
    
    // Caminho para salvar (pasta de backups)
    const caminhoBackup = path.join(process.cwd(), 'backups');
    
    // Criar pasta de backup se não existir
    if (!fs.existsSync(caminhoBackup)) {
      fs.mkdirSync(caminhoBackup, { recursive: true });
      console.log(`📁 Pasta de backup criada: ${caminhoBackup}`);
    }
    
    const caminhoCompleto = path.join(caminhoBackup, nomeArquivo);

    // Gerar conteúdo CSV
    let csvContent = '';
    
    // Cabeçalho
    csvContent += 'TIPO,ID,NOME,CPF,TELEFONE,EMAIL,DATA_NASCIMENTO,MENSALIDADE_BASE,BENEFICIO_SALARIO,TIPO_IDOSO,ATIVO,RESPONSAVEL_ID,RESPONSAVEL_NOME,RESPONSAVEL_CPF,STATUS_PAGAMENTO,VALOR_PAGO,NFSE,PAGADOR,FORMA_PAGAMENTO,DATA_PAGAMENTO,MES_REFERENCIA,ANO_REFERENCIA,VALOR_DOACAO,SALARIO_IDOSO,PERCENTUAL_BENEFICIO,VALOR_NFSE,OBSERVACOES,CRIADO_EM,ATUALIZADO_EM\n';
    
    // Responsáveis
    responsaveis.forEach(r => {
      csvContent += `RESPONSAVEL,${r.id},"${r.nome}","${r.cpf}","${r.contatoTelefone || ''}","${r.contatoEmail || ''}",,,,,,,,${r.ativo ? 'ATIVO' : 'INATIVO'},,,,,,,,,,,"${r.createdAt}","${r.updatedAt}"\n`;
    });
    
    // Idosos
    idosos.forEach(i => {
      csvContent += `IDOSO,${i.id},"${i.nome}","${i.cpf || ''}","","","${i.dataNascimento ? i.dataNascimento.toISOString().split('T')[0] : ''}","${i.valorMensalidadeBase}","${i.beneficioSalario || 0}","${i.tipo || 'REGULAR'}","${i.ativo ? 'ATIVO' : 'INATIVO'}",${i.responsavelId},"${i.responsavel?.nome || ''}","${i.responsavel?.cpf || ''}",,,,,,,,,,"${i.createdAt}","${i.updatedAt}"\n`;
    });
    
    // Pagamentos
    pagamentos.forEach(p => {
      // Calcular valores de benefício
      const salarioIdoso = p.idoso.beneficioSalario && p.idoso.beneficioSalario > 0 ? p.idoso.beneficioSalario : 0;
      const percentualBeneficio = 70;
      const valorNFSE = salarioIdoso * (percentualBeneficio / 100);
      const valorDoacao = Math.max(0, p.valorPago - valorNFSE);
      
      csvContent += `PAGAMENTO,${p.id},"${p.idoso.nome}","","","","","","","","","","","${p.status}","${p.valorPago}","${p.nfse || ''}","${p.pagador || ''}","${p.formaPagamento || ''}","${p.dataPagamento ? p.dataPagamento.toISOString().split('T')[0] : ''}","${p.mesReferencia}","${p.anoReferencia}","${valorDoacao}","${salarioIdoso}","${percentualBeneficio}","${valorNFSE}","${p.observacoes || ''}","${p.createdAt}","${p.updatedAt}"\n`;
    });
    
    // Configurações
    configuracoes.forEach(c => {
      csvContent += `CONFIGURACAO,${c.id},"${c.chave}","","","","","","","","","","","","","","","","","","","","","${c.valor}","${c.descricao || ''}","",""\n`;
    });

    // Salvar arquivo
    fs.writeFileSync(caminhoCompleto, csvContent, 'utf8');
    
    console.log(`✅ Backup CSV gerado com sucesso!`);
    console.log(`📁 Arquivo: ${caminhoCompleto}`);
    console.log(`📊 Tamanho: ${(fs.statSync(caminhoCompleto).size / 1024).toFixed(2)} KB`);
    
    // Estatísticas do backup
    console.log(`\n📈 Estatísticas do Backup:`);
    console.log(`   - Total de linhas: ${csvContent.split('\n').length - 1}`);
    console.log(`   - Responsáveis: ${responsaveis.length}`);
    console.log(`   - Idosos: ${idosos.length}`);
    console.log(`   - Pagamentos: ${pagamentos.length}`);
    console.log(`   - Configurações: ${configuracoes.length}`);
    
    // Análise de pagamentos por status
    const statusCount = pagamentos.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n💰 Pagamentos por Status:`);
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} pagamento(s)`);
    });
    
    // Análise por ano
    const anosCount = pagamentos.reduce((acc, p) => {
      acc[p.anoReferencia] = (acc[p.anoReferencia] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📅 Pagamentos por Ano:`);
    Object.entries(anosCount).forEach(([ano, count]) => {
      console.log(`   - ${ano}: ${count} pagamento(s)`);
    });

    console.log(`\n🎉 Backup concluído com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar backup CSV:', error);
  } finally {
    await prisma.$disconnect();
  }
}

gerarBackupCSV();

