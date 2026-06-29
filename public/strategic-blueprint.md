# Thalux AI — Strategic Blueprint
> Living truth document. Auto-updated by Nous. Read by Claude.ai at session start.
> Last updated: 2026-06-29 07:08
> Consolidation of: Vault-Key Memory Architecture, Operational Protocol (Two-Phase Loop),
> Master Execution Plan June2026 (v1+v2), Infrastructure Implementation Plan v1.0,
> and prior strategic-blueprint.md (Jun 27 audit).

---

## 1. Mission & Identity

**Thalux AI is not an automotive company, a blue-collar company, or a local-PA company.**
It is an AI-powered revenue systems builder — any industry, any vertical. Products and services are the focus, not the founder. If it generates consistent recurring revenue with 70-90% ROI and can be spun up quickly by the agent team, it belongs here.

**No committed vertical yet.** Thalux has not picked a vertical. The first real client (CV Automotive) happens to be auto service. The niche discovery cycle (Jun 26) surfaces FDIC banking data, campaign finance, and healthcare — none of which are trade shops. Do not assume any vertical. Do not encode any vertical into agent prompts, sales scripts, or routing logic without a logged decision to commit.

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
| Apex Trade | SLA $1,200/mo | $1,200 | **NOT SIGNED** — SLA template is drafted but has zero signatures. No LLC/EIN filed. [REALITY CHECK FAILED — previously claimed "Signed"] |
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

### Agent Ecosystem

**Nous** (primary) — Hermes Agent on Mac Mini. Strategic execution, builds, deployment, tool orchestration.
**Ergon** (proposed name — not yet a scoped agent) — Windows Ollama: qwen2.5:7b + nomic-embed-text.

### Model Routing

| Tier | Provider | Model | Use |
|------|----------|-------|-----|
| Strategic | OpenRouter | DeepSeek V4 Flash (1M ctx) | Primary reasoning (Nous) |
| Code | OpenRouter | DeepSeek V4 Pro | Heavy code gen |
| Local batch | Ollama (Windows) | Qwen2.5:7b | Batch, non-critical |
| Vision | Gemini | Gemini 2.5 Flash | Image analysis |

### Two-Machine Architecture (from Master Execution Plan §4)

**Mac Mini M4** (live-checked: Mac16,10, Apple M4, 16GB LPDDR5) — PRIMARY: state and orchestration. Owns vault, SQLite, ChromaDB, n8n, Hermes primary instance, HITL interface, all file writes to production.
**Windows PC (RTX 5070 Ti Laptop GPU, 12 GB VRAM)** — WORKER: compute and inference only. Ollama inference, embedding tasks, batch processing. Reports results to Mac Mini. Never writes to production state independently.

**Job Queue pattern:** Mac Mini writes jobs to SQLite. Windows PC polls, claims, executes, writes results back. If Windows is offline, jobs queue locally and drain on reconnect.

### Cron Fleet Health (27 jobs)
| Status | Count |
|--------|-------|
| ✅ Healthy (last run ok) | 16 |
| ⛔ Paused / Disabled | 4 (daily-briefing, cold-outreach, incident-heartbeat, prospect-research) |
| ❌ Errored (last run error) | 0 (token-snapshot recovered) |
| ⚫ Never run (scheduled but no execution yet) | 6 (session-archiver, CVE-scan, orphan-review, vault-metrics, staleness, firecrawl-credit) |
| ❓ Status unknown | 1 (strategic-blueprint-refresh — just added) |

### Major Skipped/Paused Items
- Daily Briefing — paused Jun 26 (403 prompt injection false positive)
- Cold Outreach — paused Jun 26 (2 consecutive failures)
- Watchdog — paused Jun 25 (unknown)
- Prospect Research — paused Jun 25 (web scraping blocked)
- **ACS Doctrine — ⏸ PAUSED per Claude's call (Jun 27).** 33 real agents, 8 departments structured, zero sub-phases started, no revenue tie. Same treatment as the shelved Event-Driven Agentic OS. Not deleted — paused with reason on record.

---

## 5. Agent Interaction Protocol

### Session Declaration Protocol (from Master Execution Plan §5.2)
Every session starts with a declared mode. One line, before any substantive content:

