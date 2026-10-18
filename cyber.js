// findastra portfolio. Data: profile-data.js (the plain version, Astra approves it), site-data.js (repo snapshot),
// pets-data.js (every pet, from astras-pet-os), project-images.js (pictures found by GitHub Goldfish's
// project-image-generator). Live repos come from the GitHub API when it answers. Fetched text only ever goes through
// textContent, never innerHTML.
(() => {
  const P = window.PROFILE || {}, S = window.SITE || { repos: [] }, PETS = window.PETS || [];
  const IMG = Object.fromEntries(((window.PROJECT_IMAGES || {}).repos || []).map((r) => [r.name, r]));
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const link = (href, cls, text) => { const a = el('a', cls, text); a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const petByRepo = Object.fromEntries(PETS.filter((p) => p.repo).map((p) => [p.repo, p]));

  // ---------- pictures for a repo: the repo's own committed pictures first, then a live-site screenshot ----------
  // Program-page screenshots fill in only until the repo commits its own docs/images (A55); after that they repeat them.
  const picturesOf = (repo) => {
    const m = IMG[repo];
    if (!m) return [];
    const list = [];
    const committed = m.images || [];
    for (const i of committed) list.push({ src: i.url, cap: repo + ' · ' + i.path });
    if (m.screenshot) list.push({ src: 'art/projects/' + m.screenshot, cap: repo + ' · live site' });
    if (!committed.some((i) => /(^|\/)docs\/images\//.test(i.path))) {
      for (const pg of m.pages || []) {
        if (m.homepage && pg.source === m.homepage) continue; // same page as the site screenshot
        const cap = /system-map/.test(pg.source) ? 'System Map (3D PFD)' : 'program page';
        list.push({ src: 'art/projects/' + pg.file, cap: repo + ' · ' + cap });
      }
    }
    return list;
  };

  // ---------- lightbox (pictures keep their color) ----------
  const lb = $('lightbox'); let lbList = [], lbAt = 0;
  const lbShow = () => { const it = lbList[lbAt]; $('lb-img').src = it.src; $('lb-img').alt = it.cap; $('lb-cap').textContent = `${it.cap}   ${lbAt + 1} / ${lbList.length}`; };
  const openGallery = (list, at = 0, mono = false) => { if (!list.length) return; lbList = list; lbAt = at; lb.classList.toggle('mono', mono); lbShow(); lb.showModal(); };
  $('lb-close').onclick = () => lb.close();
  $('lb-prev').onclick = () => { lbAt = (lbAt - 1 + lbList.length) % lbList.length; lbShow(); };
  $('lb-next').onclick = () => { lbAt = (lbAt + 1) % lbList.length; lbShow(); };
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  addEventListener('keydown', (e) => { if (!lb.open) return; if (e.key === 'ArrowLeft') $('lb-prev').click(); if (e.key === 'ArrowRight') $('lb-next').click(); });

  // ---------- hero terminal ----------
  const term = $('term');
  const line = (text, cls) => { const p = el('div', cls, text); term.append(p); return p; };
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
  async function type(text, cls, speed = 12) {
    const p = line('', cls);
    if (reduced) { p.textContent = text; return; }
    for (const ch of text) { p.textContent += ch; await wait(speed); }
  }
  let unmasked = false;
  async function boot() {
    await type('audra@findastra:~$ whoami', 'ok');
    await type('audra', '', 30);
    for (const t of P.about || []) await type(t, 'dim', 6);
    await type('skills: ' + (P.skills || []).slice(0, 3).join(' · '), 'dim', 4);
    await wait(250);
    await type('# another user is logged in on this machine. try: sudo unmask', 'hot');
  }
  $('unmask').onclick = async () => {
    if (unmasked) return; unmasked = true;
    await type('audra@findastra:~$ sudo unmask', 'ok');
    await type('[sudo] password for audra: ********', 'dim', 8);
    document.body.classList.add('glitch'); await wait(800); document.body.classList.remove('glitch');
    document.body.classList.add('unmasked');
    $('term-title').textContent = 'astra@findastra: ~';
    await type('astra', 'hot', 40);
    await type('noncorporeal dancer · reality-hacker · digital performer', '', 10);
    await type(`${repos.length || ''} projects · ${PETS.length} pets · worlds below. scroll.`, 'dim', 8);
    $('unmask').textContent = 'unmasked ✓';
  };
  boot();

  // ---------- about ----------
  $('about-text').replaceChildren(...(P.about || []).map((t) => el('p', null, t)));
  $('languages').replaceChildren(...(P.languages || []).map((t) => el('li', null, t)));
  $('skills').replaceChildren(...(P.skills || []).map((t) => el('li', null, t)));
  if ((P.positions || []).length) {
    $('work-note').hidden = true;
    $('work').replaceChildren(...P.positions.map((p) => { const li = el('li'); li.append(link('work/' + encodeURIComponent(p.slug) + '.html', null, p.employer), document.createTextNode(` · ${p.role} · ${p.start}–${p.end || 'now'}`)); return li; }));
  }

  // ---------- tickers: what changed lately, and the projects being worked on now ----------
  // From GitHub's public search (merged pull requests and commits by findastra); the snapshot in updates-data.js when
  // GitHub does not answer. A change made in many repos at once (like SECURITY.md) is one line, and does not count
  // as working on those projects.
  const ticks = (() => {
    let repoList = [], updates = [];
    const NOISE = /^(merge (pull request|branch|remote-tracking|main|origin)|wip\b|update readme\.md$|initial commit$)/i;
    const tidy = (t) => String(t || '').split('\n')[0].replace(/\s*\((?:Astra|Claude|Codex|OpenAI)[^)]*\)\s*$/i, '').replace(/…$/, '').trim();
    const ago = (iso) => {
      const m = (Date.now() - new Date(iso)) / 60000;
      if (!(m >= 0)) return '';
      return m < 60 ? Math.max(1, Math.round(m)) + 'm ago' : m < 1440 ? Math.round(m / 60) + 'h ago' : Math.round(m / 1440) + 'd ago';
    };
    function group(prs, commits) {
      const all = [...prs.map((p) => ({ repo: p.repo, text: tidy(p.title), at: p.at })), ...commits.map((c) => ({ repo: c.repo, text: tidy(c.message), at: c.at }))]
        .filter((i) => i.text && i.at && !NOISE.test(i.text)).sort((a, b) => String(b.at).localeCompare(String(a.at)));
      const byText = new Map();
      for (const i of all) {
        const g = byText.get(i.text.toLowerCase());
        if (g) { if (!g.repos.includes(i.repo)) g.repos.push(i.repo); } else byText.set(i.text.toLowerCase(), { text: i.text, at: i.at, repos: [i.repo] });
      }
      return [...byText.values()];
    }
    const repoLink = (name, text, hidden) => { const a = link('https://github.com/findastra/' + name, 'repo', text); if (hidden) a.tabIndex = -1; return a; };
    function fill(id, makers) {
      const box = $(id), track = box.querySelector('.track');
      box.hidden = !makers.length;
      const copy = (hidden) => { const s = el('span'); if (hidden) s.setAttribute('aria-hidden', 'true'); s.append(...makers.map((m) => m(hidden))); return s; };
      track.replaceChildren(copy(false), copy(true));
      track.style.setProperty('--dur', Math.max(45, track.textContent.length * .11) + 's');
    }
    function draw() {
      fill('tick-updates', updates.slice(0, 22).map((u) => (hidden) => {
        const s = el('span', 'item');
        s.append(u.repos.length > 2 ? el('span', 'repo', u.repos.length + ' repos') : repoLink(u.repos[0], u.repos.slice(0, 2).join(' + '), hidden), el('span', null, u.text), el('span', 'when', ago(u.at)));
        return s;
      }));
      // working on: projects with their own changes this week, busiest first
      const week = Date.now() - 7 * 864e5, count = new Map(), last = new Map();
      for (const u of updates) {
        if (u.repos.length > 2 || new Date(u.at) < week) continue;
        for (const r of u.repos) { count.set(r, (count.get(r) || 0) + 1); if (!last.has(r)) last.set(r, u.at); }
      }
      const busy = [...count.keys()].filter((r) => r !== 'findastra.github.io' && !/^pet-program-\d+$/.test(r))
        .sort((a, b) => count.get(b) - count.get(a) || String(last.get(b)).localeCompare(String(last.get(a)))).slice(0, 12);
      const info = Object.fromEntries(repoList.map((r) => [r.name, r]));
      fill('tick-now', busy.map((name) => (hidden) => {
        const s = el('span', 'item'), r = info[name] || {}, pet = petByRepo[name];
        s.append(repoLink(name, name, hidden));
        if (pet && pet.pet && !/^pet-program/.test(pet.pet)) s.append(el('span', 'pet', pet.pet));
        const d = (r.description || (pet && pet.text) || '').replace(/^👉\s*\S+\s*[—-]\s*/, '');
        if (d) s.append(el('span', null, d.length > 110 ? d.slice(0, 107).trimEnd() + '…' : d));
        s.append(el('span', 'when', count.get(name) + (count.get(name) === 1 ? ' change' : ' changes') + ' this week'));
        return s;
      }));
    }
    return { repos(list) { repoList = list; draw(); }, updates(prs, commits) { updates = group(prs, commits); draw(); } };
  })();
  const SNAP = window.UPDATES_SNAPSHOT || { prs: [], commits: [] };
  ticks.updates(SNAP.prs, SNAP.commits);
  (async () => {
    const KEY = 'findastra-updates-v1';
    try { const c = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (c && Date.now() - c.t < 6e5) return ticks.updates(c.prs, c.commits); } catch {}
    const get = (u) => fetch(u, { headers: { Accept: 'application/vnd.github+json' } }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
    const [p, c] = await Promise.allSettled([
      get('https://api.github.com/search/issues?q=author:findastra+is:pr+is:merged+is:public&sort=updated&order=desc&per_page=50'),
      get('https://api.github.com/search/commits?q=author:findastra+is:public&sort=author-date&order=desc&per_page=50'),
    ]);
    if (p.status !== 'fulfilled' && c.status !== 'fulfilled') return; // keep the snapshot
    const prs = p.status === 'fulfilled' ? p.value.items.map((i) => ({ repo: i.repository_url.split('/').pop(), title: i.title, at: i.closed_at })) : SNAP.prs;
    const commits = c.status === 'fulfilled' ? c.value.items.map((i) => ({ repo: i.repository.name, message: i.commit.message, at: i.commit.author.date })) : SNAP.commits;
    ticks.updates(prs, commits);
    try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), prs, commits })); } catch {}
  })();

  // ---------- Astra's PetOS: other projects float as clouds above a worlds jar (ringed planets) and a pets jar (stars) ----------
  const WORLDS = [
    { name: "Astra's Infinite Pole", kind: 'VRChat world · PC VR / desktop', text: 'My VRChat world, full of magical effects. Unity source and every published version are on GitHub.', repo: 'astras-infinite-pole',
      local: [{ src: 'art/worlds/infinite-pole-spawn.jpg', cap: "Astra's Infinite Pole · the spawn" }] },
    { name: 'Piranesi House', kind: 'VRChat world · in progress', text: "Inspired by Susanna Clarke's Piranesi: an endless House of statues, tides and light, with islands, boats and a colossus you can sit in.", repo: 'piranesi-house', local: [] },
    { name: "Mommy's", kind: 'VRChat club · dance & avatar academy', text: 'A VRChat rave house, dance and avatar academy, with its own world, classes, events and Discord.', repo: 'mommys-website',
      local: [{ src: 'art/worlds/phone-booth.jpg', cap: 'A pink phone booth above the clouds' }], extra: ['mommys', 'role-fairy'] },
    { name: 'AI Astra', kind: 'AI · VRChat', text: 'A bridge that brings an AI companion into VRChat, with her own desktop app and chatbox.', repo: 'the-astral-plane', local: [] },
    { name: 'DETOUR into VR', kind: 'Live · IRL + VR rave', text: 'Streaming DETOUR Mile 04, an IRL + VR rave, to TikTok LIVE from VRChat.', repo: 'detour-into-vr', local: [] },
  ];
  // vrchat-ai-astra was renamed the-astral-plane (2026-10-18); the pet list may still use the old name
  const RENAMED = { 'vrchat-ai-astra': 'the-astral-plane' };
  if (petByRepo['vrchat-ai-astra'] && !petByRepo['the-astral-plane']) petByRepo['the-astral-plane'] = petByRepo['vrchat-ai-astra'];
  // The section is Astra's PetOS itself, so its own building blocks get no cards (Astra, 2026-10-18); the ones that are
  // pets still show in the pets jar.
  const WORLD_REPOS = new Set(['astras-infinite-pole', 'piranesi-house', 'the-astral-plane', 'vrchat-ai-astra', 'detour-into-vr', 'mommys-website', 'role-fairy']);
  const PETOS_REPOS = new Set(['astras-pet-os', 'startup-star', 'the-kennel', 'the-shed', 'vet-clinic', 'the-police-station', 'iron-gates', 'the-recovery-room', 'ai-doghouse', 'findastra']);
  const isOther = (r) => !/^pet-program-\d+$/.test(r.name) && !WORLD_REPOS.has(r.name) && !PETOS_REPOS.has(r.name) && !petByRepo[r.name];
  let repos = [], byName = {}, query = '';
  const when = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };
  // Clouds, planets and stars are the only color on the page. Each keeps its color and tilt (hashed from its name).
  const COLORS = ['#ff3ea5', '#00e1ff', '#c6ff00', '#ff9500', '#c7a6ff', '#ffe500', '#ff5c5c', '#00f5a0', '#5ab0ff', '#ff8ef0'];
  const hash = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619); return h >>> 0; };
  const colorOf = (key) => COLORS[hash(key) % COLORS.length];
  const paint = (node, key) => { const h = hash(key); node.style.setProperty('--c', COLORS[h % COLORS.length]); node.style.setProperty('--tilt', ((h >>> 8) % 9) - 4 + 'deg'); return h; };
  // sparkles around each shape, in hues near its own color; spots and timing come from the same hash
  const sparkles = (h, n = 6) => {
    const box = el('div', 'sparkles'); box.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < n; i++) {
      const k = hash(h + ':' + i), a = (i / n) * Math.PI * 2 + ((k % 60) - 30) / 60, rad = 46 + (k >>> 6) % 9;
      const s = el('i');
      s.style.cssText = `--x:${(50 + rad * Math.cos(a)).toFixed(1)}%;--y:${(50 + rad * Math.sin(a)).toFixed(1)}%;--s:${12 + (k >>> 10) % 14}px;--d:${((k >>> 14) % 30) / 10}s;--dh:${[-50, -25, 0, 25, 50][(k >>> 18) % 5]};--l:${[18, 30, 0][(k >>> 21) % 3]}`;
      box.append(s);
    }
    return box;
  };
  const SVG = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const n = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
  const shape = (id, viewBox, layers = ['s-shadow', 's-line', 's-fill', 's-shine']) => {
    const svg = svgEl('svg', { class: 'shape', viewBox, 'aria-hidden': 'true' });
    for (const cls of layers) svg.append(svgEl('use', { href: '#' + id, class: cls }));
    return svg;
  };
  // repo names break after their hyphens instead of mid-word
  const nameNodes = (name) => name.split('-').flatMap((part, i, all) => [document.createTextNode(part + (i < all.length - 1 ? '-' : '')), ...(i < all.length - 1 ? [el('wbr')] : [])]);
  const cleanText = (t) => t.replace(/^👉\s*\S+\s*[—-]\s*/, '');
  const shown = (text) => !query || text.toLowerCase().includes(query);

  // ---------- clouds: projects that are neither a pet, a world nor PetOS itself ----------
  function cloud(r) {
    const c = el('article', 'cloud'); const h = paint(c, r.name);
    c.style.setProperty('--bob', ((h >>> 4) % 40) / 10 + 's');
    const repoUrl = 'https://github.com/findastra/' + r.name;
    const win = el('div', 'cwin');
    const name = link(r.homepage || repoUrl, 'name'); name.append(...nameNodes(r.name)); name.title = r.name;
    const text = cleanText(r.description || 'No description yet.'); const p = el('p', null, text); p.title = text;
    const meta = el('div', 'meta'); meta.append(link(repoUrl, null, 'repo ↗'));
    if (r.homepage) meta.append(link(r.homepage, null, 'site ↗'));
    meta.append(el('span', null, when(r.pushed_at)));
    win.append(name, p, meta);
    c.append(sparkles(h, 5), shape('cloud', '-6 -2 256 168'), win); return c;
  }

  // ---------- planets: a circle with a ring around it, one per world ----------
  const worldPics = (w) => [...w.local, ...picturesOf(w.repo), ...(w.extra || []).flatMap(picturesOf)];
  // the ring's near half passes in front of the planet, its far half behind
  const ringArc = (front) => {
    const svg = svgEl('svg', { class: 'ring ' + (front ? 'front' : 'back'), viewBox: '-100 -100 200 200', 'aria-hidden': 'true' });
    const d = front ? 'M-96 0A96 26 0 0 0 96 0' : 'M-96 0A96 26 0 0 1 96 0';
    for (const cls of ['r-line', 'r-fill']) svg.append(svgEl('path', { d, class: cls }));
    return svg;
  };
  function planet(w) {
    const pics = worldPics(w);
    const c = el('article', 'planet'); const h = paint(c, w.repo);
    const orb = el(pics.length ? 'button' : 'div', 'orb');
    if (pics.length) {
      orb.setAttribute('aria-label', 'open pictures of ' + w.name);
      const im = el('img'); im.src = pics[0].src; im.alt = ''; im.loading = 'lazy'; orb.append(im);
      orb.onclick = () => openGallery(pics);
    } else orb.append(el('span', 'none', 'pictures coming'));
    const sky = el('div', 'orbit'); sky.append(sparkles(h, 7), ringArc(false), orb, ringArc(true));
    const info = el('div', 'info');
    info.append(el('div', 'tag', w.kind), el('b', null, w.name), el('p', null, w.text));
    const meta = el('div', 'meta'); meta.append(link('https://github.com/findastra/' + w.repo, null, w.repo + ' ↗'));
    if (pics.length > 1) meta.append(el('span', null, pics.length + ' pictures'));
    info.append(meta); c.append(sky, info); return c;
  }

  // ---------- stars: every pet, with its repo's pictures and links when the repo is public ----------
  const petEntry = (p) => { const name = byName[p.repo] ? p.repo : RENAMED[p.repo]; const r = byName[name]; return { p, r, pics: r ? picturesOf(r.name) : [] }; };
  function star({ p, r, pics }) {
    const c = el('article', 'card'); const h = paint(c, r ? r.name : p.pet);
    const repoUrl = r ? 'https://github.com/findastra/' + r.name : null, icon = p.icon ? 'art/icons/' + p.icon : null;
    let thumb;
    if (pics.length) {
      thumb = el('button', 'thumb'); thumb.setAttribute('aria-label', 'open pictures of ' + p.pet);
      const im = el('img'); im.src = pics[0].src; im.alt = ''; im.loading = 'lazy'; thumb.append(im);
      if (pics.length > 1) thumb.append(el('span', 'count', pics.length + ' pictures'));
      thumb.onclick = () => openGallery(pics);
    } else if (icon) {
      thumb = el('div', 'thumb'); const im = el('img', 'pix'); im.src = icon; im.alt = ''; im.loading = 'lazy'; thumb.append(im); thumb.style.cursor = 'default';
    } else {
      thumb = el('div', 'thumb empty', '{ }');
    }
    // top point: the pet (unless the window already shows it big), else a star
    const tip = el('div', 'tip');
    if (icon && pics.length) { const im = el('img'); im.src = icon; im.alt = ''; im.loading = 'lazy'; tip.append(im); }
    else tip.textContent = '✦';
    const body = el('div', 'body');
    const name = r ? link(r.homepage || repoUrl, 'name', p.pet) : el('b', 'name', p.pet); name.title = p.pet; body.append(name);
    body.append(el('div', 'pet', [p.program, r ? r.name : null].filter(Boolean).join(' · ') || 'program not named yet'));
    const text = cleanText((r && r.description) || p.text || 'No description yet.');
    const desc = el('p', null, text); desc.title = text; body.append(desc);
    const meta = el('div', 'meta');
    meta.append(el('span', null, '#' + p.number), el('span', null, p.stage), el('span', null, r ? when(r.pushed_at) : ''));
    body.append(meta);
    const win = el('div', 'win'); win.append(thumb, body);
    c.append(sparkles(h), shape('star', '-111 -116 229 220'), tip);
    if (repoUrl) c.append(link(repoUrl, 'arm l', 'repo ↗'));
    if (r && r.homepage) c.append(link(r.homepage, 'arm r', 'site ↗'));
    c.append(win); return c;
  }

  // ---------- the jars: filled to the top with small stars or planets; shake one out, or tip them all out ----------
  // seeded random, so the pile looks the same until the jar is shaken
  const rand = (seed) => () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9 >>> 0) / 4294967296);
  const miniStar = (color) => { const svg = svgEl('svg', { viewBox: '-111 -116 229 220', 'aria-hidden': 'true' }); svg.append(svgEl('use', { href: '#star' })); svg.style.setProperty('--c', color); return svg; };
  const miniPlanet = (color) => {
    const svg = svgEl('svg', { viewBox: '-100 -100 200 200', 'aria-hidden': 'true' }); svg.style.setProperty('--c', color);
    svg.append(svgEl('path', { class: 'ring-b', d: 'M-92 0A92 30 0 0 1 92 0', transform: 'rotate(-16)' }), svgEl('circle', { r: 64 }),
      svgEl('path', { class: 'ring-f', d: 'M-92 0A92 30 0 0 0 92 0', transform: 'rotate(-16)' }));
    return svg;
  };
  function makeJar(id, kind) {
    const box = $(id), jar = box.querySelector('.jar'), inside = box.querySelector('.jar-stars'), out = box.querySelector('.jar-out'), all = box.querySelector('.jar-all');
    const shakeBtn = box.querySelector('.shake'), pourBtn = box.querySelector('.pour');
    let items = [], outKey = null, shaking = false;
    // glints: the same color-matched sparkle as the portrait, twinkling on the stars and planets in the jar
    const glints = el('span', 'sparkles jar-glints'); glints.setAttribute('aria-hidden', 'true'); inside.after(glints);
    function fill(list) {
      items = list;
      const r = rand(list.length * 7919 + 17), n = list.length || 1;
      // Astra (2026-10-18): the jar is full, every one visible, and they lie in a natural pile, not a grid. Each one is
      // dropped from a random spot and stops on the first one it hits (or the floor); the lowest of a few tries wins.
      // Start as big as would fill the glass and shrink until the whole pile fits under the lid.
      const W = inside.clientWidth || 240, H = inside.clientHeight || 280;
      const pile = (rad) => {
        const at = [], reach = rad * 2 * .86; // neighbours tuck into each other's points a little
        for (let i = 0; i < n; i++) {
          let best = null;
          for (let t = 0; t < 12; t++) {
            const x = rad + r() * (W - 2 * rad);
            let y = H - rad;
            for (const p of at) { const dx = Math.abs(p.x - x); if (dx < reach) y = Math.min(y, p.y - Math.sqrt(reach * reach - dx * dx)); }
            if (!best || y > best.y) best = { x, y };
          }
          if (best.y < rad * .7) return null;
          at.push(best);
        }
        return at;
      };
      let rad = Math.min(kind.maxMini / 2, Math.sqrt((W * H * .6) / (n * Math.PI))), spots = null;
      while (!(spots = pile(rad)) && rad > 4) rad *= .94;
      spots = spots || list.map(() => ({ x: W / 2, y: H / 2 }));
      inside.style.setProperty('--s', rad * 2 + 'px');
      inside.replaceChildren(...list.map((it, i) => {
        const m = kind.mini(colorOf(kind.key(it))); m.classList.add('mini');
        m.style.left = (spots[i].x / W) * 100 + '%';
        m.style.top = (spots[i].y / H) * 100 + '%';
        m.style.setProperty('--r', Math.round(r() * 80 - 40) + 'deg');
        m.dataset.key = kind.key(it);
        if (m.dataset.key === outKey) m.classList.add('gone');
        return m;
      }));
      glints.replaceChildren(...list.flatMap((it, i) => {
        const key = kind.key(it), h = hash(key);
        return Array.from({ length: kind.glints(h) }, (_, g) => {
          const k = hash(h + ':g' + g), a = (k % 628) / 100, d = rad * (.15 + ((k >>> 10) % 50) / 100);
          const s = el('i'); s.dataset.key = key; s.hidden = key === outKey;
          s.style.cssText = `--x:${((spots[i].x + Math.cos(a) * d) / W * 100).toFixed(1)}%;--y:${((spots[i].y + Math.sin(a) * d) / H * 100).toFixed(1)}%;--s:${Math.max(6, rad * (.45 + ((k >>> 16) % 40) / 100)).toFixed(1)}px;--d:${((k >>> 20) % 30) / 10}s;--c:${colorOf(key)};--dh:0;--l:40`;
          return s;
        });
      }));
      box.querySelector('.jar-count').textContent = `${list.length} ${list.length === 1 ? kind.one : kind.many} in the jar`;
      pourBtn.dataset.n = list.length;
      if (!all.hidden) all.replaceChildren(...list.map(kind.full));
      setPour(!all.hidden);
    }
    new ResizeObserver(() => fill(items)).observe(inside);
    async function shake() {
      if (shaking || !items.length) return;
      shaking = true; jar.classList.add('shaking');
      const minis = [...inside.children];
      if (!reduced) {
        jar.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(9deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0)' }],
          { duration: 760, easing: 'ease-in-out' });
        for (const m of minis) {
          const base = `translate(-50%, -50%) rotate(${m.style.getPropertyValue('--r')})`, j = () => `translate(calc(-50% + ${Math.random() * 24 - 12}px), calc(-50% + ${Math.random() * -26}px)) rotate(${Math.random() * 120 - 60}deg)`;
          m.animate([{ transform: base }, { transform: j() }, { transform: j() }, { transform: base }], { duration: 760, easing: 'ease-in-out' });
        }
        await new Promise((ok) => setTimeout(ok, 640));
      }
      // one with pictures comes out more often, and never the same one twice in a row
      const choices = items.filter((it) => kind.key(it) !== outKey);
      const withPics = choices.filter(kind.hasPics);
      const pool = withPics.length && Math.random() < .65 ? withPics : choices.length ? choices : items;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const from = minis.find((m) => m.dataset.key === kind.key(pick));
      minis.forEach((m) => m.classList.toggle('gone', m === from));
      for (const g of glints.children) g.hidden = !!from && g.dataset.key === from.dataset.key;
      jar.classList.remove('shaking');
      if (!reduced && from) await fly(from, pick);
      outKey = kind.key(pick);
      out.replaceChildren(kind.full(pick));
      shaking = false;
    }
    // the chosen one climbs out of the jar's mouth and lands where its window opens
    function fly(from, it) {
      const st = box.getBoundingClientRect(), a = from.getBoundingClientRect(), mouth = jar.getBoundingClientRect(), b = out.getBoundingClientRect();
      const f = kind.mini(colorOf(kind.key(it))); f.classList.add('flyer'); f.style.setProperty('--s', a.width + 'px');
      f.style.left = a.left - st.left + 'px'; f.style.top = a.top - st.top + 'px'; box.append(f);
      const at = (x, y, sc, rot) => `translate(${x}px, ${y}px) scale(${sc}) rotate(${rot}deg)`;
      const mx = mouth.left + mouth.width / 2 - a.left - a.width / 2, my = mouth.top - a.top - a.height;
      const ex = b.left + b.width / 2 - a.left - a.width / 2, ey = b.top + b.height / 2 - a.top - a.height / 2;
      return f.animate([
        { transform: at(0, 0, 1, 0) },
        { transform: at(mx, my, 1.3, 200), offset: .45 },
        { transform: at(ex, ey, 5, 400), opacity: .2 },
      ], { duration: 820, easing: 'cubic-bezier(.4, 0, .3, 1)' }).finished.then(() => f.remove());
    }
    // tipped out, every one in the jar is laid out full size below it
    function setPour(open) {
      all.hidden = !open; box.classList.toggle('open', open);
      if (open && all.children.length !== items.length) all.replaceChildren(...items.map(kind.full));
      pourBtn.setAttribute('aria-expanded', String(open));
      pourBtn.textContent = open ? 'put them back in the jar' : `tip out all ${pourBtn.dataset.n || ''} ${kind.many}`;
    }
    jar.addEventListener('click', shake);
    shakeBtn.addEventListener('click', () => { phoneShakes = shake; shake(); listenForPhoneShake(); });
    pourBtn.addEventListener('click', () => { setPour(all.hidden); syncPourAll(); });
    // drag the jar side to side to shake it
    let drag = null;
    jar.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, dir: 0, flips: 0, t: performance.now() }; });
    addEventListener('pointerup', () => (drag = null));
    jar.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x; if (Math.abs(dx) < 14) return;
      const dir = Math.sign(dx); if (drag.dir && dir !== drag.dir) drag.flips++;
      drag.dir = dir; drag.x = e.clientX;
      if (drag.flips >= 2 && performance.now() - drag.t < 1500) { drag = null; shake(); }
    });
    return { fill, setPour, isOpen: () => !all.hidden };
  }
  // on a phone, shaking the phone shakes the jar whose button was pressed last (iPhone asks once, after the button)
  let listening = false, lastShake = 0, phoneShakes = null;
  async function listenForPhoneShake() {
    if (listening || typeof DeviceMotionEvent === 'undefined' || !matchMedia('(pointer: coarse)').matches) return;
    try { if (typeof DeviceMotionEvent.requestPermission === 'function' && (await DeviceMotionEvent.requestPermission()) !== 'granted') return; } catch { return; }
    listening = true;
    addEventListener('devicemotion', (e) => {
      const g = e.acceleration || e.accelerationIncludingGravity; if (!g) return;
      const force = Math.hypot(g.x || 0, g.y || 0, g.z || 0) - (e.acceleration ? 0 : 9.8);
      if (force > 14 && Date.now() - lastShake > 1400 && phoneShakes) { lastShake = Date.now(); phoneShakes(); }
    });
  }
  const worldJar = makeJar('worlds', { key: (w) => w.repo, mini: miniPlanet, full: planet, hasPics: (w) => worldPics(w).length > 0, maxMini: 130, glints: () => 3, one: 'world', many: 'worlds' });
  const petJar = makeJar('pets', { key: (e) => 'pet-' + e.p.number, mini: miniStar, full: star, hasPics: (e) => e.pics.length > 0, maxMini: 48, glints: (h) => (h % 10 < 7 ? 1 : 0), one: 'pet', many: 'pets' });
  const jars = [worldJar, petJar];
  const syncPourAll = () => { const open = jars.every((j) => j.isOpen()); $('pour-all').textContent = open ? 'put everything back' : 'tip out every jar'; $('pour-all').setAttribute('aria-pressed', String(open)); };
  $('pour-all').addEventListener('click', () => { const open = !jars.every((j) => j.isOpen()); jars.forEach((j) => j.setPour(open)); syncPourAll(); });

  function render() {
    $('cloud-list').replaceChildren(...repos.filter(isOther).filter((r) => shown(`${r.name} ${r.description}`))
      .sort((a, b) => String(b.pushed_at).localeCompare(String(a.pushed_at))).map(cloud));
    worldJar.fill(WORLDS.filter((w) => shown(`${w.name} ${w.kind} ${w.text} ${w.repo}`)));
    // pets with pictures first, then the ones with a public repo, then by number
    petJar.fill(PETS.map(petEntry).filter(({ p, r }) => shown(`${p.pet} ${p.program} ${p.text} ${p.repo} ${(r && r.description) || ''}`))
      .sort((a, b) => (b.pics.length > 0) - (a.pics.length > 0) || (b.r ? 1 : 0) - (a.r ? 1 : 0) || a.p.number - b.p.number));
    syncPourAll();
  }
  // a search lays out every match
  $('search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); if (query) jars.forEach((j) => j.setPour(true)); render(); });
  const useRepos = (list, live) => {
    repos = list.filter((r) => r.name !== 'findastra.github.io'); byName = Object.fromEntries(repos.map((r) => [r.name, r]));
    const shots = Object.values(IMG).filter((r) => r.screenshot || (r.pages || []).length || r.images.length).length;
    $('project-source').textContent = `${live ? 'live from GitHub' : 'snapshot'} · ${repos.length} public repos · ${PETS.length} pets · ${shots} with pictures so far`;
    render(); ticks.repos(repos);
  };
  useRepos(S.repos || [], false);
  fetch('https://api.github.com/users/findastra/repos?per_page=100&sort=pushed')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => useRepos(d.filter((r) => !r.fork && !r.private).map((r) => ({ name: r.name, description: r.description || '', language: r.language || '', pushed_at: r.pushed_at, homepage: r.homepage || (r.has_pages ? `https://findastra.github.io/${r.name}/` : '') })), true))
    .catch(() => {});

  // ---------- the portrait, in color: each of its colors sparkles in that color ----------
  // Astra (2026-10-18). Samples the picture on a small canvas and puts a twinkle on its most colorful spots.
  (() => {
    const img = document.querySelector('.portrait img'), box = $('portrait-glitter');
    const go = () => {
      const N = 48, cv = document.createElement('canvas'); cv.width = cv.height = N;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      let px; try { cx.drawImage(img, 0, 0, N, N); px = cx.getImageData(0, 0, N, N).data; } catch { return; }
      const r = rand(4242), spots = [];
      for (let i = 0; i < N * N; i++) {
        const R = px[i * 4], G = px[i * 4 + 1], B = px[i * 4 + 2], hi = Math.max(R, G, B), lo = Math.min(R, G, B);
        spots.push({ i, sat: hi ? (hi - lo) / hi : 0, light: hi / 255, c: `rgb(${R}, ${G}, ${B})`, w: r() });
      }
      // colorful and bright spots first, with a little chance so the twinkles spread over the whole picture
      spots.sort((a, b) => (b.sat * .7 + b.light * .3 + b.w * .5) - (a.sat * .7 + a.light * .3 + a.w * .5));
      box.replaceChildren(...spots.slice(0, 70).map((sp, n) => {
        const s = el('i'), k = hash('p' + sp.i);
        s.style.cssText = `--x:${((sp.i % N + .5) / N * 100).toFixed(1)}%;--y:${((Math.floor(sp.i / N) + .5) / N * 100).toFixed(1)}%;--s:${8 + (k % 14)}px;--d:${((k >>> 8) % 40) / 10}s;--c:${sp.c};--dh:0;--l:22`;
        return s;
      }));
    };
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
  })();

  // ---------- arcade: hack ----------
  function hack() {
    const pool = ['ASTRA', 'AUDRA', 'DANCE', 'PIXEL', 'GHOST', 'CLOUD', 'NEONS', 'ORBIT', 'GLINT', 'TIDES', 'SPARK', 'PETAL', 'VAPOR', 'RELAY', 'FAIRY', 'GUPPY'];
    const words = [...pool].sort(() => Math.random() - .5).slice(0, 10), answer = words[Math.floor(Math.random() * 10)];
    let tries = 4; const box = $('hack');
    const status = el('p', 'mono', 'attempts: ■ ■ ■ ■'), list = el('div', 'words'), log = el('div', 'hacklog');
    box.replaceChildren(el('p', 'mono hot', 'FINDASTRA TERMLINK · password required'), status, list, log);
    for (const w of words) {
      const b = el('button', null, '0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0') + ' ' + w);
      b.onclick = () => {
        if (!tries) return; b.disabled = true;
        if (w === answer) { log.append(el('p', 'granted', `> ${w}  ACCESS GRANTED · welcome back, astra`)); [...list.children].forEach((x) => (x.disabled = true)); return; }
        tries--; const like = [...w].filter((c, i) => answer[i] === c).length;
        log.append(el('p', 'denied', `> ${w}  denied · likeness=${like}`));
        status.textContent = 'attempts: ' + '■ '.repeat(tries);
        if (!tries) { log.append(el('p', 'locked', `LOCKED OUT · it was ${answer}`)); [...list.children].forEach((x) => (x.disabled = true)); }
      };
      list.append(b);
    }
  }
  $('hack-new').onclick = hack; hack();

  // ---------- arcade: pet memory ----------
  function deal() {
    const pool = PETS.filter((p) => p.icon);
    const pick = [...pool].sort(() => Math.random() - .5).slice(0, 6), cards = [...pick, ...pick].sort(() => Math.random() - .5);
    let open = [], found = 0, moves = 0, lock = false; const t0 = Date.now();
    const stat = () => ($('mem-stat').textContent = `moves ${moves} · pairs ${found}/6`);
    $('board').replaceChildren(...cards.map((p) => {
      const t = el('div', 'tile'), b = el('button'); b.setAttribute('aria-label', 'card');
      const f2 = el('span', 'f f2'), im = el('img'); im.src = 'art/icons/' + p.icon; im.alt = p.pet; f2.append(im);
      b.append(el('span', 'f f1', '✦'), f2); t.append(b);
      b.onclick = () => {
        if (lock || t.classList.contains('open') || t.classList.contains('done')) return;
        t.classList.add('open'); open.push([t, p]);
        if (open.length < 2) return;
        moves++; const [[ta, pa], [tb, pb]] = open; open = [];
        if (pa.icon === pb.icon) { ta.classList.add('done'); tb.classList.add('done'); found++; if (found === 6) { $('mem-stat').textContent = `all pairs · ${moves} moves · ${Math.round((Date.now() - t0) / 1000)}s ✦`; return; } }
        else { lock = true; setTimeout(() => { ta.classList.remove('open'); tb.classList.remove('open'); lock = false; }, 700); }
        stat();
      };
      return t;
    }));
    stat();
  }
  $('mem-new').onclick = deal; deal();

  // ---------- links ----------
  [['GitHub', 'https://github.com/findastra'], ['TikTok', 'https://www.tiktok.com/@findastra']].forEach(([n, h]) => $('links').append(link(h, null, n)));

  // ---------- faint code rain behind the hero (white on the dark hero, black once it is unmasked) ----------
  const cv = $('rain'), cx = cv.getContext('2d'); let cols = [];
  const size = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; cols = Array(Math.ceil(cv.width / 16)).fill(0).map(() => Math.random() * cv.height); };
  size(); new ResizeObserver(size).observe(cv);
  const glyphs = 'ASTRAUDRA01アストラ✦';
  (function rain() {
    if (reduced) return;
    cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = 'rgba(0, 0, 0, .14)'; cx.fillRect(0, 0, cv.width, cv.height);
    cx.globalCompositeOperation = 'source-over';
    cx.fillStyle = unmasked ? '#000' : '#fff'; cx.font = '14px JetBrains Mono';
    cols.forEach((y, i) => { cx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * 16, y); cols[i] = y > cv.height + Math.random() * 1e4 ? 0 : y + 16; });
    setTimeout(() => requestAnimationFrame(rain), 60);
  })();
})();
