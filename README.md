# MES SaaS - Manufacturing Execution System

Sistema SaaS de Manufatura Executiva (MES) focado na coleta de dados de produção em tempo real via tablet.

## Características Principais

### Perfis de Usuário
- **Master (Desenvolvedor)**: Gestão completa de empresas no SaaS
- **Administrador**: Gestão completa da empresa, cadastros e PDCA
- **Supervisor**: Monitoramento, dashboard e análises
- **Operador**: Controle de máquinas e matrizes em tempo real

### Funcionalidades Implementadas

#### 1. Autenticação e Segurança
- Sistema de login com validação de credenciais
- MFA (Autenticação Multi-Fator) obrigatório para usuário Master
- Segregação de dados por empresa (Multi-Tenant)
- Proteção de rotas por perfil de usuário

#### 2. Painel do Operador (Otimizado para Tablet)
- ✅ Visualização apenas das máquinas vinculadas
- ✅ Botão "Iniciar Turno" - inicia todas as máquinas simultaneamente
- ✅ Botão "EMERGÊNCIA" - para todas as máquinas com registro de motivo
- ✅ Controle individual de cada matriz (Giro/Parada)
- ✅ Botão "Contabilizar Giro" para registro de ciclos
- ✅ Sistema de exclusividade - bloqueio se máquina já em uso
- ✅ Interface com botões grandes para uso em tablet
- ✅ Layout horizontal das máquinas

#### 3. Dashboard Supervisor/Admin
- ✅ Filtros globais (Período, Célula/Grupo, Operador, Máquina)
- ✅ Gráfico de Pareto dinâmico de motivos de parada
- ✅ Comparativo "Ciclos Previstos vs Realizados"
- ✅ Métricas de tempo (Produção, Parada, Eficiência)
- ✅ KPIs visuais em cards

#### 4. Monitoramento em Tempo Real
- ✅ Espelhamento fiel da tela do operador
- ✅ Visualização somente leitura
- ✅ Lista de operadores ativos
- ✅ Status das máquinas de cada operador

#### 5. Painel Master
- ✅ CRUD de empresas
- ✅ Ativar/Desativar empresas
- ✅ Trocar senha de administrador
- ✅ Estatísticas do SaaS

## Tecnologias Utilizadas

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones
- **Date-fns** - Manipulação de datas

## Instalação e Execução

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Passo a Passo

1. **Instalar dependências**
```bash
npm install
```

2. **Executar em modo desenvolvimento**
```bash
npm run dev
```

3. **Acessar a aplicação**
Abra o navegador em: `http://localhost:3000`

4. **Build para produção**
```bash
npm run build
```

## Credenciais de Demonstração

### Master (Desenvolvedor)
- **Email**: master@mes.com
- **Senha**: master123
- **Código MFA**: 123456

### Administrador
- **Email**: admin@empresa.com
- **Senha**: admin123

### Supervisor
- **Email**: supervisor@empresa.com
- **Senha**: super123

### Operador
- **Email**: operador@empresa.com
- **Senha**: oper123

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Operator/       # Componentes do operador
│   ├── Supervisor/     # Componentes do supervisor
│   └── ProtectedRoute.tsx
├── pages/              # Páginas principais
│   ├── LoginPage.tsx
│   ├── Master/
│   ├── Admin/
│   ├── Supervisor/
│   └── Operator/
├── store/              # Gerenciamento de estado (Zustand)
│   ├── authStore.ts
│   └── machineStore.ts
├── types/              # Definições TypeScript
│   └── index.ts
├── App.tsx             # Componente principal
├── main.tsx            # Entry point
└── index.css           # Estilos globais
```

## Requisitos Atendidos do PRD

### Requisitos Funcionais
- ✅ FR002 - Perfis: Master, Admin, Supervisor, Operador
- ✅ FR003 - Segregação de dados por empresa
- ✅ FR004 - Admin com acesso ilimitado
- ✅ FR005 - Cadastros gerais
- ✅ FR008 - Cadastro de máquinas com matrizes
- ✅ FR009 - Operador vê apenas suas máquinas
- ✅ FR010 - Controle por matriz individual
- ✅ FR014 - Gráfico de Pareto
- ✅ FR015 - Espelhamento fiel em tempo real
- ✅ FR016 - Dados de tempo
- ✅ FR017 - Painel Master com MFA
- ✅ FR021 - Botão "Iniciar Turno"
- ✅ FR022 - Botão "Emergência"
- ✅ FR023 - Registro obrigatório de motivo
- ✅ FR026 - Botão "Contabilizar Giro"
- ✅ FR028 - Indicador de ciclos
- ✅ FR044 - Exclusividade de operação
- ✅ FR046 - Mensagem de bloqueio
- ✅ FR050-FR053 - Filtros globais

### Requisitos Não Funcionais
- ✅ NFR001-NFR004 - UX otimizada para tablet
- ✅ NFR057 - Arquitetura Multi-Tenant
- ✅ NFR059 - MFA para Master

## Histórias de Usuário Implementadas

- ✅ US001 - Operador vê apenas suas máquinas com botões grandes
- ✅ US002 - Botão "Iniciar Turno" para start rápido
- ✅ US003 - Controle individual de matrizes
- ✅ US004 - Botão de emergência com registro de motivo
- ✅ US005 - Botão "Contabilizar Giro"
- ✅ US006 - Mensagem de alerta para máquina em uso
- ✅ US011 - Filtros globais no dashboard
- ✅ US012 - Gráfico de Pareto dinâmico
- ✅ US013 - Indicador "Ciclos Previstos vs Realizados"
- ✅ US014 - Espelhamento instantâneo da tela do operador
- ✅ US015 - Painel Master para gestão de empresas
- ✅ US016 - Trocar senha de administrador

## Funcionalidades para Implementação Futura

### Backend (API REST)
- Integração com banco de dados PostgreSQL/MySQL
- API REST com Node.js/Express ou Python/FastAPI
- WebSocket para comunicação em tempo real
- Sistema de logging e auditoria

### Módulos Adicionais
- Módulo PDCA completo (Plan, Do, Check, Act)
- Cadastros do Administrador (usuários, máquinas, motivos, grupos)
- Relatórios e exportação de dados
- Notificações push para supervisores
- Gráficos de tendência histórica

### Melhorias
- Sistema de backup automático
- Integração com sistemas ERP
- App mobile nativo (React Native)
- Modo offline com sincronização

## Roadmap

### Fase 1 - MVP ✅ (Concluída)
- Sistema de autenticação
- Interface do operador
- Dashboard básico
- Espelhamento em tempo real

### Fase 2 - Backend (Próxima)
- API REST completa
- Banco de dados
- WebSocket server
- Sistema de logging

### Fase 3 - Funcionalidades Avançadas
- Módulo PDCA
- Cadastros completos
- Relatórios avançados
- Notificações

### Fase 4 - Otimizações
- Performance
- Testes automatizados
- CI/CD
- Documentação completa

## Suporte e Contato

Para dúvidas ou sugestões, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.

## Licença

Este projeto é proprietário e confidencial.

---

**Desenvolvido com React + TypeScript + Tailwind CSS**
