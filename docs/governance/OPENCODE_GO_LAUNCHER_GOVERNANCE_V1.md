# OPENCODE GO LAUNCHER GOVERNANCE V1

Project:
Experience Connect Admin

Mode:
STRICT

Governance:
MANDATORY

Purpose:
Padronizar a nomenclatura, o papel, o handoff e os limites operacionais dos launchers usados no OpenCode Go dentro do modelo de governanca Connect.

---

# APPROVED LAUNCHER SET

Os launchers aprovados para o Experience Connect Admin sao:

1. `launcher-orchestrator-deepseek-v4`
2. `launcher-executor-kimi-2-6`
3. `launcher-versioner-glm`
4. `launcher-versioner-deepseek-v4-flash-fallback`
5. `launcher-auditor-qwen-3-max`
6. `launcher-auditor-premium-minimax-3-max`

Nao criar aliases fora deste padrao.

Nao alternar nomes entre repos.

Nao usar nomes curtos ambiguos como `kimi-exec`, `audit-premium` ou `main-orchestrator`.

---

# NAMING STANDARD

Todo launcher deve seguir exatamente:

`launcher-<papel>-<modelo>`

Onde:

- `<papel>` pertence ao conjunto controlado: `orchestrator`, `executor`, `versioner`, `auditor`, `auditor-premium`
- `<modelo>` identifica o modelo com slug estavel e legivel

Regras:

- usar apenas minusculas
- separar termos com hifen
- nao usar espacos
- nao usar versoes abreviadas obscuras
- preservar o mesmo slug entre repos e ciclos de teste

---

# ROLE CONTRACT

## `launcher-orchestrator-deepseek-v4`

Responsabilidade:
- decompor escopo
- definir plano executavel
- delimitar arquivos e validacoes
- preparar handoff para execucao

Proibicoes:
- nao editar codigo
- nao commitar
- nao auditar como papel primario

Saida obrigatoria:
- status do sprint
- escopo aprovado
- arquivos alvo
- criterios de aceite
- validacao exigida
- riscos e bloqueios
- proximo launcher

## `launcher-executor-kimi-2-6`

Responsabilidade:
- implementar o menor patch seguro
- executar validacao tecnica
- reportar o que mudou com evidencia

Proibicoes:
- nao redefinir escopo
- nao inventar requisitos
- nao gerar changelog final como source of truth

Saida obrigatoria:
- implementacao realizada
- arquivos alterados
- validacoes rodadas
- resultados
- riscos residuais
- recomendacao de handoff

## `launcher-versioner-glm`

Responsabilidade:
- gerar conventional commit em portugues
- resumir diff real
- preparar texto de PR, changelog e release note curto

Proibicoes:
- nao decidir escopo
- nao revisar seguranca como gate final
- nao resumir mudanca inexistente

Saida obrigatoria:
- titulo de commit
- corpo de commit
- resumo de PR
- changelog curto

## `launcher-versioner-deepseek-v4-flash-fallback`

Responsabilidade:
- substituir o versionador principal quando GLM falhar, degradar ou sair do formato

Proibicoes:
- mesmas do versionador principal

Saida obrigatoria:
- mesma estrutura do versionador principal

## `launcher-auditor-qwen-3-max`

Responsabilidade:
- revisar diff e comportamento com foco em bug, regressao, tenancy, impacto funcional e lacuna de testes

Proibicoes:
- nao reimplementar solucao
- nao expandir escopo
- nao aprovar sem evidencias minimas

Saida obrigatoria:
- findings por severidade
- evidencia
- reproducao
- risco residual
- gate: aprovado, aprovado com ressalvas ou reprovado

## `launcher-auditor-premium-minimax-3-max`

Responsabilidade:
- segunda auditoria para mudancas criticas
- arbitrar risco alto em pagamentos, RLS, auth, PII, migracoes, concorrencia e fronteiras multi-tenant

Proibicoes:
- nao atuar em tarefas triviais por padrao
- nao substituir auditor normal em rotina de baixo risco

Saida obrigatoria:
- findings criticos
- confirmacao ou contestacao do auditor padrao
- decisao final de risco

---

# HANDOFF ORDER

Fluxo padrao:

1. `launcher-orchestrator-deepseek-v4`
2. `launcher-executor-kimi-2-6`
3. `launcher-versioner-glm`
4. `launcher-auditor-qwen-3-max`

Fluxo com fallback de versionamento:

1. `launcher-orchestrator-deepseek-v4`
2. `launcher-executor-kimi-2-6`
3. `launcher-versioner-deepseek-v4-flash-fallback`
4. `launcher-auditor-qwen-3-max`

Fluxo critico:

1. `launcher-orchestrator-deepseek-v4`
2. `launcher-executor-kimi-2-6`
3. `launcher-versioner-glm`
4. `launcher-auditor-qwen-3-max`
5. `launcher-auditor-premium-minimax-3-max`

---

# PREMIUM AUDIT TRIGGERS

Acionar `launcher-auditor-premium-minimax-3-max` quando houver:

- alteracao de RLS
- migration SQL
- auth, sessao ou permissao
- pagamentos, repasses ou conciliacao
- PII ou dados sensiveis
- alteracao em Edge Functions criticas
- risco de boundary multi-tenant
- divergencia relevante entre executor e auditor

---

# OUTPUT NORMALIZATION

Todos os launchers devem:

- responder de forma curta e operacional
- separar fato observado de inferencia
- apontar arquivos, comandos e evidencias quando aplicavel
- declarar claramente `PASS`, `FAIL`, `PENDING`, `APPROVED`, `REJECTED` ou `BLOCKED`

Nao usar resposta vaga como:

- "parece bom"
- "deve funcionar"
- "provavelmente ok"

---

# CHANGE CONTROL

Qualquer alteracao nesta matriz exige:

1. atualizar este documento
2. atualizar `docs/ai/LAUNCHER_CATALOG.md`
3. manter os mesmos nomes nos repos Connect
