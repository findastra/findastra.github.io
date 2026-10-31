// Her feeds as Polaroids, all three at once side by side, Instagram in the middle as it is the shorter one, stacked on a phone
// (Astra, 2026-10-29: "I want to see like all of them at once ... put the Instagram in the middle ... they can just stack").
// Each shows one post at a time and goes on to the next by itself (Astra, 2026-10-29: "one video for one Polaroid", "an
// auto-scroll"); the little marker arrows in its bottom corners flip through by hand, as on the other Polaroids, with
// "1 of 10" between them. The posts come from feeds-data-20261029.js.
// A TikTok plays muted in TikTok's own player, shown whole so it looks like TikTok with its likes, comments and shares down
// the side, her words and the song at the bottom (Astra, 2026-10-29: "it can appear like an actual TikTok video"); the player
// has no saves, so the saves sit above its heart, and the plays at the bottom left. An Instagram post is its photo (a copy
// saved in art/feeds/, since Instagram will not let other sites show them) with her caption written under it. A TikTok that
// cannot preview here gets a direct link to TikTok, without guessing why. TikToks are white Polaroids, Instagram a dark
// one, and the writing on them is handwritten (Astra, 2026-10-29).
(() => {
  const box = document.getElementById('feeds');
  if (!box || !window.FEEDS) return;
  const byId = (id) => window.FEEDS.feeds.find((f) => f.id === id);
  const feeds = ['pole', 'insta', 'vr'].map(byId).filter((f) => f && (f.items.length || f.note));
  if (!feeds.length) return;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  // 2611 → 2.6K, the way TikTok writes it
  const short = (n) => (n >= 1e6 ? +(n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? +(n / 1e3).toFixed(1) + 'K' : String(n));
  const PHOTO_MS = 6000, VIDEO_MAX_MS = 90000, PLAYER_WAIT_MS = 15000;
  const TIKTOK = 'https://www.tiktok.com', PLAYER = TIKTOK + '/player/v1/';
  // Start only after the ready message, with mute sent before play. Keep a native
  // play button so a browser that blocks autoplay still has a recovery path.
  const QUIET = 'autoplay=0&loop=0&controls=1&progress_bar=1&play_button=1&volume_control=0&fullscreen_button=0&timestamp=0' +
    '&music_info=1&description=1&rel=0&native_context_menu=0&closed_caption=0';
  // TikTok's bookmark
  const SAVE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5h12a1.5 1.5 0 0 1 1.5 1.5v17.2a.8.8 0 0 1-1.3.6L12 17.3l-6.2 4.5a.8.8 0 0 1-1.3-.6V4A1.5 1.5 0 0 1 6 2.5Z"/></svg>';
  const post = (feed, item) => (!item ? `${TIKTOK}/@${feed.user}` : feed.kind === 'tiktok' ? `${TIKTOK}/@${feed.user}/video/${item.id}` : `https://www.instagram.com/p/${item.code}/`);
  const players = [];

  box.replaceChildren(...feeds.map((feed) => {
    const pol = el('figure', 'feed ' + feed.kind + (feed.items.length ? '' : ' locked'));
    const shot = el('div', 'shot'), plays = el('span', 'plays'), saves = el('span', 'saves'), cap = el('figcaption');
    const words = el('span', 'feed-caption'), handle = el('a', 'feed-handle');
    handle.target = '_blank'; handle.rel = 'noopener'; handle.textContent = '@' + feed.user;
    cap.append(words, handle); shot.append(plays, saves); pol.append(shot, cap);
    let at = feed.kind === 'instagram' ? feed.items.length - 1 : 0;
    let timer = 0, watchdog = 0, frame = null, visible = false, ended = false, loud = false, failed = false, played = false;
    const clearTimers = () => { clearTimeout(timer); clearTimeout(watchdog); timer = watchdog = 0; };
    const removeFrame = () => { if (frame) frame.remove(); frame = null; };

    if (!feed.items.length) {
      // An empty snapshot does not prove an account or sign-in restriction.
      const open = el('a', 'feed-locked'); open.href = handle.href = post(feed); open.target = '_blank'; open.rel = 'noopener';
      open.append(el('b', null, feed.label + ' TikToks'), el('span', null, 'Preview unavailable here'), el('span', 'feed-open', 'Watch on TikTok ↗'));
      shot.prepend(open);
      return pol;
    }

    // the sound sticker, as on the Mommy's World Polaroid (Astra, 2026-10-29: "the little mute-unmute thing"), in the picture's
    // bottom left corner with the plays beside it ("in the corner of the picture panel"); it stays as set from one TikTok to
    // the next
    const say = (type) => frame && frame.tagName === 'IFRAME' && frame.contentWindow.postMessage({ type, 'x-tiktok-player': true }, TIKTOK);
    const sound = el('button', 'sound'); sound.type = 'button'; sound.hidden = feed.kind !== 'tiktok';
    const setSound = () => { sound.textContent = loud ? '🔊' : '🔇'; sound.setAttribute('aria-label', loud ? 'turn the sound off' : 'turn the sound on'); sound.setAttribute('aria-pressed', String(loud)); say(loud ? 'unMute' : 'mute'); };
    sound.onclick = () => { loud = !loud; setSound(); };
    const count = el('span', 'count');
    const flip = ['‹', '›'].map((t, i) => { const b = el('button', 'flip ' + (i ? 'next' : 'prev'), t); b.type = 'button'; b.setAttribute('aria-label', (i ? 'next' : 'previous') + ' post'); b.onclick = () => go(at + (i ? 1 : -1), true); return b; });
    const row = el('div', 'feed-row'); row.append(flip[0], count, flip[1]);
    shot.append(sound); pol.append(row);
    const recovery = el('div', 'feed-recovery'), message = el('p', 'feed-recovery-message');
    message.setAttribute('role', 'status');
    const retry = el('button', 'feed-retry', 'Retry video'), watch = el('a', 'feed-watch', 'Watch on TikTok ↗');
    retry.type = 'button'; watch.target = '_blank'; watch.rel = 'noopener';
    recovery.hidden = true; recovery.append(message, retry, watch); shot.append(recovery);

    function unavailable(text = 'This video cannot play here.', canPlay = false) {
      clearTimers(); failed = true; played = false;
      if (!canPlay) removeFrame();
      recovery.dataset.mode = canPlay ? 'play' : 'unavailable';
      message.textContent = text; retry.textContent = canPlay ? 'Play video' : 'Retry video';
      recovery.hidden = false; sound.hidden = true;
    }
    function play() {
      clearTimers(); failed = false; recovery.hidden = true;
      // Always begin muted; restore a visitor's sound choice once playback starts.
      say('mute'); say('play');
      watchdog = setTimeout(() => unavailable('Tap Play video to start, or watch on TikTok.', true), PLAYER_WAIT_MS);
    }
    retry.onclick = () => { if (frame && recovery.dataset.mode === 'play') play(); else go(at, true); };

    function go(i, now) {
      at = (i + feed.items.length) % feed.items.length;
      const item = feed.items[at];
      clearTimers(); failed = false; played = false; recovery.hidden = true;
      handle.href = watch.href = post(feed, item);
      count.textContent = `${at + 1} of ${feed.items.length}`;
      // her Instagram captions are written with hyphens for spaces ("whos-here-with-me-")
      words.textContent = item.caption ? item.caption.replace(/-+/g, ' ').trim() : '';
      words.hidden = !words.textContent;
      plays.textContent = item.plays != null ? '▷ ' + short(item.plays) : '';
      plays.hidden = !plays.textContent;
      saves.innerHTML = item.saves != null ? SAVE + '<b>' + short(item.saves) + '</b>' : '';
      saves.hidden = !saves.innerHTML;
      removeFrame(); ended = false;
      sound.hidden = feed.kind !== 'tiktok';
      setSound();
      if (!visible && !now) return;
      if (feed.kind === 'tiktok') {
        frame = el('iframe'); frame.title = `@${feed.user} on TikTok`; frame.allow = 'autoplay; encrypted-media; fullscreen';
        frame.src = `${PLAYER}${item.id}?${QUIET}`;
        watchdog = setTimeout(() => unavailable('TikTok did not load this preview.'), PLAYER_WAIT_MS);
      } else {
        frame = el('img'); frame.alt = words.textContent || `@${feed.user} on Instagram`; frame.src = item.src;
        // The manifest is newest first: start with the oldest and move toward newer.
        timer = setTimeout(() => go(at - 1), PHOTO_MS);
      }
      shot.prepend(frame);
    }
    // TikTok's player says when it is ready, where it is and when a video ends; it starts muted so phones let it play by
    // itself, and the next one comes on at the end (Astra, 2026-10-29: "auto-scroll between videos")
    const next = () => { if (!ended && played && !failed) { ended = true; go(at + 1); } };
    players.push((d, source) => {
      if (!frame || frame.tagName !== 'IFRAME' || source !== frame.contentWindow) return;
      if (d.type === 'onPlayerReady' && !failed) play();
      if (d.type === 'onPlayerError' || d.type === 'onError') {
        const error = d.value || {};
        const autoplay = error.errorCode === 3002 || error.errorType === 'AUTOPLAY_ERROR';
        unavailable(autoplay ? 'Tap Play video to start, or watch on TikTok.' : 'This video cannot play here.', autoplay);
        return;
      }
      if (d.type === 'onStateChange' && d.value === 1) {
        clearTimers(); played = true; failed = false;
        recovery.hidden = true; sound.hidden = false; setSound();
        // Only a video confirmed as playing gets the automatic next-post timer.
        timer = setTimeout(next, VIDEO_MAX_MS);
      }
      // A paused state can arrive during startup before the play command lands.
      // Keep its timeout until playback has actually begun.
      if (d.type === 'onStateChange' && d.value === 2 && played) clearTimers();
      if (d.type === 'onStateChange' && d.value === 3) {
        clearTimers(); watchdog = setTimeout(() => unavailable('TikTok stopped loading this video.'), PLAYER_WAIT_MS);
      }
      if (d.type === 'onStateChange' && d.value === 0) next();
      const t = d.value || {};
      if (d.type === 'onCurrentTime' && t.duration > 0 && t.currentTime >= t.duration - .4) next();
    });
    // only plays while it is on screen
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !document.hidden && !frame && !failed) go(at);
      else if (!visible) { clearTimers(); removeFrame(); }
    }, { threshold: .25 }).observe(pol);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { clearTimers(); removeFrame(); }
      else if (visible && !frame && !failed) go(at);
    });
    go(at);
    return pol;
  }));

  addEventListener('message', (e) => {
    if (e.origin !== TIKTOK) return;
    let d = e.data; if (typeof d === 'string') { try { d = JSON.parse(d); } catch { return; } }
    if (d && d['x-tiktok-player']) players.forEach((p) => p(d, e.source));
  });

  // Warm the browser cache for every approved gallery picture without blocking
  // the page or starting dozens of simultaneous image downloads.
  const images = [...new Set(feeds.filter(f => f.kind === 'instagram').flatMap(f => f.items.slice().reverse().map(item => item.src)).filter(Boolean))];
  let loading = 0;
  function preload() {
    while (loading < 3 && images.length) {
      loading++;
      const image = new Image(); let done = false;
      image.decoding = 'async'; image.fetchPriority = 'low';
      const finish = () => {
        if (done) return; done = true; clearTimeout(timeout); image.onload = image.onerror = null;
        image.removeAttribute('src'); loading--; preload();
      };
      const timeout = setTimeout(finish, PLAYER_WAIT_MS);
      image.onload = image.onerror = finish; image.src = images.shift();
    }
  }
  setTimeout(preload, 0);
})();
