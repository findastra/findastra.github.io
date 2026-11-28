# Phone spacing fixes and the Spotify stars (2026-11-27)

Astra, 2026-11-23: "I definitely want to put the singing stars or the Spotify stars at the bottom. And there's a lot of issues
with like the mobile site ... I want you to look at everything and see if you can find anything first." Then: "all".

- **Card titles clear their stickers** (`cyber.css`, `.polaroid .note` top padding 11px to 30px). On a phone 14 titles ran
  under the GitHub and flip stickers that hang into the white strip.
- **Contact: the headshot above the words on a phone** (`cyber.css`, max-width 520px), as the headshot's own comment says.
  Before, "Chemical Process Engineer · Agentic Engineer" was squeezed beside it at one or two words a line.
- **The Spotify stars in the footer** (`index.html`, `cyber.css`, new `spotify-stars-20261127.js`): the same three as on the
  IPO guides: the Vape Luv album star (`anthropic-ipo/albumstar.svg`), the play star that plays it on the page through
  Spotify's embed, and the green star that opens it in Spotify. Left of By Astra on a computer; their own row above it on
  a phone. They keep their colors, like the photo star beside them.
- `index.html`: `?v=` for `cyber.css`.

Looked at and left as they are: the footer's GitHub icon on its own row on a phone (Astra's own rule, 2026-10-29: two
rows, the links on the second); the wider left margin on a phone (the menu pole plus the usual margin).

Checks: rendered at 390 px (iPhone 14) and 1280 px, no page errors; titles and stickers measured. Spotify's player could
not load in the test sandbox (open.spotify.com is blocked there), so playback is the guides' tested code, not tested here.

Claude Opus 5.5 (`claude-opus-5-5`), 2026-11-27.
