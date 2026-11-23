# Portfolio audit: missing pictures and Discord group (2026-11-23)

Astra, 2026-11-23: "Can you please do a full portfolio audit and figure out what's missing and add all the projects
that are missing in their appropriate categories? You'll have to get pictures probably too."

## What the audit found

All 119 repos on the account were checked against what the page shows (rendered in a browser, with the live GitHub
list). Every public project already had a card, and the star jar holds every named pet. The gaps were:

1. **Seven cards had no pictures** ("still developing…"): papermon, rave-crawl, ai-ipo-countdown,
   anthropic-ipo-countdown, openai-ipo-countdown, abliteration-in-3d and heretic-on-strix-halo. `project-images.js`
   had not been regenerated since 2026-10-20, and these repos are newer.
2. **The three IPO countdowns sat in Web & More.** They are Discord profile cards, and the GitHub profile README lists
   them under Discord.

## What changed

- `project-images.js`: GitHub Goldfish's `project-image-generator` run with `--update` for those seven repos only, so
  every other entry stays as it was. Each repo's pictures were picked by the generator's own `pickImages` from a fresh
  clone, because this session could not reach `api.github.com` for single repos, and passed in with `--repos`.
  Site screenshots: `art/projects/abliteration-in-3d-site-20261123.png`, `art/projects/rave-crawl-site-20261123.png`.
  The manifest is `art/projects/project-images-20261123.json`.
- **Pictures that were left out on purpose:** the Anthropic IPO guide's preview (it says "Astra's actual investment
  numbers", and that guide stays off the portfolio), the Claude logo and avatar line sketch in both countdown repos'
  `guide/` folders, two button crops, and the galaxy stills the presence cards already show.
- `cyber.js`: `ai-ipo-countdown`, `anthropic-ipo-countdown` and `openai-ipo-countdown` are in `DISCORD`, typed
  "Discord app".
- `index.html`: `?v=` bumped for `project-images.js` and `cyber.js`.

## Still open

- **heretic-on-strix-halo** has no picture anywhere (only text, configs and logs) and no website, so its card still
  says "still developing…" (Flash Audit A55: missing). It needs a picture committed to the repo, for example a chart of
  its results once the Ubuntu runs are done. Rave crawl passes on its site screenshot only.
- Two private repos are not pets and have no card: `the-cung-list` and `poppys-closet`. They were not added: they are
  private, and Astra has not said they belong on the page.
- The GitHub profile README (findastra/findastra) does not list papermon, spoonfed, abliteration-in-3d,
  heretic-on-strix-halo or rave-crawl yet. It is a separate repo and is not changed here.
- `THREE is not defined` shows in the browser console on `main` too; it is not from this change.

Checks: `node --check cyber.js`; the page rendered at 1280 px with the live GitHub list, both sections looked at.

Claude Opus 5.5 (`claude-opus-5-5`), 2026-11-23.
