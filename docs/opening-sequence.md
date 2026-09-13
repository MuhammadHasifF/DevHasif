# Opening sequence — implementation, visual review pending

Baseline: `02fd9a3` on `improve/portfolio-2026-refresh`.

## Scope

Only the opening hero and former manifesto sequence were replaced. Hero informational copy, CTA destinations, the site configuration and resume are unchanged. The old decorative SVG city/HUD treatment is no longer mounted. The exact manifesto phrase remains. The only identity-text change is the `</>` suffix.

The homepage from `<Marquee />` onward is byte-identical to the baseline. A read-only comparison also verified 78 existing source/config/resume files outside the allowed edits were unchanged. Navigation, global typography/palette, other routes and later sections were not redesigned. Lenis gained only a scroll subscription bridge; its existing configuration and animation loop remain.

## Implementation

- `opening-sequence.tsx`: a normal-document-scroll GSAP pin, no wheel handlers. Root height is 660svh desktop / 580svh mobile; the viewport remains 100svh. The first 36% gives approximately 202vh / 173vh of portal travel. A single delayed refresh accounts for the existing route-enter transform.
- `opening-math.ts`: direction-independent portal geometry and camera poses. The glyph's central slash eventually covers every viewport corner; there is no masked-world/full-world swap.
- `portal-glyph.tsx`: matching inline vector anchor and inverse luminance aperture over one persistent canvas. At zero progress the city opacity is exactly zero.
- `glitch-headline.tsx`: short red/white sliced events with long stable intervals. Scroll freezes the current word; return to essentially zero releases it. Timer cleanup and offscreen/hidden-page checks remain.
- `city-world.ts`: one dynamically imported Three renderer; deterministic instanced architecture, procedural emissive windows, cloud shaders, sparse traffic, structural supports, pipes, service lighting and a drainage floor. Camera descends from Y=365 to Y=-48 with small lateral drift. Desktop DPR capped at 1.35, mobile at 1; mobile has fewer buildings and lights. Environmental frames stop offscreen/hidden and are limited to 30fps when stationary. No postprocessing dependency was introduced.
- `manifesto-scroll.tsx`: measured desktop single-line type, deliberate mobile two-line type. The text remains in the accessibility tree even outside its visible scroll interval.
- `opening.css`: scoped styles, opaque non-city landing and static progressive-enhancement layout. Reduced motion has two natural viewports, no pin or camera travel, and does not load Three. No-WebGL/shader failure/context loss retains the local still through the same aperture.

If WebGL arrives after scrolling has already begun, that traversal stays on the fallback instead of visibly switching environments during the zoom. A return to the landing enables the initialized world for the next traversal.

## Verification completed

- TypeScript: passed.
- ESLint: passed.
- Unit/content tests: 16 passed, including all four requested viewport sizes for aperture coverage, exact inline origin, reverse-path symmetry and monotonic camera descent.
- Production build: passed, all 17 static pages generated. Existing edge-runtime static-generation warning remains. Home first-load JS reported 263 KB; this is not a runtime performance measurement.
- Content/scope comparison: passed as described above.
- Local production route smoke checks: passed for home, work, resume, writing, six case studies, navigation anchors, assets, unknown-project 404 and invalid-contact rejection. Preview: `http://127.0.0.1:3041`. These are HTTP checks, not browser QA.

## Required visual QA — blocked, 0 of 3 passes completed

The browser skill bootstrap returned `No browser is available`; the prescribed browser list returned `[]`. An asynchronous request to connect a browser was sent. No browser screenshots, runtime FPS claims, Lighthouse scores, cross-browser claims or visual approvals have been made. The references were available as web text, not as interactively inspected animations. `oryzo.ai/Jesko` did not resolve through the browsing tool.

Once connected, inspect Oryzo/Jesko interaction pacing without copying assets or source, then perform all three visual refinement passes on the local production preview. Required viewports: 1440×900, 1920×1080, 1366×768, 390×844.

| Check | Approximate normalized sequence progress |
| --- | --- |
| A: initial landing | 0 |
| B: first scroll/freeze | .003 |
| C: small city aperture | .04 |
| D: mid zoom | .16 |
| E: near-full aperture | .25 |
| F: fully inside city | .36 |
| G: cloud descent | .43 |
| H: skyline | .54 |
| I: complete manifesto | .66 |
| J: industrial endpoint / handoff | .98–1, then scroll past pin |
| K: reverse | reverse every checkpoint, finish at 0 |

Pass 1: composition, portal alignment/continuity and black/red levels. Pass 2: city silhouette, atmosphere, camera pacing, manifesto width and mobile composition. Pass 3: reverse stability, resize/orientation, both frozen names, keyboard navigation, deep links/route remounts, reduced motion, WebGL/context-loss fallback and sustained performance. Refine between passes; do not count code review or passing tests as visual passes.

## Original fallback asset

Built-in image generation was used only for the non-WebGL/static fallback, never for the realtime scene or initial landing. Original output was inspected and lossily encoded to `public/textures/city-fallback.webp` (1672×941, 109,880 bytes). No reference-site assets or supplied tower images were embedded.

Generation prompt:

> Create one original cinematic environment still for a website's static non-WebGL fallback. Landscape 16:9. Scene: a vast isolated industrial city canyon in nearly black graphite architecture, viewed from above through storm fog, deep crimson emissive infrastructure, dense irregular terraced building masses on both sides, distant red service lights, restrained sparse red traces far below, immense structural bridges and hints of pipes in lower dark levels. The centre is EMPTY atmospheric negative space receding into haze, not a building. NO central tower, no signature skyscraper, no pyramidal landmark. Sophisticated realistic architectural atmosphere, photographic black levels, desaturated charcoal storm clouds, deep burgundy reflected light, a few white-hot crimson sources only. Lonely, hostile but elegant, monumental depth and scale. No logos, text, glyphs, HUD, signs, purple, rainbow, videogame UI, or watermark. Original environment, not any franchise or the supplied reference towers. Intended as graceful static fallback for the same procedural city whose architecture flanks a descending central canyon. Save the result and return its file path.

Reference/documentation pages consulted: [Oryzo](https://oryzo.ai/), [Jesko Jets](https://jeskojets.com/), [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Lenis](https://github.com/darkroomengineering/lenis), [Three.js](https://threejs.org/docs/).
