import sys

with open('/var/www/affiliate/deals-portal/src/pages/index.astro', 'r', encoding='utf-8') as f:
    c = f.read()

target = '    <!-- Live Verified Products & Hardware Showcase from CJ Partner Feeds -->\n    <HomeProductShowcase />'

banner = '''    <!-- Early Black Friday & Cyber Week 2026 Countdown Event Hub -->
    <div class="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border-y border-rose-900/40 py-5 px-4 sm:px-8 text-white relative overflow-hidden">
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
            <span class="material-symbols-outlined text-[28px]">timer</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                Early Access Event
              </span>
              <span class="text-xs font-bold text-slate-300">Black Friday &amp; Cyber Season 2026</span>
            </div>
            <h3 class="text-lg sm:text-xl font-black text-white mt-0.5">
              Peak Partner Markdowns: Up to 85% OFF Across Tech, Security &amp; Hardware
            </h3>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a
            href="/categories/privacy-security/"
            class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition border border-white/10 flex items-center gap-1.5"
          >
            <span>VPN &amp; Security (81% Off)</span>
            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
          <a
            href="/stores/"
            class="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
          >
            <span>Explore All 80+ Stores</span>
            <span class="material-symbols-outlined text-[14px]">local_fire_department</span>
          </a>
        </div>
      </div>
    </div>

''' + target

if target in c:
    c = c.replace(target, banner)
    with open('/var/www/affiliate/deals-portal/src/pages/index.astro', 'w', encoding='utf-8') as f:
        f.write(c)
    print('SUCCESS')
else:
    print('TARGET NOT FOUND')

