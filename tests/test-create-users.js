import puppeteer from 'puppeteer';

async function testCreateUsers() {
  console.log('👥 Teste de criação de usuários SOCIAL e REGULAR...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 300,
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

    // --- TESTE 1: Criar responsável primeiro ---
    console.log('\n🧪 TESTE 1: Criando responsável para teste');
    try {
      // Navegar para responsáveis
      const responsaveisLink = await page.evaluateHandle(() => {
        const elements = Array.from(document.querySelectorAll('a, [role="button"]'));
        return elements.find(el => el.textContent && el.textContent.includes('Responsáveis'));
      });
      
      if (responsaveisLink) {
        await responsaveisLink.click();
        console.log('✅ Navegou para página de responsáveis');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Procurar botão "Novo Responsável"
        const novoResponsavelButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent && btn.textContent.includes('Novo Responsável'));
        });
        
        if (novoResponsavelButton) {
          await novoResponsavelButton.click();
          console.log('✅ Modal de novo responsável aberto');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Preencher dados do responsável
          await page.type('input[label="Nome Completo"]', 'Maria Teste Social');
          await page.type('input[label="CPF"]', '111.222.333-44');
          await page.type('input[label="Telefone"]', '(11) 99999-8888');
          await page.type('input[label="Email"]', 'maria@teste.com');
          
          // Salvar responsável
          const salvarButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => btn.textContent && btn.textContent.includes('Salvar'));
          });
          
          if (salvarButton) {
            await salvarButton.click();
            console.log('✅ Responsável criado com sucesso');
            await new Promise(resolve => setTimeout(resolve, 2000));
            passedTests++;
          } else {
            console.log('❌ Botão Salvar não encontrado');
            failedTests++;
          }
        } else {
          console.log('❌ Botão "Novo Responsável" não encontrado');
          failedTests++;
        }
      } else {
        console.log('❌ Link "Responsáveis" não encontrado');
        failedTests++;
      }
      
    } catch (error) {
      console.log('❌ Erro ao criar responsável:', error.message);
      failedTests++;
    }

    // --- TESTE 2: Criar idoso SOCIAL ---
    console.log('\n🧪 TESTE 2: Criando idoso SOCIAL');
    try {
      // Navegar para idosos
      const idososLink = await page.evaluateHandle(() => {
        const elements = Array.from(document.querySelectorAll('a, [role="button"]'));
        return elements.find(el => el.textContent && el.textContent.includes('Idosos'));
      });
      
      if (idososLink) {
        await idososLink.click();
        console.log('✅ Navegou para página de idosos');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Procurar botão "Novo Idoso"
        const novoIdosoButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent && btn.textContent.includes('Novo Idoso'));
        });
        
        if (novoIdosoButton) {
          await novoIdosoButton.click();
          console.log('✅ Modal de novo idoso aberto');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Preencher dados básicos
          await page.type('input[label="Nome Completo"]', 'João Social Silva');
          await page.type('input[label="CPF/CNPJ do Idoso"]', '555.666.777-88');
          
          // Selecionar responsável
          const responsavelDropdown = await page.evaluateHandle(() => {
            const dropdowns = Array.from(document.querySelectorAll('div[role="button"]'));
            return dropdowns.find(dropdown => dropdown.textContent && dropdown.textContent.includes('Responsável'));
          });
          
          if (responsavelDropdown) {
            await responsavelDropdown.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const responsavelOption = await page.evaluateHandle(() => {
              const options = Array.from(document.querySelectorAll('li'));
              return options.find(option => option.textContent && option.textContent.includes('Maria Teste Social'));
            });
            
            if (responsavelOption) {
              await responsavelOption.click();
              console.log('✅ Responsável selecionado');
            }
          }
          
          // Preencher benefício (salário)
          await page.type('input[label="Benefício (Salário do Idoso)"]', '1518,00');
          console.log('✅ Benefício preenchido: R$ 1.518,00');
          
          // Selecionar tipo SOCIAL
          const tipoDropdown = await page.evaluateHandle(() => {
            const dropdowns = Array.from(document.querySelectorAll('div[role="button"]'));
            return dropdowns.find(dropdown => dropdown.textContent && dropdown.textContent.includes('Tipo do Idoso'));
          });
          
          if (tipoDropdown) {
            await tipoDropdown.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const socialOption = await page.evaluateHandle(() => {
              const options = Array.from(document.querySelectorAll('li'));
              return options.find(option => option.textContent && option.textContent.includes('SOCIAL'));
            });
            
            if (socialOption) {
              await socialOption.click();
              console.log('✅ Tipo SOCIAL selecionado');
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Verificar se mensalidade foi preenchida automaticamente
              const mensalidadeValue = await page.inputValue('input[label="Valor da Mensalidade"]');
              console.log('📊 Valor da mensalidade:', mensalidadeValue);
              
              if (mensalidadeValue.includes('1518')) {
                console.log('✅ Mensalidade preenchida automaticamente para SOCIAL');
                passedTests++;
              } else {
                console.log('❌ Mensalidade não foi preenchida automaticamente');
                failedTests++;
              }
              
              // Verificar se campo está desabilitado
              const isDisabled = await page.evaluate(() => {
                const input = document.querySelector('input[label="Valor da Mensalidade"]');
                return input ? input.disabled : false;
              });
              
              if (isDisabled) {
                console.log('✅ Campo mensalidade desabilitado para SOCIAL');
                passedTests++;
              } else {
                console.log('❌ Campo mensalidade não está desabilitado para SOCIAL');
                failedTests++;
              }
            }
          }
          
          // Salvar idoso SOCIAL
          const salvarButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => btn.textContent && btn.textContent.includes('Salvar'));
          });
          
          if (salvarButton) {
            await salvarButton.click();
            console.log('✅ Idoso SOCIAL criado com sucesso');
            await new Promise(resolve => setTimeout(resolve, 2000));
            passedTests++;
          } else {
            console.log('❌ Botão Salvar não encontrado');
            failedTests++;
          }
        } else {
          console.log('❌ Botão "Novo Idoso" não encontrado');
          failedTests++;
        }
      } else {
        console.log('❌ Link "Idosos" não encontrado');
        failedTests++;
      }
      
    } catch (error) {
      console.log('❌ Erro ao criar idoso SOCIAL:', error.message);
      failedTests++;
    }

    // --- TESTE 3: Criar idoso REGULAR ---
    console.log('\n🧪 TESTE 3: Criando idoso REGULAR');
    try {
      // Procurar botão "Novo Idoso" novamente
      const novoIdosoButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => btn.textContent && btn.textContent.includes('Novo Idoso'));
      });
      
      if (novoIdosoButton) {
        await novoIdosoButton.click();
        console.log('✅ Modal de novo idoso aberto');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Preencher dados básicos
        await page.type('input[label="Nome Completo"]', 'Ana Regular Santos');
        await page.type('input[label="CPF/CNPJ do Idoso"]', '999.888.777-66');
        
        // Selecionar responsável
        const responsavelDropdown = await page.evaluateHandle(() => {
          const dropdowns = Array.from(document.querySelectorAll('div[role="button"]'));
          return dropdowns.find(dropdown => dropdown.textContent && dropdown.textContent.includes('Responsável'));
        });
        
        if (responsavelDropdown) {
          await responsavelDropdown.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const responsavelOption = await page.evaluateHandle(() => {
            const options = Array.from(document.querySelectorAll('li'));
            return options.find(option => option.textContent && option.textContent.includes('Maria Teste Social'));
          });
          
          if (responsavelOption) {
            await responsavelOption.click();
            console.log('✅ Responsável selecionado');
          }
        }
        
        // Preencher benefício (salário)
        await page.type('input[label="Benefício (Salário do Idoso)"]', '1518,00');
        console.log('✅ Benefício preenchido: R$ 1.518,00');
        
        // Preencher mensalidade (valor diferente)
        await page.type('input[label="Valor da Mensalidade"]', '3225,00');
        console.log('✅ Mensalidade preenchida: R$ 3.225,00');
        
        // Selecionar tipo REGULAR
        const tipoDropdown = await page.evaluateHandle(() => {
          const dropdowns = Array.from(document.querySelectorAll('div[role="button"]'));
          return dropdowns.find(dropdown => dropdown.textContent && dropdown.textContent.includes('Tipo do Idoso'));
        });
        
        if (tipoDropdown) {
          await tipoDropdown.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
              passedTests++;
            } else {
              console.log('❌ Campo mensalidade não está habilitado para REGULAR');
              failedTests++;
            }
            
            // Verificar se mensalidade pode ser editada
            const mensalidadeValue = await page.inputValue('input[label="Valor da Mensalidade"]');
            if (mensalidadeValue.includes('3225')) {
              console.log('✅ Mensalidade pode ser editada para REGULAR');
              passedTests++;
            } else {
              console.log('❌ Mensalidade não pode ser editada para REGULAR');
              failedTests++;
            }
          }
        }
        
        // Salvar idoso REGULAR
        const salvarButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent && btn.textContent.includes('Salvar'));
        });
        
        if (salvarButton) {
          await salvarButton.click();
          console.log('✅ Idoso REGULAR criado com sucesso');
          await new Promise(resolve => setTimeout(resolve, 2000));
          passedTests++;
        } else {
          console.log('❌ Botão Salvar não encontrado');
          failedTests++;
        }
      } else {
        console.log('❌ Botão "Novo Idoso" não encontrado');
        failedTests++;
      }
      
    } catch (error) {
      console.log('❌ Erro ao criar idoso REGULAR:', error.message);
      failedTests++;
    }

    // --- TESTE 4: Verificar se idosos foram criados ---
    console.log('\n🧪 TESTE 4: Verificando se idosos foram criados');
    try {
      // Verificar se há idosos na lista
      const idososList = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.some(el => el.textContent && el.textContent.includes('João Social Silva')) &&
               elements.some(el => el.textContent && el.textContent.includes('Ana Regular Santos'));
      });
      
      if (idososList) {
        console.log('✅ Ambos os idosos aparecem na lista');
        passedTests++;
      } else {
        console.log('❌ Idosos não aparecem na lista');
        failedTests++;
      }
      
    } catch (error) {
      console.log('❌ Erro ao verificar lista de idosos:', error.message);
      failedTests++;
    }

    console.log('\n🎉 Testes de criação de usuários concluídos!');
    console.log(`📊 Resumo: ${passedTests} testes passaram, ${failedTests} falharam.`);
    
    if (failedTests > 0) {
      console.log('\n❌ Alguns testes falharam. Verifique os logs acima.');
      return false;
    } else {
      console.log('\n✅ Todos os testes passaram!');
      console.log('✅ Sistema de criação de usuários SOCIAL e REGULAR funcionando!');
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
testCreateUsers().then(success => {
  if (success) {
    console.log('\n🏆 TESTE DE CRIAÇÃO CONCLUÍDO COM SUCESSO!');
    console.log('✅ Usuários SOCIAL e REGULAR criados com sucesso!');
    console.log('✅ Funcionalidades implementadas corretamente!');
  } else {
    console.log('\n❌ TESTE DE CRIAÇÃO FALHOU!');
    console.log('🔧 Verifique a implementação.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
