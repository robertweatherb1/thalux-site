# Thalux AI — Strategic Blueprint
> Living truth document. Auto-updated by Nous. Read by Claude.ai at session start.
> Last updated: 2026-06-27 10:27

---

## 1. Mission & Identity

**Thalux AI is not an automotive company, a blue-collar company, or a local-PA company.**
It is an AI-powered revenue systems builder — any industry, any vertical. Products and services are the focus, not the founder. If it generates consistent recurring revenue with 70-90% ROI and can be spun up quickly by the agent team, it belongs here.

Boring is fine. Profitable is mandatory.

---

## 2. Revenue Targets

| Milestone | Target | Deadline | Status |
|-----------|--------|----------|--------|
| Replace founder income | $3,000/mo | Oct 1, 2026 | $0 MRR — 0% |
| Scale | $12,000/mo | Oct 1, 2027 | 0% |
| OpenRouter remaining | $222.78 | — | Spending limit: $350/mo |

**Fuel loop:** Profitable operations → funds token costs → enables exponential compounding.

---

## 3. Active Clients & Pipeline

### Documented Research (Niche Discovery — Jun 26)
| Niche | Viability | API Status | Product |
|-------|-----------|------------|---------|
| FDIC Bank Data | 8/10 | ✅ Verified (no auth) | $99/mo via Gumroad |
| OpenFEC Campaign Finance | 7/10 | ✅ Verified (DEMO_KEY) | Subscription |
| NPPES Healthcare Provider | 6/10 | ✅ Verified (monthly CSV) | Subscription |

### Signed / Active
| Client | Product | Monthly | Status |
|--------|---------|---------|--------|
| CV Automotive | Bronze $195/mo | $195 | LIVE — GBP audit blocked (no TJ dashboard) |
| Gorilla Fire Marks | Beta | TBD | Phase 1 scoping — pending |

### Pipeline
| Prospect | Product | Monthly | Status |
|----------|---------|---------|--------|
| Apex Trade | SLA $1,200/mo | $1,200 | Signed — LLC/EIN unstarted |
| Cashew Cartel | TBD | TBD | Parked — awaiting case study |
| Thompson Auto Repair | Bronze $195/mo | $195 | Prospect — Retell lead |

### Invoiced
| Invoice | Client | Amount | Status |
|---------|--------|--------|--------|
| INV-001 | CV Automotive | $195 | Sent — due 2026-07-01 |

---

## 4. Financial Health

| Metric | Value |
|--------|-------|
| Current MRR | $0 |
| Monthly Burn | ~$159/mo |
| Runway | Sep 2026 |
| OpenRouter Limit | $350/mo |
| OpenRouter Remaining | $222.78 |
| OpenRouter Monthly Usage | ~$176.29 |
| Infrastructure Costs | OpenRouter ($80), Twilio ($8.50), Namecheap ($15), Netlify ($0), ngrok ($0) |

---

**Agent Ecosystem:**

**Nous** (primary) — Hermes Agent on Mac Mini. Strategic execution, builds, deployment, tool orchestration.
**Ergon** (proposed name — not yet a scoped agent) — Windows Ollama: qwen2.5:7b + nomic-embed-text.

**Model Routing:**
| Tier | Provider | Model | Use |
|------|----------|-------|-----|
| Strategic | OpenRouter | DeepSeek V4 Flash (1M ctx) | Primary reasoning (Nous) |
| Code | OpenRouter | DeepSeek V4 Pro | Heavy code gen |
| Local batch | Ollama (Windows) | Qwen2.5:7b | Batch, non-critical |
| Vision | Gemini | Gemini 2.5 Flash | Image analysis |

### Cron Fleet Health (22 jobs)
| Status | Count |
|--------|-------|
| ✅ Healthy | 14 |
| ⛔ Paused | 4 (daily-briefing, cold-outreach, watchdog, prospect-research) |
| ❌ Broken | 0 |

### Major Skipped/Paused Items
- Daily Briefing — paused Jun 26 (403 prompt injection false positive)
- Cold Outreach — paused Jun 26 (2 consecutive failures)
- Watchdog — paused Jun 25 (unknown)
- Prospect Research — paused Jun 25 (web scraping blocked)

---

## 6. Agent Interaction Protocol

