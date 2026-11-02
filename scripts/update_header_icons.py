path = r'd:\WEB\antigravity\affiliate\deals-portal\src\components\Header.astro'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace colored classes in nav icons with solid black/white
text = text.replace('text-indigo-500', 'text-slate-900 dark:text-white')
text = text.replace('text-amber-500', 'text-slate-900 dark:text-white')

# Replace emoji 🔥 in All Deals tab with solid filled local_fire_department icon
text = text.replace('<span class="text-rose-500">🔥</span>', '<span class="material-symbols-outlined text-[15px] text-slate-900 dark:text-white">local_fire_department</span>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('SUCCESS')

