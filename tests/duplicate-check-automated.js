import puppeteer from 'puppeteer';

class DuplicateCheckTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:5174';
    this.logs = [];
  }

  async init() {
    console.log('🚀 Iniciando teste automatizado de verificação de duplicatas...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Mostrar navegador para debug
      slowMo: 100, // Desacelerar ações para visualizar
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Capturar logs do console
    this.page.on('console', msg => {
      this.logs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    // Configurar viewport
    await this.page.setViewport({ width: 1280, height: 720 });
    
    console.log('✅ Navegador iniciado com sucesso!');
  }

  async navigateToApp() {
    console.log('🌐 Navegando para a aplicação...');
    
    try {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Aguardar inicialização do sistema se aparecer
      try {
        await this.page.waitForSelector('text=Inicializando sistema...', { timeout: 5000 });
        console.log('⏳ Aguardando inicialização do sistema...');
        await this.page.waitForSelector('text=Inicializando sistema...', { state: 'hidden', timeout: 30000 });
        console.log('✅ Sistema inicializado!');
      } catch (error) {
        console.log('ℹ️ Tela de inicialização não apareceu, continuando...');
      }
      
      console.log('✅ Aplicação carregada com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao carregar aplicação:', error.message);
      return false;
    }
  }

  async testResponsavelDuplicate() {
    console.log('\n🧪 TESTE 1: Verificação de duplicata de responsável');
    
    try {
      // 1. Navegar para responsáveis
      console.log('📋 Navegando para seção de responsáveis...');
      await this.page.click('text=Responsáveis');
      await this.page.waitForTimeout(1000);
      
      // 2. Clicar em "Novo Responsável"
      console.log('➕ Clicando em "Novo Responsável"...');
      await this.page.click('button:has-text("Novo Responsável")');
      await this.page.waitForTimeout(500);
      
      // 3. Preencher dados
      console.log('📝 Preenchendo dados do responsável...');
      await this.page.fill('input[label="Nome Completo"]', 'João Silva');
      await this.page.fill('input[label="CPF"]', '123.456.789-00');
      await this.page.fill('input[label="Telefone"]', '(11) 99999-9999');
      await this.page.fill('input[label="Email"]', 'joao@teste.com');
      
      // 4. Clicar em Salvar
      console.log('💾 Clicando em "Salvar"...');
      await this.page.click('button:has-text("Salvar")');
      await this.page.waitForTimeout(2000);
      
      // 5. Verificar se aparece diálogo de duplicatas
      console.log('🔍 Verificando se diálogo de duplicatas aparece...');
      const duplicateDialog = await this.page.waitForSelector('text=Responsável Similar Encontrado', { timeout: 10000 });
      
      if (duplicateDialog) {
        console.log('✅ SUCESSO: Diálogo de duplicatas apareceu!');
        
        // 6. Verificar opções disponíveis
        const createNewButton = await this.page.$('button:has-text("Criar Novo")');
        const useButton = await this.page.$('button:has-text("Usar")');
        
        if (createNewButton && useButton) {
          console.log('✅ SUCESSO: Opções de escolha estão disponíveis!');
        } else {
          console.log('❌ ERRO: Opções de escolha não encontradas!');
        }
        
        // 7. Fechar diálogo
        await this.page.click('button:has-text("Cancelar")');
        console.log('✅ Diálogo fechado com sucesso!');
        
        return true;
      } else {
        console.log('❌ ERRO: Diálogo de duplicatas não apareceu!');
        return false;
      }
      
    } catch (error) {
      console.error('❌ ERRO no teste de responsável:', error.message);
      return false;
    }
  }

  async testUseExistingResponsavel() {
    console.log('\n🧪 TESTE 2: Usar responsável existente');
    
    try {
      // 1. Criar responsável duplicado
      console.log('📋 Criando responsável duplicado...');
      await this.page.click('button:has-text("Novo Responsável")');
      await this.page.waitForTimeout(500);
      
      await this.page.fill('input[label="Nome Completo"]', 'João Silva');
      await this.page.fill('input[label="CPF"]', '123.456.789-00');
      await this.page.click('button:has-text("Salvar")');
      await this.page.waitForTimeout(2000);
      
      // 2. Aguardar diálogo de duplicatas
      await this.page.waitForSelector('text=Responsável Similar Encontrado');
      
      // 3. Clicar em "Usar" no primeiro responsável
      console.log('👆 Clicando em "Usar" responsável existente...');
      const useButtons = await this.page.$$('button:has-text("Usar")');
      if (useButtons.length > 0) {
        await useButtons[0].click();
        await this.page.waitForTimeout(1000);
        
        // 4. Verificar se modal fechou
        const modalClosed = await this.page.$('text=Novo Responsável') === null;
        if (modalClosed) {
          console.log('✅ SUCESSO: Responsável existente foi usado corretamente!');
          return true;
        } else {
          console.log('❌ ERRO: Modal não fechou após usar responsável existente!');
          return false;
        }
      } else {
        console.log('❌ ERRO: Botão "Usar" não encontrado!');
        return false;
      }
      
    } catch (error) {
      console.error('❌ ERRO no teste de usar existente:', error.message);
      return false;
    }
  }

  async testCreateNewWithDuplicates() {
    console.log('\n🧪 TESTE 3: Criar novo responsável mesmo com duplicatas');
    
    try {
      // 1. Criar responsável com nome duplicado mas CPF diferente
      console.log('📋 Criando responsável com CPF diferente...');
      await this.page.click('button:has-text("Novo Responsável")');
      await this.page.waitForTimeout(500);
      
      await this.page.fill('input[label="Nome Completo"]', 'João Silva');
      await this.page.fill('input[label="CPF"]', '987.654.321-00'); // CPF diferente
      await this.page.fill('input[label="Telefone"]', '(11) 88888-8888');
      await this.page.click('button:has-text("Salvar")');
      await this.page.waitForTimeout(2000);
      
      // 2. Aguardar diálogo de duplicatas
      await this.page.waitForSelector('text=Responsável Similar Encontrado');
      
      // 3. Clicar em "Criar Novo"
      console.log('👆 Clicando em "Criar Novo"...');
      await this.page.click('button:has-text("Criar Novo")');
      await this.page.waitForTimeout(2000);
      
      // 4. Verificar se modal fechou
      const modalClosed = await this.page.$('text=Novo Responsável') === null;
      if (modalClosed) {
        console.log('✅ SUCESSO: Novo responsável foi criado mesmo com duplicatas!');
        return true;
      } else {
        console.log('❌ ERRO: Modal não fechou após criar novo responsável!');
        return false;
      }
      
    } catch (error) {
      console.error('❌ ERRO no teste de criar novo:', error.message);
      return false;
    }
  }

  async testIdosoDuplicate() {
    console.log('\n🧪 TESTE 4: Verificação de duplicata de idoso');
    
    try {
      // 1. Navegar para idosos
      console.log('👴 Navegando para seção de idosos...');
      await this.page.click('text=Idosos');
      await this.page.waitForTimeout(1000);
      
      // 2. Clicar em "Novo Idoso"
      console.log('➕ Clicando em "Novo Idoso"...');
      await this.page.click('button:has-text("Novo Idoso")');
      await this.page.waitForTimeout(500);
      
      // 3. Preencher dados básicos
      console.log('📝 Preenchendo dados do idoso...');
      await this.page.fill('input[label="Nome"]', 'Maria Santos');
      await this.page.fill('input[label="CPF"]', '111.222.333-44');
      
      // 4. Selecionar responsável
      console.log('👤 Selecionando responsável...');
      await this.page.click('div[role="combobox"]');
      await this.page.waitForTimeout(500);
      await this.page.click('li:first-child');
      
      // 5. Preencher mensalidade
      await this.page.fill('input[label="Valor da Mensalidade"]', '1500');
      
      // 6. Clicar em Salvar
      console.log('💾 Clicando em "Salvar"...');
      await this.page.click('button:has-text("Salvar")');
      await this.page.waitForTimeout(2000);
      
      // 7. Verificar se aparece diálogo de duplicatas
      console.log('🔍 Verificando se diálogo de duplicatas aparece...');
      const duplicateDialog = await this.page.waitForSelector('text=Idoso Similar Encontrado', { timeout: 10000 });
      
      if (duplicateDialog) {
        console.log('✅ SUCESSO: Diálogo de duplicatas de idoso apareceu!');
        
        // 8. Fechar diálogo
        await this.page.click('button:has-text("Cancelar")');
        console.log('✅ Diálogo fechado com sucesso!');
        
        return true;
      } else {
        console.log('❌ ERRO: Diálogo de duplicatas de idoso não apareceu!');
        return false;
      }
      
    } catch (error) {
      console.error('❌ ERRO no teste de idoso:', error.message);
      return false;
    }
  }

  async testLogsGeneration() {
    console.log('\n🧪 TESTE 5: Verificação de geração de logs');
    
    try {
      // Limpar logs anteriores
      this.logs = [];
      
      // 1. Navegar para responsáveis
      await this.page.click('text=Responsáveis');
      await this.page.waitForTimeout(1000);
      
      // 2. Criar responsável duplicado
      console.log('📋 Criando responsável para gerar logs...');
      await this.page.click('button:has-text("Novo Responsável")');
      await this.page.waitForTimeout(500);
      
      await this.page.fill('input[label="Nome Completo"]', 'João Silva');
      await this.page.fill('input[label="CPF"]', '123.456.789-00');
      await this.page.click('button:has-text("Salvar")');
      await this.page.waitForTimeout(2000);
      
      // 3. Aguardar verificação
      await this.page.waitForSelector('text=Responsável Similar Encontrado');
      
      // 4. Verificar se logs foram gerados
      const duplicateLogs = this.logs.filter(log => 
        log.includes('Verificando duplicatas') || 
        log.includes('Duplicatas encontradas') ||
        log.includes('DUPLICATE_CHECK')
      );
      
      if (duplicateLogs.length > 0) {
        console.log('✅ SUCESSO: Logs de duplicatas foram gerados!');
        console.log('📋 Logs encontrados:', duplicateLogs);
        return true;
      } else {
        console.log('❌ ERRO: Nenhum log de duplicatas foi gerado!');
        console.log('📋 Todos os logs:', this.logs);
        return false;
      }
      
    } catch (error) {
      console.error('❌ ERRO no teste de logs:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🎯 INICIANDO BATERIA DE TESTES DE VERIFICAÇÃO DE DUPLICATAS\n');
    
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
    
    // Inicializar navegador
    await this.init();
    
    // Navegar para aplicação
    const appLoaded = await this.navigateToApp();
    if (!appLoaded) {
      console.log('❌ Não foi possível carregar a aplicação. Encerrando testes.');
      await this.cleanup();
      return;
    }
    
    // Executar testes
    const tests = [
      { name: 'Verificação de duplicata de responsável', fn: () => this.testResponsavelDuplicate() },
      { name: 'Usar responsável existente', fn: () => this.testUseExistingResponsavel() },
      { name: 'Criar novo responsável com duplicatas', fn: () => this.testCreateNewWithDuplicates() },
      { name: 'Verificação de duplicata de idoso', fn: () => this.testIdosoDuplicate() },
      { name: 'Geração de logs', fn: () => this.testLogsGeneration() }
    ];
    
    for (const test of tests) {
      results.total++;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 EXECUTANDO: ${test.name}`);
      console.log(`${'='.repeat(60)}`);
      
      try {
        const result = await test.fn();
        if (result) {
          results.passed++;
          results.tests.push({ name: test.name, status: 'PASSED' });
          console.log(`✅ TESTE PASSOU: ${test.name}`);
        } else {
          results.failed++;
          results.tests.push({ name: test.name, status: 'FAILED' });
          console.log(`❌ TESTE FALHOU: ${test.name}`);
        }
      } catch (error) {
        results.failed++;
        results.tests.push({ name: test.name, status: 'ERROR', error: error.message });
        console.log(`💥 ERRO NO TESTE: ${test.name} - ${error.message}`);
      }
      
      // Pausa entre testes
      await this.page.waitForTimeout(2000);
    }
    
    // Relatório final
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RELATÓRIO FINAL DOS TESTES');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total de testes: ${results.total}`);
    console.log(`✅ Passou: ${results.passed}`);
    console.log(`❌ Falhou: ${results.failed}`);
    console.log(`📈 Taxa de sucesso: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detalhes dos testes:');
    results.tests.forEach((test, index) => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${test.name} - ${test.status}`);
      if (test.error) {
        console.log(`   Erro: ${test.error}`);
      }
    });
    
    await this.cleanup();
    
    return results;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Navegador fechado.');
    }
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new DuplicateCheckTester();
  tester.runAllTests().then(results => {
    console.log('\n🎉 Testes concluídos!');
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('💥 Erro fatal nos testes:', error);
    process.exit(1);
  });
}

export default DuplicateCheckTester;
