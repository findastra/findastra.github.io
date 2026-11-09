# Spoonfed: food behind the page, clearer locks and buttons

Astra, 2026-11-08, after #43:

- "the plain brown in the background ... it's still boring right now", "Maybe it changes every time you roll", then "Yes, try it"
- "I don't like how it starts plain brown. Like, just start it off as something patterned."
- "the type of food can be like moved down actually"
- "center the save and send to phone buttons and make those look like the buttons on the panel to the right"
- "the save button and the history button that toggles the bottom one ... that yellow needs to be more white"
- "weird borders on the left and right of the screen ... like a long brown strip"
- "I shouldn't see any black outline at all anywhere except the sugar cube"
- "it's hard to tell with the lock buttons on or not"
- "I want this app to be able to work for anybody on their phone or their computer ... Can you give me a link so I can see if it's working for me?"

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` at f68c90d (branch `claude/sugarcube-pet-well-20261103`, draft PR #9). Changes since the last build (`spoonfed-focus-card-20261108.md`):

- **Food behind the page.** Before the first roll, the page is a patchwork of the dishes, blurred into soft squares under the chocolate and shuffled every visit. After a roll, the pick's own photo fills the page, blurred and mostly sunk in chocolate, and fades to the next pick's with every roll. It stays through an empty roll.
- **Pick card.** The food type leads the line under the name. Save and Send to phone are centered, with tan icons like Open now, Veggie and Bar.
- **History and Saved buttons** are cream-white instead of gold.
- **Locks.** A locked reel's lock fills with the reel's colour (blue, pink, green); unlocked is a faint outline.
- **Footer star** has no black rim.
- **No side strips.** The page no longer scrolls sideways onto a strip of the background.

Still made up: the restaurants. Real places near whoever opens the page need a Google key, which Astra makes herself (asked through API Fairy).

What is public: the built page, its script, fonts and the spoon picture. No keys or personal details (checked: no email, no PC path, no key, no location code).

Validation: `pnpm test` (32 tests) passes and the type check is clean. Served at `/spoonfed/` on this PC: the page cannot scroll sideways (page width equals the window), the first visit shows the patchwork (fresh browser), rolls fade the photo, and locking price fills its lock green. Not yet checked on a real phone.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
