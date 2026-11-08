const fs = require('fs');

let content = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');

const target = `      <a
        href={\`\${base}/about/\`}
        class={\`header-stagger-item flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap \${
          activePath.startsWith('/about') 
            ? 'bg-indigo-500/15 border-indigo-500/35 text-indigo-400 font-extrabold shadow-sm shadow-indigo-500/20' 
            : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/15'
        }\`}
      >
        <HelpCircle class="w-4 h-4" />
        <span data-i18n="faq">FAQ</span>
      </a>`;

const replacement = `      <a
        href={\`\${base}/events/black-friday/\`}
        class={\`header-stagger-item flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap \${
          activePath.startsWith('/events/black-friday') 
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-black shadow-sm shadow-rose-500/20 animate-pulse' 
            : 'border-rose-500/30 text-rose-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-400 font-black'
        }\`}
      >
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span>Black Friday</span>
      </a>
      <a
        href={\`\${base}/about/\`}
        class={\`header-stagger-item flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap \${
          activePath.startsWith('/about') 
            ? 'bg-indigo-500/15 border-indigo-500/35 text-indigo-400 font-extrabold shadow-sm shadow-indigo-500/20' 
            : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/15'
        }\`}
      >
        <HelpCircle class="w-4 h-4" />
        <span data-i18n="faq">FAQ</span>
      </a>`;

const targetCRLF = target.replace(/\n/g, '\r\n');
const replacementCRLF = replacement.replace(/\n/g, '\r\n');

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('deals-portal/src/components/Header.astro', content, 'utf8');
  console.log('Successfully injected Black Friday badge into Header.astro (LF)');
} else if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacementCRLF);
  fs.writeFileSync('deals-portal/src/components/Header.astro', content, 'utf8');
  console.log('Successfully injected Black Friday badge into Header.astro (CRLF)');
} else {
  console.error('Target not found in Header.astro');
  process.exit(1);
}

