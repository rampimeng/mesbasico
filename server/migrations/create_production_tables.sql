-- Criar tabelas necessárias para o sistema de produção

-- 1. Tabela de sessões de produção
CREATE TABLE IF NOT EXISTS production_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    "machineId" UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    "operatorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "endedAt" TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Tabela de logs de tempo (time logs para Pareto)
CREATE TABLE IF NOT EXISTS time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    "sessionId" UUID NOT NULL REFERENCES production_sessions(id) ON DELETE CASCADE,
    "machineId" UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    "matrixId" TEXT,
    "matrixNumber" INTEGER,
    "operatorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- NORMAL_RUNNING, STOPPED, EMERGENCY
    "stopReasonId" UUID REFERENCES stop_reasons(id) ON DELETE SET NULL,
    "stopReasonName" TEXT,
    "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "endedAt" TIMESTAMP WITH TIME ZONE,
    "durationSeconds" INTEGER,
    "machineName" TEXT,
    "operatorName" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Tabela de logs de ciclos (giros)
CREATE TABLE IF NOT EXISTS cycle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    "sessionId" UUID NOT NULL REFERENCES production_sessions(id) ON DELETE CASCADE,
    "machineId" UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    "matrixId" TEXT,
    "operatorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "cycleCompletedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "machineName" TEXT,
    "operatorName" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_production_sessions_company ON production_sessions("companyId");
CREATE INDEX IF NOT EXISTS idx_production_sessions_machine ON production_sessions("machineId");
CREATE INDEX IF NOT EXISTS idx_production_sessions_operator ON production_sessions("operatorId");
CREATE INDEX IF NOT EXISTS idx_production_sessions_active ON production_sessions(active);

CREATE INDEX IF NOT EXISTS idx_time_logs_company ON time_logs("companyId");
CREATE INDEX IF NOT EXISTS idx_time_logs_session ON time_logs("sessionId");
CREATE INDEX IF NOT EXISTS idx_time_logs_machine ON time_logs("machineId");
CREATE INDEX IF NOT EXISTS idx_time_logs_operator ON time_logs("operatorId");
CREATE INDEX IF NOT EXISTS idx_time_logs_started_at ON time_logs("startedAt");

CREATE INDEX IF NOT EXISTS idx_cycle_logs_company ON cycle_logs("companyId");
CREATE INDEX IF NOT EXISTS idx_cycle_logs_session ON cycle_logs("sessionId");
CREATE INDEX IF NOT EXISTS idx_cycle_logs_machine ON cycle_logs("machineId");
CREATE INDEX IF NOT EXISTS idx_cycle_logs_operator ON cycle_logs("operatorId");
CREATE INDEX IF NOT EXISTS idx_cycle_logs_completed_at ON cycle_logs("cycleCompletedAt");
