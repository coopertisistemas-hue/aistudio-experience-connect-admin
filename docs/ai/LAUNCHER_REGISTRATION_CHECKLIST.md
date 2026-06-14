# LAUNCHER REGISTRATION CHECKLIST

Referencia:

- `docs/governance/OPENCODE_GO_LAUNCHER_GOVERNANCE_V1.md`
- `docs/ai/LAUNCHER_CATALOG.md`
- `docs/ai/LAUNCHER_TEST_PROTOCOL.md`

Purpose:
Checklist unica para cadastrar os launchers no OpenCode Go com conformidade de nome, papel, prompt e handoff.

---

# REGRA GERAL

Antes de cadastrar qualquer launcher, confirmar:

- nome exatamente igual ao aprovado
- papel compativel com a governanca
- prompt-base correspondente copiado sem alterar o contrato de saida
- repo correto
- ordem de handoff correta

Nao cadastrar launcher ad hoc fora desta lista.

---

# APPROVED REGISTRATION SET

## 1. `launcher-orchestrator-deepseek-v4`

- Nome cadastrado confere
- Modelo selecionado: DeepSeek V4
- `model_slug`: `opencode-go/deepseek-v4-pro`
- Prompt-base usado:
  - `docs/ai/LAUNCHER_PROMPT_ORCHESTRATOR_DEEPSEEK_V4.md`
- Papel informado: Orchestrator
- Handoff esperado:
  - `launcher-executor-kimi-2-6`
- Validado contra governanca

## 2. `launcher-executor-kimi-2-6`

- Nome cadastrado confere
- Modelo selecionado: Kimi 2.6
- `model_slug`: `opencode-go/kimi-k2.6`
- Prompt-base usado:
  - `docs/ai/LAUNCHER_PROMPT_EXECUTOR_KIMI_2_6.md`
- Papel informado: Executor
- Handoff esperado:
  - `launcher-versioner-glm`
- Validado contra governanca

## 3. `launcher-versioner-glm`

- Nome cadastrado confere
- Modelo selecionado: GLM
- `model_slug`: `opencode-go/glm-5.1`
- Prompt-base usado:
  - `docs/ai/LAUNCHER_PROMPT_VERSIONER_GLM.md`
- Papel informado: Versioner
- Handoff esperado:
  - `launcher-auditor-qwen-3-max`
- Validado contra governanca

## 4. `launcher-versioner-deepseek-v4-flash-fallback`

- Nome cadastrado confere
- Modelo selecionado: DeepSeek V4 Flash
- `model_slug`: `opencode-go/deepseek-v4-flash`
- Prompt-base usado:
  - `docs/ai/LAUNCHER_PROMPT_VERSIONER_DEEPSEEK_V4_FLASH_FALLBACK.md`
- Papel informado: Versioner Fallback
- Handoff esperado:
  - `launcher-auditor-qwen-3-max`
- Validado contra governanca

## 5. `launcher-auditor-qwen-3-max`

- Nome cadastrado confere
- Modelo selecionado: Qwen 3 Max
- `model_slug`: `opencode-go/qwen3.7-max`
- Prompt-base usado:
  - `docs/ai/LAUNCHER_PROMPT_AUDITOR_QWEN_3_MAX.md`
- Papel informado: Auditor
- Handoff esperado:
  - `launcher-auditor-premium-minimax-3-max` quando houver trigger
  - `COMPLETE` quando nao houver trigger
- Validado contra governanca

## 6. `launcher-auditor-premium-minimax-3-max`

- Nome cadastrado confere
- Modelo selecionado: MiniMax 3 Max
- `model_slug`: `opencode-go/minimax-m3`
- Prompt-base usado:
  - `docs/ai/LAUNCHER_PROMPT_AUDITOR_PREMIUM_MINIMAX_3_MAX.md`
- Papel informado: Premium Auditor
- Handoff esperado:
  - `COMPLETE`
- Validado contra governanca

---

# POST-REGISTRATION CHECKS

Depois de cadastrar todos:

- abrir cada launcher no OpenCode Go
- verificar se o nome salvo esta identico ao documento
- confirmar que o prompt nao perdeu blocos na colagem
- confirmar que o modelo selecionado corresponde ao launcher
- validar se a saida esperada segue o contrato do prompt

---

# PILOT READINESS

Marcar pronto apenas quando:

- os 6 launchers estiverem cadastrados
- os 6 nomes estiverem identicos ao padrao
- os prompts-base estiverem corretos
- a sequencia de handoff estiver clara para o operador
- o `LAUNCHER_TEST_PROTOCOL.md` estiver disponivel para o piloto

---

# OPERATOR LOG TEMPLATE

## Repo

## Launcher

## Model

## Registration Status

## Prompt Source

## Handoff Verified

## Notes
