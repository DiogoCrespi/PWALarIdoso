import puppeteer from 'puppeteer';

async function testSocialSimple() {
  console.log('🏛️ Teste simples de idosos SOCIAL...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 200,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('🌐 Navegando para a aplicação...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Aguardar inicialização
    try {
      await page.waitForSelector('text=Inicializando sistema...', { timeout: 5000 });
      console.log('⏳ Aguardando inicialização...');
      await page.waitForSelector('text=Inicializando sistema...', { state: 'hidden', timeout: 30000 });
    } catch (e) {
      console.log('ℹ️ Inicialização não detectada, continuando...');
    }
    
    console.log('✅ Aplicação carregada!');
    
    // TESTE 1: Verificar se a página de idosos carrega
    console.log('\n🧪 TESTE 1: Verificando página de idosos');
    try {
      await page.click('text=Idosos');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar se há botão "Novo Idoso"
      const novoIdosoButton = await page.$('button');
      const buttons = await page.$$('button');
      let novoIdosoButtonFound = null;
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && text.includes('Novo Idoso')) {
          novoIdosoButtonFound = button;
          break;
        }
      }
      if (novoIdosoButtonFound) {
        console.log('✅ Botão "Novo Idoso" encontrado');
        // Clicar no botão "Novo Idoso"
        await novoIdosoButtonFound.click();
      } else {
        console.log('❌ Botão "Novo Idoso" não encontrado');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Modal de novo idoso aberto');
      
    } catch (error) {
      console.log('❌ Erro ao abrir modal de idoso:', error.message);
      return false;
    }
    
    // TESTE 2: Verificar campos do formulário
    console.log('\n🧪 TESTE 2: Verificando campos do formulário');
    try {
      // Verificar se campo de benefício existe
      const beneficioField = await page.$('input[label="Benefício (Salário do Idoso)"]');
      if (beneficioField) {
        console.log('✅ Campo "Benefício (Salário do Idoso)" encontrado');
      } else {
        console.log('❌ Campo "Benefício (Salário do Idoso)" não encontrado');
        return false;
      }
      
      // Verificar se campo de mensalidade existe
      const mensalidadeField = await page.$('input[label="Valor da Mensalidade"]');
      if (mensalidadeField) {
        console.log('✅ Campo "Valor da Mensalidade" encontrado');
      } else {
        console.log('❌ Campo "Valor da Mensalidade" não encontrado');
        return false;
      }
      
      // Verificar se campo de tipo existe
      const tipoField = await page.$('div[role="button"]:contains("Tipo do Idoso")');
      if (tipoField) {
        console.log('✅ Campo "Tipo do Idoso" encontrado');
      } else {
        console.log('❌ Campo "Tipo do Idoso" não encontrado');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Erro ao verificar campos:', error.message);
      return false;
    }
    
    // TESTE 3: Testar funcionalidade SOCIAL
    console.log('\n🧪 TESTE 3: Testando funcionalidade SOCIAL');
    try {
      // Preencher nome
      await page.fill('input[label="Nome Completo"]', 'Teste Social');
      
      // Preencher benefício
      await page.fill('input[label="Benefício (Salário do Idoso)"]', '1518,00');
      
      // Selecionar tipo SOCIAL
      await page.click('div[role="button"]:contains("Tipo do Idoso")');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Procurar opção SOCIAL
      const listItems = await page.$$('li');
      let socialOption = null;
      for (const item of listItems) {
        const text = await page.evaluate(el => el.textContent, item);
        if (text && text.includes('SOCIAL')) {
          socialOption = item;
          break;
        }
      }
      if (socialOption) {
        await socialOption.click();
        console.log('✅ Tipo SOCIAL selecionado');
      } else {
        console.log('❌ Opção SOCIAL não encontrada');
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se mensalidade foi preenchida automaticamente
      const mensalidadeValue = await page.inputValue('input[label="Valor da Mensalidade"]');
      if (mensalidadeValue.includes('1518')) {
        console.log('✅ Mensalidade preenchida automaticamente para SOCIAL');
      } else {
        console.log('❌ Mensalidade não foi preenchida automaticamente');
        console.log('Valor encontrado:', mensalidadeValue);
        return false;
      }
      
      // Verificar se campo mensalidade está desabilitado
      const isDisabled = await page.evaluate(() => {
        const input = document.querySelector('input[label="Valor da Mensalidade"]');
        return input ? input.disabled : false;
      });
      
      if (isDisabled) {
        console.log('✅ Campo mensalidade desabilitado para SOCIAL');
      } else {
        console.log('❌ Campo mensalidade não está desabilitado para SOCIAL');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Erro ao testar funcionalidade SOCIAL:', error.message);
      return false;
    }
    
    // TESTE 4: Testar funcionalidade REGULAR
    console.log('\n🧪 TESTE 4: Testando funcionalidade REGULAR');
    try {
      // Selecionar tipo REGULAR
      await page.click('div[role="button"]:contains("Tipo do Idoso")');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const listItems2 = await page.$$('li');
      let regularOption = null;
      for (const item of listItems2) {
        const text = await page.evaluate(el => el.textContent, item);
        if (text && text.includes('REGULAR')) {
          regularOption = item;
          break;
        }
      }
      if (regularOption) {
        await regularOption.click();
        console.log('✅ Tipo REGULAR selecionado');
      } else {
        console.log('❌ Opção REGULAR não encontrada');
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se campo mensalidade está habilitado
      const isEnabled = await page.evaluate(() => {
        const input = document.querySelector('input[label="Valor da Mensalidade"]');
        return input ? !input.disabled : false;
      });
      
      if (isEnabled) {
        console.log('✅ Campo mensalidade habilitado para REGULAR');
      } else {
        console.log('❌ Campo mensalidade não está habilitado para REGULAR');
        return false;
      }
      
      // Preencher mensalidade diferente
      await page.fill('input[label="Valor da Mensalidade"]', '3225,00');
      
      const mensalidadeValue = await page.inputValue('input[label="Valor da Mensalidade"]');
      if (mensalidadeValue.includes('3225')) {
        console.log('✅ Mensalidade pode ser editada para REGULAR');
      } else {
        console.log('❌ Mensalidade não pode ser editada para REGULAR');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Erro ao testar funcionalidade REGULAR:', error.message);
      return false;
    }
    
    console.log('\n🎉 Todos os testes passaram!');
    console.log('✅ Funcionalidade de idosos SOCIAL implementada corretamente!');
    return true;
    
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
testSocialSimple().then(success => {
  if (success) {
    console.log('\n🏆 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ Sistema de idosos SOCIAL funcionando perfeitamente!');
  } else {
    console.log('\n❌ TESTE FALHOU!');
    console.log('🔧 Verifique a implementação.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
