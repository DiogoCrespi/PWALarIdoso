import puppeteer from 'puppeteer';

async function testIdososSocial() {
  console.log('🏛️ Iniciando teste de idosos SOCIAL...');
  
  let browser;
  try {
    // Inicializar navegador
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Capturar logs
    const logs = [];
    page.on('console', msg => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    console.log('🌐 Navegando para a aplicação...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Aguardar inicialização se aparecer
    try {
      await page.waitForSelector('text=Inicializando sistema...', { timeout: 5000 });
      console.log('⏳ Aguardando inicialização...');
      await page.waitForSelector('text=Inicializando sistema...', { state: 'hidden', timeout: 30000 });
    } catch (e) {
      console.log('ℹ️ Inicialização não detectada, continuando...');
    }
    
    console.log('✅ Aplicação carregada!');
    
    let passedTests = 0;
    let failedTests = 0;

    // --- TESTE 1: Criar responsável primeiro ---
    console.log('\n🧪 TESTE 1: Criando responsável para teste');
    try {
      await page.click('text=Responsáveis');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.locator('button', { hasText: 'Novo Responsável' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await page.fill('input[label="Nome Completo"]', 'Maria Social Teste');
      await page.fill('input[label="CPF"]', '111.222.333-44');
      await page.fill('input[label="Telefone"]', '(11) 99999-8888');
      await page.fill('input[label="Email"]', 'maria@social.com');
      
      await page.locator('button', { hasText: 'Salvar' }).click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Responsável criado com sucesso');
      passedTests++;
    } catch (error) {
      console.log('❌ Erro ao criar responsável:', error.message);
      failedTests++;
    }

    // --- TESTE 2: Criar idoso SOCIAL ---
    console.log('\n🧪 TESTE 2: Criando idoso SOCIAL');
    try {
      await page.click('text=Idosos');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.locator('button', { hasText: 'Novo Idoso' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Preencher dados básicos
      await page.fill('input[label="Nome Completo"]', 'João Social Silva');
      await page.fill('input[label="CPF/CNPJ do Idoso"]', '555.666.777-88');
      
      // Selecionar responsável
      await page.locator('div[role="button"]', { hasText: 'Responsável' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.locator('li', { hasText: 'Maria Social Teste' }).click();
      
      // Preencher benefício (salário)
      await page.fill('input[label="Benefício (Salário do Idoso)"]', '1518,00');
      
      // Selecionar tipo SOCIAL
      await page.locator('div[role="button"]', { hasText: 'Tipo do Idoso' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.locator('li', { hasText: 'SOCIAL' }).click();
      
      // Verificar se mensalidade foi preenchida automaticamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mensalidadeValue = await page.inputValue('input[label="Valor da Mensalidade"]');
      
      if (mensalidadeValue.includes('1518')) {
        console.log('✅ Mensalidade preenchida automaticamente para idoso SOCIAL');
        passedTests++;
      } else {
        console.log('❌ Mensalidade não foi preenchida automaticamente');
        failedTests++;
      }
      
      // Verificar se campo mensalidade está desabilitado
      const isDisabled = await page.evaluate(() => {
        const input = document.querySelector('input[label="Valor da Mensalidade"]');
        return input ? input.disabled : false;
      });
      
      if (isDisabled) {
        console.log('✅ Campo mensalidade desabilitado para idoso SOCIAL');
        passedTests++;
      } else {
        console.log('❌ Campo mensalidade não está desabilitado');
        failedTests++;
      }
      
      // Salvar idoso
      await page.locator('button', { hasText: 'Salvar' }).click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Idoso SOCIAL criado com sucesso');
      passedTests++;
      
    } catch (error) {
      console.log('❌ Erro ao criar idoso SOCIAL:', error.message);
      failedTests++;
    }

    // --- TESTE 3: Criar pagamento para idoso SOCIAL ---
    console.log('\n🧪 TESTE 3: Criando pagamento para idoso SOCIAL');
    try {
      await page.click('text=Dashboard');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clicar no botão de novo pagamento
      await page.locator('button', { hasText: 'Novo Pagamento' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Selecionar idoso SOCIAL
      await page.locator('div[role="button"]', { hasText: 'Selecionar Idoso' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.locator('li', { hasText: 'João Social Silva' }).click();
      
      // Preencher valor pago (mesmo valor do benefício)
      await page.fill('input[label="Valor Pago"]', '1518,00');
      
      // Preencher outros campos
      await page.fill('input[label="Pagador"]', 'Prefeitura Municipal');
      await page.selectOption('select[label="Forma de Pagamento"]', 'Transferência bancária');
      
      // Salvar pagamento
      await page.locator('button', { hasText: 'Salvar' }).click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar se não gerou recibo (deve mostrar mensagem específica)
      const snackbarText = await page.textContent('.MuiSnackbar-root .MuiAlert-message');
      
      if (snackbarText && snackbarText.includes('SOCIAL')) {
        console.log('✅ Mensagem correta para idoso SOCIAL:', snackbarText);
        passedTests++;
      } else {
        console.log('❌ Mensagem incorreta ou recibo gerado para idoso SOCIAL');
        failedTests++;
      }
      
      console.log('✅ Pagamento para idoso SOCIAL criado com sucesso');
      passedTests++;
      
    } catch (error) {
      console.log('❌ Erro ao criar pagamento para idoso SOCIAL:', error.message);
      failedTests++;
    }

    // --- TESTE 4: Criar idoso REGULAR para comparação ---
    console.log('\n🧪 TESTE 4: Criando idoso REGULAR para comparação');
    try {
      await page.click('text=Idosos');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.locator('button', { hasText: 'Novo Idoso' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Preencher dados básicos
      await page.fill('input[label="Nome Completo"]', 'Ana Regular Santos');
      await page.fill('input[label="CPF/CNPJ do Idoso"]', '999.888.777-66');
      
      // Selecionar responsável
      await page.locator('div[role="button"]', { hasText: 'Responsável' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.locator('li', { hasText: 'Maria Social Teste' }).click();
      
      // Preencher benefício (salário)
      await page.fill('input[label="Benefício (Salário do Idoso)"]', '1518,00');
      
      // Preencher mensalidade (valor diferente)
      await page.fill('input[label="Valor da Mensalidade"]', '3225,00');
      
      // Selecionar tipo REGULAR
      await page.locator('div[role="button"]', { hasText: 'Tipo do Idoso' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.locator('li', { hasText: 'REGULAR' }).click();
      
      // Verificar se campo mensalidade está habilitado
      const isEnabled = await page.evaluate(() => {
        const input = document.querySelector('input[label="Valor da Mensalidade"]');
        return input ? !input.disabled : false;
      });
      
      if (isEnabled) {
        console.log('✅ Campo mensalidade habilitado para idoso REGULAR');
        passedTests++;
      } else {
        console.log('❌ Campo mensalidade não está habilitado para idoso REGULAR');
        failedTests++;
      }
      
      // Salvar idoso
      await page.locator('button', { hasText: 'Salvar' }).click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Idoso REGULAR criado com sucesso');
      passedTests++;
      
    } catch (error) {
      console.log('❌ Erro ao criar idoso REGULAR:', error.message);
      failedTests++;
    }

    // --- TESTE 5: Criar pagamento para idoso REGULAR ---
    console.log('\n🧪 TESTE 5: Criando pagamento para idoso REGULAR');
    try {
      await page.click('text=Dashboard');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clicar no botão de novo pagamento
      await page.locator('button', { hasText: 'Novo Pagamento' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Selecionar idoso REGULAR
      await page.locator('div[role="button"]', { hasText: 'Selecionar Idoso' }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.locator('li', { hasText: 'Ana Regular Santos' }).click();
      
      // Preencher valor pago (maior que o benefício para gerar doação)
      await page.fill('input[label="Valor Pago"]', '3225,00');
      
      // Preencher outros campos
      await page.fill('input[label="Pagador"]', 'Família Santos');
      await page.selectOption('select[label="Forma de Pagamento"]', 'Transferência bancária');
      
      // Salvar pagamento
      await page.locator('button', { hasText: 'Salvar' }).click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar se gerou recibo (deve mostrar mensagem sobre doação)
      const snackbarText = await page.textContent('.MuiSnackbar-root .MuiAlert-message');
      
      if (snackbarText && snackbarText.includes('doação')) {
        console.log('✅ Recibo de doação gerado para idoso REGULAR:', snackbarText);
        passedTests++;
      } else {
        console.log('❌ Recibo não foi gerado para idoso REGULAR');
        failedTests++;
      }
      
      console.log('✅ Pagamento para idoso REGULAR criado com sucesso');
      passedTests++;
      
    } catch (error) {
      console.log('❌ Erro ao criar pagamento para idoso REGULAR:', error.message);
      failedTests++;
    }

    console.log('\n🎉 Testes concluídos!');
    console.log(`📊 Resumo: ${passedTests} testes passaram, ${failedTests} falharam.`);
    
    if (failedTests > 0) {
      console.log('\n❌ Alguns testes falharam. Verifique os logs acima.');
      return false;
    } else {
      console.log('\n✅ Todos os testes passaram! Sistema funcionando corretamente.');
      return true;
    }
    
  } catch (error) {
    console.error('💥 Erro fatal durante os testes:', error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🧹 Navegador fechado.');
    }
  }
}

// Executar teste
testIdososSocial().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
