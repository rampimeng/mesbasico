# Setup do Backend - MES SaaS

## ✅ O que foi implementado

### Estrutura Completa do Backend

1. **Node.js + Express + TypeScript**
   - Servidor Express configurado
   - TypeScript com strict mode
   - Hot reload com nodemon

2. **Banco de Dados PostgreSQL**
   - Schema Prisma completo com todas as entidades
   - Suporte multi-tenant
   - Relacionamentos configurados
   - Índices otimizados

3. **Autenticação e Segurança**
   - JWT tokens
   - Hash de senhas com bcrypt
   - Middleware de autenticação
   - Middleware de autorização por perfil
   - Segregação de dados por empresa

4. **Estrutura de Código**
   - Controllers organizados
   - Middlewares reutilizáveis
   - Utils para operações comuns
   - Error handling centralizado
   - Request logging

## 🚀 Como Executar

### 1. Instalar PostgreSQL

**Windows:**
- Baixe em: https://www.postgresql.org/download/windows/
- Instale com senha padrão: `postgres`

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql
sudo service postgresql start
```

### 2. Criar o Banco de Dados

```bash
# Acessar PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE mes_saas;

# Sair
\q
```

### 3. Instalar Dependências do Backend

```bash
cd server
npm install
```

### 4. Configurar Variáveis de Ambiente

O arquivo `.env` já está criado em `server/.env` com as configurações padrão:

```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mes_saas?schema=public"
JWT_SECRET=mes_saas_jwt_secret_development_only_change_in_production
```

**IMPORTANTE:** Se sua senha do PostgreSQL for diferente de `postgres`, edite o `DATABASE_URL` no arquivo `.env`.

### 5. Executar Migrações do Prisma

```bash
cd server
npm run prisma:migrate
```

Isso criará todas as tabelas no banco de dados.

### 6. Gerar Prisma Client

```bash
npm run prisma:generate
```

### 7. Iniciar o Servidor

```bash
npm run dev
```

O servidor estará disponível em: **http://localhost:3001**

## 📡 Testando a API

### Health Check

```bash
curl http://localhost:3001/api/health
```

Resposta:
```json
{
  "success": true,
  "message": "MES SaaS API is running",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Login (Teste)

Você precisará primeiro criar um usuário no banco de dados. Para desenvolvimento, você pode usar o Prisma Studio:

```bash
cd server
npm run prisma:studio
```

Isso abrirá uma interface web em `http://localhost:5555` onde você pode criar usuários manualmente.

Ou você pode executar este SQL no PostgreSQL:

```sql
-- Criar empresa
INSERT INTO companies (id, name, cnpj, email, "contactName", "contactPhone", "dashboardToken", active, "createdAt", "updatedAt")
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'Empresa Demo LTDA',
  '12.345.678/0001-90',
  'contato@empresademo.com',
  'João Silva',
  '(11) 98765-4321',
  'dash_demo_token_123',
  true,
  NOW(),
  NOW()
);

-- Criar usuário admin (senha: admin123)
INSERT INTO users (id, "companyId", name, email, password, role, active, "mfaEnabled", "createdAt", "updatedAt")
VALUES (
  'u1111111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'Admin User',
  'admin@empresa.com',
  '$2b$10$YourHashedPasswordHere',  -- Você precisa gerar o hash
  'ADMIN',
  true,
  false,
  NOW(),
  NOW()
);
```

Para gerar o hash da senha, você pode usar este código Node.js temporário:

```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

Depois faça login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "admin123"
  }'
```

## 📊 Modelo de Dados (Principais Entidades)

```
Companies (Empresas)
├── Users (Usuários)
├── Groups (Células/Grupos)
│   ├── Machines (Máquinas)
│   │   └── Matrices (Matrizes)
│   └── OperatorGroups (Vinculação Operador-Grupo)
├── StopReasons (Motivos de Parada)
├── MachineActivities (Histórico de Máquinas)
├── MatrixActivities (Histórico de Matrizes)
├── AuditLogs (Logs de Auditoria)
└── PdcaPlans (Planos PDCA)
    └── PdcaActions (Ações PDCA)
```

## 🔑 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (requer autenticação)
- `GET /api/auth/me` - Dados do usuário (requer autenticação)

### Health
- `GET /api/health` - Status da API

## 🛠️ Ferramentas Úteis

### Prisma Studio
Interface visual para o banco de dados:
```bash
cd server
npm run prisma:studio
```

### Ver Logs do Servidor
Os logs aparecem automaticamente no terminal onde você executou `npm run dev`.

### Build para Produção
```bash
cd server
npm run build
npm start
```

## 📝 Próximos Passos

Para completar o backend, você precisa implementar:

1. **CRUD de Empresas** (Master)
   - Controllers, routes, services

2. **CRUD de Usuários** (Admin)
   - Criar, editar, desativar usuários

3. **CRUD de Máquinas** (Admin)
   - Gerenciar máquinas e matrizes

4. **API de Controle** (Operador)
   - Iniciar/parar máquinas
   - Controlar matrizes
   - Registrar ciclos

5. **API de Dashboard** (Supervisor/Admin)
   - Métricas em tempo real
   - Gráfico de Pareto
   - Relatórios

6. **WebSocket**
   - Espelhamento em tempo real
   - Notificações push

7. **Seed do Banco de Dados**
   - Script para popular dados iniciais

## ❓ Troubleshooting

### "Database does not exist"
Execute: `psql -U postgres -c "CREATE DATABASE mes_saas;"`

### "Password authentication failed"
Verifique a senha no `DATABASE_URL` do arquivo `.env`

### "Port 3001 already in use"
Mude o `PORT` no `.env` para outra porta disponível

### "Module not found"
Execute: `cd server && npm install`

---

**Backend criado com Node.js + Express + TypeScript + PostgreSQL + Prisma**
