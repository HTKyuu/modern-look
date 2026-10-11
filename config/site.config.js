/*
 * Site configuration.
 *
 * `brand` selects which identity from config/brands.js the whole site uses.
 * Everything else here is site-wide behaviour that is not part of a brand.
 */
window.SITE_CONFIG = {
  brand: 'hollis-reed',

  /* Appended to every page <title>: "Services | Hollis & Reed" */
  titleSeparator: ' | ',

  /* Theme preference storage key. Change only if two sites share an origin. */
  themeStorageKey: 'theme',

  /* Text shown next to simulated actions (forms, dialogs) that have no backend. */
  simulatedLabel: 'Simulated: nothing is sent. Connect a backend to make this live.'
};
