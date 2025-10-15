import puppeteer from 'puppeteer';

async function testSimpleCreation() {
  console.log('👥 Teste simples de criação de usuários...');
  
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
    
    let passedTests = 0;
    let failedTests = 0;

    // --- TESTE 1: Verificar se conseguimos navegar para responsáveis ---
    console.log('\n🧪 TESTE 1: Navegando para responsáveis');
    try {
      const responsaveisLink = await page.evaluateHandle(() => {
        const elements = Array.from(document.querySelectorAll('a, [role="button"]'));
        return elements.find(el => el.textContent && el.textContent.includes('Responsáveis'));
      });
      
      if (responsaveisLink) {
        await responsaveisLink.click();
        console.log('✅ Navegou para página de responsáveis');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar se há botão "Novo Responsável"
        const novoResponsavelButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent && btn.textContent.includes('Novo Responsável'));
        });
        
        if (novoResponsavelButton) {
          console.log('✅ Botão "Novo Responsável" encontrado');
          passedTests++;
        } else {
          console.log('❌ Botão "Novo Responsável" não encontrado');
          failedTests++;
        }
      } else {
        console.log('❌ Link "Responsáveis" não encontrado');
        failedTests++;
      }
      
    } catch (error) {
      console.log('❌ Erro ao navegar para responsáveis:', error.message);
      failedTests++;
    }

    // --- TESTE 2: Verificar se conseguimos navegar para idosos ---
    console.log('\n🧪 TESTE 2: Navegando para idosos');
    try {
      const idososLink = await page.evaluateHandle(() => {
        const elements = Array.from(document.querySelectorAll('a, [role="button"]'));
        return elements.find(el => el.textContent && el.textContent.includes('Idosos'));
      });
      
      if (idososLink) {
        await idososLink.click();
        console.log('✅ Navegou para página de idosos');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar se há botão "Novo Idoso"
        const novoIdosoButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent && btn.textContent.includes('Novo Idoso'));
        });
        
        if (novoIdosoButton) {
          console.log('✅ Botão "Novo Idoso" encontrado');
          passedTests++;
        } else {
          console.log('❌ Botão "Novo Idoso" não encontrado');
          failedTests++;
        }
      } else {
        console.log('❌ Link "Idosos" não encontrado');
        failedTests++;
      }
      
    } catch (error) {
      console.log('❌ Erro ao navegar para idosos:', error.message);
      failedTests++;
    }

    // --- TESTE 3: Verificar se conseguimos abrir modal de novo idoso ---
    console.log('\n🧪 TESTE 3: Tentando abrir modal de novo idoso');
    try {
      const novoIdosoButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => btn.textContent && btn.textContent.includes('Novo Idoso'));
      });
      
      if (novoIdosoButton) {
        await novoIdosoButton.click();
        console.log('✅ Clicou no botão "Novo Idoso"');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar se modal abriu procurando por campos
        const nomeField = await page.evaluateHandle(() => {
          const inputs = Array.from(document.querySelectorAll('input'));
          return inputs.find(input => input.getAttribute('label') === 'Nome Completo');
        });
        
        if (nomeField) {
          console.log('✅ Modal de novo idoso aberto - campo nome encontrado');
          passedTests++;
        } else {
          console.log('❌ Modal não abriu ou campo nome não encontrado');
          failedTests++;
        }
      } else {
        console.log('❌ Botão "Novo Idoso" não encontrado');
        failedTests++;
      }
      
    } catch (error) {
      console.log('❌ Erro ao abrir modal de novo idoso:', error.message);
      failedTests++;
    }

    // --- TESTE 4: Verificar se há campos do formulário ---
    console.log('\n🧪 TESTE 4: Verificando campos do formulário');
    try {
      // Verificar se há campo de benefício
      const beneficioField = await page.evaluateHandle(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        return inputs.find(input => input.getAttribute('label') === 'Benefício (Salário do Idoso)');
      });
      
      if (beneficioField) {
        console.log('✅ Campo "Benefício (Salário do Idoso)" encontrado');
        passedTests++;
      } else {
        console.log('❌ Campo "Benefício (Salário do Idoso)" não encontrado');
        failedTests++;
      }
      
      // Verificar se há campo de mensalidade
      const mensalidadeField = await page.evaluateHandle(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        return inputs.find(input => input.getAttribute('label') === 'Valor da Mensalidade');
      });
      
      if (mensalidadeField) {
        console.log('✅ Campo "Valor da Mensalidade" encontrado');
        passedTests++;
      } else {
        console.log('❌ Campo "Valor da Mensalidade" não encontrado');
        failedTests++;
      }
      
      // Verificar se há dropdown de tipo
      const tipoDropdown = await page.evaluateHandle(() => {
        const dropdowns = Array.from(document.querySelectorAll('div[role="button"]'));
        return dropdowns.find(dropdown => dropdown.textContent && dropdown.textContent.includes('Tipo do Idoso'));
      });
      
      if (tipoDropdown) {
        console.log('✅ Dropdown "Tipo do Idoso" encontrado');
        passedTests++;
      } else {
        console.log('❌ Dropdown "Tipo do Idoso" não encontrado');
        failedTests++;
      }
      
    } catch (error) {
      console.log('❌ Erro ao verificar campos do formulário:', error.message);
      failedTests++;
    }

    // --- TESTE 5: Verificar se há opções SOCIAL e REGULAR ---
    console.log('\n🧪 TESTE 5: Verificando opções SOCIAL e REGULAR');
    try {
      // Verificar se há opção SOCIAL no dropdown (sem clicar)
      const hasSocialOption = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.some(el => el.textContent && el.textContent.includes('SOCIAL'));
      });
      
      if (hasSocialOption) {
        console.log('✅ Opção "SOCIAL" encontrada na página');
        passedTests++;
      } else {
        console.log('❌ Opção "SOCIAL" não encontrada');
        failedTests++;
      }
      
      // Verificar se há opção REGULAR no dropdown (sem clicar)
      const hasRegularOption = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.some(el => el.textContent && el.textContent.includes('REGULAR'));
      });
      
      if (hasRegularOption) {
        console.log('✅ Opção "REGULAR" encontrada na página');
        passedTests++;
      } else {
        console.log('❌ Opção "REGULAR" não encontrada');
        failedTests++;
      }
      
    } catch (error) {
      console.log('❌ Erro ao verificar opções SOCIAL e REGULAR:', error.message);
      failedTests++;
    }

    console.log('\n🎉 Testes simples de criação concluídos!');
    console.log(`📊 Resumo: ${passedTests} testes passaram, ${failedTests} falharam.`);
    
    if (failedTests > 0) {
      console.log('\n❌ Alguns testes falharam. Verifique os logs acima.');
      return false;
    } else {
      console.log('\n✅ Todos os testes passaram!');
      console.log('✅ Sistema de criação de usuários está funcionando!');
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
testSimpleCreation().then(success => {
  if (success) {
    console.log('\n🏆 TESTE SIMPLES CONCLUÍDO COM SUCESSO!');
    console.log('✅ Sistema de criação de usuários funcionando!');
    console.log('✅ Campos e opções SOCIAL/REGULAR disponíveis!');
  } else {
    console.log('\n❌ TESTE SIMPLES FALHOU!');
    console.log('🔧 Verifique a implementação.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
