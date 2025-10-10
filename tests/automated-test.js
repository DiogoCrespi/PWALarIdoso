import puppeteer from 'puppeteer';

async function runAutomatedTests() {
  console.log('🚀 Iniciando testes automatizados com Puppeteer...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Mostrar o navegador para debug
    slowMo: 100, // Delay entre ações para visualizar
    devtools: true // Abrir DevTools automaticamente
  });
  
  const page = await browser.newPage();
  
  // Capturar logs do console
  page.on('console', msg => {
    console.log(`📱 CONSOLE [${msg.type()}]:`, msg.text());
  });
  
  // Capturar erros
  page.on('pageerror', error => {
    console.error('❌ ERRO DA PÁGINA:', error.message);
  });
  
  try {
    console.log('🌐 Navegando para http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Aguardar carregamento inicial
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Página carregada com sucesso!');
    
    // TESTE 1: Verificar se a página carregou
    console.log('\n🧪 TESTE 1: Verificando carregamento da página...');
    const title = await page.title();
    console.log('📄 Título da página:', title);
    
    // TESTE 2: Navegar para Responsáveis
    console.log('\n🧪 TESTE 2: Navegando para página de Responsáveis...');
    
    // Tentar navegar diretamente para a URL
    try {
      await page.goto('http://localhost:5173/responsaveis', { waitUntil: 'networkidle0' });
      console.log('✅ Navegação direta para /responsaveis realizada!');
    } catch (error) {
      console.log('❌ Erro ao navegar para /responsaveis:', error.message);
    }
    
    // Aguardar carregamento da página de responsáveis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // TESTE 3: Verificar se a página de responsáveis carregou
    console.log('\n🧪 TESTE 3: Verificando página de Responsáveis...');
    
    try {
      await page.waitForSelector('h1', { timeout: 5000 });
      const heading = await page.$eval('h1', el => el.textContent);
      console.log('📄 Cabeçalho da página:', heading);
    } catch (error) {
      console.log('❌ Cabeçalho não encontrado:', error.message);
    }
    
    // TESTE 4: Verificar se há responsáveis na lista
    console.log('\n🧪 TESTE 4: Verificando lista de responsáveis...');
    
    try {
      // Aguardar cards de responsáveis ou mensagem de "nenhum responsável"
      await page.waitForSelector('.MuiCard-root, .MuiAlert-root', { timeout: 5000 });
      
      const cards = await page.$$('.MuiCard-root');
      const alerts = await page.$$('.MuiAlert-root');
      
      console.log(`📊 Cards encontrados: ${cards.length}`);
      console.log(`📊 Alerts encontrados: ${alerts.length}`);
      
      if (cards.length > 0) {
        console.log('✅ Lista de responsáveis carregada!');
      } else if (alerts.length > 0) {
        const alertText = await page.$eval('.MuiAlert-root', el => el.textContent);
        console.log('ℹ️ Mensagem da lista:', alertText);
      }
    } catch (error) {
      console.log('❌ Lista de responsáveis não encontrada:', error.message);
    }
    
    // TESTE 5: Clicar em "Novo Responsável"
    console.log('\n🧪 TESTE 5: Testando botão "Novo Responsável"...');
    
    // Debug: Ver todos os botões na página
    const buttons = await page.$$('button');
    console.log(`📊 Total de botões encontrados: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const buttonText = await page.evaluate(el => el.textContent, buttons[i]);
      console.log(`🔘 Botão ${i + 1}: "${buttonText}"`);
    }
    
    try {
      // Procurar botão "Novo Responsável" - usar seletor mais específico
      try {
        // Tentar clicar no segundo botão (índice 1)
        await page.click('button:nth-child(2)', { timeout: 3000 });
        console.log('✅ Botão "Novo Responsável" clicado!');
        
        // Aguardar modal abrir
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o modal abriu
        const modal = await page.$('.MuiDialog-root');
        if (modal) {
          console.log('✅ Modal de novo responsável aberto!');
          
          // TESTE 6: Preencher formulário
          console.log('\n🧪 TESTE 6: Preenchendo formulário...');
          
          // Preencher nome
          try {
            // Limpar campo primeiro
            await page.click('input[type="text"]');
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyA');
            await page.keyboard.up('Control');
            await page.keyboard.press('Delete');
            // Preencher com "teste"
            await page.type('input[type="text"]', 'teste');
            console.log('✅ Nome preenchido com "teste"!');
          } catch (error) {
            console.log('❌ Erro ao preencher nome:', error.message);
          }
          
          // Preencher CPF
          try {
            // Limpar campo CPF primeiro
            await page.click('input[placeholder*="000.000.000-00"]');
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyA');
            await page.keyboard.up('Control');
            await page.keyboard.press('Delete');
            // Preencher com CPF válido
            await page.type('input[placeholder*="000.000.000-00"]', '10294484930');
            console.log('✅ CPF preenchido com CPF válido: 102.944.849-30!');
          } catch (error) {
            console.log('❌ Erro ao preencher CPF:', error.message);
          }
          
          // Preencher telefone (se existir)
          try {
            await page.type('input[placeholder*="(00) 00000-0000"]', '45999999999');
            console.log('✅ Telefone preenchido!');
          } catch (error) {
            console.log('ℹ️ Campo telefone não encontrado ou não obrigatório');
          }
          
          // Preencher email (se existir)
          try {
            await page.type('input[type="email"]', 'joao@teste.com');
            console.log('✅ Email preenchido!');
          } catch (error) {
            console.log('ℹ️ Campo email não encontrado ou não obrigatório');
          }
          
          // TESTE 7: Salvar responsável
          console.log('\n🧪 TESTE 7: Salvando responsável...');
          
          // Clicar no botão Salvar
          try {
            await page.click('button.MuiButton-containedPrimary', { timeout: 3000 });
            console.log('✅ Botão Salvar clicado!');
            
            // Aguardar processamento
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Verificar se houve feedback
            const alerts = await page.$$('.MuiAlert-root');
            if (alerts.length > 0) {
              const alertText = await page.$eval('.MuiAlert-root', el => el.textContent);
              console.log('📢 Feedback encontrado:', alertText);
            } else {
              console.log('⚠️ Nenhum feedback visual encontrado');
            }
            
            // Verificar se há mensagens de sucesso ou erro
            const snackbars = await page.$$('.MuiSnackbar-root');
            if (snackbars.length > 0) {
              const snackbarText = await page.$eval('.MuiSnackbar-root', el => el.textContent);
              console.log('🍿 Snackbar encontrado:', snackbarText);
            }
            
            // Verificar se há toasts ou notificações
            const toasts = await page.$$('[role="alert"], .MuiAlert-root, .toast, .notification');
            console.log(`📊 Total de elementos de feedback: ${toasts.length}`);
            for (let i = 0; i < toasts.length; i++) {
              const toastText = await page.evaluate(el => el.textContent, toasts[i]);
              console.log(`🔔 Feedback ${i + 1}: "${toastText}"`);
            }
            
            // Verificar se o modal fechou
            const modalAindaAberto = await page.$('.MuiDialog-root');
            if (!modalAindaAberto) {
              console.log('✅ Modal fechou após salvar!');
            } else {
              console.log('⚠️ Modal ainda está aberto');
            }
            
          } catch (error) {
            console.log('❌ Botão Salvar não encontrado!');
          }
          
        } else {
          console.log('❌ Modal não abriu!');
        }
        
      } catch (error) {
        console.log('❌ Botão "Novo Responsável" não encontrado!');
      }
      
    } catch (error) {
      console.log('❌ Erro ao testar botão "Novo Responsável":', error.message);
    }
    
    // Aguardar um pouco antes de fechar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n✅ Testes automatizados concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await browser.close();
  }
}

// Executar os testes
runAutomatedTests().catch(console.error);
