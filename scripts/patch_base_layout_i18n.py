path = r'd:\WEB\antigravity\affiliate\deals-portal\src\layouts\BaseLayout.astro'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Inject client-side i18n script import and execution in BaseLayout
old_theme_script = """    <!-- Theme Initialization Script (Instant, Zero-FOUC, Defaults to OS preference) -->"""

new_i18n_script = """    <!-- Theme & Instant Language Initialization Script -->
    <script is:inline>
      (function() {
        try {
          const storedLang = localStorage.getItem('promoradar_lang');
          if (storedLang) {
            document.documentElement.lang = storedLang;
            if (storedLang === 'ar') {
              document.documentElement.dir = 'rtl';
            }
          }
        } catch (e) {}
      })();
    </script>
    <!-- Theme Initialization Script (Instant, Zero-FOUC, Defaults to OS preference) -->"""

text = text.replace(old_theme_script, new_i18n_script, 1)

# Add client listener script at bottom of body
old_bottom = "  </body>"
new_bottom = """    <script>
      import { initClientI18n } from '../i18n/client';
      initClientI18n();
    </script>
  </body>"""

text = text.replace(old_bottom, new_bottom, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: Injected i18n runner into BaseLayout.astro")

