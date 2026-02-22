from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000")

        # 1. Verify Title Attribute
        search_toggle = page.locator("#search-toggle")
        expect(search_toggle).to_have_attribute("title", "Search (Cmd+K)")
        print("✅ Title attribute verified")

        # 2. Verify Keyboard Shortcut (Cmd+K)
        # Simulate Meta+K (Cmd+K on Mac, Ctrl+K on Windows/Linux usually)
        # The script handles both Meta and Ctrl.
        # Let's try Meta+k first.
        page.keyboard.press("Meta+k")

        search_overlay = page.locator("#search-overlay")
        expect(search_overlay).to_be_visible()
        print("✅ Search overlay opened with Cmd+K")

        # Take screenshot of open search
        page.screenshot(path="verification/search_open.png")
        print("📸 Screenshot taken: verification/search_open.png")

        # 3. Verify Focus Return on Close
        # Close with Escape
        page.keyboard.press("Escape")
        expect(search_overlay).to_be_hidden()

        # Check focus
        expect(search_toggle).to_be_focused()
        print("✅ Focus returned to toggle button")

        # Take screenshot of closed state (should look normal)
        page.screenshot(path="verification/search_closed.png")

        browser.close()

if __name__ == "__main__":
    run()
