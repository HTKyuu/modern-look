/*
 * Renders the brand-dependent chrome from config: header, footer, hero
 * plate, and any [data-brand] text slots. Page body copy stays in HTML.
 */
import { icon, hydrateIcons } from './icons.js';
import { themeSelectorMarkup } from './theme.js';

const cfg = window.SITE_CONFIG || {};

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export function currentPage() {
  const file = location.pathname.split('/').pop();
  return file && file.includes('.') ? file : 'index.html';
}

export function logoMarkup(brand) {
  const l = brand.logo;
  if (!l || !l.src) return `<span class="site-wordmark">${esc(brand.name)}</span>`;
  const attrs = `alt="${esc(l.alt || brand.name)}"${l.width ? ` width="${l.width}"` : ''}${l.height ? ` height="${l.height}"` : ''}`;
  if (l.srcDark) {
    return `<img class="logo-light" src="${esc(l.src)}" ${attrs}><img class="logo-dark" src="${esc(l.srcDark)}" ${attrs}>`;
  }
  return `<img src="${esc(l.src)}" ${attrs}>`;
}

export function headerMarkup(brand, { current = currentPage(), isStatic = false, idPrefix = '', includeThemeSelector = true } = {}) {
  const navId = `${idPrefix}site-nav`;
  const items = (brand.nav || []).map((item) => {
    const isCurrent = item.href.split('#')[0] === current;
    return `<li><a href="${esc(item.href)}"${isCurrent ? ' aria-current="page"' : ''}>${esc(item.label)}</a></li>`;
  }).join('');
  const primary = brand.cta && brand.cta.primary;
  const ctaItem = primary ? `<li class="site-nav-cta"><a class="btn btn-primary" href="${esc(primary.href)}">${esc(primary.label)}</a></li>` : '';
  const ctaBtn = primary ? `<a class="btn btn-primary btn-sm site-cta" href="${esc(primary.href)}">${esc(primary.label)}</a>` : '';
  return `<header class="site-header"${isStatic ? ' data-static' : ''}>
    <div class="container site-header-inner">
      <a class="site-logo" href="index.html" aria-label="${esc(brand.name)} home">${logoMarkup(brand)}</a>
      <nav class="site-nav" id="${navId}" aria-label="Main">
        <ul class="site-nav-list">${items}${ctaItem}</ul>
      </nav>
      <div class="site-actions">
        ${includeThemeSelector ? themeSelectorMarkup({ compact: true }) : ''}
        ${ctaBtn}
        <button class="btn btn-ghost btn-icon btn-sm nav-toggle" type="button" aria-expanded="false" aria-controls="${navId}">
          <span class="visually-hidden">Menu</span>${icon('menu', 'icon icon-menu')}${icon('close', 'icon icon-close')}
        </button>
      </div>
    </div>
  </header>`;
}

export function footerMarkup(brand, { includeThemeSelector = true } = {}) {
  const cols = (brand.footer && brand.footer.columns) || [];
  const c = brand.contact || {};
  const columns = cols.map((col) => `<div class="footer-col"><h2>${esc(col.title)}</h2><ul>${
    col.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')
  }</ul></div>`).join('');
  const address = [
    c.email ? `<div><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>` : '',
    c.phone ? `<div><a href="tel:${esc(c.phone.replace(/\s+/g, ''))}">${esc(c.phone)}</a></div>` : '',
    c.address ? `<div>${c.address.map(esc).join('<br>')}</div>` : '',
    c.hours ? `<div>${esc(c.hours)}</div>` : ''
  ].join('');
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
    <div class="container">
      <div class="footer-grid" style="--footer-cols: ${cols.length}">
        <div class="footer-brand">
          <a class="site-logo" href="index.html" aria-label="${esc(brand.name)} home">${logoMarkup(brand)}</a>
          <p>${esc(brand.description || brand.tagline || '')}</p>
        </div>
        ${columns}
        <div class="footer-col"><h2>Contact</h2><address>${address}</address></div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${year} ${esc(brand.legalName || brand.name)}. ${esc((brand.footer && brand.footer.note) || '')}</p>
        ${includeThemeSelector ? themeSelectorMarkup() : ''}
      </div>
    </div>
  </footer>`;
}

/* The hero plate: large company mark, wordmark and tagline on a surface. */
export function heroPlateMarkup(brand) {
  const plate = (brand.hero && brand.hero.plate) || 'plain';
  const mark = brand.mark && brand.mark.src
    ? `<div class="hero-plate-mark"><img src="${esc(brand.mark.src)}" alt="" width="64" height="64"></div>`
    : '';
  return `<div class="hero-plate" data-plate="${esc(plate)}" role="img" aria-label="${esc(brand.name)} logo">
    ${mark}
    <div class="hero-plate-wordmark">${logoMarkup(brand)}</div>
    <p class="hero-plate-tagline">${esc(brand.tagline || '')}</p>
  </div>`;
}

function lookup(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/* Fill text and link slots: [data-brand="name"], [data-brand="contact.email"],
   [data-brand-href="email|phone"], [data-brand-cta="primary|secondary"]. */
export function applyBrandSlots(brand, root = document) {
  root.querySelectorAll('[data-brand]').forEach((el) => {
    const v = lookup(brand, el.getAttribute('data-brand'));
    if (v != null) el.textContent = Array.isArray(v) ? v.join(', ') : String(v);
  });
  root.querySelectorAll('[data-site]').forEach((el) => {
    const v = cfg[el.getAttribute('data-site')];
    if (v != null) el.textContent = String(v);
  });
  root.querySelectorAll('[data-brand-href]').forEach((el) => {
    const kind = el.getAttribute('data-brand-href');
    const c = brand.contact || {};
    if (kind === 'email' && c.email) el.setAttribute('href', `mailto:${c.email}`);
    if (kind === 'phone' && c.phone) el.setAttribute('href', `tel:${c.phone.replace(/\s+/g, '')}`);
  });
  root.querySelectorAll('[data-brand-address]').forEach((el) => {
    el.replaceChildren();
    (brand.contact && brand.contact.address || []).forEach((line, i) => {
      if (i) el.appendChild(document.createElement('br'));
      el.appendChild(document.createTextNode(line));
    });
  });
  root.querySelectorAll('[data-brand-cta]').forEach((el) => {
    const cta = brand.cta && brand.cta[el.getAttribute('data-brand-cta')];
    if (!cta) return;
    el.setAttribute('href', cta.href);
    if (!el.hasAttribute('data-keep-label')) el.textContent = cta.label;
  });
}

export function renderChrome(brand) {
  if (!brand) return;
  document.querySelectorAll('[data-site-header]').forEach((el) => { el.outerHTML = headerMarkup(brand); });
  document.querySelectorAll('[data-site-footer]').forEach((el) => { el.outerHTML = footerMarkup(brand); });
  document.querySelectorAll('[data-hero-plate]').forEach((el) => { el.outerHTML = heroPlateMarkup(brand); });
  applyBrandSlots(brand);
  const sep = cfg.titleSeparator || ' | ';
  if (!document.title.includes(brand.name)) {
    document.title = document.title ? `${document.title}${sep}${brand.name}` : brand.name;
  }
  const desc = document.querySelector('meta[name="description"]');
  if (desc && !desc.content) desc.content = brand.description || brand.tagline || '';
  hydrateIcons(document);
}
