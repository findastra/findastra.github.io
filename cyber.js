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

  // ---------- pictures for a repo: site screenshot first, then the best committed pictures ----------
  const picturesOf = (repo) => {
    const m = IMG[repo];
    if (!m) return [];
    const list = [];
    if (m.screenshot) list.push({ src: 'art/projects/' + m.screenshot, cap: repo + ' · live site' });
    for (const pg of m.pages || []) {
      if (m.homepage && pg.source === m.homepage) continue; // same page as the site screenshot
      const cap = /system-map/.test(pg.source) ? 'System Map (3D PFD)' : 'program page';
      list.push({ src: 'art/projects/' + pg.file, cap: repo + ' · ' + cap });
    }
    for (const i of m.images || []) list.push({ src: i.url, cap: repo + ' · ' + i.path });
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

  // ---------- worlds ----------
  const WORLDS = [
    { name: "Astra's Infinite Pole", kind: 'VRChat world · PC VR / desktop', text: 'My VRChat world, full of magical effects. Unity source and every published version are on GitHub.', repo: 'astras-infinite-pole',
      local: [{ src: 'art/worlds/infinite-pole-spawn.jpg', cap: "Astra's Infinite Pole · the spawn" }] },
    { name: 'Piranesi House', kind: 'VRChat world · in progress', text: "Inspired by Susanna Clarke's Piranesi: an endless House of statues, tides and light, with islands, boats and a colossus you can sit in.", repo: 'piranesi-house', local: [] },
    { name: "Mommy's", kind: 'VRChat club · dance & avatar academy', text: 'A VRChat rave house, dance and avatar academy, with its own world, classes, events and Discord.', repo: 'mommys-website',
      local: [{ src: 'art/worlds/phone-booth.jpg', cap: 'A pink phone booth above the clouds' }], extra: ['mommys', 'role-fairy'] },
    { name: 'AI Astra', kind: 'AI · VRChat', text: 'A bridge that brings an AI companion into VRChat, with her own desktop app and chatbox.', repo: 'vrchat-ai-astra', local: [] },
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
  const WORLD_REPOS = new Set(['astras-infinite-pole', 'piranesi-house', 'vrchat-ai-astra', 'detour-into-vr', 'mommys-website', 'role-fairy']);
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
  }
  $('search').addEventListener('input', (e) => { query = e.target.value; renderProjects(); });
  const useRepos = (list, live) => {
    repos = list.filter((r) => r.name !== 'findastra.github.io').map((r) => ({ ...r, group: groupOf(r) }));
    const shots = Object.values(IMG).filter((r) => r.screenshot || (r.pages || []).length || r.images.length).length;
    $('project-source').textContent = `${live ? 'live from GitHub' : 'snapshot'} · ${repos.length} public repos · ${shots} with pictures so far`;
    renderTabs(); renderProjects();
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
