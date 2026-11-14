# Spoonfed: Menu opens Google Maps, never a restaurant's own site

Astra, 2026-11-13: a friend tapped **Menu** on a real spot and got an online-gambling page (nav-links.com). Her question: "does that mean someone has my API key". It doesn't. Menu opened the website Google lists for that restaurant, and the restaurant's web address had been taken over (most likely a lapsed domain bought by spammers). Spoonfed's Google key can't change where a button goes.

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` branch `claude/spoonfed-menu-google-page-20261113` (a7a6dde, spoonfed#14): `main` plus one change.

- **Menu** opens the spot's own Google Maps page, where Google shows its menu.
- Spoonfed no longer asks Google for restaurant websites, so it never links to one.

Everything else is as in `spoonfed-real-spots-20261113.md` and the #48 build.

What is public: the built page, its script, fonts and the spoon picture. No key, email, PC path or location code is in the files (checked).

Validation: in `findastra/spoonfed`, `pnpm test` (47 tests) passes and the type check is clean on the branch.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
