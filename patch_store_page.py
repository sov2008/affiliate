import sys

path = '/var/www/affiliate/deals-portal/src/pages/stores/[store].astro'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports at the top
import_target = "import BrandLogo from '../../components/BrandLogo.astro';"
import_replacement = """import BrandLogo from '../../components/BrandLogo.astro';
import ProductShowcase from '../../components/ProductShowcase.astro';
import { STORE_PRODUCTS } from '../../data/productsData';"""

if import_target not in content:
    print("ERROR: import_target not found")
    sys.exit(1)

content = content.replace(import_target, import_replacement, 1)

# 2. Add product lookup in script frontmatter
lookup_target = "const storeDeals = COUPONS_DATA.filter(deal => deal.storeSlug === store.slug);"
lookup_replacement = """const storeDeals = COUPONS_DATA.filter(deal => deal.storeSlug === store.slug);
const storeProducts = STORE_PRODUCTS[store.slug] || [];"""

if lookup_target not in content:
    print("ERROR: lookup_target not found")
    sys.exit(1)

content = content.replace(lookup_target, lookup_replacement, 1)

# 3. Add ProductShowcase component right before coupons grid container
grid_target = """            <!-- List of Coupons Container -->
            <div id="storeCouponsGrid" class="space-y-4">"""

grid_replacement = """            <!-- Direct Product Showcase Grid from Partner API -->
            {storeProducts.length > 0 && (
              <ProductShowcase products={storeProducts} storeName={store.name} />
            )}

            <!-- List of Coupons Container -->
            <div id="storeCouponsGrid" class="space-y-4">"""

if grid_target not in content:
    print("ERROR: grid_target not found")
    sys.exit(1)

content = content.replace(grid_target, grid_replacement, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: [store].astro updated with ProductShowcase")
