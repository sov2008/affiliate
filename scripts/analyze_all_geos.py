import re

# Read stores and coupons to see all slugs
with open(r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Match all store profiles
stores = re.findall(r'"slug":\s*"([^"]+)",\s*"name":\s*"([^"]+)"', text)
print(f"Total stores found: {len(stores)}")

# Check their suffix or patterns
geo_counts = {}
for slug, name in stores:
    country = 'GLOBAL'
    s = slug.lower()
    n = name.lower()
    if s.endswith('-in') or '-in-' in s or ' india' in n: country = 'IN'
    elif s.endswith('-mx') or '-mx-' in s or ' mexico' in n: country = 'MX'
    elif s.endswith('-br') or '-br-' in s or ' brasil' in n or ' brazil' in n: country = 'BR'
    elif s.endswith('-cz') or '-cz-' in s or ' czech' in n: country = 'CZ'
    elif s.endswith('-pl') or '-pl-' in s or ' poland' in n: country = 'PL'
    elif s.endswith('-kz') or '-kz-' in s or ' kazakhstan' in n: country = 'KZ'
    elif s.endswith('-ua') or 'touch' in s or 'polis' in s or 'turbosto' in s or ' ukraine' in n: country = 'UA'
    elif s.endswith('-uk') or '-uk-' in s or ' united kingdom' in n or '123-reg' in s: country = 'GB'
    elif s.endswith('-de') or '-de-' in s or ' germany' in n: country = 'DE'
    elif s.endswith('-fr') or '-fr-' in s or ' france' in n: country = 'FR'
    elif s.endswith('-id') or '-id-' in s or ' indonesia' in n: country = 'ID'
    elif s.endswith('-ph') or '-ph-' in s or ' philippines' in n: country = 'PH'
    elif s.endswith('-es') or '-es-' in s or ' spain' in n: country = 'ES'
    elif s.endswith('-it') or '-it-' in s or ' italy' in n: country = 'IT'
    elif s.endswith('-by') or '-by-' in s or ' belarus' in n: country = 'BY'
    elif any(k in s for k in ['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa']): country = 'AE'
    elif any(u in s for u in ['usa', 'us-', '-us', 'spokeo', 'discreet', 'verified-match', '945', 'wild-fork', 'directdeals', 'bannerbuzz', 'wristband', 'diecast1']): country = 'US'
    
    geo_counts[country] = geo_counts.get(country, 0) + 1

print("Detected countries distribution:", sorted(geo_counts.items(), key=lambda x: x[1], reverse=True))

