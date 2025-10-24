# 📋 EXPLICAÇÃO: Valores da NFSE vs Valor Pago

## Data: 23/10/2025

---

## 🎯 CONCEITOS IMPORTANTES:

### 1. **Valor da NFSE (Nota Fiscal)**
- **O que é:** Valor que aparece na Nota Fiscal de Serviço Eletrônica
- **Como é calculado:** **70% do benefício/salário do idoso**
- **Exemplo:**
  - Benefício do idoso: R$ 1.760,38
  - 70% do benefício: **R$ 1.232,27** ← Este é o valor da NFSE
- **Onde aparece no PDF:**
  ```
  Descrição do Item | Quantidade | Valor | Valor Líquido
  Valor referente... | 1,00000 | 1.232,26 | 1.232,26 ← VALOR DA NFSE
  ```

### 2. **Valor Pago (Mensalidade Total)**
- **O que é:** Valor TOTAL que o responsável paga pela estadia do idoso
- **Como é calculado:** **Mensalidade Base** (valor fixo definido pela instituição)
- **Exemplo:**
  - Mensalidade Base: **R$ 3.225,00** ← Este é o valor pago
- **Composição:**
  - Parte 1: 70% do benefício (pago via NFSE) = R$ 1.232,27
  - Parte 2: Doação do responsável = R$ 1.992,73
  - **Total = R$ 3.225,00**

### 3. **Doação**
- **O que é:** Diferença entre o valor pago e a NFSE
- **Como é calculado:** Valor Pago - Valor NFSE
- **Exemplo:**
  - Valor Pago: R$ 3.225,00
  - Valor NFSE: R$ 1.232,27
  - **Doação: R$ 1.992,73** ← Valor que o responsável doa

---

## 📊 EXEMPLO COMPLETO - Maria Ines Jung:

### Dados do Idoso:
- **Nome:** Maria Ines Jung
- **Mensalidade Base:** R$ 3.225,00 (valor que ela paga para ficar no lar)
- **Benefício (Salário):** R$ 1.760,38 (aposentadoria/pensão)
- **Tipo:** REGULAR (70% + doação)

### Cálculos:
1. **70% do Benefício:**
   - R$ 1.760,38 × 70% = **R$ 1.232,27**
   - Este é o valor que vai na NFSE

2. **Doação:**
   - Mensalidade: R$ 3.225,00
   - Menos NFSE: R$ 1.232,27
   - **Doação: R$ 1.992,73**

### Como o Responsável Paga:
```
┌─────────────────────────────────┐
│ MENSALIDADE TOTAL: R$ 3.225,00 │
├─────────────────────────────────┤
│ Parte 1 (NFSE):    R$ 1.232,27 │ ← 70% do benefício
│ Parte 2 (Doação):  R$ 1.992,73 │ ← Complemento do responsável
└─────────────────────────────────┘
```

---

## ⚠️ PROBLEMA COMUM: Gemini Extrai Valor Errado

### O que acontece:
A IA Gemini às vezes confunde os valores e extrai:
- ❌ Valor da mensalidade (R$ 3.225,00) ao invés de
- ✅ Valor da NFSE (R$ 1.232,27)

### Onde está no PDF:
```
PDF da NFSE:
┌─────────────────────────────────────────────┐
│ Descrição           | Valor | Valor Líquido │
│ Valor referente...  | 1.232,26 | 1.232,26  │ ← CORRETO
└─────────────────────────────────────────────┘

Em outro lugar do PDF pode ter:
- Valor total: R$ 3.225,00  ← ERRADO (não é da NFSE!)
- Mensalidade: R$ 3.225,00  ← ERRADO (não é da NFSE!)
```

---

## ✅ SOLUÇÃO IMPLEMENTADA:

### 1. Prompt Melhorado para Gemini
**Arquivo:** `src/utils/geminiExtractor.ts`

Instruções adicionadas:
```
⚠️ MUITO IMPORTANTE - Extraia o "Valor Líquido" da tabela de itens/serviços
* Procure por uma TABELA com colunas: "Descrição do Item", "Quantidade", "Valor", "Valor Líquido"
* Use SEMPRE o valor da coluna "Valor Líquido" (última coluna da tabela de itens)
* NÃO use valores de outras partes do PDF (totais, mensalidades, etc.)
```

### 2. Validação Visual no Sistema
**Arquivo:** `src/components/Dashboard/PaymentModal.tsx`

Quando o valor extraído estiver diferente do esperado (70% do benefício):
- ⚠️ Mostra alerta visual em amarelo
- Compara valor extraído vs valor esperado
- Permite ajuste manual se necessário

### 3. Validação Flexível
- **Tolerância:** Aceita diferença de até 10%
- **Bloqueio:** Só bloqueia se diferença > 10%
- **Aviso:** Mostra alerta se diferença > R$ 1,00

---

## 🎓 PARA ENTENDER:

### Por que 70%?
A legislação permite que instituições de longa permanência cobrem até 70% do benefício/salário do idoso via nota fiscal de serviço.

### Por que o responsável paga mais?
O custo real da estadia é maior que 70% do benefício. A diferença é considerada **doação voluntária** do responsável.

### O recibo de doação é importante?
Sim! O responsável pode declarar a doação no Imposto de Renda e ter benefícios fiscais.

---

## 📝 REGRA DE NEGÓCIO:

| Item | Valor | Observação |
|------|-------|------------|
| **Benefício do Idoso** | R$ 1.760,38 | Aposentadoria/Pensão |
| **70% do Benefício (NFSE)** | R$ 1.232,27 | Valor que vai na nota fiscal |
| **Mensalidade Base** | R$ 3.225,00 | Valor total que o idoso paga |
| **Doação** | R$ 1.992,73 | Diferença = doação do responsável |

**Importante:**
- ✅ Valor da NFSE = 70% do benefício (R$ 1.232,27)
- ✅ Valor Pago = Mensalidade completa (R$ 3.225,00)
- ❌ Valor da NFSE ≠ Valor Pago (são diferentes!)

---

## 🔧 AÇÕES DO USUÁRIO:

### Quando o sistema mostrar alerta:
1. **Verificar PDF:**
   - Abrir o PDF da NFSE
   - Procurar a tabela de itens/serviços
   - Confirmar o "Valor Líquido"

2. **Se valor estiver correto no PDF:**
   - Ignorar o alerta
   - Usar o valor extraído
   - Sistema permite continuar

3. **Se valor estiver errado:**
   - Corrigir manualmente no campo "Valor Pago"
   - Sistema salva o valor corrigido
   - Recibo será gerado com valor correto

4. **Se benefício do idoso mudou:**
   - Ir em "Editar Idoso"
   - Atualizar o campo "Benefício (Salário)"
   - Voltar e fazer novo pagamento

---

**Status:** 🟢 **DOCUMENTADO E IMPLEMENTADO**
**Data:** 23/10/2025 20:45


