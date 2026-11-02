import urllib.request

res = urllib.request.urlopen('http://localhost:4321/')
content = res.read().decode('utf-8')
print('Status:', res.getcode())
print('Language init script found:', 'promoradar_lang' in content)
langs = ['العربية', 'Español', 'Português', 'Deutsch', 'Українська', 'Polski', 'Čeština']
found_langs = [l for l in langs if l in content]
print('Found languages in Header menu:', found_langs)

