import urllib.request, os

flags_dir = r'd:\WEB\antigravity\affiliate\deals-portal\public\flags'
os.makedirs(flags_dir, exist_ok=True)

# List of target country codes for our locales and markets
country_codes = ['us', 'ae', 'es', 'br', 'de', 'ua', 'pl', 'cz', 'gb', 'in', 'mx', 'kz', 'ph', 'by', 'id', 'fr', 'it']

for code in country_codes:
    dest = os.path.join(flags_dir, f"{code}.svg")
    if not os.path.exists(dest):
        try:
            # High-resolution official flag-icons SVGs
            url = f"https://cdn.jsdelivr.net/gh/lipis/flag-icons@main/flags/4x3/{code}.svg"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response, open(dest, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Downloaded {code}.svg")
        except Exception as e:
            print(f"Failed {code}: {e}")

print("Flag download complete.")

