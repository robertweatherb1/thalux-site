# Thalux AI — Strategic Blueprint
> Living truth document. Auto-updated by Nous. Read by Claude.ai at session start.
> Last updated: 2026-06-28 15:02

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
| OpenRouter remaining | $224.96 | — | Spending limit: $350/mo |

**Fuel loop:** Profitable operations → funds token costs → enables exponential compounding.

---

## 3. Active Clients & Pipeline

### Documented Research (Niche Discovery — Jun 26)
| Niche | Viability | API Status | Product |
|-------|-----------|------------|---------|
| FDIC Bank Data | 8/10 | ✅ Verified (no auth) | $49 one-time, $99/mo via Stripe |
| OpenFEC Campaign Finance | 7/10 | ✅ Verified (DEMO_KEY) | Subscription |
| NPPES Healthcare Provider | 6/10 | ✅ Verified (monthly CSV) | Subscription |

### Signed / Active
| Client | Product | Monthly | Status |
|--------|---------|---------|--------|
| CV Automotive | Bronze $195/mo | $195 | WEBSITE LIVE (cv-automotive-tj.netlify.app) — custom domain cvautomotive.com is GoDaddy parked "Launching Soon". Retainer agreed verbally but **$0 collected**. Invoice INV-001 sent, due Jul 1. Site never formally handed off to TJ. |
| Gorilla Fire Marks | Beta | TBD | **BROKEN** — site deployed but returns 404 on Netlify. Never shown to client. $375 deposit bypassed. |

### Pipeline
| Prospect | Product | Monthly | Status |
|----------|---------|---------|--------|
| Apex Trade | SLA $1,200/mo | $1,200 | **CORRECTION: NOT SIGNED** — SLA template is drafted but has zero signatures. No LLC/EIN filed. Blueprint previously claimed "Signed" — this was false. [REALITY CHECK FAILED] |
| Cashew Cartel | TBD | TBD | Parked — awaiting case study. No client DB record. |
| Thompson Auto Repair | Bronze $195/mo | $195 | Prospect — Retell lead. No client DB record. |
| Mitchell Dental | Gold Tier | $249/mo | Lead from Retell (Jun 19) — not yet scoped |
| Miller & Co Plumbing | Full Stack | $1,800–2,500/mo | Lead from Retell (Jun 22) — plumbing, Lancaster |

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
| OpenRouter Remaining | $224.96 (live as of Jun 27 17:47) |
| OpenRouter Monthly Usage | ~$178.47 (live API total; DB tracking shows $143.96 — 28% gap) |
| Infrastructure Costs (actual) | OpenRouter ($178/mo), Twilio ($8.50), Namecheap ($15), Netlify ($0), ngrok ($0) |

> **NOTE:** OpenRouter cost in the Agent Ecosystem table below shows ~$80 — that figure is stale. Actual monthly spend is $178+.

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

### Cron Fleet Health (27 jobs)
| Status | Count |
|--------|-------|
| ✅ Healthy (last run ok) | 16 |
| ⛔ Paused / Disabled | 4 (daily-briefing, cold-outreach, incident-heartbeat, prospect-research) |
| ❌ Errored (last run error) | 0 (was 1 — token-snapshot has since recovered; ran ok at 06:00 today) |
| ⚫ Never run (scheduled but no execution history) | 6 (session-archiver, CVE-scan, orphan-review, vault-metrics, staleness, firecrawl-credit) |
| ❓ Status unknown | 1 (strategic-blueprint-refresh — just added, no run yet) |

> **NOTE:** Blueprint previously claimed 22 jobs — actual count is 27 (6 jobs were added and never counted).

