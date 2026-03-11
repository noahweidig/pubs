from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 1000})
    page.goto("file:///app/index.html")

    # Take a full page screenshot
    page.screenshot(path="full.png", full_page=True)

    browser.close()
