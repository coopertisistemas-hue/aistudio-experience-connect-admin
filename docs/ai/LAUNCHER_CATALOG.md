# Launcher Catalog

Catalogo operacional dos launchers aprovados para OpenCode Go no ecossistema Experience Connect.

Referencia normativa:

- `docs/governance/OPENCODE_GO_LAUNCHER_GOVERNANCE_V1.md`

## Launcher Set

### `launcher-orchestrator-deepseek-v4`
- Papel: orquestracao
- Modelo: DeepSeek V4
- `model_slug`: `opencode-go/deepseek-v4-pro`
- Entrada: objetivo, contexto, limites de escopo, docs relevantes
- Saida: plano, arquivos alvo, criterios de aceite, riscos, handoff para executor
- Nao faz: codigo, commit, auditoria final

### `launcher-executor-kimi-2-6`
- Papel: execucao
- Modelo: Kimi 2.6
- `model_slug`: `opencode-go/kimi-k2.6`
- Entrada: plano aprovado do orquestrador
- Saida: patch, validacoes, riscos residuais, handoff para versionador
- Nao faz: redefinicao de escopo, aprovacao final de risco

### `launcher-versioner-glm`
- Papel: versionamento
- Modelo: GLM
- `model_slug`: `opencode-go/glm-5.1`
- Entrada: diff real, resultado de validacao, contexto curto da entrega
- Saida: conventional commit em portugues, resumo de PR, changelog curto
- Nao faz: auditoria, redefinicao de objetivo

### `launcher-versioner-deepseek-v4-flash-fallback`
- Papel: versionamento fallback
- Modelo: DeepSeek V4 Flash
- `model_slug`: `opencode-go/deepseek-v4-flash`
- Entrada: mesma do versionador principal
- Saida: mesma do versionador principal
- Quando usar: falha, instabilidade ou saida fora do formato do GLM

### `launcher-auditor-qwen-3-max`
- Papel: auditoria padrao
- Modelo: Qwen 3 Max
- `model_slug`: `opencode-go/qwen3.7-max`
- Entrada: diff, contexto do sprint, validacoes executadas
- Saida: findings por severidade, evidencia, riscos, decisao de gate
- Nao faz: implementar mudanca como comportamento padrao

### `launcher-auditor-premium-minimax-3-max`
- Papel: auditoria premium
- Modelo: MiniMax 3 Max
- `model_slug`: `opencode-go/minimax-m3`
- Entrada: tudo que o auditor padrao recebeu, mais riscos criticos quando houver
- Saida: decisao critica final, contestacao ou confirmacao do auditor padrao
- Quando usar: RLS, auth, pagamentos, PII, migrations, concorrencia, tenant boundary

## Sequencia Padrao

1. `launcher-orchestrator-deepseek-v4`
2. `launcher-executor-kimi-2-6`
3. `launcher-versioner-glm`
4. `launcher-auditor-qwen-3-max`

## Sequencia Critica

1. `launcher-orchestrator-deepseek-v4`
2. `launcher-executor-kimi-2-6`
3. `launcher-versioner-glm`
4. `launcher-auditor-qwen-3-max`
5. `launcher-auditor-premium-minimax-3-max`

## Regras de Conformidade

- Nao renomear launchers por repo.
- Nao usar variantes ad hoc.
- Nao trocar a ordem sem justificativa de risco.
- Nao acionar auditor premium em mudanca trivial.
- Se houver fallback, declarar explicitamente no log operacional.
