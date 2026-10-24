// The file of a page in dist: /contact is dist/contact.html, served at /contact without a
// trailing slash (Cloudflare Pages serves a/index.html at /a/ only, with a redirect from /a).
export const pageFile = (pagePath) =>
  pagePath === '/' ? 'index.html' : `${pagePath.slice(1)}.html`;