- **STRATEGIC** — Thinking, planning, or evaluating. Go to Claude in chat.
- **EXECUTE** — Know what needs to happen. Go to Hermes.
- **RESEARCH** — Need current external data. Go to Gemini.

This single habit eliminates ~80% of context-switching waste.

### The Handoff Protocol (from Master Execution Plan §5.3)
When Claude produces a plan or decision, it generates a handoff block. Paste this directly into Hermes. No re-summarizing:

```
**HANDOFF → HERMES**
Decision: [one line]
Context: [2–3 sentences max]
Action required: [specific, concrete]
Files affected: [paths if relevant]
Priority: [now / today / this week]
```

### Agent Role Map
| Agent | Role | Status | Notes |
|-------|------|--------|-------|
| **Claude** | Co-CEO — strategy, evaluation, direction | ✅ Active (via Project Knowledge) | Tasks Gemini; hands DIRECTIVE to Nous |
| **Gemini** | Researcher/Planner — deep investigation, dossiers | 🟡 Pending script paste | Takes RESEARCH BRIEF from Claude |
| **Nous** | Primary execution — builds, deploys, orchestrates | ✅ Running | Receives DIRECTIVE from Claude; maintains blueprint |
| **Ergon** | Proposed name for Windows worker | 🚫 Not built | Batch inference only. Do not build as scoped agent until a specific recurring workload requires autonomous judgment on that box |

### Five Operating Rules (from Master Execution Plan §5.5)
1. Claude is for thinking, not doing. If you find yourself asking Claude to perform a task Hermes can execute, stop. Finish the thinking, produce the handoff block, take it to Hermes.
2. Hermes is for execution, not strategy. If you find yourself explaining business context or asking what you should do, stop. That is a Claude conversation.
3. Start every Claude session with a context drop. No exceptions.
4. One question, one layer. Strategic = Claude. Operational = Hermes. Research = Gemini.
5. Never let a Claude session end without a logged artifact. Every session produces either a decision logged to thalux.db, a handoff block for Hermes, or a vault document.

### Context Drop Template
File location: `/Volumes/ThaluxAI 1/memory/vault/general/CLAUDE_CONTEXT_DROP.md`
```
**THALUX CONTEXT DROP — [DATE]**
Current focus: [one sentence]
Active clients: [name — status, name — status]
Last 3 decisions: [decision, decision, decision]
Open blockers: [item, item]
```

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

---

## 6. Active Directives (Claude → Nous Handoffs)

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
| ACS Doctrine — reclassify per Claude's call | Jun 27 | ✅ Done | Now tagged ⏸ PAUSED. 33 real agents, 8 depts structured, zero sub-phases started, no revenue tie. Not deleted. |
| Apex Trade — chase to signature or drop | Jun 27 | 🔴 OPEN | Real SLA template exists (Jun 20). Zero signatures. Largest potential revenue line. Needs Robert's explicit call: chase or kill. |

---

## 7. Infrastructure

**Hardware:** Mac Mini M4 (primary, 16GB, 10-core), Windows Worker (RTX 5070 Ti **Laptop GPU** — 12 GB VRAM live-verified via nvidia-smi, qwen2.5:7b at ~4.7GB with headroom), iPad Pro, iPhone
**Tailscale mesh:** 4 devices — Mac Mini (100.86.11.18), Worker (100.68.202.64, direct 10.0.216.15:41641), iPad (100.96.210.77), iPhone (100.115.208.100)
**Storage:** `/Volumes/ThaluxAI 1/` (primary, Samsung 990 PRO 4TB), `/Volumes/ThaluxAI` (dead volume, no filesystem — do not write to), Obsidian vault (467 .md files, 100% frontmatter)
**Memory (Three-Tier Architecture):**
- **Tier 1 — Obsidian vault:** human-readable, linked, AI-navigable (canonical knowledge store)
- **Tier 2 — ChromaDB:** semantic vector store, ~1,300 docs across 11 collections
- **Tier 3 — SQLite (thalux.db):** structured episodic facts (clients, pipeline, decisions, jobs)
**Key Services:** ChromaDB:8000 ✅, Mission Control:8001 ✅, Prometheus:9090 ✅, ngrok:4040 ✅, n8n:5678 ✅ (9001 ❌), Twilio:8080 ✅, Widget:8081 ✅, Retell:8082 ✅
**Key Reference Data:**
| Resource | Address |
|----------|---------|
| Mac Mini Tailscale IP | 100.111.198.111 |
| Windows PC Tailscale IP | 100.68.202.64 |
| Windows PC Ollama endpoint | 100.68.202.64:11434 |
| ChromaDB | localhost:8000 |
| n8n | localhost:5678 |
| SQLite | /Volumes/ThaluxAI 1/thalux.db |
| Obsidian vault | /Volumes/ThaluxAI 1/memory/vault/ |
**SPOF Warning:** Mac Mini runs everything. No backup host.

