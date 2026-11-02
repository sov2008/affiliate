path = 'deals-portal/src/pages/index.astro'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace img src in index deal-grid-card
old_card_logo = """                    {brandDomain ? (
                      <div class="brand-logo-container brand-logo-box w-9 h-9 rounded-xl bg-white border border-slate-200/90 dark:border-slate-700/80 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${brandDomain}&sz=128`}
                          alt={`${cleanName} logo`}
                          class="w-full h-full object-contain"
                          loading="lazy"
                          onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
                        />
                        <span class={`hidden w-full h-full rounded-lg bg-gradient-to-br ${brandGradient} text-white font-extrabold text-[11px] items-center justify-center shadow-inner`}>
                          {initials}
                        </span>
                      </div>
                    ) : ("""

new_card_logo = """                    {brandDomain || deal.canonicalSlug || deal.storeSlug ? (
                      <div class="brand-logo-container brand-logo-box w-9 h-9 rounded-xl bg-white border border-slate-200/90 dark:border-slate-700/80 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                        <img
                          src={`/logos/${deal.canonicalSlug || deal.storeSlug}.png`}
                          data-fallback-google={brandDomain ? `https://www.google.com/s2/favicons?domain=${brandDomain}&sz=128` : ''}
                          alt={`${cleanName} logo`}
                          class="w-full h-full object-contain"
                          loading="lazy"
                          onerror="if(this.getAttribute('data-fallback-google') && this.src !== this.getAttribute('data-fallback-google')){ this.src = this.getAttribute('data-fallback-google'); } else { this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex'; }"
                        />
                        <span class={`hidden w-full h-full rounded-lg bg-gradient-to-br ${brandGradient} text-white font-extrabold text-[11px] items-center justify-center shadow-inner`}>
                          {initials}
                        </span>
                      </div>
                    ) : ("""

text = text.replace('\r\n', '\n')
old_card_logo = old_card_logo.replace('\r\n', '\n')
new_card_logo = new_card_logo.replace('\r\n', '\n')

if old_card_logo in text:
    text = text.replace(old_card_logo, new_card_logo)
    print("Replaced card logo successfully!")
else:
    print("old_card_logo not matched!")

with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(text)

