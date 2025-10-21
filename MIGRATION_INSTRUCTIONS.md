# Instruções para Aplicar Migration no Servidor

## Migration: Add excludeFromPareto to StopReason

Esta migration adiciona o campo `excludeFromPareto` ao modelo `StopReason`, permitindo que certos motivos de parada não apareçam no gráfico de Pareto.

### Aplicar no Servidor (Easypanel)

1. **Conecte-se ao servidor via SSH:**
   ```bash
   ssh user@your-server
   ```

2. **Execute a migration manualmente no banco de dados:**

   Você pode fazer isso de duas formas:

   **Opção A: Via Prisma (Recomendado)**
   ```bash
   cd /path/to/your/app/server
   npx prisma migrate deploy
   ```

   **Opção B: Via SQL direto no Supabase**
   - Acesse o painel do Supabase
   - Vá em SQL Editor
   - Execute o seguinte SQL:
   ```sql
   ALTER TABLE "stop_reasons" ADD COLUMN "excludeFromPareto" BOOLEAN NOT NULL DEFAULT false;
   ```

3. **Criar o motivo de parada "Turno Encerrado":**

   No painel do Admin da aplicação:
   - Vá em **Cadastros > Motivos de Parada**
   - Clique em "Novo Motivo"
   - Preencha:
     - **Nome:** Turno Encerrado
     - **Categoria:** OTHER
     - **Descrição:** Parada automática ao encerrar turno
     - **Excluir do Pareto:** ✅ (marcar como true)

   OU execute este SQL no Supabase:
   ```sql
   INSERT INTO "stop_reasons" ("id", "companyId", "name", "category", "description", "excludeFromPareto", "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'YOUR_COMPANY_ID', -- Substitua pelo ID da sua empresa
     'Turno Encerrado',
     'OTHER',
     'Parada automática ao encerrar turno do operador',
     true,
     NOW(),
     NOW()
   );
   ```

4. **Reinicie o servidor backend:**
   ```bash
   # No Easypanel, faça um redeploy do serviço backend
   ```

## Mudanças Implementadas

### 1. **Schema do Banco de Dados**
- Adicionado campo `excludeFromPareto` (Boolean) ao modelo `StopReason`
- Default: `false` (motivos aparecem no Pareto por padrão)

### 2. **Backend (Analytics Controller)**
- Atualizado para filtrar motivos com `excludeFromPareto = true` do gráfico de Pareto
- Motivos excluídos ainda aparecem nas métricas de tempo total

### 3. **Frontend (Tela do Operador)**

#### Botão "EMERGÊNCIA" → "PAUSA GERAL"
- Renomeado de "EMERGÊNCIA" para "PAUSA GERAL"
- Comportamento permanece o mesmo: para todas as máquinas com um motivo selecionado

#### Botão "Iniciar Turno" → "Encerrar Turno"
- **Antes:** Botão "Iniciar Turno" ficava desabilitado quando todas as máquinas estavam rodando
- **Agora:**
  - Quando o turno NÃO está ativo: mostra "Iniciar Turno" ✅
  - Quando o turno ESTÁ ativo: mostra "Encerrar Turno" 🔴

#### Lógica de "Encerrar Turno"
- Para todas as máquinas ativas
- Registra o motivo "Turno Encerrado" automaticamente
- Esse motivo NÃO aparece no Pareto (excludeFromPareto = true)
- Reseta o timer de turno

## Teste as Mudanças

1. **Faça login como Operador**
2. **Clique em "Iniciar Turno"**
   - Todas as máquinas devem iniciar
   - Botão deve mudar para "Encerrar Turno"
3. **Clique em "Encerrar Turno"**
   - Todas as máquinas devem parar
   - Motivo registrado: "Turno Encerrado"
   - Timer de turno deve zerar
4. **Acesse o Dashboard (Admin/Supervisor)**
   - Verifique se o motivo "Turno Encerrado" NÃO aparece no Pareto
   - Mas deve aparecer nas métricas de tempo total

## Rollback (Se Necessário)

Se algo der errado, você pode reverter a migration:

```sql
ALTER TABLE "stop_reasons" DROP COLUMN "excludeFromPareto";
```

**Nota:** Isso removerá a funcionalidade de exclusão do Pareto.
