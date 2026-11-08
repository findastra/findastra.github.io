# Spoonfed: the spot's map works without a location, and a tidier spot card

Astra, 2026-11-08, looking at the live page after #42: "So is this working yet or what?" The card opened, but its map stayed empty and said "Turn on location to see it on the map." The browser she was using keeps its location to itself and never asks, so the made-up spot had no place to stand.

She said "Yes, make the PR", then, looking at the fixed card:

- "Make all that one row when it's on a focus card like this" (the ratings, miles, price, Save, Send to phone and the food type)
- "I don't want the X. I don't want the open in maps", "Let's start it in the city view"
- "Get rid of the option of the type of food that's a bar, unless it's just a cocktail bar"
- "We need a more like distinct like white border around all of these cards"

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` at ef79d01 (branch `claude/sugarcube-pet-well-20261103`, draft PR #9). Changes since the last build (`spoonfed-map-card-20261108.md`):

- The card's map no longer needs the browser's location, and the page never asks for it. A made-up spot's map is a Google search for its food type near the visitor ("Ice cream near me", zoomed out to the town), so it shows real places of that food type nearby. A real spot, once Spoonfed has them, is found by its own name and address.
- The map starts in Google's satellite view with street names on. Google's "Open in Maps" box is trimmed off the top of the square. Google's logo and its "Map data" line stay, because Google requires them on its map.
- The spot card has no X over the map; a click outside the card, or Esc, closes it. Under the name, one row holds the food type, both ratings, miles, price, Save and Send to phone. On a phone the row wraps.
- The Bar food type is now Cocktail bar (the two sample bars). The Bar choice under the reels stays, for restaurants that have a bar.
- Every card (the pick, the reels, the row and the spot card) has a clear light edge.

Location: the page no longer reads or keeps any location. Google's map works out roughly where the visitor is from their connection, as it does for any "near me" search. The picture still says "Made-up spot". The restaurants themselves are still made up until Spoonfed has a Google Places key.

Not done: zooming with a plain scroll. Google's keyless map always asks for Ctrl+scroll (a touchpad pinch also works). Plain-scroll zoom needs Google's Maps JavaScript API, which needs its own key.

What is public: the built page, its script, fonts and the spoon picture. No keys or personal details (checked: no email, no PC path, no key, and no location code left in the script).

Validation: `pnpm test` (32 tests) passes and the type check is clean. On 2026-11-08 the same build was served at `/spoonfed/` on this PC and opened in a browser that denies location, at desktop and phone size (375 × 812): the card shows real ice-cream places nearby in satellite view with no location question, no "Open in Maps" box, one row under the name, and Esc closes it; the cuisine reel shows Cocktail bar and no plain Bar. Not yet checked on a real phone.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
