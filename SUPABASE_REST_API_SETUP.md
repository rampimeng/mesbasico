# Setup Supabase REST API - Passo a Passo

## Etapa 1: Obter Credenciais da API

### 1.1 Acessar API Settings

1. Vá para: https://supabase.com/dashboard/project/hqogmroluzcrqcbzehob/settings/api
2. Você verá a página de configurações da API

### 1.2 Copiar as Credenciais

Você verá 3 informações importantes:

**Project URL:**
```
https://hqogmroluzcrqcbzehob.supabase.co
```

**anon public (Chave Pública):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb2dtcm9sdXpjcnFjYnplaG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU2MTk...
```

**service_role (Chave Secreta - NÃO EXPOR):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb2dtcm9sdXpjcnFjYnplaG9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNTYxOT...
```

### 1.3 Atualizar o arquivo .env

Abra `server/.env` e cole as chaves:

```env
# Supabase Configuration
SUPABASE_URL=https://hqogmroluzcrqcbzehob.supabase.co
SUPABASE_ANON_KEY=eyJhbGci... (cole a chave anon completa aqui)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (cole a service_role completa aqui)
```

---

## Etapa 2: Criar Tabelas no Supabase

Como a conexão direta PostgreSQL não está funcionando, vamos criar as tabelas pelo **SQL Editor** do Supabase.

### 2.1 Acessar SQL Editor

1. Vá para: https://supabase.com/dashboard/project/hqogmroluzcrqcbzehob/sql/new
2. Você verá um editor SQL

### 2.2 Executar SQL de Criação

Cole e execute o SQL abaixo (em blocos, se necessário):

```sql
-- Criar tabela companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "contactPhone" TEXT NOT NULL,
  "logoUrl" TEXT,
  "dashboardToken" TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Criar tabela users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('MASTER', 'ADMIN', 'SUPERVISOR', 'OPERATOR')),
  active BOOLEAN DEFAULT true,
  "mfaEnabled" BOOLEAN DEFAULT false,
  "mfaSecret" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_company ON users("companyId");
CREATE INDEX idx_users_email ON users(email);

-- Criar tabela groups
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "expectedCyclesPerShift" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_groups_company ON groups("companyId");

-- Criar tabela operator_groups
CREATE TABLE operator_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "groupId" UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "groupId")
);

CREATE INDEX idx_operator_groups_user ON operator_groups("userId");
CREATE INDEX idx_operator_groups_group ON operator_groups("groupId");

-- Criar tabela machines
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "groupId" UUID REFERENCES groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  "numberOfMatrices" INTEGER DEFAULT 0,
  "standardCycleTime" INTEGER NOT NULL,
  status TEXT DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'NORMAL_RUNNING', 'STOPPED', 'EMERGENCY')),
  "currentOperatorId" UUID,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_machines_company ON machines("companyId");
CREATE INDEX idx_machines_group ON machines("groupId");
CREATE INDEX idx_machines_status ON machines(status);

-- Criar tabela matrices
CREATE TABLE matrices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "machineId" UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  "matrixNumber" INTEGER NOT NULL,
  status TEXT DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'RUNNING', 'STOPPED')),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("machineId", "matrixNumber")
);

CREATE INDEX idx_matrices_machine ON matrices("machineId");

-- Criar tabela stop_reasons
CREATE TABLE stop_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('MAINTENANCE', 'MATERIAL', 'QUALITY', 'SETUP', 'OPERATOR', 'EMERGENCY', 'OTHER')),
  description TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stop_reasons_company ON stop_reasons("companyId");
CREATE INDEX idx_stop_reasons_category ON stop_reasons(category);

-- Criar tabela machine_activities
CREATE TABLE machine_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "machineId" UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  "operatorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('IDLE', 'NORMAL_RUNNING', 'STOPPED', 'EMERGENCY')),
  "stopReasonId" UUID REFERENCES stop_reasons(id) ON DELETE SET NULL,
  "startTime" TIMESTAMP DEFAULT NOW(),
  "endTime" TIMESTAMP,
  duration INTEGER,
  "cyclesCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_machine_activities_machine ON machine_activities("machineId");
CREATE INDEX idx_machine_activities_operator ON machine_activities("operatorId");
CREATE INDEX idx_machine_activities_start ON machine_activities("startTime");

-- Criar tabela matrix_activities
CREATE TABLE matrix_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "matrixId" UUID NOT NULL REFERENCES matrices(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('IDLE', 'RUNNING', 'STOPPED')),
  "stopReasonId" UUID REFERENCES stop_reasons(id) ON DELETE SET NULL,
  "startTime" TIMESTAMP DEFAULT NOW(),
  "endTime" TIMESTAMP,
  duration INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_matrix_activities_matrix ON matrix_activities("matrixId");
CREATE INDEX idx_matrix_activities_start ON matrix_activities("startTime");

-- Criar tabela audit_logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID REFERENCES companies(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'START_MACHINE', 'STOP_MACHINE', 'EMERGENCY_STOP', 'CYCLE_COMPLETE')),
  "entityType" TEXT NOT NULL,
  "entityId" UUID,
  details JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_company ON audit_logs("companyId");
CREATE INDEX idx_audit_logs_user ON audit_logs("userId");
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs("createdAt");

-- Criar tabela pdca_plans
CREATE TABLE pdca_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT DEFAULT 'PLAN' CHECK (phase IN ('PLAN', 'DO', 'CHECK', 'ACT')),
  "baselineStartDate" TIMESTAMP NOT NULL,
  "baselineEndDate" TIMESTAMP NOT NULL,
  "scopeFilters" JSONB NOT NULL,
  "baselineData" JSONB NOT NULL,
  "targetMetrics" JSONB,
  "actualResults" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pdca_plans_company ON pdca_plans("companyId");
CREATE INDEX idx_pdca_plans_phase ON pdca_plans(phase);

-- Criar tabela pdca_actions
CREATE TABLE pdca_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "planId" UUID NOT NULL REFERENCES pdca_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  responsible TEXT,
  "dueDate" TIMESTAMP,
  completed BOOLEAN DEFAULT false,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pdca_actions_plan ON pdca_actions("planId");
```

### 2.3 Verificar se as Tabelas Foram Criadas

1. Vá para: https://supabase.com/dashboard/project/hqogmroluzcrqcbzehob/editor
2. Você deve ver todas as 12 tabelas criadas no menu lateral

---

## Etapa 3: Testar a API

Depois de configurar as credenciais e criar as tabelas:

```bash
cd server
npm run dev
```

Teste o health check:
```bash
curl http://localhost:3001/api/health
```

---

## Próximos Passos

Após configurar, vamos:
1. Popular dados iniciais via API
2. Testar login
3. Conectar frontend ao backend

---

**Me avise quando tiver copiado as chaves API que eu atualizo o .env automaticamente!**
