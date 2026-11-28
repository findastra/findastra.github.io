# Anthropic IPO: Codex Edition

By Astra. Analysis and implementation by OpenAI Codex, 2026-11-17.

Adds a separate page at `anthropic-ipo-codex/`, preserving the original Anthropic guide and the OpenAI edition. The new page reuses the navy/neon design and existing fonts and illustration assets from the portfolio.

## Analysis

- Primary-source check of Anthropic's November 17 Amendment No. 3, company IPO highlights and participating broker pages.
- Distinguishes expected dates from completed events, preliminary pricing from final pricing, and requests from fills.
- Reproduces the midpoint valuation calculation with its share-count limitations; distinguishes GAAP, adjusted figures and operating cash flow.
- Uses a hypothetical $25K budget with a conditional starter of up to $5K; no actual account, trade or personalized position recommendation.
- Includes whole-share arithmetic, loss cases and an interactive comparison of single-limit, ladder and scheduled purchases. Each path uses the same starting cash and includes unspent cash in terminal value.
- Includes a copyable research brief, downloadable source record and history. No automatic monitoring or recurring task was created.

## Validation

JavaScript syntax passed. Independent read-only review verified financial attribution, arithmetic for all four simulation paths, HTML structure, local references and privacy. Desktop and 390px phone browser checks passed. A mobile grid overflow was found and fixed by allowing its content column to shrink; the wide results table scrolls inside its container. The checker approved this exact CSS-only delta.

Browser-tested share prices: $75, $78, $25,001, zero and $0.01. All four simulation paths matched independent calculations. Source references expand their source disclosure; the clipboard button reports success. Images load. No guide-origin errors were observed.

## Scope and publication

Only `anthropic-ipo-codex/`, this change note and the numbered delivery card are changed. Existing assets remain untouched. This branch is based directly on main and does not depend on OpenAI PR #126. Merge publishes the new directory; no merge or deployment is authorized by this change alone.
