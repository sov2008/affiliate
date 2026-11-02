import urllib.request, re

res = urllib.request.urlopen('https://promoradar.store/')
html = res.read().decode('utf-8')
header_match = re.search(r'<header[^>]*>([\s\S]*?)</header>', html)
if header_match:
    brand = re.search(r'<a[^>]*href="/"[^>]*>([\s\S]*?)</a>', header_match.group(1))
    if brand:
        print('=== LIVE LOGO & BRAND BLOCK ===')
        print(brand.group(0))
    else:
        print('Brand link not found in header')
else:
    print('Header not found')

