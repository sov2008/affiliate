import re
from collections import Counter

with open(r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract stores and coupons
stores = re.findall(r'"slug":\s*"([^"]+)",\s*"name":\s*"([^"]+)"', text)
coupons = re.findall(r'storeSlug:\s*"([^"]+)"', text)

print(f"Total stores: {len(stores)}")
print(f"Total active deals/coupons: {len(coupons)}")

# Full Country Mapping
country_map = {
    'US': {'name': 'United States', 'flag': '🇺🇸', 'stores': 0, 'deals': 0},
    'GB': {'name': 'United Kingdom', 'flag': '🇬🇧', 'stores': 0, 'deals': 0},
    'AE': {'name': 'United Arab Emirates & GCC (Saudi Arabia, Kuwait, Qatar, Oman)', 'flag': '🇦🇪', 'stores': 0, 'deals': 0},
    'DE': {'name': 'Germany', 'flag': '🇩🇪', 'stores': 0, 'deals': 0},
    'FR': {'name': 'France', 'flag': '🇫🇷', 'stores': 0, 'deals': 0},
    'ES': {'name': 'Spain', 'flag': '🇪🇸', 'stores': 0, 'deals': 0},
    'IT': {'name': 'Italy', 'flag': '🇮🇹', 'stores': 0, 'deals': 0},
    'PL': {'name': 'Poland', 'flag': '🇵🇱', 'stores': 0, 'deals': 0},
    'CZ': {'name': 'Czech Republic', 'flag': '🇨🇿', 'stores': 0, 'deals': 0},
    'UA': {'name': 'Ukraine', 'flag': '🇺🇦', 'stores': 0, 'deals': 0},
    'KZ': {'name': 'Kazakhstan', 'flag': '🇰🇿', 'stores': 0, 'deals': 0},
    'IN': {'name': 'India', 'flag': '🇮🇳', 'stores': 0, 'deals': 0},
    'BR': {'name': 'Brazil', 'flag': '🇧🇷', 'stores': 0, 'deals': 0},
    'MX': {'name': 'Mexico', 'flag': '🇲🇽', 'stores': 0, 'deals': 0},
    'ID': {'name': 'Indonesia', 'flag': '🇮🇩', 'stores': 0, 'deals': 0},
    'PH': {'name': 'Philippines', 'flag': '🇵🇭', 'stores': 0, 'deals': 0},
    'BY': {'name': 'Belarus', 'flag': '🇧🇾', 'stores': 0, 'deals': 0},
    'GLOBAL': {'name': 'Worldwide / Global (190+ countries)', 'flag': '🌐', 'stores': 0, 'deals': 0}
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
    if s.endswith('-de') or '-de-' in s or ' germany' in n: return 'DE'
    if s.endswith('-fr') or '-fr-' in s or ' france' in n: return 'FR'
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

for c_slug in coupons:
    geo = store_geo_map.get(c_slug, detect_geo(c_slug))
    country_map[geo]['deals'] += 1

print("\n--- RESULTS BY GEOGRAPHY ---")
for code, data in sorted(country_map.items(), key=lambda x: (x[1]['stores'] + x[1]['deals']), reverse=True):
    if data['stores'] > 0 or data['deals'] > 0:
        print(f"{data['flag']} {data['name']} ({code}): {data['stores']} магазинов, {data['deals']} активных скидок/офферов")

