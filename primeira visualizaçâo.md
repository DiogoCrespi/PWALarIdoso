

Aqui está um esboço da aplicação PWA, cobrindo a arquitetura, o banco de dados, a API e os componentes de frontend para atender aos seus requisitos.

### **1. Arquitetura e Stack Tecnológico**

Vamos usar um stack moderno, produtivo e de alta performance, baseado em JavaScript/TypeScript.

  * **Frontend (PWA):** **React (com Vite)** para uma experiência de desenvolvimento rápida e uma UI reativa.

      * **UI Framework:** **Material-UI (MUI)** para componentes visualmente harmoniosos e um design system coeso.
      * **Gerenciamento de Estado:** **Zustand** ou **Redux Toolkit** para um controle de estado global simples e poderoso.
      * **PWA:** Arquivo `manifest.json` para instalação e um **Service Worker** (gerenciado por ferramentas como `vite-plugin-pwa`) para cache e funcionalidade offline.

  * **Backend (API):** **Node.js com Express**.

      * **Linguagem:** **TypeScript** para adicionar tipagem estática, reduzindo bugs e melhorando a manutenibilidade.
      * **Geração de DOCX:** Biblioteca **`docx`** (npm).
      * **ORM (Opcional):** **Prisma** ou **Sequelize** para facilitar a comunicação com o banco de dados.

  * **Banco de Dados:** **PostgreSQL**.

      * É robusto, confiável e excelente para lidar com dados relacionais como os seus.

-----

### **2. Esquema do Banco de Dados (PostgreSQL)**

A estrutura de dados é a fundação. Um modelo bem definido evita problemas futuros.

```sql
-- Tabela para os responsáveis/pagadores
CREATE TABLE responsaveis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    contato_telefone VARCHAR(20),
    contato_email VARCHAR(255)
);

-- Tabela para os idosos, com vínculo ao responsável
CREATE TABLE idosos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    responsavel_id INTEGER REFERENCES responsaveis(id),
    valor_mensalidade_base NUMERIC(10, 2) NOT NULL
);

-- Tabela principal para registrar cada pagamento mensal
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    idoso_id INTEGER NOT NULL REFERENCES idosos(id),
    mes_referencia INTEGER NOT NULL, -- 1 para Janeiro, 12 para Dezembro
    ano_referencia INTEGER NOT NULL,
    valor_pago NUMERIC(10, 2) DEFAULT 0,
    data_pagamento DATE,
    nfs_e VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'PARCIAL', 'PAGO'
    valor_doacao_calculado NUMERIC(10, 2) DEFAULT 0,
    CONSTRAINT pagamento_unico UNIQUE (idoso_id, mes_referencia, ano_referencia)
);
```

-----

### **3. Contrato da API (Backend - Endpoints RESTful)**

A API será a ponte entre o frontend e o banco de dados.

  * **Autenticação (se necessário):** `POST /login` (JWT)

  * **Idosos:**

      * `GET /api/idosos`: Lista todos os idosos e seus responsáveis.
      * `POST /api/idosos`: Cria um novo idoso.
      * `PUT /api/idosos/:id`: Atualiza um idoso.

  * **Pagamentos:**

      * `GET /api/pagamentos?idoso_id=X`: Lista todos os pagamentos de um idoso.
      * `POST /api/pagamentos`: Lança um novo pagamento. O backend será responsável por calcular o `status` e o `valor_doacao_calculado`.
          * **Corpo da Requisição:** `{ idoso_id, mes_referencia, ano_referencia, valor_pago, data_pagamento, nfs_e }`
          * **Lógica do Backend:**
            1.  Busca `valor_mensalidade_base` do idoso.
            2.  Compara `valor_pago` com `valor_mensalidade_base` para definir o `status` ('PAGO', 'PARCIAL', 'PENDENTE').
            3.  Calcula `valor_doacao_calculado` (ex: `valor_pago - valor_mensalidade_base`).
            4.  Salva no banco.

  * **Dashboard:**

      * `GET /api/dashboard?ano=YYYY`: **Endpoint principal**. Retorna um objeto otimizado para a grade visual.
          * **Estrutura da Resposta:**
            ```json
            {
              "idosos": [ { "id": 1, "nome": "Amélia Sant'Ana" }, ... ],
              "pagamentos": {
                "1": { // idoso_id
                  "9": { "status": "PAGO", "nfs_e": "1491" }, // mes_referencia
                  "10": { "status": "PENDENTE", "nfs_e": null }
                }
              }
            }
            ```

  * **Recibos:**

      * `GET /api/pagamentos/:id/recibo`: Gera e faz o download do recibo DOCX para o pagamento específico.

