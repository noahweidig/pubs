# Palette's Journal

## 2025-05-18 - First Impressions
**Learning:** This project uses a static HTML generator script but relies on `index.html` as the template. Adding accessibility features like "Skip to Content" requires modifying the template directly, while ensuring the generated content (publications list) remains intact.
**Action:** Always verify where the dynamic content injection points are before modifying HTML structure.

## 2025-05-18 - Search Experience Polish
**Learning:** Static site search filters that don't hide empty section headings create a confusing "broken" look. Users expect sections to disappear if they contain no results.
**Action:** When implementing client-side filtering on grouped lists, always include logic to hide the group headers when all their children are hidden.

## 2025-05-18 - Accessible Status Messages
**Learning:** Adding a visible "No results" message is good, but screen reader users might miss it if it's just a div.
**Action:** Always add `role="status"` and `aria-live="polite"` to dynamic status messages like search results or form feedback.

## 2025-05-18 - Print Friendliness for Interactive Elements
**Learning:** Interactive elements like `<details>` (collapsible sections) are terrible for printing because content is often hidden by default. Users expect "what I see is what I print" or "print everything".
**Action:** Use `@media print` or `beforeprint` event to force-expand all collapsible sections and hide interactive controls (like toggle buttons) to ensure a clean, complete document.

## 2025-05-18 - Search Overlay Focus Management
**Learning:** For custom JavaScript overlays/modals in this static site (which lacks a framework router), explicitly returning focus to the trigger element on close is essential. Without it, focus resets to the body, disorienting keyboard users.
**Action:** Always pair `overlay.style.display = 'none'` with `triggerElement.focus()` in close handlers.
