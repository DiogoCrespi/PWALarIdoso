import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import extenso from 'extenso';

const prisma = new PrismaClient();

export function setupTemplatesHandlers() {
  // Gerar recibo de mensalidade
  ipcMain.handle('template:gerar-mensalidade', async (event, data) => {
    try {
      // Buscar configurações
      const configs = await Promise.all([
        prisma.configuracao.findUnique({ where: { chave: 'caminho_recibos_mensalidade' } }),
        prisma.configuracao.findUnique({ where: { chave: 'nome_instituicao' } }),
        prisma.configuracao.findUnique({ where: { chave: 'cnpj_instituicao' } }),
        prisma.configuracao.findUnique({ where: { chave: 'endereco_instituicao' } }),
      ]);

      const caminhoBase = configs[0]?.valor || 'C:\\Nestjs\\PWALarIdosos\\RECIBOS MENSALIDADE';
      const nomeInstituicao = configs[1]?.valor || 'Associação Filhas de São Camilo';
      const cnpjInstituicao = configs[2]?.valor || 'XX.XXX.XXX/XXXX-XX';
      const enderecoInstituicao = configs[3]?.valor || 'Matelândia - PR';

      // Criar pasta se não existir
      if (!fs.existsSync(caminhoBase)) {
        fs.mkdirSync(caminhoBase, { recursive: true });
      }

      // Criar documento DOCX
      const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      const formatarDataExtenso = (data: Date) => {
        return `${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
      };

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Cabeçalho
            new Paragraph({
              text: nomeInstituicao,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            new Paragraph({
              text: `CNPJ: ${cnpjInstituicao}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            new Paragraph({
              text: enderecoInstituicao,
              alignment: AlignmentType.CENTER,
              spacing: { after: 800 },
            }),
            
            // Título do recibo
            new Paragraph({
              text: `RECIBO Nº ${data.numeroNFSE}`,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            new Paragraph({
              text: `Valor: R$ ${data.valorPagamento.toFixed(2).replace('.', ',')}`,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 800 },
            }),
            
            // Conteúdo do recibo
            new Paragraph({
              children: [
                new TextRun({
                  text: "Recebemos do(a) Sr.(a) ",
                }),
                new TextRun({
                  text: data.nomeResponsavel,
                  bold: true,
                }),
                new TextRun({
                  text: ` CPF ${data.cpfResponsavel}, a quantia de `,
                }),
                new TextRun({
                  text: `R$ ${data.valorPagamento.toFixed(2).replace('.', ',')}`,
                  bold: true,
                }),
                new TextRun({
                  text: ` (${extenso(data.valorPagamento, { mode: 'currency' })}). `,
                }),
                new TextRun({
                  text: data.tipoIdoso === 'SOCIAL' 
                    ? 'Correspondente à participação no custeio da entidade.' 
                    : 'Correspondente a doações para nossas obras assistenciais.',
                }),
              ],
              spacing: { after: 400 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: "Referente ao mês de ",
                }),
                new TextRun({
                  text: data.mesReferencia,
                  bold: true,
                }),
                new TextRun({
                  text: ". Conforme ",
                }),
                new TextRun({
                  text: data.formaPagamento,
                  bold: true,
                }),
                new TextRun({
                  text: ".",
                }),
              ],
              spacing: { after: 400 },
            }),
            
            new Paragraph({
              text: "Para clareza firmo(amos) o presente.",
              spacing: { after: 1200 },
            }),
            
            // Data
            new Paragraph({
              text: `${enderecoInstituicao}, ${formatarDataExtenso(new Date())}.`,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 1200 },
            }),
            
            // Espaço para assinatura
            new Paragraph({
              text: "",
              spacing: { after: 800 },
            }),
            
            // Linha de assinatura
            new Paragraph({
              text: "________________________________________",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: nomeInstituicao,
              alignment: AlignmentType.CENTER,
              bold: true,
            }),
            new Paragraph({
              text: `CNPJ: ${cnpjInstituicao}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
          ],
        }],
      });

      // Gerar buffer do documento
      const buffer = await Packer.toBuffer(doc);

      // Nome do arquivo
      const nomeArquivo = `${data.numeroNFSE}_${data.nomeIdoso.replace(/\s+/g, '_').toUpperCase()}_MENSALIDADE.docx`;
      const caminhoCompleto = path.join(caminhoBase, nomeArquivo);

      // Salvar arquivo
      fs.writeFileSync(caminhoCompleto, buffer);

      console.log('✅ Recibo de mensalidade gerado:', caminhoCompleto);

      return {
        fileName: nomeArquivo,
        path: caminhoCompleto,
      };
    } catch (error) {
      console.error('❌ Erro ao gerar recibo de mensalidade:', error);
      throw error;
    }
  });

  // Gerar lista de idosos
  ipcMain.handle('template:gerar-lista-idosos', async (event, data) => {
    try {
      // Buscar configurações
      const configs = await Promise.all([
        prisma.configuracao.findUnique({ where: { chave: 'caminho_listas_idosos' } }),
        prisma.configuracao.findUnique({ where: { chave: 'nome_instituicao' } }),
        prisma.configuracao.findUnique({ where: { chave: 'cnpj_instituicao' } }),
        prisma.configuracao.findUnique({ where: { chave: 'endereco_instituicao' } }),
      ]);

      const caminhoBase = configs[0]?.valor || 'C:\\Nestjs\\PWALarIdosos\\LISTAS IDOSOS';
      const nomeInstituicao = configs[1]?.valor || 'Associação Filhas de São Camilo';
      const cnpjInstituicao = configs[2]?.valor || 'XX.XXX.XXX/XXXX-XX';
      const enderecoInstituicao = configs[3]?.valor || 'Matelândia - PR';

      // Criar pasta se não existir
      if (!fs.existsSync(caminhoBase)) {
        fs.mkdirSync(caminhoBase, { recursive: true });
      }

      // Criar documento DOCX
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Cabeçalho
            new Paragraph({
              text: nomeInstituicao,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            new Paragraph({
              text: `CNPJ: ${cnpjInstituicao}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            new Paragraph({
              text: enderecoInstituicao,
              alignment: AlignmentType.CENTER,
              spacing: { after: 800 },
            }),
            
            // Título da lista
            new Paragraph({
              text: `MENSALIDADE LAR DOS IDOSOS – ${data.mesReferencia}`,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            new Paragraph({
              text: `Formato: ${data.formato}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 800 },
            }),
            
            // Resumo
            new Paragraph({
              text: `Total de Idosos: ${data.idosos?.length || 0}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 800 },
            }),
            
            // Lista de idosos
            ...(data.idosos?.map((idoso: any) => [
              new Paragraph({
                text: `Nome do Idoso: ${idoso.nome} ${idoso.ativo ? '*' : ''}`,
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200 },
              }),
              
              ...(idoso.dataPagamento ? [
                new Paragraph({
                  text: `Data Pagamento: ${idoso.dataPagamento} R$ ${idoso.valorPagamento}`,
                  spacing: { after: 200 },
                }),
              ] : []),
              
              new Paragraph({
                text: `Referência: ${data.mesReferencia}`,
                spacing: { after: 200 },
              }),
              
              ...(idoso.tipo === 'SOCIAL' ? [
                new Paragraph({
                  text: 'SOMENTE NOTA SOCIAL',
                  spacing: { after: 200 },
                }),
              ] : [
                new Paragraph({
                  text: `Benefício: ${idoso.beneficio} X ${idoso.percentualBeneficio}% = ${idoso.valorBeneficio}`,
                  spacing: { after: 200 },
                }),
                new Paragraph({
                  text: `Doação: R$ ${idoso.doacao}`,
                  spacing: { after: 200 },
                }),
              ]),
              
              new Paragraph({
                text: `CPF: ${idoso.cpf || 'N/A'}`,
                spacing: { after: 200 },
              }),
              
              ...(idoso.formaPagamento ? [
                new Paragraph({
                  text: `Forma pagamento: ${idoso.formaPagamento}`,
                  spacing: { after: 200 },
                }),
              ] : []),
              
              ...(idoso.numeroNFSE ? [
                new Paragraph({
                  text: `NFS-e: ${idoso.numeroNFSE}`,
                  spacing: { after: 200 },
                }),
              ] : []),
              
              new Paragraph({
                text: `RESPONSÁVEL: ${idoso.responsavel || 'N/A'}`,
                spacing: { after: 200 },
              }),
              
              new Paragraph({
                text: `CPF: ${idoso.cpfResponsavel || 'N/A'}`,
                spacing: { after: 400 },
              }),
            ]).flat() || []),
            
            // Rodapé
            new Paragraph({
              text: `${enderecoInstituicao}, ${new Date().getDate()} de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} de ${new Date().getFullYear()}.`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 800 },
            }),
            
            // Assinatura
            new Paragraph({
              text: "________________________________________",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: nomeInstituicao,
              alignment: AlignmentType.CENTER,
              bold: true,
            }),
            new Paragraph({
              text: `CNPJ: ${cnpjInstituicao}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
          ],
        }],
      });

      // Gerar buffer do documento
      const buffer = await Packer.toBuffer(doc);

      // Nome do arquivo
      const nomeArquivo = `LISTA_IDOSOS_${data.mesReferencia.replace('/', '_')}_${new Date().toISOString().split('T')[0]}.docx`;
      const caminhoCompleto = path.join(caminhoBase, nomeArquivo);

      // Salvar arquivo
      fs.writeFileSync(caminhoCompleto, buffer);

      console.log('✅ Lista de idosos gerada:', caminhoCompleto);

      return {
        fileName: nomeArquivo,
        path: caminhoCompleto,
      };
    } catch (error) {
      console.error('❌ Erro ao gerar lista de idosos:', error);
      throw error;
    }
  });
}

