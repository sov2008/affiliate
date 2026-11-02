path = r'd:\WEB\antigravity\affiliate\deals-portal\src\components\Header.astro'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add data-i18n tags to nav links
text = text.replace('<span>All Deals</span>', '<span data-i18n="allDeals">All Deals</span>')
text = text.replace('<span>Stores ({storesCount})</span>', '<span data-i18n="stores">Stores</span> <span>({storesCount})</span>')
text = text.replace('<span>Categories</span>', '<span data-i18n="categories">Categories</span>')
text = text.replace('<span>Compare</span>', '<span data-i18n="compare">Compare</span>')
text = text.replace('<span>FAQ</span>', '<span data-i18n="faq">FAQ</span>')
text = text.replace('<span>Saved</span>', '<span data-i18n="saved">Saved</span>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: Added data-i18n tags to Header.astro")

