# Product Requirements Document (PRD) - SaaS MES App

## 1. Introdução

### 1.1. Propósito

Este PRD define os requisitos funcionais e não funcionais para o desenvolvimento de um aplicativo **Software as a Service (SaaS)** de *Manufacturing Execution System* (MES) focado na coleta de dados de produção em tempo real via tablet.

### 1.2. Metas do Produto

1. **Garantir a precisão** dos dados de tempo de máquina (Giro vs. Parada).
2. **Facilitar a operação** em ambiente de chão de fábrica (tablet, botões grandes).
3. **Habilitar a melhoria contínua** através da análise de Pareto e do módulo PDCA.
4. **Prover visibilidade instantânea** da produção para Supervisor e Administrador.

---

## 2. Requisitos de Acesso e Segurança (Perfis e Regras)

O sistema deve suportar quatro perfis, com regras rígidas de segregação de dados.

| ID | Perfil | Acesso | Detalhes |
| --- | --- | --- | --- |
| FR017 | **Usuário Master** (Desenvolvedor) | Painel de Gestão SaaS | CRUD de empresas; Troca de senha do Admin da empresa; Inativar empresa. **Segurança: MFA obrigatório** (NFR059). |
| FR002 | **Administrador** (Admin) | Empresa | **Ilimitado** (FR004 R1); Realiza todos os cadastros; Define permissões de acesso (FR007); Acesso total ao Dashboard e PDCA. |
| FR002 | **Supervisor** | Empresa | Acesso total ao Dashboard, Pareto, Ciclos e Monitoramento em Tempo Real (Espelhamento). |
| FR002 | **Operador** | Empresa | Restrito às suas máquinas vinculadas; Controle de Status (Giro/Parada/Emergência). |

Exportar para as Planilhas

### Regras Críticas de Exclusividade

| ID | Requisito | Regra de Negócio |
| --- | --- | --- |
| FR003 | **Segregação de Dados** | Cada usuário só pode ver dados referentes à **sua empresa**. |
| FR044 | **Exclusividade de Operação** | Se uma **Máquina** ou **Grupo/Célula** estiver vinculado a múltiplos Operadores, a exclusividade é do **primeiro Operador a logar e iniciar a produção** (FR048). |
| FR046 | **Mensagem de Bloqueio** | Operador bloqueado deve receber a mensagem: **"O grupo de máquina que você está alocado já está em produção, procure o supervisor"**. |

Exportar para as Planilhas

---

## 3. Requisitos Funcionais (RFs)

### 3.1. Cadastros (Administrador)

| ID | Requisito | Detalhes |
| --- | --- | --- |
| FR005 | **Cadastros Gerais** | Gerenciar Usuários, Motivos de Parada (para Pareto), Grupos/Células. |
| FR008 R1 | **Cadastro de Máquinas** | Informar: **Quantidade de Matrizes** que a máquina suporta (não o nome); **Tempo de Ciclo Padrão** (para cálculo de meta); **Vinculação** a Operador(es) e Grupo/Célula (opcional). |
| FR025 | **Ciclos Previstos (Meta)** | O Admin deve ser capaz de **cadastrar a meta** de Ciclos Previstos para o período, ou o sistema deve calcular baseado no Tempo de Ciclo e Turno. |

Exportar para as Planilhas

### 3.2. Operação (Operador)

A interface deve ser otimizada para *tablet* (NFR004).

| ID | Requisito | Detalhes |
| --- | --- | --- |
| FR009 | **Visualização** | O Operador só visualiza as máquinas vinculadas a ele. |
| FR021 | **Ação Rápida: Iniciar Turno** | Botão único que inicia o status **"Giro Normal"** em **todas as máquinas e matrizes** vinculadas simultaneamente. |
| FR022 | **Ação Crítica: Emergência** | Botão que **para todas as máquinas e matrizes** simultaneamente, exigindo o registro obrigatório de um **Motivo de Parada** (FR023). |
| FR010 R1 | **Controle por Matriz** | Deve ser possível alterar o status (Giro Normal/Parada com Motivo) de **cada matriz individualmente**, contabilizando o tempo separado. |
| FR026 | **Apontamento de Giro** | Botão **"Contabilizar Giro"** que registra a conclusão de um ciclo completo, gerando o dado de **"Ciclos Realizados"**. |

Exportar para as Planilhas

### 3.3. Dashboard e Monitoramento (Supervisor e Admin)

O dashboard utiliza **Filtros Globais** (FR050-FR053): **Período, Célula/Grupo, Operador, Máquina**.

| ID | Requisito | Métrica/Visualização |
| --- | --- | --- |
| FR014 | **Gráfico de Pareto** | Visualização principal que exibe os motivos de parada mais frequentes (tempo), ordenados do maior para o menor. Deve incluir paradas de **"Emergência"** (FR024) e ser **dinâmico por filtro** (FR055). |
| FR028 | **Indicador de Ciclos** | Comparativo visual: **"Ciclos Previstos"** (Meta) **vs. "Ciclos Realizados"** (Apontamento). |
| FR016 | **Dados de Tempo** | Tempo em Produção (Giro), Tempo em Parada Total e Tempo por Motivo de Parada, por recurso. |
| FR015 R1 | **Espelhamento Fiel** | Ao clicar no Operador, abre uma **cópia exata e instantânea (sub-segundo)** de sua tela (somente leitura - FR041). |

Exportar para as Planilhas

### 3.4. Módulo de Melhoria Contínua (PDCA)

