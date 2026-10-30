// What each pet does, five or six points on its star, and its L1 apps on the back (Astra, 2026-10-29: "auto-populate the most
// useful tools of each of them underneath ... like 5 to 6 bullet points"). Writes star-tools-20261029.js.
// The tools come first from the hub's registry (TOOLS-AND-TRICKS.md in findastra/astras-pet-os, every native program, tool and
// trick of every pet program, built from system-map.json): the ones that work today, programs, then tools, then tricks. The
// points written here by hand, from each pet's description, fill the rest. L1 is the third-party programs the registry says
// work today, three at most; a pet with none there keeps the one named in cyber.js.
// Run from the repo root: node scripts/build-star-tools-20261029.mjs
import { writeFileSync } from 'node:fs';

const REGISTRY = 'https://raw.githubusercontent.com/findastra/astras-pet-os/main/TOOLS-AND-TRICKS.md';
const MAX = 6;

const HAND = {
  'Friendly Farmer': ['Pet status and moods', 'The roster', 'System Map', 'Profile README', 'What needs Astra'],
  'GitHub Goldfish': ['Reads public GitHub', 'Document-control errors', 'Organizational errors', 'Systemic errors', 'Outstanding items'],
  'Data Chip': ['Data Dealer health', 'Site checks', 'Data checks', 'Service status', 'Open work', 'What needs Astra'],
  'API Fairy': ['Where each key lives', 'What uses it', 'Stale keys', 'Keys to get', 'Key requests', 'Never holds keys'],
  'Unity Unicorn': ['Worlds and avatars', 'Unity tools', 'Avatar plans', "Devilish's closet", 'World pages'],
  'Python Panther': ['Python exercises', 'Answer checks', 'Saved progress', 'Original lessons', 'Output drills'],
  'Astra Wisp': ['AI Astra health', 'Live checks', 'Offline checks', 'Early warnings', 'Session prep'],
  'Health Hummy': ['Lifting by body group', 'Sets and reps', 'Cardio', 'Pole plans', 'Stays on your PC'],
  'Finance Finch': ['Bank balances', 'Savings', 'Investments', 'Read only', 'Never moves money'],
  "Mommy's Mommies": ['Class planning', 'Events', 'Session details', 'Readiness', 'Notes', 'Calendar (planned)'],
  'Paper Patty': ['Real research', 'Publisher explanations', 'Fresh articles', 'Science discovery', 'Free to read'],
  'File Master': ['Organizes files', 'Finds systemic errors', 'Mass changes previewed', 'Undo', 'Duplicate finder'],
  'Discord Damsel': ['Discord presence', 'OpenAI card', 'Anthropic card', 'Setup checklist', 'Opens the controls'],
  'Portfolio Puffer': ['Portfolio drafts', 'Tracks updates', 'GitHub (planned)', 'LinkedIn (planned)', 'Manual publishing'],
  'Drum Dog': ['Saves samples', 'Ableton Live', 'Album plans', 'DJ mixes', 'Where each is hosted'],
  'VSCode Angel': ['Code-review findings', 'Next steps', 'Markdown worklists', 'Editor (planned)', 'Language halo'],
  'Gone Ghost': ['Security checklist', 'Ghost Protocol research', 'Steps done', 'Steps left', 'Personal security'],
  'Project Parrot': ['OneNote ideas', 'New projects', 'Reminders', 'Idea review'],
  'Voicemeeter Bug': ['Restarts Voicemeeter', 'Audio repair', 'Status window', 'Desktop pet', 'Start menu'],
  'Spoonfed Sugarcube': ['Restaurant spinner', 'Locked preferences', 'Favorite spots', 'Where to eat'],
  'Claude Bot': ['Claude status', 'Status bubble', 'Quick chat', 'Desktop face'],
  'RGBee': ['Lighting scenes', 'Room lights', 'Mouse pad and mouse', 'PC and keyboard', 'Scene previews'],
  'Mine Mole': ['Crypto mining', 'Power costs', 'Is it worth it', 'Miner status'],
  'Mail Snail': ['Sorts mail', 'Cleans up', 'Deletes old mail', 'Asks first', 'No account yet'],
  'Patch Cat': ['Windows updates', 'Drivers', 'App patches', 'Security holes'],
  'Meme Fiend': ['Meme archive', 'Discord memes', 'Meme maker (planned)', 'Stays on your PC'],
  'Gif Giraffe': ['Makes GIFs', 'In the browser', 'Trims clips', 'Saves locally'],
  'Backup Beaver': ['Last backup', 'Where it is', 'How to restore', 'Backup places', 'Spare keys'],
  'Rift Rabbit': ['VR software', 'VR performance', 'VR launcher', 'Headset prep', 'Tracker pairs'],
  'Fuzzboi Friend': ['Fuzzboi website', 'Health by mood', 'Fuzzboi art', 'Swap his look'],
  'Wifi Butterfly': ['Unknown Wi-Fi', 'Bluetooth devices', 'Radio watch', 'Nearby alerts'],
  'Deck Duck': ['Stream Deck buttons', 'Every profile', 'What each does', 'Button map'],
  'Mesh Moth': ['Meshtastic node', 'Place in the mesh', 'Node health', 'Messages'],
  'Raspberry Pi Berry': ['Pi projects', 'Backups due', 'OS updates', 'Each Pi tracked'],
  'Chat Rat': ['Saves AI chats', 'Imported exports', 'By model', 'By date', 'Opens folders'],
  'Platform Platypus': ['Every device at once', 'Page checks', 'Watched sites', 'Screenshot compare', 'iPhone, Android, iPad'],
  'Dubstep Gunsmith': ['Avatar gun effects', 'Loadouts', 'Effect catalog'],
  'Pole Puff': ["Astra's Infinite Pole", 'World builds', 'Phone booths', 'Glitter'],
  'Procreate Panda': ['Redlines', 'Procreate tools', 'Drawings', 'Brush sets'],
  'Skill Scout': ['Agent files', 'Skill files', 'What changed', 'Who changed it', 'Why'],
  'OSC Sealion': ['OSC packets', 'Shared channels', 'VRChat', 'OSCGoesBrrr', 'VRCFaceTracking'],
  'Piranesi Nessi': ['Piranesi House', 'Unity project', 'Preview site', 'Labyrinth key', 'Shared Unity tools'],
  'Photo Dodo': ['Saved pictures', 'Where each is', 'What it shows', 'Backed up?'],
  'Video Vulture': ['Saved videos', 'Where each is', 'What it shows', 'Backed up?'],
  'Closet Cat': ['Your closet', 'What goes together', 'Outfits', 'Favorite shops'],
  'Gatekeeper Goddess': ['Approvals', 'Security watch', 'Grants', 'Short-lived agent keys', 'YubiKey'],
  'Queue Quokka': ['Retries', 'Stalled jobs', 'Agent handoffs', 'Task queue'],
  'Log Lynx': ['Logs', 'Traces', 'Health', 'Failures'],
  'Server Salamander': ['Home servers', 'Uptime', 'Service health'],
  'Docker Dragon': ['Docker health', 'Containers', 'Authorized management'],
  'Test Tortoise': ['Tests', 'Release checks', 'Verification'],
  'Token Toucan': ['Token costs', 'Budgets', 'Inference usage', 'Per-model spend'],
  'Packet Piranha': ['Packet loss', 'DNS', 'Latency', 'Routing'],
  'Calendar Crow': ['Scheduling', 'Conflicts', 'Reminders'],
  'Browser Bat': ['Website QA', 'Browser work', 'Marketing ops'],
  'Data Dragonfly': ['Data integrity', 'Schemas', 'Pipelines'],
  'Update Urchin': ['Package updates', 'Compatibility', 'Rollback prep'],
  'Linux Penguin': ['Linux admin', 'SSH', 'systemd', 'Packages'],
  'Stock Fox': ['Job not chosen yet'],
  'Passport Pelican': ['Passport and ID', 'Visa research', 'Deadlines', 'Encrypted'],
  'Journal Jellyfish': ['Travel diary', 'Itineraries', 'Private'],
  'Shell Squid': ['Bash', 'Terminal scripts', 'Guarded automation'],
  'Kernel Koala': ['Processes', 'Memory', 'Drivers', 'OS internals'],
  'Proxy Axolotl': ['Reverse proxies', 'TLS', 'Private remote access'],
  'Cluster Crab': ['Distributed services', 'Orchestration'],
  'Storage Stoat': ['NAS', 'ZFS', 'Snapshots', 'Capacity'],
  'White Hat Weasel': ['Security assessment', 'Remediation', 'Authorized only'],
  'Port Spider': ['Open ports', 'Exposed services', 'Authorized checks'],
  'Cipher Owl': ['Encryption', 'Keys', 'Certificates', 'Crypto lessons'],
  'Forensic Ferret': ['Incident timelines', 'Log analysis', 'Evidence'],
  'Llama Librarian': ['Local models', 'Downloads', 'Compatibility'],
  'Inference Iguana': ['Benchmarks', 'GPU and VRAM', 'Latency', 'Graphics card watch'],
  'Agent Ant': ['Agent experiments', 'Tool-use tests'],
  'Roaming Raven': ['Travel internet', 'VPN', 'Tailnet', 'Remote access'],
  'Cache Coyote': ['Offline documents', 'Caches', 'Queued actions'],
  'Sync Mink': ['Device sync', 'Conflict fixes'],
  'Triage Tapir': ['Labels tickets', 'Secret checks', 'Tests cures', 'Never merges'],
  'Pet Police Officer': ['Watches every write', 'Watches key use', 'Switches things off', 'Alerts', 'Raises alarms'],
  'AI Dashund': ['AI agent research', 'Harnesses', 'Security', 'Provenance', 'Research paper'],
  'Rescue Retriever': ['Rebuilds the farm', 'Verified release', 'Clean backups', 'Safe restart'],
  'Intel Owl': ['Cyber threats', 'CVEs', 'Adversary tactics', 'Advisories', 'Shares findings'],
  'Door Dormouse': ['Liminal Doors', 'Floors', 'Build choices', 'Unity metadata', 'Preview site'],
  'Role Fairy': ['Discord bots', 'Role pickers', 'Member roles', 'Bot permissions', 'Bot health'],
  'Workflow Whale': ['PC to iPad', 'Captures', 'PencilKit markup', 'Handwritten notes', 'Image return'],
};

