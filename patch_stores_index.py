import sys

path = '/var/www/affiliate/deals-portal/src/pages/stores/index.astro'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import STORE_PRODUCTS in frontmatter
target_import = "import { STORES_DATA, COUPONS_DATA } from '../../data/couponsData';"
replace_import = """import { STORES_DATA, COUPONS_DATA } from '../../data/couponsData';
import { STORE_PRODUCTS, type StoreProduct } from '../../data/productsData';

// Flatten all hardware/software physical products from partner feeds
const allProducts: StoreProduct[] = Object.values(STORE_PRODUCTS).flat();
const totalProducts = allProducts.length;"""

if target_import not in content:
    print("ERROR: target_import not found")
    sys.exit(1)

content = content.replace(target_import, replace_import, 1)

# 2. Add Tab Switcher right before Filter Bar in HTML
filter_box_target = """        <!-- Search & Dynamic Filter Control Bar -->
        <div class="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-border-subtle shadow-sm mb-8 space-y-4">"""

tab_switcher = """        <!-- Master Mode Switcher: Partner Hubs vs Direct Products -->
        <div class="flex items-center gap-2 mb-6 p-1.5 bg-surface-container-low rounded-2xl border border-border-subtle max-w-md">
          <button
            type="button"
            id="tabModeStores"
            class="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span class="material-symbols-outlined text-[16px]">storefront</span>
            <span>Store Hubs &amp; Codes ({totalStores})</span>
          </button>
          <button
            type="button"
            id="tabModeProducts"
            class="flex-1 py-2.5 px-4 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span class="material-symbols-outlined text-[16px]">inventory_2</span>
            <span>Direct Products ({totalProducts})</span>
          </button>
        </div>

        <!-- Search & Dynamic Filter Control Bar -->
        <div class="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-border-subtle shadow-sm mb-8 space-y-4">"""

if filter_box_target not in content:
    print("ERROR: filter_box_target not found")
    sys.exit(1)

content = content.replace(filter_box_target, tab_switcher, 1)

# 3. Add Direct Products Grid right after the stores grid
grid_end_target = """        <!-- No Results Fallback Notice -->
        <div id="noStoresNotice" class="hidden text-center py-16 bg-surface-container-lowest rounded-2xl border border-border-subtle mb-14 p-6">"""

products_grid_html = """        <!-- Direct Products Catalog Grid (Toggled via tabModeProducts) -->
        <div id="productsCatalogGrid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-14">
          {allProducts.map(prod => (
            <article class="bg-surface-container-lowest rounded-2xl border border-border-subtle p-4 card-hover shadow-sm flex flex-col justify-between group">
              <div>
                <div class="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-border-subtle">
                  <img 
                    src={prod.imageUrl} 
                    alt={prod.title} 
                    loading="lazy"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.badge && (
                    <span class="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-400/30">
                      {prod.badge}
                    </span>
                  )}
                  <span class="absolute bottom-2 right-2 text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-md">
                    {prod.price}
                  </span>
                </div>
                <h3 class="text-xs font-bold text-on-surface line-clamp-2 mb-1.5 leading-snug group-hover:text-primary transition-colors" title={prod.title}>
                  {prod.title}
                </h3>
                <p class="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <div class="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  {prod.storeSlug}
                </span>
                <a
                  href={prod.productUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  class="py-1.5 px-3 rounded-lg bg-primary hover:bg-primary-container text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
                >
                  <span>View Product ↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        <!-- No Results Fallback Notice -->
        <div id="noStoresNotice" class="hidden text-center py-16 bg-surface-container-lowest rounded-2xl border border-border-subtle mb-14 p-6">"""

if grid_end_target not in content:
    print("ERROR: grid_end_target not found")
    sys.exit(1)

content = content.replace(grid_end_target, products_grid_html, 1)

# 4. Add client-side toggle script before </BaseLayout>
script_target = "</BaseLayout>"
script_replacement = """  <script>
    const tabStores = document.getElementById('tabModeStores');
    const tabProducts = document.getElementById('tabModeProducts');
    const storesGrid = document.getElementById('storesGrid');
    const productsGrid = document.getElementById('productsCatalogGrid');
    const filterBox = document.querySelector('.bg-surface-container-lowest.p-4');

    if (tabStores && tabProducts && storesGrid && productsGrid) {
      tabStores.addEventListener('click', () => {
        tabStores.className = 'flex-1 py-2.5 px-4 rounded-xl bg-primary text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer';
        tabProducts.className = 'flex-1 py-2.5 px-4 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer';
        storesGrid.classList.remove('hidden');
        productsGrid.classList.add('hidden');
      });

      tabProducts.addEventListener('click', () => {
        tabProducts.className = 'flex-1 py-2.5 px-4 rounded-xl bg-primary text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer';
        tabStores.className = 'flex-1 py-2.5 px-4 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer';
        storesGrid.classList.add('hidden');
        productsGrid.classList.remove('hidden');
      });
    }
  </script>
</BaseLayout>"""

if script_target not in content:
    print("ERROR: script_target not found")
    sys.exit(1)

content = content.replace(script_target, script_replacement, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: stores/index.astro updated with Tabs Switcher & Products Grid")
