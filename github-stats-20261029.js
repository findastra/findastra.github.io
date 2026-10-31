// The GitHub box at the bottom of Contact (Astra, 2026-10-29): repo totals and the contribution chart from her GitHub
// profile, in the page's grays. Data: github-stats.json, refreshed every 6 hours by .github/workflows/github-stats.yml
// (Portfolio Puffer's GitHub Stats tool). Text goes in with textContent only.
(() => {
  const box = document.getElementById('ghStats');
  if (!box) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const svg = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'));
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };

  const render = (S) => {
    const tiles = box.querySelector('.gh-tiles'), chart = box.querySelector('.gh-chart'), note = box.querySelector('.gh-note');
    const C = S.contributions || {}, R = S.repos || {};
    tiles.replaceChildren();
    for (const [n, label] of [[R.total, 'repos'], [R.public, 'public'], [R.private, 'private'],
      [C.lastYear, 'contributions this year'], [C.streak, 'day streak']]) {
      const li = el('li'); li.append(el('b', null, fmt(n)), el('span', null, label)); tiles.append(li);
    }
    const days = C.days || [];
    chart.replaceChildren();
    if (days.length) {
      const cell = 11, gap = 3, step = cell + gap, left = 30, top = 18;
      const first = parse(days[0].date), pad = first.getUTCDay(); // weeks start on Sunday, like GitHub's
      const weeks = Math.ceil((days.length + pad) / 7);
      const s = svg('svg', { viewBox: `0 0 ${left + weeks * step} ${top + 7 * step}`, role: 'img',
        'aria-label': `${fmt(C.lastYear)} contributions on GitHub in the last year` });
      [['Mon', 1], ['Wed', 3], ['Fri', 5]].forEach(([t, r]) => { const x = svg('text', { x: 0, y: top + r * step + 9, class: 'gh-lab' }); x.textContent = t; s.append(x); });
      let lastMonth = -1;
      days.forEach((d, i) => {
        const k = i + pad, w = Math.floor(k / 7), r = k % 7, dt = parse(d.date);
        if (r === 0 || i === 0) {
          const m = dt.getUTCMonth();
          if (m !== lastMonth && dt.getUTCDate() <= 7 && w < weeks - 1) {
            const x = svg('text', { x: left + w * step, y: 11, class: 'gh-lab' }); x.textContent = MONTHS[m]; s.append(x);
          }
          lastMonth = m;
        }
        const rect = svg('rect', { x: left + w * step, y: top + r * step, width: cell, height: cell, rx: 2, class: 'gh-l' + (d.level || 0) });
        const t = svg('title', {});
        const n = d.count;
        t.textContent = `${n == null ? (d.level ? 'Some' : 'No') : n === 0 ? 'No' : n} contribution${n === 1 ? '' : 's'} on ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
        rect.append(t); s.append(rect);
      });
      chart.append(s);
      chart.scrollLeft = chart.scrollWidth; // on a phone, open on the newest weeks
    } else {
      chart.append(el('p', 'muted mono', 'the chart fills in at the next refresh'));
    }
    note.textContent = S.updated ? `updated ${S.updated}` : '';
  };

  fetch('github-stats.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(render).catch(() => { box.hidden = true; });
})();
