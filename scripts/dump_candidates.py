import re, json

path = r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('COUPONS_DATA')
coupons_part = text[idx:]

coupons = re.findall(r'{\s*"id":\s*"([^"]+)",\s*"storeSlug":\s*"([^"]+)",\s*"storeName":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)"', coupons_part)

all_localized_targets = []
for cid, s_slug, s_name, title, desc in coupons:
    s = s_slug.lower()
    lang = None
    if s.endswith('-mx') or '-mx-' in s or s.endswith('-es') or 'fiesta' in s or 'sol-cr' in s:
        lang = 'es'
    elif s.endswith('-br') or '-br-' in s or 'phooto' in s or 'guldi' in s or 'eset-br' in s or 'bold' in s:
        lang = 'pt'
    elif s.endswith('-de') or 'abelssoft' in s:
        lang = 'de'
    elif s.endswith('-ua') or 'touch' in s or 'polis' in s or 'turbosto' in s or 'megogo' in s:
        lang = 'uk'
    elif s.endswith('-pl') or '-pl-' in s or 'katalog' in s or 'konesso' in s:
        lang = 'pl'
    elif s.endswith('-cz') or '-cz-' in s or 'coolcredit' in s or 'proficredit' in s or 'zonky' in s or 'kenwood-cz' in s:
        lang = 'cs'
    elif any(k in s for k in ['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa']):
        lang = 'ar'
        
    if lang:
        all_localized_targets.append({
            'id': cid,
            'slug': s_slug,
            'name': s_name,
            'title': title,
            'desc': desc,
            'lang': lang
        })

print(f"Total localized candidate deals: {len(all_localized_targets)}")
with open(r'd:\WEB\antigravity\affiliate\scripts\candidates.json', 'w', encoding='utf-8') as out:
    json.dump(all_localized_targets, out, indent=2, ensure_ascii=False)
print("Saved to scripts/candidates.json")

