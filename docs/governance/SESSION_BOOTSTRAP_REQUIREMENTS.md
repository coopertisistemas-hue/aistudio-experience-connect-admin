# SESSION_BOOTSTRAP_REQUIREMENTS.md

**Version:** 1.0  
**Status:** MANDATORY  
**Scope:** All DeepSeek-based orchestration sessions within the AI Studio Connect ecosystem  
**Classification:** CRITICAL — Session initialization is non-negotiable  

---

## 1. Purpose

This document defines the mandatory initialization sequence for all future DeepSeek orchestration sessions. A session that fails to complete the mandatory bootstrap sequence operates in **DEGRADED CONTEXT** and must not proceed with mission execution until initialization is complete.

---

## 2. Mandatory Load Order

The Orchestrator must load the following documents in the exact sequence defined below. Each document must be verified as present and readable before proceeding to the next.

### 2.1 Step 1: DEEPSEEK.md

**File:** `docs/governance/DEEPSEEK.md`  
**Repository:** `aistudio-experience-connect-admin`  
**Purpose:** Behavioral specification and authority definition  
**Verification:** File exists, readable, version matches expected  
**Failure Behavior:** Halt initialization. Report missing governance specification to ChatGPT and Alexandre.

### 2.2 Step 2: MASTER_PORTFOLIO.md

**File:** `docs/governance/MASTER_PORTFOLIO.md`  
**Repository:** `aistudio-experience-connect-admin`  
**Purpose:** Portfolio-wide product inventory, repository map, and active mission registry  
**Verification:** File exists, readable, repository list current  
**Failure Behavior:** Halt initialization. Report missing portfolio context to ChatGPT and Alexandre.

**Contents Expected:**
- Active product list (Portal, Reserve, Host, Medical, Experience, Wine, etc.)
- Repository-to-product mapping
- Current phase and sprint for each product
- Active mission registry
- Dependency graph between products

### 2.3 Step 3: GOVERNANCE_STATE.md

**File:** `docs/governance/GOVERNANCE_STATE.md`  
**Repository:** `aistudio-experience-connect-admin`  
**Purpose:** Current governance status, active ADRs, pending approvals, and known exceptions  
**Verification:** File exists, readable, status entries current  
**Failure Behavior:** Halt initialization. Report missing governance state to ChatGPT and Alexandre.

**Contents Expected:**
- Active ADRs and their status
- Pending governance approvals
- Known exceptions or waivers
- Current governance version references
- Agent certification status

### 2.4 Step 4: ORCHESTRATOR_CONTEXT.md

**File:** `docs/governance/ORCHESTRATOR_CONTEXT.md`  
**Repository:** `aistudio-experience-connect-admin`  
**Purpose:** Session-specific context including active sprints, current blockers, and next actions  
**Verification:** File exists, readable, entries dated within last 24 hours  
**Failure Behavior:** Halt initialization. Report missing orchestrator context to ChatGPT and Alexandre.

**Contents Expected:**
- Active sprint list with status
- Current blockers and their owners
- Recent decisions and their outcomes
- Agent availability and assignment status
- Next scheduled audits or reviews

---

## 3. Optional Load Order

After completing the mandatory sequence, the Orchestrator may optionally load the following documents to enhance operational context.

### 3.1 Step 5: EXEC_PLAN_STATUS.md

**File:** `docs/governance/EXEC_PLAN_STATUS.md`  
**Repository:** `aistudio-experience-connect-admin`  
**Purpose:** Real-time execution plan progress tracking  
**Verification:** File exists, readable  
**Failure Behavior:** Log warning. Continue initialization. Status tracking may be limited.

**Contents Expected:**
- Phase completion percentages
- Sprint status dashboard
- Deliverable completion tracking
- Delayed items and their impact

### 3.2 Step 6: NEXT_ACTIONS.md

**File:** `docs/governance/NEXT_ACTIONS.md`  
**Repository:** `aistudio-experience-connect-admin`  
**Purpose:** Prioritized queue of upcoming actions and decisions  
**Verification:** File exists, readable  
**Failure Behavior:** Log warning. Continue initialization. Action planning may be limited.

**Contents Expected:**
- Prioritized action list
- Decision deadlines
- Agent assignment recommendations
- Risk thresholds for upcoming actions

---

## 4. DEGRADED CONTEXT Protocol

### 4.1 Trigger Condition

If **ANY** mandatory file (Steps 1–4) is unavailable, unreadable, or corrupted, the session enters **DEGRADED CONTEXT** status.

### 4.2 Required Behavior

When in DEGRADED CONTEXT, the Orchestrator must:

1. **STOP** all mission execution immediately
2. **REPORT** the missing file(s) to ChatGPT and Alexandre with:
   - File name
   - Expected path
   - Actual status (missing, unreadable, corrupted)
   - Impact assessment
3. **REQUEST** initialization guidance from ChatGPT or Alexandre
4. **DOCUMENT** the DEGRADED CONTEXT event in the session log
5. **WAIT** for human instruction before proceeding

### 4.3 What the Orchestrator Must NOT Do in DEGRADED CONTEXT

- Proceed with mission execution using memory or context alone
- Assume governance rules from recalled conversation history
- Guess the contents of missing files
- Delegate work to execution agents without governance context
- Make GO / NO-GO recommendations without evidence

### 4.4 Recovery from DEGRADED CONTEXT

The Orchestrator may resume normal operation only when:

- All missing mandatory files are restored
- ChatGPT or Alexandre explicitly authorizes continued operation
- The recovery event is documented

---

## 5. Initialization Checklist

Before accepting any mission, the Orchestrator must verify:

- [ ] DEEPSEEK.md loaded and validated
- [ ] MASTER_PORTFOLIO.md loaded and validated
- [ ] GOVERNANCE_STATE.md loaded and validated
- [ ] ORCHESTRATOR_CONTEXT.md loaded and validated
- [ ] Context freshness verified (documents dated within acceptable window)
- [ ] No DEGRADED CONTEXT conditions present
- [ ] Human authorization received to proceed (if initialization required recovery)

---

## 6. Version Management

Each bootstrap document must include a version header. The Orchestrator must verify version compatibility:

- If a document version is newer than expected: Load and adapt
- If a document version is older than expected: Log warning, proceed with caution, flag for update
- If a document version is incompatible: Enter DEGRADED CONTEXT

---

## 7. Compliance

Non-compliance with this bootstrap sequence constitutes a governance violation. The Orchestrator must report any bootstrap failures immediately and must not attempt to work around missing mandatory context.

---

*End of SESSION_BOOTSTRAP_REQUIREMENTS.md*
