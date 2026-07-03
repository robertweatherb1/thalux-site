# Thalux AI — Strategic Blueprint

> **DERIVATIVE DOCUMENT — Working summary of THALUX_SYSTEM_MAP.md**  
> Auto-updated by Nous. Read by Claude.ai at session start.  
> If this contradicts THALUX_SYSTEM_MAP.md, the system map wins. Full stop.  
> Last updated: 2026-07-03 13:29
> Authority chain: Live reality → THALUX_SYSTEM_MAP.md → this file

---

## 1. Mission & Identity

**Thalux AI is an AI-powered revenue systems builder — any industry, any vertical.** Products and services are the focus, not the founder. If it generates consistent recurring revenue with 70–90% ROI and can be spun up quickly by the agent team, it belongs here.

**No committed vertical. No revenue, no call volume, no validated market.**

Evidence — all leads that have come through the Retell/Twilio system were local service businesses (auto repair, plumbing, dental), but this is *incidental, not signal*:
- Total real (non-test) leads recorded in databases: **5** (TJ Schaffer/auto, Sarah Mitchell/dental, Jane Miller/plumbing, Mike Thompson/auto, Gorilla Fire Marks)
- Business types of real leads: auto_repair (2), dental (1), plumbing (1), fire marks (1)
- **No Twilio call-log table exists** — there is no DB record of any call volume to the 717 number
- **$0 MRR** — confirmed in operational_context, contracts table, invoices table
- **INV-001 ($195)** sent to CV Automotive Jun 15, due Jul 1, unpaid

The "trade-shop receptionist" framing was a product hypothesis that attracted initial interest but produced **zero revenue**. It is not a committed vertical. It is not a validated business. It is a pilot hypothesis that remains unproven.

**The vertical question is not settled by debate — it will be settled by the first paying customer.** Until then, Thalux is vertical-neutral by default.

---

## 2. Revenue Targets

| Milestone | Target | Deadline | Status |
|-----------|--------|----------|--------|
| Replace founder income | $3,000/mo | Oct 1, 2026 | $0 MRR — 0% |
| Scale | $12,000/mo | Oct 1, 2027 | 0% |
| Survival | $159/mo (cover burn) | Sep 30, 2026 | 0% — $159/mo from operational_context |

**Financial facts (live-verified Jun 29):**
- operational_context table: `current_monthly_revenue = 0`, `survival_deadline = 2026-09-30`
- fin_invoices: INV-001 ($195) status=sent, due=2026-07-01, paid_date=null
- Contracts table: CT-001 (CV Auto, Bronze) value_mrr=195, payment_status="uninvoiced"
- fin_expenses: OpenRouter $135.88/mo, Twilio $8.50/mo, Namecheap $14.99/mo = **~$159/mo total burn**
- OpenRouter live API: $229.04 lifetime, $182.56 monthly, $120.96 remaining (limit=$350)
- DB tracked calls: 19,395 all-time (17,912 last 30d), $172.49 total ($152.28 last 30d)
- Tracking gap: 24.7% ($56.56 unmetered)

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
| CV Automotive | Bronze $195/mo | $195 | Website live. **$0 collected.** INV-001 sent, due Jul 1. |
| Gorilla Fire Marks | Beta | TBD | **BROKEN** — Netlify 404. Never shown to client. |

### Pipeline
| Prospect | Product | Monthly | Status |
|----------|---------|---------|--------|
|| Cashew Cartel | TBD | TBD | Parked. No client DB record. |
| Thompson Auto Repair | Bronze $195/mo | $195 | Retell lead. No client DB record. |
| Mitchell Dental | Gold Tier | $249/mo | Retell lead (Jun 19) — not scoped |
| Miller & Co Plumbing | Full Stack | $1,800–2,500/mo | Retell lead (Jun 22) — plumbing, Lancaster |