---

## 8. Decision Log (Recent)

| Date | Decision | Status |
|------|----------|--------|
| Jun 26 | Daily Briefing & Cold Outreach PAUSED | Done |
| Jun 26 | Niche Discovery Factory — 1st cycle run | Done |
| Jun 26 | Token snapshot every 6h — added | Done |
| Jun 25 | Watchdog paused | Done |
| Jun 25 | Prospect Research paused | Done |
| Jun 23 | ACS Doctrine: 41 agents, 8 depts | 🟡 Partial — blueprint claimed 41 agents; vault has 33 verified agent files. ~8 were counted from skill descriptions, creating an inflated total. |
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
| Jun 27 | Direction-setting conversation — Robert loves building/learning, bored by maintenance, wants sellable income; 4 shapes tabled (productize lead-gen, micro-SaaS, data feed, narrow vertical agent). Paused for asset inventory. | 🟡 In progress |

---

## 9. Trend / Horizon Scan

*Latest additions from Niche Discovery Factory (Jun 26):*
- FDIC BankIntel data product — $49 one-time, $99/mo recurring (live)
- OpenFEC compliance data — 7/10 viability
- NPPES healthcare provider — 6/10 viability

*Claude evaluates new schemas against this blueprint before adoption.*

**Direction conversation (Jun 27):** Robert's answer — loves building/learning, gets bored maintaining, wants long-term sellable income (no retirement plans). 4 candidate shapes on the table: (1) productize the lead-gen loop, (2) micro-SaaS utility, (3) productized research/data feed (BankIntel may already be this), (4) narrow vertical agent sold as software (not a relationship). Paused for asset inventory. Resume once HIGHEST/HIGH open blockers are clear.

---

## 10. Open Blockers

**PRIORITY: HIGHEST**
1. **BankIntel redirect fix** — page committed to repo, Astro build doesn't include it in deployed output. Sample CSV not served. Stripe payment links are live and could take money with no delivery mechanism — check immediately whether that link has been shared anywhere.
2. **Financial reconciliation** — Monthly Burn line (~$159) doesn't match corrected component costs (~$202+ with real OpenRouter spend). OpenRouter usage ($178.47) + remaining ($224.96) = $403.43, exceeds stated $350 cap — get a straight explanation of what "remaining" vs "usage" actually measure, reconcile the math.

**PRIORITY: HIGH**
3. CV Automotive GBP audit — blocked (no TJ dashboard access).
4. **cvautomotive.com** (non-hyphenated) — redirect to real domain (cv-automotive.com) or retire.
5. **CV Automotive invoice INV-001** — due Jul 1. Unpaid as of last check. Confirm payment status.
6. **Apex Trade — NOT SIGNED.** SLA template exists (drafted Jun 20) but zero signatures. No LLC/EIN filed. Open decision: chase to real signature (largest potential revenue, most scoping done) or dead for unstated reason? Needs Robert's explicit call.
7. **6 dormant crons** — session-archiver, CVE-scan, orphan-review, vault-metrics, staleness, firecrawl-credit. Zero execution history. Fix-and-confirm-it-runs, or delete the config. No third state.
8. Daily Briefing — 403 error. Paused Jun 26.
9. Cold Outreach — 2 consecutive failures. Paused Jun 26. Root cause: no funnel to receive leads yet.
10. Prospect Research — web scraping blocked (needs API key). Paused Jun 25.
11. Watchdog — paused Jun 25 (unknown cause).
12. Jul 4 Launch — content pipeline blocked (Robert). Still open.
13. ACS Phase 1 — 33 agents, 8 depts. Zero sub-phases started. → **⏸ PAUSED per Claude's call.** Not deleted.

