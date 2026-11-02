import re
from collections import Counter

with open(r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Match store profiles
stores = re.findall(r'"slug":\s*"([^"]+)",\s*"name":\s*"([^"]+)"', text)
# In couponsData, deals use 'storeSlug': '...' or 'storeSlug': "..."
deal_slugs = re.findall(r'storeSlug:\s*[\'"]([^\'"]+)[\'"]', text)

# Country mapping
country_map = {
    'GLOBAL': {'name': 'Worldwide / Global (190+ countries)', 'stores': 0, 'deals': 0},
    'AE': {'name': 'UAE & GCC (Dubai, Saudi Arabia, Kuwait, Qatar, Oman)', 'stores': 0, 'deals': 0},
    'US': {'name': 'United States', 'stores': 0, 'deals': 0},
    'IN': {'name': 'India', 'stores': 0, 'deals': 0},
    'BR': {'name': 'Brazil', 'stores': 0, 'deals': 0},
    'MX': {'name': 'Mexico', 'stores': 0, 'deals': 0},
    'GB': {'name': 'United Kingdom', 'stores': 0, 'deals': 0},
    'CZ': {'name': 'Czech Republic', 'stores': 0, 'deals': 0},
    'UA': {'name': 'Ukraine', 'stores': 0, 'deals': 0},
    'PL': {'name': 'Poland', 'stores': 0, 'deals': 0},
    'KZ': {'name': 'Kazakhstan', 'stores': 0, 'deals': 0},
    'ID': {'name': 'Indonesia', 'stores': 0, 'deals': 0},
    'PH': {'name': 'Philippines', 'stores': 0, 'deals': 0},
    'BY': {'name': 'Belarus', 'stores': 0, 'deals': 0},
    'DE': {'name': 'Germany / DACH', 'stores': 0, 'deals': 0},
    'EU': {'name': 'European Union', 'stores': 0, 'deals': 0}
}

def detect_geo(slug, name=''):
    s = slug.lower()
    n = name.lower()
    if s.endswith('-in') or '-in-' in s or ' india' in n: return 'IN'
    if s.endswith('-mx') or '-mx-' in s or ' mexico' in n: return 'MX'
    if s.endswith('-br') or '-br-' in s or ' brasil' in n or ' brazil' in n: return 'BR'
    if s.endswith('-cz') or '-cz-' in s or ' czech' in n: return 'CZ'
    if s.endswith('-pl') or '-pl-' in s or ' poland' in n: return 'PL'
    if s.endswith('-kz') or '-kz-' in s or ' kazakhstan' in n: return 'KZ'
    if s.endswith('-ua') or 'touch' in s or 'polis' in s or 'turbosto' in s or ' ukraine' in n: return 'UA'
    if s.endswith('-uk') or '-uk-' in s or ' united kingdom' in n or '123-reg' in s: return 'GB'
    if s.endswith('-de') or '-de-' in s or ' germany' in n or 'abelssoft' in s: return 'DE'
    if s.endswith('-id') or '-id-' in s or ' indonesia' in n: return 'ID'
    if s.endswith('-ph') or '-ph-' in s or ' philippines' in n: return 'PH'
    if s.endswith('-by') or ' belarus' in n: return 'BY'
    if any(k in s for k in ['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa']): return 'AE'
    if any(u in s for u in ['usa', 'us-', '-us', 'spokeo', 'discreet', 'verified-match', '945', 'wild-fork', 'directdeals', 'bannerbuzz', 'wristband', 'diecast1']): return 'US'
    return 'GLOBAL'

store_geo_map = {}
for slug, name in stores:
    geo = detect_geo(slug, name)
    store_geo_map[slug] = geo
    country_map[geo]['stores'] += 1

for c_slug in deal_slugs:
    geo = store_geo_map.get(c_slug, detect_geo(c_slug))
    country_map[geo]['deals'] += 1

total_stores = len(stores)
total_deals = len(deal_slugs)

print(f"TOTAL STORES: {total_stores}")
print(f"TOTAL DEALS: {total_deals}")
print("--- COUNTRIES BREAKDOWN ---")
for code, data in sorted(country_map.items(), key=lambda x: (x[1]['stores'] + x[1]['deals']), reverse=True):
    if data['stores'] > 0 or data['deals'] > 0:
        print(f"[{code}] {data['name']}: {data['stores']} stores, {data['deals']} deals")

