# 🚀 Guia de Deploy no Easypanel

Este guia detalha como fazer deploy da aplicação MES SaaS no Easypanel.

## 📋 Pré-requisitos

1. ✅ Conta no Easypanel configurada
2. ✅ Projeto Supabase criado e configurado
3. ✅ Repositório GitHub com o código
4. ✅ Migrations SQL executadas no Supabase

---

## 🔧 Configuração no Easypanel

Você precisará criar **2 aplicações** no Easypanel:

### 1️⃣ **Backend (API Node.js)**
### 2️⃣ **Frontend (React/Vite)**

---

## 🟢 1. Backend - Variáveis de Ambiente

### Configurações Obrigatórias:

```bash
# Configuração do Servidor
PORT=3001
NODE_ENV=production

# Supabase (OBRIGATÓRIO)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# JWT (IMPORTANTE: Gere uma chave segura!)
JWT_SECRET=sua-chave-jwt-super-secreta-e-longa-aqui
JWT_EXPIRES_IN=7d

# CORS (URL do seu frontend)
CORS_ORIGIN=https://seu-dominio-frontend.com

# WebSocket (opcional)
WEBSOCKET_PORT=3002

# Database (Não usado atualmente, mas pode ser útil)
DATABASE_URL=postgresql://postgres:[senha]@db.seu-projeto.supabase.co:5432/postgres
```

### 📍 Onde Encontrar as Credenciais do Supabase:

1. **SUPABASE_URL**:
   - Acesse seu projeto no Supabase Dashboard
   - Vá em: `Settings` > `API`
   - Copie a URL em **Project URL**
   - Exemplo: `https://abcdefghijklmn.supabase.co`

2. **SUPABASE_SERVICE_ROLE_KEY**:
   - No mesmo lugar (`Settings` > `API`)
   - Copie a chave em **service_role (secret)**
   - ⚠️ **ATENÇÃO**: Esta é uma chave SECRETA, nunca exponha no frontend!

### 🔐 Como Gerar JWT_SECRET Seguro:

Execute no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Ou use um gerador online:
https://generate-secret.vercel.app/64

---

## 🔵 2. Frontend - Variáveis de Ambiente

### Configurações Obrigatórias:

```bash
# URL da API Backend
VITE_API_URL=https://seu-dominio-backend.com/api
```

### 📝 Exemplo Completo:

Se seu backend estiver em `https://api.meusistema.com`, então:

```bash
VITE_API_URL=https://api.meusistema.com/api
```

⚠️ **IMPORTANTE**: Note o `/api` no final da URL!

---

## 📦 Configuração dos Serviços no Easypanel

### Backend (Node.js):

**GitHub:**
- Repository: `https://github.com/seu-usuario/mesbasico`
- Branch: `main`
- Root Directory: `/server`

**Build:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Port: `3001`

**Environment Variables:**
- Adicione todas as variáveis listadas acima na seção "Backend"

---

### Frontend (React/Vite):

**GitHub:**
- Repository: `https://github.com/seu-usuario/mesbasico`
- Branch: `main`
- Root Directory: `/` (raiz do projeto)

**Build:**
- Build Command: `npm install && npm run build`
- Output Directory: `dist`
- Port: `3000` (ou deixe o padrão)

**Environment Variables:**
- `VITE_API_URL=https://seu-backend.com/api`

---

## ✅ Checklist de Deploy

### Antes do Deploy:

- [ ] Migrations SQL executadas no Supabase
- [ ] Tabelas criadas no banco de dados
- [ ] Service Role Key copiada do Supabase
- [ ] JWT_SECRET gerado (chave segura)
- [ ] Seed executado para criar usuário Master

### Executar Migrations no Supabase:

Execute estes SQLs no **SQL Editor** do Supabase, nesta ordem:

1. `server/migrations/fix_stop_reasons_category.sql`
2. `server/migrations/add_operatorIds_to_machines.sql`
3. `server/migrations/create_production_tables.sql`
4. `server/migrations/add_pdca_enabled_to_companies.sql`

### Criar Usuário Master:

Após o deploy do backend, execute o seed:

**Opção 1: Via Easypanel Console**
```bash
cd /app/server
npm run seed:supabase
```

**Opção 2: Localmente**
```bash
# Configure o .env com as credenciais de produção
cd server
npm run seed:supabase
```

---

## 🔍 Testando o Deploy

### 1. Testar Backend:

```bash
curl https://seu-backend.com/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "MES SaaS API is running"
}
```

### 2. Testar Login:

```bash
curl -X POST https://seu-backend.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "master@mes.com",
    "password": "master123"
  }'
```

### 3. Testar Frontend:

Acesse `https://seu-frontend.com` e tente fazer login com:
- Email: `master@mes.com`
- Senha: `master123`

---

## 🐛 Troubleshooting

### Erro: "CORS policy"
**Solução**: Verifique se `CORS_ORIGIN` no backend está configurado com a URL correta do frontend.

### Erro: "Cannot connect to API"
**Solução**: Verifique se `VITE_API_URL` no frontend está correto e se o backend está rodando.

### Erro: "Invalid JWT token"
**Solução**: Verifique se `JWT_SECRET` está configurado no backend.

### Erro: "Supabase connection failed"
**Solução**:
1. Verifique `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
2. Confirme que as migrations foram executadas
3. Verifique se o IP do Easypanel está permitido no Supabase (se houver restrições)

---

## 📚 Estrutura de Pastas no Easypanel

```
/app/                    # Frontend (React)
├── dist/               # Build do frontend
├── src/
├── package.json
└── vite.config.ts

/app/server/            # Backend (Node.js)
├── dist/              # Build do backend
├── src/
├── package.json
└── tsconfig.json
```

---

## 🔐 Segurança em Produção

### Obrigatório:

1. ✅ Trocar a senha do Master após primeiro login
2. ✅ Usar JWT_SECRET forte e único
3. ✅ Configurar CORS_ORIGIN corretamente
4. ✅ Habilitar HTTPS nos domínios
5. ✅ Nunca expor SUPABASE_SERVICE_ROLE_KEY no frontend
6. ✅ Configurar backup do Supabase

### Recomendado:

- Habilitar rate limiting no Easypanel
- Configurar logs e monitoramento
- Usar domínios personalizados com SSL
- Habilitar MFA para usuário Master

---

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do backend no Easypanel
2. Logs do frontend no console do browser
3. Logs do Supabase Dashboard

---

## 🎯 Próximos Passos Após Deploy

1. Login como Master (`master@mes.com` / `master123`)
2. Trocar senha do Master
3. Criar sua primeira empresa
4. Configurar células e máquinas
5. Criar usuários (Admin, Supervisor, Operador)
6. Testar fluxo completo de produção

---

**Última atualização**: 2025-10-16
