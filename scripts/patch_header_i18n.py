path = r'd:\WEB\antigravity\affiliate\deals-portal\src\components\Header.astro'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Frontmatter
old_frontmatter = """---
import { STORES_DATA } from '../data/couponsData';
import { getUniqueCleanStores } from '../utils/dealNormalizer';

interface Props {
  activePath?: string;
}

const { activePath = '/' } = Astro.props;
const base = import.meta.env.BASE_URL.replace(/\\/$/, '');
const uniqueStores = getUniqueCleanStores(STORES_DATA);
const storesCount = uniqueStores.length;
---"""

new_frontmatter = """---
import { STORES_DATA } from '../data/couponsData';
import { getUniqueCleanStores } from '../utils/dealNormalizer';
import { LOCALES, DEFAULT_LOCALE, getTranslation } from '../i18n/ui';

interface Props {
  activePath?: string;
  locale?: string;
}

const { activePath = '/', locale = DEFAULT_LOCALE } = Astro.props;
const base = import.meta.env.BASE_URL.replace(/\\/$/, '');
const uniqueStores = getUniqueCleanStores(STORES_DATA);
const storesCount = uniqueStores.length;
const t = getTranslation(locale);
const currentLocaleConfig = LOCALES[locale] || LOCALES[DEFAULT_LOCALE];
---"""

text = text.replace(old_frontmatter, new_frontmatter, 1)

# 2. Add Language Selector Pill right before Theme Toggle
old_actions_end = """      <!-- 3-State Light / Auto / Dark Theme Pill Toggle (`#theme-control-wrapper`) -->"""

new_actions_end = """      <!-- Language Selector Pill -->
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

text = text.replace(old_actions_end, new_actions_end, 1)

# 3. Add script logic for Language dropdown
old_script_end = """    document.getElementById('headerSavedBtn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('promoradar_filter_saved'));
    });
  })();
</script>"""

new_script_end = """    document.getElementById('headerSavedBtn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('promoradar_filter_saved'));
    });
  })();

  // Language Selector Dropdown
  (function initHeaderLanguageDropdown() {
    const btn = document.getElementById('headerLangDropdownBtn');
    const menu = document.getElementById('headerLangMenu');
    const flagEl = document.getElementById('headerSelectedLangFlag');
    const textEl = document.getElementById('headerSelectedLangText');

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      menu?.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      menu?.classList.add('hidden');
    });

    menu?.querySelectorAll('.header-lang-item').forEach(item => {
      item.addEventListener('click', () => {
        const lang = item.getAttribute('data-lang-code') || 'en';
        menu.classList.add('hidden');
        
        try {
          localStorage.setItem('promoradar_lang', lang);
        } catch (e) {}

        // Broadcast language change
        window.dispatchEvent(new CustomEvent('promoradar_lang_changed', { detail: { lang } }));
      });
    });

    // Check stored language on load
    try {
      const stored = localStorage.getItem('promoradar_lang');
      if (stored && stored !== 'en') {
        const matchingBtn = menu?.querySelector(`[data-lang-code="${stored}"]`);
        if (matchingBtn) {
          const flag = matchingBtn.querySelector('span span:first-child')?.textContent || '🌐';
          if (flagEl) flagEl.textContent = flag;
          if (textEl) textEl.textContent = stored;
        }
      }
    } catch (e) {}
  })();
</script>"""

text = text.replace(old_script_end, new_script_end, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: Updated Header.astro with Language Selector and i18n support")

