import puppeteer from 'puppeteer';

async function explorarInterface() {
  console.log('🧪 Explorando Interface - Encontrando Botões de Cadastro');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Acessando aplicação...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Aplicação carregada');
    
    // Explorar todos os botões
    console.log('\n🔍 Explorando todos os botões da interface...');
    
    const buttons = await page.$$('button');
    console.log(`📊 Total de botões encontrados: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await page.evaluate(el => el.textContent, buttons[i]);
      const className = await page.evaluate(el => el.className, buttons[i]);
      
      if (text && text.trim()) {
        console.log(`Botão ${i + 1}: "${text}"`);
        console.log(`  Classe: ${className.substring(0, 100)}...`);
      }
    }
    
    // Explorar elementos clicáveis
    console.log('\n🔍 Explorando elementos clicáveis...');
    
    const clickableElements = await page.$$('a, button, [role="button"], [onclick]');
    console.log(`📊 Elementos clicáveis encontrados: ${clickableElements.length}`);
    
    for (let i = 0; i < Math.min(clickableElements.length, 20); i++) {
      const text = await page.evaluate(el => el.textContent, clickableElements[i]);
      const tagName = await page.evaluate(el => el.tagName, clickableElements[i]);
      
      if (text && text.trim()) {
        console.log(`Elemento ${i + 1} (${tagName}): "${text}"`);
      }
    }
    
    // Explorar menu ou navegação
    console.log('\n🔍 Explorando menu/navegação...');
    
    const menuElements = await page.$$('[role="menu"], [role="menuitem"], nav, .menu, .navigation');
    console.log(`📊 Elementos de menu encontrados: ${menuElements.length}`);
    
    for (let i = 0; i < menuElements.length; i++) {
      const text = await page.evaluate(el => el.textContent, menuElements[i]);
      const role = await page.evaluate(el => el.getAttribute('role'), menuElements[i]);
      
      if (text && text.trim()) {
        console.log(`Menu ${i + 1} (${role}): "${text}"`);
      }
    }
    
    // Explorar drawer/sidebar
    console.log('\n🔍 Explorando drawer/sidebar...');
    
    const drawerElements = await page.$$('[role="presentation"], .MuiDrawer-root, .drawer, .sidebar');
    console.log(`📊 Elementos de drawer encontrados: ${drawerElements.length}`);
    
    // Tentar abrir menu se existir
    const menuButton = await page.$('[aria-label*="menu"], [aria-label*="Menu"], .menu-button');
    if (menuButton) {
      console.log('✅ Botão de menu encontrado, tentando abrir...');
      await menuButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar se menu abriu
      const menuItems = await page.$$('[role="menuitem"]');
      console.log(`📊 Itens de menu após abrir: ${menuItems.length}`);
      
      for (let i = 0; i < menuItems.length; i++) {
        const text = await page.evaluate(el => el.textContent, menuItems[i]);
        if (text && text.trim()) {
          console.log(`Item de menu ${i + 1}: "${text}"`);
        }
      }
    }
    
    // Explorar cards ou seções
    console.log('\n🔍 Explorando cards/seções...');
    
    const cards = await page.$$('.MuiCard-root, .card, [class*="card"]');
    console.log(`📊 Cards encontrados: ${cards.length}`);
    
    for (let i = 0; i < cards.length; i++) {
      const text = await page.evaluate(el => el.textContent, cards[i]);
      if (text && text.trim()) {
        console.log(`Card ${i + 1}: "${text.substring(0, 100)}..."`);
      }
    }
    
    // Explorar inputs
    console.log('\n🔍 Explorando inputs...');
    
    const inputs = await page.$$('input, select, textarea');
    console.log(`📊 Inputs encontrados: ${inputs.length}`);
    
    for (let i = 0; i < inputs.length; i++) {
      const type = await page.evaluate(el => el.type, inputs[i]);
      const placeholder = await page.evaluate(el => el.placeholder, inputs[i]);
      const name = await page.evaluate(el => el.name, inputs[i]);
      
      console.log(`Input ${i + 1}: tipo="${type}", placeholder="${placeholder}", name="${name}"`);
    }
    
    console.log('\n🎯 Exploração concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

explorarInterface();
