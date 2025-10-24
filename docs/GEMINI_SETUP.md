# 🤖 Configuração da API do Gemini

## Como obter a API Key do Gemini

1. **Acesse:** https://makersuite.google.com/app/apikey
2. **Faça login** com sua conta Google
3. **Clique em "Create API Key"**
4. **Copie a API key** gerada

## Como configurar no projeto

### Opção 1: Variável de Ambiente (Recomendado)

1. **Crie um arquivo `.env`** na raiz do projeto
2. **Adicione a linha:**
   ```
   VITE_GEMINI_API_KEY=sua_api_key_aqui
   ```
3. **Reinicie o servidor** (`npm run dev`)

### Opção 2: Configuração Direta

1. **Edite o arquivo:** `src/config/gemini.ts`
2. **Substitua a linha:**
   ```typescript
   API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
   ```
   Por:
   ```typescript
   API_KEY: 'sua_api_key_aqui',
   ```

## Como funciona

- **Com API key:** Usa o Gemini para extrair dados reais do PDF
- **Sem API key:** Usa fallback inteligente baseado no nome do arquivo

## Benefícios do Gemini

✅ **Extração precisa** - Lê o conteúdo real do PDF
✅ **Múltiplos formatos** - Funciona com qualquer tipo de NFSE
✅ **Dados estruturados** - Retorna JSON organizado
✅ **Fallback robusto** - Se falhar, usa método anterior

## Teste

1. **Configure a API key**
2. **Faça upload de um PDF** de NFSE
3. **Observe os logs** no console F12
4. **Verifique se os dados** foram extraídos corretamente
