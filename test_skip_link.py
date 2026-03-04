from playwright.sync_api import sync_playwright
import os

def test_skip_link():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"file://{os.getcwd()}/index.html")

        # Press Tab to focus the skip link
        page.keyboard.press("Tab")

        # Ensure skip link is focused
        focused_text = page.evaluate("document.activeElement.textContent")
        print(f"Focused element text: {focused_text}")

        # Press Enter to activate skip link
        page.keyboard.press("Enter")

        # Press Tab again and see where focus goes
        page.keyboard.press("Tab")
        next_focused = page.evaluate("document.activeElement.outerHTML")
        print(f"Next focused element: {next_focused}")

        browser.close()

if __name__ == "__main__":
    test_skip_link()
