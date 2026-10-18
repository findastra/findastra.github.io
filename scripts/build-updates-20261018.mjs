#!/usr/bin/env node
// Writes updates-data.js: a snapshot of recent public work (merged pull requests and commits by findastra),
// shown by the updates ticker when the live GitHub API does not answer. Node built-ins only.
// Claude Opus 5.5 (claude-opus-5-5), 2026-10-18. Run from the repo root: node scripts/build-updates-20261018.mjs
// GITHUB_TOKEN is optional (it only raises the rate limit; only public results are read either way).
import fs from 'node:fs/promises';

const owner = process.argv[2] || 'findastra';
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'findastra-updates' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const get = async (url) => { const r = await fetch(url, { headers }); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); };

const prs = (await get(`https://api.github.com/search/issues?q=author:${owner}+is:pr+is:merged+is:public&sort=updated&order=desc&per_page=50`)).items
  .map((i) => ({ repo: i.repository_url.split('/').pop(), title: i.title, at: i.closed_at }));
const commits = (await get(`https://api.github.com/search/commits?q=author:${owner}+is:public&sort=author-date&order=desc&per_page=50`)).items
  .map((i) => ({ repo: i.repository.name, message: i.commit.message.split('\n')[0], at: i.commit.author.date }));

const data = { generated: new Date().toISOString(), prs, commits };
await fs.writeFile('updates-data.js', `// Snapshot of recent public work, ${data.generated}. Regenerate with scripts/build-updates-20261018.mjs; do not edit by hand.\nwindow.UPDATES_SNAPSHOT = ${JSON.stringify(data, null, 1)};\n`);
console.log(`updates-data.js: ${prs.length} merged pull requests, ${commits.length} commits`);
