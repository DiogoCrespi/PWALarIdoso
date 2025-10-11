import puppeteer from 'puppeteer';

async function runManualTest() {
  console.log('🧪 Iniciando teste manual real...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Mostrar o navegador
    slowMo: 10, // Delay maior para visualizar
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
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('✅ Página carregada!');
    
    // Clicar em "Novo Responsável"
    console.log('🖱️ Clicando em "Novo Responsável"...');
    await page.click('button:nth-child(2)');
    
    // Aguardar modal abrir
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📝 Preenchendo formulário...');
    
    // Preencher campos rapidamente
    
    // Preencher nome
    await page.type('input[id=":r9:"]', 'Teste Manual');
    
    // Preencher CPF
    await page.type('input[placeholder*="000.000.000-00"]', '10294484930');
    
    // Preencher telefone
    await page.type('input[placeholder*="(00) 00000-0000"]', '45999999999');
    
    // Preencher email
    await page.type('input[type="email"]', 'teste@manual.com');
    
    console.log('💾 Clicando em Salvar...');
    
    // Clicar no botão Salvar
    await page.click('button.MuiButton-containedPrimary');
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 100));
    
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
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await browser.close();
  }
}

// Executar o teste
runManualTest().catch(console.error);
