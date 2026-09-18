# Hero / portal / monolith refinement

Baseline: `64cda52` on main. Worktree: `/Users/hasif/Work/dev-hasif-main`.

## Scope

Restored the dominant two-line title, original bamboo-forest portrait and coordinated sliced glitch bursts. Both identities end with a crimson `</>`. Hero informational copy, CTA destinations, metadata, resume, biography, employment, projects and later-section designs are unchanged.

Homepage order: opening → About with retained statistics footer → organization marquee → Experience → existing remaining content. Marquee occurs once. A small SectionPill observer correction clears stale labels when reversing into the opening; its appearance is unchanged.

## Implementation

- One normal-scroll GSAP viewport pin, using the existing Lenis subscription; no wheel interception. Root 720svh desktop / 620svh mobile; stage exactly 100svh. Portal occupies 34% of the pinned runway, approximately 211vh / 177vh.
- First meaningful scroll freezes the currently visible name through a ref. Timers are not reconstructed on scroll. Returning to effectively zero resumes the cycle; fractional start-position errors snap to zero.
- Solid crimson glyph becomes translucent and then a clear aperture. Name, portrait and secondary copy recede behind it. One persistent city is clipped by a viewport-space CSS path. Polygon clipping bounds the submitted coordinates, avoiding enormous offscreen SVG surfaces. A matching SVG provides crimson material/rim, not a second world.
- The central slash covers every viewport corner before clipping is retired. Pose math is direction-independent; no environment is swapped at the boundary.
- Explicitly hybrid city: original generated distant monolith artwork, instanced faceted foreground megastructures, procedural surface variation, GPU fog, sparse crimson seams and tiny remote signals. This is not an entirely procedural environment. No supplied tower image or reference-site asset is embedded.
- Camera descends Y=2450 → 65, with 240 units of forward travel and restrained lateral drift/roll. Foundations extend beneath the final camera position. Mounted scene has no factory, pipes, refinery or office-window grid.
- Manifesto uses approximately 86% of desktop width, two deliberate mobile lines, a centred hold and slight vertical entry/exit. Exact wording retained.
- One lazy renderer; DPR capped at 1; shared geometry/materials and instancing. Mobile narrows architecture spacing and reduces signals. Rendering stops when hidden/offscreen, and stationary environmental updates cap at 30fps. No postprocessing dependency.
- Reduced motion: natural-flow hero + static city, no pin/zoom/travel and no Three import. WebGL creation/shader failure or context loss hides the canvas and retains local artwork. Late loading does not replace the fallback halfway through a traversal.

## Three visual refinement passes

Browser: connected Edge, development followed by isolated production preview. Jesko and Oryzo were inspected interactively for pacing and foreground occlusion, without copying assets or source.

1. Composition, 1440×900: both names, portrait, small/mid/large portal, clouds, manifesto, foundations and About release. Fixed grouped SVG clipping, restored foreground occlusion, removed the horizon-cutting floor and cleared the stale About pill.
2. Motion/mobile, 390×844: first-scroll freeze, aperture, full city, two-line manifesto, lower city and reverse reset. Fixed CTA wrapping, corrected artwork aspect ratio and adjusted mobile architectural spacing. Confirmed the production canvas was visible rather than accidentally reviewing only fallback.
3. Atmosphere/regression, 1366×768 and 1920×1080: lowered exposure, extended foundations to remove dangling blocks, bounded portal geometry and changed the viewport pin from transform to fixed after a wide-screen compositor defect. Fresh production verification confirms the full wide-screen hero renders correctly. Reduced-motion settings were toggled through the UI and restored.

Static reduced-motion composition and accessible content were inspected. Hardware context-loss injection, Safari/Firefox runs and Lighthouse/FPS benchmarking were not performed. Caps and visual inspection are not measured frame-rate guarantees.

## Verification

- Production build: passed, 17 static pages; home first-load JS approximately 264 KB.
- ESLint and TypeScript: passed.
- Unit/content tests: 17 passed, including viewport-bounded geometry, all viewport corners inside the final slash, exact origin, reverse symmetry, continuous descent, timer cleanup and preserved content.
- Local production smoke: home/work/resume/writing, six case studies, PDF/icon/OG/sitemap/robots, anchors, unknown-project 404, invalid/malformed contact rejection. No valid contact message sent.
- Existing edge-runtime static-generation and Node module-type warnings remain unrelated.

