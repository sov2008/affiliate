import sys

path = '/var/www/affiliate/blog/src/content/posts/first-date-environmental-safety-audit-neutral-venues-exit-vectors.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """* **The Personal Belongings Protocol:** Keep your keys, phone, and bag on your person or within immediate reach at all times. Never leave a beverage unattended while visiting the restroom. If you step away and return, treat the drink as compromised and order a fresh one."""

replacement = """* **The Personal Belongings Protocol:** Keep your keys, phone, and bag on your person or within immediate reach at all times. Never leave a beverage unattended while visiting the restroom. If you step away and return, treat the drink as compromised and order a fresh one.
* **Low-Profile Urban Safety Carry:** If you commute or walk through unfamiliar evening downtown areas before or after a date, avoid conspicuous luggage. Consider discreet, weather-resistant gear like the [945 Industries Low-Profile EDC Sling](/go?offer=cj_945industries&sub1=fc_safety_audit) designed for streamlined personal carry and rapid unencumbered movement."""

if target not in content:
    print("ERROR: Target not found")
    sys.exit(1)

content = content.replace(target, replacement, 1)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Post patched with 945industries link")
