import re

files = [
    ('/var/www/affiliate/deals-portal/dist/stores/nordvpn-standard-term/index.html', 'NordVPN Official Hub'),
    ('/var/www/affiliate/deals-portal/dist/stores/945industries/index.html', '945 Industries Tactical EDC'),
    ('/var/www/affiliate/deals-portal/dist/stores/mylead-dating/index.html', 'MyLead Dating & Verified Match'),
    ('/var/www/affiliate/deals-portal/dist/stores/mylead-private-vpn/index.html', 'MyLead UltraShield VPN'),
    ('/var/www/affiliate/deals-portal/dist/stores/creality-default-terms/index.html', 'Creality 3D Printing Hub'),
    ('/var/www/affiliate/deals-portal/dist/stores/fufugaga-terms/index.html', 'FUFUGAGA Modern Furniture'),
    ('/var/www/affiliate/deals-portal/dist/stores/abelssoft/index.html', 'Abelssoft Security Software')
]

for fpath, label in files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            html = f.read()

        title_m = re.search(r'<title>(.*?)</title>', html, re.I)
        h1_m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.I | re.S)
        desc_m = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.I)

        h1 = re.sub(r'<[^>]*>', '', h1_m.group(1)).strip() if h1_m else 'N/A'
        title = title_m.group(1).strip() if title_m else 'N/A'
        desc = desc_m.group(1).strip() if desc_m else 'N/A'

        # Check for products inside ProductShowcase
        prod_matches = re.findall(r'<h4[^>]*class=["\'][^"\']*font-bold[^"\']*["\'][^>]*>(.*?)</h4>', html, re.I)
        if not prod_matches:
            prod_matches = re.findall(r'<h3[^>]*class=["\'][^"\']*font-bold[^"\']*["\'][^>]*>(.*?)</h3>', html, re.I)

        clean_prods = [re.sub(r'<[^>]*>', '', p).strip() for p in prod_matches[:2]]

        # Check for voucher discount badges
        badges = re.findall(r'(\d+%\s*OFF|FREE\s*ACCESS|EXCLUSIVE\s*DEAL|VERIFIED\s*DEAL)', html, re.I)
        unique_badges = list(set(badges))[:2]

        url = fpath.replace('/var/www/affiliate/deals-portal/dist', 'https://promoradar.store')
        print(f"🔹 {label}")
        print(f"   🌐 URL: {url}")
        print(f"   🏷️ Title: {title}")
        print(f"   🎯 H1: {h1}")
        print(f"   💰 Disount Badges: {unique_badges}")
        if clean_prods:
            print(f"   🛍️ Live In-Stock SKU: {clean_prods}")
        print("-" * 80)
    except Exception as e:
        print("Error reading", fpath, e)

