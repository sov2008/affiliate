path = r'd:\WEB\antigravity\affiliate\deals-portal\src\components\Header.astro'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Improve Navigation Tabs Geometry to prevent wrapping and ensure high-contrast luxury dark feel
old_nav = """    <!-- Desktop Navigation Menu Tabs -->
    <nav class="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold" aria-label="Main Navigation">
      <a
        href={`${base}/`}
        class={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
          activePath === '/' 
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span class="material-symbols-outlined text-[15px] text-slate-900 dark:text-white">local_fire_department</span>
        <span data-i18n="allDeals">All Deals</span>
      </a>
      <a
        href={`${base}/stores/`}
        class={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
          activePath.startsWith('/stores') && !activePath.includes('/stores/')
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span class="material-symbols-outlined text-[15px] text-slate-900 dark:text-white">store</span>
        <span data-i18n="stores">Stores</span> <span>({storesCount})</span>
      </a>
      <a
        href={`${base}/categories/`}
        class={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
          activePath.startsWith('/categories') 
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span class="material-symbols-outlined text-[15px] text-slate-900 dark:text-white">category</span>
        <span data-i18n="categories">Categories</span>
      </a>
      <a
        href={`${base}/compare/`}
        class={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
          activePath.startsWith('/compare') 
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span class="material-symbols-outlined text-[15px] text-slate-900 dark:text-white">compare_arrows</span>
        <span data-i18n="compare">Compare</span>
      </a>
      <a
        href={`${base}/about/`}
        class={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
          activePath.startsWith('/about') 
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span class="material-symbols-outlined text-[15px] text-slate-400">help</span>
        <span data-i18n="faq">FAQ</span>
      </a>
    </nav>"""

new_nav = """    <!-- Desktop Navigation Menu Tabs -->
    <nav class="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs font-bold" aria-label="Main Navigation">
      <a
        href={`${base}/`}
        class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
          activePath === '/' 
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span class="material-symbols-outlined text-[16px]">local_fire_department</span>
        <span data-i18n="allDeals">All Deals</span>
      </a>
      <a
        href={`${base}/stores/`}
        class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
          activePath.startsWith('/stores') && !activePath.includes('/stores/')
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span class="material-symbols-outlined text-[16px]">store</span>
        <span data-i18n="stores">Stores</span><span class="font-normal text-slate-400">({storesCount})</span>
      </a>
      <a
        href={`${base}/categories/`}
        class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
          activePath.startsWith('/categories') 
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span class="material-symbols-outlined text-[16px]">category</span>
        <span data-i18n="categories">Categories</span>
      </a>
      <a
        href={`${base}/compare/`}
        class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
          activePath.startsWith('/compare') 
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span class="material-symbols-outlined text-[16px]">compare_arrows</span>
        <span data-i18n="compare">Compare</span>
      </a>
      <a
        href={`${base}/about/`}
        class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
          activePath.startsWith('/about') 
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span class="material-symbols-outlined text-[16px]">help</span>
        <span data-i18n="faq">FAQ</span>
      </a>
    </nav>"""

text = text.replace(old_nav, new_nav, 1)

# 2. Refine Right Action buttons (h-9 uniform height, compact paddings, unified pill design)
old_actions = """    <!-- Clean Header Actions (Region + Saved + Theme Switcher) -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      
      <!-- Region Selector Pill -->
      <div class="relative">
        <button
          type="button"
          id="headerRegionDropdownBtn"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shrink-0 cursor-pointer"
          title="Select Target Region"
        >
          <span id="headerSelectedRegionText">🌐 Worldwide</span>
          <span class="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
        </button>
        <div
          id="headerRegionMenu"
          class="hidden absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-1.5 text-left text-xs"
        >
          <div class="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Target Region</div>
          <button type="button" data-region-code="GLOBAL" class="header-region-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer">
            <span>🌐 Worldwide</span>
            <span class="region-check text-emerald-500 font-bold">✓</span>
          </button>
          <button type="button" data-region-code="US" class="header-region-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer">
            <span>🇺🇸 United States</span>
          </button>
          <button type="button" data-region-code="EU" class="header-region-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer">
            <span>🇪🇺 Europe</span>
          </button>
          <button type="button" data-region-code="GCC" class="header-region-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer">
            <span>🇦🇪 UAE &amp; GCC</span>
          </button>
          <button type="button" data-region-code="UA" class="header-region-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer">
            <span>🇺🇦 Ukraine</span>
          </button>
        </div>
      </div>

      <!-- Saved Deals Pill -->
      <button
        id="headerSavedBtn"
        type="button"
        class="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shrink-0 cursor-pointer"
        title="Saved Vouchers"
      >
        <span class="text-rose-500">❤️</span>
        <span data-i18n="saved">Saved</span>
        <span id="savedCountBadge" class="text-xs font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">0</span>
      </button>

      <!-- Language Selector Pill -->
      <div class="relative">
        <button
          type="button"
          id="headerLangDropdownBtn"
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shrink-0 cursor-pointer"
          title="Select Language"
        >
          <span class="text-xs" id="headerSelectedLangFlag">{currentLocaleConfig.flag}</span>
          <span id="headerSelectedLangText" class="uppercase tracking-wider text-[11px] font-mono">{currentLocaleConfig.code}</span>
          <span class="material-symbols-outlined text-[13px] text-slate-400">expand_more</span>
        </button>
        <div
          id="headerLangMenu"
          class="hidden absolute top-full right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-1.5 text-left text-xs"
        >
          <div class="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Available Languages</div>
          {Object.values(LOCALES).map(loc => (
            <button
              type="button"
              data-lang-code={loc.code}
              class={`header-lang-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer ${loc.code === locale ? 'bg-indigo-50/70 dark:bg-slate-800/90 text-indigo-600 dark:text-indigo-400' : ''}`}
            >
              <span class="flex items-center gap-2">
                <span>{loc.flag}</span>
                <span>{loc.nativeName}</span>
              </span>
              <span class="text-[10px] uppercase font-mono text-slate-400">{loc.code}</span>
            </button>
          ))}
        </div>
      </div>

      <!-- 3-State Light / Auto / Dark Theme Pill Toggle (`#theme-control-wrapper`) -->"""

