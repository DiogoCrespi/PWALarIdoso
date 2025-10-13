import { useEffect, useState } from 'react';
import { api } from '../services/api';

export const useSystemInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔄 Inicializando sistema...');
        const resultado = await api.backup.inicializarSistema();
        
        if (resultado.success) {
          console.log('✅ Sistema inicializado com sucesso');
          setIsInitialized(true);
        } else {
          console.log('⚠️ Sistema não foi inicializado:', resultado.message);
          setError(resultado.message);
          setIsInitialized(false);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar sistema:', error);
        setError('Erro ao inicializar sistema');
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSystem();
  }, []);

  return {
    isInitialized,
    isLoading,
    error
  };
};
