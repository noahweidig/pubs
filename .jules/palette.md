## 2025-03-01 - Dynamic ARIA Labels for Theme Toggle
**Learning:** For interactive toggle buttons (like theme switches), static `aria-label` and `title` attributes ("Toggle theme") do not provide enough context for screen reader or mouse users about the resulting action.
**Action:** Always implement JavaScript logic to dynamically update `aria-label` and `title` attributes on toggle buttons to explicitly state the *next* state or action (e.g., "Switch to light theme" or "Switch to dark theme") based on the current active state. Ensure the default HTML matches the default active state.

## 2025-03-03 - Dynamic ARIA Labels for Search Toggle and Announcements
**Learning:** Interactive toggles that open overlays (like search) often miss `aria-expanded` and `aria-controls` state synchronization, causing screen readers to silently ignore when overlays appear/disappear. Furthermore, real-time client-side search updates are invisible to screen readers without an `aria-live` announcement region, making the dynamic functionality inaccessible.
**Action:** Always synchronize `aria-expanded` state on toggle buttons connected to overlays, and introduce a visually hidden `aria-live="polite"` element that announces result counts for dynamic in-page search filtering.

## 2025-03-04 - Dynamic ARIA Labels for Menu Toggle and Copy Buttons
**Learning:** For interactive toggle buttons (like the mobile menu), a static `aria-label` ("Toggle menu") does not provide enough context for screen reader users about what the button will do. Additionally, if a button dynamically changes its text (like "Copy" to "Copied!"), a static `aria-label` will override the visible text, preventing screen readers from announcing the state change.
**Action:** Always implement JavaScript logic to dynamically update `aria-label` and `title` attributes on toggle buttons (e.g., "Open menu" or "Close menu") based on the current state. For buttons with dynamic text changes, remove the static `aria-label` so the accessible name derives from the visible text, and add `aria-live="polite"` to ensure the change is announced. Finally, add `aria-hidden="true"` to decorative SVGs inside buttons.
