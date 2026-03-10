## 2024-05-24 - Skip Link Target Needs tabindex="-1"
**Learning:** For 'Skip to content' links to function correctly for keyboard navigation, the target element (e.g., `<main id="main-content">`) must explicitly have `tabindex="-1"`. Without this, clicking the link scrolls the page visually, but keyboard focus remains at the top of the document, defeating the accessibility purpose.
**Action:** When adding or reviewing skip links, always ensure the target element has `tabindex="-1"` and a corresponding CSS rule `#{target_id}:focus { outline: none; }` to prevent unwanted focus rings upon programmatic activation.

## 2026-03-07 - Contextual ARIA labels for generic links
**Learning:** WCAG 2.4.4 requires links to have clear context. Lists of generic links like "Open Link" create an ambiguous, repetitive experience for screen reader users since they all sound identical when navigating by links list.
**Action:** Always inject contextual `aria-label`s into dynamically generated generic links, such as "Open link to: [Title]" using the data payload.

## 2025-03-08 - Announcing Zero Results in Live Regions
**Learning:** Clearing the text content of an `aria-live` region when a search returns 0 results leaves screen reader users in silence, making it ambiguous whether the search finished or is just broken.
**Action:** When a dynamic filter returns 0 matches, explicitly set the `aria-live` element's text content to "0 results found." (or similar) rather than an empty string, so users get definitive feedback.

## 2026-03-08 - Managing Focus for "Back to Top" Buttons
**Learning:** A "Back to Top" button that only scrolls the page visually breaks keyboard navigation, because the programmatic focus is left at the bottom of the document. Keyboard users tabbing after scrolling up will instantly jump back down to where they were.
**Action:** When implementing a "Back to Top" button, ensure that programmatic focus is reset to the top of the document (e.g., focusing the skip link with `preventScroll: true`) to preserve logical tab order and a seamless navigation experience.
