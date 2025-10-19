# Configurar Domínio Personalizado mes.rampim.eng.br

## Problema
Ao acessar `mes.rampim.eng.br`, o login não funciona porque o frontend não consegue se comunicar com o backend.

## Solução

### 1️⃣ Configurar VITE_API_URL no Frontend (Easypanel)

1. Acesse o **Easypanel**
2. Vá em **Projects** → **rampim** → **rengemes-frontend**
3. Clique em **Environment** (ou **Env Variables**)
4. Adicione uma nova variável:
   - **Nome**: `VITE_API_URL`
   - **Valor**: `https://rampim-rengemes-backend.46hdgp.easypanel.host/api`
5. Clique em **Save** ou **Update**

### 2️⃣ Atualizar CORS_ORIGIN no Backend (Easypanel)

1. No **Easypanel**, vá em **Projects** → **rampim** → **rengemes-backend**
2. Clique em **Environment**
3. Encontre a variável **CORS_ORIGIN**
4. Atualize o valor para incluir seus domínios (separados por vírgula):
   ```
   https://mes.rampim.eng.br,https://rampim-rengemes-frontend.46hdgp.easypanel.host
   ```
5. Clique em **Save**

### 3️⃣ Rebuild do Frontend

**IMPORTANTE:** Como `VITE_API_URL` é embutida no build, você precisa fazer rebuild:

1. No **Easypanel** → **rengemes-frontend**
2. Vá em **Deployments** ou **Build**
3. Clique em **Rebuild** ou **Redeploy**
4. Aguarde o build completar (pode levar alguns minutos)

### 4️⃣ Restart do Backend (Opcional)

Para garantir que o CORS foi atualizado:

1. No **Easypanel** → **rengemes-backend**
2. Clique em **Restart** (pode ser um botão ou menu)

### 5️⃣ Testar

1. Acesse `https://mes.rampim.eng.br`
2. Tente fazer login
3. Abra o **Console do Navegador** (F12)
4. Verifique se há erros de CORS ou de conexão

## Verificação

Se ainda não funcionar, verifique:

1. **Console do navegador (F12 → Console)**:
   - Erro de CORS? → Verifique passo 2
   - Erro 404 ou conexão recusada? → Verifique passo 1

2. **Logs do Backend no Easypanel**:
   - Vá em **rengemes-backend** → **Logs**
   - Procure por erros relacionados a CORS ou requisições

3. **Testar URL do backend diretamente**:
   - Acesse: `https://rampim-rengemes-backend.46hdgp.easypanel.host/api/health`
   - Deve retornar algo como `{"status":"ok"}`

## Resumo das Variáveis

### Frontend (rengemes-frontend)
```
VITE_API_URL=https://rampim-rengemes-backend.46hdgp.easypanel.host/api
```

### Backend (rengemes-backend)
```
CORS_ORIGIN=https://mes.rampim.eng.br,https://rampim-rengemes-frontend.46hdgp.easypanel.host
```

## Troubleshooting

### Login não funciona
- Verifique se o frontend foi **rebuilded** após adicionar `VITE_API_URL`
- Verifique se o backend tem `CORS_ORIGIN` configurado

### Erro "Network Error" ou "Failed to fetch"
- O frontend não consegue acessar o backend
- Verifique se a URL do backend está correta
- Teste acessar a URL manualmente no navegador

### Erro "CORS policy"
- Backend não está aceitando requisições do domínio
- Adicione o domínio no `CORS_ORIGIN` do backend
- Faça restart do backend

## URLs Importantes

- **Frontend**: https://mes.rampim.eng.br
- **Frontend (original)**: https://rampim-rengemes-frontend.46hdgp.easypanel.host
- **Backend**: https://rampim-rengemes-backend.46hdgp.easypanel.host
- **Backend API**: https://rampim-rengemes-backend.46hdgp.easypanel.host/api
- **Health Check**: https://rampim-rengemes-backend.46hdgp.easypanel.host/api/health
