import urllib.request

res = urllib.request.urlopen('http://localhost:4321/')
html = res.read().decode('utf-8')
print('Status:', res.getcode())
terms = ['Půjčka Zonky', 'Katalog Marzeń', 'SharkNinja', 'Guldi', 'Touch UA']
for t in terms:
    print(f'Term "{t}":', t in html)

# Count Arabic chars
import re
ar_matches = len(re.findall(r'[\u0600-\u06FF]', html))
print(f"Arabic characters rendered in catalog HTML: {ar_matches}")