new_actions = """    <!-- Clean Header Actions (Region + Saved + Language + Theme) -->
    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
      
      <!-- Region Selector Pill -->
      <div class="relative">
        <button
          type="button"
          id="headerRegionDropdownBtn"
          class="h-9 inline-flex items-center gap-1 px-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shrink-0 cursor-pointer shadow-2xs whitespace-nowrap"
          title="Select Target Region"
        >
          <span id="headerSelectedRegionText">🌐 Worldwide</span>
          <span class="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
        </button>
        <div
          id="headerRegionMenu"
          class="hidden absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-1.5 text-left text-xs"
        >
          <div class="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Target Region</div>
          <button type="button" data-region-code="GLOBAL" class="header-region-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer">
            <span>🌐 Worldwide</span>
            <span class="region-check text-emerald-500 font-bold">✓</span>
          </button>
          <button type="button" data-region-code="US" class="header-region-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer">
            <span>🇺🇸 United States</span>
          </button>
          <button type="button" data-region-code="EU" class="header-region-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer">
            <span>🇪🇺 Europe</span>
          </button>
          <button type="button" data-region-code="GCC" class="header-region-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer">
            <span>🇦🇪 UAE &amp; GCC</span>
          </button>
          <button type="button" data-region-code="UA" class="header-region-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer">
            <span>🇺🇦 Ukraine</span>
          </button>
        </div>
      </div>

      <!-- Saved Deals Pill -->
      <button
        id="headerSavedBtn"
        type="button"
        class="h-9 inline-flex items-center gap-1.5 px-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shrink-0 cursor-pointer shadow-2xs whitespace-nowrap"
        title="Saved Vouchers"
      >
        <span class="text-rose-500 text-[13px]">❤️</span>
        <span data-i18n="saved">Saved</span>
        <span id="savedCountBadge" class="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">0</span>
      </button>

      <!-- Language Selector Pill -->
      <div class="relative">
        <button
          type="button"
          id="headerLangDropdownBtn"
          class="h-9 inline-flex items-center gap-1 px-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shrink-0 cursor-pointer shadow-2xs whitespace-nowrap"
          title="Select Language"
        >
          <span class="text-xs" id="headerSelectedLangFlag">{currentLocaleConfig.flag}</span>
          <span id="headerSelectedLangText" class="uppercase tracking-wider text-[11px] font-mono">{currentLocaleConfig.code}</span>
          <span class="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
        </button>
        <div
          id="headerLangMenu"
          class="hidden absolute top-full right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-1.5 text-left text-xs"
        >
          <div class="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Available Languages</div>
          {Object.values(LOCALES).map(loc => (
            <button
              type="button"
              data-lang-code={loc.code}
              class={`header-lang-item w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-between cursor-pointer ${loc.code === locale ? 'bg-indigo-50/70 dark:bg-slate-800/90 text-indigo-600 dark:text-indigo-400' : ''}`}
            >
              <span class="flex items-center gap-2">
                <span>{loc.flag}</span>
                <span>{loc.nativeName}</span>
              </span>
              <span class="text-[10px] uppercase font-mono text-slate-400">{loc.code}</span>
            </button>
          ))}
        </div>
      </div>

      <!-- 3-State Light / Auto / Dark Theme Pill Toggle (`#theme-control-wrapper`) -->"""

text = text.replace(old_actions, new_actions, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: Polished Header.astro geometry and alignment")

