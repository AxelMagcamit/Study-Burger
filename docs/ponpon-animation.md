# Ponpon animation

`components/Ponpon.tsx` reuses the original SVG face, sunflower collar, colors and seated proportions. Separate groups animate the body, torso, tail, front paws, feet, head, eyes, props and ground shadow. The original SVG files remain available as static artwork.

Motion takes inspiration from the supplied cat clips: paw waves, springy body movement and soft side-to-side motion. No footage, audio, third-party characters, animation libraries or remote assets are embedded.

| Context | Motion |
| --- | --- |
| Welcome | Paw wave, body sway, blink, tail swish and toe tap |
| Study/dashboard | Gentle reading nod and book movement |
| Generating | Thoughtful head tilt, card movement and toe tap |
| Completion | Full-body hop, two-paw cheer and responsive shadow |
| Break | Slow breathing and sleepy nod |
| Empty state | Curious tilt and magnifying-glass movement |
| Error/retry | Small reassuring nod |

Pass `animate` to opt in. Small navigation artwork remains static. Animation transforms only internal groups, never the SVG's layout position. CSS is in `app/ponpon-motion.css`.

The pause/play button is available on the welcome page, dashboard and study screen. `PonponMotionProvider` remembers the choice in browser-local storage and synchronizes tabs. Device reduced-motion preferences always take priority; hidden tabs pause. There are no per-frame React updates, account mutations or new permissions.

Checks: `npm test` includes rig rendering, decorative accessibility and motion CSS guards. `npm run build` includes TypeScript. For browser QA, check wave/tail/body movement, pause/play, pause after reload, dashboard reading, completion celebration and device reduced motion. Test narrow screens for clipping and control overlap.
