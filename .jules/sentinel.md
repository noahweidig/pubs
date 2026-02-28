## 2024-05-24 - [String.prototype.replace() DOM Overwrite Vulnerability]
**Vulnerability:** The HTML injection in `scripts/update-pubs.js` used a string replacement pattern `indexFile.replace(regex, string)` where the replacement string was built from unescaped user input (Zotero abstracts and citations).
**Learning:** `String.prototype.replace(regex, string)` interprets special tokens like `$&` and `` $` `` in the replacement string, which can cause portions of the source string to be unexpectedly duplicated or injected if user input contains those tokens.
**Prevention:** When injecting strings built from untrusted or complex input into another string via `replace()`, always use a replacer function instead of a replacement string. For example: `str.replace(regex, () => replacementString)`.

## 2024-05-24 - [XSS via Protocol Injection in Extracted Hrefs]
**Vulnerability:** The link extraction regex `/href="([^"]+)"/i` blindly matched any href value, including dangerous protocols like `javascript:`. While `sanitizeHtml` stripped dangerous tags, the extracted link was injected *un-sanitized* into an HTML anchor tag, resulting in a potential Cross-Site Scripting (XSS) via `href="javascript:..."`.
**Learning:** Even if HTML is sanitized, manually extracting attributes and injecting them into new DOM elements bypasses the sanitization logic.
**Prevention:** Explicitly restrict extracted protocols in regexes. Use `/href="(https?:\/\/[^"]+)"/i` to strictly allow only `http` and `https` protocols and prevent `javascript:` and `data:` URI injection XSS.
