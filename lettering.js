// The hand lettering slider in the hero. Pictures and words come from lettering-data.js (Portfolio Puffer's
// Handwritten Message Manager writes it). Each picture is a transparent ink mask, painted in the hero's --ink,
// so it is white on the dark hero and black once it is unmasked. Swipe, the arrows, the dots or the arrow keys move it.
(() => {
  const L = (window.LETTERING || {}).items || [];
  const box = document.getElementById('lettering');
  if (!box || !L.length) return;
  const track = document.getElementById('letter-track');
  const dots = document.getElementById('letter-dots');
  const count = document.getElementById('letter-count');
  const el = (tag, cls) => { const n = document.createElement(tag); if (cls) n.className = cls; return n; };
  const okFile = (f) => /^art\/lettering\/[a-z0-9._-]+\.png$/i.test(f);

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
  show(0);
})();
