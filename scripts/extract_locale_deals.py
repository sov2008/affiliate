import re, json

path = r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('COUPONS_DATA')
coupons_part = text[idx:]

coupons = re.findall(r'{\s*"id":\s*"([^"]+)",\s*"storeSlug":\s*"([^"]+)",\s*"storeName":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)"', coupons_part)

targets = {
    'es': [],
    'pt': [],
    'de': [],
    'uk': [],
    'pl': [],
    'cs': [],
    'ar_sample': []
}

for c in coupons:
    cid, s_slug, s_name, title, desc = c
    s = s_slug.lower()
    item = {'id': cid, 'slug': s_slug, 'name': s_name, 'title': title, 'desc': desc}
    
    if s.endswith('-mx') or '-mx-' in s or s.endswith('-es') or 'fiesta' in s or 'sol-cr' in s:
        targets['es'].append(item)
    elif s.endswith('-br') or '-br-' in s or 'phooto' in s or 'guldi' in s or 'eset-br' in s or 'bold' in s:
        targets['pt'].append(item)
    elif s.endswith('-de') or 'abelssoft' in s:
        targets['de'].append(item)
    elif s.endswith('-ua') or 'touch' in s or 'polis' in s or 'turbosto' in s or 'megogo' in s:
        targets['uk'].append(item)
    elif s.endswith('-pl') or '-pl-' in s or 'katalog' in s or 'konesso' in s:
        targets['pl'].append(item)
    elif s.endswith('-cz') or '-cz-' in s or 'coolcredit' in s or 'proficredit' in s or 'zonky' in s or 'kenwood-cz' in s:
        targets['cs'].append(item)
    elif any(k in s for k in ['rayna', 'vogacloset', 'dabdoob', 'vperfumes', 'jashanmal']) and len(targets['ar_sample']) < 6:
        targets['ar_sample'].append(item)

print("Targets to localize:")
for k, v in targets.items():
    print(f"[{k}] {len(v)} items")
    if v:
        print(f"  Example: {v[0]['name']} -> {v[0]['title']}")

