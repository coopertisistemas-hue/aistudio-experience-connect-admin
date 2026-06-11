# Inventory Quality Gate V1

**Version:** 1.0  
**Date:** 2026-06-01  
**Status:** Active  
**Applies to:** All future publication waves (U1-D onward)  
**Authority:** Production Safety / Content Governance

---

## Purpose

Prevent inventory quality degradation as the portal scales toward 1,000+ entities. Ensure every published record represents a real, verifiable business, attraction, or service that provides value to portal visitors.

---

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **BLOCKER** | Violation makes the entity unfit for publication | Must be fixed before publication; wave cannot proceed if >0 BLOCKERs remain unaddressed |
| **WARNING** | Violation degrades quality but does not prevent publication | Must be documented; should be fixed in next enrichment cycle |
| **ACCEPTABLE** | Meets minimum standard; minor improvements possible | May publish; track for future enhancement |

---

## Quality Gates

### 1. Entity Reality

| Check | Severity | Rationale |
|-------|----------|-----------|
| Entity must correspond to a real-world business, attraction, or service | **BLOCKER** | Prevents fictional or placeholder entries |
| Entity must have a physical address or defined geographic area | **BLOCKER** | Prevents digital-only shells and category pages |
| Entity name must not be a category page (e.g., "Hotéis em X") | **BLOCKER** | Prevents aggregator spam |
| Entity must not duplicate an existing published record | **BLOCKER** | Prevents inventory bloat |
| Entity must have at least one verifiable reference (Google Maps, official website, tourism board listing, or direct confirmation) | **WARNING** | Ensures traceability |

### 2. Name Verification

| Check | Severity | Rationale |
|-------|----------|-----------|
| Name must be the official or commonly recognized trade name | **BLOCKER** | Prevents invented or marketing-only names |
| Name must not contain pipe characters (`|`) or spam keywords | **BLOCKER** | Prevents SEO name spam |
| Name must not repeat the city name more than once | **WARNING** | Prevents keyword-stuffed titles |
| Name must be ≤80 characters in primary locale | **WARNING** | Ensures UI compatibility |

### 3. Category / Kind Correctness

| Check | Severity | Rationale |
|-------|----------|-----------|
| `category_type` must match the entity's primary function | **BLOCKER** | Prevents category misalignment |
| `kind` must be consistent with `category_type` | **BLOCKER** | Prevents schema inconsistency |
| Natural landmarks → `onde_ir` or `o_que_fazer`; commercial services → `guia_servicos` or `onde_comer`; lodging → `onde_ficar` | **BLOCKER** | Enforces domain logic |

### 4. Coordinates or Area Validity

| Check | Severity | Rationale |
|-------|----------|-----------|
| Coordinates must fall within the municipality boundary or known tourism zone | **BLOCKER** | Prevents geolocation errors |
| Coordinates must not be (0, 0), null, or default values | **BLOCKER** | Prevents unlocated records |
| Coordinates for natural attractions must be within 2 km of known trailheads or access points | **WARNING** | Ensures navigability |
| Coordinates for commercial entities must be street-level accurate (±200m) | **WARNING** | Ensures findability |

### 5. Contact Verification (when applicable)

| Check | Severity | Rationale |
|-------|----------|-----------|
| Phone must be in E.164 format (`+55DDNNNNNNNN`) | **WARNING** | Ensures dialability |
| Phone must not be a generic customer service line of an unrelated business | **BLOCKER** | Prevents false contact info |
| Website must resolve (HTTP 200) or be null | **WARNING** | Prevents dead links |
| Website must not be example.com, localhost, or placeholder domain | **BLOCKER** | Prevents test data leakage |

### 6. Description Quality

| Check | Severity | Rationale |
|-------|----------|-----------|
| Description must be ≥100 characters in primary locale | **BLOCKER** | Prevents empty or trivial descriptions |
| Description must not be template text (identical across >3 entities except for name substitution) | **BLOCKER** | Prevents templated spam |
| Description must be in the correct language (PT-BR for `pt` key) | **BLOCKER** | Prevents language mismatch |
| Description must not contain Lorem Ipsum or placeholder text | **BLOCKER** | Prevents unfinished content |
| Description must contain specific, verifiable claims about the entity | **WARNING** | Ensures substantive content |
| Short description must be ≥30 characters and ≤200 characters | **WARNING** | Ensures card UI compatibility |

