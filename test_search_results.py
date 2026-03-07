import os
import sys
from playwright.sync_api import sync_playwright

def test_search_no_results():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant clipboard permissions if needed
        context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
        page = context.new_page()

        # Load local index.html
        file_path = f"file://{os.path.abspath('index.html')}"
        page.goto(file_path)

        # Ensure search elements exist
        page.locator("#search-toggle").click()
        page.locator("#search-input").fill("nonexistentquery123")
        page.wait_for_timeout(500)  # Wait for debounce

        # Validate visibility of no-results container
        no_results = page.locator("#search-no-results")
        assert no_results.is_visible(), "No results container should be visible"

        # Validate that the typed query appears
        query_display = page.locator("#search-query-display")
        assert query_display.text_content() == "nonexistentquery123", f"Query display mismatch, got '{query_display.text_content()}'"

        # Click the clear button
        page.locator("#search-clear-no-results").click()
        page.wait_for_timeout(500)  # Wait for debounce

        # Validate search input is cleared
        search_val = page.locator("#search-input").input_value()
        assert search_val == "", "Search input should be cleared"

        # Validate all results are back
        assert not no_results.is_visible(), "No results container should be hidden after clearing"

        print("All assertions passed!")
        browser.close()

if __name__ == "__main__":
    test_search_no_results()
