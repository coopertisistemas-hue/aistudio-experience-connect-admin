# CONNECT EXECUTION GOVERNANCE REFERENCE

## Official Governance Source

This repository follows the Connect Execution Governance standard **and** maintains product-specific governance locally.

### Primary (Local)

- **Repository:** `aistudio-experience-connect-admin`
- **Path:** `AGENTS.md` — Authority hierarchy, agent roles, operating standard
- **Path:** `AI_RULES.md` — Security, workflow, quality gates, UI standards
- **Path:** `docs/governance/CONNECT_EXECUTION_GOVERNANCE_V1.md` — Sprint scope, execution rules

### Secondary (Ecosystem — Portal Connect)

The ecosystem-wide governance standard used as reference and fallback for cross-product rules:

- **Repository:** `aistudio-portal-connect-admin`
- **Path:** `docs/governance/CONNECT_EXECUTION_GOVERNANCE_V1.md`

## Master Execution Plan

The ecosystem master execution plan is located in:

- **Repository:** `aistudio-portal-connect-admin`
- **Path:** `docs/architecture/PORTAL_CONNECT_MASTER_EXECUTION_PLAN_V2.md`

The product-specific execution plan is located in:

- **Repository:** `aistudio-experience-connect-admin`
- **Path:** `docs/EXECUTION/EXPERIENCE_CONNECT_FULL_INVENTORY_AND_EXEC_PLAN.md`

## Audit Reports

The approved ecosystem audit reports are located in:

- **Repository:** `aistudio-portal-connect-admin`
- **Path:** `PORTAL_CONNECT_ECOSYSTEM_AUDIT_A.md`
- **Path:** `PORTAL_CONNECT_ECOSYSTEM_AUDIT_B.md`
- **Path:** `PORTAL_CONNECT_ECOSYSTEM_AUDIT_C.md`
- **Path:** `PORTAL_CONNECT_ECOSYSTEM_AUDIT_D.md`

## Governance Rule

This repository's local governance (`AGENTS.md`, `AI_RULES.md`, `docs/governance/`) is the primary authority for product-specific execution. The portal-connect-admin governance serves as the ecosystem-wide fallback for cross-product rules. Conflicts are resolved in this order:

1. `AGENTS.md` (repo root)
2. `AI_RULES.md` (repo root)
3. `docs/governance/` (local governance)
4. `aistudio-portal-connect-admin` (ecosystem standard)
