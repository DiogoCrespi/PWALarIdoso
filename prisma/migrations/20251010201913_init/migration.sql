-- CreateTable
CREATE TABLE "responsaveis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "contatoTelefone" TEXT,
    "contatoEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "idosos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "dataNascimento" DATETIME,
    "responsavelId" INTEGER NOT NULL,
    "valorMensalidadeBase" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "idosos_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "responsaveis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idosoId" INTEGER NOT NULL,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "valorPago" REAL NOT NULL DEFAULT 0,
    "dataPagamento" DATETIME,
    "nfse" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "valorDoacaoCalculado" REAL NOT NULL DEFAULT 0,
    "caminhoReciboDoacao" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pagamentos_idosoId_fkey" FOREIGN KEY ("idosoId") REFERENCES "idosos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_cpf_key" ON "responsaveis"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "idosos_cpf_key" ON "idosos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_idosoId_mesReferencia_anoReferencia_key" ON "pagamentos"("idosoId", "mesReferencia", "anoReferencia");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");
