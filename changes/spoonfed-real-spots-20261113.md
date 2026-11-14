# Spoonfed: real restaurants near you, bigger, side by side

Astra, 2026-11-12 and 2026-11-13:

- "Yes, build it" (real restaurants, once Spoonfed's Google key existed)
- "it needs to be like 25% bigger, maybe even 33% bigger", then "Use full 30%"
- "I just want to see one. I want to see where I am and then I want to see where the restaurant is"
- her iPhone scan of Send to phone "just gave me a port address and then disappeared"
- "they should be always side by side", then "Phones stay stacked" and "Yes, zoom iPads"
- "remove all of the social media links except for the GitHub one"
- "open the sites in chat that I need to get the GitHub secret set up", then "Yes, merge #9 and #12"

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` at `main` ca73cc9 (spoonfed#9 and #12 merged 2026-11-13 with Astra's OK). What changes since the last build (`spoonfed-roll-backdrop-20261108.md`):

- **Real restaurants.** Feed me asks Google Places (New) for spots around whoever opens the page, from their own browser. A browser that keeps its location to itself gets a small "Where are you?" card that takes a town, address or ZIP, with My location and Made-up town buttons. One browser makes at most 30 searches and 40 look-ups a day.
- **Google's own map** in a spot's card, marking only the spot and you, and opening on both.
- **30% bigger** on computers and upright iPads; phones as they were.
- **The pick and the reels side by side** on every screen but an upright phone.
- **Send to phone** opens this page on a phone.
- **The footer** keeps only the GitHub link.

**The key.** Spoonfed's Google browser key is not in this repo. The new Pages workflow (`.github/workflows/pages-deploy-20261113.yml`) adds it to `spoonfed/index.html` as the site deploys, from the Actions secret `SPOONFED_GOOGLE_MAPS_BROWSER_KEY`, which Astra set herself on 2026-11-13. Like every Google web-map key, it can be read in the served page. Google only answers it on `findastra.github.io/spoonfed/*` and Astra's own preview, and only for the Maps JavaScript API and Places API (New). The workflow otherwise deploys `main` exactly as the branch deploy did. It also runs after each GitHub stats refresh, because that workflow's own push can't start it.

**Before it works:** the repo's Pages source must change from "Deploy from a branch" to "GitHub Actions", with Astra's OK. Until then, merging publishes the new Spoonfed with made-up spots, and this workflow's deploy step fails harmlessly.

What is public: the built page, its script, fonts and the spoon picture. No key, email, PC path or location code is in the files (checked).

Validation: in `findastra/spoonfed`, `pnpm test` (47 tests) passes and the type check is clean on `main`. Mirror Pool (Platform Platypus) checked the same app on 19 screens in Chromium and WebKit, with no open problems. Checked by hand in the browser pane: Feed me, the map, and the Where card with a real key on Astra's PC. The workflow's key step was tested with a made-up value: it adds one meta tag before `</head>`, and with no secret it leaves the page as it is.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
