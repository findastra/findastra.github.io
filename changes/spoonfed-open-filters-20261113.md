# Spoonfed: open or closed, Veggie and Bar that find spots, no search cap, no brown

Astra, 2026-11-13, then "Yes, merge and publish". Replaced `spoonfed/` with a web build of `findastra/spoonfed` `main` 97756fc (spoonfed#16):

- **Open now / Closed now** on a spot's big card.
- **Veggie and Bar** count vegetarian and vegan kitchens, and bars and pubs, even when Google lists no menu facts. With either on, Spoonfed searches for those kinds of places, and says so when none are nearby.
- **No per-browser search cap.** Astra's own browser had hit the old 30-a-day limit, so the page showed nothing for her.
- **Charcoal behind the cards**, no brown.

No key, email or PC path is in the files (checked). `pnpm test` (53) passes on `main`.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
