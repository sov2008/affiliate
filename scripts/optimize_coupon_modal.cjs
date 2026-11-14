const fs = require('fs');

const modalPath = 'deals-portal/src/components/CouponRevealModal.astro';
let content = fs.readFileSync(modalPath, 'utf8');

// 1. Remove import of STORE_DOMAINS_MAP from component frontmatter
content = content.replace("import { STORE_DOMAINS_MAP } from '../data/storeDomains';\n", "");

// 2. Change define:vars to not inline STORE_DOMAINS_MAP
content = content.replace(
  "<script is:inline define:vars={{ storeDealsMap, storeDomainsRegistry: STORE_DOMAINS_MAP }}>",
  "<script is:inline>"
);

// 3. In the script, replace usage of storeDomainsRegistry with local transparent logos and passed domain
const oldDomainResolve = `      // Resolve brand logo
      const storeSlug = data.storeSlug || '';
      let domain = data.domain || '';
      if (!domain && storeDomainsRegistry) {
        domain = storeDomainsRegistry[data.storeName] || storeDomainsRegistry[storeSlug] || '';
      }
      const logoImg = document.getElementById('modalLogoImg');
      const logoFallback = document.getElementById('modalLogoFallback');
      if (logoImg && logoFallback) {
        if (domain) {
          logoImg.src = \`https://logo.clearbit.com/\${domain}\`;
          logoImg.dataset.fallbackGoogle = \`https://www.google.com/s2/favicons?domain=\${domain}&sz=128\`;
          logoImg.style.display = 'block';
          logoFallback.classList.add('hidden');
          logoFallback.classList.remove('flex');
          logoImg.onerror = function() {
            if (this.dataset.fallbackGoogle && this.src !== this.dataset.fallbackGoogle) {
              this.src = this.dataset.fallbackGoogle;
            } else {
              this.style.display = 'none';
              logoFallback.classList.remove('hidden');
              logoFallback.classList.add('flex');
              logoFallback.textContent = (data.storeName || 'PR').slice(0, 2).toUpperCase();
            }
          };
        } else {
          logoImg.style.display = 'none';
          logoFallback.classList.remove('hidden');
          logoFallback.classList.add('flex');
          logoFallback.textContent = (data.storeName || 'PR').slice(0, 2).toUpperCase();
        }
      }`;

const newDomainResolve = `      // Resolve brand logo
      const storeSlug = data.storeSlug || '';
      const domain = data.domain || '';
      const logoImg = document.getElementById('modalLogoImg');
      const logoFallback = document.getElementById('modalLogoFallback');
      if (logoImg && logoFallback) {
        if (storeSlug) {
          logoImg.src = \`/logos/\${storeSlug}.png\`;
          logoImg.className = 'w-full h-full object-contain filter drop-shadow-xs brand-logo-dresscode';
          logoImg.style.display = 'block';
          logoFallback.classList.add('hidden');
          logoFallback.classList.remove('flex');
          logoImg.onerror = function() {
            if (domain && this.src !== \`https://www.google.com/s2/favicons?domain=\${domain}&sz=128\`) {
              this.src = \`https://www.google.com/s2/favicons?domain=\${domain}&sz=128\`;
            } else {
              this.style.display = 'none';
              logoFallback.classList.remove('hidden');
              logoFallback.classList.add('flex');
              logoFallback.textContent = (data.storeName || 'PR').slice(0, 2).toUpperCase();
            }
          };
        } else {
          logoImg.style.display = 'none';
          logoFallback.classList.remove('hidden');
          logoFallback.classList.add('flex');
          logoFallback.textContent = (data.storeName || 'PR').slice(0, 2).toUpperCase();
        }
      }`;

if (content.includes(oldDomainResolve)) {
  content = content.replace(oldDomainResolve, newDomainResolve);
  console.log('✅ Replaced domain resolution in CouponRevealModal with lightweight local logo logic');
} else {
  console.error('❌ Could not match oldDomainResolve in CouponRevealModal');
}

fs.writeFileSync(modalPath, content, 'utf8');
console.log('🎉 Successfully saved optimized CouponRevealModal.astro');

