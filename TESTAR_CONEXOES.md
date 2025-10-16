# Teste Estas Connection Strings

Copie e cole no arquivo `server/.env` (uma de cada vez) para testar:

## Opção 1: Session Mode + Senha Encodada + Região Brasil

```env
DATABASE_URL="postgresql://postgres.hqogmroluzcrqcbzehob:Guigas2812%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

## Opção 2: Transaction Mode + Senha Encodada + Região Brasil

```env
DATABASE_URL="postgresql://postgres.hqogmroluzcrqcbzehob:Guigas2812%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## Opção 3: Session Mode + Senha Encodada + Região EUA

```env
DATABASE_URL="postgresql://postgres.hqogmroluzcrqcbzehob:Guigas2812%40@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

## Opção 4: Direct Connection (não recomendado mas pode testar)

```env
DATABASE_URL="postgresql://postgres:Guigas2812%40@db.hqogmroluzcrqcbzehob.supabase.co:5432/postgres"
```

---

## Como Testar

Depois de copiar uma das opções acima para `server/.env`, execute:

```bash
cd server
npm run prisma:migrate
```

Se funcionar, você verá:
```
Applying migration `20250116_initial_schema`
✔ Applied migration 20250116_initial_schema
```

Se não funcionar, teste a próxima opção!

---

## Verificar no Supabase

A forma mais fácil é:

1. Ir em: https://supabase.com/dashboard/project/hqogmroluzcrqcbzehob/settings/database
2. Copiar EXATAMENTE a "Connection string" que aparece lá
3. Substituir [YOUR-PASSWORD] por: `Guigas2812%40` (com o @ encodado)

---

**Qual funcionou?** Me avise que eu atualizo o arquivo `.env` com a correta!
