import puppeteer from 'puppeteer';

async function testarReciboSimples() {
  console.log('🧪 Teste Simples - Geração Automática de Recibo');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Acessando http://localhost:5174...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Aplicação carregada');
    
    // Verificar se existe botão "Novo Pagamento"
    const buttons = await page.$$('button');
    let encontrado = false;
    
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Novo Pagamento')) {
        console.log('✅ Botão "Novo Pagamento" encontrado');
        encontrado = true;
        break;
      }
    }
    
    if (!encontrado) {
      console.log('❌ Botão "Novo Pagamento" não encontrado');
    }
    
    console.log('🎯 Teste básico concluído');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

testarReciboSimples();