## Original artwork

### Follow-up touchups

The inline glyph now matches the title's cap height. A responsive two-column identity composition aligns the original portrait with the two-line name block. Advected cloud density and embedded crimson illumination continue updating while scrolling is idle; architectural texture coordinates remain stationary. Foundation weathering, faceted footings, instanced vertical relief and sparse service seams replace the plain nearest blocks. The artificial horizontal cross-canyon beam is removed. The final viewport blends to the same near-black foundation color used by About, with faint original architectural texture beneath its unchanged content. Reduced-motion mode retains the matching static color transition.

Focused browser checks covered desktop proportions, two stationary cloud frames, foundations, About handoff and mobile layout. The artwork file itself is unchanged.

`public/textures/monolith-world.webp`: 1024×1536, about 111 KB. Generated using the built-in image tool, inspected and WebP encoded. Used as distant scene detail and fallback, never on the initial landing.

Prompt summary: original tall continuous charcoal storm environment; severe graphite monoliths flanking empty atmospheric negative space; tapered crowns, sparse crimson seams/cavities, immense lower foundations and mist. Lonely, monumental, restrained and photographic. No copied central tower, text, logos, HUD, conventional windows, pipes, refinery, warehouse, purple neon or watermark.

## Signal Core refinement — September 2026

- Portrait shrink came from `.opening-portrait-depth`: opacity also drove a 1 → .88 scale and 24px translation. Removed both transforms; opacity now holds until 30% of portal travel and fades through 57%. The portal occludes the stationary hero plane.
- Atmosphere was already time-driven, but the distant field advanced at .004 units/second, the secondary field at .018, and squared light thresholds plus low-opacity fog made evolution difficult to see. Distant/mid/near fields now move at independent rates/directions. Broad crimson pools travel on independent 12–20-second cycles and are occluded by cloud density; architecture UVs remain stationary. No lightning or postprocessing pipeline.
- `signal-world.ts` constructs an original beveled, split graphite shell, a diagonal conductive ribbon, four reversible fracture pieces, covered three-joint fingers and an opposing two-joint thumb. Shared geometry/materials, 14 instanced drops and seven strands avoid fluid simulation. This is a stylized procedural synthetic hand, not a photoreal scanned asset.
- `signal-story.tsx` keeps that object in one transparent, lazy-loaded Three.js scene from foundation emergence to About's reserved dock, gutter retreat, capture, compression and release. The existing city renderer is retained separately and pauses offscreen. No copied reference models/assets and no new dependencies.
- The page-space conductor is measured with ResizeObserver, including About expansion and timeline accordion changes. It turns toward the outer gutter before the organization strip and ends precisely at the existing Experience rail. The original Framer Motion line-height driver remains; charge gates its illumination and lights reached nodes. Content and section order are retained.
- Mobile reserves a small dock above About copy and moves the core to the gutter early. Reduced-motion uses vector stills/staged hand states without creating the extra renderer. Renderer failure/context loss retains the vector fallback. Normal browser scrolling and existing Lenis remain responsible for navigation.

Visual refinement passes covered hero/idle sky, foundation/core/About, and hand/release/Experience. Refinements included removing red shell overexposure, avoiding an edge-on About pose, correcting finger curl, joining the longest strand to the conductor, and moving its bend clear of the logo strip. Browser checks used approximately 1920×1080, 1440×900, 1366×768 and 390×844; stationary sky frames visibly changed, reverse travel restored the hero, and the reduced-motion setting was restored after inspection. Edge console errors were empty. Safari/Firefox, forced hardware context loss and measured FPS/Lighthouse were not tested.

Verification: lint and TypeScript/build passed; 17 existing unit/content tests passed. Production build: 17 static pages, home first-load JS approximately 267 KB (previously 264 KB), with the object renderer lazy-loaded. No asset, résumé, biography or work/project wording changes.
