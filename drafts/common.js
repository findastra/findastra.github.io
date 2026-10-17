// Shared by every draft: the facts, so all six say the same true things.
// Loads after ../profile-data.js and ../site-data.js.
window.ASTRA = (() => {
  const P = window.PROFILE || {};
  const S = window.SITE || { repos: [], pets: [] };
  const art = (p) => '../art/' + p;
  return {
    message: ['One person.', 'Two names.', 'Both real.'],
    lettering: "I'm Audra, a.k.a. Astra",
    tagline: 'noncorporeal dancer · reality-hacker · digital performer',
    is: ['a dancer', 'a world builder', 'a reality-hacker', 'a digital performer', 'a pet keeper', 'a builder of tools'],
    about: P.about || [],
    languages: P.languages || [],
    skills: P.skills || [],
    positions: P.positions || [],
    avatar: art('avatar.jpg'),
    photos: [
      { src: art('worlds/infinite-pole-spawn.jpg'), caption: "Astra's Infinite Pole: the spawn", href: 'https://github.com/findastra/astras-infinite-pole' },
      { src: art('worlds/phone-booth.jpg'), caption: 'A phone booth above the clouds', href: 'https://github.com/findastra' },
      { src: art('avatar.jpg'), caption: 'Astra', href: 'https://github.com/findastra' },
    ],
    worlds: [
      { name: "Astra's Infinite Pole", kind: 'VRChat · PC VR / desktop', text: 'My VRChat world, full of magical effects. Unity source and every published version are on GitHub.', href: 'https://github.com/findastra/astras-infinite-pole', img: art('worlds/infinite-pole-spawn.jpg') },
      { name: 'Piranesi House', kind: 'VRChat · in progress', text: "Inspired by Susanna Clarke's Piranesi: an endless House of statues, tides and light.", href: 'https://github.com/findastra/piranesi-house' },
      { name: "Mommy's", kind: 'Community', text: 'A VRChat dance academy and entertainers club, with its own world, classes and Discord.', href: 'https://github.com/findastra/mommys-website', img: art('worlds/phone-booth.jpg') },
      { name: 'AI Astra', kind: 'AI · VRChat', text: 'A bridge that brings an AI companion into VRChat.', href: 'https://github.com/findastra/vrchat-ai-astra' },
    ],
    links: [
      { name: 'GitHub', href: 'https://github.com/findastra' },
      { name: 'TikTok', href: 'https://www.tiktok.com/@findastra' },
    ],
    repos: (S.repos || []).filter((r) => r.name !== 'findastra.github.io'),
    pets: (S.pets || []).map((p) => ({ ...p, img: art('pets/' + p.art + '.png'), href: 'https://github.com/findastra/' + p.repo })),
    // Live repos when GitHub answers; the snapshot otherwise. Calls back with (repos, isLive).
    liveRepos(cb) {
      cb(this.repos, false);
      fetch('https://api.github.com/users/findastra/repos?per_page=100&sort=pushed')
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => cb(d.filter((r) => !r.fork && !r.private && !/^pet-program-\d+$/.test(r.name) && r.name !== 'findastra.github.io' && !/^Moved:/.test(r.description || ''))
          .map((r) => ({ name: r.name, description: r.description || '', language: r.language || '', pushed_at: r.pushed_at, homepage: r.homepage || '' })), true))
        .catch(() => {});
    },
    el(tag, cls, text) {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    },
    link(href, cls, text) {
      const a = this.el('a', cls, text);
      a.href = href; a.target = '_blank'; a.rel = 'noopener';
      return a;
    },
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
})();
