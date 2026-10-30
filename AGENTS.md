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
- **Hand lettering** (Astra, 2026-10-19): **out of the page since 2026-10-28** while Astra rewrites the pieces; the
  files stay, and the figure plus its two script tags come back from git history. When shown, the hero slider shows Astra's Procreate lettering, one piece at a time, with
  a clear background. The pictures live in `art/lettering/`; the list, order and words live in `lettering-data.js`.
  Manage them with Portfolio Puffer's **Handwritten Message Manager** (`handwritten-message-manager-20261019.html` in
  findastra/portfolio-puffer), which clears the background and exports both. Each picture is an ink mask painted in the
  hero's `--ink`, so it stays black and gray like the rest of the page.

## Files
| File | What it is |
|---|---|
| `index.html`, `cyber.css`, `cyber.js` | The site (cyber design, picked by Astra 2026-10-17; restyled the same day at her request: black, white and grays everywhere, and the project windows are the only color, cut as fat stars; darker grays 2026-10-18). |
| `profile-data.js` | The plain version: about, languages, skills, positions. Only the hero terminal reads it now; the About section is left blank (Astra, 2026-10-27). Astra approves every change. |
| `site-data.js` | Repo snapshot, used when the GitHub API does not answer. |
| `pets-data.js` | Every pet, generated from `pet-programs.json` on astras-pet-os `main`, with `icon` = its newest drawing's path under the hub's `art/latest/` and `site` = its website. Only the snapshot: `cyber.js` reads `pet-programs.json`, `pets.json`, `art/latest/index.json` and the list of `apps/pet-programs/` pages live from the hub, so new pets, drawings and pages show without a change here. Regenerate; never hand-edit. |
| Pet pictures and icons | **Not here.** They live only in the hub and load from `https://raw.githubusercontent.com/findastra/astras-pet-os/main/art/latest/` (a star shows the pet's newest drawing: `desktop-art/<art>/idle.png`, then `moods/`, `frames/`, then the small `icons/<repo>.png`; `<art>` is the pet's `art` in hub `pets.json`, else its repo or name), the address that never changes (Astra, 2026-10-24). Never copy one in: the hub's checker lists every copy. |
| Pet websites | A star's **site ↗** opens the pet's own live site (`interface_live_url` in hub `pets.json`), else its pet program page on the hub's GitHub Pages (`findastra.github.io/astras-pet-os/apps/pet-programs/<repo>-YYYYMMDD.html`, newest date), else its public repo's homepage (Astra, 2026-10-27: "the stars need updated art and websites"). |
| `project-images.js`, `art/projects/` | Pictures and site screenshots from GitHub Goldfish's `project-image-generator` (Puffer uses it by grant). Regenerate with `node scripts/project-image-generator-20261017.mjs findastra --out <this repo>\art\projects --js <this repo>\project-images.js --screenshots` in github-goldfish. Private repos (most since 2026-10-20): add `--include-private --update <this repo>\project-images.js --only <repo>`, which copies their pictures into `art/projects/`; a private pet's card shows them with no repo link. |
| `art/worlds/` | Astra's own world renders. No other people in pictures without their OK. |
| `updates-data.js`, `scripts/build-updates-20261018.mjs` | The two tickers ("live updates:"; working on). Live from GitHub search (merged PRs and commits by findastra); the snapshot when GitHub does not answer. Regenerate the snapshot with `node scripts/build-updates-20261018.mjs`. |
| `feeds-20261029.js`, `feeds-data-20261029.js`, `scripts/build-feeds-20261029.mjs`, `art/feeds/` | Three feed Polaroids under Contact, side by side (pole TikTok, Instagram in the middle, VR TikTok), stacked on a phone; each one post at a time, going on by itself, with marker arrows and "1 of N" on its bottom border. TikToks show TikTok's whole player (likes, comments, shares, words, song); the saves (not in the player) sit above its heart, the mute sticker in the picture's bottom left corner. `node scripts/build-feeds-20261029.mjs` refreshes the TikTok list (newest 10, with plays, likes, comments, saves, shares from each video's page). Instagram posts and their captions are listed in the script by hand (signed out, Instagram shows only the newest 12 of her 93) and their photos saved into `art/feeds/` (Instagram blocks showing them from other sites; the posts are 1080 squares, uncropped). @findastra has TikTok audience controls on, so it cannot be embedded: its Polaroid links to the profile until she turns them off; then rerun the script. |
| Projects (in `index.html`, `cyber.js`) | Each its own section with its own pattern, black between them, and a floor on the left pole; the GitHub profile README's groups read top to bottom (Astra, 2026-10-27): **VR & VRChat** (`WORLDS`: her six worlds, in the README's words; DETOUR into VR left out as it is not a world), **Discord** (`DISCORD`) and **Web & More** (every other public repo) are Polaroids, with the name and kind written in marker (Permanent Marker) on the white border and a strip of neon tape; one with no picture yet shows "still developing…". **Astra's PetOS** comes last, as the star jar: only pets with a picture in the hub go in (`pets.filter(iconOf)`); shake it and one pet's full star window falls out, tip it out to see all. No Avatars chapter. |
| `games-20261027.js` | The arcade's newer games (Astra, 2026-10-27): the Fuzzboi Factory (six big code boxes like its own page; rules from `findastra.github.io/fuzzboi-factory/site/fuzzboi.js`, art from the hub's `desktop-art/fuzzboi-friend/layers/`), the Fuzzboi cyber home every made Fuzzboi moves into (up to 30, kept in the visitor's browser), and the sparkle catcher and Avatar Lab copied from `findastra/mommys-website`. |
| `lettering-data.js`, `lettering.js`, `art/lettering/` | Astra's hand lettering slider in the hero (swipe, arrows, dots, arrow keys). Export the data file and pictures from Puffer's Handwritten Message Manager; never hand-draw or AI-draw lettering. |
| `github-stats.json`, `github-stats-20261029.js`, `scripts/build-github-stats-20261029.mjs`, `.github/workflows/github-stats.yml` | The GitHub box at the bottom of Contact (Astra, 2026-10-29): total, public and private repos, contributions in the last year, the day streak, and the contribution chart from her GitHub profile, in the page's grays (no green). Portfolio Puffer's **GitHub Stats** tool. The workflow runs every 6 hours (and by hand from Actions) and commits `github-stats.json` to `main` only when it changed. The chart is read from `github.com/users/findastra/contributions`; it includes private work while "Private contributions" is on in her GitHub profile settings. Private repos are counted only if the repo secret `STATS_TOKEN` (a read-only fine-grained token: all her repos, Metadata read) is set; without it the last private count stays, with `privateAsOf`, and Puffer updates it by hand. Never hand-edit the chart days. |
| `drafts/`, `parchment.html` | Earlier design drafts, kept for comparison. |
| See-through copies (2026-10-29) | Three pictures here are edited copies of pictures that live in other repos, made so they sit see-through on the Polaroids. Everything else still loads live from its own repo, so updating a project there shows here with no change. These three do **not** follow their original: if the original changes, remake the copy. `art/worlds/rainbow-maker-still-clear-20261029.png` is the-rainbow-maker `Art/rainbow-maker/rainbow-maker-still-20261022.png` with its flat gray background cut away. `art/projects/galaxies/anthropic-galaxy.png` and `openai-galaxy.png` are `public/galaxy.png` from findastra-discord-presence's two apps, their black turned into see-through with the color kept (alpha = (brightest channel)^1.9 × 1.7, color divided back out, saturation × 1.2), at the full 1024 px; `cyber.js` (`GALAXY`, `ownGalaxy`) swaps them in for those exact two URLs only. |

## Rules
- Static, no build, no dependencies besides Google Fonts. Pages serves `main` as is (`.nojekyll`).
- Only the projects section and the hero portrait carry color (Astra, 2026-10-17 and 2026-10-18). The portrait's own colors
  twinkle on it, and the Polaroids and stars twinkle in theirs, with the same sparkle. The hero's code rain falls in rainbow colors (2026-10-27). Everything else, new
  sections included, stays black and gray; pet pictures outside the projects are shown in grayscale. The arcade games
  are the one exception inside a gray section: their art (Fuzzbois, sparkles, Avatar Lab looks) keeps its own colors in
  gray cabinets (2026-10-27).
- Every stylesheet and script link in `index.html` carries `?v=<date + letter>`. Change it whenever those files change,
  so a browser holding a cached old `cyber.js` does not run it against the new page (Pages caches for 10 minutes). The star
  shape is `#star` in `index.html`; the window layouts in `cyber.css` are placed inside them by
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
Fuzzboi Forge, cyber home, sparkle catcher and Avatar Lab by a Claude Opus 5.5 session, 2026-10-27. The same session put the pet jar
back with the hub's hosted icons, made the other chapters Polaroids, and turned the code rain rainbow, 2026-10-27.
The find:astra logo, the credit-only quote, the random first lettering, the smaller terminal, the rainbow portrait sparkles,
the blank About, the README's project groups and the unified footer by a Claude Opus 5.5 session, 2026-10-27.
The white rabbit on the live updates bar (Gone Ghost's sprite; catching it changes the rain's colors), the pole from Mommy's
website, the Moodglass picture (a Discord window over Liminal Doors' floors), the Fuzzboi Factory boxes, the Hack terminal window,
the pet memory moods board and the Avatar Lab fixes by a Claude Opus 5.5 session, 2026-10-27.
The straight working on bar (the same slim strip as live updates) with the header's checkered racing stripe moved under it, the
hero as two straight squares of the same size (terminal and portrait), the hand lettering taken out for Astra's rewrite (its
slider now 20% smaller and as tall as the piece showing, for when it comes back), the hero fitting a phone's width, one grid
row less above every section title and the footer, the photo viewer's arrows in its bottom corners, the header cut to "find /astra /" plus a
search that finds any words on the page (the old project search and the header links are gone; the pole is the menu), and
bigger pole labels by a Claude Opus 5.5 session, 2026-10-28.
The GitHub box in Contact (repo totals and the contribution chart, refreshed by a workflow) by a Claude Opus 5.5 session, 2026-10-29.