| Agent | Role | Status | Notes |
|-------|------|--------|-------|
| **Claude** | Co-CEO — strategy, evaluation, direction | ✅ Active (via Project Knowledge) | Tasks Gemini; hands DIRECTIVE to Nous |
| **Gemini** | Researcher/Planner — deep investigation, dossiers | 🟡 Pending script paste | Takes RESEARCH BRIEF from Claude |
| **Nous** | Primary execution — builds, deploys, orchestrates | ✅ Running | Receives DIRECTIVE from Claude; maintains blueprint |
| **Ergon** | Proposed name for Windows worker | 🚫 Not built | Batch inference only. Do not build as scoped agent until a specific recurring workload requires autonomous judgment on that box |

### Blueprint Refresh Cadence

| Trigger | Method | Cost | Purpose |
|---------|--------|------|---------|
| **Every 4h (timer)** | `refresh_blueprint.py` (no_agent) | ~$0 | Mechanical data in-place updates: MRR, burn, cron health, invoices |
| **DIRECTIVE with non-empty BLUEPRINT IMPACT** | `blueprint_loop.py` (v2 loop) | LLM synthesis | Full structural change: backup → staging → verify → promote with retry + alert escalation. Diff threshold: 15 lines |

Every Claude DIRECTIVE's `BLUEPRINT IMPACT` field acts as a dual-purpose field: documentation AND trigger condition. If non-empty, Nous runs the v2 loop. If empty, mechanical refresh alone is sufficient.

### Escalation Path
When the v2 loop reaches iteration=3 with failures:
1. **Primary:** `ALERTS.md` at `/Volumes/ThaluxAI 1/ALERTS.md` with timestamp + full error log
2. **Secondary:** Write to `thalux.db` → `active_flags` table (flag_type: `blueprint_loop_alert`) → surfaces in Mission Control `/api/ceo/dashboard` attention items
3. `BLUEPRINT_LOOP_STATE.md` set to `CRITICAL_FAIL: Human Intervention Required`

## 7. Active Directives (Claude → Nous Handoffs)

| Directive | Given | Status | Notes |
|-----------|-------|--------|-------|
| *(empty — first session)* | — | — | — |

---

## 8. Infrastructure

**Hardware:** Mac Mini M2 (primary), Windows Worker (Ollama), iPad Pro, iPhone
**Network:** Tailscale mesh — 4 devices, direct 2ms worker link
**Storage:** `/Volumes/ThaluxAI 1/` (primary), Obsidian vault (182 files, 100% frontmatter)
**Memory:** ChromaDB (11 collections, ~1,300 docs), SQLite (32 tables), Session DB (FTS5)
**Key Services:** ChromaDB:8000 ✅, Mission Control:8001 ✅, n8n:9001 ✅, Prometheus:9090 ✅, ngrok:4040 ✅, Twilio:8080 ✅, Widget:8081 ✅, Retell:8082 ✅
**SPOF Warning:** Mac Mini runs everything. No backup host.

---

## 9. Decision Log (Recent)

| Date | Decision | Status |
|------|----------|--------|
| Jun 26 | Daily Briefing & Cold Outreach PAUSED | Done |
| Jun 26 | Niche Discovery Factory — 1st cycle run | Done |
| Jun 26 | Token snapshot every 6h — added | Done |
| Jun 25 | Watchdog paused | Done |
| Jun 25 | Prospect Research paused | Done |
| Jun 23 | ACS Doctrine: 41 agents, 8 depts | Done |

---

## 10. Trend / Horizon Scan

*Latest additions from Niche Discovery Factory (Jun 26):*
- FDIC BankIntel data product — $49 one-time, $99/mo recurring (live)
- OpenFEC compliance data — 7/10 viability
- NPPES healthcare provider — 6/10 viability

*Claude evaluates new schemas against this blueprint before adoption.*

---

## 11. Open Blockers

1. CV Automotive GBP audit — blocked (no TJ dashboard access)
2. Apex Trade — SLA unsigned; LLC/EIN unstarted
3. Daily Briefing — 403 error (prompt injection false positive)
4. Cold Outreach — 2 consecutive failures
5. Prospect Research — web scraping blocked (needs API key)
6. Watchdog — paused (unknown cause)
7. Token Snapshot — errored Jun 27 00:01 (curl/API fail)
8. Jul 4 Launch — content pipeline blocked (Robert)
9. ACS Phase 1 — zero sub-phases started
10. SPOF — Mac Mini runs everything, no backup host

---

*End of Strategic Blueprint — reviewed and updated by Nous*