path = r'd:\WEB\antigravity\affiliate\deals-portal\src\components\Footer.astro'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace plain PR box in footer with canonical SVG logo
old_footer_brand = """        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-rose-600 text-white font-extrabold text-sm flex items-center justify-center">
            PR
          </div>
          <span class="text-white font-extrabold text-lg tracking-tight">PromoRadar</span>
        </div>"""

canonical_footer_brand = """        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 via-indigo-700 to-rose-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke-width="2" class="opacity-40"></circle>
              <circle cx="12" cy="12" r="5" stroke-width="2" class="opacity-75"></circle>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 12l6-6"></path>
              <circle cx="12" cy="2" fill="currentColor"></circle>
            </svg>
          </div>
          <span class="text-white font-extrabold text-lg tracking-tight">PromoRadar</span>
        </div>"""

if old_footer_brand in text:
    text = text.replace(old_footer_brand, canonical_footer_brand, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("SUCCESS: Footer updated with canonical production logo")

