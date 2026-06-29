#!/usr/bin/env python3
"""
BankIntel — Monthly Data Refresh Cron
=======================================
Schedule: Runs via Hermes cron on 2am 1st of every month.

Flow:
  1. Run fdic_extractor.py to fetch latest FDIC data
  2. Compare new CSV against current CSV for changes
  3. If changed: upload to Netlify Blobs, trigger n8n refresh webhook
  4. n8n identifies active Tier B subscribers and emails updated links

Usage:
  python3 refresh_bankintel.py [--dry-run]

Environment Variables:
  N8N_REFRESH_WEBHOOK   — n8n webhook URL for subscription refresh notifications
  HMAC_SECRET           — Secret for HMAC token generation
  NETLIFY_ACCESS_TOKEN  — Netlify personal access token for Blobs API
"""

import csv
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# ─── Config ───────────────────────────────────────────────────────────────────
HOME = Path.home()
EXTRACTOR_PATH = HOME / ".hermes" / "scripts" / "data-pipelines" / "fdic_extractor.py"
CURRENT_CSV = HOME / ".hermes" / "data" / "exports" / "fdic_premium_b2b_sales.csv"
ARCHIVE_DIR = HOME / ".hermes" / "data" / "exports" / "archive"
PRODUCT_SLUG = "bankintel"

N8N_REFRESH_WEBHOOK = os.environ.get(
    "N8N_REFRESH_WEBHOOK",
    "http://localhost:5678/webhook/bankintel-refresh"
)

NETLIFY_SITE_ID = os.environ.get("NETLIFY_SITE_ID")
NETLIFY_ACCESS_TOKEN = os.environ.get("NETLIFY_ACCESS_TOKEN")


# ─── Helpers ─────────────────────────────────────────────────────────────────

