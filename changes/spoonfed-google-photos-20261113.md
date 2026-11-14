# Spoonfed: Google's own photos

Astra, 2026-11-13, then "Yes, merge and publish". Replaced `spoonfed/` with a web build of `findastra/spoonfed` `main` 22c4c86 (spoonfed#18): each spot shows Google's 10 photos in Google's order, with no sorting or filtering, as when Spoonfed first went live ("those photos were perfect"). The picture-reading model is removed.

No key, email or PC path is in the files (checked). `pnpm test` (53) passes on `main`.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
