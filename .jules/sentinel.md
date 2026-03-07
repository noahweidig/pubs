## 2025-02-27 - [XSS from Linkification post-HTML Sanitization]
**Vulnerability:** The application was vulnerable to Cross-Site Scripting (XSS) due to how URLs were automatically converted into links (linkification) *after* the HTML had been sanitized. An attacker could inject a URL into an HTML attribute, which would pass sanitization (if the attribute was allowed), but then the subsequent linkification step would convert the URL string within the attribute into a full HTML `<a>` tag, breaking the HTML structure and executing arbitrary script (e.g. `onload=alert(1)`).
**Learning:** Performing regex-based linkification on raw HTML text is inherently dangerous if done *after* sanitization because it ignores the HTML context (e.g., text vs attributes). Using `textFilter` in `sanitize-html` is also tricky because the library automatically escapes the injected HTML (to prevent XSS payloads hiding in text), breaking the link rendering completely.
**Prevention:** Linkification should always be performed *before* HTML sanitization. This allows the regex to blindly inject `<a>` tags, which are then parsed into the DOM AST and properly validated/sanitized by `sanitize-html`. This approach safely removes any malicious payloads embedded within the injected URLs without breaking link rendering.

## 2025-02-27 - [String Injection via String.prototype.replace]
**Vulnerability:** The `scripts/update-pubs.js` script was vulnerable to a string injection attack because it used `String.prototype.replace()` with a string containing user-controlled data as the replacement string. If the user-controlled data contained special replacement patterns like `$'` (inserts the string after the matched substring), `$&` (inserts the matched substring), or `$`` (inserts the string before the matched substring), it would corrupt the resulting HTML output and could potentially lead to further vulnerabilities.
**Learning:** When using `String.prototype.replace()`, replacement strings containing user-controlled data are dangerous because they are evaluated for special replacement patterns by the JavaScript engine.
**Prevention:** Always use a replacer function (e.g., `() => replacementString`) instead of a replacement string when incorporating user-provided data, as replacer functions return literal strings and do not evaluate special replacement patterns.

## 2025-02-27 - [Reverse Tabnabbing in Hardcoded Links]
**Vulnerability:** Hardcoded external links in `index.html` (e.g., for the "Blog" navigation links) were using `target="_blank"` without the `rel="noopener noreferrer"` attribute. This exposed the application to reverse tabnabbing, where the newly opened tab could manipulate the `window.opener` object of the original page to redirect it to a malicious site.
**Learning:** While the backend script (`scripts/sanitize.js`) was correctly adding `rel="noopener noreferrer"` to dynamically injected `target="_blank"` links from Zotero, the static HTML files were overlooked.
**Prevention:** Always ensure that any `<a target="_blank">` tag, whether dynamically generated or hardcoded in static HTML files, includes `rel="noopener noreferrer"` to protect against reverse tabnabbing.

## 2025-03-07 - XSS in Inline Styles
**Vulnerability:** Inline styles from Zotero could contain URLs that execute JavaScript.
**Learning:** `sanitize-html` does not block `url()` from inline CSS values unless explicitly filtered.
**Prevention:** Filter out `url()` and expressions from allowed style attributes or use strict regex.
