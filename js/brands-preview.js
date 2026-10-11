/*
 * Brand preview (brands.html): renders the same components for each brand
 * in config/brands.js inside a .brand-scope container that carries that
 * brand's tokens. Nothing here is specific to a brand.
 */
import { headerMarkup, footerMarkup, heroPlateMarkup, esc } from './render.js';
import { icon, hydrateIcons } from './icons.js';

const brands = window.BRANDS || {};
const tokens = window.BrandTokens;

function sampleMarkup(brand) {
  const s = brand.sample || {};
  const hero = s.hero || {};
  const features = (s.features || []).map((f) => `
    <div class="feature">
      <div class="feature-icon">${icon(f.icon)}</div>
      <h3>${esc(f.title)}</h3>
      <p>${esc(f.body)}</p>
    </div>`).join('');
  const t = s.testimonial || {};
  const cta = s.cta || {};
  return `
    ${headerMarkup(brand, { current: '', isStatic: true, idPrefix: `preview-${brand.id}-`, includeThemeSelector: false })}
    <main>
      <div class="container hero">
        <div>
          <h1>${esc(hero.headline)}</h1>
          <p class="lede">${esc(hero.lede)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="${esc(hero.primary && hero.primary.href)}">${esc(hero.primary && hero.primary.label)}</a>
            <a class="btn btn-secondary btn-lg" href="${esc(hero.secondary && hero.secondary.href)}">${esc(hero.secondary && hero.secondary.label)}</a>
          </div>
        </div>
        ${heroPlateMarkup(brand)}
      </div>
      <section class="section section-sunken">
        <div class="container"><div class="grid grid-3">${features}</div></div>
      </section>
      <section class="section">
        <div class="container split">
          <figure class="testimonial">
            <blockquote><p>${esc(t.quote)}</p></blockquote>
            <figcaption><strong>${esc(t.name)}</strong>, ${esc(t.role)}</figcaption>
          </figure>
          <div class="cta-band-wrap">
            <div class="cta-band">
              <div><h2>${esc(cta.headline)}</h2><p>${esc(cta.body)}</p></div>
              <a class="btn btn-inverse btn-lg" href="#">${esc(cta.label)}</a>
            </div>
          </div>
        </div>
      </section>
    </main>
    ${footerMarkup(brand, { includeThemeSelector: false })}`;
}

function swatch(hex) {
  return `<span class="swatch-inline" style="background:${esc(hex)}"></span><code>${esc(hex)}</code>`;
}

function diffRows(brand) {
  const f = brand.fonts || {};
  const c = brand.colors || { light: {}, dark: {} };
  const s = brand.shape || {};
  return [
    ['Display font', esc(f.display.split(',')[0].replace(/"/g, ''))],
    ['Body font', esc(f.body.split(',')[0].replace(/"/g, ''))],
    ['Accent', `${swatch(c.light.accent)} light, ${swatch(c.dark.accent)} dark`],
    ['Background', `${swatch(c.light.bg)} light, ${swatch(c.dark.bg)} dark`],
    ['Radius', `${esc(s.radius)} surfaces, ${esc(s.button)} buttons`],
    ['Hero plate', esc((brand.hero && brand.hero.plate) || 'plain')],
    ['Navigation', esc((brand.nav || []).map((n) => n.label).join(', '))],
    ['Primary call to action', esc(brand.cta && brand.cta.primary && brand.cta.primary.label)]
  ].map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('');
}

export function initBrandPreview() {
  const container = document.getElementById('brand-preview');
  const switcher = document.querySelector('[data-brand-switcher]');
  const diff = document.querySelector('[data-brand-diff]');
  const title = document.querySelector('[data-brand-preview-name]');
  if (!container || !switcher) return;

  const ids = Object.keys(brands);
  switcher.innerHTML = `<legend>Brand</legend>${ids.map((id, i) => `
    <label class="segmented-option">
      <input type="radio" name="brand" value="${esc(id)}" ${i === 0 ? 'checked' : ''}>
      <span>${esc(brands[id].name)}</span>
    </label>`).join('')}`;

  const render = (id) => {
    const brand = brands[id];
    if (!brand) return;
    container.style.cssText = '';
    tokens.apply(container, brand);
    tokens.loadFonts(brand);
    container.innerHTML = sampleMarkup(brand);
    hydrateIcons(container);
    if (diff) diff.innerHTML = diffRows(brand);
    if (title) title.textContent = brand.name;
    history.replaceState(null, '', `#${id}`);
  };

  switcher.addEventListener('change', (e) => { if (e.target.name === 'brand') render(e.target.value); });

  const fromHash = location.hash.replace('#', '');
  const initial = ids.includes(fromHash) ? fromHash : ids[0];
  const input = switcher.querySelector(`input[value="${initial}"]`);
  if (input) input.checked = true;
  render(initial);
}
