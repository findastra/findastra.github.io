status: open (waiting on Astra: named approval to merge PR #127)
for: Astra; next research assistant
from: OpenAI Codex, 2026-11-17
needs: AGENTS.md, CLAUDE.md, anthropic-ipo-codex/research-20261117.json
---

## Task
Create a whole separate Anthropic IPO page with Codex's independent analysis and a hypothetical $25,000 budget.

## Ownership and state
State: READY_FOR_REVIEW; independent review passed, owner acceptance and integration pending.
Implementer: Codex current chat; implementation ownership released.
Delivered scope: anthropic-ipo-codex/ and changes/anthropic-ipo-codex-20261117.md.
Reviewer: read-only Codex subagent review_anthropic_guide.
Next action: Astra reviews PR #127. Merge only after she names the PR in her instruction. No dependency on OpenAI PR #126.

## What I did
Branch codex/anthropic-ipo-review-20261117, directly based on main 2dc8a07. Implementation commit 3f9dd51.
PR: https://github.com/findastra/findastra.github.io/pull/127.

Created a static page, browser script and research JSON. Existing Anthropic assets supply the fonts, character and Claude spark; they are unchanged. The original Anthropic guide and OpenAI page are unchanged.

The analysis checks the November 17 Amendment No. 3, company highlights and broker notices. It explicitly separates preliminary from final terms, requests from fills, basic from diluted share counts and accounting loss from cash burn. The proposed hypothetical plan waits for final terms and trading, then considers at most $5K initially after a valuation review. The remaining budget is optional, conditional exposure. No real account or order exists.

The interactive model compares single-limit, ladder and scheduled purchases under four hypothetical weekly paths, with equal starting cash, whole shares and unspent cash included in final values. A share calculator, full-loss stress cases, research brief, source record and history complete the page. There is no automated research schedule or trading integration.

Validation: JavaScript syntax and staged whitespace checks passed. Independent calculations matched every simulation path. Browser tests covered all paths and share prices $75, $78, $25,001, zero and $0.01. Source anchors reveal their disclosure and clipboard copy worked. Desktop and 390px phone layouts were inspected; a mobile grid overflow was fixed and rechecked (document width 375 inside a 390px viewport). All local images loaded. No guide-origin errors were observed.

The local editorial preview remains running at http://127.0.0.1:8814/anthropic-ipo-codex/index.html on the owner's computer. It is not live. No deployment has occurred.

## Done when
Astra accepts the page and explicitly names PR #127 for merge, current overlapping changes are rechecked, and the deployed page is verified. Future research follows the source record, preserves history and updates visible dates and claims together.

## Return
Record receipt, later source updates and review findings here. No other running assistant has been told or assumed to have read this card.

## Receipt and review
The independent reviewer read all three implementation files and returned no actionable findings for financial evidence, arithmetic, structure, assets, privacy or script behavior. It then approved the CSS-only phone-overflow fix by confirming that removing the exact added rule restored its previously approved HTML hash.

Approved SHA-256:
- index.html: b4c135ed2f8532f27f2d9f330dd154350a081b4503c04549168beeda2fae0741
- guide-20261117.js: 4d00f4d821f8d3e656a0358fd7a74873f2ccb1b6fbd0fe2751777943c775ba86
- research-20261117.json: 415551280739cbe8e6dd17502ef246597c1e3ddd5aeda73cd9d512637a5f531f

The implementer performed actual-browser checks. This delivery card is added after implementation review and changes no reviewed implementation file. Receipt by a future researcher is pending.
