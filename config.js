// glassblog configuration — the only file you need to touch.
// Every visible word on the site lives here. Empty string ('') hides a thing.
window.GLASSBLOG = {
  // your site's name — shown in the wordmark, the tab, the footer, the favicon.
  // a dot dims the suffix: 'yours.blog' renders as yours.blog with .blog dimmed.
  name: 'glassblog',

  // one line under the wordmark
  tagline: 'A blog that lives in a single file.',

  // your email — set it and a "Say hello" button + a Correspondence section
  // (with copy-to-clipboard) appear. leave '' to hide both.
  email: 'hello@your-domain.com',

  // where this blog is served — used for rss.xml article links.
  // change it here AND in the og:url / og:image meta tags inside index.html.
  siteUrl: 'https://your-domain.com',

  // the "Now" card on the front page — what you're up to. '' hides the card.
  now: 'Writing.',

  // your projects, shown in the numbered Projects row.
  // set githubUser to pull your public GitHub repos automatically
  // (stale-while-revalidate cache, falls back to this list when offline),
  // or just list them by hand and leave githubUser: ''.
  // both empty hides the row.
  githubUser: '',
  projects: [
    { name: 'glassblog', desc: 'The engine under this blog — a single-file template for Cloudflare Workers.', url: 'https://github.com/iuhx/glassblog' },
  ],

  // ── not here on purpose ─────────────────────────────────────────
  // notices  → markdown files in notices/  (YYYY-MM-DD-slug.md)
  // about    → markdown file at about/index.md
  // Drop a file in, run `node publish.mjs`, push. Done.
};
