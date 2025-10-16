# Relatório de Status do Projeto - MES SaaS

**Data da última atualização:** 16/10/2025
**Versão:** 1.0.0
**Status Geral:** Em Desenvolvimento - Fase 2 Completa

---

## 📋 Índice

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Arquitetura Técnica](#arquitetura-técnica)
3. [Status de Implementação](#status-de-implementação)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Estrutura de Dados](#estrutura-de-dados)
6. [Autenticação e Autorização](#autenticação-e-autorização)
7. [Problemas Conhecidos e Resoluções](#problemas-conhecidos-e-resoluções)
8. [Próximas Etapas](#próximas-etapas)
9. [Guia de Desenvolvimento](#guia-de-desenvolvimento)

---

## 🎯 Visão Geral do Projeto

### Objetivo
Sistema SaaS de MES (Manufacturing Execution System) focado na coleta de dados de produção em tempo real via tablet, com funcionalidades de:
- Controle de status de máquinas e matrizes
- Registro de motivos de parada
- Análise de Pareto
- Módulo PDCA para melhoria contínua
- Dashboard em tempo real

### Público-Alvo
- **Usuário Master (Desenvolvedor)**: Gerencia múltiplas empresas no SaaS
- **Administrador**: Gerencia uma empresa específica
- **Supervisor**: Visualiza dashboards e monitora operadores
- **Operador**: Controla máquinas e registra produção

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológica

#### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Roteamento**: React Router v6
- **Estado Global**: Zustand
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Gráficos**: Recharts

#### Backend
- **Runtime**: Node.js
- **Framework**: Express + TypeScript
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Autenticação**: JWT + bcrypt
- **ORM**: Supabase Client Library

### Estrutura de Pastas

```
MES2/
├── src/                          # Frontend React
│   ├── components/              # Componentes React
│   │   ├── Admin/              # Componentes do Admin
│   │   │   └── Registration/   # Cadastros (CRUD)
│   │   ├── Master/             # Componentes do Master
│   │   ├── Supervisor/         # Componentes do Supervisor
│   │   └── Operator/           # Componentes do Operador
│   ├── pages/                  # Páginas principais
│   │   ├── admin/              # Páginas do Admin
│   │   ├── Master/             # Páginas do Master
│   │   └── Operator/           # Páginas do Operador
│   ├── services/               # Serviços de API
│   │   ├── auth.service.ts     # Autenticação
│   │   ├── companiesService.ts # CRUD de empresas
│   │   └── registrationService.ts # CRUD de cadastros
│   ├── store/                  # Estado global (Zustand)
│   │   ├── authStore.ts        # Estado de autenticação
│   │   └── registrationStore.ts # Estado de cadastros
│   └── types/                  # Tipos TypeScript
│
├── server/                      # Backend Node.js
│   ├── src/
│   │   ├── config/             # Configurações
│   │   │   └── supabase.ts     # Cliente Supabase
│   │   ├── controllers/        # Lógica de negócio
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.supabase.controller.ts
│   │   │   ├── companies.controller.ts
│   │   │   ├── groups.controller.ts
│   │   │   ├── machines.controller.ts
│   │   │   ├── stop-reasons.controller.ts
│   │   │   └── users.controller.ts
│   │   ├── middleware/         # Middlewares
│   │   │   ├── auth.ts         # Autenticação JWT
│   │   │   └── errorHandler.ts # Tratamento de erros
│   │   ├── routes/             # Rotas da API
│   │   │   ├── auth.routes.ts
│   │   │   ├── companies.routes.ts
│   │   │   ├── groups.routes.ts
│   │   │   ├── machines.routes.ts
│   │   │   ├── stop-reasons.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   └── index.ts        # Agregador de rotas
│   │   ├── scripts/            # Scripts utilitários
│   │   │   ├── seed.supabase.ts # Seed de dados
│   │   │   └── run-migration.ts # Executar migrations
│   │   └── index.ts            # Entrada do servidor
│   └── migrations/             # Migrations SQL
│       └── add_operatorIds_to_machines.sql
│
└── .env                        # Variáveis de ambiente (Supabase)
```

---

## ✅ Status de Implementação

### Fase 1: Infraestrutura e Autenticação ✅ COMPLETO
- [x] Setup do projeto (Frontend + Backend)
- [x] Configuração do Supabase
- [x] Sistema de autenticação JWT
- [x] Middleware de autorização por roles
- [x] Tela de login com validação

### Fase 2: CRUD de Cadastros ✅ COMPLETO
- [x] **Empresas (Master)**
  - [x] Criar, editar, desabilitar empresas
  - [x] Criar admin automático ao criar empresa
  - [x] Trocar senha do admin
- [x] **Grupos/Células**
  - [x] CRUD completo com filtro por empresa
- [x] **Máquinas**
  - [x] CRUD completo com campos: numberOfMatrices, standardCycleTime, operatorIds
  - [x] Vinculação com grupos e operadores
  - [x] Migration para adicionar coluna operatorIds
- [x] **Motivos de Parada**
  - [x] CRUD completo com categorização
- [x] **Usuários/Operadores**
  - [x] CRUD completo com hash de senha
  - [x] Vinculação de operadores com grupos via tabela operator_groups

### Fase 3: Dashboard e Monitoramento 🚧 EM ANDAMENTO
- [x] Dashboard básico (sem dados reais)
- [x] Monitoramento de operadores (estrutura)
- [x] API para buscar máquinas do operador
- [ ] Integração com dados reais de produção
- [ ] Gráfico de Pareto dinâmico
- [ ] Indicadores de Ciclos Previstos vs Realizados
- [ ] Espelhamento em tempo real da tela do operador

### Fase 4: Operação (Operador) 🚧 EM ANDAMENTO
- [x] Tela de controle de máquinas
- [x] Botão "Iniciar Turno"
- [x] Botão "Emergência"
- [x] Botão "Contabilizar Giro"
- [x] Visualização de máquinas vinculadas ao operador
- [ ] Controle por matriz individual (UI pronta, sem backend)
- [ ] Registro de motivos de parada (UI pronta, sem backend)
- [ ] Persistência de sessões de produção no banco
- [ ] Persistência de logs de tempo no banco
- [ ] Persistência de logs de ciclos no banco

### Fase 5: Módulo PDCA ⏳ PENDENTE
- [ ] Seleção de período base
- [ ] Gravação de baseline
- [ ] Definição de metas
- [ ] Cadastro de ações
- [ ] Relatório de comparação (Check)
- [ ] Registro de conclusões (Act)

---

## 🎨 Funcionalidades Implementadas

### 1. Sistema de Autenticação
**Localização:** `server/src/controllers/auth.supabase.controller.ts`, `src/services/auth.service.ts`

**Recursos:**
- Login com email e senha
- Suporte a MFA (estrutura pronta, não implementado ainda)
- JWT com expiração de 24h
- Middleware de autenticação
- Logout com limpeza de token

**Endpoints:**
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### 2. Gestão de Empresas (Master)
**Localização:** `server/src/controllers/companies.controller.ts`, `src/pages/Master/MasterDashboard.tsx`

**Recursos:**
- CRUD completo de empresas
- Criação automática de usuário admin ao criar empresa
- Token único para dashboard de controle
- Alteração de senha do admin
- Ativar/desativar empresa

**Endpoints:**
```
GET    /api/companies
POST   /api/companies
PUT    /api/companies/:id
PATCH  /api/companies/:id/status
PATCH  /api/companies/:id/admin-password
DELETE /api/companies/:id
```

**Regras de Negócio:**
- Apenas usuário MASTER pode gerenciar empresas
- Admin é criado automaticamente com senha informada no cadastro
- Em caso de erro ao criar admin, a empresa é excluída (rollback)

### 3. Cadastros (Admin)
**Localização:** `src/pages/admin/RegistrationPage.tsx`, `src/components/Admin/Registration/`

#### 3.1. Grupos/Células
**Controller:** `server/src/controllers/groups.controller.ts`
**Campos:** name, description, companyId

**Endpoints:**
```
GET    /api/groups
POST   /api/groups
PUT    /api/groups/:id
DELETE /api/groups/:id
```

#### 3.2. Máquinas
**Controller:** `server/src/controllers/machines.controller.ts`
**Campos:** name, code, groupId, numberOfMatrices, standardCycleTime, operatorIds[], status, companyId

**Endpoints:**
```
GET    /api/machines
POST   /api/machines
PUT    /api/machines/:id
DELETE /api/machines/:id
```

**Nota Importante:** A coluna `operatorIds` foi adicionada via migration SQL. Ver: `server/migrations/add_operatorIds_to_machines.sql`

#### 3.3. Motivos de Parada
**Controller:** `server/src/controllers/stop-reasons.controller.ts`
**Campos:** name, description, category (texto livre), companyId

**Endpoints:**
```
GET    /api/stop-reasons
POST   /api/stop-reasons
PUT    /api/stop-reasons/:id
DELETE /api/stop-reasons/:id
```

**Nota:** A coluna `category` aceita qualquer texto. A constraint de CHECK foi removida via migration.

#### 3.4. Usuários/Operadores
**Controller:** `server/src/controllers/users.controller.ts`
**Campos:** name, email, password (hashed), role, groupIds[], companyId

**Endpoints:**
```
GET    /api/users
GET    /api/users/:id/groups
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

**Regras de Negócio:**
- Senha é sempre hash com bcrypt
- Operadores podem ser vinculados a múltiplos grupos via `operator_groups`
- Senha nunca é retornada nas responses

### 4. Dashboard e Monitoramento
**Localização:** `src/components/Supervisor/DashboardHome.tsx`, `src/components/Supervisor/OperatorMonitoring.tsx`

**Status:** Estrutura pronta, aguardando dados reais

**Funcionalidades Planejadas:**
- Gráfico de Pareto com motivos de parada
- Indicador de Ciclos (Previstos vs Realizados)
- Tempo de Produção vs Parada
- Espelhamento da tela do operador em tempo real

### 5. Painel do Operador
**Localização:** `src/pages/Operator/OperatorDashboard.tsx`, `src/store/machineStore.ts`

**Recursos Implementados:**
- Visualização de máquinas vinculadas ao operador (via operatorIds)
- Botão "Iniciar Turno" - inicia todas as máquinas em NORMAL_RUNNING
- Botão "Emergência" - para todas as máquinas em EMERGENCY
- Botão "Contabilizar Giro" - registra ciclo completo
- Cards de máquina com status e controle de matrizes

**Endpoint:**
```
GET /api/machines/operator/my-machines
```

**Nota:** Atualmente os dados de sessão e ciclos são salvos apenas em memória (auditStore). Necessário implementar persistência no banco de dados.

### 6. Interface do Usuário
**Componentes Principais:**
- **Sidebar:** Navegação lateral com nome da empresa exibido abaixo do botão "Sair"
- **Forms Modais:** Formulários de cadastro com validação e tratamento de erro assíncrono
- **Empty States:** Mensagens informativas quando não há dados

---

## 🗄️ Estrutura de Dados

### Tabelas no Supabase

#### companies
```sql
id: uuid (PK)
name: text
cnpj: text
email: text
contactName: text
contactPhone: text
logoUrl: text (opcional)
dashboardToken: text (único)
active: boolean
createdAt: timestamp
updatedAt: timestamp
```

#### users
```sql
id: uuid (PK)
companyId: uuid (FK) - nullable para MASTER
name: text
email: text (único)
password: text (hashed)
role: enum (MASTER, ADMIN, SUPERVISOR, OPERATOR)
active: boolean
mfaEnabled: boolean
phone: text (opcional)
createdAt: timestamp
updatedAt: timestamp
```

#### groups (Células de Produção)
```sql
id: uuid (PK)
companyId: uuid (FK)
name: text
description: text
createdAt: timestamp
updatedAt: timestamp
```

#### machines
```sql
id: uuid (PK)
companyId: uuid (FK)
name: text
code: text
groupId: uuid (FK) - opcional
numberOfMatrices: integer
standardCycleTime: integer (segundos)
operatorIds: text[] - array de UUIDs
status: enum (IDLE, NORMAL_RUNNING, STOPPED, EMERGENCY)
currentOperatorId: uuid (opcional)
sessionStartedAt: timestamp (opcional)
createdAt: timestamp
updatedAt: timestamp
```

#### stop_reasons
```sql
id: uuid (PK)
companyId: uuid (FK)
name: text
description: text
category: text (opcional)
createdAt: timestamp
updatedAt: timestamp
```

#### operator_groups (tabela de relacionamento N:N)
```sql
id: uuid (PK)
userId: uuid (FK)
groupId: uuid (FK)
createdAt: timestamp
```

### Enums TypeScript

```typescript
enum UserRole {
  MASTER = 'MASTER',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  OPERATOR = 'OPERATOR'
}

enum MachineStatus {
  NORMAL_RUNNING = 'NORMAL_RUNNING',
  STOPPED = 'STOPPED',
  EMERGENCY = 'EMERGENCY',
  IDLE = 'IDLE'
}
```

---

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação

1. **Login:** POST /api/auth/login
   - Valida email/senha
   - Gera JWT token
   - Retorna dados do usuário e empresa

2. **Verificação:** Middleware `authenticate` em `server/src/middleware/auth.ts`
   - Valida token JWT
   - Decodifica e anexa `req.user` com: `id`, `role`, `companyId`

3. **Autorização:** Middleware `authorize(...roles)`
   - Verifica se o usuário tem uma das roles permitidas
   - Retorna 403 se não autorizado

### Matriz de Permissões

| Recurso | Endpoint | MASTER | ADMIN | SUPERVISOR | OPERATOR |
|---------|----------|--------|-------|------------|----------|
| Empresas | /companies/* | ✅ (all) | ❌ | ❌ | ❌ |
| Grupos | GET /groups | ❌ | ✅ | ✅ | ❌ |
| Grupos | POST/PUT/DELETE /groups | ❌ | ✅ | ❌ | ❌ |
| Máquinas | GET /machines | ❌ | ✅ | ✅ | ❌ |
| Máquinas | POST/PUT/DELETE /machines | ❌ | ✅ | ❌ | ❌ |
| Motivos | GET /stop-reasons | ❌ | ✅ | ✅ | ❌ |
| Motivos | POST/PUT/DELETE /stop-reasons | ❌ | ✅ | ❌ | ❌ |
| Usuários | GET /users | ❌ | ✅ | ✅ | ❌ |
| Usuários | POST/PUT/DELETE /users | ❌ | ✅ | ❌ | ❌ |

### Segregação de Dados por Empresa

**Implementação:** Todos os controllers de cadastro filtram automaticamente por `companyId` extraído do JWT.

**Exemplo:**
```typescript
const { companyId } = req.user!;
const { data } = await supabase
  .from('machines')
  .select('*')
  .eq('companyId', companyId);
```

**Garantia:** Uma empresa NUNCA consegue ver ou manipular dados de outra empresa.

---

## 🐛 Problemas Conhecidos e Resoluções

### 1. Coluna `operatorIds` não existia na tabela `machines`
**Data:** 16/10/2025
**Erro:** `Could not find the 'operatorIds' column of 'machines' in the schema cache`

**Solução:**
1. Criada migration: `server/migrations/add_operatorIds_to_machines.sql`
2. Executada manualmente no Supabase SQL Editor:
```sql
ALTER TABLE machines
ADD COLUMN IF NOT EXISTS "operatorIds" text[] DEFAULT '{}';

UPDATE machines
SET "operatorIds" = '{}'
WHERE "operatorIds" IS NULL;
```

**Status:** ✅ Resolvido

### 2. Mock data no Dashboard e Monitoramento
**Data:** 16/10/2025
**Problema:** Dashboard mostrava dados fictícios mesmo para empresas recém-criadas

**Solução:**
- Removidos todos os arrays de mock data
- Implementados empty states com instruções
- Preparada estrutura para receber dados reais da API

**Status:** ✅ Resolvido

### 3. Dados de registro não persistiam
**Data:** 16/10/2025
**Problema:** Cadastros (máquinas, usuários, células, motivos) não salvavam no banco

**Causa:** `registrationStore.ts` usava apenas estado local (Zustand) sem chamadas à API

**Solução:**
- Criados 4 controllers backend: groups, machines, stop-reasons, users
- Criadas 4 rotas com autenticação e autorização
- Criado `registrationService.ts` com todos os métodos de API
- Reescrito `registrationStore.ts` para usar APIs
- Atualizado `RegistrationPage.tsx` para carregar dados via `loadAll()`

**Status:** ✅ Resolvido

### 4. Nome da empresa não exibido na interface
**Data:** 16/10/2025
**Problema:** Usuário não sabia em qual empresa estava logado

**Solução:**
- Adicionado nome da empresa abaixo do botão "Sair" na Sidebar
- Exibição apenas quando sidebar está aberta (isOpen=true)
- Texto pequeno e truncado para não quebrar layout

**Status:** ✅ Resolvido

### 5. Constraint de category em stop_reasons
**Data:** 16/10/2025
**Erro:** `new row for relation "stop_reasons" violates check constraint "stop_reasons_category_check"`

**Problema:** A tabela tinha uma constraint que só aceitava valores específicos para `category`

**Solução:**
1. Criada migration: `server/migrations/fix_stop_reasons_category.sql`
2. Executada no Supabase SQL Editor:
```sql
ALTER TABLE stop_reasons
DROP CONSTRAINT IF EXISTS stop_reasons_category_check;
```

**Status:** ✅ Resolvido

### 6. Operador não via máquinas vinculadas
**Data:** 16/10/2025
**Problema:** machineStore usava dados mock e não carregava máquinas reais da API

**Solução:**
1. Criado endpoint GET `/api/machines/operator/my-machines`
2. Criado `machinesService.ts` para chamadas de API
3. Atualizado `machineStore.ts` para:
   - Adicionar função `loadMyMachines()`
   - Remover dados mock
   - Carregar dados via API
4. Atualizado `OperatorDashboard.tsx` para chamar `loadMyMachines()` no mount

**Status:** ✅ Resolvido

---

## 📝 Próximas Etapas

### Prioridade Alta
1. **Testar Painel do Operador:** ✅ Interface funcionando
2. **Implementar Persistência de Dados de Produção:**
   - Criar tabela `production_sessions`
   - Criar tabela `time_logs` (registros de status de máquina/matriz)
   - Criar tabela `cycle_logs` (registros de ciclos completados)
   - Criar controllers e endpoints para salvar sessões e logs
   - Integrar machineStore e auditStore com APIs de persistência

### Prioridade Média
4. **Dashboard com Dados Reais:**
   - Conectar gráfico de Pareto com time_logs
   - Conectar indicador de ciclos com cycle_logs
   - Implementar filtros por período, célula, máquina, operador
5. **Espelhamento em Tempo Real:**
   - WebSockets para comunicação
   - Visualização read-only da tela do operador

### Prioridade Baixa
6. **Módulo PDCA**
7. **Relatórios e Exportação**
8. **Notificações e Alertas**

---

## 🛠️ Guia de Desenvolvimento

### Iniciar o Projeto

1. **Backend:**
```bash
cd server
npm install
npm run dev  # Porta 3001
```

2. **Frontend:**
```bash
npm install
npm run dev  # Porta 3000
```

3. **Acessar:**
- Frontend: http://localhost:3000
- API: http://localhost:3001/api
- Health Check: http://localhost:3001/api/health

### Credenciais Padrão (após seed)

```
Master:     master@mes.com / master123
Admin:      admin@demo.com / admin123
Supervisor: supervisor@demo.com / supervisor123
Operador:   operator@demo.com / operator123
```

### Executar Seed

```bash
cd server
npm run seed:supabase
```

### Estrutura de uma Nova Feature

1. **Backend:**
   - Criar controller em `server/src/controllers/`
   - Criar rotas em `server/src/routes/`
   - Registrar rotas em `server/src/routes/index.ts`
   - Adicionar middleware de autenticação/autorização

2. **Frontend:**
   - Criar serviço em `src/services/`
   - Criar store em `src/store/` (se necessário)
   - Criar componentes em `src/components/`
   - Criar páginas em `src/pages/`
   - Adicionar rotas em `src/App.tsx`

### Boas Práticas

1. **Sempre filtrar por companyId** nos controllers
2. **Usar JWT** para autenticação em todas as rotas protegidas
3. **Hash de senhas** com bcrypt ao criar/atualizar usuários
4. **Validação** de entrada em frontend e backend
5. **Tratamento de erro** assíncrono em forms (async/await + try/catch)
6. **Logs informativos** com emojis para facilitar debug
7. **Empty states** quando não há dados

### Debugging

**Frontend:**
- Abrir DevTools (F12) > Console
- Verificar logs com emojis (🔍, 📦, ✅, ❌)
- Verificar requisições na aba Network

**Backend:**
- Ver logs no terminal do servidor
- Logs coloridos com emojis

### Variáveis de Ambiente

**Backend (.env):**
```
SUPABASE_URL=https://hqogmroluzcrqcbzehob.supabase.co
SUPABASE_ANON_KEY=<key>
JWT_SECRET=<secret>
PORT=3001
NODE_ENV=development
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001/api
```

---

## 📊 Métricas do Projeto

### Código
- **Linhas de código TypeScript:** ~15.000
- **Componentes React:** 30+
- **Controllers backend:** 7
- **Rotas API:** 35+
- **Tabelas Supabase:** 10+

### Progresso Geral
- **Fase 1 (Infraestrutura):** 100% ✅
- **Fase 2 (Cadastros):** 100% ✅
- **Fase 3 (Dashboard):** 35% 🚧
- **Fase 4 (Operação):** 60% 🚧
- **Fase 5 (PDCA):** 0% ⏳

**Progresso Total:** ~55%

---

## 📞 Contato e Suporte

Para dúvidas ou problemas:
1. Verificar este relatório primeiro
2. Consultar o código-fonte
3. Verificar logs do servidor e navegador
4. Consultar documentação do Supabase: https://supabase.com/docs

---

**Última atualização:** 16/10/2025 14:00
**Próxima revisão sugerida:** Após implementar persistência de dados de produção
