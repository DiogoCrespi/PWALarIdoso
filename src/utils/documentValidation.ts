// Utilitários para validação e formatação de documentos (CPF/CNPJ)

export interface DocumentInfo {
  type: 'CPF' | 'CNPJ' | 'INVALID';
  formatted: string;
  isValid: boolean;
  clean: string;
}

/**
 * Remove caracteres não numéricos de uma string
 */
export const cleanDocument = (document: string): string => {
  return document.replace(/\D/g, '');
};

/**
 * Valida se um CPF é válido
 */
export const validateCPF = (cpf: string): boolean => {
  const cleanCpf = cleanDocument(cpf);
  
  // Verifica se tem 11 dígitos
  if (cleanCpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  // Algoritmo de validação do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
  
  return true;
};

/**
 * Valida se um CNPJ é válido
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCnpj = cleanDocument(cnpj);
  
  // Verifica se tem 14 dígitos
  if (cleanCnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;
  
  // Algoritmo de validação do CNPJ
  let sum = 0;
  let weight = 2;
  
  // Primeiro dígito verificador
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (firstDigit !== parseInt(cleanCnpj.charAt(12))) return false;
  
  // Segundo dígito verificador
  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return secondDigit === parseInt(cleanCnpj.charAt(13));
};

/**
 * Formata um CPF
 */
export const formatCPF = (cpf: string): string => {
  const cleanCpf = cleanDocument(cpf);
  if (cleanCpf.length <= 11) {
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
};

/**
 * Formata um CNPJ
 */
export const formatCNPJ = (cnpj: string): string => {
  const cleanCnpj = cleanDocument(cnpj);
  if (cleanCnpj.length <= 14) {
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return cnpj;
};

/**
 * Identifica automaticamente se é CPF ou CNPJ e retorna informações completas
 */
export const identifyDocument = (document: string): DocumentInfo => {
  const clean = cleanDocument(document);
  
  if (clean.length === 11) {
    const isValid = validateCPF(clean);
    return {
      type: 'CPF',
      formatted: formatCPF(clean),
      isValid,
      clean
    };
  } else if (clean.length === 14) {
    const isValid = validateCNPJ(clean);
    return {
      type: 'CNPJ',
      formatted: formatCNPJ(clean),
      isValid,
      clean
    };
  }
  
  return {
    type: 'INVALID',
    formatted: document,
    isValid: false,
    clean
  };
};

/**
 * Formata um documento automaticamente baseado no tipo detectado
 */
export const formatDocument = (document: string): string => {
  const info = identifyDocument(document);
  return info.formatted;
};

/**
 * Valida um documento automaticamente baseado no tipo detectado
 */
export const validateDocument = (document: string): boolean => {
  const info = identifyDocument(document);
  return info.isValid;
};
