#!/usr/bin/env node
/**
 * glassblog publishing.
 *
 *   node publish.mjs            scan articles/ → index.json + rss.xml → commit → push
 *   node publish.mjs --deploy   … also run `npx wrangler deploy`
 *   node publish.mjs --dry      regenerate index.json + rss.xml only, no git / deploy
 *
 * The site URL is read from config.js (siteUrl).
 */
import { readdirSync, statSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

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
if (existsSync('notices')) {
  const noticeFiles = readdirSync('notices')
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

/* 3. Commit + push (+ deploy) */
if (process.argv.includes('--dry')) {
  console.log('dry run — no git, no deploy');
  process.exit(0);
}

const sh = (cmd) => execSync(cmd, { stdio: 'inherit' });
sh('git add -A');
try {
  execSync('git diff --cached --quiet');
  console.log('nothing new to commit');
} catch (_) {
  sh('git commit -m "publish: update articles"');
  sh('git push');
}
if (process.argv.includes('--deploy')) sh('npx wrangler deploy');
console.log('done ✓');
