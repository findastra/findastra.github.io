# Spoonfed: long names on phones

Astra, 2026-11-04: "Yes, fix names". At phone width the pick's name was cut off with "…" (for example "Two Scoops …").

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` at 689a120 (branch `claude/sugarcube-pet-well-20261103`, draft PR #9). On a phone the pick's name now takes a second line, and the pick panel grows to fit it, so Save, Directions and Menu stay inside it. On a computer nothing changes. Only the page and its script changed; the fonts and the favicon are the same files.

What is public: the same as before, the built page, its script and fonts, with no keys or personal details (checked: no email, no PC path).

Validation: the same build served at `/spoonfed/` on this PC; Marigold Kitchen at phone size (375 × 812) shows on two lines with its stars and buttons inside the panel, and at computer size on one line with the panels the same size as before. The console shows no errors. Not yet checked on a real phone.

Implemented by Claude Opus 5.5 (`claude-opus-5-5`).
