# Instruções para Aplicar Migration no Servidor

## Migration: Add excludeFromPareto to StopReason

Esta migration adiciona o campo `excludeFromPareto` ao modelo `StopReason`, permitindo que certos motivos de parada não apareçam no gráfico de Pareto.

### ✅ CRIAÇÃO AUTOMÁTICA DO MOTIVO "TURNO ENCERRADO"

**IMPORTANTE:** O motivo "Turno Encerrado" é criado **AUTOMATICAMENTE** para cada empresa!

- ✅ Criado no primeiro login de qualquer usuário da empresa
- ✅ Pode ser obtido via endpoint `/api/production/sessions/shift-end-reason`
- ✅ Automaticamente marcado com `excludeFromPareto = true`
- ✅ Funciona para TODAS as empresas do sistema (multi-tenant)

**Você NÃO precisa criar manualmente!**

### Aplicar no Servidor (Easypanel)

1. **Execute a migration no banco de dados:**

   Acesse o painel do **Supabase** > SQL Editor e execute:
   ```sql
   ALTER TABLE "stop_reasons" ADD COLUMN "excludeFromPareto" BOOLEAN NOT NULL DEFAULT false;
   ```

2. **Reinicie o servidor backend:**
   ```bash
   # No Easypanel, faça um redeploy do serviço backend
   ```

3. **Pronto!**
   - O motivo "Turno Encerrado" será criado automaticamente no primeiro login
   - Funciona para todas as empresas
   - Sem necessidade de configuração manual

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
