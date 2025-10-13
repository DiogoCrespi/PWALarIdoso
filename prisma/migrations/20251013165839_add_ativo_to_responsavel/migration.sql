-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_responsaveis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "contatoTelefone" TEXT,
    "contatoEmail" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_responsaveis" ("contatoEmail", "contatoTelefone", "cpf", "createdAt", "id", "nome", "updatedAt") SELECT "contatoEmail", "contatoTelefone", "cpf", "createdAt", "id", "nome", "updatedAt" FROM "responsaveis";
DROP TABLE "responsaveis";
ALTER TABLE "new_responsaveis" RENAME TO "responsaveis";
CREATE UNIQUE INDEX "responsaveis_cpf_key" ON "responsaveis"("cpf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
