# Segunda Visualização - Sistema de Controle Lar dos Idosos

## 📊 Análise Comparativa: Duas Abordagens

### Proposta A: **Aplicação Desktop Local** (RECOMENDADA para uso em um computador)
### Proposta B: **PWA Completa** (Arquitetura original - mais complexa)

---

## 🎯 PROPOSTA A: Aplicação Desktop Simplificada (RECOMENDADA)

### **Por que esta abordagem?**
- ✅ Uso em apenas um computador
- ✅ Instalação e manutenção mais simples
- ✅ Não precisa configurar servidor
- ✅ Arquivo de banco de dados único e portátil
- ✅ Acesso direto às pastas de rede para salvar recibos
- ✅ Performance superior (sem latência de rede)

### **1. Stack Tecnológico**

```
┌─────────────────────────────────────────┐
│     APLICAÇÃO DESKTOP INTEGRADA         │
├─────────────────────────────────────────┤
│  Frontend: React + TypeScript + Vite    │
│  UI: Material-UI (MUI)                  │
│  Estado: Zustand                        │
├─────────────────────────────────────────┤
│  Runtime: Electron                      │
│  - Janela nativa do Windows             │
│  - Integração com sistema de arquivos   │
│  - Menu e atalhos                       │
├─────────────────────────────────────────┤
│  Backend Integrado: Node.js             │
│  - API interna (IPC do Electron)        │
│  - Geração de DOCX (biblioteca docx)    │
│  - ORM: Prisma                          │
├─────────────────────────────────────────┤
│  Banco de Dados: SQLite                 │
│  - Arquivo único: lar_idosos.db         │
│  - Backup fácil (copiar arquivo)        │
└─────────────────────────────────────────┘
```

### **2. Estrutura do Projeto**

```
PWALarIdosos/
├── electron/                    # Configuração do Electron
│   ├── main.ts                 # Processo principal
│   ├── preload.ts              # Bridge seguro
│   └── ipc-handlers/           # Handlers da API interna
│       ├── idosos.handler.ts
│       ├── pagamentos.handler.ts
│       └── recibos.handler.ts
│
├── src/                        # Frontend React
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── DashboardGrid.tsx
│   │   │   ├── DashboardCell.tsx
│   │   │   └── PaymentModal.tsx
│   │   ├── Idosos/
│   │   │   ├── IdososList.tsx
│   │   │   └── IdosoForm.tsx
│   │   ├── Responsaveis/
│   │   │   └── ResponsavelForm.tsx
│   │   └── Layout/
│   │       ├── Sidebar.tsx
│   │       └── Header.tsx
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── IdososPage.tsx
│   │   └── ConfiguracoesPage.tsx
│   │
│   ├── stores/
│   │   ├── useIdososStore.ts
│   │   └── usePagamentosStore.ts
│   │
│   ├── services/
│   │   └── electron-api.ts    # Interface com IPC
│   │
│   └── App.tsx
│
├── prisma/
│   ├── schema.prisma           # Modelo do banco SQLite
│   └── migrations/
│
├── database/
│   └── lar_idosos.db          # Banco de dados SQLite (criado em runtime)
│
└── package.json
```

### **3. Esquema do Banco de Dados SQLite**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./lar_idosos.db"
}

