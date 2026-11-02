import re

files = [
    '/var/www/affiliate/deals-portal/dist/stores/rexing/index.html',
    '/var/www/affiliate/deals-portal/dist/stores/mylead-dating/index.html',
    '/var/www/affiliate/deals-portal/dist/stores/945industries/index.html',
    '/var/www/affiliate/deals-portal/dist/stores/fufugaga/index.html'
]

for fpath in files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            html = f.read()

        title_m = re.search(r'<title>(.*?)</title>', html, re.I)
        h1_m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.I | re.S)
        desc_m = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.I)

        h1 = re.sub(r'<[^>]*>', '', h1_m.group(1)).strip() if h1_m else 'N/A'
        title = title_m.group(1).strip() if title_m else 'N/A'
        desc = desc_m.group(1).strip() if desc_m else 'N/A'

        # Find product titles in ProductShowcase
        prod_titles = re.findall(r'<h4[^>]*class=["\'][^"\']*font-bold[^"\']*["\'][^>]*>(.*?)</h4>', html, re.I)
        if not prod_titles:
            prod_titles = re.findall(r'<h3[^>]*>(.*?)</h3>', html, re.I)

        clean_prods = [re.sub(r'<[^>]*>', '', p).strip() for p in prod_titles[:3]]

        url = fpath.replace('/var/www/affiliate/deals-portal/dist', 'https://promoradar.store')
        print(f"URL: {url}")
        print(f"Title: {title}")
        print(f"Header: {h1}")
        print(f"SEO Meta: {desc}")
        print(f"Sample In-Stock Products / Deals: {clean_prods}")
        print("=" * 80)
    except Exception as e:
        print("Error reading", fpath, e)

