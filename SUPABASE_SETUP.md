# Configuração do Supabase para MES SaaS

## 📋 Passo a Passo

### 1. Obter Credenciais do Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione seu projeto ou crie um novo
4. No menu lateral, clique em **Settings** (ícone de engrenagem)
5. Clique em **Database**
6. Role até a seção **Connection String**
7. Copie a **Connection String** no modo **URI**

A string de conexão terá este formato:
```
postgresql://postgres.[projeto-id]:[senha]@aws-0-[regiao].pooler.supabase.com:6543/postgres
```

**IMPORTANTE:** Você precisará substituir `[senha]` pela senha do seu projeto Supabase.

### 2. Configurar o Backend

Abra o arquivo `server/.env` e atualize a variável `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres.[seu-projeto]:[sua-senha]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

**Exemplo real:**
```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:SuaSenhaAqui123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

### 3. Instalar Dependências (se ainda não fez)

```bash
cd server
npm install
```

### 4. Executar Migrações do Prisma

Isso criará todas as tabelas no Supabase:

```bash
cd server
npm run prisma:migrate
```

Quando perguntado pelo nome da migração, pode usar: `initial_schema`

### 5. Gerar Prisma Client

```bash
npm run prisma:generate
```

### 6. Verificar no Supabase

1. Volte ao dashboard do Supabase
2. Clique em **Table Editor** no menu lateral
3. Você deverá ver todas as tabelas criadas:
   - companies
   - users
   - groups
   - machines
   - matrices
   - stop_reasons
   - machine_activities
   - matrix_activities
   - audit_logs
   - pdca_plans
   - pdca_actions
   - operator_groups

### 7. Iniciar o Servidor

```bash
npm run dev
```

Você deverá ver:
```
✅ Database connected successfully
🚀 Server is running on port 3001
📝 Environment: development
🌐 API URL: http://localhost:3001/api
🏥 Health check: http://localhost:3001/api/health
```

## ✅ Testar a Conexão

Execute este comando para verificar se a API está funcionando:

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:
```json
{
  "success": true,
  "message": "MES SaaS API is running",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## 🔧 Troubleshooting

### Erro: "Can't reach database server"

**Problema:** A URL de conexão está incorreta ou o Supabase está bloqueando a conexão.

**Solução:**
1. Verifique se a URL está correta no `.env`
2. Certifique-se de que substituiu `[senha]` pela senha real
3. No Supabase, vá em Settings > Database > Connection Pooling e verifique se está habilitado

### Erro: "password authentication failed"

**Problema:** A senha está incorreta.

**Solução:**
1. Verifique a senha no Supabase em Settings > Database
2. Se necessário, resete a senha do banco de dados
3. Atualize o `.env` com a nova senha

### Erro: "SSL connection is required"

**Problema:** O Supabase requer conexão SSL.

**Solução:**
Adicione `?sslmode=require` no final da `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres.xxx:senha@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Erro: "Migration failed"

**Problema:** Pode haver tabelas já existentes.

**Solução:**
1. No Supabase, vá em SQL Editor
2. Execute: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Execute as migrações novamente

## 📊 Verificar Tabelas no Supabase

Você pode usar o **Table Editor** do Supabase ou executar SQL diretamente:

1. Acesse: Supabase Dashboard > SQL Editor
2. Execute:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deverá ver todas as 12 tabelas criadas.

## 🎯 Próximo Passo: Popular Dados Iniciais

Após as tabelas estarem criadas, precisamos criar dados iniciais:
- Usuário Master
- Empresa de demonstração
- Usuário Admin da empresa
- Dados de exemplo

Vou criar um script de seed para isso.

---

**Dica:** O Supabase tem uma interface visual muito boa para gerenciar o banco de dados. Use o **Table Editor** para visualizar e editar dados durante o desenvolvimento!
