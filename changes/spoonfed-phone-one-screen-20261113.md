# Spoonfed: phones on one screen, open or closed on every card, a steady reload

Astra, 2026-11-13, from her Android:

- "We need to get all of this stuff on one screen. We don't want to ever have to scroll"
- "combine the select, the one you rolled with the list ... on the phone, it just starts scrolling to the right"
- "the recents and the save button and the arrow, those can all be in the middle"
- "there was resizing as I scrolled down. So I don't want that"
- "when you go to the maps link, it's like it tries to open the QR code, but then it goes straight to your map. So there's some jitter there"
- "shrink the spoon-fed logo like by like 33% on the mobile app. The unified footer could be smaller too"
- "All of them need to show if it's open now or not"
- "I wanted it to select on the outside of the card, not the inside of the card"
- "that whole section of the wheels kind of needs to be centered more in that brown block ... squished in a little bit smaller"
- "when I reload the page, all of the squares move around"
- "Yes, push everything and publish the site"

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` at `main` 4a33c18 (spoonfed#20 and spoonfed#21, merged with Astra's OK). What changes:

- **Phones on one screen.** No scrolling on an upright phone. The pick is the first card of one sideways strip, with your past rolls or saved spots after it, every card the same size. Recents, Saved and the arrow sit centered under it. The logo is a third smaller, the footer is smaller and the reels are tighter. Sizes come from the page's own layout, so nothing resizes as the browser's bars move.
- **Directions on phones** is a plain link, which the phone hands straight to its maps app, with no pop-up tab flashing first. Taps between the buttons no longer open the card behind them.
- **Open or Closed** on every card, in blue or red.
- **Hover ring** outside each card's edge, never over its photo.
- **Reels** a touch smaller and lower in their panel.
- **Reload** keeps the cards where they were: the bottom row's room is held from the first frame.
- From spoonfed#20 (Astra's other chat): every fact its own color, Google's real per-person price ranges, the brown route line and bigger Drive and Walk labels.

What is public: the built page, its script and pictures. No key, email or PC path is in the files (checked). The deploy adds the Google key as before.

By Astra.
