from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    context = browser.new_context(storage_state="/var/www/affiliate/artifacts_admitad/cj_auth_state.json")
    page = context.new_page()
    page.goto("https://members.cj.com/member/publisher/8102806/advertiserSearch.json?pageNumber=1&pageSize=10")
    print("URL:", page.url)
    text = page.evaluate("() => document.body.innerText")
    print("Text snippet:", text[:300])
    browser.close()
