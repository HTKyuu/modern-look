/*
 * Toast notifications. One polite live region, stacked at the bottom.
 * showToast({ title, body, tone: 'success' | 'info' | 'danger', duration })
 */
import { icon } from './icons.js';

const ICONS = { success: 'check-circle', danger: 'x-circle', info: 'info' };
let region = null;

function ensureRegion() {
  if (region) return region;
  region = document.createElement('div');
  region.className = 'toast-region';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  document.body.appendChild(region);
  return region;
}

export function showToast({ title, body = '', tone = 'info', duration = 6000 }) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('data-tone', tone);
  toast.innerHTML = `${icon(ICONS[tone] || 'info')}
    <div class="toast-content"><p class="toast-title"></p><p class="toast-body"></p></div>
    <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Dismiss notification">${icon('close')}</button>`;
  toast.querySelector('.toast-title').textContent = title;
  const bodyEl = toast.querySelector('.toast-body');
  if (body) bodyEl.textContent = body; else bodyEl.remove();

  let timer = setTimeout(remove, duration);
  function remove() { clearTimeout(timer); toast.remove(); }
  toast.querySelector('button').addEventListener('click', remove);
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => { timer = setTimeout(remove, 2500); });

  ensureRegion().appendChild(toast);
  return toast;
}
