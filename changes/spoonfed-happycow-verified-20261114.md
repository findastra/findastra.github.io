# Spoonfed: plain $ prices, the martini glass back, and a Happy Cow button only for verified spots

Astra, 2026-11-14:

- "The martini glass was better for the alcohol one."
- "I literally want to see $1, $2, $3, or $4 signs. That's it. No squiggle, no dash."
- "Happy Cow should be a link to whatever this restaurant is on Happy Cow ... everything will have to be verified if it has a happy cow link or not." She chose the search engine lookup.
- "Merge both"

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` at `main` 7cefe2d (spoonfed#25 and spoonfed#26, merged with Astra's OK). What changes:

- **Prices are only $ to $$$$.** No ~, no ranges, no per-person line. When Google gives no price level, Spoonfed guesses one.
- **The martini glass is back** on Alcohol.
- **Happy Cow button, verified.** It shows (Save · Website · Happy Cow · Directions) only when the spot has its own Happy Cow page, with or without Veggie on, and opens that page. Spoonfed's small server (`spoonfed-happycow.findastra.workers.dev`) asks Brave Search, keeps only a Happy Cow review page with the same name in the same town, and skips listings marked closed. Nothing is read from Happy Cow itself.

What is public: the built page and its script, which has the server's address. No key, email or PC path is in the files (checked). The Brave key stays on the server as a secret. The deploy adds the Google key as before.

By Astra.