### Major Skipped/Paused Items
- Daily Briefing — paused Jun 26 (403 prompt injection false positive)
- Cold Outreach — paused Jun 26 (2 consecutive failures)
- Watchdog — paused Jun 25 (unknown)
- Prospect Research — paused Jun 25 (web scraping blocked)
- **ACS Doctrine — ⏸ PAUSED per Claude's call (Jun 27).** 33 real agents, 8 departments structured, zero sub-phases started, no revenue tie. Same treatment as the shelved Event-Driven Agentic OS. Not deleted — paused with reason on record.

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
| Blueprint refresh loop (v2) — build + verify all 4 paths | Jun 27 | ✅ Done | Success, retry, abort, human-review — all verified with real state files. Diff threshold 50→15. |
| Cadence rule — 4h mechanical + v2 loop on BLUEPRINT IMPACT | Jun 27 | ✅ Done | Dual escalation live: ALERTS.md + thalux.db active_flags (WAL mode, no write contention). |
| Ergon naming correction — "proposed, not shipped" everywhere | Jun 27 | ✅ Done | Zero build work. Audited clean. |
| Gemini script — vertical-neutrality fix | Jun 27 | ✅ Done | No default industry unless brief specifies. |
| GitHub raw URL bridge — Claude autofetch | Jun 27 | ✅ Done | https://raw.githubusercontent.com/robertweatherb1/thalux-site/main/public/strategic-blueprint.md — verified working. |
| ThaluxAI volume version-control | Jun 27 | ✅ Done | Private repo. .env confirmed safe (zero tracked). .bak tracked. BankIntel CSV in data-exports/. |
| GitHub repo visibility — set Private | Jun 27 | ✅ Done | Confirmed by Robert directly. |
| Full blueprint audit | Jun 27 | ✅ Done | 8 corrections, 2 removals, 2 tags, 5 new entries. Apex [REALITY CHECK FAILED]. |
| Self-verification skill | Jun 27 | ✅ Done | Auto-loading. 5-point checklist. |
| CV Automotive site — confirm domain | Jun 27 | ✅ Done | cv-automotive.com (hyphenated) is genuine live site. cvautomotive.com (no hyphen) is dead/parked — needs redirect or retirement. |
| BankIntel redirect fix | Jun 27 | 🔴 OPEN | Page committed. Astro build doesn't generate it. Stripe links are live and could take money with no delivery mechanism. |
| Financial reconciliation — burn vs component costs don't add up | Jun 27 | 🔴 OPEN | Monthly Burn ~$159/mo, but components sum to ~$202+. OR usage+remaining = $403 > $350 cap. Needs math reconciliation. |
| ACS Doctrine — reclassify per Claude's call | Jun 27 | ✅ Done | Now tagged ⏸ PAUSED (same treatment as shelved Event-Driven Agentic OS). 33 real agents, 8 depts structured, zero sub-phases started, no revenue tie. Not deleted. |
| Apex Trade — chase to signature or drop | Jun 27 | 🔴 OPEN | Real SLA template exists (Jun 20). Zero signatures. Largest potential revenue line. Needs Robert's explicit call: chase or kill. |

---

## 8. Infrastructure

**Hardware:** Mac Mini M2 (primary), Windows Worker (Ollama), iPad Pro, iPhone
**Network:** Tailscale mesh — 4 devices, direct 2ms worker link
**Storage:** `/Volumes/ThaluxAI 1/` (primary), Obsidian vault (467 .md files, 100% frontmatter)
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
| Jun 23 | ACS Doctrine: 41 agents, 8 depts | 🟡 Partial — blueprint claimed 41 agents; vault has 33 verified agent files. ~8 were counted from skill descriptions, creating an inflated total. See Section 11 (new). |
| Jun 27 | BankIntel diagnosed — found intact at ~/.hermes/data/exports/. URL not serving page (build output issue). Stripe checkout links live. | Done |
| Jun 27 | Strategic blueprint pushed to GitHub raw URL for Claude autofetch | Done |
| Jun 27 | ThaluxAI volume version-controlled to private GitHub repo | Done |
| Jun 27 | Self-verification skill created (auto-loads) | Done |
| Jun 27 | Apex Trade reality check — SLA claim "signed" was false. Template exists, zero signatures. [REALITY CHECK FAILED] | Done |
| Jun 27 | Blueprint v2 loop built — all 4 paths verified with state file evidence | Done |
| Jun 27 | Cadence rule established — 4h mechanical + v2 on BLUEPRINT IMPACT | Done |
| Jun 27 | Dual escalation live — ALERTS.md (primary) + thalux.db active_flags (secondary) | Done |
| Jun 27 | Ergon naming corrected — "proposed, not shipped" everywhere | Done |
| Jun 27 | Gemini script — vertical-neutrality correction added | Done |
| Jun 27 | Direction-setting conversation — Robert's answer: loves building/learning, bored by maintenance, wants sellable income; 4 shapes tabled (productize lead-gen, micro-SaaS, data feed, narrow vertical agent). Paused for asset inventory. | 🟡 In progress |

---

## 10. Trend / Horizon Scan

*Latest additions from Niche Discovery Factory (Jun 26):*
- FDIC BankIntel data product — $49 one-time, $99/mo recurring (live)
- OpenFEC compliance data — 7/10 viability
- NPPES healthcare provider — 6/10 viability

*Claude evaluates new schemas against this blueprint before adoption.*

**Direction conversation (Jun 27):** Robert's answer — loves building/learning, gets bored maintaining, wants long-term sellable income (no retirement plans). 4 candidate shapes on the table: (1) productize the lead-gen loop, (2) micro-SaaS utility, (3) productized research/data feed (BankIntel may already be this), (4) narrow vertical agent sold as software (not a relationship). Paused for asset inventory. Resume once HIGHEST/HIGH open blockers are clear.

