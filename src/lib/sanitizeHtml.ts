/**
 * NEED ELECTRO — Safe Server & Client HTML Sanitizer
 * Strips executable scripts, unsafe tags, event handlers, and javascript: URIs
 * while preserving valid semantic formatting (headings, paragraphs, lists, tables, bold, etc.)
 */

const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'strike', 'sub', 'sup',
  'span', 'div', 'blockquote', 'code', 'pre',
  'a'
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  '*': new Set(['class', 'title', 'id', 'dir', 'lang']),
  'a': new Set(['href', 'target', 'rel']),
  'th': new Set(['colspan', 'rowspan', 'scope', 'align']),
  'td': new Set(['colspan', 'rowspan', 'align']),
  'table': new Set(['cellpadding', 'cellspacing', 'border', 'summary']),
};

export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  // 1. Strip script, style, iframe, object, embed, and form blocks entirely (content included)
  let clean = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');

  // 2. Parse tags and strip disallowed tags and attributes
  clean = clean.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tagName, attrs) => {
    const tag = tagName.toLowerCase();
    const isClosing = match.startsWith('</');

    // If tag is not allowed, strip it entirely
    if (!ALLOWED_TAGS.has(tag)) {
      return '';
    }

    if (isClosing) {
      return `</${tag}>`;
    }

    // Process attributes for opening tags
    const allowedForTag = ALLOWED_ATTRS[tag] || new Set();
    const globalAllowed = ALLOWED_ATTRS['*'];

    const cleanAttrs: string[] = [];
    const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

      // Block all event handlers (onclick, onerror, onload, etc.)
      if (attrName.startsWith('on')) continue;

      // Block javascript: or vbscript: or data: in URLs
      if ((attrName === 'href' || attrName === 'src') && /^\s*(javascript|vbscript|data):/i.test(attrVal)) {
        continue;
      }

      // Check if attribute is allowed
      if (globalAllowed.has(attrName) || allowedForTag.has(attrName)) {
        cleanAttrs.push(`${attrName}="${attrVal.replace(/"/g, '&quot;')}"`);
      }
    }

    // Enforce noopener noreferrer on links
    if (tag === 'a') {
      if (!cleanAttrs.some(a => a.startsWith('rel='))) {
        cleanAttrs.push('rel="noopener noreferrer"');
      }
    }

    return `<${tag}${cleanAttrs.length ? ' ' + cleanAttrs.join(' ') : ''}>`;
  });

  return clean;
}
