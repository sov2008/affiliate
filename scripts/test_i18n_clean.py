import urllib.request

res = urllib.request.urlopen('http://localhost:4321/')
content = res.read().decode('utf-8')
print('Status:', res.getcode())
print('Language init script found:', 'promoradar_lang' in content)
langs = ['العربية', 'Español', 'Português', 'Deutsch', 'Українська', 'Polski', 'Čeština']
found_count = sum(1 for l in langs if l in content)
print(f'Found {found_count} of {len(langs)} target languages in Header menu!')

