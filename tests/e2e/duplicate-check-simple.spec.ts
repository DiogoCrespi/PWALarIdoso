import { test, expect } from '@playwright/test';

test.describe('Teste Simples de Verificação de Duplicatas', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('/');
    
    // Aguardar a aplicação carregar completamente
    await page.waitForLoadState('networkidle');
    
    // Aguardar a inicialização do sistema (se aparecer)
    try {
      await page.waitForSelector('text=Inicializando sistema...', { timeout: 5000 });
      await page.waitForSelector('text=Inicializando sistema...', { state: 'hidden', timeout: 30000 });
    } catch (error) {
      // Se não aparecer a tela de inicialização, continuar
      console.log('Tela de inicialização não apareceu, continuando...');
    }
  });

  test('Deve detectar duplicata ao criar responsável com nome existente', async ({ page }) => {
    console.log('🧪 Iniciando teste de duplicata de responsável...');

    // 1. Navegar para responsáveis
    await page.click('text=Responsáveis');
    await page.waitForTimeout(1000);

    // 2. Clicar em "Novo Responsável"
    await page.click('button:has-text("Novo Responsável")');
    await page.waitForTimeout(500);

    // 3. Preencher dados
    await page.fill('input[label="Nome Completo"]', 'João Silva');
    await page.fill('input[label="CPF"]', '123.456.789-00');
    await page.fill('input[label="Telefone"]', '(11) 99999-9999');
    await page.fill('input[label="Email"]', 'joao@teste.com');

    // 4. Clicar em Salvar
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);

    // 5. Verificar se aparece o diálogo de duplicatas
    const duplicateDialog = page.locator('text=Responsável Similar Encontrado');
    await expect(duplicateDialog).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Diálogo de duplicatas apareceu corretamente!');

    // 6. Verificar opções disponíveis
    await expect(page.locator('button:has-text("Criar Novo")')).toBeVisible();
    await expect(page.locator('button:has-text("Usar")')).toBeVisible();
    
    console.log('✅ Opções de escolha estão disponíveis!');

    // 7. Fechar diálogo
    await page.click('button:has-text("Cancelar")');
    
    console.log('✅ Teste de duplicata de responsável concluído!');
  });

  test('Deve permitir usar responsável existente', async ({ page }) => {
    console.log('🧪 Iniciando teste de uso de responsável existente...');

    // 1. Navegar para responsáveis
    await page.click('text=Responsáveis');
    await page.waitForTimeout(1000);

    // 2. Criar responsável duplicado
    await page.click('button:has-text("Novo Responsável")');
    await page.waitForTimeout(500);

    await page.fill('input[label="Nome Completo"]', 'João Silva');
    await page.fill('input[label="CPF"]', '123.456.789-00');
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);

    // 3. Aguardar diálogo de duplicatas
    await expect(page.locator('text=Responsável Similar Encontrado')).toBeVisible();

    // 4. Clicar em "Usar" no primeiro responsável
    const useButtons = page.locator('button:has-text("Usar")');
    await useButtons.first().click();
    await page.waitForTimeout(1000);

    // 5. Verificar se modal fechou
    await expect(page.locator('text=Novo Responsável')).not.toBeVisible();
    
    console.log('✅ Responsável existente foi usado corretamente!');
  });

  test('Deve permitir criar novo responsável mesmo com duplicatas', async ({ page }) => {
    console.log('🧪 Iniciando teste de criação com duplicatas...');

    // 1. Navegar para responsáveis
    await page.click('text=Responsáveis');
    await page.waitForTimeout(1000);

    // 2. Criar responsável com nome duplicado mas CPF diferente
    await page.click('button:has-text("Novo Responsável")');
    await page.waitForTimeout(500);

    await page.fill('input[label="Nome Completo"]', 'João Silva');
    await page.fill('input[label="CPF"]', '987.654.321-00'); // CPF diferente
    await page.fill('input[label="Telefone"]', '(11) 88888-8888');
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);

    // 3. Aguardar diálogo de duplicatas
    await expect(page.locator('text=Responsável Similar Encontrado')).toBeVisible();

    // 4. Clicar em "Criar Novo"
    await page.click('button:has-text("Criar Novo")');
    await page.waitForTimeout(2000);

    // 5. Verificar se modal fechou
    await expect(page.locator('text=Novo Responsável')).not.toBeVisible();
    
    console.log('✅ Novo responsável foi criado mesmo com duplicatas!');
  });

  test('Deve detectar duplicata ao criar idoso com nome existente', async ({ page }) => {
    console.log('🧪 Iniciando teste de duplicata de idoso...');

    // 1. Navegar para idosos
    await page.click('text=Idosos');
    await page.waitForTimeout(1000);

    // 2. Clicar em "Novo Idoso"
    await page.click('button:has-text("Novo Idoso")');
    await page.waitForTimeout(500);

    // 3. Preencher dados básicos
    await page.fill('input[label="Nome"]', 'Maria Santos');
    await page.fill('input[label="CPF"]', '111.222.333-44');

    // 4. Selecionar responsável (primeiro da lista)
    await page.click('div[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('li:first-child');

    // 5. Preencher mensalidade
    await page.fill('input[label="Valor da Mensalidade"]', '1500');

    // 6. Clicar em Salvar
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);

    // 7. Verificar se aparece o diálogo de duplicatas
    const duplicateDialog = page.locator('text=Idoso Similar Encontrado');
    await expect(duplicateDialog).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Diálogo de duplicatas de idoso apareceu corretamente!');

    // 8. Fechar diálogo
    await page.click('button:has-text("Cancelar")');
    
    console.log('✅ Teste de duplicata de idoso concluído!');
  });

  test('Deve gerar logs durante verificação de duplicatas', async ({ page }) => {
    console.log('🧪 Iniciando teste de logs...');

    // Capturar logs do console
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        logs.push(msg.text());
      }
    });

    // 1. Navegar para responsáveis
    await page.click('text=Responsáveis');
    await page.waitForTimeout(1000);

    // 2. Criar responsável duplicado
    await page.click('button:has-text("Novo Responsável")');
    await page.waitForTimeout(500);

    await page.fill('input[label="Nome Completo"]', 'João Silva');
    await page.fill('input[label="CPF"]', '123.456.789-00');
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);

    // 3. Aguardar verificação
    await expect(page.locator('text=Responsável Similar Encontrado')).toBeVisible();

    // 4. Verificar se logs foram gerados
    const duplicateLogs = logs.filter(log => 
      log.includes('Verificando duplicatas') || 
      log.includes('Duplicatas encontradas') ||
      log.includes('DUPLICATE_CHECK')
    );

    expect(duplicateLogs.length).toBeGreaterThan(0);
    console.log('✅ Logs de duplicatas encontrados:', duplicateLogs);

    // 5. Fechar diálogo
    await page.click('button:has-text("Cancelar")');
    
    console.log('✅ Teste de logs concluído!');
  });

  test('Deve não verificar duplicatas ao editar responsável existente', async ({ page }) => {
    console.log('🧪 Iniciando teste de edição sem verificação...');

    // 1. Navegar para responsáveis
    await page.click('text=Responsáveis');
    await page.waitForTimeout(1000);

    // 2. Tentar editar o primeiro responsável da lista
    const firstResponsavel = page.locator('[data-testid="responsavel-item"], .MuiListItem-root').first();
    if (await firstResponsavel.count() > 0) {
      await firstResponsavel.click();
      await page.waitForTimeout(500);

      // 3. Clicar no menu de ações
      const actionButton = page.locator('button[aria-label="Ações"], button:has-text("⋮")').first();
      if (await actionButton.count() > 0) {
        await actionButton.click();
        await page.waitForTimeout(500);

        // 4. Clicar em Editar
        await page.click('text=Editar');
        await page.waitForTimeout(1000);

        // 5. Verificar se modal de edição abriu
        await expect(page.locator('text=Editar Responsável')).toBeVisible();

        // 6. Modificar nome
        await page.fill('input[label="Nome Completo"]', 'João Silva Editado');
        await page.click('button:has-text("Salvar")');
        await page.waitForTimeout(2000);

        // 7. Verificar que não aparece diálogo de duplicatas
        await expect(page.locator('text=Responsável Similar Encontrado')).not.toBeVisible();
        
        console.log('✅ Edição funcionou sem verificação de duplicatas!');
      } else {
        console.log('⚠️ Botão de ações não encontrado, pulando teste de edição');
      }
    } else {
      console.log('⚠️ Nenhum responsável encontrado na lista, pulando teste de edição');
    }
  });
});