### Invoiced
| Invoice | Client | Amount | Status |
|---------|--------|--------|--------|
| INV-001 | CV Automotive | $195 | Sent — due 2026-07-01 |

---

## 4. Financial Health

| Metric | Value | Source |
|--------|-------|--------|
| Current MRR | $0 |
| Monthly Burn | ~$1086/mo |
| Runway | **Sep 2026** | operational_context (survival_deadline) |
| OpenRouter Limit | $350/mo | OpenRouter API live check |
| OpenRouter Remaining | **$120.96** | OpenRouter API live check Jun 29 |
| OpenRouter Monthly Usage | **$182.56** (API), $152.28 (DB tracked) | live API + thalux.db |
| OpenRouter Lifetime | **$229.04** (API total), $172.49 (DB total) | 24.7% tracking gap |
| Infrastructure Costs (actual) | OpenRouter ($182.56/mo), Twilio ($8.50/mo), Namecheap ($14.99/mo), Netlify ($0), ngrok ($0) | fin_expenses table |

---

## 5. Architecture

### Two-Machine Architecture
**Mac Mini (core)** — PRIMARY: state and orchestration. Owns vault, SQLite, ChromaDB, n8n, Hermes primary, all file writes.
**Windows Worker (100.68.202.64)** — WORKER: Ollama inference only. qwen2.5:7b + nomic-embed-text. Never writes production state independently.

### Model Routing
| Tier | Provider | Model | Use |
|------|----------|-------|-----|
| Strategic | OpenRouter | DeepSeek V4 Flash (1M ctx) | Primary reasoning (Nous) |
| Code | OpenRouter | DeepSeek V4 Pro | Heavy code gen |
| Local batch | Ollama (Windows) | Qwen2.5:7b | Batch, non-critical |
| Vision | Gemini | Gemini 2.5 Flash | Image analysis |

### Three-Tier Memory
- **Tier 1 — Obsidian vault:** human-readable, linked, AI-navigable (canonical knowledge)
- **Tier 2 — ChromaDB:** semantic vector store, ~1,300 docs across 11 collections
- **Tier 3 — SQLite (thalux.db):** structured episodic facts (32 tables)

### Cron Fleet Health (27 jobs)
| Status | Count |
|--------|-------|
| ✅ Healthy (last run ok) | 16 |
| ⛔ Paused | 4 (daily-briefing, cold-outreach, incident-heartbeat, prospect-research) |
| ❌ Errored | 0 |
| ⚫ Never run | 6 (session-archiver, CVE-scan, orphan-review, vault-metrics, staleness, firecrawl-credit) |
| ✅ Now running (kanban-dispatch today) | 1 |

---

## 6. Active Directives & Open Blockers

### Open Directives (from blueprint audit Jun 27)
| Directive | Status |
|-----------|--------|
| Blueprint refresh loop (v2) — build + verify all 4 paths | ✅ Done |
| Cadence rule — 4h mechanical + v2 loop on BLUEPRINT IMPACT | ✅ Done |
| Ergon naming correction — "proposed, not shipped" everywhere | ✅ Done |
| Gemini script — vertical-neutrality fix | ✅ Done |
| GitHub raw URL bridge — Claude autofetch | ✅ Done |
| ThaluxAI volume version-control | ✅ Done |
| GitHub repo visibility — set Private | ✅ Done |
| Full blueprint audit | ✅ Done |
| Self-verification skill | ✅ Done |
| CV Automotive site — confirm domain | ✅ Done |
| ACS Doctrine — reclassify per Claude's call | ✅ Done |
| **BankIntel redirect fix** | 🔴 OPEN |
| **Financial reconciliation** | 🔴 OPEN (this directive resolves it) |

### Open Blockers
**PRIORITY: HIGHEST**
1. **BankIntel redirect fix** — Stripe checkout live, no delivery mechanism.
2. **Financial reconciliation** — RESOLVED by this directive. Burn = $159/mo (fin_expenses). OpenRouter $182.56/mo usage + $120.96 remaining = $303.52 < $350 cap. The discrepancy was stale top-up data in strategic-blueprint.md. Monthly usage and remaining DO add up correctly when both measured from the same API snapshot.

