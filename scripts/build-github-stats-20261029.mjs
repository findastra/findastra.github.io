// Builds github-stats.json for the GitHub box in the Contact section (Astra, 2026-10-29): repo totals and the
// contribution chart from Astra's GitHub profile. Run by .github/workflows/github-stats.yml every 6 hours, or by hand:
//   node scripts/build-github-stats-20261029.mjs
// The chart comes from github.com/users/findastra/contributions, the same calendar her profile page shows (it counts
// private work too while "Private contributions" is on in her profile settings). Public repos come from the REST API.
// Private repos need a read-only token in the repo secret STATS_TOKEN; without one the last private count Portfolio
// Puffer wrote is kept, with the date it was counted (privateAsOf).
import { readFile, writeFile } from 'node:fs/promises';

const USER = 'findastra', OUT = new URL('../github-stats.json', import.meta.url);
const api = async (path, token) => {
  const r = await fetch('https://api.github.com' + path, { headers: {
    accept: 'application/vnd.github+json', 'user-agent': 'findastra-portfolio', ...(token ? { authorization: 'Bearer ' + token } : {}) } });
  if (!r.ok) throw new Error(path + ' -> ' + r.status);
  return { body: await r.json(), link: r.headers.get('link') || '' };
};
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });

let prev = {};
try { prev = JSON.parse(await readFile(OUT, 'utf8')); } catch {}

// 1. the contribution calendar
const html = await (await fetch(`https://github.com/users/${USER}/contributions`, { headers: { 'user-agent': 'findastra-portfolio' } })).text();
const counts = {};
for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>\s*([^<]*?)\s*<\/tool-tip>/g)) {
  const n = /^(\d[\d,]*)\s+contribution/i.exec(m[2]);
  counts[m[1]] = n ? Number(n[1].replace(/,/g, '')) : 0;
}
const days = [];
for (const m of html.matchAll(/<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g)) {
  const tag = m[0], id = /\bid="([^"]+)"/.exec(tag)?.[1], level = Number(/\bdata-level="(\d)"/.exec(tag)?.[1] || 0);
  days.push({ date: m[1], count: id in counts ? counts[id] : null, level });
}
days.sort((a, b) => a.date.localeCompare(b.date));
if (days.length < 300) throw new Error('contribution calendar not found (' + days.length + ' days); GitHub may have changed the page');
const head = /(\d[\d,]*)\s+contributions?\s+in the last year/i.exec(html.replace(/\s+/g, ' '));
const year = head ? Number(head[1].replace(/,/g, '')) : days.reduce((s, d) => s + (d.count || 0), 0);
// the current streak: days in a row with work, ending today (or yesterday, so a fresh morning does not reset it)
let streak = 0, i = days.length - 1;
if (i >= 0 && !(days[i].count || days[i].level)) i--;
for (; i >= 0 && (days[i].count || days[i].level); i--) streak++;
let best = 0, run = 0;
for (const d of days) { run = d.count || d.level ? run + 1 : 0; best = Math.max(best, run); }

// 2. repo totals
let pub, priv = prev.repos?.private ?? null, privateAsOf = prev.repos?.privateAsOf ?? null;
if (process.env.STATS_TOKEN) {
  let names = [], page = 1, link;
  do {
    const r = await api(`/user/repos?affiliation=owner&per_page=100&page=${page++}`, process.env.STATS_TOKEN);
    names = names.concat(r.body.filter((x) => x.owner.login === USER).map((x) => x.private));
    link = r.link;
  } while (/rel="next"/.test(link));
  pub = names.filter((p) => !p).length; priv = names.filter(Boolean).length; privateAsOf = today;
} else {
  pub = (await api('/users/' + USER, process.env.GITHUB_TOKEN)).body.public_repos;
}

const data = {
  user: USER,
  repos: { total: priv == null ? pub : pub + priv, public: pub, private: priv, privateAsOf },
  contributions: { lastYear: year, streak, bestStreak: best, days },
};
const same = JSON.stringify({ ...prev, updated: undefined }) === JSON.stringify({ ...data, updated: undefined });
if (same) { console.log('github-stats.json: no change'); process.exit(0); }
await writeFile(OUT, JSON.stringify({ updated: today, ...data }, null, 1) + '\n');
console.log(`github-stats.json: ${data.repos.total} repos (${pub} public, ${priv ?? '?'} private), ${year} contributions in the last year, ${days.length} days`);
