# Spoonfed: one phone page, every card the same, and open tabs update themselves

Astra, 2026-11-14:

- "it's not appearing the same across different people's devices, I think some people's platforms are updated and other people's aren't"
- "every mobile device is just one page ... the first window is a different format. It's got a smaller preview ribbon than the other ones."
- "I still want to shrink the top box a little bit somehow" and "reduce some of the space below" the small logo.
- "Merge and publish"

Replaced `spoonfed/` with a new web build of `findastra/spoonfed` at `main` a5fd425 (spoonfed#27, merged with Astra's OK). What changes on phones:

- **Every card is the same.** Each spot you swipe to has the photo ribbon, name, facts and the Save · Website · (Happy Cow) · Directions buttons, at the same height as the first.
- **Smaller top.** Less room under the small logo and less padding in the reel box.
- **Open tabs update themselves.** The page checks for a newer build when it opens and when you come back to it (at most once a minute) and reloads onto it. Rolls and saved spots are kept. A tab still on an older build needs one manual refresh to get this.

The computer layout is unchanged. What is public: the built page and its script. No key, email or PC path is in the files (checked). The deploy adds the Google key as before.

By Astra.
