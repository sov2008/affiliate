path = r'd:\WEB\antigravity\affiliate\deals-portal\src\components\Header.astro'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace temporary radar icon block with canonical live production brand block
old_brand = """    <!-- Exact PromoRadar Logo & Brand Block -->
    <a href={`${base}/`} class="flex items-center gap-3 text-left group shrink-0">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
        <span class="material-symbols-outlined text-[24px]">radar</span>
      </div>
      <div>
        <div class="font-extrabold text-[19px] tracking-tight leading-none text-slate-900 dark:text-white">PromoRadar</div>
        <div class="text-[9.5px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 leading-none mt-1">GLOBAL Verified Deals</div>
      </div>
    </a>"""

canonical_brand = """    <!-- Canonical Live Production PromoRadar Logo & Brand Block -->
    <a href={`${base}/`} class="flex items-center gap-2.5 text-left group shrink-0">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-rose-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke-width="2" class="opacity-40"></circle>
          <circle cx="12" cy="12" r="5" stroke-width="2" class="opacity-75"></circle>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 12l6-6"></path>
          <circle cx="12" cy="2" fill="currentColor"></circle>
        </svg>
      </div>
      <div>
        <span class="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">PromoRadar</span>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">Verified Promo Codes &amp; Deals</p>
      </div>
    </a>"""

if old_brand in text:
    text = text.replace(old_brand, canonical_brand, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("SUCCESS: Header updated to canonical production logo and brand")
else:
    print("WARNING: old_brand not matched exactly")

