# Portfolio cards, motion, games and complete Instagram gallery

By Astra. OpenAI Codex (GPT-6), 2026-10-30.
State: REVIEWED, ready for Astra. Implementation ownership released.

## Requested result

- Retain official blue/gold galaxies; remove Play/Pause stars buttons.
- Stop PetOS card/jar drift by bounding both grid columns; remove stretched game-cabinet gaps.
- Keep one continuous Pocket message: "Astro is here · I love DEV69".
- Keep released Fuzzbois visible, including repeat release/recall and stale saved motion.
- Restore immediate consecutive sparkles, fast initial timing and gradual acceleration.
- Stabilize failed TikTok players with Retry/Watch options and truthful unavailable-preview copy.
- Load all 93 Instagram photos, initially the last/oldest and proceeding toward newer photos.
- Make GitHub totals/contributions and the engineering contact card green.
- Draw the rabbit by changing cells on a fixed pixel grid in the top introduction.
- Move Piranesi's maze up; restore the transparent Rainbow Maker and its emitted sparkles.
- Put every sound button at the picture's top right; preserve flip-button positions.
- Narrow the desktop scroll rail from 52px to 36px.
- Move only the System Map globe/blue field down 4vh; retain the key position and full-height frame.
- Cap Friendly Farmer's visible ink at its desktop size, 52.875 logical pixels.
- Replace oversized raster Discord-card previews with crisp text at observed compact proportions,
  retaining official animated art and the already-authorized live gist data.

## Validation

Syntax checks and git diff --check pass. Fresh browser checks at 390/768/1280/1600/1920px show
zero horizontal overflow, zero PetOS geometry drift, no page/ResizeObserver errors, two ready official
galaxy canvases and no galaxy buttons. Rabbit geometry stays fixed while pixels change. Cabinet gaps
are 14px; sound buttons resolve to top/right; the hidden Avatar Library stays hidden.

Map keys toggle in place, its globe/labels move 4vh and no bottom strip remains. Farmer's visible
alpha bounds measure 52.8749px at phone and desktop sizes. The Pocket message remains exact after
10.5 seconds. Rainbow video advances; its keyed canvas is about 79.5% transparent, with changing
visible pixels in the separate sparkle layer.

Game checks cover consecutive targets, elapsed-time deadlines, saved-state resets, repeated
release/recall, visible release and no automatic scrolling on dome breakout. Feed review passes
14 playback/recovery/visibility checks. All 93 JPEGs decode; regeneration preserves identical
photos/captions; runtime visits 93 unique images oldest-to-newest before wrapping.
Discord previews fit at 390/1280/1920px and use static official art for reduced motion.
Live Discord text expires after 12 minutes even during a network outage; fresh, stale, inactive
and recovered data checks pass. Rabbit click/keyboard, visibility and reduced-motion checks pass.
All 81 added photos follow the owner's lowercase dated filename convention.

Private local scripts, screenshots and reports are available to the assigned reviewers, not published.

## Practical limits

TikTok may decline an embedded preview; this does not establish sign-in state or account settings.
The site offers a direct TikTok link and stops automatic skipping after playback errors.
The gallery contains 93 verified Instagram post photos. Three 640px photos match native crops in
the owner's originals. A fourth is the post's available 640px image; its original was not located.
Discord proportions were observed in the desktop client. The preview uses Segoe UI/Arial instead
of redistributing Discord's proprietary font, so it is not a pixel-identical screenshot.
Contact wording, employer content and official galaxy files remain unchanged.

## Delivery

PR 38: https://github.com/findastra/findastra.github.io/pull/38
Branch: codex/portfolio-galaxy-cards-20261030
Base: 39b8d5d4a5f23075555f5a07a89b7ae22e1a3b2d
This is the requested review version; main/live publication is not included.
Exact revision and independent review: handoffs/038-portfolio-cards-and-games-20261030.md.
Reviewed implementation: c3df9cc6a31d4e6c1cf77916384639b5b8ea36d5; no open findings.
