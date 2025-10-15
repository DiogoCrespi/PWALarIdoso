import puppeteer from 'puppeteer';

async function testarModalDetalhado() {
  console.log('🧪 Teste Detalhado - Análise do Modal de Pagamento');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Acessando aplicação...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Encontrar e clicar em "Novo Pagamento"
    const buttons = await page.$$('button');
    let novoPagamentoButton = null;
    
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Novo Pagamento')) {
        novoPagamentoButton = button;
        break;
      }
    }
    
    if (novoPagamentoButton) {
      await novoPagamentoButton.click();
      console.log('✅ Modal aberto');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Analisar todos os elementos do modal
    console.log('\n🔍 Analisando elementos do modal...');
    
    // Todos os botões
    const modalButtons = await page.$$('button');
    console.log(`\n📊 Total de botões encontrados: ${modalButtons.length}`);
    
    for (let i = 0; i < modalButtons.length; i++) {
      const text = await page.evaluate(el => el.textContent, modalButtons[i]);
      const className = await page.evaluate(el => el.className, modalButtons[i]);
      console.log(`Botão ${i + 1}: "${text}" (classe: ${className})`);
    }
    
    // Todos os inputs
    const inputs = await page.$$('input');
    console.log(`\n📊 Total de inputs encontrados: ${inputs.length}`);
    
    for (let i = 0; i < inputs.length; i++) {
      const type = await page.evaluate(el => el.type, inputs[i]);
      const placeholder = await page.evaluate(el => el.placeholder, inputs[i]);
      const name = await page.evaluate(el => el.name, inputs[i]);
      console.log(`Input ${i + 1}: tipo="${type}", placeholder="${placeholder}", name="${name}"`);
    }
    
    // Todos os selects
    const selects = await page.$$('select');
    console.log(`\n📊 Total de selects encontrados: ${selects.length}`);
    
    for (let i = 0; i < selects.length; i++) {
      const name = await page.evaluate(el => el.name, selects[i]);
      console.log(`Select ${i + 1}: name="${name}"`);
    }
    
    // Verificar se há elementos com texto específico
    console.log('\n🔍 Procurando por elementos com texto específico...');
    
    const allElements = await page.$$('*');
    const textosProcurados = ['Salvar', 'Confirmar', 'Enviar', 'OK', 'Pronto'];
    
    for (const texto of textosProcurados) {
      for (const element of allElements) {
        const text = await page.evaluate(el => el.textContent, element);
        if (text && text.includes(texto)) {
          const tagName = await page.evaluate(el => el.tagName, element);
          console.log(`✅ Encontrado "${texto}" em elemento ${tagName}: "${text}"`);
        }
      }
    }
    
    console.log('\n🎯 Análise concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

testarModalDetalhado();
