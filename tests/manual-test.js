import puppeteer from 'puppeteer';

async function runManualTest() {
  console.log('🧪 Iniciando teste manual real...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Mostrar o navegador
    slowMo: 500, // Delay maior para visualizar
    devtools: true // Abrir DevTools
  });
  
  const page = await browser.newPage();
  
  // Capturar logs do console
  page.on('console', msg => {
    console.log(`📱 CONSOLE [${msg.type()}]:`, msg.text());
  });
  
  try {
    console.log('🌐 Navegando para http://localhost:5173/responsaveis...');
    await page.goto('http://localhost:5173/responsaveis', { waitUntil: 'networkidle0' });
    
    // Aguardar carregamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Página carregada!');
    
    // Clicar em "Novo Responsável"
    console.log('🖱️ Clicando em "Novo Responsável"...');
    await page.click('button:nth-child(2)');
    
    // Aguardar modal abrir
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📝 Preenchendo formulário...');
    
    // Preencher nome
    await page.click('input[type="text"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Delete');
    await page.type('input[type="text"]', 'Teste Manual');
    console.log('✅ Nome preenchido: Teste Manual');
    
    // Preencher CPF
    await page.click('input[placeholder*="000.000.000-00"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Delete');
    await page.type('input[placeholder*="000.000.000-00"]', '10294484930');
    console.log('✅ CPF preenchido: 102.944.849-30');
    
    // Preencher telefone
    try {
      await page.click('input[placeholder*="(00) 00000-0000"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.press('Delete');
      await page.type('input[placeholder*="(00) 00000-0000"]', '45999999999');
      console.log('✅ Telefone preenchido');
    } catch (error) {
      console.log('ℹ️ Campo telefone não encontrado');
    }
    
    // Preencher email
    try {
      await page.click('input[type="email"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.press('Delete');
      await page.type('input[type="email"]', 'teste@manual.com');
      console.log('✅ Email preenchido');
    } catch (error) {
      console.log('ℹ️ Campo email não encontrado');
    }
    
    console.log('💾 Clicando em Salvar...');
    
    // Clicar em Salvar
    await page.click('button.MuiButton-containedPrimary');
    
    // Aguardar processamento
    console.log('⏳ Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verificar se o modal fechou
    const modalAindaAberto = await page.$('.MuiDialog-root');
    if (!modalAindaAberto) {
      console.log('✅ Modal fechou após salvar!');
    } else {
      console.log('❌ Modal ainda está aberto');
    }
    
    // Verificar se há feedback
    const alerts = await page.$$('.MuiAlert-root');
    if (alerts.length > 0) {
      const alertText = await page.$eval('.MuiAlert-root', el => el.textContent);
      console.log('📢 Feedback encontrado:', alertText);
    } else {
      console.log('⚠️ Nenhum feedback visual encontrado');
    }
    
    // Verificar se a lista foi atualizada
    const cards = await page.$$('.MuiCard-root');
    console.log(`📊 Total de cards na lista: ${cards.length}`);
    
    console.log('✅ Teste manual concluído!');
    
    // Aguardar um pouco antes de fechar
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await browser.close();
  }
}

// Executar o teste
runManualTest().catch(console.error);
