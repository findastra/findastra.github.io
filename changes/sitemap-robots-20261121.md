# sitemap.xml and robots.txt (2026-11-21)

Astra, 2026-11-20: "I'm starting to publish projects that are not able to be searched up very easily, and I want you
to be able to just search them up by their title, especially just using their dashes." On 2026-11-21 she said YES to
this pull request, the first fix from Portfolio Puffer's seo-toolkit (astras-pet-os #404).

- `sitemap.xml`: the 11 project pages under findastra.github.io that answered on 2026-11-21 (this site, Astra's Photo
  Star, Astra's Window Star, The Cooling Tower, Liminal Doors, Ghost Protocol, Papermon, Fuzzbois, Pocket Message Board,
  Spoonfed, OpenAI Discord Presence). Project sites are on this same host, so one sitemap here covers them all.
- `robots.txt`: lets every search engine in and names the sitemap. Before this, both were 404.
- Added on 2026-11-21 ("do it all for me"): the OpenAI IPO guide and the weekly digest. Then, the same day: the Fuzzboi
  Forge listed at its real page (`fuzzboi-factory/site/`, which the repo root forwards to), and OpenAI Discord Presence taken
  out (it moved; its page forwards to github.com/findastra/ai-discord-presence). 12 pages.
- Left out: the Anthropic IPO guide (its page has Astra's actual investment numbers; finance data stays private until she says), Ghost in the Walls and the drafts (not linked from the
  portfolio), and astras-pet-os (no front page yet).
- Written by `node scripts/portfolio-puffer-seo-sweep-20261120.mjs --out <this repo>` in astras-pet-os; never hand-edited.
- Still Astra's step: submit `https://findastra.github.io/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

By Astra. Built with Claude Opus 5.5 (`claude-opus-5-5`).
