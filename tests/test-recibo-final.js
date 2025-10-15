import puppeteer from 'puppeteer';

async function testarReciboFinal() {
  console.log('🧪 Teste Final - Geração Automática de Recibo');
  
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
      
      // Aguardar carregamento completo do modal
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar se há mais campos agora
      const inputsAfter = await page.$$('input');
      console.log(`📊 Inputs após aguardar: ${inputsAfter.length}`);
      
      // Procurar por campos específicos
      for (let i = 0; i < inputsAfter.length; i++) {
        const type = await page.evaluate(el => el.type, inputsAfter[i]);
        const placeholder = await page.evaluate(el => el.placeholder, inputsAfter[i]);
        const value = await page.evaluate(el => el.value, inputsAfter[i]);
        console.log(`Input ${i + 1}: tipo="${type}", placeholder="${placeholder}", value="${value}"`);
      }
      
      // Procurar por botões de ação
      const actionButtons = await page.$$('button');
      console.log(`📊 Botões após aguardar: ${actionButtons.length}`);
      
      for (let i = 0; i < actionButtons.length; i++) {
        const text = await page.evaluate(el => el.textContent, actionButtons[i]);
        if (text && text.trim()) {
          console.log(`Botão ${i + 1}: "${text}"`);
        }
      }
      
      // Tentar preencher um campo de valor se existir
      const numberInputs = await page.$$('input[type="number"]');
      if (numberInputs.length > 0) {
        console.log('✅ Campo numérico encontrado, preenchendo...');
        await numberInputs[0].click();
        await numberInputs[0].type('3225.00');
        console.log('✅ Valor preenchido: R$ 3.225,00');
      }
      
      // Procurar por botão de salvar/confirmar
      let salvarButton = null;
      for (const button of actionButtons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && (text.includes('Salvar') || text.includes('Confirmar') || text.includes('Enviar'))) {
          salvarButton = button;
          break;
        }
      }
      
      if (salvarButton) {
        console.log('✅ Botão de salvar encontrado');
        
        // Interceptar downloads
        await page._client.send('Page.setDownloadBehavior', {
          behavior: 'allow',
          downloadPath: './downloads'
        });
        
        // Contar abas antes
        const pagesBefore = await browser.pages();
        console.log(`📊 Abas antes: ${pagesBefore.length}`);
        
        // Clicar em salvar
        await salvarButton.click();
        console.log('🖱️ Clicando em salvar...');
        
        // Aguardar processamento
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Verificar se nova aba foi aberta
        const pagesAfter = await browser.pages();
        console.log(`📊 Abas depois: ${pagesAfter.length}`);
        
        if (pagesAfter.length > pagesBefore.length) {
          console.log('✅ Nova aba aberta (recibo gerado!)');
          
          const newPage = pagesAfter[pagesAfter.length - 1];
          const title = await newPage.title();
          console.log(`📄 Título: ${title}`);
          
          // Verificar conteúdo
          const content = await newPage.content();
          if (content.includes('RECIBO') || content.includes('Recibo')) {
            console.log('✅ Conteúdo de recibo confirmado!');
          }
          
          await newPage.close();
        }
        
        // Verificar mensagem
        const alerts = await page.$$('[role="alert"]');
        if (alerts.length > 0) {
          const message = await page.evaluate(el => el.textContent, alerts[0]);
          console.log(`📢 Mensagem: ${message}`);
        }
        
      } else {
        console.log('❌ Botão de salvar não encontrado');
      }
    }
    
    console.log('\n🎉 Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

testarReciboFinal();
