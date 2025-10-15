import puppeteer from 'puppeteer';

async function testSocialManual() {
  console.log('🏛️ Teste manual de idosos SOCIAL...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 500,
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
    
    // TESTE 1: Navegar para página de idosos
    console.log('\n🧪 TESTE 1: Navegando para página de idosos');
    try {
      // Clicar no link "Idosos"
      const idososLink = await page.evaluateHandle(() => {
        const links = Array.from(document.querySelectorAll('a, [role="button"]'));
        return links.find(link => link.textContent && link.textContent.includes('Idosos'));
      });
      
      if (idososLink) {
        await idososLink.click();
        console.log('✅ Navegou para página de idosos');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log('❌ Link "Idosos" não encontrado');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Erro ao navegar para idosos:', error.message);
      return false;
    }
    
    // TESTE 2: Encontrar e clicar no botão "Novo Idoso"
    console.log('\n🧪 TESTE 2: Procurando botão "Novo Idoso"');
    try {
      // Aguardar um pouco para a página carregar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Procurar botão "Novo Idoso"
      const novoIdosoButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(button => button.textContent && button.textContent.includes('Novo Idoso'));
      });
      
      if (novoIdosoButton) {
        await novoIdosoButton.click();
        console.log('✅ Botão "Novo Idoso" encontrado e clicado');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('❌ Botão "Novo Idoso" não encontrado');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Erro ao clicar em "Novo Idoso":', error.message);
      return false;
    }
    
    // TESTE 3: Verificar se o modal abriu
    console.log('\n🧪 TESTE 3: Verificando se modal de novo idoso abriu');
    try {
      // Verificar se há campos do formulário
      const nomeField = await page.$('input[label="Nome Completo"]');
      if (nomeField) {
        console.log('✅ Modal de novo idoso aberto - campo nome encontrado');
      } else {
        console.log('❌ Modal não abriu ou campo nome não encontrado');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Erro ao verificar modal:', error.message);
      return false;
    }
    
    // TESTE 4: Preencher dados básicos
    console.log('\n🧪 TESTE 4: Preenchendo dados básicos');
    try {
      // Preencher nome
      await page.fill('input[label="Nome Completo"]', 'João Social Teste');
      console.log('✅ Nome preenchido');
      
      // Preencher CPF
      await page.fill('input[label="CPF/CNPJ do Idoso"]', '123.456.789-00');
      console.log('✅ CPF preenchido');
      
      // Preencher benefício
      await page.fill('input[label="Benefício (Salário do Idoso)"]', '1518,00');
      console.log('✅ Benefício preenchido');
      
    } catch (error) {
      console.log('❌ Erro ao preencher dados básicos:', error.message);
      return false;
    }
    
    // TESTE 5: Selecionar tipo SOCIAL
    console.log('\n🧪 TESTE 5: Selecionando tipo SOCIAL');
    try {
      // Clicar no dropdown de tipo
      const tipoDropdown = await page.evaluateHandle(() => {
        const dropdowns = Array.from(document.querySelectorAll('div[role="button"]'));
        return dropdowns.find(dropdown => dropdown.textContent && dropdown.textContent.includes('Tipo do Idoso'));
      });
      
      if (tipoDropdown) {
        await tipoDropdown.click();
        console.log('✅ Dropdown de tipo clicado');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Procurar opção SOCIAL
        const socialOption = await page.evaluateHandle(() => {
          const options = Array.from(document.querySelectorAll('li'));
          return options.find(option => option.textContent && option.textContent.includes('SOCIAL'));
        });
        
        if (socialOption) {
          await socialOption.click();
          console.log('✅ Tipo SOCIAL selecionado');
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log('❌ Opção SOCIAL não encontrada');
          return false;
        }
      } else {
        console.log('❌ Dropdown de tipo não encontrado');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Erro ao selecionar tipo SOCIAL:', error.message);
      return false;
    }
    
    // TESTE 6: Verificar comportamento do campo mensalidade
    console.log('\n🧪 TESTE 6: Verificando comportamento do campo mensalidade');
    try {
      // Verificar se mensalidade foi preenchida automaticamente
      const mensalidadeValue = await page.inputValue('input[label="Valor da Mensalidade"]');
      console.log('📊 Valor da mensalidade:', mensalidadeValue);
      
      if (mensalidadeValue.includes('1518')) {
        console.log('✅ Mensalidade preenchida automaticamente para SOCIAL');
      } else {
        console.log('❌ Mensalidade não foi preenchida automaticamente');
        console.log('Valor esperado: 1518, Valor encontrado:', mensalidadeValue);
        return false;
      }
      
      // Verificar se campo está desabilitado
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
      console.log('❌ Erro ao verificar campo mensalidade:', error.message);
      return false;
    }
    
    // TESTE 7: Testar mudança para REGULAR
    console.log('\n🧪 TESTE 7: Testando mudança para tipo REGULAR');
    try {
      // Clicar no dropdown de tipo novamente
      const tipoDropdown = await page.evaluateHandle(() => {
        const dropdowns = Array.from(document.querySelectorAll('div[role="button"]'));
        return dropdowns.find(dropdown => dropdown.textContent && dropdown.textContent.includes('Tipo do Idoso'));
      });
      
      if (tipoDropdown) {
        await tipoDropdown.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Procurar opção REGULAR
        const regularOption = await page.evaluateHandle(() => {
          const options = Array.from(document.querySelectorAll('li'));
          return options.find(option => option.textContent && option.textContent.includes('REGULAR'));
        });
        
        if (regularOption) {
          await regularOption.click();
          console.log('✅ Tipo REGULAR selecionado');
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
          
          // Testar edição do campo
          await page.fill('input[label="Valor da Mensalidade"]', '3225,00');
          const newValue = await page.inputValue('input[label="Valor da Mensalidade"]');
          
          if (newValue.includes('3225')) {
            console.log('✅ Campo mensalidade pode ser editado para REGULAR');
          } else {
            console.log('❌ Campo mensalidade não pode ser editado para REGULAR');
            return false;
          }
          
        } else {
          console.log('❌ Opção REGULAR não encontrada');
          return false;
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao testar tipo REGULAR:', error.message);
      return false;
    }
    
    console.log('\n🎉 Todos os testes passaram!');
    console.log('✅ Funcionalidade de idosos SOCIAL implementada corretamente!');
    console.log('✅ Sistema diferencia corretamente entre SOCIAL e REGULAR!');
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
testSocialManual().then(success => {
  if (success) {
    console.log('\n🏆 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ Sistema de idosos SOCIAL funcionando perfeitamente!');
    console.log('✅ Campos se comportam corretamente para ambos os tipos!');
  } else {
    console.log('\n❌ TESTE FALHOU!');
    console.log('🔧 Verifique a implementação.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
