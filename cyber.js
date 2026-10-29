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
  // a live page (the Cooling Tower's model, the System Map) opens here too, big, to turn and zoom in (Astra, 2026-10-29:
  // "a closer look tool on it, just the same way there is for the rainbow maker")
  const lbFrame = document.createElement('iframe'); lbFrame.className = 'lb-frame'; lbFrame.hidden = true; $('lb-img').after(lbFrame);
  const lbShow = () => {
    const it = lbList[lbAt], live = it.type === 'frame';
    $('lb-img').hidden = live; lbFrame.hidden = !live;
    if (live) { if (lbFrame.src !== it.src) lbFrame.src = it.src; lbFrame.title = it.cap; } else { $('lb-img').src = it.src; $('lb-img').alt = it.cap; }
    $('lb-cap').textContent = `${it.cap}   ${lbAt + 1} / ${lbList.length}`;
  };
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
  // the button goes both ways (Astra, 2026-10-29: the way back was broken): unmask, then mask again
  let masking = false;
  $('unmask').onclick = async () => {
    if (masking) return; masking = true;
    if (!unmasked) {
      unmasked = true;
      await type('audra@findastra:~$ sudo unmask', 'ok');
      await type('[sudo] password for audra: ********', 'dim', 8);
      document.body.classList.add('glitch'); await wait(800); document.body.classList.remove('glitch');
      document.body.classList.add('unmasked');
      $('term-title').textContent = 'astra@findastra: ~';
      await type('astra', 'hot', 40);
      await type('noncorporeal dancer · reality-hacker · digital performer', '', 10);
      await type(`${repos.length || ''} projects · ${pets.length} pets · worlds below. scroll.`, 'dim', 8);
      $('unmask').textContent = 'sudo mask';
    } else {
      unmasked = false;
      await type('astra@findastra:~$ sudo mask', 'ok');
      document.body.classList.add('glitch'); await wait(800); document.body.classList.remove('glitch');
      document.body.classList.remove('unmasked');
      $('term-title').textContent = 'audra@findastra: ~';
      await type('audra', '', 30);
      $('unmask').textContent = 'sudo unmask';
    }
    masking = false;
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
    'sudo unmask': () => { if (unmasked) return 'already unmasked. try: sudo mask'; $('unmask').click(); return ''; },
    'sudo mask': () => { if (!unmasked) return 'already masked.'; $('unmask').click(); return ''; },
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
      .map((f, i) => ({ src: LD + f + '.png', label: 'concept art', cap: 'Liminal Doors · ' + f.replace(/^\d+-/, '').replace(/-\d{8}$/, '').replace(/-/g, ' '),
        // the first, the hummingbird's conservatory, a little closer in on the greenhouse and its glass roof (Astra, 2026-10-29)
        ...(i ? {} : { crop: [40, 0, 467, 427, 507, 508], cover: true }) })) },
    { name: "Mommy's World", kind: 'VRChat world · PC VR / desktop', text: "The VRChat home of Mommy's Rave House, Dance & Avatar Academy.", repo: 'mommys-world',
      // first, "baby girl, I'm a star", playing on a loop with its sound off until you turn it on (Astra, 2026-10-29)
      local: [{ src: 'art/worlds/mommys-world-baby-girl-im-a-star-20261029.mp4', cap: "Mommy's World · baby girl, I'm a star", type: 'video', sound: true, label: 'world coming soon' },
        { src: 'art/worlds/phone-booth.jpg', label: 'concept art', cap: 'A pink phone booth above the clouds' }], extra: ['mommys', 'role-fairy'] },
    // first the still with its gray cut away, so it shines over the paper (Astra, 2026-10-29); the video and the crystals keep theirs
    // first its turning video with the gray cut away, so it turns on the bare paper (Astra, 2026-10-29), sparkles circling it and
    // pouring out of its crystals across the page; then the still, then the crystals
    { name: 'The Rainbow Maker', kind: 'VRChat world · PC VR / desktop', text: 'The mechanics of the Kikkerland Rainbow Maker: watch its tiny gear train turn and spin a crystal that refracts rainbows across the room.', repo: 'the-rainbow-maker', local: [
      { src: RM + 'rainbow-maker-preview-20261022.mp4', cap: 'The Rainbow Maker · turning', type: 'video', key: [69, 69, 74], clear: true,
        // one wide ring round the whole machine, a small fast one round each crystal, and a few glints on the glass
        // sparkles circling each of the two crystals, just wide of them so the crystals can be seen turning (Astra, 2026-10-29:
        // "go around the actual crystals"), and the spray thrown off those same rings: center x, y and radii, in percent
        orbits: [[44, 79, 12, 9, 5, 5], [54, 68, 11, 8, 5, 6]], still: [[46, 30], [56, 40]],
        spray: [[44, 79, 12, 9], [54, 68, 11, 8]] },
      { src: 'art/worlds/rainbow-maker-still-clear-20261029.png', cap: 'The Rainbow Maker', fit: 'contain', clear: true, nudge: '0 7%' },
      { src: RM + 'rainbow-maker-crystals-cycles-20261023.png', cap: 'The Rainbow Maker · the crystals', fit: 'contain', bg: '#47423f' }] },
    { name: 'The Cooling Tower', siteLabel: 'see full mini model ↗', kind: 'VRChat world · PC VR / desktop', text: "A rave world inside a nuclear plant's cooling tower: break into the facility and power it up with music. The Stack, the Turbine Hall, then the Reactor Hall.", repo: 'the-cooling-tower', local: [{ src: 'https://findastra.github.io/the-cooling-tower/mini-model/the-cooling-tower-mini-model-20261024.html', cap: 'The Cooling Tower · Mini Model', type: 'frame', label: 'concept model', bare: true, back: 7 }] },
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
  // One sparkle for the whole page (Astra, 2026-10-29: "unify the sparkles"): the portrait's, soft pastel in every hue,
  // drifting round the rainbow. pastel() is its color; sparkles() rings a shape with them, more than before
  const pastel = (k) => `hsl(${k % 360} 55% 80%)`;
  const sparkle = (k, x, y, s) => {
    const i = el('i');
    i.style.cssText = `--x:${x}%;--y:${y}%;--s:${s}px;--d:${((k >>> 14) % 30) / 10}s;--c:${pastel(k)};--dh:${[-150, -100, -50, 0, 50, 100, 150][(k >>> 18) % 7]};--l:0`;
    return i;
  };
  const sparkles = (h, n = 10) => {
    const box = el('div', 'sparkles'); box.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < n; i++) {
      const k = hash(h + ':' + i), a = (i / n) * Math.PI * 2 + ((k % 60) - 30) / 60, rad = 44 + (k >>> 6) % 11;
      box.append(sparkle(k, (50 + rad * Math.cos(a)).toFixed(1), (50 + rad * Math.sin(a)).toFixed(1), 9 + (k >>> 10) % 14));
    }
    return box;
  };
  // sparkles that circle a thing in its picture (Astra, 2026-10-29: round the Rainbow Maker, "like they would actually reflect
  // off of those spinning crystals"): each orbit is a tilted ring [x, y, rx, ry, how many, seconds per turn] in the picture's
  // percent; the ones going round the back are dimmer and smaller. A few more just twinkle where they are. They only move while
  // the picture is on screen
  // moves a picture shown with object-fit: contain so its drawing, where its painted pixels are, sits in the middle of its box,
  // without changing its size (Astra, 2026-10-29: the pets centered in their stars and frames, "just moving them around").
  // scale: how much it is shrunk, so its offset shrinks with it
  const centerByInk = (im, scale = 1) => {
    const probe = new Image(); probe.crossOrigin = 'anonymous';
    probe.onload = () => { try {
      const n = 64, cv = document.createElement('canvas'); cv.width = cv.height = n; const x = cv.getContext('2d', { willReadFrequently: true });
      const k = Math.min(n / probe.naturalWidth, n / probe.naturalHeight), w = probe.naturalWidth * k, h = probe.naturalHeight * k;
      x.drawImage(probe, (n - w) / 2, (n - h) / 2, w, h); const d = x.getImageData(0, 0, n, n).data;
      let l = n, r = 0, t = n, b = 0;
      for (let i = 0; i < n * n; i++) if (d[i * 4 + 3] > 40) { const px = i % n, py = (i / n) | 0; l = Math.min(l, px); r = Math.max(r, px); t = Math.min(t, py); b = Math.max(b, py); }
      if (r < l) return;
      const dx = ((n - 1) / 2 - (l + r) / 2) / n, dy = ((n - 1) / 2 - (t + b) / 2) / n;
      // in a box that is not square the drawing fills its shorter side, so the offset is a share of that
      const place = () => { const bw = im.clientWidth, bh = im.clientHeight, m = Math.min(bw, bh); im.style.translate = bw && bh && bw !== bh ? `${dx * m * scale}px ${dy * m * scale}px` : `${dx * 100 * scale}% ${dy * 100 * scale}%`; };
      place(); new ResizeObserver(place).observe(im);
    } catch {} };
    probe.src = im.src;
  };
  // a video drawn frame by frame on a canvas with one flat background color cut away, so it turns on the bare paper (Astra,
  // 2026-10-29: the Rainbow Maker's animation "even though it has a sheer background"). key is [r, g, b]; it only draws while on
  // screen. The video comes from the world's own repo, which allows this (it is fetched with CORS)
  const keyedVideo = (p) => {
    const box = el('div', 'keyed'), v = el('video'), cv = el('canvas'), x = cv.getContext('2d', { willReadFrequently: true });
    Object.assign(v, { muted: true, loop: true, autoplay: !reduced, playsInline: true, preload: 'auto', crossOrigin: 'anonymous', src: p.src });
    box.append(v, cv);
    const [kr, kg, kb] = p.key, near = 12, far = 26;
    let on = false, raf = 0;
    const draw = () => {
      raf = on ? requestAnimationFrame(draw) : 0;
      if (v.readyState < 2) return;
      const w = 270, hgt = Math.round(w * (v.videoHeight / v.videoWidth || 1.78));
      if (cv.width !== w) { cv.width = w; cv.height = hgt; }
      x.drawImage(v, 0, 0, w, hgt);
      let img; try { img = x.getImageData(0, 0, w, hgt); } catch { return; }
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const dist = Math.abs(d[i] - kr) + Math.abs(d[i + 1] - kg) + Math.abs(d[i + 2] - kb);
        if (dist < near) d[i + 3] = 0; else if (dist < far) d[i + 3] = ((dist - near) / (far - near)) * 255;
      }
      x.putImageData(img, 0, 0);
    };
    new IntersectionObserver((seen) => { on = seen.some((e) => e.isIntersecting); if (on) { v.play().catch(() => {}); if (!raf) raf = requestAnimationFrame(draw); } else v.pause(); }).observe(box);
    return box;
  };
  // sparkles that a picture throws out over the whole page while it is on screen (Astra, 2026-10-29: the Rainbow Maker
  // "creating rainbows", many more, out over everything, carried along as you scroll): they fly out from the spots given (in the
  // picture's percent), drift, twinkle and fade, on one canvas over the window
  let spray = null;
  const rainbowSpray = (photo, from) => {
    if (!spray) {
      const cv = el('canvas', 'rainbow-spray'); cv.setAttribute('aria-hidden', 'true'); document.body.append(cv);
      const x = cv.getContext('2d'), dots = [], sources = new Set(), stamps = new Map();
      const stamp = (hue) => {
        if (stamps.has(hue)) return stamps.get(hue);
        const k = el('canvas'); k.width = k.height = 32; const g = k.getContext('2d'), q = 3.5;
        g.fillStyle = `hsl(${hue} 55% 80%)`; g.beginPath(); g.moveTo(16, 0); g.lineTo(16 + q, 16 - q); g.lineTo(32, 16); g.lineTo(16 + q, 16 + q); g.lineTo(16, 32); g.lineTo(16 - q, 16 + q); g.lineTo(0, 16); g.lineTo(16 - q, 16 - q); g.closePath(); g.fill();
        stamps.set(hue, k); return k;
      };
      const fit = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; x.setTransform(d, 0, 0, d, 0, 0); };
      fit(); addEventListener('resize', fit);
      let last = 0;
      (function tick(t) {
        requestAnimationFrame(tick);
        const dt = Math.min(50, t - last || 16); last = t;
        x.clearRect(0, 0, innerWidth, innerHeight);
        if (!reduced) for (const s of sources) {
          // a picture redrawn away (the section was drawn again) stops; while it was left in, it sprayed from the corner
          if (!s.photo.isConnected) { sources.delete(s); continue; }
          const r = s.photo.getBoundingClientRect();
          if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
          // from a ring round the machine, outside it, so the crystals turning inside stay clear (Astra, 2026-10-29: "the way
          // it is shedding sparkles ... from like a ring around where the rainbow maker is"), flying outward from it
          // a few at a time, every other frame or so (Astra, 2026-10-29: "a little bit less sparkles too, and less often"), each
          // from one of the rings given
          if (Math.random() < .45) continue;
          for (let n = 0; n < 3; n++) {
            const [cxp, cyp, rxp, ryp] = s.from[(Math.random() * s.from.length) | 0];
            const a = Math.random() * Math.PI * 2, sp = .6 + Math.random() * 2.4, ring = 1 + Math.random() * .15;
            dots.push({ x: r.left + r.width * (cxp + Math.cos(a) * rxp * ring) / 100, y: r.top + r.height * (cyp + Math.sin(a) * ryp * ring) / 100, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - .2,
              life: 1, s: 3 + Math.random() * 7 + (Math.random() < .08 ? 9 : 0), hue: (Math.random() * 12 | 0) * 30, t: Math.random() * 7 });
          }
        }
        if (dots.length > 1400) dots.splice(0, dots.length - 1400);
        for (let i = dots.length - 1; i >= 0; i--) {
          const p = dots[i]; p.x += p.vx; p.y += p.vy; p.vx *= .995; p.vy = p.vy * .995 + .006; p.life -= dt / 4200; p.t += .08;
          if (p.life <= 0 || p.x < -20 || p.x > innerWidth + 20 || p.y < -20 || p.y > innerHeight + 20) { dots.splice(i, 1); continue; }
          const sz = p.s * (.55 + .45 * Math.sin(p.t)) * Math.min(1, p.life * 2);
          x.globalAlpha = Math.min(1, p.life * 1.6) * (.6 + .4 * Math.sin(p.t + 1));
          x.drawImage(stamp(p.hue), p.x - sz, p.y - sz, sz * 2, sz * 2);
        }
        x.globalAlpha = 1;
      })(0);
      spray = { add: (photo, from) => sources.add({ photo, from }) };
    }
    spray.add(photo, from);
  };
  const orbitField = (h, orbits, still = []) => {
    const box = el('div', 'sparkles field'); box.setAttribute('aria-hidden', 'true');
    const movers = orbits.flatMap(([x, y, rx, ry, n, secs], o) => Array.from({ length: n }, (_, i) => {
      const k = hash(h + ':o' + o + ':' + i), s = sparkle(k, x, y, 7 + (k >>> 12) % 10); box.append(s);
      return { s, x, y, rx, ry, w: (Math.PI * 2) / (secs * 1000), a: (i / n) * Math.PI * 2 };
    }));
    for (const [x, y] of still) box.append(sparkle(hash(h + ':s' + x + y), x, y, 8));
    let on = false, raf = 0;
    const move = (t) => {
      raf = on && !reduced ? requestAnimationFrame(move) : 0;
      for (const m of movers) {
        const a = m.a + t * m.w, front = Math.sin(a) > 0;
        m.s.style.left = m.x + m.rx * Math.cos(a) + '%'; m.s.style.top = m.y + m.ry * Math.sin(a) + '%';
        m.s.style.filter = front ? '' : 'brightness(.55)'; m.s.style.scale = front ? 1 : .6;
      }
    };
    new IntersectionObserver((seen) => { on = seen.some((e) => e.isIntersecting); if (on && !raf) raf = requestAnimationFrame(move); }).observe(box);
    requestAnimationFrame(() => move(0));
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
  // clear: the photo has no backing, so the paper shows through around the picture (Astra, 2026-10-29). The Discord galaxies
  // are drawn on black, so their black is masked away (glow) and the whole spiral fits inside the frame
  // The two still galaxies have see-through copies here, their black turned into real see-through with the color kept at
  // full strength, so they glow on the paper like they do on Discord (Astra, 2026-10-29: the masked ones looked dull)
  const GALAXY = { anthropic: 'art/projects/galaxies/anthropic-galaxy.png', openai: 'art/projects/galaxies/openai-galaxy.png' };
  const ownGalaxy = (src) => { const m = /findastra\/(anthropic|openai)-discord-presence\/main\/public\/galaxy\.png$/.exec(src); return m && GALAXY[m[1]]; };
  const glows = (p) => /^https:.*galaxy(-card)?\.(png|gif)$/.test(p.src) && !ownGalaxy(p.src);
  const clearOf = (p) => !!(p && (p.clear || glows(p) || ownGalaxy(p.src)));
  function polaroid({ key, name, kind, date, text, pics, repo, site, siteLabel, shot, sticky, clear }) {
    const c = el('article', 'polaroid'); const h = paint(c, key);
    const photo = el(pics.length && !shot && !pics.some((p) => p.type === 'frame') ? 'button' : 'div', 'photo');
    photo.classList.toggle('clear', !!clear || clearOf(pics[0]));
    if (pics[0] && pics[0].crop && pics[0].bg) photo.style.background = pics[0].bg;
    if (pics[0] && pics[0].fill) photo.style.background = pics[0].fill;
    const orbiting = pics.find((p) => p.orbits), field = orbiting ? orbitField(h, orbiting.orbits, orbiting.still) : null;
    const spraying = pics.find((p) => p.spray); if (spraying) rainbowSpray(photo, spraying.spray);
    if (shot) photo.append(shot);
    else if (!pics.length) photo.append(el('span', 'developing', 'still developing…'));
    let flip = null, count = null, badge = null, sound = null;
    // a video with sound (Mommy's World): it plays muted, and a small button on the white border turns its sound on and off
    if (pics.some((p) => p.sound)) {
      let on = false;
      const b = el('button', 'sound', '🔇'); b.type = 'button';
      const set = () => { b.textContent = on ? '🔊' : '🔇'; b.setAttribute('aria-label', on ? 'turn the sound off' : 'turn the sound on'); b.setAttribute('aria-pressed', String(on)); const v = photo.querySelector('video'); if (v) { v.muted = !on; if (on) v.play().catch(() => {}); } };
      b.onclick = (e) => { e.stopPropagation(); on = !on; set(); };
      sound = { b, show: (p) => { b.hidden = !p.sound; if (p.sound) requestAnimationFrame(set); } };
    }
    if (!shot && pics.length) {
      let at = 0;
      // each picture can also be a video (plays by itself, muted, on a loop) or a live page you can move around in
      const media = (p) => {
        if (p.type === 'video' && p.key) return keyedVideo(p);
        if (p.type === 'video') { const v = el('video'); Object.assign(v, { src: p.src, muted: true, loop: true, autoplay: !reduced, playsInline: true, preload: 'metadata' }); if (p.fit) v.style.objectFit = p.fit; if (p.bg) v.style.background = p.bg; return v; }
        // a live page starts once the Polaroid scrolls near (the browser's own lazy loading never starts it inside the scaled frame)
        // a bare page is cropped to its picture (Astra, 2026-10-27: the Mini Model without its title and key); on the live site it
        // shares this site's address, so its panel is hidden outright too
        if (p.type === 'frame') {
          const f = el('iframe', p.bare ? 'live bare' : 'live'); f.title = p.cap;
          // view: the page drawn this many times the photo's size and shrunk to fit, so a page that keeps its panels a fixed
          // size gives its picture more room (the System Map's sphere, Astra 2026-10-29)
          if (p.view) f.style.setProperty('--view', p.view);
          if (p.bare) f.addEventListener('load', () => { try { const st = f.contentDocument.createElement('style'); st.textContent = '.panel{display:none!important}'; f.contentDocument.head.append(st); } catch {} });
          // says: messages the page's own message box takes in turn, typed in the way a visitor would. Like back, below, it
          // can only reach in on the live site, where the page shares this site's address
          if (p.says) f.addEventListener('load', () => { try {
            const box = f.contentDocument.getElementById('msg'); if (!box) return; let n = 0;
            const say = () => { if (!f.isConnected) return; box.value = p.says[n++ % p.says.length]; box.dispatchEvent(new (f.contentWindow.Event)('input', { bubbles: true })); setTimeout(say, 9000); };
            say();
          } catch {} });
          // back: a few turns of the scroll wheel once it has drawn, to start a little zoomed out (the Cooling Tower's stack
          // top, Astra 2026-10-29). It can only reach in where the page shares this site's address, so on the live site
          if (p.back) f.addEventListener('load', () => setTimeout(() => { try {
            const cvs = f.contentDocument.querySelector('canvas'); if (!cvs) return; const r = cvs.getBoundingClientRect();
            for (let i = 0; i < p.back; i++) cvs.dispatchEvent(new (f.contentWindow.WheelEvent)('wheel', { deltaY: 100, deltaMode: 0, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true, cancelable: true }));
          } catch {} }, 900));
          new IntersectionObserver((seen, io) => { if (seen.some((s) => s.isIntersecting)) { f.src = p.src; io.disconnect(); } }, { rootMargin: '400px' }).observe(photo); return f;
        }
        const im = el('img'); im.src = ownGalaxy(p.src) || p.src; im.alt = ''; im.loading = 'lazy'; if (p.fit) im.style.objectFit = p.fit; if (p.bg) im.style.background = p.bg;
        // size: a picture set in from the frame's edges, so the tape covers none of it
        if (p.size) im.style.scale = p.size;
        // nudge: moved within its frame, as a share of the frame (the Rainbow Maker a little lower, clear of the tape)
        if (p.nudge) im.style.translate = p.nudge;
        // center: the drawing itself centered in the frame, not just its square (Astra, 2026-10-29: the Farmer sat to one
        // side), from where its painted pixels actually are
        if (p.center) centerByInk(im, p.size || 1);
        // crop: [left, top, right, bottom] of the picture's [width, height] that the frame shows, fitted whole (or filling the
        // frame, with cover), so a page screenshot can show just its best part bigger (Astra, 2026-10-29: Mommy's stars and
        // windows without the pole; more of the Liminal Doors greenhouse)
        if (p.crop) {
          // k: the frame's side per picture pixel
          const [x0, y0, x1, y1, W0, H0] = p.crop, w = x1 - x0, h = y1 - y0, k = (p.cover ? Math.max : Math.min)(1 / w, 1 / h), pc = (v) => v * 100 + '%';
          Object.assign(im.style, { inset: 'auto', width: pc(W0 * k), height: pc(H0 * k), objectFit: 'fill', background: 'none',
            left: pc(-x0 * k + (1 - w * k) / 2), top: pc(-y0 * k + (1 - h * k) / 2) });
        }
        if (glows(p)) { im.classList.add('glow'); im.style.setProperty('--m', `url("${p.src}")`); }
        return im;
      };
      // what a picture is (Astra, 2026-10-27: "wherever it's concept art, it says concept art"), one black sticker on the white
      // border by the title, so it covers none of the picture (Astra, 2026-10-29: it hid the System Map's key)
      badge = el('span', 'badge'); badge.hidden = !pics[0].label; badge.textContent = pics[0].label || '';
      let shown = media(pics[0]); photo.append(shown, ...(field ? [field] : []));
      // a live page gets a "closer look": it opens big in the viewer, to turn, scroll and zoom (Astra, 2026-10-29)
      if (pics.some((p) => p.type === 'frame')) {
        const look = el('button', 'look', 'closer look ⤢'); look.type = 'button'; look.setAttribute('aria-label', 'take a closer look at ' + name);
        look.onclick = (e) => { e.stopPropagation(); if (pics[at].type === 'frame') openGallery([pics[at]]); };
        photo.append(look);
      }
      const still = () => !pics[at].type;
      photo.setAttribute('aria-label', 'open pictures of ' + name);
      photo.onclick = (e) => { if (still()) openGallery(pics.filter((p) => !p.type), pics.filter((p) => !p.type).indexOf(pics[at])); };
      // more than one picture: two small arrows in the white border's bottom corners flip through them (Astra, 2026-10-27)
      if (pics.length > 1) {
        // "1/3" (Astra, 2026-10-29)
        count = el('span', 'count', `1/${pics.length}`);
        const go = (d) => { at = (at + d + pics.length) % pics.length; const next = media(pics[at]); shown.replaceWith(next); shown = next; photo.classList.toggle('clear', !!clear || clearOf(pics[at])); if (sound) sound.show(pics[at]); if (sticky) sticky(at, note2); badge.hidden = !pics[at].label; badge.textContent = pics[at].label || ''; count.textContent = `${at + 1}/${pics.length}`; };
        flip = ['‹', '›'].map((t, i) => { const b = el('button', 'flip ' + (i ? 'next' : 'prev'), t); b.type = 'button'; b.setAttribute('aria-label', (i ? 'next' : 'previous') + ' picture of ' + name); b.onclick = () => go(i ? 1 : -1); return b; });
      }
    }
    // the writing on the border is always the same three things (Astra, 2026-10-29): the name, which always links to the
    // GitHub repo, then its code, then the date; no site tags
    const title = repo ? link(repo, 'title', name) : el('b', 'title', name);
    const note = el('div', 'note');
    note.append(title, el('span', 'kind', [kind, date].filter(Boolean).join(' · ')), ...(badge ? [badge] : []), ...(sound ? [sound.b] : []));
    if (sound) sound.show(pics[0]);
    // "1 of 3" sits on the bottom edge between the arrows, level with them (Astra, 2026-10-29)
    const frame = el('div', flip ? 'frame flips' : 'frame'); frame.append(el('i', 'tape'), photo, note, ...(flip || []), ...(count ? [count] : []));
    const info = el('div', 'info');
    if (text && SHOW_DESCRIPTIONS) { const p = el('p', null, text); p.title = text; info.append(p); }
    let note2 = null;
    if (sticky) { note2 = el('div', 'sticky'); sticky(0, note2); frame.append(note2); }
    c.append(frame, info, sparkles(h, 12)); return c;
  }
  const worldPics = (w) => [...w.local, ...(w.ownPicsOnly ? [] : picturesOf(w.repo)), ...(w.extra || []).flatMap(picturesOf)];
  // a world: its repo (when public) gives the link, date and description; the README's words when it is private
  const worldCard = (w) => {
    const r = byName[w.repo];
    return polaroid({ key: w.repo, name: w.name, kind: (r && r.language) || w.kind.replace(' · PC VR / desktop', ''), date: r ? when(r.pushed_at) : '', text: cleanText((r && r.description) || w.text), pics: worldPics(w),
      repo: r ? 'https://github.com/findastra/' + w.repo : null });
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
    // a little smaller, so its green banner sits clear of the tape (Astra, 2026-10-29)
    // and the border round it filled with its own blue, not see-through (Astra, 2026-10-29)
    'fuzzboi-factory': [{ src: 'art/projects/fuzzboi-factory-site-20261027.jpg', cap: 'The Fuzzboi Factory', fit: 'contain', bg: '#121a6b', size: 0.88, fill: '#121a6b' }],
    // just the two stars, the name and the three windows, bigger, without the pole down the left (Astra, 2026-10-29)
    // ...with the three arched windows in the middle of the square (Astra, 2026-10-29)
    'mommys-website': [{ src: 'art/projects/mommys-website-site-20261027.jpg', cap: "Mommy's: the twins and the windows", crop: [140, 75, 1190, 1125, 1280, 900], bg: '#1a0612' }],
    // the star alone on the paper, set in from the tape (Astra, 2026-10-29), a little bigger
    'astras-photostar': [{ src: 'https://findastra.github.io/astras-star-window/star-window.svg', cap: "Astra's Photostar", fit: 'contain', size: 0.88, clear: true }],
    // the live sign, saying what it is (its ?message= link option is a Pocket Message Board change waiting for Astra's OK)
    // the sign takes turns saying these (Astra, 2026-10-29)
    'pocket-message-board': [{ src: 'https://findastra.github.io/pocket-message-board/?message=' + encodeURIComponent('This is a Pocket Message Board. Check it out!') + '&size=1', cap: 'Pocket Message Board', type: 'frame',
      says: ['Testing 1, 2, 3', 'Astra was here', 'I love Devilish', 'I love Dev 69'] }],
  };
  // Photostar is one word (Astra, 2026-10-29)
  const NAMES = { 'astras-photostar': "Astra's Photostar" };
  // and "Iris: the origin story" (Astra, 2026-10-29), whatever its repo is called
  const nameOf = (repo) => NAMES[repo] || (/^iris/i.test(repo) ? 'Iris: the origin story' : repo.replace(/-/g, ' '));
  // AI Discord Presence's picture (Astra, 2026-10-29): its two Discord cards, OpenAI over Anthropic, laid out like the
  // activity on a Discord profile (the "Playing" line, the galaxy, the app, what it is using), on the bare paper
  // Each card is the activity the two presence apps (findastra-discord-presence) send to Discord, laid out the way Discord
  // shows it: "Playing", the app's own galaxy card art, its name, "Using <model> on <effort>", "Working on <project>" and
  // the green elapsed time. Live from Discord through Lanyard (api.lanyard.rest), which reads a Discord user's public
  // activity once they have joined its server: set DISCORD_USER to Astra's Discord user ID to turn it on. Until then the
  // cards show what the apps send when nothing more is known.
  const DISCORD_USER = '';
  const PRESENCE = [
    { app: '1548931548986875954', who: 'OpenAI', art: 'openai', using: 'Using Codex' },
    { app: '1555096326734094356', who: 'Anthropic', art: 'anthropic', using: 'Using Claude' },
  ];
  const padIcon = () => {
    const pad = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
    pad.append(svgEl('path', { d: 'M7 6h10a5 5 0 0 1 4.9 6l-.8 4a3 3 0 0 1-5.2 1.4L14 15h-4l-1.9 2.4A3 3 0 0 1 2.9 16l-.8-4A5 5 0 0 1 7 6zm0 3v2H5v2h2v2h2v-2h2v-2H9V9H7zm9.5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-2 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z' }));
    return pad;
  };
  const elapsed = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, pad2 = (n) => String(n).padStart(2, '0'); return (h ? h + ':' : '') + pad2(m) + ':' + pad2(s % 60); };
  const aiCardsShot = () => {
    const box = el('div', 'ai-cards'), live = [];
    for (const pr of PRESENCE) {
      const card = link('https://github.com/findastra/findastra-discord-presence/tree/main/' + pr.art + '-discord-presence', 'ai-card');
      const head = el('span', 'ai-head'); head.append(padIcon(), 'Playing');
      const g = el('img', 'ai-art'); g.src = `https://raw.githubusercontent.com/findastra/findastra-discord-presence/main/${pr.art}-discord-presence/public/galaxy-card.gif`; g.alt = ''; g.loading = 'lazy';
      const details = el('span', null, pr.using), state = el('span', null, 'Exploring ideas'), time = el('span', 'ai-time'); time.hidden = true;
      const words = el('span', 'ai-words'); words.append(el('b', null, pr.who), details, state, time);
      card.append(head, g, words); box.append(card);
      live.push({ pr, card, details, state, time, start: 0 });
    }
    if (DISCORD_USER) {
      const pull = () => fetch('https://api.lanyard.rest/v1/users/' + DISCORD_USER).then((r) => r.json()).then(({ data }) => {
        for (const l of live) {
          const a = data && (data.activities || []).find((x) => x.application_id === l.pr.app);
          l.card.classList.toggle('idle', !a);
          l.details.textContent = (a && a.details) || l.pr.using; l.state.textContent = a ? a.state || '' : 'not on right now';
          l.start = (a && a.timestamps && a.timestamps.start) || 0;
        }
      }).catch(() => {});
      pull(); setInterval(pull, 30000);
      setInterval(() => { for (const l of live) { l.time.hidden = !l.start; if (l.start) { l.time.replaceChildren(padIcon(), elapsed(Date.now() - l.start)); } } }, 1000);
    }
    return box;
  };
  const SHOTS = { moodglass: moodglassShot, 'ai-discord-presence': aiCardsShot };
  const extraCard = (r) => {
    const repoUrl = 'https://github.com/findastra/' + r.name, shot = SHOTS[r.name];
    return polaroid({ key: r.name, shot: shot ? shot() : null, clear: r.name === 'ai-discord-presence', name: nameOf(r.name), kind: r.language || '', date: when(r.pushed_at),
      text: cleanText(r.description || 'No description yet.'), pics: [...(SITE_PICS[r.name] || []), ...picturesOf(r.name)], repo: repoUrl });
  };

  // ---------- stars: every pet, with its hosted icon, and its repo's pictures and links when the repo is public ----------
  // A private pet has no repo to link, but its pictures are copies on this site (its project-images.js entry says
  // private), so they still show (Astra, 2026-10-20, after making most repos private: "copy the pictures into the website").
  const petEntry = (p) => {
    const name = byName[p.repo] ? p.repo : RENAMED[p.repo]; const r = byName[name];
    const own = r ? r.name : [p.repo, name].find((n) => n && IMG[n] && IMG[n].private);
    return { p, r, pics: own ? picturesOf(own) : [] };
  };
  // each pet's star is the page's neon nearest its own colors (Astra, 2026-10-29): the hue its drawing leans to, from its
  // colorful pixels, snapped to the section colors plus cyan; a pet with hardly any color keeps its hashed one
  const NEON = [[350, '#ff2e4d'], [26, '#ff7a1a'], [56, '#fff01f'], [107, '#39ff14'], [186, '#00f0ff'], [210, '#1fa4ff'], [258, '#8c6bff'], [312, '#ff2bd6']];
  const neonOf = new Map();
  const petNeon = (src) => {
    if (!src) return Promise.resolve(null);
    if (!neonOf.has(src)) neonOf.set(src, new Promise((ok) => {
      const im = new Image(); im.crossOrigin = 'anonymous';
      im.onerror = () => ok(null);
      im.onload = () => {
        try {
          const cv = document.createElement('canvas'); cv.width = cv.height = 32; const x = cv.getContext('2d', { willReadFrequently: true });
          x.drawImage(im, 0, 0, 32, 32); const d = x.getImageData(0, 0, 32, 32).data;
          let sx = 0, sy = 0, wt = 0;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 128) continue;
            const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0;
            if (s < .35 || mx < .3) continue;
            const hue = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
            const a = hue * Math.PI / 3, w = s * mx; sx += Math.cos(a) * w; sy += Math.sin(a) * w; wt += w;
          }
          if (wt < 6) return ok(null);
          const hue = ((Math.atan2(sy, sx) * 180 / Math.PI) + 360) % 360, gap = (n) => Math.min(Math.abs(n - hue), 360 - Math.abs(n - hue));
          ok(NEON.reduce((best, n) => (gap(n[0]) < gap(best[0]) ? n : best))[1]);
        } catch { ok(null); }
      };
      im.src = src;
    }));
    return neonOf.get(src);
  };
  const neonStar = (node, p) => petNeon(iconOf(p)).then((c) => { if (c) node.style.setProperty('--c', c); });
  // two arrows chasing each other round a circle, one turning down on the right and one up on the left: the usual "flip"
  const flipIcon = () => {
    const s = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    for (const d of ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5']) s.append(svgEl('path', { d }));
    return s;
  };
  function star({ p, r, pics }) {
    const c = el('article', 'card'); const h = paint(c, r ? r.name : p.pet); neonStar(c, p);
    const repoUrl = r ? 'https://github.com/findastra/' + r.name : null, icon = iconOf(p), site = siteOf(p, r);
    // the front (Astra, 2026-10-29): just the pet, big, filling the window, with its name; no picture box, no side tags
    const big = el('div', 'pet-big');
    // each pet's drawing centered in its window by where it is painted, all at the same scale (Astra, 2026-10-29)
    if (icon) { const im = el('img'); im.src = icon; im.alt = p.pet; im.loading = 'lazy'; big.append(im); centerByInk(im); } else big.textContent = '{ }';
    // the star's top point is its button: the usual turn-over arrows in a circle (Astra, 2026-10-29); more buttons, when there
    // are more, go on its other points
    const turnBtn = el('button', 'tip turn-btn'); turnBtn.type = 'button'; turnBtn.setAttribute('aria-label', 'flip the star to see ' + p.pet + "'s program"); turnBtn.title = 'flip';
    turnBtn.append(flipIcon());
    const body = el('div', 'body');
    body.append(el('b', 'name', p.pet), el('div', 'pet', [p.program, r ? r.name : null].filter(Boolean).join(' · ') || 'program not named yet'));
    const win = el('div', 'win'); win.append(big, body);
    const face = el('div', 'face'); face.append(shape('star', '-111 -116 229 220'), turnBtn, win);
    // the back: the pet program, as one big square, with only its links and a way back
    const back = el('div', 'back'), sq = el(pics.length ? 'button' : 'div', 'square');
    if (pics.length) { const im = el('img'); im.src = pics[0].src; im.alt = ''; im.loading = 'lazy'; sq.append(im); sq.setAttribute('aria-label', 'open pictures of ' + p.pet); sq.onclick = () => openGallery(pics); }
    else { const im = el('img', 'pix'); if (icon) { im.src = icon; im.alt = ''; im.loading = 'lazy'; sq.append(im); } sq.append(el('span', 'soon', 'program pictures coming')); }
    const links = el('div', 'back-links');
    if (site) links.append(link(site, null, 'open ' + (p.program || 'it') + ' ↗'));
    if (repoUrl) links.append(link(repoUrl, null, 'repo ↗'));
    const backBtn = el('button', 'turn-btn'); backBtn.type = 'button'; backBtn.setAttribute('aria-label', 'flip back to ' + p.pet); backBtn.title = 'flip back'; backBtn.append(flipIcon()); links.append(backBtn);
    back.append(sq, links);
    const turn = el('div', 'turn'); turn.append(face, back);
    const flip = (on) => { c.classList.toggle('flipped', on); back.inert = !on; face.inert = on; };
    turnBtn.onclick = () => flip(true); backBtn.onclick = () => flip(false); back.inert = true;
    // the sparkles sit outside the part that tilts and turns, so they stay put when the star moves
    c.append(turn, sparkles(h, 12)); return c;
  }

  // ---------- the pet jar: filled to the top with small stars, each holding its pet's icon; shake one out, or tip them all
  // out (back by Astra's choice, 2026-10-27) ----------
  // seeded random, so the pile looks the same until the jar is shaken
  const rand = (seed) => () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9 >>> 0) / 4294967296);
  const miniStar = (e) => {
    const m = el('span'); m.style.setProperty('--c', colorOf('pet-' + e.p.number)); neonStar(m, e.p);
    const svg = svgEl('svg', { viewBox: '-111 -116 229 220', 'aria-hidden': 'true' }); svg.append(svgEl('use', { href: '#star' })); m.append(svg);
    const icon = iconOf(e.p); if (icon) { const im = el('img'); im.src = icon; im.alt = ''; im.loading = 'lazy'; m.append(im); }
    return m;
  };
  function makeJar(id, kind) {
    const box = $(id), jar = box.querySelector('.jar'), inside = box.querySelector('.jar-stars'), hint = box.querySelector('.jar-hint'), all = box.querySelector('.jar-all');
    const shakeBtn = box.querySelector('.shake'), pourBtn = box.querySelector('.pour');
    // every shake adds the pet that fell out to a row of star slots under the jar, and they stay until all are out or put
    // back (Astra, 2026-10-29: "it just keeps extending the parchment paper down below the jar")
    let items = [], caught = [], shaking = false, drawnFor = null;
    const keyOf = (it) => kind.key(it);
    const left = () => items.filter((it) => !caught.includes(keyOf(it)));
    // the next empty slot: a dashed star where the next pet lands
    const slot = () => {
      const s = el('div', 'slot'); s.setAttribute('aria-hidden', 'true');
      const svg = svgEl('svg', { viewBox: '-111 -116 229 220' }); svg.append(svgEl('use', { href: '#star' })); s.append(svg); return s;
    };
    function drawCaught() {
      const byKey = new Map(items.map((it) => [keyOf(it), it]));
      all.replaceChildren(...caught.filter((k) => byKey.has(k)).map((k) => kind.full(byKey.get(k))), ...(left().length ? [slot()] : []));
      all.hidden = false;
    }
    // glints: the same color-matched sparkle as the portrait, twinkling on the stars in the jar
    const glints = el('span', 'sparkles jar-glints'); glints.setAttribute('aria-hidden', 'true'); inside.after(glints);
    // and round the outside of the glass (Astra, 2026-10-29: "full of sparkles ... and on the outside, too")
    // ...held still round it, so they stay where they are when it tips over (Astra, 2026-10-29)
    const ring = sparkles(hash(id + ':ring'), 22); ring.classList.add('ring');
    const wrap = el('span', 'jar-wrap'); jar.before(wrap); wrap.append(jar, ring);
    // the "dink" of the glass jar landing on its side (Astra, 2026-10-29): a short bright ring that dies away
    let audio = null;
    const dink = () => { try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audio.currentTime, g = audio.createGain(); g.connect(audio.destination);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.12, t0 + .005); g.gain.exponentialRampToValueAtTime(.0005, t0 + .9);
      for (const [f, a] of [[1568, 1], [2349, .5], [3520, .25]]) { const o = audio.createOscillator(), og = audio.createGain(); o.type = 'sine'; o.frequency.value = f; og.gain.value = a; o.connect(og); og.connect(g); o.start(t0); o.stop(t0 + 1); }
    } catch {} };
    // each star's color, once its pet's drawing has been read; the jar is filled color by color, in bands like sand art, and
    // each tip goes on to a color not shown yet (Astra, 2026-10-29: "go through the colors", "organize the color")
    const tints = new Map(), TINT_ORDER = NEON.map((n) => n[1]);
    const tintRank = (it) => { const c = tints.get(keyOf(it)); const i = c ? TINT_ORDER.indexOf(c) : -1; return i < 0 ? TINT_ORDER.length : i; };
    let tintsFor = null;
    function readTints(list) {
      if (tintsFor === list) return; tintsFor = list;
      Promise.all(list.map((it) => kind.tint(it).then((c) => tints.set(keyOf(it), c)))).then(() => { if (items === list) fill(list); });
    }
    function fill(list) {
      items = list; readTints(list);
      const placed = [...list].sort((a, b) => tintRank(a) - tintRank(b));
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
      inside.replaceChildren(...placed.map((it, i) => {
        const m = kind.mini(it); m.classList.add('mini');
        m.style.left = (spots[i].x / W) * 100 + '%';
        m.style.top = (spots[i].y / H) * 100 + '%';
        m.style.setProperty('--r', Math.round(r() * 80 - 40) + 'deg');
        m.dataset.key = kind.key(it);
        if (caught.includes(m.dataset.key)) m.classList.add('gone');
        return m;
      }));
      glints.replaceChildren(...placed.flatMap((it, i) => {
        const key = kind.key(it), h = hash(key);
        return Array.from({ length: kind.glints(h) }, (_, g) => {
          const k = hash(h + ':g' + g), a = (k % 628) / 100, d = rad * (.15 + ((k >>> 10) % 50) / 100);
          const s = el('i'); s.dataset.key = key; s.hidden = caught.includes(key);
          s.style.cssText = `--x:${((spots[i].x + Math.cos(a) * d) / W * 100).toFixed(1)}%;--y:${((spots[i].y + Math.sin(a) * d) / H * 100).toFixed(1)}%;--s:${Math.max(6, rad * (.45 + ((k >>> 16) % 40) / 100)).toFixed(1)}px;--d:${((k >>> 20) % 30) / 10}s;--c:${pastel(k)};--dh:0;--l:0`;
          return s;
        });
      }));
      count();
      if (drawnFor !== list) { drawnFor = list; drawCaught(); }
    }
    function count() {
      const n = left().length;
      box.querySelector('.jar-count').textContent = `${n} ${n === 1 ? kind.one : kind.many} in the jar`;
      pourBtn.textContent = n ? `empty the jar (${n})` : 'put them back in the jar';
      shakeBtn.disabled = !n;
    }
    new ResizeObserver(() => fill(items)).observe(inside);
    async function shake() {
      if (shaking || !left().length) return;
      shaking = true; jar.classList.add('shaking');
      const minis = [...inside.children];
      // the color shown least so far (never the last one again, while another is left), then any star of that color at random,
      // one with pictures a little more often
      const shownTimes = (c) => caught.filter((k) => tints.get(k) === c).length, last = tints.get(caught[caught.length - 1]);
      const byTint = new Map(); for (const it of left()) { const c = tints.get(keyOf(it)) || '?'; if (!byTint.has(c)) byTint.set(c, []); byTint.get(c).push(it); }
      const tintsLeft = [...byTint.keys()], fresh = tintsLeft.filter((c) => c !== last), pickFrom = fresh.length ? fresh : tintsLeft;
      const least = Math.min(...pickFrom.map(shownTimes)), next = pickFrom.filter((c) => shownTimes(c) === least);
      const choices = byTint.get(next[Math.floor(Math.random() * next.length)]), withPics = choices.filter(kind.hasPics);
      const pool = withPics.length && Math.random() < .65 ? withPics : choices;
      const pick = pool[Math.floor(Math.random() * pool.length)], key = keyOf(pick);
      const from = minis.find((m) => m.dataset.key === key);
      if (!all.querySelector('.slot')) all.append(slot());
      const into = all.querySelector('.slot');
      const gone = () => { if (from) from.classList.add('gone'); for (const g of glints.children) if (g.dataset.key === key) g.hidden = true; };
      if (reduced) gone();
      else {
        // slow and smooth (Astra, 2026-10-29): the jar tips over to the right and settles on its side, its lid pops off and
        // drops, the star slides out of the mouth and lands on the ground, sparkles shake off it, and it glides down into its
        // slot with them trailing; then the lid is back and the jar stands up again
        const r = jar.getBoundingClientRect(), O = { x: r.left + r.width * .88, y: r.top + r.height * .96 }, T = 5200;
        jar.style.transformOrigin = '88% 96%';
        const lay = (d) => `rotate(${d}deg)`;
        const tip = jar.animate([
          { transform: lay(0) }, { transform: lay(93), offset: .26, easing: 'cubic-bezier(.3, 0, .2, 1)' }, { transform: lay(88), offset: .31 }, { transform: lay(91), offset: .36 },
          { transform: lay(90), offset: .42 }, { transform: lay(90), offset: .76 }, { transform: lay(0), offset: 1 },
        ], { duration: T, easing: 'cubic-bezier(.55, 0, .45, 1)' });
        // the lid, in the jar's own frame: up the jar's axis is to the right while it lies down, and along the axis across is down
        const lid = jar.querySelector('.jar-lid-g');
        const lidOff = lid && lid.animate([
          { transform: 'none', opacity: 1, offset: 0 }, { transform: 'none', opacity: 1, offset: .25 },
          { transform: 'translate(10px, -60px) rotate(35deg)', offset: .32, easing: 'ease-in' },
          { transform: 'translate(118px, -92px) rotate(92deg)', offset: .4, easing: 'ease-out' }, { transform: 'translate(112px, -96px) rotate(88deg)', offset: .44 },
          { transform: 'translate(112px, -96px) rotate(88deg)', opacity: 1, offset: .72 }, { transform: 'translate(112px, -96px) rotate(88deg)', opacity: 0, offset: .78 },
          { transform: 'none', opacity: 0, offset: .9 }, { transform: 'none', opacity: 1, offset: 1 },
        ], { duration: T });
        jar.classList.add('tipped'); setTimeout(dink, T * .26);
        for (const m of minis) {
          const base = `translate(-50%, -50%) rotate(${m.style.getPropertyValue('--r')})`, j = () => `translate(calc(-50% + ${Math.random() * 14 - 7}px), calc(-50% + ${Math.random() * -14}px)) rotate(${Math.random() * 60 - 30}deg)`;
          m.animate([{ transform: base }, { transform: j(), offset: .28 }, { transform: j(), offset: .4 }, { transform: base, offset: .8 }, { transform: base }], { duration: T, easing: 'ease-in-out' });
        }
        // where the mouth is while the jar lies on its side: the top middle, turned a quarter round the bottom right corner
        const M = { x: r.left + r.width * .5, y: r.top + r.height * .08 };
        const mouth = { x: O.x - (M.y - O.y), y: O.y + (M.x - O.x) };
        // while it lies there, sparkles spill out of its mouth and fall down the page
        for (let i = 0; i < 12; i++) setTimeout(() => fall(mouth.x + Math.random() * 12, mouth.y + (Math.random() - .5) * r.width * .4, 20 + Math.random() * 60, 6 + Math.random() * 18, 140 + Math.random() * 200, 1800 + Math.random() * 800), T * .27 + i * 120);
        await new Promise((ok) => setTimeout(ok, T * .36));
        gone();
        const size = from ? from.getBoundingClientRect().width : 40;
        await Promise.all([fly(mouth, O.y, size, pick, into, land), tip.finished.catch(() => {}), lidOff && lidOff.finished.catch(() => {})]);
        jar.style.transformOrigin = ''; jar.classList.remove('tipped');
      }
      jar.classList.remove('shaking');
      if (reduced) land();
      function land() {
        caught.push(key);
        const card = kind.full(pick); card.classList.add('landed'); into.before(card);
        if (!left().length) into.remove();
        return card;
      }
      const card = all.querySelector(`.card:nth-last-child(${left().length ? 2 : 1})`) || all.lastElementChild;
      hint.innerHTML = left().length ? 'Tip it again for another star.<br>Will you get every single pet?' : 'You got every single pet!';
      count();
      card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
      shaking = false;
    }
    // a pastel sparkle let loose at a point in the jar's box: it drifts by (dx, dy), twinkles and fades
    function puff(x, y, dx, dy, ms) {
      const st = box.getBoundingClientRect(), k = (Math.random() * 1e9) >>> 0, s = el('i', 'jar-spark');
      s.style.cssText = `left:${x - st.left}px;top:${y - st.top}px;--s:${8 + (k % 12)}px;--c:${pastel(k)}`;
      box.append(s);
      s.animate([{ transform: 'translate(-50%, -50%) scale(.3) rotate(0)', opacity: 0 }, { transform: `translate(calc(-50% + ${dx * .4}px), calc(-50% + ${dy * .4}px)) scale(1.1) rotate(60deg)`, opacity: 1, offset: .25 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.4) rotate(160deg)`, opacity: 0 }], { duration: ms, easing: 'ease-out' }).finished.then(() => s.remove());
    }
    // a sparkle knocked loose: up and out a little, then falling down the page under its own weight, fading as it goes
    // (Astra, 2026-10-29: "they fall down the page")
    function fall(x, y, dx, up, down, ms) {
      const st = box.getBoundingClientRect(), k = (Math.random() * 1e9) >>> 0, s = el('i', 'jar-spark');
      s.style.cssText = `left:${x - st.left}px;top:${y - st.top}px;--s:${7 + (k % 12)}px;--c:${pastel(k)}`;
      box.append(s);
      s.animate([{ transform: 'translate(-50%, -50%) scale(.4) rotate(0)', opacity: 0 },
        { transform: `translate(calc(-50% + ${dx * .45}px), calc(-50% - ${up}px)) scale(1.1) rotate(90deg)`, opacity: 1, offset: .28, easing: 'ease-in' },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${down}px)) scale(.6) rotate(260deg)`, opacity: 0 }], { duration: ms }).finished.then(() => s.remove());
    }
    // the star slides out of the mouth and drops to the ground with a little bounce; sparkles shake off it there; then it
    // glides into its slot, growing to full size, the sparkles trailing behind it the whole way
    async function fly(mouth, ground, size, it, to, land) {
      const st = box.getBoundingClientRect();
      const f = kind.mini(it); f.classList.add('flyer'); f.style.setProperty('--s', size + 'px');
      f.style.left = mouth.x - size / 2 - st.left + 'px'; f.style.top = mouth.y - size / 2 - st.top + 'px'; box.append(f);
      const at = (x, y, sc, rot) => `translate(${x}px, ${y}px) scale(${sc}) rotate(${rot}deg)`;
      // it falls out like a real thing (Astra, 2026-10-29: "look natural, like something actually falling out of a jar"):
      // pushed out of the mouth, it drops under its own weight, lands with a small bump, rolls like a marble (turning as far
      // as it rolls) all the way to the right edge of the paper, knocks off it, and rolls back until it nearly stops
      const paper = (box.closest('.block') || box).getBoundingClientRect();
      const groundY = ground - size * .5 - mouth.y, wallX = paper.right - size * .55 - mouth.x, rad = size / 2;
      let x = 0, y = 0, vx = 5.6, vy = -1.2, rot = 0, landed = false, knocked = false, prev = performance.now(), t0 = prev;
      await new Promise((done) => {
        (function step(now) {
          const k = Math.min(3, (now - prev) / 16.7); prev = now;
          vy += .38 * k; x += vx * k; y += vy * k;
          if (y >= groundY) {
            y = groundY;
            if (!landed) {
              landed = true;
              // sparkles kick up from where it landed and fall away down the page
              for (let i = 0; i < 18; i++) fall(mouth.x + x + (Math.random() - .5) * size * .6, ground, (Math.random() - .2) * size * 4, size * (.4 + Math.random() * 1.4), 120 + Math.random() * 220, 1600 + Math.random() * 900);
            }
            vy = Math.abs(vy) > 2.4 ? -vy * .22 : 0; // a small bump the first time, then it rolls
            vx *= Math.pow(.995, k); // rolling slows it a little
          }
          if (x >= wallX && vx > 0) {
            x = wallX; vx = -vx * .5; knocked = true;
            for (let i = 0; i < 6; i++) puff(mouth.x + x + rad, mouth.y + y, -10 - Math.random() * 20, (Math.random() - .5) * 30, 1200);
          }
          rot += (vx * k / rad) * (180 / Math.PI);
          f.style.transform = at(x, y, 1, rot);
          if ((knocked && landed && Math.abs(vx) < .7) || now - t0 > 9000) return done();
          requestAnimationFrame(step);
        })(prev);
      });
      // its full star is put in the slot now, unseen, so the falling one can land exactly on it: same place, size and tilt
      const card = land(); card.style.opacity = 0;
      const b = card.getBoundingClientRect(), tilt = parseFloat(getComputedStyle(card).getPropertyValue('--tilt')) || 0;
      const ex = b.left + b.width / 2 - mouth.x, ey = b.top + b.height / 2 - mouth.y, grow = b.width / size;
      // then it tips off, still rolling a little the way it was going, and drops slowly, turning, onto its star
      const endRot = Math.round((rot + 180) / 360) * 360 + tilt;
      const glide = f.animate([
        { transform: at(x, y, 1, rot) }, { transform: at(x - size * .5, y + size * .5, 1.05, rot - 25), offset: .14, easing: 'ease-in' },
        { transform: at(ex, ey, grow, endRot) },
      ], { duration: 2600, easing: 'cubic-bezier(.4, .1, .3, 1)', fill: 'forwards' });
      let trailing = true;
      (function trail() {
        if (!trailing) return;
        const q = f.getBoundingClientRect(); puff(q.left + q.width * (.3 + Math.random() * .4), q.top + q.height * (.3 + Math.random() * .4), (Math.random() - .5) * 30, 10 + Math.random() * 30, 2000);
        setTimeout(trail, 70);
      })();
      await glide.finished; trailing = false;
      // the full star fades in right where the little one lies while the little one fades out, so it does not jump from one
      // look to the other (Astra, 2026-10-29)
      card.classList.remove('landed'); card.style.opacity = '';
      card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'ease-in-out' });
      await f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease-in-out', fill: 'forwards' }).finished;
      f.remove();
    }
    // empty the jar: every one left lands in the row at once; when none are left, they all go back in
    function pour() {
      if (shaking) return;
      if (left().length) caught.push(...left().map(keyOf)); else caught = [];
      hint.innerHTML = left().length ? 'Tip the jar to collect a star.<br>Will you get every single pet?' : 'You got every single pet!';
      drawnFor = null; fill(items);
    }
    jar.addEventListener('click', shake);
    shakeBtn.addEventListener('click', () => { shake(); listenForPhoneShake(shake); });
    pourBtn.addEventListener('click', pour);
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
    return { fill };
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
  const petJar = makeJar('pet-jar', { key: (e) => 'pet-' + e.p.number, mini: miniStar, full: star, hasPics: (e) => e.pics.length > 0, tint: (e) => petNeon(iconOf(e.p)).then((c) => c || colorOf('pet-' + e.p.number)), maxMini: 84, glints: (h) => 2 + (h % 2), one: 'pet', many: 'pets' });

  // ---------- Astra's PetOS as Polaroids: the System Map (live), all the pets at once, and every pet to flip through ----------
  const HUB_PAGES = 'https://findastra.github.io/astras-pet-os/';
  const petsShot = (list) => {
    const g = el('div', 'pet-grid'); g.setAttribute('role', 'img'); g.setAttribute('aria-label', 'All of Astra\'s pets');
    const ims = list.map((p) => { const im = el('img'); im.src = iconOf(p); im.alt = ''; im.loading = 'lazy'; im.title = p.pet; return im; });
    g.append(...ims);
    // laid out as a rainbow, like the jar (Astra, 2026-10-29): once every pet's color is read, they go in by hue
    Promise.all(list.map((p) => petNeon(iconOf(p)))).then((cs) => {
      const rank = (c) => { const i = NEON.findIndex((n) => n[1] === c); return i < 0 ? NEON.length : i; };
      g.append(...ims.map((im, i) => [im, rank(cs[i])]).sort((a, b) => a[1] - b[1]).map((x) => x[0]));
    });
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
    // how far this pet has grown through the hub's four intelligence levels (Astra, 2026-10-29: "that L1 through L4 thing
    // should be on there"), as INTELLIGENCE-LEVELS.md counts them: L2 is its pet program and its runtime together, L3 its
    // agentic harness. The table does not track L1 (the programs it runs) on its own, so L1 shows built once the pet has a
    // program; L4 is the verified human every pet answers to, Astra, so it is always there
    const l2 = !lv ? '—' : lv[0] === '✅' && lv[1] === '✅' ? '✅' : lv[0] !== '—' || lv[1] !== '—' ? '🟡' : '—';
    box.replaceChildren(el('b', null, 'intelligence'), ...(lv ? [`L1 programs ${lv[0] === '—' ? '—' : '✅'}`, `L2 runs itself ${l2}`, `L3 AI agent ${lv[2]}`, 'L4 Astra ✅'] : ['not rated yet']).map((t) => el('div', null, t)));
  };
  function petosCards() {
    const drawn = pets.filter(iconOf), hub = byName['astras-pet-os'], HUB_REPO = 'https://github.com/findastra/astras-pet-os';
    // like the rest: the hub's code and the day it last changed
    const kind = (hub && hub.language) || 'HTML', date = hub ? when(hub.pushed_at) : '';
    return [
      polaroid({ key: 'system-map', name: 'The System Map', kind, date, text: 'Every pet, program and tool in Astra\'s PetOS, and how they work together. Drag it around.',
        // drawn at twice the photo's size, so its key in the top left is big enough to read (Astra, 2026-10-29)
        pics: [{ src: HUB_PAGES + 'system-map-20261012.html', cap: 'The System Map', type: 'frame', label: 'live', view: 2 }], repo: HUB_REPO }),
      // the pets on the bare paper, and the one you flip to a little smaller (Astra, 2026-10-29)
      polaroid({ key: 'all-pets', name: 'The pets', kind, date, text: 'What they all look like. Each one is a small app with a face and a job.', pics: [], shot: petsShot(drawn), clear: true, repo: HUB_REPO,
        // its own sticky note (Astra, 2026-10-29), saying what the grid is
        sticky: (at, box) => box.replaceChildren(el('b', null, 'the pets'), el('div', null, drawn.length + ' drawn'), el('div', null, 'in rainbow order')) }),
      polaroid({ key: 'meet-pets', name: 'Meet every pet', kind, date, repo: HUB_REPO, text: 'One at a time, no shaking needed.',
        pics: drawn.map((p) => ({ src: iconOf(p), cap: p.pet, label: p.pet, fit: 'contain', size: 0.78, clear: true, center: true })), sticky: levelNote(drawn) }),
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
  // each wall of Polaroids gets as many per row as fit near 250px wide, sized so a full row spans the wall exactly: its
  // first and last hang just off the paper, and a short last row sits in the middle (Astra, 2026-10-29). On a phone, or a
  // window as narrow as one, it is one Polaroid under the other, never side by side (Astra, 2026-10-29)
  const sizeWall = (wall) => {
    const w = wall.getBoundingClientRect().width - 1, gap = parseFloat(getComputedStyle(wall).columnGap) || 0;
    const n = w < 560 ? 1 : Math.max(2, Math.round((w + gap) / (250 + gap)));
    wall.style.setProperty('--pw', Math.floor((w - (n - 1) * gap) / n * 10) / 10 + 'px');
  };
  const walls = new ResizeObserver((seen) => seen.forEach((s) => sizeWall(s.target)));
  document.querySelectorAll('.polaroids').forEach((wall) => walls.observe(wall));
  // the header's search finds any words on the page: every match is lit, typing goes to the first, Enter to the next and
  // Shift+Enter back (Astra, 2026-10-28: "that search bar will search anything on the page")
  (() => {
    const box = $('search'), lit = window.CSS && CSS.highlights && window.Highlight;
    let hits = [], at = -1;
    const seen = (n) => { const e = n.parentElement; return e && !e.closest('script, style, header') && e.getClientRects().length > 0; };
    const clear = () => { hits = []; at = -1; if (lit) { CSS.highlights.delete('page-find'); CSS.highlights.delete('page-find-now'); } };
    function go(d) {
      if (!hits.length) return;
      at = (at + d + hits.length) % hits.length;
      if (lit) CSS.highlights.set('page-find-now', new Highlight(hits[at]));
      scrollTo({ top: scrollY + hits[at].getBoundingClientRect().top - innerHeight / 3, behavior: 'smooth' });
    }
    box.addEventListener('input', () => {
      const q = box.value.trim().toLowerCase(); clear(); box.classList.remove('none'); if (!q) return;
      const walk = document.createTreeWalker(document.body, NodeFilter.FILTER_SHOW_TEXT);
      for (let n; (n = walk.nextNode());) {
        const t = (n.nodeValue || '').toLowerCase(); if (!t.includes(q) || !seen(n)) continue;
        for (let i = t.indexOf(q); i >= 0; i = t.indexOf(q, i + q.length)) { const r = new Range(); r.setStart(n, i); r.setEnd(n, i + q.length); hits.push(r); }
      }
      if (lit) CSS.highlights.set('page-find', new Highlight(...hits));
      box.classList.toggle('none', !hits.length); go(1);
    });
    box.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(e.shiftKey ? -1 : 1); } });
  })();
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
        const R = px[i * 4], G = px[i * 4 + 1], B = px[i * 4 + 2], hi = Math.max(R, G, B), lo = Math.min(R, G, B), d = hi - lo;
        // the spot's own hue, brighter than the photo's but still soft, between pastel and vivid (Astra, 2026-10-29: more
        // rainbow, then "dulled down a little bit more towards pastel")
        const hue = !d ? 0 : hi === R ? 60 * (((G - B) / d) % 6) : hi === G ? 60 * ((B - R) / d + 2) : 60 * ((R - G) / d + 4);
        spots.push({ i, sat: hi ? d / hi : 0, light: hi / 255, c: `hsl(${Math.round(hue + 360) % 360} 55% 80%)`, w: r() });
      }
      // deliberate, round her (Astra, 2026-10-29: "around my face and body", "too random"): the spots where the picture changes
      // most, the edges of her face, hair and shoulders, with a little of the color, no two close together
      const lum = (i) => px[i * 4] * .3 + px[i * 4 + 1] * .59 + px[i * 4 + 2] * .11;
      for (const sp of spots) {
        const x = sp.i % N, y = Math.floor(sp.i / N);
        sp.edge = x && y && x < N - 1 && y < N - 1 ? Math.min(1, Math.hypot(lum(sp.i + 1) - lum(sp.i - 1), lum(sp.i + N) - lum(sp.i - N)) / 90) : 0;
      }
      spots.sort((a, b) => (b.edge + b.sat * .25 + b.w * .1) - (a.edge + a.sat * .25 + a.w * .1));
      const picked = [];
      for (const sp of spots) {
        if (picked.length >= 64) break;
        const x = sp.i % N, y = Math.floor(sp.i / N);
        if (picked.every((q) => Math.hypot(q.i % N - x, Math.floor(q.i / N) - y) >= 3)) picked.push(sp);
      }
      // and the first ones back too (Astra, 2026-10-29: keep these and "put those back on"): her most colorful, brightest
      // spots, with a little chance so they spread over the whole picture
      const first = [...spots].sort((a, b) => (b.sat * .7 + b.light * .3 + b.w * .5) - (a.sat * .7 + a.light * .3 + a.w * .5)).slice(0, 70);
      for (const sp of first) if (!picked.includes(sp)) picked.push(sp);
      // sizes vary, now and then a big one (Astra, 2026-10-29)
      const size = (k) => (k % 9 === 0 ? 22 + ((k >>> 4) % 14) : 6 + (k % 13));
      const one = (x, y, c, k) => {
        const s = el('i');
        s.style.cssText = `--x:${x.toFixed(1)}%;--y:${y.toFixed(1)}%;--s:${size(k)}px;--d:${((k >>> 8) % 40) / 10}s;--c:${c};--dh:${[-150, -100, -50, 0, 50, 100, 150][(k >>> 12) % 7]};--l:0`;
        return s;
      };
      // and a scatter over the whole square, a little past its edges too, so no part of it is bare
      const cover = [];
      for (let gy = 0; gy < 6; gy++) for (let gx = 0; gx < 6; gx++) {
        const k = hash('c' + gx + ':' + gy), x = -6 + gx * 22.4 + (k % 100) / 100 * 16, y = -6 + gy * 22.4 + ((k >>> 7) % 100) / 100 * 16;
        cover.push(one(x, y, `hsl(${k % 360} 55% 80%)`, k));
      }
      box.replaceChildren(...picked.map((sp) => one((sp.i % N + .5) / N * 100, (Math.floor(sp.i / N) + .5) / N * 100, sp.c, hash('p' + sp.i))), ...cover);
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
  // Each column spells, top to bottom, "find the stars" (or "find Astra") in one of many languages, then starts another
  // (Astra, 2026-10-29). Only scripts whose letters stand alone are used, so a word drawn one letter at a time still reads;
  // Arabic, Hindi and Thai join or stack their letters and would come out broken this way. Latin "astra" means "the stars".
  const FIND = [
    'find Astra', 'find the stars', 'ad astra', 'quaere astra', '星を探して', '星を見つけて', 'アストラを探して', '별을 찾아', '별을 찾아서', '아스트라를 찾아',
    '寻找星星', '尋找星星', 'encuentra las estrellas', 'trouve les étoiles', 'finde die Sterne', 'trova le stelle', 'encontre as estrelas',
    'найди звёзды', 'знайди зірки', 'βρες τα αστέρια', 'מצא את הכוכבים', 'yıldızları bul', 'vind de sterren', 'hitta stjärnorna', 'znajdź gwiazdy',
    'löydä tähdet', 'tìm những vì sao', 'temukan bintang', 'hanapin ang mga bituin', 'trovu la stelojn', 'aimsigh na réaltaí', 'find stjernerne',
  ].map((s) => Array.from(s));
  const cv = $('rain'), cx = cv.getContext('2d'); let cols = [];
  const word = () => ({ w: FIND[Math.floor(Math.random() * FIND.length)], at: 0 });
  const size = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; cols = Array(Math.ceil(cv.width / 16)).fill(0).map(() => Object.assign(word(), { y: Math.random() * cv.height })); };
  size(); new ResizeObserver(size).observe(cv);
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
    cx.font = '14px "JetBrains Mono", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", sans-serif'; cx.textAlign = 'center';
    const t = performance.now() / 40;
    cols.forEach((col, i) => {
      const y = col.y;
      const pal = PALETTES[palette], k = (i * 9 + y / 6 + t) % 360;
      const color = `hsl(${pal.from + (pal.span === 360 ? k : Math.abs(((k / 360) * 2 * pal.span) % (2 * pal.span) - pal.span))} 100% ${unmasked ? 55 : 62}%)`;
      // unmasked: deep colored code on white, glowing in its color (Astra, 2026-10-29: more colorful; it was black)
      if (unmasked) { cx.fillStyle = color.replace(/ 55%\)$/, ' 40%)'); cx.shadowColor = color; cx.shadowBlur = 8; } else { cx.fillStyle = color; cx.shadowBlur = 0; }
      // the next letter of this column's words; a short gap after them, then new words in another language
      const ch = col.w[col.at]; if (ch && ch !== ' ') cx.fillText(ch, i * 16 + 8, y);
      col.at++; col.y = y + 16;
      if (col.at > col.w.length + 3) Object.assign(col, word());
      if (col.y > cv.height + Math.random() * 1e4) Object.assign(col, word(), { y: 0 });
    });
    cx.textAlign = 'start';
    setTimeout(() => requestAnimationFrame(rain), 60);
  })();

  // ---------- the pole on the left (from Mommy's website): the section you are on lights up; click a floor to go there ----------
  (() => {
    const marks = [...document.querySelectorAll('.floors a')], secs = marks.map((a) => $(a.dataset.f));
    let asked = -1; // a floor clicked, until the visitor scrolls on their own
    function onScroll() {
      let at = asked;
      if (at < 0) { at = 0; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= Math.min(90, innerHeight * .15)) at = i; }); }
      marks.forEach((a, i) => { a.classList.toggle('on', i === at); if (i === at) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
      // both rails' sparkles take this floor's color (Astra, 2026-10-29); where they sit is the scroll bar's job, below
      document.documentElement.style.setProperty('--now', getComputedStyle(marks[at]).getPropertyValue('--c').trim());
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

  // ---------- the terminal's paired lights, as on the pet program pages (astras-pet-os pet-program-page-20261018.js): left
  // ON/OFF, right checked and works or report issues. Each click moves a light to its next state and a bubble under it says
  // what that state means, for four seconds; saved in this browser only (Astra, 2026-10-29) ----------
  (() => {
    const term = document.querySelector('.term'), on = term.querySelector('.light.onoff'), care = term.querySelector('.light.care');
    const KEY = 'findastra-terminal-lights';
    let s; try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { s = {}; }
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
    const tip = el('div', 'light-bubble'); tip.setAttribute('role', 'status'); tip.hidden = true; document.body.append(tip);
    let tipTimer = 0;
    const say = (b, text) => {
      tip.textContent = 'terminal: ' + text; tip.hidden = false;
      const r = b.getBoundingClientRect(), w = document.documentElement.clientWidth;
      tip.style.left = scrollX + Math.max(8, Math.min(r.left - 8, w - tip.offsetWidth - 8)) + 'px'; tip.style.top = scrollY + r.bottom + 8 + 'px';
      clearTimeout(tipTimer); tipTimer = setTimeout(() => (tip.hidden = true), 4000);
    };
    const paint = () => {
      const off = s.power === 'off', fix = s.health === 'fix';
      on.classList.toggle('is-off', off); on.setAttribute('aria-pressed', String(!off)); on.setAttribute('aria-label', 'terminal: ' + (off ? 'off' : 'on'));
      care.classList.toggle('is-fix', fix); care.setAttribute('aria-label', 'terminal: ' + (fix ? 'report issues' : 'checked, works'));
      term.classList.toggle('is-off', off);
    };
    on.addEventListener('click', () => {
      s.power = s.power === 'off' ? 'on' : 'off'; save(); paint();
      say(on, s.power === 'off' ? 'off (the kill switch). Click again to turn it back on.' : 'on. Click again to switch it off.');
    });
    care.addEventListener('click', () => {
      if (s.health === 'fix') delete s.health; else s.health = 'fix';
      save(); paint();
      say(care, s.health === 'fix' ? 'report issues: you reported one. Click again to take it back.' : 'checked, works.');
    });
    paint();
  })();

  // ---------- the scroll bar: the pole's sparkle rides it with the page; drag it to scroll (Astra, 2026-10-29) ----------
  (() => {
    // it sits on a section's floor label exactly while that section is at the top of the paper, and slides between labels in
    // step with the page between them (Astra, 2026-10-29: it was moving with the whole page, not the section you are on)
    const pole = $('pole'), bead = $('bead'), marks = [...document.querySelectorAll('.floors a')];
    const max = () => document.documentElement.scrollHeight - innerHeight;
    const knots = () => {
      const p = pole.getBoundingClientRect(), half = bead.offsetHeight / 2, room = pole.clientHeight - bead.offsetHeight, m = max();
      let last = 0;
      return marks.map((a, i) => {
        const s = $(a.dataset.f), r = a.getBoundingClientRect();
        const at = i === 0 || !s ? 0 : Math.min(m, Math.max(last, s.getBoundingClientRect().top + scrollY - 90));
        last = at;
        return { s: at, y: Math.min(room, Math.max(0, r.top + r.height / 2 - p.top - half)) };
      });
    };
    // straight lines between the knots, read either way: page to pole, or pole to page while the sparkle is dragged
    const lerp = (k, v, from, to) => {
      if (v <= k[0][from]) return k[0][to];
      for (let i = 1; i < k.length; i++) if (v <= k[i][from]) { const a = k[i - 1], b = k[i], span = b[from] - a[from]; return span ? a[to] + (b[to] - a[to]) * (v - a[from]) / span : b[to]; }
      return k[k.length - 1][to];
    };
    const place = () => { bead.style.top = lerp(knots(), scrollY, 's', 'y') + 'px'; };
    let grab = 0; // where on the sparkle it was taken hold of, so it does not jump under the pointer
    const to = (y) => scrollTo({ top: lerp(knots(), y - pole.getBoundingClientRect().top - grab, 'y', 's'), behavior: 'instant' });
    bead.addEventListener('pointerdown', (e) => { grab = e.clientY - bead.getBoundingClientRect().top; bead.setPointerCapture(e.pointerId); bead.classList.add('held'); e.preventDefault(); });
    bead.addEventListener('pointermove', (e) => { if (bead.classList.contains('held')) to(e.clientY); });
    for (const t of ['pointerup', 'pointercancel']) bead.addEventListener(t, () => bead.classList.remove('held'));
    addEventListener('scroll', place, { passive: true }); addEventListener('resize', place); new ResizeObserver(place).observe(document.body); place();
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
      const b = bun.getBoundingClientRect(), r = lane.getBoundingClientRect();
      // just a small ring of the page's own pastel sparkles, about a seventh the size it was (Astra, 2026-10-29: the big burst
      // was "obnoxious and way too big")
      {
        const burst = el('span', 'sparkles rabbit-burst'); burst.setAttribute('aria-hidden', 'true');
        burst.style.cssText = `left:${b.left - r.left + b.width / 2}px;top:${b.top - r.top + b.height / 2}px`;
        for (let i = 0; i < 8; i++) { const k = hash('bun' + i + Date.now()), a = (i / 8) * Math.PI * 2; burst.append(sparkle(k, (50 + 42 * Math.cos(a)).toFixed(1), (50 + 42 * Math.sin(a)).toFixed(1), 5 + (k % 5))); }
        lane.append(burst); setTimeout(() => burst.remove(), 2400);
      }
      stop();
    });
    later(4000);
  })();
})();
