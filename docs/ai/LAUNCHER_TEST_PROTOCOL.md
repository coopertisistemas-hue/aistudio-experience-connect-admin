# LAUNCHER TEST PROTOCOL

Referencia:

- `AGENTS.md`
- `docs/governance/OPENCODE_GO_LAUNCHER_GOVERNANCE_V1.md`
- `docs/ai/LAUNCHER_CATALOG.md`

Project:
Experience Connect Admin

Purpose:
Validar a qualidade operacional dos launchers do OpenCode Go em tarefas reais, com scorecard unico e criterio de aprovacao objetivo.

---

# APPROVED LAUNCHERS UNDER TEST

1. `launcher-orchestrator-deepseek-v4`
2. `launcher-executor-kimi-2-6`
3. `launcher-versioner-glm`
4. `launcher-versioner-deepseek-v4-flash-fallback`
5. `launcher-auditor-qwen-3-max`
6. `launcher-auditor-premium-minimax-3-max`

---

# TEST PRINCIPLES

- testar em tarefas pequenas e medias antes de mudancas criticas
- medir comportamento real, nao impressao subjetiva
- registrar saida integral ou resumo fiel de cada launcher
- comparar contra escopo aprovado e resultado observado
- nao ajustar prompt durante o mesmo teste sem registrar a mudanca

---

# TEST FLOW

## Flow A — Standard

1. `launcher-orchestrator-deepseek-v4`
2. `launcher-executor-kimi-2-6`
3. `launcher-versioner-glm`
4. `launcher-auditor-qwen-3-max`

## Flow B — Versioner Fallback

1. `launcher-orchestrator-deepseek-v4`
2. `launcher-executor-kimi-2-6`
3. `launcher-versioner-deepseek-v4-flash-fallback`
4. `launcher-auditor-qwen-3-max`

## Flow C — Critical

1. `launcher-orchestrator-deepseek-v4`
2. `launcher-executor-kimi-2-6`
3. `launcher-versioner-glm`
4. `launcher-auditor-qwen-3-max`
5. `launcher-auditor-premium-minimax-3-max`

---

# RECOMMENDED TEST TASKS

## Task 1 — Small Maintenance

Tipo:
- ajuste localizado

Objetivo:
- validar disciplina de escopo, patch minimo e handoff basico

Exemplos:
- correcao pequena de UI admin
- texto incorreto
- bug simples de estado ou tabela

Fluxo:
- Flow A

## Task 2 — Medium Functional Change

Tipo:
- alteracao funcional com impacto moderado

Objetivo:
- validar decomposicao do orquestrador e capacidade do executor de fechar tarefa com validacao

Exemplos:
- melhoria em filtro admin
- ajuste de listagem com regra de negocio
- correcao de fluxo de configuracao

Fluxo:
- Flow A

## Task 3 — Security Or Boundary Review

Tipo:
- tarefa de risco alto ou auditoria de diff sensivel

Objetivo:
- validar se auditor e auditor premium identificam risco real sem inflar falso positivo

Exemplos:
- auth guard
- permission check
- tenancy boundary
- migration com impacto de acesso

Fluxo:
- Flow C

---

# SCORECARD

Pontuar cada item de 1 a 5.

## Orchestrator Score

- clareza do diagnostico
- delimitacao de escopo
- precisao dos arquivos alvo
- qualidade dos criterios de aceite
- disciplina de nao expandir escopo

## Executor Score

- qualidade tecnica do patch
- aderencia ao escopo
- preservacao de padroes do repo
- qualidade de validacao
- taxa de conclusao end-to-end

## Versioner Score

- fidelidade ao diff real
- qualidade do commit
- qualidade do resumo de PR
- utilidade do changelog
- conformidade de formato

## Auditor Score

- severidade correta
- evidencia objetiva
- deteccao de regressao
- deteccao de risco de tenancy ou seguranca
- taxa de falso positivo aceitavel

## Premium Auditor Score

- profundidade da revisao critica
- capacidade de contestar auditor fraco
- foco apenas no risco relevante
- qualidade da decisao final
- utilidade para go/no-go

---

# PASS CRITERIA

Um launcher passa no piloto se:

- media geral >= 4.0
- nenhum item critico abaixo de 3
- nao houver quebra recorrente de formato
- nao houver desvio grave de papel

Itens criticos:

- orquestrador: delimitacao de escopo
- executor: qualidade tecnica do patch
- versionador: fidelidade ao diff
- auditor: severidade correta
- premium auditor: qualidade da decisao final

---

# FAILURE CRITERIA

Reprovar ou reconfigurar launcher quando houver:

- expansao recorrente de escopo
- falsificacao de validacao
- resumo desconectado do diff real
- auditoria superficial em risco alto
- excesso de falso positivo que inviabiliza uso operacional
- saida fora do contrato em mais de um teste

---

# EVIDENCE TEMPLATE

Para cada teste registrar:

## Test ID

## Repo

## Task Type

## Launcher

## Input Summary

## Output Summary

## Observed Quality

## Score 1-5

## Pass / Fail

## Notes

---

# FINAL DECISION TEMPLATE

## Launcher

## Average Score

## Strengths

## Weaknesses

## Keep / Keep With Changes / Replace

## Recommended Prompt Adjustments
