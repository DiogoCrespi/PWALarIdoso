# Sistema de Controle - Lar dos Idosos

Aplicação desktop para controle de pagamentos, geração de recibos e gerenciamento de idosos e responsáveis.

## 🚀 Tecnologias

- **Electron** - Framework para aplicação desktop
- **React** - Interface de usuário
- **TypeScript** - Tipagem estática
- **Material-UI** - Componentes visuais
- **SQLite** - Banco de dados local
- **Prisma** - ORM para banco de dados
- **DOCX** - Geração de documentos Word

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🔧 Instalação

1. Instalar dependências:
```bash
npm install
```

2. Gerar cliente do Prisma:
```bash
npm run prisma:generate
```

3. Criar banco de dados e rodar migrations:
```bash
npm run prisma:migrate
```

4. Popular banco com dados iniciais (configurações):
```bash
npm run prisma:seed
```

## 🎮 Como Usar

### Desenvolvimento

Rodar em modo desenvolvimento:
```bash
npm run electron:dev
```

### Produção

Criar executável:
```bash
npm run electron:build
```

O instalador será gerado na pasta `release/`.

## 📁 Estrutura do Projeto

```
PWALarIdosos/
├── electron/              # Código do Electron (backend)
│   ├── main.ts           # Processo principal
│   ├── preload.ts        # Bridge seguro
│   └── ipc-handlers/     # Handlers da API interna
├── src/                  # Código React (frontend)
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── stores/           # Gerenciamento de estado
│   └── styles/           # Estilos e tema
├── prisma/               # Schema e migrations do banco
├── database/             # Arquivo SQLite gerado
└── public/               # Arquivos estáticos
```

## ✨ Funcionalidades

- ✅ Dashboard visual com grid colorido (verde/vermelho/laranja)
- ✅ Cadastro de idosos e responsáveis
- ✅ Controle de pagamentos mensais
- ✅ Status: PAGO, PARCIAL, PENDENTE
- ✅ Geração automática de recibos de doação (DOCX)
- ✅ Salvamento em pastas de rede
- ✅ Cálculo automático de doações

## 🎨 Cores de Status

- 🟢 **Verde** (#4caf50) - Pago
- 🟠 **Laranja** (#ff9800) - Parcial
- 🔴 **Vermelho** (#f44336) - Pendente

## 📝 Banco de Dados

O sistema usa SQLite com arquivo local em `database/lar_idosos.db`.

Para visualizar o banco:
```bash
npm run prisma:studio
```

## 🔒 Backup

Para fazer backup, basta copiar o arquivo:
- `database/lar_idosos.db`

Para restaurar, basta colar de volta na pasta `database/`.

## 🛠️ Configurações

As configurações são armazenadas no banco de dados (tabela `configuracoes`).

Principais configurações:
- `caminho_recibos_doacao` - Pasta onde salvar recibos de doação
- `caminho_recibos_mensalidade` - Pasta onde salvar recibos de mensalidade
- `nome_instituicao` - Nome da instituição
- `cnpj_instituicao` - CNPJ da instituição

## 📄 Licença

Uso interno - Lar dos Idosos




