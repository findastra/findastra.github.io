/* Weekly Digest, edition 2026-11-20 (Portfolio Puffer). By Astra.
   One edition = one data file. index.html draws it: numbered items, each a picture, its links, then the words.
   Picks, in order: what's new this week, the most ingenious things, and what Astra asks for.
   Inline marks in text: **bold**, `code`. */
window.WEEKLY_DIGEST = {
  id: '20261120',
  week: 'Nov 14–20, 2026',
  madeFor: 'Extroid',
  forLine: 'my favorite DJ in VRChat',
  intro: [
    "I'm making you a digest, because this is worth your time. It might take a while to go through, but you'd probably like this more than anyone I know.",
    "First off, **The Cooling Tower**: view this one first. You're playing here when we finalize the world."
  ],
  items: [
    {
      slug: 'the-cooling-tower',
      title: 'The Cooling Tower',
      tag: 'Requested · your stage',
      pictures: [{ src: 'pictures/cooling-tower-20261120.jpg', w: 1100, h: 688, alt: 'The Cooling Tower website: looking up inside a dry cooling tower, with the title and the Mini Model below.' }],
      links: [{ href: 'https://findastra.github.io/the-cooling-tower/', label: 'findastra.github.io/the-cooling-tower' }],
      text: [
        "A VRChat rave world. A crew in hard hats breaks into a nuclear plant during a refueling outage. The cooling tower is dry, so the stack becomes the dance floor, and the night works its way down into the reactor."
      ],
      subs: [
        { title: 'The Stack', text: 'Booth one sits on the water riser in the middle of the tower. Lasers and colored smoke go straight up and out the top.' },
        { title: 'Turbine Hall', text: 'Walk through the giant water pipe to booth two: a glass control room on the turbine deck, with flashing annunciator panels.' },
        { title: 'Reactor Hall', text: 'A hatch drops you into a real PWR outage layout: the vessel in its pit under the pool, four steam generators, the polar crane. Booth three is the refueling machine on the bridge.' }
      ],
      note: "One booth is live at a time, and it lights its own venue plus every venue the crowd already passed. Every pipe and stair follows real piping and OSHA stair rules, checked by my own auditors (unsupported pipe went from 848 m to 11 m). Today it's a Mini Model you can spin in your browser. The Unity world comes next, with a light show generator planned for the DJs: AudioLink on each DJ's PC, an automatic show, and a DJ panel."
    },
    {
      slug: 'ghost-protocol',
      title: 'Ghost Protocol: three networks',
      tag: 'New this week · requested',
      pictures: [
        { src: 'pictures/ghost-in-the-walls-rabbit-20261120.png', w: 1040, h: 650, alt: 'The Ghost in the Walls portal page: pitch black, with the white pixel rabbit caught mid-leap.', pixel: true },
        { src: 'pictures/ghost-protocol-20261120.jpg', w: 1100, h: 688, alt: 'Ghost Protocol: Your Personal Cyber Security Checklist, with the exposure meter, the rank and the first tiers.' }
      ],
      links: [
        { href: 'https://findastra.github.io/ghost-in-the-walls/', label: 'findastra.github.io/ghost-in-the-walls', note: 'the rabbit' },
        { href: 'https://findastra.github.io/ghost-protocol/', label: 'findastra.github.io/ghost-protocol', note: 'the checklist' }
      ],
      text: ['My house runs three Wi-Fi networks, and every one of them is a ghost.'],
      subs: [
        { title: 'Ghost Downstairs', text: 'Private.' },
        { title: 'Ghost Upstairs', text: 'Also private.' },
        { title: 'Ghost in the Walls', text: "The guest network, and it's a puzzle. The portal asks a riddle about what the house used to be, and the answer is the password. Get in and a white pixel rabbit hops across a pitch-black screen. Catch him and his pixels burst, and you fall through into Ghost Protocol. The first link is the exact page the portal opens. Every third run he stops for half a second, so that's your chance." }
      ],
      note: "Ghost Protocol is my interactive cybersecurity checklist: 41 items in four tiers, from **ROOT ACCESS** (password manager, MFA, backups) down to **GHOST PROTOCOL** (canary tokens, VLANs, air-gapped backups). Matrix rain, a rank and threat meter, a hidden terminal, and a stack of easter eggs. The rabbit lives there too, along the bottom. Catch him and the whole site goes red alert."
    },
    {
      slug: 'abliteration',
      title: 'Abliteration in 3D',
      tag: 'New this week · requested',
      pictures: [{ src: 'pictures/abliteration-in-3d-20261120.jpg', w: 1100, h: 764, alt: 'Abliteration in 3D: prompts as dots, harmful ones pink and harmless ones yellow, with the refusal direction drawn between them.' }],
      links: [{ href: 'https://claude.ai/artifact/XDxbkoHwcW3eSzqm2QRsdn', label: 'Abliteration in 3D', note: 'opens on claude.ai, no account needed' }],
      text: [
        "How I'm making **Wisp**, the mind of my AI pet Astra Wisp: Qwen3.6-35B-A3B with its refusals removed by Heretic 2.1, on my own box, and allowed to act only through Iron Gates, my approval gate.",
        "Eight 3D charts you can spin, in learning order: prompts as dots, layer by layer, flattening the refusal direction, the experts, flavors of refusal, the methods, Heretic's search, and models compared. Every chart has a plain-words key, and there's a 28-term glossary."
      ],
      subs: [
        { title: 'Wisp', text: "Abliterated Qwen, from two Heretic runs (MPOA and ARA), on our own copies. The bar to beat is llmfan46's Qwen: refusals 83 → 10 at a KL divergence of 0.0015." },
        { title: 'Iris', text: 'My own agent. A cognitive core (not an LLM) picks her goals, stock Gemma 4 26B-A4B tuned to my voice writes her words (not abliterated), and the Astral Plane connector is her body in VRChat, over OSC.' },
        { title: 'Why the gate', text: "A mind with no refusals is exactly the one that gets a gate: one memory store and one set of permissions per mind, and nothing it does lands without my OK." }
      ],
      note: "Said plainly: nothing has run on the box yet, the charts use made-up numbers in the right shape, and Iris hasn't walked in live VRChat yet."
    },
    {
      slug: 'astras-pet-os',
      title: "Astra's PetOS",
      tag: 'The big one',
      pictures: [{ src: 'pictures/system-map-20261120.jpg', w: 1100, h: 688, alt: "Astra's PetOS System Map: every pet, program, AI model and device, drawn as a 3D map." }],
      links: [
        { href: 'https://findastra.github.io/astras-pet-os/system-map-20261012.html', label: 'The System Map' },
        { href: 'https://github.com/findastra/astras-pet-os', label: 'github.com/findastra/astras-pet-os' }
      ],
      text: [
        "My PC runs like a farm. Every app, tool and AI job is a pet, 85 of them and counting. Each one has its own repo, its own page (a control panel with status lights), and four intelligence levels: **L1** tools that are plain code, **L2** tricks (written steps an AI follows), **L3** the agent harness that runs them (Claude Code or Codex), and **L4** the approvals, which end with me.",
        "The Friendly Farmer organizes them, and the System Map draws all of it in 3D, from my PC out to every AI and service it touches."
      ],
      subs: [
        { title: 'The security wing', text: "White Hat Weasel checks every listening port every 10 minutes, shows who's connected and from where, and once a day asks me to close the ones we don't need (only our own servers, only by my click). Gatekeeper Goddess runs Iron Gates and owns my YubiKey. Every pet lives inside protection rings, with read, write and execute grants, each marked enforced, written, or planned." },
        { title: 'A server for the farm', text: 'Any agent can look up a pet, its tools and its open handoff cards through a read-only MCP server. This digest was put together with it.' },
        { title: 'Many assistants, one board', text: "Claude and Codex work the same farm at the same time, so handoff cards, file ownership and review rules live in the repos, not in anyone's chat." }
      ]
    },
    {
      slug: 'pet-chat',
      title: 'An AI seated in every pet',
      tag: 'Most ingenious',
      pictures: [{ src: 'pictures/pet-chat-mirror-pool-20261120.jpg', w: 1100, h: 1107, alt: "Mirror Pool, Platform Platypus's page, with its chat panel open: Codex is chosen to answer and is being seated. The desktop pets walk along the bottom of the screen." }],
      links: [{ href: 'https://findastra.github.io/astras-pet-os/apps/pet-programs/platform-platypus-20261018.html', label: 'Mirror Pool', note: 'the chat itself only runs on my PC' }],
      text: [
        "Every pet's page has a chat. Pick who answers, and that AI takes the pet's seat: Claude Code or Codex, working inside the pet's own copy of its repo, on its own branch. In the picture, Codex is taking Platform Platypus's seat in Mirror Pool, the page that checks my pages on six phones, an iPad and a desktop at once."
      ],
      subs: [
        { title: 'Supervised', text: "The seated agent reads the plan and the pet's repo, and changes files only on its own branch. Nothing reaches GitHub until I press Push and say yes on my PC." },
        { title: 'Locked down', text: 'The helper only answers on this PC. Claude Code runs restricted to reading, searching, editing and writing, with no outside MCP servers; Codex runs without my personal config, and can only write in its own workspace.' },
        { title: 'The parade', text: 'And yes, those are the pets walking along the bottom of my screen.' }
      ]
    },
    {
      slug: 'anthropic-ipo',
      title: 'Anthropic IPO Guide',
      tag: 'New this week',
      pictures: [{ src: '../anthropic-ipo/preview.png', w: 1200, h: 630, alt: 'The Anthropic IPO Guide: its title in stacked outline letters, in navy, lavender, peach and mint.' }],
      links: [{ href: 'https://findastra.github.io/anthropic-ipo/', label: 'findastra.github.io/anthropic-ipo' }],
      text: ["This page's colors and letters come from here. Shares, the IPO lottery, brokers, the Nov 17–19 timeline, and my real numbers (the lottery was not kind)."],
      subs: [
        { title: 'IPO Countdown', text: 'A free Windows app that counts down to the IPO on your Discord profile.', link: { href: 'https://github.com/findastra/anthropic-ipo-countdown', label: 'github.com/findastra/anthropic-ipo-countdown' } },
        { title: 'The OpenAI edition', text: 'The same guide made for OpenAI, in sky blue, with a placeholder date in 2027.', link: { href: 'https://findastra.github.io/openai-ipo/', label: 'findastra.github.io/openai-ipo' } }
      ]
    },
    {
      slug: 'papermon',
      title: 'Papermon',
      tag: 'New this week',
      pictures: [{ src: 'pictures/papermon-20261120.jpg', w: 1100, h: 688, alt: 'Papermon: a scientific article written up in plain words next to its trading card, a holo rare.' }],
      links: [{ href: 'https://findastra.github.io/papermon/', label: 'findastra.github.io/papermon' }],
      text: ["A free science discovery desk that deals real research as trading cards. Each card is a different scientific paper, pulled live from Europe PMC, with a plain-words write-up, its stats, and its rarity (yes, there are holo rares). The more you collect, the smarter you get."],
      subs: [{ title: 'This week', text: 'Ten cards with QR codes on their backs, Save as GIF, and a fresh coat of mint.' }]
    },
    {
      slug: 'ai-discord-presence',
      title: 'AI Discord Presence',
      tag: 'For your profile',
      pictures: [{ src: 'pictures/ai-discord-presence-20261120.jpg', w: 1000, h: 833, alt: "Anthropic Discord Presence: the app's galaxy, its buttons, and the Discord card that reads Using Claude Opus 5.5 on Max, Working on Astra's Infinite Pole." }],
      links: [{ href: 'https://github.com/findastra/ai-discord-presence', label: 'github.com/findastra/ai-discord-presence' }],
      text: [
        "Your Discord profile shows exactly which AI model you're working with, and for how long: \"Using Claude Opus 5.5 on Max, working on Astra's Infinite Pole.\" Two free Windows apps, one for OpenAI and one for Anthropic.",
        "Each card is an original galaxy with one spiral arm per model generation: five for Claude 5, six for GPT-6. Those are the galaxies spinning behind this page."
      ],
      subs: [
        { title: 'Ableton Live Presence', text: 'The music one. While Ableton Live is open and my APC64 is plugged in, Discord says "Playing drums", with a neon pad-grid card drawn in code.', link: { href: 'https://github.com/findastra/ableton-live-discord-presence', label: 'github.com/findastra/ableton-live-discord-presence' } }
      ]
    },
    {
      slug: 'liminal-doors',
      title: 'Liminal Doors',
      tag: 'Still hatching',
      pictures: [{ src: 'pictures/liminal-doors-20261120.jpg', w: 1100, h: 688, alt: 'Liminal Doors, Found Floors: Pinkscape with a pink phone booth in the clouds, Faraway Field, and Pool After Closing.' }],
      links: [{ href: 'https://findastra.github.io/liminal-doors/', label: 'findastra.github.io/liminal-doors' }],
      text: [
        'My VRChat world of doors that open onto quiet in-between places, each one hiding a little glass animal. Stop one is a pink phone booth above a sea of pink clouds.',
        "The Found Floors page is the collection: 36 floors, every door takes you somewhere random, and you tick off the ones you've found."
      ]
    },
    {
      slug: 'bio',
      title: 'My bio',
      tag: 'The rabbit lives here',
      pictures: [{ src: 'pictures/portfolio-rabbit-20261120.jpg', w: 1100, h: 258, alt: 'The bottom of the bio: the white pixel rabbit hopping through the matrix rain above the VR & VRChat section.' }],
      links: [{ href: 'https://findastra.github.io/', label: 'findastra.github.io' }],
      text: ["Where it all connects: worlds, projects, pets, and a terminal you can type into. The white rabbit from the portal runs through here too, every minute or two. Catch him and the rain changes color."]
    }
  ],
  outro: "That's the week. See you at the tower.",
  credits: [
    "Pictures: screenshots of each live page, taken 2026-11-20. The Mirror Pool picture is Astra's own screenshot, with the address bar and taskbar cropped off.",
    "The abliteration chart comes from Abliteration in 3D. The Ghost Protocol and AI Discord Presence pictures come from their READMEs, and the Anthropic IPO picture is the guide's own link preview.",
    "Spinning galaxies: AI Discord Presence's card art, laid out in code and made with gpt-image-2 through Astra's image bridge, approved by Astra on 2026-10-07/08.",
    "Fonts: Anton, Bungee and Space Mono (SIL Open Font License), the same files as the Anthropic IPO guide.",
    "Portfolio Puffer's weekly digest. Words and page written with Claude Opus 5.5 (`claude-opus-5-5`), from Astra's projects and notes."
  ]
};
