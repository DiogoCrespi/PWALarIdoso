import { test, expect } from '@playwright/test';

test.describe('Verificação de Duplicatas', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('/');
    
    // Aguardar a aplicação carregar
    await page.waitForLoadState('networkidle');
    
    // Aguardar a inicialização do sistema
    await page.waitForSelector('text=Inicializando sistema...', { timeout: 10000 });
    await page.waitForSelector('text=Inicializando sistema...', { state: 'hidden', timeout: 30000 });
  });

  test('Deve verificar duplicatas ao criar responsável com nome existente', async ({ page }) => {
    // 1. Navegar para a seção de responsáveis
    await page.click('text=Responsáveis');
    await page.waitForLoadState('networkidle');

    // 2. Clicar no botão "Novo Responsável"
    await page.click('button:has-text("Novo Responsável")');
    
    // 3. Aguardar o modal abrir
    await page.waitForSelector('text=Novo Responsável');

    // 4. Preencher dados do responsável
    await page.fill('input[placeholder*="Nome"]', 'João Silva');
    await page.fill('input[placeholder*="CPF"]', '123.456.789-00');
    await page.fill('input[placeholder*="Telefone"]', '(11) 99999-9999');
    await page.fill('input[placeholder*="Email"]', 'joao@teste.com');

    // 5. Clicar em Salvar
    await page.click('button:has-text("Salvar")');

    // 6. Verificar se o diálogo de duplicatas aparece
    await expect(page.locator('text=Responsável Similar Encontrado')).toBeVisible();
    
    // 7. Verificar se as opções estão disponíveis
    await expect(page.locator('button:has-text("Criar Novo")')).toBeVisible();
    await expect(page.locator('button:has-text("Usar")')).toBeVisible();

    // 8. Verificar se o novo item é mostrado
    await expect(page.locator('text=Novo Responsável')).toBeVisible();
    await expect(page.locator('text=João Silva')).toBeVisible();

    // 9. Fechar o diálogo
    await page.click('button:has-text("Cancelar")');
  });

  test('Deve permitir usar responsável existente', async ({ page }) => {
    // 1. Navegar para responsáveis
    await page.click('text=Responsáveis');
    await page.waitForLoadState('networkidle');

    // 2. Criar responsável com nome duplicado
    await page.click('button:has-text("Novo Responsável")');
    await page.waitForSelector('text=Novo Responsável');

    await page.fill('input[placeholder*="Nome"]', 'João Silva');
    await page.fill('input[placeholder*="CPF"]', '123.456.789-00');
    await page.click('button:has-text("Salvar")');

    // 3. Aguardar diálogo de duplicatas
    await expect(page.locator('text=Responsável Similar Encontrado')).toBeVisible();

    // 4. Clicar em "Usar" no primeiro responsável existente
    const useButtons = page.locator('button:has-text("Usar")');
    await useButtons.first().click();

    // 5. Verificar se o modal fechou e a lista foi atualizada
    await expect(page.locator('text=Novo Responsável')).not.toBeVisible();
    
    // 6. Verificar se não há duplicatas na lista
    const responsaveis = page.locator('text=João Silva');
    await expect(responsaveis).toHaveCount(1);
  });

  test('Deve permitir criar novo responsável mesmo com duplicatas', async ({ page }) => {
    // 1. Navegar para responsáveis
    await page.click('text=Responsáveis');
    await page.waitForLoadState('networkidle');

    // 2. Criar responsável com nome duplicado
    await page.click('button:has-text("Novo Responsável")');
    await page.waitForSelector('text=Novo Responsável');

    await page.fill('input[placeholder*="Nome"]', 'João Silva');
    await page.fill('input[placeholder*="CPF"]', '987.654.321-00'); // CPF diferente
    await page.fill('input[placeholder*="Telefone"]', '(11) 88888-8888');
    await page.click('button:has-text("Salvar")');

    // 3. Aguardar diálogo de duplicatas
    await expect(page.locator('text=Responsável Similar Encontrado')).toBeVisible();

    // 4. Clicar em "Criar Novo"
    await page.click('button:has-text("Criar Novo")');

    // 5. Verificar se o modal fechou
    await expect(page.locator('text=Novo Responsável')).not.toBeVisible();

    // 6. Verificar se há dois responsáveis com o mesmo nome
    const responsaveis = page.locator('text=João Silva');
    await expect(responsaveis).toHaveCount(2);
  });

  test('Deve verificar duplicatas ao criar idoso com nome existente', async ({ page }) => {
    // 1. Navegar para a seção de idosos
    await page.click('text=Idosos');
    await page.waitForLoadState('networkidle');

    // 2. Clicar no botão "Novo Idoso"
    await page.click('button:has-text("Novo Idoso")');
    
    // 3. Aguardar o modal abrir
    await page.waitForSelector('text=Novo Idoso');

    // 4. Preencher dados do idoso
    await page.fill('input[placeholder*="Nome"]', 'Maria Santos');
    await page.fill('input[placeholder*="CPF"]', '111.222.333-44');
    
    // 5. Selecionar responsável (primeiro da lista)
    await page.click('div[role="combobox"]');
    await page.click('li:first-child');

    // 6. Preencher mensalidade
    await page.fill('input[placeholder*="Mensalidade"]', '1500');

    // 7. Clicar em Salvar
    await page.click('button:has-text("Salvar")');

    // 8. Verificar se o diálogo de duplicatas aparece
    await expect(page.locator('text=Idoso Similar Encontrado')).toBeVisible();
    
    // 9. Verificar se as opções estão disponíveis
    await expect(page.locator('button:has-text("Criar Novo")')).toBeVisible();
    await expect(page.locator('button:has-text("Usar")')).toBeVisible();

    // 10. Fechar o diálogo
    await page.click('button:has-text("Cancelar")');
  });

  test('Deve permitir usar idoso existente', async ({ page }) => {
    // 1. Navegar para idosos
    await page.click('text=Idosos');
    await page.waitForLoadState('networkidle');

    // 2. Criar idoso com nome duplicado
    await page.click('button:has-text("Novo Idoso")');
    await page.waitForSelector('text=Novo Idoso');

    await page.fill('input[placeholder*="Nome"]', 'Maria Santos');
    await page.fill('input[placeholder*="CPF"]', '111.222.333-44');
    
    // Selecionar responsável
    await page.click('div[role="combobox"]');
    await page.click('li:first-child');
    
    await page.fill('input[placeholder*="Mensalidade"]', '1500');
    await page.click('button:has-text("Salvar")');

    // 3. Aguardar diálogo de duplicatas
    await expect(page.locator('text=Idoso Similar Encontrado')).toBeVisible();

    // 4. Clicar em "Usar" no primeiro idoso existente
    const useButtons = page.locator('button:has-text("Usar")');
    await useButtons.first().click();

    // 5. Verificar se o modal fechou
    await expect(page.locator('text=Novo Idoso')).not.toBeVisible();
  });

  test('Deve gerar logs corretos durante verificação de duplicatas', async ({ page }) => {
    // 1. Abrir console do navegador
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        logs.push(msg.text());
      }
    });

    // 2. Navegar para responsáveis e criar duplicata
    await page.click('text=Responsáveis');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Novo Responsável")');
    await page.waitForSelector('text=Novo Responsável');

    await page.fill('input[placeholder*="Nome"]', 'João Silva');
    await page.fill('input[placeholder*="CPF"]', '123.456.789-00');
    await page.click('button:has-text("Salvar")');

    // 3. Aguardar verificação de duplicatas
    await expect(page.locator('text=Responsável Similar Encontrado')).toBeVisible();

    // 4. Verificar se logs foram gerados
    const duplicateLogs = logs.filter(log => 
      log.includes('Verificando duplicatas') || 
      log.includes('Duplicatas encontradas') ||
      log.includes('DUPLICATE_CHECK')
    );

    expect(duplicateLogs.length).toBeGreaterThan(0);
    console.log('Logs de duplicatas encontrados:', duplicateLogs);

    // 5. Fechar diálogo
    await page.click('button:has-text("Cancelar")');
  });

  test('Deve funcionar corretamente com diferentes tipos de dados', async ({ page }) => {
    // 1. Testar com CPF apenas
    await page.click('text=Responsáveis');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Novo Responsável")');
    await page.waitForSelector('text=Novo Responsável');

    await page.fill('input[placeholder*="Nome"]', 'Pedro Costa');
    await page.fill('input[placeholder*="CPF"]', '123.456.789-00'); // CPF existente
    await page.click('button:has-text("Salvar")');

    // 2. Verificar se detecta duplicata por CPF
    await expect(page.locator('text=Responsável Similar Encontrado')).toBeVisible();
    await page.click('button:has-text("Cancelar")');

    // 3. Testar com nome apenas (sem CPF)
    await page.click('button:has-text("Novo Responsável")');
    await page.waitForSelector('text=Novo Responsável');

    await page.fill('input[placeholder*="Nome"]', 'João Silva'); // Nome existente
    // Não preencher CPF
    await page.click('button:has-text("Salvar")');

    // 4. Verificar se detecta duplicata por nome
    await expect(page.locator('text=Responsável Similar Encontrado')).toBeVisible();
    await page.click('button:has-text("Cancelar")');
  });

  test('Deve não verificar duplicatas ao editar responsável existente', async ({ page }) => {
    // 1. Navegar para responsáveis
    await page.click('text=Responsáveis');
    await page.waitForLoadState('networkidle');

    // 2. Clicar no primeiro responsável para editar
    const firstResponsavel = page.locator('[data-testid="responsavel-item"]').first();
    await firstResponsavel.click();

    // 3. Clicar no menu de ações
    await page.click('button[aria-label="Ações"]');
    await page.click('text=Editar');

    // 4. Aguardar modal de edição
    await page.waitForSelector('text=Editar Responsável');

    // 5. Modificar dados
    await page.fill('input[placeholder*="Nome"]', 'João Silva Editado');
    await page.click('button:has-text("Salvar")');

    // 6. Verificar que não aparece diálogo de duplicatas
    await expect(page.locator('text=Responsável Similar Encontrado')).not.toBeVisible();
    
    // 7. Verificar se a edição foi salva
    await expect(page.locator('text=Novo Responsável')).not.toBeVisible();
  });
});
