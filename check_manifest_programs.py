import json

with open('/var/www/affiliate/artifacts_admitad/cj_promoradar_manifest.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

print('Total Active CJ Programs:', d.get('totalActive'))
details = d.get('activeProgramsDetails', {})
for k, v in details.items():
    name = v.get('name', 'Unknown')
    coupons = len(v.get('coupons', []))
    print(f"ID: {k} | Name: {name} | Coupons: {coupons}")

