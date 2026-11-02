import re

path = r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('COUPONS_DATA')
c_part = text[idx:]
deals = re.findall(r'"storeSlug":\s*"([^"]+)"', c_part)
print("Real deals count in COUPONS_DATA:", len(deals))

country_deals = {}
def detect_geo(s):
    s = s.lower()
    if s.endswith('-in') or '-in-' in s: return 'IN'
    if s.endswith('-mx') or '-mx-' in s: return 'MX'
    if s.endswith('-br') or '-br-' in s: return 'BR'
    if s.endswith('-cz') or '-cz-' in s: return 'CZ'
    if s.endswith('-pl') or '-pl-' in s: return 'PL'
    if s.endswith('-kz') or '-kz-' in s: return 'KZ'
    if s.endswith('-ua') or 'touch' in s or 'polis' in s or 'turbosto' in s: return 'UA'
    if s.endswith('-uk') or '-uk-' in s or '123-reg' in s: return 'GB'
    if s.endswith('-de') or '-de-' in s or 'abelssoft' in s: return 'DE'
    if s.endswith('-id') or '-id-' in s: return 'ID'
    if s.endswith('-ph') or '-ph-' in s: return 'PH'
    if s.endswith('-by'): return 'BY'
    if any(k in s for k in ['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa']): return 'AE'
    if any(u in s for u in ['usa', 'spokeo', 'discreet', 'verified-match', '945', 'wild-fork', 'directdeals', 'bannerbuzz', 'wristband', 'diecast1']): return 'US'
    return 'GLOBAL'

for d in deals:
    g = detect_geo(d)
    country_deals[g] = country_deals.get(g, 0) + 1

for g, count in sorted(country_deals.items(), key=lambda x: x[1], reverse=True):
    print(f"Country {g}: {count} verified deals")

