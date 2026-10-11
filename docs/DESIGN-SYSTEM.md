# Design system reference

Short version: components use semantic tokens only; brands supply values for
those tokens in both themes; the CSS decides which theme is showing.

## Token tiers

**Tier 1, brand values** (`--brand-light-*`, `--brand-dark-*`, `--font-*`,
`--radius-*`). Defined per brand in `config/brands.js`, written onto `<html>`
by `js/head.js`. Defaults in `css/tokens.css` match the default brand so the
CSS works on its own.

**Tier 2, semantic tokens.** The only names components may use.

| Token | Use |
| --- | --- |
| `--color-bg` | Page background |
| `--color-surface` | Cards, inputs, header panel, dialogs |
| `--color-surface-sunken` | Alternating sections, footer, table heads, segmented control track |
| `--color-text` | Body text, headings |
| `--color-text-muted` | Secondary text, hints, captions. Still AA on bg and surface |
| `--color-border` | Hairlines between things |
| `--color-border-strong` | Input borders, secondary buttons, dashed empty states |
| `--color-accent` | Links, primary buttons, selected tab marker, icons on soft tiles |
| `--color-accent-hover` | Hover for the above |
| `--color-accent-soft` | Tinted tiles and current-page nav background. Never for text |
| `--color-on-accent` | Text on accent. White in light mode, ink in dark mode where the accent is lighter |
| `--color-highlight` | One decorative colour per brand: the quote mark, a logo dot. Never large areas |
| `--color-success / -warning / -danger / -info` and `-soft` pairs | Status text, alert and badge backgrounds |
| `--color-focus` | Focus ring. Defaults to accent |
| `--shadow-sm / -md / -lg` | Elevation. Dark mode adds a faint edge and deeper shadow |
| `--space-1` to `--space-9` | 4px to 96px |
| `--section-padding` | Vertical rhythm between sections, fluid |
| `--text-xs` to `--text-3xl` | Type scale; the top two steps are fluid |
| `--radius-sm / --radius / --radius-lg / --radius-button` | Inputs and small tiles / cards / plates and dialogs / buttons |
| `--duration-fast / --duration / --duration-slow`, `--ease`, `--ease-out` | Motion. All durations become 0 under reduced motion |

**Tier 3, theme switching.** `:root { color-scheme: light dark }` follows the
OS. `[data-theme="light|dark"]` pins the page. `.theme-light` / `.theme-dark`
pin a subtree. Every semantic colour is a `light-dark()` pair, so a pinned
subtree gets the right values automatically.

## Colour rules

- Both themes are designed separately. Dark surfaces are lighter than the
  dark background, borders are brighter than surfaces, and the accent is a
  lighter tint of the brand colour so it reads as text.
- Minimum contrast, checked by `scripts/check-contrast.mjs`: text and muted
  text on bg, surface and sunken surface 4.5:1; accent on bg and surface
  4.5:1; on-accent on accent and accent-hover 4.5:1; accent on accent-soft
  3:1; strong border on bg 1.5:1.
- One accent per brand. Status colours are shared and not part of a brand.
- No gradients except the hero plate's textures, which are drawn in border
  colour and read as lines, not colour washes.

## Typography

- Two families per brand: display for headings, body for everything else.
  They must be visibly different or the pairing is pointless.
- Headings use `--font-display-weight` and `--font-display-tracking` from the
  brand, `text-wrap: balance`, and never all caps.
- Body line length is capped by `.prose` (62ch) and `.lede` (42rem). Do not
  let a paragraph run the full container width.
- Links in running text are underlined. Navigation links are not.

## Spacing and shape

- Use the spacing scale. Section rhythm comes from `--section-padding`, not
  ad hoc margins.
- Radius expresses hierarchy: small on inputs and tiles, base on cards, large
  on plates and dialogs. Buttons have their own radius so a brand can be
  pill-shaped or square without touching anything else.
- Cards are flat by default. `.card-raised` is for one featured thing per
  view, not for every card.

## Motion

- Motion answers a user action: menu opening, dialog appearing, toast
  arriving, tab underline moving. No scroll-triggered entrances.
- Every transition uses a duration token so reduced motion disables all of
  them at once. The loading spinner keeps turning but slower.

## Component rules

- Buttons: `.btn` plus one tone (`-primary`, `-secondary`, `-ghost`,
  `-danger`, `-inverse`) and optionally one size. Loading is
  `data-loading="true"` with `aria-disabled="true"`, never `disabled`, so focus
  is not lost.
- Forms: label above, hint below the input, error below the hint. Errors set
  `aria-invalid` and `aria-describedby`. Required is the default; mark optional
  fields with `.field-optional` instead of marking required ones.
- Navigation, tabs, dialogs, accordions and the theme selector follow the
  native or WAI-ARIA pattern that `js/` implements; do not restyle them into a
  different pattern.
- Empty states say what will appear and offer the next action. Errors say what
  happened and what to do. Neither apologises.

## Adding a component

1. Add a block to `css/components.css` named after the component, using only
   semantic tokens and single-class selectors.
2. If it needs behaviour, add one module in `js/` exporting `initX(root)` and
   call it from `js/main.js`.
3. Add it to `showcase.html` with its states, and check it in both panels of
   the "Both themes" section.
