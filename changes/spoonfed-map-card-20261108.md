# Spoonfed: a spot's card with Google's map, pink food types and a Bar choice

Astra, 2026-11-06:

- "when you click on the picture of the restaurant it opens a card that shows it right on the map"
- "this card needs to look like the others on the main page but with a map instead of pic"
- "put them side by side instead of stacked but i like the squares", then "make it the same map size as the pic and use google maps please"
- "I want the food type to have its own color too", with the reels matching: distance blue, money green, food type pink
- "there needs to be "bar" as an option next to Veggie"
- "theres a weird white border"

On 2026-11-08 she said "Yes, make the PR".

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` at 36bdc3b (branch `claude/sugarcube-pet-well-20261103`, draft PR #9). Changes since the last build (`spoonfed-even-spoon-20261106.md`):

- Tapping the pick's picture, or its name, opens the spot's card. It looks like the pick card: the picture and Google's map side by side as two squares the same size, then the name, ratings, miles, price and buttons.
  - The map is Google's embedded map, which needs no key.
  - The old detail view, with its description, tags and hours, is gone.
- Food types are pink on every card. The reels wear the same colors as the cards: distance blue, food type pink, money green.
- A Bar choice next to Veggie keeps only spots with a bar. Twelve of the sample spots have one.
- The page itself is chocolate too, so no white shows at its edge.

Location: the restaurants are still made up, so the card stands each one its own miles from the visitor. The browser asks where they are the first time a card opens. That place stays in the page's memory and is never saved or sent. Google's map is asked for the spot's made-up place, which is near the visitor, so Google sees roughly where they are. The card says "Made-up spot" on the picture.

What is public: the built page, its script, fonts and the spoon picture. No keys or personal details (checked: no email, no PC path, no key).

Validation: `pnpm test` (33 tests, new ones for the Bar choice and the map) passes and the type check is clean. On 2026-11-06 the same code was served at `/spoonfed/` on this PC and checked with a test location, at 1111 × 1064 and phone size (375 × 812): the card opens from the picture, the map loads, and the squares sit side by side (145 px each on a phone). Not yet checked on a real phone, or with a real location.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
