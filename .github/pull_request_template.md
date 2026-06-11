# Pull Request

## Description
Please include a summary of the change and which issue is fixed.

## Checklist
- [ ] Code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings (typecheck/lint pass)
- [ ] Any database migrations are safe and follow RLS/isolation policies
- [ ] E2E/Playwright/Unit tests pass locally

## Security & Tenant Isolation Audit
- [ ] Tenant boundaries are respected (`org_id` / `property_id` / `site_id` filters applied)
- [ ] Row Level Security (RLS) policies are active and verified
- [ ] No client-supplied authority is trusted without validation
- [ ] No secrets or tokens are hardcoded
