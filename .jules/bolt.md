## 2024-05-16 - Prevent layout thrashing in search function
**Learning:** We realized that the `filterPubs()` search logic was causing unnecessary layout thrashing during every search input event. This happened because it was fetching the headings from the DOM (`document.querySelectorAll('.type-heading')`) and updating `style.display` unconditionally on all publications and headings, even if their display status didn't actually need to change.

**Action:** We can prevent layout thrashing and redundant DOM queries by caching DOM nodes whenever possible and explicitly checking existing styles against the target value before deciding to apply any updates.

## 2024-05-24 - Optimize event binding for dynamic elements
**Learning:** Attaching individual event listeners to dynamically injected client-side interactive elements (like copy buttons inside a loop) creates unnecessary memory overhead and initialization blocking.
**Action:** Use event delegation on a common container instead of attaching multiple individual listeners.

## 2024-06-12 - Batch dynamic client-side DOM insertions
**Learning:** We observed that multiple separate functions running independently to dynamically query, build, and insert related elements (e.g., creating different types of buttons separately on a list of entries and adding wrappers over multiple passes) results in redundant, costly DOM reads (`querySelectorAll`) and repeated layout thrashing on the exact same set of nodes.
**Action:** Consolidate related DOM mutation passes that operate on the same elements into a single iteration pass, batching queries and DOM updates together for a massive reduction in layout thrashing.
## 2024-05-18 - [DOM Traversal in Loop Optimization]
**Learning:** During frequent events like client-side search filtering, querying the DOM via `nextElementSibling` inside a loop can be a significant performance bottleneck and layout-thrashing risk, especially when it relies on DOM structure that is otherwise static.
**Action:** Replace dynamic DOM traversal with pre-computed JS object relationships (e.g. mapping headings to their corresponding entry items during an initial indexing phase) to ensure visibility toggles operate purely on JS cache lookups.

## 2024-06-25 - [Hash Map Optimization in Search Initialization]
**Learning:** Initializing the search filter cache (`buildPubIndex`) with a nested loop that calls `array.find()` to map DOM elements back to pre-created cache objects results in an O(n²) time complexity. As the number of DOM elements (publications) grows, this becomes a severe blocking bottleneck on the main thread during initialization.
**Action:** Replace `O(n)` array searches inside loops with `O(1)` Map lookups (`new Map()`), effectively reducing the initialization phase complexity from `O(n²)` to `O(n)`.

## 2025-02-17 - Pre-render DOM elements to eliminate client-side construction
**Learning:** Constructing complex and repetitive DOM elements (like copy buttons and wrappers) via client-side JavaScript (`document.createElement`) significantly bloats main-thread execution time and causes layout thrashing, even when batched.
**Action:** Shift the construction of these elements to the build phase (SSR-like behavior) by updating the generation script to output the complete HTML structures, completely eliminating the need for initialization scripts on the client.

## 2026-03-06 - Resize listeners vs MatchMedia
**Learning:** Binding UI adjustment functions directly to the `resize` event listener creates a huge performance drain due to near-continuous triggering on the main thread, especially when only specific breakpoints are relevant.
**Action:** Replace `window.addEventListener('resize', ...)` with `window.matchMedia('(min-width: ...)').addEventListener('change', ...)` to completely eliminate redundant checks, only executing code precisely when the target screen threshold is crossed.
## 2025-02-17 - Eliminate redundant client-side DOM node recreation in dynamic components
**Learning:** Reconstructing the DOM dynamically with `document.createElement`, `document.createTextNode`, and `.appendChild` over and over again for dynamic UI feedback (like a changing "No results" search query text and a static button) causes unnecessary main-thread overhead, repeated memory allocations for identical elements, and potential layout thrashing.
**Action:** Pre-render the HTML structure of the dynamic component and use JavaScript solely to update its display state and the text content of its specific changing parts (like an inner `<span>`), completely avoiding DOM node recreation.

## 2025-03-09 - Avoid redundant layout thrashing in debounced search function
**Learning:** We observed that evaluating `document.getElementById` and updating static properties on cached UI nodes (e.g. `style.display`, `textContent`) unconditionally inside the `filterPubs` function caused severe layout thrashing. Even if the values did not actually change (like updating `display='none'` on an element that is already hidden), the browser still flags it as dirty, resulting in rendering stalls during rapid, debounced search keystrokes.
**Action:** Move query selectors for static nodes outside the dynamic search function to cache them on load. Additionally, always explicitly check if a property (`style.display`, `.textContent`) differs from the target value before attempting to overwrite it.

## 2026-03-10 - Avoid redundant attribute writes in DOM iterations
**Learning:** Unconditionally modifying DOM element attributes inside loops (e.g., repeatedly calling `setAttribute('open', '')` on all `<details>` elements during an 'Expand All' or 'Collapse All' event) forces the browser to evaluate potential updates and can trigger unnecessary rendering overhead, even if the element already possesses the target attribute state.
**Action:** When iterating over a collection of DOM nodes to toggle properties or attributes, explicitly check the current state (like `hasAttribute('open')`) to prevent redundant DOM writes and potential layout thrashing.

## 2025-03-11 - Avoid innerText for text extraction
**Learning:** Using `innerText` to extract text from DOM elements (like publication citations) forces the browser to calculate the CSS layout to determine visibility, causing an expensive, synchronous reflow (layout thrashing).
**Action:** Use `textContent` instead of `innerText` whenever extracting text for logical operations (like copying to clipboard), as it simply reads the DOM tree without triggering layout calculations.
