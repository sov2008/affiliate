import urllib.request

res = urllib.request.urlopen('http://localhost:4321/')
html = res.read().decode('utf-8')
print('Status:', res.getcode())
has_svg = 'circle cx="12" cy="12" r="9"' in html
has_sub = 'Verified Promo Codes' in html
print('Canonical SVG radar in logo:', has_svg)
print('Canonical Brand Subtitle:', has_sub)

