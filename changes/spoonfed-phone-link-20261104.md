# Spoonfed on a phone

Astra, 2026-11-04: "get me the live link so i can see if it works on my phone. i want others to see the same thing but on their phone."

Added `spoonfed/`: the web build of Spoonfed (Spoonfed Sugarcube's restaurant picker), copied from `dist/` of `findastra/spoonfed` at 095a58f (branch `claude/sugarcube-pet-well-20261103`, draft PR #9). It opens at https://findastra.github.io/spoonfed/. The app repo is private and GitHub Pages needs a public repo, so the built copy lives here. Nothing else on the site changes, and the portfolio does not link to it.

What is public: the built page, its script and fonts. No source, no keys, no personal details (checked: no email, no PC path). The restaurants are the app's 26 made-up sample spots; photos load from Unsplash and Spoonfed Sugarcube's moods from the hub's `art/latest`.

Validation: served from this folder's address on this PC, at phone size (375 × 812) and computer size: it loads, fonts and pictures draw, a roll works, the page scrolls to the pick's name, stars and buttons, and the console shows no errors. Not yet checked on a real phone.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