---

## 11. Open Blockers

PRIORITY: HIGHEST
1. **BankIntel redirect fix** — page committed to repo, Astro build doesn't include it in deployed output. Sample CSV not served. Stripe payment links are live and could take money with no delivery mechanism — check immediately whether that link has been shared anywhere.
2. **Financial reconciliation** — Monthly Burn line (~$159) doesn't match corrected component costs (~$202+ with real OpenRouter spend). OpenRouter usage ($178.47) + remaining ($224.96) = $403.43, exceeds stated $350 cap — get a straight explanation of what "remaining" vs "usage" actually measure, reconcile the math.

PRIORITY: HIGH
3. CV Automotive GBP audit — blocked (no TJ dashboard access).
4. **cvautomotive.com** (non-hyphenated) — redirect to real domain (cv-automotive.com) or retire.
5. **CV Automotive invoice INV-001** — due Jul 1 (corrected from misstated Jul 7). Unpaid as of last check. Confirm payment status.
6. **Apex Trade — NOT SIGNED.** SLA template exists (drafted Jun 20) but zero signatures. No LLC/EIN filed. Open decision: chase to real signature (largest potential revenue, most scoping done) or dead for unstated reason? Needs Robert's explicit call.
7. **6 dormant crons** — session-archiver, CVE-scan, orphan-review, vault-metrics, staleness, firecrawl-credit. Zero execution history. Fix-and-confirm-it-runs, or delete the config. No third state.
8. Daily Briefing — 403 error. Paused Jun 26.
9. Cold Outreach — 2 consecutive failures. Paused Jun 26. Root cause: no funnel to receive leads yet. Re-evaluate once front-end fixes land.
10. Prospect Research — web scraping blocked (needs API key). Paused Jun 25. Same root cause as #9.
11. Watchdog — paused Jun 25 (unknown cause).
12. Jul 4 Launch — content pipeline blocked (Robert). Still open — asked about, never answered this session.
13. ~~ACS Phase 1 — 33 agents, 8 depts. Zero sub-phases started.~~ → **⏸ PAUSED per Claude's call.** Tagged in Major Skipped/Paused. Not deleted.

PRIORITY: MEDIUM
14. SPOF — Mac Mini runs everything, no backup host.
15. Strategic blueprint refresh cron — just added, hasn't run yet. GitHub sync push needs verification on first execution.
16. Trade-shop lead-gen pilot (30-50 businesses, Place Details not Search, measure real gap rate) — directive given earlier, never confirmed run.
17. Direction-setting conversation — 4 candidate shapes tabled. Paused for asset inventory; resume once HIGHEST/HIGH items above are clear.

---

*End of Strategic Blueprint — reviewed and updated by Nous*

---

## Changelog (2026-06-27 Full Audit)

### Removed
- Apex Trade "Signed" status — **removed false claim.** SLA is a drafted template, zero signatures. Tagged [REALITY CHECK FAILED].
- Token Snapshot from Open Blockers — **removed.** Recovered on its own; ran successfully at 06:00 today.
- "22 jobs" cron claim — **replaced** with verified 27-job count split by health status.

### Corrected
- **CV Automotive** status from "LIVE" to precise: site live on Netlify URL, custom domain is GoDaddy parked, $0 collected.
- **Gorilla Fire Marks** from "Phase 1 scoping — pending" to "BROKEN — site returns 404, never shown to client."
- **FDIC BankIntel** pricing from "$99/mo via Gumroad" to "$49 one-time, $99/mo via Stripe" (no Gumroad).
- **OpenRouter costs** from "$80/mo" to "$178/mo actual". Stated $80 was half the real spend.
- **OpenRouter remaining** from $222.78 to $224.96 (live check).
- **Cron count** from 22 to 27. Added never-run column — 6 crons have zero execution history.
- **ACS count** from 41 to 33 verified agents. The 8-agent difference came from double-counting skill-based agents. 8 departments confirmed.
- **Vault file count** from 182 to 467 .md files (+ 492 non-md). Stated 182 was stale.

### Tagged
- **Apex Trade** — `[REALITY CHECK FAILED]` tag added. The blueprint claimed "Signed" in one section and "unsigned" in another (contradiction). Now uniformly "NOT SIGNED."
- **ACS Doctrine** — `🟡 Partial` tag. Structure exists (8 depts, 33 agents) but original count was inflated.

### Added
- Mitchell Dental and Miller & Co Plumbing to Pipeline (were in client DB, missing from blueprint).
- BankIntel redirect fix to Open Blockers (#11).
- 6 never-run crons to Open Blockers (#12).
- Strategic blueprint refresh cron to Open Blockers (#13).
- 5 new Decision Log entries for today's work.
- This changelog.