| ID | Fase | Detalhes |
| --- | --- | --- |
| FR032 | **Plan (Seleção)** | Admin seleciona um **Período Base (Mês)** e o **Escopo de Filtros** (Célula, Máquina, Operador) para análise. |
| FR033 R1 | **Gravação Fiel (Baseline)** | O sistema **congela/grava uma cópia fiel** dos dados de desempenho e **do escopo de filtros** daquele período. |
| FR034 | **Plan (Definição)** | Cadastrar **Metas (Estado Futuro)** para KPIs e as **Ações** a serem implementadas. |
| FR036 R1 | **Check (Comparação)** | Relatório que compara o **Baseline Congelado** com o **Período Pós-Plano**, **utilizando exatamente os mesmos filtros de escopo originais** para garantir a comparação "igual com igual". |
| FR037 | **Act (Ajuste)** | Registrar conclusões e planos de Padronização ou Novo Ciclo PDCA. |

Exportar para as Planilhas

---

## 4. Requisitos Não Funcionais (NFRs)

| Categoria | ID | Requisito |
| --- | --- | --- |
| **UX/Usabilidade** | NFR001 | **Responsividade de Tablet** com tema claro (NFR003) e botões grandes (NFR004). |
|  | NFR002 | **Layout Horizontal** das máquinas na tela do Operador. |
| **Arquitetura** | NFR057 | Arquitetura **Multi-Tenant (SaaS)** com isolamento de dados de empresa (FR003). |
|  | NFR058 | **Escalabilidade Horizontal** para suportar o crescimento de empresas e máquinas. |
|  | NFR061 | Uso de **WebSockets** ou similar para a comunicação em Tempo Real. |
| **Segurança** | NFR059 | **MFA** obrigatório para o Usuário Master. |
|  | NFR060 | Criptografia **TLS/SSL** e armazenamento seguro de credenciais. |


## Histórias de Usuário (User Stories)

### 1. Perfil: Operador 👷 (Foco na Eficiência e Usabilidade)

| ID | Requisito Base | História de Usuário |
| --- | --- | --- |
| US001 | FR009, NFR004 | **Como Operador**, eu quero ver apenas **as máquinas vinculadas a mim** em uma única linha horizontal, com botões grandes, para começar meu trabalho de forma rápida e ergonômica. |
| US002 | FR021, FR010 R1 | **Como Operador**, eu quero ter um **botão "Iniciar Turno"** para dar *start* em todas as minhas máquinas e matrizes de uma vez, economizando tempo no início da produção. |
| US003 | FR012 | **Como Operador**, eu quero poder informar o **status de Giro ou Parada individualmente para cada matriz** de uma máquina, para que a contabilização do tempo seja precisa. |
| US004 | FR022, FR023 | **Como Operador**, eu quero ter um **"Botão de Emergência"** que pare tudo e me force a registrar o motivo, para lidar com problemas críticos imediatamente. |
| US005 | FR026 | **Como Operador**, eu quero ter um **botão "Contabilizar Giro"** para registrar de forma simples a conclusão de um ciclo de produção. |
| US006 | FR046, FR049 | **Como Operador**, eu quero receber uma **mensagem de alerta** se uma máquina já estiver em uso por outro colega, para evitar conflito de dados e buscar o supervisor. |

Exportar para as Planilhas

### 2. Perfil: Administrador 👑 (Foco na Configuração e Melhoria)

| ID | Requisito Base | História de Usuário |
| --- | --- | --- |
| US007 | FR008 R1, FR025 | **Como Administrador**, eu quero cadastrar uma máquina informando a **quantidade de matrizes e o tempo de ciclo padrão**, para configurar a capacidade produtiva e as metas de ciclo. |
| US008 | FR005, FR007 | **Como Administrador**, eu quero **gerenciar todos os cadastros** (máquinas, motivos, usuários) e definir as **permissões de acesso** do Supervisor e Operador, mantendo o controle do sistema. |
| US009 | FR031, FR032 | **Como Administrador**, eu quero criar um **Plano de Ação PDCA** selecionando um **período e escopo (filtros)** de dados, para formalizar uma iniciativa de melhoria. |
| US010 | FR033 R1, FR036 R1 | **Como Administrador**, eu quero que o sistema **congele o *baseline*** do período/escopo original do PDCA, para que a **comparação (*Check*) seja feita sempre com o mesmo conjunto de dados**. |

Exportar para as Planilhas

### 3. Perfil: Supervisor e Administrador 🧠 (Foco no Monitoramento e Análise)

| ID | Requisito Base | História de Usuário |
| --- | --- | --- |
| US011 | FR050, FR053 | **Como Supervisor/Admin**, eu quero aplicar **filtros por Período, Célula, Operador e Máquina** no *dashboard*, para focar rapidamente no desempenho que preciso analisar. |
| US012 | FR014, FR055 | **Como Supervisor/Admin**, eu quero ver um **Gráfico de Pareto dinâmico** que se atualiza com base nos meus filtros, para identificar imediatamente os problemas de maior impacto. |
| US013 | FR028 | **Como Supervisor/Admin**, eu quero visualizar o indicador **"Ciclos Previstos vs. Realizados"**, para medir a cadência de produção em relação à meta. |
| US014 | FR015 R1 | **Como Supervisor/Admin**, eu quero clicar no nome de um Operador Ativo e ver um **espelhamento fiel e instantâneo** de sua tela, para fornecer suporte ou verificar o *status* sem ir ao chão de fábrica. |

Exportar para as Planilhas

### 4. Perfil: Usuário Master (Desenvolvedor) 👨‍💻 (Foco na Gestão do SaaS)

| ID | Requisito Base | História de Usuário |
| --- | --- | --- |
| US015 | FR018 | **Como Usuário Master**, eu quero ter um painel para **adicionar, editar e desabilitar empresas**, gerenciando a base de clientes do SaaS. |
| US016 | FR020 | **Como Usuário Master**, eu quero poder **trocar a senha de qualquer Administrador de empresa**, para resolver problemas de acesso do cliente. |