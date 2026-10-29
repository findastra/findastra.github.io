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
  // Pets and their pictures live in the hub only (findastra/astras-pet-os). Pictures load from art/latest, the addresses
  // that never change (Astra, 2026-10-24). The hub's index of that folder and its pet list are read live, so a new pet or a
  // new icon shows here by itself; pets-data.js is the snapshot for when GitHub does not answer.
  const HUB = 'https://raw.githubusercontent.com/findastra/astras-pet-os/main/', LATEST = HUB + 'art/latest/';
  let pets = PETS, hosted = null; // hosted: every path under art/latest, once the hub's index answers
  // from the hub's pets.json: each pet's art folder name (Data Chip draws as "chip") and its own live website
  let artByRepo = {}, liveSiteByRepo = {}, pageByRepo = null;
  const PAGES = 'https://findastra.github.io/astras-pet-os/apps/pet-programs/';
  const slug = (s) => String(s || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // a pet's picture: its newest drawing (desktop art, the one its pet program page shows, then its mood and web frames),
  // found by art name, repo or pet name; else its repo's small app icon (Astra, 2026-10-27: "the stars need updated art")
  const iconOf = (p) => {
    if (!p) return null;
    if (!hosted) return p.icon ? LATEST + p.icon : null;
    const names = [...new Set([artByRepo[p.repo], p.repo, slug(p.pet)].filter(Boolean))];
    const hit = names.flatMap((n) => ['desktop-art/' + n + '/idle.png', 'moods/' + n + '/idle.png', 'frames/' + n + '/idle.png'])
      .concat(names.map((n) => 'icons/' + n + '.png')).find((t) => hosted.has(t));
    return hit ? LATEST + hit : null;
  };
  // a pet's website: its own live site, else its pet program page on the hub's GitHub Pages, else its public repo's site
  const siteOf = (p, r) => liveSiteByRepo[p.repo] || (pageByRepo ? pageByRepo[p.repo] && PAGES + pageByRepo[p.repo] : p.site) || (r && r.homepage) || null;
  // the hub's pet-programs.json, in pets-data.js's shape (a program with no pet named yet is left out)
  const livePets = (j) => (j.programs || []).filter((p) => p.icon).map((p) => ({ number: p.number, pet: p.icon, program: p.program, stage: p.stage,
    repo: p.repo, repo_exists: p.repo_exists, text: (p.mini_descriptor && p.mini_descriptor.text) || '' }));

  // ---------- pictures for a repo: the repo's own committed pictures first, then a live-site screenshot ----------
  // Program-page screenshots fill in only until the repo commits its own docs/images (A55); after that they repeat them.
  const picturesOf = (repo) => {
    const m = IMG[repo];
    if (!m) return [];
    const list = [];
    const committed = m.images || [];
    // still pictures before GIFs: the GIFs are small animations and look blurry blown up (Astra, 2026-10-27)
    for (const i of [...committed].sort((x, y) => /\.gif$/i.test(x.path) - /\.gif$/i.test(y.path))) list.push({ src: i.url, cap: repo + ' · ' + i.path });
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
    await type(`${repos.length || ''} projects · ${pets.length} pets · worlds below. scroll.`, 'dim', 8);
    $('unmask').textContent = 'unmasked ✓';
  };
  boot();
  // the line to type into: a few commands, the rest answered like a real shell would (Astra, 2026-10-27)
  const SECTIONS = { vr: 'vr', discord: 'discord', web: 'web', petos: 'pets', pets: 'pets', arcade: 'arcade', contact: 'contact', top: 'top' };
  const who = () => (unmasked ? 'astra' : 'audra');
  const go = (id) => $(id) && $(id).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  const COMMANDS = {
    help: () => 'try: whoami · ls · cd <vr|discord|web|petos|arcade|contact> · find /astra · sudo unmask · rabbit · date · clear',
    whoami: () => who(),
    ls: () => 'vr/  discord/  web/  petos/  arcade/  contact/',
    pwd: () => '/home/' + who(),
    date: () => new Date().toString(),
    rabbit: () => 'follow the white rabbit. it hops along the bar below. catch it.',
    'find /astra': () => '/astra/vr  /astra/discord  /astra/web  /astra/petos  /astra/arcade  · found ' + (repos.length || 'many') + ' projects',
    'sudo unmask': () => { if (unmasked) return 'already unmasked.'; $('unmask').click(); return ''; },
    play: () => { go('arcade'); return 'cd arcade'; },
    clear: () => { term.replaceChildren(); return ''; },
  };
  $('term-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = $('term-in').value.trim(); $('term-in').value = '';
    if (!raw) return;
    line(`${who()}@findastra:~$ ${raw}`, 'ok');
    const cmd = raw.toLowerCase().replace(/\s+/g, ' ');
    let out;
    if (COMMANDS[cmd]) out = COMMANDS[cmd]();
    else if (/^cd\s+/.test(cmd)) { const to = SECTIONS[cmd.slice(3).replace(/[\/.~]/g, '')]; out = to ? (go(to), '') : `cd: ${raw.slice(3)}: no such section`; }
    else if (/^echo\s+/.test(cmd)) out = raw.slice(5);
    else out = `${raw.split(' ')[0]}: command not found. try help`;
    if (out) line(out, 'dim');
    $('term-prompt').textContent = `${who()}@findastra:~$`;
    term.scrollTop = term.scrollHeight;
  });


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
    // each item in its own color on the black and gray bars (Astra, 2026-10-27: "different colors for each item"), the same
    // color every time for the same project
    const tint = (s, name) => { let h = 7; for (const ch of String(name)) h = (h * 31 + ch.codePointAt(0)) % 360; s.style.setProperty('--c', `hsl(${h} 100% 66%)`); return s; };
    function fill(id, makers) {
      const box = $(id), track = box.querySelector('.track');
      box.hidden = !makers.length;
      const copy = (hidden) => { const s = el('span'); if (hidden) s.setAttribute('aria-hidden', 'true'); s.append(...makers.map((m) => m(hidden))); return s; };
      track.replaceChildren(copy(false), copy(true));
      track.style.setProperty('--dur', Math.max(45, track.textContent.length * .11) + 's');
    }
    function draw() {
      fill('tick-updates', updates.slice(0, 22).map((u) => (hidden) => {
        const s = tint(el('span', 'item'), u.repos.join('+'));
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
        const s = tint(el('span', 'item'), name), r = info[name] || {}, pet = petByRepo[name];
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

  // ---------- projects, in the GitHub profile README's groups read top to bottom (Astra, 2026-10-27): VR & VRChat, Discord,
  // Web & More, all as Polaroids with their names written on the white border, then Astra's PetOS as the star jar ----------
  // VR & VRChat: her six worlds, in the profile README's words (findastra/findastra README). DETOUR into VR is in the
  // README's VR group but is not a world, so it is left out here (Astra: "there should be only like 6 worlds").
  const LD = 'https://raw.githubusercontent.com/findastra/liminal-doors/main/concept-art/floors/';
  const RM = 'https://raw.githubusercontent.com/findastra/the-rainbow-maker/main/Art/rainbow-maker/';
  const WORLDS = [
    { name: "Astra's Infinite Pole", ownPicsOnly: true, kind: 'VRChat world · PC VR / desktop', text: 'An infinite pole, a spiral staircase, phone booths that can talk to each other no matter how far down you fall, and tons of glitter too.', repo: 'astras-infinite-pole',
      local: [{ src: 'art/worlds/infinite-pole-spawn.jpg', cap: "Astra's Infinite Pole · the spawn" }] },
    { name: 'Piranesi House', kind: 'VRChat world · PC VR / desktop', text: "Inspired by Susanna Clarke's Piranesi: an endless labyrinth of marble statues on an island, with a tide that rises and falls, a colossus you can sit in, and a very special developers' easter egg.", repo: 'piranesi-house', local: [] },
    // the pictures each world has so far (Astra, 2026-10-27); proper captures from the worlds come later
    { name: 'Liminal Doors', kind: 'VRChat world · PC VR / desktop', text: 'Doors that open onto quiet in-between places: an empty pool after closing, a laundrette with a sky turning in one washer, a platform between trains. Every door hides a unique crystal animal.', repo: 'liminal-doors', local: [ // all of its floors, the hummingbird's first (Astra, 2026-10-27)
      '09-hummingbird-upside-down-conservatory-20261015', '01-fox-pinkscape-20261020', '02-hare-faraway-field-20261015', '03-axolotl-pool-after-closing-20261015',
      '04-raccoon-last-laundrette-20261015', '05-gecko-apricot-underpass-20261015', '06-crane-platform-between-trains-20261015', '07-moth-velvet-waiting-room-20261015',
      '08-frog-rain-that-misses-you-20261015', '10-ibex-salt-moon-20261015', '11-cat-motel-without-rooms-20261015', '12-manta-ray-tidal-carpet-20261015',
      '13-hedgehog-vending-machine-clearing-20261015', '14-lynx-lavender-quarry-20261015', '15-seahorse-empty-aquarium-20261015', '16-heron-blackwater-footbridge-20261015',
      '17-dragonfly-soft-staircase-20261015', '18-snow-leopard-snow-in-the-lobby-20261015', '19-raven-pearl-car-park-20261015', '20-octopus-room-beneath-the-ocean-20261015',
      '21-deer-wind-telephone-20261015', '22-firefly-sleeping-arcade-20261015', '23-kangaroo-low-gravity-court-20261015', '24-scarab-ribbon-dunes-20261015',
      '25-praying-mantis-frosted-office-20261015', '26-flamingo-red-sun-reservoir-20261015', '27-jellyfish-room-of-curtains-20261015', '28-butterfly-glass-orchard-20261015',
      '29-red-panda-midnight-food-court-20261015', '30-swan-door-at-sunrise-20261015', '31-otter-steam-between-stars-20261015', '32-sandpiper-sunset-sandbar-20261015',
      '33-dolphin-aquaglass-concourse-20261015', '36-kingfisher-blue-sky-terminal-20261015']
      .map((f) => ({ src: LD + f + '.png', label: 'concept art', cap: 'Liminal Doors · ' + f.replace(/^\d+-/, '').replace(/-\d{8}$/, '').replace(/-/g, ' ') })) },
    { name: "Mommy's World", kind: 'VRChat world · PC VR / desktop', text: "The VRChat home of Mommy's Rave House, Dance & Avatar Academy.", repo: 'mommys-world',
      local: [{ src: 'art/worlds/phone-booth.jpg', label: 'concept art', cap: 'A pink phone booth above the clouds' }], extra: ['mommys', 'role-fairy'] },
    { name: 'The Rainbow Maker', kind: 'VRChat world · PC VR / desktop', text: 'The mechanics of the Kikkerland Rainbow Maker: watch its tiny gear train turn and spin a crystal that refracts rainbows across the room.', repo: 'the-rainbow-maker', local: [
      { src: RM + 'rainbow-maker-preview-20261022.mp4', cap: 'The Rainbow Maker · turning', type: 'video', fit: 'contain', bg: '#45444a' },
      { src: RM + 'rainbow-maker-still-20261022.png', cap: 'The Rainbow Maker', fit: 'contain', bg: '#45444a' }, { src: RM + 'rainbow-maker-crystals-cycles-20261023.png', cap: 'The Rainbow Maker · the crystals', fit: 'contain', bg: '#47423f' }] },
    { name: 'The Cooling Tower', siteLabel: 'see full mini model ↗', kind: 'VRChat world · PC VR / desktop', text: "A rave world inside a nuclear plant's cooling tower: break into the facility and power it up with music. The Stack, the Turbine Hall, then the Reactor Hall.", repo: 'the-cooling-tower', local: [{ src: 'https://findastra.github.io/the-cooling-tower/mini-model/the-cooling-tower-mini-model-20261024.html', cap: 'The Cooling Tower · Mini Model', type: 'frame', label: 'concept model', bare: true }] },
  ];
  // vrchat-ai-astra was renamed the-astral-plane (2026-10-18); the pet list may still use the old name
  const RENAMED = { 'vrchat-ai-astra': 'the-astral-plane' };
  if (petByRepo['vrchat-ai-astra'] && !petByRepo['the-astral-plane']) petByRepo['the-astral-plane'] = petByRepo['vrchat-ai-astra'];
  // Repos shown as a world (and the avatar ones, with no chapter now) get no Polaroid of their own. PetOS's own building blocks get none either (Astra,
  // 2026-10-18); the ones that are pets are in the jar.
  const WORLD_REPOS = new Set(['astras-infinite-pole', 'piranesi-house', 'liminal-doors', 'mommys-world', 'the-rainbow-maker', 'the-cooling-tower', 'detour-into-vr', 'role-fairy', 'poppy', 'dubstep-armory']);
  const PETOS_REPOS = new Set(['astras-pet-os', 'startup-star', 'the-kennel', 'the-shed', 'vet-clinic', 'the-police-station', 'iron-gates', 'the-recovery-room', 'ai-doghouse', 'findastra']);
  // The rest, in the profile README's groups: Discord by name, Web & More is everything else
  const DISCORD = new Set(['moodglass', 'ai-discord-presence', 'openai-discord-presence', 'anthropic-discord-presence']);
  // the Star Window is the Photo Star now, so only the Photo Star gets a Polaroid (Astra, 2026-10-27)
  const HIDDEN = new Set(['astras-star-window']);
  const isOther = (r) => !/^pet-program-\d+$/.test(r.name) && !WORLD_REPOS.has(r.name) && !PETOS_REPOS.has(r.name) && !petByRepo[r.name] && !HIDDEN.has(r.name);
  let repos = [], byName = {}, query = '';
  const when = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };
  // The Polaroids' tape, the stars and their sparkles are the only color on the page. Each keeps its color and tilt (hashed from its name).
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
  const cleanText = (t) => t.replace(/^👉\s*\S+\s*[—-]\s*/, '');
  const shown = (text) => !query || text.toLowerCase().includes(query);

  // ---------- Polaroids: the picture on top, what it is written in marker on the white border below ----------
  // With no picture yet, the photo is still developing: a dark square glowing in the Polaroid's own color.
  // Everything about a project is on the Polaroid (Astra, 2026-10-27): its name (a link to the repo), its code and the date it
  // last changed, written in marker on the white border, with little repo and site tags under them; under it, the
  // repo's own GitHub description.
  // the GitHub descriptions under the Polaroids are off for now (Astra, 2026-10-27: "just get rid of those descriptions ... I might
  // want to bring them back"); true brings them back
  const SHOW_DESCRIPTIONS = false;
  function polaroid({ key, name, kind, date, text, pics, repo, site, siteLabel, shot, sticky }) {
    const c = el('article', 'polaroid'); const h = paint(c, key);
    const photo = el(pics.length && !shot && !pics.some((p) => p.type === 'frame') ? 'button' : 'div', 'photo');
    if (shot) photo.append(shot);
    else if (!pics.length) photo.append(el('span', 'developing', 'still developing…'));
    let flip = null, count = null;
    if (!shot && pics.length) {
      let at = 0;
      // each picture can also be a video (plays by itself, muted, on a loop) or a live page you can move around in
      const media = (p) => {
        if (p.type === 'video') { const v = el('video'); Object.assign(v, { src: p.src, muted: true, loop: true, autoplay: !reduced, playsInline: true, preload: 'metadata' }); if (p.fit) v.style.objectFit = p.fit; if (p.bg) v.style.background = p.bg; return v; }
        // a live page starts once the Polaroid scrolls near (the browser's own lazy loading never starts it inside the scaled frame)
        // a bare page is cropped to its picture (Astra, 2026-10-27: the Mini Model without its title and key); on the live site it
        // shares this site's address, so its panel is hidden outright too
        if (p.type === 'frame') {
          const f = el('iframe', p.bare ? 'live bare' : 'live'); f.title = p.cap;
          if (p.bare) f.addEventListener('load', () => { try { const st = f.contentDocument.createElement('style'); st.textContent = '.panel{display:none!important}'; f.contentDocument.head.append(st); } catch {} });
          new IntersectionObserver((seen, io) => { if (seen.some((s) => s.isIntersecting)) { f.src = p.src; io.disconnect(); } }, { rootMargin: '400px' }).observe(photo); return f;
        }
        const im = el('img'); im.src = p.src; im.alt = ''; im.loading = 'lazy'; if (p.fit) im.style.objectFit = p.fit; if (p.bg) im.style.background = p.bg; return im;
      };
      // what a picture is, written at its top (Astra, 2026-10-27: "wherever it's concept art, it says concept art")
      const badge = el('span', 'badge'); badge.hidden = !pics[0].label; badge.textContent = pics[0].label || '';
      let shown = media(pics[0]); photo.append(shown, badge);
      const still = () => !pics[at].type;
      photo.setAttribute('aria-label', 'open pictures of ' + name);
      photo.onclick = (e) => { if (still()) openGallery(pics.filter((p) => !p.type), pics.filter((p) => !p.type).indexOf(pics[at])); };
      // more than one picture: two small arrows in the white border's bottom corners flip through them (Astra, 2026-10-27)
      if (pics.length > 1) {
        count = el('span', 'count', `1 of ${pics.length}`);
        const go = (d) => { at = (at + d + pics.length) % pics.length; const next = media(pics[at]); shown.replaceWith(next); shown = next; if (sticky) sticky(at, note2); badge.hidden = !pics[at].label; badge.textContent = pics[at].label || ''; count.textContent = `${at + 1} of ${pics.length}`; };
        flip = ['‹', '›'].map((t, i) => { const b = el('button', 'flip ' + (i ? 'next' : 'prev'), t); b.type = 'button'; b.setAttribute('aria-label', (i ? 'next' : 'previous') + ' picture of ' + name); b.onclick = () => go(i ? 1 : -1); return b; });
      }
    }
    const title = repo || site ? link(repo || site, 'title', name) : el('b', 'title', name);
    const note = el('div', 'note'), tags = el('div', 'tags');
    if (site) tags.append(link(site, null, siteLabel || 'site ↗'));
    if (count) tags.prepend(count);
    note.append(title, el('span', 'kind', [kind, date].filter(Boolean).join(' · ')), tags);
    const frame = el('div', 'frame'); frame.append(el('i', 'tape'), photo, note, ...(flip || []));
    const info = el('div', 'info');
    if (text && SHOW_DESCRIPTIONS) { const p = el('p', null, text); p.title = text; info.append(p); }
    let note2 = null;
    if (sticky) { note2 = el('div', 'sticky'); sticky(0, note2); frame.append(note2); }
    c.append(sparkles(h, 5), frame, info); return c;
  }
  const worldPics = (w) => [...w.local, ...(w.ownPicsOnly ? [] : picturesOf(w.repo)), ...(w.extra || []).flatMap(picturesOf)];
  // a world: its repo (when public) gives the link, date and description; the README's words when it is private
  const worldCard = (w) => {
    const r = byName[w.repo];
    return polaroid({ key: w.repo, name: w.name, kind: w.kind.replace(' · PC VR / desktop', ''), date: r ? when(r.pushed_at) : '', text: cleanText((r && r.description) || w.text), pics: worldPics(w),
      repo: r ? 'https://github.com/findastra/' + w.repo : null, site: r && r.homepage, siteLabel: w.siteLabel });
  };
  // Moodglass's picture (Astra, 2026-10-27): a staggered collage the way Moodglass lays photos behind a chat, edge to edge
  // with soft seams, of Liminal Doors' most planted floors, the hummingbird's conservatory biggest
  const moodglassShot = () => {
    const box = el('div', 'mg-shot');
    box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'Moodglass: a staggered collage of Liminal Doors pictures, the way it fills a Discord chat');
    const cols = [['09-hummingbird-upside-down-conservatory-20261015', '13-hedgehog-vending-machine-clearing-20261015'],
      ['28-butterfly-glass-orchard-20261015', '02-hare-faraway-field-20261015'],
      ['33-dolphin-aquaglass-concourse-20261015', '31-otter-steam-between-stars-20261015']];
    const split = [[62, 38], [40, 60], [55, 45]];
    cols.forEach((list, ci) => {
      const col = el('div', 'mg-col');
      list.forEach((f, k) => { const im = el('img'); im.src = LD + f + '.png'; im.alt = ''; im.loading = 'lazy'; im.style.flexBasis = split[ci][k] + '%'; col.append(im); });
      box.append(col);
    });
    return box;
  };
  // Discord and Web & More: the repo name, written out with spaces, and its language
  // what each website looks like (Astra, 2026-10-27): its own page, shown first on its Polaroid
  const SITE_PICS = {
    'fuzzboi-factory': [{ src: 'art/projects/fuzzboi-factory-site-20261027.jpg', cap: 'The Fuzzboi Factory', fit: 'contain', bg: '#121a6b' }],
    'mommys-website': [{ src: 'art/projects/mommys-website-site-20261027.jpg', cap: "Mommy's: the twins and the windows", fit: 'contain', bg: '#1a0612' }],
    'astras-photostar': [{ src: 'https://findastra.github.io/astras-star-window/star-window.svg', cap: "Astra's Photo Star", fit: 'contain', bg: '#ffffff' }],
    // the live sign, saying what it is (its ?message= link option is a Pocket Message Board change waiting for Astra's OK)
    'pocket-message-board': [{ src: 'https://findastra.github.io/pocket-message-board/?message=' + encodeURIComponent('This is a Pocket Message Board. Check it out!') + '&size=1', cap: 'Pocket Message Board', type: 'frame' }],
  };
  const NAMES = { 'astras-photostar': "Astra's Photo Star" };
  const extraCard = (r) => {
    const repoUrl = 'https://github.com/findastra/' + r.name;
    return polaroid({ key: r.name, shot: r.name === 'moodglass' ? moodglassShot() : null, name: NAMES[r.name] || r.name.replace(/-/g, ' '), kind: r.language || 'project', date: when(r.pushed_at),
      text: cleanText(r.description || 'No description yet.'), pics: [...(SITE_PICS[r.name] || []), ...picturesOf(r.name)], repo: repoUrl, site: r.homepage });
  };

  // ---------- stars: every pet, with its hosted icon, and its repo's pictures and links when the repo is public ----------
  // A private pet has no repo to link, but its pictures are copies on this site (its project-images.js entry says
  // private), so they still show (Astra, 2026-10-20, after making most repos private: "copy the pictures into the website").
  const petEntry = (p) => {
    const name = byName[p.repo] ? p.repo : RENAMED[p.repo]; const r = byName[name];
    const own = r ? r.name : [p.repo, name].find((n) => n && IMG[n] && IMG[n].private);
    return { p, r, pics: own ? picturesOf(own) : [] };
  };
  function star({ p, r, pics }) {
    const c = el('article', 'card'); const h = paint(c, r ? r.name : p.pet);
    const repoUrl = r ? 'https://github.com/findastra/' + r.name : null, icon = iconOf(p), site = siteOf(p, r);
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
    const name = site || repoUrl ? link(site || repoUrl, 'name', p.pet) : el('b', 'name', p.pet); name.title = p.pet; body.append(name);
    body.append(el('div', 'pet', [p.program, r ? r.name : null].filter(Boolean).join(' · ') || 'program not named yet'));
    const text = cleanText((r && r.description) || p.text || 'No description yet.');
    const desc = el('p', null, text); desc.title = text; body.append(desc);
    const meta = el('div', 'meta');
    meta.append(el('span', null, '#' + p.number), el('span', null, p.stage), el('span', null, r ? when(r.pushed_at) : ''));
    body.append(meta);
    const win = el('div', 'win'); win.append(thumb, body);
    c.append(sparkles(h), shape('star', '-111 -116 229 220'), tip);
    if (repoUrl) c.append(link(repoUrl, 'arm l', 'repo ↗'));
    if (site) c.append(link(site, 'arm r', 'site ↗'));
    c.append(win); return c;
  }

  // ---------- the pet jar: filled to the top with small stars, each holding its pet's icon; shake one out, or tip them all
  // out (back by Astra's choice, 2026-10-27) ----------
  // seeded random, so the pile looks the same until the jar is shaken
  const rand = (seed) => () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9 >>> 0) / 4294967296);
  const miniStar = (e) => {
    const m = el('span'); m.style.setProperty('--c', colorOf('pet-' + e.p.number));
    const svg = svgEl('svg', { viewBox: '-111 -116 229 220', 'aria-hidden': 'true' }); svg.append(svgEl('use', { href: '#star' })); m.append(svg);
    const icon = iconOf(e.p); if (icon) { const im = el('img'); im.src = icon; im.alt = ''; im.loading = 'lazy'; m.append(im); }
    return m;
  };
  function makeJar(id, kind) {
    const box = $(id), jar = box.querySelector('.jar'), inside = box.querySelector('.jar-stars'), out = box.querySelector('.jar-out'), all = box.querySelector('.jar-all');
    const shakeBtn = box.querySelector('.shake'), pourBtn = box.querySelector('.pour');
    let items = [], outKey = null, shaking = false;
    // glints: the same color-matched sparkle as the portrait, twinkling on the stars in the jar
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
      let rad = Math.min(kind.maxMini / 2, Math.sqrt((W * H * 1.2) / (n * Math.PI))), spots = null;
      while (!(spots = pile(rad)) && rad > 4) rad *= .94;
      spots = spots || list.map(() => ({ x: W / 2, y: H / 2 }));
      inside.style.setProperty('--s', rad * 2 + 'px');
      inside.replaceChildren(...list.map((it, i) => {
        const m = kind.mini(it); m.classList.add('mini');
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
      const f = kind.mini(it); f.classList.add('flyer'); f.style.setProperty('--s', a.width + 'px');
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
    shakeBtn.addEventListener('click', () => { shake(); listenForPhoneShake(shake); });
    pourBtn.addEventListener('click', () => setPour(all.hidden));
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
    return { fill, setPour };
  }
  // on a phone, shaking the phone shakes the jar (iPhone asks once, after the button)
  let listening = false, lastShake = 0;
  async function listenForPhoneShake(shake) {
    if (listening || typeof DeviceMotionEvent === 'undefined' || !matchMedia('(pointer: coarse)').matches) return;
    try { if (typeof DeviceMotionEvent.requestPermission === 'function' && (await DeviceMotionEvent.requestPermission()) !== 'granted') return; } catch { return; }
    listening = true;
    addEventListener('devicemotion', (e) => {
      const g = e.acceleration || e.accelerationIncludingGravity; if (!g) return;
      const force = Math.hypot(g.x || 0, g.y || 0, g.z || 0) - (e.acceleration ? 0 : 9.8);
      if (force > 14 && Date.now() - lastShake > 1400) { lastShake = Date.now(); shake(); }
    });
  }
  const petJar = makeJar('pet-jar', { key: (e) => 'pet-' + e.p.number, mini: miniStar, full: star, hasPics: (e) => e.pics.length > 0, maxMini: 84, glints: (h) => (h % 10 < 7 ? 1 : 0), one: 'pet', many: 'pets' });

  // ---------- Astra's PetOS as Polaroids: the System Map (live), all the pets at once, and every pet to flip through ----------
  const HUB_PAGES = 'https://findastra.github.io/astras-pet-os/';
  const petsShot = (list) => {
    const g = el('div', 'pet-grid'); g.setAttribute('role', 'img'); g.setAttribute('aria-label', 'All of Astra\'s pets');
    for (const p of list) { const im = el('img'); im.src = iconOf(p); im.alt = ''; im.loading = 'lazy'; im.title = p.pet; g.append(im); }
    return g;
  };
  // each pet's levels from the hub's INTELLIGENCE-LEVELS.md table: L1 programs, L2 pet program and runtime, L3 agentic harness;
  // ✅ built, 🟡 partly, — not yet
  let levels = {};
  fetch(HUB + 'INTELLIGENCE-LEVELS.md').then((r) => (r.ok ? r.text() : Promise.reject(r.status))).then((md) => {
    const mark = (cell) => { const m = /^\s*(✅|🟡)/u.exec(cell || ''); return m ? m[1] : '—'; };
    for (const row of md.split('\n')) {
      const cells = row.split('|'); if (cells.length < 10 || !/<img/.test(cells[1])) continue;
      levels[cells[2].trim()] = [mark(cells[5]), mark(cells[6]), mark(cells[8])];
    }
    render();
  }).catch(() => {});
  const levelNote = (p) => (at, box) => {
    const pet = p[at], lv = levels[pet.pet];
    box.replaceChildren(el('b', null, 'intelligence'), ...(lv ? ['L1 ' + lv[0], 'L2 ' + lv[1], 'L3 ' + lv[2]] : ['not rated yet']).map((t) => el('div', null, t)));
  };
  function petosCards() {
    const drawn = pets.filter(iconOf);
    return [
      polaroid({ key: 'system-map', name: 'The System Map', kind: 'how the pets connect', text: 'Every pet, program and tool in Astra\'s PetOS, and how they work together. Drag it around.',
        pics: [{ src: HUB_PAGES + 'system-map-20261012.html', cap: 'The System Map', type: 'frame', label: 'live' }], repo: 'https://github.com/findastra/astras-pet-os', site: HUB_PAGES + 'system-map-20261012.html', siteLabel: 'open the System Map ↗' }),
      polaroid({ key: 'all-pets', name: 'The pets', kind: drawn.length + ' drawn so far', text: 'What they all look like. Each one is a small app with a face and a job.', pics: [], shot: petsShot(drawn) }),
      polaroid({ key: 'meet-pets', name: 'Meet every pet', kind: 'flip with the arrows', text: 'One at a time, no shaking needed.',
        pics: drawn.map((p) => ({ src: iconOf(p), cap: p.pet, label: p.pet, fit: 'contain' })), sticky: levelNote(drawn) }),
    ];
  }

  function render() {
    $('petos-list').replaceChildren(...(query ? [] : petosCards()));
    $('world-list').replaceChildren(...WORLDS.filter((w) => shown(`${w.name} ${w.kind} ${w.text} ${w.repo}`)).map(worldCard));
    // only pets with a picture go in the jar (Astra, 2026-10-27: "I don't want to see stars without pets on them"); the ones
    // with project pictures first, then the ones with a public repo, then by number
    petJar.fill(pets.filter(iconOf).map(petEntry).filter(({ p, r }) => shown(`${p.pet} ${p.program} ${p.text} ${p.repo} ${(r && r.description) || ''}`))
      .sort((a, b) => (b.pics.length > 0) - (a.pics.length > 0) || (b.r ? 1 : 0) - (a.r ? 1 : 0) || a.p.number - b.p.number));
    // Discord and Web & More, newest first
    const others = repos.filter(isOther).filter((r) => shown(`${r.name} ${r.description}`)).sort((a, b) => String(b.pushed_at).localeCompare(String(a.pushed_at)));
    $('discord-list').replaceChildren(...others.filter((r) => DISCORD.has(r.name)).map(extraCard));
    $('web-list').replaceChildren(...others.filter((r) => !DISCORD.has(r.name)).map(extraCard));
    for (const ch of document.querySelectorAll('.chapter')) ch.classList.toggle('empty', !!query && !ch.querySelector('.polaroid, .mini'));
  }
  // a search tips the jar out, so every matching pet shows
  $('search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); if (query) petJar.setPour(true); render(); });
  const shots = Object.values(IMG).filter((r) => r.screenshot || (r.pages || []).length || r.images.length).length;
  const source = (live) => ($('project-source').textContent = `${live ? 'live from GitHub' : 'snapshot'} · ${repos.length} public repos · ${WORLDS.length} worlds · ${pets.filter(iconOf).length} pets · ${shots} with pictures so far`);
  let liveRepos = false;
  const useRepos = (list, live) => {
    repos = list.filter((r) => r.name !== 'findastra.github.io'); byName = Object.fromEntries(repos.map((r) => [r.name, r]));
    liveRepos = live; source(live); render(); ticks.repos(repos);
  };
  useRepos(S.repos || [], false);
  fetch('https://api.github.com/users/findastra/repos?per_page=100&sort=pushed')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => useRepos(d.filter((r) => !r.fork && !r.private).map((r) => ({ name: r.name, description: r.description || '', language: r.language || '', pushed_at: r.pushed_at, homepage: r.homepage || (r.has_pages ? `https://findastra.github.io/${r.name}/` : '') })), true))
    .catch(() => {});
  // the hub's live pet list, picture index, pets.json and pet program pages: new pets, new drawings and new pages show up
  // without changing this site
  const getJson = (u) => fetch(u).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
  Promise.allSettled([getJson(HUB + 'pet-programs.json'), getJson(LATEST + 'index.json'), getJson(HUB + 'pets.json'),
    getJson('https://api.github.com/repos/findastra/astras-pet-os/contents/apps/pet-programs')])
    .then(([programs, index, hubPets, pages]) => {
      if (index.status === 'fulfilled') hosted = new Set(Object.keys(index.value.pictures || {}).map((k) => k.replace(/^art\/latest\//, '')));
      if (hubPets.status === 'fulfilled') for (const p of hubPets.value.pets || []) {
        if (p.art) artByRepo[p.repo] = p.art;
        if (p.interface_live_url) liveSiteByRepo[p.repo] = p.interface_live_url;
      }
      // each repo's newest page, <repo>-YYYYMMDD.html
      if (pages.status === 'fulfilled') {
        pageByRepo = {};
        for (const f of pages.value.map((x) => x.name).sort()) { const m = /^(.+)-\d{8}\.html$/.exec(f); if (m) pageByRepo[m[1]] = f; }
      }
      if (programs.status === 'fulfilled') {
        const live = livePets(programs.value);
        if (live.length) { pets = live; for (const p of pets) if (p.repo && !petByRepo[p.repo]) petByRepo[p.repo] = p; }
      }
      if ([index, programs, hubPets, pages].some((x) => x.status === 'fulfilled')) { source(liveRepos); render(); }
    });

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
        s.style.cssText = `--x:${((sp.i % N + .5) / N * 100).toFixed(1)}%;--y:${((Math.floor(sp.i / N) + .5) / N * 100).toFixed(1)}%;--s:${8 + (k % 14)}px;--d:${((k >>> 8) % 40) / 10}s;--c:${sp.c};--dh:${[-36, -18, 0, 18, 36][(k >>> 12) % 5]};--l:22`;
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
      const b = el('button', null, '> 0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0') + ' ' + w);
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
  // Easy: six pets, in their own colors. Hard (Astra, 2026-10-27): one pet, and the pairs are six of its moods, so the cards
  // all look alike; the moods come from the hub's art/latest/moods/<pet>/ (blink is left out, it is too close to idle).
  let hard = false;
  const MOODS = ['alarmed', 'curious', 'happy', 'idle', 'sad', 'sick', 'sleep', 'worried'];
  const moodPets = () => {
    if (!hosted) return [];
    const by = {};
    for (const k of hosted) { const m = /^moods\/([^/]+)\/([a-z]+)\.png$/.exec(k); if (m && MOODS.includes(m[2])) (by[m[1]] = by[m[1]] || []).push(m[2]); }
    return Object.entries(by).filter(([, list]) => list.length >= 6);
  };
  function deal() {
    const shuffle = (a) => [...a].sort(() => Math.random() - .5);
    let pick, who = '';
    const hardOnes = hard ? moodPets() : [];
    if (hard && hardOnes.length) {
      const [art, list] = hardOnes[Math.floor(Math.random() * hardOnes.length)];
      const p = pets.find((x) => iconOf(x) && iconOf(x).includes('/' + art + '/')) || { pet: art.replace(/-/g, ' ') };
      who = p.pet;
      pick = shuffle(list).slice(0, 6).map((m) => ({ key: m, src: LATEST + 'moods/' + art + '/' + m + '.png', alt: p.pet + ', ' + m }));
    } else pick = shuffle(pets.filter(iconOf)).slice(0, 6).map((p) => ({ key: p.number, src: iconOf(p), alt: p.pet }));
    const cards = shuffle([...pick, ...pick]);
    let open = [], found = 0, moves = 0, lock = false; const t0 = Date.now();
    const stat = () => ($('mem-stat').textContent = `${who ? who + "'s moods · " : ''}moves ${moves} · pairs ${found}/6`);
    $('board').replaceChildren(...cards.map((p) => {
      const t = el('div', 'tile'), b = el('button'); b.setAttribute('aria-label', 'card');
      const f2 = el('span', 'f f2'), im = el('img'); im.src = p.src; im.alt = p.alt; f2.append(im);
      b.append(el('span', 'f f1', '✦'), f2); t.append(b);
      b.onclick = () => {
        if (lock || t.classList.contains('open') || t.classList.contains('done')) return;
        t.classList.add('open'); open.push([t, p]);
        if (open.length < 2) return;
        moves++; const [[ta, pa], [tb, pb]] = open; open = [];
        if (pa.key === pb.key) { ta.classList.add('done'); tb.classList.add('done'); found++; if (found === 6) { $('mem-stat').textContent = `all pairs · ${moves} moves · ${Math.round((Date.now() - t0) / 1000)}s ✦`; return; } }
        else { lock = true; setTimeout(() => { ta.classList.remove('open'); tb.classList.remove('open'); lock = false; }, 700); }
        stat();
      };
      return t;
    }));
    stat();
  }
  $('mem-new').onclick = deal;
  $('mem-hard').onclick = () => { hard = !hard; $('mem-hard').setAttribute('aria-pressed', String(hard)); $('mem-hard').textContent = hard ? 'easy: 6 pets' : 'hard: moods'; deal(); };
  deal();

  // ---------- links ----------

  // ---------- code rain behind the hero, in rainbow colors that drift down the spectrum (Astra, 2026-10-27; it was white) ----------
  const cv = $('rain'), cx = cv.getContext('2d'); let cols = [];
  const size = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; cols = Array(Math.ceil(cv.width / 16)).fill(0).map(() => Math.random() * cv.height); };
  size(); new ResizeObserver(size).observe(cv);
  const glyphs = 'ASTRAUDRA01アストラ✦';
  // the rain's colors: the rainbow first; catching the white rabbit moves to the next set (Astra, 2026-10-27). Each is a run of
  // hues (from, span) that the columns spread over and drift down.
  const PALETTES = [
    { name: 'rainbow', from: 0, span: 360 }, { name: 'neon pink and cyan', from: 290, span: 110 }, { name: 'matrix green', from: 95, span: 60 },
    { name: 'sunset', from: 330, span: 80 }, { name: 'ice', from: 170, span: 70 }, { name: 'gold', from: 30, span: 40 }, { name: 'vapor', from: 250, span: 90 },
  ];
  let palette = 0;
  (function rain() {
    if (reduced) return;
    cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = 'rgba(0, 0, 0, .14)'; cx.fillRect(0, 0, cv.width, cv.height);
    cx.globalCompositeOperation = 'source-over';
    cx.font = '14px JetBrains Mono';
    const t = performance.now() / 40;
    cols.forEach((y, i) => {
      const pal = PALETTES[palette], k = (i * 9 + y / 6 + t) % 360;
      const color = `hsl(${pal.from + (pal.span === 360 ? k : Math.abs(((k / 360) * 2 * pal.span) % (2 * pal.span) - pal.span))} 100% ${unmasked ? 55 : 62}%)`;
      // unmasked: black code on white, glowing in the color it would have been
      if (unmasked) { cx.fillStyle = '#050505'; cx.shadowColor = color; cx.shadowBlur = 9; } else { cx.fillStyle = color; cx.shadowBlur = 0; }
      cx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * 16, y); cols[i] = y > cv.height + Math.random() * 1e4 ? 0 : y + 16;
    });
    setTimeout(() => requestAnimationFrame(rain), 60);
  })();

  // ---------- the pole on the left (from Mommy's website): the bead sits on the section you are on; click a floor to go there ----------
  (() => {
    const marks = [...document.querySelectorAll('.floors a')], secs = marks.map((a) => $(a.dataset.f)), bead = $('bead');
    let asked = -1; // a floor clicked, until the visitor scrolls on their own
    function onScroll() {
      let at = asked;
      if (at < 0) { at = 0; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= Math.min(90, innerHeight * .15)) at = i; }); }
      marks.forEach((a, i) => { a.classList.toggle('on', i === at); if (i === at) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
      const r = marks[at].getBoundingClientRect(); bead.style.top = r.top + r.height / 2 - bead.offsetHeight / 2 + 'px';
    }
    marks.forEach((a, i) => a.addEventListener('click', (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault(); asked = i; history.replaceState(null, '', a.hash);
      secs[i].scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' }); onScroll();
    }));
    const release = () => (asked = -1);
    addEventListener('wheel', release, { passive: true }); addEventListener('touchstart', release, { passive: true });
    addEventListener('keydown', (e) => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) release(); });
    addEventListener('pointerdown', (e) => { if (!e.target.closest('#pole')) release(); }, { passive: true });
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
  })();

  // ---------- the white rabbit: hops across the live updates ticker now and then; catch it and the rain changes color ----------
  // Astra (2026-10-27) asked for "the rabbit from Data Dealer"; the hopping white rabbit lives in Gone Ghost's page
  // (findastra/ghost-protocol): the same four 8-bit frames (15 x 12 pixels), the same hop. It hops along the top edge of the
  // working on bar, never over its words.
  (() => {
    const lane = $('rabbit-lane'); if (!lane || reduced) return;
    // each frame: [x, y, w, h] pixels, the eye last; and how high it is in the hop (0 to 1)
    const FRAMES = [
      { pose: 'crouch', lift: 0, px: [[9,0,1,1],[11,0,1,1],[9,1,2,1],[11,1,2,1],[9,2,5,1],[8,3,6,1],[1,3,1,1],[1,4,1,1],[2,4,13,1],[1,5,13,1],[1,6,12,1],[2,7,10,1],[2,8,3,1],[9,8,3,1],[2,9,2,1],[9,9,2,1]], eye: [12,3] },
      { pose: 'rise', lift: .55, px: [[10,0,1,1],[12,0,1,1],[10,1,2,1],[12,1,2,1],[10,2,4,1],[9,3,6,1],[1,3,1,1],[1,4,1,1],[2,4,12,1],[1,5,12,1],[1,6,10,1],[2,7,8,1],[0,8,2,1],[9,8,2,1],[0,9,2,1]], eye: [13,3] },
      { pose: 'peak', lift: 1, px: [[11,0,1,1],[13,0,1,1],[11,1,2,1],[13,1,2,1],[11,2,3,1],[10,3,5,1],[2,3,1,1],[2,4,1,1],[3,4,11,1],[2,5,11,1],[1,6,9,1],[12,7,3,1],[0,7,3,1]], eye: [14,3] },
      { pose: 'land', lift: .35, px: [[9,0,1,1],[11,0,1,1],[9,1,2,1],[11,1,2,1],[9,2,5,1],[8,3,6,1],[1,3,1,1],[1,4,1,1],[2,4,13,1],[1,5,13,1],[1,6,11,1],[2,7,9,1],[10,8,2,1],[11,9,2,1],[2,8,2,1]], eye: [12,3] },
    ];
    const bun = el('button', 'white-rabbit'); bun.type = 'button'; bun.setAttribute('aria-label', 'A white rabbit. Catch it.'); bun.title = 'catch me';
    const sprites = FRAMES.map((f) => {
      const svg = svgEl('svg', { viewBox: '0 0 15 12', 'shape-rendering': 'crispEdges', 'aria-hidden': 'true' });
      for (const [x, y, w, h] of f.px) svg.append(svgEl('rect', { x, y, width: w, height: h }));
      const [ex, ey] = f.eye; svg.append(svgEl('rect', { x: ex, y: ey, width: 1, height: 1, class: 'eye' }));
      bun.append(svg); return svg;
    });
    lane.append(bun);
    let running = false, timer = 0, raf = 0;
    const pose = (i, hop) => { sprites.forEach((s, n) => (s.style.display = n === i ? 'block' : 'none')); bun.style.transform = `translateY(${-Math.round(FRAMES[i].lift * hop)}px)`; };
    const later = (ms) => { clearTimeout(timer); timer = setTimeout(run, ms); };
    function stop() { running = false; cancelAnimationFrame(raf); bun.classList.remove('running'); later(25000 + Math.random() * 35000); }
    // 8-bit hops: four fixed frames per hop, and the rabbit jumps forward once per hop, from behind the label to off the right edge
    function run() {
      if (document.hidden) return later(5000);
      const x0 = -40, x1 = lane.clientWidth + 10;
      const hopMs = 560 + Math.random() * 160, hop = 11 + Math.random() * 3, hops = Math.max(6, Math.round((x1 - x0) / 46)), step = (x1 - x0) / hops;
      // his color is the colors the rain turns when he is caught (Astra, 2026-10-27)
      const next = PALETTES[(palette + 1) % PALETTES.length];
      bun.classList.toggle('rainbow', next.span === 360); bun.style.setProperty('--glow', next.span === 360 ? '#fff' : `hsl(${next.from + next.span / 2} 100% 62%)`);
      running = true; bun.classList.add('running'); bun.style.left = x0 + 'px'; pose(0, hop);
      const t0 = performance.now() + 600;
      raf = requestAnimationFrame(function tick(now) {
        if (!running) return;
        const k = Math.max(0, Math.floor((now - t0) / (hopMs / 4))), n = Math.floor(k / 4), f = k % 4;
        if (n >= hops) return stop();
        bun.style.left = Math.round(x0 + (f ? n + 1 : n) * step) + 'px'; pose(f, hop);
        raf = requestAnimationFrame(tick);
      });
    }
    // caught: a burst of sparkles where it was, the rain moves to its next colors, and the rabbit is gone until next time
    bun.addEventListener('click', () => {
      if (!running) return;
      palette = (palette + 1) % PALETTES.length;
      const b = bun.getBoundingClientRect(), r = lane.getBoundingClientRect(), burst = el('span', 'sparkles rabbit-burst'); burst.setAttribute('aria-hidden', 'true');
      burst.style.cssText = `left:${b.left - r.left + b.width / 2}px;top:${b.top - r.top + b.height / 2}px`;
      for (let i = 0; i < 8; i++) { const s = el('i'), a = (i / 8) * Math.PI * 2; s.style.cssText = `--x:${50 + 40 * Math.cos(a)}%;--y:${50 + 40 * Math.sin(a)}%;--s:${10 + (i % 3) * 4}px;--d:0s;--c:hsl(${i * 45} 100% 65%);--dh:0;--l:0`; burst.append(s); }
      lane.append(burst); setTimeout(() => burst.remove(), 1400);
      stop();
    });
    later(4000);
  })();
})();
