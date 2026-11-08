const fs = require('fs');

let content = fs.readFileSync('deals-portal/src/pages/categories/[category].astro', 'utf8');

const target = `                            <img
                              src={\`https://www.google.com/s2/favicons?domain=\${deal.cleanDomain}&sz=128\`}
                              alt={\`\${deal.cleanBrand || deal.storeName} logo\`}
                              class="w-full h-full object-contain"
                              loading="lazy"
                              onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
                            />`;

const replacement = `                            <img
                              src={\`/logos/\${deal.canonicalSlug || deal.storeSlug}.png\`}
                              alt={\`\${deal.cleanBrand || deal.storeName} logo\`}
                              class="w-full h-full object-contain"
                              loading="lazy"
                              data-google-fallback={\`https://www.google.com/s2/favicons?domain=\${deal.cleanDomain}&sz=128\`}
                              onerror="if(this.getAttribute('data-google-fallback') && this.src !== this.getAttribute('data-google-fallback')){ this.src = this.getAttribute('data-google-fallback'); } else { this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex'; }"
                            />`;

const targetCRLF = target.replace(/\n/g, '\r\n');
const replacementCRLF = replacement.replace(/\n/g, '\r\n');

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('deals-portal/src/pages/categories/[category].astro', content, 'utf8');
  console.log('Successfully patched [category].astro logo hierarchy (LF)');
} else if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacementCRLF);
  fs.writeFileSync('deals-portal/src/pages/categories/[category].astro', content, 'utf8');
  console.log('Successfully patched [category].astro logo hierarchy (CRLF)');
} else {
  console.error('Target not found in [category].astro');
  process.exit(1);
}

