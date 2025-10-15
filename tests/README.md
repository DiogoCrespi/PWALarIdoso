# 🧪 Testes Automatizados de Verificação de Duplicatas

Este diretório contém testes automatizados para verificar a funcionalidade de detecção de duplicatas no sistema Lar dos Idosos.

## 📋 Testes Disponíveis

### 1. **Teste com Puppeteer** (Recomendado)
- **Arquivo**: `duplicate-check-automated.js`
- **Comando**: `npm run test:duplicates`
- **Descrição**: Teste completo com navegador real, visual e interativo

### 2. **Teste com Playwright** (Avançado)
- **Arquivo**: `tests/e2e/duplicate-check-simple.spec.ts`
- **Comando**: `npm run test:e2e`
- **Descrição**: Teste mais robusto com múltiplos navegadores

## 🚀 Como Executar

### Pré-requisitos
1. **Aplicação rodando**: Certifique-se de que a aplicação está rodando em `http://localhost:5174`
2. **Dados carregados**: O sistema deve ter dados iniciais carregados

### Executar Teste com Puppeteer
```bash
# Iniciar aplicação (em outro terminal)
npm run dev

# Executar testes de duplicatas
npm run test:duplicates
```

### Executar Teste com Playwright
```bash
# Iniciar aplicação (em outro terminal)
npm run dev

# Executar testes E2E
npm run test:e2e

# Executar com interface visual
npm run test:e2e:ui

# Executar com navegador visível
npm run test:e2e:headed

# Executar em modo debug
npm run test:e2e:debug
```

## 🧪 Testes Executados

### 1. **Verificação de Duplicata de Responsável**
- ✅ Cria responsável com nome existente
- ✅ Verifica se diálogo de duplicatas aparece
- ✅ Confirma que opções estão disponíveis

### 2. **Usar Responsável Existente**
- ✅ Detecta duplicata
- ✅ Permite escolher responsável existente
- ✅ Verifica se modal fecha corretamente

### 3. **Criar Novo com Duplicatas**
- ✅ Detecta duplicata por nome
- ✅ Permite criar novo mesmo com duplicatas
- ✅ Verifica se novo registro é criado

### 4. **Verificação de Duplicata de Idoso**
- ✅ Cria idoso com nome existente
- ✅ Verifica se diálogo de duplicatas aparece
- ✅ Confirma funcionalidade para idosos

### 5. **Geração de Logs**
- ✅ Verifica se logs são gerados durante verificação
- ✅ Confirma logs de duplicatas no console
- ✅ Valida rastreamento de operações

### 6. **Edição sem Verificação**
- ✅ Edita responsável existente
- ✅ Confirma que não verifica duplicatas na edição
- ✅ Valida comportamento correto

## 📊 Relatório de Testes

O teste com Puppeteer gera um relatório detalhado mostrando:
- ✅ **Total de testes executados**
- ✅ **Testes que passaram**
- ✅ **Testes que falharam**
- ✅ **Taxa de sucesso**
- ✅ **Detalhes de cada teste**

## 🔧 Configuração

### Puppeteer
- **Headless**: `false` (mostra navegador)
- **SlowMo**: `100ms` (desacelera ações)
- **Timeout**: `30s` (tempo limite para carregamento)

### Playwright
- **Browsers**: Chrome, Firefox, Safari
- **Base URL**: `http://localhost:5174`
- **Screenshots**: Apenas em falhas
- **Videos**: Apenas em falhas

## 🐛 Troubleshooting

### Problemas Comuns

1. **Aplicação não carrega**
   - Verifique se `npm run dev` está rodando
   - Confirme se a porta 5174 está disponível

2. **Elementos não encontrados**
   - Aguarde a inicialização do sistema
   - Verifique se os dados foram carregados

3. **Testes falham**
   - Verifique logs no console
   - Confirme se a funcionalidade está implementada

### Logs de Debug
```bash
# Executar com logs detalhados
DEBUG=pw:api npm run test:e2e

# Executar com navegador visível
npm run test:e2e:headed
```

## 📝 Exemplo de Execução

```bash
$ npm run test:duplicates

🚀 Iniciando teste automatizado de verificação de duplicatas...
✅ Navegador iniciado com sucesso!
🌐 Navegando para a aplicação...
✅ Aplicação carregada com sucesso!

============================================================
🧪 EXECUTANDO: Verificação de duplicata de responsável
============================================================
📋 Navegando para seção de responsáveis...
➕ Clicando em "Novo Responsável"...
📝 Preenchendo dados do responsável...
💾 Clicando em "Salvar"...
🔍 Verificando se diálogo de duplicatas aparece...
✅ SUCESSO: Diálogo de duplicatas apareceu!
✅ SUCESSO: Opções de escolha estão disponíveis!
✅ Diálogo fechado com sucesso!
✅ TESTE PASSOU: Verificação de duplicata de responsável

============================================================
📊 RELATÓRIO FINAL DOS TESTES
============================================================
Total de testes: 5
✅ Passou: 5
❌ Falhou: 0
📈 Taxa de sucesso: 100.0%

🎉 Testes concluídos!
```

## 🎯 Objetivos dos Testes

- ✅ **Validar funcionalidade**: Confirmar que detecção de duplicatas funciona
- ✅ **Verificar interface**: Confirmar que diálogos aparecem corretamente
- ✅ **Testar opções**: Validar escolhas do usuário
- ✅ **Confirmar logs**: Verificar rastreamento de operações
- ✅ **Prevenir regressões**: Garantir que funcionalidade não quebra

## 📚 Documentação Adicional

- [Playwright Documentation](https://playwright.dev/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
