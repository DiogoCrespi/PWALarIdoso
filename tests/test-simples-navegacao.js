import puppeteer from 'puppeteer';

async function testarSimplesNavegacao() {
  console.log('🧪 Teste Simples - Navegação e Verificação');
  
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
    
    // Verificar elementos clicáveis
    const clickableElements = await page.$$('div');
    console.log(`📊 Elementos div encontrados: ${clickableElements.length}`);
    
    // Procurar por "Responsáveis"
    for (let i = 0; i < clickableElements.length; i++) {
      const text = await page.evaluate(el => el.textContent, clickableElements[i]);
      if (text && text.includes('Responsáveis')) {
        console.log(`✅ Elemento "Responsáveis" encontrado na posição ${i}`);
        
        // Clicar no elemento
        await clickableElements[i].click();
        console.log('🖱️ Clicando em "Responsáveis"...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar se mudou a página
        const currentUrl = page.url();
        console.log(`📄 URL atual: ${currentUrl}`);
        
        // Procurar botões na nova página
        const buttons = await page.$$('button');
        console.log(`📊 Botões na página de responsáveis: ${buttons.length}`);
        
        for (let j = 0; j < buttons.length; j++) {
          const buttonText = await page.evaluate(el => el.textContent, buttons[j]);
          if (buttonText && buttonText.trim()) {
            console.log(`Botão ${j + 1}: "${buttonText}"`);
          }
        }
        
        break;
      }
    }
    
    // Voltar para a página inicial
    console.log('\n🔍 Voltando para página inicial...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Procurar por "Idosos"
    const clickableElements2 = await page.$$('div');
    for (let i = 0; i < clickableElements2.length; i++) {
      const text = await page.evaluate(el => el.textContent, clickableElements2[i]);
      if (text && text.includes('Idosos')) {
        console.log(`✅ Elemento "Idosos" encontrado na posição ${i}`);
        
        // Clicar no elemento
        await clickableElements2[i].click();
        console.log('🖱️ Clicando em "Idosos"...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar se mudou a página
        const currentUrl = page.url();
        console.log(`📄 URL atual: ${currentUrl}`);
        
        // Procurar botões na nova página
        const buttons = await page.$$('button');
        console.log(`📊 Botões na página de idosos: ${buttons.length}`);
        
        for (let j = 0; j < buttons.length; j++) {
          const buttonText = await page.evaluate(el => el.textContent, buttons[j]);
          if (buttonText && buttonText.trim()) {
            console.log(`Botão ${j + 1}: "${buttonText}"`);
          }
        }
        
        break;
      }
    }
    
    console.log('\n🎯 Teste de navegação concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

testarSimplesNavegacao();