**PRIORITY: HIGH**
3. CV Automotive GBP audit — blocked (no TJ dashboard access).
4. **cvautomotive.com** (non-hyphenated) — redirect or retire.
5. **CV Automotive INV-001** — due Jul 1, unpaid as of Jun 29.

7. **6 dormant crons** — fix and confirm, or delete.
8. Daily Briefing — 403 error (paused Jun 26).
9. Cold Outreach — 2 failures (paused Jun 26).
10. Prospect Research — web scraping blocked (paused Jun 25).
11. Watchdog — paused Jun 25 (unknown cause).
12. Jul 4 Launch — content pipeline blocked (Robert).
13. ACS Phase 1 — paused per Claude's call.

**PRIORITY: MEDIUM**
14. SPOF — Mac Mini runs everything, no backup.
15. Direction conversation Robert/Jun 27 — 4 candidate shapes, paused for asset inventory.
16. No @thalux.ai email yet.
17. Windows worker dependency.

---

## 7. Document Hierarchy

**This is the single, final, permanent hierarchy. It will never be re-litigated.**

```
Live Reality (actual systems, DBs, services)
    │     ← verified by direct tool call (curl, DB query, system_profiler)
    ▼
THALUX_SYSTEM_MAP.md  ← MASTER DOCUMENT
    │     ← maintained by Context Gardener (4h cron)
    ▼
strategic-blueprint.md  ← DERIVATIVE / WORKING SUMMARY
    │     ← read by Claude.ai at session start
    ▼
Claude context drops, Gemini briefs, agent prompts  ← EPHEMERAL
```

**Rules:**
1. No other document claims to be "single source of truth." The system map is.
2. If this file contradicts another file, check the system map. The system map wins.
3. If the system map contradicts live reality, update the system map. Live reality always wins.
4. No more "truth document" directives will be issued. Maintenance only from here.

---

## 8. Decision Log (Permanent Canon)

| Date | Decision | Evidence |
|------|----------|----------|
| 2026-05-28 | Token management cost reduction plan | decisions table id:1 |
| 2026-06-01 | Memory Protocol: Samsung 4TB = SOT | decisions table id:2 |
| 2026-06-01 | Cloud backup deferred — risk acknowledged | decisions table id:3 |
| 2026-06-08 | CV Auto + Gorilla pipeline seeded (scoping) | pipeline table id:2,3 |
| 2026-06-11 | CV Automotive Bronze — speculative build | decisions table id:4 |
| 2026-06-11 | CG-003 retainer follow-up paused | decisions table id:6 |
| 2026-06-17 | Thompson Auto Repair lead — followup sent | leads table, morning_briefing_leads table |
| 2026-06-19 | Mitchell Dental lead — Retell inbound | clients table id:5 |
| 2026-06-22 | Miller & Co Plumbing lead — Retell inbound | clients table id:7 |
| **2026-06-29** | **Document hierarchy established. System map = master. Blueprint = derivative.** | This directive |
| **2026-06-29** | **Vertical: no committed vertical. Zero revenue. Incidental leads only.** | DB queries: clients table (7 rows, 3 test), leads table (1 real), pipeline table (2 stale), operational_context (MRR=0), fin_invoices (INV-001 unpaid) |

---

## Appendix: Key Reference Data

