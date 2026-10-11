# Motion Template

A reusable, frontend-only landing template: dark editorial hero with a sculptural
metallic ribbon, light trails and particles, plus a two-column intro section.
Built with React, TypeScript and Vite. Theme tokens are CSS custom properties.

Demo content is the fictional company **Nexora**. The statistics in the hero
(10K+ teams, 99.9% uptime, "Global" infrastructure) are **demo values**. Replace
them before publishing.

## Setup

```bash
npm install
npm run dev        # http://localhost:5183
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Requires Node 18+. There's no backend: the output in `dist/` is static and can be
hosted anywhere.

## Project layout

```
src/config/site.ts      ← company content, links, stats, artwork + animation settings
src/config/tokens.css   ← brand colours, fonts, theme surfaces (dark + light)
src/config/types.ts     ← shape of the config (read-only reference)
public/brand/           ← logo mark, favicon
public/artwork/         ← hero artwork layers per theme
public/media/           ← optional brand film + poster
src/components/         ← Header, ThemeSelector, Hero, HeroArtwork, Button, StatsRow, IntroSection, VideoDialog
src/styles/global.css   ← layout and component styles (tokens only)
artwork-source/         ← Blender script that renders the ribbon artwork
```

## Branding

1. **Name, logo, nav, CTAs, copy:** edit `src/config/site.ts`.
   - `company.logoMark` points at a file in `public/brand/` (omit it for a wordmark-only
     logo). With `logoTint: true` the
     mark is painted in the theme's text colour (good for single-colour marks). Set it
     to `false` for multi-colour logos.
   - Headlines are arrays of lines; mark a segment `accent: true` to colour it.
   - `hero.video: null` hides "Watch video".
2. **Colours and type:** edit `src/config/tokens.css`. Each theme has its own block.
   `--color-accent` is the pale-blue headline accent. `--trail-*` and `--particle-*`
   colour the canvas light layer.
3. **Fonts:** fonts are self-hosted with `@fontsource`. Install another family
   (`npm i @fontsource-variable/<family>`), swap the import in `src/main.tsx`, and
   update `--font-display` / `--font-body`.
4. **Page title / description / theme colour:** `meta` in `site.ts`, plus the static
   fallbacks in `index.html`.

## Light and dark mode

The theme selector offers System, Light and Dark. System is the default and follows
OS changes live. An explicit choice is saved in `localStorage` under
`theme-preference`. An inline script in `index.html` applies the theme before first
paint, so the wrong theme never flashes. If you rename the key, change it in both
`index.html` and `site.ts` (`themeStorageKey`).

## Hero artwork

The artwork is independent of the layout. It is a stack of transparent layers in a
shared coordinate *frame* (`artwork.frame`, 1536 × 754 for the demo):

| Layer | Purpose |
|---|---|
| `back` | distant ribbon, slight blur, moves least |
| `main` | the hero ribbon (light trails/particles are drawn on top of it) |
| `front` | out-of-focus foreground swoosh, moves most |

**Replacing it:** export new images at the frame's aspect ratio (any resolution;
the demo uses 2304 × 1131 WebP) into `public/artwork/dark/` and
`public/artwork/light/`, or point `artwork.layers` at other paths. `back` and
`front` are optional. Then update the following in `site.ts`, in frame pixels:

- `subjectStartX`: where the subject begins horizontally. This keeps it clear of the copy on small desktops.
- `mobileFocus`: the crop shown below the copy on tablet/mobile.
- `animation.trails` and `animation.particles`: where the orbits and particles sit.

**Re-rendering the ribbon:** `npm run artwork` (needs Blender 4.2+ and Python
with Pillow + numpy; set `BLENDER` if Blender is not found automatically).
Add `-- --accent "#0f766e"` to re-hue the metal, reflections and haze to a brand
colour (the warm gold edge light stays), `--saturation 0.6` to tone it down, and
`--film` to also re-render and encode the brand film (needs ffmpeg).
Control points, widths and twist live in `RIBBONS` in
`artwork-source/ribbon_scene.py`. `python artwork-source/build_artwork.py --theme dark --layer main`
renders a single layer.

## Animation settings

All animation settings live in `site.artwork.animation`:

| Setting | Effect |
|---|---|
| `enabled` | master switch (false = still frame) |
| `float` | slow drift of the ribbon: `amplitude` (frame px), `period` (s) |
| `parallax` | max pointer parallax of the main layer (frame px); 0 disables. Only for fine pointers |
| `trails[]` | orbit ellipses: centre, radii, rotation, visible `arc`, `glints`, `speed` (turns/min) |
| `particles[]` | zones with `count`, `size`, share of `warm` particles, `bokeh` |
| `particleDensity` | global particle multiplier |

Built-in behaviour:

- `prefers-reduced-motion` renders one still frame. There's no drift, parallax or twinkle.
- Animation pauses when the hero leaves the viewport or the tab is hidden.
- If canvas is unavailable, the static ribbon layers still render.
- The headline and controls never move.

## Accessibility

- Semantic landmarks with a skip link.
- Visible focus rings via `--color-focus`.
- The theme selector uses native radio inputs (arrow keys work), with accessible names.
- The mobile menu and video player are native modal `<dialog>`s: focus is contained, Escape closes them, and focus returns to the trigger.
- The artwork is `aria-hidden`.
- Text tokens meet WCAG AA (≥ 4.5:1) against the theme background in both themes.
