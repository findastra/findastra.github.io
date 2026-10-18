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
  const iconOf = (p) => (p && p.icon ? 'art/icons/' + p.icon : null);

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

  // ---------- lightbox (mono: world pictures stay gray; project pictures keep their color) ----------
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

  // ---------- worlds ----------
  const WORLDS = [
    { name: "Astra's Infinite Pole", kind: 'VRChat world · PC VR / desktop', text: 'My VRChat world, full of magical effects. Unity source and every published version are on GitHub.', repo: 'astras-infinite-pole',
      local: [{ src: 'art/worlds/infinite-pole-spawn.jpg', cap: "Astra's Infinite Pole · the spawn" }] },
    { name: 'Piranesi House', kind: 'VRChat world · in progress', text: "Inspired by Susanna Clarke's Piranesi: an endless House of statues, tides and light, with islands, boats and a colossus you can sit in.", repo: 'piranesi-house', local: [] },
    { name: "Mommy's", kind: 'VRChat club · dance & avatar academy', text: 'A VRChat rave house, dance and avatar academy, with its own world, classes, events and Discord.', repo: 'mommys-website',
      local: [{ src: 'art/worlds/phone-booth.jpg', cap: 'A pink phone booth above the clouds' }], extra: ['mommys', 'role-fairy'] },
    { name: 'AI Astra', kind: 'AI · VRChat', text: 'A bridge that brings an AI companion into VRChat, with her own desktop app and chatbox.', repo: 'the-astral-plane', local: [] },
    { name: 'DETOUR into VR', kind: 'Live · IRL + VR rave', text: 'Streaming DETOUR Mile 04, an IRL + VR rave, to TikTok LIVE from VRChat.', repo: 'detour-into-vr', local: [] },
  ];
  $('world-list').replaceChildren(...WORLDS.map((w) => {
    const pics = [...w.local, ...picturesOf(w.repo), ...(w.extra || []).flatMap(picturesOf)];
    const card = el('article', 'world');
    const shots = el('div', 'shots');
    if (!pics.length) shots.append(el('div', 'none', 'pictures coming · Flash Audit A55'));
    pics.slice(0, 3).forEach((p, i) => { const b = el('button'); b.setAttribute('aria-label', 'open picture: ' + p.cap); const im = el('img'); im.src = p.src; im.alt = p.cap; im.loading = 'lazy'; b.append(im); b.onclick = () => openGallery(pics, i, true); shots.append(b); });
    const info = el('div', 'info');
    info.append(el('div', 'tag', w.kind), el('b', null, w.name), el('p', null, w.text));
    const meta = el('div', 'muted mono'); meta.append(link('https://github.com/findastra/' + w.repo, null, w.repo + ' ↗'));
    if (pics.length > 3) meta.append(document.createTextNode(`  ·  ${pics.length} pictures`));
    info.append(meta); card.append(shots, info); return card;
  }));

  // ---------- projects: every repo ----------
  const GROUPS = [
    ['all', 'All'], ['worlds', 'Worlds & VR'], ['pets', 'Pets'], ['petos', "Astra's PetOS"], ['tools', 'Tools & sites'], ['roadmap', 'Roadmap'],
  ];
  const WORLD_REPOS = new Set(['astras-infinite-pole', 'piranesi-house', 'the-astral-plane', 'vrchat-ai-astra', 'detour-into-vr', 'mommys-website', 'role-fairy']);
  // vrchat-ai-astra was renamed the-astral-plane (2026-10-18); the pet list may still use the old name
  if (petByRepo['vrchat-ai-astra'] && !petByRepo['the-astral-plane']) petByRepo['the-astral-plane'] = petByRepo['vrchat-ai-astra'];
  const PETOS_REPOS = new Set(['astras-pet-os', 'startup-star', 'the-kennel', 'the-shed', 'vet-clinic', 'the-police-station', 'iron-gates', 'the-recovery-room', 'ai-doghouse', 'findastra']);
  const groupOf = (r) => {
    if (/^pet-program-\d+$/.test(r.name)) return 'roadmap';
    if (WORLD_REPOS.has(r.name)) return 'worlds';
    if (PETOS_REPOS.has(r.name)) return 'petos';
    const p = petByRepo[r.name];
    if (p && /registered|pipeline/.test(p.stage)) return 'pets';
    if (p && /seed|roadmap/.test(p.stage)) return 'roadmap';
    return 'tools';
  };
  let repos = [], group = 'all', query = '';
  const tabs = $('tabs');
  const renderTabs = () => tabs.replaceChildren(...GROUPS.map(([id, label]) => {
    const n = id === 'all' ? repos.length : repos.filter((r) => r.group === id).length;
    const b = el('button', null, label); b.append(el('span', null, String(n))); b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(id === group));
    b.onclick = () => { group = id; renderTabs(); renderProjects(); }; return b;
  }));
  const when = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };
  // Project windows are the only color on the page. Each repo keeps its color and tilt (hashed from its name).
  const COLORS = ['#ff3ea5', '#00e1ff', '#c6ff00', '#ff9500', '#c7a6ff', '#ffe500', '#ff5c5c', '#00f5a0', '#5ab0ff', '#ff8ef0'];
  const hash = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619); return h >>> 0; };
  const SVG = 'http://www.w3.org/2000/svg';
  const starShape = () => {
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'shape'); svg.setAttribute('viewBox', '-111 -116 229 220'); svg.setAttribute('aria-hidden', 'true');
    for (const cls of ['s-shadow', 's-line', 's-fill', 's-shine']) { const u = document.createElementNS(SVG, 'use'); u.setAttribute('href', '#star'); u.setAttribute('class', cls); svg.append(u); }
    return svg;
  };
  // repo names break after their hyphens instead of mid-word
  const nameNodes = (name) => name.split('-').flatMap((part, i, all) => [document.createTextNode(part + (i < all.length - 1 ? '-' : '')), ...(i < all.length - 1 ? [el('wbr')] : [])]);
  function card(r) {
    const c = el('article', 'card');
    const h = hash(r.name);
    c.style.setProperty('--c', COLORS[h % COLORS.length]);
    c.style.setProperty('--tilt', ((h >>> 8) % 9) - 4 + 'deg');
    const pics = picturesOf(r.name), pet = petByRepo[r.name];
    const repoUrl = 'https://github.com/findastra/' + r.name;
    let thumb;
    if (pics.length) {
      thumb = el('button', 'thumb'); thumb.setAttribute('aria-label', 'open pictures of ' + r.name);
      const im = el('img'); im.src = pics[0].src; im.alt = ''; im.loading = 'lazy'; thumb.append(im);
      if (pics.length > 1) thumb.append(el('span', 'count', pics.length + ' pictures'));
      thumb.onclick = () => openGallery(pics);
    } else if (iconOf(pet)) {
      thumb = el('div', 'thumb'); const im = el('img', 'pix'); im.src = iconOf(pet); im.alt = ''; im.loading = 'lazy'; thumb.append(im); thumb.style.cursor = 'default';
    } else {
      thumb = el('div', 'thumb empty', '{ }');
    }
    // top point: the pet (unless the window already shows it big), else a star
    const tip = el('div', 'tip');
    if (iconOf(pet) && pics.length) { const im = el('img'); im.src = iconOf(pet); im.alt = ''; im.loading = 'lazy'; tip.append(im); }
    else tip.textContent = '✦';
    const body = el('div', 'body');
    const name = link(r.homepage || repoUrl, 'name'); name.append(...nameNodes(r.name)); name.title = r.name; body.append(name);
    if (pet && pet.pet && !/^pet-program-\d+/.test(pet.pet)) body.append(el('div', 'pet', pet.pet + (pet.program ? ' · ' + pet.program : '')));
    const text = (r.description || (pet && pet.text) || 'No description yet.').replace(/^👉\s*\S+\s*[—-]\s*/, '');
    const desc = el('p', null, text); desc.title = text; body.append(desc);
    const meta = el('div', 'meta');
    meta.append(el('span', null, r.language || 'notes'), el('span', null, when(r.pushed_at)));
    body.append(meta);
    const win = el('div', 'win'); win.append(thumb, body);
    c.append(starShape(), tip, link(repoUrl, 'arm l', 'repo ↗'));
    if (r.homepage) c.append(link(r.homepage, 'arm r', 'site ↗'));
    c.append(win); return c;
  }
  function renderProjects() {
    const q = query.toLowerCase();
    const list = repos.filter((r) => (group === 'all' || r.group === group) && (!q || `${r.name} ${r.description} ${(petByRepo[r.name] || {}).pet || ''}`.toLowerCase().includes(q)));
    // pictures first, then newest
    list.sort((a, b) => (picturesOf(b.name).length > 0) - (picturesOf(a.name).length > 0) || String(b.pushed_at).localeCompare(String(a.pushed_at)));
    $('project-list').replaceChildren(...list.map(card));
    fillJar(list);
  }
  $('search').addEventListener('input', (e) => { query = e.target.value; if (query) showAll(true); renderProjects(); });

  // ---------- the star jar: every project in the current tab is a small star; shake it and one comes out ----------
  const jar = $('jar'), jarStars = $('jar-stars'), jarOut = $('jar-out'), stage = $('jar-stage');
  let inJar = [], outRepo = null, shaking = false;
  const miniStar = (cls, color) => {
    const svg = document.createElementNS(SVG, 'svg'); svg.setAttribute('class', cls); svg.setAttribute('viewBox', '-111 -116 229 220'); svg.setAttribute('aria-hidden', 'true');
    const u = document.createElementNS(SVG, 'use'); u.setAttribute('href', '#star'); svg.append(u); svg.style.setProperty('--c', color); return svg;
  };
  // seeded random, so the pile looks the same until the jar is shaken
  const rand = (seed) => () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9 >>> 0) / 4294967296);
  function fillJar(list) {
    inJar = list;
    const r = rand(list.length * 7919 + 17), n = list.length || 1;
    // Astra (2026-10-18): the stars fill the jar to the top, every one visible. Pick the column count that gives the
    // biggest stars while all n fit in the glass, then spread the rows over the whole height, bottom row first.
    const W = jarStars.clientWidth || 240, H = jarStars.clientHeight || 280;
    let cols = 1, cell = 0;
    for (let c = 2; c <= 24; c++) { const rows = Math.ceil(n / c), size = Math.min(W / c, H / rows); if (size > cell) { cell = size; cols = c; } }
    const rows = Math.ceil(n / cols), rowH = H / rows;
    const size = Math.min(48, cell * .98), edge = (size / 2 + 2) / W * 100, edgeY = (size / 2 + 2) / H * 100;
    jarStars.style.setProperty('--s', size + 'px');
    jarStars.replaceChildren(...list.map((repo, i) => {
      const m = miniStar('mini', COLORS[hash(repo.name) % COLORS.length]);
      const row = Math.floor(i / cols), col = i % cols, inRow = Math.min(cols, n - row * cols);
      const x = ((col + .5) / inRow) * 100 + (r() - .5) * (40 / cols);
      m.style.left = Math.min(100 - edge, Math.max(edge, x)) + '%';
      m.style.top = Math.min(100 - edgeY, Math.max(edgeY, ((H - (row + .5) * rowH + (r() - .5) * rowH * .2) / H) * 100)) + '%';
      m.style.setProperty('--r', Math.round(r() * 60 - 30) + 'deg');
      m.dataset.repo = repo.name;
      if (repo.name === outRepo) m.classList.add('gone');
      return m;
    }));
    $('jar-count').textContent = `${list.length} ${list.length === 1 ? 'star' : 'stars'} in the jar`;
  }
  new ResizeObserver(() => fillJar(inJar)).observe(jarStars);

  async function shake() {
    if (shaking || !inJar.length) return;
    shaking = true;
    const minis = [...jarStars.children];
    if (!reduced) {
      jar.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(9deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0)' }],
        { duration: 760, easing: 'ease-in-out' });
      for (const m of minis) {
        const base = `translate(-50%, -50%) rotate(${m.style.getPropertyValue('--r')})`, j = () => `translate(calc(-50% + ${Math.random() * 24 - 12}px), calc(-50% + ${Math.random() * -26}px)) rotate(${Math.random() * 120 - 60}deg)`;
        m.animate([{ transform: base }, { transform: j() }, { transform: j() }, { transform: base }], { duration: 760, easing: 'ease-in-out' });
      }
      await new Promise((ok) => setTimeout(ok, 640));
    }
    // a project with pictures comes out more often, and never the same one twice in a row
    const choices = inJar.filter((r) => r.name !== outRepo);
    const pool = choices.filter((r) => picturesOf(r.name).length && Math.random() < .65).length ? choices.filter((r) => picturesOf(r.name).length) : choices;
    const pick = (pool.length ? pool : inJar)[Math.floor(Math.random() * (pool.length || inJar.length))];
    const from = minis.find((m) => m.dataset.repo === pick.name);
    minis.forEach((m) => m.classList.toggle('gone', m === from));
    if (!reduced && from) await fly(from, pick);
    outRepo = pick.name;
    jarOut.replaceChildren(card(pick));
    shaking = false;
  }
  // the chosen star climbs out of the jar's mouth and lands where its window opens
  function fly(from, repo) {
    const st = stage.getBoundingClientRect(), a = from.getBoundingClientRect(), mouth = jar.getBoundingClientRect(), b = jarOut.getBoundingClientRect();
    const f = miniStar('flyer', COLORS[hash(repo.name) % COLORS.length]); f.style.setProperty('--s', a.width + 'px');
    f.style.left = a.left - st.left + 'px'; f.style.top = a.top - st.top + 'px'; stage.append(f);
    const at = (x, y, sc, rot) => `translate(${x}px, ${y}px) scale(${sc}) rotate(${rot}deg)`;
    const mx = mouth.left + mouth.width / 2 - a.left - a.width / 2, my = mouth.top - a.top - a.height;
    const ex = b.left + b.width / 2 - a.left - a.width / 2, ey = b.top + b.height / 2 - a.top - a.height / 2;
    return f.animate([
      { transform: at(0, 0, 1, 0) },
      { transform: at(mx, my, 1.3, 200), offset: .45 },
      { transform: at(ex, ey, 5, 400), opacity: .2 },
    ], { duration: 820, easing: 'cubic-bezier(.4, 0, .3, 1)' }).finished.then(() => f.remove());
  }
  jar.addEventListener('click', shake);
  $('shake').addEventListener('click', () => { shake(); listenForPhoneShake(); });
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
  // on a phone, shaking the phone shakes the jar (iPhone asks once, after the button is pressed)
  let listening = false, lastShake = 0;
  async function listenForPhoneShake() {
    if (listening || typeof DeviceMotionEvent === 'undefined' || !matchMedia('(pointer: coarse)').matches) return;
    try { if (typeof DeviceMotionEvent.requestPermission === 'function' && (await DeviceMotionEvent.requestPermission()) !== 'granted') return; } catch { return; }
    listening = true;
    addEventListener('devicemotion', (e) => {
      const g = e.acceleration || e.accelerationIncludingGravity; if (!g) return;
      const force = Math.hypot(g.x || 0, g.y || 0, g.z || 0) - (e.acceleration ? 0 : 9.8);
      if (force > 14 && Date.now() - lastShake > 1400) { lastShake = Date.now(); shake(); }
    });
  }
  // every project as a list of windows, for browsing all of them
  const showAll = (open) => { $('project-list').hidden = !open; $('show-all').setAttribute('aria-expanded', String(open)); $('show-all').textContent = open ? 'hide the list' : 'show every project'; };
  $('show-all').addEventListener('click', () => showAll($('project-list').hidden));
  const useRepos = (list, live) => {
    repos = list.filter((r) => r.name !== 'findastra.github.io').map((r) => ({ ...r, group: groupOf(r) }));
    const shots = Object.values(IMG).filter((r) => r.screenshot || (r.pages || []).length || r.images.length).length;
    $('project-source').textContent = `${live ? 'live from GitHub' : 'snapshot'} · ${repos.length} public repos · ${shots} with pictures so far`;
    renderTabs(); renderProjects(); ticks.repos(repos);
  };
  useRepos(S.repos || [], false);
  fetch('https://api.github.com/users/findastra/repos?per_page=100&sort=pushed')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => useRepos(d.filter((r) => !r.fork && !r.private).map((r) => ({ name: r.name, description: r.description || '', language: r.language || '', pushed_at: r.pushed_at, homepage: r.homepage || (r.has_pages ? `https://findastra.github.io/${r.name}/` : '') })), true))
    .catch(() => {});

  // ---------- pets: all of them ----------
  $('pet-list').replaceChildren(...PETS.map((p) => {
    const a = p.repo_exists ? link('https://github.com/findastra/' + p.repo, 'petcard') : el('div', 'petcard');
    if (p.icon) { const im = el('img'); im.src = 'art/icons/' + p.icon; im.alt = ''; im.loading = 'lazy'; a.append(im); }
    else a.append(el('div', 'ph', '?'));
    a.append(el('span', null, '#' + p.number), el('b', null, p.pet), el('span', null, p.program || 'program not named yet'), el('span', 'st', p.stage));
    a.title = p.text; return a;
  }));

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
