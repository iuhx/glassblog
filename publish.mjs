#!/usr/bin/env node
/**
 * glassblog publishing.
 *
 *   node publish.mjs            scan articles/ + notices/ → index files + feeds + sitemap + site/ → commit → push
 *   node publish.mjs --deploy   … also run `npx wrangler deploy`
 *   node publish.mjs --ci       CI mode: build everything, skip git (Workers Builds build command)
 *   node publish.mjs --no-git   build everything, skip git
 *   node publish.mjs --dry      build everything except git / deploy
 *
 * The site URL is read from config.js (siteUrl).
 */
import { readdirSync, statSync, writeFileSync, readFileSync, existsSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';

const SITE_DIR = 'site';                // deployment output — wrangler.jsonc serves this folder

const titleFrom = (f) => f
  .replace(/\.md$/i, '')
  .replace(/^\d{4}-\d{2}-\d{2}-/, '')
  .replace(/[-_]+/g, ' ')
  .trim();

const dateFrom = (f) => {
  const m = f.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
};

/* site URL from config.js */
const configSrc = readFileSync('config.js', 'utf8');
const urlMatch = configSrc.match(/siteUrl\s*:\s*['"`]([^'"`]+)['"`]/);
const SITE_URL = (urlMatch ? urlMatch[1] : '').replace(/\/$/, '');
if (!SITE_URL || SITE_URL.includes('your-domain')) {
  console.log('⚠ set your real siteUrl in config.js — rss.xml links will point to a placeholder until then');
}
const NAME = (configSrc.match(/name\s*:\s*['"`]([^'"`]+)['"`]/) || [])[1] || 'glassblog';

/* 1. Scan articles/, newest first */
const files = readdirSync('articles')
  .filter((f) => f.toLowerCase().endsWith('.md'))
  .map((f) => {
    const iso = dateFrom(f);
    const t = iso ? new Date(iso + 'T00:00:00') : statSync('articles/' + f).mtime;
    return { f, t };
  })
  .sort((a, b) => b.t - a.t)
  .map((x) => x.f);

writeFileSync('articles/index.json', JSON.stringify(files, null, 2) + '\n');
console.log(files.length ? 'index.json ← ' + files.join(', ') : 'index.json ← (no articles found)');

/* 1b. Scan notices/, newest first (date prefix wins, fallback: file mtime) */
let noticeFiles = [];
if (existsSync('notices')) {
  noticeFiles = readdirSync('notices')
    .filter((f) => f.toLowerCase().endsWith('.md'))
    .map((f) => {
      const iso = dateFrom(f);
      const t = iso ? new Date(iso + 'T00:00:00') : statSync('notices/' + f).mtime;
      return { f, t };
    })
    .sort((a, b) => b.t - a.t)
    .map((x) => x.f);

  writeFileSync('notices/index.json', JSON.stringify(noticeFiles, null, 2) + '\n');
  console.log(noticeFiles.length ? 'notices/index.json ← ' + noticeFiles.join(', ') : 'notices/index.json ← (no notices found)');
  const unprefixed = noticeFiles.filter((f) => !dateFrom(f));
  if (unprefixed.length) console.log('⚠ notices without a YYYY-MM-DD- prefix will show no date:', unprefixed.join(', '));
}

/* 2. rss.xml */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const items = files.map((f) => {
  const iso = dateFrom(f);
  const d = iso ? new Date(iso + 'T00:00:00') : statSync('articles/' + f).mtime;
  const link = SITE_URL + '/#/article/' + encodeURIComponent(f);
  return [
    '    <item>',
    '      <title>' + esc(titleFrom(f)) + '</title>',
    '      <link>' + link + '</link>',
    '      <guid>' + link + '</guid>',
    '      <pubDate>' + d.toUTCString() + '</pubDate>',
    '    </item>',
  ].join('\n');
}).join('\n');

writeFileSync('rss.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<rss version="2.0"><channel>\n' +
  '  <title>' + esc(NAME) + '</title>\n' +
  '  <link>' + SITE_URL + '</link>\n' +
  '  <description>Notes from ' + esc(NAME) + '</description>\n' +
  items + '\n' +
  '</channel></rss>\n');
console.log('rss.xml written');

/* 2b. robots.txt + sitemap.xml — generated so they always follow siteUrl */
writeFileSync('robots.txt',
  'User-agent: *\n' +
  'Allow: /\n' +
  '\n' +
  'Sitemap: ' + SITE_URL + '/sitemap.xml\n');
console.log('robots.txt written');

/* sitemap lastmod follows the freshest content change (newest article,
   newest notice, or about/index.md) */
const newest = [
  files.length ? (dateFrom(files[0]) || statSync('articles/' + files[0]).mtime.toISOString().slice(0, 10)) : null,
  noticeFiles.length ? (dateFrom(noticeFiles[0]) || statSync('notices/' + noticeFiles[0]).mtime.toISOString().slice(0, 10)) : null,
  existsSync('about/index.md') ? statSync('about/index.md').mtime.toISOString().slice(0, 10) : null,
].filter(Boolean).sort().pop() || new Date().toISOString().slice(0, 10);

writeFileSync('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  '  <url>\n' +
  '    <loc>' + SITE_URL + '/</loc>\n' +
  '    <lastmod>' + newest + '</lastmod>\n' +
  '  </url>\n' +
  '</urlset>\n');
console.log('sitemap.xml written (lastmod ' + newest + ')');

/* 2c. Build the deployment folder — only what the visitor needs.
   .git, README, publish.mjs and other repo files never get uploaded. */
rmSync(SITE_DIR, { recursive: true, force: true });
mkdirSync(SITE_DIR, { recursive: true });
for (const f of ['index.html', 'config.js', '404.html', '_headers', 'robots.txt', 'sitemap.xml', 'rss.xml', 'og-image.png']) {
  if (existsSync(f)) cpSync(f, SITE_DIR + '/' + f);
}
for (const dir of ['articles', 'notices', 'about', 'fonts']) {
  if (existsSync(dir)) cpSync(dir, SITE_DIR + '/' + dir, { recursive: true });
}
console.log('site/ synced → ready for deploy');

/* 3. Commit + push (+ deploy) — skipped in CI; Workers Builds deploys the site/ built here */
const IN_CI = !!process.env.CI || process.argv.includes('--ci');
if (process.argv.includes('--dry')) {
  console.log('dry run — no git, no deploy');
  process.exit(0);
}

const sh = (cmd) => execSync(cmd, { stdio: 'inherit' });
if (IN_CI || process.argv.includes('--no-git')) {
  console.log('CI/flag detected — skipping git (Cloudflare deploys the site/ built here)');
} else {
  sh('git add -A');
  try {
    execSync('git diff --cached --quiet');
    console.log('nothing new to commit');
  } catch (_) {
    sh('git commit -m "publish: update content"');
    sh('git push');
  }
}
if (process.argv.includes('--deploy')) sh('npx wrangler deploy');
console.log('done ✓');
