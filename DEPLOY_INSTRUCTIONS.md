# 🚀 Instruções de Deploy - Easypanel

## ⚠️ IMPORTANTE: Você precisa criar 2 SERVIÇOS SEPARADOS

### 1️⃣ Serviço BACKEND (API)
### 2️⃣ Serviço FRONTEND (Interface)

---

## 🟢 1. BACKEND (API Node.js) - CONFIGURAR PRIMEIRO

### Configurações do Serviço:

**GitHub:**
- Repository: `mesbasico`
- Branch: `main`
- **Root Directory:** `/server` ⚠️ MUITO IMPORTANTE!

**Build:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Port: `3001`

**Environment Variables:**
```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://hqogmroluzcrqcbzehob.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb2dtcm9sdXpjcnFjYnplaG9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3OTI5NSwiZXhwIjoyMDc2MTU1Mjk1fQ.0hR98RC5M1OKlnWKZEej75vn_RaWtn2a1AucvDRY_Ko
JWT_SECRET=zmmIcc2BFlLJh1RfvjULqjsaTdAwTf9DLIjGWn7OOTRQ1JItiz0neEw8vy+vRac7BDkk+BHB6TfTeRspYsqb1A==
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://rampim-rengemes.46hdgp.easypanel.host
WEBSOCKET_PORT=3002
```

**⚠️ NÃO INCLUA `DATABASE_URL` - não é necessário!**

---

## 🔵 2. FRONTEND (React/Vite) - CONFIGURAR DEPOIS

### Configurações do Serviço:

**GitHub:**
- Repository: `mesbasico`
- Branch: `main`
- **Root Directory:** `/` ⚠️ RAIZ DO PROJETO!

**Build:**
- Build Command: `npm install && npm run build`
- Start Command: (deixe vazio - Easypanel usa servidor estático)
- Output Directory: `dist`

**Environment Variables:**
```env
VITE_API_URL=https://SEU-BACKEND-URL.easypanel.host/api
```

**⚠️ IMPORTANTE:** Substitua `SEU-BACKEND-URL` pela URL real que o Easypanel gerar para o backend!

---

## 📝 Passo a Passo no Easypanel

### PASSO 1: Deploy do Backend

1. **New Service** → **App** → **From GitHub**
2. Nome do serviço: `mes-backend` (ou similar)
3. Selecione o repositório: `mesbasico`
4. Branch: `main`
5. ⚠️ **Root Directory**: `/server`
6. **General Settings:**
   - Port: `3001`
7. **Build:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
8. **Environment Variables:** Cole as variáveis do BACKEND acima
9. **Deploy** → Aguarde o build completar
10. ✅ Copie a URL gerada (ex: `https://mes-backend-xyz.easypanel.host`)

### PASSO 2: Deploy do Frontend

1. **New Service** → **App** → **From GitHub**
2. Nome do serviço: `mes-frontend` (ou similar)
3. Selecione o repositório: `mesbasico`
4. Branch: `main`
5. ⚠️ **Root Directory**: `/` (raiz)
6. **Build:**
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
7. **Environment Variables:**
   ```env
   VITE_API_URL=https://SUA-URL-DO-BACKEND/api
   ```
   ⚠️ Substitua `SUA-URL-DO-BACKEND` pela URL copiada no PASSO 1!
8. **Deploy** → Aguarde o build completar

### PASSO 3: Atualizar CORS no Backend

1. Volte ao serviço do **Backend**
2. Edite a variável de ambiente:
   ```env
   CORS_ORIGIN=https://SUA-URL-DO-FRONTEND
   ```
3. **Redeploy** o backend

---

## 🔍 Como Saber se Deu Certo

### Teste 1: Backend
Acesse: `https://sua-url-backend/api/health`

✅ Deve retornar:
```json
{
  "status": "ok",
  "message": "MES SaaS API is running"
}
```

### Teste 2: Frontend
1. Acesse a URL do frontend
2. Tente fazer login:
   - Email: `master@mes.com`
   - Senha: `master123`

---

## ❌ Corrigindo o Erro Atual

**O erro que você está vendo acontece porque:**
- Você configurou **Root Directory** como `/` (raiz)
- Mas colocou **variáveis de ambiente do BACKEND**
- O Easypanel tentou fazer build do **FRONTEND** com configs do **BACKEND**

**Solução:**

1. **DELETAR** o serviço atual que deu erro
2. Criar **2 SERVIÇOS NOVOS** seguindo os passos acima:
   - Um para o **Backend** (Root: `/server`)
   - Um para o **Frontend** (Root: `/`)

---

## 📋 Resumo Visual

| | Backend | Frontend |
|---|---------|----------|
| **Root Directory** | `/server` | `/` |
| **Port** | `3001` | (padrão) |
| **Build Command** | `npm install && npm run build` | `npm install && npm run build` |
| **Start Command** | `npm start` | (vazio) |
| **Output Directory** | (vazio) | `dist` |
| **Env Vars** | 8 variáveis (Supabase, JWT, CORS, etc) | 1 variável (VITE_API_URL) |

---

## 🆘 Precisa de Ajuda?

Se ainda estiver com dúvidas:
1. Me diga qual serviço você quer configurar primeiro (Backend ou Frontend)
2. Tire prints das configurações do Easypanel
3. Compartilhe os logs de erro completos

---

**Dica**: Sempre configure o **BACKEND PRIMEIRO**, pegue a URL dele, e depois configure o **FRONTEND** com essa URL!
