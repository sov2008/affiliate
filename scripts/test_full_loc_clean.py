import urllib.request, re

res = urllib.request.urlopen('http://localhost:4321/')
html = res.read().decode('utf-8')
print('HTTP Status:', res.getcode())

# Check characters by script blocks
ar_chars = len(re.findall(r'[\u0600-\u06FF]', html))
cyr_chars = len(re.findall(r'[\u0400-\u04FF]', html))
latin_ext = len(re.findall(r'[áéíóúñãõčšžůřťď]', html))

print(f"Arabic script characters (UAE/GCC/Saudi): {ar_chars}")
print(f"Cyrillic script characters (Ukraine): {cyr_chars}")
print(f"Latin extended characters (Spanish/Portuguese/Czech/Polish): {latin_ext}")

