import re

path = r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Collect all stores and coupons
idx = text.find('COUPONS_DATA')
stores_part = text[:idx]
coupons_part = text[idx:]

stores = re.findall(r'"slug":\s*"([^"]+)",\s*"name":\s*"([^"]+)"', stores_part)
coupons = re.findall(r'{\s*"id":\s*"([^"]+)",\s*"storeSlug":\s*"([^"]+)",\s*"storeName":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)"', coupons_part)

print(f"Parsed {len(stores)} stores and {len(coupons)} coupons")

# Map of which slugs belong to which primary native languages
lang_deal_map = {
    'ar': [], # UAE, GCC
    'es': [], # Mexico, Spain
    'pt': [], # Brazil
    'de': [], # Germany
    'uk': [], # Ukraine
    'pl': [], # Poland
    'cs': [], # Czechia
    'en': []  # US, UK, Global
}

for c in coupons:
    cid, s_slug, s_name, title, desc = c
    s = s_slug.lower()
    
    if any(k in s for k in ['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa']):
        lang_deal_map['ar'].append(c)
    elif s.endswith('-mx') or '-mx-' in s or s.endswith('-es') or 'fiesta' in s or 'sol-cr' in s:
        lang_deal_map['es'].append(c)
    elif s.endswith('-br') or '-br-' in s or 'phooto' in s or 'guldi' in s or 'eset-br' in s or 'bold' in s:
        lang_deal_map['pt'].append(c)
    elif s.endswith('-de') or 'abelssoft' in s:
        lang_deal_map['de'].append(c)
    elif s.endswith('-ua') or 'touch' in s or 'polis' in s or 'turbosto' in s or 'megogo' in s:
        lang_deal_map['uk'].append(c)
    elif s.endswith('-pl') or '-pl-' in s or 'katalog' in s or 'konesso' in s:
        lang_deal_map['pl'].append(c)
    elif s.endswith('-cz') or '-cz-' in s or 'coolcredit' in s or 'proficredit' in s or 'zonky' in s or 'kenwood-cz' in s:
        lang_deal_map['cs'].append(c)
    else:
        lang_deal_map['en'].append(c)

for lang, deals in lang_deal_map.items():
    print(f"Language [{lang}]: {len(deals)} native-targeted deals")