// a registry name as words: "blatant-checker" → "Blatant checker"; names that are already words stay as they are
const words = (s) => (/^[a-z0-9-]+$/.test(s) ? (s.charAt(0).toUpperCase() + s.slice(1)).replace(/-/g, ' ') : s).replace(/\b(Vr|vr|Ai|ai|Osc|osc|Gpu|gpu|Api|api|Pc|pc)\b/g, (w) => w.toUpperCase());
// an app without its version number: "Unity 2022.3.22f1" → "Unity"
const app = (s) => s.replace(/\s+(r|v)?\d[\w.]*$/i, '').trim();
const same = (a, b) => a.toLowerCase().replace(/[^a-z0-9]/g, '') === b.toLowerCase().replace(/[^a-z0-9]/g, '');

const md = await (await fetch(REGISTRY)).text();
const rows = md.split('\n').filter((l) => /^\| \d+ \|/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
  .map(([, pet, , kind, name, , state]) => ({ pet, kind, name, works: /^Works/.test(state) }));
const ORDER = ['native program', 'native tool', 'native trick'];

const points = {}, l1 = {};
for (const pet of new Set([...Object.keys(HAND), ...rows.map((r) => r.pet)])) {
  const mine = rows.filter((r) => r.pet === pet);
  const tools = mine.filter((r) => ORDER.includes(r.kind)).sort((a, b) => b.works - a.works || ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)).map((r) => words(r.name));
  const list = [];
  for (const t of [...tools.filter((t, i) => i < 4), ...(HAND[pet] || [])]) if (list.length < MAX && !list.some((x) => same(x, t))) list.push(t);
  points[pet] = list;
  const apps = mine.filter((r) => r.kind === 'third-party program' && r.works).map((r) => app(r.name));
  if (apps.length) l1[pet] = [...new Set(apps)].slice(0, 3);
}
const day = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
writeFileSync('star-tools-20261029.js', `// Built by scripts/build-star-tools-20261029.mjs on ${day}: what each pet does, five or six points on its star (its tools
// from the hub's registry first, then points from its description), and its L1 apps (the third-party programs the registry
// says work today, three at most). Run it again after the hub's registry changes.
window.STAR_TOOLS = ${JSON.stringify(points, null, 1)};
window.STAR_L1 = ${JSON.stringify(l1, null, 1)};
`);
console.log(Object.keys(points).length + ' pets, ' + Object.keys(l1).length + ' with registry L1 apps');
