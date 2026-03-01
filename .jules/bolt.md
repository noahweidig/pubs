## 2024-05-16 - Prevent layout thrashing in search function
**Learning:** We realized that the `filterPubs()` search logic was causing unnecessary layout thrashing during every search input event. This happened because it was fetching the headings from the DOM (`document.querySelectorAll('.type-heading')`) and updating `style.display` unconditionally on all publications and headings, even if their display status didn't actually need to change.

**Action:** We can prevent layout thrashing and redundant DOM queries by caching DOM nodes whenever possible and explicitly checking existing styles against the target value before deciding to apply any updates.

## 2024-05-24 - Optimize event binding for dynamic elements
**Learning:** Attaching individual event listeners to dynamically injected client-side interactive elements (like copy buttons inside a loop) creates unnecessary memory overhead and initialization blocking.
**Action:** Use event delegation on a common container instead of attaching multiple individual listeners.
