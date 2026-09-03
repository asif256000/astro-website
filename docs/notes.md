# Engineering notes

Rationale for a few non-obvious decisions in the codebase, kept here instead
of as long inline comments so the source stays skimmable. Source comments
should stay short and point back to a section here.

## Cloudflare gotchas (check these first if perf/behavior regresses)

This site is proxied through Cloudflare, and two of its automatic "Speed →
Optimization" features have silently fought against site behavior in the
past. If something in this doc stops working in production despite working
in a local build, check these before re-debugging the app code:

- **Rocket Loader** rewrites `<script type="module">` tags' `type`
  attribute, breaking Astro's `ClientRouter` — the `astro:page-load` event
  it dispatches (which the hero typewriter, dark-mode toggle, and blog
  iframe's `src` all wait on) stopped firing at all. Must stay **off** for
  this site (Speed → Optimization → Rocket Loader).
- **Cloudflare Fonts** self-hosts Google Fonts on Cloudflare's edge
  (`/cf-fonts/...`, fine) but **inlines the entire multi-language
  `@font-face` CSS directly into the HTML** as a blocking `<style>` tag —
  observed at 16KB / 61 rules (every Latin/Cyrillic/Greek/Vietnamese/etc.
  subset for every requested weight, though the site only ever renders
  Latin text), completely replacing the deferred `media="print"` `<link>`
  trick in `BaseLayout.astro`. It does correctly preserve whatever
  `display=` value the source URL requests, so that part of the font
  strategy below still works — but the inlining itself makes the CSS
  render-blocking on every page load, no matter what the source does.
  Needs the equivalent dashboard toggle turned off to actually get the
  non-blocking loading behavior the source is written for.

## Font loading (`BaseLayout.astro`)

Hero.astro's title (JetBrains Mono 700) and body text (Inter) are loaded via
Google Fonts, `media="print"` + `onload` swap trick (non-blocking) plus a
`<link rel="preload">` for the two specific woff2 files actually used above
the fold — Inter serves all five requested weights off one variable-font
file for the Latin subset, so a single preload covers the whole family.

`font-display` is `optional`, not `swap`. Preload alone wasn't enough:
PageSpeed's mobile run throttles to Slow 4G, where even a preloaded font
often hasn't finished downloading by the time the stylesheet activates —
so with `swap` the browser still swapped fonts after first paint and
reflowed the hero block (measured CLS 0.31+). `optional` makes this
network-speed-independent: if the font isn't ready within its ~100ms
budget, the browser commits to the fallback for that view and never swaps
later. The real font still renders on any reasonably fast connection and on
every cached repeat visit; only a genuinely slow, uncached first load ever
sees the fallback (verified: `Courier New`, reads cleanly, fits the site's
monospace aesthetic).

Font URLs are version-hashed by Google (`v20`/`v24` as of writing) — if
Google rotates the file, the preload just silently misses with no breakage.

## Blog iframe (`BlogEmbed.astro`)

The blog is a separately-hosted, cross-origin static site embedded via
iframe on the Resume & Blog page, theme-synced to this site's dark/light
toggle via a `?theme=` query param.

Two things require a matching listener on the **blog's own** side (it's a
different codebase/host) — without them the corresponding feature silently
no-ops:

1. **Back/forward buttons** — cross-origin means `contentWindow.history` is
   unreachable, so the buttons `postMessage({type:'blog-nav', action})`
   into the frame. The blog must listen for this and navigate itself. Do
   **not** implement that listener with `history.back()/forward()` — an
   iframe has no isolated history stack, it's part of the tab's single
   joint session history, so once the iframe's own entries run out a
   further `back()` call falls through and starts navigating the *outer*
   site backward (confirmed live). Track the blog's own visited-page stack
   in `sessionStorage` instead and navigate via `location.assign`, never
   touching real browser history:

   ```js
   (function () {
     const KEY = 'blog-nav-stack';
     const read = () => JSON.parse(sessionStorage.getItem(KEY) || '{"stack":[],"ptr":-1}');
     const write = (s) => sessionStorage.setItem(KEY, JSON.stringify(s));
     const here = location.pathname + location.search;

     let { stack, ptr } = read();
     if (stack[ptr] !== here) {
       stack = stack.slice(0, ptr + 1).concat(here); // drop any stale "forward" branch
       ptr = stack.length - 1;
       write({ stack, ptr });
     }

     window.addEventListener('message', (event) => {
       const allowed = ['https://asifiqbal.xyz', 'http://localhost:4321'];
       if (!allowed.includes(event.origin)) return;
       if (event.data?.type !== 'blog-nav') return;

       let { stack, ptr } = read();
       if (event.data.action === 'back' && ptr > 0) ptr--;
       else if (event.data.action === 'forward' && ptr < stack.length - 1) ptr++;
       else return; // at the edge of our own stack — no-op, never fall through

       write({ stack, ptr });
       location.assign(stack[ptr]);
     });
   })();
   ```

2. **Reporting current location back to the parent** — the parent has no
   way to know where the iframe navigated to on its own (regular link
   clicks, or the back/forward listener above), since `<iframe src>` only
   ever reflects what the parent last set it to. Without this, every theme
   toggle resets the embed back to the blog's homepage instead of staying
   on the current page. The blog should post its path on every real page
   load:

   ```js
   (function () {
     if (window.parent === window) return; // not framed, nothing to report
     const url = new URL(location.href);
     url.searchParams.delete('theme'); // parent manages this param itself
     window.parent.postMessage(
       { type: 'blog-nav-state', path: url.pathname + url.search },
       '*' // payload is just our own path — not sensitive enough to need a fixed target origin
     );
   })();
   ```

Both confirmed implemented and working end-to-end as of 2026-09-03.
