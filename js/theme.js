/*
 * Theme selection: System (default) / Light / Dark.
 *
 * - Preference is stored only when explicit (light or dark). "System" removes
 *   the stored value so the OS setting wins again.
 * - Colours themselves are handled by CSS (`color-scheme` + light-dark()), so
 *   OS changes apply instantly while System is selected without any JS.
 * - data-resolved-theme on <html> mirrors what is showing, for things CSS
 *   cannot branch on (logo files). It is updated on OS change too.
 * - Several selectors can exist on a page (header, footer); all stay in sync,
 *   including across tabs via the storage event.
 */
import { icon } from './icons.js';

const cfg = window.SITE_CONFIG || {};
const KEY = cfg.themeStorageKey || 'theme';
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');
let instance = 0;

export function getPreference() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return root.getAttribute('data-theme') || 'system';
  }
}

export function setPreference(value) {
  try {
    if (value === 'light' || value === 'dark') localStorage.setItem(KEY, value);
    else localStorage.removeItem(KEY);
  } catch { /* storage unavailable: still apply for this page */ }
  if (value === 'light' || value === 'dark') root.setAttribute('data-theme', value);
  else root.removeAttribute('data-theme');
  applyResolved();
  syncSelectors();
}

export function resolvedTheme() {
  const pref = root.getAttribute('data-theme');
  if (pref === 'light' || pref === 'dark') return pref;
  return media.matches ? 'dark' : 'light';
}

function applyResolved() {
  root.setAttribute('data-resolved-theme', resolvedTheme());
}

function syncSelectors() {
  const pref = getPreference();
  document.querySelectorAll('[data-theme-selector] input').forEach((input) => {
    input.checked = input.value === pref;
  });
}

const OPTIONS = [
  { value: 'system', label: 'System', icon: 'monitor' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' }
];

/* Returns markup for one selector. `compact` hides labels visually. */
export function themeSelectorMarkup({ compact = false } = {}) {
  const name = `theme-${++instance}`;
  const pref = getPreference();
  const options = OPTIONS.map((o) => `
    <label class="segmented-option">
      <input type="radio" name="${name}" value="${o.value}" ${o.value === pref ? 'checked' : ''}>
      <span title="${o.label} theme">${icon(o.icon)}<span class="segmented-label">${o.label}</span></span>
    </label>`).join('');
  return `<fieldset class="segmented" data-theme-selector ${compact ? 'data-compact' : ''}>
    <legend>Theme</legend>${options}
  </fieldset>`;
}

export function initTheme() {
  applyResolved();
  syncSelectors();
  document.addEventListener('change', (e) => {
    const input = e.target;
    if (input instanceof HTMLInputElement && input.closest('[data-theme-selector]')) {
      setPreference(input.value);
    }
  });
  media.addEventListener('change', applyResolved);
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const v = e.newValue;
    if (v === 'light' || v === 'dark') root.setAttribute('data-theme', v);
    else root.removeAttribute('data-theme');
    applyResolved();
    syncSelectors();
  });
}
