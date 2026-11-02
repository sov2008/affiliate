with open('/var/www/affiliate/blog/src/pages/index.astro', 'r', encoding='utf-8') as f:
    content = f.read()

target = '    <p class="text-slate-700 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans mb-6">\n      Independent forensic investigations into commercial matchmaking algorithms, synthetic persona swarms, and digital romance fraud. Empirical reports, heuristic audits, and verified safety telemetry.\n    </p>'

launcher = '''

    <!-- Interactive Diagnostic Quick Launcher (Bounce Reduction) -->
    <div class="flex flex-wrap items-center justify-center gap-3 mb-6 not-prose">
      <a href="/quiz/" class="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-xs">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Take Dating Charisma & Safety Quiz</span>
      </a>
      <a href="/deeptrace/" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-xs">
        <span class="text-rose-700">🔍</span>
        <span>Launch DeepTrace Scanner</span>
      </a>
    </div>'''

if target in content:
    content = content.replace(target, target + launcher, 1)
    with open('/var/www/affiliate/blog/src/pages/index.astro', 'w', encoding='utf-8') as f:
        f.write(content)
    print("PATCH_SUCCESS")
else:
    print("TARGET_NOT_MATCHED")
