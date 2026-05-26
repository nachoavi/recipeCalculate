import os
import sys
import json
import requests
from datetime import datetime, timezone

APIFY_TOKEN = os.environ.get("APIFY_API_TOKEN")
if not APIFY_TOKEN:
    print("Error: APIFY_API_TOKEN not set", file=sys.stderr)
    sys.exit(1)

TERMS = [
    "harina", "azucar", "sal", "levadura",
    "leche", "mantequilla", "aceite", "arroz",
    "huevos", "crema", "chocolate", "avena",
    "maicena", "fideos", "queso",
]

BASE_URL = "https://api.apify.com/v2"
HEADERS = {"Authorization": f"Bearer {APIFY_TOKEN}"}

KEEP_FIELDS = {
    "product_id", "name", "brand", "format",
    "price", "list_price", "ppum",
    "in_stock", "categories", "url", "image",
}


def run_actor(term: str) -> list:
    print(f"Searching: {term}...", flush=True)
    try:
        resp = requests.post(
            f"{BASE_URL}/acts/scraperschile~alvi/runs",
            headers=HEADERS,
            json={"term": term, "maxPages": 3},
            params={"waitForFinish": 300},
            timeout=320,
        )
    except requests.RequestException as e:
        print(f"  Request error: {e}", flush=True)
        return []

    if not resp.ok:
        print(f"  HTTP {resp.status_code}", flush=True)
        return []

    run = resp.json().get("data", {})
    if run.get("status") != "SUCCEEDED":
        print(f"  Status: {run.get('status')}", flush=True)
        return []

    dataset_id = run.get("defaultDatasetId")
    if not dataset_id:
        return []

    try:
        items_resp = requests.get(
            f"{BASE_URL}/datasets/{dataset_id}/items",
            headers=HEADERS,
            params={"limit": 1000},
            timeout=60,
        )
    except requests.RequestException as e:
        print(f"  Fetch items error: {e}", flush=True)
        return []

    if not items_resp.ok:
        print(f"  Items HTTP {items_resp.status_code}", flush=True)
        return []

    items = items_resp.json()
    print(f"  {len(items)} products", flush=True)
    return items


def main():
    all_products: dict = {}

    for term in TERMS:
        for item in run_actor(term):
            pid = str(item.get("product_id", ""))
            if pid and pid not in all_products:
                all_products[pid] = {k: item.get(k) for k in KEEP_FIELDS}

    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "products": list(all_products.values()),
    }

    os.makedirs("public/data", exist_ok=True)
    with open("public/data/alvi-products.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nSaved {len(all_products)} unique products.")


if __name__ == "__main__":
    main()
