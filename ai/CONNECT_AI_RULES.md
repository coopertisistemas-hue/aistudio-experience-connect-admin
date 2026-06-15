# CONNECT AI RULES

Este documento define as regras obrigatórias que devem ser seguidas por qualquer agente de inteligência artificial que opere neste repositório.

Agentes incluem (mas não se limitam a):

- Codex
- Kimi
- Gemini
- Claude
- DeepSeek
- Qwen
- MiniMax
- outros agentes de desenvolvimento assistido por IA

O objetivo destas regras é preservar a integridade da arquitetura, garantir segurança e manter consistência entre todos os projetos do ecossistema Connect.

---

# Princípios Fundamentais

1. A arquitetura do sistema é definida por humanos.
2. Agentes de IA executam tarefas específicas.
3. Alterações devem ser mínimas e auditáveis.

Sempre preferir **patch mínimo**.

---

# Escopo de Atuação

Agentes devem atuar apenas no escopo solicitado no prompt.

Não explorar o repositório inteiro sem necessidade.
Não modificar arquivos fora do escopo.

---

# Refactor

Refactors amplos são proibidos.

Não realizar:

- reorganização estrutural do projeto
- renomeação massiva de arquivos
- alteração de arquitetura
- mudanças de design system

Sem autorização explícita.

---

# Banco de Dados

Agentes não devem alterar:

- schema
- migrations
- policies RLS
- estrutura multi-tenant

Sem escopo explícito definido.

---

# Multi-Tenant

O modelo multi-tenant é obrigatório em todos os projetos Connect.

`org_id` nunca deve ser removido de:

- queries
- contextos
- policies
- funções
- validações

---

# Segurança

Em ambiente de produção:

- não logar tokens
- não logar org_id
- não logar credenciais
- não expor dados sensíveis no console

Logs detalhados são permitidos apenas em ambiente de desenvolvimento local.

---

# UI e Design System

Mudanças de UI devem respeitar:

- design system Connect
- padrão visual premium consistente
- hierarquia tipográfica definida

Não alterar estilos globais sem autorização.

---

# Performance

Evitar:

- loops desnecessários
- queries não filtradas
- leitura completa de grandes coleções

Sempre preferir operações eficientes.

---

# Validação

Após alterações, agentes devem:

1. explicar causa raiz
2. listar arquivos alterados
3. fornecer diff mínimo
4. descrever validação realizada

---

# Uso de IA no Projeto

Fluxo oficial:

Orchestrator → Executor → Versioner → Auditor

Onde:

Orchestrator = DeepSeek V4 Pro
Executor = Kimi K2.6
Versioner = GLM 5.1
Auditor = Qwen 3.7 Max
Premium Auditor = Codex

---

# Regra de Ouro

IA executa tarefas.

Arquitetura e decisões estratégicas são responsabilidade humana.
