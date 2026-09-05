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

  // the About panel (numbered row iii.). '' falls back to a stock line.
  about: 'This blog lives in a single HTML file. Markdown goes into the articles folder, publishing is one command, and the whole thing runs free on serverless.',

  // short dated notes, shown in the numbered Notices row — newest first.
  // [] hides the row.
  notices: [
    { date: 'Sep 2026', text: 'glassblog is live — fork it, make it yours, and write.' },
  ],

  // your projects, shown in the numbered Projects row.
  // set githubUser to pull your public GitHub repos automatically
  // (cached for 6h, falls back to this list when offline), or just
  // list them by hand and leave githubUser: ''.
  githubUser: '',
  projects: [
    { name: 'glassblog', desc: 'The engine under this blog — a single-file template for Cloudflare Workers.', url: 'https://github.com/iuhx/glassblog' },
  ],
};
