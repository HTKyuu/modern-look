# Starting a new company project

Copy the `motion-template` folder, run `npm install`, then work through this list.
You should not need to edit anything in `src/components/` or `src/styles/`.

## 1. Content: `src/config/site.ts`

| Field | What to change |
|---|---|
| `company` | name, wordmark text, logo path, `logoTint` |
| `meta` | page title and description |
| `nav`, `headerCta` | labels and destinations (demo links point at `#intro` / a `mailto:`) |
| `hero` | eyebrow, headline lines (`accent: true` for the coloured words), body, CTA |
| `hero.video` | `{ label, title, src, poster }`, or `null` to hide "Watch video" |
| `hero.stats` | **replace the demo figures** with real, defensible ones |
| `hero.editorialLabels` | the three small words near the right edge (or `[]`) |
| `intro` | eyebrow, headline, body of the section under the hero |

Keep headline lines short. The layout is tuned for about 12 characters per hero line.

## 2. Brand: `src/config/tokens.css`

- `--color-accent` (both themes), the text colours and the button colours.
- `--atmo-*`: the soft atmospheric glow behind the hero.
- `--trail-*`, `--glint-color` and `--particle-*`: the canvas light colours, as `r, g, b`.
- Fonts: `--font-display` / `--font-body`, plus the `@fontsource` import in `src/main.tsx`.

Keep body text at ≥ 4.5:1 contrast against `--color-bg` in both themes.

## 3. Assets: `public/`

| Path | Asset |
|---|---|
| `brand/logo-mark.svg` | logo mark (square artboard works best) |
| `favicon.svg` | favicon |
| `artwork/dark/*.webp`, `artwork/light/*.webp` | hero artwork layers (`back`, `main`, `front`) |
| `media/brand-film.mp4`, `media/brand-film-poster.webp` | optional video and poster |

Also update the fallback `<title>`, description and `theme-color` in `index.html`.

## 4. Hero artwork

Pick one route:

- **Keep the ribbon in the brand colour.** Run
  `python artwork-source/build_artwork.py --accent "#RRGGBB"` (add `--film` for a matching
  brand film). To reshape it, edit `RIBBONS` (control points: x, y, depth, width, twist)
  in `artwork-source/ribbon_scene.py` first.
- **Use your own artwork.** Export transparent images at the frame aspect ratio
  (`artwork.frame`) for both themes. If your images have another aspect, update `frame`.
  Then adjust `subjectStartX`, `mobileFocus`, `trails` and `particles` (all in frame px)
  so they line up with the new subject. Remove `back`/`front` if you only have one layer.

## 5. Check

```bash
npm run build
```

Then check these in a browser:

- 1536 × 1024, 1280, 1024, 768 and 375 widths
- both themes, plus System following the OS setting
- reduced motion
- the mobile menu and video dialog with the keyboard only
