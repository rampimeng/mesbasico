# ⚠️ IMPORTANTE: Como Obter a DATABASE_URL Correta do Supabase

## Problema Atual

O arquivo `server/.env` está com a URL errada:
```env
DATABASE_URL="https://hqogmroluzcrqcbzehob.supabase.co"
```

Isso é a URL do **projeto Supabase**, não a **connection string do PostgreSQL**!

## Solução: Obter a Connection String Correta

### Passo 1: Acessar o Supabase

1. Vá para: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto: **hqogmroluzcrqcbzehob**

### Passo 2: Ir para Database Settings

1. No menu lateral esquerdo, clique em **⚙️ Settings** (ícone de engrenagem)
2. Clique em **Database**

### Passo 3: Copiar a Connection String

1. Role a página até encontrar **"Connection string"** ou **"Connection pooling"**
2. Você verá várias abas: **URI**, **Session mode**, **Transaction mode**
3. Clique na aba **URI**
4. Copie a string completa (será algo assim):

```
postgresql://postgres.hqogmroluzcrqcbzehob:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Passo 4: Obter/Resetar a Senha

Se você vê `[YOUR-PASSWORD]` na string:

1. Na mesma página (Settings > Database)
2. Role até a seção **"Database password"** ou **"Reset database password"**
3. Clique em **"Reset database password"**
4. Copie a nova senha que será gerada

**OU** se você já sabe a senha, apenas a substitua no lugar de `[YOUR-PASSWORD]`.

### Passo 5: Montar a URL Completa

Pegue a string e substitua `[YOUR-PASSWORD]` pela senha real:

**ANTES:**
```
postgresql://postgres.hqogmroluzcrqcbzehob:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**DEPOIS (exemplo com senha "MinhaSenha123"):**
```
postgresql://postgres.hqogmroluzcrqcbzehob:MinhaSenha123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Passo 6: Atualizar o Arquivo .env

Abra o arquivo `C:\Users\tchuo\Desktop\MES2\server\.env` e cole a URL completa:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres.hqogmroluzcrqcbzehob:SuaSenhaAqui@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# JWT Configuration
JWT_SECRET=mes_saas_jwt_secret_development_only_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# WebSocket Configuration
WEBSOCKET_PORT=3002
```

## ✅ Como Saber se Está Correto?

A `DATABASE_URL` deve:
- ✅ Começar com `postgresql://`
- ✅ Conter `postgres.hqogmroluzcrqcbzehob` (seu projeto)
- ✅ Ter uma senha (NÃO `[YOUR-PASSWORD]`)
- ✅ Terminar com `.pooler.supabase.com:6543/postgres`

## 🖼️ Onde Encontrar no Supabase (Visual)

```
Supabase Dashboard
└── Settings (⚙️)
    └── Database
        └── Connection string
            └── [Selecione: URI]
                └── Copie a string completa
```

## Próximos Passos

Depois de configurar corretamente o `DATABASE_URL`:

```bash
cd C:\Users\tchuo\Desktop\MES2\server

# 1. Gerar Prisma Client
npm run prisma:generate

# 2. Executar migrações
npm run prisma:migrate

# 3. Popular dados
npm run prisma:seed

# 4. Iniciar servidor
npm run dev
```

---

**Precisa de ajuda?** Me avise quando tiver a connection string correta!
