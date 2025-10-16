# MES SaaS - Backend API

Backend da aplicação MES SaaS desenvolvido com Node.js, Express, TypeScript e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** 18+
- **TypeScript** 5.x
- **Express.js** 5.x
- **PostgreSQL** 14+
- **Prisma** ORM
- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **Socket.io** para WebSocket

## 📦 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mes_saas?schema=public"
JWT_SECRET=seu_secret_super_seguro
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
WEBSOCKET_PORT=3002
```

### 3. Configurar o banco de dados PostgreSQL

Instale o PostgreSQL (se ainda não tiver):
- **Windows**: https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

Crie o banco de dados:

```bash
psql -U postgres
CREATE DATABASE mes_saas;
\q
```

### 4. Executar migrações do Prisma

```bash
npm run prisma:migrate
```

Isso irá:
- Criar todas as tabelas no banco de dados
- Aplicar o schema definido em `prisma/schema.prisma`

### 5. Gerar o Prisma Client

```bash
npm run prisma:generate
```

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Gerar Prisma Client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Abrir Prisma Studio (UI para visualizar o banco)
npm run prisma:studio
```

## 📁 Estrutura do Projeto

```
server/
├── prisma/
│   └── schema.prisma       # Schema do banco de dados
├── src/
│   ├── config/             # Configurações
│   │   ├── database.ts     # Conexão Prisma
│   │   └── env.ts          # Variáveis de ambiente
│   ├── controllers/        # Controllers das rotas
│   │   └── auth.controller.ts
│   ├── middleware/         # Middlewares Express
│   │   ├── auth.ts         # Autenticação e autorização
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── routes/             # Definição de rotas
│   │   ├── auth.routes.ts
│   │   └── index.ts
│   ├── services/           # Lógica de negócio
│   ├── types/              # Tipos TypeScript
│   │   ├── express.d.ts
│   │   └── index.ts
│   ├── utils/              # Utilitários
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── response.ts
│   ├── websocket/          # WebSocket handlers
│   ├── app.ts              # Configuração do Express
│   └── index.ts            # Entry point
├── .env.example            # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@empresa.com",
  "password": "admin123",
  "mfaCode": "123456"  // Opcional, apenas para usuários com MFA
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@empresa.com",
      "role": "ADMIN",
      "companyId": "uuid"
    },
    "company": {
      "id": "uuid",
      "name": "Empresa Demo LTDA",
      "logoUrl": "https://...",
      "dashboardToken": "dash_..."
    }
  }
}
```

### Usando o Token

Inclua o token no header `Authorization` de todas as requisições protegidas:

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Modelo de Dados

### Principais Entidades

- **Company** - Empresas (multi-tenant)
- **User** - Usuários (Master, Admin, Supervisor, Operador)
- **Group** - Grupos/Células de produção
- **Machine** - Máquinas
- **Matrix** - Matrizes das máquinas
- **StopReason** - Motivos de parada
- **MachineActivity** - Histórico de atividades das máquinas
- **MatrixActivity** - Histórico de atividades das matrizes
- **AuditLog** - Logs de auditoria
- **PdcaPlan** - Planos PDCA
- **PdcaAction** - Ações do PDCA

## 🔒 Perfis de Usuário

| Perfil | Acesso |
|--------|--------|
| **MASTER** | Gestão de empresas, acesso total |
| **ADMIN** | Gestão completa da empresa |
| **SUPERVISOR** | Dashboard, monitoramento, relatórios |
| **OPERATOR** | Controle de máquinas vinculadas |

## 🌐 Endpoints Disponíveis

### Autenticação

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (autenticado)
- `GET /api/auth/me` - Dados do usuário logado (autenticado)

### Health Check

- `GET /api/health` - Verificar status da API

## 🚧 TODO - Próximas Implementações

- [ ] CRUD de Empresas (Master)
- [ ] CRUD de Usuários (Admin)
- [ ] CRUD de Máquinas (Admin)
- [ ] CRUD de Grupos/Células (Admin)
- [ ] CRUD de Motivos de Parada (Admin)
- [ ] API de Controle de Máquinas (Operador)
- [ ] API de Dashboard (Supervisor/Admin)
- [ ] API de PDCA (Admin)
- [ ] WebSocket para tempo real
- [ ] Sistema de relatórios
- [ ] Sistema de notificações

## 🐛 Troubleshooting

### Erro de conexão com o banco de dados

Verifique se:
1. PostgreSQL está rodando
2. Credenciais em `DATABASE_URL` estão corretas
3. Banco de dados `mes_saas` foi criado

### Erro "JWT_SECRET must be set in production"

Configure a variável `JWT_SECRET` no arquivo `.env` com um valor seguro.

### Porta já em uso

Mude a variável `PORT` no `.env` para outra porta disponível.

## 📝 Logs

Os logs são exibidos no console durante o desenvolvimento:

```
[2024-01-15T10:30:45.123Z] POST /api/auth/login 200 - 45ms
[2024-01-15T10:30:50.456Z] GET /api/auth/me 200 - 12ms
```

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
2. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
3. Push para a branch (`git push origin feature/nova-funcionalidade`)
4. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ usando Node.js + TypeScript + PostgreSQL**
