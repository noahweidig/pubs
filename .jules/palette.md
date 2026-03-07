## 2024-05-24 - Skip Link Target Needs tabindex="-1"
**Learning:** For 'Skip to content' links to function correctly for keyboard navigation, the target element (e.g., `<main id="main-content">`) must explicitly have `tabindex="-1"`. Without this, clicking the link scrolls the page visually, but keyboard focus remains at the top of the document, defeating the accessibility purpose.
**Action:** When adding or reviewing skip links, always ensure the target element has `tabindex="-1"` and a corresponding CSS rule `#{target_id}:focus { outline: none; }` to prevent unwanted focus rings upon programmatic activation.

## 2026-03-07 - Contextual ARIA labels for generic links
**Learning:** WCAG 2.4.4 requires links to have clear context. Lists of generic links like "Open Link" create an ambiguous, repetitive experience for screen reader users since they all sound identical when navigating by links list.
**Action:** Always inject contextual `aria-label`s into dynamically generated generic links, such as "Open link to: [Title]" using the data payload.
