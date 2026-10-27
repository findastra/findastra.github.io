// The arcade's newer games (Astra, 2026-10-27): the Fuzzboi Forge and the Fuzzboi cyber home it fills, and the two games from
// Mommy's website (findastra/mommys-website): the sparkle catcher ("Catch the beat") and the Avatar Lab. The cabinets stay
// black and gray; the art inside them keeps its own colors. Fuzzboi rules and drawing come from the Fuzzboi Forge itself
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

  // ---------- Fuzzboi Forge: type a six-digit code, get that exact Fuzzboi; each one moves into the cyber home ----------
  const RULES = 'https://findastra.github.io/fuzzboi-factory/site/fuzzboi.js';
  const LAYERS = 'https://raw.githubusercontent.com/findastra/astras-pet-os/main/desktop-art/fuzzboi-friend/layers/';
  const HOME_MAX = 30, HOME_KEY = 'findastra-fuzzboi-home-v1';
  const layers = new Map();
  let F = null, layersIn = 0;
  const forge = $('fz-cv'), codeIn = $('fz-code'), note = $('fz-note');
  const loadScript = (src) => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.append(s); });
  const ready = (async () => {
    try { await loadScript(RULES); F = window.Fuzzboi; } catch { note.textContent = 'The Fuzzboi Forge did not answer. Try again in a minute.'; return; }
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
  function make(code, moveIn = true) {
    if (!F) return;
    const d = F.decode(code);
    if (!/^[0-9A-F]{6}$/.test(d.code)) { note.textContent = d.flags.map((f) => f[1]).join(' '); return; }
    codeIn.value = d.code;
    if (F.missing(d.parts, layers).length) F.drawStandIn(forge, d.parts); else F.drawLayers(forge, d.parts, layers);
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
  $('fz-form').addEventListener('submit', async (e) => { e.preventDefault(); await ready; make(codeIn.value.trim()); });
  codeIn.addEventListener('input', () => { codeIn.value = codeIn.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6); });
  $('fz-random').onclick = async () => { await ready; make(Math.floor(Math.random() * 0x1000000).toString(16).toUpperCase().padStart(6, '0')); };
  $('fz-save').onclick = async () => { await ready; if (F && codeIn.value.length === 6) F.savePng(forge, `fuzzboi-${codeIn.value}.png`).catch(() => (note.textContent = 'This browser would not save the picture.')); };

  // ---------- the cyber home: every Fuzzboi made above moves in, up to 30; they wander and hop ----------
  const home = (() => {
    const cv = $('home'), cx = cv.getContext('2d');
    let W = 0, H = 0, picked = null;
    const folks = [];
    const floorTop = () => H * .42; // the back wall meets the floor here
    function resize() { const r = fit(cv); W = r.width; H = r.height; }
    new ResizeObserver(resize).observe(cv); resize();
    // big while the home is empty, smaller as it fills, so all 30 fit
    const sizeFor = () => Math.max(52, Math.min(130, W / (2.6 + folks.length * .35)));
    function spawn(code, at) {
      const p = F.decode(code).parts;
      return { code, art: sprite(p, 192), x: at ? at.x : 40 + Math.random() * Math.max(1, W - 80), y: at ? at.y : floorTop() + 20 + Math.random() * Math.max(1, H - floorTop() - 40),
        vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .3, hop: 0, t: Math.random() * 100, born: performance.now() };
    }
    function save() { store.set(HOME_KEY, folks.map((f) => f.code)); count(); }
    function count() {
      $('home-count').textContent = `${folks.length} of ${HOME_MAX} moved in`;
      $('home-out').disabled = !picked; $('home-clear').disabled = !folks.length;
      $('home-pick').textContent = picked ? `#${picked.code} · tap “let them out” to give the spot to someone new` : folks.length ? 'Tap a Fuzzboi to see its code.' : 'Nobody lives here yet. Make a Fuzzboi above and it moves in.';
    }
    function add(code) {
      if (folks.length >= HOME_MAX) return `The cyber home is full (${HOME_MAX}). Let one out to make room.`;
      folks.push(spawn(code)); save();
      return `#${code} moved into the cyber home (${folks.length} of ${HOME_MAX}).`;
    }
    cv.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, s = sizeFor();
      const hit = [...folks].sort((a, b) => b.y - a.y).find((f) => Math.abs(f.x - x) < s * .45 && y > f.y - s * .95 && y < f.y + s * .05);
      picked = hit === picked ? null : hit || null;
      if (picked) { picked.hop = 1; codeIn.value = picked.code; make(picked.code, false); }
      count();
    });
    $('home-out').onclick = () => { if (!picked) return; folks.splice(folks.indexOf(picked), 1); picked = null; save(); };
    $('home-clear').onclick = () => { folks.length = 0; picked = null; save(); };
    // the room: graphite walls, a neon grid floor in perspective, a window of falling code
    function room(t) {
      const ft = floorTop();
      cx.fillStyle = '#121212'; cx.fillRect(0, 0, W, ft);
      cx.fillStyle = '#0a0a0a'; cx.fillRect(0, ft, W, H - ft);
      cx.strokeStyle = 'rgba(0, 225, 255, .35)'; cx.lineWidth = 1;
      for (let i = 0; i <= 12; i++) { const x = (i / 12) * W; cx.beginPath(); cx.moveTo(W / 2 + (x - W / 2) * .35, ft); cx.lineTo(x, H); cx.stroke(); }
      for (let j = 1; j <= 7; j++) { const y = ft + (H - ft) * Math.pow(j / 7, 1.7); cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke(); }
      cx.strokeStyle = '#ff3ea5'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, ft); cx.lineTo(W, ft); cx.stroke();
      // window on the back wall
      const ww = Math.min(150, W * .24), wh = ft * .6, wx = W * .68, wy = ft * .16;
      cx.fillStyle = '#000'; cx.fillRect(wx, wy, ww, wh);
      cx.save(); cx.beginPath(); cx.rect(wx, wy, ww, wh); cx.clip();
      cx.fillStyle = 'rgba(198, 255, 0, .7)'; cx.font = '11px JetBrains Mono, monospace';
      for (let c = 0; c < ww / 12; c++) { const y = ((t * .04 + c * 37) % (wh + 40)) - 20; cx.fillText('01ア✦'[(c + Math.floor(t / 300)) % 4], wx + 3 + c * 12, wy + y); }
      cx.restore();
      cx.strokeStyle = '#555'; cx.lineWidth = 3; cx.strokeRect(wx, wy, ww, wh); cx.beginPath(); cx.moveTo(wx + ww / 2, wy); cx.lineTo(wx + ww / 2, wy + wh); cx.stroke();
      // a little sign
      cx.fillStyle = '#ff3ea5'; cx.font = '700 13px JetBrains Mono, monospace'; cx.fillText('FUZZBOI CYBER HOME', 14, 26);
    }
    function frame(t) {
      requestAnimationFrame(frame);
      if (!W) return;
      room(t);
      const s = sizeFor(), ft = floorTop();
      for (const f of folks) {
        if (!reduced) {
          f.t += 1; f.x += f.vx; f.y += f.vy;
          if (Math.random() < .006) { f.vx = (Math.random() - .5) * .9; f.vy = (Math.random() - .5) * .4; }
          if (Math.random() < .003) f.hop = 1;
          if (f.x < s * .4 || f.x > W - s * .4) f.vx *= -1;
          if (f.y < ft + s * .3 || f.y > H - 6) f.vy *= -1;
          f.x = Math.min(Math.max(f.x, s * .4), W - s * .4); f.y = Math.min(Math.max(f.y, ft + s * .3), H - 6);
        }
        f.hop = Math.max(0, f.hop - .04);
      }
      for (const f of [...folks].sort((a, b) => a.y - b.y)) {
        const drop = Math.max(0, 1 - (t - f.born) / 650); // a new one drops in from above
        const depth = .7 + .3 * ((f.y - ft) / Math.max(1, H - ft)), size = s * depth;
        const lift = Math.sin(f.hop * Math.PI) * size * .35 + drop * drop * H * .8 + (reduced ? 0 : Math.sin(f.t / 18) * 1.5);
        cx.fillStyle = 'rgba(0, 0, 0, .55)'; cx.beginPath(); cx.ellipse(f.x, f.y, size * .32, size * .08, 0, 0, 7); cx.fill();
        if (f === picked) { cx.strokeStyle = '#' + f.code; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(f.x, f.y, size * .42, size * .12, 0, 0, 7); cx.stroke(); }
        cx.drawImage(f.art, f.x - size / 2, f.y - size * .92 - lift, size, size);
      }
      if (folks.length >= HOME_MAX) { cx.fillStyle = '#c6ff00'; cx.font = '700 13px JetBrains Mono, monospace'; cx.fillText('FULL HOUSE', W - 104, 26); }
    }
    ready.then(() => {
      if (!F) return;
      // the same Fuzzbois move back in on the next visit (kept in this browser only)
      const saved = store.get(HOME_KEY, []);
      if (Array.isArray(saved)) for (const code of saved.slice(0, HOME_MAX)) if (/^[0-9A-F]{6}$/.test(code)) { const f = spawn(code); f.born = -1e9; folks.push(f); }
      count();
      const linked = /^#fuzzboi-([0-9A-F]{6})$/i.exec(location.hash);
      make(linked ? linked[1].toUpperCase() : '456900', !!linked && !(Array.isArray(saved) && saved.includes(linked[1].toUpperCase())));
      requestAnimationFrame(frame);
    });
    count();
    return { add };
  })();

  // ---------- the sparkle catcher, from Mommy's website ("Catch the beat"): tap the sparkles before they burn out ----------
  (() => {
    const bc = $('beatC'), bx = bc.getContext('2d');
    const HUES = [330, 318, 345, 300, 42, 200];
    let targets = [], pops = [], score = 0, combo = 0, best = store.get('findastra-beat-best', 0) || 0, miss = 0, on = false, spawnIn = 0;
    const bS = $('bScore'), bC = $('bCombo'), bB = $('bBest'); bB.textContent = best;
    let w = 0, h = 0;
    const size = () => { const r = fit(bc); w = r.width; h = r.height; };
    new ResizeObserver(size).observe(bc); size();
    function start() { targets = []; score = 0; combo = 0; miss = 0; on = true; spawnIn = 0; bS.textContent = 0; bC.textContent = 0; $('beatBtn').textContent = 'playing…'; }
    function end() { on = false; $('beatBtn').textContent = 'start set'; if (score > best) { best = score; bB.textContent = best; store.set('findastra-beat-best', best); } }
    function loop() {
      requestAnimationFrame(loop);
      bx.fillStyle = '#060606'; bx.fillRect(0, 0, w, h);
      bx.strokeStyle = 'rgba(255, 255, 255, .07)'; bx.lineWidth = 1;
      for (let i = 1; i < 4; i++) { bx.beginPath(); bx.moveTo(0, h * i / 4); bx.lineTo(w, h * i / 4); bx.stroke(); }
      if (on && --spawnIn <= 0) {
        spawnIn = Math.max(16, 46 - score * .28);
        targets.push({ x: 24 + Math.random() * (w - 48), y: 24 + Math.random() * (h - 48), t: 1, hue: HUES[(Math.random() * 4) | 0], sp: .010 + Math.min(.014, score * .00013) });
      }
      bx.save(); bx.globalCompositeOperation = 'lighter';
      for (const t of targets) {
        t.t -= t.sp;
        const R = 10 + (1 - t.t) * 16, a = Math.max(0, t.t);
        bx.strokeStyle = `hsla(${t.hue},100%,72%,${a})`; bx.lineWidth = 3;
        bx.beginPath(); bx.arc(t.x, t.y, R + 12 * t.t, 0, 6.283); bx.stroke();
        bx.fillStyle = `hsla(${t.hue},100%,86%,${a})`; bx.beginPath();
        for (let i = 0; i < 8; i++) { const rr = i % 2 ? 4 : 12, an = i * Math.PI / 4 + (1 - t.t) * 3; bx.lineTo(t.x + Math.cos(an) * rr, t.y + Math.sin(an) * rr); }
        bx.closePath(); bx.fill();
      }
      // the burst where a sparkle was caught
      for (const p of pops) {
        p.x += p.vx; p.y += p.vy; p.vy += .05; p.life -= .03;
        bx.fillStyle = `hsla(${p.hue},100%,80%,${Math.max(0, p.life)})`; bx.beginPath(); bx.arc(p.x, p.y, 2.2, 0, 6.283); bx.fill();
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
  const AV_HEAD=['None','Devil horns','Halo','Cat ears','Star clips','Moon crown','Crystal crown','Heart antennae','Rabbit ears','Bear ears','Headphones','Goggles','Bow headband','Flower crown','Tiny top hat','Beret','Witch hat','Butterfly clips','Leaf sprout','Satellite rings'];
  const AV_BODY=['None','Neck bow','Heart pendant','Star pendant','Pearl collar','Crossbody sash','Ribbon belt','Chain belt','Mini backpack','Angel wings','Bat wings','Shoulder cape','Scarf','Rose brooch','Moon brooch','Double bows','Harness straps','Heart purse','Arm cuffs','Devil tail'];
  const AV_FX=['Four-point glints','Tiny diamonds','Twinkle stars','Star halo','Heart dust','Pearl bubbles','Snowflakes','Comet trails','Confetti','Orbit rings','Crescent moons','Fireflies','Crystal shards','Cross glints','Petal drift','Spiral dust','Dotted aura','Star shower','Diamond crown','Ribbon sparks'];
  const AV_FITS=['Skater dress','Tunic','Jacket','Sweater','Vest','Split dress','Pleated dress','T-shirt','Overalls','Coat'];
  const avPick=n=>Math.floor(Math.random()*n);
  const avNext=(old,n)=>(old+1+avPick(n-1))%n;
  const avPalette=()=>[...AV_PALETTES[avPick(AV_PALETTES.length)]];
  const avState={group:'all',hairGroup:'girls',hair:0,bangs:0,hairColors:avPalette(),head:1,headColors:avPalette(),body:1,bodyColors:avPalette(),fit:0,fitColors:avPalette(),fx:0,fxColors:avPalette(),lashes:true,seed:347};
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
   case 6:return avPath('M66 48L72 26L86 43L100 15L114 43L128 26L134 48Z',a,b);
   case 7:return avLine('M72 48Q64 23 53 22M128 48Q136 23 147 22',b)+avHeart(53,23,.7,a)+avHeart(147,23,.7,a);
   case 8:return sym(avEllipse(74,26,10,27,a,b)+avEllipse(74,25,4,18,b));
   case 9:return sym(avEllipse(65,44,17,17,a,b)+avEllipse(65,44,9,9,b));
   case 10:return avLine('M52 85Q44 31 100 31Q156 31 148 85',a,7)+avEllipse(53,87,8,18,b,a)+avEllipse(147,87,8,18,b,a);
   case 11:return avEllipse(81,55,17,11,a,b)+avEllipse(119,55,17,11,a,b)+avLine('M98 55H102',b,4);
   case 12:return avLine('M60 62Q100 30 140 62',b,5)+avPath('M100 43L74 25L76 55ZM100 43L126 25L124 55Z',a,b);
   case 13:{let out='';for(let j=0;j<7;j++){let x=61+j*13,y=54-Math.sin(j/6*Math.PI)*16;out+=avStar(x,y,9,a,6)+avEllipse(x,y,3,3,b)}return out;}
   case 14:return avPath('M83 41L81 12H118L116 41Z',a,b)+avEllipse(100,42,31,6,b)+avLine('M83 32H116',b,5);
   case 15:return avEllipse(95,43,43,18,a,b)+avLine('M97 27L101 20',b,4);
   case 16:return avPath('M68 46L95 4L119 17L111 17L132 46Z',a,b)+avEllipse(100,47,46,7,b);
   case 17:return sym(avEllipse(62,53,9,13,a)+avEllipse(70,58,8,10,b)+avLine('M64 50L69 65',b));
   case 18:return avLine('M100 43V24',b,4)+avPath('M100 28Q73 6 74 27Q82 39 100 28ZM100 28Q127 6 126 27Q118 39 100 28Z',a,b);
   case 19:return avEllipse(100,35,46,12,'none',a)+avEllipse(100,35,32,18,'none',b)+avStar(142,29,6,b);
   }
  }
  function avBody(){
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
   case 7:return avLine('M74 163Q100 183 126 163',a,3)+avStar(100,177,5,b);
   case 8:return avPath('M62 140Q49 127 49 151V175H70ZM138 140Q151 127 151 151V175H130Z',a,b);
   case 9:return avPath('M78 143Q34 107 42 147L29 147Q40 175 74 164ZM122 143Q166 107 158 147L171 147Q160 175 126 164Z',a,b);
   case 10:return avPath('M78 143L35 119L42 147L28 164Q49 151 58 177L74 166ZM122 143L165 119L158 147L172 164Q151 151 142 177L126 166Z',a,b);
   case 11:return avPath('M86 128Q63 134 54 184L84 175L100 183L116 175L146 184Q137 134 114 128Z',a,b);
   case 12:return avPath('M84 130H116V140H104L117 175L107 181L93 140H84Z',a,b);
   case 13:return avStar(117,145,9,a,7)+avEllipse(117,145,4,4,b);
   case 14:return avPath('M123 136A10 10 0 1 0 123 156A8 8 0 0 1 123 136Z',a,b);
   case 15:return bow(80,148)+bow(120,148);
   case 16:return avLine('M84 128L117 180M116 128L83 180M78 155H122',a,4)+avEllipse(100,155,5,5,b);
   case 17:return avLine('M87 129L128 165',a,3)+avHeart(129,174,1.1,b);
   case 18:return avPath('M70 154L79 156L76 173L65 170ZM130 154L121 156L124 173L135 170Z',a,b);
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
   const lashes=avState.lashes?avLine('M79 90l-5-4M78 94l-6-1M121 90l5-4M122 94l6-1','#2a1330',2.4):'';
   labSvg.innerHTML=`<ellipse cx="100" cy="188" rx="52" ry="9" fill="#ff2e7e" opacity=".3"/>${hair.back}${avFit()}${avBody()}<circle cx="100" cy="88" r="42" fill="#f9d8c4"/>${hair.front}${avHead()}<g fill="#2a1330"><ellipse cx="85" cy="94" rx="6" ry="8"/><ellipse cx="115" cy="94" rx="6" ry="8"/></g>${lashes}<g fill="#fff"><circle cx="87" cy="91" r="2.3"/><circle cx="117" cy="91" r="2.3"/></g><ellipse cx="76" cy="106" rx="9" ry="5" fill="#ff8fd0" opacity=".55"/><ellipse cx="124" cy="106" rx="9" ry="5" fill="#ff8fd0" opacity=".55"/>${avLine('M95 108q5 5 10 0','#c4306b',2.4)}${avEffects()}`;
   const labels={hair:AV_HAIR[avState.hairGroup][avState.hair][0],bangs:AV_BANGS[avState.bangs],head:AV_HEAD[avState.head],body:AV_BODY[avState.body],fit:AV_FITS[avState.fit],fx:AV_FX[avState.fx],lashes:avState.lashes?'On':'Off'};
   for(const [part,label] of Object.entries(labels))document.getElementById('lb-'+part).textContent=label;
   document.getElementById('labLashes').setAttribute('aria-pressed',String(avState.lashes));
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
   else if(part==='lashes')avState.lashes=!avState.lashes;
   else{const options={head:AV_HEAD,body:AV_BODY,fit:AV_FITS,fx:AV_FX};avState[part]=avNext(avState[part],options[part].length);avState[part+'Colors']=avPalette();if(part==='fx')avState.seed=avPick(1e9)}
   drawLab();
  });
  document.getElementById('labRand').onclick=()=>{avRandomHair();for(const [part,options] of Object.entries({head:AV_HEAD,body:AV_BODY,fit:AV_FITS,fx:AV_FX})){avState[part]=avNext(avState[part],options.length);avState[part+'Colors']=avPalette()}avState.seed=avPick(1e9);drawLab()};
  document.getElementById('labSave').onclick=()=>{const first=['Glitter','Neon','Velvet','Moonlit','Silver','Cherry'],last=['Poppy','Seraph','Riot','Halo','Peach','Bunny'];document.getElementById('labName').textContent=first[avPick(first.length)]+' '+last[avPick(last.length)]+' — enrolled on 3F'};
  drawLab();
  }
})();
