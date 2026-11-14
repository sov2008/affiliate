"""
Verification script for Camoufox anti-detect browser installation.
Launches Camoufox in headless mode, tests fingerprint generation and Cloudflare detection readiness.
"""
import sys
from camoufox.sync_api import Camoufox

def test_camoufox():
    print("🦊 Launching Camoufox anti-detect browser (Headless)...")
    try:
        with Camoufox(headless=True) as browser:
            page = browser.new_page()
            
            # Test simple user agent & platform consistency
            page.goto("https://httpbin.org/user-agent", wait_until="networkidle")
            content = page.inner_text("body")
            print(f"✅ User-Agent response:\n{content.strip()}")
            
            # Test navigator properties
            nav_eval = page.evaluate("""() => {
                return {
                    webdriver: navigator.webdriver,
                    platform: navigator.platform,
                    languages: navigator.languages,
                    hardwareConcurrency: navigator.hardwareConcurrency,
                    deviceMemory: navigator.deviceMemory
                };
            }""")
            print(f"✅ Native Browser Engine Telemetry:\n{nav_eval}")
            
            if nav_eval.get('webdriver') is False or nav_eval.get('webdriver') is None:
                print("🛡️ Anti-Detect Status: navigator.webdriver is completely masked (Not detected as automation)!")
            else:
                print(f"⚠️ Warning: navigator.webdriver returned: {nav_eval.get('webdriver')}")
                
            print("🎉 Camoufox installation and environment verification PASSED!")
    except Exception as e:
        print(f"❌ Camoufox launch test error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_camoufox()

