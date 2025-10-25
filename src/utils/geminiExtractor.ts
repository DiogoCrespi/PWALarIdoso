import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from '../config/gemini';

export interface ExtractedNFSEData {
  numeroNFSE: string;
  dataPrestacao: string;
  dataEmissao?: string;
  discriminacao: string;
  valor: number;
  nomePessoa: string;
  responsavelNome?: string;
  formaPagamento?: string;
  mesReferencia?: string;
  _fallback?: boolean; // Indica que os dados vieram do fallback mockado
  _errorType?: 'RATE_LIMIT' | 'NO_API_KEY' | 'API_ERROR' | 'NETWORK_ERROR'; // Tipo de erro que causou o fallback
  _errorMessage?: string; // Mensagem de erro original
}

/**
 * Extrai dados de uma NFSE usando a API do Gemini
 */
export async function extractNFSEWithGemini(file: File, apiKey: string): Promise<ExtractedNFSEData> {
  try {
    console.log('🤖 Iniciando extração com Gemini:', file.name);
    
    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });
    
    // Converter PDF para base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    console.log('📄 PDF convertido para base64, tamanho:', base64.length);
    
    // Prompt para extração de dados
    const prompt = `
Analise este PDF de Nota Fiscal de Serviço Eletrônica (NFSE) e extraia as seguintes informações em formato JSON:

{
  "numeroNFSE": "número da NFSE",
  "dataPrestacao": "data no formato DD/MM/AAAA",
  "dataEmissao": "data de emissão no formato DD/MM/AAAA (se diferente da dataPrestacao)",
  "discriminacao": "texto da discriminação do serviço",
  "valor": valor_numerico_sem_formato,
  "nomePessoa": "nome completo da pessoa/empresa",
  "responsavelNome": "nome do responsável extraído da discriminação (se mencionado)",
  "formaPagamento": "forma de pagamento extraída da discriminação",
  "mesReferencia": "mês de referência extraído da discriminação no formato MM/AAAA"
}

Instruções:
- numeroNFSE: Encontre o número da NFSE (geralmente 4+ dígitos)
- dataPrestacao: Data de prestação do serviço no formato brasileiro (DD/MM/AAAA)
- dataEmissao: Data de emissão da NFSE (se diferente da dataPrestacao) no formato DD/MM/AAAA
- discriminacao: Texto completo da discriminação do serviço
- valor: ⚠️ MUITO IMPORTANTE - Extraia o "Valor Líquido" da tabela de itens/serviços
  * Procure por uma TABELA com colunas: "Descrição do Item", "Quantidade", "Valor", "Valor Líquido"
  * Use SEMPRE o valor da coluna "Valor Líquido" (última coluna da tabela de itens)
  * Formato: número decimal usando PONTO (ex: 1232.26, NÃO 1.232,26)
  * Exemplo de tabela no PDF:
    Descrição do Item | Quantidade | Valor | Desc. | Valor Líquido
    Valor referente... | 1,00000 | 1.232,26 | 0,00 | 1.232,26 ← USE ESTE VALOR
  * NÃO use valores de outras partes do PDF (totais, mensalidades, etc.)
- nomePessoa: Nome completo do TOMADOR DO SERVIÇO (quem está pagando), NÃO o prestador
- responsavelNome: Nome do responsável mencionado na discriminação (ex: "Antônio Marcos Bonassa" se aparecer "Ana Sangaleti Bonassa - Antônio Marcos Bonassa")
- formaPagamento: Extraia a forma de pagamento da discriminação e substitua abreviações por nomes completos (ex: "PIX", "PIX Banco do Brasil", "PIX SICREDI", "DINHEIRO", "TRANSFERÊNCIA")
- mesReferencia: Extraia o mês de referência da discriminação (ex: "10/2025" para "Outubro de 2025")

EXEMPLOS DE EXTRAÇÃO DA DISCRIMINAÇÃO:
- "Valor referente participação no custeio da entidade. Referente ao mês de Outubro de 2025. Conforme Pix banco do Brasil."
  → mesReferencia: "10/2025", formaPagamento: "PIX Banco do Brasil"
- "Mensalidade referente ao mês de Setembro de 2025. Conforme PIX SICREDI."
  → mesReferencia: "09/2025", formaPagamento: "PIX SICREDI"
- "Participação no custeio. Mês: Novembro/2025. Forma: DINHEIRO."
  → mesReferencia: "11/2025", formaPagamento: "DINHEIRO"
- "Pagamento via PIX BB realizado em dezembro de 2025."
  → mesReferencia: "12/2025", formaPagamento: "PIX Banco do Brasil"

IMPORTANTE: 
- Para o campo "valor", use sempre ponto como separador decimal (ex: 1062.60) e NÃO use vírgula.
- Para o campo "nomePessoa", procure por "TOMADOR DO SERVIÇO" ou "DADOS DO TOMADOR" - esta é a pessoa/empresa que está PAGANDO.
- NÃO use o "PRESTADOR DO SERVIÇO" - este é quem está RECEBENDO o pagamento.
- Se houver um nome específico na discriminação do serviço, use esse nome.
- Para "formaPagamento", procure por palavras como: PIX, PIX BB, PIX SICREDI, DINHEIRO, TRANSFERÊNCIA, BOLETO, etc.
- IMPORTANTE: Substitua abreviações por nomes completos:
  * "BB" → "Banco do Brasil"
  * "SICREDI" → "SICREDI" (manter como está)
  * "ITAU" → "Itaú"
  * "BRADESCO" → "Bradesco"
  * "SANTANDER" → "Santander"
- Para "mesReferencia", procure por padrões como: "mês de [Mês] de [Ano]", "Mês: [Mês]/[Ano]", "referente ao mês de [Mês] de [Ano]"

Retorne APENAS o JSON válido, sem explicações adicionais.
`;

    // Enviar para Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: "application/pdf"
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 Resposta do Gemini:', text);
    
    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta do Gemini não contém JSON válido');
    }
    
    const extractedData = JSON.parse(jsonMatch[0]);
    
    // Validar e formatar dados
    const formattedData: ExtractedNFSEData = {
      numeroNFSE: extractedData.numeroNFSE || 'Não encontrado',
      dataPrestacao: extractedData.dataPrestacao || new Date().toLocaleDateString('pt-BR'),
      dataEmissao: extractedData.dataEmissao || undefined,
      discriminacao: extractedData.discriminacao || 'Discriminação não encontrada',
      valor: parseFloat(extractedData.valor) || 0,
      nomePessoa: extractedData.nomePessoa || 'Nome não encontrado',
      responsavelNome: extractedData.responsavelNome || undefined,
      formaPagamento: extractedData.formaPagamento || undefined,
      mesReferencia: extractedData.mesReferencia || undefined
    };
    
    console.log('✅ Dados extraídos com Gemini:', formattedData);
    return formattedData;
    
  } catch (error) {
    console.error('❌ Erro ao extrair com Gemini:', error);
    throw new Error(`Erro na extração com Gemini: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função de fallback que usa Gemini se disponível, senão usa método anterior
 */
export async function extractNFSEWithFallback(file: File, geminiApiKey?: string): Promise<ExtractedNFSEData> {
  // Se não tiver API key do Gemini, usar fallback
  if (!geminiApiKey) {
    console.warn('⚠️⚠️⚠️ API key do Gemini NÃO fornecida - Usando FALLBACK MOCKADO! ⚠️⚠️⚠️');
    console.warn('Os valores extraídos serão ESTIMATIVAS e provavelmente INCORRETOS!');
    return generateFallbackData(file, 'NO_API_KEY', 'API key não configurada');
  }
  
  try {
    // Tentar usar Gemini
    console.log('🤖 Tentando extrair com Gemini API...');
    const result = await extractNFSEWithGemini(file, geminiApiKey);
    console.log('✅ Gemini extraiu dados com sucesso!');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Detectar tipo de erro
    let errorType: 'RATE_LIMIT' | 'API_ERROR' | 'NETWORK_ERROR' = 'API_ERROR';
    
    if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('RATE_LIMIT_EXCEEDED')) {
      errorType = 'RATE_LIMIT';
      console.warn('⏱️ RATE LIMIT ATINGIDO! Aguarde alguns minutos e tente novamente.');
      console.warn('O Gemini tem limite de requisições por minuto. Seus dados foram extraídos CORRETAMENTE antes do limite.');
    } else if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('NetworkError')) {
      errorType = 'NETWORK_ERROR';
      console.error('🌐 Erro de rede ao conectar com Gemini');
    } else {
      console.error('❌ Erro da API Gemini:', errorMessage);
    }
    
    console.error('Erro do Gemini:', error);
    console.warn('⚠️ Usando FALLBACK - Dados serão ESTIMATIVAS!');
    return generateFallbackData(file, errorType, errorMessage);
  }
}

/**
 * Gera dados de fallback baseados no nome do arquivo (método anterior)
 */
function generateFallbackData(file: File, errorType?: 'RATE_LIMIT' | 'NO_API_KEY' | 'API_ERROR' | 'NETWORK_ERROR', errorMessage?: string): ExtractedNFSEData {
  console.log('🔄 Gerando dados de fallback para:', file.name);
  
  const fileName = file.name.toLowerCase();
  
  // Tentar extrair número NFSE do nome do arquivo
  const nfseMatch = fileName.match(/(\d{4,})/);
  let numeroNFSE = 'Não encontrado';
  
  if (nfseMatch) {
    numeroNFSE = nfseMatch[1];
  } else {
    const hash = fileName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    numeroNFSE = Math.abs(hash).toString().slice(0, 4);
  }
  
  // ⚠️ ATENÇÃO: Valor é uma ESTIMATIVA baseada no tamanho do arquivo!
  // Este valor provavelmente está ERRADO e deve ser ajustado manualmente
  const valor = Math.round((file.size / 1000) * 50);
  const dataPrestacao = new Date().toLocaleDateString('pt-BR');
  
  console.warn('⚠️ FALLBACK: Valor estimado (PODE ESTAR ERRADO!):', valor);
  console.log('🔄 Fallback: dataPrestacao gerada:', dataPrestacao);
  
  // ✅ CORRIGIDO: Extrair nome do arquivo corretamente
  // Tentar extrair nome do arquivo (remover número NFSE e extensão)
  let nomePessoa = 'Nome não encontrado';
  
  // Remover número NFSE e extensão do nome do arquivo
  let nomeExtraido = file.name
    .replace(/\.pdf$/i, '')
    .replace(/\.docx$/i, '')
    .replace(/^\d+\s*/, '') // Remover números no início
    .trim();
  
  if (nomeExtraido && nomeExtraido.length > 3) {
    // Capitalizar nome corretamente
    nomePessoa = nomeExtraido
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
      .join(' ');
    console.log('✅ Nome extraído do arquivo:', nomePessoa);
  } else {
    // Fallback para nomes conhecidos
    if (fileName.includes('oli')) {
      nomePessoa = 'OLICIO DOS SANTOS';
    } else if (fileName.includes('ana')) {
      nomePessoa = 'ANA SANGALETI BONASSA';
    } else if (fileName.includes('maria silva')) {
      nomePessoa = 'MARIA SILVA SANTOS';
    }
  }
  
  // ✅ CORRIGIDO: Gerar discriminação com mês dinâmico
  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const anoAtual = new Date().getFullYear();
  const discriminacao = `Valor referente a participação no custeio da entidade. Referente ao mês de ${mesAtual} de ${anoAtual}. Conforme PIX Banco do Brasil.`;
  
  // Log de aviso
  console.warn('⚠️⚠️⚠️ FALLBACK ATIVO - Dados podem estar INCORRETOS! ⚠️⚠️⚠️');
  console.warn('Dados extraídos por fallback (VERIFIQUE MANUALMENTE):');
  console.warn('  - Número NFSE:', numeroNFSE);
  console.warn('  - Valor:', valor, '← ESTIMADO pelo tamanho do arquivo (' + file.size + ' bytes) - PROVAVELMENTE ERRADO!');
  console.warn('  - Pagador:', nomePessoa);
  console.warn('  - Data:', dataPrestacao);
  console.warn('Por favor, AJUSTE MANUALMENTE os valores se estiverem incorretos!');
  
  return {
    numeroNFSE,
    dataPrestacao,
    dataEmissao: dataPrestacao, // Usar mesma data como fallback
    discriminacao,
    valor,
    nomePessoa,
    responsavelNome: undefined, // Não há responsável no fallback
    formaPagamento: 'PIX Banco do Brasil',
    mesReferencia: '09/2025',
    _fallback: true, // Marcar que veio do fallback mockado
    _errorType: errorType, // Tipo de erro que causou o fallback
    _errorMessage: errorMessage // Mensagem de erro original
  };
}