model Responsavel {
  id              Int      @id @default(autoincrement())
  nome            String
  cpf             String   @unique
  contatoTelefone String?
  contatoEmail    String?
  idosos          Idoso[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Idoso {
  id                    Int          @id @default(autoincrement())
  nome                  String
  cpf                   String?      @unique
  dataNascimento        DateTime?
  responsavelId         Int
  responsavel           Responsavel  @relation(fields: [responsavelId], references: [id])
  valorMensalidadeBase  Float
  pagamentos            Pagamento[]
  ativo                 Boolean      @default(true)
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
}

model Pagamento {
  id                      Int       @id @default(autoincrement())
  idosoId                 Int
  idoso                   Idoso     @relation(fields: [idosoId], references: [id])
  mesReferencia           Int       // 1-12
  anoReferencia           Int       // 2025, 2026...
  valorPago               Float     @default(0)
  dataPagamento           DateTime?
  nfse                    String?   // Número da Nota Fiscal
  status                  String    @default("PENDENTE") // PENDENTE, PARCIAL, PAGO
  valorDoacaoCalculado    Float     @default(0)
  caminhoReciboDoacao     String?   // Caminho do DOCX gerado
  observacoes             String?
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  @@unique([idosoId, mesReferencia, anoReferencia])
}

model Configuracao {
  id                      Int       @id @default(autoincrement())
  chave                   String    @unique
  valor                   String
  descricao               String?
}

// Armazenar caminhos das pastas de rede em Configuracao:
// - caminho_recibos_doacao
// - caminho_recibos_mensalidade
// - template_recibo_doacao (caminho para template DOCX base, se houver)
```

### **4. API Interna (IPC do Electron)**

Em vez de endpoints HTTP, usamos IPC (Inter-Process Communication):

```typescript
// electron/ipc-handlers/idosos.handler.ts

import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupIdososHandlers() {
  // Listar todos os idosos
  ipcMain.handle('idosos:list', async () => {
    return await prisma.idoso.findMany({
      include: {
        responsavel: true,
      },
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  });

  // Criar idoso
  ipcMain.handle('idosos:create', async (event, data) => {
    return await prisma.idoso.create({
      data: {
        nome: data.nome,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        responsavelId: data.responsavelId,
        valorMensalidadeBase: data.valorMensalidadeBase,
      },
    });
  });

  // Atualizar idoso
  ipcMain.handle('idosos:update', async (event, id, data) => {
    return await prisma.idoso.update({
      where: { id },
      data,
    });
  });

  // Desativar idoso (soft delete)
  ipcMain.handle('idosos:delete', async (event, id) => {
    return await prisma.idoso.update({
      where: { id },
      data: { ativo: false },
    });
  });
}
```

```typescript
// electron/ipc-handlers/pagamentos.handler.ts

import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupPagamentosHandlers() {
  // Buscar dados para o dashboard
  ipcMain.handle('dashboard:get', async (event, ano: number) => {
    const idosos = await prisma.idoso.findMany({
      where: { ativo: true },
      include: { responsavel: true },
      orderBy: { nome: 'asc' },
    });

    const pagamentos = await prisma.pagamento.findMany({
      where: { anoReferencia: ano },
    });

    // Formatar dados para o grid
    const pagamentosMap: Record<number, Record<number, any>> = {};
    
    pagamentos.forEach(p => {
      if (!pagamentosMap[p.idosoId]) {
        pagamentosMap[p.idosoId] = {};
      }
      pagamentosMap[p.idosoId][p.mesReferencia] = {
        id: p.id,
        status: p.status,
        nfse: p.nfse,
        valorPago: p.valorPago,
        dataPagamento: p.dataPagamento,
      };
    });

    return {
      idosos,
      pagamentos: pagamentosMap,
    };
  });

  // Lançar/atualizar pagamento
  ipcMain.handle('pagamento:upsert', async (event, data) => {
    const idoso = await prisma.idoso.findUnique({
      where: { id: data.idosoId },
    });

    if (!idoso) throw new Error('Idoso não encontrado');

    // Calcular status
    let status = 'PENDENTE';
    const valorPago = parseFloat(data.valorPago) || 0;
    const valorBase = idoso.valorMensalidadeBase;

    if (valorPago >= valorBase) {
      status = 'PAGO';
    } else if (valorPago > 0) {
      status = 'PARCIAL';
    }

    // Calcular doação (se houver excedente)
    const valorDoacaoCalculado = Math.max(0, valorPago - valorBase);

    return await prisma.pagamento.upsert({
      where: {
        idosoId_mesReferencia_anoReferencia: {
          idosoId: data.idosoId,
          mesReferencia: data.mesReferencia,
          anoReferencia: data.anoReferencia,
        },
      },
      update: {
        valorPago,
        dataPagamento: data.dataPagamento,
        nfse: data.nfse,
        status,
        valorDoacaoCalculado,
        observacoes: data.observacoes,
      },
      create: {
        idosoId: data.idosoId,
        mesReferencia: data.mesReferencia,
        anoReferencia: data.anoReferencia,
        valorPago,
        dataPagamento: data.dataPagamento,
        nfse: data.nfse,
        status,
        valorDoacaoCalculado,
        observacoes: data.observacoes,
      },
    });
  });
}
```

```typescript
// electron/ipc-handlers/recibos.handler.ts

import { ipcMain, dialog } from 'electron';
import { PrismaClient } from '@prisma/client';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export function setupRecibosHandlers() {
  // Gerar recibo de doação
  ipcMain.handle('recibo:gerar-doacao', async (event, pagamentoId: number) => {
    const pagamento = await prisma.pagamento.findUnique({
      where: { id: pagamentoId },
      include: {
        idoso: {
          include: {
            responsavel: true,
          },
        },
      },
    });

    if (!pagamento || pagamento.valorDoacaoCalculado <= 0) {
      throw new Error('Recibo de doação não aplicável');
    }

    // Buscar caminho configurado para salvar recibos
    const configCaminho = await prisma.configuracao.findUnique({
      where: { chave: 'caminho_recibos_doacao' },
    });

    const caminhoBase = configCaminho?.valor || 'C:\\Nestjs\\PWALarIdosos\\RECIBOS DOAÇÃO LAR';

    // Criar documento DOCX
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "RECIBO DE DOAÇÃO",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: `Nº ${pagamento.nfse || '___________'}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 600 },
          }),
          new Paragraph({
            children: [
              new TextRun("Recebemos de "),
              new TextRun({ 
                text: pagamento.idoso.responsavel.nome.toUpperCase(), 
                bold: true 
              }),
              new TextRun(", CPF nº "),
              new TextRun({ 
                text: pagamento.idoso.responsavel.cpf, 
                bold: true 
              }),
              new TextRun(", a quantia de "),
              new TextRun({ 
                text: `R$ ${pagamento.valorDoacaoCalculado.toFixed(2).replace('.', ',')}`, 
                bold: true,
                underline: {}
              }),
              new TextRun(" ("),
              new TextRun({ 
                text: numeroParaExtenso(pagamento.valorDoacaoCalculado),
                italics: true
              }),
              new TextRun("), referente à "),
              new TextRun({ 
                text: "doação voluntária", 
                bold: true 
              }),
              new TextRun(" para auxílio de "),
              new TextRun({ 
                text: pagamento.idoso.nome.toUpperCase(), 
                bold: true 
              }),
              new TextRun(", na competência de "),
              new TextRun({ 
                text: `${meses[pagamento.mesReferencia - 1]}/${pagamento.anoReferencia}`,
                bold: true
              }),
              new TextRun("."),
            ],
            spacing: { after: 800 },
          }),
          new Paragraph({
            text: " ",
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: `Matelândia, ${formatarDataExtenso(new Date())}.`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 1200 },
          }),
          new Paragraph({
            text: " ",
            spacing: { after: 800 },
          }),
          new Paragraph({
            text: "________________________________________",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Associação Filhas de São Camilo",
            alignment: AlignmentType.CENTER,
            bold: true,
          }),
          new Paragraph({
            text: "CNPJ: XX.XXX.XXX/XXXX-XX",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
        ],
      }],
    });

    // Gerar buffer
    const buffer = await Packer.toBuffer(doc);

    // Nome do arquivo
    const nomeArquivo = `${pagamento.nfse || pagamento.id}_${pagamento.idoso.nome.replace(/\s+/g, '_').toUpperCase()}.docx`;
    const caminhoCompleto = path.join(caminhoBase, nomeArquivo);

    // Salvar arquivo
    fs.writeFileSync(caminhoCompleto, buffer);

    // Atualizar registro no banco
    await prisma.pagamento.update({
      where: { id: pagamentoId },
      data: { caminhoReciboDoacao: caminhoCompleto },
    });

    return {
      sucesso: true,
      caminho: caminhoCompleto,
      nomeArquivo,
    };
  });

  // Abrir pasta de recibos
  ipcMain.handle('recibo:abrir-pasta', async (event, tipo: 'doacao' | 'mensalidade') => {
    const chave = tipo === 'doacao' ? 'caminho_recibos_doacao' : 'caminho_recibos_mensalidade';
    const config = await prisma.configuracao.findUnique({
      where: { chave },
    });

    if (config?.valor) {
      const { shell } = require('electron');
      shell.openPath(config.valor);
    }
  });
}

// Funções auxiliares
function formatarDataExtenso(data: Date): string {
  const dia = data.getDate();
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();
  
  return `${dia} de ${mes} de ${ano}`;
}

function numeroParaExtenso(valor: number): string {
  // Implementação simplificada - pode usar biblioteca como 'extenso'
  // ou implementar lógica completa
  return `${valor.toFixed(2)} reais`;
}
```

### **5. Frontend - Componentes Principais**

```tsx
// src/components/Dashboard/DashboardCell.tsx

import React from 'react';
import { Box, Tooltip } from '@mui/material';

interface DashboardCellProps {
  status: 'PAGO' | 'PARCIAL' | 'PENDENTE';
  nfse?: string;
  onClick: () => void;
}

const DashboardCell: React.FC<DashboardCellProps> = ({ status, nfse, onClick }) => {
  const cores = {
    PAGO: '#4caf50',      // Verde vibrante
    PARCIAL: '#ff9800',    // Laranja
    PENDENTE: '#f44336',   // Vermelho
  };

  const labels = {
    PAGO: 'Pago',
    PARCIAL: 'Parcial',
    PENDENTE: 'Pendente',
  };

  return (
    <Tooltip title={labels[status]}>
      <Box
        onClick={onClick}
        sx={{
          backgroundColor: cores[status],
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '2px solid white',
          transition: 'all 0.2s',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 3,
          },
        }}
      >
        {nfse || '-'}
      </Box>
    </Tooltip>
  );
};

export default DashboardCell;
```

```tsx
// src/components/Dashboard/DashboardGrid.tsx

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';
import DashboardCell from './DashboardCell';

interface DashboardGridProps {
  idosos: any[];
  pagamentos: Record<number, Record<number, any>>;
  onCellClick: (idosoId: number, mes: number) => void;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  idosos, 
  pagamentos, 
  onCellClick 
}) => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell 
              sx={{ 
                fontWeight: 'bold', 
                backgroundColor: '#1976d2', 
                color: 'white',
                minWidth: '200px',
              }}
            >
              Idoso
            </TableCell>
            {meses.map((mes, idx) => (
              <TableCell 
                key={idx} 
                align="center"
                sx={{ 
                  fontWeight: 'bold', 
                  backgroundColor: '#1976d2', 
                  color: 'white',
                  minWidth: '80px',
                }}
              >
                {mes}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {idosos.map(idoso => (
            <TableRow key={idoso.id}>
              <TableCell sx={{ fontWeight: 'medium' }}>
                {idoso.nome}
              </TableCell>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mes => {
                const pag = pagamentos[idoso.id]?.[mes];
                const status = pag?.status || 'PENDENTE';
                
                return (
                  <TableCell key={mes} sx={{ padding: 0 }}>
                    <DashboardCell
                      status={status}
                      nfse={pag?.nfse}
                      onClick={() => onCellClick(idoso.id, mes)}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DashboardGrid;
```

### **6. Configuração Inicial e Seeds**

```typescript
// prisma/seeds/inicial.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  // Configurações padrão
  await prisma.configuracao.createMany({
    data: [
      {
        chave: 'caminho_recibos_doacao',
        valor: 'C:\\Nestjs\\PWALarIdosos\\RECIBOS DOAÇÃO LAR',
        descricao: 'Pasta de rede para salvar recibos de doação',
      },
      {
        chave: 'caminho_recibos_mensalidade',
        valor: 'C:\\Nestjs\\PWALarIdosos\\RECIBOS',
        descricao: 'Pasta de rede para salvar recibos de mensalidade',
      },
      {
        chave: 'cnpj_instituicao',
        valor: 'XX.XXX.XXX/XXXX-XX',
        descricao: 'CNPJ da instituição',
      },
      {
        chave: 'nome_instituicao',
        valor: 'Associação Filhas de São Camilo',
        descricao: 'Nome da instituição',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Configurações iniciais criadas');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 🌐 PROPOSTA B: PWA Completa (Arquitetura Original)

### **Por que esta abordagem?**
- ✅ Acesso de múltiplos dispositivos/computadores
- ✅ Acesso remoto via navegador
- ✅ Mais escalável para o futuro
- ⚠️ Mais complexa de configurar e manter
- ⚠️ Requer servidor sempre rodando

### **Stack (conforme primeira visualização)**

```
┌──────────────────────────────────────────┐
│          FRONTEND (PWA)                   │
│  React + TypeScript + Material-UI        │
│  Service Worker + manifest.json          │
└──────────────────────────────────────────┘
                    ↓ HTTP/REST
┌──────────────────────────────────────────┐
│          BACKEND (API)                    │
│  Node.js + Express + TypeScript          │
│  Rotas RESTful                           │
└──────────────────────────────────────────┘
                    ↓ SQL
┌──────────────────────────────────────────┐
│      BANCO DE DADOS                       │
│  PostgreSQL                               │
└──────────────────────────────────────────┘
```

*(Manter estrutura da primeira visualização, com os ajustes necessários)*

---

## 📋 Plano de Implementação

### **Fase 1: Configuração Inicial** (1-2 dias)
- [ ] Criar projeto Electron + React + TypeScript + Vite
- [ ] Configurar Prisma com SQLite
- [ ] Criar estrutura de pastas
- [ ] Configurar Material-UI e tema personalizado

### **Fase 2: Backend e Banco de Dados** (2-3 dias)
- [ ] Implementar schema Prisma completo
- [ ] Criar migrations
- [ ] Implementar IPC handlers (idosos, responsáveis, pagamentos)
- [ ] Implementar gerador de recibos DOCX
- [ ] Criar seed com dados de configuração

### **Fase 3: Frontend - Dashboard** (3-4 dias)
- [ ] Criar layout base (Sidebar, Header)
- [ ] Implementar DashboardGrid com cores
- [ ] Implementar DashboardCell (verde/vermelho/laranja)
- [ ] Modal de pagamento (formulário)
- [ ] Integração com IPC API

### **Fase 4: Frontend - Cadastros** (2-3 dias)
- [ ] Página de cadastro de responsáveis
- [ ] Página de cadastro de idosos
- [ ] Formulários com validação
- [ ] Listagens com busca e filtros

### **Fase 5: Geração de Recibos** (2-3 dias)
- [ ] Template de recibo de doação
- [ ] Template de recibo de mensalidade (se necessário)
- [ ] Botão para gerar recibo no modal
- [ ] Salvar automaticamente na pasta de rede configurada
- [ ] Botão para abrir pasta de recibos

### **Fase 6: Configurações e Ajustes** (1-2 dias)
- [ ] Página de configurações (caminhos de pastas)
- [ ] Validações e tratamento de erros
- [ ] Mensagens de feedback (toasts/snackbars)
- [ ] Atalhos de teclado

### **Fase 7: Testes e Refinamentos** (2-3 dias)
- [ ] Testes de funcionalidades
- [ ] Ajustes visuais
- [ ] Performance
- [ ] Criação de instalador (.exe)

### **Fase 8: Migração de Dados** (1-2 dias)
- [ ] Script para importar dados dos DOCX existentes (se necessário)
- [ ] Validação dos dados importados

---

## 🎨 Paleta de Cores Vibrantes

```
Status de Pagamento:
├── PAGO:     #4caf50  (Verde vibrante)
├── PARCIAL:  #ff9800  (Laranja chamativo)
└── PENDENTE: #f44336  (Vermelho alerta)

UI Principal:
├── Primary:   #1976d2  (Azul Material)
├── Secondary: #dc004e  (Rosa destaque)
├── Success:   #4caf50  (Verde)
├── Warning:   #ff9800  (Laranja)
├── Error:     #f44336  (Vermelho)
└── Info:      #2196f3  (Azul claro)
```

---

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "zustand": "^4.4.0",
    "docx": "^8.5.0",
    "@prisma/client": "^5.5.0"
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.6.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.0",
    "prisma": "^5.5.0"
  }
}
```

---

## 🚀 Como Executar (Desenvolvimento)

```bash
# Instalar dependências
npm install

# Iniciar Prisma (criar DB e migrations)
npx prisma migrate dev --name init

# Rodar seed (configurações iniciais)
npx prisma db seed

# Iniciar aplicação
npm run dev

# Build para produção
npm run build

# Criar instalador
npm run dist
```

---

## 💾 Backup e Segurança

### Backup do Banco de Dados
```
O arquivo lar_idosos.db pode ser copiado periodicamente para:
- Pasta de rede
- OneDrive/Google Drive
- Pen drive
```

### Backup dos Recibos
```
Os recibos são salvos diretamente nas pastas de rede configuradas:
- C:\Nestjs\PWALarIdosos\RECIBOS DOAÇÃO LAR
- C:\Nestjs\PWALarIdosos\RECIBOS\[MÊS.ANO]
```

---

## ✅ Checklist de Funcionalidades

- [x] Dashboard visual com grid de meses
- [x] Cores vibrantes (verde/vermelho/laranja)
- [x] Status: PAGO, PARCIAL, PENDENTE
- [x] Cadastro de idosos e responsáveis
- [x] Lançamento de pagamentos
- [x] Geração automática de recibos DOCX
- [x] Salvamento em pastas de rede
- [x] Cálculo automático de doação
- [x] Número de nota fiscal em cada célula
- [x] Interface harmoniosa e moderna

---

## 🎯 Recomendação Final

**Para uso em um único computador: PROPOSTA A (Desktop)**
- Mais simples de configurar
- Mais rápida
- Mais fácil de dar backup
- Instalação com um único arquivo .exe

**Para uso futuro em múltiplos computadores: PROPOSTA B (PWA)**
- Mais trabalho inicial
- Acesso via navegador
- Melhor para crescimento futuro

---

## 📝 Próximos Passos

1. **Decidir qual proposta implementar** (A ou B)
2. **Iniciar Fase 1** - Configuração do projeto
3. **Validar estrutura** com você antes de avançar
4. **Implementar incrementalmente** testando cada fase

---

*Documento gerado em: 10/10/2025*
*Versão: 2.0*




