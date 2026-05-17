# RELEASE GOVERNANCE — Dom Pietro Experience Connect

> Enterprise deployment governance. Every change to production must be validated, traceable, and reversible.

---

## 1. ENVIRONMENT MATRIX

| Environment | Purpose | Data | Access | Auto-Deploy |
|-------------|---------|------|--------|-------------|
| **local** | Development | Seed/fixtures | Developer | N/A |
| **preview** | PR validation | Seed/fixtures | CI + Reviewer | On PR open |
| **staging** | Integration + QA | Anonymized production snapshot | Team + QA | On merge to `main` |
| **production** | Live tenants | Real tenant data | SRE + On-call only | Manual approval |

### Environment Rules

- **No production data in local/preview.**
- **Staging must mirror production schema.** Schema drift between staging and production is a release blocker.
- **Production access is logged.** All `service_role` usage, admin panel access, and DB direct connections are audited.

---

## 2. BRANCH STRATEGY

```
feature/* ──► pull request ──► main ──► staging ──► production
hotfix/* ──► pull request ──► main ──► staging ──► production
```

### Branch Types

| Branch | Purpose | Lifecycle |
|--------|---------|-----------|
| `main` | Source of truth | Permanent |
| `feature/<ticket>-description` | New capability | Deleted after merge |
| `hotfix/<ticket>-description` | Production fix | Deleted after merge |
| `release/vX.Y.Z` | Release candidate (optional) | Tagged then deleted |

### Rules

- All changes enter `main` via Pull Request.
- No direct push to `main`.
- No direct push to `production` branch/environment.
- Hotfixes follow the same PR process as features.

---

## 3. MIGRATION POLICY

### Forward-Only Migrations

All database migrations are **forward-only** in production.

- `supabase/migrations/` contains ordered SQL files.
- Migrations are numbered sequentially (`YYYYMMDDHHMMSS_description.sql`).
- Each migration must be idempotent (`IF NOT EXISTS`, `CREATE OR REPLACE`).

### Migration Review Process

Before any migration reaches `main`:

1. **Developer** writes migration locally and tests with `supabase db reset`.
2. **CI** runs `supabase db push` against preview environment.
3. **Reviewer** checks:
   - Does it add a constraint that could fail on existing data?
   - Does it drop a column still referenced by code?
   - Does it lock a large table for too long?
   - Is it idempotent?
4. **Staging** validates migration against anonymized production data.

### Forbidden in Production Migrations

- `DROP TABLE` on operational tables
- `ALTER TYPE ... DROP VALUE` (PostgreSQL limitation; requires recreation)
- Heavy `UPDATE` without `WHERE` batching on large tables
- Adding `NOT NULL` without `DEFAULT` on populated columns
- Adding `ON DELETE CASCADE` to operational tables without architecture review
- Removing `deleted_at` from operational tables

### Rollback Strategy

Since migrations are forward-only, rollback is performed by:

1. **Restoring from backup** (point-in-time recovery via Supabase)
2. **Applying a compensating forward migration** that reverses the schema change

**Example:** Accidentally dropped column `foo`? Create a new migration that adds it back, then backfill from backup if needed.

---

## 4. ROLLBACK POLICY

### Application Rollback

If a deployment causes errors:

1. **Vercel rollback:** Re-deploy previous production build (instant).
2. **Supabase Edge Functions:** Rollback via previous deployment tag.
3. **Database:** Do NOT roll back migrations. Use forward fix or restore from backup.

### Database Rollback (Emergency Only)

1. Identify the last known good backup time.
2. Create a new Supabase project or restore to a point-in-time.
3. Validate restored data.
4. Redirect DNS/application to restored instance.
5. Post-incident review within 24 hours.

---

## 5. ROLL-FORWARD POLICY

Preferred over rollback for most incidents:

1. Identify the bug.
2. Write a fix.
3. Create a hotfix branch from `main`.
4. Fast-track review (1 approver, CI passing).
5. Deploy to staging, validate.
6. Deploy to production.

**Rule:** Roll-forward for application bugs. Rollback only for data corruption or security breaches.

---

## 6. DEPLOYMENT CHECKLIST

### Before Production Deploy

- [ ] All PRs merged and CI green
- [ ] Migration reviewed and tested on staging
- [ ] Schema diff between staging and production is zero (or matches planned migration)
- [ ] Smoke tests passing on staging
- [ ] Critical paths validated:
  - [ ] Login
  - [ ] Booking creation
  - [ ] Payment preference
  - [ ] Webhook processing
  - [ ] Booking confirmation
  - [ ] Cancellation
- [ ] RLS audit passing
- [ ] No `service_role` key in frontend bundles (verified via build inspection)
- [ ] Secrets validated in production environment
- [ ] Monitoring dashboards active
- [ ] On-call engineer notified

### Production Deploy Steps

1. Merge release PR to `main` (triggers staging deploy).
2. Validate staging for 15 minutes.
3. Tag release: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
4. Deploy to production via Vercel + Supabase CLI.
5. Run production smoke tests.
6. Monitor error rates for 30 minutes.
7. Announce release in team channel.

---

## 7. SMOKE TESTS

