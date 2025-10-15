import { useState } from 'react';
import { api } from '../services/api';
import { logInfo, logError } from '../utils/logger';

interface DuplicateItem {
  id: number;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  [key: string]: any;
}

interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicatas: DuplicateItem[];
  error?: string;
}

export const useDuplicateCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkResponsavelDuplicates = async (nome: string, cpf?: string): Promise<DuplicateCheckResult> => {
    setIsChecking(true);
    try {
      logInfo('DUPLICATE_CHECK', 'Verificando duplicatas de responsável', { nome, cpf });
      
      const result = await api.responsaveis.verificarDuplicatas(nome, cpf);
      
      if (result.success) {
        logInfo('DUPLICATE_CHECK', 'Verificação concluída', { 
          hasDuplicates: result.hasDuplicates, 
          count: result.duplicatas.length 
        });
        
        return {
          hasDuplicates: result.hasDuplicates,
          duplicatas: result.duplicatas
        };
      } else {
        logError('DUPLICATE_CHECK', 'Erro na verificação de duplicatas', result.error);
        return {
          hasDuplicates: false,
          duplicatas: [],
          error: result.error
        };
      }
    } catch (error) {
      logError('DUPLICATE_CHECK', 'Erro crítico na verificação', error instanceof Error ? error.message : String(error));
      return {
        hasDuplicates: false,
        duplicatas: [],
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      setIsChecking(false);
    }
  };

  const checkIdosoDuplicates = async (nome: string, cpf?: string): Promise<DuplicateCheckResult> => {
    setIsChecking(true);
    try {
      logInfo('DUPLICATE_CHECK', 'Verificando duplicatas de idoso', { nome, cpf });
      
      const result = await api.idosos.verificarDuplicatas(nome, cpf);
      
      if (result.success) {
        logInfo('DUPLICATE_CHECK', 'Verificação concluída', { 
          hasDuplicates: result.hasDuplicates, 
          count: result.duplicatas.length 
        });
        
        return {
          hasDuplicates: result.hasDuplicates,
          duplicatas: result.duplicatas
        };
      } else {
        logError('DUPLICATE_CHECK', 'Erro na verificação de duplicatas', result.error);
        return {
          hasDuplicates: false,
          duplicatas: [],
          error: result.error
        };
      }
    } catch (error) {
      logError('DUPLICATE_CHECK', 'Erro crítico na verificação', error instanceof Error ? error.message : String(error));
      return {
        hasDuplicates: false,
        duplicatas: [],
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isChecking,
    checkResponsavelDuplicates,
    checkIdosoDuplicates
  };
};
