-- Migration: Adiciona campo 'active' na tabela machines
-- Data: 2025-10-28
-- Descrição: Permite ativar/inativar máquinas. Máquinas inativas não aparecem para operadores,
--            não contabilizam em relatórios, dashboard e auditoria.

-- Adicionar coluna 'active' com valor padrão TRUE
ALTER TABLE machines
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Criar índice para melhorar performance de queries que filtram por active
CREATE INDEX IF NOT EXISTS idx_machines_active ON machines(active);

-- Comentário para documentação
COMMENT ON COLUMN machines.active IS 'Indica se a máquina está ativa. Máquinas inativas não aparecem em relatórios e para operadores';
