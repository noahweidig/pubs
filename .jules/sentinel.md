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

## 2025-03-08 - [HIGH] XSS in Inline Styles via CSS Parsing Laxity
**Vulnerability:** The HTML sanitization configuration in `scripts/sanitize.js` allowed specific inline CSS properties (`line-height`, `padding-left`, etc.) and attempted to prevent XSS payloads by using a negative lookahead regex: `/^(?!.*(?:url|expression)\s*\().*$/i`. However, browsers are extremely lax when parsing CSS, allowing attackers to easily bypass this regex using techniques such as hex escapes (e.g., `\75\72\6c(javascript:alert(1))`), escaped parentheses (e.g., `url\(...`), or tab characters between "url" and "(". This allowed CSS-based XSS vectors.
**Learning:** Negative lookahead regexes designed to block specific blacklisted strings (like `url` or `expression`) in CSS are almost always insufficient due to the myriad of ways attackers can obfuscate the strings while still having them evaluated by the browser's CSS engine.
**Prevention:** Always use a strict allowlist regex (e.g., `/^[a-zA-Z0-9\-\. !]+$/`) that only permits explicitly allowed characters for the specific CSS property, entirely blocking structural characters like `(`, `)`, `\`, `"`, `'`, etc.

## 2025-03-09 - [HIGH] Reverse Tabnabbing Bypass via Custom Window Targets
**Vulnerability:** The HTML sanitization configuration in `scripts/sanitize.js` only enforced `rel="noopener noreferrer"` when the `target` attribute was exactly `_blank`. Attackers could inject custom target window names (e.g., `target="evil_window"`) to open links in a new window/tab without the protective `noopener noreferrer` attribute, bypassing the reverse tabnabbing defense entirely.
**Learning:** Checking for `target="_blank"` is insufficient because any target name that does not resolve to the current browsing context (`_self`, `_parent`, `_top`) will effectively act like `_blank` by opening a new browsing context, and thus will expose the `window.opener` object to the untrusted page.
**Prevention:** Always enforce `rel="noopener noreferrer"` for any anchor tag with a `target` attribute that is not explicitly resolving to the current window (i.e., ensure it is not `_self`, `_parent`, or `_top`).

## 2025-03-11 - [Defense in Depth] Strict CSP implementation
**Vulnerability:** The application was lacking a Content Security Policy (CSP), meaning if any client-side injection attacks were successful (e.g. bypassing the HTML sanitizer via CSS execution), attackers could exfiltrate data or load arbitrary malicious scripts and assets.
**Learning:** Static sites lacking backend infrastructure can easily benefit from a powerful layer of security via a strict `<meta http-equiv="Content-Security-Policy">` tag.
**Prevention:** Always implement a strict CSP that explicitly locks down `default-src 'none'`, restricts scripts to required origins or hashes/unsafe-inline (if unavoidable), blocks objects (`object-src 'none'`), locks base URIs (`base-uri 'none'`), and blocks out-of-band requests (`connect-src 'none'`) to significantly limit the impact of any potential client-side vulnerability.

## 2025-03-12 - [Information Leakage in API Errors]
**Vulnerability:** The application was vulnerable to information leakage in its CI/CD logs because it directly interpolated the raw `payload` from failed Zotero API responses into `Error` messages. If the API endpoint changed its behavior to return internal server details or if the application sent sensitive request data that was echoed back, this information would be exposed in the GitHub Actions build logs.
**Learning:** Raw response payloads from external APIs should never be directly thrown as errors or logged without sanitization, as they can expose sensitive information or internal stack traces.
**Prevention:** Always fail securely by truncating raw payloads in error messages or replacing them with generic error indicators (e.g., just the HTTP status code), ensuring that CI/CD logs do not become an unintended attack surface for information gathering.
