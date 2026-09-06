# glassblog

A blog that lives in a single file. Fork it, connect Cloudflare, and you're
publishing markdown in minutes — no build step, no framework, no database.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/iuhx/glassblog)

**What you get:** a liquid-glass personal blog with an animated wordmark, a
bottom "dossier" sheet holding your articles, a copy-to-clipboard contact
section, an RSS feed, and self-hosted fonts — all served as static files from
[Cloudflare Workers](https://workers.cloudflare.com/), free tier included.

**[Live demo →](https://iuhx.github.io/glassblog/)** — this repo doubles as a
GitHub Pages site (Settings → Pages → deploy from branch `main`, `/` root), so
you can see the template running before you connect Cloudflare. Production
still ships to Workers; Pages is just the always-on preview.

---

## Table of contents

1. [Quickstart — fork to live in ~5 minutes](#quickstart)
2. [Make it yours — every setting explained](#make-it-yours)
3. [Write articles](#write-articles)
4. [Preview locally](#preview-locally)
5. [Deploy details & build settings](#deploy-details)
6. [Use a custom domain](#custom-domain)
7. [Project structure](#project-structure)
8. [Troubleshooting](#troubleshooting)

---

<a id="quickstart"></a>
## Quickstart — fork to live in ~5 minutes

### 1 · Fork this repository

Click **Fork** at the top of this page. You now have `you/glassblog`.

> The **Deploy to Cloudflare** button above deploys the *original* template
> as-is — handy for a quick look. To deploy **your own copy with your own
> posts**, fork first, then follow step 2.

### 2 · Connect it to Cloudflare

**Path A — the dashboard (recommended):**

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Workers & Pages → Create → Import a repository**.
3. Authorize GitHub if asked, then pick your fork (`you/glassblog`).
4. On the build settings screen:
   - **Build command:** `node publish.mjs --ci`
   - **Deploy command:** `npx wrangler deploy`
   - **Root directory:** *(empty)*
5. Click **Create and deploy**. ~30 seconds later your blog is live at
   `https://glassblog.<your-subdomain>.workers.dev`.

The build command matters: it assembles the deployment into `site/` from
whatever is in the repo — so content edited right here on GitHub (no local
tooling) still reaches your site.

**Path B — the terminal:**

```sh
git clone https://github.com/you/glassblog && cd glassblog
npx wrangler login        # opens your browser, one-time
node publish.mjs --ci --deploy   # build site/ + deploy
```

### 3 · Make it yours

Edit **`config.js`** (see the next section), commit, push — Cloudflare
redeploys automatically. That's the whole loop.

---

<a id="make-it-yours"></a>
## Make it yours — every setting explained

### `config.js` — the only file you *need* to touch

Everything visible on the page is driven from this one file. Empty string
(`''`) hides the thing; a filled value shows it.

| Field | What it controls | Example |
| --- | --- | --- |
| `name` | Wordmark, browser-tab title, footer, favicon letter, nav title | `'maya.dev'` |
| `tagline` | The one line under the big wordmark | `'Notes on code and coasters.'` |
| `email` | Adds a **Say hello** button and a **Correspondence** section with copy-to-clipboard. `''` hides both | `'hi@maya.dev'` |
| `siteUrl` | Where your blog lives — used for RSS article links | `'https://maya.dev'` |
| `now` | The **NOW** card on the front page (what you're up to). `''` hides the card | `'Freelancing.'` |
| `githubUser` | Your GitHub username — fills the **Projects** row with your public repos automatically (stale-while-revalidate cache). `''` skips the API | `'maya'` |
| `projects` | Manual project list, used when `githubUser` is empty or the API is unreachable. Both empty hides the row | `[{ name, desc, url }]` |

### Notices & About — markdown files, not config

- **Notices** live in `notices/` as `YYYY-MM-DD-slug.md` files — the date
  prefix shows beside the notice, the body is markdown (bold, links, code,
  lists). Publish one the same way as an article: drop the file in, run
  `node publish.mjs` (it rebuilds `notices/index.json`), push.
- **About** (numbered row iii.) is `about/index.md` — one markdown file that
  replaces the built-in default text.

A dot in `name` gets special treatment: `'maya.dev'` renders with `.dev`
dimmed, in the wordmark and in the **Site** card.

Rows renumber themselves — if you empty `notices`, Projects and About shift
up to i. and ii. automatically.

### Share preview (`og:` tags) — `index.html`, top of `<head>`

When someone links your blog in a chat, the card preview comes from these
meta tags. Search `index.html` for `your-domain` and replace every hit:

```html
<meta property="og:url" content="https://your-domain.com/">        → your URL
<meta property="og:image" content="https://your-domain.com/og-image.png">
<meta name="twitter:image" content="https://your-domain.com/og-image.png">
```

Also update `og:title` / `og:description` / `twitter:*` to taste.

### Share image — `og-image.png`

Replace with your own **1200 × 630** PNG (keep the filename). This is the
image shown in link previews.

### Colors & fonts — `index.html`

- Palette tokens live in the `:root { … }` block near the top of the
  `<style>` section (`--bg`, `--text`, `--glass-bg`, …).
- Fonts are self-hosted variable woff2 files in `fonts/` (`Sora` display,
  `Inter` UI, `Cinzel` accents). Swap the files and the `@font-face` lines
  to change typefaces — no external requests, so it's fast anywhere.

### 404 page — `404.html`

Static single file. Edit the text and the "home" link label freely.

### Footer attribution

The footer ends with *powered by glassblog*. Keeping it is appreciated but
not required — edit the `<p class="footnote">` block in `index.html`.

---

<a id="write-articles"></a>
## Write articles

1. Create `articles/YYYY-MM-DD-my-post.md` — the date prefix is what shows
   beside the title in the list.
2. Run:

```sh
node publish.mjs             # rebuild index files + feeds + site/ → commit → push
node publish.mjs --deploy    # …and deploy from your machine right away
node publish.mjs --dry       # build everything except git / deploy
```

3. Push (done automatically by `publish.mjs`) → Cloudflare redeploys → live.

**What `publish.mjs` actually does:** scans `articles/*.md` and
`notices/*.md` (newest first), rewrites `articles/index.json`,
`notices/index.json`, `rss.xml`, `robots.txt` and `sitemap.xml` (links built
from `siteUrl` in `config.js`), assembles the deployment into `site/` — only
what visitors need, repo files never ship — then commits and pushes.
Requires Node 18+ and git.

**Markdown support:** headings (# to ###), bold, italic, inline code, fenced
code blocks, blockquotes, ordered/unordered lists, links, images, and `---`
rules. The first `# Title` line is not repeated in the reader (the reader
already shows the title). Rendering is escape-first, so raw HTML in `.md`
files is shown as text — by design.

Every article gets a shareable `#/article/<file>` link that survives page
refresh and the browser back button.

---

<a id="preview-locally"></a>
## Preview locally

Articles are fetched over HTTP, so opening `index.html` from the filesystem
won't load them. Serve the folder with anything:

```sh
python -m http.server 8177       # → http://localhost:8177
# or
npx serve .
```

---

<a id="deploy-details"></a>
## Deploy details & build settings

- **No build step for the site itself.** `publish.mjs` assembles the
  deployment into `site/` — index.html, config.js, articles, notices, about,
  fonts and feeds. `.git`, README, publish.mjs and other repo-only files are
  never uploaded. `site/` is gitignored and rebuilt on every deploy, so the
  repo root stays the single source of truth (edit content on GitHub and CI
  picks it up).
- `wrangler.jsonc` explained:
  - `"assets.directory": "./site"` — the built folder is what gets served.
  - `"html_handling": "auto-trailing-slash"` — `/about` serves cleanly.
  - `"not_found_handling": "404-page"` — unknown URLs render `404.html`.
- `_headers` adds security headers and cache rules (fonts/og-image cached a
  week, RSS ten minutes).
- **Free tier:** static asset requests are free and unmetered on Workers;
  this blog comfortably runs at $0.
- **Automatic deploys:** with the dashboard import (Path A), every push to
  your fork's `main` branch runs the build command and redeploys.
  `node publish.mjs` pushes for you, so writing is just: drop a file, run
  one command.

---

<a id="custom-domain"></a>
## Use a custom domain

1. Cloudflare dashboard → **Workers & Pages → your worker → Settings →
   Domains & Routes → Add → Custom domain** (the domain must be a zone on
   your Cloudflare account).
2. Update **`siteUrl`** in `config.js`.
3. Update the `og:url` / `og:image` / `twitter:image` tags in `index.html`.
4. Run `node publish.mjs` so `rss.xml` links point at the new domain.

---

<a id="project-structure"></a>
## Project structure

```
index.html      the whole site — markup, styles, and logic in one file
config.js       your name, tagline, email, siteUrl, now, projects
articles/       markdown articles + index.json (the article list)
notices/        markdown notices + index.json (the Notices row)
about/index.md  the About panel body
fonts/          self-hosted Sora / Inter / Cinzel (variable woff2)
publish.mjs     one-command publishing (index files + feeds + site/)
rss.xml         the feed, regenerated on publish
robots.txt      crawler rules + sitemap pointer, regenerated on publish
sitemap.xml     regenerated on publish
_headers        security & caching headers
404.html        not-found page
wrangler.jsonc  Cloudflare Workers config — serves the built ./site folder
site/           deployment output, built by publish.mjs (gitignored)
og-image.png    1200×630 link-preview image
```

---

<a id="troubleshooting"></a>
## Troubleshooting

**Articles don't appear.**
Make sure `articles/index.json` lists them (or run `node publish.mjs`). If
you opened `index.html` via `file://`, that's why — serve over HTTP (see
[Preview locally](#preview-locally)).

**RSS links point to `your-domain.com`.**
You haven't set `siteUrl` in `config.js` yet. Set it, then run
`node publish.mjs` to regenerate the feed.

**Projects row shows the fallback list.**
The GitHub API is rate-limited per visitor; the manual `projects` array in
`config.js` is the fallback. Set `githubUser` to fetch live, or just curate
the array by hand.

**`git push` fails inside `publish.mjs`.**
The script commits and pushes via your local git — make sure the repo has a
remote (`git remote add origin …`) and push rights, or use
`node publish.mjs --dry` and push manually.

**Deploy fails with `site/` not found.**
The deployment folder is built by `publish.mjs`. Run
`node publish.mjs --ci --deploy` (local) or make sure the Workers Builds
build command is `node publish.mjs --ci`.

**Deploy fails with a compatibility-date error.**
Run `npx wrangler@latest deploy` — an old cached wrangler may predate the
config's `compatibility_date`.

---

## License

[MIT](LICENSE) — fork it, remix it, ship it.
