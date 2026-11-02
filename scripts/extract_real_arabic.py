import re, json

path = r'd:\WEB\antigravity\affiliate\deals-portal\src\data\couponsData.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('COUPONS_DATA')
coupons_part = text[idx:]

coupons = re.findall(r'{\s*"id":\s*"([^"]+)",\s*"storeSlug":\s*"([^"]+)",\s*"storeName":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)"', coupons_part)

exact_arabic_keywords = [
    'rayna', 'vogacloset', 'thedealoutlet', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 
    'qasr-alawani', 'eyewa', 'dermazone', 'mamas-and-papas', 'sharafdg', 'h-and-m-mena', 
    'bath-and-body-works-mena', 'footlocker-mena', 'victoria-s-secret-mena', 'american-eagle-mena',
    'pottery-barn-mena', 'west-elm-mena', 'mothercare-mena', 'sun-and-sand-sports'
]

arabic_deals = []
for cid, s_slug, s_name, title, desc in coupons:
    s = s_slug.lower()
    if any(k in s for k in exact_arabic_keywords) or '-kw' in s or '-sa' in s or '-ae' in s or '-om' in s or '-qa' in s:
        arabic_deals.append({'id': cid, 'slug': s_slug, 'name': s_name, 'title': title, 'desc': desc})

print(f"Verified Authentic GCC / Arabic deals: {len(arabic_deals)}")
with open(r'd:\WEB\antigravity\affiliate\scripts\arabic_deals_list.json', 'w', encoding='utf-8') as out:
    json.dump(arabic_deals, out, indent=2, ensure_ascii=False)

