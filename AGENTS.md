# Rules for assistants working on findastra.github.io

Astra's portfolio, served at <https://findastra.github.io>. **Portfolio Puffer** keeps it
([portfolio-puffer](https://github.com/findastra/portfolio-puffer)); the hub's rules apply
([astras-pet-os](https://github.com/findastra/astras-pet-os) AGENTS.md and skills).

## What is special here
- **This is the one place that connects Audra and Astra** (Astra, 2026-10-07 and 2026-10-17). Everywhere else stays
  Astra-only. Since 2026-10-18 Astra wants her full name in two places only: the hero quote ("Learn to program it, or
  it will program you." — Audra J. Volk) and the Contact section, which lists, word for word as she gave them, Audra J.
  Volk's chemical engineering email and phone and Astra's email and TikToks. Nothing else personal: no address or
  personal path, and no contact details anywhere else on the page. The hero does not advertise the two names
  (Astra removed "One person. Two names. Both real." and the tagline under it).
- **Employer pages publish only what Astra has read word for word.** Puffer drafts from LinkedIn and GitHub and proposes
  changes to `profile-data.js`; Astra approves each one. No client names or project specifics unless she writes them.
- **Hand lettering** (Astra, 2026-10-19): the hero slider shows Astra's Procreate lettering, one piece at a time, with
  a clear background. The pictures live in `art/lettering/`; the list, order and words live in `lettering-data.js`.
  Manage them with Portfolio Puffer's **Handwritten Message Manager** (`handwritten-message-manager-20261019.html` in
  findastra/portfolio-puffer), which clears the background and exports both. Each picture is an ink mask painted in the
  hero's `--ink`, so it stays black and gray like the rest of the page.

## Files
| File | What it is |
|---|---|
| `index.html`, `cyber.css`, `cyber.js` | The site (cyber design, picked by Astra 2026-10-17; restyled the same day at her request: black, white and grays everywhere, and the project windows are the only color, cut as fat stars; darker grays 2026-10-18). |
| `profile-data.js` | The plain version: about, languages, skills, positions. Astra approves every change. |
| `site-data.js` | Repo snapshot, used when the GitHub API does not answer. |
| `pets-data.js` | Every pet, generated from `pet-programs.json` on astras-pet-os `main`. Regenerate; never hand-edit. |
| Pet pictures and icons | **Not here.** They live only in the hub and load from `https://raw.githubusercontent.com/findastra/astras-pet-os/main/art/latest/` (icons `icons/<repo>.png`, pets `frames/<pet>/idle.png`), the address that never changes (Astra, 2026-10-24). Never copy one in: the hub's checker lists every copy. |
| `project-images.js`, `art/projects/` | Pictures and site screenshots from GitHub Goldfish's `project-image-generator` (Puffer uses it by grant). Regenerate with `node scripts/project-image-generator-20261017.mjs findastra --out <this repo>\art\projects --js <this repo>\project-images.js --screenshots` in github-goldfish. Private repos (most since 2026-10-20): add `--include-private --update <this repo>\project-images.js --only <repo>`, which copies their pictures into `art/projects/`; a private pet's card shows them with no repo link. |
| `art/worlds/` | Astra's own world renders. No other people in pictures without their OK. |
| `updates-data.js`, `scripts/build-updates-20261018.mjs` | The two tickers ("live updates:"; working on). Live from GitHub search (merged PRs and commits by findastra); the snapshot when GitHub does not answer. Regenerate the snapshot with `node scripts/build-updates-20261018.mjs`. |
| Projects (in `index.html`, `cyber.js`) | Four chapters read top to bottom like the GitHub profile README (Astra, 2026-10-27, replacing the star jars): **Worlds** (ringed planets; `WORLDS`, in the README's order and words), **Avatars** (arched mirrors; `AVATARS`, a starting list for Astra to check), **Astra's PetOS** (a small star for every pet in `pets-data.js`; pick one and its full star window opens above them) and **Everything else** (clouds, grouped like the README: Discord, Web & more). Every cloud, planet, mirror and star has sparkles in hues near its own color. |
| `games-20261027.js` | The arcade's newer games (Astra, 2026-10-27): the Fuzzboi Forge (rules from `findastra.github.io/fuzzboi-factory/site/fuzzboi.js`, art from the hub's `desktop-art/fuzzboi-friend/layers/`), the Fuzzboi cyber home every made Fuzzboi moves into (up to 30, kept in the visitor's browser), and the sparkle catcher and Avatar Lab copied from `findastra/mommys-website`. |
| `lettering-data.js`, `lettering.js`, `art/lettering/` | Astra's hand lettering slider in the hero (swipe, arrows, dots, arrow keys). Export the data file and pictures from Puffer's Handwritten Message Manager; never hand-draw or AI-draw lettering. |
| `drafts/`, `parchment.html` | Earlier design drafts, kept for comparison. |

## Rules
- Static, no build, no dependencies besides Google Fonts. Pages serves `main` as is (`.nojekyll`).
- Only the projects section and the hero portrait carry color (Astra, 2026-10-17 and 2026-10-18). The portrait's own colors
  twinkle on it, and the planets, mirrors and stars twinkle in theirs, with the same sparkle. Everything else, new
  sections included, stays black and gray; pet pictures outside the projects are shown in grayscale. The arcade games
  are the one exception inside a gray section: their art (Fuzzbois, sparkles, Avatar Lab looks) keeps its own colors in
  gray cabinets (2026-10-27).
- Every stylesheet and script link in `index.html` carries `?v=<date + letter>`. Change it whenever those files change,
  so a browser holding a cached old `cyber.js` does not run it against the new page (Pages caches for 10 minutes). The star
  and cloud shapes are `#star` and `#cloud` in `index.html`; the window layouts in `cyber.css` are placed inside them by
  percentages, so change both together.
- Fetched text goes into the page with `textContent`, never `innerHTML`.
- Every project on GitHub appears (Astra, 2026-10-17); repos with no pictures yet show their pet or a placeholder and are
  reported under Flash Audit A55. The exception is PetOS's own building blocks (`PETOS_REPOS` in `cyber.js`): the
  section is Astra's PetOS itself, so they get no card of their own (Astra, 2026-10-18); the ones that are pets still
  appear in the PetOS chapter.
- Work on a branch; merging to `main` publishes.

Built with Claude Code (Claude Opus 5.5, `claude-opus-5-5`), 2026-10-17; updates tickers, darker grays and the star jar 2026-10-18. Rescued from Astra's PC to GitHub by another
Claude Opus 5.5 session the same day. Grayscale and star-window restyle by a third Claude Opus 5.5 session, 2026-10-17. Astra's PetOS (clouds, worlds and
pets jars, ringed planets, sparkles) by a Claude Opus 5.5 session, 2026-10-18. Hand lettering slider by a Claude Opus 5.5 session, 2026-10-19.
Private pictures and the saved repo list by a Claude Opus 5.5 session, 2026-10-20, after Astra made most repos private.
Smaller hand lettering, the terminal as tall as the right column, the four project chapters in place of the jars, and the
Fuzzboi Forge, cyber home, sparkle catcher and Avatar Lab by a Claude Opus 5.5 session, 2026-10-27.
