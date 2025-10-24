# 🐛 BUG CRÍTICO: Benefício Mostra R$ 0.00 no Novo Pagamento

## Data: 23/10/2025 20:30
## Componente: `src/services/mock-api.ts` - Dashboard API

---

## ❌ PROBLEMA RELATADO:

**Inconsistência entre telas:**

**Tela "Editar Idoso":**
- ✅ Benefício (Salário do Idoso): **R$ 1.760,38** ✓

**Tela "Novo Pagamento":**
- ❌ Benefício (Salário): **R$ 0.00** X 70% = R$ 0.00 ❌
- ❌ Valor Base do Benefício: **R$ 0.00** ❌
- ❌ Total do Benefício: **R$ 0.00** ❌
- ❌ Mostra: "Sem benefício: valor total é doação" ❌

**Impacto:**
- Sistema calculava **TODA a mensalidade como doação** (errado!)
- Deveria calcular apenas a diferença após 70% do benefício
- Responsáveis pagavam valores incorretos

---

## 🔍 CAUSA RAIZ:

### API do Dashboard NÃO Retornava Campos Necessários

**Arquivo:** `src/services/mock-api.ts` (Linhas 885-892)

**ANTES (❌ BUGADO):**
```typescript
const idosos = idososMock.map((idoso: any) => ({
  id: idoso.id,
  nome: idoso.nome,
  cpf: idoso.cpf,
  responsavel: idoso.responsavel,
  valorMensalidadeBase: idoso.valorMensalidadeBase,
  ativo: idoso.ativo,
}));
// ❌ Faltando: beneficioSalario
// ❌ Faltando: tipo
```

**Fluxo do Erro:**

1. **Dashboard carrega idosos** → `dashboard.get(ano)`
2. **API retorna idosos SEM `beneficioSalario`**
3. **PaymentModal recebe idoso incompleto:**
   ```typescript
   idoso = {
     id: 1,
     nome: "Maria Ines Jung",
     beneficioSalario: undefined // ❌ FALTANDO!
   }
   ```
4. **Cálculo no PaymentModal (linha 556):**
   ```typescript
   const salarioIdoso = idoso?.beneficioSalario && idoso.beneficioSalario > 0 
     ? idoso.beneficioSalario 
     : 0; // ← Retorna 0 porque beneficioSalario é undefined!
   ```
5. **Resultado:**
   - `salarioIdoso = 0`
   - `totalBeneficioAplicado = 0 × 70% = 0`
   - `valorDoacao = valorPago - 0 = valorPago` (TUDO vira doação!)

---

## ✅ SOLUÇÃO IMPLEMENTADA:

### Adicionados Campos Faltantes no Dashboard API

**Arquivo:** `src/services/mock-api.ts` (Linhas 884-894)

**DEPOIS (✅ CORRIGIDO):**
```typescript
// ✅ CORRIGIDO: Incluir beneficioSalario e tipo no retorno
const idosos = idososMock.map((idoso: any) => ({
  id: idoso.id,
  nome: idoso.nome,
  cpf: idoso.cpf,
  responsavel: idoso.responsavel,
  valorMensalidadeBase: idoso.valorMensalidadeBase,
  beneficioSalario: idoso.beneficioSalario || 0, // ✅ ADICIONADO
  tipo: idoso.tipo || 'REGULAR', // ✅ ADICIONADO
  ativo: idoso.ativo,
}));
```

---

## 🎯 RESULTADO:

### Antes (❌ Bugado):

**Idoso:** Maria Ines Jung
- Benefício real no banco: R$ 1.760,38
- Dashboard retorna: `beneficioSalario: undefined`
- PaymentModal calcula: `salarioIdoso = 0`

**Cálculo ERRADO:**
```
Mensalidade: R$ 3.225,00
70% do benefício: R$ 0.00 (deveria ser R$ 1.232,27)
Doação: R$ 3.225,00 (TUDO era doação! ❌)
```

### Depois (✅ Corrigido):

**Idoso:** Maria Ines Jung
- Benefício real no banco: R$ 1.760,38
- Dashboard retorna: `beneficioSalario: 1760.38` ✅
- PaymentModal calcula: `salarioIdoso = 1760.38` ✅

**Cálculo CORRETO:**
```
Mensalidade: R$ 3.225,00
70% do benefício: R$ 1.232,27 (70% de R$ 1.760,38) ✅
Doação: R$ 1.992,73 (R$ 3.225,00 - R$ 1.232,27) ✅
```

---

## 📊 IMPACTO:

- **Severidade:** 🔴 **CRÍTICA**
- **Afetados:** Todos os usuários criando pagamentos pelo dashboard
- **Risco:** 
  - Cálculos financeiros incorretos
  - Doações calculadas erradas
  - Recibos gerados com valores errados
  - Responsáveis pagando valores incorretos
- **Status:** ✅ **CORRIGIDO**

---

## 🔧 ARQUIVOS ALTERADOS:

1. ✅ `src/services/mock-api.ts`
   - Adicionado `beneficioSalario` ao retorno do `dashboard.get()` (linha 891)
   - Adicionado `tipo` ao retorno do `dashboard.get()` (linha 892)

---

## ✅ TESTES RECOMENDADOS:

1. ✅ Abrir Dashboard
2. ✅ Clicar em "Novo Pagamento" para um idoso com benefício > 0
3. ✅ Verificar se aparece: "Benefício (Salário): R$ X.XXX,XX X 70% = R$ X.XXX,XX"
4. ✅ Verificar se o cálculo de doação está correto
5. ✅ Verificar se o chip mostra "Limite NFSE: R$ X.XXX,XX (70% do benefício)"
6. ✅ Salvar pagamento e verificar valores no banco

---

## 🔗 BUGS RELACIONADOS:

Este bug está relacionado ao **Erro #2** do `ERROS_NOVO_PAGAMENTO.md`:
- Erro #2 era sobre a interface TypeScript faltando `beneficioSalario`
- Este bug é sobre a API do Dashboard não retornando o campo
- Ambos causavam "Benefício: R$ 0.00" mas por motivos diferentes:
  - **Erro #2:** Interface TypeScript desatualizada (CORRIGIDO)
  - **Este bug:** API não retornava o campo (CORRIGIDO AGORA)

---

**Status:** 🟢 **CORRIGIDO E DOCUMENTADO**
**Data da Correção:** 23/10/2025 20:30


