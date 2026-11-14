# Spoonfed: no Yelp, food type with the facts, a row arrow, one screen, photo background, one map

Astra, 2026-11-13, after Spoonfed went live (`spoonfed-real-spots-20261113.md`):

- "get rid of yelp across the board"
- "will give you room to move the food type down where the rest of the parameters are"
- "need an arrow on the right of the long list when you have enough", then "the arrow on the bottom right should look exactly like the buttons on the bottom left, same space away. if you have to shrink the small windows on the list then do it so they are all centered and aligned on each side with the two big boxes"
- "this isnt fittin gon one screen. i should never see a scroll bar."
- "there are also black borders on the sparklles in the footer make sure those are all gone across the board too"
- "also the star shouldnt be a link. ever."
- "the map should have no buttons, and should start in real life view (not map view) and there should be two locations, you, and the restaruant. scrolling zooms, get rid of the link. i thought we already did this work."
- "looks like the entire background is brown, just need to make sure the pictures are the background"

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` at `main` 6bdbfd4 (spoonfed#13, merged 2026-11-13 with Astra's "just fix this, then publish"). Changes since the last build:

- **No Yelp.** Every spot shows Google's stars only.
- **The food type** sits on the facts line of every card, so a name has its whole line.
- **The row of past picks:**
  - A round arrow button, like the two tabs on its left, sits the same distance out on its right while the row runs on. Pressing it moves the row one screenful.
  - Its cards fill it exactly, lined up with the two big panels above.
- **One screen on a computer.** The zoom counts the row once it shows, and a short window draws the page smaller (down to 70%) instead of scrolling.
- **Footer:** the sparkles have no black outline, and the star is a picture, not a link.
- **Pictures as the background** ("looks like the entire background is brown, just need to make sure the pictures are the background"): a light neutral shade over the blurred food photo instead of the 80% chocolate one.
- **One map for every spot** ("the map should have no buttons, and should start in real life view (not map view) and there should be two locations, you, and the restaruant. scrolling zooms, get rid of the link"): made-up spots get Google's own map like real ones, satellite first with the spot and you; the old embedded map with its pins, buttons and links is gone.
- **Row buttons:** the two tabs and the arrow all wear the panels' cream ring; the dark fill marks the tab that's on ("need to see a yellow ring around all three buttons").

Also in this PR: the Pages workflow's comment now says the key works on `findastra.github.io/*`. Google refused `/spoonfed/*` only, because browsers send Google just the site, so the key's website rule was widened in Google Cloud on 2026-11-13 (Astra: "Yes, change it").

What is public: the built page, its script, fonts and the spoon picture. No key, email, PC path or location code is in the files (checked).

Validation: in `findastra/spoonfed`, `pnpm test` (47 tests) passes and the type check is clean. Checked in the browser pane on Astra's PC, with no scroll bar at any of these sizes:
- 1985x1015 (her Brave), with the row showing: zoom 1.17.
- 1920x1080 at 1.24, 1280x800 at 0.92 and 1366x650 at 0.75.
- A first visit, with no row: 1.3.
- 390x844 phone: no sideways scroll.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
