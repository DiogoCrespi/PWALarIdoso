import puppeteer from 'puppeteer';

async function simpleClear() {
  console.log('🚀 Iniciando limpeza simples de dados...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navegar para a aplicação
    console.log('📱 Navegando para a aplicação...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Aguardar a aplicação carregar
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Limpar dados via console
    console.log('🗑️ Limpando dados mock...');
    const result = await page.evaluate(() => {
      if (typeof clearAllMockData === 'function') {
        clearAllMockData();
        return 'Dados limpos com sucesso!';
      } else {
        return 'Função clearAllMockData não encontrada';
      }
    });
    
    console.log('✅ Resultado:', result);
    
    // Aguardar limpeza
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Recarregar página
    console.log('🔄 Recarregando página...');
    await page.reload({ waitUntil: 'networkidle0' });
    
    console.log('✅ Limpeza concluída! A página foi recarregada.');
    console.log('💡 Agora você pode testar com dados limpos.');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    // Manter o navegador aberto
    console.log('🔍 Navegador mantido aberto para teste manual...');
    console.log('💡 Pressione Ctrl+C para fechar');
    
    // Aguardar input do usuário
    await new Promise(() => {});
  }
}

// Executar o script
simpleClear().catch(console.error);