-----

### **4. Arquitetura do Frontend (React Components)**

Dividir a UI em componentes reutilizáveis.

  * `<DashboardPage>`: A página principal que busca os dados do endpoint `/api/dashboard` e gerencia o estado do ano selecionado.
  * `<DashboardGrid>`: Renderiza a tabela (matriz). Mapeia os dados recebidos para criar as linhas e colunas.
  * `<DashboardCell>`: **Componente chave para a visualização**.
      * Recebe `status` e `nfs_e` como *props*.
      * Usa uma lógica interna para definir sua cor de fundo (`bg-green-200`, `bg-red-200`, `bg-yellow-200`).
      * Exibe o `nfs_e`.
      * Possui um `onClick` que abre o modal de pagamento.
  * `<PaymentModal>`:
      * Aberto ao clicar em uma `<DashboardCell>`.
      * Exibe os detalhes do pagamento (se houver) ou um formulário para um novo lançamento.
      * Contém os campos `valor_pago`, `data_pagamento`, `nfs_e`.
      * Botão "Salvar" que chama a API (`POST /api/pagamentos`).
      * Botão **"Gerar Recibo de Doação"**, que só aparece se houver doação e chama o endpoint `/api/pagamentos/:id/recibo`.
  * `<Sidebar>`: Para navegação entre o Dashboard e as páginas de cadastro.
  * `<IdososAdminPage>`: Página com tabela para gerenciar (CRUD) os idosos e responsáveis.

-----

### **5. Código de Exemplo (Backend - Gerador de Recibo em DOCX)**

Este é o coração da automação. Um exemplo para o endpoint `GET /api/pagamentos/:id/recibo`.

```typescript
// Em um arquivo de rota do Express (ex: pagamentos.routes.ts)
import { Router } from 'express';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { findPagamentoById } from './pagamentos.service'; // Função que busca dados no DB

const router = Router();

router.get('/:id/recibo', async (req, res) => {
    const { id } = req.params;
    
    // 1. Buscar todos os dados necessários do banco de dados
    const pagamento = await findPagamentoById(Number(id)); // Inclui dados do idoso e responsável
    
    if (!pagamento || pagamento.valor_doacao_calculado <= 0) {
        return res.status(404).send('Recibo não aplicável ou pagamento não encontrado.');
    }

    // 2. Usar a biblioteca 'docx' para criar o documento em memória
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    text: "RECIBO DE DOAÇÃO",
                    heading: HeadingLevel.TITLE,
                    alignment: 'center',
                }),
                new Paragraph({ text: " ", spacing: { after: 400 } }),
                new Paragraph({
                    children: [
                        new TextRun("Recebemos de "),
                        new TextRun({ text: pagamento.idoso.responsavel.nome, bold: true }),
                        new TextRun(", CPF nº "),
                        new TextRun({ text: pagamento.idoso.responsavel.cpf, bold: true }),
                        new TextRun(", a quantia de "),
                        new TextRun({ text: `R$ ${pagamento.valor_doacao_calculado.toFixed(2)}`, bold: true }),
                        new TextRun({ text: ", referente à doação voluntária para auxílio de ", break: 1 }),
                        new TextRun({ text: pagamento.idoso.nome, bold: true }),
                        new TextRun(", na competência de "),
                        new TextRun(`${pagamento.mes_referencia}/${pagamento.ano_referencia}.`),
                    ],
                    style: "Normal",
                }),
                new Paragraph({ text: " ", spacing: { after: 800 } }),
                new Paragraph({
                    text: `Matelândia, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.`,
                    alignment: 'right',
                }),
                new Paragraph({ text: " ", spacing: { after: 1200 } }),
                new Paragraph({
                    text: "________________________________________",
                    alignment: 'center',
                }),
                new Paragraph({
                    text: "Associação Filhas de São Camilo",
                    alignment: 'center',
                }),
            ],
        }],
    });

    // 3. Empacotar o documento e enviar como resposta
    const buffer = await Packer.toBuffer(doc);

    // 4. Configurar os headers para forçar o download do arquivo .docx
    const nomeArquivo = `Recibo_Doacao_${pagamento.idoso.nome.replace(' ', '_')}_${pagamento.ano_referencia}_${pagamento.mes_referencia}.docx`;
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    res.send(buffer);
});

export default router;
```

Este esboço fornece um caminho claro e profissional para construir a aplicação, garantindo que todos os seus requisitos de controle, visualização e automação sejam atendidos de forma eficiente e escalável.