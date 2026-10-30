// Her feeds, one post at a time in a Polaroid (Astra, 2026-10-29: "one video for one Polaroid", "an auto-scroll", "the amount
// of plays too"). Writes feeds-data-20261029.js, the list of posts the Contact section plays through.
// TikTok: read from TikTok's own profile embed page, which lists the newest videos with their play counts.
// Instagram: it only hands its post list to a real browser, so its posts are listed here by hand; open
// https://www.instagram.com/astra_on_fire/embed/ to see the newest ones. Its photo server will not let other sites show its
// photos, so each one is saved once into art/feeds/ and the page shows that copy.
// Run from the repo root: node scripts/build-feeds-20261029.mjs
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const OUT = 'feeds-data-20261029.js';
// (with the full Chrome user agent TikTok answers with an empty page)
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36';
const INSTAGRAM = ['DOZ4MQFCSQJ', 'DOZ4IeHCT0z', 'DOZ4F6gCbPE', 'DOZ3scHid20', 'DOZ3e-1CVyf', 'DOZ3WGaids7'];

// the last list, kept when TikTok does not answer
let old = {};
try { old = JSON.parse(readFileSync(OUT, 'utf8').replace(/^[\s\S]*?window\.FEEDS = /, '').replace(/;\s*$/, '')); } catch {}
const before = (id) => (old.feeds || []).find((f) => f.id === id) || {};

async function tiktok(id, user, label) {
  const feed = { id, kind: 'tiktok', user, label, items: before(id).items || [] };
  try {
    const html = await (await fetch('https://www.tiktok.com/embed/@' + user, { headers: { 'user-agent': UA } })).text();
    const page = JSON.parse(html.match(/<script id="__FRONTITY_CONNECT_STATE__"[^>]*>([\s\S]*?)<\/script>/)[1]).source.data['/embed/@' + user];
    if (page.isError) {
      // @findastra (2026-10-29): TikTok answers error 10101, "This creator turned on audience controls", so it shows to signed-in
      // viewers only and cannot be embedded
      feed.items = []; feed.note = 'TikTok shows this profile to signed-in viewers only (audience controls are on)';
    } else feed.items = page.videoList.map((v) => ({ id: v.id, plays: v.playCount }));
  } catch (e) { console.error(user + ': ' + e.message + ', kept the last list'); }
  return feed;
}

// each photo saved once, as art/feeds/instagram-<post>-<day saved>.jpg
async function instagram() {
  const dir = 'art/feeds', day = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' }).replace(/-/g, '');
  mkdirSync(dir, { recursive: true });
  const items = [];
  for (const code of INSTAGRAM) {
    let file = readdirSync(dir).find((f) => f.startsWith(`instagram-${code.toLowerCase()}-`));
    if (!file) {
      try {
        const res = await fetch(`https://www.instagram.com/p/${code}/media/?size=l`, { headers: { 'user-agent': 'Mozilla/5.0' } });
        if (!res.ok) throw new Error('Instagram answered ' + res.status);
        file = `instagram-${code.toLowerCase()}-${day}.jpg`;
        writeFileSync(`${dir}/${file}`, Buffer.from(await res.arrayBuffer()));
      } catch (e) { console.error(code + ': ' + e.message); continue; }
    }
    items.push({ code, src: `${dir}/${file}` });
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
window.FEEDS = ${JSON.stringify({ feeds }, null, 1)};
`);
for (const f of feeds) console.log(`${f.user} ${f.label}: ${f.items.length}${f.note ? ' · ' + f.note : ''}`);
