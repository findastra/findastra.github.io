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

  // ---------- projects, in four chapters read top to bottom like the GitHub profile README (Astra, 2026-10-27, replacing the
  // star jars): worlds (ringed planets), avatars (arched mirrors), Astra's PetOS (fat stars) and everything else (clouds) ----------
  // Worlds in the profile README's order and words (findastra/findastra README, "VR & VRChat").
  const WORLDS = [
    { name: "Astra's Infinite Pole", kind: 'VRChat world · PC VR / desktop', text: 'An infinite pole, a spiral staircase, phone booths that can talk to each other no matter how far down you fall, and tons of glitter too.', repo: 'astras-infinite-pole',
      local: [{ src: 'art/worlds/infinite-pole-spawn.jpg', cap: "Astra's Infinite Pole · the spawn" }] },
    { name: 'Piranesi House', kind: 'VRChat world · PC VR / desktop', text: "Inspired by Susanna Clarke's Piranesi: an endless labyrinth of marble statues on an island, with a tide that rises and falls, a colossus you can sit in, and a very special developers' easter egg.", repo: 'piranesi-house', local: [] },
    { name: 'Liminal Doors', kind: 'VRChat world · PC VR / desktop', text: 'Doors that open onto quiet in-between places: an empty pool after closing, a laundrette with a sky turning in one washer, a platform between trains. Every door hides a unique crystal animal.', repo: 'liminal-doors', local: [] },
    { name: "Mommy's World", kind: 'VRChat world · PC VR / desktop', text: "The VRChat home of Mommy's Rave House, Dance & Avatar Academy.", repo: 'mommys-world',
      local: [{ src: 'art/worlds/phone-booth.jpg', cap: 'A pink phone booth above the clouds' }], extra: ['mommys-website', 'mommys', 'role-fairy'] },
    { name: 'The Rainbow Maker', kind: 'VRChat world · PC VR / desktop', text: 'The mechanics of the Kikkerland Rainbow Maker: watch its tiny gear train turn and spin a crystal that refracts rainbows across the room.', repo: 'the-rainbow-maker', local: [] },
    { name: 'The Cooling Tower', kind: 'VRChat world · PC VR / desktop', text: "A rave world inside a nuclear plant's cooling tower: break into the facility and power it up with music. The Stack, the Turbine Hall, then the Reactor Hall.", repo: 'the-cooling-tower', local: [] },
    { name: 'DETOUR into VR', kind: 'Live · IRL + VR rave', text: 'Streaming DETOUR Mile 04, an IRL + VR rave, to TikTok LIVE from VRChat.', repo: 'detour-into-vr', local: [] },
  ];
  // Avatars: a starting list from the repos and Mommy's website, for Astra to check (2026-10-27).
  const AVATARS = [
    { name: "Astra's avatar", kind: 'VRChat avatar', text: 'The one in the portrait up top.', pic: 'art/avatar.jpg', href: '#top' },
    { name: 'Poppy', kind: 'VRChat avatar', text: 'Version guide and release records for the Poppy avatar.', repo: 'poppy' },
    { name: 'Dubstep Armory', kind: 'Avatar effects', text: 'A catalog site for avatar gun effects and loadouts.', repo: 'dubstep-armory' },
    { name: "Mommy's Avatar Academy", kind: 'Workshops', text: 'Avatar editing classes at Mommy\'s: sparkles, clothing material swaps, outfit rigging.', repo: 'mommys-website' },
    { name: 'Avatar lab', kind: 'Play', text: 'Build a chibi look in the arcade, the same lab as on Mommy\'s website.', href: '#arcade' },
  ];
  // vrchat-ai-astra was renamed the-astral-plane (2026-10-18); the pet list may still use the old name
  const RENAMED = { 'vrchat-ai-astra': 'the-astral-plane' };
  if (petByRepo['vrchat-ai-astra'] && !petByRepo['the-astral-plane']) petByRepo['the-astral-plane'] = petByRepo['vrchat-ai-astra'];
  // Repos shown as a world or avatar get no cloud. PetOS's own building blocks get no card either (Astra, 2026-10-18); the
  // ones that are pets still show in the PetOS chapter.
  const WORLD_REPOS = new Set(['astras-infinite-pole', 'piranesi-house', 'liminal-doors', 'mommys-world', 'the-rainbow-maker', 'the-cooling-tower', 'detour-into-vr', 'mommys-website', 'role-fairy', 'poppy', 'dubstep-armory']);
  const PETOS_REPOS = new Set(['astras-pet-os', 'startup-star', 'the-kennel', 'the-shed', 'vet-clinic', 'the-police-station', 'iron-gates', 'the-recovery-room', 'ai-doghouse', 'findastra']);
  // Everything else, grouped the way the profile README groups it
  const GROUPS = [['Discord', new Set(['moodglass', 'findastra-discord-presence', 'openai-discord-presence', 'anthropic-discord-presence'])], ['Web & more', null]];
  const isOther = (r) => !/^pet-program-\d+$/.test(r.name) && !WORLD_REPOS.has(r.name) && !PETOS_REPOS.has(r.name) && !petByRepo[r.name];
  let repos = [], byName = {}, query = '';
  const when = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };
  // Clouds, planets, mirrors and stars are the only color on the page. Each keeps its color and tilt (hashed from its name).
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
  // a repo link only when the repo is public (private ones would 404 for visitors)
  const repoLink = (repo, text) => (byName[repo] ? link('https://github.com/findastra/' + repo, null, text || repo + ' ↗') : null);

  // ---------- clouds: projects that are neither a pet, a world, an avatar nor PetOS itself ----------
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
    const meta = el('div', 'meta'); const rl = repoLink(w.repo); if (rl) meta.append(rl);
    if (pics.length > 1) meta.append(el('span', null, pics.length + ' pictures'));
    info.append(meta); c.append(sky, info); return c;
  }

  // ---------- mirrors: an arched window per avatar ----------
  function mirror(a) {
    const c = el('article', 'mirror'); const h = paint(c, a.name);
    const pics = a.pic ? [{ src: a.pic, cap: a.name }] : picturesOf(a.repo || '');
    const glass = el(pics.length ? 'button' : 'div', 'glass');
    if (pics.length) {
      glass.setAttribute('aria-label', 'open pictures of ' + a.name);
      const im = el('img'); im.src = pics[0].src; im.alt = ''; im.loading = 'lazy'; glass.append(im);
      glass.onclick = () => openGallery(pics);
    } else glass.append(el('span', 'none', '✦'));
    const info = el('div', 'info');
    info.append(el('div', 'tag', a.kind), el('b', null, a.name), el('p', null, a.text));
    const meta = el('div', 'meta');
    const rl = a.repo && repoLink(a.repo); if (rl) meta.append(rl);
    if (a.href) { const go = el('a', null, a.href === '#arcade' ? 'play ↓' : 'see ↑'); go.href = a.href; meta.append(go); }
    info.append(meta); c.append(sparkles(h, 5), glass, info); return c;
  }

  // ---------- stars: every pet, with its repo's pictures and links when the repo is public ----------
  // A private pet has no repo to link, but its pictures are copies on this site (its project-images.js entry says
  // private), so they still show (Astra, 2026-10-20, after making most repos private: "copy the pictures into the website").
  const petEntry = (p) => {
    const name = byName[p.repo] ? p.repo : RENAMED[p.repo]; const r = byName[name];
    const own = r ? r.name : [p.repo, name].find((n) => n && IMG[n] && IMG[n].private);
    return { p, r, pics: own ? picturesOf(own) : [] };
  };
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
  // a small star per pet, with its picture in the middle; picking one opens its full star window above the list
  const rand = (seed) => () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9 >>> 0) / 4294967296);
  const PETS_FIRST = 24; let petsAll = false, pickedPet = null;
  function petTile(e) {
    const key = 'pet-' + e.p.number, b = el('button', 'pet-tile'); paint(b, e.r ? e.r.name : e.p.pet);
    b.setAttribute('aria-pressed', String(pickedPet === key));
    const s = svgEl('svg', { viewBox: '-111 -116 229 220', 'aria-hidden': 'true' }); s.append(svgEl('use', { href: '#star' }));
    const face = el('span', 'face');
    if (e.p.icon) { const im = el('img'); im.src = 'art/icons/' + e.p.icon; im.alt = ''; im.loading = 'lazy'; face.append(im); } else face.textContent = '✦';
    b.append(s, face, el('span', 'label', e.p.pet));
    b.onclick = () => {
      pickedPet = key;
      for (const t of $('pet-list').children) t.setAttribute('aria-pressed', String(t === b));
      $('pet-pick').replaceChildren(star(e));
      if ($('pet-pick').getBoundingClientRect().top < 0) $('pet-pick').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    };
    return b;
  }

  function render() {
    $('world-list').replaceChildren(...WORLDS.filter((w) => shown(`${w.name} ${w.kind} ${w.text} ${w.repo}`)).map(planet));
    $('avatar-list').replaceChildren(...AVATARS.filter((a) => shown(`${a.name} ${a.kind} ${a.text} ${a.repo || ''}`)).map(mirror));
    // pets with pictures first, then the ones with a public repo, then by number
    const pets = PETS.map(petEntry).filter(({ p, r }) => shown(`${p.pet} ${p.program} ${p.text} ${p.repo} ${(r && r.description) || ''}`))
      .sort((a, b) => (b.pics.length > 0) - (a.pics.length > 0) || (b.r ? 1 : 0) - (a.r ? 1 : 0) || a.p.number - b.p.number);
    const all = petsAll || query;
    $('pet-list').replaceChildren(...(all ? pets : pets.slice(0, PETS_FIRST)).map(petTile));
    const more = $('pets-more'); more.hidden = !!query || pets.length <= PETS_FIRST;
    more.textContent = petsAll ? 'show fewer pets' : `show all ${pets.length} pets`; more.setAttribute('aria-expanded', String(!!petsAll));
    if (!pickedPet && pets.length) $('pet-pick').replaceChildren(star(pets[0])), (pickedPet = 'pet-' + pets[0].p.number), $('pet-list').firstChild.setAttribute('aria-pressed', 'true');
    // everything else, in the README's groups
    const others = repos.filter(isOther).filter((r) => shown(`${r.name} ${r.description}`)).sort((a, b) => String(b.pushed_at).localeCompare(String(a.pushed_at)));
    $('extra-list').replaceChildren(...GROUPS.map(([title, names]) => {
      const list = others.filter((r) => (names ? names.has(r.name) : !GROUPS.some(([, n]) => n && n.has(r.name))));
      if (!list.length) return null;
      const g = el('section', 'extra-group'); const sky = el('div', 'sky'); sky.append(...list.map(cloud));
      g.append(el('h4', null, '### ' + title), sky); return g;
    }).filter(Boolean));
    for (const ch of document.querySelectorAll('.chapter')) ch.classList.toggle('empty', !!query && !ch.querySelector('.planet, .mirror, .pet-tile, .cloud'));
  }
  $('pets-more').addEventListener('click', () => { petsAll = !petsAll; render(); });
  $('search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); render(); });
  const useRepos = (list, live) => {
    repos = list.filter((r) => r.name !== 'findastra.github.io'); byName = Object.fromEntries(repos.map((r) => [r.name, r]));
    const shots = Object.values(IMG).filter((r) => r.screenshot || (r.pages || []).length || r.images.length).length;
    $('project-source').textContent = `${live ? 'live from GitHub' : 'snapshot'} · ${repos.length} public repos · ${WORLDS.length} worlds · ${PETS.length} pets · ${shots} with pictures so far`;
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
