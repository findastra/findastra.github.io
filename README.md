# findastra.github.io

Astra's portfolio, served at <https://findastra.github.io>.

Kept by Portfolio Puffer. Rules and file map: [AGENTS.md](AGENTS.md).
It is the one place that connects Audra and Astra (Astra, 2026-10-17; see `findastra/astras-pet-os` skills/farm-security).
Employer pages publish only what Astra has read word for word. Portfolio Puffer proposes changes; Astra approves them.

## Run it locally

`python -m http.server 5173` in this folder, then open <http://localhost:5173>. Earlier design drafts: `/drafts/`.

## Limits

- Work history is empty until Astra approves each employer page.
- The hero shows Astra's hand lettering, 8 pieces so far; Portfolio Puffer's Handwritten Message Manager keeps the set.
- Every project card shows its repo's own committed pictures first (35 repos pass Flash Audit A55 so far), then live-site screenshots; program-page screenshots fill in for repos that have not committed pictures yet.
- Projects load live from the GitHub API; when it does not answer, the page uses the snapshot in `site-data.js` and says so.
