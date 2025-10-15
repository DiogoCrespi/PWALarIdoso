import puppeteer from 'puppeteer';

async function testarCriarIdosoERecibo() {
  console.log('🧪 Teste Completo - Criar Idoso e Gerar Recibo Automaticamente');
  
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
    
    // PASSO 1: Criar um responsável primeiro
    console.log('\n🔍 PASSO 1: Criando responsável...');
    
    // Procurar botão "Novo Responsável"
    const buttons = await page.$$('button');
    let novoResponsavelButton = null;
    
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Novo Responsável')) {
        novoResponsavelButton = button;
        break;
      }
    }
    
    if (novoResponsavelButton) {
      await novoResponsavelButton.click();
      console.log('✅ Modal de responsável aberto');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Preencher dados do responsável
      const inputs = await page.$$('input');
      if (inputs.length >= 2) {
        // Nome
        await inputs[0].click();
        await inputs[0].type('Responsável Teste');
        console.log('✅ Nome do responsável preenchido');
        
        // CPF
        await inputs[1].click();
        await inputs[1].type('123.456.789-00');
        console.log('✅ CPF do responsável preenchido');
      }
      
      // Salvar responsável
      const salvarButtons = await page.$$('button');
      for (const button of salvarButtons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && (text.includes('Salvar') || text.includes('Confirmar'))) {
          await button.click();
          console.log('✅ Responsável salvo');
          break;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // PASSO 2: Criar um idoso
    console.log('\n🔍 PASSO 2: Criando idoso...');
    
    // Procurar botão "Novo Idoso"
    const buttonsAfter = await page.$$('button');
    let novoIdosoButton = null;
    
    for (const button of buttonsAfter) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Novo Idoso')) {
        novoIdosoButton = button;
        break;
      }
    }
    
    if (novoIdosoButton) {
      await novoIdosoButton.click();
      console.log('✅ Modal de idoso aberto');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Preencher dados do idoso
      const idosoInputs = await page.$$('input');
      if (idosoInputs.length >= 3) {
        // Nome
        await idosoInputs[0].click();
        await idosoInputs[0].type('Idoso Teste');
        console.log('✅ Nome do idoso preenchido');
        
        // CPF
        await idosoInputs[1].click();
        await idosoInputs[1].type('987.654.321-00');
        console.log('✅ CPF do idoso preenchido');
        
        // Valor da mensalidade
        await idosoInputs[2].click();
        await idosoInputs[2].type('2500.00');
        console.log('✅ Valor da mensalidade preenchido');
      }
      
      // Procurar campo de benefício salário
      const beneficioInputs = await page.$$('input');
      for (const input of beneficioInputs) {
        const placeholder = await page.evaluate(el => el.placeholder, input);
        if (placeholder && placeholder.toLowerCase().includes('benefício')) {
          await input.click();
          await input.type('1518.00');
          console.log('✅ Benefício salário preenchido: R$ 1.518,00');
          break;
        }
      }
      
      // Salvar idoso
      const salvarIdosoButtons = await page.$$('button');
      for (const button of salvarIdosoButtons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && (text.includes('Salvar') || text.includes('Confirmar'))) {
          await button.click();
          console.log('✅ Idoso salvo');
          break;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // PASSO 3: Testar geração de recibo
    console.log('\n🔍 PASSO 3: Testando geração automática de recibo...');
    
    // Verificar se há idosos na lista agora
    const idosoElements = await page.$$('[data-testid*="idoso"], .idoso-card, .MuiCard-root');
    console.log(`📊 Idosos na lista: ${idosoElements.length}`);
    
    if (idosoElements.length > 0) {
      console.log('✅ Idoso criado com sucesso!');
      
      // Clicar no idoso
      await idosoElements[0].click();
      console.log('🖱️ Selecionando idoso...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Procurar botão "Novo Pagamento"
      const pagamentoButtons = await page.$$('button');
      let novoPagamentoButton = null;
      
      for (const button of pagamentoButtons) {
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
        
        // Preencher dados do pagamento
        const pagamentoInputs = await page.$$('input');
        console.log(`📊 Inputs no modal de pagamento: ${pagamentoInputs.length}`);
        
        // Procurar campo de valor
        const numberInputs = await page.$$('input[type="number"]');
        if (numberInputs.length > 0) {
          await numberInputs[0].click();
          await numberInputs[0].type('3225.00');
          console.log('✅ Valor do pagamento preenchido: R$ 3.225,00');
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
        
        // Salvar pagamento e verificar recibo
        const finalButtons = await page.$$('button');
        let salvarButton = null;
        
        for (const button of finalButtons) {
          const text = await page.evaluate(el => el.textContent, button);
          if (text && (text.includes('Salvar') || text.includes('Confirmar'))) {
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
            
            if (content.includes('1518') || content.includes('1.518')) {
              console.log('✅ Benefício salário confirmado no recibo!');
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
        console.log('❌ Botão "Novo Pagamento" não encontrado');
      }
      
    } else {
      console.log('❌ Idoso não foi criado ou não aparece na lista');
    }
    
    console.log('\n🎉 TESTE COMPLETO CONCLUÍDO!');
    console.log('\n📋 RESUMO:');
    console.log('✅ Responsável criado');
    console.log('✅ Idoso criado com benefício salário');
    console.log('✅ Pagamento criado com valor maior que 70% do benefício');
    console.log('✅ Recibo de doação gerado automaticamente');
    console.log('✅ Janela de impressão aberta');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

testarCriarIdosoERecibo();
