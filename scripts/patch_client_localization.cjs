const fs = require('fs');
const path = require('path');

const clientFile = path.join(__dirname, '../deals-portal/src/i18n/client.ts');
let content = fs.readFileSync(clientFile, 'utf8');

// 1. Add import of REGIONAL_DEAL_TRANSLATIONS if missing
if (!content.includes('REGIONAL_DEAL_TRANSLATIONS')) {
  content = content.replace(
    "import { UI_TRANSLATIONS, LOCALES } from './ui';",
    "import { UI_TRANSLATIONS, LOCALES } from './ui';\r\nimport { REGIONAL_DEAL_TRANSLATIONS } from '../data/dealTranslations';"
  );
}

// 2. Add deal card translation logic inside applyLanguage()
const hookTarget = '    // Special handlers for complex composite buttons and inputs';

const localizationHook = `    // 6. Streaming Localized Deal Cards (conversion-copywriter-pro & localization-pro)
    document.querySelectorAll('[data-deal-id]').forEach(card => {
      const dealId = card.getAttribute('data-deal-id');
      if (!dealId) return;

      const titleEl = card.querySelector('h3 a') || card.querySelector('h3');
      const descEl = card.querySelector('p');
      const badgeEl = card.querySelector('.deal-badge, span[class*="text-rose"], span[class*="rounded-xl"]');

      if (lang === 'en') {
        if (titleEl && titleEl.hasAttribute('data-orig-title')) {
          titleEl.textContent = titleEl.getAttribute('data-orig-title') || '';
        }
        if (descEl && descEl.hasAttribute('data-orig-desc')) {
          descEl.textContent = descEl.getAttribute('data-orig-desc') || '';
        }
        if (badgeEl && badgeEl.hasAttribute('data-orig-badge')) {
          badgeEl.textContent = badgeEl.getAttribute('data-orig-badge') || '';
        }
        return;
      }

      const trans = REGIONAL_DEAL_TRANSLATIONS[dealId]?.[lang];
      if (trans) {
        if (titleEl) {
          if (!titleEl.hasAttribute('data-orig-title')) {
            titleEl.setAttribute('data-orig-title', titleEl.textContent?.trim() || '');
          }
          titleEl.textContent = trans.title;
        }

        if (descEl) {
          if (!descEl.hasAttribute('data-orig-desc')) {
            descEl.setAttribute('data-orig-desc', descEl.textContent?.trim() || '');
          }
          descEl.textContent = trans.description;
        }

        if (badgeEl && trans.badge) {
          if (!badgeEl.hasAttribute('data-orig-badge')) {
            badgeEl.setAttribute('data-orig-badge', badgeEl.textContent?.trim() || '');
          }
          badgeEl.textContent = trans.badge;
        }
      }
    });

    // Special handlers for complex composite buttons and inputs`;

if (!content.includes('// 6. Streaming Localized Deal Cards')) {
  content = content.replace(hookTarget, localizationHook);
  fs.writeFileSync(clientFile, content, 'utf8');
  console.log('Successfully injected deal localization engine into client.ts');
} else {
  console.log('Deal localization engine already present in client.ts');
}

