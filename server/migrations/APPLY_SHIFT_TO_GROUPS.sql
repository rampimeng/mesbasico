-- ========================================
-- MIGRAÇÃO: Adicionar shiftId à tabela groups
-- ========================================
-- Data: 2025-01-23
-- Descrição: Adiciona suporte para vincular grupos/células a turnos de trabalho
-- Status: PENDENTE DE APLICAÇÃO
-- ========================================

-- IMPORTANTE: Execute este script diretamente no Supabase SQL Editor
-- ou use o comando: psql -h [host] -U [user] -d [database] -f APPLY_SHIFT_TO_GROUPS.sql

-- 1. Adicionar coluna shiftId (UUID opcional)
ALTER TABLE "groups"
ADD COLUMN IF NOT EXISTS "shiftId" UUID;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS "groups_shiftId_idx" ON "groups"("shiftId");

-- 3. Adicionar foreign key constraint para garantir integridade referencial
-- Nota: Se houver shiftIds inválidos na tabela, esta etapa falhará
ALTER TABLE "groups"
DROP CONSTRAINT IF EXISTS "groups_shiftId_fkey";

ALTER TABLE "groups"
ADD CONSTRAINT "groups_shiftId_fkey"
FOREIGN KEY ("shiftId")
REFERENCES "shifts"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 4. Verificar o resultado
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'groups'
ORDER BY ordinal_position;

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- A tabela "groups" deve ter a coluna "shiftId" do tipo UUID, nullable
-- O índice "groups_shiftId_idx" deve existir
-- A constraint "groups_shiftId_fkey" deve estar ativa
-- ========================================
