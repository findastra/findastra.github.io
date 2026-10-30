// The plain layer: career and skills. This is the file Astra approves.
// Portfolio Puffer proposes changes here (from LinkedIn and GitHub); nothing is added without her yes.
// Each employer in `positions` gets its own page under work/. Prose is arrays of paragraph strings.
window.PROFILE = {
  name: "findastra",
  about: [
    // Astra, 2026-10-29: "I need to put that I'm an agentic engineer ... it needs to be somewhere else on the page"
    "Chemical process engineer in semiconductor manufacturing, and an agentic engineer.",
    "I build virtual worlds, small single-purpose apps, and the tools that let AI agents work alongside me.",
    "Most of it lives in the open on GitHub. The rest of this page is the long version."
  ],
  languages: ["HTML & CSS", "JavaScript", "C#", "Python", "PowerShell", "TypeScript"],
  skills: [
    "Unity and VRChat world building (SDK3, UdonSharp)",
    "Single-file web apps and GitHub Pages sites",
    "Windows desktop tools and automation",
    "Working with AI coding assistants (Claude Code, Codex)",
    "Documentation, audits and release records"
  ],
  // Filled from LinkedIn by Portfolio Puffer, then read word for word by Astra before it goes live.
  // Shape: { slug, employer, role, start, end, summary: [..], story: [..] }
  positions: []
};
