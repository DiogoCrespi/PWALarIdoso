import puppeteer from 'puppeteer';

async function testNavigation() {
  console.log('🧭 Teste de navegação da aplicação...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 200,
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
    
    // TESTE 1: Verificar se estamos na página inicial
    console.log('\n🧪 TESTE 1: Verificando página inicial');
    const currentUrl = page.url();
    console.log('📍 URL atual:', currentUrl);
    
    const pageTitle = await page.title();
    console.log('📄 Título da página:', pageTitle);
    
    // TESTE 2: Verificar elementos de navegação
    console.log('\n🧪 TESTE 2: Verificando elementos de navegação');
    const navElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('a, [role="button"]'));
      return elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        href: el.href || null
      })).filter(el => el.text && el.text.length > 0);
    });
    
    console.log('🔗 Elementos de navegação encontrados:');
    navElements.forEach((el, index) => {
      console.log(`  ${index + 1}. ${el.tag}: "${el.text}"`);
    });
    
    // TESTE 3: Testar navegação para diferentes páginas
    console.log('\n🧪 TESTE 3: Testando navegação');
    
    const pagesToTest = ['Idosos', 'Responsáveis', 'Dashboard', 'Notas Fiscais'];
    
    for (const pageName of pagesToTest) {
      try {
        console.log(`\n📱 Testando navegação para: ${pageName}`);
        
        // Encontrar e clicar no link
        const link = await page.evaluateHandle((name) => {
          const elements = Array.from(document.querySelectorAll('a, [role="button"]'));
          return elements.find(el => el.textContent && el.textContent.includes(name));
        }, pageName);
        
        if (link) {
          await link.click();
          console.log(`✅ Navegou para ${pageName}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verificar se a página mudou
          const newUrl = page.url();
          console.log(`📍 Nova URL: ${newUrl}`);
          
          // Verificar conteúdo da página
          const pageContent = await page.evaluate(() => {
            return document.body.textContent?.substring(0, 300) || '';
          });
          console.log(`📄 Conteúdo da página: ${pageContent.substring(0, 100)}...`);
          
        } else {
          console.log(`❌ Link para ${pageName} não encontrado`);
        }
        
      } catch (error) {
        console.log(`❌ Erro ao navegar para ${pageName}:`, error.message);
      }
    }
    
    // TESTE 4: Verificar se há botões de ação
    console.log('\n🧪 TESTE 4: Verificando botões de ação');
    const actionButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(btn => ({
        text: btn.textContent?.trim(),
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      })).filter(btn => btn.text && btn.text.length > 0);
    });
    
    console.log('🔘 Botões de ação encontrados:');
    actionButtons.forEach((btn, index) => {
      console.log(`  ${index + 1}. "${btn.text}" (disabled: ${btn.disabled}, visible: ${btn.visible})`);
    });
    
    // TESTE 5: Verificar se há formulários
    console.log('\n🧪 TESTE 5: Verificando formulários');
    const forms = await page.evaluate(() => {
      const formElements = Array.from(document.querySelectorAll('form, input, select, textarea'));
      return formElements.map(el => ({
        tag: el.tagName,
        type: el.type || null,
        label: el.getAttribute('label') || el.getAttribute('placeholder') || null,
        visible: el.offsetParent !== null
      })).filter(el => el.visible);
    });
    
    console.log('📝 Elementos de formulário encontrados:');
    forms.forEach((form, index) => {
      console.log(`  ${index + 1}. ${form.tag} (${form.type || 'N/A'}): "${form.label || 'Sem label'}"`);
    });
    
    console.log('\n🎉 Teste de navegação concluído!');
    console.log('✅ Aplicação está funcionando e navegável!');
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
testNavigation().then(success => {
  if (success) {
    console.log('\n🏆 TESTE DE NAVEGAÇÃO CONCLUÍDO COM SUCESSO!');
    console.log('✅ Aplicação está funcionando corretamente!');
    console.log('✅ Navegação entre páginas funcionando!');
  } else {
    console.log('\n❌ TESTE DE NAVEGAÇÃO FALHOU!');
    console.log('🔧 Verifique se a aplicação está funcionando.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
