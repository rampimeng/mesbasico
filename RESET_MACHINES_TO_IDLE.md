# Resetar Todas as Máquinas para Estado IDLE

## Problema
Máquinas estão iniciando com tempo contando automaticamente ao fazer login do operador.

## Causa
As máquinas no banco de dados podem estar com `status` diferente de `'IDLE'`, fazendo com que o timer inicie automaticamente.

## Solução

Execute o seguinte SQL no **Supabase SQL Editor**:

```sql
-- Resetar todas as máquinas para IDLE
UPDATE machines
SET
  status = 'IDLE',
  "currentOperatorId" = NULL,
  "updatedAt" = NOW()
WHERE status != 'IDLE';

-- Verificar o resultado
SELECT id, name, code, status, "currentOperatorId"
FROM machines
ORDER BY name;
```

## O que faz

1. **Reseta todas as máquinas** que não estão em IDLE para o estado IDLE
2. **Remove o operador atual** (`currentOperatorId = NULL`)
3. **Atualiza o timestamp** para refletir a mudança

## Como usar

1. Acesse o **Supabase Dashboard** → **SQL Editor**
2. Cole o SQL acima
3. Clique em **Run**
4. Verifique o resultado da segunda query (SELECT)
5. Todas as máquinas devem estar com `status = 'IDLE'` e `currentOperatorId = null`

## Depois de executar

- Faça logout do operador (se estiver logado)
- Faça login novamente
- Agora você deve ver o botão **"Iniciar Turno"** e as máquinas não devem estar contando tempo automaticamente
