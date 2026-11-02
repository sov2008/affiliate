import re, json

path = r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('COUPONS_DATA')
coupons_part = text[idx:]

coupons = re.findall(r'{\s*"id":\s*"([^"]+)",\s*"storeSlug":\s*"([^"]+)",\s*"storeName":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)"', coupons_part)

untranslated_gcc = []
for cid, s_slug, s_name, title, desc in coupons:
    s = s_slug.lower()
    # Check if Arabic or GCC related
    if any(k in s for k in ['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa', 'touch', 'dermazone']):
        # check if title contains Arabic characters
        has_arabic = bool(re.search(r'[\u0600-\u06FF]', title))
        if not has_arabic:
            untranslated_gcc.append({'id': cid, 'slug': s_slug, 'name': s_name, 'title': title})

print(f"Total GCC coupons needing full Arabic translation: {len(untranslated_gcc)}")
for item in untranslated_gcc[:10]:
    print(f"  {item['name']} ({item['slug']}): {item['title']}")

