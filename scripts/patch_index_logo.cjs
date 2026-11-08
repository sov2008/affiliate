const fs = require('fs');

let content = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

// Target the img tag in the card
const target = `                        <img
                          src={\`https://www.google.com/s2/favicons?domain=\${brandDomain}&sz=128\`}
                          alt={\`\${cleanName} logo\`}
                          class="w-full h-full object-contain filter drop-shadow-xs"
                          loading="lazy"
                          data-duck-fallback={\`https://icons.duckduckgo.com/ip3/\${brandDomain}.ico\`}
                          onerror="if(this.getAttribute('data-duck-fallback') && this.src !== this.getAttribute('data-duck-fallback')){ this.src = this.getAttribute('data-duck-fallback'); } else { this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex'; }"
                        />`;

const replacement = `                        <img
                          src={\`/logos/\${deal.canonicalSlug || deal.storeSlug}.png\`}
                          alt={\`\${cleanName} logo\`}
                          class="w-full h-full object-contain filter drop-shadow-xs"
                          loading="lazy"
                          data-google-fallback={\`https://www.google.com/s2/favicons?domain=\${brandDomain}&sz=128\`}
                          data-duck-fallback={\`https://icons.duckduckgo.com/ip3/\${brandDomain}.ico\`}
                          onerror="if(this.getAttribute('data-google-fallback') && this.src !== this.getAttribute('data-google-fallback')){ this.src = this.getAttribute('data-google-fallback'); } else if(this.getAttribute('data-duck-fallback') && this.src !== this.getAttribute('data-duck-fallback')){ this.src = this.getAttribute('data-duck-fallback'); } else { this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex'; }"
                        />`;

const targetCRLF = target.replace(/\n/g, '\r\n');
const replacementCRLF = replacement.replace(/\n/g, '\r\n');

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('deals-portal/src/pages/index.astro', content, 'utf8');
  console.log('Successfully patched index.astro logo hierarchy (LF)');
} else if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacementCRLF);
  fs.writeFileSync('deals-portal/src/pages/index.astro', content, 'utf8');
  console.log('Successfully patched index.astro logo hierarchy (CRLF)');
} else {
  console.error('Target not found in index.astro');
  process.exit(1);
}

