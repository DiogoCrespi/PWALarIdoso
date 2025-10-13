-- CreateTable
CREATE TABLE "notas_fiscais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroNFSE" TEXT,
    "dataPrestacao" DATETIME,
    "discriminacao" TEXT,
    "valor" REAL,
    "nomePessoa" TEXT,
    "idosoId" INTEGER NOT NULL,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "arquivoOriginal" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "pagamentoId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notas_fiscais_idosoId_fkey" FOREIGN KEY ("idosoId") REFERENCES "idosos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notas_fiscais_pagamentoId_fkey" FOREIGN KEY ("pagamentoId") REFERENCES "pagamentos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
