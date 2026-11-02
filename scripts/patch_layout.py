with open('/var/www/affiliate/blog/src/layouts/BlogPostLayout.astro', 'r', encoding='utf-8') as f:
    text = f.read()

import_target = "import MobileStickyCTA from '../components/MobileStickyCTA.astro';"
import_repl = "import MobileStickyCTA from '../components/MobileStickyCTA.astro';\nimport ExitIntentRecoveryModal from '../components/ExitIntentRecoveryModal.astro';"

body_target = "<MobileStickyCTA offerType={endorsementType} />\n  </body>"
body_repl = "<MobileStickyCTA offerType={endorsementType} />\n    <ExitIntentRecoveryModal />\n  </body>"

if import_target in text:
    text = text.replace(import_target, import_repl, 1)

if body_target in text:
    text = text.replace(body_target, body_repl, 1)

with open('/var/www/affiliate/blog/src/layouts/BlogPostLayout.astro', 'w', encoding='utf-8') as f:
    f.write(text)

print("SERVER_LAYOUT_UPDATED")
