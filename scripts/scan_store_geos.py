import re

content = open(r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts', 'r', encoding='utf-8').read()
slugs = set(re.findall(r'storeSlug:\s*[\'"]([^\'"]+)[\'"]', content))
print('Total unique deal storeSlugs:', len(slugs))

# Detect geo indicators in slugs
countries = {}
for s in sorted(slugs):
    geo = 'GLOBAL'
    if s.endswith('-in') or '-in-' in s: geo = 'IN'
    elif s.endswith('-mx') or '-mx-' in s: geo = 'MX'
    elif s.endswith('-br') or '-br-' in s: geo = 'BR'
    elif s.endswith('-cz') or '-cz-' in s: geo = 'CZ'
    elif s.endswith('-pl') or '-pl-' in s: geo = 'PL'
    elif s.endswith('-kz') or '-kz-' in s: geo = 'KZ'
    elif s.endswith('-ua') or s.startswith('touch') or 'polis' in s or 'turbosto' in s: geo = 'UA'
    elif s.endswith('-uk') or '-uk-' in s: geo = 'UK'
    elif s.endswith('-de') or '-de-' in s: geo = 'DE'
    elif s.endswith('-fr') or '-fr-' in s: geo = 'FR'
    elif s.endswith('-id') or '-id-' in s: geo = 'ID'
    elif s.endswith('-ph') or '-ph-' in s: geo = 'PH'
    elif s.endswith('-es') or '-es-' in s: geo = 'ES'
    elif s.endswith('-it') or '-it-' in s: geo = 'IT'
    elif s.endswith('-by') or '-by-' in s: geo = 'BY'
    elif any(g in s for g in ['gcc', 'uae', 'dubai', 'kw', 'om', 'sa', 'qatar', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr']): geo = 'GCC'
    elif any(u in s for u in ['usa', 'spokeo', 'discreet', 'verified-match', '945', 'wild-fork', 'directdeals']): geo = 'US'
    countries[s] = geo

print('Sample mapped countries:', list(countries.items())[:25])

