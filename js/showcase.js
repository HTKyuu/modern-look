/* Demo wiring for showcase.html: toasts and a loading-state button. */
import { showToast } from './toast.js';

export function initShowcase(root = document) {
  root.addEventListener('click', (e) => {
    const toastBtn = e.target.closest('[data-demo="toast"]');
    if (toastBtn) {
      const tone = toastBtn.getAttribute('data-tone') || 'info';
      const titles = { success: 'Changes saved', info: 'Export started', danger: 'Upload failed' };
      const bodies = {
        success: 'Your profile is up to date.',
        info: 'You will get an email when the file is ready.',
        danger: 'The file is larger than 10 MB. Choose a smaller file.'
      };
      showToast({ title: titles[tone], body: bodies[tone], tone });
      return;
    }
    const loadBtn = e.target.closest('[data-demo="loading"]');
    if (loadBtn && loadBtn.getAttribute('data-loading') !== 'true') {
      loadBtn.setAttribute('data-loading', 'true');
      loadBtn.setAttribute('aria-disabled', 'true');
      setTimeout(() => {
        loadBtn.removeAttribute('data-loading');
        loadBtn.removeAttribute('aria-disabled');
        showToast({ title: 'Report generated', tone: 'success' });
      }, 1600);
    }
  });
}
