// The date on each Polaroid (Astra, 2026-10-29: "go back to like the date it was created and then organize them in that
// order"): the day each public repo was made on GitHub. Writes repo-dates-data-20261029.js, which the page reads when the
// live GitHub list cannot be reached; the live list carries the same created_at.
// Run from the repo root with the GitHub CLI signed in: node scripts/build-repo-dates-20261029.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const repos = JSON.parse(execFileSync('gh', ['api', 'users/findastra/repos?per_page=100&type=owner'], { encoding: 'utf8', maxBuffer: 64 << 20 }))
  .filter((r) => !r.fork && !r.private && !r.archived);
const dates = Object.fromEntries(repos.map((r) => [r.name, r.created_at]).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync('repo-dates-data-20261029.js', `// Built by scripts/build-repo-dates-20261029.mjs on ${new Date().toISOString().slice(0, 10)}: the day each public repo
// was made on GitHub. Run it again after making a new repo.
window.REPO_CREATED = ${JSON.stringify(dates, null, 1)};
`);
console.log(Object.keys(dates).length + ' repos');