**PRIORITY: MEDIUM**
14. SPOF — Mac Mini runs everything, no backup host.
15. Strategic blueprint refresh cron — just added, hasn't run yet. GitHub sync push needs verification on first execution.
16. Direction-setting conversation — 4 candidate shapes tabled. Paused for asset inventory; resume once HIGHEST/HIGH items above are clear.
17. No @thalux.ai email yet — limits professional client communications.
18. Windows worker dependency — Ollama and ingestion pipeline depend on Windows machine being online.

---

## 11. Source Documents Inventory

This blueprint consolidates the following documents. Source docs remain in vault for historical reference but this file is the single source of truth.

| Source Doc | Vault Path | Status | Notes |
|------------|-----------|--------|-------|
| Vault-Key Memory Architecture | `general/strategy/thalux.ai-dual-layer-memory-architecture.md` | ✅ CONSUMED — 841B single note | Mentioned Mem0 for dynamic layer — never deployed. Actual stack uses SQLite+ChromaDB+Obsidian. |
| Operational Protocol (Two-Phase Loop) | `sops/thalux-ai-interaction-protocol-two-phase-loop.md` | ✅ CONSUMED — 694B | Phase 1 (strategic whiteboard) → Phase 2 (compilation handoff). Subsumed by Section 5 of this blueprint. |
| Master Execution Plan June2026 v1 | `general/Thalux_Master_Execution_Plan_June2026.md` | ✅ CONSUMED — 20.7K | Dated June 4. "Founder: Robert Weatherbie" — name consistent. |
| Master Execution Plan June2026 v2 | `general/Thalux_Master_Execution_Plan_June2026_v2.md` | ✅ CONSUMED — 21.1K | Identical content to v1, richer frontmatter. |
| Infrastructure Implementation Plan v1.0 | `general/strategy/Thalux_Infrastructure_Implementation_Plan.md` | ✅ CONSUMED — 14.4K | Dated May 2026. Contains stale facts (Mac Mini "M4" — actually correct! Gemma "26B" — stale). Also had wrong Tailscale IP (100.111.198.111 — actual is 100.86.11.18). |

---

## 12. Considered and Shelved

This appendix documents approaches that were actively considered, invested-in, or built, then explicitly abandoned. It exists so the team does not re-litigate these decisions.

### Shelved Framings

| Framing | When | Why Shelved | What Replaced It |
|---------|------|-------------|------------------|
| **Trade Shop AI Receptionist** | Apr–Jun 2026 | Vertical lock-in. Robert explicitly rejected "automotive company, blue-collar company, local-PA company" framing. No committed vertical yet. | Vertical-agnostic "AI-powered revenue systems builder" |
| **Trade Shop Operating System** | May 2026 | Same root — assumed trade-shop vertical. Priced at ~$599/mo hypothetical. Never built. | No product replaces it; company is vertical-neutral |
| **Digital Front Desk / Receptionist** | Apr 2026 | Product naming that assumed service-business buyer persona | Generic "AI-powered revenue systems" |
| **Ergon as scoped agent** | Jun 2026 | Proposed name for Windows worker. Shift from "agent" to "compute node." | "Windows Worker" — an inference endpoint, not an agent |
| **Event-Driven Agentic OS** | May–Jun 2026 | Full ACS doctrine built but zero sub-phases started, no revenue tie. ACS paused per Claude's call Jun 27. | Paused, not deleted |
| **Google Drive API pipeline** | May 2026 | Replaced with local filesystem watcher (Drive for Desktop sync) | filesystem watcher at intake folder |
| **Make.com for workflows** | May 2026 | Migrated to n8n | n8n at localhost:5678 |
| **Gemma 4 26B on Windows** | May 2026 | Replaced with Qwen 2.5 7B for quality-to-speed ratio | Qwen2.5:7b at Q4_K_M |
| **Backblaze B2 offsite backup** | May 2026 (planned) | Deferred until first consistent revenue | rclone to Windows PC (interim) |

### Trade-Shop Language to Avoid
The following terms appeared in source docs and should not appear in agent prompts, sales scripts, or routing logic without a logged decision:
- "blue-collar" (as positioning)
- "trade shops" (as market definition)
- "local-PA company" (as identity)
- "Lancaster County" (as market boundary)
- "Digital Front Desk" (as product name)
- "Trade Shop AI Receptionist" (as product name)
- "Trade Shop Operating System"

