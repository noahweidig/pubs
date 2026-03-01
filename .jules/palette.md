## 2025-03-01 - Dynamic ARIA Labels for Theme Toggle
**Learning:** For interactive toggle buttons (like theme switches), static `aria-label` and `title` attributes ("Toggle theme") do not provide enough context for screen reader or mouse users about the resulting action.
**Action:** Always implement JavaScript logic to dynamically update `aria-label` and `title` attributes on toggle buttons to explicitly state the *next* state or action (e.g., "Switch to light theme" or "Switch to dark theme") based on the current active state. Ensure the default HTML matches the default active state.
