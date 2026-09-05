# Welcome to glassblog

You are reading the first article of a brand-new blog — and a live
cheat-sheet for how articles work here.

## How to publish

1. Drop a `.md` file into the **articles** folder, next to `index.html`.
2. Run `node publish.mjs` — it rebuilds `articles/index.json` and
   `rss.xml`, commits, and pushes. Cloudflare deploys on the push.
3. Your article appears in the dossier sheet at the bottom of the page,
   and reads like this one.

Name a file with a `YYYY-MM-DD-` prefix and the date shows up beside the
title, like the one above.

## What renders

**Bold**, *italic*, `inline code`, and [links](https://example.com) all work.

> Blockquotes look like this — quiet, indented, unhurried.

- Lists are supported
- So are ordered ones

```js
// fenced code blocks too
const hello = 'glassblog';
```

---

## Make it yours

Open `config.js` — everything visible lives there:

- `name` becomes the wordmark, the tab title, even the favicon letter
- `tagline`, `now`, `about` fill the front page and the numbered rows
- `email` adds a "Say hello" button and a copy-to-clipboard section
- `notices` and `projects` (or `githubUser`) feed the other rows
- `siteUrl` points `rss.xml` at your domain

Every article gets a shareable `#/article/…` link that survives refresh
and the back button. Write plainly — the design stays out of the way.
