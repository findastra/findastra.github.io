# Spoonfed: Website and Directions, the way there with its minutes, ten photos, phone layout

Astra, 2026-11-13, an evening of notes on the live Spoonfed, then "Yes, merge and publish".

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` at `main` 0faf51a (spoonfed#14 and #15 merged with Astra's OK). Since the last build (`spoonfed-real-spots-20261113.md` and the #48 build):

- **Buttons:** Save, Website, Directions. On a computer, Directions shows a QR code of Google Maps' directions. There is no Menu button. The name links to the restaurant's website and shrinks to fit its line.
- **Photos:** every photo Google has (up to ten), the restaurant's own first, scrolling round both ways, with no words on them. The photographer's credit shows on the big card.
- **Map:** always the street map. It draws the way from you to the spot, with drive or walk minutes beside Google's logo. The Routes API is now allowed for Spoonfed's key (Astra's OK).
- **Price:** when Google has none, a guess from the kind of place, marked ~.
- **Look:** Sugarcube without his black outline, the logo centered over the cards, names in Georgia, the start background from Astra's screenshot instead of plain brown, a glow under the mouse.
- **Behavior:** the page rolls by itself when it opens. Row cards open their big card. On phones, both cards fit on the first screen.
- **Fonts:** the page no longer needs web fonts. The old ones sat in a hidden `.pnpm` folder that the Pages deploy left out, so they never loaded on the live site.

This replaces #50 (Menu to Google Maps), whose change is folded in and then replaced by the Website button.

What is public: the built page, its script and pictures. No key, email or PC path is in the files (checked). The deploy adds the Google key as before.

Validation: in `findastra/spoonfed`, `pnpm test` (53 tests) passes and the type check is clean on `main`. Checked in the browser pane against real Google data: the auto roll, the big card's route ("10 min"), Website and Directions, the phone layout at 375 px, and the logo measurements.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
