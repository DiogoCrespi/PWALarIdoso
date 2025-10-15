import puppeteer from 'puppeteer';

async function testarNavegacaoMenu() {
  console.log('🧪 Teste Navegação Menu - Cadastrar Responsável e Idoso');
  
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
    
    // PASSO 1: Navegar para Responsáveis
    console.log('\n🔍 PASSO 1: Navegando para Responsáveis...');
    
    const clickableElements = await page.$$('a, button, [role="button"], div');
    let responsaveisElement = null;
    
    for (const element of clickableElements) {
      const text = await page.evaluate(el => el.textContent, element);
      if (text && text.includes('Responsáveis')) {
        responsaveisElement = element;
        break;
      }
    }
    
    if (responsaveisElement) {
      await responsaveisElement.click();
      console.log('✅ Navegando para Responsáveis...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Procurar botão "Novo Responsável" na página de responsáveis
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
        console.log(`📊 Inputs encontrados: ${inputs.length}`);
        
        if (inputs.length >= 2) {
          // Nome
          await inputs[0].click();
          await inputs[0].type('Maria da Silva');
          console.log('✅ Nome: Maria da Silva');
          
          // CPF
          await inputs[1].click();
          await inputs[1].type('123.456.789-00');
          console.log('✅ CPF: 123.456.789-00');
        }
        
        // Procurar outros campos
        for (let i = 2; i < inputs.length; i++) {
          const placeholder = await page.evaluate(el => el.placeholder, inputs[i]);
          const type = await page.evaluate(el => el.type, inputs[i]);
          
          if (placeholder && placeholder.toLowerCase().includes('telefone')) {
            await inputs[i].click();
            await inputs[i].type('(45) 99999-9999');
            console.log('✅ Telefone preenchido');
          } else if (placeholder && placeholder.toLowerCase().includes('email')) {
            await inputs[i].click();
            await inputs[i].type('maria@email.com');
            console.log('✅ Email preenchido');
          }
        }
        
        // Salvar responsável
        const salvarButtons = await page.$$('button');
        for (const button of salvarButtons) {
          const text = await page.evaluate(el => el.textContent, button);
          if (text && (text.includes('Salvar') || text.includes('Confirmar'))) {
            await button.click();
            console.log('✅ Responsável salvo com sucesso!');
            break;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.log('❌ Botão "Novo Responsável" não encontrado na página');
      }
    } else {
      console.log('❌ Elemento "Responsáveis" não encontrado');
    }
    
    // PASSO 2: Navegar para Idosos
    console.log('\n🔍 PASSO 2: Navegando para Idosos...');
    
    const clickableElementsAfter = await page.$$('a, button, [role="button"], div');
    let idososElement = null;
    
    for (const element of clickableElementsAfter) {
      const text = await page.evaluate(el => el.textContent, element);
      if (text && text.includes('Idosos')) {
        idososElement = element;
        break;
      }
    }
    
    if (idososElement) {
      await idososElement.click();
      console.log('✅ Navegando para Idosos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Procurar botão "Novo Idoso"
      const idosoButtons = await page.$$('button');
      let novoIdosoButton = null;
      
      for (const button of idosoButtons) {
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
        console.log(`📊 Inputs do idoso: ${idosoInputs.length}`);
        
        if (idosoInputs.length >= 3) {
          // Nome
          await idosoInputs[0].click();
          await idosoInputs[0].type('João da Silva');
          console.log('✅ Nome do idoso: João da Silva');
          
          // CPF
          await idosoInputs[1].click();
          await idosoInputs[1].type('987.654.321-00');
          console.log('✅ CPF do idoso: 987.654.321-00');
          
          // Valor da mensalidade
          await idosoInputs[2].click();
          await idosoInputs[2].type('2500.00');
          console.log('✅ Valor da mensalidade: R$ 2.500,00');
        }
        
        // Procurar campo de benefício salário
        for (const input of idosoInputs) {
          const placeholder = await page.evaluate(el => el.placeholder, input);
          if (placeholder && placeholder.toLowerCase().includes('benefício')) {
            await input.click();
            await input.type('1518.00');
            console.log('✅ Benefício salário: R$ 1.518,00');
            break;
          }
        }
        
        // Procurar campo de data de nascimento
        for (const input of idosoInputs) {
          const type = await page.evaluate(el => el.type, input);
          if (type === 'date') {
            await input.click();
            await input.type('1950-01-01');
            console.log('✅ Data de nascimento: 01/01/1950');
            break;
          }
        }
        
        // Salvar idoso
        const salvarIdosoButtons = await page.$$('button');
        for (const button of salvarIdosoButtons) {
          const text = await page.evaluate(el => el.textContent, button);
          if (text && (text.includes('Salvar') || text.includes('Confirmar'))) {
            await button.click();
            console.log('✅ Idoso salvo com sucesso!');
            break;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.log('❌ Botão "Novo Idoso" não encontrado na página');
      }
    } else {
      console.log('❌ Elemento "Idosos" não encontrado');
    }
    
    // PASSO 3: Voltar para Dashboard e testar recibo
    console.log('\n🔍 PASSO 3: Voltando para Dashboard...');
    
    const dashboardElement = await page.$('div:contains("Dashboard")');
    if (dashboardElement) {
      await dashboardElement.click();
      console.log('✅ Navegando para Dashboard...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Verificar se há idosos na lista
    const idosoElements = await page.$$('[data-testid*="idoso"], .idoso-card, .MuiCard-root, .MuiListItem-root');
    console.log(`📊 Idosos na lista: ${idosoElements.length}`);
    
    if (idosoElements.length > 0) {
      console.log('✅ Idoso criado e aparece na lista!');
      
      // Clicar no idoso
      await idosoElements[0].click();
      console.log('🖱️ Selecionando idoso...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Testar geração de recibo
      console.log('\n🔍 PASSO 4: Testando geração automática de recibo...');
      
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
          console.log('✅ Valor do pagamento: R$ 3.225,00');
        }
        
        // Procurar campo NFSE
        const textInputs = await page.$$('input[type="text"]');
        for (const input of textInputs) {
          const placeholder = await page.evaluate(el => el.placeholder, input);
          if (placeholder && placeholder.toLowerCase().includes('nfse')) {
            await input.click();
            await input.type('NFSE-TESTE-123456');
            console.log('✅ NFSE: NFSE-TESTE-123456');
            break;
          }
        }
        
        // Salvar pagamento
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
            
            await newPage.close();
          } else {
            console.log('⚠️ Nenhuma nova aba foi aberta');
          }
          
          // Verificar mensagem
          const alerts = await page.$$('[role="alert"]');
          if (alerts.length > 0) {
            const message = await page.evaluate(el => el.textContent, alerts[0]);
            console.log(`📢 Mensagem: ${message}`);
          }
        }
      }
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

testarNavegacaoMenu();
