// Her feeds in a Polaroid, one post at a time, going on to the next by itself (Astra, 2026-10-29: "one video for one
// Polaroid", "an auto-scroll", "the amount of plays too ... where it would normally be on TikTok, so it doesn't obstruct the
// rest"). The posts come from feeds-data-20261029.js. A TikTok plays in TikTok's own player with all its buttons and words
// off, muted, and the next one starts when it ends; an Instagram post is its photo (a copy saved in art/feeds/, since Instagram will not let other sites show them), shown for a few seconds. The tabs under
// it switch feeds. TikToks are white Polaroids, Instagram a dark one (Astra, 2026-10-29).
(() => {
  const box = document.getElementById('feeds');
  if (!box || !window.FEEDS) return;
  const feeds = window.FEEDS.feeds.filter((f) => f.items.length);
  if (!feeds.length) return;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  // 2611 → 2.6K, the way TikTok writes it
  const short = (n) => (n >= 1e6 ? +(n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? +(n / 1e3).toFixed(1) + 'K' : String(n));
  const PHOTO_MS = 6000, VIDEO_MAX_MS = 90000;
  const PLAYER = 'https://www.tiktok.com/player/v1/';
  const QUIET = 'autoplay=1&loop=0&controls=0&progress_bar=0&play_button=0&volume_control=0&fullscreen_button=0&timestamp=0' +
    '&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0';

  const pol = el('figure', 'feed'), shot = el('div', 'shot'), plays = el('span', 'plays'), cap = el('figcaption'), handle = el('a');
  handle.target = '_blank'; handle.rel = 'noopener'; cap.append(handle);
  shot.append(plays); pol.append(shot, cap);
  const step = (d, label) => { const b = el('button', 'feed-step', d < 0 ? '‹' : '›'); b.type = 'button'; b.setAttribute('aria-label', label); b.onclick = () => go(at + d, true); return b; };
  const tabs = el('div', 'feed-tabs');
  feeds.forEach((feed, n) => {
    const b = el('button', null, feed.kind === 'tiktok' ? 'TikTok' + (feeds.filter((x) => x.kind === 'tiktok').length > 1 ? ' · ' + feed.label : '') : feed.label); b.type = 'button';
    b.onclick = () => { f = n; go(0, true); }; tabs.append(b);
  });
  // the arrows go either side of the tabs, so the Polaroid has the whole width of a phone
  tabs.prepend(step(-1, 'Previous post')); tabs.append(step(1, 'Next post'));
  box.replaceChildren(pol, tabs);

  let f = 0, at = 0, timer = 0, frame = null, visible = false;
  const post = (feed, item) => (feed.kind === 'tiktok' ? `https://www.tiktok.com/@${feed.user}/video/${item.id}` : `https://www.instagram.com/p/${item.code}/`);
  function go(i, now) {
    const feed = feeds[f];
    at = (i + feed.items.length) % feed.items.length;
    const item = feed.items[at];
    clearTimeout(timer);
    pol.className = 'feed ' + feed.kind;
    [...tabs.querySelectorAll('button:not(.feed-step)')].forEach((b, n) => b.setAttribute('aria-pressed', String(n === f)));
    handle.href = post(feed, item); handle.textContent = '@' + feed.user;
    plays.textContent = feed.kind === 'tiktok' && item.plays != null ? '▷ ' + short(item.plays) : '';
    plays.hidden = !plays.textContent;
    if (frame) frame.remove(); frame = null;
    if (!visible && !now) return;
    if (feed.kind === 'tiktok') {
      frame = el('iframe'); frame.title = `@${feed.user} on TikTok`; frame.allow = 'autoplay; encrypted-media; fullscreen';
      frame.src = `${PLAYER}${item.id}?${QUIET}`;
      // the next one when this one ends; and in case TikTok never says so, after a minute and a half
      timer = setTimeout(() => go(at + 1), VIDEO_MAX_MS);
    } else {
      frame = el('img'); frame.alt = `@${feed.user} on Instagram`; frame.src = item.src;
      timer = setTimeout(() => go(at + 1), PHOTO_MS);
    }
    shot.prepend(frame);
  }
  // TikTok's player says when it is ready and when a video ends; it starts muted so phones let it play by itself
  addEventListener('message', (e) => {
    if (e.origin !== 'https://www.tiktok.com' || !frame || e.source !== frame.contentWindow) return;
    let d = e.data; if (typeof d === 'string') { try { d = JSON.parse(d); } catch { return; } }
    if (!d || !d['x-tiktok-player']) return;
    const say = (type) => frame.contentWindow.postMessage({ type, 'x-tiktok-player': true }, 'https://www.tiktok.com');
    if (d.type === 'onPlayerReady') { say('mute'); say('play'); }
    if (d.type === 'onStateChange' && d.value === 0) go(at + 1);
  });
  // only plays while it is on screen
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !frame) go(at); else if (!visible) { clearTimeout(timer); if (frame) frame.remove(); frame = null; }
  }, { threshold: .25 }).observe(pol);
  go(0);
})();
