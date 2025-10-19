# Adicionar Coluna ignoreInPareto na Tabela stop_reasons

## Instruções

Execute o seguinte SQL no **Supabase SQL Editor**:

```sql
-- Adicionar coluna ignoreInPareto na tabela stop_reasons
ALTER TABLE stop_reasons
ADD COLUMN IF NOT EXISTS "ignoreInPareto" BOOLEAN DEFAULT false;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'stop_reasons'
  AND column_name = 'ignoreInPareto';
```

## O que faz

- Adiciona uma coluna booleana `ignoreInPareto` na tabela `stop_reasons`
- Valor padrão é `false` (motivo aparece no Pareto)
- Se o valor for `true`, o motivo será registrado mas **não aparecerá no gráfico de Pareto**

## Como usar

1. Acesse o **Supabase Dashboard** → **SQL Editor**
2. Cole o SQL acima
3. Clique em **Run**
4. Verifique se a coluna foi criada com sucesso

## Depois de executar

Depois de executar o SQL, você poderá:

1. Cadastrar/editar motivos de parada no admin
2. Marcar o checkbox "Ignorar no Gráfico de Pareto"
3. Esses motivos serão registrados normalmente
4. Mas não aparecerão no gráfico de Pareto de análise

## Casos de uso

Motivos que podem ser ignorados no Pareto:
- **Parada programada** (almoço, lanche, reunião)
- **Manutenção preventiva programada**
- **Setup/troca de produto** (se não for considerado perda)
- **Outros motivos que não são problemas a serem resolvidos**
