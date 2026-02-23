## 2025-02-24 - [CRITICAL] Stored XSS in Build Artifacts
**Vulnerability:** The build script (`scripts/update-pubs.js`) injected data from an external API (Zotero) directly into `index.html` without sanitization. Specifically, the abstract field (`it.data.abstractNote`) was rendered as `<p>${e.abs}</p>`, allowing stored XSS if the external data contained malicious HTML.
**Learning:** Even build-time scripts generating static sites must sanitize external inputs, as they become permanent parts of the application. Trusting external APIs implicitly is dangerous.
**Prevention:** Always sanitize or escape user-controlled data before rendering it into HTML, regardless of whether it happens at runtime or build time. Implemented `escapeHtml` helper for this purpose.
