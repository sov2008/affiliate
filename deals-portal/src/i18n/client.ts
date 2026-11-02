import { UI_TRANSLATIONS, LOCALES } from '../i18n/ui';

// Client-side instant dynamic translation controller
export function initClientI18n() {
  function applyLanguage(rawLang: string) {
    const lang = rawLang === 'uk' ? 'ua' : rawLang;
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['en'];
    const localeConfig = LOCALES[lang] || LOCALES['en'];

    // Update document dir and lang attribute
    document.documentElement.lang = lang;
    document.documentElement.dir = localeConfig.dir || 'ltr';

    // Update UI elements by data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n') as keyof typeof t;
      if (key && t[key]) {
        el.textContent = t[key];
      }
    });

    // Update Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder') as keyof typeof t;
      if (key && t[key]) {
        (el as HTMLInputElement).placeholder = t[key];
      }
    });

    // Update Flag in header
    const flagEl = document.getElementById('headerSelectedLangFlag');
    const textEl = document.getElementById('headerSelectedLangText');
    if (flagEl) flagEl.textContent = localeConfig.flag;
    if (textEl) textEl.textContent = localeConfig.code.toUpperCase();
  }

  // Listen to lang changes
  window.addEventListener('promoradar_lang_changed', (e: any) => {
    applyLanguage(e.detail?.lang || 'en');
  });

  // Restore on page load
  try {
    const saved = localStorage.getItem('promoradar_lang');
    if (saved && saved !== 'en') {
      applyLanguage(saved);
    }
  } catch (e) {}
}

