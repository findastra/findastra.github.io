// Her feeds, one post at a time in a Polaroid (Astra, 2026-10-29: "one video for one Polaroid", "an auto-scroll", "the amount
// of plays too"). Writes feeds-data-20261029.js, the list of posts the Contact section plays through.
// TikTok: read from TikTok's own profile embed page, which lists the newest videos with their play counts, then each
// video's own page for its likes, comments, saves and shares (Astra, 2026-10-29: "show the likes and the comments ... and the
// saves").
// Instagram: all 93 posts and their authored captions were collected from her signed-in gallery on 2026-10-30
// (Astra, 2026-10-29: "the captions I used on the Instagram"). Their photos are saved in art/feeds/ and reused on refresh.
// Keep newest-first order: the viewer starts at the end and advances toward newer posts.
// Run from the repo root: node scripts/build-feeds-20261029.mjs
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const OUT = 'feeds-data-20261029.js';
// (with the full Chrome user agent TikTok answers with an empty page)
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36';
// newest first; captions as she typed them
const INSTAGRAM = [
  [
    "DOZ4MQFCSQJ",
    "whos-here-with-me-"
  ],
  [
    "DOZ4IeHCT0z",
    "down-down-down-"
  ],
  [
    "DOZ4F6gCbPE",
    "falling-falling-falling-"
  ],
  [
    "DOZ3scHid20",
    "it-helps-me-spiral-"
  ],
  [
    "DOZ3e-1CVyf",
    "it-helps-me-swim-"
  ],
  [
    "DOZ3WGaids7",
    "my-virtual-suit-"
  ],
  [
    "DOZ2yuYiSjo",
    "midnight-shows-"
  ],
  [
    "DOZ2sODCXFv",
    "chaos-glows-"
  ],
  [
    "DOZ2qJFic56",
    "neon-flows-"
  ],
  [
    "DOZ2X_fCQCp",
    "checkmate-echoes-through-the-storm-"
  ],
  [
    "DOZ2Vf1CShs",
    "pawns-steam-"
  ],
  [
    "DOZ2SwqCST8",
    "rain-hisses-"
  ],
  [
    "DOZ1YXZifUs",
    "i-love-i-love-i-love-"
  ],
  [
    "DOZ1VU_iVlg",
    "i-loo-oo-oo-oove-"
  ],
  [
    "DOZ1QB6Cce2",
    "i-loove-"
  ],
  [
    "DOZ0yVVjzjk",
    "so-get-in-my-car-"
  ],
  [
    "DOZ0vd5j_JR",
    "i-have-treat-"
  ],
  [
    "DOZ0sPljyKs",
    "here-kitty-kitty-"
  ],
  [
    "DOZxLivDw4K",
    "dont-break-go-fast-"
  ],
  [
    "DOZxI0aDyVK",
    "drifter-girl-"
  ],
  [
    "DOZxFEPj-t0",
    "fishnets-smoke-glass-"
  ],
  [
    "DOZwsmDD2Zu",
    "gang-gang-"
  ],
  [
    "DOZwoilD_do",
    "were-vibin-"
  ],
  [
    "DOZwkGvj2b6",
    "moon-lounge-"
  ],
  [
    "DOZvyBID-TT",
    "some-things-stay-forever-"
  ],
  [
    "DOZvuaTD8D5",
    "some-things-go-"
  ],
  [
    "DOZvo9gDzXy",
    "some-things-come-"
  ],
  [
    "DHPPJWKSvyx",
    "and-hacking-hearts-"
  ],
  [
    "DHPPEPoSjYh",
    "gaming-charm-"
  ],
  [
    "DHPO9CdyHeE",
    "pixel-skin-"
  ],
  [
    "DHPOk0SSKH7",
    "axolotl-waits-"
  ],
  [
    "DHPOddXSU0r",
    "my-lost-friend-sleeps-"
  ],
  [
    "DHPOY77ypTa",
    "in-the-dark-abyss-"
  ],
  [
    "DHPM8m8yR46",
    "time-bends-to-its-will-"
  ],
  [
    "DHPM3KTSndv",
    "whispers-steal-the-stars-away-"
  ],
  [
    "DHPMzZbSIuZ",
    "swirling-violet-void-"
  ],
  [
    "C_9YvkESFzg",
    "this-is-where-i-grew-up-and-i-drew-that-"
  ],
  [
    "C_9Yn5jSkNn",
    "soul-go-check-out-that-tunnel-"
  ],
  [
    "C_9YhF8yUNJ",
    "always-causing-trouble-"
  ],
  [
    "C_HoDIZxD0k",
    "go-fish-"
  ],
  [
    "C_HnuTaRnJU",
    "in-your-dreams-"
  ],
  [
    "C_HnqX8xEGX",
    "player-pick-up-"
  ],
  [
    "C_HmCZyxNtb",
    "xo-"
  ],
  [
    "C_Hl7p2xszW",
    "designer-"
  ],
  [
    "C_HlRB_xxpp",
    "matching-"
  ],
  [
    "C9sujQERHdv",
    "but-i-tried-ok-"
  ],
  [
    "C9sug8FRYz-",
    "not-on-point-"
  ],
  [
    "C9sud-uRtrF",
    "graffiti-"
  ],
  [
    "C9suZmExoXI",
    "for-everyone-"
  ],
  [
    "C9suWC7xioK",
    "before-the-squeakers-ruin-it-"
  ],
  [
    "C9suKJDRSAz",
    "quick-take-a-picture-"
  ],
  [
    "C9sts5mxiT2",
    "protest-gay-furry-hacker-genocide-"
  ],
  [
    "C9stlCIR3_Q",
    "makes-a-great-friend-"
  ],
  [
    "C9stgmIRRhO",
    "a-furry-"
  ],
  [
    "C9stXSHR5UG",
    "if-you-need-someone-"
  ],
  [
    "C9stPWGRoTY",
    "you-can-come-back-"
  ],
  [
    "C9stMSbROcs",
    "dont-be-shy-"
  ],
  [
    "C9ss6kkR89u",
    "in-crystal-castles-"
  ],
  [
    "C9ss2udRqhd",
    "to-stargaze-"
  ],
  [
    "C9ssyoixR-f",
    "but-i-prefer-"
  ],
  [
    "C9srhyIxDjn",
    "to-be-more-immersed-"
  ],
  [
    "C9sraV_R5CE",
    "youd-like-"
  ],
  [
    "C9srSqHRYXx",
    "or-maybe-"
  ],
  [
    "C9srIfkxqqa",
    "of-the-sunset-"
  ],
  [
    "C9srB7SxLWC",
    "on-the-pink-side-"
  ],
  [
    "C9sq9OGRWHo",
    "take-a-cruise-"
  ],
  [
    "C9sqyswR5rN",
    "and-discover-treasure-"
  ],
  [
    "C9sqnSBRCUS",
    "at-sea-"
  ],
  [
    "C9sqkSzxwAJ",
    "or-get-lost-"
  ],
  [
    "C9sqUP0xBP9",
    "until-its-better-"
  ],
  [
    "C9sqRayxuSm",
    "in-the-pink-grass-"
  ],
  [
    "C9sqOPmxmRm",
    "we-could-lay-"
  ],
  [
    "C9spxf1R35G",
    "in-the-lonely-sky-"
  ],
  [
    "C9spopKRIas",
    "howls-"
  ],
  [
    "C9splJ7RYUA",
    "the-glass-wolf-"
  ],
  [
    "C9so3dLS1Kp",
    "soul-"
  ],
  [
    "C9sozp7yU5L",
    "is-my-friend-"
  ],
  [
    "C9souwdyB0z",
    "this-"
  ],
  [
    "C9snZ1ES54k",
    "of-zelda-"
  ],
  [
    "C9snUw4SRaG",
    "legend-"
  ],
  [
    "C9snRIySA-K",
    "summon-the-fairy-"
  ],
  [
    "C9si_wjSzVa",
    "fountain-"
  ],
  [
    "C9si1nbSXXl",
    "chocolate-"
  ],
  [
    "C9siw0wSAGr",
    "nutella-"
  ],
  [
    "C9sbZmlxxLL",
    "goose-"
  ],
  [
    "C9sbWRbxEGW",
    "duck2-"
  ],
  [
    "C9sbSXuRqhw",
    "duck-"
  ],
  [
    "C9sbGEZxpI7",
    "pink-butterflies-"
  ],
  [
    "C9sbDGBxCEk",
    "love-"
  ],
  [
    "C9sbAKyRfHh",
    "i-"
  ],
  [
    "C8eVEXDxWly",
    "post-"
  ],
  [
    "C8eVBVxx4RF",
    "i-die-"
  ],
  [
    "C8eUyVAxIlC",
    "in-case-"
  ]
];