> **NOT a rebuke of the work.** These were rational, well-researched positions at the time. They are shelved because the company's actual trajectory and founder's explicit direction diverged from them. The work invested in retell agents, n8n workflows, and one-click deployment is all reusable — it just operates under a different framing.

---

## Appendix: Key Reference Data

**Mac Mini Tailscale IP:** 100.86.11.18 (roberts-mac-mini-2)
**Windows PC Tailscale IP:** 100.68.202.64 (backup-plan-1)
**Windows PC Ollama endpoint:** 100.68.202.64:11434 (Ollama v0.30.10)
**Ollama models loaded (live):** qwen2.5:7b (Q4_K_M, ~4.7GB VRAM), nomic-embed-text (F16, 137M)
**ChromaDB:** localhost:8000
**n8n:** localhost:5678
**SQLite:** /Volumes/ThaluxAI 1/thalux.db
**ChromaDB data:** /Volumes/ThaluxAI 1/memory/chromadb/
**Obsidian vault:** /Volumes/ThaluxAI 1/memory/vault/
**Hermes skills:** ~/.hermes/skills/
**Audit script:** /Volumes/ThaluxAI 1/memory/scripts/thalux_audit.sh (may not exist)

### Google Drive
- Thalux Drive root: 1LwDL1ocyAQIYijrtCYwB4z64GP0jEaL_
- Decision Log (canonical): 1V1gu8BcDxCBAIZa3BiUsq5zQSbfiBRs_
- Quant Lab folder: 1bqxrVlfCdiVxOLxkQgzUFlGwS3015xWt
- Quant Lab Journal: 1VK5SAwJ1A7QqkrHYnpXV1o9IhwKaDERH-q-zeD1CB0Y

### Active Contacts
- CV Automotive: TJ Schaffer and Tim Sr.
- Gorilla Fire Marks: Brian Ober
- Lance McKinnon (Cashew Cartel): Mckinnonspantry@gmail.com — parked prospect
- Trevor Schnell (Morgan Stanley): Trevor.Schnell@morganstanley.com

---

## Changelog

### 2026-06-29 — Consolidation Draft (this version)
- Consolidated all 5 source documents into single canonical file
- Added Section 11: Source Documents Inventory
- Added Section 12: Considered and Shelved (appendix for abandoned approaches)
- Added explicit "no committed vertical yet" statement in Section 1
- Added Two-Machine Architecture spec (from MEP §4)
- Added Session Declaration Protocol and Handoff Protocol (from MEP §5)
- Added Five Operating Rules (from MEP §5.5)
- Added Three-Tier Memory Architecture description (from Implementation Plan)
- Added key reference data appendix (Tailscale IPs, Drive IDs, Ollama live models)
- Moved trade-shop/local-service language to Shelved appendix (Section 12)
- **Live-verified hardware:** Mac Mini confirmed **M4** (not M2). Tailscale IP confirmed 100.86.11.18 (MEP claimed 100.111.198.111 — wrong). Windows worker runs qwen2.5:7b + nomic-embed-text only (no Gemma). GPU: **RTX 5070 Ti Laptop, 12 GB VRAM** live-queried via SSH (census claimed 16 GB — wrong). Both `/Volumes/ThaluxAI` (dead) and `/Volumes/ThaluxAI 1` (active) confirmed. Samsung 990 PRO 4TB confirmed.
- Changelog from Jun 27 audit preserved in history below

### 2026-06-27 — Full Audit (prior version)
- Removed: Apex Trade "Signed" status (false claim), Token Snapshot from Open Blockers (recovered), "22 jobs" cron count (replaced with 27)
- Corrected: CV Automotive status, Gorilla Fire Marks status, FDIC pricing, OpenRouter costs, ACS count, vault file count
- Tagged: Apex Trade [REALITY CHECK FAILED], ACS Doctrine 🟡 Partial
- Added: Mitchell Dental, Miller & Co Plumbing, BankIntel redirect fix, 6 never-run crons, strategic blueprint refresh cron, decision log entries, changelog

---

*End of Strategic Blueprint — DRAFT pending Robert sign-off before treating as live.*
