// The hand lettering slider in the hero. Pictures and words come from lettering-data.js (Portfolio Puffer's
// Handwritten Message Manager writes it). Each picture is a transparent ink mask, painted in the hero's --ink,
// so it is white on the dark hero and black once it is unmasked. Swipe, the arrows, the dots or the arrow keys move it.
// Each picture is cut into its separate words, which are laid out large in rows (Astra, 2026-10-27: "chop all the words
// up individually and just like line them up"); a picture that cannot be cut shows whole.
(() => {
  const L = (window.LETTERING || {}).items || [];
  const box = document.getElementById('lettering');
  if (!box || !L.length) return;
  const track = document.getElementById('letter-track');
  const dots = document.getElementById('letter-dots');
  const count = document.getElementById('letter-count');
  const el = (tag, cls) => { const n = document.createElement(tag); if (cls) n.className = cls; return n; };
  const okFile = (f) => /^art\/lettering\/[a-z0-9._-]+\.png$/i.test(f);

  // finds the lines of writing, then the words in each line, from where the ink is; the gap that splits words is chosen
  // so the number of words matches the words the picture says
  function cut(img, wanted) {
    const S = 2, w = Math.round(img.naturalWidth / S), h = Math.round(img.naturalHeight / S);
    const cv = el('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, w, h);
    const a = cx.getImageData(0, 0, w, h).data, ink = (x, y) => a[(y * w + x) * 4 + 3] > 50;
    const rows = Array.from({ length: h }, (_, y) => { let n = 0; for (let x = 0; x < w; x++) n += ink(x, y); return n; });
    // a line's core is where the ink is thick; loops of g, y and l reach between lines but are thin, so they don't join them
    const most = Math.max(...rows), inked = rows.map((n) => n > 0);
    let bands = [], y0 = -1;
    for (let y = 0; y <= h; y++) { const on = y < h && rows[y] > most * .14; if (on && y0 < 0) y0 = y; if (!on && y0 >= 0) { bands.push([y0, y - 1]); y0 = -1; } }
    // small bands (dots, accents, stray strokes) join the nearest line; lines closer than a little gap join too
    const tall = (b) => b[1] - b[0];
    const med = [...bands].sort((p, q) => tall(q) - tall(p))[Math.floor(bands.length / 3)] || bands[0];
    if (!med) return null;
    const unit = tall(med);
    let merged = true;
    while (merged && bands.length > 1) {
      merged = false;
      for (let i = 0; i < bands.length; i++) {
        const b = bands[i], prev = bands[i - 1], next = bands[i + 1];
        const small = tall(b) < unit * .45, gapUp = prev ? b[0] - prev[1] : 1e9, gapDown = next ? next[0] - b[1] : 1e9;
        if (small || Math.min(gapUp, gapDown) < unit * .12) {
          const j = gapUp <= gapDown ? i - 1 : i + 1; if (j < 0 || j >= bands.length) continue;
          const lo = Math.min(i, j); bands.splice(lo, 2, [Math.min(bands[lo][0], bands[lo + 1][0]), Math.max(bands[lo][1], bands[lo + 1][1])]);
          merged = true; break;
        }
      }
    }
    // each line reaches halfway to its neighbours, so its ascenders and descenders come with it; its words are split where its
    // core has no ink
    const first = inked.indexOf(true), last = inked.lastIndexOf(true);
    const lines = bands.map(([t, b], i) => {
      const top = i ? Math.round((bands[i - 1][1] + t) / 2) : first, bottom = i < bands.length - 1 ? Math.round((b + bands[i + 1][0]) / 2) : last;
      const cols = Array.from({ length: w }, (_, x) => { for (let y = t; y <= b; y++) if (ink(x, y)) return 1; return 0; });
      return { t: top, b: bottom, cols, core: b - t + 1 };
    }).map(({ t, b, cols, core }) => {
      const runs = []; let x0 = -1;
      for (let x = 0; x <= w; x++) { const on = x < w && cols[x]; if (on && x0 < 0) x0 = x; if (!on && x0 >= 0) { runs.push([x0, x - 1]); x0 = -1; } }
      return { t, b, runs, core };
    }).filter((l) => l.runs.length);
    const gaps = [...new Set(lines.flatMap((l) => l.runs.slice(1).map((r, i) => r[0] - l.runs[i][1])))].sort((p, q) => p - q);
    const words = (T) => lines.reduce((n, l) => n + 1 + l.runs.slice(1).filter((r, i) => r[0] - l.runs[i][1] >= T).length, 0);
    let T = unit * .35, best = Math.abs(words(T) - wanted);
    for (const g of gaps) { if (g < unit * .12) continue; const d = Math.abs(words(g) - wanted); if (d < best || (d === best && g > T)) { best = d; T = g; } }
    // the word boxes, back at the picture's full size
    const out = [];
    for (const l of lines) {
      let cur = [...l.runs[0]];
      // a little room either side for strokes that lean past the core (half the word gap at most)
      const pad = Math.min(T / 2, unit * .3);
      const push = () => { const x0 = Math.max(0, cur[0] - pad), x1 = Math.min(w - 1, cur[1] + pad); out.push({ x: Math.round(x0 * S), y: l.t * S, w: Math.round((x1 - x0 + 1) * S), h: (l.b - l.t + 1) * S, core: Math.max(l.core, unit) * S }); };
      for (let i = 1; i < l.runs.length; i++) { const r = l.runs[i]; if (r[0] - cur[1] >= T) { push(); cur = [...r]; } else cur[1] = r[1]; }
      push();
    }
    return { words: out, unit: unit * S };
  }
  // one word as an ink mask of its own, sized so a line of writing is about the same height on every slide
  function wordsOf(img, it, holder) {
    let res = null;
    const wanted = String(it.words || '').split(/\s+/).filter(Boolean).length || 1;
    try { res = cut(img, wanted); } catch { res = null; }
    // a picture whose words could not be told apart (off by more than one) shows whole instead
    if (!res || Math.abs(res.words.length - wanted) > 1) return false;
    for (const w of res.words) {
      // each word scaled by its own line, so a block of lines that did not come apart shrinks to fit instead of growing
      const k = 1 / w.core;
      const c = el('canvas'); c.width = w.w; c.height = w.h; c.getContext('2d').drawImage(img, w.x, w.y, w.w, w.h, 0, 0, w.w, w.h);
      const word = el('span', 'letter-word');
      word.style.setProperty('--src', `url("${c.toDataURL('image/png')}")`);
      word.style.setProperty('--w', (w.w * k).toFixed(3)); word.style.setProperty('--h', (w.h * k).toFixed(3));
      holder.append(word);
    }
    return true;
  }

  const slides = [], marks = [];
  L.filter((it) => it && okFile(it.file)).forEach((it, i, all) => {
    const s = el('div', 'letter');
    s.setAttribute('role', 'group');
    s.setAttribute('aria-roledescription', 'slide');
    s.setAttribute('aria-label', `${i + 1} of ${all.length}`);
    const ink = el('div', 'letter-ink');
    ink.setAttribute('role', 'img');
    ink.setAttribute('aria-label', String(it.words || 'Hand lettering by Astra'));
    ink.style.setProperty('--src', `url("${it.file}")`);
    s.append(ink); track.append(s); slides.push(s);
    // swap the whole picture for its words once they are cut
    const img = new Image();
    img.onload = () => {
      const holder = el('div', 'letter-words'); holder.setAttribute('role', 'img'); holder.setAttribute('aria-label', String(it.words || 'Hand lettering by Astra'));
      if (wordsOf(img, it, holder)) ink.replaceWith(holder);
    };
    img.src = it.file;
    const d = el('button', 'letter-dot');
    d.type = 'button';
    d.setAttribute('aria-label', `Show lettering ${i + 1}: ${it.words || ''}`);
    d.onclick = () => go(i);
    dots.append(d); marks.push(d);
  });
  if (!slides.length) return;
  box.hidden = false;

  let at = 0, target = null;
  const show = (i) => {
    at = i;
    marks.forEach((d, j) => d.setAttribute('aria-current', j === i ? 'true' : 'false'));
    if (count) count.textContent = `${i + 1} / ${slides.length}`;
  };
  const go = (i) => {
    const n = (i + slides.length) % slides.length;
    target = n;
    track.scrollTo({ left: slides[n].offsetLeft - track.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    show(n);
  };
  document.getElementById('letter-prev').onclick = () => go(at - 1);
  document.getElementById('letter-next').onclick = () => go(at + 1);
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(at + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(at - 1); }
  });
  // a swipe (scroll-snap) moves the dots too
  let t;
  track.addEventListener('scroll', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const i = Math.min(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)), slides.length - 1);
      if (target !== null) { if (i === target) target = null; return; } // still gliding to an arrow or dot pick
      if (i !== at) show(i);
    }, 120);
  }, { passive: true });
  addEventListener('resize', () => { track.scrollLeft = slides[at].offsetLeft - track.offsetLeft; });
  // a different one each visit (Astra, 2026-10-27: "I also want that slide to be random")
  const first = Math.floor(Math.random() * slides.length);
  requestAnimationFrame(() => { track.scrollLeft = slides[first].offsetLeft - track.offsetLeft; });
  show(first);
})();
