# Quick Start - MES SaaS

## Como Executar o Projeto

### 1. As dependências já foram instaladas!

### 2. Executar em Modo Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### 3. Fazer Login

Use uma das credenciais abaixo:

**Master (Desenvolvedor)**
- Email: `master@mes.com`
- Senha: `master123`
- MFA: `123456`

**Administrador**
- Email: `admin@empresa.com`
- Senha: `admin123`

**Supervisor**
- Email: `supervisor@empresa.com`
- Senha: `super123`

**Operador**
- Email: `operador@empresa.com`
- Senha: `oper123`

## Estrutura de Navegação

### Operador
- Interface otimizada para tablet
- Botão "Iniciar Turno" para começar produção
- Botão "EMERGÊNCIA" para paradas críticas
- Controle individual de cada matriz
- Botão "Contabilizar Giro" para registrar ciclos

### Supervisor/Admin
- Dashboard com KPIs e métricas
- Gráfico de Pareto de motivos de parada
- Filtros globais (período, célula, operador, máquina)
- Monitoramento em tempo real dos operadores
- Espelhamento da tela do operador (somente leitura)

### Master
- Gestão de empresas SaaS
- CRUD completo de empresas
- Ativar/Desativar empresas
- Trocar senha de administradores

## Principais Funcionalidades Implementadas

✅ Sistema de autenticação com 4 perfis de usuário
✅ MFA obrigatório para Master
✅ Interface do operador otimizada para tablet
✅ Sistema de exclusividade de máquinas
✅ Dashboard com gráficos e KPIs
✅ Espelhamento em tempo real
✅ Painel Master para gestão SaaS
✅ Segregação de dados multi-tenant
✅ Responsividade para diferentes dispositivos

## Build para Produção

```bash
npm run build
```

Os arquivos compilados estarão em `dist/`

## Tecnologias

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Recharts (gráficos)
- React Router
- Lucide React (ícones)

## Próximos Passos

1. Implementar backend (API REST + WebSocket)
2. Integrar com banco de dados
3. Módulo PDCA completo
4. Cadastros do Administrador
5. Sistema de relatórios

---

**Desenvolvido por IA com React + TypeScript + Tailwind CSS**
