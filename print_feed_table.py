import json

with open('/var/www/affiliate/artifacts_admitad/cj_pipeline_manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

with open('/tmp/cj_programs_with_sku.json', 'r', encoding='utf-8') as f:
    feed_items = json.load(f)

details = manifest.get('activeProgramsDetails', {})

print(f"{'ID':<10} | {'SKUs':<6} | {'Coupons':<7} | {'Terms'}")
print("-" * 80)
for item in feed_items:
    pid = item['id']
    skus = item['totalCount']
    info = details.get(pid, {})
    terms = info.get('terms', 'N/A')
    coupons = len(info.get('coupons', []))
    print(f"{pid:<10} | {skus:<6} | {coupons:<7} | {terms[:60]}")

