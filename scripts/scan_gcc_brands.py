import re, json

path = r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('COUPONS_DATA')
coupons_part = text[idx:]

coupons = re.findall(r'{\s*"id":\s*"([^"]+)",\s*"storeSlug":\s*"([^"]+)",\s*"storeName":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)"', coupons_part)

gcc_brands = {}
for cid, s_slug, s_name, title, desc in coupons:
    s = s_slug.lower()
    if any(k in s for k in ['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa', 'dermazone']):
        if s_slug not in gcc_brands:
            gcc_brands[s_slug] = {'name': s_name, 'count': 0, 'sample_title': title}
        gcc_brands[s_slug]['count'] += 1

print(f"Unique GCC Brand Slugs: {len(gcc_brands)}")
for slug, info in gcc_brands.items():
    print(f"  {slug} ({info['name']}): {info['count']} deals - '{info['sample_title']}'")