def sha256_file(path: Path) -> str:
    """Compute SHA256 hash of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def csv_row_count(path: Path) -> int:
    """Count data rows in a CSV (excluding header)."""
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)  # skip header
        return sum(1 for _ in reader)


def archive_current_csv() -> Path | None:
    """Move current CSV to archive with date suffix. Returns archive path."""
    if not CURRENT_CSV.exists():
        return None
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    archive_path = ARCHIVE_DIR / f"fdic_premium_b2b_sales_{date_str}.csv"
    CURRENT_CSV.rename(archive_path)
    print(f"  📦 Archived: {archive_path}")
    return archive_path


def upload_to_netlify_blobs(csv_path: Path, slug: str) -> bool:
    """Upload CSV to Netlify Blobs via REST API."""
    if not NETLIFY_ACCESS_TOKEN or not NETLIFY_SITE_ID:
        print("  ⚠️  NETLIFY_ACCESS_TOKEN or NETLIFY_SITE_ID not set — skipping blob upload")
        return False

    store_name = "thalux-data-products"
    url = (
        f"https://api.netlify.com/api/v1/sites/{NETLIFY_SITE_ID}"
        f"/blobs/{store_name}/{slug}"
    )

    with open(csv_path, "rb") as f:
        data = f.read()

    req = urllib.request.Request(
        url,
        data=data,
        method="PUT",
        headers={
            "Authorization": f"Bearer {NETLIFY_ACCESS_TOKEN}",
            "Content-Type": "text/csv",
        },
    )

    try:
        with urllib.request.urlopen(req) as resp:
            if resp.status in (200, 201):
                print(f"  ☁️  Uploaded to Netlify Blobs: {slug} ({len(data):,} bytes)")
                return True
            else:
                print(f"  ❌ Netlify Blobs returned {resp.status}")
                return False
    except Exception as e:
        print(f"  ❌ Netlify Blobs upload failed: {e}")
        return False


def trigger_n8n_refresh(change_report: dict) -> bool:
    """Notify n8n that data has changed — n8n handles emailing active Tier B subscribers."""
    payload = {
        "event": "data_refreshed",
        "product_slug": PRODUCT_SLUG,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "change_report": change_report,
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            N8N_REFRESH_WEBHOOK,
            data=data,
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            print(f"  📨 n8n refresh triggered: {resp.status}")
            print(f"     Response: {body[:200]}")
            return True
    except Exception as e:
        print(f"  ❌ n8n refresh trigger failed: {e}")
        return False


# ─── Main ────────────────────────────────────────────────────────────────────

def main() -> int:
    dry_run = "--dry-run" in sys.argv
    t0 = time.perf_counter()

    print("=" * 65)
    print("  BankIntel — Monthly Data Refresh")
    print(f"  Started: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    if dry_run:
        print("  🔍 DRY RUN MODE — No changes will be made")
    print("=" * 65)

    # ── Phase 1: Run Extractor ─────────────────────────────────────────────
    print(f"\n📡 Phase 1: Running extractor...")
    if not EXTRACTOR_PATH.exists():
        print(f"  ❌ Extractor not found: {EXTRACTOR_PATH}")
        return 1

    if dry_run:
        print(f"  (dry-run) Would run: python3 {EXTRACTOR_PATH}")
        new_hash = "dry-run-simulated-hash"
        new_count = 4185
    else:
        result = subprocess.run(
            [sys.executable, str(EXTRACTOR_PATH)],
            capture_output=True, text=True, timeout=300
        )
        print(result.stdout)
        if result.returncode != 0:
            print(f"  ❌ Extractor failed (exit {result.returncode}):", file=sys.stderr)
            print(result.stderr, file=sys.stderr)
            return 1
        if result.stderr:
            print(result.stderr)

        if not CURRENT_CSV.exists():
            print(f"  ❌ Extractor did not produce CSV at {CURRENT_CSV}")
            return 1

        new_hash = sha256_file(CURRENT_CSV)
        new_count = csv_row_count(CURRENT_CSV)

    print(f"  📊 New CSV: {new_count:,} rows | SHA256: {new_hash[:16]}...")

    # ── Phase 2: Check for Changes ─────────────────────────────────────────
    print(f"\n🔍 Phase 2: Checking for changes...")

    archive_dir = ARCHIVE_DIR
    archived_files = sorted(archive_dir.glob("fdic_premium_b2b_sales_*.csv"))

    if archived_files:
        latest_archive = archived_files[-1]
        old_hash = sha256_file(latest_archive)
        old_count = csv_row_count(latest_archive)

        print(f"  Previous: {latest_archive.name} ({old_count:,} rows)")
        print(f"  Current:  {new_count:,} rows")

        if new_hash == old_hash:
            print(f"  ✅ No changes detected — data is identical to last export.")
            print(f"  Skipping upload and n8n notification.")
            return 0
        else:
            print(f"  🔄 Changes detected!")
            if old_count != new_count:
                delta = new_count - old_count
                print(f"     Row delta: {old_count:,} → {new_count:,} ({'+' if delta > 0 else ''}{delta:,})")
    else:
        print(f"  📭 No previous archive found. This appears to be the first refresh run.")
        print(f"     Will upload current data and notify subscribers.")

        if not dry_run:
            # Create initial archive
            archive_current_csv()
            # Re-run extractor to get fresh data for the archive comparison next month
            print(f"  📦 Created initial archive baseline.")

    change_report = {
        "previous_hash": locals().get("old_hash", "none"),
        "current_hash": new_hash,
        "previous_rows": locals().get("old_count", 0),
        "current_rows": new_count,
        "has_changes": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # ── Phase 3: Upload & Notify ───────────────────────────────────────────
    print(f"\n☁️  Phase 3: Deploying update...")

    if dry_run:
        print(f"  (dry-run) Would upload to Netlify Blobs: {PRODUCT_SLUG}")
        print(f"  (dry-run) Would trigger n8n: {N8N_REFRESH_WEBHOOK}")
        print(f"\n✅ DRY RUN COMPLETE — No changes made.")
        return 0

    # Upload to Blobs
    upload_ok = upload_to_netlify_blobs(CURRENT_CSV, PRODUCT_SLUG)
    if not upload_ok:
        print(f"  ⚠️  Blob upload failed — will still try n8n notification")

    # Trigger n8n refresh
    notify_ok = trigger_n8n_refresh(change_report)

    # Archive current for next comparison
    archive_current_csv()

    elapsed = time.perf_counter() - t0
    print(f"\n{'=' * 65}")
    print(f"  {'✅ REFRESH COMPLETE' if (upload_ok or notify_ok) else '⚠️  REFRESH PARTIAL'}")
    print(f"  Blob uploaded: {'yes' if upload_ok else 'no (skipped/failed)'}")
    print(f"  n8n notified:  {'yes' if notify_ok else 'no'}")
    print(f"  Elapsed time:  {elapsed:.2f}s")
    print(f"{'=' * 65}")

    return 0 if (upload_ok or notify_ok) else 1


if __name__ == "__main__":
    sys.exit(main())