# Verificações Necessárias no Supabase

## Problema Atual

O Prisma não consegue conectar ao banco de dados. Erro: "Can't reach database server"

## O que Verificar no Supabase

### 1. Ir para Database Settings

https://supabase.com/dashboard/project/hqogmroluzcrqcbzehob/settings/database

### 2. Procurar por "Connection Pooling"

Role a página e procure por uma seção chamada:
- **"Connection Pooling"**
- **"Pooler"**
- **"Session Pooling"**

### 3. Verificar se Connection Pooling está Habilitado

Se você encontrar uma opção para **habilitar** connection pooling, habilite!

### 4. Copiar a Connection String de Pooling

Procure por:
- **"Connection string"** na seção de Pooling
- Pode ter abas: **Session mode** e **Transaction mode**
- Copie a URI de **Session mode**

A string deve ser algo como:
```
postgresql://postgres.[ID-DO-PROJETO]:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres
```

**Exemplo:**
```
postgresql://postgres.hqogmroluzcrqcbzehob:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

### 5. Alternativa: Use Supavisor (Novo Pooler)

Se você não encontrar "Connection Pooling", procure por **"Supavisor"**.

O Supabase pode ter migrado para o novo pooler. A string seria:
```
postgresql://postgres.hqogmroluzcrqcbzehob:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

### 6. Verificar Network Restrictions

Ainda em **Settings > Database**, procure por:
- **"Network Restrictions"**
- **"Allowed IP addresses"**

Certifique-se de que não há restrições de IP ou que seu IP está na lista de permitidos.

---

## O que Me Enviar

Para eu te ajudar, me envie:

1. **A connection string que aparece na seção "Connection Pooling"** (pode ocultar a senha)
2. **Se Connection Pooling está habilitado ou não**
3. **Se há alguma restrição de rede ativa**

Exemplo do que enviar:
```
Connection Pooling: HABILITADO
String: postgresql://postgres.hqogmroluzcrqcbzehob:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
Network Restrictions: NENHUMA
```

---

## Solução Temporária: Supabase Studio

Enquanto isso, você pode usar o **Table Editor** do Supabase (no dashboard web) para criar as tabelas manualmente, mas é muito mais trabalhoso.

A melhor solução é conseguir conectar via Prisma!
