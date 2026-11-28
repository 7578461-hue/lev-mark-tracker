#!/usr/bin/env python3
"""
Daily Supabase backup for lev-mark-tracker.

Downloads every row from every table and writes a single JSON file
backups/YYYY-MM-DD.json so the git history acts as the snapshot store.

Supabase returns at most 1000 rows per request, so each table is read
page by page (ordered by id) and the row count is checked against the
server's exact count. The run fails loudly if they differ.

Restore: see scripts/restore.py.
"""
import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

SUPA  = "https://oqlnsqtveilnphvchwtn.supabase.co"
KEY   = "sb_publishable_DL0kGfHLr_l3sX-KjMkbqg_lyIS8oMu"
PAGE  = 1000
TABLES = [
    "formula_entries",
    "water_entries",
    "sleep_entries",
    "feeding_entries",
    "medication_entries",
    "daily_summaries",
    "weight_entries",
]
# Tables that may not exist yet (created by optional SQL files).
OPTIONAL = [
    "lab_results",   # supabase-labs.sql
    "dev_entries",   # supabase-dev.sql
]

class Missing(Exception):
    pass

def get_page(table, offset):
    req = urllib.request.Request(
        f"{SUPA}/rest/v1/{table}?select=*&order=id.asc&limit={PAGE}&offset={offset}",
        headers={
            "apikey": KEY,
            "Authorization": f"Bearer {KEY}",
            "Accept": "application/json",
            "Prefer": "count=exact",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            rows = json.loads(r.read())
            # Content-Range: 0-999/4321  (or */0 for an empty table)
            cr = r.headers.get("Content-Range", "")
            total = int(cr.split("/")[-1]) if "/" in cr and cr.split("/")[-1].isdigit() else None
            return rows, total
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:300]
        if e.code == 404 or "PGRST205" in body or "42P01" in body:
            raise Missing(table)
        raise RuntimeError(f"{table}: HTTP {e.code} {body}")

def fetch(table):
    rows, total = get_page(table, 0)
    offset = len(rows)
    while total is not None and offset < total:
        page, _ = get_page(table, offset)
        if not page:
            break
        rows.extend(page)
        offset += len(page)
    if total is not None and len(rows) != total:
        raise RuntimeError(f"{table}: got {len(rows)} rows, server says {total}")
    return rows

def main():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    snapshot = {
        "snapshot_at_utc": datetime.now(timezone.utc).isoformat(),
        "supabase_project": "oqlnsqtveilnphvchwtn",
        "tables": {},
    }
    total = 0
    for t in TABLES + OPTIONAL:
        try:
            rows = fetch(t)
        except Missing:
            if t in OPTIONAL:
                print(f"  {t:22s}   (table not created yet — skipped)")
                continue
            raise
        snapshot["tables"][t] = rows
        print(f"  {t:22s} {len(rows):6d} rows")
        total += len(rows)
    print(f"  ──────────────────────────────")
    print(f"  total                  {total:6d} rows")

    out_dir = sys.argv[1] if len(sys.argv) > 1 else "backups"
    os.makedirs(out_dir, exist_ok=True)
    path = f"{out_dir}/{today}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=2)
    print(f"\nWrote {path}")

if __name__ == "__main__":
    main()
