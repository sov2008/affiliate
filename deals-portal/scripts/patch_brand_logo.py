import re

path = 'deals-portal/src/components/BrandLogo.astro'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace clearbitUrl line
text = re.sub(
    r"// Tier 1: Clearbit Logo API\s*\n\s*const clearbitUrl = domain \? `https://logo\.clearbit\.com/\$\{domain\}` : '';",
    "// Tier 1: Local High-Performance Static Asset (/logos/[slug].png)\nconst localLogoUrl = store.slug ? `/logos/${store.slug}.png` : '';",
    text
)

# Replace img tag src and fallback
old_img_block = """  {domain ? (
    <img
      src={clearbitUrl}
      alt={`${store.name} logo`}
      class="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-200"
      loading="lazy"
      data-fallback-google={googleFaviconUrl}
      onerror={`
        if (this.src !== this.getAttribute('data-fallback-google')) {
          this.src = this.getAttribute('data-fallback-google');
        } else {
          this.style.display = 'none';
          if (this.nextElementSibling) this.nextElementSibling.style.display = 'flex';
        }
      `}
    />
  ) : null}"""

new_img_block = """  {localLogoUrl || domain ? (
    <img
      src={localLogoUrl || googleFaviconUrl}
      alt={`${store.name} logo`}
      class="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-200"
      loading="lazy"
      data-fallback-google={googleFaviconUrl}
      onerror={`
        if (this.getAttribute('data-fallback-google') && this.src !== this.getAttribute('data-fallback-google')) {
          this.src = this.getAttribute('data-fallback-google');
        } else {
          this.style.display = 'none';
          if (this.nextElementSibling) this.nextElementSibling.style.display = 'flex';
        }
      `}
    />
  ) : null}"""

# Normalize line endings for replacement
text = text.replace('\r\n', '\n')
old_img_block = old_img_block.replace('\r\n', '\n')
new_img_block = new_img_block.replace('\r\n', '\n')

if old_img_block in text:
    text = text.replace(old_img_block, new_img_block)
    print("Replaced img block successfully!")
else:
    print("old_img_block not matched directly, checking regex")

with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(text)

print("BrandLogo.astro written.")

