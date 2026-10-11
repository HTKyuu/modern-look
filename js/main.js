/*
 * Entry module for every page. Renders the brand chrome, then wires the
 * interactive components. Page-specific modules are loaded on demand by
 * the presence of their root element.
 */
import { renderChrome } from './render.js';
import { initTheme } from './theme.js';
import { initMenu } from './menu.js';
import { initTabs } from './tabs.js';
import { initDialogs } from './dialog.js';
import { initForms } from './form.js';
import { initPricing } from './pricing.js';

renderChrome(window.ACTIVE_BRAND);
initTheme();
initMenu();
initTabs();
initDialogs();
initForms();
initPricing();

if (document.getElementById('brand-preview')) {
  import('./brands-preview.js').then((m) => m.initBrandPreview());
}
if (document.querySelector('[data-showcase]')) {
  import('./showcase.js').then((m) => m.initShowcase());
}