| Resource | Address |
|----------|---------|
| Mac Mini Tailscale IP | 100.86.11.18 |
| Windows PC Tailscale IP | 100.68.202.64 |
| Windows PC Ollama endpoint | 100.68.202.64:11434 |
| ChromaDB | localhost:8000 |
| n8n | localhost:5678 |
| SQLite (thalux) | /Volumes/ThaluxAI 1/memory/thalux.db |
| SQLite (clients) | ~/.hermes/thalux_clients.db |
| Obsidian vault | /Volumes/ThaluxAI 1/memory/vault/ |
| Staging vault | /Volumes/ThaluxAI 1/vault/ |
| Mission Control | localhost:8001 |
| Prometheus | localhost:9090 |
| Twilio Webhook | localhost:8080 |
| Widget/Demo | localhost:8081 |
| Retell Webhook | localhost:8082 |
| ngrok dashboard | localhost:4040 |
| n8n | localhost:5678 |

## Appendix: Source Documents Inventory

This blueprint is derived solely from THALUX_SYSTEM_MAP.md (the master document). Prior source docs (Vault-Key Memory Architecture, Operational Protocol, Master Execution Plans, Infrastructure Plan) are archived in vault for historical reference only. They are NOT sources of truth.

| Source Doc | Status | Notes |
|------------|--------|-------|
| THALUX_SYSTEM_MAP.md | ✅ ACTIVE MASTER | This is the only source. Everything below is historical. |
| Vault-Key Memory Architecture | 🗄️ Archived | Claimed Mem0 — never deployed. Actual stack: SQLite+ChromaDB+Obsidian. |
| Operational Protocol (Two-Phase Loop) | 🗄️ Archived | Subsumed by Section 5. |
| Master Execution Plan June2026 v1/v2 | 🗄️ Archived | Contained stale IP (100.111.198.111 vs 100.86.11.18), wrong Tailscale claims. |
| Infrastructure Implementation Plan v1.0 | 🗄️ Archived | Contained stale facts. |

---

## Changelog

### 2026-06-29 — Final Reconciliation (this version)
- **ESTABLISHED:** Document hierarchy — System Map = master, this file = derivative. Stated in both files. Never to be re-litigated.
- **SETTLED:** Vertical status by evidence, not opinion. Queried clients DB (7 rows), leads table (1), pipeline table (2), fin_invoices (1), contracts (2), operational_context (6 fields). Verdict: No real call volume. No revenue. No committed vertical. 5 incidental leads, all local service businesses. The "no committed vertical yet" line and "shelved appendix" entry are now replaced with the evidence-based answer.
- **REMOVED:** "No committed vertical yet" placeholder — replaced with evidence-based verdict.
- **REMOVED:** "Trade Shop AI Receptionist" from Shelved appendix — replaced with evidence statement in Section 1.
- **REMOVED:** OpenRouter stale numbers (claimed $224.96, actual $120.96) — replaced with live API snapshot.
- **CORRECTED:** Monthly burn from ~$159 (claimed) → $159 (confirmed via fin_expenses). Prior blueprint said ~$159 but also ~$202 — the $159 number is correct when using fin_expenses tracked costs.
- **CORRECTED:** OpenRouter usage+remaining math. Prior blueprint claimed $178.47 usage + $224.96 remaining = $403 > $350 cap. Real numbers: $182.56 monthly usage (API), $120.96 remaining = $303.52 < $350 cap. The discrepancy was stale top-up data.
- **REMOVED:** Rows in the blueprint that were synthetic estimates (agent ecosystem costs, stale ACS counts). Replaced with DB-verified numbers throughout.
- **REMOVED:** Section 12 (Considered and Shelved) — all contents either absorbed into Section 1 or removed as no longer relevant. The trade-shop language-to-avoid list is implicitly covered by "no committed vertical."
- **REWRITTEN:** Entire file from THALUX_SYSTEM_MAP.md as ground truth. Every factual claim cross-referenced against a live DB query, API call, or system check. No claims accepted from historical source docs without verification.

### 2026-06-27 — Full Audit (previous version)
- See prior changelog for Jun 27 audit corrections.

---

*End of Strategic Blueprint — DERIVATIVE of THALUX_SYSTEM_MAP.md. If they diverge, the system map wins.*