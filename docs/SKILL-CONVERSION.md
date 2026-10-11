# Turning this template into a skill

This is a guide for writing a future skill that produces a website for a
named company from this template. The skill is not created here.

## 1. Inputs the skill should request

Ask once, up front, with a sensible default for every item. Do not ask for
anything the skill can derive.

| Input | Required | Default if missing |
| --- | --- | --- |
| Company name and legal name | yes | |
| What the company does, in one sentence | yes | |
| Logo | yes, always try to get it | see "Logo" below |
| Website or social links to pull copy and colours from | no | |
| Target audience and the one action visitors should take | yes | "Contact us" |
| Pages wanted | no | Home, Services, About, Pricing, Contact |
| Services or products (3 to 6, each with a sentence) | yes | |
| Pricing (plans, prices, billing period) or "no public pricing" | no | drop the Pricing page |
| Contact details: email, phone, address, hours | yes, at least email | |
| Visual character: warm/friendly, editorial/minimal, bold/technical | no | warm and friendly |
| Accent colour | no | derive from the logo |
| Fonts | no | pick a display and body pair that matches the character |
| Language and tone of copy | no | English, plain and specific |

### Logo

The skill must always try to obtain the real logo and use it in the header,
footer and the hero plate. In order of preference:

1. A file the user provides.
2. The company's website: `<link rel="icon">`, Open Graph image, or an SVG in
   the header.
3. A clean wordmark set in the chosen display font, as a last resort, clearly
   labelled as a placeholder in the handover.

Save it to `assets/brands/<id>/logo.svg` (or `.png`). If the logo has dark
text, make or request a `logo-dark.svg` for dark mode; if it is a single
light-safe colour, one file is enough and `srcDark` is omitted. Crop a
square `mark.svg` for the hero plate and favicon. Never redraw a real logo.

## 2. Files and settings the skill customises

| File | What changes |
| --- | --- |
| `config/brands.js` | Add one brand object with the new key. Every field is documented in the file. Remove the fictional brands when shipping, or keep them for the preview page only |
| `config/site.config.js` | `brand` points at the new key |
| `assets/brands/<id>/` | Logo files |
| `index.html` | Hero headline and lede, client names strip (or remove it), three service features, process steps, testimonial, CTA copy |
| `services.html` | Tabs by stage (or remove the tabs section), service cards, FAQ |
| `about.html` | Story, stats, values, team, timeline. Remove any section without real content |
| `pricing.html` | Plans, prices, comparison table, FAQ. Remove the page and its nav entry if there is no public pricing |
| `contact.html` | Form topic options, "what happens next" steps |
| `showcase.html`, `brands.html` | Leave as they are; they are for the builder, not visitors. Remove their footer links if the site is shipped |

Fields in the brand object that are not visual still matter: `nav` must list
only pages that exist, `cta.primary` must point to the action the user named,
and `footer.columns` must not link to removed pages.

## 3. Rules the skill must preserve

Design:

- Components use semantic tokens only. Never add a hex value to a component
  or a page; add it to the brand instead.
- Both themes are designed, not inverted. The dark accent is a lighter tint of
  the brand colour, `onAccent` flips to ink when the accent is light.
- One accent, one highlight, shared status colours. No gradients, blobs or
  decorative shadows.
- Two typefaces that differ visibly. No all-caps labels, no accent-coloured
  single words in headlines, no arrows appended to button text.
- Flat cards by default; one raised element per view at most.
- Motion only in response to user action, all through duration tokens.
- Copy is specific to the company: what they do, for whom, in which town.
  Generic lines ("We deliver excellence") are a defect.

Accessibility:

- Every text and control pair passes `scripts/check-contrast.mjs`.
- Every form field has a visible label; errors use `aria-invalid` and
  `aria-describedby`; a summary alert lists them.
- Native `<dialog>`, `<details>`, radio groups and the tabs pattern are kept
  as implemented. Keyboard: Tab reaches everything, Escape closes menu and
  dialogs, arrows move between tabs.
- Focus is visible on every interactive element in both themes.
- The theme selector keeps its three options and persistence behaviour.
- Reduced motion keeps working: do not add animations outside the tokens.

## 4. Verification steps

Run all of these before handing over.

1. `node scripts/check-contrast.mjs` exits 0.
2. Serve the folder and open every page in a browser. No console errors.
3. Header shows the real logo in light and dark. Hero plate shows mark,
   wordmark and tagline.
4. Theme: choose Dark, reload, still dark with no flash. Choose System,
   change the OS setting, page follows without reload.
5. Mobile width (375px): no horizontal scroll, menu opens and closes, Escape
   returns focus to the toggle, every section readable.
6. Keyboard only: Tab through the home page; focus ring visible on each stop;
   tabs respond to arrow keys; dialog traps focus and Escape closes it.
7. Contact form: submit empty, see the summary and per-field errors; fill it,
   see loading, confirmation and toast; "Send another" restores it.
8. Pricing: switch to annual, prices and badge change; custom-plan dialog
   validates.
9. Every link resolves: `nav`, `footer`, CTAs, and in-page anchors. No `#`
   placeholders outside `brands.html`.
10. `showcase.html` both-themes section looks right with the new brand.

## 5. Illustrative versus mandatory

Illustrative, replace freely:

- Hollis & Reed and Kestrel Freight, their copy, prices, people and clients.
- The page set and section order. A company with no pricing drops that page;
  a product company may want a features page instead of services.
- The hero plate textures (`ruled`, `grid`). Add a texture that fits the
  trade, or use `plain`.
- The icon set in `js/icons.js`. Add icons as needed, same 24px stroke style.
- Font choices and the warm/cool directions of the two example brands.

Mandatory, keep as is:

- The three-tier token system and `light-dark()` theming in `css/tokens.css`.
- `js/head.js` running synchronously in `<head>`.
- The brand object shape in `config/brands.js` and the slot attributes
  (`data-brand`, `data-brand-cta`, `data-brand-href`, `data-hero-plate`,
  `data-site-header`, `data-site-footer`).
- The accessibility behaviour of every component in `js/`.
- The contrast targets and the check script.
- Simulated submissions stay labelled as simulated until a backend exists.
