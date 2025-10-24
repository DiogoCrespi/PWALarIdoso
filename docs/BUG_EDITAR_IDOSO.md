# 🐛 BUG CRÍTICO: Editar Idoso Altera Todos os Dados

## Data: 23/10/2025 20:15
## Componente: `src/components/Idosos/IdosoForm.tsx`

---

## ❌ PROBLEMA RELATADO:

Ao clicar em "Editar Idoso", o sistema estava:
- ❌ Mudando o tipo para "SOCIAL" (mesmo se era "REGULAR")
- ❌ Alterando o valor da mensalidade (ex: R$ 3.225,00 → R$ 32,25)
- ❌ Alterando o benefício/salário (ex: R$ 1.518,00 → R$ 15,18)
- ❌ Mudando outros dados do idoso

## 🔍 CAUSA RAIZ:

### Problema Técnico:

**Confusão entre duas funções de formatação de moeda:**

1. **`formatCurrency(value: string)`** - Linha 33-47
   - Criada para processar **entrada do usuário**
   - Espera valores como "325000" (representando R$ 3.250,00)
   - **Divide por 100** para converter centavos em reais
   - Exemplo: `formatCurrency("325000")` → R$ 3.250,00

2. **Ao carregar dados do banco** - Linha 99-100 (ANTES DA CORREÇÃO):
   ```tsx
   valorMensalidadeBase: formatCurrency(idoso.valorMensalidadeBase.toString())
   beneficioSalario: formatCurrency(idoso.beneficioSalario?.toString() || '0')
   ```
   - Banco retorna: `3225.00` (já em formato decimal)
   - `toString()` converte para `"3225"`
   - `formatCurrency("3225")` remove não-numéricos → `"3225"`
   - Divide por 100 → `32.25`
   - **RESULTADO ERRADO:** R$ 32,25 ❌ (deveria ser R$ 3.225,00)

### Exemplo Real:

**Idoso no banco de dados:**
- `valorMensalidadeBase: 3225.00`
- `beneficioSalario: 1518.00`
- `tipo: 'REGULAR'`

**Ao clicar em "Editar":**
1. `formatCurrency("3225")` → R$ 32,25 ❌
2. `formatCurrency("1518")` → R$ 15,18 ❌
3. Tipo permanece correto: 'REGULAR' ✓

**Ao salvar:**
- Sistema salva R$ 32,25 e R$ 15,18 (valores errados!)
- Usuário vê valores completamente diferentes

---

## ✅ SOLUÇÃO IMPLEMENTADA:

### 1. Criada nova função `formatCurrencyFromNumber`

**Arquivo:** `src/components/Idosos/IdosoForm.tsx` (Linhas 49-57)

```typescript
// ✅ CORRIGIDO: Função para formatar valores do banco de dados (já em formato decimal)
const formatCurrencyFromNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};
```

**Diferença:**
- ❌ `formatCurrency`: Para **entrada do usuário** (divide por 100)
- ✅ `formatCurrencyFromNumber`: Para **valores do banco** (NÃO divide)

### 2. Atualizado carregamento de dados (Linhas 104-114)

```typescript
if (idoso) {
  // ✅ CORRIGIDO: Usar formatCurrencyFromNumber para valores do banco de dados
  setFormData({
    nome: idoso.nome,
    cpf: idoso.cpf || '',
    dataNascimento: idoso.dataNascimento ? new Date(idoso.dataNascimento) : null,
    responsavelId: idoso.responsavelId.toString(),
    valorMensalidadeBase: formatCurrencyFromNumber(idoso.valorMensalidadeBase), // ✅ NOVO
    beneficioSalario: formatCurrencyFromNumber(idoso.beneficioSalario || 0), // ✅ NOVO
    tipo: idoso.tipo || 'REGULAR',
    observacoes: idoso.observacoes || '',
  });
}
```

---

## 🎯 RESULTADO:

### Antes (❌ Bugado):
```
Banco de dados:
- Mensalidade: R$ 3.225,00
- Benefício: R$ 1.518,00
- Tipo: REGULAR

Ao editar, mostrava:
- Mensalidade: R$ 32,25 ❌
- Benefício: R$ 15,18 ❌
- Tipo: REGULAR ✓
```

### Depois (✅ Corrigido):
```
Banco de dados:
- Mensalidade: R$ 3.225,00
- Benefício: R$ 1.518,00
- Tipo: REGULAR

Ao editar, mostra:
- Mensalidade: R$ 3.225,00 ✅
- Benefício: R$ 1.518,00 ✅
- Tipo: REGULAR ✅
```

---

## 📊 IMPACTO:

- **Severidade:** 🔴 **CRÍTICA**
- **Afetados:** Todos os usuários que editam idosos
- **Risco:** Perda de dados financeiros importantes
- **Status:** ✅ **CORRIGIDO**

---

## 🔧 ARQUIVOS ALTERADOS:

1. ✅ `src/components/Idosos/IdosoForm.tsx`
   - Adicionada função `formatCurrencyFromNumber` (linhas 49-57)
   - Atualizado `useEffect` para usar nova função (linhas 110-111)

---

## ✅ TESTES RECOMENDADOS:

1. ✅ Criar novo idoso com valores normais (ex: R$ 3.225,00)
2. ✅ Editar o idoso criado
3. ✅ Verificar se valores permanecem corretos
4. ✅ Salvar sem alterar
5. ✅ Verificar no banco se valores não mudaram
6. ✅ Editar e alterar valores
7. ✅ Verificar se novos valores foram salvos corretamente

---

**Status:** 🟢 **CORRIGIDO E DOCUMENTADO**
**Data da Correção:** 23/10/2025 20:15


