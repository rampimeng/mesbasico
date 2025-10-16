# Como Obter a Connection String Correta do Supabase

## Passo a Passo Visual

### 1. Acesse o Supabase Dashboard

Vá para: https://supabase.com/dashboard/project/hqogmroluzcrqcbzehob

### 2. Vá para Database Settings

1. No menu lateral esquerdo, clique no ícone de **⚙️ Settings** (engrenagem)
2. Clique em **Database**

### 3. Encontre a Session String (Connection Pooling)

Role a página até encontrar a seção **Connection Info** ou **Connection Pooling**.

Você verá várias opções. Procure por:

**"Connection string"** ou **"URI"**

### 4. Copie a String EXATA

A string terá um destes formatos:

**Opção 1: Session pooling (preferencial)**
```
postgresql://postgres.hqogmroluzcrqcbzehob:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

**Opção 2: Transaction pooling**
```
postgresql://postgres.hqogmroluzcrqcbzehob:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 5. Substitua [YOUR-PASSWORD]

Substitua `[YOUR-PASSWORD]` pela sua senha: `Guigas2812@`

**ATENÇÃO à senha:**
- Se sua senha tiver caracteres especiais como `@`, você precisa fazer URL encoding
- `@` vira `%40`

Então `Guigas2812@` vira `Guigas2812%40`

### 6. URL Final

A URL final deve ficar assim:

```
postgresql://postgres.hqogmroluzcrqcbzehob:Guigas2812%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

**OU** (se for transaction mode):

```
postgresql://postgres.hqogmroluzcrqcbzehob:Guigas2812%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Verificar a Região Correta

A região pode ser:
- `aws-0-us-east-1` (EUA Leste)
- `aws-0-sa-east-1` (Brasil/São Paulo)
- `aws-0-eu-west-1` (Europa)
- `aws-0-ap-southeast-1` (Ásia)

Copie exatamente como aparece no Supabase!

## Teste Rápido

Depois de atualizar o `.env`, teste:

```bash
cd server
npx prisma db pull
```

Se conectar com sucesso, você verá: "Introspecting based on your database..."

---

**Dica**: Se ainda não funcionar, me envie uma screenshot da página de Connection String do Supabase que eu te ajudo!
