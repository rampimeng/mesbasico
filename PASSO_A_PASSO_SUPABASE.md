# 🚀 Guia Passo a Passo - Supabase Setup

## Etapa 1: Obter Credenciais do Supabase

### 1.1 Acessar o Dashboard do Supabase

1. Abra o navegador e vá para: https://supabase.com/dashboard
2. Faça login com sua conta
3. Selecione seu projeto (ou crie um novo se necessário)

### 1.2 Copiar a Connection String

1. No menu lateral esquerdo, clique em **⚙️ Settings**
2. Clique em **Database**
3. Role a página até encontrar a seção **Connection String**
4. Selecione a aba **URI**
5. Copie a string de conexão (ela será parecida com):

```
postgresql://postgres.[seu-projeto]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**⚠️ IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha real do seu banco de dados!

### 1.3 Encontrar a Senha do Banco

Se você não lembra a senha:
1. Na mesma página (Settings > Database)
2. Role até a seção **Database Password**
3. Você pode resetar a senha clicando em **Reset database password**
4. Copie a nova senha

## Etapa 2: Configurar o Arquivo .env

1. Abra o arquivo `server/.env`
2. Substitua a linha `DATABASE_URL` pela connection string do Supabase:

```env
DATABASE_URL="postgresql://postgres.abcxyz123:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

**Exemplo real:**
```env
DATABASE_URL="postgresql://postgres.refhqwjylzmjpjbbvqnm:MinhaSenha123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

3. Salve o arquivo

## Etapa 3: Executar Migrações

Agora vamos criar todas as tabelas no Supabase.

### 3.1 Abrir Terminal

1. Abra o terminal (PowerShell ou CMD)
2. Navegue até a pasta do servidor:

```bash
cd C:\Users\tchuo\Desktop\MES2\server
```

### 3.2 Gerar o Prisma Client

```bash
npm run prisma:generate
```

Você deverá ver uma mensagem de sucesso:
```
✔ Generated Prisma Client
```

### 3.3 Executar as Migrações

```bash
npm run prisma:migrate
```

Quando perguntado pelo nome da migração, digite:
```
initial_schema
```

Você deverá ver:
```
✔ Database synchronized with Prisma schema
✔ Created migration initial_schema
```

## Etapa 4: Popular o Banco com Dados Iniciais

Execute o script de seed:

```bash
npm run prisma:seed
```

Você verá o progresso:
```
🌱 Iniciando seed do banco de dados...
🧹 Limpando dados existentes...
✅ Dados limpos

👑 Criando usuário Master...
✅ Master criado: master@mes.com
   Senha: master123
   MFA: 123456

🏢 Criando empresa de demonstração...
✅ Empresa criada: Empresa Demo LTDA

👤 Criando usuário Admin...
✅ Admin criado: admin@empresa.com
   Senha: admin123

👨‍💼 Criando usuário Supervisor...
✅ Supervisor criado: supervisor@empresa.com
   Senha: super123

👷 Criando usuário Operador...
✅ Operador criado: operador@empresa.com
   Senha: oper123

📦 Criando grupos/células...
✅ Grupos criados: Célula Injeção, Célula Montagem

🛑 Criando motivos de parada...
✅ Motivos de parada criados: 7 itens

🏭 Criando máquinas...
✅ Máquinas criadas: Injetora 01, Injetora 02, Montadora 01

🔧 Criando matrizes...
✅ Matrizes criadas: 8 matrizes

🎉 Seed concluído com sucesso!
```

## Etapa 5: Verificar no Supabase

1. Volte ao Dashboard do Supabase
2. No menu lateral, clique em **📊 Table Editor**
3. Você deverá ver todas as tabelas criadas:
   - ✅ companies
   - ✅ users
   - ✅ groups
   - ✅ operator_groups
   - ✅ machines
   - ✅ matrices
   - ✅ stop_reasons
   - ✅ machine_activities
   - ✅ matrix_activities
   - ✅ audit_logs
   - ✅ pdca_plans
   - ✅ pdca_actions

4. Clique em qualquer tabela para ver os dados inseridos

## Etapa 6: Iniciar o Servidor Backend

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

## Etapa 7: Testar a API

Abra um novo terminal e teste:

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:
```json
{
  "success": true,
  "message": "MES SaaS API is running",
  "timestamp": "2025-01-15T10:30:45.123Z"
}
```

## Etapa 8: Testar Login

```bash
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@empresa.com\",\"password\":\"admin123\"}"
```

Você deverá receber um token JWT e os dados do usuário!

## 🎉 Sucesso!

Agora você tem:
- ✅ Backend conectado ao Supabase
- ✅ Banco de dados com todas as tabelas
- ✅ Dados iniciais populados
- ✅ Servidor rodando
- ✅ API funcionando

## 📧 Credenciais Criadas

Use estas credenciais para testar o sistema:

| Perfil | Email | Senha | MFA |
|--------|-------|-------|-----|
| **Master** | master@mes.com | master123 | 123456 |
| **Admin** | admin@empresa.com | admin123 | - |
| **Supervisor** | supervisor@empresa.com | super123 | - |
| **Operador** | operador@empresa.com | oper123 | - |

## 🔗 Links Úteis

- **Supabase Dashboard:** https://supabase.com/dashboard
- **API Health Check:** http://localhost:3001/api/health
- **Prisma Studio:** Execute `npm run prisma:studio` para abrir

## 🆘 Precisa de Ajuda?

Se algo der errado, consulte o arquivo `SUPABASE_SETUP.md` para troubleshooting.

---

**Próximo Passo:** Conectar o frontend ao backend!
