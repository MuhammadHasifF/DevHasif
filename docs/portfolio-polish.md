# Original-design restoration and performance polish

The user rejected the editorial redesign. The original visual identity and animated composition from commit 8ee5b3f are restored: neon-red palette, typography, cityscape, name/avatar glitch, nav creature, global cyber layers, manifesto, marquee, stats, alternating timeline, horizontal featured rail, project grid, animated skills/credentials/contact, page curtain, and footer.

## Retained content
- Updated work experience, solo FSSD scope, and private repository notes.
- Six projects in the requested order, with public GitHub links, evidence summaries, and evaluation qualifiers.
- KithRelay correctly categorised as engineering rather than an ML implementation.
- Internship positioning for data analytics, machine learning, and AI engineering; expected graduation 2028.
- Resume PDF unchanged. It matches the user's Desktop/_/Resume.pdf byte-for-byte.

## Targeted engineering changes
- Glitch timer queues discard completed handles rather than retaining every animation beat.
- The nav creature moves through a transform instead of changing its children's layout positions each frame.
- Nav-creature and Lenis frame loops stop in hidden tabs.
- Hero/manifesto/background CSS loops pause while not visible and resume their existing phase.
- The pointer spotlight translates a fixed gradient rather than repainting a viewport-sized gradient at each pointer position.
- Background scroll bounds are cached and refreshed by resize observation.
- Project pointer events are coalesced into one frame-level read/write.
- The featured-card accent animates scale instead of layout height.
- The original page curtain remains; AnimatePresence wait mode now manages one content child.
- Persisted settings are loaded before writing defaults; supported reduced-motion controls and existing safety fixes are retained.
- Contact preview stubs no longer appear to have delivered real email.

## Verification
- Lint and TypeScript checks pass.
- Eleven regression tests cover project content, original animated composition/palette, and timer cleanup including 1,000 completed beats.
- Production build and local HTTP smoke checks are rerun before handoff.
- Browser visual inspection and FPS profiling remain pending: no browser connection was available. No measured frame-rate improvement is claimed.
- Nothing has been pushed or deployed.
