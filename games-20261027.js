// The arcade's newer games (Astra, 2026-10-27): the Fuzzboi Factory and the Fuzzboi Cyber Dome it fills, and the two games from
// Mommy's website (findastra/mommys-website): the sparkle catcher ("Catch the beat") and the Avatar Lab. The cabinets stay
// black and gray; the art inside them keeps its own colors. Fuzzboi rules and drawing come from the Fuzzboi Factory itself
// (findastra/fuzzboi-factory site/fuzzboi.js, served at findastra.github.io/fuzzboi-factory/), one copy of the rules.
(() => {
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  // a canvas drawn at the screen's pixel density; returns its size in CSS pixels
  const fit = (cv) => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); cv.getContext('2d').setTransform(d, 0, 0, d, 0, 0); return r; };

  // ---------- Fuzzboi Factory: type a six-digit code, get that exact Fuzzboi; each one moves into the Cyber Dome ----------
  const RULES = 'https://findastra.github.io/fuzzboi-factory/site/fuzzboi.js';
  const LAYERS = 'https://raw.githubusercontent.com/findastra/astras-pet-os/main/desktop-art/fuzzboi-friend/layers/';
  // the dome holds up to 67; the 67th breaks it (Astra, 2026-10-29: "Let's do 67. We'll break it.")
  const HOME_MAX = 67, HOME_KEY = 'findastra-fuzzboi-home-v1';
  const layers = new Map();
  let F = null, layersIn = 0;
  const factoryCv = $('fz-cv'), note = $('fz-note');
  // six big boxes, one per digit, each with what it decides written under it, as on the Fuzzboi Factory's own page
  // (Astra, 2026-10-27: "I liked it when I could enter them in and it was big and obvious")
  const POS = ['Style', 'Color', 'Acc 1', 'Acc 2', 'Acc 3', 'Rare?'];
  const boxes = POS.map((label, i) => {
    const w = el('label', 'fz-digit'), inp = el('input'); inp.maxLength = 1; inp.inputMode = 'numeric'; inp.autocomplete = 'off'; inp.spellcheck = false; inp.setAttribute('aria-label', `Position ${i + 1}: ${label}`);
    w.append(inp, el('span', null, label)); $('fz-digits').append(w); return inp;
  });
  const codeIn = { get value() { return boxes.map((b) => b.value).join('').toUpperCase(); }, set value(v) { [...String(v).padEnd(6, ' ').slice(0, 6)].forEach((ch, i) => (boxes[i].value = ch.trim())); } };
  boxes.forEach((inp, i) => {
    inp.addEventListener('input', async () => {
      // numbers only (Astra, 2026-10-29)
      inp.value = inp.value.replace(/[^0-9]/g, '').slice(-1);
      if (inp.value && i < 5) { boxes[i + 1].focus(); boxes[i + 1].select(); }
      if (codeIn.value.length === 6) { await ready; make(codeIn.value); }
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && i > 0) boxes[i - 1].focus();
      if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
      if (e.key === 'ArrowRight' && i < 5) boxes[i + 1].focus();
    });
    inp.addEventListener('paste', async (e) => {
      const t = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '');
      if (t.length > 1) { e.preventDefault(); codeIn.value = t.slice(0, 6); if (t.length >= 6) { await ready; make(codeIn.value); } }
    });
  });
  const loadScript = (src) => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.append(s); });
  const ready = (async () => {
    try { await loadScript(RULES); F = window.Fuzzboi; } catch { note.textContent = 'The Fuzzboi Factory did not answer. Try again in a minute.'; return; }
    try { layersIn = await F.loadLayers(LAYERS, layers, true); } catch {}
  })();
  // draws one Fuzzboi on a transparent canvas (the home has its own background); a rough stand-in if the art did not load
  function sprite(p, px) {
    const c = document.createElement('canvas'); c.width = c.height = px;
    const x = c.getContext('2d');
    if (!F.missing(p, layers).length) {
      const want = new Set(['fill', 'outline', 'eyes', ...p.accs.map(F.accLayer), ...p.rares.map((r) => 'rare' + r)]);
      for (const slot of F.STACK) {
        if (!want.has(slot)) continue;
        x.drawImage(layers.get(slot === 'fill' ? 'fill' + p.style + p.color : slot === 'outline' ? 'outline' + p.style : slot), 0, 0, px, px);
      }
    } else {
      const big = document.createElement('canvas'); F.drawStandIn(big, p); x.drawImage(big, 0, 0, px, px);
    }
    return c;
  }
  // a Fuzzboi in its layers, for the dome and the page (Astra, 2026-10-29): its base (body, outline, eyes) always there, and
  // each accessory and rare part on its own layer, so they can flash in one after another and fade away again. Layers keep the
  // art's own stacking order; base layers next to each other share one canvas
  function layered(p, px) {
    if (F.missing(p, layers).length) return { parts: [{ c: sprite(p, px), extra: false }], extras: 0 };
    // every accessory and rare part comes and goes (Astra, 2026-10-29: "I like the way their accessories turn on and off")
    const want = new Set(['fill', 'outline', 'eyes', ...p.accs.map(F.accLayer), ...p.rares.map((r) => 'rare' + r)]), base = new Set(['fill', 'outline', 'eyes']), parts = [];
    for (const slot of F.STACK) {
      if (!want.has(slot)) continue;
      const extra = !base.has(slot), last = parts[parts.length - 1];
      let c = !extra && last && !last.extra ? last.c : null;
      if (!c) { c = document.createElement('canvas'); c.width = c.height = px; parts.push({ c, extra }); }
      c.getContext('2d').drawImage(layers.get(slot === 'fill' ? 'fill' + p.style + p.color : slot === 'outline' ? 'outline' + p.style : slot), 0, 0, px, px);
    }
    // the smoke cloud is drawn right to the edge of its square, so where the square cuts it off it would show a straight
    // edge; only that last strip at the border fades away, so the cloud keeps its black outline everywhere else (Astra,
    // 2026-10-29: "I want to see the black outline of the smoke")
    for (const q of parts) {
      if (!q.extra) continue;
      const x = q.c.getContext('2d'), e = px * .07;
      x.globalCompositeOperation = 'destination-out';
      for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [[0, 0, e, 0, 0, 0, e, px], [px, 0, px - e, 0, px - e, 0, e, px], [0, 0, 0, e, 0, 0, px, e], [0, px, 0, px - e, 0, px - e, px, e]]) {
        const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0, 0, 0, 0)'); x.fillStyle = g; x.fillRect(rx, ry, rw, rh);
      }
      x.globalCompositeOperation = 'source-over';
    }
    return { parts, extras: parts.filter((q) => q.extra).length };
  }
  // how strongly each extra shows at time t: in turn, a little apart, then all of them a moment, then fading together;
  // then only the base for a while, each Fuzzboi on its own clock
  const FLASH_STEP = 450, FLASH_HOLD = 1600, FLASH_FADE = 800;
  function flashes(f, t) {
    const n = f.look.extras, per = f.flashEvery, u = (((t - f.flashAt) % per) + per) % per, end = n * FLASH_STEP + FLASH_HOLD;
    return Array.from({ length: n }, (_, i) => { const a0 = i * FLASH_STEP; return u < a0 ? 0 : u < a0 + 300 ? (u - a0) / 300 : u < end ? 1 : u < end + FLASH_FADE ? 1 - (u - end) / FLASH_FADE : 0; });
  }
  function drawFuzz(x, f, left, top, size, t) {
    const a = reduced ? f.look.parts.map(() => 1) : flashes(f, t), was = x.globalAlpha; let k = 0;
    for (const q of f.look.parts) { const al = q.extra ? a[k++] : 1; if (al > 0) { x.globalAlpha = was * al; x.drawImage(q.c, left, top, size, size); } }
    x.globalAlpha = was;
  }
  function make(code, moveIn = false) {
    if (!F) return;
    const d = F.decode(code);
    if (!/^[0-9A-F]{6}$/.test(d.code)) { note.textContent = d.flags.map((f) => f[1]).join(' '); return; }
    codeIn.value = d.code;
    if (F.missing(d.parts, layers).length) F.drawStandIn(factoryCv, d.parts); else F.drawLayers(factoryCv, d.parts, layers);
    $('fz-traits').replaceChildren(...F.describe(d.parts).flatMap(([k, v, swatch]) => {
      const dd = el('dd', null, v); if (swatch) { const i = el('i'); i.style.background = swatch; dd.prepend(i); }
      return [el('dt', null, k), dd];
    }));
    const said = d.flags.map((f) => f[1]);
    if (layersIn < F.EXPECTED.length) said.unshift(layersIn ? `Only ${layersIn} of ${F.EXPECTED.length} art layers loaded, so parts are a stand-in.` : 'The art layers did not load, so this is a stand-in sketch, not the art.');
    if (moveIn) said.push(home.add(d.code));
    note.textContent = said.filter(Boolean).join(' ');
    // a made Fuzzboi gets a link of its own (#fuzzboi-456900 opens it and moves it in)
    if (moveIn) try { history.replaceState(null, '', '#fuzzboi-' + d.code); } catch {}
  }
  $('fz-form').addEventListener('submit', async (e) => { e.preventDefault(); await ready; make(codeIn.value); });
  $('fz-random').onclick = async () => { await ready; make(String(Math.floor(Math.random() * 1e6)).padStart(6, '0')); };
  // tap the Fuzzboi itself to save it, too (Astra, 2026-10-27: "make sure people can save it directly from there")
  factoryCv.title = 'Tap to save this Fuzzboi'; factoryCv.style.cursor = 'pointer'; factoryCv.onclick = () => $('fz-save').click();
  $('fz-send').onclick = async () => { await ready; if (F && codeIn.value.length === 6) { note.textContent = home.add(codeIn.value); $('home').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); } };
  $('fz-save').onclick = async () => { await ready; if (F && codeIn.value.length === 6) F.savePng(factoryCv, `fuzzboi-${codeIn.value}.png`).catch(() => (note.textContent = 'This browser would not save the picture.')); };

  // ---------- the Cyber Dome (it was the cyber home): every Fuzzboi made above moves in, up to 30; they bounce around like
  // particles and boing off each other (Astra, 2026-10-27) ----------
  const home = (() => {
    // the dome is a sphere drawn as a white grid that slowly turns (Astra, 2026-10-27: "just a big sphere that's a grid"); each
    // Fuzzboi lives at x, y, z inside it (the sphere's radius is 1), smaller at the back, bigger at the front
    const cv = $('home'), main = cv.getContext('2d'), gcv = document.createElement('canvas'), gx = gcv.getContext('2d');
    let cx = main; // the broken dome draws its sphere off screen first (gx), then cuts the pieces from it
    let W = 0, H = 0, picked = null, turn = 0, hue = 0;
    // the sparkles kept in the dome: none to begin with; the Fuzzbois knock them off the walls (Astra, 2026-10-29)
    const motes = [], stamps = new Map();
    const stamp = (c) => {
      if (stamps.has(c)) return stamps.get(c);
      const k = document.createElement('canvas'); k.width = k.height = 32; const x = k.getContext('2d'), q = 16 * .22;
      x.fillStyle = c; x.beginPath(); x.moveTo(16, 0); x.lineTo(16 + q, 16 - q); x.lineTo(32, 16); x.lineTo(16 + q, 16 + q); x.lineTo(16, 32); x.lineTo(16 - q, 16 + q); x.lineTo(0, 16); x.lineTo(16 - q, 16 - q); x.closePath(); x.fill();
      stamps.set(c, k); return k;
    };
    const keepMote = (x, y, c) => { const b = Math.random() * 7, sp = .002 + Math.random() * .004; motes.push({ x, y, vx: Math.cos(b) * sp, vy: Math.sin(b) * sp, s: 3 + Math.random() * 6, c, t: Math.random() * 7 }); };
    const folks = [], boings = [];
    function resize() { const r = fit(cv); W = r.width; H = r.height; }
    new ResizeObserver(resize).observe(cv); resize();
    const R = () => Math.min(W, H) * .46;
    // one size for a Fuzzboi everywhere (Astra, 2026-10-29: "always be the same size ... when they were small, they looked
    // pretty good"): FUZZ_PX across, in the dome (as a share of the sphere, so they look the same there) and out on the page
    const FUZZ_PX = 52;
    const share = () => FUZZ_PX / (R() * 2 * .85 || 1);
    const rand = () => Math.random() * 2 - 1;
    function spawn(code) {
      const p = F.decode(code).parts, sp = .008 + Math.random() * .005;
      let v = [rand(), rand(), rand()], n = Math.hypot(...v) || 1; v = v.map((x) => (x / n) * sp);
      // shed: how many sparkles this one knocks off the walls, more or fewer than the next, so every dome fills differently
      // (Astra, 2026-10-29); a rare one sheds more. tints: its body color and its background, the colors its sparkles come in
      const fill = (F.FILL[p.style] || [])[p.color - 1] || '#' + code;
      return { code, shed: (.4 + Math.random() * 1.6) * (p.rares && p.rares.length ? 1.6 : 1), tints: [fill.replace('#', ''), code], look: layered(p, 160), flashAt: performance.now() + Math.random() * 6000, flashEvery: 8000 + Math.random() * 6000, x: rand() * .3, y: rand() * .3, z: .5, vx: v[0], vy: v[1], vz: v[2], squash: 0, spin: 0, born: performance.now() };
    }
    function save() { store.set(HOME_KEY, folks.map((f) => f.code)); count(); }
    const inside = () => folks.filter((f) => !f.out), outside = () => folks.filter((f) => f.out);
    // the fuller it gets, the wilder (Astra, 2026-10-29: "the whole thing's a scale"): rage runs from 0 to 1 with whichever meter
    // is further along, Fuzzbois or sparkles; they speed up, shove and spin more and more, and the dome glows through the rainbow
    // and shakes harder, until at 1 it breaks. The alarm sounds once as rage passes three quarters
    // nobody inside, nothing to rage about: an empty dome stays calm whatever the meters say
    const rage = () => (inside().length ? Math.min(1, Math.max(inside().length / HOME_MAX, motes.length / SPARK_MAX, hits / HITS_MAX)) : 0);
    const crowded = () => rage() >= .6;
    let alarmed = false;
    let audio = null;
    function alarm() {
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        const o = audio.createOscillator(), g = audio.createGain(), t0 = audio.currentTime;
        o.type = 'sawtooth'; o.connect(g); g.connect(audio.destination);
        for (let i = 0; i < 3; i++) { o.frequency.setValueAtTime(620, t0 + i * .4); o.frequency.linearRampToValueAtTime(940, t0 + i * .4 + .3); }
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.07, t0 + .03); g.gain.setValueAtTime(.07, t0 + 1.1); g.gain.linearRampToValueAtTime(0, t0 + 1.25);
        o.start(t0); o.stop(t0 + 1.3);
      } catch {}
    }
    function count() {
      const n = outside().length, k = inside().length;
      $('home-count').textContent = broken ? `the dome is broken · ${n} loose on the page` : n ? `${k} in the dome · ${n} loose on the page` : `${k} moved in`;
      $('home-out').disabled = !folks.length || !!broken; $('home-out').textContent = n ? 'call them all home' : 'let them out';
      $('home-clear').disabled = !folks.length;
      $('home-pick').textContent = broken ? 'It broke! Drag each piece back where it goes. Tap a piece to turn it.' : crowded() ? `Too crowded! ${k} in there and they are furious. Let some out.` : n ? 'Catch one: grab it, drag it back over the dome and let go.' : picked ? `#${picked.code}` : folks.length ? 'Tap a Fuzzboi to see its code.' : 'Nobody lives here yet. Make a Fuzzboi above and send it in.';
      // the counter: how many are in, how many more until it breaks (Astra, 2026-10-29)
      const meter = $('dome-meter');
      if (meter) {
        const fz = meter.querySelector('.fuzz');
        fz.querySelector('b').textContent = broken ? '✦' : k;
        fz.querySelector('span').textContent = broken ? 'put the dome back together' : `/ ${HOME_MAX} fuzzbois`;
        fz.style.setProperty('--fill', broken ? 1 : k / HOME_MAX); fz.classList.toggle('hot', !broken && crowded());
        meterSparks();
      }
    }
    // the sparkle meter: every sparkle they knock off the walls stays in the dome, up to SPARK_MAX, and that many breaks it too
    // (Astra, 2026-10-29: "a sparkle counter, and then ... a fuzzboy counter. And if either one of them meets the threshold")
    // three meters (Astra, 2026-10-29: "sparkles generated, fuzz boys, and collisions"): any one full breaks it
    const SPARK_MAX = 6667, HITS_MAX = 1667;
    let hits = 0, shownSparks = -1, shownHits = -1;
    function meterSparks() {
      const meter = $('dome-meter'); if (!meter) return;
      const fill = (row, n, max, what) => {
        row.querySelector('b').textContent = broken ? '✦' : n;
        row.querySelector('span').textContent = broken ? 'they all burst out' : `/ ${max} ${what}`;
        row.style.setProperty('--fill', broken ? 1 : n / max); row.classList.toggle('hot', !broken && n > max * .6);
      };
      const m = broken ? 0 : motes.length, h = broken ? 0 : hits;
      if (m !== shownSparks) { shownSparks = m; fill(meter.querySelector('.spark'), m, SPARK_MAX, 'sparkles'); }
      if (h !== shownHits) { shownHits = h; fill(meter.querySelector('.hits'), h, HITS_MAX, 'collisions'); }
    }
    // let them out (Astra, 2026-10-29): every Fuzzboi bursts out of the dome onto the whole page, not just the window, so
    // they bounce off up and down it and go off screen, leaving pastel sparkles behind them. Grab one, drag it back over the
    // dome (scrolling as you hold it) and let go to put it back; let go anywhere else and it bounces off again.
    const layer = document.createElement('div'); layer.className = 'fuzz-loose'; layer.setAttribute('aria-hidden', 'true');
    const page = () => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight });
    const bodySize = () => FUZZ_PX;
    let held = null, lastPt = null, roaming = 0, trailT = 0;
    const overDome = (cx0, cy0) => { const r = cv.getBoundingClientRect(); return cx0 > r.left && cx0 < r.right && cy0 > r.top && cy0 < r.bottom; };
    function goHome(f) {
      if (!f.out) return; // already home (called home while it was still shrinking into the dome)
      f.out = false; f.sinking = false; if (f.node) f.node.remove(); f.node = null; f.born = performance.now(); f.x = rand() * .4; f.y = rand() * .4; f.z = rand() * .4;
      if (!outside().length) { layer.remove(); cancelAnimationFrame(roaming); roaming = 0; const av = document.getElementById('labSvg'); if (av) av.classList.remove('happy'); }
      // putting them back never breaks it (Astra, 2026-10-29: "You can just put them back in"); only a new one sent in can
      count();
    }
    // dropped on the dome, it stays its size until it is over the sphere, then shrinks down into it (Astra, 2026-10-29)
    function sinkHome(f) {
      const r = cv.getBoundingClientRect(), tx = r.left + r.width / 2 + scrollX, ty = r.top + r.height / 2 + scrollY, s = bodySize(), node = f.node;
      f.sinking = true;
      node.animate([{ transform: node.style.transform }, { transform: `translate(${tx - s / 2}px, ${ty - s / 2}px) scale(.25)`, opacity: .4 }], { duration: reduced ? 1 : 520, easing: 'ease-in' })
        .finished.then(() => { f.sinking = false; goHome(f); });
    }
    function free(f, x, y, vx, vy) {
      const c2 = document.createElement('canvas'); c2.width = c2.height = 160; c2.className = 'fuzz';
      Object.assign(f, { out: true, node: c2, px: x, py: y, pvx: vx, pvy: vy, psq: 0, pspin: 0 });
      c2.addEventListener('pointerdown', (e) => { held = f; f.orbit = null; lastPt = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0 }; c2.setPointerCapture(e.pointerId); c2.classList.add('held'); e.preventDefault(); });
      c2.addEventListener('pointermove', (e) => {
        if (held !== f) return;
        const t = performance.now(), dt = Math.max(1, t - lastPt.t);
        lastPt = { x: e.clientX, y: e.clientY, t, vx: (e.clientX - lastPt.x) / dt * 16, vy: (e.clientY - lastPt.y) / dt * 16 };
        f.px = e.clientX + scrollX; f.py = e.clientY + scrollY;
      });
      const drop = (e) => {
        if (held !== f) return;
        held = null; c2.classList.remove('held');
        if (overDome(e.clientX, e.clientY) && !broken) sinkHome(f);
        else { f.pvx = Math.max(-14, Math.min(14, lastPt.vx || (Math.random() - .5) * 6)); f.pvy = Math.max(-14, Math.min(14, lastPt.vy || (Math.random() - .5) * 6)); }
      };
      c2.addEventListener('pointerup', drop); c2.addEventListener('pointercancel', drop);
      layer.append(c2);
    }
    // holding one while scrolling keeps it under the pointer
    addEventListener('scroll', () => { if (held && lastPt) { held.px = lastPt.x + scrollX; held.py = lastPt.y + scrollY; } }, { passive: true });
    // what they bounce off (Astra, 2026-10-29: "bounce off of objects that are inside of this UI"): the Polaroids, the stars,
    // the jar, the terminal and portrait, the section titles and their tags, the contact cards. Where each one is on the page
    // is read again a few times a second, so they follow the page as it changes
    // and more to jump off (Astra, 2026-10-29): buttons, small titles, the lines under the section titles, the banners, the
    // arcade's cabinets and their screens
    const SOLID = '.polaroid .frame, #pet-jar .jar, .jar-all .card, .term, .portrait, .block h2, .block .kicker, .contact, .btn, .cab, .cab h3, .lede, .ticker, .fz-out canvas, .board, .hack-term, .screen';
    let solids = [], solidsAt = 0;
    const readSolids = () => {
      solids = [...document.querySelectorAll(SOLID)].map((n) => n.getBoundingClientRect()).filter((r) => r.width && r.height)
        .map((r) => ({ l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY }));
    };
    // a round body against a box: off the side it hits, the way a ball comes off a wall
    // like platforms in a game: they jump up through things from below and land on their tops, springing off again, up and a
    // little to one side, so they can climb the whole page (Astra, 2026-10-29: they were stuck under the arcade's cabinets)
    function bounceOff(f, rad) {
      if (f.pvy < 0) return; // on the way up, nothing stops them
      for (const o of solids) {
        if (f.px < o.l || f.px > o.r) continue;
        const above = o.t - f.py;
        if (above >= 0 && above < rad) { f.py = o.t - rad; hop(f); f.pspin = (Math.random() - .5) * .6; return; }
      }
    }
    // they want to get to the top (Astra, 2026-10-29: "climbing up to the top ... and they're jumping"): they fall, and
    // whatever they land on, they jump off again, higher than they fell
    const GRAVITY = .24;
    // each one is always headed somewhere on the page, anywhere from the top to the bottom (Astra, 2026-10-29: "going around
    // the page"); every jump is as hard as it takes to get up there, and once it is close it picks somewhere new
    const newGoal = (f) => { const { w, h } = page(); f.goal = { x: Math.random() * w, y: Math.random() * h }; };
    const hop = (f) => {
      if (!f.goal || Math.hypot(f.px - f.goal.x, f.py - f.goal.y) < 220) newGoal(f);
      const up = f.py - f.goal.y, dx = f.goal.x - f.px;
      f.pvy = -(up > 0 ? Math.min(34, Math.sqrt(2 * GRAVITY * Math.min(up, 1400)) + 2) : 4 + Math.random() * 3);
      f.pvx = Math.max(-8, Math.min(8, Math.sign(dx) * Math.min(8, Math.abs(dx) / 60) + (Math.random() - .5) * 2));
      f.psq = 1; f.lastHop = performance.now();
    };
    function roam(t) {
      roaming = requestAnimationFrame(roam);
      const { w, h } = page(), s = bodySize(), half = s / 2;
      if (t - solidsAt > 300) { solidsAt = t; readSolids(); }
      if (layer.style.height !== h + 'px') layer.style.height = h + 'px';
      const trail = !reduced && t - trailT > 110; if (trail) trailT = t;
      // a quirk (Astra, 2026-10-29): now and then, passing the Avatar Lab's girl, one swings round her a few times, then goes
      // off again all over the page; she hops and blinks while any is circling her, happy it came
      const av = document.getElementById('labSvg'), ar = av && av.getBoundingClientRect(), near = [];
      const her = ar && ar.width ? { x: ar.left + scrollX + ar.width / 2, y: ar.top + scrollY + ar.height / 2, r: Math.max(ar.width, ar.height) * .62 + half * .6 } : null;
      for (const f of outside()) {
        if (f.sinking) continue;
        if (f !== held && !reduced) {
          if (f.orbit && her) {
            const o = f.orbit; o.a += o.w; near.push(f);
            f.px = her.x + Math.cos(o.a) * her.r; f.py = her.y + Math.sin(o.a) * her.r * .8;
            // done circling: off it goes the way it was going round, and not back for a while
            if (t > o.until) { f.pvx = -Math.sin(o.a) * o.w * her.r * 1.4; f.pvy = Math.cos(o.a) * o.w * her.r * 1.1 - 6; f.orbit = null; f.nextOrbit = t + 30000 + Math.random() * 30000; newGoal(f); }
          } else {
            f.orbit = null;
            f.pvy += GRAVITY; f.pvx *= .997;
            // still well below where it is headed and starting to fall: it jumps again in the air, climbing on up
            if (!f.goal) newGoal(f);
            if (f.pvy > 1 && t - (f.lastHop || 0) > 1400 && f.goal.y < f.py - 260) hop(f);
            f.pvx = Math.max(-9, Math.min(9, f.pvx)); f.pvy = Math.max(-36, Math.min(18, f.pvy));
            f.px += f.pvx; f.py += f.pvy;
            bounceOff(f, half * .8);
            if (f.px < half && f.pvx < 0 || f.px > w - half && f.pvx > 0) { f.pvx = -f.pvx; f.psq = 1; f.pspin = (Math.random() - .5) * .6; }
            if (f.py < half && f.pvy < 0) { f.pvy = -f.pvy * .6; f.psq = 1; }
            if (f.py > h - half && f.pvy > 0) hop(f);
            f.px = Math.min(w - half, Math.max(half, f.px)); f.py = Math.min(h - half, Math.max(half, f.py));
            // only one at a time circles her, and only one passing close by
            if (her && t > (f.nextOrbit || 0) && !near.length && !outside().some((q) => q.orbit) && Math.hypot(f.px - her.x, f.py - her.y) < her.r * 1.2) {
              f.orbit = { a: Math.atan2((f.py - her.y) / .8, f.px - her.x), w: (Math.random() < .5 ? -1 : 1) * (.03 + Math.random() * .02), until: t + 3500 + Math.random() * 2500 };
            }
          }
        }
        f.psq = Math.max(0, f.psq - .06); f.pspin *= .95;
        const sq = Math.sin(f.psq * Math.PI) * .2;
        f.node.style.width = f.node.style.height = s + 'px';
        f.node.style.transform = `translate(${f.px - half}px, ${f.py - half}px) rotate(${f.pspin}rad) scale(${1 + sq}, ${1 - sq})`;
        const nx = f.node.getContext('2d'); nx.clearRect(0, 0, 160, 160); drawFuzz(nx, f, 0, 0, 160, t);
        // a sparkle left behind where it has just been, in a pastel of its own color, from bright to soft (Astra,
        // 2026-10-29); it twinkles and fades where it fell
        if (trail && f !== held && layer.childElementCount < 260) {
          const sp = document.createElement('i'); sp.className = 'fuzz-trail';
          sp.style.cssText = `left:${f.px - f.pvx * 6 + (Math.random() - .5) * half}px;top:${f.py - f.pvy * 6 + (Math.random() - .5) * half}px;--s:${8 + Math.random() * 12}px;--c:${paleOf(f.code, Math.random())}`;
          layer.prepend(sp); setTimeout(() => sp.remove(), 3600);
        }
      }
      if (av) av.classList.toggle('happy', near.length > 0);
    }
    // the score (Astra, 2026-10-29: let them out before it breaks "and you're left with a sphere full of sparkles ... you can
    // make a score for that"): the sparkles left in the dome when you let them out in time; the best is kept in this browser
    const SCORE_KEY = 'findastra-dome-best';
    let best = store.get(SCORE_KEY, 0) || 0;
    const showScore = (got) => { const s = $('dome-score'); if (s) s.textContent = got == null ? (best ? `best: ${best} sparkles saved` : 'Let them out before it breaks to keep the sparkles.') : `${got} sparkles saved${got >= best && got ? ' · a new best!' : ''} · best ${best}`; };
    function letOut(broke) {
      if (!broke && motes.length) { const got = motes.length; if (got > best) { best = got; store.set(SCORE_KEY, best); } showScore(got); }
      const box = cv.getBoundingClientRect(), ox = box.left + box.width / 2 + scrollX, oy = box.top + box.height / 2 + scrollY;
      if (!layer.isConnected) document.body.append(layer);
      for (const f of inside()) {
        const x = f.sx != null ? box.left + f.sx + scrollX : ox, y = f.sy != null ? box.top + f.sy + scrollY : oy, a = Math.atan2(y - oy, x - ox) || Math.random() * 7, sp = 5 + Math.random() * 5;
        free(f, x, y, Math.cos(a) * sp, Math.sin(a) * sp);
      }
      if (!roaming) roaming = requestAnimationFrame(roam);
      picked = null; count();
    }
    const loose = { home() { for (const f of outside()) goHome(f); } };
    function add(code) {
      if (broken) return 'The Cyber Dome is broken. Put it back together first.';
      // each Fuzzboi only once (Astra, 2026-10-29: "shouldn't be able to send the same fuzzboy into the dome"); the dome
      // breaks at 67 inside, and the page holds up to 200 in all
      if (folks.some((f) => f.code === code)) { const no = `#${code} already lives here. Make a different one.`; $('home-pick').textContent = no; return no; }
      if (folks.length >= 200) return 'That is 200 Fuzzbois. Catch some first.';
      folks.push(spawn(code)); save();
      if (inside().length >= HOME_MAX) explode();
      return `#${code} moved into the Cyber Dome (${inside().length} of ${HOME_MAX}).`;
    }

    // ---------- it breaks (Astra, 2026-10-29): at 67 the dome bursts. Every Fuzzboi flies out onto the page, the sphere
    // shatters into five pieces that tumble away and land turned every which way, and sparkles burst everywhere. It is a
    // puzzle: drag each piece back where it goes, tapping one to turn it an eighth at a time, until all five click in; then it
    // seals, and they can be put back in again ----------
    let broken = null, drag = null;
    const bits = []; // loose sparkles on the dome: from walls that get hit, the burst, the seal
    // a Fuzzboi's background color as the page's one pastel (Astra, 2026-10-29: every sparkle "the same type of pastel and
    // saturation as the ones at the top"): its hue, at the portrait sparkles' 55% saturation and 80% lightness, give or take
    const hueOf = (code) => { const n = parseInt(code, 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
      return !d ? 0 : Math.round((mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 + 360) % 360; };
    const paleOf = (code, w = .45) => `hsl(${hueOf(code)} 55% ${Math.round(76 + w * 8)}%)`;
    function burst(x, y, n, color, speed = 4) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = speed * (.3 + Math.random());
        bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, s: 3 + Math.random() * 6, c: color || `hsl(${Math.floor(Math.random() * 360)} 55% 80%)` });
      }
    }
    function explode() {
      if (broken) return;
      alarm();
      const r = R(), n = 5, ox = W / 2, oy = H / 2, th = (Math.PI * 2) / n, cd = (2 / 3) * r * Math.sin(th / 2) / (th / 2);
      // each piece is held by its middle (c: from the sphere's center to the piece's middle), so all of it stays in view
      broken = { spin: 0, spinTo: 0, pieces: Array.from({ length: n }, (_, i) => {
        const a0 = i * th - Math.PI / 2, a1 = a0 + th, mid = (a0 + a1) / 2, sp = 7 + Math.random() * 5;
        // where it comes to rest, and turned some eighths of a turn (never the right way up)
        const turnTo = (1 + Math.floor(Math.random() * 7)) * (Math.PI / 4);
        return { a0, a1, c: { x: Math.cos(mid) * cd, y: Math.sin(mid) * cd }, x: ox + Math.cos(mid) * cd, y: oy + Math.sin(mid) * cd, vx: Math.cos(mid) * sp, vy: Math.sin(mid) * sp, rot: 0, vr: (Math.random() - .5) * .5, rotTo: turnTo, placed: false };
      }) };
      // all the sparkles that were kept in the dome burst out with it, and plenty more
      for (const m of motes) bits.push({ x: ox + m.x * r, y: oy + m.y * r, vx: m.x * (5 + Math.random() * 6), vy: m.y * (5 + Math.random() * 6), life: 1, s: m.s, c: m.c });
      motes.length = 0; hits = 0;
      for (let i = 0; i < 6; i++) burst(ox + (Math.random() - .5) * r, oy + (Math.random() - .5) * r, 40, null, 7);
      letOut(true); count();
    }
    // where a placed piece's middle sits, with the sphere turned by spin
    const homeOf = (p, spin) => ({ x: W / 2 + p.c.x * Math.cos(spin) - p.c.y * Math.sin(spin), y: H / 2 + p.c.x * Math.sin(spin) + p.c.y * Math.cos(spin) });
    // the point (x, y) on the canvas, inside which loose piece (topmost first)
    function pieceAt(x, y) {
      const r = R();
      for (let i = broken.pieces.length - 1; i >= 0; i--) {
        const p = broken.pieces[i]; if (p.placed) continue;
        const dx = x - p.x, dy = y - p.y, c = Math.cos(-p.rot), s = Math.sin(-p.rot), lx = dx * c - dy * s + p.c.x, ly = dx * s + dy * c + p.c.y;
        let a = Math.atan2(ly, lx); while (a < p.a0) a += Math.PI * 2;
        if (Math.hypot(lx, ly) < r && a <= p.a1) return p;
      }
      return null;
    }
    const norm = (a) => { a %= Math.PI * 2; if (a > Math.PI) a -= Math.PI * 2; if (a < -Math.PI) a += Math.PI * 2; return a; };
    function seal() {
      burst(W / 2, H / 2, 120, null, 5);
      broken = null; count();
    }
    // the puzzle by hand (Astra, 2026-10-29): drag a piece; while holding it, the scroll wheel turns it; tap one to turn it an
    // eighth; drag anywhere else in the ring (or scroll there) to turn the whole sphere with the pieces already in, and line up
    // the next one against it
    const angleAt = (x, y) => Math.atan2(y - H / 2, x - W / 2);
    cv.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (Math.hypot(x - drag.sx, y - drag.sy) > 6) drag.moved = true;
      if (drag.sphere) { const a = angleAt(x, y); broken.spinTo += norm(a - drag.a); drag.a = a; return; }
      drag.p.x = x - drag.dx; drag.p.y = y - drag.dy;
    });
    function tryPlace(p) {
      const home = homeOf(p, broken.spinTo);
      // close enough to its place and turned the same way as the sphere: it clicks in
      if (Math.hypot(p.x - home.x, p.y - home.y) < R() * .22 && Math.abs(norm(p.rotTo - broken.spinTo)) < .2) {
        p.placed = true;
        const mid = (p.a0 + p.a1) / 2 + broken.spin; burst(W / 2 + Math.cos(mid) * R() * .6, H / 2 + Math.sin(mid) * R() * .6, 24, null, 3);
        if (broken.pieces.every((q) => q.placed)) seal();
      }
    }
    const dropPiece = () => {
      if (!drag) return;
      const { p, moved, sphere } = drag; drag = null;
      if (sphere) { for (const q of broken.pieces) if (!q.placed) tryPlace(q); return; }
      if (!moved) p.rotTo = p.rot + Math.PI / 4;
      tryPlace(p);
    };
    cv.addEventListener('pointerup', dropPiece); cv.addEventListener('pointercancel', dropPiece);
    cv.addEventListener('wheel', (e) => {
      if (!broken) return;
      e.preventDefault();
      const turn = e.deltaY * .004;
      if (drag && !drag.sphere) drag.p.rotTo += turn; else broken.spinTo += turn;
    }, { passive: false });
    cv.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (broken) {
        const p = pieceAt(x, y);
        try { cv.setPointerCapture(e.pointerId); } catch {}
        e.preventDefault();
        if (!p) { if (Math.hypot(x - W / 2, y - H / 2) < R() * 1.1) drag = { sphere: true, a: angleAt(x, y), sx: x, sy: y, moved: false }; return; }
        broken.pieces.splice(broken.pieces.indexOf(p), 1); broken.pieces.push(p); // to the top
        drag = { p, dx: x - p.x, dy: y - p.y, sx: x, sy: y, moved: false };
        return;
      }
      const hit = inside().filter((f) => f.ss).sort((p, q) => q.z - p.z).find((f) => Math.hypot(f.sx - x, f.sy - y) < f.ss * .45);
      picked = hit === picked ? null : hit || null;
      if (picked) { picked.squash = 1; codeIn.value = picked.code; make(picked.code, false); }
      count();
    });
    $('home-out').onclick = () => { if (outside().length) loose.home(); else if (folks.length) letOut(); };
    $('home-clear').onclick = () => { loose.home(); folks.length = 0; picked = null; save(); };
    // the sphere: an outline, rings of latitude seen a little from above, and meridians that turn
    function globe() {
      const r = R(), ox = W / 2, oy = H / 2, tilt = .28;
      // no black square round it: the sphere floats on the cabinet (Astra, 2026-10-29)
      cx.clearRect(0, 0, W, H);
      const glow = cx.createRadialGradient(ox - r * .3, oy - r * .35, r * .1, ox, oy, r);
      glow.addColorStop(0, 'rgba(255, 255, 255, .07)'); glow.addColorStop(1, 'rgba(255, 255, 255, .01)');
      cx.fillStyle = glow; cx.beginPath(); cx.arc(ox, oy, r, 0, 7); cx.fill();
      // LED lines (Astra, 2026-10-29): every line glows and runs through the rainbow, each a little round the wheel from the next
      // a little softer than full neon (Astra, 2026-10-29)
      const led = (k, a) => `hsl(${(hue + k * 24) % 360} 70% 72% / ${a})`;
      cx.lineWidth = 1.4; cx.shadowBlur = 6;
      for (let k = -3; k <= 3; k++) { const lat = (k / 4) * (Math.PI / 2), rx = Math.cos(lat) * r; cx.strokeStyle = cx.shadowColor = led(k + 3, .55); cx.beginPath(); cx.ellipse(ox, oy + Math.sin(lat) * r * Math.cos(tilt), rx, rx * Math.sin(tilt), 0, 0, 7); cx.stroke(); }
      for (let k = 0; k < 8; k++) { const ph = turn + (k / 8) * Math.PI, rx = Math.abs(Math.sin(ph)) * r; cx.strokeStyle = cx.shadowColor = led(k + 8, .55); cx.beginPath(); cx.ellipse(ox, oy, rx, r, 0, 0, 7); cx.stroke(); }
      // the wilder it is inside, the more the whole dome glows, through the rainbow: a tint filling the sphere and a halo round
      // its rim, drawn here rather than as a filter on the canvas, which got slow with thousands of sparkles inside
      const heat = broken ? 0 : rage(), glowHue = (hue * 3) % 360;
      if (heat > .04) {
        const tint = cx.createRadialGradient(ox, oy, r * .2, ox, oy, r);
        tint.addColorStop(0, `hsl(${glowHue} 90% 60% / 0)`); tint.addColorStop(1, `hsl(${glowHue} 90% 60% / ${heat * .22})`);
        cx.fillStyle = tint; cx.beginPath(); cx.arc(ox, oy, r, 0, 7); cx.fill();
      }
      // the outer ring stays plain white (Astra, 2026-10-29), its halo colored as it heats up
      cx.lineWidth = 2.4 + heat * 2; cx.strokeStyle = 'rgba(255, 255, 255, .92)';
      cx.shadowColor = heat > .04 ? `hsl(${glowHue} 90% 62% / ${Math.min(1, .4 + heat)})` : 'rgba(255, 255, 255, .6)'; cx.shadowBlur = 10 + heat * 26;
      cx.beginPath(); cx.arc(ox, oy, r, 0, 7); cx.stroke();
      cx.shadowBlur = 0;
      // the page's pastel sparkles, bouncing round inside the dome
      for (const s of motes) {
        if (!reduced) { s.x += s.vx; s.y += s.vy; if (Math.hypot(s.x, s.y) > .9) { const d = Math.hypot(s.x, s.y), nx = s.x / d, ny = s.y / d, dot = s.vx * nx + s.vy * ny; s.vx -= 2 * dot * nx; s.vy -= 2 * dot * ny; s.x = nx * .9; s.y = ny * .9; } s.t += .05; }
        // up to 6,767 of them, so each is stamped from a small picture of its color, made once
        const px = ox + s.x * r, py = oy + s.y * r, sz = s.s * (.6 + .4 * Math.sin(s.t));
        cx.globalAlpha = .55 + .45 * Math.sin(s.t + 1);
        cx.drawImage(stamp(s.c), px - sz, py - sz, sz * 2, sz * 2);
      }
      cx.globalAlpha = 1;
      if (!reduced) hue = (hue + .6) % 360;
    }
    function frame(t) {
      requestAnimationFrame(frame);
      if (!W) return;
      if (!reduced) turn += .003;
      if (broken) { brokenFrame(); sparks(); return; }
      globe();
      const folks = inside(); // the ones loose on the page are drawn there, not here
      const r = R(), sh = share(), rr = sh / 2; // a Fuzzboi's radius inside the unit sphere
      const heat = rage(), angry = heat >= .6;
      if (heat >= .75 && !alarmed) { alarmed = true; alarm(); } else if (heat < .7) alarmed = false;
      // the whole dome glows (in globe), not the Fuzzbois, and it shakes harder the wilder it gets
      cv.style.translate = !reduced && heat > .2 ? `${(Math.random() - .5) * heat * 7}px ${(Math.random() - .5) * heat * 7}px` : '';
      const view = (x, y, z) => { const near = (z + 1) / 2, k = .82 + .18 * near; return { sx: W / 2 + x * r * k, sy: H / 2 + y * r * k, near }; };
      for (const f of folks) {
        if (!reduced) {
          // up to two and a half times as fast, shoving about every which way and spinning, more the wilder it is
          const k = 1 + 1.5 * heat * heat;
          f.vx += (Math.random() - .5) * .004 * heat; f.vy += (Math.random() - .5) * .004 * heat; f.vz += (Math.random() - .5) * .004 * heat; f.spin += (Math.random() - .5) * .3 * heat;
          const v = Math.hypot(f.vx, f.vy, f.vz), cap = .013 + .006 * heat; if (v > cap) { f.vx *= cap / v; f.vy *= cap / v; f.vz *= cap / v; }
          f.x += f.vx * k; f.y += f.vy * k; f.z += f.vz * k;
          // off the inside of the sphere like a ball: reflect along the wall's normal
          const d = Math.hypot(f.x, f.y, f.z), lim = 1 - rr;
          if (d > lim) {
            const nx = f.x / d, ny = f.y / d, nz = f.z / d, dot = f.vx * nx + f.vy * ny + f.vz * nz;
            if (dot > 0) {
              f.vx -= 2 * dot * nx; f.vy -= 2 * dot * ny; f.vz -= 2 * dot * nz; f.squash = .6;
              // it hits the side and sparkles burst off it, in a pastel of its own color (Astra, 2026-10-29)
              // in its own colors, its body's or its background's, as many as it sheds
              const tint = () => paleOf(f.tints[Math.random() < .5 ? 0 : 1], [.3, .5, .7][Math.floor(Math.random() * 3)]);
              const v = view(nx * lim, ny * lim, nz * lim); burst(v.sx + nx * r * rr, v.sy + ny * r * rr, Math.round((angry ? 7 : 5) * f.shed), tint(), 2.5);
              // and some stay, bouncing round the dome with the rest
              const keep = Math.floor(f.shed) + (Math.random() < f.shed % 1 ? 1 : 0);
              for (let n = 0; n < keep; n++) keepMote(nx * .86, ny * .86, tint());
              if (motes.length >= SPARK_MAX) explode();
            }
            f.x = nx * lim; f.y = ny * lim; f.z = nz * lim;
          }
        }
        f.squash = Math.max(0, f.squash - .05); f.spin *= .94;
      }
      // two that meet bounce apart like billiard balls, squish, spin a little and say boing
      if (!reduced) for (let i = 0; i < folks.length; i++) for (let k = i + 1; k < folks.length; k++) {
        const p = folks[i], q = folks[k], dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z, d = Math.hypot(dx, dy, dz), min = rr * 2 * .8;
        if (!d || d >= min) continue;
        const nx = dx / d, ny = dy / d, nz = dz / d, rel = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny + (p.vz - q.vz) * nz;
        if (rel > 0) {
          p.vx -= rel * nx; p.vy -= rel * ny; p.vz -= rel * nz; q.vx += rel * nx; q.vy += rel * ny; q.vz += rel * nz;
          p.squash = q.squash = 1; p.spin = (Math.random() - .5) * .9; q.spin = (Math.random() - .5) * .9;
          if (++hits >= HITS_MAX) explode();
          boings.push({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2, z: Math.max(p.z, q.z), t: 1, word: ['boing!', 'boop', 'bonk!', 'sproing'][Math.floor(Math.random() * 4)] });
        }
        const push = (min - d) / 2; p.x -= nx * push; p.y -= ny * push; p.z -= nz * push; q.x += nx * push; q.y += ny * push; q.z += nz * push;
      }
      // back to front; nearer is bigger and a little lower in the view
      for (const f of [...folks].sort((p, q) => p.z - q.z)) {
        const v = view(f.x, f.y, f.z), grow = Math.min(1, (t - f.born) / 450);
        const size = sh * r * 2 * (.55 + .6 * v.near) * (grow < 0 ? 1 : grow);
        f.sx = v.sx; f.sy = v.sy; f.ss = size;
        cx.globalAlpha = .55 + .45 * v.near;
        if (f === picked) { cx.strokeStyle = '#' + f.code; cx.lineWidth = 3; cx.beginPath(); cx.arc(v.sx, v.sy, size * .5, 0, 7); cx.stroke(); }
        const sq = Math.sin(f.squash * Math.PI) * .22;
        cx.save(); cx.translate(v.sx, v.sy); cx.rotate(f.spin); cx.scale(1 + sq, 1 - sq);
        drawFuzz(cx, f, -size / 2, -size / 2, size, t); cx.restore();
      }
      cx.globalAlpha = 1;
      cx.font = '700 13px JetBrains Mono, monospace'; cx.textAlign = 'center';
      for (const b of boings) { const v = view(b.x, b.y, b.z); cx.fillStyle = `rgba(255, 255, 255, ${b.t})`; cx.fillText(b.word, v.sx, v.sy - r * sh - (1 - b.t) * 18); b.t -= .025; }
      cx.textAlign = 'start';
      for (let i = boings.length - 1; i >= 0; i--) if (boings[i].t <= 0) boings.splice(i, 1);
      sparks(); meterSparks();
    }
    // the loose sparkles: drift out, slow down, twinkle and fade
    function sparks() {
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i]; b.x += b.vx; b.y += b.vy; b.vx *= .96; b.vy = b.vy * .96 + .03; b.life -= .014;
        if (b.life <= 0) { bits.splice(i, 1); continue; }
        // while the dome is whole they stay in it, bouncing off the inside of its outer ring (Astra, 2026-10-29)
        if (!broken) {
          const r = R(), dx = b.x - W / 2, dy = b.y - H / 2, d = Math.hypot(dx, dy);
          if (d > r - 2) { const nx = dx / d, ny = dy / d, dot = b.vx * nx + b.vy * ny; if (dot > 0) { b.vx -= 2 * dot * nx; b.vy -= 2 * dot * ny; } b.x = W / 2 + nx * (r - 2); b.y = H / 2 + ny * (r - 2); }
        }
        const sz = b.s * (.5 + b.life * .7), q = sz * .22;
        cx.globalAlpha = Math.min(1, b.life * 1.4); cx.fillStyle = b.c;
        cx.beginPath(); cx.moveTo(b.x, b.y - sz); cx.lineTo(b.x + q, b.y - q); cx.lineTo(b.x + sz, b.y); cx.lineTo(b.x + q, b.y + q); cx.lineTo(b.x, b.y + sz); cx.lineTo(b.x - q, b.y + q); cx.lineTo(b.x - sz, b.y); cx.lineTo(b.x - q, b.y - q); cx.closePath(); cx.fill();
      }
      cx.globalAlpha = 1;
      if (bits.length > 600) bits.splice(0, bits.length - 600);
    }
    // the broken dome: its sphere drawn off screen, then each of the five pieces cut from it where it lies, turned as it is
    function brokenFrame() {
      cv.style.translate = '';
      gcv.width = cv.width; gcv.height = cv.height; gx.setTransform(main.getTransform());
      cx = gx; globe(); cx = main;
      cx.clearRect(0, 0, W, H);
      const r = R(), pieces = [...broken.pieces].sort((a, b) => b.placed - a.placed);
      broken.spin += (broken.spinTo - broken.spin) * .2;
      for (const p of pieces) {
        if (p.placed) { const h = homeOf(p, broken.spin); p.x = h.x; p.y = h.y; p.rot = p.rotTo = broken.spin; }
        else if (!drag || drag.p !== p) {
          p.x += p.vx; p.y += p.vy; p.vx *= .9; p.vy *= .9; p.rot += p.vr; p.vr *= .92;
          if (Math.hypot(p.vx, p.vy) < .5) p.rot += (p.rotTo - p.rot) * .1;
          p.x = Math.min(W - r * .35, Math.max(r * .35, p.x)); p.y = Math.min(H - r * .35, Math.max(r * .35, p.y));
        } else p.rot += (p.rotTo - p.rot) * .2;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.translate(-p.c.x, -p.c.y);
        cx.beginPath(); cx.moveTo(0, 0); cx.arc(0, 0, r + 4, p.a0, p.a1); cx.closePath();
        cx.save(); cx.clip(); cx.drawImage(gcv, 0, 0, gcv.width, gcv.height, -W / 2, -H / 2, W, H); cx.restore();
        // the cracked edges
        cx.strokeStyle = p.placed ? 'rgba(255, 255, 255, .25)' : 'rgba(255, 255, 255, .85)'; cx.lineWidth = 1.5; cx.stroke();
        cx.restore();
      }
      // where the pieces go: a faint ring
      cx.setLineDash([6, 8]); cx.strokeStyle = 'rgba(255, 255, 255, .25)'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(W / 2, H / 2, r, 0, 7); cx.stroke(); cx.setLineDash([]);
    }
    ready.then(() => {
      if (!F) return;
      // the dome starts empty on every visit (Astra, 2026-10-29: "make sure it spawns with none in the Cyberdome")
      const saved = [];
      count(); showScore();
      const linked = /^#fuzzboi-([0-9]{6})$/.exec(location.hash);
      make(linked ? linked[1].toUpperCase() : '456900', !!linked && !(Array.isArray(saved) && saved.includes(linked[1].toUpperCase())));
      requestAnimationFrame(frame);
    });
    count();
    return { add };
  })();

  // ---------- the sparkle catcher, from Mommy's website ("Catch the beat"): tap the sparkles before they burn out ----------
  (() => {
    const bc = $('beatC'), bx = bc.getContext('2d');
    // the sparkle the game throws comes from the Sparkle Creator below it: how many points, how sharp, what color, how it spins
    const SPARK = { points: [4, 5, 6, 8], sharp: [['Sharp', .28], ['Soft', .5], ['Puffy', .72]], color: [['Pink', [330, 318, 345, 300]], ['Gold', [42, 48, 36, 54]],
      ['Ice', [190, 200, 210, 180]], ['Mint', [150, 160, 140, 170]], ['Lilac', [270, 280, 260, 290]], ['Rainbow', [0, 30, 55, 120, 205, 275, 320, -1]]], spin: ['Twirl', 'Still', 'Wobble'] };
    const spark = Object.assign({ points: 0, sharp: 0, color: 0, spin: 0 }, store.get('findastra-sparkle', {}));
    for (const k of Object.keys(SPARK)) if (!(spark[k] >= 0 && spark[k] < SPARK[k].length)) spark[k] = 0;
    const hues = () => SPARK.color[spark.color][1];
    const isRainbow = () => SPARK.color[spark.color][0] === 'Rainbow';
    let nextHue = 0;
    // a hue of -1 is white; the rainbow is soft pastel
    const tint = (h, l, a) => (h < 0 ? `hsla(0,0%,100%,${a})` : `hsla(${h},100%,${isRainbow() ? Math.min(92, l + 6) : l}%,${a})`);
    // one sparkle: a star with the chosen points and sharpness, turned by the chosen spin
    function drawSpark(c, x, y, r, age, hue, a) {
      const n = SPARK.points[spark.points], inner = SPARK.sharp[spark.sharp][1], mode = SPARK.spin[spark.spin];
      const turn = mode === 'Twirl' ? age * 3 : mode === 'Wobble' ? Math.sin(age * 9) * .35 : 0;
      c.fillStyle = tint(hue, 84, a); c.shadowColor = tint(hue, 64, a); c.shadowBlur = r * .8;
      c.beginPath();
      for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r * inner : r, an = (i * Math.PI) / n + turn - Math.PI / 2; c.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
      c.closePath(); c.fill(); c.shadowBlur = 0;
    }
    // the white rabbit's burst throws this same sparkle (Astra, 2026-10-29)
    window.findastraSparkle = { draw: drawSpark, hues, tint };
    let targets = [], pops = [], score = 0, combo = 0, best = store.get('findastra-beat-best', 0) || 0, miss = 0, on = false, spawnIn = 0;
    const bS = $('bScore'), bC = $('bCombo'), bB = $('bBest'); bB.textContent = best;
    let w = 0, h = 0;
    const size = () => { const r = fit(bc); w = r.width; h = r.height; };
    new ResizeObserver(size).observe(bc); size();
    const prev = $('sparkPrev'), px = prev.getContext('2d');
    function showSpark() {
      for (const k of Object.keys(SPARK)) { const v = SPARK[k][spark[k]]; $('sp-' + k).textContent = Array.isArray(v) ? v[0] : String(v); }
      store.set('findastra-sparkle', spark);
    }
    (function preview(t) {
      requestAnimationFrame(preview);
      px.fillStyle = '#060606'; px.fillRect(0, 0, 192, 192);
      const hs = hues(), hue = hs[Math.floor(t / 900) % hs.length];
      px.save(); px.globalCompositeOperation = 'lighter'; drawSpark(px, 96, 96, 62, reduced ? 0 : t / 2600, hue, 1); px.restore();
    })(0);
    document.querySelectorAll('[data-spark]').forEach((b) => (b.onclick = () => { const k = b.dataset.spark; spark[k] = (spark[k] + 1) % SPARK[k].length; showSpark(); }));
    $('sparkRand').onclick = () => { for (const k of Object.keys(SPARK)) spark[k] = Math.floor(Math.random() * SPARK[k].length); showSpark(); };
    showSpark();
    function start() { targets = []; score = 0; combo = 0; miss = 0; on = true; spawnIn = 0; bS.textContent = 0; bC.textContent = 0; $('beatBtn').textContent = 'playing…'; }
    // the high scores (Astra, 2026-10-29): the five best sets in this browser, with the day each was played
    const TOP_KEY = 'findastra-beat-top';
    let top = store.get(TOP_KEY, null) || (best ? [{ s: best, d: '' }] : []);
    const showTop = (fresh) => $('bTop').replaceChildren(...(top.length ? top.map((t, i) => { const li = el('li', t === fresh ? 'new' : null); li.append(el('b', null, t.s), el('span', null, t.d)); return li; })
      : [el('li', 'none', 'no sets yet')]));
    showTop();
    function end() {
      on = false; $('beatBtn').textContent = 'start set'; if (score > best) { best = score; bB.textContent = best; store.set('findastra-beat-best', best); }
      if (score) { const t = { s: score, d: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }; top = [...top, t].sort((a, b) => b.s - a.s).slice(0, 5); store.set(TOP_KEY, top); showTop(t); }
    }
    function loop() {
      requestAnimationFrame(loop);
      bx.fillStyle = '#060606'; bx.fillRect(0, 0, w, h);
      bx.strokeStyle = 'rgba(255, 255, 255, .07)'; bx.lineWidth = 1;
      for (let i = 1; i < 4; i++) { bx.beginPath(); bx.moveTo(0, h * i / 4); bx.lineTo(w, h * i / 4); bx.stroke(); }
      if (on && --spawnIn <= 0) {
        spawnIn = Math.max(16, 46 - score * .28);
        const hs = hues();
        const hue = isRainbow() ? hs[nextHue++ % hs.length] : hs[(Math.random() * hs.length) | 0];
        // each lasts twice as long before it burns out (Astra, 2026-10-29: "twice as long duration for you to solve")
        targets.push({ x: 24 + Math.random() * (w - 48), y: 24 + Math.random() * (h - 48), t: 1, hue, sp: (.010 + Math.min(.014, score * .00013)) / 2 });
      }
      bx.save(); bx.globalCompositeOperation = 'lighter';
      for (const t of targets) {
        t.t -= t.sp;
        const R = 10 + (1 - t.t) * 16, a = Math.max(0, t.t);
        bx.strokeStyle = tint(t.hue, 72, a); bx.lineWidth = 3;
        bx.beginPath(); bx.arc(t.x, t.y, R + 12 * t.t, 0, 6.283); bx.stroke();
        drawSpark(bx, t.x, t.y, 13, 1 - t.t, t.hue, a);
      }
      // the burst where a sparkle was caught
      for (const p of pops) {
        p.x += p.vx; p.y += p.vy; p.vy += .05; p.life -= .03;
        bx.fillStyle = tint(p.hue, 80, Math.max(0, p.life)); bx.beginPath(); bx.arc(p.x, p.y, 2.2, 0, 6.283); bx.fill();
      }
      bx.restore();
      pops = pops.filter((p) => p.life > 0);
      const dead = targets.filter((t) => t.t <= 0);
      if (dead.length && on) { miss += dead.length; combo = 0; bC.textContent = 0; if (miss >= 3) end(); }
      targets = targets.filter((t) => t.t > 0);
      if (!on) {
        bx.fillStyle = 'rgba(6, 6, 6, .72)'; bx.fillRect(0, 0, w, h);
        bx.fillStyle = '#f2f2f2'; bx.textAlign = 'center';
        bx.font = '700 17px JetBrains Mono, monospace'; bx.fillText(score ? 'set over · ' + score : 'press start', w / 2, h / 2 - 4);
        bx.font = '12px JetBrains Mono, monospace'; bx.fillStyle = '#9b9b9b'; bx.fillText(score ? 'three misses. try again.' : 'tap the sparkles', w / 2, h / 2 + 18);
        bx.textAlign = 'start';
      }
    }
    bc.addEventListener('pointerdown', (e) => {
      if (!on) return;
      const r = bc.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const i = targets.findIndex((t) => Math.hypot(t.x - x, t.y - y) < 30);
      if (i < 0) { combo = 0; bC.textContent = 0; return; }
      const [t] = targets.splice(i, 1);
      combo++; score += 10 + Math.min(40, combo * 2); bS.textContent = score; bC.textContent = combo;
      if (!reduced) for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; pops.push({ x: t.x, y: t.y, vx: Math.cos(a) * 2.4, vy: Math.sin(a) * 2.4, hue: t.hue, life: 1 }); }
    });
    $('beatBtn').onclick = () => { if (!on) start(); };
    loop();
  })();

  // ---------- the Avatar Lab, from Mommy's website (copied unchanged from mommys-portfolio-20261024.html) ----------
  {
  /* Mommy's Avatar Lab — coordinated two-color illustrations, 2026-10-22. */
  const AV_PALETTES=[
   ['Pearl silver','#e9e6f0','#a9a7c4'],['Rose quartz','#d987ac','#f5d7e4'],['Midnight plum','#34233f','#96769d'],
   ['Honey cream','#c8995e','#f7e6bd'],['Espresso caramel','#422d30','#be8c6e'],['Ink blue','#25324b','#7790b3'],
   ['Sage cream','#779486','#e0ddc6'],['Dusty lavender','#9985b4','#ded3ec'],['Cherry rose','#8c304e','#ed9ab3'],
   ['Copper peach','#a65c43','#f0bc9b'],['Ocean mist','#366678','#b0d5d5'],['Mauve smoke','#695565','#c6b0bd'],
   ['Black pearl','#252431','#dedbe9'],['Lilac mint','#b498d0','#b5dccb'],['Coral teal','#dc8d87','#568b8d'],
   ['Peach periwinkle','#efb49c','#8996c5'],['Rose navy','#c786a4','#334865'],['Gold violet','#d7b679','#71608c'],
   ['Forest blush','#426f62','#e1b4bd'],['Blue champagne','#719bb6','#e8d2af'],['Silver cherry','#c9ccd9','#a64565'],
   ['Soft candy','#df8dbb','#83bac8'],['Cocoa lilac','#705044','#bc9fce'],['Emerald pearl','#3c847b','#e6ded9']
  ];
  const AV_BANGS=['Curtain','Blunt','Side sweep','Wispy','Split fringe','Heart fringe','Choppy','Baby bangs','Arched','Long side'];
  const AV_HAIR={
   girls:[['High pigtails','pigtail',0,58],['Blunt pigtails','pigtail',1,62],['Side-swept pigtails','pigtail',2,52],['Wispy pigtails','pigtail',3,72],['Split-fringe pigtails','pigtail',4,48],['Heart-fringe pigtails','pigtail',5,65],['Choppy pigtails','pigtail',6,55],['Baby-bang pigtails','pigtail',7,40],['Blunt bob','bob',1,30],['French bob','bob',7,22],['Side bob','bob',2,36],['Long curtain hair','long',0,83],['Long waves','wave',3,78],['Long side part','long',9,74],['Space buns','buns',4,20],['Low double buns','buns',5,42],['Twin braids','braids',0,72],['High ponytail','pony',2,65],['Layered shag','shag',6,44],['Soft pixie','pixie',8,17]],
   boys:[['Curtain crop','crop',0,14],['Textured crop','crop',6,18],['Side-part crop','crop',2,12],['Blunt fringe','crop',1,20],['Wispy fringe','crop',3,19],['Split fringe crop','crop',4,16],['Short quiff','quiff',2,17],['Tall quiff','quiff',9,26],['Side undercut','undercut',2,18],['Split undercut','undercut',4,15],['Soft curls','curls',3,26],['Tight curls','curls',7,18],['Tousled waves','wave',6,27],['Wolf cut','shag',9,46],['Long curtain cut','bob',0,37],['Short spikes','spikes',6,18],['Tall spikes','spikes',7,29],['Swept-back bun','topknot',8,28],['Short ponytail','pony',4,34],['Braided sides','braids',2,35]]
  };
  const AV_HEAD=['None','Devil horns','Halo','Cat ears','Star clips','Moon crown','Double bows','Heart antennae','Rabbit ears','Bear ears','Headphones','Goggles','Bow headband','Flower crown','Tiny top hat','Beret','Witch hat','Butterfly clips','Leaf sprout','Satellite rings'];
  const AV_BODY=['None','Neck bow','Heart pendant','Star pendant','Pearl collar','Crossbody sash','Ribbon belt','Chain belt','Mini backpack','Angel wings','Bat wings','Shoulder cape','Scarf','Rose brooch','Moon brooch','Long tie','Harness straps','Heart purse','Heart pocket','Devil tail'];
  const AV_FX=['Four-point glints','Tiny diamonds','Twinkle stars','Star halo','Heart dust','Pearl bubbles','Snowflakes','Comet trails','Confetti','Orbit rings','Crescent moons','Fireflies','Crystal shards','Cross glints','Petal drift','Spiral dust','Dotted aura','Star shower','Diamond crown','Ribbon sparks'];
  // lash styles (Astra, 2026-10-27: "some that have like three, some that have two, some that are just a cute little swoop")
  const AV_LASHES=['Three flicks','Two flicks','Swoop','Off'];
  const AV_LASH_D=['M79 90l-5-4M78 93l-6-1M81 87l-3-5M121 90l5-4M122 93l6-1M119 87l3-5','M79 90l-5-4M78 94l-6-1M121 90l5-4M122 94l6-1','M80 90Q75 91 72 85M120 90Q125 91 128 85',''];
  const AV_FITS=['Skater dress','Tunic','Jacket','Sweater','Vest','Split dress','Pleated dress','T-shirt','Overalls','Coat'];
  const avPick=n=>Math.floor(Math.random()*n);
  const avNext=(old,n)=>(old+1+avPick(n-1))%n;
  const avPalette=()=>[...AV_PALETTES[avPick(AV_PALETTES.length)]];
  const avState={group:'all',hairGroup:'girls',hair:0,bangs:0,hairColors:avPalette(),head:1,headColors:avPalette(),body:1,bodyColors:avPalette(),fit:0,fitColors:avPalette(),fx:0,fxColors:avPalette(),lashes:0,seed:347};
  const avPath=(d,c,s='',w=2)=>`<path d="${d}" fill="${c}"${s?` stroke="${s}" stroke-width="${w}"`:''}/>`;
  const avEllipse=(x,y,rx,ry,c,s='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"${s?` stroke="${s}" stroke-width="2"`:''}/>`;
  const avLine=(d,c,w=2)=>avPath(d,'none',c,w);
  const avHeart=(x,y,s,c)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 3C-14-8-15-20-6-20Q0-20 0-13Q0-20 6-20C15-20 14-8 0 3Z" fill="${c}"/>`;
  const avStar=(x,y,s,c,points=5)=>{let d='';for(let i=0;i<points*2;i++){let a=i*Math.PI/points-Math.PI/2,r=i%2?s*.43:s;d+=(i?'L':'M')+(x+Math.cos(a)*r).toFixed(2)+' '+(y+Math.sin(a)*r).toFixed(2)}return avPath(d+'Z',c)};
  function avHair(){
   const [,kind,,length]=AV_HAIR[avState.hairGroup][avState.hair], [,a,b]=avState.hairColors;
   let back='',front='';
   const mirror=shape=>shape+`<g transform="translate(200 0) scale(-1 1)">${shape}</g>`;
   if(kind==='pigtail') back=mirror(avPath(`M65 66Q20 48 31 ${88+length}Q53 ${107+length} 59 104Q72 93 65 66Z`,a,b)+avLine(`M50 79Q37 108 43 ${84+length}`,b,5));
   else if(kind==='braids'){for(const x of [52,148])for(let j=0;j<Math.ceil(length/10);j++)back+=avEllipse(x+(j%2?3:-3),86+j*10,10,9,j%2?a:b);}
   else if(kind==='buns')back=mirror(avEllipse(54,49+length*.6,19,20,a,b)+avLine(`M44 ${45+length*.6}Q61 ${35+length*.6} 64 ${54+length*.6}`,b,4));
   else if(kind==='pony')back=avPath(`M118 53Q179 32 168 ${100+length}Q141 ${88+length} 143 86Z`,a,b)+avLine(`M142 65Q166 87 156 ${84+length}`,b,5);
   else if(kind==='topknot')back=avEllipse(103,34,23,19,a,b)+avEllipse(105,30,12,9,b);
   else if(['long','bob','wave','shag'].includes(kind)){
    const bottom=102+length;
    back=avPath(`M59 71Q49 110 51 ${bottom}L70 ${bottom-8}L83 ${bottom}L100 ${bottom-9}L117 ${bottom}L130 ${bottom-8}L150 ${bottom}Q154 110 141 71Z`,a,b);
    for(const x of [62,72,130,140])back+=avLine(`M${x} 91Q${x+(kind==='wave'?10:3)} 121 ${x} ${bottom-9}`,b,3);
   }else back=avPath(`M57 66Q47 96 62 ${101+length}L75 105H126L140 ${101+length}Q155 91 143 65Z`,a,b);
   front=avPath('M57 86Q52 41 100 39Q148 41 143 86Q133 66 100 66Q67 66 57 86Z',a);
   const bangs=[
    'M60 76Q73 52 100 55Q93 76 65 87ZM100 55Q129 52 140 76L136 86Q111 76 100 55Z',
    'M60 68Q100 43 140 68L139 80L61 80Z',
    'M59 68Q94 38 140 64Q111 83 65 88Q91 71 97 63Z',
    'M59 72Q100 42 141 72L132 82L122 69L112 84L102 68L91 83L80 70L68 84Z',
    'M59 72Q79 48 98 55L86 82L62 85ZM102 55Q127 49 141 72L137 85L115 82Z',
    'M59 70Q75 48 100 64Q125 48 141 70L135 86Q113 76 100 85Q86 76 65 86Z',
    'M59 68Q100 44 141 68L137 84L125 74L117 88L102 75L92 87L79 73L64 85Z',
    'M61 67Q100 45 139 67L138 73L62 73Z',
    'M59 70Q100 45 141 70L136 86Q100 67 64 86Z',
    'M58 68Q98 39 141 65L140 93Q130 83 124 71Q97 87 65 94L80 73Z'
   ];
   front+=avPath(bangs[avState.bangs],a);
   front+=avLine('M70 61Q84 49 97 49',b,5);
   if(kind==='quiff')front=avPath(`M58 76Q58 ${32-length*.3} 109 ${34-length*.45}Q144 26 142 70Q114 52 94 67Z`,a,b)+avLine('M70 56Q92 38 121 41',b,5)+front;
   if(kind==='spikes')front=avPath(`M55 73L58 45L75 53L84 ${40-length*.5}L100 48L115 ${36-length*.4}L126 53L145 43L145 77Z`,a,b)+front;
   if(kind==='curls')for(let j=0;j<7;j++)front+=avEllipse(62+j*12,62-Math.sin(j/6*Math.PI)*(length*.5),10,11,j%3===0?b:a);
   if(kind==='undercut')front+=avLine('M56 87L64 80M57 94L64 87',b,3);
   return {back,front};
  }
  function avHead(){
   const [,a,b]=avState.headColors;
   const horn=avPath('M63 54Q43 32 61 13Q62 34 80 45Z',a,b);
   const ear=avPath('M60 54L55 17L87 44Z',a,b);
   const sym=s=>s+`<g transform="translate(200 0) scale(-1 1)">${s}</g>`;
   switch(avState.head){
   case 0:return '';
   case 1:return sym(horn);
   case 2:return avEllipse(100,25,37,9,'none',a)+avEllipse(100,25,30,5,'none',b);
   case 3:return sym(ear);
   case 4:return avStar(65,62,10,a)+avStar(135,62,10,b);
   case 5:return avPath('M66 48L65 29L83 38L100 19L117 38L135 29L134 48Z',a,b)+avEllipse(100,34,5,7,b);
   case 6:{const bow=(x,y)=>avPath(`M${x} ${y}l-13-8v16ZM${x} ${y}l13-8v16Z`,a,b)+avEllipse(x,y,3.5,3.5,b);return bow(70,54)+bow(130,54);} // two bows on the head, in place of the crystal crown
   case 7:return avLine('M72 48Q64 23 53 22M128 48Q136 23 147 22',b)+avHeart(53,23,.7,a)+avHeart(147,23,.7,a);
   case 8:return sym(avEllipse(74,26,10,27,a,b)+avEllipse(74,25,4,18,b));
   case 9:return sym(avEllipse(65,44,17,17,a,b)+avEllipse(65,44,9,9,b));
   case 10:return avLine('M52 85Q44 31 100 31Q156 31 148 85',a,7)+avEllipse(53,87,8,18,b,a)+avEllipse(147,87,8,18,b,a);
   case 11:return avEllipse(81,55,17,11,a,b)+avEllipse(119,55,17,11,a,b)+avLine('M98 55H102',b,4);
   case 12:return avLine('M60 62Q100 30 140 62',b,5)+avPath('M100 43L74 25L76 55ZM100 43L126 25L124 55Z',a,b);
   case 13:{let out='';for(let j=0;j<7;j++){let x=61+j*13,y=54-Math.sin(j/6*Math.PI)*16;out+=avStar(x,y,9,a,6)+avEllipse(x,y,3,3,b)}return out;}
   case 14:return avPath('M83 41L81 12H118L116 41Z',a,b)+avEllipse(100,42,31,6,b)+avLine('M83 32H116',b,5);
   case 15:return `<g transform="rotate(-20 120 48)">${avEllipse(120,48,27,11,a,b)+avLine('M121 37L123 31',b,4)}</g>`; // smaller, crooked, on the side
   case 16:return avPath('M68 46L95 4L119 17L111 17L132 46Z',a,b)+avEllipse(100,47,46,7,b);
   case 17:return sym(avEllipse(62,53,9,13,a)+avEllipse(70,58,8,10,b)+avLine('M64 50L69 65',b));
   case 18:return avLine('M100 43V24',b,4)+avPath('M100 28Q73 6 74 27Q82 39 100 28ZM100 28Q127 6 126 27Q118 39 100 28Z',a,b);
   case 19:return avEllipse(100,35,46,12,'none',a)+avEllipse(100,35,32,18,'none',b)+avStar(142,29,6,b);
   }
  }
  // accessories that hang behind the body; drawn before the outfit so they tuck in behind it (2026-10-27)
  const AV_BEHIND=new Set([8,9,10,19]);
  function avBody(behind=false){
   if(AV_BEHIND.has(avState.body)!==behind)return avState.body===8&&!behind?avLine('M88 128L80 160M112 128L120 160',avState.bodyColors[1],4):'';
   const [,a,b]=avState.bodyColors;
   const bow=(x,y)=>avPath(`M${x} ${y}l-16-9v18ZM${x} ${y}l16-9v18Z`,a,b)+avEllipse(x,y,4,4,b);
   switch(avState.body){
   case 0:return '';
   case 1:return bow(100,137);
   case 2:return avLine('M85 131Q100 156 115 131',a)+avHeart(100,152,.55,b);
   case 3:return avLine('M85 131Q100 156 115 131',a)+avStar(100,151,8,b);
   case 4:{let s='';for(let i=0;i<7;i++)s+=avEllipse(83+i*5.6,133+Math.sin(i/6*Math.PI)*9,3,3,i%2?a:b);return s;}
   case 5:return avPath('M84 127L119 182L127 180L91 126Z',a,b);
   case 6:return avPath('M76 164H124V172H76Z',a,b)+bow(100,168);
   case 7:{let s='';for(let i=0;i<=10;i++){const t=i/10,x=74+t*52,y=160+Math.sin(t*Math.PI)*16;s+=avEllipse(x,y,4.2,2.8,'none',i%2?a:b).replace('stroke-width="2"','stroke-width="2.4"')}return s+avStar(100,177,8,b);} // a bigger chain
   case 8:return avPath('M62 140Q49 127 49 151V175H70ZM138 140Q151 127 151 151V175H130Z',a,b);
   case 9:return avPath('M78 143Q34 107 42 147L29 147Q40 175 74 164ZM122 143Q166 107 158 147L171 147Q160 175 126 164Z',a,b);
   case 10:return avPath('M78 143L35 119L42 147L28 164Q49 151 58 177L74 166ZM122 143L165 119L158 147L172 164Q151 151 142 177L126 166Z',a,b);
   case 11:return avPath('M86 128Q63 134 54 184L84 175L100 183L116 175L146 184Q137 134 114 128Z',a,b);
   case 12:return avPath('M76 126Q100 136 124 126V141Q112 145 106 143L119 175L109 181L95 143Q84 145 76 141Z',a,b); // wider on the neck
   case 13:return avStar(117,145,9,a,7)+avEllipse(117,145,4,4,b);
   case 14:return avPath('M123 136A10 10 0 1 0 123 156A8 8 0 0 1 123 136Z',a,b);
   case 15:return avPath('M95 127H105L103 134L108 172L100 182L92 172L97 134Z',a,b)+avLine('M96 142L104 148M95 155L105 161M94 168L106 174',b,1.5); // a long tie, in place of the double bows
   case 16:return avLine('M88 126L131 184M112 126L69 184M72 155H128',a,4)+avEllipse(100,155,5,5,b); // the straps run to every edge of the outfit
   case 17:return avLine('M87 129L128 165',a,3)+avHeart(129,174,1.1,b);
   case 18:return avPath('M84 158H116L113 176Q100 179 87 176Z',a,b)+avHeart(100,169,.42,b); // a heart pocket, in place of the arm cuffs
   case 19:return avLine('M126 173Q178 211 165 149',a,5)+avPath('M165 141L154 159L174 155Z',b);
   }
  }
  function avEffects(){
   const [,a,b]=avState.fxColors;let s='';let seed=avState.seed;
   const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
   for(let j=0;j<14;j++){
    let angle=j/14*Math.PI*2,x=100+Math.cos(angle)*80,y=109+Math.sin(angle)*92;
    const size=2+random()*3,c=j%2?a:b;
    if(avState.fx===3||avState.fx===18){x=100+Math.cos(angle)*67;y=30+Math.sin(angle)*17;}
    else if(avState.fx===15){x=100+Math.cos(angle*2)*(42+j*3);y=105+Math.sin(angle*2)*(42+j*3);}
    else if(![9,16].includes(avState.fx)){x+=random()*10-5;y+=random()*10-5;}
    switch(avState.fx){
     case 0:s+=avStar(x,y,size,c,4);break;
     case 1:case 18:s+=avPath(`M${x} ${y-size}l${size*.6} ${size}l${-size*.6} ${size}l${-size*.6} ${-size}Z`,c);break;
     case 2:case 3:case 17:s+=avStar(x,y,size,c);break;
     case 4:s+=avHeart(x,y,size*.23,c);break;
     case 5:s+=avEllipse(x,y,size,size,'none',c);break;
     case 6:for(let k=0;k<3;k++){let t=k*Math.PI/3;s+=avLine(`M${x-Math.cos(t)*size} ${y-Math.sin(t)*size}L${x+Math.cos(t)*size} ${y+Math.sin(t)*size}`,c,1)}break;
     case 7:s+=avLine(`M${x-10} ${y-7}L${x} ${y}`,c,1)+avStar(x,y,size,c,4);break;
     case 8:s+=`<rect x="${x}" y="${y}" width="${size}" height="${size*1.6}" fill="${c}" transform="rotate(${j*27} ${x} ${y})"/>`;break;
     case 9:if(j<3)s+=`<ellipse cx="100" cy="105" rx="83" ry="${30+j*16}" transform="rotate(${j*50} 100 105)" fill="none" stroke="${c}" stroke-width="1" opacity=".65"/>`;break;
     case 10:s+=avPath(`M${x+size} ${y-size}a${size} ${size} 0 1 0 0 ${size*2}a${size*.8} ${size*.8} 0 0 1 0 ${-size*2}Z`,c);break;
     case 11:s+=avEllipse(x,y,size,size,c)+avEllipse(x,y,size*2,size*2,c).replace('/>',' opacity=".16"/>');break;
     case 12:s+=avPath(`M${x} ${y-size*2}l${size} ${size*2}l${-size} ${size}l${-size} ${-size}Z`,c);break;
     case 13:s+=avLine(`M${x-size} ${y}h${size*2}M${x} ${y-size}v${size*2}`,c,1.4);break;
     case 14:s+=`<ellipse cx="${x}" cy="${y}" rx="${size*.5}" ry="${size*1.5}" fill="${c}" transform="rotate(${j*35} ${x} ${y})"/>`;break;
     case 15:case 16:s+=avEllipse(x,y,size*.5,size*.5,c);break;
     case 19:s+=avLine(`M${x-4} ${y-5}q10 3 0 7q-8 3 2 8`,c,1.5);break;
    }
   }
   return `<g class="avatar-sparkles" pointer-events="none">${s}</g>`;
  }
  function avFit(){const [,a,b]=avState.fitColors;const k=avState.fit;let s=avPath('M64 184Q80 119 100 121Q120 119 136 184Z',a,b);if(k===1||k===7)s=avPath('M83 126L65 143L75 155L81 148V184H119V148L125 155L135 143L117 126Z',a,b);if([2,4,9].includes(k))s+=avPath('M85 128L100 150L115 128L108 160L119 184H81L92 160Z',b);if(k===3)s+=avLine('M76 155H124M72 168H128',b,5);if(k===5)s+=avPath('M100 123Q120 119 136 184H100Z',b);if(k===6)for(let x=78;x<=122;x+=11)s+=avLine(`M100 138L${x} 183`,b,2);if(k===8)s+=avLine('M87 129V156H113V129M82 156H118V182H82Z',b,4);return s;}
  const labSvg=document.getElementById('labSvg');
  function drawLab(){
   const hair=avHair();
   const lashes=AV_LASH_D[avState.lashes]?avLine(AV_LASH_D[avState.lashes],'#2a1330',2.4):'';
   labSvg.innerHTML=`<ellipse cx="100" cy="188" rx="52" ry="9" fill="#ff2e7e" opacity=".3"/>${hair.back}${avBody(true)}${avFit()}${avBody()}<circle cx="100" cy="88" r="42" fill="#f9d8c4"/>${hair.front}${avHead()}<g fill="#2a1330"><ellipse cx="85" cy="94" rx="6" ry="8"/><ellipse cx="115" cy="94" rx="6" ry="8"/></g>${lashes}<g fill="#fff"><circle cx="87" cy="91" r="2.3"/><circle cx="117" cy="91" r="2.3"/></g><ellipse cx="76" cy="106" rx="9" ry="5" fill="#ff8fd0" opacity=".55"/><ellipse cx="124" cy="106" rx="9" ry="5" fill="#ff8fd0" opacity=".55"/>${avLine('M95 108q5 5 10 0','#c4306b',2.4)}${avEffects()}`;
   const labels={hair:AV_HAIR[avState.hairGroup][avState.hair][0],bangs:AV_BANGS[avState.bangs],head:AV_HEAD[avState.head],body:AV_BODY[avState.body],fit:AV_FITS[avState.fit],fx:AV_FX[avState.fx],lashes:AV_LASHES[avState.lashes]};
   for(const [part,label] of Object.entries(labels))document.getElementById('lb-'+part).textContent=label;
   document.getElementById('labLashes').setAttribute('aria-pressed',String(avState.lashes!==3));
   document.getElementById('labPalette').textContent='Hair colors: '+avState.hairColors[0]+' · '+avState.hairColors.slice(1).join(' / ');
   labSvg.setAttribute('aria-label',labels.hair+', '+labels.bangs+' bangs, '+labels.head+', '+labels.body+', '+labels.fx+', lashes '+labels.lashes.toLowerCase());
  }
  function avRandomHair(){
   const previous=avState.hairGroup+':'+avState.hair;
   const choices=(avState.group==='all'?['girls','boys']:[avState.group]).flatMap(group=>AV_HAIR[group].map((_,index)=>({group,index}))).filter(c=>c.group+':'+c.index!==previous);
   const choice=choices[avPick(choices.length)];avState.hairGroup=choice.group;avState.hair=choice.index;avState.bangs=AV_HAIR[choice.group][choice.index][2];avState.hairColors=avPalette();
  }
  document.getElementById('labHairGroup').onchange=event=>{avState.group=event.target.value;avRandomHair();drawLab()};
  document.querySelectorAll('[data-avatar-part]').forEach(button=>button.onclick=()=>{
   const part=button.dataset.avatarPart;
   if(part==='hair')avRandomHair();
   else if(part==='bangs'){avState.bangs=avNext(avState.bangs,AV_BANGS.length);avState.hairColors=avPalette()}
   else if(part==='lashes')avState.lashes=(avState.lashes+1)%AV_LASHES.length;
   else{const options={head:AV_HEAD,body:AV_BODY,fit:AV_FITS,fx:AV_FX};avState[part]=avNext(avState[part],options[part].length);avState[part+'Colors']=avPalette();if(part==='fx')avState.seed=avPick(1e9)}
   drawLab();
  });
  document.getElementById('labRand').onclick=()=>{avRandomHair();for(const [part,options] of Object.entries({head:AV_HEAD,body:AV_BODY,fit:AV_FITS,fx:AV_FX})){avState[part]=avNext(avState[part],options.length);avState[part+'Colors']=avPalette()}avState.seed=avPick(1e9);drawLab()};
  // the avatar library (Astra, 2026-10-29): save a look you like, then open the library to see every saved one; tap one to
  // wear it again, ✕ to let it go. Kept in this browser
  const LIB_KEY='findastra-avatar-library',libBox=document.getElementById('labLib'),libBtn=document.getElementById('labLibBtn');
  let lib=store.get(LIB_KEY,[]);if(!Array.isArray(lib))lib=[];
  const showLib=()=>{
   libBtn.textContent='library ('+lib.length+')';
   libBox.replaceChildren(...(lib.length?lib.map((look,i)=>{
    const card=el('div','lib-look'),wear=el('button','lib-wear');wear.type='button';wear.setAttribute('aria-label','wear '+look.name);
    wear.innerHTML=`<svg viewBox="0 0 200 230" aria-hidden="true">${look.svg}</svg>`;wear.append(el('span',null,look.name));
    wear.onclick=()=>{Object.assign(avState,JSON.parse(JSON.stringify(look.state)));drawLab();document.getElementById('labName').textContent=look.name};
    const drop=el('button','lib-drop','✕');drop.type='button';drop.setAttribute('aria-label','remove '+look.name+' from the library');
    drop.onclick=()=>{lib.splice(i,1);store.set(LIB_KEY,lib);showLib()};
    card.append(wear,drop);return card;
   }):[el('p','muted mono','Nothing saved yet. Find a look you like and save it.')]));
  };
  document.getElementById('labSave').onclick=()=>{
   const first=['Glitter','Neon','Velvet','Moonlit','Silver','Cherry'],last=['Poppy','Seraph','Riot','Halo','Peach','Bunny'];
   const name=first[avPick(first.length)]+' '+last[avPick(last.length)];
   lib=[{name,state:JSON.parse(JSON.stringify(avState)),svg:labSvg.innerHTML},...lib].slice(0,40);store.set(LIB_KEY,lib);showLib();
   document.getElementById('labName').textContent=name+' — saved to your library';
  };
  libBtn.onclick=()=>{libBox.hidden=!libBox.hidden;libBtn.setAttribute('aria-expanded',String(!libBox.hidden))};
  showLib();
  drawLab();
  }
})();
