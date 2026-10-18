# Rules for assistants working on findastra.github.io

Astra's portfolio, served at <https://findastra.github.io>. **Portfolio Puffer** keeps it
([portfolio-puffer](https://github.com/findastra/portfolio-puffer)); the hub's rules apply
([astras-pet-os](https://github.com/findastra/astras-pet-os) AGENTS.md and skills).

## What is special here
- **This is the one place that connects Audra and Astra** (Astra, 2026-10-07 and 2026-10-17). Everywhere else stays
  Astra-only. Only the first name Audra appears; no surname, email, address or personal path.
- **Employer pages publish only what Astra has read word for word.** Puffer drafts from LinkedIn and GitHub and proposes
  changes to `profile-data.js`; Astra approves each one. No client names or project specifics unless she writes them.
- The "I'm Audra, a.k.a. Astra" heading is a placeholder: Astra hand-letters it in Procreate. Put the image in
  `art/lettering/` and swap it into `.slot` in `index.html`.

## Files
| File | What it is |
|---|---|
| `index.html`, `cyber.css`, `cyber.js` | The site (cyber design, picked by Astra 2026-10-17; restyled the same day at her request: black, white and grays everywhere, and the project windows are the only color, cut as fat stars; darker grays 2026-10-18). |
| `profile-data.js` | The plain version: about, languages, skills, positions. Astra approves every change. |
| `site-data.js` | Repo snapshot, used when the GitHub API does not answer. |
| `pets-data.js` | Every pet, generated from `pet-programs.json` on astras-pet-os `main`. Regenerate; never hand-edit. |
| `project-images.js`, `art/projects/` | Pictures and site screenshots from GitHub Goldfish's `project-image-generator` (Puffer uses it by grant). Regenerate with `node scripts/project-image-generator-20261017.mjs findastra --out <this repo>\art\projects --js <this repo>\project-images.js --screenshots` in github-goldfish. |
| `art/worlds/` | Astra's own world renders. No other people in pictures without their OK. |
| `updates-data.js`, `scripts/build-updates-20261018.mjs` | The two tickers (updates; working on). Live from GitHub search (merged PRs and commits by findastra); the snapshot when GitHub does not answer. Regenerate the snapshot with `node scripts/build-updates-20261018.mjs`. |
| Astra's PetOS (in `index.html`, `cyber.js`) | The projects section, renamed by Astra 2026-10-18. Other projects float as clouds above two jars filled to the top: worlds (small ringed planets) and pets (a small star for every pet in `pets-data.js`). Shake a jar (click, drag side to side, the button, or shake the phone) and one comes out full size; "tip out" lays out everything in that jar. Every cloud, planet and star has sparkles in hues near its own color. |
| `drafts/`, `parchment.html` | Earlier design drafts, kept for comparison. |

## Rules
- Static, no build, no dependencies besides Google Fonts. Pages serves `main` as is (`.nojekyll`).
- Only Astra's PetOS carries color: its clouds, ringed planets and stars (Astra, 2026-10-17 and 2026-10-18). Everything
  else, new sections included, stays black and gray; avatar and pet pictures outside it are shown in grayscale. The star
  and cloud shapes are `#star` and `#cloud` in `index.html`; the window layouts in `cyber.css` are placed inside them by
  percentages, so change both together.
- Fetched text goes into the page with `textContent`, never `innerHTML`.
- Every project on GitHub appears (Astra, 2026-10-17); repos with no pictures yet show their pet or a placeholder and are
  reported under Flash Audit A55. The exception is PetOS's own building blocks (`PETOS_REPOS` in `cyber.js`): the
  section is Astra's PetOS itself, so they get no card of their own (Astra, 2026-10-18); the ones that are pets still
  appear in the pets jar.
- Work on a branch; merging to `main` publishes.

Built with Claude Code (Claude Opus 5.5, `claude-opus-5-5`), 2026-10-17; updates tickers, darker grays and the star jar 2026-10-18. Rescued from Astra's PC to GitHub by another
Claude Opus 5.5 session the same day. Grayscale and star-window restyle by a third Claude Opus 5.5 session, 2026-10-17. Astra's PetOS (clouds, worlds and
pets jars, ringed planets, sparkles) by a Claude Opus 5.5 session, 2026-10-18.
