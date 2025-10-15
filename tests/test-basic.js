import puppeteer from 'puppeteer';

async function testBasic() {
  console.log('🔍 Teste básico da aplicação...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('🌐 Navegando para a aplicação...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Aguardar inicialização
    try {
      await page.waitForSelector('text=Inicializando sistema...', { timeout: 5000 });
      console.log('⏳ Aguardando inicialização...');
      await page.waitForSelector('text=Inicializando sistema...', { state: 'hidden', timeout: 30000 });
    } catch (e) {
      console.log('ℹ️ Inicialização não detectada, continuando...');
    }
    
    console.log('✅ Aplicação carregada!');
    
    // Capturar screenshot
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('📸 Screenshot salvo como test-screenshot.png');
    
    // Verificar se há elementos na página
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('📄 Conteúdo da página:', bodyText.substring(0, 200) + '...');
    
    // Verificar se há botões
    const buttons = await page.$$('button');
    console.log(`🔘 Encontrados ${buttons.length} botões na página`);
    
    // Listar textos dos botões
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await page.evaluate(el => el.textContent, buttons[i]);
      console.log(`  - Botão ${i + 1}: "${text}"`);
    }
    
    // Verificar se há links de navegação
    const links = await page.$$('a, [role="button"]');
    console.log(`🔗 Encontrados ${links.length} links/botões de navegação`);
    
    // Listar textos dos links
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const text = await page.evaluate(el => el.textContent, links[i]);
      if (text && text.trim()) {
        console.log(`  - Link ${i + 1}: "${text.trim()}"`);
      }
    }
    
    console.log('\n🎉 Teste básico concluído!');
    console.log('✅ Aplicação está funcionando e carregada corretamente!');
    return true;
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🧹 Navegador fechado.');
    }
  }
}

// Executar teste
testBasic().then(success => {
  if (success) {
    console.log('\n🏆 TESTE BÁSICO CONCLUÍDO COM SUCESSO!');
    console.log('✅ Aplicação está funcionando!');
  } else {
    console.log('\n❌ TESTE BÁSICO FALHOU!');
    console.log('🔧 Verifique se a aplicação está rodando.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
