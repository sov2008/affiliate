path = r'd:\WEB\antigravity\affiliate\deals-portal\src\i18n\ui.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix two-line wrapping for Ukrainian 'Всі знижки' to clean single-word 'Знижки'
text = text.replace('allDeals: "Всі знижки"', 'allDeals: "Знижки"')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: Updated Ukrainian allDeals string")

