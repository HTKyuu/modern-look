# Modern Look: company website template

A zero-build, multi-page company website template. Semantic HTML, modern CSS
(custom properties, cascade layers, `light-dark()`), and a few small ES
modules. One configuration file turns it into a different company's site.

Two fictional identities are included to prove the separation: Hollis & Reed
(bookkeeping, warm) and Kestrel Freight (logistics, cool). The whole site
runs on one of them; the other appears on the brand preview page.

## Run it

No install step. Serve the folder over HTTP (ES modules do not load from `file://`):

```bash
python -m http.server 8765
```

Then open http://localhost:8765/. Any static host works the same way.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home: hero with the company's logo plate, services, process, testimonial, call to action |
| `services.html` | Services by business stage (tabs), full list, FAQ (accordion) |
| `about.html` | Story, stats, values, team, timeline |
| `pricing.html` | Plans with monthly/annual switch, comparison table, FAQ, custom-plan dialog with a validated form |
| `contact.html` | Validated contact form with simulated submission, contact details |
| `showcase.html` | Every component, every state, both themes side by side |
| `brands.html` | The same components rendered for each brand in `config/brands.js` |

Submissions are simulated. Every form says so next to its button and in the
confirmation. There is no backend, database, auth or payment code.

## Structure

```
config/
  brands.js         all company identities (name, logo, fonts, colours, shape, nav, CTAs, contact, footer)
  site.config.js    which brand is active, plus site-wide settings
css/
  tokens.css        brand defaults, semantic tokens, theme switching
  base.css          reset, typography, layout primitives, utilities
  components.css    one block per component
  pages.css         hero, showcase and brand-preview layouts
js/
  head.js           runs in <head>: restores theme, applies brand tokens, loads fonts, sets favicon
  main.js           entry module: renders chrome, initialises components
  render.js         header, footer, hero plate and [data-brand] slots from config
  theme.js          System / Light / Dark selector with persistence
  icons.js          inline SVG icon set
  menu.js tabs.js dialog.js form.js toast.js pricing.js   one component each
  showcase.js brands-preview.js                            page-specific, loaded on demand
assets/brands/<id>/ logo.svg, logo-dark.svg, mark.svg per brand
scripts/check-contrast.mjs   WCAG 2.2 AA check for every brand
docs/DESIGN-SYSTEM.md        tokens and usage rules
docs/SKILL-CONVERSION.md     what a future skill must ask, change, keep and verify
```

## Customising for a new company

1. Add the company's logo files to `assets/brands/<id>/`. Provide `logo.svg`
   (for light backgrounds), optionally `logo-dark.svg`, and a square `mark.svg`.
2. Copy one brand object in `config/brands.js`, give it a new key and fill in
   name, tagline, description, logo, fonts, shape, colours, nav, CTAs, contact
   and footer.
3. Set `brand` in `config/site.config.js` to the new key.
4. Run `node scripts/check-contrast.mjs` and fix any pair it reports.
5. Replace the page copy in the HTML files. Everything brand-specific inside
   them is already a slot (`data-brand`, `data-brand-cta`, `data-hero-plate`),
   so only the prose needs editing.
6. Open `showcase.html` and `brands.html` in both themes to confirm the result.

The hero plate on the home page always shows the company's mark, wordmark and
tagline on a textured surface. `hero.plate` in the brand config chooses the
texture: `ruled`, `grid` or `plain`.

## Theming

- System is the default. The CSS uses `color-scheme: light dark` and
  `light-dark()`, so OS changes apply instantly with no script.
- Choosing Light or Dark stores the preference in `localStorage` and pins it
  with `data-theme` on `<html>`. Choosing System removes it.
- `js/head.js` restores the preference synchronously before the first paint,
  so there is no flash of the wrong theme.
- Any subtree can be pinned with `.theme-light` or `.theme-dark`; the showcase
  uses this to render both themes on one page.
- Motion durations collapse to zero under `prefers-reduced-motion`.

## Browser support

Chrome and Edge 123+, Safari 17.5+, Firefox 120+. These are the baselines for
`light-dark()`, `color-mix()` and container queries. Older browsers get an
unstyled but readable page.

## Limitations

- Header, footer and the hero plate are rendered by JavaScript from config.
  Without JS, pages show a plain `<noscript>` navigation and their body copy.
- Fonts load from Google Fonts. Self-host them and change `fonts.stylesheet`
  if that is not acceptable.
- Page copy lives in HTML, not config. That is deliberate: it keeps the pages
  semantic and lets a skill edit prose directly, but it means a new company
  needs its copy rewritten page by page.
- Forms, dialogs and toasts are front-end only. Wire `form[data-validate]`'s
  `simulated-submit` event to a real request when a backend exists.
