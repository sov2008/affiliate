import re, json

path = r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('COUPONS_DATA')
coupons_part = text[idx:]

coupons = re.findall(r'{\s*"id":\s*"([^"]+)",\s*"storeSlug":\s*"([^"]+)",\s*"storeName":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)"', coupons_part)

gcc_brands = set()
for cid, s_slug, s_name, title, desc in coupons:
    s = s_slug.lower()
    if any(k in s for k in ['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa', 'dermazone']):
        gcc_brands.add((s_slug, s_name))

with open(r'd:\WEB\antigravity\affiliate\scripts\gcc_brands.json', 'w', encoding='utf-8') as out:
    json.dump([{'slug': s, 'name': n} for s, n in sorted(gcc_brands)], out, indent=2, ensure_ascii=False)

print(f"Saved {len(gcc_brands)} GCC brands to scripts/gcc_brands.json")

