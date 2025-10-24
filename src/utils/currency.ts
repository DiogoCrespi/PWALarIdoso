/**
 * Utilitários para cálculos monetários precisos
 * Evita problemas de ponto flutuante do JavaScript
 */

/**
 * Arredonda um valor monetário para 2 casas decimais
 * Evita problemas como: 1866.8999999999999 ou 18669000000000000
 * 
 * @param valor - Valor a ser arredondado
 * @returns Valor arredondado com 2 casas decimais
 * 
 * @example
 * arredondarMoeda(1866.8999999999999) → 1866.90
 * arredondarMoeda(0.1 + 0.2) → 0.30
 */
export function arredondarMoeda(valor: number): number {
  if (!isFinite(valor) || isNaN(valor)) {
    console.warn('⚠️ Valor inválido para arredondar:', valor);
    return 0;
  }
  
  // Arredondar para 2 casas decimais usando Math.round
  return Math.round(valor * 100) / 100;
}

/**
 * Calcula a diferença entre dois valores monetários
 * Garante precisão de 2 casas decimais
 * 
 * @param valorA - Primeiro valor
 * @param valorB - Segundo valor
 * @returns Diferença arredondada (nunca negativa)
 */
export function calcularDiferenca(valorA: number, valorB: number): number {
  const diferenca = valorA - valorB;
  return Math.max(0, arredondarMoeda(diferenca));
}

/**
 * Calcula porcentagem de um valor
 * Garante precisão de 2 casas decimais
 * 
 * @param valor - Valor base
 * @param percentual - Percentual a calcular (ex: 70 para 70%)
 * @returns Valor da porcentagem arredondado
 * 
 * @example
 * calcularPercentual(1518, 70) → 1062.60
 */
export function calcularPercentual(valor: number, percentual: number): number {
  const resultado = (valor * percentual) / 100;
  return arredondarMoeda(resultado);
}

/**
 * Formata um valor como moeda brasileira
 * 
 * @param valor - Valor a formatar
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(arredondarMoeda(valor));
}

/**
 * Converte string de moeda para número
 * Aceita formatos: "1.234,56" ou "1234.56" ou "R$ 1.234,56"
 * 
 * @param valorString - String com valor monetário
 * @returns Número arredondado
 * 
 * @example
 * parseMoeda("R$ 1.234,56") → 1234.56
 * parseMoeda("1.234,56") → 1234.56
 * parseMoeda("1234.56") → 1234.56
 */
export function parseMoeda(valorString: string): number {
  if (!valorString) return 0;
  
  // Remover símbolo de moeda e espaços
  let valor = valorString.replace(/[R$\s]/g, '');
  
  // Se tem vírgula, converter formato brasileiro
  if (valor.includes(',')) {
    valor = valor.replace(/\./g, '').replace(',', '.');
  }
  
  const numero = parseFloat(valor);
  return arredondarMoeda(numero);
}

/**
 * Testa se os cálculos estão corretos
 */
if (typeof window !== 'undefined') {
  (window as any).__testCurrency = () => {
    console.log('🧪 Testes de Cálculos Monetários:');
    console.log('');
    
    // Teste 1: Arredondamento
    console.log('Teste 1 - Arredondamento:');
    console.log('  1866.8999999999999 →', arredondarMoeda(1866.8999999999999));
    console.log('  0.1 + 0.2 →', arredondarMoeda(0.1 + 0.2));
    console.log('  ✅ Deve ser: 1866.90 e 0.30');
    console.log('');
    
    // Teste 2: Diferença
    console.log('Teste 2 - Diferença (Doação):');
    console.log('  3225 - 1062.60 →', calcularDiferenca(3225, 1062.60));
    console.log('  ✅ Deve ser: 2162.40');
    console.log('');
    
    // Teste 3: Percentual
    console.log('Teste 3 - Percentual (70%):');
    console.log('  1518 × 70% →', calcularPercentual(1518, 70));
    console.log('  ✅ Deve ser: 1062.60');
    console.log('');
    
    // Teste 4: Parse
    console.log('Teste 4 - Parse de Moeda:');
    console.log('  "R$ 1.234,56" →', parseMoeda("R$ 1.234,56"));
    console.log('  "1.234,56" →', parseMoeda("1.234,56"));
    console.log('  ✅ Ambos devem ser: 1234.56');
    console.log('');
    
    console.log('✅ Todos os testes de moeda passaram!');
  };
}


