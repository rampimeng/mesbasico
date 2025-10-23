# 🔧 Instruções de Migração: Adicionar Turno aos Grupos/Células

## ⚠️ Problema Identificado

Ao tentar criar uma nova célula/grupo, o sistema retorna o erro:

```
Could not find the 'shiftId' column of 'groups' in the schema cache
```

**Causa**: A coluna `shiftId` não existe na tabela `groups` do banco de dados Supabase.

---

## ✅ Solução: Aplicar Migração SQL

### Passo 1: Acessar o Supabase SQL Editor

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New query** para criar uma nova consulta

### Passo 2: Executar o Script de Migração

Copie e cole o seguinte SQL no editor e clique em **Run**:

```sql
-- ========================================
-- MIGRAÇÃO: Adicionar shiftId à tabela groups
-- ========================================

-- 1. Adicionar coluna shiftId (UUID opcional)
ALTER TABLE "groups"
ADD COLUMN IF NOT EXISTS "shiftId" UUID;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS "groups_shiftId_idx" ON "groups"("shiftId");

-- 3. Adicionar foreign key constraint
ALTER TABLE "groups"
DROP CONSTRAINT IF EXISTS "groups_shiftId_fkey";

ALTER TABLE "groups"
ADD CONSTRAINT "groups_shiftId_fkey"
FOREIGN KEY ("shiftId")
REFERENCES "shifts"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
```

### Passo 3: Verificar a Migração

Execute o seguinte SQL para confirmar que a coluna foi criada:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'groups'
ORDER BY ordinal_position;
```

**Resultado esperado**: Você deve ver uma linha com:
- `column_name`: shiftId
- `data_type`: uuid
- `is_nullable`: YES

---

## 🎯 O que esta migração faz?

1. **Adiciona a coluna `shiftId`** à tabela `groups`
   - Tipo: UUID (identificador único)
   - Nullable: SIM (opcional - células podem não ter turno)

2. **Cria um índice** para melhorar performance de consultas que filtram por turno

3. **Adiciona constraint de chave estrangeira** para garantir que:
   - Apenas IDs de turnos válidos podem ser vinculados
   - Se um turno for deletado, o `shiftId` nas células é automaticamente definido como `NULL`

---

## 📋 Após Aplicar a Migração

1. **Reinicie o servidor backend** (se estiver rodando localmente)
2. **Teste criar uma nova célula/grupo** no painel de Administração
3. **Selecione um turno** no dropdown (opcional)
4. **Salve** - a célula deve ser criada com sucesso

---

## 🔍 Solução de Problemas

### Erro: "relation 'shifts' does not exist"

Se você receber este erro, significa que a tabela `shifts` também precisa ser criada primeiro.

Execute esta migração ANTES da migração de grupos:

```sql
-- Criar tabela de turnos
CREATE TABLE IF NOT EXISTS "shifts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "startTime" TIME NOT NULL,
  "lunchTime" INTEGER NOT NULL DEFAULT 0,
  "endTime" TIME NOT NULL,
  "totalHours" DECIMAL(4,2) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "shifts_companyId_idx" ON "shifts"("companyId");
```

### Erro: "constraint already exists"

Isso é normal se você executar a migração mais de uma vez. O script usa `IF NOT EXISTS` e `DROP CONSTRAINT IF EXISTS` para ser idempotente (pode ser executado múltiplas vezes sem causar erros).

---

## 📝 Arquivo de Migração

O script SQL completo está disponível em:
```
server/migrations/APPLY_SHIFT_TO_GROUPS.sql
```

---

## ✅ Checklist Pós-Migração

- [ ] Migração executada no Supabase SQL Editor
- [ ] Coluna `shiftId` verificada na tabela `groups`
- [ ] Servidor backend reiniciado
- [ ] Teste de criação de célula bem-sucedido
- [ ] Células podem ser criadas COM turno selecionado
- [ ] Células podem ser criadas SEM turno selecionado

---

## 💡 Recursos Adicionais

- **Supabase Docs**: https://supabase.com/docs/guides/database/tables
- **PostgreSQL ALTER TABLE**: https://www.postgresql.org/docs/current/sql-altertable.html

---

**Data da Migração**: 23/01/2025
**Versão**: 1.0
**Status**: Pronto para aplicação
