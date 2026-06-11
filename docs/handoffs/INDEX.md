# HANDOFFS — Agent Handoff Registry

**Version:** 1.0  
**Updated:** 2026-06-11  

---

## Handoff Protocol

1. **Origem** → Prepara prompt completo com contexto, arquivos, padrões e regras.
2. **Destino** → Executa tarefa e produz relatório.
3. **Validação** → Codex review + gates obrigatórios.
4. **Entrega** → Relatório + diff + evidências.

## Handoff Log

| # | De | Para | Sprint | Status | Data |
|---|----|------|--------|--------|------|
| H-01 | DeepSeek | Kimi | S0.1 — Governance Inventory | ✅ COMPLETE | 2026-06-11 |

---

## Template de Handoff

```markdown
## Handoff: <Sprint ID>

### Contexto
<brief description>

### Arquivos
- <file paths>

### Padrões
- <relevant patterns>

### Gates
- [ ] tsc --noEmit
- [ ] pnpm lint
- [ ] pnpm build
- [ ] codex review

### Critérios de Aceitação
- <list>
```
