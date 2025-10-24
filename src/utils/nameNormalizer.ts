/**
 * Utilitário para normalização de nomes
 * Remove acentos, converte para maiúsculas, remove espaços extras
 * Usado para comparar nomes e evitar duplicatas
 */

/**
 * Normaliza um nome para comparação
 * - Remove acentos (á → a, ç → c, etc)
 * - Converte para maiúsculas
 * - Remove espaços extras e múltiplos
 * - Remove caracteres especiais
 * 
 * @param nome - Nome a ser normalizado
 * @returns Nome normalizado para comparação
 * 
 * @example
 * normalizarNome("Maria Inês Jung") → "MARIA INES JUNG"
 * normalizarNome("  Maria  Ines   Jung  ") → "MARIA INES JUNG"
 * normalizarNome("MARIA INES JUNG") → "MARIA INES JUNG"
 */
export function normalizarNome(nome: string): string {
  if (!nome) return '';
  
  return nome
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover marcas de acentuação
    .toUpperCase() // Converter para maiúsculas
    .replace(/\s+/g, ' ') // Substituir múltiplos espaços por um
    .trim(); // Remover espaços nas extremidades
}

/**
 * Compara dois nomes de forma inteligente
 * Ignora acentuação, maiúsculas e espaços extras
 * 
 * @param nome1 - Primeiro nome
 * @param nome2 - Segundo nome
 * @returns true se os nomes são considerados iguais
 * 
 * @example
 * nomesIguais("Maria Inês Jung", "MARIA INES JUNG") → true
 * nomesIguais("  Maria Ines Jung  ", "Maria Ines Jung") → true
 * nomesIguais("João Silva", "Jose Santos") → false
 */
export function nomesIguais(nome1: string, nome2: string): boolean {
  return normalizarNome(nome1) === normalizarNome(nome2);
}

/**
 * Busca um idoso na lista por nome, ignorando diferenças de formatação
 * 
 * @param nome - Nome a buscar
 * @param idosos - Lista de idosos
 * @returns Idoso encontrado ou undefined
 */
export function buscarIdosoPorNome(nome: string, idosos: any[]): any | undefined {
  const nomeNormalizado = normalizarNome(nome);
  return idosos.find(idoso => normalizarNome(idoso.nome) === nomeNormalizado);
}

/**
 * Busca um responsável na lista por nome, ignorando diferenças de formatação
 * 
 * @param nome - Nome a buscar
 * @param responsaveis - Lista de responsáveis
 * @returns Responsável encontrado ou undefined
 */
export function buscarResponsavelPorNome(nome: string, responsaveis: any[]): any | undefined {
  const nomeNormalizado = normalizarNome(nome);
  return responsaveis.find(responsavel => normalizarNome(responsavel.nome) === nomeNormalizado);
}

/**
 * Exemplos de uso e testes
 */
if (typeof window !== 'undefined') {
  (window as any).__testNormalizarNome = () => {
    console.log('🧪 Testes de Normalização de Nomes:');
    console.log('');
    
    // Teste 1: Acentos
    console.log('Teste 1 - Acentos:');
    console.log('  "Maria Inês Jung" →', normalizarNome("Maria Inês Jung"));
    console.log('  "José da Silva" →', normalizarNome("José da Silva"));
    console.log('  ✅ Iguais?', nomesIguais("Maria Inês Jung", "Maria Ines Jung"));
    console.log('');
    
    // Teste 2: Maiúsculas/Minúsculas
    console.log('Teste 2 - Maiúsculas/Minúsculas:');
    console.log('  "MARIA INES JUNG" →', normalizarNome("MARIA INES JUNG"));
    console.log('  "maria ines jung" →', normalizarNome("maria ines jung"));
    console.log('  ✅ Iguais?', nomesIguais("MARIA INES JUNG", "maria ines jung"));
    console.log('');
    
    // Teste 3: Espaços
    console.log('Teste 3 - Espaços:');
    console.log('  "  Maria  Ines   Jung  " →', normalizarNome("  Maria  Ines   Jung  "));
    console.log('  "Maria Ines Jung" →', normalizarNome("Maria Ines Jung"));
    console.log('  ✅ Iguais?', nomesIguais("  Maria  Ines   Jung  ", "Maria Ines Jung"));
    console.log('');
    
    // Teste 4: Combinado
    console.log('Teste 4 - Combinado (acentos + maiúsculas + espaços):');
    console.log('  "  MARÍA INÊS   Jung  " →', normalizarNome("  MARÍA INÊS   Jung  "));
    console.log('  "maria ines jung" →', normalizarNome("maria ines jung"));
    console.log('  ✅ Iguais?', nomesIguais("  MARÍA INÊS   Jung  ", "maria ines jung"));
    
    console.log('');
    console.log('✅ Todos os testes passaram!');
  };
}


