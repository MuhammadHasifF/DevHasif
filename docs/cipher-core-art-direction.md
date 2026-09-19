# Cipher Core correction

## Scope

Only the core/hand/conduit components and their existing reserved About slot are changed. Hero identity, portal, city/cloud shaders, copy, section order and the Framer-driven Experience timeline remain intact.

## Causes corrected

- Previous core used an opacity entrance in empty space. Its replacement enters below the viewport as a small foundation seam, inside two housing doors. Doors retract before a staged lift with a short pause.
- Wide four-panel widget replaced by a 3.5:1 asymmetric, six-facet machined monolith fragment, recessed spine, angled cuts and a narrow red seam. No bloom is needed for its silhouette.
- Capsule/sphere/extruded-palm hand removed completely. This is intentionally a **2.5D shadow hand**, not a rigged 3D model. Three registered anatomical poses are composited with spatially staggered thumb/finger transitions, depth scaling, edge-first reveal and front/back occlusion.
- Whole-core scale crush removed. Fixed-size plates translate inward under resistance, two facets snap and remain held, and cracks brighten before release.
- All seven liquid strands and fourteen gravity-driven droplets removed. A narrow three-layer plasma conduit uses internal traveling intensity, a restrained halo, and brief local fracture filaments.
- Right-gutter cubic routing and sampled spline calculations removed. `signalSegment` uses the measured existing rail centre as its only X, the core socket as its start and the existing rail top as its endpoint. The connector dims across the original logos and heading. The existing timeline's height animation is not duplicated.

## Asset provenance

Built-in image generation was used for `public/textures/cipher-shadow-hand.webp` (2172 × 724, three equal square frames, alpha, approximately 164 KiB). The generated PNG was compressed to WebP without changing its composition. All core/housing geometry is original code-native geometry. No external model or licensed stock hand is used.

### Final image prompt

Use case: stylized-concept. Asset type: production 2.5D transparent hand animation sprite atlas for a dark cinematic portfolio. Generate ONE wide image split invisibly into THREE EQUAL WIDTH frames side by side, no borders or labels. Each frame contains the SAME anatomically accurate adult right hand with exactly five fingers, same fixed camera, same scale and wrist position. Palm towards viewer at a subtle three-quarter angle; wrist extends down and slightly right. Graphite-black synthetic skin/glove, fine natural palm creases, not robotic capsules, not skeletal, not chunky armor. Realistic anatomy and tendons, premium film silhouette. Frame1 left: hand open loosely cupped, four fingers reach upward, thumb extended left. Frame2 middle: thumb moved inward and index/middle curled halfway towards palm, ring and pinky still more extended. Frame3 right: fingers closed into a firm gripping fist around a very narrow INVISIBLE vertical object at palm centre; thumb crosses in front of curled fingers; lower opening of grip still visible. No object depicted. Hands positioned identically: wrist at 55% width of EACH frame and bottom edge, gripping focus at 50% frame width and 45% height. Entire hands visible with 12% side padding, fingertips never cropped. Nearly-black shadow hand, understated soft cool grey rim along upper knuckles, very restrained deep crimson reflected light on inward finger edges. Dark body readable by silhouette and faint edge highlights, no bright red strips, no emissive surfaces. Genuinely TRANSPARENT alpha background, no checkerboard pixels, no ground, no shadows outside hand, no text, no watermark. Consistent registered frames suitable for layered pose transitions.

## Verification

Three targeted visual passes were completed in Edge on the local site:

1. Core: checked small foundation seam, opening housing and extracted silhouette. Corrected light placement/graphite readability and lowered the About dock to clear the section rule.
2. Hand: checked approach, anticipatory pause, staged finger closure and retained fragments. Corrected finger occlusion and softened the wrist into darkness. A further slow-scroll pass aligned actual wrist centres across the atlas, added continuous longitudinal finger warping and premultiplied pose interpolation, and extended the closing beat. Intermediate poses and reverse motion were rechecked on desktop and mobile; this is no longer only a three-image dissolve.
3. Energy: checked outlet, stationary internal motion, logo/header crossing and rail impact. Corrected canvas compositing order. Desktop and mobile DOM measurements found **0px horizontal error** and effectively **0px endpoint gap** at rail arrival.

Viewports inspected: 1920×1080, 1440×900, 1366×768 and 390×844. Mobile had no horizontal document overflow. Reverse scrolling restored the core and retracted the beam. Reduced-motion SVG/hand fallback was exercised; fixed stale renderer selection and removed lingering fallback housing doors. Browser error log was empty. This verifies the shared non-WebGL visual path; forced context-loss injection and Safari/Firefox were not tested.

Automated checks: lint/type validation, production build (17 static pages; home first-load JS approximately 267 kB), and 22 unit/content tests passed. Five new tests cover socket origin, stable rail axis, forward/reverse determinism, document handoff, exclusion of the old geometry/routing, and 10,001 continuous capture-control samples. The sample test verifies choreography continuity, not GPU frame rate or every possible rendered pixel.

## Limits

The hand is a deliberately dark, registered-pose composite, not a fully articulated skeletal simulation. Reduced motion and unavailable WebGL use static/vector core geometry and the same shadow-hand artwork, with scroll-staged poses and no autonomous animation. The controller has one GSAP ticker, cached ResizeObserver measurements, no wheel interception or frame-by-frame React state, and explicit GPU/resource cleanup.
