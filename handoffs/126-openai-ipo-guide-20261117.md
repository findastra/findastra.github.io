status: open (waiting on Astra: named approval to merge PR #126)
for: Astra; next research assistant
from: OpenAI Codex, 2026-11-17
needs: AGENTS.md, CLAUDE.md, openai-ipo/research-20261117.json
---

## Task
Create an OpenAI IPO counterpart to Astra's Anthropic guide, with a hypothetical $25,000 budget and a repeatable research process.

## Ownership and state
State: READY_FOR_REVIEW; independent content review passed; owner acceptance and integration pending.
Implementer: Codex, current chat; implementation ownership released.
Writable scope delivered: openai-ipo/ and changes/openai-ipo-guide-20261117.md.
Reviewer: read-only Codex subagent review_openai_guide; review completed before implementation commit.
Next action: Astra reviews PR #126. Merge only after she names it in her instruction. A future researcher must read this card and current sources before claiming the scope.

## What I did
Branch: codex/openai-ipo-guide-20261117, based on main 2dc8a07.
Implementation revision: 76b27cb. Pull request: https://github.com/findastra/findastra.github.io/pull/126.
Added openai-ipo/index.html, guide-20261117.js and research-20261117.json. Reused existing fonts and artwork without modifying the original guide. Added the change note named above.

The page includes dated official sources, unknown offering terms, bullish and bearish considerations, whole-share budget arithmetic, explicit loss scenarios, conditional staged entry, a copyable research brief and downloadable research record. The budget is hypothetical. No trading integration or recurring monitor was created.

Validation: JavaScript syntax and staged whitespace checks passed. Desktop and 390px phone preview had no missing assets or horizontal overflow. Actual-browser calculator checks covered blank, zero, $0.01, $75, $78 and a price over budget. Source disclosures and clipboard action worked; browser console had no errors or warnings.

A local editorial preview remains running at http://127.0.0.1:8800/openai-ipo/index.html on the owner's computer. It is not deployed. No merge or live-site check has occurred.

## Done when
Astra accepts the page and explicitly authorizes the named PR; its merge is checked for overlapping changes and the deployed page is verified. Future research updates preserve citations, date labels and the distinction between verified facts and hypothetical assumptions.

## Return
Record future receipt, source updates and review evidence here. Do not imply that another running assistant has received this card until it acknowledges reading it.

## Receipt and review
The read-only reviewer inspected the delivered implementation and returned: "Read-only review passed with no remaining actionable findings." Its content, arithmetic, HTML, assets and JavaScript review used these exact file hashes, independently confirmed by the implementer:

- index.html SHA-256: a875720b9b7ecb421b09606b980ba6b63a2fd4977879d4718c65ae5c44558212
- guide-20261117.js SHA-256: 65b07913575b5303ef20a21f31f2b6b4b43db8052631ce82347cb7abb1d02d78
- research-20261117.json SHA-256: 0a8c99c0888e9c89c262c5fda148d3002618733ee377a28f3f59032fd6881b26

Browser interaction and external-link verification were performed by the implementer. This card was added afterward and changes no reviewed implementation file. Receipt by a future research assistant is pending.