### 7. Image / Media Quality

| Check | Severity | Rationale |
|-------|----------|-----------|
| At least one image or gallery reference must be present | **WARNING** | Ensures visual appeal |
| Images must not be broken links or 404s | **WARNING** | Prevents broken UX |
| Images should depict the actual entity (not stock photos of unrelated locations) | **WARNING** | Ensures authenticity |
| Cover image must be assigned for featured entities | **ACCEPTABLE** | Enhances visual hierarchy |

### 8. Duplicate Protection

| Check | Severity | Rationale |
|-------|----------|-----------|
| Exact name match (case-insensitive) against all published records must not exist | **BLOCKER** | Prevents name duplication |
| Slug collision must not exist | **BLOCKER** | Prevents URL collision |
| Coordinate pair within 50m of existing entity must be manually reviewed | **WARNING** | Catches near-duplicates |
| Semantic duplicate (same business, different name) must be reviewed | **WARNING** | Catches rebranded duplicates |

### 9. Public Route Compatibility

| Check | Severity | Rationale |
|-------|----------|-----------|
| Slug must be URL-safe and human-readable | **BLOCKER** | Ensures route resolution |
| Entity must not contain fields that break JSON serialization | **BLOCKER** | Prevents API errors |
| Entity must not contain control characters or unescaped quotes in text fields | **BLOCKER** | Prevents rendering errors |
| Entity must have valid `status` and `curation_status` values | **BLOCKER** | Ensures visibility logic |

### 10. Human Approval Requirements

| Check | Severity | Rationale |
|-------|----------|-----------|
| All BLOCKER-level checks must pass before `approve_place` RPC is called | **BLOCKER** | Enforces gate discipline |
| Batch waves >10 entities require spot-check of ≥20% sample before full approval | **WARNING** | Prevents systemic errors |
| Attractions and experiences require additional verification of coordinate accuracy | **WARNING** | Higher risk of geolocation errors |
| Healthcare entities require verification of professional credentials or regulatory status | **BLOCKER** | Legal/safety requirement |
| Lodging entities require verification of CNPJ or tourism registry when available | **WARNING** | Regulatory compliance |

---

## Vertical-Specific Mandatory Gates

| Gate | Lodging | Food | Attractions | Experiences | Healthcare | Services | Commerce |
|------|:-------:|:----:|:-----------:|:-----------:|:----------:|:--------:|:--------:|
| Entity Reality | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Name Verification | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Category Correctness | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Coordinates Valid | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact Verification | ✅ | ✅ | ⚪ | ✅ | ✅ | ✅ | ✅ |
| Description ≥100 chars | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| No Template Text | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| No Duplicates | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Route Compatible | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Human Approval | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Image Present | ✅ | ✅ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| Coordinate Street-Level | ✅ | ✅ | ⚪ | ⚪ | ✅ | ✅ | ✅ |
| Credential Verification | ⚪ | ⚪ | ⚪ | ⚪ | ✅ | ⚪ | ⚪ |

**Legend:** ✅ = Mandatory (BLOCKER if failed) | ⚪ = Recommended (WARNING if failed)

---

## Enforcement

1. **Pre-Publication Checklist:** Every wave executor must run the gate checklist before calling `approve_place`.
2. **Batch Tagging:** All import batches must include `quality_gate_version: "v1"` in meta.
3. **Audit Trail:** Failed gates must be logged with entity slug, gate number, and severity.
4. **Escalation:** Any wave with >5 BLOCKER-level failures must be paused and reviewed by a human operator.
5. **Retroactive Application:** Existing inventory may be spot-checked against these gates during enrichment sprints; no retroactive mass archiving without human review.

---

## Review Cycle

This gate document will be reviewed:
- After every 100-entity milestone
- When a new vertical is introduced
- When a quality incident occurs
- At minimum, every 30 days

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-06-01 | 1.0 | Initial release post-U1-C |
