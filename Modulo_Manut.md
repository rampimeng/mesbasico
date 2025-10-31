🧩 1. Contexto do projeto

O sistema é um MES expandido (MESS) que gerencia produção e chão de fábrica, e terá um módulo independente de Gestão da Manutenção Industrial (GMI).

Este módulo deve atender às áreas de manutenção corretiva, preventiva e preditiva, integrando-se aos equipamentos cadastrados no módulo de produção.

O objetivo é:

Reduzir paradas não programadas

Planejar intervenções de manutenção

Gerenciar recursos, custos e disponibilidade das máquinas

Gerar indicadores de performance da manutenção

⚙️ 2. Escopo funcional — o que o software precisa ter
2.1. Cadastros básicos

Máquinas / Equipamentos

Código, nome, área, linha, setor

Fabricante, modelo, número de série

Data de aquisição

Tempo médio entre falhas (MTBF)

Tempo médio de reparo (MTTR)

Responsável técnico

Status (ativo/inativo)

Componentes / Peças / Itens de manutenção

Código interno

Descrição

Unidade de medida

Estoque atual

Estoque mínimo

Custo unitário

Fornecedor padrão

Planos de manutenção

Tipo (preventiva, corretiva, preditiva, lubrificação, calibração)

Frequência (dias, horas de máquina, ciclos, contadores)

Instruções detalhadas

Checklists de execução

Responsável pela execução

Documentos anexos (fotos, manuais, fichas técnicas)

Ordens de serviço (OS)

Número da OS

Tipo (corretiva / preventiva / emergencial / inspeção)

Equipamento associado

Data de abertura / fechamento

Causa da falha

Descrição da intervenção

Tempo de execução

Materiais utilizados

Custos (mão de obra + peças)

Status (aberta, em andamento, finalizada, cancelada)

Pessoas e equipes

Técnico / mecânico / eletricista

Função

Habilidades / certificações

Disponibilidade (escala, plantão)

Fornecedores

Razão social

Contato

Tipos de serviço prestado

SLA de atendimento

2.2. Funcionalidades operacionais

Abertura automática de OS preventiva conforme calendário ou horas de operação.

Gatilhos de OS corretiva ao registrar uma falha no equipamento (integração com módulo MES).

Aprovação de OS (níveis hierárquicos de aprovação).

Checklist digital de execução (com campo de assinatura do executor).

Controle de parada de máquina, vinculando tempo de indisponibilidade.

Controle de materiais utilizados na manutenção, com baixa de estoque automática.

Histórico completo por equipamento (OS, peças trocadas, custos, tempo de parada).

Alertas e notificações:

Preventivas vencendo

Equipamentos com MTBF abaixo do limite

Estoque de peças críticas baixo

Dashboards de manutenção (indicadores em tempo real).

📊 3. Indicadores e relatórios (KPIs)

MTBF (Mean Time Between Failures)

MTTR (Mean Time To Repair)

Disponibilidade do equipamento (%)

Confiabilidade do equipamento (%)

Cumprimento do plano de manutenção preventiva (%)

Custo de manutenção por máquina / linha / mês

Tempo total de parada (por tipo de manutenção)

Relação preventiva x corretiva (%)

Tempo médio de atendimento (lead time de OS)

Ranking de máquinas com mais falhas

Cada indicador deve ser gerado automaticamente com base nos registros de OS e nas integrações com o módulo de produção.

🔗 4. Integrações necessárias

Com módulo de produção (MES):

Ler status da máquina (rodando / parada)

Registrar automaticamente paradas e tempos

Receber contadores de ciclo / hora de máquina

Com estoque / almoxarifado:

Para baixa automática de peças utilizadas

Com módulo de pessoas / RH:

Escala de técnicos

Com Power BI ou dashboard interno:

Visualização em tempo real dos KPIs

🧱 5. Requisitos técnicos

Frontend: React, Vue ou Angular (UI responsiva, PWA opcional)

Backend: Node.js / Python / .NET Core

Banco de dados: PostgreSQL ou MySQL

APIs RESTful para integração com outros módulos

Autenticação: JWT / OAuth2

Controle de acesso: permissões por papel (técnico, gestor, administrador)

Logs de auditoria: rastrear toda alteração ou exclusão

Deploy: compatível com Docker / Kubernetes

🧠 6. Transcrição pronta para IA gerar o sistema

Segue o prompt que você pode copiar e colar diretamente em uma IA de desenvolvimento (por exemplo, um gerador de código completo ou LLM com agente de engenharia):

Prompt para IA:

Quero que você desenvolva um módulo de Gestão da Manutenção Industrial (GMI) que fará parte de um software MES expandido (MESS).

O sistema deve incluir todos os cadastros, telas, integrações, e indicadores necessários para gerenciar manutenção corretiva, preventiva e preditiva.

Escopo detalhado:

Cadastros: máquinas, componentes, planos de manutenção, ordens de serviço, pessoas, fornecedores.

Funcionalidades: abertura automática de OS, controle de paradas, checklist digital, histórico por equipamento, notificações automáticas e dashboards de manutenção.

Indicadores: MTBF, MTTR, disponibilidade, confiabilidade, custo por máquina, cumprimento de plano preventivo, relação preventiva x corretiva.

Integrações: com módulo de produção (status e paradas), estoque (baixa de peças), e RH (escala de técnicos).

Relatórios e dashboards automáticos com filtros por linha, máquina e período.

Requisitos técnicos:

Frontend em React (UI moderna e responsiva).

Backend em Node.js com banco PostgreSQL.

APIs RESTful, autenticação JWT, e controle de acesso por função.

Suporte a contadores automáticos de hora de máquina vindos do módulo MES.

Geração automática de OS preventivas conforme calendário ou horas de uso.

Geração automática dos indicadores em tempo real.

Gere toda a estrutura de banco, API e interface conforme esse escopo, com código limpo, modular e documentado.