# Sketchbook design system

The interface uses warm paper, sunflower highlights and charcoal outlines. Ponpon's existing SVG artwork and expressions are preserved.

## Style layers

`app/layout.tsx` imports `globals.css` (base structure), `ponpon.css` (brand), `storybook.css` (existing layouts), `refinements.css` (responsive refinements) and finally **`handdrawn.css`** (current visual theme). Existing layers remain to avoid rewriting working layouts. Add new theme rules to the last file and check specificity against scoped selectors such as `.app-shell .button`.

## Tokens and typography

- Existing palette tokens live in `ponpon.css`, including dark-mode overrides.
- `--ink`, `--pencil`, `--paper-dot`, `--sketch-radius` and `--hand` live in `handdrawn.css`.
- Headings use a locally hosted Latin subset of **Kalam**. Body text, inputs and flashcard content keep a readable system sans-serif.
- Font source: Google Fonts `ofl/kalam/Kalam-Regular.ttf`; license: `public/fonts/OFL.txt`. The subset covers U+0020–U+017E; other characters use system fallbacks. No external font request is required.
- Irregular borders, offset shadows and dashed dividers create the hand-drawn effect. Text and form controls stay upright.

## Components

Use yellow for primary actions, paper surfaces for secondary actions, and explicit labels for ratings and errors. The Google logo and readable Google button remain intact. Paper tape and dot patterns are decorative, never carriers of required information.

Ponpon moods: welcome, focused, thinking, celebrate, sleepy, concerned and curious. Use one relevant expression per state; do not replace him with unrelated artwork. Preserve intrinsic image dimensions to avoid layout shifts.

## Accessibility and responsive rules

Keep visible keyboard focus, 44-pixel primary touch targets, readable body text and semantic button labels. Motion is disabled with `prefers-reduced-motion`. The flashcard's 3D transform belongs to `.flashcard`; do not override it with hover rotations. Forced-color mode keeps explicit control borders.

Check 360px, 768px and 1440px widths, both themes, keyboard-only interaction, 200% zoom and long deck/card text. See [testing](testing.md); source review is not a substitute for browser verification.
