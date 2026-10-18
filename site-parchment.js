// Fills the page from profile-data.js, the live GitHub API, and the site-data.js snapshot.
// All fetched text goes through textContent, never innerHTML.
(() => {
  const P = window.PROFILE || {};
  const S = window.SITE || { repos: [], pets: [] };
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const NOTES = ['var(--paper)', 'var(--pink)', 'var(--periwinkle)', 'var(--lilac)', 'var(--aqua)'];

  // ---- Plain sheet ----
  if (P.name) $('p-name').textContent = P.name;
  const list = (id, items) => {
    if (!items || !items.length) return;
    const ul = $(id);
    ul.replaceChildren(...items.map((t) => el('li', null, t)));
  };
  if (P.about && P.about.length) $('p-about').replaceChildren(...P.about.map((t) => el('p', null, t)));
  list('p-languages', P.languages);
  list('p-skills', P.skills);

  // ---- Work ----
  const positions = P.positions || [];
  if (positions.length) {
    $('p-work-note').hidden = true;
    $('p-work').replaceChildren(...positions.map((p) => {
      const li = el('li');
      const a = el('a', null, p.employer);
      a.href = 'work/' + encodeURIComponent(p.slug) + '.html';
      const strong = el('strong');
      strong.append(a);
      li.append(strong, el('div', null, p.role), el('div', 'when', [p.start, p.end || 'now'].filter(Boolean).join(' – ')));
      return li;
    }));
  }

  // ---- Projects: live, falling back to the snapshot ----
  const hidden = (r) => /^pet-program-\d+$/.test(r.name) || /^Moved:/.test(r.description || '') || r.name === 'findastra.github.io';
  const when = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? '' : 'updated ' + d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const renderProjects = (repos, source) => {
    $('projects-source').textContent = source;
    $('project-list').replaceChildren(...repos.filter((r) => !hidden(r)).map((r, i) => {
      const a = el('a', 'card');
      a.href = r.homepage || 'https://github.com/findastra/' + encodeURIComponent(r.name);
      a.style.setProperty('--note', NOTES[i % NOTES.length]);
      a.style.setProperty('--r', ((i * 37) % 5 - 2) * 0.5 + 'deg');
      if (i % 3 === 1) a.dataset.tex = 'linen';
      a.append(el('span', 'tag', r.language || 'notes & plans'), el('strong', null, r.name), el('span', null, r.description || 'No description yet.'), el('span', 'meta', when(r.pushed_at)));
      return a;
    }));
  };
  renderProjects(S.repos, 'From a snapshot taken ' + (S.snapshot || 'earlier') + '. Checking GitHub for newer…');
  fetch('https://api.github.com/users/findastra/repos?per_page=100&sort=pushed')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => renderProjects(
      data.filter((r) => !r.fork && !r.private).map((r) => ({ name: r.name, description: r.description, language: r.language, pushed_at: r.pushed_at, homepage: r.homepage })),
      'Live from GitHub, newest first.'))
    .catch(() => { $('projects-source').textContent = 'GitHub could not be reached, so this is the snapshot from ' + (S.snapshot || 'earlier') + '.'; });

  // ---- Pets ----
  // Their pictures live in the hub (one art source, Flash Audit A58); its art/frames/index.json names each frame.
  const HUB = 'https://raw.githubusercontent.com/findastra/astras-pet-os/main/';
  const frames = fetch(HUB + 'art/frames/index.json').then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then((ix) => ix.pets || {}).catch(() => ({}));
  $('pet-list').replaceChildren(...S.pets.map((p, i) => {
    const a = el('a', 'pet');
    a.href = 'https://github.com/findastra/' + encodeURIComponent(p.repo);
    a.title = p.job || '';
    const img = el('img');
    frames.then((pets) => { const idle = pets[p.art] && pets[p.art].frames && pets[p.art].frames.idle; if (idle) img.src = HUB + idle; });
    img.alt = '';
    img.width = 72; img.height = 72;
    img.style.setProperty('--d', (i % 6) * -0.4 + 's');
    a.append(img, el('strong', null, p.pet), el('span', null, p.status));
    return a;
  }));
})();
