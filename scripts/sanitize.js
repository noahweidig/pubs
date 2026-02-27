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
        // Allow specific properties used by CSL styles
        'line-height': [/.*/],
        'padding-left': [/.*/],
        'text-indent': [/.*/],
        'font-style': [/.*/],
        'font-weight': [/.*/]
      }
    },
    allowedSchemes: [ 'http', 'https', 'mailto' ],
    allowProtocolRelative: false,
    transformTags: {
      'a': (tagName, attribs) => {
        if (attribs.target === '_blank') {
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
