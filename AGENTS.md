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
| `index.html`, `cyber.css`, `cyber.js` | The site (cyber design, picked by Astra 2026-10-17). |
| `profile-data.js` | The plain version: about, languages, skills, positions. Astra approves every change. |
| `site-data.js` | Repo snapshot, used when the GitHub API does not answer. |
| `pets-data.js` | Every pet, generated from `pet-programs.json` on astras-pet-os `main`. Regenerate; never hand-edit. |
| `project-images.js`, `art/projects/` | Pictures and site screenshots from GitHub Goldfish's `project-image-generator` (Puffer uses it by grant). Regenerate with `node scripts/project-image-generator-20261017.mjs findastra --out <this repo>\art\projects --js <this repo>\project-images.js --screenshots` in github-goldfish. |
| Pet pictures and icons | **Not here.** They live in the hub, findastra/astras-pet-os `art/icons/` and `art/frames/` (one art source, Flash Audit A58), and the pages load them from `https://raw.githubusercontent.com/findastra/astras-pet-os/main/`. Never copy one in. |
| `art/worlds/` | Astra's own world renders. No other people in pictures without their OK. |
| `drafts/`, `parchment.html` | Earlier design drafts, kept for comparison. |

## Rules
- Static, no build, no dependencies besides Google Fonts. Pages serves `main` as is (`.nojekyll`).
- Fetched text goes into the page with `textContent`, never `innerHTML`.
- Every project on GitHub appears (Astra, 2026-10-17); repos with no pictures yet show their pet or a placeholder and are
  reported under Flash Audit A55.
- Work on a branch; merging to `main` publishes.

Built with Claude Code (Claude Opus 5.5, `claude-opus-5-5`), 2026-10-17. Rescued from Astra's PC to GitHub by another
Claude Opus 5.5 session the same day.

Pet icons and pictures moved to the hub (one art source, Flash Audit A58, Astra 2026-10-18): `art/icons/` and `art/pets/` are gone; `cyber.js`, `site-parchment.js` (through the hub's `art/frames/index.json`) and the favicons load them from findastra/astras-pet-os. By Claude Opus 5.5 (`claude-opus-5-5`), 2026-10-18.
