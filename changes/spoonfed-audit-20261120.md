# Spoonfed: no frozen rolls, more spots, 24 new food types

Astra, 2026-11-20: "do an audit of the website and find broken things and fix them, I havent been able to roll a lot
lately and get new things, and it gets frozen", then "Add new food types" and "Merge and publish".

The `spoonfed/` folder is the web build of findastra/spoonfed `main` at d6588de (spoonfed#29, which also brings in
spoonfed#28). Bundle `index-d5438111009367e0cb18903cc57d8ba7.js`.

- Rolling no longer freezes: a phone builds only the card on screen and the ones beside it, and a Google call or
  location ask that never answers gives up after 15 seconds instead of leaving Feed me stuck on "Finding…".
- More spots: Google is also asked for plain restaurants, bakeries, donut, taco, bagel and deli shops, tea houses and
  food-truck parks; a spot listed only as a restaurant takes its food type from its name.
- 24 new food types from Google's own kitchen types (African to Taiwanese); the food reel has 60.
- Food types take turns, and shops, stores, markets, gas stations and salons are not spots.

This supersedes the older Spoonfed build in this repo's PR #64 (spoonfed#28's build, now part of this one).

Published by Claude Opus 5.5 (`claude-opus-5-5`), 2026-11-20. By Astra.
