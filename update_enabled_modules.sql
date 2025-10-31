-- Script para atualizar o campo enabledModules nas empresas existentes
-- Execute este script após executar a migration do Prisma

-- Opção 1: Adicionar o campo vazio (empresas começam sem módulos habilitados)
-- UPDATE companies
-- SET "enabledModules" = '[]'::jsonb
-- WHERE "enabledModules" IS NULL;

-- Opção 2: Habilitar o módulo MES por padrão para todas as empresas existentes
-- (Recomendado para não bloquear usuários existentes)
UPDATE companies
SET "enabledModules" = '["MES"]'::jsonb
WHERE "enabledModules" IS NULL OR "enabledModules"::text = '[]';

-- Verificar o resultado
SELECT id, name, "enabledModules", active
FROM companies
ORDER BY name;
