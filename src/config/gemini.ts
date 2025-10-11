// Configuração da API do Gemini
export const GEMINI_CONFIG = {
  // API Key do Gemini - você pode obter em: https://makersuite.google.com/app/apikey
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBYiVvbMhHm-DfaPMoX1yVlRReOX_1iixU',
  
  // Modelo a ser usado
  MODEL: 'gemini-2.0-flash',
  
  // Configurações de segurança
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.1, // Baixa temperatura para respostas mais consistentes
};

/**
 * Verifica se a API key do Gemini está configurada
 */
export function isGeminiConfigured(): boolean {
  return !!GEMINI_CONFIG.API_KEY;
}

/**
 * Obtém a API key do Gemini
 */
export function getGeminiApiKey(): string {
  return GEMINI_CONFIG.API_KEY;
}
