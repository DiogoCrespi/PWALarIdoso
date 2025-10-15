import puppeteer from 'puppeteer';

async function testarFluxoCompleto() {
  console.log('🧪 Teste Fluxo Completo - Geração Automática de Recibo');
  
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
    
    // Verificar se há idosos na lista
    console.log('\n🔍 Verificando se há idosos na lista...');
    
    const idosoElements = await page.$$('[data-testid*="idoso"], .idoso-card, .MuiCard-root');
    console.log(`📊 Elementos de idoso encontrados: ${idosoElements.length}`);
    
    if (idosoElements.length > 0) {
      console.log('✅ Idosos encontrados na lista');
      
      // Clicar no primeiro idoso
      await idosoElements[0].click();
      console.log('🖱️ Clicando no primeiro idoso...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Procurar botão "Novo Pagamento" novamente
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
        console.log('✅ Modal de pagamento aberto');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar campos do modal
        const inputs = await page.$$('input');
        console.log(`📊 Inputs no modal: ${inputs.length}`);
        
        for (let i = 0; i < inputs.length; i++) {
          const type = await page.evaluate(el => el.type, inputs[i]);
          const placeholder = await page.evaluate(el => el.placeholder, inputs[i]);
          const value = await page.evaluate(el => el.value, inputs[i]);
          console.log(`Input ${i + 1}: tipo="${type}", placeholder="${placeholder}", value="${value}"`);
        }
        
        // Procurar campos específicos
        const numberInputs = await page.$$('input[type="number"]');
        if (numberInputs.length > 0) {
          console.log('✅ Campo numérico encontrado');
          await numberInputs[0].click();
          await numberInputs[0].type('3225.00');
          console.log('✅ Valor preenchido: R$ 3.225,00');
        }
        
        // Procurar campo NFSE
        const textInputs = await page.$$('input[type="text"]');
        for (const input of textInputs) {
          const placeholder = await page.evaluate(el => el.placeholder, input);
          if (placeholder && placeholder.toLowerCase().includes('nfse')) {
            await input.click();
            await input.type('NFSE-TESTE-123');
            console.log('✅ NFSE preenchida');
            break;
          }
        }
        
        // Procurar botão de salvar
        const actionButtons = await page.$$('button');
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
          console.log('🖱️ Salvando pagamento...');
          
          // Aguardar processamento
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Verificar se nova aba foi aberta
          const pagesAfter = await browser.pages();
          console.log(`📊 Abas depois: ${pagesAfter.length}`);
          
          if (pagesAfter.length > pagesBefore.length) {
            console.log('🎉 SUCESSO! Nova aba aberta (recibo gerado automaticamente!)');
            
            const newPage = pagesAfter[pagesAfter.length - 1];
            const title = await newPage.title();
            console.log(`📄 Título da nova aba: ${title}`);
            
            // Verificar conteúdo do recibo
            const content = await newPage.content();
            if (content.includes('RECIBO') || content.includes('Recibo')) {
              console.log('✅ Conteúdo de recibo confirmado!');
            }
            
            if (content.includes('doação') || content.includes('Doação')) {
              console.log('✅ Recibo de doação confirmado!');
            }
            
            if (content.includes('3225') || content.includes('3.225')) {
              console.log('✅ Valor do pagamento confirmado no recibo!');
            }
            
            await newPage.close();
          } else {
            console.log('⚠️ Nenhuma nova aba foi aberta');
          }
          
          // Verificar mensagem de sucesso
          const alerts = await page.$$('[role="alert"]');
          if (alerts.length > 0) {
            const message = await page.evaluate(el => el.textContent, alerts[0]);
            console.log(`📢 Mensagem: ${message}`);
            
            if (message.includes('recibo') || message.includes('doação')) {
              console.log('✅ Mensagem confirma geração de recibo!');
            }
          }
          
        } else {
          console.log('❌ Botão de salvar não encontrado');
        }
        
      } else {
        console.log('❌ Botão "Novo Pagamento" não encontrado após selecionar idoso');
      }
      
    } else {
      console.log('❌ Nenhum idoso encontrado na lista');
      console.log('💡 Pode ser necessário criar um idoso primeiro');
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

testarFluxoCompleto();
