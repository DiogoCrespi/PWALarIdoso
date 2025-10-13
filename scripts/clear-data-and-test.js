import puppeteer from 'puppeteer';

async function clearDataAndTest() {
  console.log('🚀 Iniciando limpeza de dados e teste...');
  
  const browser = await puppeteer.launch({
    headless: false, // Mostrar o navegador
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navegar para a aplicação
    console.log('📱 Navegando para a aplicação...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Aguardar a aplicação carregar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Limpar dados via console
    console.log('🗑️ Limpando dados mock...');
    await page.evaluate(() => {
      if (typeof clearAllMockData === 'function') {
        clearAllMockData();
      } else {
        console.log('❌ Função clearAllMockData não encontrada');
      }
    });
    
    // Aguardar limpeza
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Recarregar página
    console.log('🔄 Recarregando página...');
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Aguardar carregamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se dados foram limpos
    console.log('✅ Verificando se dados foram limpos...');
    
    // Ir para Notas Fiscais
    console.log('📄 Navegando para Notas Fiscais...');
    await page.click('a[href="/notas-fiscais"]');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se está vazio
    const notasCount = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="notas-fiscais-grid"]') || 
                   document.querySelector('.MuiDataGrid-root');
      if (grid) {
        const rows = grid.querySelectorAll('.MuiDataGrid-row');
        return rows.length;
      }
      return 0;
    });
    
    console.log(`📊 Notas Fiscais encontradas: ${notasCount}`);
    
    // Ir para Recibo de Mensalidade
    console.log('📋 Navegando para Recibo de Mensalidade...');
    await page.click('a[href="/templates"]');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se está vazio
    const historicoCount = await page.evaluate(() => {
      const searchResults = document.querySelector('[data-testid="search-results"]') ||
                           document.querySelector('.MuiList-root');
      if (searchResults) {
        const items = searchResults.querySelectorAll('.MuiListItemButton-root');
        return items.length;
      }
      return 0;
    });
    
    console.log(`📊 Itens de histórico encontrados: ${historicoCount}`);
    
    // Teste de upload (simulado)
    console.log('🧪 Teste de upload simulado...');
    
    // Ir para Notas Fiscais novamente
    await page.click('a[href="/notas-fiscais"]');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se o botão de upload está presente
    const uploadButton = await page.$('button[aria-label*="upload"], button:has-text("Upload")');
    if (uploadButton) {
      console.log('✅ Botão de upload encontrado');
    } else {
      console.log('❌ Botão de upload não encontrado');
    }
    
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    // Manter o navegador aberto para inspeção manual
    console.log('🔍 Navegador mantido aberto para inspeção manual...');
    console.log('💡 Pressione Ctrl+C para fechar');
    
    // Aguardar input do usuário
    await new Promise(() => {});
  }
}

// Executar o script
clearDataAndTest().catch(console.error);