### Automated Smoke Tests (Playwright)

Run against staging before every production deploy:

- Guest can browse routes
- Guest can create a booking hold
- Guest can initiate payment
- Webhook processor responds 200
- Admin can login
- Admin can view bookings
- Admin can cancel a booking

### Manual Smoke Tests

Performed by on-call engineer after production deploy:

- Complete a test booking end-to-end
- Verify Mercado Pago sandbox transaction
- Check RLS is active (attempt cross-tenant read, must fail)
- Verify audit logs are writing

---

## 8. RELEASE APPROVALS

### Required Approvers

| Change Type | Approvers |
|-------------|-----------|
| Frontend feature | 1 senior dev + product (optional) |
| Edge Function | 1 senior dev + architect (if critical path) |
| Database migration | 1 senior dev + DBA/architect |
| RLS policy change | 1 senior dev + security review |
| Payment flow change | 1 senior dev + architect + product |
| Production config change | 1 senior dev + SRE |

### Approval Rules

- Approver must not be the author.
- Approval can be withheld for unresolved CI failures.
- Security-sensitive changes require explicit security review comment.

---

## 9. INCIDENT RESPONSE

### Severity Levels

| Level | Definition | Examples | Response Time |
|-------|------------|----------|---------------|
| SEV-1 | Complete outage or data loss | Payment processing down, RLS disabled, DB unreachable | 15 min |
| SEV-2 | Major feature degraded | Booking creation failing, webhooks not processing | 1 hour |
| SEV-3 | Minor issue or monitoring gap | UI glitch, slow query, non-critical alert | 4 hours |
| SEV-4 | Cosmetic or optimization | Layout issue, performance improvement | Next business day |

### Incident Playbook

1. **Detect:** Alert fires or user reports issue.
2. **Triage:** On-call engineer assesses severity.
3. **Mitigate:** If SEV-1/2, apply roll-forward or rollback immediately.
4. **Communicate:** Notify stakeholders via status page or team channel.
5. **Resolve:** Fix root cause.
6. **Review:** Post-incident review within 24 hours for SEV-1/2.

---

## 10. PRODUCTION HOTFIX POLICY

### When Hotfix Is Allowed

- SEV-1 or SEV-2 incident in production.
- Security vulnerability.

### Hotfix Process

1. Create `hotfix/<description>` from `main`.
2. Write minimal fix.
3. PR with `[HOTFIX]` prefix.
4. Fast-track review (1 approver).
5. Skip non-critical CI jobs if needed (with explicit justification).
6. Deploy to staging, run smoke tests.
7. Deploy to production.
8. Merge back to `main`.
9. Post-incident review.

---

## 11. BACKUP AND RESTORE VALIDATION

### Backup Policy

- Supabase PITR (Point-in-Time Recovery) enabled.
- Daily logical backups exported and stored in encrypted S3-compatible storage.
- Backup restoration tested monthly on a separate instance.

### Restore Validation

Monthly drill:

1. Restore backup to isolated Supabase project.
2. Validate schema matches expected.
3. Run smoke tests against restored instance.
4. Validate RLS policies are present and functional.
5. Document results.

---

## 12. SECRETS GOVERNANCE

### Secret Storage

| Secret | Location | Access |
|--------|----------|--------|
| Supabase `anon` key | Env var (frontend + backend) | Public |
| Supabase `service_role` key | Supabase Vault / Edge Function secrets | Server-only |
| Mercado Pago access token | Supabase Vault / Edge Function secrets | Payment Edge Functions only |
| Mercado Pago webhook secret | Supabase Vault / Edge Function secrets | Webhook handler only |
| Resend / email API key | Supabase Vault / Edge Function secrets | Notification functions only |
| Database password | Supabase-managed | Never exposed |

### Rotation Policy

- API keys rotated quarterly.
- Rotated immediately if leaked or team member departure.
- Rotation procedure documented in runbook.

### Webhook Contract Governance

- Invalid webhook signatures must return HTTP `400` and be logged as failed deliveries.
- Duplicate valid webhook events must return HTTP `200` with no side effects.
- Valid webhook payloads that fail internal processing must return HTTP `500` so Mercado Pago retries.
- Any change to this contract requires architecture review because it affects provider retry semantics.

---

## 13. RELEASE NOTES POLICY

Every release must include:

1. **Version number** (SemVer: MAJOR.MINOR.PATCH)
2. **Summary** (1-2 sentences)
3. **Changes** (bullet list)
4. **Migrations** (list of SQL files)
5. **Breaking changes** (if any)
6. **Rollback plan** (if not standard)

Stored in `docs/releases/vX.Y.Z.md`.

---

## 14. GOVERNANCE VALIDATION CHECKLIST

- [ ] Branch protection enabled on `main`
- [ ] CI runs on every PR
- [ ] Staging auto-deploys from `main`
- [ ] Production requires manual approval
- [ ] Migrations are forward-only
- [ ] Backup restoration tested this month
- [ ] Smoke tests run before every production deploy
- [ ] Release notes exist for last 3 releases
- [ ] On-call rotation is defined
- [ ] Incident response playbook is accessible to all engineers
