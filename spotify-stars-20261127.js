// The Spotify stars in the footer, the same three as on Astra's IPO guides (anthropic-ipo/, openai-ipo/): the album star
// (Vape Luv by Babe Dylan), the play star that plays it right on the page through Spotify's embed, and the green star that
// opens it in Spotify (Astra, 2026-11-23: "I definitely want to put ... the Spotify stars at the bottom").
// Spotify's player loads once the page has finished loading, as on the guides: its own small play button shows through the
// middle of the play star, which browsers need for the first play.
// Claude Opus 5.5 (claude-opus-5-5), 2026-11-27.
(function () {
  const btn = document.getElementById('ss-play'), icon = document.getElementById('ss-icon');
  if (!btn || !icon) return;
  const TRACK = 'spotify:track:13wTGwDNWWLr0I52ePwHAX';
  const PLAY = 'M443 421v210l170-105z', PAUSE = 'M405 416h40v220h-40zM555 416h40v220h-40z';
  let ctl = null, st = null;
  const show = (on) => {
    const path = icon.querySelector('path');
    if (path) path.setAttribute('d', on ? PAUSE : PLAY);
    const words = (on ? 'Pause' : 'Play') + ' Vape Luv by Babe Dylan';
    btn.title = 'Spotify star: ' + words; btn.setAttribute('aria-label', words);
  };
  const toggle = () => {
    if (!st || (st.isPaused && st.duration && st.position >= st.duration - 800)) ctl.play();
    else if (st.isPaused) ctl.resume();
    else ctl.pause();
  };
  window.onSpotifyIframeApiReady = (API) => {
    API.createController(document.getElementById('ss-embed'), { uri: TRACK, width: 300, height: 80 }, (c) => {
      ctl = c;
      c.addListener('playback_update', (e) => { st = e.data; show(!e.data.isPaused); });
    });
  };
  const press = (e) => {
    if (!ctl || (e.target.closest && e.target.closest('#ss-embedw'))) return;
    toggle();
  };
  const load = () => {
    const s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1'; s.async = true;
    document.body.appendChild(s);
  };
  if (document.readyState === 'complete') load(); else addEventListener('load', load, { once: true });
  btn.addEventListener('click', press);
  btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press(e); } });
})();
