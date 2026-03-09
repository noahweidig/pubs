import sanitize from 'sanitize-html';

export function sanitizeHtml(html) {
  if (!html) return "";
  return sanitize(html, {
    // Start with defaults (b, i, em, strong, a, p, div, etc.)
    allowedTags: sanitize.defaults.allowedTags.concat([ 'span', 'div' ]),
    allowedAttributes: {
      'a': [ 'href', 'name', 'target', 'rel', 'class' ],
      'div': [ 'class', 'style' ],
      'span': [ 'class', 'style' ],
      '*': [ 'title', 'aria-label' ]
    },
    allowedStyles: {
      '*': {
        // Allow specific properties used by CSL styles, preventing XSS via url() or expression()
        // SENTINEL: Use a strict allowlist regex to prevent CSS-based XSS via obfuscated url() payloads (e.g. \75rl(), url\(), url&Tab;())
        'line-height': [/^[a-zA-Z0-9\-\. %!]+$/],
        'padding-left': [/^[a-zA-Z0-9\-\. %!]+$/],
        'text-indent': [/^[a-zA-Z0-9\-\. %!]+$/],
        'font-style': [/^[a-zA-Z0-9\-\. %!]+$/],
        'font-weight': [/^[a-zA-Z0-9\-\. %!]+$/]
      }
    },
    allowedSchemes: [ 'http', 'https', 'mailto' ],
    allowProtocolRelative: false,
    transformTags: {
      'a': (tagName, attribs) => {
        // SENTINEL: Enforce noopener noreferrer on any non-self target to prevent reverse tabnabbing via custom window names
        if (attribs.target && !['_self', '_parent', '_top'].includes(attribs.target.toLowerCase())) {
          return {
            tagName: 'a',
            attribs: {
              ...attribs,
              rel: 'noopener noreferrer'
            }
          };
        }
        return {
          tagName: 'a',
          attribs: attribs
        };
      }
    }
  });
}
