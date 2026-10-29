// The date on each Polaroid (Astra, 2026-10-29: "the last published date of the GitHub repository", then "last update"):
// the last commit on a public repo's default branch that changed more than its words, skipping commits that only touched
// Markdown, docs/, handoffs/ or changes/ (the README passes that touch every repo at once). Writes real-dates-data-20261029.js,
// which the page reads; a repo missing from it falls back to GitHub's last push.
// Run from the repo root with the GitHub CLI signed in: node scripts/build-real-dates-20261029.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const gh = (path) => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', maxBuffer: 64 << 20 }));
const wordsOnly = (file) => /\.md$/i.test(file) || /^(docs|handoffs|changes)\//i.test(file) || /(^|\/)(LICENSE|\.gitignore)$/i.test(file);

const repos = gh('users/findastra/repos?per_page=100&type=owner').filter((r) => !r.fork && !r.private && !r.archived);
const dates = {};
for (const r of repos) {
  let found = null;
  for (let page = 1; page <= 3 && !found; page++) {
    const commits = gh(`repos/findastra/${r.name}/commits?sha=${r.default_branch}&per_page=30&page=${page}`);
    if (!commits.length) break;
    for (const c of commits) {
      if (c.parents && c.parents.length > 1) continue; // a merge brings in commits counted on their own
      const files = (gh(`repos/findastra/${r.name}/commits/${c.sha}`).files || []).map((f) => f.filename);
      if (files.some((f) => !wordsOnly(f))) { found = c.commit.committer.date; break; }
    }
  }
  dates[r.name] = found || r.created_at;
  console.log(r.name.padEnd(32), dates[r.name], found ? '' : '(only word changes: its creation date)');
}
const out = `// Built by scripts/build-real-dates-20261029.mjs on ${new Date().toISOString().slice(0, 10)}: each public repo's last change
// that was more than its words (README and docs passes skipped). Run it again to bring the dates up to date.
window.REAL_DATES = ${JSON.stringify(dates, null, 1)};
`;
writeFileSync('real-dates-data-20261029.js', out);
