# 🔐 Variáveis de Ambiente para Easypanel

## 📋 Copie e Cole Estas Variáveis no Easypanel

### 🟢 BACKEND (API Node.js)

```bash
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
JWT_SECRET=gere-uma-chave-super-secreta-de-64-caracteres
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://seu-dominio-frontend.com
WEBSOCKET_PORT=3002
```

### 🔵 FRONTEND (React/Vite)

```bash
VITE_API_URL=https://seu-dominio-backend.com/api
```

---

## 📍 Onde Encontrar Cada Valor

| Variável | Onde Encontrar | Exemplo |
|----------|----------------|---------|
| `PORT` | Padrão do servidor | `3001` |
| `NODE_ENV` | Ambiente | `production` |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | `https://abcdefgh.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key | `eyJhbGci...` (token longo) |
| `JWT_SECRET` | Gerar com: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` | String de 128 caracteres hex |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `7d` (7 dias) |
| `CORS_ORIGIN` | URL do seu frontend no Easypanel | `https://meuapp.com` |
| `WEBSOCKET_PORT` | Porta do WebSocket (opcional) | `3002` |
| `VITE_API_URL` | URL do seu backend no Easypanel + `/api` | `https://api.meuapp.com/api` |

---

## 🎯 Passos no Easypanel

### 1. Criar Serviço do Backend

1. **New Service** → **From GitHub**
2. Selecione o repositório: `mesbasico`
3. Branch: `main`
4. **Root Directory**: `/server` ⚠️ IMPORTANTE
5. **Build Command**: `npm install && npm run build`
6. **Start Command**: `npm start`
7. **Port**: `3001`
8. **Environment Variables**: Cole as variáveis do BACKEND acima

### 2. Criar Serviço do Frontend

1. **New Service** → **From GitHub**
2. Selecione o repositório: `mesbasico`
3. Branch: `main`
4. **Root Directory**: `/` (raiz do projeto)
5. **Build Command**: `npm install && npm run build`
6. **Output Directory**: `dist`
7. **Port**: deixe o padrão
8. **Environment Variables**: Cole as variáveis do FRONTEND acima

---

## ⚠️ ATENÇÃO: Substituir Valores

Antes de fazer deploy, substitua:

| ❌ Valor de Exemplo | ✅ Seu Valor Real |
|---------------------|-------------------|
| `seu-projeto.supabase.co` | URL real do seu projeto Supabase |
| `sua-service-role-key-aqui` | Service Role Key do Supabase (Settings → API) |
| `gere-uma-chave-super-secreta` | Chave gerada com comando crypto |
| `seu-dominio-frontend.com` | Domínio do frontend no Easypanel |
| `seu-dominio-backend.com` | Domínio do backend no Easypanel |

---

## 🔐 Gerar JWT_SECRET Seguro

### Opção 1: Node.js (Recomendado)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Opção 2: Online
Acesse: https://generate-secret.vercel.app/64

### Opção 3: OpenSSL
```bash
openssl rand -hex 64
```

---

## ✅ Checklist Final

Antes de clicar em "Deploy":

- [ ] SUPABASE_URL copiado do Supabase Dashboard
- [ ] SUPABASE_SERVICE_ROLE_KEY copiado do Supabase Dashboard
- [ ] JWT_SECRET gerado (nova chave forte)
- [ ] CORS_ORIGIN com URL correta do frontend
- [ ] VITE_API_URL com URL correta do backend + `/api`
- [ ] Migrations SQL executadas no Supabase
- [ ] Root Directory do backend está como `/server`
- [ ] Root Directory do frontend está como `/` (raiz)

---

## 🧪 Testar Após Deploy

### Teste 1: Backend Health Check
```bash
curl https://seu-backend.easypanel.app/api/health
```

✅ Deve retornar: `{"status":"ok"}`

### Teste 2: Login
Acesse o frontend e faça login com:
- Email: `master@mes.com`
- Senha: `master123`

---

## 🐛 Se Algo Der Errado

1. **Erro de CORS**: Verifique `CORS_ORIGIN` no backend
2. **Erro 500**: Verifique logs do backend no Easypanel
3. **Não conecta na API**: Verifique `VITE_API_URL` no frontend
4. **Erro de Supabase**: Verifique `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

---

**Dica**: Salve essas variáveis em um local seguro (gerenciador de senhas) para futuras referências!