// the last list, kept when TikTok does not answer
let old = {};
try { old = JSON.parse(readFileSync(OUT, 'utf8').replace(/^[\s\S]*?window\.FEEDS = /, '').replace(/;\s*$/, '')); } catch {}
const before = (id) => (old.feeds || []).find((f) => f.id === id) || {};

async function tiktok(id, user, label) {
  const feed = { id, kind: 'tiktok', user, label, items: before(id).items || [] };
  try {
    const response = await fetch('https://www.tiktok.com/embed/@' + user, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('TikTok answered ' + response.status);
    const html = await response.text();
    const page = JSON.parse(html.match(/<script id="__FRONTITY_CONNECT_STATE__"[^>]*>([\s\S]*?)<\/script>/)[1]).source.data['/embed/@' + user];
    if (page.isError) {
      // Provider errors do not all mean audience controls or a sign-in requirement.
      feed.items = []; feed.note = 'Preview unavailable here. Watch on TikTok.';
    } else {
      if (!Array.isArray(page.videoList)) throw new Error('TikTok did not return a video list');
      const last = feed.items;
      feed.items = [];
      for (const v of page.videoList) feed.items.push({ id: v.id, plays: v.playCount, ...(await stats(user, v.id)) || last.find((x) => x.id === v.id) || {} });
    }
  } catch (e) {
    feed.note = 'The TikTok preview could not be refreshed. Watch on TikTok.';
    console.error(user + ': ' + e.message + ', kept the last list');
  }
  return feed;
}

// one video's likes, comments, saves and shares, from its own page (the embeds leave out saves)
async function stats(user, id) {
  try {
    const response = await fetch(`https://www.tiktok.com/@${user}/video/${id}`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('TikTok answered ' + response.status);
    const html = await response.text();
    const s = JSON.parse(html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/)[1])
      .__DEFAULT_SCOPE__['webapp.video-detail'].itemInfo.itemStruct.stats;
    return { likes: +s.diggCount, comments: +s.commentCount, saves: +s.collectCount, shares: +s.shareCount };
  } catch (e) { console.error(`${user}/${id}: no stats (${e.message})`); return null; }
}

// each photo saved once, as art/feeds/instagram-<post>-<day saved>.jpg
async function instagram() {
  const dir = 'art/feeds', day = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' }).replace(/-/g, '');
  mkdirSync(dir, { recursive: true });
  const items = [];
  for (const [code, caption] of INSTAGRAM) {
    let file = readdirSync(dir).find((f) => f.startsWith(`instagram-${code.toLowerCase()}-`));
    if (!file) {
      try {
        const res = await fetch(`https://www.instagram.com/p/${code}/media/?size=l`, { headers: { 'user-agent': 'Mozilla/5.0' } });
        if (!res.ok) throw new Error('Instagram answered ' + res.status);
        file = `instagram-${code.toLowerCase()}-${day}.jpg`;
        writeFileSync(`${dir}/${file}`, Buffer.from(await res.arrayBuffer()));
      } catch (e) { console.error(code + ': ' + e.message); continue; }
    }
    items.push({ code, src: `${dir}/${file}`, caption });
  }
  return items;
}

const feeds = [
  await tiktok('pole', 'astra_on_fire', 'pole dance'),
  { id: 'insta', kind: 'instagram', user: 'astra_on_fire', label: 'Instagram', items: await instagram() },
  await tiktok('vr', 'findastra', 'VR'),
];
writeFileSync(OUT, `// Built by scripts/build-feeds-20261029.mjs on ${new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' })}: the posts each feed Polaroid plays
// through. Run it again for her newest TikToks.
// Instagram: ${feeds.find((f) => f.id === 'insta').items.length} saved photos, newest first; the viewer begins with the oldest.
window.FEEDS = ${JSON.stringify({ feeds }, null, 1)};
`);
for (const f of feeds) console.log(`${f.user} ${f.label}: ${f.items.length}${f.note ? ' · ' + f.note : ''}`);
