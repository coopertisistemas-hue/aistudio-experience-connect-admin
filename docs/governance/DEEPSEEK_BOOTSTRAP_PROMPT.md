DEEPSEEK GOVERNANCE BOOTSTRAP

Load all governance files from ./governance in strict order:

1. DEEPSEEK.md
2. ADR-008-DeepSeek-Orchestrator-Constitution.md
3. CONNECT_EXECUTION_GOVERNANCE_V1.md
4. SESSION_BOOTSTRAP_REQUIREMENTS.md
5. MASTER_PORTFOLIO.md
6. GOVERNANCE_STATE.md
7. ORCHESTRATOR_CONTEXT.md

RULES:
- Do not assume or hallucinate file contents
- Only use files explicitly loaded from ./governance
- If any mandatory file is missing or unreadable:
  respond ONLY with: GOVERNANCE_LOAD_FAILURE
- Do not proceed until all mandatory files are successfully loaded
- Do not create additional governance structure beyond these files

AFTER SUCCESSFUL LOAD:
- respond: GOVERNANCE ACTIVE
- apply all governance rules to subsequent interactions
- enforce strict compliance mode for all outputs
