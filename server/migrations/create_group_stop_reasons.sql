-- Migration: Adiciona tabela de relacionamento entre grupos e motivos de parada
-- Data: 2025-10-28
-- Descrição: Permite vincular motivos de parada específicos a cada célula/grupo

-- Criar tabela de relacionamento many-to-many
CREATE TABLE IF NOT EXISTS group_stop_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "groupId" UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    "stopReasonId" UUID NOT NULL REFERENCES stop_reasons(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Garantir que não haja duplicatas
    UNIQUE("groupId", "stopReasonId")
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_group_stop_reasons_group_id ON group_stop_reasons("groupId");
CREATE INDEX IF NOT EXISTS idx_group_stop_reasons_stop_reason_id ON group_stop_reasons("stopReasonId");

-- Comentários para documentação
COMMENT ON TABLE group_stop_reasons IS 'Relacionamento many-to-many entre grupos/células e motivos de parada';
COMMENT ON COLUMN group_stop_reasons."groupId" IS 'ID do grupo/célula';
COMMENT ON COLUMN group_stop_reasons."stopReasonId" IS 'ID do motivo de parada';
