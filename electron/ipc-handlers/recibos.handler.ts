import { ipcMain, shell } from 'electron';
import { PrismaClient } from '@prisma/client';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import extenso from 'extenso';

const prisma = new PrismaClient();

export function setupRecibosHandlers() {
  // Gerar recibo de doação
  ipcMain.handle('recibo:gerar-doacao', async (event, pagamentoId: number) => {
    try {
      // Buscar dados do pagamento
      const pagamento = await prisma.pagamento.findUnique({
        where: { id: pagamentoId },
        include: {
          idoso: {
            include: {
              responsavel: true,
            },
          },
        },
      });

      if (!pagamento) {
        throw new Error('Pagamento não encontrado');
      }

      if (pagamento.valorDoacaoCalculado <= 0) {
        throw new Error('Não há valor de doação para gerar recibo');
      }

      // Buscar configurações
      const configs = await Promise.all([
        prisma.configuracao.findUnique({ where: { chave: 'caminho_recibos_doacao' } }),
        prisma.configuracao.findUnique({ where: { chave: 'nome_instituicao' } }),
        prisma.configuracao.findUnique({ where: { chave: 'cnpj_instituicao' } }),
        prisma.configuracao.findUnique({ where: { chave: 'endereco_instituicao' } }),
      ]);

      const caminhoBase = configs[0]?.valor || 'C:\\Nestjs\\PWALarIdosos\\RECIBOS DOAÇÃO LAR';
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

      const valorExtenso = extenso(pagamento.valorDoacaoCalculado.toFixed(2), { 
        mode: 'currency' 
      });

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 polegada = 1440 twips
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: [
            // Título
            new Paragraph({
              text: "RECIBO DE DOAÇÃO",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            // Número do recibo
            new Paragraph({
              text: `Nº ${pagamento.nfse || '___________'}`,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 600 },
            }),
            
            // Espaço
            new Paragraph({
              text: "",
              spacing: { after: 200 },
            }),
            
            // Corpo do recibo
            new Paragraph({
              children: [
                new TextRun("Recebemos de "),
                new TextRun({ 
                  text: pagamento.idoso.responsavel.nome.toUpperCase(), 
                  bold: true 
                }),
                new TextRun(", inscrito(a) no CPF sob nº "),
                new TextRun({ 
                  text: pagamento.idoso.responsavel.cpf, 
                  bold: true 
                }),
                new TextRun(", a quantia de "),
                new TextRun({ 
                  text: `R$ ${pagamento.valorDoacaoCalculado.toFixed(2).replace('.', ',')}`, 
                  bold: true,
                  underline: {}
                }),
                new TextRun(" ("),
                new TextRun({ 
                  text: valorExtenso,
                  italics: true
                }),
                new TextRun("), referente à "),
                new TextRun({ 
                  text: "doação voluntária", 
                  bold: true 
                }),
                new TextRun(" para auxílio de "),
                new TextRun({ 
                  text: pagamento.idoso.nome.toUpperCase(), 
                  bold: true 
                }),
                new TextRun(", residente no "),
                new TextRun({
                  text: nomeInstituicao,
                  bold: true
                }),
                new TextRun(", na competência de "),
                new TextRun({ 
                  text: `${meses[pagamento.mesReferencia - 1]}/${pagamento.anoReferencia}`,
                  bold: true
                }),
                new TextRun("."),
              ],
              spacing: { after: 800 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            
            // Espaço
            new Paragraph({
              text: "",
              spacing: { after: 400 },
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
      const nomeArquivo = `${pagamento.nfse || pagamento.id}_${pagamento.idoso.nome.replace(/\s+/g, '_').toUpperCase()}.docx`;
      const caminhoCompleto = path.join(caminhoBase, nomeArquivo);

      // Salvar arquivo
      fs.writeFileSync(caminhoCompleto, buffer);

      // Atualizar registro no banco
      await prisma.pagamento.update({
        where: { id: pagamentoId },
        data: { caminhoReciboDoacao: caminhoCompleto },
      });

      console.log('✅ Recibo de doação gerado:', caminhoCompleto);

      return {
        sucesso: true,
        caminho: caminhoCompleto,
        nomeArquivo,
      };
    } catch (error) {
      console.error('❌ Erro ao gerar recibo de doação:', error);
      throw error;
    }
  });

  // Abrir pasta de recibos no Explorer
  ipcMain.handle('recibo:abrir-pasta', async (event, tipo: 'doacao' | 'mensalidade') => {
    try {
      const chave = tipo === 'doacao' ? 'caminho_recibos_doacao' : 'caminho_recibos_mensalidade';
      const config = await prisma.configuracao.findUnique({
        where: { chave },
      });

      if (config?.valor) {
        // Criar pasta se não existir
        if (!fs.existsSync(config.valor)) {
          fs.mkdirSync(config.valor, { recursive: true });
        }
        // Abrir no Explorer do Windows
        shell.openPath(config.valor);
      } else {
        throw new Error('Caminho não configurado');
      }
    } catch (error) {
      console.error('Erro ao abrir pasta de recibos:', error);
      throw error;
    }
  });
}

// Funções auxiliares
function formatarDataExtenso(data: Date): string {
  const dia = data.getDate();
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();
  
  return `${dia} de ${mes} de ${ano}`;
}




