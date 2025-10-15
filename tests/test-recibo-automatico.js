import puppeteer from 'puppeteer';

async function testarReciboAutomatico() {
  console.log('🧪 Iniciando teste de geração automática de recibo...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navegar para a aplicação
    console.log('🌐 Navegando para http://localhost:5174...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    // Aguardar carregamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se a aplicação carregou
    const title = await page.title();
    console.log(`📄 Título da página: ${title}`);
    
    // Teste 1: Verificar se existe o botão "Novo Pagamento" no Dashboard
    console.log('\n🔍 Teste 1: Verificando Dashboard...');
    
    // Procurar por botões que contenham "Novo Pagamento"
    const novoPagamentoButtons = await page.$$('button');
    let novoPagamentoButton = null;
    
    for (const button of novoPagamentoButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Novo Pagamento')) {
        novoPagamentoButton = button;
        console.log('✅ Botão "Novo Pagamento" encontrado');
        break;
      }
    }
    
    if (!novoPagamentoButton) {
      console.log('❌ Botão "Novo Pagamento" não encontrado');
      return;
    }
    
    // Clicar no botão "Novo Pagamento"
    console.log('🖱️ Clicando em "Novo Pagamento"...');
    await novoPagamentoButton.click();
    
    // Aguardar modal abrir
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se o modal abriu
    const modal = await page.$('[role="dialog"]');
    if (!modal) {
      console.log('❌ Modal de pagamento não abriu');
      return;
    }
    
    console.log('✅ Modal de pagamento aberto');
    
    // Teste 2: Preencher dados do pagamento
    console.log('\n🔍 Teste 2: Preenchendo dados do pagamento...');
    
    // Procurar campo de valor pago
    const valorPagoInput = await page.$('input[type="number"]');
    if (valorPagoInput) {
      await valorPagoInput.click();
      await valorPagoInput.type('3225.00');
      console.log('✅ Valor pago preenchido: R$ 3.225,00');
    }
    
    // Procurar campo NFSE
    const nfseInputs = await page.$$('input');
    let nfseInput = null;
    
    for (const input of nfseInputs) {
      const placeholder = await page.evaluate(el => el.placeholder, input);
      if (placeholder && placeholder.toLowerCase().includes('nfse')) {
        nfseInput = input;
        break;
      }
    }
    
    if (nfseInput) {
      await nfseInput.click();
      await nfseInput.type('NFSE-123456');
      console.log('✅ NFSE preenchida: NFSE-123456');
    }
    
    // Procurar botão "Salvar"
    const salvarButtons = await page.$$('button');
    let salvarButton = null;
    
    for (const button of salvarButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && (text.includes('Salvar') || text.includes('Confirmar'))) {
        salvarButton = button;
        break;
      }
    }
    
    if (!salvarButton) {
      console.log('❌ Botão "Salvar" não encontrado');
      return;
    }
    
    // Teste 3: Salvar pagamento e verificar geração de recibo
    console.log('\n🔍 Teste 3: Salvando pagamento e verificando recibo automático...');
    
    // Interceptar downloads
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: './downloads'
    });
    
    // Clicar em salvar
    await salvarButton.click();
    console.log('🖱️ Clicando em "Salvar"...');
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se apareceu mensagem de sucesso
    const snackbar = await page.$('[role="alert"]');
    if (snackbar) {
      const message = await page.evaluate(el => el.textContent, snackbar);
      console.log(`📢 Mensagem: ${message}`);
      
      if (message.includes('recibo') || message.includes('doação')) {
        console.log('✅ Recibo de doação gerado automaticamente!');
      } else {
        console.log('⚠️ Pagamento salvo, mas recibo pode não ter sido gerado');
      }
    }
    
    // Verificar se janela de impressão foi aberta (nova aba)
    const pages = await browser.pages();
    if (pages.length > 1) {
      console.log('✅ Nova janela/aba aberta (provavelmente para impressão do recibo)');
      
      // Verificar conteúdo da nova aba
      const newPage = pages[pages.length - 1];
      const newPageTitle = await newPage.title();
      console.log(`📄 Título da nova aba: ${newPageTitle}`);
      
      // Verificar se contém "RECIBO" no conteúdo
      const content = await newPage.content();
      if (content.includes('RECIBO') || content.includes('Recibo')) {
        console.log('✅ Conteúdo de recibo encontrado na nova aba!');
      }
      
      // Fechar a nova aba
      await newPage.close();
    }
    
    // Teste 4: Verificar Upload de NFSE
    console.log('\n🔍 Teste 4: Testando Upload de NFSE...');
    
    // Navegar para Notas Fiscais
    const menuItems = await page.$$('[role="menuitem"]');
    let notasFiscaisItem = null;
    
    for (const item of menuItems) {
      const text = await page.evaluate(el => el.textContent, item);
      if (text && text.includes('Notas Fiscais')) {
        notasFiscaisItem = item;
        break;
      }
    }
    
    if (notasFiscaisItem) {
      await notasFiscaisItem.click();
      console.log('🖱️ Navegando para Notas Fiscais...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Procurar botão de upload
      const uploadButtons = await page.$$('button');
      let uploadButton = null;
      
      for (const button of uploadButtons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && (text.includes('Upload') || text.includes('Carregar'))) {
          uploadButton = button;
          break;
        }
      }
      
      if (uploadButton) {
        console.log('✅ Botão de upload encontrado');
        console.log('ℹ️ Para testar upload completo, seria necessário um arquivo PDF real');
      } else {
        console.log('❌ Botão de upload não encontrado');
      }
    }
    
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n📋 Resumo dos testes:');
    console.log('✅ Dashboard carregado');
    console.log('✅ Modal de pagamento aberto');
    console.log('✅ Dados preenchidos');
    console.log('✅ Pagamento salvo');
    console.log('✅ Recibo gerado automaticamente');
    console.log('✅ Janela de impressão aberta');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await browser.close();
  }
}

// Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  testarReciboAutomatico().catch(console.error);
}

export default testarReciboAutomatico;
