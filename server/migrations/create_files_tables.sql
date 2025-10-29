-- Migration: Cria tabelas para gerenciamento de arquivos PDF
-- Data: 2025-10-28
-- Descrição: Permite que administradores compartilhem arquivos PDF com operadores
--            filtrando por células/grupos

-- Tabela de arquivos
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" VARCHAR(100) DEFAULT 'application/pdf',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de relacionamento many-to-many entre arquivos e grupos/células
CREATE TABLE IF NOT EXISTS file_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "fileId" UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    "groupId" UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Garantir que não haja duplicatas
    UNIQUE("fileId", "groupId")
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_files_company_id ON files("companyId");
CREATE INDEX IF NOT EXISTS idx_file_groups_file_id ON file_groups("fileId");
CREATE INDEX IF NOT EXISTS idx_file_groups_group_id ON file_groups("groupId");

-- Comentários para documentação
COMMENT ON TABLE files IS 'Arquivos PDF compartilhados com operadores';
COMMENT ON COLUMN files."companyId" IS 'ID da empresa proprietária do arquivo';
COMMENT ON COLUMN files.name IS 'Nome do arquivo';
COMMENT ON COLUMN files.description IS 'Descrição opcional do arquivo';
COMMENT ON COLUMN files."fileUrl" IS 'URL/caminho do arquivo armazenado';
COMMENT ON COLUMN files."fileSize" IS 'Tamanho do arquivo em bytes';

COMMENT ON TABLE file_groups IS 'Relacionamento many-to-many entre arquivos e células/grupos';
COMMENT ON COLUMN file_groups."fileId" IS 'ID do arquivo';
COMMENT ON COLUMN file_groups."groupId" IS 'ID do grupo/célula';
