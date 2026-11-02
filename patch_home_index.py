import sys

path = '/var/www/affiliate/deals-portal/src/pages/index.astro'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import_target = "import BrandLogo from '../components/BrandLogo.astro';"
import_replacement = """import BrandLogo from '../components/BrandLogo.astro';
import HomeProductShowcase from '../components/HomeProductShowcase.astro';"""

if import_target not in content:
    print("ERROR: import_target not found")
    sys.exit(1)

content = content.replace(import_target, import_replacement, 1)

# Inject HomeProductShowcase right after hero section </section>
hero_end_target = """        </div>
      </div>
    </section>

    <!-- Popular Partner Stores Horizontal Scrollable Strip -->"""

hero_end_replacement = """        </div>
      </div>
    </section>

    <!-- Live Verified Products & Hardware Showcase from CJ Partner Feeds -->
    <HomeProductShowcase />

    <!-- Popular Partner Stores Horizontal Scrollable Strip -->"""

if hero_end_target not in content:
    print("ERROR: hero_end_target not found")
    sys.exit(1)

content = content.replace(hero_end_target, hero_end_replacement, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: index.astro patched with HomeProductShowcase")
