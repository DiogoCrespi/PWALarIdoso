// Script para limpar localStorage
// Execute no console do navegador

const keys = ["responsaveisMock","idososMock","pagamentosMock","notasFiscaisMock","configuracoesMock","logsMock"];
console.log('🗑️ Limpando localStorage...');

keys.forEach(key => {
  localStorage.removeItem(key);
  console.log('✅ Removido:', key);
});

console.log('✅ localStorage limpo com sucesso!');
console.log('🔄 Recarregue a página para aplicar as mudanças');
