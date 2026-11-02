import sys

path = '/var/www/affiliate/core/src/services/offer-routing.service.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    this.offers.set('cj_abelssoft', {
      id: 'cj_abelssoft',
      name: 'Abelssoft PC Utilities (CJ)',
      network: 'cj',
      baseUrl: 'https://www.anrdoezrs.net/click-8102806-15509939',
      subParam: 'sid',
      isPrimary: false,
      enabled: true,
    });"""

replacement = """    this.offers.set('cj_abelssoft', {
      id: 'cj_abelssoft',
      name: 'Abelssoft PC Utilities (CJ)',
      network: 'cj',
      baseUrl: 'https://www.anrdoezrs.net/click-8102806-15509939',
      subParam: 'sid',
      isPrimary: false,
      enabled: true,
    });

    this.offers.set('cj_945industries', {
      id: 'cj_945industries',
      name: '945 Industries Concealment & EDC (CJ)',
      network: 'cj',
      baseUrl: process.env.CJ_945INDUSTRIES_URL || 'https://www.jdoqocy.com/click-101907236-17157504',
      subParam: 'sid',
      isPrimary: false,
      enabled: true,
    });"""

if target not in content:
    print("ERROR: Target not found in offer-routing.service.ts")
    sys.exit(1)

content = content.replace(target, replacement, 1)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: cj_945industries added to offer routing")
